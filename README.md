# Форма — дневник питания и тренировок

Локальное PWA-приложение для контроля состава тела: норма калорий по MET-активности,
дневник питания, учёт алкоголя, наблюдение за ценами, тренировочные программы с
автопрогрессией и аналитика прогресса. Всё считается в браузере — данные не покидают
устройство, есть офлайн-режим. Ценовой слой настроен под немецкий рынок: сети Гамбурга
(Aldi Nord, Lidl, Penny, Netto, Kaufland, Rewe, Edeka, Alnatura, denn's Biomarkt,
Fischmarkt, dm, Budni, Myprotein) и цены в евро.

## Возможности

- **Сводка дня** — калории, макросы, белок на кг, шаги, MET-разбор 24 часов.
- **Питание** — база продуктов, поиск, штрихкоды, свои продукты, пресеты приёмов пищи,
  рекомендации продуктов и рецептов под цель и ценовую категорию, дневник по дням.
- **Алкоголь и стагнация** — пресеты привычных порций (0,5 л пильзнера, 0,5 л радлера,
  0,2 л вина, 0,2 л глинтвейна) записывают напиток одним тапом; калории этанола
  (объём × крепость × 0.789 × 7.1) учитываются в дневной сумме и adherence, но не искажают макросы еды; отдельная карточка показывает,
  на сколько дней напитки отодвигают цель (70 ккал за порцию, 7700 ккал на кг жира) и как
  часто они мешают прогрессу.
- **Вкусняшки за серию чистых дней** — лестница 1 → 2 → 3 → 5 → 7 → 10 → 14 → 21 → 30 дней
  без джанк-фуда открывает десерт на 120…900 ккал; приложение подбирает то, что впишется
  в остаток дня по калориям и белку, и записывает выбор в перекус.
- **Цены и магазины** — ручные наблюдения цен по сетям Гамбурга (подсказки магазинов и
  город по умолчанию), сравнение в пересчёте на 100 г/100 мл в евро, разброс и экономия
  по корзине, рейтинг «где дешевле всего» и «где изысканнее всего» (индекс к лучшей цене).
  В демо — 10 базовых позиций немецкой корзины (грудка, овсянка, лосось, рис, квак,
  йогурт, протеин, молоко, яйца, яблоки) и 72 наблюдения по 13 сетям.
- **Тренировки** — 4 встроенные программы (5/3/1, Juggernaut, PPL, Starting Strength),
  конструктор популярных систем (5/3/1 и Juggernaut с максимумами по движениям, режимом,
  аксессуаром FSL/BBB и разгрузками) — подходы с процентами и рабочими весами сразу
  подставляются в журнал, плюс конструктор собственной программы и рекомендация
  следующего рабочего веса.
- **Аналитика** — графики веса/калорий/белка за 7/14/30 дней, adherence, детектор плато,
  авто-коррекция нормы с историей изменений, экспорт и импорт JSON.
- **Быстрый доступ** — нижняя панель из пяти разделов (Сводка, Питание, Тренировки, Цены,
  Профиль) и кнопка быстрых действий: продукт, алкоголь, вкусняшка, подход, замер веса —
  с прокруткой и фокусом в нужном поле.
- **PWA** — установка на устройство, офлайн-оболочка через service worker, экспорт данных.

## Стек

React 19 · TypeScript (strict) · Vite 6 · React Router 7 · lucide-react · Vitest +
Testing Library · Playwright (+ axe) · Biome.

## Быстрый старт

```bash
npm install
npm run dev          # http://localhost:3100
```

## Скрипты

```bash
npm run verify       # типы + линт + юнит-тесты + сборка (то же, что делает CI)
npm run typecheck    # tsc --noEmit
npm run lint         # biome check src/ tests/ e2e/
npm run lint:write   # авто-исправления линта и импортов
npm run test         # Vitest: lib/, storage, страницы
npm run test:coverage
npm run build        # прод-сборка в dist/
npm run preview      # локальный предпросмотр сборки
npm run test:e2e:install  # браузеры Playwright (chromium, firefox)
npm run test:e2e     # сквозные сценарии (оболочка, PWA/офлайн, питание, тренировки, профиль)
npm run test:a11y    # axe-core по всем маршрутам (включая /prices)
```

## Структура

```
src/
├── App.tsx            # маршруты и обязательный онбординг
├── components/        # UI-кит, каркас, онбординг
├── pages/             # Сводка, Питание, Тренировки, Аналитика, Цены, Профиль, 404
├── lib/               # расчёты домена, инсайты, конструктор программ, localStorage
├── hooks/             # useFocusSection — переход к секции из быстрых действий
├── data/demo.ts       # база продуктов, рецепты, программы, цены Гамбурга, демо- и пустое состояние
├── state/AppContext   # состояние приложения + автосохранение
├── types/             # доменные типы (AppState и расчётные структуры)
└── styles/index.css   # тёмная тема, токены, адаптив
public/
├── sw.js              # офлайн-оболочка (network-first для навигации)
├── manifest.webmanifest
└── icons/             # PWA-иконки 192/512/maskable/apple-touch
e2e/                   # Playwright: flows + PWA + axe
tests/                 # Vitest: расчёты, хранилище, демо-данные, страницы
```

## Как считаются нормы

1. Основной обмен (Миффлин–Сан Жеор): `10·вес + 6.25·рост − 5·возраст ± 5/−161`.
2. Расход = `BMR / 24 × Σ(часы × MET)`, где MET: сон 1.0, сидя 1.3, стоя 2.0, тренировка 6.0.
3. Норма = расход + цель (набор +300, сушка −450, поддержание/рекомпозиция 0) + ручная коррекция.
4. Авто-коррекция предлагает ±250 ккал, если фактическое недельное изменение веса расходится
   с ожидаемым больше чем на 0.25 кг. Каждое изменение попадает в историю коррекций.

## Немецкий рынок

- Магазины и цены — из Гамбурга: дискаунтеры (Aldi Nord, Lidl, Penny, Netto, Kaufland),
  полный ассортимент (Rewe, Edeka), био-маркеты (Alnatura, denn's Biomarkt), Fischmarkt,
  drogerie (dm, Budni) и онлайн-спортпит (Myprotein).
- Валюта по умолчанию — евро, суммы показываются в немецком формате (`1.234,56 €`).
  В форме наблюдения валюту можно переключить на рубли или доллары.
- Демо-цены — ориентир 2025 года за упаковку типового немецкого размера (500 г овсянки,
  250 г лосося, 1 кг риса, 1000 г протеина, 1 л молока, 10 яиц), поэтому «экономия»
  считается по кассе, а сравнение — за 100 г.
- Сохранения со старым московским демо переезжают автоматически: если цены так и остались
  нетронутым демо (те же сети, всё в рублях), они заменяются на гамбургские, а валюта
  профиля становится евро. Свои наблюдения миграция не трогает — она срабатывает только
  на полном совпадении со старым демо.

## Цены, вкусняшки и алкоголь

- Поле «Цена» можно не заполнять: без неё продукт живёт в дневнике как обычно.
- Цены вводятся вручную в разделе «Цены» (продукт, магазин, упаковка, вес) — приложение
  не ходит в интернет за прайсами, поэтому сравнение остаётся локальным.
- Лестница вкусняшек растёт только за дни, где есть записи еды и нет джанк-фуда; серия
  обнуляется, как только день пропущен или отмечен джанк.
- Стагнация от алкоголя считается по недельному объёму: до 7 порций — наблюдение,
  от 7 — «мешает», от 14 или 5 порций в один день — «риск».

## Данные и приватность

Состояние лежит в `localStorage` под ключом `forma-state-v1` (`AppState.version`).
Экспорт/импорт — обычный JSON-файл, поэтому данные переносятся между браузерами
и устройствами вручную. Полный сброс — в «Профиле» и «Аналитике».

## 🇩🇪 German API Integrations

Forma integrates with official German public APIs for enhanced functionality:

| API | Purpose | Auth | Integration |
|---|---|---|---|
| [OpenPlz API](https://openplzapi.org/de/Localities) | German postal codes for store finder | No | Location-based store suggestions |
| [Feiertage API](https://feiertage-api.de/api/?jahr=2026) | Official holidays by Bundesland | No | Holiday-aware training/nutrition plans |
| [BrightSky / DWD](https://api.brightsky.dev/) | German Weather Service data | No | Weather-aware outdoor training |
| [OpenRegister (Handelsregister)](https://openregister.de/api) | 4M+ German companies for store verification | `apiKey` | Supermarket chain entity verification |
| [Bundestag DIP API](https://dip.bundestag.de/ueber-dip/hilfe/api) | Consumer protection laws, food regulations | No | Regulatory compliance for food data |
| [Gesetze im Internet](https://www.gesetze-im-internet.de/) | BGB, LFGB, LMIV (food info regulation) | No | Legal reference for labeling |
| [Verbraucherzentrale APIs](https://www.verbraucherzentrale.de/) | Consumer price monitoring, food alerts | No | Price comparison, recall alerts |

> **Note:** APIs marked with `apiKey` require environment variables in `.env`.

## 🤖 AI Agent Skills Integration

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
Add to agent config (`.claude/settings.json`, `kilo.jsonc`):
```json
{
  "mcpServers": {
    "browser": "browser-use/browser-use",
    "openregister": "openregister/openregister-sdk",
    "bundestag": "local-bundestag-api"
  }
}
```

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

## CI/CD

- `.github/workflows/ci.yml` — типы, линт, юнит-тесты, сборка, затем Playwright (chromium, firefox)
  с публикацией отчёта.
- `.github/workflows/deploy.yml` — прод-деплой на Vercel через официальный CLI
  (нужны секреты `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).
- `vercel.json` — SPA-rewrites, immutable-кэш ассетов, no-cache для `sw.js`.

## Лицензия

Private — часть экосистемы Auto Company.
