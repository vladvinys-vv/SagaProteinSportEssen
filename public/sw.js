/**
 * Service Worker with Offline App Shell and Supermarket Deals Caching.
 *
 * Strategies:
 *  - Navigation: Network-first, falls back to cached index.html.
 *  - App Shell: Cache-first for hashed Vite assets and icons.
 *  - Deals & Data: Network-first with cache fallback for offline supermarket shopping.
 */

const CACHE_VERSION = "v4";
const CACHE_NAME = `forma-shell-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `forma-data-${CACHE_VERSION}`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== DATA_CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1. Navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() =>
          caches
            .match("/index.html")
            .then((cached) => cached ?? caches.match("/"))
            .then((cached) => cached ?? Response.error()),
        ),
    );
    return;
  }

  // 2. Deals and API requests (Supermarket data / offline sync)
  if (url.pathname.includes("/api/") || url.pathname.endsWith(".json")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.open(DATA_CACHE_NAME).then((cache) =>
            cache.match(request).then((cached) => cached ?? Response.error()),
          ),
        ),
    );
    return;
  }

  // 3. Static assets from same origin
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request)
            .then((response) => {
              if (response.ok && response.type === "basic") {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
              }
              return response;
            })
            .catch(() => caches.match("/index.html").then((fallback) => fallback ?? Response.error())),
      ),
    );
  }
});
