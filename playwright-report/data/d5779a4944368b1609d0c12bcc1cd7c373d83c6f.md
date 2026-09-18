# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> SagaProteinSportEssen Homepage >> hero section is visible
- Location: e2e/homepage.spec.ts:10:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Natürliche Proteine/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /Natürliche Proteine/i }) with timeout 5000ms
  - waiting for getByRole('heading', { name: /Natürliche Proteine/i })

```

```yaml
- banner:
  - link "SAGA PROTEIN":
    - /url: /
  - navigation:
    - link "Home":
      - /url: /
    - link "Products":
      - /url: /products
    - link "About":
      - /url: /about
    - link "Contact":
      - /url: /contact
  - button "Cart":
    - img
  - button "🇬🇧 English":
    - text: 🇬🇧 English
    - img
- main:
  - paragraph: Premium Sportnahrung
  - heading "Natural Proteins for Your Success" [level=1]
  - paragraph: Premium Whey, plant proteins & sports nutrition – direct from manufacturer.
  - link "Shop Now":
    - /url: /products
  - link "Mehr erfahren":
    - /url: /about
  - region "Deine Vorteile": Free shipping from €49 24h dispatch 100% quality guarantee Email support 24/7
  - paragraph: Kollektion
  - heading "Shop by Category" [level=2]
  - link "Alle ansehen":
    - /url: /products
  - link "W Whey Protein":
    - /url: /products?category=whey
  - link "P Plant Proteins":
    - /url: /products?category=plant
  - link "C Casein":
    - /url: /products?category=casein
  - link "B Protein Bars":
    - /url: /products?category=bar
  - paragraph: Beliebt bei Athleten
  - heading "Best Sellers" [level=2]
  - link "Alle ansehen":
    - /url: /products
  - article:
    - link "W Bestseller 4.8 (1,247) Whey Protein Schokolade 24g Protein | 22 Geschmacksrichtungen | Lieferant für Profis":
      - /url: /products/whey-protein-schokolade
      - text: W Bestseller 4.8 (1,247)
      - heading "Whey Protein Schokolade" [level=3]
      - paragraph: 24g Protein | 22 Geschmacksrichtungen | Lieferant für Profis
    - text: 29.99 €
    - button "In den Korb"
  - article:
    - link "P Bestseller 4.6 (892) Pflanzliches Protein Vanille 22g pflanzliches Protein | Vegane Variante | Vanille":
      - /url: /products/pflanzliches-protein-vanille
      - text: P Bestseller 4.6 (892)
      - heading "Pflanzliches Protein Vanille" [level=3]
      - paragraph: 22g pflanzliches Protein | Vegane Variante | Vanille
    - text: 34.99 €
    - button "In den Korb"
  - article:
    - link "P 4.5 (521) Proteinriegel Schokolade (12er) 20g Protein pro Riegel | 12er Packung | Lieferant für unterwegs":
      - /url: /products/proteinriegel-schokolade-12er
      - text: P 4.5 (521)
      - heading "Proteinriegel Schokolade (12er)" [level=3]
      - paragraph: 20g Protein pro Riegel | 12er Packung | Lieferant für unterwegs
    - text: 24.99 €
    - button "In den Korb"
- contentinfo:
  - link "SAGA PROTEIN":
    - /url: /
  - paragraph: Premium protein for athletes.
  - heading "Company" [level=3]
  - list:
    - listitem:
      - link "About":
        - /url: /about
    - listitem:
      - link "Contact":
        - /url: /contact
    - listitem:
      - link "Imprint":
        - /url: /imprint
    - listitem:
      - link "Privacy":
        - /url: /privacy
  - heading "Service" [level=3]
  - list:
    - listitem:
      - link "Products":
        - /url: /products
    - listitem:
      - link "Cart":
        - /url: /cart
    - listitem:
      - link "Shipping":
        - /url: /checkout
    - listitem:
      - link "Returns":
        - /url: /contact
  - heading "Legal" [level=3]
  - list:
    - listitem:
      - link "Terms":
        - /url: /imprint
    - listitem:
      - link "Privacy":
        - /url: /privacy
    - listitem: "VAT ID: DE123456789"
  - paragraph: © 2026 SAGA PROTEIN. All rights reserved.
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
> 13 |     await expect(hero).toBeVisible();
     |                        ^ Error: expect(locator).toBeVisible() failed
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