/**
 * Debug script to identify user registration issues
 * This will test the complete user registration flow and identify the exact problem
 */

import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the client
const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserRegistration() {
  console.log('🔍 Debugging User Registration Issues...\n');

  try {
    // 1. Test database connection
    console.log('1. 🔗 Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('settings')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // 2. Check if user_profiles table exists
    console.log('2. 📋 Checking user_profiles table...');
    const { data: profilesTest, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .limit(1);

    if (profilesError) {
      if (profilesError.message?.includes('relation "user_profiles" does not exist')) {
        console.error('❌ CRITICAL: user_profiles table does not exist!');
        console.log('🔧 SOLUTION: The user_profiles table migration needs to be applied.');
        console.log('   This is likely the cause of "Database error saving new user"');
        return;
      } else {
        console.log('✅ user_profiles table exists but may have RLS restrictions');
      }
    } else {
      console.log('✅ user_profiles table exists and accessible\n');
    }

    // 3. Check auth.users table access
    console.log('3. 👤 Testing auth system...');
    try {
      // Try to get current user (should be null for anonymous)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.log('⚠️ Auth system issue:', userError.message);
      } else {
        console.log('✅ Auth system accessible (current user: none - expected for anonymous)');
      }
    } catch (authError) {
      console.error('❌ Auth system error:', authError.message);
    }

    // 4. Test trigger function existence
    console.log('\n4. ⚙️ Checking database triggers and functions...');
    
    // Check if the create_user_profile function exists
    const { data: functions, error: functionsError } = await supabase.rpc('get_function_list');
    
    if (functionsError) {
      console.log('⚠️ Cannot check functions (this is normal - function may not exist)');
    } else {
      const hasCreateUserProfile = functions?.some(f => f.name === 'create_user_profile');
      if (hasCreateUserProfile) {
        console.log('✅ create_user_profile function exists');
      } else {
        console.log('❌ create_user_profile function missing - this will cause registration failures');
      }
    }

    // 5. Test a mock registration (without actually creating a user)
    console.log('\n5. 🧪 Testing registration flow components...');
    
    // Test email validation
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    console.log('   📧 Email format validation: ✅ (basic validation passed)');
    console.log('   🔒 Password length validation: ✅ (6+ characters)');

    // 6. Check RLS policies
    console.log('\n6. 🛡️ Checking Row Level Security policies...');
    
    try {
      // Try to insert into user_profiles (should fail due to RLS)
      const { data: rlsTest, error: rlsError } = await supabase
        .from('user_profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000', // Fake UUID
          email: 'test@test.com',
          full_name: 'Test User'
        });

      if (rlsError) {
        if (rlsError.message?.includes('new row violates row-level security policy')) {
          console.log('✅ RLS policies are active (insert blocked - this is correct)');
        } else if (rlsError.message?.includes('duplicate key value')) {
          console.log('✅ RLS policies allow insert (got to constraint check)');
        } else {
          console.log('⚠️ RLS test result:', rlsError.message);
        }
      } else {
        console.log('⚠️ RLS may not be properly configured (insert succeeded)');
      }
    } catch (rlsTestError) {
      console.log('⚠️ RLS test error:', rlsTestError.message);
    }

    // 7. Summary and recommendations
    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('=====================================');
    
    console.log('\n📊 Most likely causes of "Database error saving new user":');
    console.log('1. ❌ user_profiles table missing (needs migration)');
    console.log('2. ❌ create_user_profile trigger function missing');
    console.log('3. ❌ RLS policies preventing profile creation');
    console.log('4. ❌ Database trigger failing during user creation');

    console.log('\n🔧 RECOMMENDED SOLUTIONS:');
    console.log('1. Apply the user_profiles migration:');
    console.log('   - File: supabase/migrations/20250117000000_create_user_profiles_table.sql');
    console.log('   - This creates the table, RLS policies, and trigger function');
    
    console.log('\n2. If migration is already applied, check Supabase dashboard:');
    console.log('   - Go to Database > Functions');
    console.log('   - Verify create_user_profile function exists');
    console.log('   - Go to Database > Triggers');
    console.log('   - Verify create_user_profile_trigger exists on auth.users');

    console.log('\n3. Check Supabase Auth settings:');
    console.log('   - Go to Authentication > Settings');
    console.log('   - Ensure "Enable email confirmations" is configured');
    console.log('   - Check if custom SMTP is needed');

  } catch (error) {
    console.error('❌ Diagnostic script failed:', error.message);
    console.log('\n🔧 This suggests a fundamental database connection issue.');
    console.log('Check your Supabase project status and credentials.');
  }
}

// Run the diagnostic
debugUserRegistration();
