// Local development server for Stripe payment testing
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = 3003;

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());
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
