import type { FC, ReactNode } from "react";
import { Activity, Database, ShieldCheck } from "lucide-react";
import { NavLink, Outlet } from "react-router";

const navItems = [
  { to: "/nutrition", label: "Питание", icon: Database },
  { to: "/workouts", label: "Тренировки", icon: ShieldCheck },
  { to: "/profile", label: "Профиль", icon: Activity },
];

const AppLayout: FC<{ children?: ReactNode }> = ({ children }) => <div className="app-shell">
  {children}
  <header className="app-header">
    <NavLink className="brand" to="/">
      <span className="brand-mark"><Activity size={19} /></span>
      <span><strong>Форма</strong><small>энергия под контролем</small></span>
    </NavLink>
    <div className="header-actions"><span className="local-badge"><ShieldCheck size={13} /> Локально</span></div>
  </header>
  <main className="main-content"><Outlet /></main>
  <nav className="bottom-nav" aria-label="Основная навигация">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? "is-active" : undefined}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
</div>;

export default AppLayout;
