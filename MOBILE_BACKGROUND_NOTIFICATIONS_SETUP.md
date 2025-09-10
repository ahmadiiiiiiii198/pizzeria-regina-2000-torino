# 📱 Mobile Background Notifications Setup Guide

## 🎯 **Overview**

This system enables order notification sounds even when the ordini (orders) page is running in the background on mobile devices (Android and iOS).

## 🚀 **Features Implemented**

### ✅ **1. Background Order Service** (`src/services/backgroundOrderService.ts`)
- **Real-time order monitoring** using Supabase subscriptions
- **Wake Lock API** to keep screen active when possible
- **Automatic retry logic** for connection failures
- **Page visibility detection** to resume monitoring when app becomes visible
- **Admin page detection** to only play sounds on admin pages

### ✅ **2. Phone Notification Service** (`src/services/phoneNotificationService.ts`)
- **Audio notifications** with custom sounds
- **iOS-specific audio handling** using the existing iosAudioFix utility
- **Configurable ring patterns** (duration, interval, max rings)
- **Volume control** and mute functionality
- **User gesture handling** for mobile audio permissions

### ✅ **3. Mobile Background Notification Service** (`src/services/mobileBackgroundNotificationService.ts`)
- **Coordinates all notification services**
- **Service Worker integration** for true background notifications
- **Push notification support** (ready for VAPID keys)
- **Mobile device detection**
- **Auto-initialization on admin pages**

### ✅ **4. Enhanced Service Worker** (`public/sw.js`)
- **Background order monitoring** even when app is closed
- **Browser notifications** with action buttons
- **Message passing** between service worker and main app
- **Automatic order checking** with configurable intervals
- **Notification click handling** to open the orders page

### ✅ **5. Mobile Notification Manager Component** (`src/components/MobileBackgroundNotificationManager.tsx`)
- **Visual status dashboard** showing all service states
- **Toggle controls** for enabling/disabling notifications
- **Test notification functionality**
- **Permission request handling**
- **Mobile-specific instructions**

## 📋 **Setup Instructions**

### **1. Automatic Setup**
The system automatically initializes when you visit the `/ordini` page:

1. **Navigate to** `/ordini` (orders page)
2. **Grant permissions** when prompted for notifications
3. **Enable notifications** using the toggle in the notification manager
4. **Test the system** using the "Test Notifica" button

### **2. Manual Configuration**

#### **Enable Wake Lock (Optional)**
```javascript
// The system automatically requests wake lock to keep screen active
// No manual configuration needed
```

#### **Configure Notification Settings**
```javascript
// Adjust notification settings via the UI or programmatically:
mobileBackgroundNotificationService.updateSettings({
  enabled: true,
  useWakeLock: true,
  usePushNotifications: true,
  useServiceWorker: true
});
```

#### **Customize Audio Settings**
```javascript
// Customize phone notification settings:
phoneNotificationService.updateSettings({
  volume: 0.8,
  ringDuration: 3,
  ringInterval: 1,
  maxRings: 10
});
```

## 📱 **Mobile-Specific Instructions**

### **For iOS (Safari)**
1. **Add to Home Screen**: Tap Share → Add to Home Screen for better PWA support
2. **Keep Safari Open**: Don't completely close Safari
3. **Grant Permissions**: Allow notifications when prompted
4. **Avoid Low Power Mode**: Disable Low Power Mode for better background performance

### **For Android (Chrome)**
1. **Keep Chrome Open**: Don't completely close Chrome
2. **Disable Battery Optimization**: Go to Settings → Apps → Chrome → Battery → Don't optimize
3. **Grant Permissions**: Allow notifications when prompted
4. **Pin Tab**: Pin the orders tab for better persistence

## 🔧 **Technical Details**

### **How It Works**

1. **Foreground Monitoring**: When the ordini page is active, real-time Supabase subscriptions detect new orders immediately
2. **Background Monitoring**: When the page goes to background, the service worker continues checking for new orders
3. **Audio Notifications**: Phone notification service plays audio alerts with iOS-specific handling
4. **Browser Notifications**: System notifications appear even when the app is backgrounded
5. **Wake Lock**: Keeps the screen active when possible to maintain audio capabilities

### **Browser Limitations**

#### **iOS Safari**
- ❌ **No true background audio** - audio stops when app is truly backgrounded
- ✅ **Browser notifications work** when app is backgrounded
- ✅ **Audio resumes** when app becomes visible again
- ✅ **PWA mode helps** - add to home screen for better support

#### **Android Chrome**
- ⚠️ **Limited background audio** - depends on battery optimization settings
- ✅ **Browser notifications work** when app is backgrounded
- ✅ **Service worker continues** checking for orders
- ✅ **Better PWA support** than iOS

### **Fallback Strategies**

1. **Real-time + Polling**: Uses both Supabase real-time and periodic polling
2. **Service Worker Backup**: Service worker continues monitoring when main app is backgrounded
3. **Visual Notifications**: Browser notifications when audio isn't available
4. **Automatic Resume**: Audio notifications resume when app becomes visible

## 🧪 **Testing**

### **Test Notification System**
1. Go to `/ordini` page
2. Click "Test Notifica" button
3. Should hear audio notification and see browser notification

### **Test Background Behavior**
1. Enable notifications on `/ordini` page
2. Switch to another app or tab
3. Create a test order (or wait for real order)
4. Should receive browser notification
5. Return to ordini page - audio should resume if there are unread notifications

### **Test Mobile Scenarios**
1. **Screen Lock Test**: Lock phone screen, create order, should get notification
2. **App Switch Test**: Switch to another app, create order, should get notification
3. **Browser Background Test**: Put browser in background, create order, should get notification

## ⚙️ **Configuration Options**

### **Background Order Service Settings**
```javascript
{
  enabled: true,           // Enable/disable background monitoring
  soundEnabled: true,      // Enable/disable audio notifications
  checkInterval: 5000,     // Polling interval in milliseconds
  maxRetries: 3           // Max connection retry attempts
}
```

### **Phone Notification Settings**
```javascript
{
  enabled: true,                    // Enable/disable phone notifications
  customNotificationSound: false,   // Use custom sound file
  notificationSoundUrl: '/notification-sound.mp3',
  volume: 0.8,                     // Audio volume (0.0 - 1.0)
  ringDuration: 3,                 // Ring duration in seconds
  ringInterval: 1,                 // Interval between rings in seconds
  maxRings: 10                     // Maximum number of rings
}
```

### **Mobile Notification Settings**
```javascript
{
  enabled: true,                   // Enable/disable mobile notifications
  useWakeLock: true,              // Use wake lock API
  usePushNotifications: true,      // Enable push notifications
  useServiceWorker: true,         // Use service worker
  enableOnMobileOnly: false,      // Only enable on mobile devices
  autoStartOnAdminPages: true     // Auto-start on admin pages
}
```

## 🚨 **Troubleshooting**

### **No Audio Notifications**
1. Check if you're on an admin page (`/ordini`, `/admin`, `/orders`)
2. Ensure notifications are enabled in the UI
3. Grant notification permissions when prompted
4. Try the "Test Notifica" button
5. Check browser console for error messages

### **No Browser Notifications**
1. Grant notification permissions in browser settings
2. Check if notifications are blocked for the site
3. Ensure service worker is registered (check DevTools → Application → Service Workers)

### **Background Monitoring Not Working**
1. Keep the browser/app open (don't completely close)
2. Disable battery optimization for the browser (Android)
3. Add to home screen (iOS)
4. Check service worker status in the notification manager

### **iOS-Specific Issues**
1. Add to home screen for better PWA support
2. Keep Safari open in background
3. Disable Low Power Mode
4. Audio will resume when app becomes visible

### **Android-Specific Issues**
1. Disable battery optimization for Chrome
2. Don't use "Don't keep activities" developer option
3. Pin the tab in Chrome
4. Grant all requested permissions

## 📊 **Status Monitoring**

The Mobile Background Notification Manager shows real-time status of:
- ✅ **Mobile Device Detection**
- ✅ **Admin Page Detection**
- ✅ **Service Worker Status**
- ✅ **Background Service Status**
- ✅ **Notification Permissions**
- ✅ **Audio Playback Status**

## 🔄 **Updates and Maintenance**

### **Restart Server After Changes**
Always restart the development server after making changes to service worker or notification services:

```bash
npm run dev
```

### **Clear Service Worker Cache**
If experiencing issues, clear service worker cache:
1. Open DevTools → Application → Service Workers
2. Click "Unregister" next to the service worker
3. Refresh the page to re-register

### **Update Notification Sounds**
Place custom notification sounds in the `public` folder and update the settings:
```javascript
phoneNotificationService.updateSettings({
  customNotificationSound: true,
  notificationSoundUrl: '/your-custom-sound.mp3'
});
```

## 🎉 **Success Indicators**

When everything is working correctly, you should see:
- ✅ Green status indicators in the notification manager
- 🔊 Audio notifications when new orders arrive
- 🔔 Browser notifications when app is backgrounded
- 📱 Notifications work even when switching apps
- 🔋 Wake lock keeps screen active (when supported)

The system provides the best possible mobile background notification experience within browser limitations!
