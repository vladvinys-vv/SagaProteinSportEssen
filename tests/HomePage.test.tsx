import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import App from "@/App";

beforeEach(() => window.localStorage.clear());
afterEach(() => cleanup());

describe("Форма", () => {
  it("показывает локальную панель питания", () => {
    render(<App />);
    expect(screen.getByText("Форма")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Держи ритм" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Основная навигация" })).toBeInTheDocument();
  });

  it("открывает обязательный онбординг для нового профиля", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Настроим твою норму" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сохранить профиль" })).toBeEnabled();
  });
});
