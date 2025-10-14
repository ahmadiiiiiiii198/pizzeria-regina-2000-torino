# Cache Busting Implementation

This document describes the comprehensive cache busting strategy implemented for Pizzeria Regina 2000 Torino website.

## Features Implemented

### 1. HTML Meta Tags (`index.html`)
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```
- Forces browsers to never cache the HTML file
- Always fetches the latest version from the server

### 2. Service Worker with Versioning (`index.html`)
- Service Worker URL includes timestamp: `/sw.js?v=${Date.now()}`
- Automatic update check every 60 seconds
- User notification when new version is available
- Option to reload immediately or later

### 3. Build-time Cache Busting (`vite.config.ts`)
```typescript
entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`
chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`
assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
```
- Every build generates unique filenames with content hash + timestamp
- CSS code splitting enabled for better caching granularity
- Automatic chunking for vendor, router, UI, Supabase, and Stripe libraries

### 4. Version Tracking (`src/config/version.ts`)
- Dynamic version number: `1.0.${Date.now()}`
- Automatic cache clearing on version change
- Service Worker update triggering
- localStorage version comparison

### 5. Update Notification UI (`src/components/UpdateNotification.tsx`)
- Beautiful notification banner when updates are available
- User-friendly update flow
- Automatic cache clearing on update
- "Update Now" or "Later" options
- Italian language support

### 6. Application Entry Point (`src/main.tsx`)
- Version logging on app start
- Automatic version checking
- Cache clearing for outdated versions

## How It Works

### On Build
1. Vite generates unique filenames with content hash and build timestamp
2. All assets (JS, CSS, images) get unique names
3. HTML references these unique asset names

### On Load
1. Browser fetches fresh HTML (never cached)
2. HTML loads assets with unique names
3. App checks version on startup
4. Service Worker registers with timestamp
5. Version is stored in localStorage

### On Update Detection
1. Service Worker detects new version
2. OR localStorage version differs
3. UpdateNotification component shows banner
4. User can update immediately or dismiss
5. On update: all caches cleared + page reloaded

### Periodic Checks
- Service Worker updates every 60 seconds
- Version check every 5 minutes
- Automatic background refresh when new version available

## User Experience

### First Visit
- Fresh download of all assets
- Version stored in localStorage

### Return Visit (Same Version)
- Assets loaded from browser cache (fast)
- No unnecessary downloads

### Return Visit (New Version)
- HTML always fresh (no cache)
- New asset URLs force download of updated files
- Notification banner appears
- User chooses when to update

### After Update
- All caches cleared
- Page reloads with fresh content
- New version stored in localStorage

## Testing

### Test Cache Busting
1. Make a change to any component
2. Run `npm run build`
3. Check `dist/assets/` - all files have new unique names
4. Deploy and visit site
5. Update notification should appear for returning users

### Test Service Worker Update
1. Visit site
2. Open DevTools > Application > Service Workers
3. Click "Update" button
4. Update notification should appear

### Test Version Checking
1. Visit site
2. Open Console
3. Look for: `🚀 Pizzeria Regina 2000 - Version: 1.0.xxxxx`
4. Make code change and rebuild
5. Reload page
6. New version number should show
7. Update notification should appear

## Benefits

✅ Users always get the latest version
✅ No stale content issues
✅ Smooth update experience
✅ Automatic cache management
✅ Better performance (proper caching when no updates)
✅ User control over when to update
✅ Developer-friendly (automatic on build)

## Configuration

### To Change Update Check Frequency
Edit `index.html`:
```javascript
// Change 60000 (60 seconds) to desired interval
setInterval(() => {
  registration.update();
}, 60000);
```

### To Disable Update Notifications
Remove or comment out in `src/App.tsx`:
```typescript
<UpdateNotification />
```

### To Force Immediate Updates (No User Prompt)
Edit `index.html`:
```javascript
// Replace confirm prompt with direct reload
window.location.reload();
```

## Notes

- Service Worker caching is separate from browser cache
- Both are cleared on version update
- HTML is never cached (always fresh)
- Assets are cached until version changes
- User data (localStorage, IndexedDB) is preserved
