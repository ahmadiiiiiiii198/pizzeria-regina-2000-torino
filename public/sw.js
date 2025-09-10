// Service Worker for Order Dashboard
// Handles background notifications and keeps the app running even when screen is off

const CACHE_NAME = 'order-dashboard-v1';
const urlsToCache = [
  '/',
  '/orders',
  '/admin',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('📦 Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🔄 Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Try to fetch from network
        return fetch(event.request).catch((error) => {
          console.log('🌐 Network fetch failed for:', event.request.url, error.message);

          // Return a basic response for favicon requests to prevent errors
          if (event.request.url.includes('favicon.ico')) {
            return new Response('', { status: 404, statusText: 'Not Found' });
          }

          // For other requests, throw the error
          throw error;
        });
      })
      .catch((error) => {
        console.log('🔄 Cache and network both failed for:', event.request.url);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});

// Background sync for order updates
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }
});

// Push notifications for new orders
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received:', event);
  
  let notificationData = {
    title: 'New Order Received!',
    body: 'You have a new flower order',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'new-order',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Order',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ],
    data: {
      url: '/orders',
      timestamp: Date.now()
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: `New Order #${data.orderNumber}`,
        body: `Order from ${data.customerName} - ${data.amount}`,
        data: {
          ...notificationData.data,
          orderId: data.orderId,
          orderNumber: data.orderNumber
        }
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view') {
    // Open the order dashboard
    event.waitUntil(
      clients.openWindow('/orders')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes('/orders') && 'focus' in client) {
            return client.focus();
          }
        }
        // If not open, open new window
        if (clients.openWindow) {
          return clients.openWindow('/orders');
        }
      })
    );
  }
});

// Background message handling
self.addEventListener('message', (event) => {
  console.log('💬 Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'NEW_ORDER') {
    // Handle new order notification
    const { orderNumber, customerName, amount } = event.data;
    
    self.registration.showNotification(`New Order #${orderNumber}`, {
      body: `Order from ${customerName} - ${amount}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'new-order',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      actions: [
        {
          action: 'accept',
          title: 'Accept Order',
          icon: '/icons/accept.png'
        },
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view.png'
        }
      ],
      data: {
        orderId: event.data.orderId,
        orderNumber: orderNumber,
        url: '/orders'
      }
    });
  }
});

// Enhanced order monitoring state
let isOrderMonitoringActive = false;
let lastOrderId = null;
let monitoringSettings = {
  enabled: true,
  checkInterval: 30000, // 30 seconds
  useNotifications: true
};

// Periodic background sync to check for new orders
async function syncOrders() {
  try {
    console.log('🔄 [SW] Syncing orders in background...');

    if (!isOrderMonitoringActive) {
      console.log('🔄 [SW] Order monitoring not active, skipping sync');
      return;
    }

    // Check for new orders using Supabase
    const response = await fetch(`${self.location.origin}/api/orders/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();

      if (data.orders && data.orders.length > 0) {
        const latestOrder = data.orders[0];

        // Check if this is a new order
        if (lastOrderId !== latestOrder.id) {
          lastOrderId = latestOrder.id;
          console.log('🚨 [SW] New order detected:', latestOrder.order_number);

          // Show notification
          await showOrderNotification(latestOrder);

          // Send message to main app if it's open
          await notifyMainApp(latestOrder);
        }
      }
    }

    console.log('✅ [SW] Order sync completed');

  } catch (error) {
    console.error('❌ [SW] Order sync failed:', error);
  }
}

// Show notification for new order
async function showOrderNotification(orderData) {
  if (!monitoringSettings.useNotifications) {
    return;
  }

  const notificationOptions = {
    title: 'Nuovo Ordine Ricevuto! 🍕',
    body: `Ordine #${orderData.order_number} da ${orderData.customer_name}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'new-order',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'Visualizza Ordine',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Chiudi',
        icon: '/favicon.ico'
      }
    ],
    data: {
      orderNumber: orderData.order_number,
      customerName: orderData.customer_name,
      orderId: orderData.id,
      url: '/ordini',
      timestamp: Date.now()
    }
  };

  try {
    await self.registration.showNotification(notificationOptions.title, notificationOptions);
    console.log('✅ [SW] Notification shown for order:', orderData.order_number);
  } catch (error) {
    console.error('❌ [SW] Error showing notification:', error);
  }
}

// Send message to main app
async function notifyMainApp(orderData) {
  try {
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: 'window'
    });

    clients.forEach(client => {
      client.postMessage({
        type: 'NEW_ORDER_NOTIFICATION',
        orderNumber: orderData.order_number,
        customerName: orderData.customer_name,
        orderId: orderData.id,
        timestamp: Date.now()
      });
    });

    console.log('📨 [SW] Notified main app about new order');
  } catch (error) {
    console.error('❌ [SW] Error notifying main app:', error);
  }
}

// Handle messages from main app
self.addEventListener('message', (event) => {
  console.log('📨 [SW] Received message:', event.data);

  switch (event.data.type) {
    case 'START_ORDER_MONITORING':
      console.log('🚀 [SW] Starting order monitoring');
      isOrderMonitoringActive = true;
      if (event.data.settings) {
        monitoringSettings = { ...monitoringSettings, ...event.data.settings };
      }
      // Start immediate sync
      syncOrders();
      break;

    case 'STOP_ORDER_MONITORING':
      console.log('🛑 [SW] Stopping order monitoring');
      isOrderMonitoringActive = false;
      break;

    case 'TEST_NOTIFICATION':
      console.log('🧪 [SW] Testing notification');
      showOrderNotification({
        order_number: event.data.orderNumber || 'TEST-001',
        customer_name: event.data.customerName || 'Test Customer',
        id: 'test-id'
      });
      break;

    case 'UPDATE_SETTINGS':
      console.log('⚙️ [SW] Updating settings');
      monitoringSettings = { ...monitoringSettings, ...event.data.settings };
      break;
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [SW] Notification clicked:', event.notification.tag);

  event.notification.close();

  if (event.action === 'view') {
    // Open the orders page
    event.waitUntil(
      clients.openWindow('/ordini')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    console.log('🔔 [SW] Notification dismissed');
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Keep the service worker alive
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'order-check') {
    event.waitUntil(syncOrders());
  }
});

// Enhanced background sync with automatic order checking
setInterval(() => {
  if (isOrderMonitoringActive) {
    console.log('⏰ [SW] Automatic order check');
    syncOrders();
  }
}, monitoringSettings.checkInterval);

// Error handling
self.addEventListener('error', (event) => {
  console.error('❌ [SW] Service Worker error:', event.error);
});

// Handle service worker updates
self.addEventListener('install', (event) => {
  console.log('📦 [SW] Service Worker installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔄 [SW] Service Worker activating...');
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('unhandledrejection', (event) => {
  // Prevent the default unhandled rejection behavior
  event.preventDefault();

  // Only log non-fetch related errors to reduce noise
  if (!event.reason?.message?.includes('Failed to fetch')) {
    console.error('❌ Service Worker unhandled rejection:', event.reason);
  }
});

console.log('🚀 Service Worker loaded and ready for order notifications!');
