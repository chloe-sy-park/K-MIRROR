# K-MIRROR AI & Inclusivity Framework

> AI 프롬프트 설계, 분석 방법론, 인종 포용성 가드레일을 정의하는 문서.
> Gemini API 프롬프트 수정 시 반드시 이 문서의 원칙을 따른다.

---

## 1. Sherlock Analysis Methodology

### 1-1. 멜라닌 지수 (Melanin Index 1-6)

피부색을 6단계로 분류한다. Fitzpatrick Scale을 기반으로 하되, K-Beauty 맥락에 맞게 재정의한다.

| Level | 이름 | 설명 | 대표 인종 범위 | K-Beauty 접근 |
|-------|------|------|---------------|--------------|
| **L1** | Porcelain | 극도로 밝은 피부, 혈관이 비침 | 북유럽, 일부 동아시아 | Glass Skin 그대로 적용 가능 |
| **L2** | Fair | 밝은 피부, 약간의 따뜻함 | 동아시아, 동유럽 | 표준 K-Beauty 레퍼런스와 가장 유사 |
| **L3** | Medium | 올리브~베이지 | 남유럽, 동남아, 라틴 | 베이스 톤 조정 필요, 발색 중간 변환 |
| **L4** | Tan | 따뜻한 갈색 | 남아시아, 중동, 라틴 | 프라이머 전략 변경, 하이라이터 재배치 |
| **L5** | Deep | 풍부한 갈색~다크 | 아프리카, 남아시아 일부 | 발색 크로마 40%+ 증가, ash 방지 필수 |
| **L6** | Rich Ebony | 매우 깊은 다크 톤 | 서아프리카, 남수단 등 | 최대 크로마 밀도, 전용 언더톤 매핑 |

### 1-2. 언더톤 (Undertone)

| 타입 | 판별 기준 | K-Beauty 적용 |
|------|----------|--------------|
| **Warm** | 금색/복숭아빛 반사, 초록 정맥 | 코럴/피치 계열 중심, 골드 하이라이터 |
| **Cool** | 분홍/파란빛 반사, 보라 정맥 | 베리/로즈 계열 중심, 실버/라벤더 하이라이터 |
| **Neutral** | 혼합, 올리브 가능 | 양쪽 모두 가능, 뮤트 톤 추천 |

### 1-3. 얼굴 비율 분석 (Facial Proportion)

세 구역의 비율을 측정한다:

| 구역 | 범위 | 이상적 K-비율 |
|------|------|-------------|
| **Upper (전두부)** | 헤어라인 ~ 눈썹 | 1.0 |
| **Middle (안와부)** | 눈썹 ~ 코끝 | 1.2 |
| **Lower (하악부)** | 코끝 ~ 턱끝 | 0.9 |

- 비율이 다르다고 "안 좋은 것"이 아님
- AI는 비율 차이를 "교정"이 아닌 "활용"으로 접근
- 예: 중안부가 긴 경우 → 블러셔 높이 조정으로 시각적 밸런스

### 1-4. 눈 각도 분류 (Canthal Tilt)

| 타입 | 각도 | 특성 | K-아이라이너 전략 |
|------|------|------|-----------------|
| **Cat-eye** | 양수 (5°+) | 외안각이 내안각보다 높음 | 각도를 강조하는 윙 라이너 |
| **Doe-eye** | 중립 (0°±3°) | 수평에 가까움 | 둥근 확장 라이너 |
| **Puppy-eye** | 음수 (-3° 이하) | 외안각이 내안각보다 낮음 | 하안검 강조, 부드러운 드롭 |

### 1-5. 골격 구조 (Bone Structure)

| 타입 | 특성 | 메이크업 전략 |
|------|------|-------------|
| **High-Definition Angular** | 광대 돌출, 턱선 선명 | Sculpted-Matte, 구조 강조 |
| **Soft-Focus Round** | 볼륨감, 부드러운 곡선 | Dewy finish, 부드러운 그라데이션 |
| **Balanced-Classic** | 중간, 균형적 | 양쪽 다 가능, 무드에 따라 전환 |

---

## 2. AI Prompt Engineering Guide

### 2-1. 현재 프롬프트 구조

```
System Instruction
├── 역할 정의: "Global K-Beauty Stylist and Face Analysis Expert"
├── 입력: 사용자 bare face + K-셀럽 영감 사진
├── 유저 프로필: environment, skill, mood, sensitivity
├── 분석 항목: tone, sherlock, style transfer, sensitivity, products, videos
└── 출력: JSON
```

### 2-2. 프롬프트 강화 필요 항목

#### 필수 추가: Bias Prevention Directives

현재 프롬프트에 없는 것들:

```
MANDATORY RULES:
1. NEVER suggest lightening or whitening the user's skin tone.
   Use "luminosity" or "radiance" instead of "brightening."
2. NEVER compare ethnic features as superior or inferior.
3. Adapt the K-celeb style TO the user's features, not the other way around.
   The user's identity is the constant; the K-style is the variable.
4. For deep skin tones (L4-L6), increase chromatic saturation of
   product colors by 30-50% to achieve equivalent visual impact.
5. Preserve the user's natural features (moles, scars, unique markings)
   in all recommendations.
6. Never use terms: "fix", "correct", "improve" for ethnic features.
   Use: "enhance", "accentuate", "harmonize".
```

#### 필수 추가: Melanin-Aware Adaptation

```
COLOR ADAPTATION RULES:
- For Melanin L1-L2: Standard K-beauty shades apply directly.
- For Melanin L3: Shift warm tones +10% saturation.
- For Melanin L4: Replace pastel shades with medium-chroma equivalents.
  Avoid gray-based foundations.
- For Melanin L5: Replace all light pastels with deep-chroma variants.
  Use gold-infused primers to counter ashiness.
- For Melanin L6: Maximum chromatic density. Berry > Coral.
  Black-Cherry > Rose. Deep Gold > Champagne.
```

#### 필수 추가: Structure-Aware Directives

```
PLACEMENT RULES:
- For prominent zygomatic arches: Place highlighter on the highest
  point, not the typical K-beauty apple position.
- For deep orbital sockets: Reduce crease color depth, focus on lid.
- For flat nasal bridges: Skip K-style nose contour; enhance brow
  bone instead.
- For full lips (common in L4-L6): Embrace fullness. Never suggest
  "thinning" techniques. Adapt K-gradient lip to full lip shape.
```

### 2-3. 프롬프트 버전 관리

| 버전 | 변경 내용 | 날짜 |
|------|----------|------|
| v1.0 | 초기 프롬프트 (현재) | - |
| v2.0 | Bias Prevention + Melanin Adaptation 추가 | 예정 |
| v3.0 | Structure-Aware + Landmark 연동 | 예정 |

---

## 3. Inclusivity Guardrails

### 3-1. 금지어 목록

| 금지 | 대체 |
|------|------|
| Whitening | Luminosity Optimization |
| Brightening (피부 맥락) | Radiance Enhancement |
| Fix your [feature] | Enhance your [feature] |
| Correct proportions | Harmonize proportions |
| Problem area | Focus area |
| Exotic | Unique / Distinctive |
| Ethnic look | Cultural aesthetic |

### 3-2. 인종별 테스트 시나리오

AI 분석 품질을 검증하기 위해 아래 시나리오를 정기적으로 테스트:

| 시나리오 | 검증 포인트 |
|----------|-----------|
| 서아프리카 여성 (L6) + Wonyoung 스타일 | 발색이 현실적인가? "밝히려" 하지 않는가? |
| 남아시아 여성 (L4) + Jennie 스타일 | 언더톤 매핑이 정확한가? |
| 동남아시아 여성 (L3) + Suzy 스타일 | 올리브 톤 고려가 되는가? |
| 백인 남성 (L1) + K-Pop 아이돌 스타일 | 성별 bias 없는가? |
| 라틴계 여성 (L3-L4) + IU 스타일 | 혼합 언더톤 처리가 적절한가? |
| 동아시아 여성 (L2) + 같은 인종 셀럽 | 과도한 변환 없이 자연스러운가? |

### 3-3. 윤리적 레드라인

아래의 경우 AI가 결과를 거부하거나 경고해야 함:

1. **피부색 변경 요청** — "나를 더 밝게/어둡게 만들어줘" → 거부
2. **인종 변환 요청** — "나를 한국인처럼 보이게 해줘" → 스타일만 적용, 인종 변환 거부
3. **차별적 비교** — 특정 인종의 결과가 "덜 아름답다"는 뉘앙스 → 차단
4. **아동 이미지** — 미성년자 메이크업 스타일링 → 거부

---

## 4. 발색 렌더링 기술 명세

### 4-1. Multiplication Blending 원리

```
결과색 = (피부색 × 제품색) / 255

예시:
피부 Hex: #8B6547 (L4 Warm)
립 제품: #FF4D8D (Brand Pink)

R: (139 × 255) / 255 = 139 → (139 × 77) / 255 ≈ 42
G: (101 × 77) / 255 ≈ 31
B: (71 × 141) / 255 ≈ 39

렌더링 결과: 핑크가 피부 위에서 딥 베리로 변환됨
```

### 4-2. 투명도 고려

- 제품 타입별 투명도 적용:
  - 틴트/글로스: opacity 30-50% → 피부결이 비침
  - 매트 립: opacity 80-95% → 거의 덮임
  - 쿠션/파운데이션: opacity 40-70% → 반투명 커버

### 4-3. 피부색 Hex 추출

- AI 이미지 분석에서 볼, 이마, 턱 3포인트의 평균 색상 추출
- 조명 보정: 하이라이트/그림자 영역 제외
- 결과: 사용자의 기본 피부 Hex Code 도출

---

## 5. 품질 체크리스트

새로운 AI 프롬프트 버전 배포 전 확인:

- [ ] L1~L6 전 레벨에서 결과가 자연스러운가?
- [ ] Warm/Cool/Neutral 언더톤별로 제품 추천이 달라지는가?
- [ ] 금지어가 결과에 포함되지 않는가?
- [ ] 동일 셀럽 스타일이 인종별로 다르게 적응되는가?
- [ ] 민감성 필터 on/off에 따라 성분이 실제로 달라지는가?
- [ ] 스킬 레벨에 따라 난이도가 조정되는가?
- [ ] "교정" 뉘앙스 없이 "강조/조화" 톤인가?
