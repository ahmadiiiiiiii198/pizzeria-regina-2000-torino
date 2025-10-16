#!/usr/bin/env node

/**
 * Test Push Notification Script
 * Tests the complete push notification system
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

console.log(`${colors.cyan}
╔═══════════════════════════════════════════════╗
║      🧪 TEST PUSH NOTIFICATIONS 🧪           ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error(`${colors.red}❌ VITE_SUPABASE_ANON_KEY not found in .env.local${colors.reset}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test 1: Check if table exists
console.log(`\n${colors.blue}Test 1: Checking push_subscriptions table...${colors.reset}`);

try {
  const { data, error, count } = await supabase
    .from('push_subscriptions')
    .select('*', { count: 'exact', head: false })
    .limit(5);

  if (error) {
    console.log(`${colors.red}❌ Table not found or not accessible${colors.reset}`);
    console.log(`   Error: ${error.message}`);
    console.log(`\n${colors.yellow}   Please run: npm run setup:supabase${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.green}✅ Table exists and is accessible${colors.reset}`);
  console.log(`   Total subscriptions: ${count || 0}`);
  
  if (data && data.length > 0) {
    console.log(`\n   ${colors.cyan}Recent subscriptions:${colors.reset}`);
    data.forEach((sub, i) => {
      console.log(`   ${i + 1}. Endpoint: ${sub.endpoint.substring(0, 50)}...`);
      console.log(`      Created: ${new Date(sub.created_at).toLocaleString()}`);
    });
  } else {
    console.log(`\n   ${colors.yellow}⚠️  No subscriptions found${colors.reset}`);
    console.log(`      ${colors.blue}Please open /ordini page to subscribe first${colors.reset}`);
  }
} catch (error) {
  console.log(`${colors.red}❌ Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Test 2: Test Edge Function
console.log(`\n${colors.blue}Test 2: Testing Edge Function...${colors.reset}`);

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-order-notification`;
const testPayload = {
  order_id: `test-${Date.now()}`,
  customer_name: 'Test Customer',
  total_amount: 25.50,
  items_count: 2
};

console.log(`   Sending test request to: ${EDGE_FUNCTION_URL}`);
console.log(`   Payload:`, testPayload);

try {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(testPayload)
  });

  if (response.status === 404) {
    console.log(`${colors.red}❌ Edge Function not found${colors.reset}`);
    console.log(`\n${colors.yellow}   Please deploy the Edge Function:${colors.reset}`);
    console.log(`   ${colors.blue}npm run deploy:edge-function${colors.reset}\n`);
    process.exit(1);
  }

  const result = await response.json();
  
  if (response.ok) {
    console.log(`${colors.green}✅ Edge Function is working!${colors.reset}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(result, null, 2));
    
    if (result.sent > 0) {
      console.log(`\n   ${colors.green}🎉 Push notification sent successfully!${colors.reset}`);
      console.log(`   ${colors.cyan}Check your device for the notification${colors.reset}`);
    } else if (result.sent === 0 && result.total === 0) {
      console.log(`\n   ${colors.yellow}⚠️  No subscriptions found${colors.reset}`);
      console.log(`   ${colors.blue}Please open /ordini page to subscribe first${colors.reset}`);
    } else {
      console.log(`\n   ${colors.yellow}⚠️  Push sent but some failed${colors.reset}`);
      console.log(`   Sent: ${result.sent}, Failed: ${result.failed}`);
    }
  } else {
    console.log(`${colors.red}❌ Edge Function returned error${colors.reset}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(result, null, 2));
  }
} catch (error) {
  console.log(`${colors.red}❌ Error calling Edge Function${colors.reset}`);
  console.log(`   Error: ${error.message}`);
}

// Test 3: Check webhook configuration
console.log(`\n${colors.blue}Test 3: Webhook Configuration Check...${colors.reset}`);

console.log(`   ${colors.cyan}Expected webhook URL:${colors.reset} ${EDGE_FUNCTION_URL}`);
console.log(`   ${colors.cyan}Webhook dashboard:${colors.reset} https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/database/hooks`);
console.log(`\n   ${colors.yellow}Note: Webhook configuration must be verified manually in dashboard${colors.reset}`);

// Summary
console.log(`\n${colors.green}
╔═══════════════════════════════════════════════╗
║         ✅ TEST SUMMARY ✅                    ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

console.log(`
${colors.blue}📋 Status:${colors.reset}

1. Database Table: ${colors.green}✅ Working${colors.reset}
2. Edge Function: ${colors.green}✅ Tested${colors.reset}
3. Webhook: ${colors.yellow}⏳ Requires manual verification${colors.reset}

${colors.blue}🎯 Next Steps:${colors.reset}

${colors.cyan}If you received a notification:${colors.reset}
  🎉 ${colors.green}SUCCESS! Everything is working!${colors.reset}
  
${colors.cyan}If you didn't receive a notification:${colors.reset}
  1. Make sure you subscribed: Open /ordini page
  2. Check browser console for subscription logs
  3. Verify Edge Function secrets are set (VAPID keys)
  4. Check webhook is configured and enabled

${colors.blue}📖 Full guide:${colors.reset} See DEPLOY_NOW.md
`);

process.exit(0);
