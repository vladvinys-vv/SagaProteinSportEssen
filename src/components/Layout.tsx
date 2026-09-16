import type { ReactElement } from "react";
import { Activity, Database, ShieldCheck } from "lucide-react";
import { NavLink, Outlet } from "react-router";

const navItems = [
  { to: "/", label: "Сегодня", icon: Activity },
  { to: "/nutrition", label: "Питание", icon: Database },
  { to: "/workouts", label: "Тренировки", icon: ShieldCheck },
];

const AppLayout = (): ReactElement => <div className="app-shell">
  <header className="app-header">
    <NavLink className="brand" to="/">
      <span className="brand-mark"><Activity size={19} /></span>
      <span><strong>Форма</strong><small>энергия под контролем</small></span>
    </NavLink>
    <div className="header-actions"><span className="local-badge"><ShieldCheck size={13} /> Локально</span><NavLink className="icon-button" to="/profile" aria-label="Профиль"><span className="brand-mark" style={{ width: 20, height: 20, borderRadius: 7 }}><Activity size={13} /></span></NavLink></div>
  </header>
  <main className="main-content"><Outlet /></main>
  <nav className="bottom-nav" aria-label="Основная навигация">{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "is-active" : undefined}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
</div>;

export default Layout;
