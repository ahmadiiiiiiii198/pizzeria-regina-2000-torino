#!/usr/bin/env node

/**
 * AUTOMATICALLY SETUP STRIPE WEBHOOK
 * Creates webhook endpoint in Stripe and shows the secret
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_URL = 'https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/stripe-webhook';

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env file!');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

console.log('═══════════════════════════════════════════════');
console.log('🔧 STRIPE WEBHOOK AUTO-SETUP');
console.log('═══════════════════════════════════════════════\n');

async function setupWebhook() {
  try {
    console.log('📋 Step 1: Checking existing webhooks...\n');
    
    // List existing webhook endpoints
    const existingEndpoints = await stripe.webhookEndpoints.list({
      limit: 100,
    });

    console.log(`Found ${existingEndpoints.data.length} existing webhook(s)\n`);

    // Check if our endpoint already exists
    const existingWebhook = existingEndpoints.data.find(
      endpoint => endpoint.url === WEBHOOK_URL
    );

    if (existingWebhook) {
      console.log('⚠️  Webhook endpoint already exists!');
      console.log(`   ID: ${existingWebhook.id}`);
      console.log(`   URL: ${existingWebhook.url}`);
      console.log(`   Status: ${existingWebhook.status}`);
      console.log(`   Events: ${existingWebhook.enabled_events.join(', ')}`);
      console.log('\n❓ What do you want to do?');
      console.log('   1. Use existing webhook (you need to get secret from Stripe Dashboard)');
      console.log('   2. Delete and recreate webhook (will give you new secret)');
      console.log('\nTo delete and recreate, run:');
      console.log(`   node delete-webhook.js ${existingWebhook.id}`);
      console.log('\nTo get the secret:');
      console.log('   → Go to: https://dashboard.stripe.com/webhooks');
      console.log(`   → Click on the endpoint`);
      console.log('   → Click "Reveal" under "Signing secret"');
      console.log('   → Copy the secret (starts with whsec_)\n');
      return;
    }

    console.log('📋 Step 2: Creating new webhook endpoint...\n');

    // Create webhook endpoint
    const webhook = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: [
        'checkout.session.completed',
        'payment_intent.payment_failed',
      ],
      description: 'Pizzeria Regina 2000 - Order Creation Webhook',
      api_version: '2023-10-16',
    });

    console.log('✅ WEBHOOK CREATED SUCCESSFULLY!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 WEBHOOK DETAILS:');
    console.log('═══════════════════════════════════════════════\n');
    console.log(`ID: ${webhook.id}`);
    console.log(`URL: ${webhook.url}`);
    console.log(`Status: ${webhook.status}`);
    console.log(`Events: ${webhook.enabled_events.join(', ')}`);
    console.log(`\n🔑 WEBHOOK SECRET: ${webhook.secret}`);
    console.log('\n⚠️  IMPORTANT: Copy this secret now! You won\'t see it again!\n');

    console.log('═══════════════════════════════════════════════');
    console.log('📋 NEXT STEP: ADD SECRET TO SUPABASE');
    console.log('═══════════════════════════════════════════════\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/settings/functions\n');
    console.log('2. Click "Add new secret"\n');
    console.log('3. Add:');
    console.log('   Name: STRIPE_WEBHOOK_SECRET');
    console.log(`   Value: ${webhook.secret}`);
    console.log('\n4. Click "Save"\n');
    console.log('5. Test with a payment!\n');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Authentication failed. Check your STRIPE_SECRET_KEY in .env');
    }
    process.exit(1);
  }
}

setupWebhook();
