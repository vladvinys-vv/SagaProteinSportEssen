import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", name: "Сводка" },
  { path: "/nutrition", name: "Питание" },
  { path: "/workouts", name: "Тренировки" },
  { path: "/analytics", name: "Аналитика" },
  { path: "/prices", name: "Цены" },
  { path: "/profile", name: "Профиль" },
];

test.describe("Доступность", () => {
  for (const route of routes) {
    test(`${route.name}: нет критичных нарушений axe`, async ({ page }) => {
      await page.goto(route.path);
      // Онбординг нового профиля перекрывает страницу — закрываем его.
      const close = page.getByRole("button", { name: "Закрыть" });
      if (await close.count()) await close.first().click();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const critical = results.violations.filter((violation) => violation.impact === "critical");
      expect(
        critical.map((violation) => `${violation.id}: ${violation.nodes.length} узлов`),
        JSON.stringify(results.violations, null, 2),
      ).toEqual([]);
    });
  }
});
