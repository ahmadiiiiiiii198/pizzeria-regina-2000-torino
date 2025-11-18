#!/usr/bin/env node

/**
 * STORE WEBHOOK SECRET IN DATABASE
 * Alternative solution: Store secret in database instead of env vars
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = 'whsec_GugH1IiteNO2a0d4p8QKzE0q2yF4AIaf';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('═══════════════════════════════════════════════');
console.log('💾 STORING WEBHOOK SECRET IN DATABASE');
console.log('═══════════════════════════════════════════════\n');

async function storeSecret() {
  try {
    console.log('📋 Step 1: Creating settings table if not exists...\n');

    // Create settings table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS app_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (tableError && !tableError.message.includes('already exists')) {
      // Try direct insert instead (RPC might not exist)
      console.log('Using direct table access...\n');
    }

    console.log('📋 Step 2: Inserting webhook secret...\n');

    // Insert or update webhook secret
    const { data, error } = await supabase
      .from('app_settings')
      .upsert({
        key: 'STRIPE_WEBHOOK_SECRET',
        value: WEBHOOK_SECRET,
        description: 'Stripe webhook signing secret for verifying webhook requests'
      }, {
        onConflict: 'key'
      })
      .select();

    if (error) {
      console.error('❌ Error storing secret:', error);
      console.log('\n⚠️  Table might not exist. Let me create it using SQL...\n');
      
      // Alternative: Create table using settings table
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
          setting_key: 'STRIPE_WEBHOOK_SECRET',
          setting_value: WEBHOOK_SECRET,
          description: 'Stripe webhook signing secret'
        }, {
          onConflict: 'setting_key'
        });

      if (settingsError) {
        throw settingsError;
      }
      
      console.log('✅ Secret stored in settings table!\n');
    } else {
      console.log('✅ Secret stored in app_settings table!\n');
      console.log('Data:', data);
    }

    console.log('═══════════════════════════════════════════════');
    console.log('📋 NEXT: UPDATE WEBHOOK FUNCTION');
    console.log('═══════════════════════════════════════════════\n');
    console.log('The webhook function needs to read from database.');
    console.log('I will update the webhook code now...\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative: Let me use the existing settings table...\n');
    
    // Try using existing settings table structure
    try {
      const { data: existingSettings } = await supabase
        .from('settings')
        .select('*')
        .limit(1);
      
      console.log('Found existing settings table structure.');
      
      const { error: insertError } = await supabase
        .from('settings')
        .upsert({
          stripe_webhook_secret: WEBHOOK_SECRET,
        });
      
      if (insertError) {
        console.error('❌ Could not insert:', insertError.message);
      } else {
        console.log('✅ Stored in settings table!\n');
      }
    } catch (e) {
      console.error('❌ Final error:', e.message);
    }
  }
}

storeSecret();
