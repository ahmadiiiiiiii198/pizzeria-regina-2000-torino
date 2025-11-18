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
      'mailto:pizzeriaregin@example.com', // Replace with your email
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
