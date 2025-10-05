// const CACHE_NAME = "mix-syria-v1";
// const urlsToCache = [
//   "/",
//   "/index.html",
//   "/manifest.json",
//   "/favicon.ico",
//   "/offline.html",
// ];

// self.addEventListener("install", (event) => {
//   self.skipWaiting();
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll(urlsToCache);
//     })
//   );
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       }

//       return fetch(event.request)
//         .then((networkResponse) => {
//           if (
//             !networkResponse ||
//             networkResponse.status !== 200 ||
//             networkResponse.type !== "basic"
//           ) {
//             return networkResponse;
//           }

//           const responseToCache = networkResponse.clone();

//           caches.open(CACHE_NAME).then((cache) => {
//             cache.put(event.request, responseToCache);
//           });

//           return networkResponse;
//         })
//         .catch(() => {
//           if (event.request.mode === "navigate") {
//             return caches.match("/offline.html");
//           }
//         });
//     })
//   );
// });

// self.addEventListener("activate", (event) => {
//   const cacheWhitelist = [CACHE_NAME];
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (!cacheWhitelist.includes(cacheName)) {
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });
