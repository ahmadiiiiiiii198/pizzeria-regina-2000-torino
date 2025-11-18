#!/usr/bin/env node

/**
 * TEST IF WEBHOOK IS READY
 * Checks if webhook endpoint and secret are configured
 */

import fs from 'fs';

console.log('═══════════════════════════════════════════════');
console.log('🔍 TESTING WEBHOOK READINESS');
console.log('═══════════════════════════════════════════════\n');

// Check environment variables
console.log('📋 Checking environment variables...\n');

const envFile = fs.readFileSync('.env', 'utf8');

const hasWebhookSecret = envFile.includes('STRIPE_WEBHOOK_SECRET');

if (hasWebhookSecret) {
  console.log('✅ STRIPE_WEBHOOK_SECRET found in .env');
} else {
  console.log('❌ STRIPE_WEBHOOK_SECRET NOT found in .env');
  console.log('   You need to add it after setting up webhook in Stripe!\n');
}

console.log('\n═══════════════════════════════════════════════');
console.log('📋 NEXT STEPS:');
console.log('═══════════════════════════════════════════════\n');

if (!hasWebhookSecret) {
  console.log('1. ⚠️  SETUP WEBHOOK IN STRIPE DASHBOARD:');
  console.log('   → Go to: https://dashboard.stripe.com/webhooks');
  console.log('   → Click "Add endpoint"');
  console.log('   → URL: https://sixnfemtvmighstbgrbd.supabase.co/functions/v1/stripe-webhook');
  console.log('   → Select event: checkout.session.completed');
  console.log('   → Save endpoint');
  console.log('');
  console.log('2. ⚠️  GET WEBHOOK SECRET:');
  console.log('   → Click on your webhook endpoint');
  console.log('   → Click "Reveal" under "Signing secret"');
  console.log('   → Copy the secret (starts with whsec_)');
  console.log('');
  console.log('3. ⚠️  ADD SECRET TO SUPABASE:');
  console.log('   → Go to: https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/settings/functions');
  console.log('   → Add environment variable:');
  console.log('     Name: STRIPE_WEBHOOK_SECRET');
  console.log('     Value: whsec_xxxxxxxxxxxxx (your secret)');
  console.log('');
  console.log('4. ⚠️  REDEPLOY WEBHOOK FUNCTION:');
  console.log('   → Run: supabase functions deploy stripe-webhook');
  console.log('');
} else {
  console.log('✅ Webhook secret is configured!');
  console.log('');
  console.log('Test the webhook:');
  console.log('1. Make a test payment');
  console.log('2. Check: node check-recent-orders.js');
  console.log('3. Verify order has payment_status="paid" and stripe_session_id');
}

console.log('═══════════════════════════════════════════════\n');
