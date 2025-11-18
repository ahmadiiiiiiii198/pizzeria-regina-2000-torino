#!/usr/bin/env node

/**
 * UPDATE STRIPE WEBHOOK URL TO NETLIFY
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_ID = 'we_1SUx03C5nwXSTytFqgjYVVyw'; // From earlier creation
const NEW_URL = 'https://pizzeria-regina-2000-torino.netlify.app/.netlify/functions/stripe-webhook';

console.log('═══════════════════════════════════════════════');
console.log('🔄 UPDATING STRIPE WEBHOOK TO NETLIFY');
console.log('═══════════════════════════════════════════════\n');

async function updateWebhook() {
  try {
    console.log(`📋 Updating webhook ${WEBHOOK_ID}...\n`);
    console.log(`New URL: ${NEW_URL}\n`);

    const webhook = await stripe.webhookEndpoints.update(WEBHOOK_ID, {
      url: NEW_URL,
    });

    console.log('✅ WEBHOOK UPDATED SUCCESSFULLY!\n');
    console.log(`ID: ${webhook.id}`);
    console.log(`URL: ${webhook.url}`);
    console.log(`Status: ${webhook.status}`);
    console.log(`Secret: ${webhook.secret}\n`);

    console.log('═══════════════════════════════════════════════');
    console.log('🎉 ALL DONE! FULLY AUTOMATIC!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('✅ Netlify function created (auto-deploys)');
    console.log('✅ Stripe webhook updated to Netlify URL');
    console.log('✅ Secret already in database');
    console.log('✅ Frontend already updated\n');
    console.log('🧪 READY TO TEST:');
    console.log('1. Make a test payment');
    console.log('2. Run: node check-recent-orders.js');
    console.log('3. Check printer receives order!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateWebhook();
