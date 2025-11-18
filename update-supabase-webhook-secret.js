#!/usr/bin/env node

/**
 * UPDATE SUPABASE WITH WEBHOOK SECRET
 * Adds STRIPE_WEBHOOK_SECRET to Supabase environment variables
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = 'whsec_GugH1IiteNO2a0d4p8QKzE0q2yF4AIaf'; // From previous step

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env file!');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════');
console.log('🔧 UPDATING SUPABASE WEBHOOK SECRET');
console.log('═══════════════════════════════════════════════\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function updateWebhookSecret() {
  try {
    console.log('⚠️  NOTE: Supabase secrets can only be set via:');
    console.log('   1. Supabase Dashboard (Manual)');
    console.log('   2. Supabase CLI (Command line)\n');
    
    console.log('The Supabase JavaScript client does NOT support setting secrets.\n');
    
    console.log('═══════════════════════════════════════════════');
    console.log('📋 MANUAL METHOD (RECOMMENDED):');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('1. Go to: https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/settings/functions\n');
    console.log('2. Scroll to "Secrets" section\n');
    console.log('3. Click "Add new secret"\n');
    console.log('4. Enter:');
    console.log('   Name: STRIPE_WEBHOOK_SECRET');
    console.log(`   Value: ${WEBHOOK_SECRET}`);
    console.log('\n5. Click "Save"\n');
    
    console.log('═══════════════════════════════════════════════');
    console.log('📋 CLI METHOD (ALTERNATIVE):');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('If you have Supabase CLI installed, run:\n');
    console.log(`   supabase secrets set STRIPE_WEBHOOK_SECRET=${WEBHOOK_SECRET}\n`);
    
    console.log('═══════════════════════════════════════════════');
    console.log('📋 VERIFY IT WORKED:');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('After adding the secret, test with:');
    console.log('   1. Make a test payment');
    console.log('   2. Run: node check-recent-orders.js');
    console.log('   3. Check order has payment_status="paid"\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateWebhookSecret();
