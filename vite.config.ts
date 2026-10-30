import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "lucide-react": resolve(__dirname, "./node_modules/lucide-react/dist/cjs/lucide-react.js"),
      "react-router": resolve(__dirname, "./node_modules/react-router/dist/development/index.js"),
    },
  },
  server: {
    port: 3100,
    host: true,
    strictPort: true,
    // Разрешаем прокси-хосты песочницы и превью-домены Vercel.
    allowedHosts: [".e2b.app", ".vercel.app"],
  },
  preview: {
    port: 3100,
    host: true,
    allowedHosts: [".e2b.app", ".vercel.app"],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 20000,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e", "node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/types/**"],
    },
  },
});
