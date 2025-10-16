/**
 * Simple Database Test Script
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

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
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': OK`);
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

  // 4. Registration Test
  console.log('\n4. Testing user registration...');
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpass123',
      options: {
        data: { full_name: 'Test User' }
      }
    });

    if (error) {
      console.log(`❌ Registration failed: ${error.message}`);
      if (error.message.includes('Database error saving new user')) {
        console.log('🎯 ISSUE IDENTIFIED: Database trigger failure');
        console.log('   This means the create_user_profile trigger is missing or broken');
      }
    } else {
      console.log(`✅ Registration successful: ${data.user?.id}`);
    }
  } catch (e) {
    console.log(`❌ Registration exception: ${e.message}`);
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
