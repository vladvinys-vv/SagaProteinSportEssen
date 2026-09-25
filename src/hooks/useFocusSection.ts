import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Быстрые действия из нижней панели ведут на страницу с указанием секции
 * (`state.focus` = id карточки). Хук прокручивает к ней и ставит фокус
 * в первое поле — чтобы «добавить продукт» работало в один тап.
 */
export function useFocusSection(): void {
  const location = useLocation();

  // Зависимость — сам объект location: react-router создаёт новый на каждый переход,
  // поэтому повторный выбор того же действия снова подводит к нужной карточке.
  useEffect(() => {
    const focus = (location.state as { focus?: string } | null)?.focus;
    if (!focus) return;
    const element = document.getElementById(focus);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    const field = element.querySelector<HTMLElement>("input, select, button, textarea");
    field?.focus({ preventScroll: true });
  }, [location]);
}
