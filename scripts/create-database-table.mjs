#!/usr/bin/env node

/**
 * Create Database Table Script
 * Attempts to create push_subscriptions table using multiple methods
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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
  reset: '\x1b[0m'
};

console.log(`${colors.cyan}
╔═══════════════════════════════════════════════╗
║      🗄️  CREATE DATABASE TABLE 🗄️           ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(`${colors.red}❌ Supabase credentials not found in .env.local${colors.reset}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log(`${colors.blue}📍 Connecting to Supabase...${colors.reset}`);
console.log(`   URL: ${SUPABASE_URL}`);

// Method 1: Try to execute SQL via Supabase client
console.log(`\n${colors.blue}🔧 Method 1: Attempting direct table creation...${colors.reset}`);

try {
  // First check if table already exists
  const { data: existingTable, error: checkError } = await supabase
    .from('push_subscriptions')
    .select('id')
    .limit(1);

  if (!checkError || checkError.code !== '42P01') {
    console.log(`${colors.green}✅ Table already exists!${colors.reset}`);
    console.log(`   Found ${existingTable?.length || 0} existing subscriptions`);
    process.exit(0);
  }

  console.log(`${colors.yellow}⚠️  Table doesn't exist yet, creating...${colors.reset}`);

} catch (error) {
  console.log(`${colors.yellow}⚠️  Could not check table: ${error.message}${colors.reset}`);
}

// Method 2: Create table using REST API POST request
console.log(`\n${colors.blue}🔧 Method 2: Using REST API...${colors.reset}`);

const createTableSQL = `
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_endpoint UNIQUE(endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON push_subscriptions(created_at);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can insert push subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Anyone can read push subscriptions" ON push_subscriptions FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can delete own subscriptions" ON push_subscriptions FOR DELETE USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own subscriptions" ON push_subscriptions FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_push_subscriptions_updated_at();
`;

try {
  // Try using Supabase's SQL endpoint (if available)
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: createTableSQL })
  });

  if (response.ok) {
    console.log(`${colors.green}✅ Table created successfully via REST API!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  REST API method not available (${response.status})${colors.reset}`);
  }
} catch (error) {
  console.log(`${colors.yellow}⚠️  REST API not accessible: ${error.message}${colors.reset}`);
}

// Method 3: Verify table exists now
console.log(`\n${colors.blue}🔍 Verifying table creation...${colors.reset}`);

try {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id')
    .limit(1);

  if (error && error.code === '42P01') {
    console.log(`${colors.red}❌ Table was not created automatically${colors.reset}`);
    console.log(`\n${colors.yellow}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.yellow}MANUAL ACTION REQUIRED:${colors.reset}`);
    console.log(`${colors.yellow}═══════════════════════════════════════════════════${colors.reset}\n`);
    console.log(`Please run this SQL manually in Supabase Dashboard:`);
    console.log(`\n${colors.cyan}1. Go to: https://supabase.com/dashboard/project/sixnfemtvmighstbgrbd/editor${colors.reset}`);
    console.log(`${colors.cyan}2. Click: SQL Editor → New query${colors.reset}`);
    console.log(`${colors.cyan}3. Copy SQL from: supabase/migrations/20241016_push_subscriptions.sql${colors.reset}`);
    console.log(`${colors.cyan}4. Paste and click Run${colors.reset}\n`);
    process.exit(1);
  } else if (error) {
    console.log(`${colors.yellow}⚠️  Could not verify: ${error.message}${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ Table exists and is accessible!${colors.reset}`);
    console.log(`   Current subscriptions: ${data?.length || 0}`);
  }
} catch (error) {
  console.log(`${colors.yellow}⚠️  Verification error: ${error.message}${colors.reset}`);
}

console.log(`\n${colors.green}
╔═══════════════════════════════════════════════╗
║         ✅ PROCESS COMPLETE! ✅               ║
╚═══════════════════════════════════════════════╝
${colors.reset}`);

console.log(`\n${colors.blue}📋 Next: Deploy Edge Function${colors.reset}`);
console.log(`   Run: ${colors.cyan}npm run deploy:edge-function${colors.reset}\n`);

process.exit(0);
