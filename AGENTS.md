# Forma Fitness (SagaProteinSportEssen) — Agent Guidelines

## 1. Project Overview
"Форма" (`forma-fitness`) is a local-first offline PWA fitness application for tracking daily nutrition, MET-based caloric expenditure, strength progression, and grocery prices across German supermarket chains (Aldi Nord, Lidl, Rewe, Edeka, Netto, Penny, Alnatura, etc.).
- Offline-first: Data remains on device in localStorage/IndexedDB.
- Tech Stack: React 19, React Router 7, TypeScript, Vite 6, Biome, Vitest, Playwright (including a11y tests with Axe).

---

## 2. Directory Layout
- `src/`: Core UI components, routes, state management, calculation formulas (MET, macros, price comparison).
- `tests/`: Vitest component and logic tests.
- `e2e/`: Playwright end-to-end user flows and accessibility audits.
- `public/`: Web manifest and static icons.

---

## 3. Development Commands
```bash
npm install
npm run dev           # Start Vite dev server
npm run typecheck     # TypeScript check (tsc --noEmit)
npm run lint          # Biome lint check
npm run test          # Run Vitest test suite
npm run test:e2e      # Run Playwright tests
npm run verify        # Comprehensive check (typecheck + lint + test + build)
```

---

## 4. Google Jules Agent Integration
- **Configuration:** `.jules/config.json` specifies `gemini-2.5-pro` model, setup, and verification test commands.
- **Rules & Guardrails:** `.jules/rules.md` enforces local-first storage, MET expenditure scientific formulas, alcohol stagnation tracking, and WCAG AA accessibility standards.
- **CI/CD Automation:** `.github/workflows/jules.yml` triggers automated checks on labeled issues or pull requests.

---

## 5. Key Constraints
1. **Privacy & Offline First:** No analytics scripts or third-party tracking; all calculations must happen clientside.
2. **Accessibility Standards:** Must pass WCAG contrast and accessibility audits (`npm run test:a11y`).
3. **Branch Discipline:** Default target branch is `main`.
