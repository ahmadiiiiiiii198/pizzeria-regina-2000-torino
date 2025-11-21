// ═══════════════════════════════════════════════════════════════════════
// STRIPE WEBHOOK EDGE FUNCTION
// ═══════════════════════════════════════════════════════════════════════

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
    console.log('🎯 Webhook received!')

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // ⚠️ IMPORTANT: Connect to ORIGINAL database (not this project's database)
    // FALLBACK: Use hardcoded Anon Key if Service Key is missing
    const MAIN_DB_URL = 'https://sixnfemtvmighstbgrbd.supabase.co'
    const MAIN_DB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I'
    
    const supabaseClient = createClient(
      Deno.env.get('ORIGINAL_SUPABASE_URL') || MAIN_DB_URL,
      Deno.env.get('ORIGINAL_SERVICE_ROLE_KEY') || MAIN_DB_ANON_KEY
    )
    
    console.log('✅ Connected to original database')

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    // Get webhook secret from environment variable OR database
    let webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      console.log('⚠️ STRIPE_WEBHOOK_SECRET not in env, fetching from database...')
      
      const { data: setting, error: settingError } = await supabaseClient
        .from('settings')
        .select('value')
        .eq('key', 'stripe_webhook_secret')
        .single()
        
      if (settingError || !setting) {
        console.error('❌ Failed to fetch webhook secret from DB:', settingError)
        throw new Error('Webhook secret not configured in Env or DB')
      }
      
      webhookSecret = setting.value
      console.log('✅ Webhook secret loaded from database')
    } else {
      console.log('✅ Webhook secret loaded from environment')
    }
    
    if (!signature) {
      throw new Error('Missing stripe signature')
    }

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log('✅ Webhook verified! Event type:', event.type)
    
    // Handle event
    await handleEvent(event, supabaseClient)

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handleEvent(event: any, supabaseClient: any) {
    console.log('🎯 handleEvent called with event type:', event.type)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('💳 Checkout session completed:', session.id)
      console.log('📋 Session metadata:', JSON.stringify(session.metadata))

      const metadata = session.metadata
      if (!metadata) {
        console.error('❌ No metadata in session')
        throw new Error('No metadata in checkout session')
      }
      
      if (!metadata.order_number) {
        console.error('❌ No order_number in metadata')
        throw new Error('No order_number in metadata')
      }

      const orderNumber = metadata.order_number
      console.log(`🔍 Looking for existing order: ${orderNumber}`)

      // Find existing order by order_number
      const { data: existingOrder, error: findError } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .single()

      let order

      if (existingOrder && !findError) {
        // UPDATE existing order
        console.log('✅ Found existing order:', existingOrder.id)
        console.log('🔧 Updating to CONFIRMED and PAID...')
        
        const { data: updatedOrder, error: updateError } = await supabaseClient
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('id', existingOrder.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ Error updating order:', updateError)
          throw new Error(`Order update failed: ${updateError.message}`)
        }

        order = updatedOrder
        console.log('✅ Order updated to CONFIRMED! ID:', order.id)

      } else {
        // FALLBACK: Create new order if not found
        console.log('⚠️ Existing order not found, creating new one...')
        
        const orderItems = JSON.parse(metadata.order_items || '[]')
        const coordinates = JSON.parse(metadata.coordinates || '{}')

        const { data: newOrder, error: orderError } = await supabaseClient
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
            status: 'confirmed',
            payment_method: 'stripe',
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
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
              stripeOrderCompleted: true,
            },
          })
          .select()
          .single()

        if (orderError) {
          console.error('❌ Error creating order:', orderError)
          throw new Error(`Order creation failed: ${orderError.message}`)
        }

        order = newOrder
        console.log('✅ Order created in database! ID:', order.id)

        // Create order items (only for new orders)
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
            extras_price: item.extras_price,
          },
        }))

        const { error: itemsError } = await supabaseClient
          .from('order_items')
          .insert(orderItemsToInsert)

        if (itemsError) {
          console.error('❌ Error creating order items:', itemsError)
        } else {
          console.log(`✅ Created ${orderItemsToInsert.length} order items`)
        }
      }

      // Create notification
      const { error: notificationError } = await supabaseClient
        .from('order_notifications')
        .insert({
          order_id: order.id,
          notification_type: 'new_order',
          title: 'Nuovo Ordine Pagato!',
          message: `New PAID order from ${metadata.customer_name} - €${metadata.total_amount}`,
          is_read: false,
          is_acknowledged: false,
        })

      if (notificationError) {
        console.error('⚠️ Error creating notification:', notificationError)
      } else {
        console.log('✅ Notification created')
      }

      console.log('🎉 Order processing complete! Order number:', order.order_number)
    }
}
