import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { createDemoState } from "@/data/demo";
import { loadState, STORAGE_KEY } from "@/lib/storage";
import ProfilePage from "@/pages/ProfilePage";
import { AppProvider } from "@/state/AppContext";

const renderPage = () => {
  const state = createDemoState();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const view = render(
    <AppProvider>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </AppProvider>,
  );
  return { ...view, state };
};

const cardByHeading = (name: string): HTMLElement => {
  const card = screen.getByRole("heading", { name }).closest("section");
  if (!card) throw new Error(`Не найдена карточка «${name}»`);
  return card as HTMLElement;
};

describe("страница профиля", () => {
  beforeEach(() => window.localStorage.clear());

  it("показывает параметры, цель и норму калорий", () => {
    const { container, state } = renderPage();
    const hero = container.querySelector(".profile-hero") as HTMLElement;
    expect(hero).toHaveTextContent(`${state.profile.weightKg} кг`);
    expect(hero).toHaveTextContent(`${state.profile.heightCm} см`);
    expect(container.querySelector(".profile-target")).toHaveTextContent("ккал");
  });

  it("редактирует профиль через онбординг", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    await user.click(screen.getByRole("button", { name: "Редактировать" }));
    const modal = document.querySelector(".onboarding-modal") as HTMLElement;
    const weight = within(modal).getByLabelText(/Вес, кг/);
    await user.clear(weight);
    await user.type(weight, "84");
    await user.click(within(modal).getByRole("button", { name: "Сохранить профиль" }));

    expect(container.querySelector(".profile-hero")).toHaveTextContent("84 кг");
    expect(loadState().profile.weightKg).toBe(84);
  });

  it("добавляет замер веса и заменяет замер того же дня", async () => {
    const user = userEvent.setup();
    renderPage();

    const card = cardByHeading("История замеров");
    const weight = within(card).getByLabelText("Вес, кг");
    await user.clear(weight);
    await user.type(weight, "77.3");
    await user.click(within(card).getByRole("button", { name: "Добавить замер" }));

    const rows = card.querySelectorAll(".weight-history-row");
    expect(rows[0]).toHaveTextContent("77.3 кг");
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    expect(loadState().weights.filter((entry) => entry.date === today)).toHaveLength(1);
  });

  it("обновляет норму калорий при изменении макросов", async () => {
    const user = userEvent.setup();
    renderPage();

    const card = cardByHeading("Целевые показатели");
    const protein = within(card).getByLabelText("Белок, г/кг");
    await user.clear(protein);
    await user.type(protein, "2.5");

    expect(loadState().profile.proteinGPerKg).toBe(2.5);
  });

  it("сбрасывает локальные данные", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Сброс" }));

    const saved = loadState();
    expect(saved.meals).toEqual([]);
    expect(saved.weights).toEqual([]);
    expect(saved.profile.completed).toBe(false);
  });
});
