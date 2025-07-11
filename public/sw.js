const CACHE_NAME = "russian-rummy-v1.0.1"
const urlsToCache = [
  "/",
  "/setup",
  "/game",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  // Add more specific Next.js assets
  "/_next/static/css/app/layout.css",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main.js",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(urlsToCache.map((url) => new Request(url, { credentials: "same-origin" })))
      })
      .catch((error) => {
        console.log("Cache install failed:", error)
      }),
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  // Ensure the service worker takes control immediately
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith("chrome-extension://")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === "document") {
            return caches.match("/")
          }
        })
    }),
  )
})

// Background sync for game state
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync if needed
      console.log("Background sync triggered"),
    )
  }
})

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New notification",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Open Game",
        icon: "/icon-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192x192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Russian Rummy Timer", options))
})

// Message handling
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
