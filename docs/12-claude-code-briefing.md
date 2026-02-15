# K-MIRROR 프로젝트 → Claude Code 브리핑

> 이 문서를 Claude Code 세션 시작 시 컨텍스트로 전달하세요.
> "이 브리핑을 읽고 Phase 0부터 시작해줘" 라고 하면 됩니다.

---

## 프로젝트 요약

**K-MIRROR**은 AI 기반 K-뷰티 메이크업 컨설팅 서비스.
셜로뷰티(56만원 오프라인 컨설팅)를 크니(PONY) 메이크업 DNA 기반 AI로 2.9만원에 제공.

핵심 기능: **추구미(追求美)** → 유저가 되고 싶은 셀럽을 고르면, 그 셀럽의 메이크업 DNA를 유저 얼굴에 맞게 "번역"해주는 것.

상품 2-Tier:
- **THE K-GLOW CARD** (무료) → SNS 공유용 다크 테크 디자인 카드. 5 Metrics 수치 + Before/After + Match Rate
- **THE SHERLOCK ARCHIVE** (29,000원) → 12-15페이지 프리미엄 PDF. 상세 분석 + 솔루션 + 제품 큐레이션

---

## 현재 상태 → 이미 있는 것

```
Supabase Edge Functions (Deno/TypeScript):
  ├── analyze-kbeauty    → Gemini 분석 (프롬프트 v5.1)
  ├── analyze-skin       → 피부 분석
  ├── match-products     → 제품 매칭 알고리즘
  ├── create-checkout-session → Stripe 결제
  └── stripe-webhook     → 결제 웹훅

DB (Supabase PostgreSQL):
  ├── products (12개)    → K-Beauty 제품 시드
  ├── analyses           → 분석 결과 저장
  ├── feedback           → 사용자 피드백
  └── RLS/인덱스         →

AI 프롬프트 v5.1:
  ├── 멜라닌 L1-L6       →
  ├── 얼굴 비율/골격 분석  →
  ├── 스타일 적용 로직     →
  └── 제품 큐레이션       →

기타:
  ├── Stripe 결제         →
  ├── 제품 매칭 알고리즘   → (멜라닌25 + 언더톤15 + 피부타입15 + ...)
  └── Inclusivity Framework → (L1-L6, 금지어, Bias Prevention)
```

---

## 새로 만들어야 하는 것 (당신이 할 일)

```
Phase 0: 데이터 파이프라인
  → pony-data-collector Python 프로젝트
  → 5 Metrics 프롬프트 확장 (v5.1 → v6.0)
  → celeb_makeup_dna Supabase 테이블
  → upload_to_supabase.py
  → match-celeb Edge Function

Phase 1: K-GLOW CARD
  → 추구미 셀럽 선택 UI (React)
  → 셀카 업로드 + 분석 트리거
  → MediaPipe Face Mesh + Canvas 오버레이
  → K-GLOW CARD 생성기 (html2canvas)
  → SNS 공유 기능

Phase 2: SHERLOCK ARCHIVE PDF
  → Stripe checkout 수정 (metadata)
  → PDF 생성 엔진 (Puppeteer on Vercel)
  → 레이더 차트 (Chart.js)
  → 이메일 발송 (Resend)
```

---

## Phase 0 시작하기 → 구체적 지시

### Step 1: 프로젝트 구조 생성

```
pony-data-collector/
├── scrapers/
│   ├── __init__.py
│   └── youtube_collector.py
├── analyzers/
│   ├── __init__.py
│   ├── gemini_analyzer.py
│   └── batch_processor.py
├── uploaders/
│   ├── __init__.py
│   └── supabase_uploader.py
├── run_pipeline.py
├── requirements.txt
├── config.env.example
└── README.md
```

### Step 2: requirements.txt

```
yt-dlp>=2024.1.0
opencv-python>=4.9.0
pillow>=10.0.0
google-generativeai>=0.3.0
python-dotenv>=1.0.0
supabase>=2.0.0
requests>=2.31.0
```

### Step 3: youtube_collector.py 핵심 로직

```python
# YouTubeCollector 클래스
# - search_pony_videos(celeb_name, max_results=5): yt-dlp로 검색
# - download_and_extract_frames(video_url, output_dir, frame_interval=30):
#     영상 다운로드 → OpenCV로 프레임 추출 (30초 간격)
# - collect_from_search(search_query): 검색 → 다운로드 → 프레임 추출
# - collect_from_playlist(playlist_url): 플레이리스트 일괄 처리
```

### Step 4: gemini_analyzer.py → 5 Metrics 프롬프트 (핵심!)

기존 분석 출력에 아래를 추가:

```python
FIVE_METRICS_PROMPT = """
Additionally, analyze the following 5 metrics from the makeup transformation shown:

1. Visual Weight Score (0-100):
   How much visual weight do the facial features carry?
   Consider: eye makeup intensity, lip color depth, contour strength, overall contrast.

2. Canthal Tilt:
   - angle_degrees: float (-10 to +15)
   - classification: "negative" | "neutral" | "positive"
   Based on the outer corner of the eye relative to inner corner.

3. Mid-face Ratio:
   - ratio_percent: float (distance from eyes to mouth / total face height × 100)
   - philtrum_relative: "short" | "average" | "long"
   - youth_score: 0-100 (lower ratio = more youthful appearance)

4. Luminosity Score:
   - current: 0-100 (skin's current glow/translucency)
   - potential_with_kglow: 0-100 (achievable with K-beauty glass skin routine)
   - texture_grade: "glass" | "satin" | "matte" | "textured"

5. Harmony Index:
   - overall: 0-100 (how well features work together proportionally)
   - symmetry_score: 0-100
   - optimal_balance: description of ideal feature balance point

Return these in a "five_metrics" JSON object.
"""
```

분석 출력 JSON 구조:

```json
{
  "celeb_name": "Jennie",
  "video_id": "abc123",
  "frame_timestamp": "2:34",
  "makeup_analysis": {
    "eye_pattern": {
      "liner_style": "extended_wing",
      "shadow_depth": "medium_gradient",
      "canthal_emphasis": "+8° lift",
      "lash_focus": "outer_corner"
    },
    "lip_pattern": {
      "technique": "k_gradient_blur",
      "color_family": "MLBB_rose",
      "finish": "velvet_to_gloss"
    },
    "base_pattern": {
      "coverage": "medium_buildable",
      "finish": "dewy_satin",
      "contour_style": "minimal_soft",
      "highlight_zones": ["cheekbone_top", "nose_bridge"]
    },
    "balance_rule": {
      "eyes": 60, "cheeks": 15, "lips": 25
    }
  },
  "five_metrics": {
    "visual_weight_score": 72,
    "canthal_tilt": { "angle_degrees": 8.0, "classification": "positive" },
    "midface_ratio": { "ratio_percent": 33, "philtrum_relative": "average", "youth_score": 78 },
    "luminosity_score": { "current": 88, "potential_with_kglow": 95, "texture_grade": "glass" },
    "harmony_index": { "overall": 91, "symmetry_score": 87, "optimal_balance": "eye-dominant" }
  },
  "adaptation_rules": {
    "L1_L2": "Reduce shadow depth 20%, use shimmer over matte",
    "L3_L4": "Standard application, adjust lip to coral-rose",
    "L5_L6": "Increase liner width 30%, berry-adjust lip"
  }
}
```

### Step 5: Supabase 테이블 생성 SQL

```sql
CREATE TABLE celeb_makeup_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celeb_id TEXT NOT NULL,          -- "jennie", "wonyoung"
  celeb_name TEXT NOT NULL,        -- "Jennie Kim"
  category TEXT NOT NULL,          -- "kpop", "actress", "global"
  signature_look TEXT,             -- "Sharp Cat Eye + Gradient Lip"
  eye_pattern JSONB,
  lip_pattern JSONB,
  base_pattern JSONB,
  balance_rule JSONB,              -- { eyes: 60, cheeks: 15, lips: 25 }
  five_metrics JSONB,              -- { visual_weight: 72, canthal_tilt: {...}, ... }
  adaptation_rules JSONB,          -- { L1_L2: "...", L3_L4: "...", L5_L6: "..." }
  source_videos TEXT[],
  source_images TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_celeb_id ON celeb_makeup_dna(celeb_id);
CREATE INDEX idx_category ON celeb_makeup_dna(category);
```

### Step 6: match-celeb Edge Function

```typescript
// supabase/functions/match-celeb/index.ts
// 입력: { user_five_metrics, celeb_id }
// 처리:
//   1. celeb_makeup_dna에서 celeb_id로 조회
//   2. 각 metric별 gap 계산
//   3. gap별 솔루션 생성 (Gemini 호출)
// 출력: { match_rate, per_metric_gap[], solutions[], difficulty }
```

### Step 7: 셀럽 검색 쿼리 목록 (Phase 1 수집용)

```python
CELEB_QUERIES = {
    "jennie": ["Pony Jennie makeup", "제니 메이크업 크니"],
    "wonyoung": ["Pony Wonyoung makeup", "장원영 메이크업"],
    "han_sohee": ["Han Sohee makeup tutorial", "한소희 메이크업"],
    "suzy": ["Suzy natural makeup", "수지 내추럴 메이크업"],
    "karina": ["Karina aespa makeup", "카리나 메이크업"],
    "hanni": ["Hanni NewJeans makeup", "하니 메이크업"],
    "hoyeon": ["Hoyeon Jung makeup editorial", "정호연 메이크업"],
    "taylor": ["Taylor Swift makeup tutorial", "테일러 스위프트 메이크업"]
}
```

---

## 기술 스택 요약

```
프론트엔드: React (또는 Next.js) + Tailwind CSS
백엔드: Supabase Edge Functions (Deno/TypeScript)
DB: Supabase PostgreSQL
AI: Gemini API (gemini-1.5-flash 빠른분석, gemini-1.5-pro 프리미엄)
결제: Stripe
이메일: Resend
PDF: Puppeteer on Vercel API Route
얼굴분석: MediaPipe Face Mesh (브라우저)
차트: Chart.js / Recharts
데이터파이프라인: Python (yt-dlp, OpenCV, google-generativeai)
```

---

## 디자인 시스템 (코드에 반영할 것)

```css
/* K-MIRROR Dark Tech Design System */
:root {
  --bg-primary: #0A0A1A;
  --bg-secondary: #1A1A2E;
  --accent-pink: #FF2D9B;
  --accent-blue: #00D4FF;
  --text-primary: #F0F0F0;
  --text-muted: #8B8BA3;
}

/* 폰트: Fira Code (지표 수치), Inter/Pretendard (본문) */
```

---

## 작업 우선순위

```
지금 바로: Phase 0 (데이터 파이프라인) 전체
그 다음: Phase 1 (K-GLOW CARD MVP)
나중에: Phase 2 (SHERLOCK ARCHIVE PDF)
```

Phase 0의 Day-by-Day 상세 플랜은 K-MIRROR-구현로드맵.md를 참고.

---

## 주의사항

1. **Gemini API 키**: config.env에 GEMINI_API_KEY 필요 (makersuite.google.com에서 무료 발급)
2. **Supabase**: 기존 프로젝트의 URL + KEY 사용 (이미 있음)
3. **yt-dlp 제한**: YouTube 정책상 과도한 다운로드 시 차단 가능 → 배치 사이에 딜레이 넣을 것
4. **Gemini 무료 티어**: 분당 60회 제한 → batch_processor.py에 rate limiting 필요
5. **5 Metrics 일관성**: 동일 사진 여러 번 분석하면 수치가 달라질 수 있음 → 3회 평균 사용 권장
