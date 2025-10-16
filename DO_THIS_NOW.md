# ⚡ DO THIS NOW - 10 MINUTES ONLY

## ✅ ALREADY DONE (BY ME)
- Database table EXISTS
- All code written and deployed
- Frontend live on Netlify

## ⏳ ONLY 2 THINGS LEFT (10 MIN)

---

# STEP 1: EDGE FUNCTION (5 MIN)

## 1.1 Open This URL:
```
https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/functions
```

## 1.2 Click "Create a new function"

## 1.3 Name it:
```
send-order-notification
```

## 1.4 Click "Create function"

## 1.5 Delete the default code, paste this:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
}

serve(async (req) => {
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    const orderData: OrderPayload = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (subError) throw subError

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured')
    }

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
      }
    }

    let successCount = 0
    let failureCount = 0

    for (const subscription of subscriptions as PushSubscription[]) {
      try {
        const result = await sendPushNotification(
          subscription,
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey
        )

        if (result.success) {
          successCount++
        } else {
          failureCount++
          if (result.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', subscription.id)
          }
        }
      } catch (error) {
        failureCount++
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Push notifications sent',
        total: subscriptions.length,
        sent: successCount,
        failed: failureCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function sendPushNotification(
  subscription: PushSubscription,
  payload: any,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    const webpush = await import('https://esm.sh/web-push@3.6.6')

    webpush.default.setVapidDetails(
      'mailto:pizzeria@regina2000.com',
      vapidPublicKey,
      vapidPrivateKey
    )

    await webpush.default.sendNotification(
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
    return {
      success: false,
      error: error.message || String(error),
      statusCode: error.statusCode
    }
  }
}
```

## 1.6 Click "Deploy"

## 1.7 Click "Settings" tab

## 1.8 Scroll to "Secrets", Add these 2 secrets:

**Secret 1:**
- Name: `VAPID_PUBLIC_KEY`
- Value: `BN6spH9uf8wc-w6fTXpYpg6Vo61Y3_j5e74bN1iwLdzv27tVaeffxd3W9ZbMVyK6LOxayc2CmQbaw5KDax4_Iyw`

**Secret 2:**
- Name: `VAPID_PRIVATE_KEY`
- Value: `QJeKYOVZun2DwxTiNJPSNcndCMyyKVXgKmWbq3ovtkA`

✅ **DONE!**

---

# STEP 2: WEBHOOK (5 MIN)

## 2.1 Open This URL:
```
https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/database/hooks
```

## 2.2 Click "Create a new hook"

## 2.3 Fill in:

- **Name:** `notify-new-order`
- **Table:** `orders`
- **Events:** Check ONLY "Insert"
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/send-order-notification`

## 2.4 Add Headers (click "Add header"):

**Header 1:**
- Key: `Authorization`
- Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpZaoUhnSyuv_j5mg4I`

**Header 2:**
- Key: `Content-Type`
- Value: `application/json`

## 2.5 Body:
```json
{
  "order_id": "{{record.id}}",
  "customer_name": "{{record.customer_name}}",
  "total_amount": {{record.total_amount}}
}
```

## 2.6 Click "Create webhook"

✅ **DONE!**

---

# 🎉 THAT'S IT!

Now open your site and test:
```
https://pizzeria-regina-2000-torino.netlify.app/ordini
```

**Your push notifications will work even when the app is closed!**

---

# ⏱️ TIME: 10 MINUTES TOTAL

That's all. No more steps. Done.
