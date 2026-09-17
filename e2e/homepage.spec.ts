import { test, expect } from "@playwright/test";
import { getViolations } from "axe-playwright";

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
    await page.getByRole("link", { name: "Produkte" }).click();
    await expect(page).toHaveURL("/products");
  });

  test("language switcher works", async ({ page }) => {
    await page.goto("/");
    const switcher = page.getByRole("button", { name: "Deutsch" });
    await switcher.click();
    await page.getByRole("button", { name: "English" }).click();
    await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
  });

  test("accessibility check", async ({ page }) => {
    await page.goto("/");
    const violations = await getViolations(page);
    expect(violations).toEqual([]);
  });
});
