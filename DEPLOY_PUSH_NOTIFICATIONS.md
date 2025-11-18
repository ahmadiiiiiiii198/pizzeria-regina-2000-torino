# 🚀 Complete Deployment Guide: Push Notifications

## ✅ Overview

This guide will help you deploy the complete Push Notification system so you get notifications even when the app is completely closed!

**Time Required:** ~30 minutes  
**Difficulty:** Medium  
**Cost:** FREE (using Supabase free tier)

---

## 📋 Prerequisites

- ✅ Supabase account (you already have this)
- ✅ VAPID keys generated (done! See `VAPID_KEYS_SECURE.txt`)
- ✅ Access to Supabase Dashboard
- ✅ Node.js installed

---

## 🎯 STEP 1: Create .env.local File

**In your project root**, create `.env.local`:

```bash
# Windows Command Prompt
cd "c:\Users\king of the kings\Downloads\pizzeria-regina-2000-torino-main"
type nul > .env.local
notepad .env.local
```

**Paste this content:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://sixnfemtvmighstbgrbd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I

# VAPID Keys (from VAPID_KEYS_SECURE.txt)
VITE_VAPID_PUBLIC_KEY=BN6spH9uf8wc-w6fTXpYpg6Vo61Y3_j5e74bN1iwLdzv27tVaeffxd3W9ZbMVyK6LOxayc2CmQbaw5KDax4_Iyw
VAPID_PRIVATE_KEY=QJeKYOVZun2DwxTiNJPSNcndCMyyKVXgKmWbq3ovtkA
```

**Save and close.**

---

## 🎯 STEP 2: Create Supabase Database Table

### Option A: Using Supabase Dashboard (EASY)

1. **Go to:** https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd
2. **Click:** SQL Editor (left sidebar)
3. **Click:** "+ New query"
4. **Copy-paste this SQL:**

```sql
-- Copy the content from: supabase/migrations/20241016_push_subscriptions.sql
```

**Open file:** `supabase/migrations/20241016_push_subscriptions.sql`  
**Copy all content** and paste into Supabase SQL Editor  
**Click:** "Run" button

### Option B: Using Supabase CLI (ADVANCED)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref sixnfemtvmighstbgrbd

# Run migrations
supabase db push
```

### Verify Table Created

1. **Go to:** Table Editor
2. **You should see:** `push_subscriptions` table
3. **Columns:** id, user_id, endpoint, p256dh_key, auth_key, created_at, etc.

---

## 🎯 STEP 3: Deploy Supabase Edge Function

### Option A: Using Supabase Dashboard (EASY)

1. **Go to:** https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/functions
2. **Click:** "Create Function"
3. **Function name:** `send-order-notification`
4. **Click:** "Create function"
5. **Copy-paste the code from:** `supabase/functions/send-order-notification/index.ts`
6. **Click:** "Deploy"

### Option B: Using Supabase CLI (RECOMMENDED)

```bash
# Make sure you're in project root
cd "c:\Users\king of the kings\Downloads\pizzeria-regina-2000-torino-main"

# Deploy the function
supabase functions deploy send-order-notification

# Set environment secrets
supabase secrets set VAPID_PUBLIC_KEY=BN6spH9uf8wc-w6fTXpYpg6Vo61Y3_j5e74bN1iwLdzv27tVaeffxd3W9ZbMVyK6LOxayc2CmQbaw5KDax4_Iyw
supabase secrets set VAPID_PRIVATE_KEY=QJeKYOVZun2DwxTiNJPSNcndCMyyKVXgKmWbq3ovtkA
```

### Set Environment Variables in Dashboard

If using Option A (Dashboard):

1. **Go to:** Project Settings → Edge Functions → Secrets
2. **Add these secrets:**
   - Name: `VAPID_PUBLIC_KEY`  
     Value: `BN6spH9uf8wc-w6fTXpYpg6Vo61Y3_j5e74bN1iwLdzv27tVaeffxd3W9ZbMVyK6LOxayc2CmQbaw5KDax4_Iyw`
   
   - Name: `VAPID_PRIVATE_KEY`  
     Value: `QJeKYOVZun2DwxTiNJPSNcndCMyyKVXgKmWbq3ovtkA`

3. **Click:** "Add secret" for each

### Test Edge Function

```bash
# Test the function manually
curl -X POST \
  https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/send-order-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test-123",
    "customer_name": "Test Customer",
    "total_amount": 25.50
  }'
```

---

## 🎯 STEP 4: Setup Database Trigger/Webhook

### Option A: Database Webhook (RECOMMENDED)

1. **Go to:** Database → Webhooks
2. **Click:** "Enable Webhooks" (if needed)
3. **Click:** "Create a new webhook"
4. **Configure:**
   - Name: `notify-new-order`
   - Table: `orders`
   - Events: ☑️ Insert
   - Type: `HTTP Request`
   - Method: `POST`
   - URL: `https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/send-order-notification`
   - HTTP Headers:
     ```
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I
     Content-Type: application/json
     ```
   - HTTP Params: Leave empty
   - Body: `{"order_id": "{{record.id}}", "customer_name": "{{record.customer_name}}", "total_amount": "{{record.total_amount}}"}`

5. **Click:** "Create webhook"

### Option B: Database Trigger (SQL)

If webhooks don't work, use SQL trigger:

1. **Go to:** SQL Editor
2. **Copy-paste from:** `supabase/migrations/20241016_orders_trigger.sql`
3. **Click:** "Run"

---

## 🎯 STEP 5: Build & Deploy Frontend

```bash
# Install dependencies (if not already)
npm install

# Build with new environment variables
npm run build

# Deploy to Netlify
git add -A
git commit -m "Add Push Notifications with VAPID keys"
git push origin main
```

**Wait 2-3 minutes for Netlify to deploy.**

---

## 🎯 STEP 6: Test Everything!

### Test 1: Subscribe to Push Notifications

1. **Open:** https://your-site.netlify.app/ordini
2. **Open DevTools Console** (F12)
3. **Look for these logs:**
   ```
   📱 [MobileNotification] Creating new push subscription...
   ✅ [MobileNotification] Push subscription created
   ✅ [MobileNotification] Push subscription saved to database
   ```

4. **Check Supabase Dashboard:**
   - Go to Table Editor → `push_subscriptions`
   - You should see your subscription!

### Test 2: Send Test Push (Manual)

**In Supabase SQL Editor:**

```sql
-- Manually trigger push notification
SELECT send_order_notification(
  'test-123',
  'Test Customer',
  25.50
);
```

Or use **Edge Function directly:**

1. Go to: Edge Functions → `send-order-notification`
2. Click: "Invoke function"
3. Paste:
```json
{
  "order_id": "test-order-123",
  "customer_name": "Test Customer",
  "total_amount": 25.50
}
```
4. Click: "Run"

**You should receive a notification!** 🔔

### Test 3: Create Real Order (FINAL TEST)

1. **CLOSE the /ordini app completely** (not just minimize!)
2. **Lock your phone screen**
3. **Place a test order** from your website
4. **Wait a few seconds...**
5. **Your phone should vibrate and show notification!** ✅

---

## 🎯 Troubleshooting

### "VAPID public key not found"

**Solution:**
- Make sure `.env.local` exists
- Make sure it contains `VITE_VAPID_PUBLIC_KEY=...`
- Restart dev server: `npm run dev`

### "No subscriptions found"

**Solution:**
- Open /ordini page
- Check DevTools console for subscription logs
- Check Supabase Table Editor → `push_subscriptions`

### "Edge Function not found"

**Solution:**
- Make sure function is deployed
- Check function URL: `https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/send-order-notification`
- Check function logs in Supabase Dashboard

### "Webhook not triggering"

**Solution:**
- Check Database → Webhooks → View logs
- Make sure webhook is enabled
- Try SQL trigger instead (Option B above)

### "Notification not showing when app closed"

**Possible causes:**
1. **Not subscribed:** Open app, subscribe first
2. **Browser killed:** Android battery optimization
3. **Webhook not setup:** Check Step 4
4. **VAPID keys wrong:** Check `.env.local` and Supabase secrets match

---

## ✅ Verification Checklist

Before marking as complete, verify:

- [ ] `.env.local` file created with VAPID keys
- [ ] `push_subscriptions` table exists in Supabase
- [ ] Edge Function `send-order-notification` deployed
- [ ] VAPID secrets set in Supabase Dashboard
- [ ] Database webhook/trigger configured
- [ ] Frontend rebuilt and deployed
- [ ] Test subscription successful
- [ ] Test notification received with app closed

---

## 🎉 Success!

If all tests pass, you now have **TRUE background push notifications**!

**How it works:**
```
New order placed
    ↓
Database INSERT to 'orders' table
    ↓
Webhook/Trigger fires
    ↓
Calls Edge Function: send-order-notification
    ↓
Edge Function:
  1. Fetches all push_subscriptions from database
  2. Sends push to Google/Mozilla/Apple push services
  3. Uses VAPID keys for authentication
    ↓
Browser receives push (even if app closed!)
    ↓
Service Worker wakes up
    ↓
Shows notification
    ↓
User taps notification
    ↓
App opens to /ordini page
```

**YOU'RE DONE!** 🎊

---

## 📞 Support

If you encounter issues:

1. Check DevTools Console for errors
2. Check Supabase Edge Function logs
3. Check Database Webhook logs
4. Verify all environment variables are set
5. Make sure app was subscribed at least once

**Need help? Contact IT support with:**
- Screenshots of errors
- DevTools console logs
- Supabase function logs
- What step you're stuck on
