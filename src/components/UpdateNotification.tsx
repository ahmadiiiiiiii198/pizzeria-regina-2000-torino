import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';

export const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  setShowUpdate(true);
                }
              });
            }
          });
        });
      });
    }

    // Check version in localStorage
    const checkVersion = () => {
      const currentVersion = localStorage.getItem('app_version');
      const newVersion = import.meta.env.VITE_APP_VERSION || 'unknown';
      
      if (currentVersion && currentVersion !== newVersion) {
        setShowUpdate(true);
      }
    };

    checkVersion();
    
    // Check periodically (every 5 minutes)
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Reload the page
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm animate-in slide-in-from-top-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4 border border-blue-500">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Aggiornamento Disponibile</h3>
            <p className="text-xs text-blue-100 mb-3">
              Una nuova versione del sito è disponibile. Aggiorna per le ultime funzionalità e miglioramenti.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50 text-xs px-3 py-1 h-auto"
              >
                Aggiorna Ora
              </Button>
              <Button
                onClick={() => setShowUpdate(false)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-blue-600 text-xs px-3 py-1 h-auto"
              >
                Più Tardi
              </Button>
            </div>
          </div>
          <button
            onClick={() => setShowUpdate(false)}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
