# Netlify Cache Busting Solution ✅

## The Problem
Netlify caches responses at the CDN edge level. For Single Page Applications (SPAs), improper cache configuration can cause users to receive stale `index.html` files, which reference old JavaScript/CSS bundles that may no longer exist on the server.

## The Solution

### Three-Layer Approach

#### 1. **Server-Side Headers (Netlify)**
The most critical layer - configured in `netlify.toml` and `public/_headers`:

```toml
# NEVER cache HTML files
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"

# Cache hashed assets FOREVER (immutable)
[[headers]]
  for = "/assets/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Why this works:**
- `index.html` is **never cached** - always fetched fresh from server
- Assets with content hashes (e.g., `app.abc123.js`) are cached forever with `immutable`
- When you deploy, new assets get new hashes, old URLs become invalid
- Fresh `index.html` references the new hashed assets

#### 2. **Build-Time Version Injection**
Stable version number in `vite-plugins/inject-version.ts`:

```typescript
const buildTimestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
const version = `${packageVersion}.${buildTimestamp}`;
// e.g., "1.0.0.20251016"
```

**Why this works:**
- Version changes only on actual builds, not during hot reload
- Date-based versioning is human-readable and sequential
- No `Date.now()` loops

#### 3. **Client-Side Version Tracking**
Lightweight script in `index.html`:

```javascript
const storedVersion = localStorage.getItem('pizzeria_app_version');
if (storedVersion !== APP_VERSION) {
  // Clear service worker caches
  caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
  localStorage.setItem('pizzeria_app_version', APP_VERSION);
}
```

**Why this works:**
- Simple version comparison
- Clears Service Worker caches when version changes
- No reload loops (Netlify headers already ensure fresh HTML)

## Files Configured

### 1. `netlify.toml`
Primary Netlify configuration with cache headers for:
- ✅ HTML files (never cache)
- ✅ Hashed assets in `/assets/` (cache forever)
- ✅ Service worker (never cache)
- ✅ Manifest (check occasionally)
- ✅ Images (cache 1 week)
- ✅ Fonts (cache 1 year)

### 2. `public/_headers`
Backup configuration file that gets deployed with the site. Uses Netlify's `_headers` file format.

### 3. `index.html`
- Simplified cache busting script
- Service Worker registration (production only)
- Version tracking in localStorage

### 4. `vite-plugins/inject-version.ts`
- Reads version from `package.json`
- Adds date-based build timestamp
- Replaces `{{BUILD_VERSION}}` placeholder

### 5. `vite.config.ts`
- Content-hash based output filenames
- No-cache headers for dev server
- Code splitting for optimal caching

## How It Works in Production

### Deployment Flow
```
1. Developer runs: npm run build
2. Vite generates hashed filenames: app.abc123.js
3. Version plugin injects: 1.0.0.20251016
4. Deploy to Netlify
5. Netlify applies cache headers from netlify.toml
```

### User Experience Flow

**First Visit:**
```
1. Browser requests index.html
2. Netlify serves with "no-cache" headers
3. index.html loads app.abc123.js (hashed)
4. JavaScript runs, stores version in localStorage
```

**After New Deployment:**
```
1. Browser requests index.html (NOT cached - always fresh)
2. New index.html references app.xyz789.js (new hash)
3. Browser downloads new JavaScript
4. Version check detects change
5. Clears Service Worker caches
6. App runs with new version
```

## Cache Strategy Breakdown

| Resource Type | Cache Strategy | Duration | Why |
|--------------|----------------|----------|-----|
| `index.html` | No cache | Always fresh | Entry point must always be current |
| `/assets/*.js` | Immutable | 1 year | Content hash changes when file changes |
| `/assets/*.css` | Immutable | 1 year | Content hash changes when file changes |
| `sw.js` | No cache | Always fresh | Service Worker must update |
| `manifest.json` | No cache | Check each time | May contain updated info |
| Images | Public cache | 1 week | Balance between performance and updates |
| Fonts | Immutable | 1 year | Rarely change |

## Testing

### Test Cache Headers
```bash
# Check index.html headers
curl -I https://your-site.netlify.app/

# Check asset headers
curl -I https://your-site.netlify.app/assets/index.abc123.js
```

**Expected Results:**

**index.html:**
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

**Hashed assets:**
```
Cache-Control: public, max-age=31536000, immutable
```

### Test Version Update
1. Note current version in console
2. Deploy a new version
3. Visit site (hard refresh: Ctrl+Shift+R)
4. Check console for: `🆕 New version detected`
5. Verify app loads correctly

### Verify No Caching Issues
```javascript
// Run in browser console
localStorage.getItem('pizzeria_app_version')
// Should show current version like "1.0.0.20251016"
```

## Troubleshooting

### Issue: Still seeing old content after deployment

**Solutions:**
1. Check Netlify deploy log - ensure build completed
2. Verify cache headers:
   ```bash
   curl -I https://your-site.netlify.app/
   ```
3. Clear browser cache manually (Ctrl+Shift+Delete)
4. Try incognito/private mode
5. Check version in console:
   ```javascript
   localStorage.getItem('pizzeria_app_version')
   ```

### Issue: Assets failing to load (404 errors)

**Possible Causes:**
- Deployment didn't complete
- Old Service Worker serving stale cache
- Corrupted browser cache

**Solutions:**
1. Clear Service Worker:
   ```javascript
   navigator.serviceWorker.getRegistrations()
     .then(regs => regs.forEach(reg => reg.unregister()));
   ```
2. Clear all caches:
   ```javascript
   caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
   ```
3. Hard refresh: Ctrl+Shift+R

### Issue: Infinite loops in development

**This shouldn't happen anymore!** But if it does:
- Service Worker is disabled on localhost
- Version only changes on builds, not hot reload
- No automatic reloads in the code

## Netlify-Specific Features Used

### 1. Global CDN
- Headers applied at edge locations worldwide
- Fast cache lookups close to users

### 2. Header Priority
Netlify processes headers in this order:
1. `_headers` file (most specific)
2. `netlify.toml` headers
3. Default Netlify headers

### 3. Immutable Caching
The `immutable` directive tells browsers:
- Don't check if this file has changed
- Use cached version without validation
- Perfect for content-hashed assets

### 4. SPA Redirect
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
All routes serve `index.html` (React Router handles routing)

## Best Practices

### ✅ DO
- Always use `no-cache` for `index.html`
- Use content hashes for assets
- Use `immutable` for hashed assets
- Test after every deployment
- Monitor console for version messages

### ❌ DON'T
- Cache `index.html` or any HTML files
- Use `Date.now()` for versioning
- Rely only on client-side cache busting
- Deploy without testing headers
- Ignore 404 errors in console

## Performance Impact

### Before (Poor Caching)
- ❌ Users stuck on old version
- ❌ Manual cache clearing required
- ❌ Support burden
- ❌ Inconsistent user experience

### After (Optimal Caching)
- ✅ Instant updates on new deployments
- ✅ Optimal CDN caching for performance
- ✅ Reduced server requests
- ✅ Consistent experience for all users
- ✅ No support issues

### Metrics
- **First visit:** Normal loading time
- **Repeat visit:** Instant (cached assets)
- **After deployment:** One-time fresh fetch
- **Server requests:** Minimal (only uncached resources)

## Version History
- **v1 (Old):** Client-side only, used `Date.now()`, caused loops
- **v2 (Current):** Netlify headers + stable versioning, no loops, optimal caching

## Related Documentation
- [Netlify Caching Docs](https://docs.netlify.com/platform/caching/)
- [Netlify Custom Headers](https://docs.netlify.com/manage/routing/headers/)
- [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Google Web Fundamentals - HTTP Caching](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)

## Support
If issues persist after following this guide:
1. Check Netlify deploy logs
2. Verify headers with curl
3. Test in incognito mode
4. Clear all browser data
5. Check browser console for errors

## Date Implemented
October 16, 2025

## Status
✅ **Production Ready** - Tested and working on Netlify
