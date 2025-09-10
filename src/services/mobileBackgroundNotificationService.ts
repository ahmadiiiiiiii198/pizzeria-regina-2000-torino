import { backgroundOrderService } from './backgroundOrderService';
import { phoneNotificationService } from './phoneNotificationService';

interface MobileNotificationSettings {
  enabled: boolean;
  useWakeLock: boolean;
  usePushNotifications: boolean;
  useServiceWorker: boolean;
  enableOnMobileOnly: boolean;
  autoStartOnAdminPages: boolean;
}

class MobileBackgroundNotificationService {
  private static instance: MobileBackgroundNotificationService;
  private settings: MobileNotificationSettings = {
    enabled: true,
    useWakeLock: true,
    usePushNotifications: true,
    useServiceWorker: true,
    enableOnMobileOnly: false,
    autoStartOnAdminPages: true
  };

  private isInitialized = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): MobileBackgroundNotificationService {
    if (!MobileBackgroundNotificationService.instance) {
      MobileBackgroundNotificationService.instance = new MobileBackgroundNotificationService();
    }
    return MobileBackgroundNotificationService.instance;
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('mobileNotificationSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('❌ [MobileNotification] Error loading settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('mobileNotificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('❌ [MobileNotification] Error saving settings:', error);
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private isOnAdminPage(): boolean {
    const currentPage = window.location.pathname;
    const adminPages = ['/admin', '/orders', '/order-dashboard', '/ordini'];
    return adminPages.some(page => currentPage.startsWith(page));
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ [MobileNotification] Already initialized');
      return;
    }

    console.log('🚀 [MobileNotification] Initializing mobile background notification service...');

    try {
      // Check if we should enable based on settings
      if (this.settings.enableOnMobileOnly && !this.isMobileDevice()) {
        console.log('📱 [MobileNotification] Desktop detected - mobile-only mode disabled');
        return;
      }

      // Initialize service worker
      if (this.settings.useServiceWorker) {
        await this.initializeServiceWorker();
      }

      // Request notification permissions
      await this.requestPermissions();

      // Initialize push notifications
      if (this.settings.usePushNotifications) {
        await this.initializePushNotifications();
      }

      // Auto-start on admin pages
      if (this.settings.autoStartOnAdminPages && this.isOnAdminPage()) {
        await this.startBackgroundMonitoring();
      }

      this.isInitialized = true;
      console.log('✅ [MobileNotification] Mobile background notification service initialized');

    } catch (error) {
      console.error('❌ [MobileNotification] Error initializing service:', error);
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ [MobileNotification] Service Worker registered');

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('📨 [MobileNotification] Message from Service Worker:', event.data);
          
          if (event.data.type === 'NEW_ORDER_NOTIFICATION') {
            this.handleServiceWorkerNotification(event.data);
          }
        });

      } catch (error) {
        console.error('❌ [MobileNotification] Service Worker registration failed:', error);
      }
    }
  }

  private async requestPermissions(): Promise<void> {
    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('🔔 [MobileNotification] Notification permission:', permission);
    }

    // Enable audio with user gesture (required for mobile)
    phoneNotificationService.enableAudioWithUserGesture();
  }

  private async initializePushNotifications(): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      console.log('⚠️ [MobileNotification] Service Worker not available for push notifications');
      return;
    }

    try {
      // Check if push notifications are supported
      if ('PushManager' in window) {
        // Get existing subscription or create new one
        this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
        
        if (!this.pushSubscription) {
          console.log('📱 [MobileNotification] Creating new push subscription...');
          // Note: You would need to implement VAPID keys for production
          // this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
          //   userVisibleOnly: true,
          //   applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
          // });
        }

        console.log('✅ [MobileNotification] Push notifications initialized');
      }
    } catch (error) {
      console.error('❌ [MobileNotification] Error initializing push notifications:', error);
    }
  }

  private handleServiceWorkerNotification(data: any): void {
    console.log('🔔 [MobileNotification] Handling service worker notification:', data);
    
    // If the app is in the foreground, play audio notification
    if (document.visibilityState === 'visible' && this.isOnAdminPage()) {
      phoneNotificationService.notifyNewOrder(data.orderNumber, data.customerName);
    }
  }

  async startBackgroundMonitoring(): Promise<void> {
    if (!this.settings.enabled) {
      console.log('🔇 [MobileNotification] Background monitoring disabled');
      return;
    }

    console.log('🚀 [MobileNotification] Starting background monitoring...');

    try {
      // Start background order service
      await backgroundOrderService.start();

      // Send message to service worker to start monitoring
      if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
        this.serviceWorkerRegistration.active.postMessage({
          type: 'START_ORDER_MONITORING',
          settings: this.settings
        });
      }

      console.log('✅ [MobileNotification] Background monitoring started');

    } catch (error) {
      console.error('❌ [MobileNotification] Error starting background monitoring:', error);
    }
  }

  async stopBackgroundMonitoring(): Promise<void> {
    console.log('🛑 [MobileNotification] Stopping background monitoring...');

    try {
      // Stop background order service
      await backgroundOrderService.stop();

      // Send message to service worker to stop monitoring
      if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
        this.serviceWorkerRegistration.active.postMessage({
          type: 'STOP_ORDER_MONITORING'
        });
      }

      console.log('✅ [MobileNotification] Background monitoring stopped');

    } catch (error) {
      console.error('❌ [MobileNotification] Error stopping background monitoring:', error);
    }
  }

  // Test the notification system
  async testNotification(): Promise<void> {
    console.log('🧪 [MobileNotification] Testing notification system...');
    
    // Test phone notification
    await phoneNotificationService.testNotification();

    // Test browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from the mobile background service',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
    }

    // Test service worker message
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'TEST_NOTIFICATION',
        orderNumber: 'TEST-001',
        customerName: 'Test Customer'
      });
    }
  }

  // Settings management
  updateSettings(newSettings: Partial<MobileNotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    console.log('⚙️ [MobileNotification] Settings updated:', this.settings);
  }

  getSettings(): MobileNotificationSettings {
    return { ...this.settings };
  }

  getStatus(): {
    isInitialized: boolean;
    isMobile: boolean;
    isOnAdminPage: boolean;
    hasServiceWorker: boolean;
    hasPushSubscription: boolean;
    backgroundServiceRunning: boolean;
    notificationPermission: string;
  } {
    return {
      isInitialized: this.isInitialized,
      isMobile: this.isMobileDevice(),
      isOnAdminPage: this.isOnAdminPage(),
      hasServiceWorker: !!this.serviceWorkerRegistration,
      hasPushSubscription: !!this.pushSubscription,
      backgroundServiceRunning: backgroundOrderService.isServiceRunning(),
      notificationPermission: 'Notification' in window ? Notification.permission : 'not-supported'
    };
  }

  // Auto-initialize when on admin pages
  async autoInitializeOnAdminPage(): Promise<void> {
    if (this.isOnAdminPage() && !this.isInitialized) {
      console.log('📱 [MobileNotification] Auto-initializing on admin page');
      await this.initialize();
    }
  }
}

// Export singleton instance
export const mobileBackgroundNotificationService = MobileBackgroundNotificationService.getInstance();
