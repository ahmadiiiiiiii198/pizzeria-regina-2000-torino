import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    // Try to get webhook secret from environment first, then from database
    let webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      console.log('No env var found, reading webhook secret from database...')
      const { data: setting, error: settingError } = await supabaseClient
        .from('settings')
        .select('value')
        .eq('key', 'stripe_webhook_secret')
        .single()
      
      if (settingError || !setting) {
        throw new Error('Webhook secret not found in environment or database')
      }
      
      webhookSecret = setting.value
      console.log('✅ Webhook secret loaded from database')
    }

    if (!signature || !webhookSecret) {
      throw new Error('Missing stripe signature or webhook secret')
    }

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Received Stripe webhook:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('✅ Checkout session completed:', session.id)
        console.log('📦 Creating order from session metadata...')

        // 🔒 CRITICAL: CREATE ORDER NOW (after payment confirmed)
        // All order data is in session metadata
        const metadata = session.metadata
        if (!metadata) {
          console.error('❌ No metadata in session')
          break
        }

        // Parse order items from metadata
        const orderItems = JSON.parse(metadata.order_items || '[]')
        const coordinates = JSON.parse(metadata.coordinates || '{}')

        // Create order in database
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .insert({
            order_number: metadata.order_number,
            customer_name: metadata.customer_name,
            customer_email: metadata.customer_email,
            customer_phone: metadata.customer_phone,
            customer_address: metadata.customer_address,
            delivery_type: metadata.delivery_type,
            delivery_fee: parseFloat(metadata.delivery_fee || '0'),
            total_amount: parseFloat(metadata.total_amount || '0'),
            payment_status: 'paid',
            payment_method: metadata.payment_method,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            paid_amount: (session.amount_total || 0) / 100,
            paid_at: new Date().toISOString(),
            user_id: metadata.user_id !== 'null' ? metadata.user_id : null,
            metadata: {
              clientId: metadata.clientId,
              deviceFingerprint: metadata.deviceFingerprint,
              sessionId: metadata.sessionId,
              orderCreatedAt: new Date().toISOString(),
              isAuthenticatedOrder: metadata.isAuthenticatedOrder === 'true',
              deliveryFee: parseFloat(metadata.delivery_fee || '0'),
              coordinates: coordinates,
              formattedAddress: metadata.formattedAddress,
              stripeOrderCompleted: true
            }
          })
          .select()
          .single()

        if (orderError) {
          console.error('❌ Error creating order:', orderError)
          throw orderError
        }

        console.log('✅ Order created:', order.id)

        // Create order items
        const orderItemsToInsert = orderItems.map((item: any) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          unit_price: item.unit_price,
          special_requests: item.special_requests,
          toppings: item.toppings,
          metadata: {
            extras: item.extras,
            base_price: item.base_price,
            extras_price: item.extras_price
          }
        }))

        const { error: itemsError } = await supabaseClient
          .from('order_items')
          .insert(orderItemsToInsert)

        if (itemsError) {
          console.error('❌ Error creating order items:', itemsError)
          throw itemsError
        }

        console.log('✅ Order items created')

        // Create notification
        const { error: notificationError } = await supabaseClient
          .from('order_notifications')
          .insert({
            order_id: order.id,
            notification_type: 'new_order',
            title: 'Nuovo Ordine Pagato!',
            message: `New PAID order from ${metadata.customer_name} - €${metadata.total_amount}`,
            is_read: false,
            is_acknowledged: false
          })

        if (notificationError) {
          console.error('⚠️ Error creating notification:', notificationError)
        }

        // Create order status history
        const { error: historyError } = await supabaseClient
          .from('order_status_history')
          .insert({
            order_id: order.id,
            status: 'paid',
            notes: `Payment completed via Stripe. Session: ${session.id}`,
            created_by: 'stripe_webhook',
          })

        if (historyError) {
          console.error('⚠️ Error creating status history:', historyError)
        }

        console.log('✅ Order creation complete! Order:', order.order_number)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)

        // Find order by payment intent ID
        const { data: orders, error: findError } = await supabaseClient
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .limit(1)

        if (findError || !orders || orders.length === 0) {
          console.error('Could not find order for failed payment:', paymentIntent.id)
          break
        }

        const orderId = orders[0].id

        // Update order status
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({
            status: 'payment_failed',
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('Error updating failed payment order:', updateError)
          throw updateError
        }

        // Create order status history entry
        const { error: historyError } = await supabaseClient
          .from('order_status_history')
          .insert({
            order_id: orderId,
            status: 'payment_failed',
            notes: `Payment failed. Payment Intent: ${paymentIntent.id}. Reason: ${paymentIntent.last_payment_error?.message || 'Unknown'}`,
            created_by: 'stripe_webhook',
          })

        if (historyError) {
          console.error('Error creating failed payment history:', historyError)
        }

        console.log('Failed payment order updated:', orderId)
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400,
      },
    )
  }
})
