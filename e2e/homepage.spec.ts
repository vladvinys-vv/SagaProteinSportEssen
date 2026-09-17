import { test, expect } from "@playwright/test";
import { getViolations, injectAxe } from "axe-playwright";

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
    await page.getByRole("navigation").getByRole("link", { name: "Produkte" }).click();
    await expect(page).toHaveURL("/products");
  });

  test("language switcher works", async ({ page }) => {
    await page.goto("/");
    const switcher = page.getByRole("button", { name: "Deutsch" });
    await switcher.click();
    await page.getByRole("button", { name: "English" }).click();
    await expect(page.getByRole("navigation").getByRole("link", { name: "Products" })).toBeVisible();
  });

  test("accessibility check", async ({ page }) => {
    await page.goto("/");
    await injectAxe(page);
    const violations = await getViolations(page);
    expect(violations).toEqual([]);
  });

  test("catalog loads and filters products", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByRole("heading", { name: "Alle Produkte" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Whey Protein Schokolade/ })).toBeVisible();

    await page.getByRole("button", { name: "Pflanzliche Proteine", exact: true }).click();
    await expect(page.getByRole("link", { name: /Pflanzliches Protein Vanille/ })).toBeVisible();
    await expect(page.getByText("1 Produkt")).toBeVisible();
  });

  test("add to cart and complete checkout", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("button", { name: /In den Warenkorb/ }).first().click();

    await expect(page.getByRole("dialog", { name: "Warenkorb" })).toBeVisible();
    await page.getByRole("button", { name: "Zur Kasse" }).click();
    await expect(page).toHaveURL("/checkout");

    await page.getByLabel("E-Mail").fill("athlete@example.com");
    await page.getByLabel("Vorname").fill("Alex");
    await page.getByLabel("Nachname").fill("Meyer");
    await page.getByLabel("Straße und Hausnummer").fill("Sportweg 1");
    await page.getByLabel("Postleitzahl").fill("10115");
    await page.getByLabel("Stadt").fill("Berlin");
    await page.getByLabel("Ich akzeptiere die AGB und habe die Datenschutzerklärung gelesen.").check();
    await page.getByRole("button", { name: "Kostenpflichtig bestellen" }).click();

    await expect(page.getByRole("heading", { name: "Vielen Dank!" })).toBeVisible();
    await expect(page.getByText(/SAGA-2026-001/)).toBeVisible();
  });
});
