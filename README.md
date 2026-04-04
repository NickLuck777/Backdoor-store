# Reloc Store

Магазин PlayStation Store кодов пополнения — клон reloc.ru.

## Что это

Online store для продажи кодов пополнения PS Store (Турция, Индия, Украина).
Пользователь выбирает игры → корзина автоматически рассчитывает нужные карты пополнения → оплачивает через СБП → получает коды мгновенно.

## Стек

| Слой | Технология |
|------|-----------|
| Backend | NestJS 10 + TypeScript |
| ORM | Prisma + PostgreSQL 16 |
| Cache | Redis 7 |
| Frontend | Next.js 14 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| Оплата | YooKassa API (SBP) |
| Email | Nodemailer / Resend |

## Структура монорепо

```
reloc-store/
├── apps/
│   ├── api/          # NestJS backend (порт 3001)
│   └── web/          # Next.js frontend (порт 3000)
├── packages/
│   └── shared/       # Общие типы и константы
├── docker-compose.yml
└── .env.example
```

## Быстрый старт

### 1. Требования
- Node.js 20+
- Docker + Docker Compose

### 2. Клонирование и настройка

```bash
git clone https://github.com/NickLuck777/reloc-store.git
cd reloc-store
cp .env.example .env
```

### 3. Запуск инфраструктуры

```bash
docker compose up postgres redis -d
```

### 4. Установка зависимостей

```bash
npm install
```

### 5. Миграции и сид данные

```bash
cd apps/api
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
cd ../..
```

### 6. Запуск

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs
- Admin: http://localhost:3000/admin (login: admin@reloc.ru / Admin123!)

## API ключи (нужны для полной функциональности)

| Сервис | Переменная | Где получить |
|--------|-----------|-------------|
| YooKassa | `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` | yookassa.ru → Личный кабинет |
| Email (SMTP) | `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` | Gmail App Password или Resend |
| Resend | `RESEND_API_KEY` | resend.com |
| Yandex.Metrika | `NEXT_PUBLIC_YANDEX_METRIKA_ID` | metrika.yandex.ru |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` | sentry.io |

**Без этих ключей сервис работает в mock-режиме:** оплата симулируется, email пишется в консоль.

## Тестирование

```bash
# Backend unit tests
cd apps/api && npm run test

# Backend test coverage
cd apps/api && npm run test:cov

# E2E tests
cd apps/api && npm run test:e2e

# Frontend tests
cd apps/web && npm test
```

## Smart Cart Algorithm

Ключевая бизнес-логика: при добавлении игры корзина автоматически считает нужные карты пополнения.

```
Игра стоит 700 TL:
→ 500 TL карта (1 шт) + 200 TL карта (1 шт) = 700 TL точно
→ В рублях: 500 TL × 2.8 × 1.15 = 1610 ₽ + 200 TL × 2.8 × 1.15 = 644 ₽ = 2254 ₽
```

Алгоритм: жадный поиск с номиналами [50, 100, 200, 500, 1000, 2000] TL.

## Деплой

```bash
# Собрать production образы
docker compose --profile full build

# Запустить всё
docker compose --profile full up -d
```

Nginx reverse proxy нужно настроить отдельно на VPS.

## Архитектура

```
[User] → [Next.js :3000] → [NestJS API :3001]
                                    ↓
                     [PostgreSQL] [Redis] [YooKassa] [Email]
                                    ↓
                              [Admin Panel /admin]
```

## Фазы разработки

- **Phase 0** ✅ — Монорепо, Docker, Prisma schema, seed data
- **Phase 1** ✅ — NestJS REST API (products, cart, orders, codes, payments)
- **Phase 2** ✅ — Next.js storefront (каталог, поиск, карточки товаров)
- **Phase 3** ✅ — Корзина, checkout, оплата SBP, доставка кодов
- **Phase 4** ✅ — Информационные страницы (FAQ, О нас, Контакты, Политика)
- **Phase 5** ✅ — Админ-панель (продукты, заказы, коды, аналитика)
- **Phase 7** ✅ — SEO, Schema.org, sitemap, Yandex.Metrika
- **Phase 8** 🔄 — E2E тесты (Playwright)
