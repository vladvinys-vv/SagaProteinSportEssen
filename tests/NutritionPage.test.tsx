import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyState } from "@/data/demo";
import { STORAGE_KEY } from "@/lib/storage";
import NutritionPage from "@/pages/NutritionPage";
import { AppProvider } from "@/state/AppContext";

/** Карточка по заголовку секции — на странице много одинаковых полей ввода. */
const cardByHeading = (name: string): HTMLElement => {
  const heading = screen.getByRole("heading", { name });
  const card = heading.closest("section");
  if (!card) throw new Error(`Не найдена карточка «${name}»`);
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
