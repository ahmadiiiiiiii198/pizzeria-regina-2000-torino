// Check Authentication Database Schema for Pizzeria Regina 2000
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔐 AUTHENTICATION DATABASE SCHEMA CHECK');
console.log('=====================================');

async function checkAuthSchema() {
  console.log('\n1. 📋 Checking Authentication Tables...');
  
  const authTables = [
    'user_profiles',
    'settings',
    'orders',
    'order_items',
    'products',
    'categories'
  ];
  
  const tableStatus = {};
  
  for (const table of authTables) {
    try {
      console.log(`\n   Checking table: ${table}`);
      
      // Check if table exists and get structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        tableStatus[table] = { exists: false, error: error.message };
      } else {
        console.log(`   ✅ ${table}: EXISTS`);
        
        // Get table info
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        console.log(`      Records: ${count || 0}`);
        tableStatus[table] = { exists: true, count: count || 0 };
      }
    } catch (e) {
      console.log(`   ❌ ${table}: ${e.message}`);
      tableStatus[table] = { exists: false, error: e.message };
    }
  }
  
  console.log('\n2. 🔍 Checking RLS Policies...');
  
  // Check RLS policies for user_profiles
  try {
    const { data: policies, error } = await supabase.rpc('get_policies', {
      table_name: 'user_profiles'
    });
    
    if (error) {
      console.log('   ⚠️ Cannot check RLS policies (function may not exist)');
    } else {
      console.log(`   ✅ Found ${policies?.length || 0} RLS policies for user_profiles`);
    }
  } catch (e) {
    console.log('   ⚠️ RLS policy check not available');
  }
  
  console.log('\n3. 🧪 Testing Authentication Functions...');
  
  // Test user_profiles table structure
  if (tableStatus.user_profiles?.exists) {
    try {
      // Try to get table structure
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, phone, default_address, preferences, created_at, updated_at')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ user_profiles structure issue: ${error.message}`);
      } else {
        console.log('   ✅ user_profiles structure is correct');
      }
    } catch (e) {
      console.log(`   ❌ user_profiles test failed: ${e.message}`);
    }
  }
  
  // Test settings table for admin auth
  if (tableStatus.settings?.exists) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .eq('key', 'adminCredentials')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.log(`   ❌ Admin credentials check failed: ${error.message}`);
      } else if (data) {
        console.log('   ✅ Admin credentials found in settings');
      } else {
        console.log('   ⚠️ Admin credentials not found in settings');
      }
    } catch (e) {
      console.log(`   ❌ Settings test failed: ${e.message}`);
    }
  }
  
  console.log('\n4. 📊 Authentication Schema Summary');
  console.log('=====================================');
  
  Object.entries(tableStatus).forEach(([table, status]) => {
    if (status.exists) {
      console.log(`✅ ${table}: EXISTS (${status.count} records)`);
    } else {
      console.log(`❌ ${table}: MISSING - ${status.error}`);
    }
  });
  
  // Recommendations
  console.log('\n5. 🎯 Recommendations');
  console.log('====================');
  
  if (!tableStatus.user_profiles?.exists) {
    console.log('❌ CRITICAL: user_profiles table is missing');
    console.log('   → Run the user_profiles migration immediately');
  }
  
  if (!tableStatus.settings?.exists) {
    console.log('❌ CRITICAL: settings table is missing');
    console.log('   → Admin authentication will not work');
  }
  
  if (tableStatus.user_profiles?.exists && tableStatus.settings?.exists) {
    console.log('✅ Both authentication systems have required tables');
  }
  
  console.log('\n🏁 Authentication schema check complete!');
}

checkAuthSchema().catch(console.error);
