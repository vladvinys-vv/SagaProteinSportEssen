import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/UI";

export default function NotFoundPage() {
  return <div className="page-content"><Card><div className="empty-state"><strong>Страница не найдена</strong><p>Вернись к сегодняшней сводке.</p><Link className="button primary" to="/"><ArrowLeft size={16} /> На главную</Link></div></Card></div>;
}
