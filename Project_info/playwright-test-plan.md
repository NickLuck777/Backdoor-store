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

## Info Pages Tests

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 9 | FAQ page loads | Navigate to /support | FAQ accordion visible with 8+ questions |
| 10 | FAQ accordion | Click a question | Answer expands smoothly |
| 11 | FAQ search | Type "аккаунт" in search | Filters to matching questions |
| 12 | About page | Navigate to /about | Stats and mission visible |
| 13 | Contacts page | Navigate to /contacts | Contact info and form visible |
| 14 | Privacy page | Navigate to /privacy | Full policy text rendered |
| 15 | Terms page | Navigate to /terms | Full terms text rendered |
| 16 | 404 page | Navigate to /nonexistent | Custom 404 page shows |

## Admin Panel Tests

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 17 | Admin login | Navigate to /admin → enter credentials → submit | Redirected to /admin dashboard |
| 18 | Dashboard loads | Log in as admin | Stat cards show sales, orders, users |
| 19 | Products table | /admin/products | Table with products, search works |
| 20 | Create product | /admin/products → "Создать" → fill form → save | Product appears in table |
| 21 | Orders table | /admin/orders | Orders table with filters |
| 22 | Order detail | Click order in table | Order detail with items and status |
| 23 | Code inventory | /admin/codes | Inventory by denomination/currency |
| 24 | CSV code import | /admin/codes/import → upload CSV → import | Success message with counts |
| 25 | Exchange rates | /admin/rates | Rates table, inline edit works |

## Changelog
| Date | Description |
|------|-------------|
| 2026-04-04 | Initial test plan created by frontend agent (cart/checkout flows) |
| 2026-04-04 | Info pages tests added by infopages agent |
| 2026-04-04 | Admin panel tests added (tests 17-25) |
