# Playwright Test Plan

## Cart Flow Tests

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Add to cart | Go to catalog → click product → click "Купить" | CartBadge shows count=1, toast "Добавлено в корзину" |
| 2 | View cart | Click CartBadge → click "Перейти в корзину" | Cart page shows added game and smart cart breakdown |
| 3 | Remove from cart | Cart page → click X on item | Item removed, count decremented |
| 4 | Smart cart calculation | Add 700 TL game → view cart | Smart cart shows "500 TL + 200 TL" breakdown |
| 5 | Checkout step navigation | Cart → "Оформить заказ" | Checkout page shows step 1 |
| 6 | Contact form validation | Step 2 → enter invalid email → submit | Error message shown, cannot proceed |
| 7 | Full checkout (mock payment) | Complete all 3 steps → "Оплатить" | Payment processing page shown |
| 8 | Order success page | Navigate to /order/success?orderNumber=REL-20260404-001 | Success page with codes shown |

## Changelog
| Date | Description |
|------|-------------|
| 2026-04-04 | Initial test plan created by frontend agent |
