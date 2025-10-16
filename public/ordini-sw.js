/**
 * ORDINI PWA SERVICE WORKER
 * Handles offline functionality and notifications for the Orders Management App
 */

const CACHE_NAME = 'ordini-pwa-v1';
const OFFLINE_URL = '/ordini';

// Assets to cache for offline functionality
const ASSETS_TO_CACHE = [
  '/ordini',
  '/pizza-icon-192.png',
  '/pizza-icon-512.png',
  '/notification.mp3'
];

console.log('🍕 [Ordini SW] Service Worker loading...');

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('🔧 [Ordini SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [Ordini SW] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('✅ [Ordini SW] Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ [Ordini SW] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔧 [Ordini SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('🗑️ [Ordini SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ [Ordini SW] Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Supabase API requests - always go to network
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('📦 [Ordini SW] Serving from cache:', event.request.url);
              return cachedResponse;
            }
            
            // If offline page requested, return it
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('🔔 [Ordini SW] Push notification received');
  
  let data = { title: 'Nuovo Ordine!', body: 'Controlla gli ordini' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/pizza-icon-192.png',
    badge: '/pizza-icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'ordini-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Visualizza'
      },
      {
        action: 'close',
        title: 'Chiudi'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [Ordini SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow('/ordini')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('🔄 [Ordini SW] Background sync triggered');
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      // Sync logic here
      Promise.resolve()
    );
  }
});

// Periodic background sync (for checking new orders)
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ [Ordini SW] Periodic sync triggered');
  
  if (event.tag === 'check-orders') {
    event.waitUntil(
      // Check for new orders logic
      Promise.resolve()
    );
  }
});

console.log('✅ [Ordini SW] Service Worker loaded successfully');
