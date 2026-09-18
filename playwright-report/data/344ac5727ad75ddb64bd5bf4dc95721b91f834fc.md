# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> SagaProteinSportEssen Homepage >> language switcher works
- Location: e2e/homepage.spec.ts:22:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Deutsch' })

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
        - link "Mehr erfahren" [ref=e37] [cursor=pointer]:
          - /url: /about
    - region "Deine Vorteile" [ref=e38]:
      - generic [ref=e39]:
        - generic [ref=e40]: Free shipping from €49
        - generic [ref=e48]: 24h dispatch
        - generic [ref=e53]: 100% quality guarantee
        - generic [ref=e59]: Email support 24/7
    - generic [ref=e65]:
      - generic [ref=e66]:
        - generic [ref=e67]:
          - paragraph [ref=e68]: Kollektion
          - heading "Shop by Category" [level=2] [ref=e69]
        - link "Alle ansehen" [ref=e70] [cursor=pointer]:
          - /url: /products
      - generic [ref=e73]:
        - link "W Whey Protein" [ref=e74] [cursor=pointer]:
          - /url: /products?category=whey
          - generic [ref=e75]:
            - generic [ref=e76]: W
            - generic [ref=e77]: Whey Protein
        - link "P Plant Proteins" [ref=e78] [cursor=pointer]:
          - /url: /products?category=plant
          - generic [ref=e79]:
            - generic [ref=e80]: P
            - generic [ref=e81]: Plant Proteins
        - link "C Casein" [ref=e82] [cursor=pointer]:
          - /url: /products?category=casein
          - generic [ref=e83]:
            - generic [ref=e84]: C
            - generic [ref=e85]: Casein
        - link "B Protein Bars" [ref=e86] [cursor=pointer]:
          - /url: /products?category=bar
          - generic [ref=e87]:
            - generic [ref=e88]: B
            - generic [ref=e89]: Protein Bars
    - generic [ref=e90]:
      - generic [ref=e91]:
        - generic [ref=e92]:
          - paragraph [ref=e93]: Beliebt bei Athleten
          - heading "Best Sellers" [level=2] [ref=e94]
        - link "Alle ansehen" [ref=e95] [cursor=pointer]:
          - /url: /products
      - generic [ref=e96]:
        - article [ref=e97]:
          - link "W Bestseller 4.8 (1,247) Whey Protein Schokolade 24g Protein | 22 Geschmacksrichtungen | Lieferant für Profis" [ref=e98] [cursor=pointer]:
            - /url: /products/whey-protein-schokolade
            - generic [ref=e99]:
              - generic [ref=e100]: W
              - generic [ref=e101]: Bestseller
            - generic [ref=e102]:
              - generic [ref=e103]:
                - generic [aria-hidden] [ref=e104]: ★
                - generic [ref=e105]: "4.8"
                - generic [ref=e106]: (1,247)
              - heading "Whey Protein Schokolade" [level=3] [ref=e107]
              - paragraph [ref=e108]: 24g Protein | 22 Geschmacksrichtungen | Lieferant für Profis
          - generic [ref=e109]:
            - generic [ref=e110]: 29.99 €
            - button "In den Korb" [ref=e111]
        - article [ref=e112]:
          - link "P Bestseller 4.6 (892) Pflanzliches Protein Vanille 22g pflanzliches Protein | Vegane Variante | Vanille" [ref=e113] [cursor=pointer]:
            - /url: /products/pflanzliches-protein-vanille
            - generic [ref=e114]:
              - generic [ref=e115]: P
              - generic [ref=e116]: Bestseller
            - generic [ref=e117]:
              - generic [ref=e118]:
                - generic [aria-hidden] [ref=e119]: ★
                - generic [ref=e120]: "4.6"
                - generic [ref=e121]: (892)
              - heading "Pflanzliches Protein Vanille" [level=3] [ref=e122]
              - paragraph [ref=e123]: 22g pflanzliches Protein | Vegane Variante | Vanille
          - generic [ref=e124]:
            - generic [ref=e125]: 34.99 €
            - button "In den Korb" [ref=e126]
        - article [ref=e127]:
          - link "P 4.5 (521) Proteinriegel Schokolade (12er) 20g Protein pro Riegel | 12er Packung | Lieferant für unterwegs" [ref=e128] [cursor=pointer]:
            - /url: /products/proteinriegel-schokolade-12er
            - generic [ref=e129]: P
            - generic [ref=e131]:
              - generic [ref=e132]:
                - generic [aria-hidden] [ref=e133]: ★
                - generic [ref=e134]: "4.5"
                - generic [ref=e135]: (521)
              - heading "Proteinriegel Schokolade (12er)" [level=3] [ref=e136]
              - paragraph [ref=e137]: 20g Protein pro Riegel | 12er Packung | Lieferant für unterwegs
          - generic [ref=e138]:
            - generic [ref=e139]: 24.99 €
            - button "In den Korb" [ref=e140]
  - contentinfo [ref=e141]:
    - generic [ref=e142]:
      - generic [ref=e143]:
        - generic [ref=e144]:
          - link "SAGA PROTEIN" [ref=e145] [cursor=pointer]:
            - /url: /
          - paragraph [ref=e146]: Premium protein for athletes.
        - generic [ref=e147]:
          - heading "Company" [level=3] [ref=e148]
          - list [ref=e149]:
            - listitem [ref=e150]:
              - link "About" [ref=e151] [cursor=pointer]:
                - /url: /about
            - listitem [ref=e152]:
              - link "Contact" [ref=e153] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e154]:
              - link "Imprint" [ref=e155] [cursor=pointer]:
                - /url: /imprint
            - listitem [ref=e156]:
              - link "Privacy" [ref=e157] [cursor=pointer]:
                - /url: /privacy
        - generic [ref=e158]:
          - heading "Service" [level=3] [ref=e159]
          - list [ref=e160]:
            - listitem [ref=e161]:
              - link "Products" [ref=e162] [cursor=pointer]:
                - /url: /products
            - listitem [ref=e163]:
              - link "Cart" [ref=e164] [cursor=pointer]:
                - /url: /cart
            - listitem [ref=e165]:
              - link "Shipping" [ref=e166] [cursor=pointer]:
                - /url: /checkout
            - listitem [ref=e167]:
              - link "Returns" [ref=e168] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e169]:
          - heading "Legal" [level=3] [ref=e170]
          - list [ref=e171]:
            - listitem [ref=e172]:
              - link "Terms" [ref=e173] [cursor=pointer]:
                - /url: /imprint
            - listitem [ref=e174]:
              - link "Privacy" [ref=e175] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e176]: "VAT ID: DE123456789"
      - paragraph [ref=e178]: © 2026 SAGA PROTEIN. All rights reserved.
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
  18 |     await page.getByRole("link", { name: "Produkte" }).click();
  19 |     await expect(page).toHaveURL("/products");
  20 |   });
  21 | 
  22 |   test("language switcher works", async ({ page }) => {
  23 |     await page.goto("/");
  24 |     const switcher = page.getByRole("button", { name: "Deutsch" });
> 25 |     await switcher.click();
     |                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
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