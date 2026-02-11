# K-MIRROR Gemini API Integration Guide

> Gemini API 연동의 기술적 세부사항.
> AI 프롬프트, 응답 스키마, 에러 핸들링을 수정할 때 반드시 참조.
> 관련 문서: [03-ai-inclusivity-framework.md](./03-ai-inclusivity-framework.md), [04-data-model-spec.md](./04-data-model-spec.md)

---

## 1. Overview

| 항목 | 값 |
|------|-----|
| 서비스 파일 | `services/geminiService.ts` (149줄) |
| Export | `analyzeKBeauty()` (단일 함수) |
| 모델 | `gemini-3-pro-preview` (멀티모달) |
| SDK | `@google/genai` (`GoogleGenAI` 클래스) |
| 출력 형식 | Structured JSON (`responseMimeType: "application/json"`) |

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

### 4-2. Validation Gap (중요)

```typescript
// geminiService.ts:148
return JSON.parse(text) as AnalysisResult;
```

- `as AnalysisResult`는 **TypeScript 타입 단언** — 런타임 검증 없음
- `responseSchema`가 API 레벨에서 구조를 강제하지만, 완벽하지 않음
- 예: `melaninIndex`가 7이나 0이 반환되어도 코드가 감지하지 못함
- `undertone`이 `'Olive'`로 반환되어도 TypeScript 런타임에서 알 수 없음
- 향후: Zod 스키마 검증 추가 고려

---

## 5. 이미지 전송

```typescript
// geminiService.ts:40-45
contents: {
  parts: [
    { text: systemInstruction },
    { inlineData: { mimeType: 'image/jpeg', data: userImageBase64 } },
    { inlineData: { mimeType: 'image/jpeg', data: celebImageBase64 } }
  ]
}
```

| 속성 | 값 | 비고 |
|------|-----|------|
| `mimeType` | `'image/jpeg'` (고정) | PNG, WebP 업로드 시에도 jpeg으로 전송 |
| `data` | raw base64 | `data:image/...;base64,` prefix 없음 (LuxuryFileUpload에서 제거) |
| 이미지 수 | 2개 (user + celeb) | 순서 중요: 첫 번째가 사용자, 두 번째가 셀럽 |
| 크기 제한 | 없음 (코드 레벨) | Gemini API의 입력 제한에 의존 |

---

## 6. 응답 파싱

```typescript
// geminiService.ts:146-148
const text = response.text;
if (!text) throw new Error("Empty response from AI");
return JSON.parse(text) as AnalysisResult;
```

- `response.text`: SDK가 제공하는 텍스트 접근자
- null/undefined 체크 후 `Error` throw
- `JSON.parse` 실패 시 — catch 없음, 호출자에게 throw됨
- 호출자(`App.tsx:870`)의 `catch`에서 `console.error` + IDLE 복귀

---

## 7. 에러 핸들링 현황

### geminiService.ts 내부

- try/catch 없음
- 재시도 없음
- 타임아웃 설정 없음
- AbortController 없음

### App.tsx (호출자)

```typescript
// App.tsx:863-873
try {
  setStep(AppStep.ANALYZING);
  const res = await analyzeKBeauty(...);
  setResult(res);
  setStep(AppStep.RESULT);
} catch (err) {
  console.error(err);        // 콘솔에만 출력
  setStep(AppStep.IDLE);     // 조용히 IDLE로 복귀
}
```

### 사용자에게 보이는 것

- **아무것도 없음** — 에러 state 변수가 없고, 에러 UI가 없음
- ANALYZING 화면에서 갑자기 IDLE로 돌아감
- 원인 구분 불가: 네트워크 오류? API 키 오류? 할당량 초과? 응답 파싱 실패?

### 향후 개선 방향

```typescript
// 추천 구조
const [error, setError] = useState<string | null>(null);

catch (err) {
  if (err instanceof TypeError) setError('Network error');
  else if (err.message?.includes('429')) setError('Rate limit exceeded');
  else if (err.message?.includes('401')) setError('Invalid API key');
  else setError('Analysis failed. Please try again.');
  setStep(AppStep.IDLE);
}
```

---

## 8. 새 분석 필드 추가 체크리스트

AI 분석에 새 필드를 추가할 때 반드시 업데이트해야 하는 6곳:

| # | 파일 | 위치 | 작업 |
|---|------|------|------|
| 1 | `types.ts` | `AnalysisResult` 인터페이스 | 새 필드 타입 추가 |
| 2 | `services/geminiService.ts` | `systemInstruction` (line 14-35) | 새 분석 태스크 지시 추가 |
| 3 | `services/geminiService.ts` | `responseSchema` (lines 49-141) | 새 필드 스키마 추가 |
| 4 | `App.tsx` | `DEMO_RESULT` (line 457) | Demo 데이터에 새 필드 값 추가 |
| 5 | `App.tsx` | `AnalysisResultView` 또는 해당 뷰 | 새 필드를 렌더링하는 UI 추가 |
| 6 | `docs/04-data-model-spec.md` | 해당 섹션 | 문서 업데이트 |

### 예시: `skinHexCode` 필드 추가

```
1. types.ts → AnalysisResult.tone에 skinHexCode: string 추가
2. systemInstruction → "- Extract the dominant skin Hex color code"
3. responseSchema → tone.properties에 skinHexCode: { type: Type.STRING } 추가
4. DEMO_RESULT → tone: { ..., skinHexCode: '#8B6547' }
5. AnalysisResultView → Forensic Mapping 카드에 색상 표시 UI 추가
6. 04-data-model-spec.md → tone 섹션에 skinHexCode 문서화
```

---

## 9. 한계 및 개선 기회

| 항목 | 현재 | 개선 방향 |
|------|------|----------|
| 재시도 | 없음 | exponential backoff (429, 5xx 대응) |
| 타임아웃 | 없음 | AbortController + 30초 타임아웃 |
| Rate limiting | 없음 | 클라이언트 측 쓰로틀링 (분당 2회 제한) |
| 결과 캐싱 | 없음 | 동일 입력 → 로컬 캐시 반환 |
| 클라이언트 재사용 | 매번 new | 싱글톤 GoogleGenAI 인스턴스 |
| mimeType 감지 | jpeg 고정 | FileReader + 실제 파일 타입 반영 |
| 이미지 압축 | 없음 | Canvas API로 리사이즈 후 전송 |
| 요청 취소 | 없음 | AbortController로 진행 중 취소 가능하게 |
| 프롬프트 버전 관리 | 없음 | 버전 상수 + 변경 로그 |
