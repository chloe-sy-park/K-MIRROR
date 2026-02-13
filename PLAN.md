# K-MIRROR Phase 2 Implementation Plan

## Overview
두 가지 핵심 기능을 추가합니다:
1. **MuseBoard 고도화** — Pinterest 스타일 보드 + AI 자동 분류 + 풀 CRUD
2. **YouTube 콘텐츠 큐레이션** — 하이브리드 방식 (Gemini 키워드 → YouTube API → Gemini 팁 요약)

---

## Feature A: MuseBoard Enhancement

### A-1. AI 자동 카테고라이징

**현재 상태**: 뮤즈를 저장할 때 사용자가 수동으로 보드를 선택하거나, 보드 없이 저장됨

**구현 방향**:
- `SavedMuse` 타입에 `tags: string[]` 필드 추가
- Gemini 분석 결과(vibe, celebName, undertone, mood)를 바탕으로 AI가 자동 태그 3-5개 생성
- 뮤즈 저장 시 기존 보드들과 태그를 비교 → 가장 매칭되는 보드에 자동 배치
- 매칭 보드가 없으면 AI가 새 보드 이름+아이콘을 제안 → 사용자 확인 후 생성

**수정 파일**:
| 파일 | 변경 내용 |
|------|-----------|
| `src/types/index.ts` | `SavedMuse`에 `tags: string[]` 추가 |
| `src/schemas/analysisResult.ts` | Gemini 응답에 `autoTags` 필드 추가 |
| `src/services/geminiService.ts` | 프롬프트에 태그 생성 지시 추가, responseSchema에 `autoTags` 추가 |
| `src/store/museStore.ts` | `saveMuse` 시 자동 보드 매칭 로직 추가 |
| `src/services/museService.ts` | DB/localStorage에 tags 저장 |
| `src/views/AnalysisResultView.tsx` | 저장 모달에 "AI 추천 보드" 표시 + 사용자 오버라이드 옵션 |

---

### A-2. MuseBoard 풀 CRUD (수정/삭제/업로드)

**현재 상태**: Create Board, Delete Board, Delete Muse만 구현됨

**추가할 기능**:

#### (a) 보드 수정 (Edit Board)
- 보드 이름 변경, 아이콘 변경
- Active Board Header의 수정 버튼(연필 아이콘) 추가
- 인라인 에딧 또는 모달

#### (b) 뮤즈 수정 (Edit Muse)
- 뮤즈를 다른 보드로 이동 (드래그 앤 드롭 또는 "Move to..." 메뉴)
- 메모 추가/수정 기능

#### (c) 뮤즈에 이미지/메모 추가 (Upload to Muse)
- 기존 뮤즈 카드에 추가 이미지 첨부 (영감 이미지, 완성 셀카 등)
- 텍스트 메모 작성
- `SavedMuse`에 `notes: string`, `extraImages: string[]` 필드 추가

#### (d) 보드에서 새 분석 시작
- 보드 뷰에 "New Scan" 버튼 → 스캔 플로우로 이동, boardId를 query param으로 전달
- 분석 완료 후 해당 보드에 자동 저장

**수정 파일**:
| 파일 | 변경 내용 |
|------|-----------|
| `src/types/index.ts` | `SavedMuse`에 `notes`, `extraImages` 추가 |
| `src/services/museService.ts` | `updateBoard()`, `updateMuse()`, `moveMuse()` 함수 추가 |
| `src/store/museStore.ts` | 위 서비스 함수들에 대응하는 액션 추가 |
| `src/views/MuseBoardView.tsx` | 보드 수정 모달, 뮤즈 상세 모달, Move/Edit/Upload UI 추가 |

---

### A-3. 뮤즈 상세 보기 (Muse Detail Modal)

**현재 상태**: 뮤즈 카드는 간략한 정보만 표시 (이미지, 셀럽명, 날짜, vibe, stylePoints 3개)

**추가할 기능**:
- 카드 클릭 → 풀스크린 상세 모달
- 유저 이미지 + 셀럽 이미지 나란히 비교
- 전체 AI 스타일 포인트, vibe, 메모 표시
- 추가 이미지 갤러리
- 하단에 "이 룩 다시 시도하기" 버튼
- 수정/삭제/보드 이동 액션 버튼

**수정 파일**:
| 파일 | 변경 내용 |
|------|-----------|
| `src/views/MuseBoardView.tsx` | `MuseDetailModal` 컴포넌트 추가 (같은 파일 또는 분리) |

---

## Feature B: YouTube 콘텐츠 큐레이션 (하이브리드)

### B-1. Gemini 프롬프트 확장 — 검색 키워드 + 팁 생성

**현재 상태**: Gemini가 `videos[]` 배열로 title, creator, aiCoaching 등을 생성하지만, 이는 AI가 만들어낸 가짜 영상 정보

**구현 방향**:
- Gemini 응답 스키마에 `youtubeSearch` 섹션 추가:
```typescript
youtubeSearch: {
  queries: string[]       // 2-3개 한국어 YouTube 검색어
                           // e.g., "한소희 메이크업 튜토리얼", "갈색 쿨톤 데일리 메이크업"
  focusPoints: string[]   // 영상에서 주목해야 할 기법 포인트
                           // e.g., "눈꼬리 올리는 라인 각도", "쿠션 반만 묻히는 테크닉"
  channelSuggestions: string[]  // 추천 채널명
                           // e.g., "이사배", "포니", "회사원A"
}
```
- 기존 `videos[]` 필드는 유지 (fallback용)

**수정 파일**:
| 파일 | 변경 내용 |
|------|-----------|
| `src/types/index.ts` | `YouTubeSearchHints` 타입 추가, `AnalysisResult`에 포함 |
| `src/schemas/analysisResult.ts` | Zod 스키마에 `youtubeSearch` 추가 |
| `src/services/geminiService.ts` | 프롬프트 + responseSchema에 YouTube 검색 힌트 섹션 추가 |

---

### B-2. YouTube Data API 연동 — 실제 영상 검색

**새로 생성할 파일**: `src/services/youtubeService.ts`

**구현 방향**:
- YouTube Data API v3 `search.list` 엔드포인트 사용
- Gemini가 생성한 검색어로 실제 YouTube 영상 검색
- 영상별 `videoId`, `title`, `channelTitle`, `thumbnail`, `publishedAt` 반환
- 한국어 콘텐츠 우선 (`relevanceLanguage: 'ko'`, `regionCode: 'KR'`)
- API 키: `VITE_YOUTUBE_API_KEY` 환경변수
- 쿼터 관리: 검색당 100 units, 일일 10,000 units 한도 → 요청 최소화
- Fallback: API 키 없으면 기존 Gemini 생성 영상 데이터 + YouTube 검색 링크 사용

**주요 함수**:
```typescript
searchYouTubeVideos(queries: string[], maxResults?: number): Promise<YouTubeVideo[]>
```

**반환 타입**:
```typescript
interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;        // high-res thumbnail URL
  publishedAt: string;
  viewCount?: string;
  duration?: string;
}
```

---

### B-3. Gemini 팁 요약 — "내가 주목해야 할 포인트"

**구현 방향**:
- Gemini 초기 분석에서 이미 `focusPoints`를 생성 (B-1에서 추가)
- 이 포인트들을 YouTube 영상 카드에 매핑하여 표시
- 추가로 각 검색 쿼리별 맞춤 팁 제공:
  ```
  "이 영상에서 주목할 포인트:"
  • 아이라인 끝을 살짝 올리는 각도 주목
  • 블렌딩할 때 브러시 방향 체크
  • 베이스 메이크업 얇게 레이어링하는 방법
  ```

**수정 파일**:
| 파일 | 변경 내용 |
|------|-----------|
| `src/services/geminiService.ts` | `focusPoints`를 쿼리별로 매핑되도록 구조화 |

---

### B-4. 비디오 큐레이션 UI 리디자인

**현재 상태**: AnalysisResultView에 2열 그리드로 AI 생성 비디오 카드 표시

**리디자인 방향**:
- 섹션 타이틀: **"STYLE TUTORIAL"** → **"추천 콘텐츠 — 이 룩을 완성하기 위한 K-Beauty 튜토리얼"**
- 각 영상 카드:
  - 실제 YouTube 썸네일 (YouTube API에서 가져옴)
  - 채널명, 제목, 조회수
  - **"주목할 팁"** 섹션: Gemini가 생성한 focusPoints 중 해당 영상과 관련된 2-3개 포인트
  - 클릭 시 YouTube 영상으로 이동 (실제 videoId 기반)
  - AI Match 퍼센티지는 유지
- YouTube API 미연동 시 fallback:
  - 기존 AI 생성 영상 데이터 사용
  - YouTube 검색 링크로 연결 (현재와 동일)

**수정 파일**:
| 파일 | 변경 내용 |
|------|-----------|
| `src/views/AnalysisResultView.tsx` | 비디오 섹션 리디자인 |
| `src/store/scanStore.ts` | YouTube API 호출 로직 통합 (분석 완료 후 자동 호출) |

---

## Implementation Order (구현 순서)

```
Phase 2-A: MuseBoard 고도화
├─ Step 1: 타입 확장 (tags, notes, extraImages, youtubeSearch)
├─ Step 2: museService 확장 (updateBoard, updateMuse, moveMuse)
├─ Step 3: museStore 액션 추가
├─ Step 4: MuseBoardView UI (보드 수정, 뮤즈 상세 모달, Move/Upload)
├─ Step 5: Gemini 프롬프트에 autoTags 추가
└─ Step 6: 자동 분류 로직 (saveMuse 시 보드 매칭)

Phase 2-B: YouTube 큐레이션
├─ Step 7: Gemini 프롬프트 확장 (youtubeSearch 섹션)
├─ Step 8: youtubeService.ts 생성 (YouTube Data API 연동)
├─ Step 9: scanStore에 YouTube 검색 통합
├─ Step 10: AnalysisResultView 비디오 섹션 리디자인
└─ Step 11: Fallback 처리 (API 키 없는 경우)
```

---

## Environment Variables (추가 필요)

```env
# YouTube Data API v3
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

---

## DB Schema Changes (Supabase)

```sql
-- SavedMuse에 새 필드 추가
ALTER TABLE saved_muses
  ADD COLUMN tags jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN notes text NOT NULL DEFAULT '',
  ADD COLUMN extra_images jsonb NOT NULL DEFAULT '[]';
```

---

## Risk & Considerations

1. **YouTube API 쿼터**: 일일 10,000 units 제한. 검색 1회 = 100 units → 분석당 2-3회 검색 = 200-300 units → 하루 ~33-50회 분석 가능. 프로덕션에서는 캐싱 필요.
2. **Gemini 프롬프트 길이**: youtubeSearch 섹션 추가로 토큰 증가 → temperature, 응답 품질 모니터링 필요
3. **이미지 저장 용량**: extraImages를 base64로 localStorage에 저장 시 용량 문제 → Supabase Storage 또는 이미지 압축 고려
4. **자동 분류 정확도**: AI 태그 기반 보드 매칭이 사용자 의도와 다를 수 있음 → 항상 사용자 확인 스텝 포함
