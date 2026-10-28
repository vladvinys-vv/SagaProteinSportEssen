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

## AI Agent Skills & MCP Integration (2026)

### Recommended Skill Collections
```bash
# Skill management
npm install -g @skillkit/cli && skillkit init
skillkit recommend

# React 19 / Tailwind v4 / PWA skills
npx skills add PyModel/react-frontend-skills -s react,tailwind,pwa
npx skills add seb1n/awesome-ai-agent-skills --skill react,pwa,nutrition

# Security scan before install
npm install -g @nvidia/skillspector
skillspector scan <repo-url>
```

### MCP Server Configuration
Configure in agent settings (`.claude/settings.json`, `kilo.jsonc`):
```json
{
  "mcpServers": {
    "browser": "browser-use/browser-use",
    "openregister": "openregister/openregister-sdk",
    "bundestag": "local-bundestag-api"
  }
}
```

### German API Integration Points
| API | MCP/REST | Use Case | Config |
|---|---|---|---|
| OpenPlz | REST | Location-based store suggestions | No auth |
| Feiertage | REST | Holiday-aware training/nutrition plans | No auth |
| BrightSky/DWD | REST | Weather-aware outdoor training | No auth |
| OpenRegister | REST + SDK | Supermarket chain entity verification | `OPENREGISTER_API_KEY` |
| Bundestag DIP | REST | Consumer protection, food regulations | No auth |
| Gesetze im Internet | REST | Legal reference (LFGB, LMIV) | No auth |

### Subagent Delegation (Kilo Multi-Agent)
Use native `task(agent="...", ...)` for specialized work:
- `task(agent="architect", ...)` — Before new modules, localStorage schema changes, calculation engines
- `task(agent="debugger", ...)` — Test failures, Biome lint errors, Playwright flakiness
- `task(agent="revisor", ...)` — Pre-commit: security scan, coverage, diff analysis
- `task(agent="marketolog", ...)` — App Store optimization, German market ASO

### Verification Gates (Required per Commit)
```bash
npm run verify
# Secret scanning
npx -y gitleaks detect --no-git -v
```