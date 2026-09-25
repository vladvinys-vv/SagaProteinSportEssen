# Форма — питание и тренировки

Локальное PWA для учёта питания, тренировок и прогресса. Все данные хранятся
только в браузере (localStorage), работают офлайн через service worker.

**Part of [Auto Company](https://github.com/vladvinys-vv/auto-company)** — AI agents building profitable software 24/7.

## Возможности

- **Дашборд** — калории, белок и движение за сегодня, серия дней без джанк-фуда
- **Питание** — дневник приёмов пищи, локальная база продуктов, ручной ввод штрихкодов,
  свои продукты, пресеты, учёт алкоголя, рецепты и подбор продуктов под цель и цены
- **Тренировки** — программы 5/3/1, Juggernaut, PPL, Starting Strength,
  конструктор своих программ, журнал подходов с авторасчётом прогрессии
- **Аналитика** — графики веса/калорий/белка, adherence, детектор плато,
  авто-коррекция нормы
- **Профиль** — цели, MET-активность 24 часов, замеры веса, экспорт/импорт JSON
- **PWA** — manifest, service worker, работа офлайн

## Tech Stack

- **React 19** + **TypeScript** (strict)
- **Vite 6** + React Router 7 + Lucide icons
- **Vitest** + **Playwright** для тестирования
- **Biome** для литинга

## Getting Started

```bash
npm ci
npm run dev      # http://localhost:3100
```

## Development

```bash
npm run typecheck   # TypeScript validation
npm run lint        # Biome linting
npm run test        # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright, нужны браузеры: npx playwright install)
npm run build       # Production build в dist/
```

## Structure

```
src/
├── App.tsx         # Роуты + онбординг
├── main.tsx        # Точка входа + регистрация service worker
├── components/     # Layout, Onboarding, UI-примитивы
├── pages/          # Dashboard, Nutrition, Workout, Analytics, Profile
├── data/           # База продуктов, рецепты, программы, демо-состояние
├── lib/            # Расчёты (BMR/MET/макросы/adherence), storage
├── state/          # AppContext (глобальное состояние + localStorage)
├── styles/         # index.css
└── types/          # TypeScript-типы предметной области
public/
├── manifest.webmanifest
└── sw.js           # Кэширование app shell для офлайна
```

## License

Private — part of Auto Company ecosystem.
