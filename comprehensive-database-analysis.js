/**
 * Comprehensive Database Analysis for User Registration Issues
 * This will examine the entire database structure, policies, triggers, and auth configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function comprehensiveDatabaseAnalysis() {
  console.log('🔍 COMPREHENSIVE DATABASE ANALYSIS');
  console.log('=====================================\n');

  try {
    // 1. Basic Connection Test
    console.log('1. 🔗 BASIC CONNECTION TEST');
    console.log('---------------------------');
    const startTime = Date.now();
    const { data: connTest, error: connError } = await supabase
      .from('settings')
      .select('count')
      .limit(1);
    
    const connTime = Date.now() - startTime;
    if (connError) {
      console.log(`❌ Connection failed (${connTime}ms): ${connError.message}`);
      return;
    }
    console.log(`✅ Connection successful (${connTime}ms)\n`);

    // 2. Database Schema Analysis
    console.log('2. 📋 DATABASE SCHEMA ANALYSIS');
    console.log('-------------------------------');
    
    const tables = [
      'user_profiles',
      'products', 
      'categories',
      'orders',
      'order_items',
      'settings',
      'admin_sessions',
      'content_sections'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.message?.includes('does not exist')) {
            console.log(`❌ Table '${table}': MISSING`);
          } else {
            console.log(`⚠️ Table '${table}': ${error.message}`);
          }
        } else {
          console.log(`✅ Table '${table}': EXISTS`);
        }
      } catch (e) {
        console.log(`❌ Table '${table}': ERROR - ${e.message}`);
      }
    }

    // 3. User Profiles Table Detailed Analysis
    console.log('\n3. 👤 USER_PROFILES TABLE ANALYSIS');
    console.log('-----------------------------------');
    
    try {
      // Check table structure by attempting to select specific columns
      const { data: profileStructure, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, phone, default_address, preferences, created_at, updated_at')
        .limit(1);
      
      if (profileError) {
        console.log(`❌ Structure check failed: ${profileError.message}`);
      } else {
        console.log('✅ Table structure appears correct');
        
        // Check if there are any existing records
        const { count } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });
        
        console.log(`📊 Existing user profiles: ${count || 0}`);
      }
    } catch (e) {
      console.log(`❌ user_profiles analysis failed: ${e.message}`);
    }

    // 4. RLS Policies Analysis
    console.log('\n4. 🛡️ ROW LEVEL SECURITY ANALYSIS');
    console.log('----------------------------------');
    
    // Test RLS by trying various operations
    const testOperations = [
      {
        name: 'SELECT without auth',
        operation: () => supabase.from('user_profiles').select('id').limit(1)
      },
      {
        name: 'INSERT without auth',
        operation: () => supabase.from('user_profiles').insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'test@test.com',
          full_name: 'Test'
        })
      }
    ];

    for (const test of testOperations) {
      try {
        const { data, error } = await test.operation();
        if (error) {
          if (error.message?.includes('row-level security policy')) {
            console.log(`✅ ${test.name}: RLS properly blocking`);
          } else {
            console.log(`⚠️ ${test.name}: ${error.message}`);
          }
        } else {
          console.log(`⚠️ ${test.name}: Unexpectedly allowed`);
        }
      } catch (e) {
        console.log(`❌ ${test.name}: ${e.message}`);
      }
    }

    // 5. Auth System Analysis
    console.log('\n5. 🔐 AUTH SYSTEM ANALYSIS');
    console.log('---------------------------');
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log(`Current user: ${user ? user.email : 'None (anonymous)'}`);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log(`Current session: ${session ? 'Active' : 'None'}`);
      
    } catch (e) {
      console.log(`❌ Auth system check failed: ${e.message}`);
    }

    // 6. Test User Registration Flow
    console.log('\n6. 🧪 USER REGISTRATION FLOW TEST');
    console.log('----------------------------------');
    
    const testEmail = `analysis-test-${Date.now()}@example.com`;
    console.log(`Testing with email: ${testEmail}`);
    
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Analysis Test User',
            phone: '+39 123 456 7890',
            default_address: 'Test Address, Italy'
          }
        }
      });

      if (signUpError) {
        console.log(`❌ Registration failed: ${signUpError.message}`);
        console.log(`Error code: ${signUpError.status || 'N/A'}`);
        
        // Analyze the specific error
        if (signUpError.message.includes('Database error saving new user')) {
          console.log('\n🎯 IDENTIFIED ISSUE: Database trigger failure');
          console.log('This suggests the trigger function is missing or failing');
        }
      } else {
        console.log(`✅ Registration successful!`);
        console.log(`User ID: ${signUpData.user?.id}`);
        console.log(`Email confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}`);
        
        // Check if profile was created
        if (signUpData.user?.id) {
          setTimeout(async () => {
            try {
              const { data: profile, error: profileCheckError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', signUpData.user.id)
                .single();
              
              if (profileCheckError) {
                console.log(`❌ Profile not created: ${profileCheckError.message}`);
              } else {
                console.log(`✅ Profile created successfully`);
              }
            } catch (e) {
              console.log(`❌ Profile check failed: ${e.message}`);
            }
          }, 2000);
        }
      }
    } catch (e) {
      console.log(`❌ Registration test exception: ${e.message}`);
    }

    // 7. Database Functions and Triggers Analysis
    console.log('\n7. ⚙️ FUNCTIONS AND TRIGGERS ANALYSIS');
    console.log('-------------------------------------');
    
    // Try to call some common functions to see what exists
    const functionTests = [
      'create_user_profile',
      'update_user_profiles_updated_at'
    ];

    for (const funcName of functionTests) {
      try {
        // This will fail but tell us if the function exists
        const { error } = await supabase.rpc(funcName);
        if (error) {
          if (error.message?.includes('could not find function')) {
            console.log(`❌ Function '${funcName}': MISSING`);
          } else {
            console.log(`✅ Function '${funcName}': EXISTS (${error.message})`);
          }
        }
      } catch (e) {
        console.log(`⚠️ Function '${funcName}': ${e.message}`);
      }
    }

    // 8. Settings Analysis
    console.log('\n8. ⚙️ SETTINGS ANALYSIS');
    console.log('-----------------------');
    
    try {
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['auth_enabled', 'email_confirmation', 'registration_enabled']);
      
      if (settingsError) {
        console.log(`❌ Settings check failed: ${settingsError.message}`);
      } else {
        console.log(`Found ${settings?.length || 0} auth-related settings:`);
        settings?.forEach(setting => {
          console.log(`  ${setting.key}: ${setting.value}`);
        });
      }
    } catch (e) {
      console.log(`❌ Settings analysis failed: ${e.message}`);
    }

    console.log('\n🎯 ANALYSIS COMPLETE');
    console.log('====================');
    console.log('Check the output above for specific issues and recommendations.');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run the comprehensive analysis
comprehensiveDatabaseAnalysis();
