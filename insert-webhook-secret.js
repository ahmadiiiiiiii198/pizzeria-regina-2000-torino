#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';
const WEBHOOK_SECRET = 'whsec_GugH1IiteNO2a0d4p8QKzE0q2yF4AIaf';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('═══════════════════════════════════════════════');
console.log('💾 INSERTING WEBHOOK SECRET TO SETTINGS');
console.log('═══════════════════════════════════════════════\n');

async function insertSecret() {
  console.log('📋 Adding stripe_webhook_secret to settings table...\n');

  // Settings table has structure: { key, value, created_at, updated_at }
  const { data, error } = await supabase
    .from('settings')
    .upsert({
      key: 'stripe_webhook_secret',
      value: WEBHOOK_SECRET, // Store as plain string
    }, {
      onConflict: 'key'
    })
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log('✅ SUCCESS! Webhook secret stored in database!\n');
  console.log('Data:', JSON.stringify(data, null, 2));
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📋 VERIFYING...');
  console.log('═══════════════════════════════════════════════\n');
  
  // Verify it was stored
  const { data: checkData, error: checkError } = await supabase
    .from('settings')
    .select('*')
    .eq('key', 'stripe_webhook_secret')
    .single();

  if (checkError) {
    console.error('❌ Verification failed:', checkError.message);
  } else {
    console.log('✅ Verified! Secret in database:');
    console.log(`   Key: ${checkData.key}`);
    console.log(`   Value: ${checkData.value}`);
    console.log(`   Created: ${checkData.created_at}\n`);
  }

  console.log('═══════════════════════════════════════════════');
  console.log('📋 FINAL STEP: UPDATE WEBHOOK FUNCTION');
  console.log('═══════════════════════════════════════════════\n');
  console.log('Now I need to update the webhook function to read');
  console.log('the secret from database instead of environment variable.\n');
}

insertSecret();
