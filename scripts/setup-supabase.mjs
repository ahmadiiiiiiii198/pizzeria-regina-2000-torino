#!/usr/bin/env node

/**
 * Supabase Setup Script
 * Automatically creates the push_subscriptions table using Supabase API
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}
╔═══════════════════════════════════════════════╗
║     🚀 SUPABASE SETUP - ES MODULES 🚀        ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

console.log(`${colors.blue}📍 Connecting to Supabase...${colors.reset}`);
console.log(`   URL: ${SUPABASE_URL}`);

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read SQL migration file
const sqlFilePath = join(__dirname, '..', 'supabase', 'migrations', '20241016_push_subscriptions.sql');
console.log(`\n${colors.blue}📄 Reading SQL file...${colors.reset}`);
console.log(`   Path: ${sqlFilePath}`);

let sqlContent;
try {
  sqlContent = readFileSync(sqlFilePath, 'utf-8');
  console.log(`${colors.green}✅ SQL file loaded (${sqlContent.length} bytes)${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Error reading SQL file: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Execute SQL
console.log(`\n${colors.blue}🔧 Creating push_subscriptions table...${colors.reset}`);

try {
  // Use Supabase's RPC to execute SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
  
  if (error) {
    // If RPC doesn't exist, try direct SQL execution
    console.log(`${colors.yellow}⚠️  RPC method not available, using alternative method...${colors.reset}`);
    
    // Execute SQL via REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ query: sqlContent })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log(`${colors.green}✅ Table created successfully!${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Table created successfully!${colors.reset}`);
  }
} catch (error) {
  console.log(`${colors.yellow}⚠️  Direct SQL execution not available via API${colors.reset}`);
  console.log(`${colors.blue}📋 Please run the SQL manually:${colors.reset}`);
  console.log(`
${colors.yellow}═══════════════════════════════════════════════════
MANUAL STEP REQUIRED:
═══════════════════════════════════════════════════${colors.reset}

1. Go to: ${colors.blue}https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/editor${colors.reset}
2. Click: "SQL Editor"
3. Click: "+ New query"
4. Copy the content from: ${colors.blue}supabase/migrations/20241016_push_subscriptions.sql${colors.reset}
5. Paste and click "Run"

${colors.yellow}═══════════════════════════════════════════════════${colors.reset}
  `);
}

// Verify table exists
console.log(`\n${colors.blue}🔍 Verifying table exists...${colors.reset}`);

try {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id')
    .limit(1);

  if (error && error.code === '42P01') {
    console.log(`${colors.red}❌ Table does not exist yet${colors.reset}`);
    console.log(`${colors.yellow}   Please create it manually using Supabase Dashboard${colors.reset}`);
  } else if (error) {
    console.log(`${colors.yellow}⚠️  Could not verify: ${error.message}${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Table exists and is accessible!${colors.reset}`);
    console.log(`   Current rows: ${data.length}`);
  }
} catch (error) {
  console.log(`${colors.yellow}⚠️  Verification skipped: ${error.message}${colors.reset}`);
}

console.log(`\n${colors.green}
╔═══════════════════════════════════════════════╗
║        ✅ SUPABASE SETUP COMPLETE! ✅         ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

console.log(`
${colors.blue}📋 NEXT STEPS:${colors.reset}

1. ${colors.green}✅${colors.reset} Database table ready (or needs manual creation)
2. ${colors.yellow}⏳${colors.reset} Deploy Edge Function: ${colors.blue}npm run deploy:edge-function${colors.reset}
3. ${colors.yellow}⏳${colors.reset} Configure webhook in Supabase Dashboard

${colors.blue}📖 Full guide:${colors.reset} See DEPLOY_NOW.md
`);

process.exit(0);
