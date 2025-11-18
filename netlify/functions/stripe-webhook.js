/**
 * STRIPE WEBHOOK - NETLIFY FUNCTION
 * Creates orders AFTER payment confirmation
 * Reads secret from database (no env vars needed!)
 */

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://sixnfemtvmighstbgrbd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const signature = event.headers['stripe-signature'];
    const body = event.body;

    // Get webhook secret from database
    console.log('📋 Reading webhook secret from database...');
    const { data: setting, error: settingError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'stripe_webhook_secret')
      .single();

    if (settingError || !setting) {
      console.error('❌ Webhook secret not found in database');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Webhook secret not configured' }),
      };
    }

    const webhookSecret = setting.value;
    console.log('✅ Webhook secret loaded from database');

    // Verify webhook signature
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      };
    }

    console.log('✅ Webhook verified:', stripeEvent.type);

    // Handle checkout.session.completed
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      console.log('💳 Processing completed checkout session:', session.id);

      const metadata = session.metadata;
      if (!metadata) {
        console.error('❌ No metadata in session');
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      // Parse order data from metadata
      const orderItems = JSON.parse(metadata.order_items || '[]');
      const coordinates = JSON.parse(metadata.coordinates || '{}');

      // Create order
      const { data: order, error: orderError } = await supabase
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
          stripe_payment_intent_id: session.payment_intent,
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
            stripeOrderCompleted: true,
          },
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw orderError;
      }

      console.log('✅ Order created:', order.id);

      // Create order items
      const orderItemsToInsert = orderItems.map((item) => ({
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
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error('❌ Error creating order items:', itemsError);
      } else {
        console.log('✅ Order items created');
      }

      // Create notification
      await supabase.from('order_notifications').insert({
        order_id: order.id,
        notification_type: 'new_order',
        title: 'Nuovo Ordine Pagato!',
        message: `New PAID order from ${metadata.customer_name} - €${metadata.total_amount}`,
        is_read: false,
        is_acknowledged: false,
      });

      console.log('✅ Notification created');
      console.log('🎉 Order processing complete!');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
