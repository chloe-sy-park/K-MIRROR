# K-MIRROR 구현 로드맵

**"기획서를 실제 코드로 만드는 순서"**

작성일: 2026-02-15

---

## 현재 상태 (있는 것 vs 없는 것)

```
이미 있는 것 ✅                          새로 만들어야 하는 것 ❌
───────────────────────────             ──────────────────────────────
Supabase Edge Functions               5 Metrics 분석 엔진
  ├── analyze-kbeauty ✅               셀럽 메이크업 DNA 파이프라인
  ├── analyze-skin ✅                  추구미 갭 브릿지 AI
  ├── match-products ✅                비주얼 변환 엔진 (Canvas)
  ├── create-checkout-session ✅       K-GLOW CARD 생성기
  └── stripe-webhook ✅               SHERLOCK ARCHIVE PDF 생성
                                      소셜 공유 시스템
DB 스키마 ✅                            실제 YouTube 연동
  ├── products (12개) ✅               Affiliate 링크
  ├── analyses ✅                      셀럽 데이터 테이블 (신규)
  ├── feedback ✅                      프리미엄 결제 → 레포트 자동화
  └── RLS/인덱스 ✅

AI 프롬프트 v5.1 ✅                    프론트엔드 전체 (추구미 UI)
  ├── 멜라닌 L1-L6 ✅
  ├── 셜록 페이스 분석 ✅
  ├── 스타일 적용 로직 ✅
  └── 제품 큐레이션 ✅

Stripe 결제 ✅
제품 매칭 알고리즘 ✅
Inclusivity Framework ✅
```

---

## 전체 로드맵 개요 (8주)

```
Phase 0 ─── Phase 1 ─── Phase 2 ─── Phase 3 ─── Phase 4
데이터      미니 리포트    프리미엄     완성도       런칭
(1주)      (2주)       (2주)       (2주)       (1주)

[셀럽 DNA]  [추구미UI]   [PDF생성]   [Affiliate]  [배포]
[파이프라인] [5Metrics]  [결제연동]   [YouTube]   [마케팅]
            [비주얼변환] [K-Trans]   [큐레이션]   [트래킹]
            [K-GLOW카드] [이메일]    [글로벌]
```

---

## Phase 0: 데이터 파이프라인 (Week 1)

> **목표**: 셀럽 20명의 메이크업 DNA를 수집·분석하여 Supabase에 적재
> **이게 없이는**: 추구미 기능의 데이터 근거가 없음

### 0-1. 파이프라인 코드 셋업 (Day 1)

```
작업: Chloe가 설계한 pony-data-collector 프로젝트 구조 생성
파일:
  pony-data-collector/
  ├── scrapers/youtube_collector.py     ← 이미 설계됨
  ├── analyzers/gemini_analyzer.py      ← 이미 설계됨 (5 Metrics 프롬프트 추가 필요)
  ├── analyzers/batch_processor.py      ← 이미 설계됨
  ├── run_pipeline.py                   ← 이미 설계됨
  ├── requirements.txt
  └── config.env

필요한 API 키:
  - GEMINI_API_KEY (무료: makersuite.google.com)
  - SUPABASE_URL + SUPABASE_KEY (이미 있음)

완료 기준: pip install 성공, config.env 설정 완료
```

### 0-2. Gemini 프롬프트 확장 → 5 Metrics 추출 추가 (Day 1-2)

```
작업: gemini_analyzer.py의 프롬프트에 5 Metrics 추출 로직 추가

기존 출력:
  ├── melanin_level, undertone, face_shape     ← 유지
  ├── makeup_intensity (eyes/cheeks/lips)       ← 유지
  └── pony_tips, recommended_products           ← 유지

추가할 출력:
  ├── visual_weight_score: 0-100
  ├── canthal_tilt: { angle_degrees, classification }
  ├── midface_ratio: { ratio_percent, philtrum_relative, youth_score }
  ├── luminosity_score: { current, potential_with_kglow, texture_grade }
  └── harmony_index: { overall, symmetry_score, optimal_balance }

완료 기준: 테스트 이미지 3장에 대해 5 Metrics 점수 추출
```

### 0-3. 셀럽 데이터 수집 실행 (Day 2-4)

```
작업: 셀럽 20명 × 영상 3-5개 = 60-100개 케이스 수집

Phase 1 셀럽 목록 (8명 우선):
  1. 제니 (BLACKPINK)    → "Pony x Jennie makeup"
  2. 장원영 (IVE)        → "Pony Wonyoung makeup"
  3. 한소희              → "Han Sohee makeup tutorial"
  4. 수지                → "Suzy natural makeup"
  5. 카리나 (aespa)      → "Karina aespa makeup"
  6. 하니 (NewJeans)     → "Hanni NewJeans makeup"
  7. 정호연              → "Hoyeon Jung makeup editorial"
  8. 테일러 스위프트      → "Taylor Swift makeup tutorial"

실행: python run_pipeline.py
예상 소요: 셀럽 8명 × 5영상 × 25분 = ~약 4시간 (배치 처리)

완료 기준: output/analyzed/ 에 40+ 분석 JSON 파일
```

### 0-4. Supabase 테이블 생성 & 데이터 업로드 (Day 4-5)

```
작업: 셀럽 메이크업 DNA 전용 테이블 생성 + 분석 데이터 업로드

신규 테이블:
┌─────────────────────────────────────────────────┐
│ celeb_makeup_dna                                │
├─────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                │
│ celeb_id        TEXT (jennie, wonyoung, etc)     │
│ celeb_name      TEXT                            │
│ category        TEXT (kpop, actress, global)     │
│ signature_look  TEXT                            │
│ eye_pattern     JSONB                           │
│ lip_pattern     JSONB                           │
│ base_pattern    JSONB                           │
│ balance_rule    JSONB { eyes, cheeks, lips }     │
│ five_metrics    JSONB { VW, CT, MF, LS, HI }    │
│ adaptation_rules JSONB                          │
│ source_videos   TEXT[]                          │
│ source_images   TEXT[]                          │
│ created_at      TIMESTAMPTZ                     │
└─────────────────────────────────────────────────┘

업로드 스크립트: upload_to_supabase.py (신규 생성)
  - output/analyzed/*.json → celeb_makeup_dna 테이블

완료 기준: Supabase에서 SELECT * FROM celeb_makeup_dna 시 40+ 레코드
```

### 0-5. 기존 분석 프롬프트 v5.1 → v6.0 업그레이드 (Day 5)

```
작업: 사용자 분석용 Supabase Edge Function에도 5 Metrics 추가

수정 대상: supabase/functions/analyze-kbeauty/
  - 기존 출력에 5 Metrics 섹션 추가
  - celeb_makeup_dna 테이블 참조하여 추구미 매칭 로직 추가

수정 대상: supabase/functions/analyze-skin/
  - luminosity_score 추출 추가 (피부 분석 특화)

신규 함수: supabase/functions/match-celeb/
  - 입력: 사용자 5 Metrics + 선택한 셀럽 ID
  - 출력: 갭 브릿지 분석 (각 지표별 차이 + 솔루션)
  - celeb_makeup_dna 테이블에서 셀럽 데이터 조회

완료 기준: Postman으로 API 호출 시 5 Metrics + 갭 브릿지 점수 응답
```

**Phase 0 최종 산출물**:
- ✅ 셀럽 40+ 메이크업 DNA 데이터 (Supabase)
- ✅ 사용자 분석 API에 5 Metrics 추가
- ✅ 갭 브릿지 API (match-celeb)

---

## Phase 1: THE K-GLOW CARD → 미니 리포트 MVP (Week 2-3)

> **목표**: 사진 업로드 → 추구미 선택 → K-GLOW CARD 생성 → SNS 공유
> **이것이 바이럴 엔진**: 이게 돼야 유저가 들어온다

### 1-1. 추구미 셀럽 선택 UI (Day 1-2)

```
작업: 프론트엔드 → 셀럽 선택 그리드 페이지

기술: React + Tailwind (또는 기존 프로젝트에 추가)
화면:
  ┌─────────────────────────────────────┐
  │  Choose Your Vibe               │
  │                                 │
  │  [제니]  [수지]  [한소희]  [수지]  │
  │  [카리나] [하니]  [정호연]  [테일러]│
  │                                 │
  │  각 카드: 셀럽 이미지 + 이름      │
  │           + 시그니처 룩 태그       │
  │           + "Sharp Cat Eye"      │
  └─────────────────────────────────────┘

데이터: celeb_makeup_dna 테이블에서 조회
라우팅: /choose-vibe → /upload-selfie → /analyzing → /result

완료 기준: 셀럽 8명 그리드 렌더링, 클릭 시 선택 상태 저장
```

### 1-2. 셀카 업로드 + 분석 트리거 (Day 2-3)

```
작업: 카메라/갤러리 업로드 → Gemini 분석 호출

화면:
  ┌─────────────────────────────────┐
  │  Take or Upload Your Selfie  │
  │                              │
  │  [📷 카메라]  [🖼 갤러리]     │
  │                              │
  │  가이드:                      │
  │  "정면, 자연광, 노메이크업"     │
  │  + 얼굴 가이드 오버레이        │
  └─────────────────────────────────┘

기술:
  - 이미지 업로드 → Supabase Storage에 저장
  - analyze-kbeauty Edge Function 호출 (v6.0, 5 Metrics 포함)
  - match-celeb Edge Function 호출 (갭 브릿지)
  - 분석 결과 analyses 테이블에 저장

완료 기준: 사진 업로드 → 15초 내 5 Metrics + 갭 브릿지 결과 반환
```

### 1-3. 분석 로딩 애니메이션 (Day 3)

```
작업: "AI가 분석 중" 화면 → 분석 단계 실시간 표시

화면:
  ┌──────────────────────────────────────┐
  │  Scanning your face...           │
  │                                  │
  │  [얼굴 실루엣 다운 벡터 라인    │
  │   하나씩 그려지는 애니메이션]       │
  │                                  │
  │  ✓ Skin Tone Detected            │
  │  ✓ Facial Landmarks Mapped       │
  │  ◻ Calculating 5 Metrics...      │
  │  ◻ Matching with JENNIE          │
  │  ◻ Generating K-GLOW Card        │
  └──────────────────────────────────────┘

기술: React 애니메이션 (Framer Motion 또는 CSS)
  - 각 단계가 순차적으로 체크 표시
  - 얼굴 실루엣 벡터 라인은 단순한 SVG 애니메이션 (MVP)

완료 기준: 15초 동안 5단계 진행 표시, 완료 시 결과 페이지로 전환
```

### 1-4. 비주얼 변환 엔진 → Before/After (Day 4-6)

```
작업: 사용자 얼굴에 추구미 스타일 메이크업 오버레이

기술 스택:
  - MediaPipe Face Mesh (브라우저 내 얼굴 랜드마크 추출)
  - Canvas API (메이크업 레이어 오버레이)
  - 셀럽 메이크업 템플릿 (투명 PNG 레이어)

구현 순서:
  Step 1: MediaPipe로 얼굴 468개 랜드마크 추출
  Step 2: 핵심 포인트 매핑 (눈, 입, 광대, 턱선)
  Step 3: 셀럽 메이크업 레이어를 랜드마크 위치에 맞춰 배치
  Step 4: 피부톤에 맞게 발색 조정 (Multiply Blending)
  Step 5: Before/After 슬라이드 UI (react-compare-image)

필요한 에셋:
  assets/celeb-templates/
  ├── jennie/
  │   ├── eye-shadow.png      # 아이 레이어 (투명)
  │   ├── lip-color.png       # 립 레이어 (투명)
  │   └── base-contour.png    # 베이스/컨투어 레이어
  ├── wonyoung/
  └── ... (셀럽 8명)

  * MVP에서는 셀럽당 1세트만 준비 (글램 버전)
  * 에셋 제작: Canva/Photoshop으로 투명 레이어 수동 제작
    또는 Gemini에게 메이크업 레이어 설명 → AI 생성

완료 기준: 셀카 + 제니 선택 → Before/After 이미지 정상 렌더링
```

### 1-5. K-GLOW CARD 생성기 (Day 7-8)

```
작업: 다크 테크 디자인의 소셜 공유 카드 자동 생성

기술:
  - HTML/CSS로 카드 템플릿 정의 (다크 배경 + 다운 테크)
  - html2canvas로 HTML → 이미지 (1080×1920) 변환
  - 또는 서버사이드: Puppeteer로 렌더링

카드 구성:
  ┌──────────────────────────────────────────────┐
  │  K-MIRROR Archive : Analysis #0024         │
  │  ┌───────────────────────────────────────┐ │
  │      [Before/After 반반 샷]                │
  │      [얼굴 실루엣 다운 벡터 라인]           │
  │                                            │
  │  TARGET VIBE: JENNIE                       │
  │  Match Rate: 82%                           │
  │                                            │
  │  GLOW         42 ──→ 82  (+40)             │
  │  EYE LIFT     +1° ──→ +6° needed          │
  │  HARMONY      68 ──→ 88  (+20)            │
  │  MID-FACE     37% ──→ 33% target          │
  │                                            │
  │  PONY's NOTE: "..."                        │
  │  [QR Code]    GET YOUR FULL REPORT →       │
  │               THE SHERLOCK ARCHIVE          │
  │               29,000원 / $24.99             │
  └──────────────────────────────────────────────┘

QR코드: qrcode.js 라이브러리로 동적 생성
  → 링크: k-mirror.ai/report/{analysis_id}

완료 기준: 분석 완료 → 카드 이미지 자동 생성 → 다운로드 가능
```

### 1-6. SNS 공유 기능 (Day 9-10)

```
작업: 카드 이미지를 인스타/틱톡에 공유

기능:
  - "📸 Share to Instagram" → 이미지 다운로드 (모바일: Share API)
  - "🔗 Copy Link" → 딥링크 복사 (k-mirror.ai/report/{id})
  - Web Share API (모바일 네이티브 공유 메뉴)

딥링크 랜딩:
  - k-mirror.ai/report/{analysis_id}
  - OG 이미지: K-GLOW CARD 이미지 자동 설정
  - "나도 해보기" CTA → 메인 플로우로 유도

완료 기준: 카드 공유 → 링크 클릭 → 랜딩 페이지 → "나도 해보기" 전환
```

**Phase 1 최종 산출물**:
- ✅ 추구미 선택 → 셀카 업로드 → 5 Metrics 분석 풀 플로우
- ✅ Before/After 비주얼 변환
- ✅ K-GLOW CARD 자동 생성 + SNS 공유
- ✅ **이 시점에서 유저 테스트 가능 (무료 버전)**

---

## Phase 2: THE SHERLOCK ARCHIVE → 프리미엄 레포트 (Week 4-5)

> **목표**: 결제 → PDF 레포트 자동 생성 → 이메일 발송
> **이것이 수익 엔진**: 이게 돼야 돈이 들어온다

### 2-1. 프리미엄 결제 플로우 (Day 1-2)

```
작업: K-GLOW CARD 결과 페이지 → "Get Full Report" → 결제 → 레포트

기술: Stripe Checkout (이미 구현됨, 수정만 필요)

수정 사항:
  - create-checkout-session Edge Function 수정
    - 상품: "Sherlock Archive Report" (29,000원 또는 $24.99)
    - metadata: { analysis_id, celeb_id, user_email }
  - stripe-webhook Edge Function 수정
    - 결제 완료 시 → PDF 생성 트리거
    - 생성 완료 시 → 이메일 발송

UI:
  [K-GLOW CARD 결과 페이지]
        ↓
        ├── "🔓 Unlock Full Sherlock Archive"
        ├── 가격: ₩29,000 / $24.99
        ├── "크니의 상세 솔루션 + 제품 큐레이션 + 팁 가이드"
        ↓
        └── [결제하기] → Stripe Checkout

완료 기준: 결제 완료 → webhook 정상 수신 → PDF 생성 트리거 발동
```

### 2-2. PDF 레포트 자동 생성 엔진 (Day 2-6)

```
작업: Gemini 분석 데이터 → PDF 12-15페이지 자동 생성

기술 옵션 (택 1):
  A) React-PDF (@react-pdf/renderer)
     - React 컴포넌트로 PDF 페이지 설계
     - 서버사이드 렌더링 (Node.js)
     - 장점: React 생태계, 컴포넌트 재사용
     - 단점: 복잡한 레이아웃 제한

  B) Puppeteer + HTML 템플릿 ← 추천
     - HTML/CSS로 각 페이지 디자인 (다크 테크 디자인 그대로)
     - Puppeteer로 HTML → PDF 변환
     - 장점: 디자인 자유도 최대, 기존 카드 디자인 재활용
     - 단점: 서버 리소스 필요 (Supabase Edge Function에서 구동 어려움)
     → 대안: Vercel Serverless Function 또는 별도 서버

  C) 하이브리드: Supabase에서 데이터 준비 + 외부 PDF 서비스
     - 데이터 준비: Supabase Edge Function
     - PDF 생성: Vercel API Route (Puppeteer)
     - 저장: Supabase Storage
     → 이 방식이 아키텍처에 가장 깔끔

PDF 템플릿 구현 (7개 섹션):
  01_cover.html        → 표지 (Before/After + 레이더 차트)
  02_skeletal.html     → 골격 설계도 (페이스 맵 + 수치)
  03_metrics.html      → 5 Metrics Deep Dive (3장)
  04_translation.html  → K-Translation (서양 vs K-뷰티 비교)
  05_solution.html     → 크니의 팁 가이드 (3장)
  06_products.html     → 제품 큐레이션 (2장)
  07_final.html        → Final Reveal (Before/After + 공유 카드)

데이터 바인딩:
  각 HTML 템플릿에 {{변수}} 형태로 분석 데이터 주입
  - {{user_name}}, {{analysis_id}}
  - {{metrics.visual_weight}}, {{metrics.canthal_tilt}}
  - {{celeb.name}}, {{celeb.balance_rule}}
  - {{gap_bridge.solutions[]}}
  - {{products[].name}}, {{products[].match_score}}

완료 기준: 분석 데이터 입력 → PDF 12-15페이지 자동 생성 → 다운로드 가능
```

### 2-3. 레이더 차트 & 시각화 (Day 3-4, 2-2와 병행)

```
작업: 나 vs 추구미 5 Metrics 레이더 차트

기술: Chart.js 또는 D3.js → SVG/이미지로 내보내기 (PDF 삽입용)

차트 종류:
  1. 레이더 차트: 나(핑크) vs 추구미(골드) 5개축 오버레이
  2. 바 차트: 각 Metric별 Before → After 변화량
  3. 스펙트럼: 동양←→성형 스펙트럼에서 내 위치

생성 방식:
  - HTML에서 Chart.js로 렌더링
  - Puppeteer로 캡처하여 PDF에 삽입
  - 또는 서버사이드 canvas-node로 이미지 직접 생성

완료 기준: 5 Metrics 레이더 차트 이미지 자동 생성
```

### 2-4. 이메일 발송 시스템 (Day 5-6)

```
작업: 결제 완료 → PDF 생성 → 이메일로 레포트 발송

기술: Resend (또는 SendGrid, Postmark)
  - 무료 티어: 월 3,000건 (Resend), 100건/일 (SendGrid)
  - Resend 추천 (개발자 친화적, API 단순)

이메일 구성:
  제목: "Your Sherlock Archive is Ready → Analysis #0024"
  본문:
    - 미니 프리뷰 (레이더 차트 + 요약 수치)
    - PDF 다운로드 링크 (Supabase Storage 서명 URL)
    - "이 링크는 7일 후 만료됩니다" (셜로키언 스타일)

보안:
  - PDF는 Supabase Storage에 저장 (7일 후 자동 삭제)
  - 서명 URL (expiration: 7일)
  - 비밀번호 보호는 Phase 3에서 검토

완료 기준: 결제 → 30초 내 PDF 생성 → 이메일 수신 확인
```

### 2-5. 웹 내 레포트 뷰어 (Day 6-7)

```
작업: 이메일 외에 웹에서도 레포트 열람 가능

라우팅: k-mirror.ai/archive/{analysis_id}
  - 결제한 유저만 접근 가능 (Supabase Auth 또는 토큰)
  - PDF 서버 렌 뷰어 또는 HTML 버전 직접 렌더링

완료 기준: 결제 유저 → 웹에서 레포트 열람 가능
```

**Phase 2 최종 산출물**:
- ✅ 결제 → PDF 자동 생성 → 이메일 발송 풀 파이프라인
- ✅ 12-15페이지 프리미엄 레포트 (다크 테크 디자인)
- ✅ 나 vs 추구미 레이더 차트
- ✅ **이 시점에서 수익 발생 시작**

---

## Phase 3: 완성도 & 확장 (Week 6-7)

> **목표**: 제품 구매 연결, 실제 YouTube, 글로벌 대응

### 3-1. 제품 Affiliate 링크 연동 (Day 1-2)

```
작업: 프리미엄 레포트의 제품 추천에 실제 구매 링크 추가

DB 수정:
  ALTER TABLE products ADD COLUMN affiliate_url TEXT;
  ALTER TABLE products ADD COLUMN amazon_asin TEXT;
  ALTER TABLE products ADD COLUMN olive_young_url TEXT;

  12개 기존 제품 + 20개 추가 = 32개 제품 DB

PDF 반영:
  05_products.html에 구매 버튼/링크 추가
  "🛒 Buy on Amazon" / "🇰🇷 Olive Young"
```

### 3-2. 실제 YouTube 튜토리얼 연동 (Day 2-4)

```
작업: YouTube Data API v3로 실제 영상 매칭

신규 Edge Function: supabase/functions/search-youtube/
  - 입력: 검색 쿼리 (Gemini가 생성) + 셀럽 이름
  - 출력: 실제 YouTube 영상 3개 (videoId, title, thumbnail)
  - 캐싱: 동일 쿼리는 24시간 캐시

필요: YouTube Data API 키 (Google Cloud Console)
  - 무료 쿼터: 10,000 유닛/일 (검색 1회 = 100유닛 = 하루 100회)

PDF 반영:
  06_tutorial.html에 실제 영상 썸네일 + 링크
```

### 3-3. 글로벌 다국어 대응 (Day 4-6)

```
작업: 영문 버전 (K-GLOW CARD + SHERLOCK ARCHIVE)

K-GLOW CARD: 이미 영문 기본 설계 → 한글 옵션만 추가
SHERLOCK ARCHIVE PDF: 영문/한글 템플릿 분리
  - 01_cover_en.html / 01_cover_ko.html
  - 크니 코멘트는 Gemini가 언어에 맞게 생성

Gemini 프롬프트: 언어 파라미터 추가
  - language: "en" | "ko" | "ja" (Phase 4에서 일본어)
```

### 3-4. 데일리/오피스/글램 3가지 버전 (Day 6-7)

```
작업: 프리미엄 레포트에 메이크업 강도별 3가지 버전 추가

데이터:
  Gemini 프롬프트에 3가지 버전 출력 추가:
  - daily: { intensity: "light", metrics_change: {...} }
  - office: { intensity: "medium", metrics_change: {...} }
  - glam: { intensity: "full", metrics_change: {...} }

비주얼:
  각 버전의 Before/After 이미지 생성
  (메이크업 오버레이 강도만 조절 → Canvas opacity)

PDF:
  04_solution.html에 3가지 버전 미리보기 추가
```

**Phase 3 최종 산출물**:
- ✅ 제품 구매 링크 (Affiliate 수익)
- ✅ 실제 YouTube 튜토리얼
- ✅ 영문 버전
- ✅ 3가지 메이크업 버전

---

## Phase 4: 런칭 & 그로스 (Week 8)

### 4-1. 퍼포먼스 최적화 (Day 1-2)

```
- Lighthouse Score 90+ 목표
- 이미지 최적화 (WebP, lazy loading)
- Edge Function 콜드 스타트 최소화
- PDF 생성 시간 <30초
```

### 4-2. 분석 트래킹 (Day 2-3)

```
- Google Analytics 4 설정
- Mixpanel 이벤트 트래킹:
  - celeb_selected, selfie_uploaded, analysis_completed
  - card_shared, premium_clicked, payment_completed
  - report_opened, product_clicked
- 전환 퍼널 대시보드
```

### 4-3. 런칭 (Day 4-7)

```
채널:
  - Product Hunt 출시
  - 인스타그램/틱톡 샘플 콘텐츠 (K-GLOW CARD 예시 10장)
  - 뷰티 인플루언서 시딩 (5명에게 무료 프리미엄 제공)
  - Reddit r/AsianBeauty, r/MakeupAddiction 포스팅

목표:
  - Week 1: 1,000명 미니 레포트 생성
  - Week 1: 50명 프리미엄 결제
  - 공유율: 미니 레포트의 30%+가 SNS 공유
```

---

## 기술 스택 요약

```
프론트엔드:
  ├── React (또는 Next.js)
  ├── Tailwind CSS
  ├── MediaPipe Face Mesh (얼굴 랜드마크)
  ├── Canvas API (메이크업 오버레이)
  ├── html2canvas (카드 이미지 생성)
  ├── Chart.js / Recharts (레이더 차트)
  ├── react-compare-image (Before/After 슬라이드)
  └── Framer Motion (애니메이션)

백엔드:
  ├── Supabase
  │   ├── Edge Functions (Deno/TypeScript)
  │   ├── PostgreSQL (DB)
  │   ├── Storage (이미지, PDF)
  │   └── Auth (사용자 인증)
  │
  ├── Vercel (PDF 생성 서버)
  │   └── API Route + Puppeteer
  │
  ├── Gemini API (AI 분석)
  │   ├── gemini-1.5-flash (빠른 분석)
  │   └── gemini-1.5-pro (프리미엄 심층 분석)
  │
  ├── Stripe (결제)
  │
  └── Resend (이메일)

데이터 파이프라인:
  ├── Python (pony-data-collector)
  ├── yt-dlp (YouTube 수집)
  ├── OpenCV (프레임 추출)
  └── Gemini API (메이크업 DNA 분석)

외부 API:
  ├── YouTube Data API v3 (튜토리얼 검색)
  └── MediaPipe (브라우저 내 얼굴 분석)
```

---

## 의존성 흐름 (뭘 먼저 해야 하는)

```
Phase 0 (데이터)
  │
  ├── 0-1 파이프라인 셋업 ──────┐
  ├── 0-2 Gemini 프롬프트 확장 ──┤
  │                           └── 0-3 셀럽 데이터 수집
  │                           │        │
  │                           │        └── 0-4 Supabase 업로드
  └── 0-5 분석 API v6.0 ───────┘               │
                                              │
Phase 1 (미니 레포트)                           │
  │                                           │
  ├── 1-1 추구미 UI ────────────────────────────┘
  ├── 1-2 셀카 업로드 + 분석
  ├── 1-3 로딩 애니메이션
  ├── 1-4 비주얼 변환 엔진 ─── (에셋 제작 병행)
  ├── 1-5 K-GLOW CARD 생성기
  └── 1-6 SNS 공유
        │
        └── ✅ 유저 테스트 시작 (무료)
        │
Phase 2 (프리미엄)
  │
  ├── 2-1 결제 플로우
  ├── 2-2 PDF 생성 엔진 ─── (디자인 템플릿 병행)
  ├── 2-3 레이더 차트
  ├── 2-4 이메일 발송
  └── 2-5 웹 뷰어
        │
        └── ✅ 수익 발생 시작
        │
Phase 3 (완성도)
  │
  ├── 3-1 Affiliate 링크
  ├── 3-2 YouTube API
  ├── 3-3 글로벌 (영문)
  └── 3-4 3가지 버전
        │
Phase 4 (런칭)
  │
  ├── 4-1 최적화
  ├── 4-2 트래킹
  └── 4-3 런칭!
```

---

## 리스크 & 대비책

| 리스크 | 확률 | 대비책 |
|--------|------|--------|
| 비주얼 변환 품질 낮음 | 중 | Phase 1에서 일찍 테스트, 안 되면 Before/After를 나란히 배치(슬라이드 대신) |
| PDF 생성 시간 >1분 | 중 | 비동기 생성 + "레포트 준비되면 이메일로 보내드립니다" |
| Gemini 5 Metrics 일관성 낮음 | 높 | 동일 사진 5회 테스트 → 편차 큰 지표는 범위(예: 35-42)로 표시 |
| YouTube API 쿼터 초과 | 중 | 검색 결과 24시간 캐싱 + 셀럽별 영상 프리캐시 |
| 셀럽 메이크업 에셋 제작 시간 | 높 | Phase 1에서 3명(제니, 수지, 한소희)만 집중, 나머지는 점진 추가 |

---

## 첫 주 데일리 플랜 (Phase 0 상세)

```
Day 1 (월):
  ☐ pony-data-collector 프로젝트 생성
  ☐ requirements.txt 패키지 설치
  ☐ config.env에 GEMINI_API_KEY 설정
  ☐ gemini_analyzer.py에 5 Metrics 프롬프트 추가
  ☐ 테스트 이미지 3장으로 5 Metrics 추출 검증

Day 2 (화):
  ☐ youtube_collector.py 테스트 (제니 영상 3개)
  ☐ 전체 파이프라인 테스트 (수집 → 분석 → JSON 출력)
  ☐ 셀럽 8명 검색 쿼리 목록 작성

Day 3 (수):
  ☐ 셀럽 4명 배치 수집 실행 (제니, 수지, 한소희, 수지)
  ☐ 수집 결과 QA (이미지 품질, 분석 정확도)

Day 4 (목):
  ☐ 셀럽 4명 추가 수집 (카리나, 하니, 정호연, 테일러)
  ☐ Supabase celeb_makeup_dna 테이블 생성
  ☐ upload_to_supabase.py 작성 + 데이터 업로드

Day 5 (금):
  ☐ analyze-kbeauty Edge Function v6.0 업그레이드
  ☐ match-celeb Edge Function 신규 생성
  ☐ Postman으로 전체 API 테스트
  ☐ Phase 0 완료 체크리스트 검증

주말: Phase 1 준비
  ☐ 셀럽 메이크업 에셋 제작 시작 (제니, 수지, 한소희)
  ☐ React 프로젝트 스캐폴딩 (또는 기존 프로젝트 확인)
  ☐ 다크 테크 디자인 시스템 설정 (색상, 폰트, 컴포넌트)
```

---

*이 로드맵은 1인 개발 기준이며, 각 Phase 완료 시 유저 피드백을 반영하여 다음 Phase를 조정합니다.*
