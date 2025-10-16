#!/usr/bin/env node

/**
 * Deploy Edge Function Script
 * Automatically deploys the send-order-notification Edge Function
 * and sets up VAPID secrets
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

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
║     🚀 DEPLOY EDGE FUNCTION - ES MODULE      ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

// Get configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const PROJECT_REF = 'sixnfemtvmighstbgrbd';

// Validate environment variables
console.log(`${colors.blue}📋 Checking configuration...${colors.reset}`);

if (!SUPABASE_ANON_KEY) {
  console.error(`${colors.red}❌ VITE_SUPABASE_ANON_KEY not found in .env.local${colors.reset}`);
  process.exit(1);
}

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error(`${colors.red}❌ VAPID keys not found in .env.local${colors.reset}`);
  console.error(`${colors.yellow}   Please ensure VITE_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are set${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.green}✅ Environment variables loaded${colors.reset}`);
console.log(`   Supabase URL: ${SUPABASE_URL}`);
console.log(`   Project Ref: ${PROJECT_REF}`);
console.log(`   VAPID Public Key: ${VAPID_PUBLIC_KEY.substring(0, 20)}...`);

// Read Edge Function code
const functionPath = join(__dirname, '..', 'supabase', 'functions', 'send-order-notification', 'index.ts');
console.log(`\n${colors.blue}📄 Reading Edge Function code...${colors.reset}`);
console.log(`   Path: ${functionPath}`);

let functionCode;
try {
  functionCode = readFileSync(functionPath, 'utf-8');
  console.log(`${colors.green}✅ Function code loaded (${functionCode.length} bytes)${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Error reading function code: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Display deployment instructions
console.log(`\n${colors.yellow}
╔═══════════════════════════════════════════════╗
║      ⚠️  MANUAL DEPLOYMENT REQUIRED ⚠️        ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

console.log(`
${colors.yellow}Supabase Edge Functions require manual deployment via Dashboard or CLI.${colors.reset}

${colors.blue}═══════════════════════════════════════════════════
OPTION 1: Deploy via Supabase Dashboard (EASIEST)
═══════════════════════════════════════════════════${colors.reset}

${colors.cyan}Step 1: Create Function${colors.reset}
1. Go to: ${colors.blue}https://supabase.com/dashboard/project/${PROJECT_REF}/functions${colors.reset}
2. Click: ${colors.green}"Create a new function"${colors.reset}
3. Name: ${colors.yellow}send-order-notification${colors.reset}
4. Click: ${colors.green}"Create function"${colors.reset}

${colors.cyan}Step 2: Deploy Code${colors.reset}
5. In the code editor, delete all existing code
6. Copy entire content from: ${colors.blue}supabase/functions/send-order-notification/index.ts${colors.reset}
7. Paste into editor
8. Click: ${colors.green}"Deploy"${colors.reset}

${colors.cyan}Step 3: Set Secrets${colors.reset}
9. Click: ${colors.yellow}"Settings"${colors.reset} tab
10. Scroll to: ${colors.yellow}"Secrets"${colors.reset} section
11. Add Secret:
    Name: ${colors.yellow}VAPID_PUBLIC_KEY${colors.reset}
    Value: ${colors.green}${VAPID_PUBLIC_KEY}${colors.reset}
    
12. Add Secret:
    Name: ${colors.yellow}VAPID_PRIVATE_KEY${colors.reset}
    Value: ${colors.green}${VAPID_PRIVATE_KEY}${colors.reset}

${colors.blue}═══════════════════════════════════════════════════
OPTION 2: Deploy via Supabase CLI
═══════════════════════════════════════════════════${colors.reset}

${colors.cyan}If you have Supabase CLI installed:${colors.reset}

${colors.yellow}# Deploy function${colors.reset}
supabase functions deploy send-order-notification --project-ref ${PROJECT_REF}

${colors.yellow}# Set secrets${colors.reset}
supabase secrets set VAPID_PUBLIC_KEY="${VAPID_PUBLIC_KEY}" --project-ref ${PROJECT_REF}
supabase secrets set VAPID_PRIVATE_KEY="${VAPID_PRIVATE_KEY}" --project-ref ${PROJECT_REF}

${colors.blue}═══════════════════════════════════════════════════${colors.reset}
`);

// Test function endpoint
console.log(`\n${colors.blue}🧪 Testing if function exists...${colors.reset}`);

try {
  const testUrl = `${SUPABASE_URL}/functions/v1/send-order-notification`;
  const testResponse = await fetch(testUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      order_id: 'test-123',
      customer_name: 'Test',
      total_amount: 0
    })
  });

  if (testResponse.status === 404) {
    console.log(`${colors.yellow}⚠️  Function not deployed yet${colors.reset}`);
    console.log(`   Please deploy using one of the options above`);
  } else if (testResponse.ok) {
    const result = await testResponse.json();
    console.log(`${colors.green}✅ Function is already deployed!${colors.reset}`);
    console.log(`   Response:`, result);
  } else {
    console.log(`${colors.yellow}⚠️  Function exists but returned status ${testResponse.status}${colors.reset}`);
    const text = await testResponse.text();
    console.log(`   Response: ${text.substring(0, 200)}`);
  }
} catch (error) {
  console.log(`${colors.yellow}⚠️  Could not test function: ${error.message}${colors.reset}`);
}

console.log(`\n${colors.green}
╔═══════════════════════════════════════════════╗
║         📋 DEPLOYMENT GUIDE READY! 📋         ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

console.log(`
${colors.blue}📋 SUMMARY:${colors.reset}

${colors.green}✅ Function code ready:${colors.reset} supabase/functions/send-order-notification/index.ts
${colors.green}✅ VAPID keys loaded:${colors.reset} From .env.local
${colors.yellow}⏳ Manual deployment needed:${colors.reset} See instructions above

${colors.blue}📖 Full guide:${colors.reset} See DEPLOY_NOW.md
`);

process.exit(0);
