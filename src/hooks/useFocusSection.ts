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

    // Карточка может указать, куда вести фокус: в журнале это вес подхода,
    // в замере веса — само поле веса, а не дата.
    const focusField = () => {
      const field = element.querySelector<HTMLElement>("[data-focus-target]")
        ?? element.querySelector<HTMLElement>("input, select, button, textarea");
      field?.focus({ preventScroll: true });
    };
    focusField();

    // Часть карточек наполняется в собственных эффектах (журнал тренировки
    // разворачивает подходы после монтирования) и заменяет узлы — тогда фокус
    // теряется. Повторяем его, если фокус так и не оказался внутри карточки.
    const raf = requestAnimationFrame(() => {
      if (!element.contains(document.activeElement)) focusField();
    });
    return () => cancelAnimationFrame(raf);
  }, [location]);
}
