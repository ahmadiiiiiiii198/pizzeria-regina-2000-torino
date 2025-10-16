import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      console.log('📱 [PWA] App is already installed');
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('📱 [PWA] beforeinstallprompt event fired');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ [PWA] App installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker for Ordini page
    if ('serviceWorker' in navigator && window.location.pathname.includes('/ordini')) {
      navigator.serviceWorker
        .register('/ordini-sw.js')
        .then((registration) => {
          console.log('✅ [PWA] Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('❌ [PWA] Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('⚠️ [PWA] No install prompt available');
      return;
    }

    console.log('📱 [PWA] Showing install prompt');
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📱 [PWA] User choice: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ [PWA] User accepted install');
    } else {
      console.log('❌ [PWA] User dismissed install');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember user dismissed the prompt
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  // Don't show if already installed or user dismissed
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white shadow-2xl border-t-4 border-yellow-400 md:hidden animate-slide-up">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1">
              <div className="bg-white p-2 rounded-lg">
                <Smartphone className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Installa l'App! 📲</h3>
                <p className="text-xs text-white/90">
                  Accesso rapido agli ordini dal tuo telefono
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white p-1"
              aria-label="Chiudi"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-white text-red-600 hover:bg-gray-100 font-bold shadow-lg"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Installa Ora
            </Button>
            <Button
              onClick={handleDismiss}
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
      <div className="hidden md:block fixed bottom-6 right-6 z-50 animate-slide-up">
        <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-yellow-400">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-white/80 hover:text-white"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-white p-3 rounded-xl">
              <Smartphone className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Installa l'App Mobile!</h3>
              <p className="text-sm text-white/90">
                Gestisci gli ordini direttamente dal tuo dispositivo
              </p>
            </div>
          </div>
          
          <ul className="text-sm space-y-2 mb-4 text-white/90">
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Notifiche in tempo reale
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Funziona offline
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Accesso rapido
            </li>
          </ul>
          
          <div className="flex gap-3">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-white text-red-600 hover:bg-gray-100 font-bold"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Installa App
            </Button>
            <Button
              onClick={handleDismiss}
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

export default PWAInstallPrompt;
