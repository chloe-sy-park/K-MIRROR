# K-MIRROR Design System

> K-MIRROR의 시각 언어를 정의하는 단일 참조 문서.
> 새 화면, 컴포넌트, 마케팅 소재 제작 시 이 문서를 기준으로 한다.

---

## 1. Brand Identity

### Brand Voice

| 키워드 | 설명 |
|--------|------|
| **Forensic Luxury** | 과학적 정밀함 + 하이엔드 패션 에디토리얼 |
| **Seoul Clinical** | 서울 뷰티의 전문성을 임상/연구소 톤으로 표현 |
| **Inclusive Precision** | 모든 인종을 존중하되, 정밀 분석이라는 신뢰감 유지 |

### Copy Tone

- UI 라벨: 전부 **UPPERCASE**, 과학 용어 차용 ("Neural", "Biometric", "Forensic", "Protocol")
- 설명문: **italic**, 따옴표로 감싸서 "연구소 노트" 느낌
- 숫자/지표: heading-font + italic로 강조 (예: `94%`, `0.4mm`, `184`)
- 절대 금지: 이모지, 캐주얼 톤, 느낌표 남발

---

## 2. Color Palette

### Core Colors

| Token | Hex | 용도 |
|-------|-----|------|
| `--brand-pink` | `#FF4D8D` | 프라이머리 액센트. CTA, 강조, 활성 상태 |
| `--brand-dark` | `#0F0F0F` | 텍스트, 버튼 기본, 다크 섹션 배경 |
| `--brand-gray` | `#F5F5F7` | 서피스 배경, 인풋 필드 |
| White | `#FFFFFF` | 기본 배경, 카드 배경 |

### Accent & Gradient

| Token | 값 | 용도 |
|-------|-----|------|
| Accent Gradient | `linear-gradient(90deg, #FF4D8D, #FF8E53)` | 배지, 프로그레스 바 |
| Pink Glow | `box-shadow: 0 0 15px #FF4D8D` | 스캔 라인 효과 |
| Dark Overlay | `bg-black/40` ~ `bg-black/60` | 이미지 위 텍스트 가독성 |
| Pink Blur | `bg-[#FF4D8D]/10 blur-[100px]` | 다크 섹션 내 앰비언트 라이트 |

### Grayscale System

| 용도 | Tailwind Class | 의미 |
|------|---------------|------|
| 본문 텍스트 | `text-[#0F0F0F]` (기본) | 최고 가독성 |
| 서브 라벨 | `text-gray-400` | 보조 정보 |
| 마이크로 라벨 | `text-gray-300` | 카테고리, 메타 |
| 비활성 | `text-gray-200` | 플레이스홀더, 장식 |
| 보더 | `border-gray-100` | 카드, 구분선 |
| 서피스 | `bg-gray-50`, `bg-[#F9F9F9]` | 인풋, 카드 내부 |

### Melanin Tone Indicator (UI 전용)

| Undertone | 색상 | Class |
|-----------|------|-------|
| Warm | `#D4A373` | `bg-[#D4A373]` |
| Cool | `#4A3B31` | `bg-[#4A3B31]` |
| Neutral | `#C6A48E` | `bg-[#C6A48E]` |

---

## 3. Typography

### Font Stack

| 역할 | 폰트 | Class | 용도 |
|------|------|-------|------|
| **Body** | Plus Jakarta Sans | 기본 (body에 적용) | 본문, 라벨, 설명 |
| **Heading** | Outfit | `.heading-font` | 대형 타이틀, 숫자 강조 |

### Type Scale

| 이름 | 크기 | 속성 | 예시 |
|------|------|------|------|
| **Hero** | `text-[60px]` ~ `text-[120px]` | `heading-font leading-[0.8] tracking-[-0.05em] uppercase` | "FORENSIC BEAUTY." |
| **Page Title** | `text-5xl` ~ `text-7xl` | `heading-font uppercase` | "Human Artistry." |
| **Section Title** | `text-[40px]` ~ `text-4xl` | `heading-font italic uppercase` | "Recommended Objects" |
| **Card Title** | `text-xl` ~ `text-lg` | `heading-font italic uppercase leading-none` | 제품명, 전문가명 |
| **Category Label** | `text-[10px]` | `font-black tracking-[0.5em]~[0.8em] text-[#FF4D8D] uppercase italic` | "Technical Philosophy" |
| **Sub Label** | `text-[10px]` | `font-black uppercase tracking-widest text-gray-400` | "Target Environment" |
| **Micro Label** | `text-[9px]` | `font-black uppercase tracking-widest text-gray-300` | 브랜드명, 역할 |
| **Nano Label** | `text-[8px]` | `font-black uppercase tracking-[0.5em]` | 뱃지, 태그, 메타 |
| **Body Text** | `text-sm` ~ `text-base` | `font-medium leading-relaxed` | 설명문 |
| **Quote** | `text-xl` ~ `text-3xl` | `font-medium leading-[1.3] italic tracking-tight` | AI 분석 코멘트 |

### Typography Rules

1. **라벨은 항상 UPPERCASE** — 예외 없음
2. **heading-font에는 italic 자주 병용** — 에디토리얼 느낌
3. **tracking** — 라벨류: `tracking-widest` ~ `tracking-[0.8em]` / 타이틀류: `tracking-tighter` ~ `tracking-[-0.05em]`
4. **font-black (900)** — 라벨과 버튼에 일관 적용
5. **italic + uppercase 조합** — K-MIRROR 시그니처 스타일

---

## 4. Spacing & Layout

### Page Layout

| 요소 | 값 |
|------|-----|
| Max Width | `max-w-7xl` (1280px) |
| 수평 패딩 | `px-6` (모바일) / `lg:px-12` (데스크탑) |
| Nav 높이 | `py-5` + fixed top |
| Main 상단 여백 | `pt-32` (nav 높이 확보) |
| Main 하단 여백 | `pb-24` |

### Section Spacing

| 관계 | 값 | 용도 |
|------|-----|------|
| 대 섹션 간격 | `space-y-32` ~ `gap-40` | 결과 뷰의 섹션 간 |
| 중 섹션 간격 | `space-y-16` ~ `space-y-20` | 카드 그룹 간 |
| 소 섹션 간격 | `space-y-10` ~ `space-y-12` | 카드 내부 블록 간 |
| 요소 간격 | `space-y-6` ~ `gap-8` | 제목-본문, 항목 간 |
| 타이트 간격 | `space-y-2` ~ `gap-4` | 라벨-값, 인라인 |

### Section Dividers

- 섹션 상단: `border-b border-black pb-20` (강한 구분)
- 카드 내부: `border-b border-gray-100 pb-4` (약한 구분)
- 대시: `border-dashed border-[#FF4D8D]/30` (Sherlock 분석 영역)
- 수직선: `w-[1px] h-20 bg-[#FF4D8D]/30` (장식적 연결)

---

## 5. Border Radius System

K-MIRROR의 시그니처 — **극도로 둥근 곡선**이 럭셔리 톤을 만든다.

| 요소 | Radius | 용도 |
|------|--------|------|
| 대형 컨테이너 | `rounded-[6rem]` | 풀섹션 다크 블록 |
| 히어로 카드 | `rounded-[4rem]` | 스캔 영역, 무드보드 |
| 주요 카드 | `rounded-[3rem]` ~ `rounded-[3.5rem]` | 분석 카드, 전문가 카드, 체크아웃 패널 |
| 업로드 영역 | `rounded-[2.5rem]` | 파일 업로드, CTA 버튼 그룹 |
| 미디어 썸네일 | `rounded-[2rem]` | 프로필 이미지, Sherlock 시각화 |
| 서브 카드 | `rounded-2xl` ~ `rounded-3xl` | 인풋, 서브 버튼, 배송 옵션 |
| 버튼 (pill) | `rounded-full` | 모든 주요 CTA, 필터 칩 |
| 뱃지/태그 | `rounded-full` ~ `rounded-lg` | 매치 스코어, 스킬 레벨 |

### Rule

```
섹션 레벨 → 4~6rem
카드 레벨 → 2.5~3.5rem
요소 레벨 → rounded-2xl 또는 rounded-full
절대 sharp corner (rounded-none) 사용 금지
```

---

## 6. Component Patterns

### Luxury Card

```
bg-white
border border-gray-100
rounded-[3rem]
p-10
hover:shadow-2xl
transition-all
```

### CTA Button (Primary)

```
px-14 py-7
bg-black text-white
rounded-[2.5rem] 또는 rounded-full
font-black text-xs uppercase tracking-[0.4em]
hover:bg-[#FF4D8D]
transition-all duration-500
shadow-2xl
```

### CTA Button (Secondary)

```
flex items-center gap-4
text-[10px] font-black uppercase tracking-widest
border-b border-black pb-2 (underline 스타일)
hover:text-[#FF4D8D] hover:border-[#FF4D8D]
transition-all
```

### Filter Chip

```
px-6 py-3
rounded-full
text-[10px] font-black uppercase tracking-widest
border
Active: bg-black text-white border-black
Inactive: bg-white text-gray-400 border-gray-100 hover:border-gray-300
```

### Input Field

```
w-full
bg-[#F9F9F9]
border-none
rounded-2xl
px-6 py-4
text-sm
focus:ring-1 ring-black
```

### Category Label (Pink)

```
text-[10px]
font-black
tracking-[0.5em] ~ tracking-[0.8em]
text-[#FF4D8D]
uppercase italic
mb-6 ~ mb-12
```

### Match Score Badge

```
absolute top-4 right-4
bg-black text-white
px-3 py-1
rounded-full
text-[8px] font-black
uppercase
shadow-lg
```

### Toggle Switch

```
w-12 h-6 rounded-full p-1
Active: bg-[#FF4D8D]
Inactive: bg-gray-200
Knob: w-4 h-4 bg-white rounded-full shadow-sm
Animation: spring stiffness 500, damping 30
```

### Dark Section

```
bg-black text-white
rounded-[6rem]
py-40
overflow-hidden relative
Ambient light: bg-[#FF4D8D]/10 blur-[100px] (absolute, opacity-10)
```

---

## 7. Animation Language

### Framer Motion Variants

| 이름 | 설정 | 용도 |
|------|------|------|
| **containerVariants** | `staggerChildren: 0.1, delayChildren: 0.1` | 페이지/섹션 진입 |
| **itemVariants** | `y: 30 → 0, opacity: 0 → 1, duration: 1, ease: [0.16, 1, 0.3, 1]` | 개별 요소 진입 |
| **pulseVariants** | `scale: 1 → 1.05, opacity: 0.8 → 1, duration: 2, repeat: Infinity, repeatType: reverse` | 대기 상태 아이콘 |

### Hover Interactions

| 대상 | 효과 |
|------|------|
| 카드 | `whileHover={{ y: -5 }}` 또는 `whileHover={{ scale: 1.02 }}` |
| CTA 버튼 | `whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }}` |
| 로고 | `whileHover={{ scale: 1.05 }}` |
| 이미지 (CSS) | `group-hover:scale-110 transition-all duration-[1.5s]` |
| 화살표 아이콘 | `group-hover:translate-x-1` ~ `group-hover:translate-x-2` |

### Spring Config

| 용도 | stiffness | damping |
|------|-----------|---------|
| Toggle 전환 | 500 | 30 |
| Card hover | 400 | 17 |

### CSS Animations

| 이름 | 효과 | 용도 |
|------|------|------|
| `@keyframes scan` | `top: 0% → 100%`, opacity fade in/out | 분석 진행 시 스캔 라인 |
| `animate-pulse` | Tailwind 기본 pulse | "Decoding DNA..." 로딩 텍스트 |

### Transition Rules

1. **색상 전환**: `transition-all duration-500` (느린 럭셔리 전환)
2. **레이아웃**: `transition-all` (기본 300ms)
3. **이미지 그레이스케일**: `duration-700` ~ `duration-[1.5s]` (극도로 느린 reveal)
4. **페이지 전환**: `AnimatePresence mode="wait"` (한 화면이 완전히 사라진 후 다음 등장)

---

## 8. Image Treatment

| 상태 | 처리 |
|------|------|
| 기본 | `grayscale opacity-80` |
| Hover | `grayscale-0 scale-110` (컬러 reveal + 줌) |
| 오버레이 | `bg-gradient-to-t from-black/60 via-transparent to-transparent` |
| 스캔 중 | `opacity-50 grayscale` + scan animation |
| 프레임 장식 | 코너에 `border-t-2 border-r-2 border-[#FF4D8D]/20` 절대위치 |

---

## 9. Icon System

| 라이브러리 | Lucide React |
|-----------|-------------|
| 기능 아이콘 크기 | `22px` ~ `32px` |
| 인라인 아이콘 크기 | `10px` ~ `14px` |
| 네비게이션 아이콘 | `18px` ~ `20px` |
| 장식 아이콘 (초대형) | `64px` ~ `800px` (strokeWidth 0.5, opacity 10%) |
| 색상 규칙 | 기본: `text-gray-300~400`, 액센트: `text-[#FF4D8D]`, hover: `text-black` |

---

## 10. Responsive Strategy

| Breakpoint | 주요 변화 |
|------------|----------|
| 기본 (모바일) | 단일 컬럼, px-6, 햄버거 메뉴 |
| `md:` | 2컬럼 그리드, 제품 2열 |
| `lg:` | 풀 네비게이션 표시, px-12, Hero 텍스트 확대, 12컬럼 그리드 활용 |

### Mobile-specific

- 네비게이션: `lg:hidden` 햄버거 → 풀스크린 오버레이 (AnimatePresence)
- 타이틀: `text-6xl` → `lg:text-8xl` 등 반응형 타이포
- 업로드: `grid-cols-2` 유지 (모바일에서도 나란히)

---

## 11. Design Principles (요약)

1. **White Space is Luxury** — 여백을 아끼지 않는다. 섹션 간격 32~40 유지.
2. **Curve, Never Sharp** — 모든 요소에 큰 radius. 직각은 브랜드에 맞지 않음.
3. **Monochrome + One Accent** — 흑백 베이스에 `#FF4D8D` 하나만 터치.
4. **Uppercase Everything** — 라벨, 버튼, 태그는 무조건 대문자. 권위감.
5. **Slow Reveal** — 빠른 애니메이션 금지. 0.5~1.5초의 느린 전환.
6. **Grayscale → Color** — 이미지는 흑백이 기본, hover로 컬러 공개.
7. **Scientific Naming** — "Settings"이 아니라 "System Settings". "Analysis"가 아니라 "Diagnostic Report".
