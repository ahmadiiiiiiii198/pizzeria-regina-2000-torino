/**
 * EMERGENCY CACHE CLEARING SCRIPT
 * 
 * Copy this ENTIRE file and paste into browser console at:
 * https://pizzeria-regina-2000.it/
 * 
 * This will:
 * 1. Unregister ALL Service Workers
 * 2. Clear ALL caches
 * 3. Clear localStorage/sessionStorage
 * 4. Force reload
 */

(async function emergencyCacheClear() {
  console.log('%c🚨 EMERGENCY CACHE CLEARING 🚨', 'color: red; font-size: 20px; font-weight: bold;');
  console.log('Starting emergency cache clear...');
  
  let cleared = {
    serviceWorkers: 0,
    caches: 0,
    storage: false
  };
  
  // 1. UNREGISTER ALL SERVICE WORKERS (Most Important!)
  console.log('\n🗑️ Step 1: Unregistering Service Workers...');
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`Found ${registrations.length} Service Worker(s)`);
      
      for (const registration of registrations) {
        await registration.unregister();
        cleared.serviceWorkers++;
        console.log('✅ Unregistered:', registration.scope);
      }
      
      if (cleared.serviceWorkers > 0) {
        console.log(`✅ Unregistered ${cleared.serviceWorkers} Service Worker(s)`);
      }
    } catch (e) {
      console.error('❌ Service Worker error:', e);
    }
  }
  
  // 2. DELETE ALL CACHES
  console.log('\n🗑️ Step 2: Deleting all caches...');
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      console.log(`Found ${cacheNames.length} cache(s):`, cacheNames);
      
      for (const name of cacheNames) {
        await caches.delete(name);
        cleared.caches++;
        console.log('✅ Deleted cache:', name);
      }
      
      console.log(`✅ Deleted ${cleared.caches} cache(s)`);
    } catch (e) {
      console.error('❌ Cache deletion error:', e);
    }
  }
  
  // 3. CLEAR LOCAL STORAGE
  console.log('\n🗑️ Step 3: Clearing storage...');
  try {
    const lsKeys = Object.keys(localStorage);
    console.log(`Found ${lsKeys.length} localStorage items`);
    localStorage.clear();
    sessionStorage.clear();
    cleared.storage = true;
    console.log('✅ Cleared localStorage and sessionStorage');
  } catch (e) {
    console.error('❌ Storage error:', e);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('%c✅ EMERGENCY CLEAR COMPLETE', 'color: green; font-size: 18px; font-weight: bold;');
  console.log('='.repeat(50));
  console.log(`Service Workers unregistered: ${cleared.serviceWorkers}`);
  console.log(`Caches deleted: ${cleared.caches}`);
  console.log(`Storage cleared: ${cleared.storage ? 'Yes' : 'No'}`);
  console.log('='.repeat(50));
  
  // Force reload
  console.log('\n🔄 Reloading page in 2 seconds...');
  console.log('Press ESC or close DevTools to cancel');
  
  setTimeout(() => {
    console.log('🔄 RELOADING NOW...');
    // Hard reload - bypass ALL caches
    window.location.href = window.location.origin + '/?clear=' + Date.now();
  }, 2000);
  
})().catch(err => {
  console.error('❌ CRITICAL ERROR:', err);
  alert('Emergency clear failed. Please clear browser cache manually:\nSettings > Privacy > Clear browsing data');
});
