import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/styles/index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Не найден корневой элемент #root");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/**
 * Регистрируем service worker: приложение должно открываться офлайн
 * (см. public/sw.js). В окружениях без support (SSR, тесты) — молча выходим.
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* офлайн-режим недоступен — приложение продолжает работать онлайн */
    });
  });
}
