#!/usr/bin/env node

/**
 * Setup Webhook Script
 * Provides instructions and verification for webhook setup
 */

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
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

console.log(`${colors.magenta}
╔═══════════════════════════════════════════════╗
║       🔗 SETUP WEBHOOK - ES MODULE 🔗        ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const PROJECT_REF = 'sixnfemtvmighstbgrbd';

console.log(`${colors.blue}📋 Configuration:${colors.reset}`);
console.log(`   Supabase URL: ${SUPABASE_URL}`);
console.log(`   Project Ref: ${PROJECT_REF}`);

const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-order-notification`;

console.log(`\n${colors.yellow}
╔═══════════════════════════════════════════════╗
║        📋 WEBHOOK SETUP INSTRUCTIONS 📋       ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

console.log(`
${colors.blue}═══════════════════════════════════════════════════
STEP 1: Navigate to Webhooks
═══════════════════════════════════════════════════${colors.reset}

1. Go to: ${colors.blue}https://supabase.com/dashboard/project/${PROJECT_REF}/database/hooks${colors.reset}
2. Click: ${colors.green}"Create a new hook"${colors.reset} (or "Enable Webhooks" if needed)
3. Select: ${colors.yellow}"Database Webhooks"${colors.reset}

${colors.blue}═══════════════════════════════════════════════════
STEP 2: Configure Webhook
═══════════════════════════════════════════════════${colors.reset}

${colors.cyan}Basic Configuration:${colors.reset}
• Name: ${colors.yellow}notify-new-order${colors.reset}
• Table: ${colors.yellow}orders${colors.reset}
• Events: ${colors.green}☑️ Insert${colors.reset} (check ONLY Insert)

${colors.cyan}HTTP Request Configuration:${colors.reset}
• Type: ${colors.yellow}HTTP Request${colors.reset}
• Method: ${colors.yellow}POST${colors.reset}
• URL: ${colors.green}${EDGE_FUNCTION_URL}${colors.reset}

${colors.cyan}HTTP Headers:${colors.reset}
Click "Add header" and enter:

${colors.yellow}Header 1:${colors.reset}
• Key: ${colors.yellow}Authorization${colors.reset}
• Value: ${colors.green}Bearer ${SUPABASE_ANON_KEY}${colors.reset}

${colors.yellow}Header 2:${colors.reset}
• Key: ${colors.yellow}Content-Type${colors.reset}
• Value: ${colors.green}application/json${colors.reset}

${colors.cyan}HTTP Body/Payload:${colors.reset}
${colors.green}{
  "order_id": "{{record.id}}",
  "customer_name": "{{record.customer_name}}",
  "total_amount": {{record.total_amount}}
}${colors.reset}

${colors.blue}═══════════════════════════════════════════════════
STEP 3: Create Webhook
═══════════════════════════════════════════════════${colors.reset}

4. Review all settings
5. Click: ${colors.green}"Create webhook"${colors.reset}
6. Verify webhook appears in the list

${colors.blue}═══════════════════════════════════════════════════${colors.reset}
`);

// Test Edge Function
console.log(`${colors.blue}🧪 Testing Edge Function availability...${colors.reset}\n`);

try {
  const testResponse = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      order_id: 'webhook-test-' + Date.now(),
      customer_name: 'Webhook Test',
      total_amount: 0.01
    })
  });

  if (testResponse.status === 404) {
    console.log(`${colors.red}❌ Edge Function not found${colors.reset}`);
    console.log(`   URL: ${EDGE_FUNCTION_URL}`);
    console.log(`   ${colors.yellow}Please deploy the Edge Function first!${colors.reset}`);
    console.log(`   Run: ${colors.blue}npm run deploy:edge-function${colors.reset}\n`);
  } else if (testResponse.ok) {
    const result = await testResponse.json();
    console.log(`${colors.green}✅ Edge Function is working!${colors.reset}`);
    console.log(`   URL: ${EDGE_FUNCTION_URL}`);
    console.log(`   Status: ${testResponse.status}`);
    console.log(`   Response:`, result);
    console.log(`\n${colors.green}✅ Ready to create webhook!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Edge Function responded with status ${testResponse.status}${colors.reset}`);
    const text = await testResponse.text();
    console.log(`   Response: ${text.substring(0, 200)}\n`);
  }
} catch (error) {
  console.log(`${colors.red}❌ Could not reach Edge Function${colors.reset}`);
  console.log(`   Error: ${error.message}`);
  console.log(`   ${colors.yellow}Please ensure the Edge Function is deployed!${colors.reset}\n`);
}

console.log(`${colors.green}
╔═══════════════════════════════════════════════╗
║      ✅ WEBHOOK INSTRUCTIONS READY! ✅        ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

console.log(`
${colors.blue}📋 QUICK REFERENCE:${colors.reset}

${colors.cyan}Webhook Dashboard:${colors.reset}
${colors.blue}https://supabase.com/dashboard/project/${PROJECT_REF}/database/hooks${colors.reset}

${colors.cyan}Edge Function URL:${colors.reset}
${colors.green}${EDGE_FUNCTION_URL}${colors.reset}

${colors.cyan}Authorization Header:${colors.reset}
${colors.green}Bearer ${SUPABASE_ANON_KEY}${colors.reset}

${colors.blue}📖 Full guide:${colors.reset} See DEPLOY_NOW.md
`);

console.log(`${colors.yellow}
╔═══════════════════════════════════════════════╗
║              🧪 TESTING WEBHOOK 🧪            ║
╚═══════════════════════════════════════════════╝
${colors.reset}

${colors.cyan}After creating the webhook, test it by:${colors.reset}

1. Go to Supabase Dashboard → Table Editor → orders
2. Insert a test order manually
3. Go to Database → Webhooks → View Logs
4. Check if webhook was triggered successfully

${colors.cyan}Or run test script:${colors.reset}
${colors.blue}npm run test:push${colors.reset}
`);

process.exit(0);
