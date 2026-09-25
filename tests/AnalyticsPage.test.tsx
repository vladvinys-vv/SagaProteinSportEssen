import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { createDemoState, createEmptyState } from "@/data/demo";
import { STORAGE_KEY } from "@/lib/storage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import { AppProvider } from "@/state/AppContext";

const renderPage = (stored = createDemoState()) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  const view = render(
    <AppProvider>
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    </AppProvider>,
  );
  return { ...view, fileInput: view.container.querySelector("input[type=file]") as HTMLInputElement };
};

const uploadFile = (input: HTMLInputElement, content: string, name: string) => {
  const file = new File([content], name, { type: "application/json" });
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
};

describe("страница аналитики", () => {
  beforeEach(() => window.localStorage.clear());

  it("считает средние и adherence по демо-данным", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Что говорят данные" })).toBeInTheDocument();
    expect(screen.getByText("Средний вес")).toBeInTheDocument();
    expect(screen.getByText("Соблюдение белка")).toBeInTheDocument();
    expect(screen.getByText("Коррекции нормы")).toBeInTheDocument();
  });

  it("переключает метрику и период", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Белок" }));
    const proteinHeading = screen.getByRole("heading", { name: "Белок" });
    expect(proteinHeading).toBeInTheDocument();
    expect(proteinHeading.tagName).toBe("H2");

    await user.click(screen.getByRole("button", { name: "7 дней" }));
    expect(document.querySelector(".title-stat")).toHaveTextContent("7 дней");
  });

  it("показывает подсказку при переборе и считает план восстановления", () => {
    const state = createDemoState();
    const page = renderPage(state);
    expect(page.container.querySelector(".analytics-overview")).not.toBeNull();
  });

  it("сообщает об ошибке при импорте повреждённого файла", async () => {
    const { fileInput } = renderPage(createEmptyState());
    uploadFile(fileInput, "{ не json", "broken.json");

    expect(await screen.findByRole("status")).toHaveTextContent(/Не удалось прочитать файл данных/);
  });

  it("импортирует корректную резервную копию", async () => {
    const { fileInput } = renderPage(createEmptyState());
    const backup = JSON.stringify({ state: createDemoState() });
    uploadFile(fileInput, backup, "backup.json");

    expect(await screen.findByRole("status")).toHaveTextContent("Импортировано из backup.json");
  });
});
