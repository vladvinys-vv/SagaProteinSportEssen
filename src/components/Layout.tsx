import { Candy, Dumbbell, Home, Plus, ShieldCheck, Tag, UserRound, Utensils, Weight, Wine, X } from "lucide-react";
import { type FC, type ReactNode, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";

const navItems = [
  { to: "/", label: "Сводка", icon: Home },
  { to: "/nutrition", label: "Питание", icon: Utensils },
  { to: "/workouts", label: "Тренировки", icon: Dumbbell },
  { to: "/prices", label: "Цены", icon: Tag },
  { to: "/profile", label: "Профиль", icon: UserRound },
];

/** Быстрые действия: один тап до нужной формы. */
const quickActions = [
  { to: "/nutrition", focus: "add-food", label: "Добавить продукт", hint: "поиск, штрихкод или свой продукт", icon: Utensils },
  { to: "/nutrition", focus: "alcohol", label: "Внести алкоголь", hint: "и сразу увидеть, сколько он стоит прогрессу", icon: Wine },
  { to: "/nutrition", focus: "treats", label: "Вкусняшка за серию", hint: "десерт под остаток дня", icon: Candy },
  { to: "/workouts", focus: "journal", label: "Записать подход", hint: "журнал тренировки с планом", icon: Dumbbell },
  { to: "/profile", focus: "weight", label: "Замер веса", hint: "история веса и тренд", icon: Weight },
];

const AppLayout: FC<{ children?: ReactNode }> = ({ children }) => {
  const [quickOpen, setQuickOpen] = useState(false);
  const navigate = useNavigate();

  // Лист быстрых действий закрывается по Esc (переход закрывает его в обработчике).
  useEffect(() => {
    if (!quickOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQuickOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [quickOpen]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink className="brand" to="/">
          <span className="brand-mark">
            <Home size={19} />
          </span>
          <span>
            <strong>Форма</strong>
            <small>энергия под контролем</small>
          </span>
        </NavLink>
        <div className="header-actions">
          <span className="local-badge">
            <ShieldCheck size={13} /> Локально
          </span>
        </div>
      </header>

      <main className="main-content">{children}</main>

      {quickOpen && (
        <>
          <button className="quick-backdrop" type="button" aria-label="Закрыть быстрые действия" onClick={() => setQuickOpen(false)} />
          <div className="quick-sheet" role="dialog" aria-modal="true" aria-label="Быстрые действия">
            <div className="quick-sheet-head">
              <strong>Что добавляем?</strong>
              <button className="icon-button" type="button" onClick={() => setQuickOpen(false)} aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>
            <div className="quick-grid">
              {quickActions.map(({ to, focus, label, hint, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className="quick-action"
                  onClick={() => {
                    setQuickOpen(false);
                    navigate(to, { state: { focus, at: Date.now() } });
                  }}
                >
                  <Icon size={19} />
                  <span>
                    <strong>{label}</strong>
                    <small>{hint}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        className="quick-fab"
        type="button"
        onClick={() => setQuickOpen((current) => !current)}
        aria-label="Быстрые действия"
        aria-expanded={quickOpen}
      >
        <Plus size={22} />
      </button>

      <nav className="bottom-nav" aria-label="Основная навигация">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
