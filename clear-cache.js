/**
 * Cache Clearing Script
 * Run this in browser console to force clear all caches
 */

console.log('🧹 Starting cache clearing process...');

// Clear all caches
if ('caches' in window) {
  caches.keys().then(names => {
    console.log(`🗑️ Found ${names.length} cache(s) to clear:`, names);
    
    names.forEach(name => {
      caches.delete(name).then(() => {
        console.log(`✅ Cleared cache: ${name}`);
      });
    });
  });
} else {
  console.log('ℹ️ Cache API not available');
}

// Clear localStorage
try {
  const localStorageKeys = Object.keys(localStorage);
  console.log(`🗑️ Clearing ${localStorageKeys.length} localStorage items`);
  localStorage.clear();
  console.log('✅ localStorage cleared');
} catch (e) {
  console.log('❌ Error clearing localStorage:', e);
}

// Clear sessionStorage
try {
  const sessionStorageKeys = Object.keys(sessionStorage);
  console.log(`🗑️ Clearing ${sessionStorageKeys.length} sessionStorage items`);
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
} catch (e) {
  console.log('❌ Error clearing sessionStorage:', e);
}

// Unregister service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log(`🗑️ Found ${registrations.length} service worker(s) to unregister`);
    
    registrations.forEach(registration => {
      registration.unregister().then(() => {
        console.log('✅ Service worker unregistered');
      });
    });
  });
} else {
  console.log('ℹ️ Service Worker API not available');
}

console.log('🔄 Cache clearing completed. Please refresh the page (Ctrl+F5 or Cmd+Shift+R)');
console.log('💡 Or run: window.location.reload(true)');
