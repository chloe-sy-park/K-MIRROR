# K-MIRROR Data Model Specification

> 현재 타입 정의 + 향후 확장 필드를 정의하는 문서.
> `types.ts` 수정 시 이 문서를 먼저 업데이트한다.

---

## 1. 현재 모델 (types.ts 기준)

### 1-1. UserPreferences

```typescript
interface UserPreferences {
  environment: 'Office' | 'Outdoor' | 'Studio';
  skill: 'Beginner' | 'Intermediate' | 'Pro';
  mood: 'Natural' | 'Elegant' | 'Powerful';
}
```

| 필드 | 설명 | AI 프롬프트 반영 |
|------|------|----------------|
| `environment` | 메이크업 사용 환경. 지속력과 마감 결정 | Office: 매트/세미매트, Outdoor: 방수, Studio: 고발색 |
| `skill` | 메이크업 숙련도. 추천 테크닉 난이도 결정 | Beginner: 단순 도구, Pro: 정밀 브러시 테크닉 |
| `mood` | 원하는 분위기. 전체 색조/스타일 방향 결정 | Natural: 뮤트톤, Elegant: 시크, Powerful: 볼드 |

### 1-2. AnalysisResult

```typescript
interface AnalysisResult {
  tone: {
    melaninIndex: number;     // 1-6, 03-ai-inclusivity-framework.md 참조
    undertone: 'Warm' | 'Cool' | 'Neutral';
    skinConcerns: string[];   // 예: ['Hyper-pigmentation', 'Inner Dryness']
    description: string;      // AI가 생성한 피부 분석 설명문
  };
  sherlock: {
    proportions: {
      upper: string;          // 예: '1' (정규화 비율)
      middle: string;         // 예: '1.25'
      lower: string;          // 예: '0.85'
    };
    eyeAngle: string;         // 예: '12° Positive Cat-eye'
    boneStructure: string;    // 예: 'High-Definition Angular Zygomatic'
    facialVibe: string;       // 예: 'Seoul Bold / Avant-Garde'
  };
  kMatch: {
    celebName: string;        // 매칭된 셀럽명
    adaptationLogic: {
      base: string;           // 베이스 메이크업 적응 로직
      lip: string;            // 립 메이크업 적응 로직
      point: string;          // 포인트 메이크업 적응 로직
    };
    styleExplanation: string; // 전체 스타일 변환 설명
    aiStylePoints: string[];  // 핵심 스타일 키워드 (3-5개)
  };
  recommendations: {
    ingredients: string[];    // 추천 성분 리스트
    products: Product[];      // 3-4개 추천 제품
    videos: VideoRecommendation[];  // 2개 추천 영상
    sensitiveSafe: boolean;   // 민감성 안전 여부
  };
}
```

### 1-3. Product

```typescript
interface Product {
  name: string;         // 제품명 (예: 'Black Cushion (Deep Shade)')
  brand: string;        // 브랜드 (예: 'HERA')
  price: string;        // 가격 문자열 (예: '$45')
  desc: string;         // 1줄 설명
  matchScore: number;   // 사용자 매치 점수 (0-100)
  ingredients: string[];// 주요 성분 리스트
  safetyRating: string; // 안전 등급 (예: 'EWG Green', 'Vegan', 'Safe')
}
```

### 1-4. VideoRecommendation

```typescript
interface VideoRecommendation {
  title: string;          // 영상 제목
  creator: string;        // 크리에이터명
  views: string;          // 조회수 (예: '2.1M')
  duration: string;       // 재생시간 (예: '14:20')
  tag: string;            // 카테고리 (예: 'Masterclass', 'Technique')
  aiCoaching: string;     // AI 코칭 코멘트 (특정 타임스탬프 지목 등)
  matchPercentage: number;// AI 매치 비율 (0-100)
  skillLevel: string;     // 대상 스킬 (예: 'Intermediate', 'Pro')
}
```

### 1-5. MuseBoard / SavedMuse (미구현, 타입만 존재)

```typescript
interface MuseBoard {
  id: string;
  name: string;       // 보드명 (예: 'Office Looks')
  icon: string;        // 이모지 또는 아이콘 키
  count: number;       // 저장된 뮤즈 수
  aiSummary: string;   // AI가 생성한 보드 요약
}

interface SavedMuse {
  id: string;
  userImage: string;     // base64
  celebImage: string;    // base64
  celebName: string;
  date: string;
  vibe: string;          // 분석 시 분위기
  boardId?: string;      // 소속 보드
  aiStylePoints: string[];
}
```

---

## 2. 확장 예정 모델

### 2-1. UserPreferences 확장

```typescript
interface UserPreferences {
  // --- 현재 ---
  environment: 'Office' | 'Outdoor' | 'Studio';
  skill: 'Beginner' | 'Intermediate' | 'Pro';
  mood: 'Natural' | 'Elegant' | 'Powerful';

  // --- 확장 예정 ---
  skinType: 'Dry' | 'Oily' | 'Combination' | 'Normal';
  skinConcerns: SkinConcern[];       // 다중 선택
  allergies: string[];               // 알레르기 성분 (자유 입력)
  ageRange?: '18-24' | '25-34' | '35-44' | '45+';
  preferredLanguage?: string;        // i18n용
}

type SkinConcern =
  | 'Acne'
  | 'Hyperpigmentation'
  | 'Dryness'
  | 'Redness'
  | 'Rosacea'
  | 'Fine Lines'
  | 'Large Pores'
  | 'Sensitivity'
  | 'Uneven Texture';
```

### 2-2. AnalysisResult 확장

```typescript
interface AnalysisResult {
  // --- 현재 필드 유지 ---
  tone: { ... };
  sherlock: { ... };
  kMatch: { ... };
  recommendations: { ... };

  // --- 확장 예정 ---
  skinHexCode: string;          // AI 추출 피부 Hex (예: '#8B6547')
  virtualFitting?: {
    generatedImageUrl: string;  // 가상 피팅 결과 이미지 URL
    confidenceScore: number;    // AI 신뢰도 (0-100)
    preservedFeatures: string[];// 보존된 특징 (예: ['mole on left cheek'])
  };
  landmarks?: {
    highlightPosition: [number, number];  // 하이라이터 최적 위치
    blusherPosition: [number, number];    // 블러셔 최적 위치
    contourPath: [number, number][];      // 컨투어 경로
    eyelinerAngle: number;                // 추천 아이라이너 각도
  };
  colorRendering?: {
    lipOnSkin: string;      // 립 제품의 피부 위 예상 발색 Hex
    blushOnSkin: string;    // 블러셔 피부 위 예상 발색 Hex
    baseShade: string;      // 추천 파운데이션 쉐이드 Hex
  };
}
```

### 2-3. KCeleb (새 모델)

```typescript
interface KCeleb {
  id: string;
  name: string;                    // 예: 'Wonyoung (IVE)'
  nameKo: string;                  // 예: '장원영 (IVE)'
  images: {
    primary: string;               // 대표 이미지 URL
    styles: CelebStyle[];          // 다양한 스타일 이미지
  };
  category: 'Idol' | 'Actress' | 'Model' | 'Influencer';
  signatureStyle: string[];        // 예: ['Glass Skin', 'Gradient Lip']
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Pro';
  suitableMoods: ('Natural' | 'Elegant' | 'Powerful' | 'Avant-Garde')[];
}

interface CelebStyle {
  imageUrl: string;
  styleName: string;      // 예: 'Strawberry Moon'
  occasion: string;       // 예: 'Award Show', 'Casual', 'MV'
}
```

### 2-4. Stylist (새 모델)

```typescript
interface Stylist {
  id: string;
  name: string;
  nameKo: string;
  profileImage: string;
  role: string;                  // 예: 'Editorial Lead', 'Idol Visualist'
  specialties: string[];         // 예: ['Deep Tone Adaptation', 'Cat-eye Liner']
  rating: number;                // 0-5
  reviewCount: number;
  pricing: {
    consultation: number;        // USD, 1회 상담 가격
    fullSession: number;         // USD, 풀 세션 가격
    currency: string;
  };
  availability: {
    timezone: string;            // 예: 'Asia/Seoul'
    slots: TimeSlot[];
  };
  languages: string[];           // 예: ['Korean', 'English']
  portfolio: PortfolioItem[];
}

interface TimeSlot {
  date: string;      // ISO date
  startTime: string; // HH:mm
  endTime: string;
  booked: boolean;
}

interface PortfolioItem {
  imageUrl: string;
  clientTone: number;    // Melanin Level
  styleName: string;
  description: string;
}
```

### 2-5. Order (새 모델)

```typescript
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingMethod: 'DHL' | 'EMS';
  shippingAddress: {
    fullName: string;
    country: string;
    address: string;
    city: string;
    postalCode: string;
  };
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  trackingNumber?: string;
  createdAt: string;       // ISO datetime
}

interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
}
```

---

## 3. 필드 규칙

| 규칙 | 설명 |
|------|------|
| 가격 | 현재 `string` ($45). 향후 `number` + `currency` 분리 필요 |
| 이미지 | 현재 `base64 string`. 향후 Cloud Storage URL로 전환 필요 |
| ID | 현재 미사용. 향후 UUID v4 형식 |
| 날짜 | ISO 8601 형식 (`2025-01-15T09:00:00Z`) |
| 멜라닌 지수 | 정수 1-6만 허용. 소수점 불가 |
| 매치 스코어 | 정수 0-100. AI가 생성 |
| 비율 (proportions) | 문자열로 소수점 표현 (예: '1.25'). 향후 number 전환 고려 |

---

## 4. 데이터 흐름 요약

```
UserPreferences ──┐
                  ├──→ analyzeKBeauty() ──→ AnalysisResult
User Image (base64)┤                         ├── tone
Celeb Image (base64)┘                        ├── sherlock
                                             ├── kMatch
                                             └── recommendations
                                                  ├── products ──→ Order
                                                  └── videos

KCeleb (Gallery) ──→ Celeb Image 선택
Stylist ──→ Expert Matching ──→ Booking
SavedMuse ──→ MuseBoard ──→ 재분석/공유
```
