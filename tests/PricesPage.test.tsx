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
    expect(within(chicken.querySelector(".offer.is-cheapest") as HTMLElement).getByText("Aldi Nord")).toBeInTheDocument();
    expect(within(chicken.querySelector(".offer.is-priciest") as HTMLElement).getByText("Alnatura")).toBeInTheDocument();
    expect(chicken.querySelector(".comparison-head small")).toHaveTextContent("разброс 244 %");
    expect(chicken.querySelector(".comparison-head small")).toHaveTextContent(/экономия 8,50/);
  });

  it("считает экономию по корзине и подсказывает лучший магазин", () => {
    const { container } = renderPage();
    const summary = container.querySelector(".summary-grid") as HTMLElement;
    expect(summary).toHaveTextContent("Продуктов в наблюдении");
    expect(summary.textContent).toMatch(/72 записи по 13 магазинам/);
    expect(summary.textContent).toMatch(/30,61/);
    expect(summary).toHaveTextContent("Aldi Nord");
    expect(summary).toHaveTextContent("9 побед");
    expect(summary).toHaveTextContent("denn's Biomarkt");
    expect(summary).toHaveTextContent("+168 % к лучшей цене");
  });

  it("ранжирует магазины по кошельку", () => {
    const { container } = renderPage();
    const rows = [...container.querySelectorAll(".store-row")];
    expect(rows.length).toBeGreaterThanOrEqual(10);
    expect(rows[0]?.querySelector("strong")?.textContent).toBe("Aldi Nord");
    expect(rows[0]?.textContent).toContain("9 из 10 побед");
    expect(rows[0]?.textContent).toContain("Гамбург");

    const fanciest = rows.find((row) => row.querySelector("strong")?.textContent === "denn's Biomarkt");
    expect(fanciest?.querySelector(".index-tag")).toHaveTextContent("268 %");
    expect(fanciest?.querySelector(".index-tag")?.className).toContain("is-bad");
  });

  it("добавляет новое наблюдение и сразу пересчитывает сравнение", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const form = screen.getByRole("heading", { name: "Добавить цену" }).closest("section") as HTMLElement;
    await user.type(within(form).getByLabelText("Продукт"), "Творог 5%");
    await user.type(within(form).getByLabelText("Магазин"), "Budni");
    await user.type(within(form).getByLabelText("Цена за упаковку"), "1.49");
    await user.type(within(form).getByLabelText("Вес, г"), "300");
    await user.click(within(form).getByRole("button", { name: "Добавить цену" }));

    const rows = [...container.querySelectorAll(".price-row")].map((row) => row.textContent ?? "");
    expect(rows.some((row) => row.includes("Budni") && row.includes("Гамбург"))).toBe(true);
    expect(rowFor(container, "Творог 5%")).toBeInTheDocument();
  });

  it("не добавляет наблюдение без цены и размера упаковки", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const form = screen.getByRole("heading", { name: "Добавить цену" }).closest("section") as HTMLElement;
    const before = container.querySelectorAll(".price-row").length;
    await user.type(within(form).getByLabelText("Продукт"), "Пустой продукт");
    await user.type(within(form).getByLabelText("Магазин"), "Нигде");
    await user.click(within(form).getByRole("button", { name: "Добавить цену" }));

    expect(container.querySelectorAll(".price-row")).toHaveLength(before);
  });

  it("сравнивает базовые продукты немецкой корзины", () => {
    const { container } = renderPage();
    const names = [...container.querySelectorAll(".comparison-row strong")].map((element) => element.textContent);

    expect(names).toEqual(expect.arrayContaining(["Молоко 3.5%", "Яйца, 10 шт", "Яблоки, 1 кг"]));
    const milk = rowFor(container, "Молоко 3.5%");
    expect(within(milk.querySelector(".offer.is-cheapest") as HTMLElement).getByText("Aldi Nord")).toBeInTheDocument();
    expect(within(milk.querySelector(".offer.is-priciest") as HTMLElement).getByText("Edeka")).toBeInTheDocument();
  });

  it("подставляет Гамбург и подсказывает немецкие сети", () => {
    const { container } = renderPage();
    const form = screen.getByRole("heading", { name: "Добавить цену" }).closest("section") as HTMLElement;

    expect(within(form).getByLabelText("Город")).toHaveValue("Гамбург");
    const hints = [...form.querySelectorAll("datalist option")].map((option) => option.getAttribute("value"));
    expect(hints).toContain("Aldi Nord");
    expect(hints).toContain("denn's Biomarkt");
    expect(container.querySelector(".price-list")).toHaveTextContent("Гамбург");
  });

  it("удаляет наблюдение", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    const before = container.querySelectorAll(".price-row").length;

    await user.click(screen.getByRole("button", { name: "Удалить цену Лосось в Fischmarkt" }));

    expect(container.querySelectorAll(".price-row")).toHaveLength(before - 1);
    expect(rowFor(container, "Лосось").querySelector(".comparison-offers")?.textContent).not.toContain("Fischmarkt");
  });
});
