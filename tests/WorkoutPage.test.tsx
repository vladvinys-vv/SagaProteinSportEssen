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

describe("конструктор систем", () => {
  beforeEach(() => window.localStorage.clear());

  it("строит 5/3/1 по введённым максимумам и разворачивает план в журнал", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const builder = cardByHeading("Системы 5/3/1 и Juggernaut");
    await user.clear(within(builder).getByLabelText(/Присед/));
    await user.type(within(builder).getByLabelText(/Присед/), "140");
    await user.clear(within(builder).getByLabelText(/Жим лёжа/));
    await user.type(within(builder).getByLabelText(/Жим лёжа/), "100");
    await user.click(within(builder).getByRole("button", { name: "Сгенерировать программу" }));

    // Программа добавлена и выбрана: 4 дня по движениям с максимумом
    await expect(within(builder).getByRole("status")).toBeInTheDocument();
    const cards = container.querySelectorAll(".program-card");
    expect(cards).toHaveLength(5);
    expect(cards[4]).toHaveClass("is-selected");

    const planCard = dayCard(container);
    expect(planCard.querySelector("h2")).toHaveTextContent("Присед");
    const plan = planCard.querySelector(".set-plan") as HTMLElement;
    const plannedSets = [...plan.querySelectorAll(".plan-set")];
    expect(plannedSets).toHaveLength(3);
    expect(plannedSets.map((element) => element.querySelector("strong")?.textContent)).toEqual(["65 % × 5", "75 % × 5", "85 % × 5+"]);
    expect(plannedSets.map((element) => element.querySelector("span")?.textContent)).toEqual(["82.5 кг", "95 кг", "107.5 кг"]);
    expect(plannedSets.at(-1)?.className).toContain("is-amrap");

    // Журнал подставляет веса и повторы из плана
    const journal = cardByHeading("Записать тренировку");
    const firstSet = journal.querySelector(".pending-sets") as HTMLElement;
    const inputs = firstSet.querySelectorAll("input");
    expect(inputs[1]).toHaveValue(82.5);
    expect(inputs[2]).toHaveValue(5);
    expect(journal.querySelectorAll(".pending-sets")).toHaveLength(16);
  });

  it("строит Juggernaut с волнами и предупреждает про разгрузку", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    const builder = cardByHeading("Системы 5/3/1 и Juggernaut");
    await user.click(within(builder).getByRole("button", { name: "Juggernaut" }));
    await user.clear(within(builder).getByLabelText(/Присед/));
    await user.type(within(builder).getByLabelText(/Присед/), "160");
    await user.click(within(builder).getByRole("button", { name: "Сгенерировать программу" }));

    const planCard = dayCard(container);
    const exerciseNames = [...planCard.querySelectorAll(".exercise-row strong")].map((element) => element.textContent);
    expect(exerciseNames).toContain("10-повторная волна");
    expect(exerciseNames).toContain("3-повторная волна");
    expect(planCard.textContent).toContain("Разгрузка");
  });
});
