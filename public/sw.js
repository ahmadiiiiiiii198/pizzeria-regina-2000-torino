/**
 * DISABLED SERVICE WORKER
 * Service worker temporarily disabled to prevent reload loops
 * Will be re-enabled with proper notification system later
 */

console.log('⏸️ Service Worker is currently disabled');

// Immediately unregister this service worker
self.addEventListener('install', (event) => {
  console.log('🛑 Service Worker installing - will self-destruct');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🛑 Service Worker activating - cleaning up and unregistering');
  
  event.waitUntil(
    (async () => {
      // Clear any caches one last time
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Take control then tell clients we're done
      await self.clients.claim();
      
      // Unregister ourselves
      const registrations = await self.registration.unregister();
      console.log('✅ Service Worker unregistered itself');
    })()
  );
});

// No fetch handler - pass everything through
self.addEventListener('fetch', () => {
  return;
});
