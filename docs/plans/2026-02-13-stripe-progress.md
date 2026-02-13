# Stripe Integration — Progress Tracker

> Last updated: 2026-02-13

## Summary

14개 작업 중 **5개 완료**, **9개 남음**.

---

## Completed (Tasks 1-5)

| # | Task | Commit | Description |
|---|------|--------|-------------|
| 1 | Install @stripe/stripe-js | `afc264d` | `@stripe/stripe-js@^8.7.0` 설치 + `.env.local.example`에 `VITE_STRIPE_PUBLISHABLE_KEY` 추가 |
| 2 | Order type + Stripe config | `28223e2` | `Order` 인터페이스에 `shippingName?`, `shippingCountry?`, `shippingAddress?`, `stripeSessionId?` 추가 + `src/lib/stripe.ts` 생성 |
| 3 | orderService.ts | `ef8420e` | `src/services/orderService.ts` — Supabase/localStorage 듀얼패스 주문 서비스 (fetchOrders, createLocalOrder, getOrderBySessionId) |
| 4 | paymentService.ts | `8407183` | `src/services/paymentService.ts` — Stripe Checkout Session 생성 + Edge Function 호출 |
| 5 | Supabase Edge Functions | `16f460e` | `supabase/functions/create-checkout-session/index.ts` + `supabase/functions/stripe-webhook/index.ts` |

## Remaining (Tasks 6-14)

| # | Task | Files | Description |
|---|------|-------|-------------|
| **6** | **Refactor cartStore** | `src/store/cartStore.ts`, `cartStore.test.ts` | orders 제거, cart-only 로직으로 축소, `clearCart()` 추가 |
| 7 | GlobalCheckoutView 수정 | `src/views/GlobalCheckoutView.tsx` | Stripe redirect + localStorage fallback, `isProcessing` 로딩 상태 |
| 8 | CheckoutSuccessView 생성 | `src/views/CheckoutSuccessView.tsx` | 결제 완료 후 확인 페이지 |
| 9 | App.tsx 라우팅 | `src/App.tsx` | `/checkout/success` 라우트 추가 |
| 10 | OrdersView 수정 | `src/views/OrdersView.tsx` | cartStore → orderService 전환, useEffect/loading 추가 |
| 11 | i18n 문자열 추가 | `src/i18n/en.json`, `ko.json` | `processing`, `redirectingToStripe` 등 |
| 12 | 서비스 테스트 작성 | `orderService.test.ts`, `paymentService.test.ts` | localStorage fallback 테스트 |
| 13 | OrdersView 테스트 수정 | `src/views/OrdersView.test.tsx` | orderService 모킹으로 전환 |
| 14 | 최종 검증 | — | `vitest run` + `lint` + `build` 전체 통과 확인 |

---

## How to Resume

```
다시 시작할 때: "Stripe integration 이어서 진행해줘" 또는 "Task 6부터 시작해"
```

**Task 6이 핵심 전환점** — cartStore에서 orders를 분리하면 Tasks 7-10이 새 구조 위에서 동작합니다.

## Plan & Design Docs

- Implementation plan: `docs/plans/2026-02-13-stripe-integration.md`
- Design document: `docs/plans/2026-02-13-stripe-integration-design.md`
