# K-MIRROR Gemini API Integration Guide

> Gemini API 연동의 기술적 세부사항.
> AI 프롬프트, 응답 스키마, 에러 핸들링을 수정할 때 반드시 참조.
> 관련 문서: [03-ai-inclusivity-framework.md](./03-ai-inclusivity-framework.md), [04-data-model-spec.md](./04-data-model-spec.md)

---

## 1. Overview

| 항목 | 값 |
|------|-----|
| 서비스 파일 | `services/geminiService.ts` |
| Export | `analyzeSkin()` (1차), `matchProducts()` (2차), `analyzeKBeauty()` (fallback) |
| 아키텍처 | 2-step pipeline: analyzeSkin → matchProducts + YouTube (병렬) |
| 백엔드 | Supabase Edge Functions (`analyze-skin`, `analyze-kbeauty`, `match-products`) |
| 모델 | `gemini-3-pro-preview` (멀티모달) |
| 출력 형식 | Structured JSON (Zod v4 런타임 검증) |
| 타임아웃 | 분석 30초, 제품 매칭 10초 (AbortController) |
| 재시도 | analyzeKBeauty: 최대 2회, 지수 백오프 (1s → 3s) |
| 레이트 리미팅 | 분당 2회 (토큰 버킷) |
| 에러 분류 | 7종 (`AnalysisErrorCode`) |
| 결과 캐싱 | sessionStorage LRU (5개, 30분 TTL) — `cacheService.ts` |

---

## 2. API Key 흐름

```
.env.local
  └── GEMINI_API_KEY = "sk-..."
        │
        ▼  vite.config.ts:6 — loadEnv(mode, '.', '')
        │
        ▼  vite.config.ts:14 — define: { 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY) }
        │
        ▼  geminiService.ts:12 — new GoogleGenAI({ apiKey: process.env.API_KEY })
```

- `GoogleGenAI` 인스턴스가 **매 호출마다 새로 생성됨** (싱글톤 아님)
- `process.env.API_KEY`는 Node.js 런타임 변수가 아닌 **Vite 빌드 타임 치환**

---

## 3. System Instruction 해부

`geminiService.ts` lines 14-35의 시스템 프롬프트:

### 3-1. 역할 정의

```
"You are a Global K-Beauty Stylist and Face Analysis Expert."
```

### 3-2. 입력 정의

```
"Analyze the two images provided:
1. The user's bare face.
2. A K-Celeb inspiration photo."
```

### 3-3. 유저 프로필 주입

```
"User Profile & Preferences:
- Environment: ${prefs.environment}
- Skill Level: ${prefs.skill}
- Desired Mood: ${prefs.mood}
- Sensitive Skin: ${isSensitive ? 'Yes' : 'No'}"
```

- 4개의 변수가 **문자열 템플릿으로 직접 삽입**
- 이스케이핑, 검증 없음 (현재 값은 모두 고정 enum이므로 안전)

### 3-4. 6대 분석 태스크

| # | 태스크 | 프롬프트 내용 | 출력 필드 |
|---|--------|-------------|----------|
| 1 | **Tone Analysis** | Melanin index (1-6), Undertone (Warm/Cool/Neutral), skin concerns | `tone.*` |
| 2 | **Sherlock Face Analysis** | 비율 (Upper/Mid/Lower), 눈 각도, 골격 구조 | `sherlock.*` |
| 3 | **Style Transfer Logic** | 셀럽 스타일을 사용자 인종/피부에 맞게 변환 | `kMatch.*` |
| 4 | **Sensitivity Filter** | `isSensitive=true`면 진정 성분 추천 | `recommendations.sensitiveSafe`, `recommendations.ingredients` |
| 5 | **Product Curation** | K-Beauty 제품 3-4개 + 매치 스코어 + 안전 등급 | `recommendations.products[]` |
| 6 | **Video Curation** | YouTube 스타일 튜토리얼 2개 + AI 코칭 코멘트 | `recommendations.videos[]` |

### 3-5. 출력 지시

```
"Output MUST be in valid JSON format only."
```

이 텍스트 지시 + `responseMimeType: "application/json"` + `responseSchema`의 3중 강제.

---

## 4. Response Schema ↔ types.ts 정합성

`geminiService.ts` lines 49-141의 `responseSchema`와 `types.ts`의 인터페이스 매핑:

### 4-1. 매핑 테이블

| Schema 경로 | types.ts 인터페이스 | 일치? | 주의 |
|-------------|-------------------|-------|------|
| `tone.melaninIndex` | `AnalysisResult.tone.melaninIndex: number` | O | Schema: `Type.NUMBER` |
| `tone.undertone` | `'Warm' \| 'Cool' \| 'Neutral'` | 부분 | Schema: `Type.STRING` (description만, enum 아님) |
| `tone.skinConcerns` | `string[]` | O | — |
| `tone.description` | `string` | O | — |
| `sherlock.proportions.*` | `{upper: string, middle: string, lower: string}` | O | 모두 `Type.STRING` (숫자지만 문자열) |
| `sherlock.eyeAngle` | `string` | O | — |
| `sherlock.boneStructure` | `string` | O | — |
| `sherlock.facialVibe` | `string` | O | — |
| `kMatch.celebName` | `string` | O | — |
| `kMatch.adaptationLogic.*` | `{base, lip, point}: string` | O | — |
| `kMatch.styleExplanation` | `string` | O | — |
| `kMatch.aiStylePoints` | `string[]` | O | — |
| `recommendations.products[]` | `Product` | O | 모든 필드 일치 |
| `recommendations.videos[]` | `VideoRecommendation` | O | 모든 필드 일치 |
| `recommendations.sensitiveSafe` | `boolean` | O | `Type.BOOLEAN` |

### 4-2. Validation (Zod v4) ✅

```typescript
// geminiService.ts — JSON.parse 후 Zod 스키마 검증
const parsed = JSON.parse(text);
const validated = analysisResultSchema.parse(parsed);
return validated;
```

- `schemas/analysisResult.ts`에 Zod v4 스키마 정의
- `melaninIndex`: `z.number().min(1).max(6)` — 범위 검증
- 검증 실패 시 `AnalysisError('VALIDATION')` throw
- 3중 검증: Gemini `responseSchema` → `JSON.parse` → Zod 런타임

---

## 5. 이미지 전송

### 클라이언트 → Edge Function

```typescript
// geminiService.ts — analyzeSkin/analyzeKBeauty
body: JSON.stringify({
  userImageBase64, celebImageBase64,
  userMimeType,    celebMimeType,     // ← mimeType 전파
  isSensitive, prefs, selectedCelebName,
})
```

### Edge Function → Gemini API

```typescript
// supabase/functions/analyze-skin/index.ts
contents: [
  { inlineData: { mimeType: userMimeType || 'image/jpeg', data: userImageBase64 } },
  { inlineData: { mimeType: celebMimeType || 'image/jpeg', data: celebImageBase64 } },
  { text: prompt }
]
```

| 속성 | 값 | 비고 |
|------|-----|------|
| `mimeType` | 동적 (기본: `image/jpeg`) | `imageService.ts`에서 JPEG로 변환되므로 일반적으로 `image/jpeg` |
| `data` | raw base64 | `data:image/...;base64,` prefix 없음 |
| 이미지 수 | 2개 (user + celeb) | 순서 중요: 첫 번째가 사용자, 두 번째가 셀럽 |
| 이미지 리사이즈 | 최대 1024px | `imageService.processImage()` — Canvas API + JPEG 0.85 |

---

## 6. 응답 파싱 + Zod 검증

```typescript
// geminiService.ts
const text = response.text;
if (!text) throw new AnalysisError('EMPTY_RESPONSE', 'AI returned an empty response');
const parsed = JSON.parse(text);
const validated = analysisResultSchema.parse(parsed);
return validated;
```

- `response.text`: SDK가 제공하는 텍스트 접근자
- 빈 응답 → `AnalysisError('EMPTY_RESPONSE')`
- JSON 파싱 실패 → `AnalysisError('VALIDATION')`
- Zod 검증 실패 → `AnalysisError('VALIDATION')`

---

## 7. 복원력 레이어 (Resilience)

### 7-1. 에러 코드 분류

```typescript
type AnalysisErrorCode =
  | 'EMPTY_RESPONSE'   // AI가 빈 응답 반환
  | 'VALIDATION'       // JSON 파싱 또는 Zod 검증 실패
  | 'API'              // Gemini API 에러 (400, 403 등)
  | 'NETWORK'          // 네트워크 연결 실패
  | 'TIMEOUT'          // 30초 타임아웃 초과
  | 'RATE_LIMITED'     // 클라이언트 레이트 리미터 차단
  | 'ABORTED'          // 사용자가 요청 취소
  | 'UNEXPECTED';      // 그 외 모든 에러
```

### 7-2. 레이트 리미터 (토큰 버킷)

```typescript
// 분당 2회 제한 (무료 티어 기준)
const RATE_LIMIT = { maxTokens: 2, windowMs: 60_000 };
```

- 요청 시 토큰 소비, 시간 경과 시 자동 복원
- 토큰 부족 시 `AnalysisError('RATE_LIMITED')` 즉시 throw
- 무의미한 API 호출 방지

### 7-3. 타임아웃

```typescript
const TIMEOUT_MS = 30_000;  // 30초
// AbortController + setTimeout으로 구현
```

- Gemini API 응답 지연 시 30초 후 자동 취소
- `AnalysisError('TIMEOUT')` throw
- 타이머 정리 보장 (finally 블록)

### 7-4. 재시도

```typescript
const RETRY = { maxAttempts: 2, delays: [1000, 3000] };  // 지수 백오프
```

- NETWORK, TIMEOUT 에러만 재시도 대상
- API(400/403), VALIDATION, RATE_LIMITED는 재시도 안 함
- 외부 AbortSignal이 취소되면 재시도 중단

### 7-5. 요청 취소 (AbortSignal)

```typescript
// 함수 시그니처
export const analyzeKBeauty = async (
  userImageBase64: string,
  celebImageBase64: string,
  isSensitive: boolean,
  prefs: UserPreferences,
  selectedCelebName?: string,
  signal?: AbortSignal          // ← 외부에서 취소 가능
) => { ... }
```

- `scanStore.ts`에서 `AbortController.signal` 전달
- 사용자가 분석 취소 → signal abort → `AnalysisError('ABORTED')`
- 재시도 루프에서도 signal 체크

### 7-6. scanStore 연동

```typescript
// scanStore.ts — analyze()
const controller = new AbortController();
try {
  const result = await analyzeKBeauty(..., controller.signal);
} catch (err) {
  if (err instanceof AnalysisError) {
    set({ error: err.message, errorCode: err.code });
  }
}
```

- 에러 코드별 i18n 메시지 분기 (`en.json`, `ko.json`의 `errors` 섹션)
- ErrorToast로 사용자에게 에러 원인 표시

---

## 8. 새 분석 필드 추가 체크리스트

AI 분석에 새 필드를 추가할 때 반드시 업데이트해야 하는 6곳:

| # | 파일 | 위치 | 작업 |
|---|------|------|------|
| 1 | `types/index.ts` | `AnalysisResult` 인터페이스 | 새 필드 타입 추가 |
| 2 | `schemas/analysisResult.ts` | Zod 스키마 | 새 필드 검증 규칙 추가 |
| 3 | `services/geminiService.ts` | `systemInstruction` | 새 분석 태스크 지시 추가 |
| 4 | `services/geminiService.ts` | `responseSchema` | 새 필드 스키마 추가 |
| 5 | `data/demoResult.ts` | `DEMO_RESULT` 상수 | Demo 데이터에 새 필드 값 추가 |
| 6 | `views/AnalysisResultView.tsx` | 해당 뷰 | 새 필드를 렌더링하는 UI 추가 |
| 7 | `docs/04-data-model-spec.md` | 해당 섹션 | 문서 업데이트 |

### 예시: `skinHexCode` 필드 추가

```
1. types/index.ts → AnalysisResult.tone에 skinHexCode: string 추가
2. schemas/analysisResult.ts → tone 스키마에 skinHexCode: z.string() 추가
3. systemInstruction → "- Extract the dominant skin Hex color code"
4. responseSchema → tone.properties에 skinHexCode: { type: Type.STRING } 추가
5. data/demoResult.ts → tone: { ..., skinHexCode: '#8B6547' }
6. AnalysisResultView → Forensic Mapping 카드에 색상 표시 UI 추가
7. 04-data-model-spec.md → tone 섹션에 skinHexCode 문서화
```

---

## 9. 해소된 항목 및 남은 개선 기회

### 해소됨 (Sprint 2) ✅

| 항목 | 구현 |
|------|------|
| 재시도 | 최대 2회, 지수 백오프 (1s → 3s) |
| 타임아웃 | AbortController + 30초 |
| Rate limiting | 토큰 버킷 (분당 2회) |
| 요청 취소 | AbortSignal 전파 (scanStore → geminiService) |
| Zod 검증 | `schemas/analysisResult.ts` 런타임 검증 |

### 해소됨 (Sprint 3) ✅

| 항목 | 구현 |
|------|------|
| 결과 캐싱 | sessionStorage LRU (5개, 30분 TTL) — `cacheService.ts` |
| mimeType 전파 | `imageService.ts` → scanStore → geminiService → Edge Function 전체 파이프라인 |
| 이미지 압축 | Canvas API 리사이즈 (1024px) + JPEG 0.85 — `imageService.ts` |
| 2-step 파이프라인 | `analyzeSkin` → `matchProducts` + YouTube 병렬 |

### 남은 개선 기회

| 항목 | 현재 | 개선 방향 |
|------|------|----------|
| 프롬프트 버전 관리 | 없음 | 버전 상수 + 변경 로그 |
