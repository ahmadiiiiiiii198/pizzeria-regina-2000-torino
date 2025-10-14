// App version for cache busting
// Update this version number whenever you want to force clients to refresh
export const APP_VERSION = '1.0.' + Date.now();
export const CACHE_VERSION = 'v' + APP_VERSION;

// Function to check if app needs update
export const checkForUpdates = () => {
  const currentVersion = localStorage.getItem('app_version');
  
  if (currentVersion !== APP_VERSION) {
    console.log('🔄 New version detected:', APP_VERSION, 'Current:', currentVersion);
    localStorage.setItem('app_version', APP_VERSION);
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          console.log('🗑️ Clearing cache:', name);
          caches.delete(name);
        });
      });
    }
    
    // Unregister service workers to force update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          console.log('🔄 Updating service worker...');
          registration.update();
        });
      });
    }
    
    return true; // New version
  }
  
  return false; // Same version
};

// Force reload if new version detected (use cautiously)
export const forceReloadOnUpdate = () => {
  if (checkForUpdates()) {
    console.log('🔄 Forcing reload for new version...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};
