/**
 * ORDINI PWA SERVICE WORKER
 * Handles offline functionality and notifications for the Orders Management App
 */

const CACHE_NAME = 'ordini-pwa-v2';
const OFFLINE_URL = '/ordini';
const START_URL = '/ordini?source=pwa';

// Assets to cache for offline functionality
const ASSETS_TO_CACHE = [
  '/ordini',
  '/ordini?source=pwa',
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

  // CRITICAL: Redirect home page to /ordini when launched from PWA
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate' && url.pathname === '/' && url.searchParams.get('source') === 'pwa') {
    console.log('🔀 [Ordini SW] Redirecting / to /ordini');
    event.respondWith(Response.redirect('/ordini?source=pwa', 302));
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
  console.log('⏰ [Ordini SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'check-new-orders') {
    event.waitUntil(checkForNewOrders());
  }
});

// One-time background sync
self.addEventListener('sync', (event) => {
  console.log('🔄 [Ordini SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'check-orders' || event.tag === 'check-orders-immediate') {
    event.waitUntil(checkForNewOrders());
  }
});

// Check for new orders from Supabase
async function checkForNewOrders() {
  console.log('🔍 [Ordini SW] Checking for new orders...');
  
  try {
    // Get the last checked timestamp
    const lastCheck = await getLastCheckTime();
    const now = new Date().toISOString();
    
    // Fetch new orders from Supabase
    const response = await fetch(
      `https://sixnfemtvmighstbgrbd.supabase.co/rest/v1/orders?order=created_at.desc&limit=10&created_at=gt.${lastCheck}`,
      {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpZaoUhnSyuv_j5mg4I',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpZaoUhnSyuv_j5mg4I'
        }
      }
    );
    
    if (response.ok) {
      const orders = await response.json();
      console.log(`✅ [Ordini SW] Found ${orders.length} new orders`);
      
      // Show notification for each new order
      for (const order of orders) {
        await self.registration.showNotification('🍕 Nuovo Ordine!', {
          body: `Ordine da ${order.customer_name} - €${order.total_amount?.toFixed(2) || '0.00'}`,
          icon: '/pizza-icon-192.png',
          badge: '/pizza-icon-192.png',
          tag: `order-${order.id}`,
          requireInteraction: true,
          vibrate: [300, 100, 300, 100, 300],
          data: {
            orderId: order.id,
            url: '/ordini'
          },
          actions: [
            { action: 'view', title: 'Visualizza' },
            { action: 'dismiss', title: 'Chiudi' }
          ]
        });
      }
      
      // Update last check time
      await setLastCheckTime(now);
    } else {
      console.error('❌ [Ordini SW] Failed to fetch orders:', response.status);
    }
  } catch (error) {
    console.error('❌ [Ordini SW] Error checking for orders:', error);
  }
}

// Get last check time from IndexedDB
async function getLastCheckTime() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('last-order-check');
    if (response) {
      const text = await response.text();
      return text || new Date(Date.now() - 60000).toISOString(); // Default: 1 minute ago
    }
  } catch (error) {
    console.error('Error getting last check time:', error);
  }
  return new Date(Date.now() - 60000).toISOString(); // Default: 1 minute ago
}

// Save last check time to cache
async function setLastCheckTime(time) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put('last-order-check', new Response(time));
  } catch (error) {
    console.error('Error saving last check time:', error);
  }
}

console.log('✅ [Ordini SW] Service Worker loaded successfully with background sync support');
