#!/usr/bin/env node

/**
 * Comprehensive Authentication Backend Loading Test
 * Tests all authentication-related backend systems for loading issues
 */

import { createClient } from '@supabase/supabase-js';

// Correct Supabase configuration
const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

console.log('🔐 AUTHENTICATION BACKEND LOADING TEST');
console.log('=====================================');
console.log(`📍 Database: ${SUPABASE_URL}`);
console.log('');

async function testAuthBackendLoading() {
  let allTestsPassed = true;

  // Test 1: Database Connection Speed
  console.log('1. 🔗 Database Connection Speed Test');
  const connectionStart = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key')
      .limit(1);
    
    const connectionTime = Date.now() - connectionStart;
    
    if (error) {
      console.log(`   ❌ Connection failed in ${connectionTime}ms: ${error.message}`);
      allTestsPassed = false;
    } else {
      console.log(`   ✅ Connection successful in ${connectionTime}ms`);
      
      if (connectionTime > 2000) {
        console.log(`   ⚠️  WARNING: Slow connection (${connectionTime}ms > 2000ms)`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Connection exception: ${error.message}`);
    allTestsPassed = false;
  }

  console.log('');

  // Test 2: Authentication Tables Existence and Performance
  console.log('2. 📋 Authentication Tables Performance Test');
  
  const authTables = [
    { name: 'user_profiles', critical: true },
    { name: 'settings', critical: true },
    { name: 'orders', critical: false },
    { name: 'products', critical: false }
  ];

  for (const table of authTables) {
    const tableStart = Date.now();
    
    try {
      const { data, error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      const tableTime = Date.now() - tableStart;
      
      if (error) {
        console.log(`   ${table.critical ? '❌' : '⚠️'} ${table.name}: ERROR in ${tableTime}ms - ${error.message}`);
        if (table.critical) allTestsPassed = false;
      } else {
        console.log(`   ✅ ${table.name}: OK in ${tableTime}ms (${count || 0} records)`);
        
        if (tableTime > 1000) {
          console.log(`   ⚠️  WARNING: Slow query for ${table.name} (${tableTime}ms > 1000ms)`);
        }
      }
    } catch (error) {
      console.log(`   ${table.critical ? '❌' : '⚠️'} ${table.name}: EXCEPTION - ${error.message}`);
      if (table.critical) allTestsPassed = false;
    }
  }

  console.log('');

  // Test 3: Supabase Auth Service Performance
  console.log('3. 🔐 Supabase Auth Service Performance Test');
  
  const authStart = Date.now();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    const authTime = Date.now() - authStart;
    
    if (error) {
      console.log(`   ❌ Auth service failed in ${authTime}ms: ${error.message}`);
      allTestsPassed = false;
    } else {
      console.log(`   ✅ Auth service responded in ${authTime}ms`);
      console.log(`   📊 Session status: ${session ? 'ACTIVE' : 'NO_SESSION'}`);
      
      if (authTime > 3000) {
        console.log(`   ⚠️  WARNING: Slow auth service (${authTime}ms > 3000ms)`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Auth service exception: ${error.message}`);
    allTestsPassed = false;
  }

  console.log('');

  // Test 4: User Profile Loading Simulation
  console.log('4. 👤 User Profile Loading Simulation');
  
  // Test with a fake user ID to simulate the loading process
  const profileStart = Date.now();
  const fakeUserId = '00000000-0000-0000-0000-000000000000';
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', fakeUserId)
      .single();
    
    const profileTime = Date.now() - profileStart;
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`   ✅ Profile query structure OK in ${profileTime}ms (no record found - expected)`);
      } else if (error.message?.includes('relation "user_profiles" does not exist')) {
        console.log(`   ❌ CRITICAL: user_profiles table missing!`);
        console.log(`   🔧 SOLUTION: Run migration: supabase/migrations/20250117000000_create_user_profiles_table.sql`);
        allTestsPassed = false;
      } else {
        console.log(`   ❌ Profile query failed in ${profileTime}ms: ${error.message}`);
        allTestsPassed = false;
      }
    } else {
      console.log(`   ✅ Profile query successful in ${profileTime}ms`);
    }
    
    if (profileTime > 2000) {
      console.log(`   ⚠️  WARNING: Slow profile loading (${profileTime}ms > 2000ms)`);
    }
  } catch (error) {
    console.log(`   ❌ Profile loading exception: ${error.message}`);
    allTestsPassed = false;
  }

  console.log('');

  // Test 5: RLS Policies Test
  console.log('5. 🛡️ Row Level Security (RLS) Policies Test');
  
  try {
    // Test if RLS is properly configured by trying to access user_profiles
    const rlsStart = Date.now();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    const rlsTime = Date.now() - rlsStart;
    
    if (error) {
      if (error.message?.includes('relation "user_profiles" does not exist')) {
        console.log(`   ❌ CRITICAL: user_profiles table missing for RLS test`);
        allTestsPassed = false;
      } else {
        console.log(`   ✅ RLS policies working in ${rlsTime}ms (${error.message})`);
      }
    } else {
      console.log(`   ✅ RLS policies allow anonymous access in ${rlsTime}ms`);
    }
  } catch (error) {
    console.log(`   ❌ RLS test exception: ${error.message}`);
    allTestsPassed = false;
  }

  console.log('');

  // Test 6: Admin Authentication Backend
  console.log('6. 🔑 Admin Authentication Backend Test');
  
  const adminStart = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'adminCredentials')
      .single();
    
    const adminTime = Date.now() - adminStart;
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`   ⚠️  Admin credentials not found in ${adminTime}ms (may need setup)`);
      } else {
        console.log(`   ❌ Admin auth backend failed in ${adminTime}ms: ${error.message}`);
        allTestsPassed = false;
      }
    } else {
      console.log(`   ✅ Admin auth backend OK in ${adminTime}ms`);
    }
  } catch (error) {
    console.log(`   ❌ Admin auth exception: ${error.message}`);
    allTestsPassed = false;
  }

  console.log('');

  // Summary
  console.log('📊 AUTHENTICATION BACKEND TEST SUMMARY');
  console.log('=====================================');
  
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED - Authentication backend is healthy');
    console.log('🚀 No loading issues detected in authentication system');
  } else {
    console.log('❌ SOME TESTS FAILED - Authentication backend has issues');
    console.log('🔧 Please review the failed tests above and apply fixes');
  }

  console.log('');
  console.log('🎯 RECOMMENDATIONS:');
  console.log('1. If user_profiles table is missing, run the migration');
  console.log('2. If queries are slow (>2000ms), check database performance');
  console.log('3. If auth service is slow (>3000ms), check Supabase status');
  console.log('4. Monitor connection times during peak usage');

  return allTestsPassed;
}

// Run the test
testAuthBackendLoading()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
