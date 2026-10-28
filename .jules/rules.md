# Jules Agent Rules: Forma Fitness (SagaProteinSportEssen)

## Architecture & Verification
1. **Local-First & Offline Invariant:**
   - All client data remains within the user's browser (IndexedDB / localStorage).
   - Never inject telemetry, analytics, or external data collectors.
2. **Quality Gates:**
   - Pre-commit checks must pass: `npm run typecheck` (`tsc --noEmit`), `npm run lint` (`biome check src/ tests/ e2e/`), and `npm test` (`vitest run`).
   - Run `npm run verify` to test the entire build pipeline before submitting substantial changes.
3. **Fitness & Nutrition Domain Invariants:**
   - MET expenditure calculations must adhere to scientific Compendium of Physical Activities standards.
   - Maintain accurate alcohol stagnation tracking: 1g Alcohol = 7 kcal, with proper metabolic rate calculations.
   - Protein calculations must accurately reflect protein-to-caloric efficiency ratios for German grocery price comparisons.
4. **Accessibility (a11y) Standards:**
   - Must adhere to WCAG AA guidelines with high-contrast ratios (minimum 4.5:1 for normal text).
   - Touch targets must be at least 44x44px. Verify with `@axe-core/playwright` (`npm run test:a11y`).
5. **Git Discipline:**
   - Use concise conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
