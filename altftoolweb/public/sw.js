/*
 * Retire the legacy third-party root service worker.
 *
 * Browsers keep service-worker registrations across deployments. Keeping this
 * small same-origin worker at the old URL lets those browsers receive one last
 * update, release the root scope, and return all requests to the network.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();

      if ("caches" in self) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      await self.registration.unregister();
    })(),
  );
});
