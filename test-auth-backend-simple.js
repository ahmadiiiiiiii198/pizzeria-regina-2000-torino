#!/usr/bin/env node

/**
 * Simple Authentication Backend Test
 * Quick test to verify authentication backend is working
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔐 SIMPLE AUTHENTICATION BACKEND TEST');
console.log('====================================');

async function testAuthBackend() {
  console.log('1. Testing database connection...');
  
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('settings')
      .select('key')
      .limit(1);
    
    const time = Date.now() - start;
    
    if (error) {
      console.log(`❌ Database connection failed (${time}ms): ${error.message}`);
      return false;
    } else {
      console.log(`✅ Database connected successfully (${time}ms)`);
    }
  } catch (error) {
    console.log(`❌ Database connection exception: ${error.message}`);
    return false;
  }

  console.log('\n2. Testing user_profiles table...');
  
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    const time = Date.now() - start;
    
    if (error) {
      if (error.message?.includes('relation "user_profiles" does not exist')) {
        console.log(`⚠️  user_profiles table missing (${time}ms) - this will cause auth loading issues`);
        console.log('   🔧 SOLUTION: Run migration to create user_profiles table');
        return false;
      } else {
        console.log(`✅ user_profiles table exists (${time}ms)`);
      }
    } else {
      console.log(`✅ user_profiles table accessible (${time}ms)`);
    }
  } catch (error) {
    console.log(`❌ user_profiles test exception: ${error.message}`);
    return false;
  }

  console.log('\n3. Testing Supabase auth service...');
  
  try {
    const start = Date.now();
    const { data: { session }, error } = await supabase.auth.getSession();
    const time = Date.now() - start;
    
    if (error) {
      console.log(`❌ Auth service failed (${time}ms): ${error.message}`);
      return false;
    } else {
      console.log(`✅ Auth service responding (${time}ms)`);
      console.log(`   Session status: ${session ? 'ACTIVE' : 'NO_SESSION'}`);
    }
  } catch (error) {
    console.log(`❌ Auth service exception: ${error.message}`);
    return false;
  }

  console.log('\n✅ ALL AUTHENTICATION BACKEND TESTS PASSED');
  console.log('🚀 Authentication backend is healthy');
  return true;
}

testAuthBackend()
  .then(success => {
    if (success) {
      console.log('\n🎯 RESULT: Authentication backend is working properly');
      console.log('   No loading issues detected in backend systems');
    } else {
      console.log('\n❌ RESULT: Authentication backend has issues');
      console.log('   This may cause loading problems in the frontend');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });
