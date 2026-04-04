# CLAUDE.md — Reloc Store

## Project
NestJS + Next.js monorepo for a PS Store top-up cards online store.

## Commands

```bash
# Development
npm run dev                           # Start both api and web
cd apps/api && npm run dev            # API only (port 3001)
cd apps/web && npm run dev            # Web only (port 3000)

# Database
cd apps/api
npx prisma migrate dev                # Create and apply migrations
npx prisma db seed                    # Seed test data
npx prisma studio                     # Visual DB editor (port 5555)
npx prisma generate                   # Regenerate Prisma client

# Testing
cd apps/api && npm test               # Unit tests
cd apps/api && npm run test:cov       # Coverage report
cd apps/api && npm run test:e2e       # E2E tests
cd apps/web && npm test               # Frontend tests

# Docker
docker compose up postgres redis -d  # Start infrastructure
docker compose up -d                 # Start everything (full profile)
docker compose down                  # Stop all
docker compose logs -f api           # Tail API logs
```

## Architecture

### Backend (apps/api/src/)
- `auth/` — JWT authentication + bcrypt
- `products/` — catalog CRUD + full-text search + homepage sections
- `categories/` — category management + reorder
- `cart/` — Redis-backed cart + **Smart Cart Algorithm** (critical business logic)
- `orders/` — order lifecycle (PENDING→PAID→DELIVERED→COMPLETED)
- `codes/` — top-up code inventory + CSV import + auto-delivery
- `payments/` — YooKassa SBP integration (mock when keys missing)
- `webhooks/` — payment webhook handler + auto-delivery pipeline
- `admin/` — analytics + management endpoints (admin-only)
- `common/` — guards, interceptors, filters, DTOs

### Frontend (apps/web/src/)
- `app/(store)/` — public storefront pages
- `app/admin/` — admin panel (protected by middleware)
- `components/product/` — ProductCard, ProductCarousel, ProductGrid, PriceTag
- `components/cart/` — CartItem, SmartCartSummary, MiniCart
- `components/checkout/` — 3-step checkout flow
- `components/catalog/` — FilterPanel, SortDropdown, RegionSwitcher
- `components/layout/` — Header, Footer, MobileMenu, Breadcrumbs
- `components/admin/` — DataTable, StatCard, CsvImportZone, StatusBadge
- `lib/store/` — Zustand stores (cart, region)
- `lib/hooks/` — React Query hooks

## Key Business Logic

### Smart Cart Algorithm (apps/api/src/cart/smart-cart.service.ts)
Converts game prices to top-up card denominations. Uses greedy approach:
1. Sum all game prices in regional currency
2. Apply largest-denomination-first greedy selection
3. Handle overshoot (round up to nearest denomination)
4. Convert to RUB via ExchangeRate × (1 + margin/100)

TRY denominations: [50, 100, 200, 500, 1000, 2000]
INR denominations: [500, 1000, 2000, 5000, 10000]
UAH denominations: [100, 200, 500, 1000, 2000, 5000]

### Auto-delivery Pipeline (apps/api/src/webhooks/delivery.service.ts)
1. YooKassa webhook → payment.succeeded event
2. `autoDeliver(orderId)` called
3. Reserve available codes from inventory
4. If codes available: DELIVERED + send email
5. If no codes: PROCESSING + alert operator

### Exchange Rate Formula
`price_in_rub = price_in_foreign × rateToRub × (1 + margin / 100)`

## Environment Variables

Critical vars that enable/disable features:
- `YOOKASSA_SHOP_ID` + `YOOKASSA_SECRET_KEY` → real payments (mock if missing)
- `EMAIL_HOST` → real email delivery (console log if missing)
- `NEXT_PUBLIC_YANDEX_METRIKA_ID` → analytics (skipped if missing)
- `NEXT_PUBLIC_SENTRY_DSN` → error tracking (skipped if missing)

## Admin access
URL: /admin
Default: admin@reloc.ru / Admin123! (from seed data)

## Git conventions
- Atomic commits per logical change
- Prefix: feat/fix/chore/docs/test/refactor
- No `--no-verify` unless breaking build is acceptable

## Code quality
- All backend DTOs must use class-validator
- All API responses wrapped by TransformInterceptor: {data, success, message}
- Admin routes: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(UserRole.ADMIN)
- Mock external services when env vars not set (YooKassa, email)
