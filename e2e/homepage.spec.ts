import { getViolations, injectAxe } from "axe-playwright";
import { test, expect } from "@playwright/test";

test.describe("SagaProteinSportEssen Homepage", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SAGA Protein/i);
  });

  test("hero section is visible", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByRole("heading", { name: /Natürliche Proteine/i });
    await expect(hero).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Produkte" }).first().click();
    await expect(page).toHaveURL("/products");
  });

  test("language switcher works", async ({ page }) => {
    await page.goto("/");
    const switcher = page.getByRole("banner").getByRole("button", { name: /Deutsch/ }).first();
    await switcher.click();
    await page.getByRole("banner").getByRole("button", { name: /English/ }).first().click();
    await expect(page.getByRole("banner").getByRole("link", { name: "Products" }).first()).toBeVisible();
  });

  test("accessibility check", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").waitFor();
    await page.getByRole("heading", { level: 1 }).waitFor();
    await injectAxe(page);
    const violations = await getViolations(page);
    expect(violations).toEqual([]);
  });
});

test.describe("Catalog and product flow", () => {
  test("filters products and adds a variant to the cart", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Alle Produkte" })).toBeVisible();

    await page.getByLabel("Suchen").fill("Whey");
    await expect(page.getByRole("heading", { name: "Whey Protein Schokolade" })).toBeVisible();
    await page.getByRole("link", { name: "Whey Protein Schokolade", exact: true }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Whey Protein Schokolade" })).toBeVisible();
    await page.getByRole("button", { name: /1 kg/ }).click();
    await page.getByRole("button", { name: /In den Warenkorb/ }).click();

    const drawer = page.getByRole("dialog", { name: "Warenkorb" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("29,99 €").last()).toBeVisible();
  });
});

test.describe("Cart and checkout flow", () => {
  test("persists cart and completes the demo checkout", async ({ page }) => {
    await page.goto("/products/whey-protein-schokolade");
    await page.getByRole("button", { name: /In den Warenkorb/ }).click();
    await page.getByRole("dialog", { name: "Warenkorb" }).getByRole("button", { name: "Schließen" }).click();
    await page.reload();

    await expect(page.getByRole("button", { name: "Warenkorb" })).toContainText("1");
    await page.goto("/cart");
    await page.getByRole("button", { name: "Menge erhöhen" }).click();
    await page.getByRole("link", { name: "Zur Kasse" }).click();

    await page.getByLabel("Name").fill("Max Mustermann");
    await page.getByLabel("E-Mail").fill("max@example.de");
    await page.getByLabel("Straße").fill("Musterstraße");
    await page.getByLabel("Hausnummer").fill("1");
    await page.getByLabel("PLZ").fill("10115");
    await page.getByLabel("Stadt").fill("Berlin");
    await page.getByLabel("Bundesland").fill("Berlin");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Kostenpflichtig bestellen/ }).click();

    await expect(page.getByRole("heading", { name: "Danke für Deine Bestellung!" })).toBeVisible();
    await expect(page.getByText(/SAGA-\d/)).toBeVisible();
  });
});
