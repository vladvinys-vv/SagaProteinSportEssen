import React from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/styles/index.css";
import { initI18n } from "@/i18n";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found");
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

void initI18n().catch((error) => {
  console.error("[v0] i18n initialization failed", error);
});
