import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X, BellOff } from 'lucide-react';

const NotificationPermissionPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermissionStatus(currentPermission);

      // Show prompt if permission not granted
      if (currentPermission === 'default') {
        // Wait 2 seconds before showing prompt
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Il tuo browser non supporta le notifiche');
      return;
    }

    try {
      console.log('🔔 [Notification] Requesting permission...');
      const permission = await Notification.requestPermission();
      
      console.log('🔔 [Notification] Permission result:', permission);
      setPermissionStatus(permission);
      setShowPrompt(false);

      if (permission === 'granted') {
        // Show test notification
        new Notification('🍕 Notifiche Attivate!', {
          body: 'Riceverai avvisi per nuovi ordini',
          icon: '/pizza-icon-192.png',
          badge: '/pizza-icon-192.png',
          tag: 'permission-granted',
          requireInteraction: false,
          vibrate: [200, 100, 200]
        } as NotificationOptions);

        // Also request persistent notification permission for background
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            console.log('🔔 [Notification] Service Worker ready for push notifications');
          } catch (error) {
            console.error('🔔 [Notification] Service Worker error:', error);
          }
        }
      } else if (permission === 'denied') {
        alert('⚠️ Hai bloccato le notifiche. Per attivarle, vai nelle impostazioni del browser e consenti le notifiche per questo sito.');
      }
    } catch (error) {
      console.error('🔔 [Notification] Error requesting permission:', error);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('notification_prompt_dismissed', 'true');
  };

  // Don't show if permission already granted or denied
  if (permissionStatus !== 'default' || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white shadow-2xl border-t-4 border-yellow-400 md:hidden animate-slide-up">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <div className="bg-white p-2 rounded-lg animate-bounce">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm">🔔 Attiva Notifiche!</h3>
                <p className="text-xs text-white/90">
                  Ricevi avvisi per nuovi ordini anche quando l'app è chiusa
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
              onClick={requestPermission}
              className="flex-1 bg-white text-red-600 hover:bg-gray-100 font-bold shadow-lg"
              size="sm"
            >
              <Bell className="mr-2 h-4 w-4" />
              Attiva Notifiche
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
      <div className="hidden md:block fixed top-20 right-6 z-50 animate-slide-down">
        <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-yellow-400">
          <button
            onClick={dismissPrompt}
            className="absolute top-3 right-3 text-white/80 hover:text-white"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-white p-3 rounded-xl animate-bounce">
              <Bell className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Attiva le Notifiche!</h3>
              <p className="text-sm text-white/90">
                Ricevi avvisi immediati per ogni nuovo ordine
              </p>
            </div>
          </div>
          
          <ul className="text-sm space-y-2 mb-4 text-white/90">
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Avvisi in tempo reale
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Funziona in background
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Suono + vibrazione
            </li>
          </ul>
          
          <div className="flex gap-3">
            <Button
              onClick={requestPermission}
              className="flex-1 bg-white text-red-600 hover:bg-gray-100 font-bold"
              size="lg"
            >
              <Bell className="mr-2 h-5 w-5" />
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

export default NotificationPermissionPrompt;
