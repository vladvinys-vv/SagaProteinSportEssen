# SagaProteinSportEssen

Protein Sports Nutrition E-Commerce Platform — built for the German market with i18n support.

**Part of [Auto Company](https://github.com/vladvinys-vv/auto-company)** — AI agents building profitable software 24/7.

## Tech Stack

- **React 19** with modern hooks (useActionState, useOptimistic, use)
- **TypeScript** with strict typing
- **Tailwind CSS v4** with native CSS variables
- **Vite** + Rolldown for fast builds
- **i18next** for i18n (German/English, RTL-ready)
- **Vitest** + **Playwright** for testing

## Getting Started

```bash
npm install
npm run dev
```

## Development

```bash
npm run typecheck   # TypeScript validation
npm run lint        # Biome linting
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

## Structure

```
src/
├── app/          # App shell (layout, router, providers)
├── pages/        # Route components
├── components/   # Reusable UI components
├── features/     # Domain features (catalog, cart, checkout)
├── hooks/        # Custom React hooks
├── lib/          # Utilities and helpers
└── types/        # Shared TypeScript types
```

## License

Private — part of Auto Company ecosystem.
