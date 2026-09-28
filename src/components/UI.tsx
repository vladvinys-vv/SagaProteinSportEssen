import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
  /** Якорь для быстрых действий из нижней панели (см. useFocusSection). */
  id?: string;
  role?: string;
  "aria-modal"?: boolean | "true" | "false";
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export function Card({
  children,
  className = "",
  as: Component = "section",
  ...aria
}: CardProps) {
  return <Component className={`card ${className}`} {...aria}>{children}</Component>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>;
}

export function ProgressBar({ value, max, label, tone = "primary" }: { value: number; max: number; label: string; tone?: "primary" | "protein" | "warning" | "success" }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return <div className="progress-row"><div className="progress-label"><span>{label}</span><strong>{Math.round(value)} / {Math.round(max)}</strong></div><div className="progress-track"><span className={`progress-fill ${tone}`} style={{ width: `${percent}%` }} /></div></div>;
}

export function TrendChart({ data, unit, color = "#7dd3a8" }: { data: { label: string; value: number }[]; unit: string; color?: string }) {
  const width = 640; const height = 210; const paddingX = 28; const paddingY = 24;
  const values = data.map((point) => point.value).filter(Number.isFinite);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const range = max - min || 1;
  const low = Math.max(0, min - range * 0.15); const high = max + range * 0.15;
  const points = data.map((point, index) => {
    const x = paddingX + (data.length <= 1 ? 0 : (index / (data.length - 1)) * (width - paddingX * 2));
    const y = paddingY + ((high - point.value) / (high - low)) * (height - paddingY * 2);
    return { ...point, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = points.length ? `${path} L ${points.at(-1)!.x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : "";
  return <div className="chart-wrap">
    <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`График ${unit}`}>
      <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {[0.25, 0.5, 0.75].map((position) => <line key={position} x1={paddingX} x2={width - paddingX} y1={paddingY + position * (height - paddingY * 2)} y2={paddingY + position * (height - paddingY * 2)} className="chart-grid" />)}
      {area && <path d={area} fill="url(#chartFill)" />}
      {points.length > 0 && <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map((point, index) => <circle key={`${point.label}-${point.x.toFixed(2)}`} cx={point.x} cy={point.y} r={index === points.length - 1 ? 5 : 3} fill={color} />)}
    </svg>
    <div className="chart-axis"><span>{data[0]?.label ?? "—"}</span><strong>{unit}</strong><span>{data.at(-1)?.label ?? "—"}</span></div>
  </div>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><strong>{title}</strong><p>{text}</p></div>;
}
