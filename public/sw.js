/**
 * KILL-SWITCH SERVICE WORKER
 * 
 * This service worker clears all caches and should be unregistered
 * It fixes the issue where old cached assets were being served causing 404 errors
 */

console.log('🚨 KILL-SWITCH SERVICE WORKER ACTIVE');

// Install immediately
self.addEventListener('install', (event) => {
  console.log('🔧 Kill-switch: Installing...');
  self.skipWaiting();
});

// Activate and clear everything
self.addEventListener('activate', (event) => {
  console.log('🔧 Kill-switch: Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // Delete ALL caches
        const cacheNames = await caches.keys();
        console.log(`🗑️ Deleting ${cacheNames.length} caches:`, cacheNames);
        
        await Promise.all(
          cacheNames.map(async (cacheName) => {
            await caches.delete(cacheName);
            console.log(`✅ Deleted: ${cacheName}`);
          })
        );
        
        console.log('✅ All caches cleared!');
        
        // Take control of all pages
        await self.clients.claim();
        
        // Send message to all clients to unregister
        const clients = await self.clients.matchAll({ type: 'window' });
        console.log(`📨 Sending unregister message to ${clients.length} client(s)`);
        
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_CLEARED',
            message: 'All caches cleared. Please reload the page.'
          });
        });
        
        console.log('✅ Kill-switch complete. Page should reload automatically.');
      } catch (error) {
        console.error('❌ Kill-switch error:', error);
      }
    })()
  );
});

// NO FETCH HANDLER - Don't cache anything, let everything go to network
self.addEventListener('fetch', (event) => {
  // Just pass through to network, don't cache
  return;
});

console.log('🚨 Kill-switch Service Worker loaded. Caches will be cleared on activation.');
