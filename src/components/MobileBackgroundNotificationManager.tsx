import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Smartphone, Volume2, VolumeX, Wifi, WifiOff, Battery, BatteryLow } from 'lucide-react';
import { mobileBackgroundNotificationService } from '@/services/mobileBackgroundNotificationService';
import { backgroundOrderService } from '@/services/backgroundOrderService';
import { phoneNotificationService } from '@/services/phoneNotificationService';
import { useToast } from '@/hooks/use-toast';

interface ServiceStatus {
  isInitialized: boolean;
  isMobile: boolean;
  isOnAdminPage: boolean;
  hasServiceWorker: boolean;
  hasPushSubscription: boolean;
  backgroundServiceRunning: boolean;
  notificationPermission: string;
}

export const MobileBackgroundNotificationManager: React.FC = () => {
  const [status, setStatus] = useState<ServiceStatus>({
    isInitialized: false,
    isMobile: false,
    isOnAdminPage: false,
    hasServiceWorker: false,
    hasPushSubscription: false,
    backgroundServiceRunning: false,
    notificationPermission: 'default'
  });
  
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Update status
  const updateStatus = useCallback(() => {
    const newStatus = mobileBackgroundNotificationService.getStatus();
    const phoneStatus = phoneNotificationService.getStatus();
    
    setStatus(newStatus);
    setIsPlaying(phoneStatus.isPlaying);
  }, []);

  // Initialize on mount
  useEffect(() => {
    const initializeService = async () => {
      try {
        console.log('🚀 [MobileNotificationManager] Initializing...');
        
        // Auto-initialize on admin pages
        await mobileBackgroundNotificationService.autoInitializeOnAdminPage();
        
        // Update status
        updateStatus();
        
        // Set up periodic status updates
        const statusInterval = setInterval(updateStatus, 2000);
        
        return () => clearInterval(statusInterval);
      } catch (error) {
        console.error('❌ [MobileNotificationManager] Initialization error:', error);
        toast({
          title: "Errore Inizializzazione",
          description: "Errore nell'inizializzazione delle notifiche mobile",
          variant: "destructive"
        });
      }
    };

    initializeService();
  }, [updateStatus, toast]);

  // Handle enable/disable toggle
  const handleToggleEnabled = async (enabled: boolean) => {
    setIsEnabled(enabled);
    
    try {
      if (enabled) {
        await mobileBackgroundNotificationService.startBackgroundMonitoring();
        toast({
          title: "Notifiche Attivate",
          description: "Le notifiche in background sono ora attive",
        });
      } else {
        await mobileBackgroundNotificationService.stopBackgroundMonitoring();
        toast({
          title: "Notifiche Disattivate",
          description: "Le notifiche in background sono state disattivate",
        });
      }
      updateStatus();
    } catch (error) {
      console.error('❌ [MobileNotificationManager] Toggle error:', error);
      toast({
        title: "Errore",
        description: "Errore nel cambiare lo stato delle notifiche",
        variant: "destructive"
      });
    }
  };

  // Test notification
  const handleTestNotification = async () => {
    try {
      await mobileBackgroundNotificationService.testNotification();
      toast({
        title: "Test Notifica",
        description: "Notifica di test inviata",
      });
    } catch (error) {
      console.error('❌ [MobileNotificationManager] Test error:', error);
      toast({
        title: "Errore Test",
        description: "Errore nell'invio della notifica di test",
        variant: "destructive"
      });
    }
  };

  // Stop current notification
  const handleStopNotification = () => {
    phoneNotificationService.stopNotification();
    updateStatus();
    toast({
      title: "Notifica Fermata",
      description: "La notifica audio è stata fermata",
    });
  };

  // Request permissions
  const handleRequestPermissions = async () => {
    try {
      const granted = await phoneNotificationService.requestNotificationPermission();
      if (granted) {
        toast({
          title: "Permessi Concessi",
          description: "I permessi per le notifiche sono stati concessi",
        });
      } else {
        toast({
          title: "Permessi Negati",
          description: "I permessi per le notifiche sono stati negati",
          variant: "destructive"
        });
      }
      updateStatus();
    } catch (error) {
      console.error('❌ [MobileNotificationManager] Permission error:', error);
      toast({
        title: "Errore Permessi",
        description: "Errore nella richiesta dei permessi",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (condition: boolean) => condition ? 'bg-green-500' : 'bg-red-500';
  const getStatusText = (condition: boolean) => condition ? 'Attivo' : 'Inattivo';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Notifiche Mobile in Background
        </CardTitle>
        <CardDescription>
          Sistema di notifiche per ordini quando l'app è in background su dispositivi mobili
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Notifiche in Background</h3>
            <p className="text-sm text-muted-foreground">
              Ricevi notifiche audio anche quando l'app è in background
            </p>
          </div>
          <Switch
            checked={isEnabled && status.backgroundServiceRunning}
            onCheckedChange={handleToggleEnabled}
          />
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Dispositivo Mobile</span>
              <Badge className={getStatusColor(status.isMobile)}>
                {status.isMobile ? 'Sì' : 'No'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Pagina Admin</span>
              <Badge className={getStatusColor(status.isOnAdminPage)}>
                {getStatusText(status.isOnAdminPage)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Service Worker</span>
              <Badge className={getStatusColor(status.hasServiceWorker)}>
                {getStatusText(status.hasServiceWorker)}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Servizio Background</span>
              <Badge className={getStatusColor(status.backgroundServiceRunning)}>
                {getStatusText(status.backgroundServiceRunning)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Permessi Notifiche</span>
              <Badge className={getStatusColor(status.notificationPermission === 'granted')}>
                {status.notificationPermission}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Audio in Riproduzione</span>
              <Badge className={getStatusColor(isPlaying)}>
                {isPlaying ? 'Sì' : 'No'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleTestNotification}
            variant="outline"
            size="sm"
          >
            🧪 Test Notifica
          </Button>
          
          {isPlaying && (
            <Button 
              onClick={handleStopNotification}
              variant="outline"
              size="sm"
              className="text-red-600"
            >
              <VolumeX className="h-4 w-4 mr-1" />
              Ferma Audio
            </Button>
          )}
          
          {status.notificationPermission !== 'granted' && (
            <Button 
              onClick={handleRequestPermissions}
              variant="outline"
              size="sm"
            >
              🔔 Richiedi Permessi
            </Button>
          )}
        </div>

        {/* Mobile-specific instructions */}
        {status.isMobile && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📱 Istruzioni per Mobile</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Mantieni l'app aperta nel browser</li>
              <li>• Non chiudere completamente il browser</li>
              <li>• Concedi i permessi per le notifiche quando richiesto</li>
              <li>• Su iOS: aggiungi l'app alla schermata home per migliori prestazioni</li>
              <li>• Su Android: evita di mettere l'app in "risparmio batteria"</li>
            </ul>
          </div>
        )}

        {/* Connection status */}
        <div className="flex items-center justify-center gap-4 p-2 bg-gray-50 rounded-lg">
          {status.hasServiceWorker ? (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Connesso</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Disconnesso</span>
            </div>
          )}
          
          {status.backgroundServiceRunning ? (
            <div className="flex items-center gap-1 text-green-600">
              <Battery className="h-4 w-4" />
              <span className="text-sm">Monitoraggio Attivo</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-600">
              <BatteryLow className="h-4 w-4" />
              <span className="text-sm">Monitoraggio Inattivo</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
