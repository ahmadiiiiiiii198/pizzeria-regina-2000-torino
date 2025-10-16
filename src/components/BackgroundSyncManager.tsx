import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, RefreshCw, X } from 'lucide-react';

const BackgroundSyncManager = () => {
  const [syncStatus, setSyncStatus] = useState<'checking' | 'granted' | 'denied' | 'unsupported'>('checking');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    checkAndRequestPermissions();
  }, []);

  const checkAndRequestPermissions = async () => {
    console.log('🔄 [BackgroundSync] Checking support and permissions...');

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.log('❌ [BackgroundSync] Service Worker not supported');
      setSyncStatus('unsupported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Check for Periodic Background Sync support
      if ('periodicSync' in registration) {
        console.log('✅ [BackgroundSync] Periodic Background Sync supported');

        // Check permission
        const status = await navigator.permissions.query({ 
          name: 'periodic-background-sync' as PermissionName 
        });

        console.log('🔄 [BackgroundSync] Permission status:', status.state);

        if (status.state === 'granted') {
          setSyncStatus('granted');
          await registerPeriodicSync(registration);
        } else if (status.state === 'prompt') {
          setSyncStatus('checking');
          setShowPrompt(true);
        } else {
          setSyncStatus('denied');
        }
      } else {
        console.log('⚠️ [BackgroundSync] Periodic Background Sync not supported, using alternative');
        // Fallback: Register one-time background sync
        if ('sync' in registration) {
          await registration.sync.register('check-orders');
          console.log('✅ [BackgroundSync] One-time background sync registered');
          setSyncStatus('granted');
        } else {
          setSyncStatus('unsupported');
        }
      }
    } catch (error) {
      console.error('❌ [BackgroundSync] Error:', error);
      setSyncStatus('unsupported');
    }
  };

  const registerPeriodicSync = async (registration: ServiceWorkerRegistration) => {
    try {
      // Register periodic sync to check for new orders every 15 minutes
      await (registration as any).periodicSync.register('check-new-orders', {
        minInterval: 15 * 60 * 1000 // 15 minutes in milliseconds
      });

      console.log('✅ [BackgroundSync] Periodic sync registered - checking every 15 minutes');
      
      // Also register immediate sync
      if ('sync' in registration) {
        await registration.sync.register('check-orders-immediate');
        console.log('✅ [BackgroundSync] Immediate sync registered');
      }
    } catch (error) {
      console.error('❌ [BackgroundSync] Failed to register periodic sync:', error);
    }
  };

  const requestBackgroundPermission = async () => {
    console.log('🔔 [BackgroundSync] Requesting background permissions...');

    try {
      const registration = await navigator.serviceWorker.ready;

      if ('periodicSync' in registration) {
        // Try to register periodic sync (this will trigger permission if needed)
        await registerPeriodicSync(registration);
        setSyncStatus('granted');
        setShowPrompt(false);

        // Show confirmation notification
        if (Notification.permission === 'granted') {
          new Notification('✅ Notifiche in Background Attivate!', {
            body: 'Riceverai avvisi per nuovi ordini ogni 15 minuti anche quando l\'app è chiusa',
            icon: '/pizza-icon-192.png',
            badge: '/pizza-icon-192.png',
            tag: 'background-sync-enabled'
          } as NotificationOptions);
        }
      } else {
        // Fallback
        if ('sync' in registration) {
          await registration.sync.register('check-orders');
          setSyncStatus('granted');
          setShowPrompt(false);
        }
      }
    } catch (error) {
      console.error('❌ [BackgroundSync] Permission request failed:', error);
      setSyncStatus('denied');
      alert('Impossibile attivare le notifiche in background. Assicurati di aver consentito le notifiche nelle impostazioni del browser.');
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('background_sync_prompt_dismissed', 'true');
  };

  // Don't show if unsupported or already granted or user dismissed
  if (syncStatus === 'unsupported' || syncStatus === 'granted' || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Banner */}
      <div className="fixed bottom-20 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white shadow-2xl border-t-4 border-blue-400 md:hidden animate-slide-up">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <div className="bg-white p-2 rounded-lg animate-pulse">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm">🔄 Controllo Automatico Ordini!</h3>
                <p className="text-xs text-white/90">
                  L'app controllerà nuovi ordini ogni 15 minuti anche quando è chiusa
                </p>
              </div>
            </div>
            <button
              onClick={dismissPrompt}
              className="text-white/80 hover:text-white p-1"
              aria-label="Chiudi"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={requestBackgroundPermission}
              className="flex-1 bg-white text-blue-600 hover:bg-gray-100 font-bold shadow-lg"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Attiva Controllo
            </Button>
            <Button
              onClick={dismissPrompt}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              size="sm"
            >
              Dopo
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Floating Prompt */}
      <div className="hidden md:block fixed top-40 right-6 z-50 animate-slide-down">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-blue-400">
          <button
            onClick={dismissPrompt}
            className="absolute top-3 right-3 text-white/80 hover:text-white"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-white p-3 rounded-xl animate-pulse">
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Controllo Automatico!</h3>
              <p className="text-sm text-white/90">
                Controlla nuovi ordini ogni 15 minuti in background
              </p>
            </div>
          </div>
          
          <ul className="text-sm space-y-2 mb-4 text-white/90">
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Controllo ogni 15 minuti
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Funziona anche quando chiusa
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Notifiche immediate
            </li>
          </ul>
          
          <div className="flex gap-3">
            <Button
              onClick={requestBackgroundPermission}
              className="flex-1 bg-white text-blue-600 hover:bg-gray-100 font-bold"
              size="lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Attiva Ora
            </Button>
            <Button
              onClick={dismissPrompt}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              size="lg"
            >
              Dopo
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BackgroundSyncManager;
