import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyState } from "@/data/demo";
import { dateKey, daysAgoKey } from "@/lib/calculations";
import { STORAGE_KEY } from "@/lib/storage";
import NutritionPage from "@/pages/NutritionPage";
import { AppProvider } from "@/state/AppContext";

/** Карточка по заголовку секции — на странице много одинаковых полей ввода. */
const cardByHeading = (name: string | RegExp): HTMLElement => {
  const heading = screen.getByRole("heading", { name });
  const card = heading.closest("section");
  if (!card) throw new Error(`Не найдена карточка «${String(name)}»`);
  return card;
};

const renderPage = (stored = createEmptyState()) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={["/nutrition"]}>
        <NutritionPage />
      </MemoryRouter>
    </AppProvider>,
  );
};

describe("страница питания", () => {
  beforeEach(() => window.localStorage.clear());

  it("добавляет продукт в дневник и пересчитывает итоги дня", async () => {
    const user = userEvent.setup();
    renderPage();

    const searchCard = cardByHeading("Добавить продукт");
    await user.type(within(searchCard).getByPlaceholderText("Например, курица или рис"), "Овсянка");
    await user.click(within(searchCard).getByRole("button", { name: /Овсянка/ }));

    const amount = within(searchCard).getByLabelText(/Количество/);
    await user.clear(amount);
    await user.type(amount, "200");
    await user.click(within(searchCard).getByRole("button", { name: "Добавить в дневник" }));

    expect(screen.getByRole("button", { name: "Удалить Овсянка" })).toBeInTheDocument();
    expect(screen.getByText("760")).toBeInTheDocument();
    expect(within(cardByHeading("Сегодня")).getByText("1 записей")).toBeInTheDocument();
  });

  it("фильтрует базу продуктов по запросу", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const searchCard = cardByHeading("Добавить продукт");
    await user.type(within(searchCard).getByPlaceholderText("Например, курица или рис"), "творог");

    const results = container.querySelector(".food-results");
    expect(results).not.toBeNull();
    expect(within(results as HTMLElement).getByText("Творог 5%")).toBeInTheDocument();
    expect(within(results as HTMLElement).queryByText("Куриная грудка")).not.toBeInTheDocument();
  });

  it("сохраняет пользовательский продукт и находит его поиском", async () => {
    const user = userEvent.setup();
    renderPage();

    const customCard = cardByHeading("Создать позицию");
    await user.type(within(customCard).getByLabelText("Название"), "Мой протеин");
    await user.type(within(customCard).getByLabelText(/Калории/), "400");
    await user.click(within(customCard).getByRole("button", { name: "Сохранить продукт" }));

    const searchCard = cardByHeading("Добавить продукт");
    await user.clear(within(searchCard).getByPlaceholderText("Например, курица или рис"));
    await user.type(within(searchCard).getByPlaceholderText("Например, курица или рис"), "Мой протеин");
    await user.click(within(searchCard).getByRole("button", { name: /Мой протеин/ }));

    expect(within(searchCard).getByLabelText("Продукт")).toHaveValue("Мой протеин");
  });

  it("учитывает калории алкоголя отдельно от макросов", async () => {
    const user = userEvent.setup();
    renderPage();

    const alcoholCard = cardByHeading("Алкоголь");
    await user.clear(within(alcoholCard).getByLabelText("Объём, мл"));
    await user.type(within(alcoholCard).getByLabelText("Объём, мл"), "330");
    await user.click(within(alcoholCard).getByRole("button", { name: "Добавить напиток" }));

    // 330 мл × 12.5 % × 0.789 × 7.1 ≈ 231 ккал
    const summary = document.querySelector(".nutrition-mini");
    expect(summary).not.toBeNull();
    expect(within(summary as HTMLElement).getByText("231 ккал")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Удалить Красное вино" })).toBeInTheDocument();
  });
});

describe("вкусняшки и алкоголь", () => {
  beforeEach(() => window.localStorage.clear());

  it("без серии чистых дней показывает лестницу и подсказку", () => {
    renderPage();

    const card = cardByHeading("Серия чистых дней закрыта");
    expect(card.querySelectorAll(".treat-ladder > span")).toHaveLength(9);
    expect(within(card).getByText(/Отметь день без джанк-фуда/)).toBeInTheDocument();
  });

  it("открывает вкусняшку за серию и записывает её в перекус", async () => {
    const user = userEvent.setup();
    const state = createEmptyState();
    state.meals = [0, 1].map((daysAgo) => ({
      id: `meal-${daysAgo}`,
      date: daysAgoKey(daysAgo),
      meal: "breakfast" as const,
      name: "Овсянка",
      amountG: 100,
      calories: 380,
      protein: 13,
      fat: 7,
      carbs: 62,
      sugar: 1,
      source: "database" as const,
      junkFood: false,
    }));
    renderPage(state);

    const card = cardByHeading(/Серия 2 дня/);
    expect(card.querySelectorAll(".treat-ladder > span.is-reached")).toHaveLength(2);

    const treat = card.querySelector(".treat-card") as HTMLElement;
    await user.click(within(treat).getByRole("button", { name: "Съесть и записать" }));

    expect(within(card).getByRole("status")).toHaveTextContent("добавлено в перекус");
    expect(screen.getByRole("button", { name: /Удалить .* вкусняшка/ })).toBeInTheDocument();
  });

  it("считает, сколько прогресса стоит алкоголь", async () => {
    const state = createEmptyState();
    state.alcohol = [{ id: "wine", date: dateKey(), name: "Красное вино", volumeMl: 500, abv: 12.5, calories: 700 }];
    renderPage(state);

    const card = cardByHeading("Алкоголь");
    expect(within(card).getByText("дни прогресса")).toBeInTheDocument();
    expect(within(card).getByText("−2.8")).toBeInTheDocument();
    expect(within(card).getByText(/отнимают|стоят/)).toBeInTheDocument();
    expect(card.querySelector(".stagnation-card")?.className).toMatch(/is-(none|watch|risk)/);
  });
});
