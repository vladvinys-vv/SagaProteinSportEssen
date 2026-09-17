# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> SagaProteinSportEssen Homepage >> navigation links work
- Location: e2e/homepage.spec.ts:16:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Produkte' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e5]:
      - link "SAGA PROTEIN" [ref=e7] [cursor=pointer]:
        - /url: /
      - navigation [ref=e8]:
        - link "Home" [ref=e9] [cursor=pointer]:
          - /url: /
        - link "Products" [ref=e10] [cursor=pointer]:
          - /url: /products
        - link "About" [ref=e11] [cursor=pointer]:
          - /url: /about
        - link "Contact" [ref=e12] [cursor=pointer]:
          - /url: /contact
      - generic [ref=e13]:
        - button "Cart" [ref=e14]
        - button "🇬🇧 English" [ref=e19]:
          - generic [ref=e20]: 🇬🇧
          - generic [ref=e21]: English
  - main [ref=e24]:
    - generic [ref=e29]:
      - paragraph [ref=e30]: Premium Sportnahrung
      - heading "Natural Proteins for Your Success" [level=1] [ref=e31]
      - paragraph [ref=e32]: Premium Whey, plant proteins & sports nutrition – direct from manufacturer.
      - generic [ref=e33]:
        - link "Shop Now" [ref=e34] [cursor=pointer]:
          - /url: /products
        - link "Mehr erfahren" [ref=e38] [cursor=pointer]:
          - /url: /about
    - region "Deine Vorteile" [ref=e39]:
      - generic [ref=e40]:
        - generic [ref=e41]: Free shipping from €49
        - generic [ref=e50]: 24h dispatch
        - generic [ref=e55]: 100% quality guarantee
        - generic [ref=e61]: Email support 24/7
    - generic [ref=e67]:
      - generic [ref=e68]:
        - generic [ref=e69]:
          - paragraph [ref=e70]: Kollektion
          - heading "Shop by Category" [level=2] [ref=e71]
        - link "Alle ansehen" [ref=e72] [cursor=pointer]:
          - /url: /products
      - generic [ref=e76]:
        - link "W Whey Protein" [ref=e77] [cursor=pointer]:
          - /url: /products?category=whey
          - generic [ref=e78]:
            - generic [ref=e79]: W
            - generic [ref=e80]: Whey Protein
        - link "P Plant Proteins" [ref=e81] [cursor=pointer]:
          - /url: /products?category=plant
          - generic [ref=e82]:
            - generic [ref=e83]: P
            - generic [ref=e84]: Plant Proteins
        - link "C Casein" [ref=e85] [cursor=pointer]:
          - /url: /products?category=casein
          - generic [ref=e86]:
            - generic [ref=e87]: C
            - generic [ref=e88]: Casein
        - link "B Protein Bars" [ref=e89] [cursor=pointer]:
          - /url: /products?category=bar
          - generic [ref=e90]:
            - generic [ref=e91]: B
            - generic [ref=e92]: Protein Bars
    - generic [ref=e93]:
      - generic [ref=e94]:
        - generic [ref=e95]:
          - paragraph [ref=e96]: Beliebt bei Athleten
          - heading "Best Sellers" [level=2] [ref=e97]
        - link "Alle ansehen" [ref=e98] [cursor=pointer]:
          - /url: /products
      - generic [ref=e99]:
        - article [ref=e100]:
          - link "W Bestseller 4.8 (1,247) Whey Protein Schokolade 24g Protein | 22 Geschmacksrichtungen | Lieferant für Profis" [ref=e101] [cursor=pointer]:
            - /url: /products/whey-protein-schokolade
            - generic [ref=e102]:
              - generic [ref=e103]: W
              - generic [ref=e104]: Bestseller
            - generic [ref=e105]:
              - generic [ref=e106]:
                - generic [aria-hidden] [ref=e107]: ★
                - generic [ref=e108]: "4.8"
                - generic [ref=e109]: (1,247)
              - heading "Whey Protein Schokolade" [level=3] [ref=e110]
              - paragraph [ref=e111]: 24g Protein | 22 Geschmacksrichtungen | Lieferant für Profis
          - generic [ref=e112]:
            - generic [ref=e113]: 29.99 €
            - button "In den Korb" [ref=e114]
        - article [ref=e115]:
          - link "P Bestseller 4.6 (892) Pflanzliches Protein Vanille 22g pflanzliches Protein | Vegane Variante | Vanille" [ref=e116] [cursor=pointer]:
            - /url: /products/pflanzliches-protein-vanille
            - generic [ref=e117]:
              - generic [ref=e118]: P
              - generic [ref=e119]: Bestseller
            - generic [ref=e120]:
              - generic [ref=e121]:
                - generic [aria-hidden] [ref=e122]: ★
                - generic [ref=e123]: "4.6"
                - generic [ref=e124]: (892)
              - heading "Pflanzliches Protein Vanille" [level=3] [ref=e125]
              - paragraph [ref=e126]: 22g pflanzliches Protein | Vegane Variante | Vanille
          - generic [ref=e127]:
            - generic [ref=e128]: 34.99 €
            - button "In den Korb" [ref=e129]
        - article [ref=e130]:
          - link "P 4.5 (521) Proteinriegel Schokolade (12er) 20g Protein pro Riegel | 12er Packung | Lieferant für unterwegs" [ref=e131] [cursor=pointer]:
            - /url: /products/proteinriegel-schokolade-12er
            - generic [ref=e132]: P
            - generic [ref=e134]:
              - generic [ref=e135]:
                - generic [aria-hidden] [ref=e136]: ★
                - generic [ref=e137]: "4.5"
                - generic [ref=e138]: (521)
              - heading "Proteinriegel Schokolade (12er)" [level=3] [ref=e139]
              - paragraph [ref=e140]: 20g Protein pro Riegel | 12er Packung | Lieferant für unterwegs
          - generic [ref=e141]:
            - generic [ref=e142]: 24.99 €
            - button "In den Korb" [ref=e143]
  - contentinfo [ref=e144]:
    - generic [ref=e145]:
      - generic [ref=e146]:
        - generic [ref=e147]:
          - link "SAGA PROTEIN" [ref=e148] [cursor=pointer]:
            - /url: /
          - paragraph [ref=e149]: Premium protein for athletes.
        - generic [ref=e150]:
          - heading "Company" [level=3] [ref=e151]
          - list [ref=e152]:
            - listitem [ref=e153]:
              - link "About" [ref=e154] [cursor=pointer]:
                - /url: /about
            - listitem [ref=e155]:
              - link "Contact" [ref=e156] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e157]:
              - link "Imprint" [ref=e158] [cursor=pointer]:
                - /url: /imprint
            - listitem [ref=e159]:
              - link "Privacy" [ref=e160] [cursor=pointer]:
                - /url: /privacy
        - generic [ref=e161]:
          - heading "Service" [level=3] [ref=e162]
          - list [ref=e163]:
            - listitem [ref=e164]:
              - link "Products" [ref=e165] [cursor=pointer]:
                - /url: /products
            - listitem [ref=e166]:
              - link "Cart" [ref=e167] [cursor=pointer]:
                - /url: /cart
            - listitem [ref=e168]:
              - link "Shipping" [ref=e169] [cursor=pointer]:
                - /url: /checkout
            - listitem [ref=e170]:
              - link "Returns" [ref=e171] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e172]:
          - heading "Legal" [level=3] [ref=e173]
          - list [ref=e174]:
            - listitem [ref=e175]:
              - link "Terms" [ref=e176] [cursor=pointer]:
                - /url: /imprint
            - listitem [ref=e177]:
              - link "Privacy" [ref=e178] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e179]: "VAT ID: DE123456789"
      - paragraph [ref=e181]: © 2026 SAGA PROTEIN. All rights reserved.
  - generic [aria-hidden]:
    - dialog:
      - generic:
        - heading [level=2]:
          - text: Warenkorb
          - generic: (0)
        - button
      - generic:
        - generic:
          - paragraph: Ihr Warenkorb ist leer
          - paragraph: Entdecken Sie unsere Produkte und stellen Sie Ihren Warenkorb zusammen.
          - button: Produkte entdecken
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { getViolations } from "axe-playwright";
  3  | 
  4  | test.describe("SagaProteinSportEssen Homepage", () => {
  5  |   test("has correct title", async ({ page }) => {
  6  |     await page.goto("/");
  7  |     await expect(page).toHaveTitle(/SAGA Protein/i);
  8  |   });
  9  | 
  10 |   test("hero section is visible", async ({ page }) => {
  11 |     await page.goto("/");
  12 |     const hero = page.getByRole("heading", { name: /Natürliche Proteine/i });
  13 |     await expect(hero).toBeVisible();
  14 |   });
  15 | 
  16 |   test("navigation links work", async ({ page }) => {
  17 |     await page.goto("/");
> 18 |     await page.getByRole("link", { name: "Produkte" }).click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  19 |     await expect(page).toHaveURL("/products");
  20 |   });
  21 | 
  22 |   test("language switcher works", async ({ page }) => {
  23 |     await page.goto("/");
  24 |     const switcher = page.getByRole("button", { name: "Deutsch" });
  25 |     await switcher.click();
  26 |     await page.getByRole("button", { name: "English" }).click();
  27 |     await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
  28 |   });
  29 | 
  30 |   test("accessibility check", async ({ page }) => {
  31 |     await page.goto("/");
  32 |     const violations = await getViolations(page);
  33 |     expect(violations).toEqual([]);
  34 |   });
  35 | });
  36 | 
```