import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { createDemoState } from "@/data/demo";
import { STORAGE_KEY } from "@/lib/storage";
import PricesPage from "@/pages/PricesPage";
import { AppProvider } from "@/state/AppContext";

const renderPage = () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createDemoState()));
  const view = render(
    <AppProvider>
      <MemoryRouter initialEntries={["/prices"]}>
        <PricesPage />
      </MemoryRouter>
    </AppProvider>,
  );
  return { ...view, container: view.container as HTMLElement };
};

const rowFor = (container: HTMLElement, productName: string): HTMLElement => {
  const row = [...container.querySelectorAll(".comparison-row")].find((element) => element.querySelector("strong")?.textContent === productName);
  if (!row) throw new Error(`Нет строки сравнения для «${productName}»`);
  return row as HTMLElement;
};

describe("страница цен", () => {
  beforeEach(() => window.localStorage.clear());

  it("показывает, где дешевле всего и где изысканнее всего", () => {
    const { container } = renderPage();
    expect(screen.getByRole("heading", { name: "Где дешевле, а где изысканнее" })).toBeInTheDocument();

    const chicken = rowFor(container, "Куриная грудка");
    expect(within(chicken.querySelector(".offer.is-cheapest") as HTMLElement).getByText("Лента")).toBeInTheDocument();
    expect(within(chicken.querySelector(".offer.is-priciest") as HTMLElement).getByText("Азбука вкуса")).toBeInTheDocument();
    expect(chicken.querySelector(".comparison-head small")).toHaveTextContent("разброс 137 %");
    expect(chicken.querySelector(".comparison-head small")).toHaveTextContent("экономия 520");
  });

  it("считает экономию по корзине и подсказывает лучший магазин", () => {
    const { container } = renderPage();
    const summary = container.querySelector(".summary-grid") as HTMLElement;
    expect(summary).toHaveTextContent("Продуктов в наблюдении");
    expect(summary.textContent).toMatch(/5/);
    expect(summary.textContent).toMatch(/2\s?560/);
    expect(summary).toHaveTextContent("Дикси");
    expect(summary).toHaveTextContent("+104 % к лучшей цене");
  });

  it("ранжирует магазины по кошельку", () => {
    const { container } = renderPage();
    const rows = [...container.querySelectorAll(".store-row")];
    expect(rows.length).toBeGreaterThanOrEqual(5);
    expect(rows[0]?.querySelector("strong")?.textContent).toBe("Дикси");
    expect(rows[0]?.textContent).toContain("2 из 5 побед");

    const fanciest = rows.find((row) => row.querySelector("strong")?.textContent === "Азбука вкуса");
    expect(fanciest?.querySelector(".index-tag")).toHaveTextContent("204 %");
    expect(fanciest?.querySelector(".index-tag")?.className).toContain("is-bad");
  });

  it("добавляет новое наблюдение и сразу пересчитывает сравнение", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const form = screen.getByRole("heading", { name: "Добавить цену" }).closest("section") as HTMLElement;
    await user.type(within(form).getByLabelText("Продукт"), "Творог 5%");
    await user.type(within(form).getByLabelText("Магазин"), "Магнит");
    await user.type(within(form).getByLabelText("Цена за упаковку"), "180");
    await user.type(within(form).getByLabelText("Вес, г"), "300");
    await user.click(within(form).getByRole("button", { name: "Добавить цену" }));

    expect(within(form).getByText(/Магнит/)).toBeInTheDocument();
    expect(rowFor(container, "Творог 5%")).toBeInTheDocument();
  });

  it("не добавляет наблюдение без цены и размера упаковки", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const form = screen.getByRole("heading", { name: "Добавить цену" }).closest("section") as HTMLElement;
    await user.type(within(form).getByLabelText("Продукт"), "Пустой продукт");
    await user.type(within(form).getByLabelText("Магазин"), "Нигде");
    await user.click(within(form).getByRole("button", { name: "Добавить цену" }));

    expect(container.querySelectorAll(".price-row")).toHaveLength(17);
  });

  it("удаляет наблюдение", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    const before = container.querySelectorAll(".price-row").length;

    await user.click(screen.getByRole("button", { name: "Удалить цену Лосось в Рыбный ряд" }));

    expect(container.querySelectorAll(".price-row")).toHaveLength(before - 1);
    expect(rowFor(container, "Лосось").querySelector(".comparison-offers")?.textContent).not.toContain("Рыбный ряд");
  });
});
