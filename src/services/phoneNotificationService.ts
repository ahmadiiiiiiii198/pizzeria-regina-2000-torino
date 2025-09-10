import iosAudioFix from '@/utils/iosAudioFix';

interface PhoneNotificationSettings {
  enabled: boolean;
  customNotificationSound: boolean;
  notificationSoundName: string;
  notificationSoundUrl: string;
  volume: number;
  ringDuration: number;
  ringInterval: number;
  maxRings: number;
}

class PhoneNotificationService {
  private static instance: PhoneNotificationService;
  private settings: PhoneNotificationSettings = {
    enabled: true,
    customNotificationSound: false,
    notificationSoundName: 'Default Ring',
    notificationSoundUrl: '/notification-sound.mp3',
    volume: 0.8,
    ringDuration: 3,
    ringInterval: 1,
    maxRings: 10
  };

  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;
  private ringCount = 0;
  private ringTimer: NodeJS.Timeout | null = null;
  private stopTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadSettings();
    this.initializeAudio();
  }

  static getInstance(): PhoneNotificationService {
    if (!PhoneNotificationService.instance) {
      PhoneNotificationService.instance = new PhoneNotificationService();
    }
    return PhoneNotificationService.instance;
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('phoneNotificationSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('❌ [PhoneNotification] Error loading settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('phoneNotificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('❌ [PhoneNotification] Error saving settings:', error);
    }
  }

  private initializeAudio(): void {
    try {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
      this.audioElement.volume = this.settings.volume;

      // Set the audio source
      if (this.settings.customNotificationSound && this.settings.notificationSoundUrl) {
        this.audioElement.src = this.settings.notificationSoundUrl;
      } else {
        // Use default notification sound - fallback to generated beep if file doesn't exist
        this.audioElement.src = this.getDefaultNotificationSound();
      }

      // Add event listeners
      this.audioElement.addEventListener('ended', () => {
        console.log('🔊 [PhoneNotification] Audio ended');
        this.handleAudioEnded();
      });

      this.audioElement.addEventListener('error', (error) => {
        console.error('❌ [PhoneNotification] Audio error:', error);
        // Fallback to generated beep sound
        this.audioElement.src = this.generateBeepSound();
        console.log('🔊 [PhoneNotification] Falling back to generated beep sound');
      });

      console.log('🔊 [PhoneNotification] Audio initialized');
    } catch (error) {
      console.error('❌ [PhoneNotification] Error initializing audio:', error);
    }
  }

  // Check if we're on an admin page where notifications should play
  private isOnAdminPage(): boolean {
    const currentPage = window.location.pathname;
    const adminPages = ['/admin', '/orders', '/order-dashboard', '/ordini'];
    return adminPages.some(page => currentPage.startsWith(page));
  }

  async notifyNewOrder(orderNumber: string, customerName: string): Promise<void> {
    if (!this.settings.enabled) {
      console.log('🔇 [PhoneNotification] Notifications disabled');
      return;
    }

    const currentPage = window.location.pathname;
    console.log(`📞 [PhoneNotification] Notification for order #${orderNumber} from ${customerName} - Page: ${currentPage}`);

    // Check if we're on an admin page - only play sounds on backend pages
    if (!this.isOnAdminPage()) {
      console.log('🔇 [PhoneNotification] Notification sound blocked - not on admin page');
      return;
    }

    console.log('🔊 [PhoneNotification] Playing notification sound - admin page confirmed');

    // Stop any currently playing notification
    this.stopNotification();

    // Start new notification
    await this.startNotification();
  }

  private async startNotification(): Promise<void> {
    if (this.isPlaying) {
      console.log('🔊 [PhoneNotification] Already playing notification');
      return;
    }

    console.log('🔊 [PhoneNotification] Starting notification sequence');
    this.isPlaying = true;
    this.ringCount = 0;

    // Try iOS-specific audio handling first
    if (iosAudioFix.getStatus().isIOS) {
      console.log('🍎 [PhoneNotification] Using iOS audio fix');
      try {
        await iosAudioFix.playNotificationSound();
        this.scheduleNextRing();
        return;
      } catch (error) {
        console.error('🍎 [PhoneNotification] iOS audio fix failed, falling back to standard audio');
      }
    }

    // Standard audio playback
    await this.playAudioRing();
  }

  private async playAudioRing(): Promise<void> {
    if (!this.audioElement) {
      console.error('❌ [PhoneNotification] Audio element not initialized');
      return;
    }

    try {
      // Reset audio to beginning
      this.audioElement.currentTime = 0;
      this.audioElement.volume = this.settings.volume;

      console.log(`🔊 [PhoneNotification] Playing ring ${this.ringCount + 1}/${this.settings.maxRings}`);
      
      const playPromise = this.audioElement.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('🔊 [PhoneNotification] Audio started successfully');
      }

      this.ringCount++;

      // Schedule stop after ring duration
      this.stopTimer = setTimeout(() => {
        if (this.audioElement && !this.audioElement.paused) {
          this.audioElement.pause();
          this.handleAudioEnded();
        }
      }, this.settings.ringDuration * 1000);

    } catch (error) {
      console.error('❌ [PhoneNotification] Error playing audio:', error);
      
      if (error.name === 'NotAllowedError') {
        console.log('🔊 [PhoneNotification] Audio blocked - user interaction required');
        // Could show a visual indicator that user needs to interact
      }
      
      this.isPlaying = false;
    }
  }

  private handleAudioEnded(): void {
    console.log('🔊 [PhoneNotification] Ring completed');
    
    // Clear stop timer
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    // Check if we should continue ringing
    if (this.ringCount < this.settings.maxRings && this.isPlaying) {
      this.scheduleNextRing();
    } else {
      console.log('🔊 [PhoneNotification] Notification sequence completed');
      this.isPlaying = false;
    }
  }

  private scheduleNextRing(): void {
    console.log(`🔊 [PhoneNotification] Scheduling next ring in ${this.settings.ringInterval}s`);
    
    this.ringTimer = setTimeout(async () => {
      if (this.isPlaying) {
        await this.playAudioRing();
      }
    }, this.settings.ringInterval * 1000);
  }

  stopNotification(): void {
    console.log('🔇 [PhoneNotification] Stopping notification');
    
    this.isPlaying = false;
    this.ringCount = 0;

    // Clear timers
    if (this.ringTimer) {
      clearTimeout(this.ringTimer);
      this.ringTimer = null;
    }

    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    // Stop audio
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  async testNotification(): Promise<void> {
    console.log('🧪 [PhoneNotification] Testing notification sound');
    await this.notifyNewOrder('TEST-001', 'Test Customer');
  }

  // Settings management
  updateSettings(newSettings: Partial<PhoneNotificationSettings>): void {
    const oldSrc = this.audioElement?.src;
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // Update audio element if needed
    if (this.audioElement) {
      this.audioElement.volume = this.settings.volume;
      
      // Update audio source if changed
      const newSrc = this.settings.customNotificationSound && this.settings.notificationSoundUrl
        ? this.settings.notificationSoundUrl
        : '/notification-sound.mp3';
        
      if (oldSrc !== newSrc) {
        this.audioElement.src = newSrc;
        console.log('🔊 [PhoneNotification] Audio source updated:', newSrc);
      }
    }

    console.log('⚙️ [PhoneNotification] Settings updated:', this.settings);
  }

  getSettings(): PhoneNotificationSettings {
    return { ...this.settings };
  }

  isNotificationPlaying(): boolean {
    return this.isPlaying;
  }

  getStatus(): {
    isPlaying: boolean;
    ringCount: number;
    maxRings: number;
    audioReady: boolean;
    currentSrc: string | null;
  } {
    return {
      isPlaying: this.isPlaying,
      ringCount: this.ringCount,
      maxRings: this.settings.maxRings,
      audioReady: !!this.audioElement,
      currentSrc: this.audioElement?.src || null
    };
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('🔔 [PhoneNotification] Notification permission:', permission);
      return permission === 'granted';
    }
    return false;
  }

  // Enable user interaction for audio (required for mobile)
  enableAudioWithUserGesture(): void {
    if (this.audioElement) {
      // Play and immediately pause to enable audio context
      this.audioElement.play().then(() => {
        this.audioElement?.pause();
        console.log('🔊 [PhoneNotification] Audio context enabled with user gesture');
      }).catch(() => {
        console.log('🔊 [PhoneNotification] Audio context enable failed');
      });
    }
  }
}

// Export singleton instance
export const phoneNotificationService = PhoneNotificationService.getInstance();
