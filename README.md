# ProfitPilot AI

> Оптимизатор юнит-экономики для маркетплейсов Wildberries и Ozon в реальном времени.

![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff)
![License](https://img.shields.io/badge/License-Proprietary-red)

## Возможности

- **Расчёт юнит-экономики** — автоматический расчёт маржи, себестоимости и прибыли по каждому SKU
- **AI-рекомендации** — интеллектуальные рекомендации по ценообразованию
- **Репрайсер** — автоматическая корректировка цен для максимальной прибыли
- **Биддер** — управление рекламными ставками
- **Аналитика конкурентов** — мониторинг цен и стратегий конкурентов
- **Интеграция с WB + Ozon** — подключение через API маркетплейсов
- **Работа по SKU/артикулу** — ручной ввод без необходимости API
- **CSV импорт/экспорт** — массовая загрузка и выгрузка товаров
- **Подписочная модель** — Standard / Pro / Enterprise с ЮKassa
- **Админ-панель** — MRR, пользователи, подписки, настройки
- **Демо-режим** — доступ к демо-данным без регистрации

## Стек технологий

| Технология | Назначение |
|---|---|
| React 18 + TypeScript | Frontend SPA |
| Vite 5 | Сборщик |
| Tailwind CSS + shadcn/ui | UI-фреймворк |
| Recharts | Графики и диаграммы |
| MetaGPTx Web SDK | Backend-as-a-Service |
| ЮKassa | Платежи |
| Vitest | Unit-тестирование |
| Docker + nginx | Контейнеризация |
| GitHub Actions | CI/CD |

## Быстрый старт

### Требования

- Node.js ≥ 20
- pnpm ≥ 9

### Установка

```bash
git clone https://github.com/Ronin0ff/Californnia.git
cd Californnia
cp .env.example .env
pnpm install
```

### Разработка

```bash
pnpm dev        # Запуск dev-сервера (http://localhost:3000)
pnpm build      # Production-сборка
pnpm preview    # Превью production-сборки
pnpm test       # Запуск тестов (watch mode)
pnpm test:run   # Запуск тестов (однократно)
pnpm lint       # ESLint
pnpm typecheck  # TypeScript проверка типов
```

### Docker

```bash
docker-compose up --build       # Запуск в контейнере
# → http://localhost:3000
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_API_BASE_URL` | URL бэкенд-сервера | `http://127.0.0.1:8000` |
| `VITE_OWNER_EMAILS` | Email владельцев (через запятую) | — |
| `VITE_YUKASSA_SHOP_ID` | ID магазина ЮKassa | — |
| `VITE_YUKASSA_RETURN_URL` | URL возврата после оплаты | — |
| `VITE_METAGPTX_APP_ID` | ID приложения MetaGPTx | — |

## Архитектура

```
src/
├── __tests__/              # Unit-тесты (Vitest)
├── api/                    # API клиенты (settings)
├── components/             # React-компоненты
│   ├── ui/                 # shadcn/ui библиотека
│   ├── AppLayout.tsx       # Основной layout (mobile responsive)
│   ├── AdminLayout.tsx     # Layout админ-панели
│   ├── CookieConsent.tsx   # Cookie-баннер (152-ФЗ)
│   ├── OnboardingTour.tsx  # Онбординг для новых пользователей
│   ├── SubscriptionGuard.tsx # Защита роутов по подписке
│   └── ThemeProvider.tsx   # Тёмная/светлая тема
├── contexts/
│   ├── AuthContext.tsx      # Аутентификация + RBAC
│   └── DemoModeContext.tsx  # Демо-режим
├── lib/
│   ├── marketplace-api.ts  # CRUD API для SKU, маркетплейсов
│   ├── plan-limits.ts      # Лимиты по тарифам
│   ├── config.ts           # Runtime конфигурация
│   └── auth.ts             # HTTP API клиент
├── pages/
│   ├── Landing.tsx          # Лендинг с тарифами и FAQ
│   ├── Demo.tsx             # Демо-режим
│   ├── Dashboard.tsx        # Главный дашборд
│   ├── SkuManagement.tsx    # Управление SKU
│   ├── Pricing.tsx          # Страница тарифов
│   ├── PrivacyPolicy.tsx    # Политика конфиденциальности
│   ├── TermsOfService.tsx   # Пользовательское соглашение
│   └── admin/               # Админ-панель (6 страниц)
└── App.tsx                  # Маршрутизация + Guards
```

### RBAC (Role-Based Access Control)

| Роль | Доступ |
|---|---|
| **Owner** | Все функции + админ-панель |
| **Client (Enterprise)** | Все функции + команда |
| **Client (Pro)** | Все функции кроме команды |
| **Client (Standard)** | Дашборд, SKU, калькулятор, алерты, интеграции |
| **Manager** | Настраиваемые права |

### Тарифные планы

| | Standard | Pro | Enterprise |
|---|---|---|---|
| Цена/мес | 2 500 ₽ | 4 990 ₽ | 19 990 ₽ |
| Макс. SKU | 10 | 50 | ∞ |
| AI-рекомендации | — | ✓ | ✓ |
| Репрайсер | — | ✓ | ✓ |
| Биддер | — | ✓ | ✓ |
| Команда | — | — | ✓ |

## Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий на [vercel.com/import](https://vercel.com/import)
2. Настройки:
   - **Framework**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
3. Добавьте переменные окружения
4. Deploy

### Docker

```bash
docker build -t profitpilot .
docker run -p 3000:80 profitpilot
```

## Тестирование

```bash
pnpm test:run   # 21 тест — бизнес-логика, permissions, plan limits
```

## Безопасность

- RBAC с тарифными ограничениями
- Сумма оплаты определяется на сервере (не на клиенте)
- CSP headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Cookie consent (152-ФЗ compliance)
- Политика конфиденциальности и Пользовательское соглашение
- Нет hardcoded секретов в коде

## Лицензия

Proprietary. Все права защищены © 2026 ProfitPilot AI.
