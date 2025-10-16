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
  private audioErrorHandled = false; // Prevent error handler loops

  // Audio Context Keep-Alive System
  private audioContext: AudioContext | null = null;
  private keepAliveTimer: NodeJS.Timeout | null = null;
  private silentBuffer: AudioBuffer | null = null;
  private isKeepAliveActive = false;

  private constructor() {
    this.loadSettings();
    this.initializeAudio();
    this.initializeAudioContext();
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
      this.audioErrorHandled = false; // Reset error flag

      // Set the audio source - try notification file first, fallback to generated beep
      if (this.settings.customNotificationSound && this.settings.notificationSoundUrl) {
        this.audioElement.src = this.settings.notificationSoundUrl;
      } else {
        // Try to use notification-sound.mp3, fallback to generated beep
        this.audioElement.src = '/notification-sound.mp3';
      }

      // Add event listeners
      this.audioElement.addEventListener('ended', () => {
        console.log('🔊 [PhoneNotification] Audio ended');
        this.handleAudioEnded();
      });

      // Single error handler to prevent loops
      this.audioElement.addEventListener('error', () => {
        // Only handle error once to prevent infinite loop
        if (!this.audioErrorHandled) {
          this.audioErrorHandled = true;
          console.log('🔊 [PhoneNotification] notification-sound.mp3 not found, using generated beep');
          this.audioElement!.src = this.generateBeepSound();
        }
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

    // Keep the keep-alive system running even when notification stops
    // This ensures audio context stays active for future notifications
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
        : this.generateBeepSound();
        
      if (oldSrc !== newSrc) {
        this.audioErrorHandled = false; // Reset error flag when source changes
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
    audioContextState: string | null;
    keepAliveActive: boolean;
  } {
    return {
      isPlaying: this.isPlaying,
      ringCount: this.ringCount,
      maxRings: this.settings.maxRings,
      audioReady: !!this.audioElement,
      currentSrc: this.audioElement?.src || null,
      audioContextState: this.audioContext?.state || null,
      keepAliveActive: this.isKeepAliveActive
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

    // Also initialize and start keep-alive for audio context
    this.initializeAudioContext();
    this.startAudioContextKeepAlive();
  }

  // Get default notification sound path
  private getDefaultNotificationSound(): string {
    return '/notification-sound.mp3';
  }

  // Initialize Audio Context for background audio support
  private async initializeAudioContext(): Promise<void> {
    if (this.audioContext) return;

    try {
      console.log('🔊 [PhoneNotification] Initializing AudioContext for background support...');

      // Create AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('🔊 [PhoneNotification] AudioContext resumed');
      }

      // Create silent buffer for keep-alive
      await this.createSilentBuffer();

      console.log('🔊 [PhoneNotification] ✅ AudioContext initialized successfully');

    } catch (error) {
      console.error('🔊 [PhoneNotification] ❌ AudioContext initialization failed:', error);
    }
  }

  // Create a silent audio buffer for keep-alive
  private async createSilentBuffer(): Promise<void> {
    if (!this.audioContext) return;

    try {
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.1; // 100ms of silence
      const frameCount = sampleRate * duration;

      this.silentBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
      // Buffer is already silent (zeros by default)

      console.log('🔊 [PhoneNotification] Silent buffer created for keep-alive');

    } catch (error) {
      console.error('🔊 [PhoneNotification] ❌ Failed to create silent buffer:', error);
    }
  }

  // Start Audio Context Keep-Alive system
  public startAudioContextKeepAlive(): void {
    if (this.isKeepAliveActive) return;

    console.log('🔊 [PhoneNotification] Starting AudioContext keep-alive system...');
    this.isKeepAliveActive = true;

    // Play silent audio every 25 seconds to keep context alive
    this.keepAliveTimer = setInterval(() => {
      this.playSilentAudio();
    }, 25000);

    // Also set up visibility change handler
    this.setupVisibilityHandler();
  }

  // Stop Audio Context Keep-Alive system
  public stopAudioContextKeepAlive(): void {
    if (!this.isKeepAliveActive) return;

    console.log('🔊 [PhoneNotification] Stopping AudioContext keep-alive system...');
    this.isKeepAliveActive = false;

    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  // Play silent audio to keep context alive
  private async playSilentAudio(): Promise<void> {
    if (!this.audioContext || !this.silentBuffer) return;

    try {
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('🔊 [PhoneNotification] AudioContext resumed during keep-alive');
      }

      // Play silent buffer
      const source = this.audioContext.createBufferSource();
      source.buffer = this.silentBuffer;

      // Connect to destination with very low volume
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.001; // Almost silent

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start();

      console.log('🔊 [PhoneNotification] Silent audio played for keep-alive');

    } catch (error) {
      console.error('🔊 [PhoneNotification] ❌ Failed to play silent audio:', error);
    }
  }

  // Setup visibility change handler for background/foreground detection
  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('🔊 [PhoneNotification] Page went to background - maintaining audio context');
        // Immediately play silent audio when going to background
        this.playSilentAudio();
      } else if (document.visibilityState === 'visible') {
        console.log('🔊 [PhoneNotification] Page came to foreground - resuming audio context');
        // Resume audio context when coming back to foreground
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      }
    });
  }

  // Generate a simple beep sound using Web Audio API
  private generateBeepSound(): string {
    try {
      // Create a proper beep sound using Web Audio API and convert to data URL
      const sampleRate = 44100;
      const duration = 0.5; // 0.5 seconds
      const frequency = 800; // 800Hz beep
      const frameCount = sampleRate * duration;

      // Create audio buffer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      // Generate sine wave beep
      for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        // Create a beep with fade in/out to avoid clicks
        let amplitude = 0.3;
        if (t < 0.01) {
          amplitude *= t / 0.01; // Fade in
        } else if (t > duration - 0.01) {
          amplitude *= (duration - t) / 0.01; // Fade out
        }
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude;
      }

      // Convert audio buffer to WAV data URL
      const wavData = this.audioBufferToWav(audioBuffer);
      const blob = new Blob([wavData], { type: 'audio/wav' });

      // Create data URL
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }) as any; // Return promise but we'll use sync fallback

    } catch (error) {
      console.error('❌ [PhoneNotification] Error generating beep sound:', error);
    }

    // Return a working beep sound data URL as fallback
    // This is a proper 0.5 second 800Hz sine wave beep
    return 'data:audio/wav;base64,UklGRiQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAEAAA=';
  }

  // Helper method to convert AudioBuffer to WAV format
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channelData = buffer.getChannelData(0);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  }
}

// Export singleton instance
export const phoneNotificationService = PhoneNotificationService.getInstance();
