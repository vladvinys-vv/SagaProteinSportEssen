import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFocusSection } from "@/hooks/useFocusSection";

/** Разметка-пробник: карточка с id и первое поле внутри неё. */
const Probe = () => {
  useFocusSection();
  return (
    <div>
      <section id="alcohol">
        <input aria-label="Название" />
        <button type="button">Добавить напиток</button>
      </section>
    </div>
  );
};

const renderProbe = (focus?: string) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/nutrition", state: focus ? { focus } : null }]}>
      <Probe />
    </MemoryRouter>,
  );

describe("переход к секции из быстрых действий", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("прокручивает к карточке и ставит фокус в первое поле", async () => {
    renderProbe("alcohol");
    await waitFor(() => expect(screen.getByLabelText("Название")).toHaveFocus());
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("без указания секции ничего не фокусирует", async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByLabelText("Название")).not.toHaveFocus());
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("молча пропускает неизвестный id", async () => {
    renderProbe("unknown-section");
    await waitFor(() => expect(screen.getByLabelText("Название")).not.toHaveFocus());
  });
});
