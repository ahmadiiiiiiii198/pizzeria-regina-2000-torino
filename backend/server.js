// Local development server for Stripe payment testing
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = 3003;

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());

// Webhook endpoint needs raw body for signature verification
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    console.log('🎯 Webhook received!');

    // Get webhook secret from database
    const { data: setting, error: settingError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'stripe_webhook_secret')
      .single();

    if (settingError || !setting) {
      console.error('❌ Webhook secret not found in database');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    const webhookSecret = setting.value;
    console.log('✅ Webhook secret loaded from database');

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      console.log('✅ Webhook verified:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('💳 Processing completed checkout session:', session.id);

      const metadata = session.metadata;
      if (!metadata || !metadata.order_items) {
        console.error('❌ No metadata in session');
        return res.json({ received: true, message: 'No order data' });
      }

      // Parse order data
      const orderItems = JSON.parse(metadata.order_items);
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
        return res.status(500).json({ error: 'Order creation failed' });
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

      await supabase.from('order_items').insert(orderItemsToInsert);
      console.log('✅ Order items created');

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

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// All other routes use JSON middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🍕 Pizzeria Regina 2000 - Stripe Payment Server',
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
    timestamp: new Date().toISOString()
  });
});

// Create Stripe checkout session (matches Netlify function behavior)
app.post('/create-checkout-session', async (req, res) => {
  console.log('\n🚀 Creating Stripe checkout session...');
  console.log('📋 Request body:', JSON.stringify(req.body, null, 2));

  try {
    const requestData = req.body;

    // Validate required fields
    if (!requestData.line_items || !Array.isArray(requestData.line_items)) {
      console.error('❌ Validation failed: line_items is missing or not an array');
      return res.status(400).json({
        error: 'line_items is required and must be an array'
      });
    }

    if (!requestData.customer_email) {
      console.error('❌ Validation failed: customer_email is missing');
      return res.status(400).json({
        error: 'customer_email is required'
      });
    }

    if (!requestData.success_url || !requestData.cancel_url) {
      console.error('❌ Validation failed: success_url or cancel_url is missing');
      return res.status(400).json({
        error: 'success_url and cancel_url are required'
      });
    }

    // Log line items for debugging
    console.log('📦 Line items:', JSON.stringify(requestData.line_items, null, 2));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: requestData.payment_method_types || ['card'],
      line_items: requestData.line_items,
      mode: requestData.mode || 'payment',
      customer_email: requestData.customer_email,
      billing_address_collection: requestData.billing_address_collection || 'required',
      shipping_address_collection: requestData.shipping_address_collection,
      success_url: requestData.success_url,
      cancel_url: requestData.cancel_url,
      metadata: requestData.metadata || {},
    });

    console.log('✅ Stripe session created successfully!');
    console.log('🆔 Session ID:', session.id);
    console.log('🔗 Checkout URL:', session.url);

    res.json({
      id: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('❌ Stripe checkout session creation failed:', error);
    
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
      details: error.raw ? error.raw.message : null
    });
  }
});

// Test endpoint to verify Stripe connection
app.get('/test-stripe', async (req, res) => {
  try {
    // Try to retrieve account info
    const account = await stripe.accounts.retrieve();
    
    res.json({
      success: true,
      message: 'Stripe connection successful!',
      account: {
        id: account.id,
        business_name: account.business_profile?.name,
        country: account.country,
        type: account.type
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stripe connection failed',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🍕 Pizzeria Regina 2000 - Local Development Server');
  console.log('='.repeat(60));
  console.log(`\n✅ Server running on: http://localhost:${PORT}`);
  console.log(`✅ Stripe endpoint: http://localhost:${PORT}/create-checkout-session`);
  console.log(`✅ Test Stripe: http://localhost:${PORT}/test-stripe`);
  console.log(`\n🔑 Stripe Secret Key: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`\n💡 Ready to process payments!`);
  console.log('='.repeat(60) + '\n');
});
