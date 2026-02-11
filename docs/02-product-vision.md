# K-MIRROR Product Vision & Requirements

> 이 문서는 K-MIRROR의 제품 비전, 타겟 유저, 핵심 플로우, 기술 전략을 정의한다.
> 모든 기능 개발과 의사결정은 이 문서를 기준으로 한다.

---

## 1. 한 줄 정의

**AI가 내 얼굴을 분석하고, K-셀럽의 스타일을 내 인종과 골격에 맞게 변환해서 입혀주는 글로벌 K-Beauty 스타일리스트.**

---

## 2. 핵심 가치

| 원칙 | 설명 |
|------|------|
| **Ethnic Inclusivity** | 흑인, 동양인, 남미인, 동아시아인, 백인 — 모든 인종이 자신의 피부색에 맞는 K-Beauty를 경험할 수 있어야 한다. |
| **Identity Preservation** | 인종을 바꾸거나 피부색을 밝히는 것이 아니라, 본인의 고유한 특성(점, 흉터, 눈가 주름)을 유지한 채 스타일만 입힌다. |
| **Scientific Trust** | "장난감"이 아닌 "신뢰받는 도구". 이질감(Uncanny Valley)을 극복하여 실제 구매로 이어지게 한다. |
| **Seoul as Variable** | "Your identity is the constant. Seoul is the variable." — 서울의 미적 기준을 사용자의 정체성에 맞춰 변환한다. |

---

## 3. Target User

### Primary

**해외 거주 K-Beauty 관심 소비자 (18-35세)**

- K-드라마, K-팝을 통해 한국 메이크업에 관심을 갖게 된 외국인
- 자신의 피부색/골격에 맞는 K-스타일 적용법을 모르는 사람
- 인종: 흑인, 남아시아인, 동남아시아인, 라틴계, 동아시아인, 백인 전부

### Secondary

**한국 뷰티 전문가/스타일리스트**

- 글로벌 클라이언트를 확보하고 싶은 한국 스타일리스트
- 자신의 기술을 해외에 판매할 채널이 필요한 사람

---

## 4. Core User Flow

```
[1] Onboarding
    ├── 피부 타입 선택 (건성/지성/복합/민감)
    ├── 피부 고민 선택 (색소침착, 여드름, 건조 등)
    ├── 메이크업 스킬 레벨 (Beginner / Intermediate / Pro)
    ├── 목적 환경 (Office / Outdoor / Studio)
    └── 무드 (Natural / Elegant / Powerful)

[2] Style Input
    ├── 내 얼굴 사진 업로드 (Bare-face)
    └── 추구미 선택
        ├── K-셀럽 갤러리에서 선택 (추천)
        ├── Pinterest/URL에서 가져오기
        └── 직접 사진 업로드

[3] AI Analysis (Sherlock Engine)
    ├── 멜라닌 지수 측정 (1-6)
    ├── 언더톤 분석 (Warm / Cool / Neutral)
    ├── 얼굴 비율 분석 (Upper / Middle / Lower)
    ├── 눈 각도 분석 (Cat-eye / Doe-eye / Puppy-eye)
    ├── 골격 구조 분석 (광대, 턱선, 아이홀 깊이)
    └── Skin Hex Code 추출

[4] Virtual Fitting (핵심 차별화)
    ├── 셀럽 메이크업을 내 얼굴에 적용한 이미지 생성
    ├── 정체성 보존 (InstantID / Face Anchoring)
    ├── 멜라닌 농도 고려 발색 렌더링 (Multiplication Blending)
    └── 골격 맞춤형 배치 (Landmark Detection 기반)

[5] Result & Recommendations
    ├── 비포/애프터 비교
    ├── AI 스타일링 노트 (왜 이 스타일이 맞는지 설명)
    ├── 추천 제품 리스트 (매치 스코어 + 안전 등급)
    ├── 튜토리얼 영상 큐레이션 (AI 코칭 코멘트 포함)
    └── Muse Board에 저장

[6] Purchase
    ├── 추천 제품 장바구니
    ├── 한국 직구 배송 (DHL / EMS)
    └── Stripe 결제

[7] Expert Matching (확장)
    ├── 한국 스타일리스트 프로필 브라우징
    ├── 1:1 비디오 상담 예약
    └── 스타일리스트 큐레이션 제품 패키지 구매
```

---

## 5. 핵심 기술 전략

### 5-1. Uncanny Valley 극복 3요소

#### A. Identity Preservation (InstantID & Face Anchoring)

- 단순 오버레이(Overlay)가 아닌, 얼굴의 고유한 특징을 유지하면서 스타일만 변환
- 사용자의 점, 흉터, 눈가 주름 등 "퍼스널 디테일"은 그대로 보존
- 기술 후보: InstantID, Gemini Imagen, Stable Diffusion + ControlNet

#### B. Melanin-Aware Color Rendering

- 같은 핑크 립스틱도 피부색에 따라 발색이 완전히 다름
- 사용자 피부색의 Hex Code를 추출 → 제품 색상과 Multiplication 블렌딩 → 실제 발색 시뮬레이션
- "화장품이 피부 위에서 겉도는 느낌"을 제거

#### C. Structure-Aware Placement (Sherlock)

- Face Landmark Detection으로 광대뼈 위치, 아이홀 깊이, 턱선 파악
- 흑인: 입체적 골격을 살리는 하이라이팅 위치
- 동양인: 중안부를 짧아 보이게 하는 블러셔 위치
- AI가 정확히 "그 자리에" 메이크업을 배치

### 5-2. Anti-Discrimination by Design

| 원칙 | 구현 |
|------|------|
| "Whitening" 개념 거부 | "미백"이 아닌 "Luminosity Optimization"으로 프레이밍 |
| 동일 기준 적용 금지 | 인종별로 다른 아름다움의 기준을 인정하고 각각에 최적화 |
| 비교하지 않음 | "이 인종이 더 적합" 같은 비교 표현 금지 |
| Melanin Guard | 피부를 밝히거나 어둡히는 처리 차단 |
| Inclusion Guard | 특정 인종에만 편향된 추천 방지 |

---

## 6. K-Celeb Catalog 기획

### 카테고리 구조

```
Mood
├── Natural (자연스러운 K-메이크업)
├── Elegant (시크/우아한 스타일)
├── Powerful (볼드/강렬한 스타일)
└── Avant-Garde (실험적/에디토리얼)

Genre
├── K-Pop Idol
├── K-Drama Actress
├── K-Model / Fashion
└── K-YouTuber / Influencer
```

### 셀럽 데이터 구조

- 이름, 대표 이미지(들), 시그니처 스타일 키워드
- 추천 대상 멜라닌 범위 (모든 레벨에 적용 가능하되, AI가 변환)
- 난이도 레벨 (Beginner / Intermediate / Pro)

---

## 7. Phased Roadmap

### Phase 1 — Foundation (현재 → 즉시)

- [ ] 컴포넌트 분리 및 아키텍처 정비
- [ ] Onboarding 확장 (피부 타입 상세, 알레르기 등)
- [ ] K-셀럽 갤러리 카탈로그 구축
- [ ] AI 프롬프트 bias 방지 가드레일 강화
- [ ] 다국어 구조 준비 (i18n)
- [ ] 디자인 시스템 컴포넌트화

### Phase 2 — Virtual Fitting (핵심 차별화)

- [ ] Face Landmark Detection 연동 (MediaPipe / TensorFlow.js)
- [ ] 멜라닌 기반 발색 렌더링 모듈
- [ ] 이미지 생성 모델 연동 (InstantID or Gemini Imagen)
- [ ] 비포/애프터 비교 UI
- [ ] Muse Board 저장 기능

### Phase 3 — Commerce

- [ ] Stripe 결제 연동
- [ ] 한국 제품 DB 구축 (브랜드, 가격, 재고)
- [ ] 물류 파트너 연동 (DHL, EMS API)
- [ ] 주문 추적 시스템

### Phase 4 — Marketplace

- [ ] 스타일리스트 프로필 시스템
- [ ] 예약/일정 관리
- [ ] 비디오 상담 연동
- [ ] 스타일리스트 큐레이션 패키지
- [ ] 리뷰/평점 시스템

---

## 8. 성공 지표

| 지표 | 의미 |
|------|------|
| **가상 피팅 → 제품 클릭률** | 피팅 결과가 구매 의도로 이어지는지 |
| **인종별 사용률 분포** | 특정 인종에 편향되지 않는지 |
| **재사용률** | 한번 쓰고 마는 장난감인지, 반복 사용 도구인지 |
| **스타일리스트 매칭률** | Phase 4에서 실제 매칭 전환 |
| **NPS by ethnicity** | 인종별 만족도가 균등한지 |
