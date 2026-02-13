# Stripe Integration — Progress Tracker

> Last updated: 2026-02-13 — **ALL TASKS COMPLETE**

## Summary

14개 작업 **전부 완료**. 240 tests pass, lint clean, build success.

---

## All Commits

| # | Task | Commit | Description |
|---|------|--------|-------------|
| 1 | Install @stripe/stripe-js | `afc264d` | `@stripe/stripe-js@^8.7.0` 설치 + `.env.local.example`에 `VITE_STRIPE_PUBLISHABLE_KEY` 추가 |
| 2 | Order type + Stripe config | `28223e2` | `Order` 인터페이스에 shipping/stripe 필드 추가 + `src/lib/stripe.ts` 생성 |
| 3 | orderService.ts | `ef8420e` | Supabase/localStorage 듀얼패스 주문 서비스 |
| 4 | paymentService.ts | `8407183` | Stripe Checkout Session 생성 + Edge Function 호출 |
| 5 | Supabase Edge Functions | `16f460e` | `create-checkout-session` + `stripe-webhook` |
| 6 | Refactor cartStore | `1135ac4` | orders 제거, cart-only 로직으로 축소 |
| 7 | GlobalCheckoutView | `6aef127` | Stripe redirect + localStorage fallback + isProcessing |
| 8 | CheckoutSuccessView | `0545350` | 결제 완료 확인 페이지 |
| 9 | App.tsx routing | `5b4ea98` | `/checkout/success` 라우트 추가 |
| 10 | OrdersView | `17c7f3a` | cartStore → orderService 전환 |
| 11 | i18n strings | `2bfbdcf` | `processing`, `redirectingToStripe` 추가 |
| 12 | Service tests | `a00a476` | orderService + paymentService 테스트 |
| 13 | View tests update | (committed by subagent) | OrdersView + GlobalCheckoutView 테스트 수정 |
| 14 | Lint fix + verification | `9c27fb8` | CheckoutSuccessView useEffect lint fix |

---

## Remaining Manual Steps (Supabase Dashboard)

1. **Create `orders` table** via SQL Editor (schema in design doc)
2. **Deploy Edge Functions**: `supabase functions deploy create-checkout-session` + `supabase functions deploy stripe-webhook`
3. **Set secrets**: `supabase secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_...`
4. **Configure Stripe webhook** at dashboard.stripe.com → Developers → Webhooks
5. **Add `VITE_STRIPE_PUBLISHABLE_KEY`** to `.env.local`

## Plan & Design Docs

- Implementation plan: `docs/plans/2026-02-13-stripe-integration.md`
- Design document: `docs/plans/2026-02-13-stripe-integration-design.md`
