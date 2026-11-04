/* Sagacious Footies — minimal service worker.
 * - Precaches the offline page and brand assets.
 * - Static build assets: cache-first (they are content-hashed).
 * - Page navigations: network-first, falling back to /offline.
 * - Never touches Convex, admin, API or cross-origin requests, so live
 *   prices and availability are always fetched fresh.
 */
const VERSION = "sf-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PRECACHE = [
  "/offline",
  "/logo-sm.webp",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Convex, WhatsApp, fonts, maps…
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline").then((res) => res || Response.error()),
      ),
    );
    return;
  }

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/logo-sm.webp" ||
    url.pathname === "/logo.webp";
  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
