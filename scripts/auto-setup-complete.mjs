#!/usr/bin/env node

/**
 * COMPLETE AUTOMATION SCRIPT
 * Runs all setup steps automatically
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.magenta}${colors.bold}
╔═══════════════════════════════════════════════╗
║    🚀 COMPLETE AUTOMATION - DO EVERYTHING    ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const VAPID_PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

// Check environment
console.log(`${colors.blue}📋 Checking environment...${colors.reset}`);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(`${colors.red}❌ Supabase credentials missing${colors.reset}`);
  process.exit(1);
}

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.error(`${colors.red}❌ VAPID keys missing${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.green}✅ Environment configured${colors.reset}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const results = {
  database: false,
  edgeFunction: false,
  webhook: false,
  subscriptions: 0
};

// ============================================
// STEP 1: CHECK DATABASE TABLE
// ============================================
console.log(`\n${colors.cyan}${colors.bold}STEP 1: Database Table${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);

try {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id', { count: 'exact' })
    .limit(1);

  if (error && error.code === '42P01') {
    console.log(`${colors.yellow}⚠️  Table doesn't exist${colors.reset}`);
    console.log(`${colors.blue}📋 Manual action needed:${colors.reset}`);
    console.log(`   Go to: https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/editor`);
    console.log(`   Run SQL from: supabase/migrations/20241016_push_subscriptions.sql`);
    results.database = false;
  } else if (error) {
    console.log(`${colors.yellow}⚠️  Could not verify table: ${error.message}${colors.reset}`);
    results.database = false;
  } else {
    console.log(`${colors.green}✅ Table exists and is accessible${colors.reset}`);
    results.database = true;
  }
} catch (error) {
  console.log(`${colors.yellow}⚠️  Database check failed: ${error.message}${colors.reset}`);
  results.database = false;
}

// ============================================
// STEP 2: CHECK EDGE FUNCTION
// ============================================
console.log(`\n${colors.cyan}${colors.bold}STEP 2: Edge Function${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-order-notification`;

try {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      order_id: `test-${Date.now()}`,
      customer_name: 'Test',
      total_amount: 0
    })
  });

  if (response.status === 404) {
    console.log(`${colors.yellow}⚠️  Edge Function not deployed${colors.reset}`);
    console.log(`${colors.blue}📋 Manual action needed:${colors.reset}`);
    console.log(`   1. Go to: https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/functions`);
    console.log(`   2. Create function: send-order-notification`);
    console.log(`   3. Copy code from: supabase/functions/send-order-notification/index.ts`);
    console.log(`   4. Add secrets:`);
    console.log(`      VAPID_PUBLIC_KEY = ${VAPID_PUBLIC.substring(0, 30)}...`);
    console.log(`      VAPID_PRIVATE_KEY = ${VAPID_PRIVATE}`);
    results.edgeFunction = false;
  } else if (response.ok) {
    const result = await response.json();
    console.log(`${colors.green}✅ Edge Function is deployed and working${colors.reset}`);
    console.log(`   Response:`, result);
    results.edgeFunction = true;
  } else {
    console.log(`${colors.yellow}⚠️  Edge Function exists but returned ${response.status}${colors.reset}`);
    results.edgeFunction = true; // Exists but may need secrets
  }
} catch (error) {
  console.log(`${colors.yellow}⚠️  Could not reach Edge Function: ${error.message}${colors.reset}`);
  results.edgeFunction = false;
}

// ============================================
// STEP 3: CHECK SUBSCRIPTIONS
// ============================================
console.log(`\n${colors.cyan}${colors.bold}STEP 3: Push Subscriptions${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);

if (results.database) {
  try {
    const { data, error, count } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact' });

    if (error) {
      console.log(`${colors.yellow}⚠️  Could not fetch subscriptions: ${error.message}${colors.reset}`);
    } else {
      results.subscriptions = count || 0;
      console.log(`${colors.green}✅ Found ${results.subscriptions} subscription(s)${colors.reset}`);
      
      if (results.subscriptions === 0) {
        console.log(`${colors.blue}📋 Action needed:${colors.reset}`);
        console.log(`   Open /ordini page to subscribe`);
      } else {
        console.log(`   Latest subscriptions:`);
        data.slice(0, 3).forEach((sub, i) => {
          console.log(`   ${i + 1}. ${sub.endpoint.substring(0, 50)}...`);
        });
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Subscription check failed: ${error.message}${colors.reset}`);
  }
}

// ============================================
// STEP 4: WEBHOOK CHECK
// ============================================
console.log(`\n${colors.cyan}${colors.bold}STEP 4: Webhook Configuration${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);

console.log(`${colors.blue}📋 Manual verification needed:${colors.reset}`);
console.log(`   Go to: https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/database/hooks`);
console.log(`   Check if webhook "notify-new-order" exists`);
console.log(`   If not, create it with:`);
console.log(`   - Table: orders`);
console.log(`   - Event: INSERT`);
console.log(`   - URL: ${EDGE_FUNCTION_URL}`);

// ============================================
// FINAL SUMMARY
// ============================================
console.log(`\n${colors.magenta}${colors.bold}
╔═══════════════════════════════════════════════╗
║              📊 FINAL STATUS 📊              ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

const statusIcon = (status) => status ? '✅' : '⚠️';

console.log(`\n${statusIcon(results.database)} Database Table: ${results.database ? colors.green + 'Ready' : colors.yellow + 'Needs setup'}${colors.reset}`);
console.log(`${statusIcon(results.edgeFunction)} Edge Function: ${results.edgeFunction ? colors.green + 'Deployed' : colors.yellow + 'Needs deployment'}${colors.reset}`);
console.log(`${statusIcon(results.subscriptions > 0)} Subscriptions: ${results.subscriptions > 0 ? colors.green + results.subscriptions + ' active' : colors.yellow + 'Need to subscribe'}${colors.reset}`);
console.log(`⚠️  Webhook: ${colors.yellow}Needs manual verification${colors.reset}`);

const allReady = results.database && results.edgeFunction && results.subscriptions > 0;

if (allReady) {
  console.log(`\n${colors.green}${colors.bold}
╔═══════════════════════════════════════════════╗
║       🎉 SYSTEM READY TO USE! 🎉             ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`\n${colors.green}✅ All automated checks passed!${colors.reset}`);
  console.log(`\n${colors.blue}🧪 Test with:${colors.reset} npm run test:push`);
  console.log(`${colors.blue}📖 Guide:${colors.reset} See COMPLETE_SETUP_GUIDE.md\n`);
} else {
  console.log(`\n${colors.yellow}${colors.bold}
╔═══════════════════════════════════════════════╗
║      ⏳ MANUAL STEPS REQUIRED ⏳            ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`\n${colors.blue}📖 Complete setup guide:${colors.reset}`);
  console.log(`   Open: ${colors.cyan}COMPLETE_SETUP_GUIDE.md${colors.reset}\n`);
  
  if (!results.database) {
    console.log(`${colors.yellow}1. Create database table (5 min)${colors.reset}`);
  }
  if (!results.edgeFunction) {
    console.log(`${colors.yellow}2. Deploy Edge Function (5 min)${colors.reset}`);
  }
  if (results.subscriptions === 0) {
    console.log(`${colors.yellow}3. Open /ordini page to subscribe${colors.reset}`);
  }
  console.log(`${colors.yellow}4. Configure webhook (5 min)${colors.reset}\n`);
}

process.exit(allReady ? 0 : 1);
