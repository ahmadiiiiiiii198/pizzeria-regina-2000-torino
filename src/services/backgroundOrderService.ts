import { supabase } from '@/integrations/supabase/client';
import { phoneNotificationService } from './phoneNotificationService';

interface BackgroundOrderSettings {
  enabled: boolean;
  soundEnabled: boolean;
  checkInterval: number;
  maxRetries: number;
}

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  created_at: string;
  status: string;
}

class BackgroundOrderService {
  private static instance: BackgroundOrderService;
  private settings: BackgroundOrderSettings = {
    enabled: true,
    soundEnabled: true,
    checkInterval: 5000, // 5 seconds
    maxRetries: 3
  };
  
  private isRunning = false;
  private subscription: any = null;
  private intervalId: NodeJS.Timeout | null = null;
  private lastOrderId: string | null = null;
  private retryCount = 0;
  private wakeLock: any = null;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): BackgroundOrderService {
    if (!BackgroundOrderService.instance) {
      BackgroundOrderService.instance = new BackgroundOrderService();
    }
    return BackgroundOrderService.instance;
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('backgroundOrderSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('❌ [BackgroundOrder] Error loading settings:', error);
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('backgroundOrderSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('❌ [BackgroundOrder] Error saving settings:', error);
    }
  }

  // Check if we're on an admin page where notifications should play
  private isOnAdminPage(): boolean {
    const currentPage = window.location.pathname;
    const adminPages = ['/admin', '/orders', '/order-dashboard', '/ordini'];
    return adminPages.some(page => currentPage.startsWith(page));
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🔄 [BackgroundOrder] Service already running');
      return;
    }

    console.log('🚀 [BackgroundOrder] Starting background order monitoring...');
    this.isRunning = true;

    try {
      // Request wake lock to keep screen active (when possible)
      await this.requestWakeLock();

      // Set up real-time subscription
      await this.setupRealtimeSubscription();

      // Set up polling as backup
      this.setupPolling();

      // Register visibility change handler
      this.setupVisibilityHandler();

      console.log('✅ [BackgroundOrder] Background service started successfully');
    } catch (error) {
      console.error('❌ [BackgroundOrder] Error starting service:', error);
      this.isRunning = false;
    }
  }

  async stop(): Promise<void> {
    console.log('🛑 [BackgroundOrder] Stopping background order monitoring...');
    this.isRunning = false;

    // Clean up subscription
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.subscription = null;
    }

    // Clear polling
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Release wake lock
    await this.releaseWakeLock();

    console.log('✅ [BackgroundOrder] Background service stopped');
  }

  private async requestWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('🔋 [BackgroundOrder] Wake lock acquired');
        
        this.wakeLock.addEventListener('release', () => {
          console.log('🔋 [BackgroundOrder] Wake lock released');
        });
      }
    } catch (error) {
      console.log('⚠️ [BackgroundOrder] Wake lock not available:', error.message);
    }
  }

  private async releaseWakeLock(): Promise<void> {
    try {
      if (this.wakeLock) {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('🔋 [BackgroundOrder] Wake lock released manually');
      }
    } catch (error) {
      console.error('❌ [BackgroundOrder] Error releasing wake lock:', error);
    }
  }

  private async setupRealtimeSubscription(): Promise<void> {
    try {
      this.subscription = supabase
        .channel('background-order-monitoring')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        }, (payload) => {
          console.log('📡 [BackgroundOrder] New order detected via real-time:', payload);
          this.handleNewOrder(payload.new as OrderData);
        })
        .subscribe((status) => {
          console.log('📡 [BackgroundOrder] Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            this.retryCount = 0; // Reset retry count on successful connection
          }
        });
    } catch (error) {
      console.error('❌ [BackgroundOrder] Error setting up real-time subscription:', error);
      this.handleConnectionError();
    }
  }

  private setupPolling(): void {
    this.intervalId = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.checkForNewOrders();
      } catch (error) {
        console.error('❌ [BackgroundOrder] Polling error:', error);
        this.handleConnectionError();
      }
    }, this.settings.checkInterval);
  }

  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ [BackgroundOrder] Page became visible - resuming monitoring');
        if (!this.isRunning) {
          this.start();
        }
        // Resume audio context when page becomes visible
        this.resumeAudioContextFromBackground();
      } else {
        console.log('👁️ [BackgroundOrder] Page hidden - maintaining background monitoring');
        // Maintain audio context for background notifications
        this.maintainAudioContextForBackground();
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data.type === 'NOTIFICATION_CLICKED' && event.data.triggerAudio) {
        console.log('🔔 [BackgroundOrder] Notification clicked - triggering audio');
        // Import and trigger phone notification
        import('@/services/phoneNotificationService').then(({ phoneNotificationService }) => {
          phoneNotificationService.enableAudioWithUserGesture();
          if (event.data.data?.orderNumber) {
            phoneNotificationService.notifyNewOrder(
              event.data.data.orderNumber,
              event.data.data.customerName || 'Customer'
            );
          }
        });
      }
    });
  }

  private async checkForNewOrders(): Promise<void> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (orders && orders.length > 0) {
        const latestOrder = orders[0];
        
        // Check if this is a new order
        if (this.lastOrderId !== latestOrder.id) {
          this.lastOrderId = latestOrder.id;
          this.handleNewOrder(latestOrder);
        }
      }
    } catch (error) {
      console.error('❌ [BackgroundOrder] Error checking for new orders:', error);
      throw error;
    }
  }

  private async handleNewOrder(orderData: OrderData): Promise<void> {
    console.log('🚨 [BackgroundOrder] Processing new order:', orderData.order_number);
    
    // Only trigger notifications on admin pages
    if (!this.isOnAdminPage()) {
      console.log('🔇 [BackgroundOrder] Not on admin page - skipping notification');
      return;
    }

    // Trigger comprehensive notification
    this.triggerComprehensiveNotification(orderData);
  }

  private triggerComprehensiveNotification(orderData: OrderData): void {
    console.log('🚨 [BackgroundOrder] Triggering comprehensive notification for order:', orderData.order_number);
    console.log('📍 Current page:', window.location.pathname);

    // Only play sounds on admin pages
    if (this.settings.soundEnabled && this.isOnAdminPage()) {
      console.log('🔊 [BackgroundOrder] Playing notification sound (admin page detected)');
      phoneNotificationService.notifyNewOrder(orderData.order_number, orderData.customer_name);
    } else if (this.settings.soundEnabled) {
      console.log('🔇 [BackgroundOrder] Notification sound disabled (not on admin page)');
    }

    // Show browser notification if permission granted
    this.showBrowserNotification(orderData);

    // Trigger vibration on mobile
    this.triggerVibration();
  }

  private showBrowserNotification(orderData: OrderData): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Nuovo Ordine Ricevuto!', {
        body: `Ordine #${orderData.order_number} da ${orderData.customer_name}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'new-order',
        requireInteraction: true,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  }

  private triggerVibration(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }

  private handleConnectionError(): void {
    this.retryCount++;
    
    if (this.retryCount <= this.settings.maxRetries) {
      console.log(`🔄 [BackgroundOrder] Connection error - retrying (${this.retryCount}/${this.settings.maxRetries})`);
      
      setTimeout(() => {
        if (this.isRunning) {
          this.setupRealtimeSubscription();
        }
      }, 5000 * this.retryCount); // Exponential backoff
    } else {
      console.error('❌ [BackgroundOrder] Max retries reached - falling back to polling only');
    }
  }

  // Public methods for settings management
  updateSettings(newSettings: Partial<BackgroundOrderSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    console.log('⚙️ [BackgroundOrder] Settings updated:', this.settings);
  }

  getSettings(): BackgroundOrderSettings {
    return { ...this.settings };
  }

  isServiceRunning(): boolean {
    return this.isRunning;
  }

  // Maintain audio context for background notifications
  private async maintainAudioContextForBackground(): Promise<void> {
    try {
      const { phoneNotificationService } = await import('@/services/phoneNotificationService');
      // Ensure audio context keep-alive is running
      phoneNotificationService.startAudioContextKeepAlive();
      console.log('🔊 [BackgroundOrder] Audio context keep-alive maintained for background');
    } catch (error) {
      console.error('❌ [BackgroundOrder] Failed to maintain audio context:', error);
    }
  }

  // Resume audio context from background
  private async resumeAudioContextFromBackground(): Promise<void> {
    try {
      const { phoneNotificationService } = await import('@/services/phoneNotificationService');
      // Re-enable audio with user gesture if needed
      phoneNotificationService.enableAudioWithUserGesture();
      console.log('🔊 [BackgroundOrder] Audio context resumed from background');
    } catch (error) {
      console.error('❌ [BackgroundOrder] Failed to resume audio context:', error);
    }
  }

  getStatus(): {
    isRunning: boolean;
    hasWakeLock: boolean;
    hasSubscription: boolean;
    retryCount: number;
    lastOrderId: string | null;
  } {
    return {
      isRunning: this.isRunning,
      hasWakeLock: !!this.wakeLock,
      hasSubscription: !!this.subscription,
      retryCount: this.retryCount,
      lastOrderId: this.lastOrderId
    };
  }
}

// Export singleton instance
export const backgroundOrderService = BackgroundOrderService.getInstance();
