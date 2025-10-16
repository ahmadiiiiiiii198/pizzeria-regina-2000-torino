/**
 * Manual Cache Clearing Utility
 * Run this in browser console to force clear all caches and reset the app
 * 
 * Usage: Copy this entire file and paste into browser DevTools console
 */

(async function clearAllCaches() {
  console.log('🧹 Manual Cache Clearing Utility');
  console.log('================================');
  
  let errors = [];
  let cleared = {
    caches: 0,
    serviceWorkers: 0,
    localStorage: false,
    sessionStorage: false
  };
  
  // 1. Clear Cache Storage API
  if ('caches' in window) {
    try {
      const names = await caches.keys();
      console.log(`\n🗑️ Found ${names.length} cache(s)`);
      
      for (const name of names) {
        try {
          await caches.delete(name);
          console.log(`   ✅ Deleted: ${name}`);
          cleared.caches++;
        } catch (e) {
          console.error(`   ❌ Failed to delete ${name}:`, e.message);
          errors.push(`Cache: ${name}`);
        }
      }
      
      if (cleared.caches > 0) {
        console.log(`✅ Cleared ${cleared.caches} cache(s)`);
      }
    } catch (e) {
      console.error('❌ Cache API error:', e.message);
      errors.push('Cache API');
    }
  } else {
    console.log('ℹ️ Cache API not available in this browser');
  }
  
  // 2. Unregister Service Workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`\n🗑️ Found ${registrations.length} service worker(s)`);
      
      for (const registration of registrations) {
        try {
          await registration.unregister();
          console.log(`   ✅ Unregistered: ${registration.scope}`);
          cleared.serviceWorkers++;
        } catch (e) {
          console.error(`   ❌ Failed to unregister:`, e.message);
          errors.push('Service Worker');
        }
      }
      
      if (cleared.serviceWorkers > 0) {
        console.log(`✅ Unregistered ${cleared.serviceWorkers} service worker(s)`);
      }
    } catch (e) {
      console.error('❌ Service Worker error:', e.message);
      errors.push('Service Worker');
    }
  } else {
    console.log('ℹ️ Service Worker API not available in this browser');
  }
  
  // 3. Clear localStorage
  try {
    const keys = Object.keys(localStorage);
    console.log(`\n🗑️ Found ${keys.length} localStorage item(s)`);
    
    // Show version info before clearing
    const currentVersion = localStorage.getItem('pizzeria_app_version');
    if (currentVersion) {
      console.log(`   📦 Current version: ${currentVersion}`);
    }
    
    localStorage.clear();
    cleared.localStorage = true;
    console.log('✅ localStorage cleared');
  } catch (e) {
    console.error('❌ localStorage error:', e.message);
    errors.push('localStorage');
  }
  
  // 4. Clear sessionStorage
  try {
    const keys = Object.keys(sessionStorage);
    console.log(`\n🗑️ Found ${keys.length} sessionStorage item(s)`);
    sessionStorage.clear();
    cleared.sessionStorage = true;
    console.log('✅ sessionStorage cleared');
  } catch (e) {
    console.error('❌ sessionStorage error:', e.message);
    errors.push('sessionStorage');
  }
  
  // Summary
  console.log('\n================================');
  console.log('📊 Summary:');
  console.log(`   Caches cleared: ${cleared.caches}`);
  console.log(`   Service workers unregistered: ${cleared.serviceWorkers}`);
  console.log(`   localStorage: ${cleared.localStorage ? '✅' : '❌'}`);
  console.log(`   sessionStorage: ${cleared.sessionStorage ? '✅' : '❌'}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️ Errors occurred with:', errors.join(', '));
  } else {
    console.log('\n✅ All caches cleared successfully!');
  }
  
  // Instructions
  console.log('\n================================');
  console.log('🔄 Next Steps:');
  console.log('   1. Refresh the page: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
  console.log('   2. Or close and reopen the browser tab');
  console.log('\n💡 Quick reload command:');
  console.log('   window.location.href = window.location.href.split("?")[0];');
  
  // Auto-reload option
  console.log('\n⚡ Auto-reload in 3 seconds...');
  console.log('   (Press ESC or close DevTools to cancel)');
  
  setTimeout(() => {
    console.log('🔄 Reloading now...');
    window.location.href = window.location.href.split('?')[0] + '?cache_cleared=' + Date.now();
  }, 3000);
  
})().catch(err => {
  console.error('❌ Critical error during cache clearing:', err);
});
