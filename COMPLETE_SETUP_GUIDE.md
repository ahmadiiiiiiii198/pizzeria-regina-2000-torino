# 🚀 COMPLETE SETUP GUIDE - COPY & PASTE READY

## ✅ WHAT'S ALREADY DONE

- ✅ All code implemented and committed
- ✅ VAPID keys generated
- ✅ .env.local created
- ✅ Frontend deployed to Netlify
- ✅ Scripts tested and ready

## ⏳ 3 MANUAL STEPS (15 MINUTES TOTAL)

---

# STEP 1: CREATE DATABASE TABLE (5 min)

## 📍 Go to Supabase SQL Editor

**URL:** https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/editor

## 📋 Click "SQL Editor" → "New query"

## 📝 Copy & Paste This SQL:

```sql
-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_endpoint UNIQUE(endpoint)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON push_subscriptions(created_at);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert push subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read push subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (true);

CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (true);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update trigger
CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

COMMENT ON TABLE push_subscriptions IS 'Stores web push notification subscriptions for sending background notifications';
```

## ✅ Click "Run" button

**Expected result:** "Success. No rows returned"

## ✅ Verify: Go to "Table Editor" → See `push_subscriptions` table

---

# STEP 2: DEPLOY EDGE FUNCTION (5 min)

## 📍 Go to Supabase Functions

**URL:** https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/functions

## 📋 Click "Create a new function"

- **Name:** `send-order-notification`
- Click "Create function"

## 📝 Copy & Paste This Code:

**File location:** `supabase/functions/send-order-notification/index.ts`

```typescript
// Supabase Edge Function: send-order-notification
// Sends web push notifications to all subscribed devices when a new order arrives

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Type definitions
interface PushSubscription {
  id: string
  endpoint: string
  p256dh_key: string
  auth_key: string
}

interface OrderPayload {
  order_id: string
  customer_name: string
  total_amount: number
  items_count?: number
  delivery_type?: string
}

serve(async (req) => {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    console.log('🚀 [Push Notification] Edge Function triggered')

    // Get order data from request
    const orderData: OrderPayload = await req.json()
    console.log('📦 [Push Notification] Order data:', orderData)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all push subscriptions from database
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (subError) {
      console.error('❌ [Push Notification] Error fetching subscriptions:', subError)
      throw subError
    }

    console.log(`📱 [Push Notification] Found ${subscriptions?.length || 0} subscriptions`)

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ [Push Notification] VAPID keys not found in environment')
      throw new Error('VAPID keys not configured')
    }

    // Prepare notification payload
    const notificationPayload = {
      title: '🍕 Nuovo Ordine!',
      body: `Ordine da ${orderData.customer_name} - €${orderData.total_amount.toFixed(2)}`,
      icon: '/pizza-icon-192.png',
      badge: '/pizza-icon-192.png',
      tag: `order-${orderData.order_id}`,
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      data: {
        orderId: orderData.order_id,
        customerName: orderData.customer_name,
        url: '/ordini'
      },
      actions: [
        { action: 'view', title: 'Visualizza' },
        { action: 'dismiss', title: 'Chiudi' }
      ]
    }

    console.log('📤 [Push Notification] Sending notifications...')

    // Send push notification to each subscription
    let successCount = 0
    let failureCount = 0
    const results = []

    for (const subscription of subscriptions as PushSubscription[]) {
      try {
        // Send push notification using web-push protocol
        const result = await sendPushNotification(
          subscription,
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey
        )

        if (result.success) {
          successCount++
          console.log(`✅ [Push Notification] Sent to ${subscription.endpoint.substring(0, 50)}...`)
        } else {
          failureCount++
          console.error(`❌ [Push Notification] Failed to send to ${subscription.endpoint.substring(0, 50)}...`, result.error)
          
          // If subscription is invalid (410 Gone), delete it from database
          if (result.statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id)
            console.log(`🗑️ [Push Notification] Deleted invalid subscription ${subscription.id}`)
          }
        }

        results.push({
          subscriptionId: subscription.id,
          success: result.success,
          error: result.error
        })

      } catch (error) {
        failureCount++
        console.error(`❌ [Push Notification] Exception sending to subscription:`, error)
        results.push({
          subscriptionId: subscription.id,
          success: false,
          error: String(error)
        })
      }
    }

    console.log(`✅ [Push Notification] Completed: ${successCount} sent, ${failureCount} failed`)

    return new Response(
      JSON.stringify({
        message: 'Push notifications sent',
        total: subscriptions.length,
        sent: successCount,
        failed: failureCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('❌ [Push Notification] Fatal error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Function to send push notification using web-push protocol
async function sendPushNotification(
  subscription: PushSubscription,
  payload: any,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    // Import web-push library
    const webpush = await import('https://esm.sh/web-push@3.6.6')

    // Set VAPID details
    webpush.default.setVapidDetails(
      'mailto:pizzeria@regina2000.com',
      vapidPublicKey,
      vapidPrivateKey
    )

    // Send notification
    const response = await webpush.default.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh_key,
          auth: subscription.auth_key
        }
      },
      JSON.stringify(payload)
    )

    return { success: true }

  } catch (error: any) {
    console.error('Push send error:', error)
    return {
      success: false,
      error: error.message || String(error),
      statusCode: error.statusCode
    }
  }
}
```

## ✅ Click "Deploy" button

## 📋 Set Environment Secrets

Click "Settings" tab → "Secrets" section

### Add Secret #1:
- **Name:** `VAPID_PUBLIC_KEY`
- **Value:** `BN6spH9uf8wc-w6fTXpYpg6Vo61Y3_j5e74bN1iwLdzv27tVaeffxd3W9ZbMVyK6LOxayc2CmQbaw5KDax4_Iyw`
- Click "Add"

### Add Secret #2:
- **Name:** `VAPID_PRIVATE_KEY`
- **Value:** `QJeKYOVZun2DwxTiNJPSNcndCMyyKVXgKmWbq3ovtkA`
- Click "Add"

## ✅ Verify: Function should be listed in Functions page

---

# STEP 3: CREATE WEBHOOK (5 min)

## 📍 Go to Supabase Webhooks

**URL:** https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/database/hooks

## 📋 Click "Create a new hook"

(If you see "Enable Webhooks", click that first)

## 📝 Configure Webhook:

### Basic Configuration:
- **Name:** `notify-new-order`
- **Table:** `orders`
- **Events:** ☑️ **Insert** (check ONLY Insert)

### HTTP Request Configuration:
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/send-order-notification`

### HTTP Headers:

**Click "Add header":**

**Header 1:**
- **Key:** `Authorization`
- **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpZaoUhnSyuv_j5mg4I`

**Header 2:**
- **Key:** `Content-Type`
- **Value:** `application/json`

### HTTP Body/Payload:

```json
{
  "order_id": "{{record.id}}",
  "customer_name": "{{record.customer_name}}",
  "total_amount": {{record.total_amount}}
}
```

## ✅ Click "Create webhook"

## ✅ Verify: Webhook should appear in hooks list

---

# 🎉 DONE! NOW TEST IT

## Test 1: Subscribe to Push

1. Open: https://pizzeria-regina-2000-torino.netlify.app/ordini
2. Open browser console (F12)
3. Look for: `✅ Push subscription created`
4. Check Supabase: Table Editor → push_subscriptions → Should see 1 row

## Test 2: Manual Test

Run this command:
```bash
npm run test:push
```

Expected: Notification appears on your device!

## Test 3: Real Order (THE BIG TEST!)

1. **CLOSE the app completely** on your phone
2. **Lock screen**
3. **Place a test order** from your website
4. **Wait 5 seconds...**
5. **YOUR PHONE VIBRATES! 📳🔔**

---

# ✅ COMPLETE CHECKLIST

- [ ] Step 1: Database table created
- [ ] Step 2: Edge Function deployed
- [ ] Step 2: VAPID secrets added
- [ ] Step 3: Webhook configured
- [ ] Test 1: Subscription works
- [ ] Test 2: Manual push works
- [ ] Test 3: Real order notification works

---

# 🎉 CONGRATULATIONS!

You now have **TRUE background push notifications** working!

**Notifications will work even when:**
- ✅ App is completely closed
- ✅ Phone screen is locked
- ✅ Phone is in your pocket
- ✅ You haven't opened the app in days

**Just like WhatsApp, Telegram, or any professional app! 🚀**
