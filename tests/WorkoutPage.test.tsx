import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { createDemoState } from "@/data/demo";
import { STORAGE_KEY } from "@/lib/storage";
import WorkoutPage from "@/pages/WorkoutPage";
import { AppProvider } from "@/state/AppContext";

const renderPage = () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createDemoState()));
  return render(
    <AppProvider>
      <MemoryRouter>
        <WorkoutPage />
      </MemoryRouter>
    </AppProvider>,
  );
};

const cardByHeading = (name: string): HTMLElement => {
  const card = screen.getByRole("heading", { name }).closest("section");
  if (!card) throw new Error(`Не найдена карточка «${name}»`);
  return card as HTMLElement;
};

/** Карточка дня: заголовок — название дня, поэтому ищем по списку упражнений. */
const dayCard = (container: HTMLElement): HTMLElement => {
  const card = container.querySelector(".exercise-list")?.closest("section");
  if (!card) throw new Error("Не найдена карточка дня");
  return card as HTMLElement;
};

describe("страница тренировок", () => {
  beforeEach(() => window.localStorage.clear());

  it("показывает встроенные программы и подставляет упражнения дня", () => {
    const { container } = renderPage();
    expect(container.querySelectorAll(".program-card")).toHaveLength(4);
    expect(container.querySelectorAll(".pending-sets")).toHaveLength(3);
    expect(container.querySelector(".next-weight")).toHaveTextContent("следующий вес");
  });

  it("переключает программу и день", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const cards = container.querySelectorAll(".program-card");
    await user.click(cards[1] as HTMLElement);
    expect(cards[1]).toHaveClass("is-selected");

    const dayTabs = container.querySelectorAll(".day-tabs button");
    await user.click(dayTabs[1] as HTMLElement);
    expect(dayTabs[1]).toHaveClass("is-active");
    expect(container.querySelectorAll(".exercise-row")).toHaveLength(3);
  });

  it("пишет тренировку в журнал и повышает рабочий вес по правилу 5/3/1", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const journal = cardByHeading("Записать тренировку");
    const firstRow = journal.querySelector(".pending-sets") as HTMLElement;
    const inputs = firstRow.querySelectorAll("input");
    await user.type(inputs[1] as HTMLElement, "80");
    await user.type(inputs[2] as HTMLElement, "8");
    await user.click(within(journal).getByRole("button", { name: "Сохранить тренировку" }));

    const historyRow = container.querySelector(".workout-history .history-row");
    expect(historyRow).not.toBeNull();
    expect(historyRow).toHaveTextContent("Присед 80×8");

    // Для 5/3/1 следующий вес — максимум из +2.5 кг и 90 % тренировочного максимума.
    const squatRow = Array.from(container.querySelectorAll(".exercise-row")).find((row) => row.textContent?.includes("Присед"));
    expect(squatRow?.querySelector(".next-weight")).toHaveTextContent("90.0");
  });

  it("добавляет упражнение в выбранный день", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const card = dayCard(container);
    await user.type(within(card).getByPlaceholderText("Например, тяга блока"), "Тяга блока");
    await user.click(within(card).getByRole("button", { name: "Добавить" }));

    expect(within(card).getAllByText("Тяга блока").length).toBeGreaterThan(0);
    expect(card.querySelectorAll(".exercise-row")).toHaveLength(4);
  });
});
