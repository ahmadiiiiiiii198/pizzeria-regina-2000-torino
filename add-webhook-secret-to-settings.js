#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';
const WEBHOOK_SECRET = 'whsec_GugH1IiteNO2a0d4p8QKzE0q2yF4AIaf';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('═══════════════════════════════════════════════');
console.log('💾 ADDING WEBHOOK SECRET TO SETTINGS TABLE');
console.log('═══════════════════════════════════════════════\n');

async function addSecret() {
  // Check if settings table exists and what columns it has
  console.log('📋 Step 1: Checking settings table...\n');
  
  const { data: existingSettings, error: selectError } = await supabase
    .from('settings')
    .select('*')
    .limit(1);

  if (selectError) {
    console.error('❌ Error reading settings:', selectError.message);
    console.log('\n💡 Settings table might not exist. Creating it...\n');
    return;
  }

  console.log('✅ Settings table exists!');
  if (existingSettings && existingSettings.length > 0) {
    console.log('Current structure:', Object.keys(existingSettings[0]));
  }

  console.log('\n📋 Step 2: Adding webhook secret...\n');

  // Try to insert webhook secret
  const { data, error } = await supabase
    .from('settings')
    .upsert({
      id: 'stripe_webhook_secret',
      stripe_webhook_secret: WEBHOOK_SECRET,
    })
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Trying alternative column names...\n');
    
    // Try with different structure
    const { data: data2, error: error2 } = await supabase
      .from('settings')
      .insert({
        setting_name: 'stripe_webhook_secret',
        setting_value: WEBHOOK_SECRET,
      })
      .select();

    if (error2) {
      console.error('❌ Still failed:', error2.message);
      console.log('\n📋 Showing current settings structure:\n');
      const { data: allSettings } = await supabase
        .from('settings')
        .select('*');
      console.log(JSON.stringify(allSettings, null, 2));
    } else {
      console.log('✅ SUCCESS! Secret stored:', data2);
    }
  } else {
    console.log('✅ SUCCESS! Secret stored:', data);
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('📋 NEXT STEP: UPDATE WEBHOOK TO READ FROM DB');
  console.log('═══════════════════════════════════════════════\n');
}

addSecret();
