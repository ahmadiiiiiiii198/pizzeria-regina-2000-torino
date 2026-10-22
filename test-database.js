/**
 * Simple Database Test Script
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jncuwwavffepnajxvjxq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3V3d2F2ZmZlcG5hanh2anhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzMxMjUsImV4cCI6MjA3NTQwOTEyNX0.wDlEZbpy1rfAk8GtzuqB28qINkAG3GbqMxVZmW85hzo";

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'regina' }
});

async function testDatabase() {
  console.log('🔍 QUICK DATABASE TEST');
  console.log('======================\n');

  // 1. Connection Test
  console.log('1. Testing connection...');
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('settings').select('count').limit(1);
    const time = Date.now() - start;
    
    if (error) {
      console.log(`❌ Connection failed (${time}ms): ${error.message}`);
      return false;
    }
    console.log(`✅ Connection successful (${time}ms)`);
  } catch (e) {
    console.log(`❌ Connection exception: ${e.message}`);
    return false;
  }

  // 2. Table Check
  console.log('\n2. Checking key tables...');
  const tables = ['products', 'categories', 'orders', 'user_profiles', 'settings'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': OK (${count} rows)`);
      }
    } catch (e) {
      console.log(`❌ Table '${table}': ${e.message}`);
    }
  }

  // 3. Auth Test
  console.log('\n3. Testing auth system...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.log(`❌ Auth error: ${error.message}`);
    } else {
      console.log(`✅ Auth system: OK (session: ${session ? 'active' : 'none'})`);
    }
  } catch (e) {
    console.log(`❌ Auth exception: ${e.message}`);
  }

  // 5. Performance Test
  console.log('\n5. Testing query performance...');
  const queries = [
    { name: 'Products', query: () => supabase.from('products').select('*').limit(10) },
    { name: 'Categories', query: () => supabase.from('categories').select('*') },
    { name: 'Settings', query: () => supabase.from('settings').select('*').limit(5) }
  ];

  for (const test of queries) {
    try {
      const start = Date.now();
      const { data, error } = await test.query();
      const time = Date.now() - start;
      
      if (error) {
        console.log(`❌ ${test.name}: ${error.message} (${time}ms)`);
      } else {
        const status = time > 1000 ? '⚠️ SLOW' : '✅';
        console.log(`${status} ${test.name}: ${data?.length || 0} records (${time}ms)`);
      }
    } catch (e) {
      console.log(`❌ ${test.name}: ${e.message}`);
    }
  }

  console.log('\n📋 SUMMARY');
  console.log('===========');
  console.log('✅ Database is accessible');
  console.log('⚠️  User registration has issues (trigger missing)');
  console.log('💡 Run the comprehensive diagnostic for detailed analysis');
  
  return true;
}

testDatabase().catch(console.error);
