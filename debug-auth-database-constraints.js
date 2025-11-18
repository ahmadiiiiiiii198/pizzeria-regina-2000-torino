/**
 * Debug auth database constraints and policies
 * The issue might be with auth.users table constraints or triggers
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuthDatabaseConstraints() {
  console.log('🔍 Debugging Auth Database Constraints...\n');

  try {
    // 1. Test basic auth operations
    console.log('1. 🔐 Testing basic auth operations...');
    
    // Test getting current user (should work)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log(`❌ getUser failed: ${userError.message}`);
    } else {
      console.log(`✅ getUser works (current: ${user ? user.email : 'anonymous'})`);
    }

    // 2. Test with minimal signup data
    console.log('\n2. 🧪 Testing minimal signup (no metadata)...');
    const minimalEmail = `minimal-${Date.now()}@example.com`;
    
    const { data: minimalData, error: minimalError } = await supabase.auth.signUp({
      email: minimalEmail,
      password: 'testpassword123'
      // No options.data - this should work if the issue is with metadata
    });

    if (minimalError) {
      console.log(`❌ Minimal signup failed: ${minimalError.message}`);
      console.log('🔍 This suggests the issue is with auth.users table itself, not metadata');
    } else {
      console.log(`✅ Minimal signup worked! User: ${minimalData.user?.id}`);
      console.log('🔍 This suggests the issue is with metadata processing');
    }

    // 3. Test with different metadata combinations
    console.log('\n3. 🧪 Testing different metadata combinations...');
    
    const metadataTests = [
      {
        name: 'Only full_name',
        data: { full_name: 'Test User' }
      },
      {
        name: 'Only phone',
        data: { phone: '+39 123 456 7890' }
      },
      {
        name: 'Only default_address',
        data: { default_address: 'Test Address' }
      }
    ];

    for (const test of metadataTests) {
      const testEmail = `${test.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@example.com`;
      
      console.log(`\n   Testing: ${test.name}`);
      console.log(`   Email: ${testEmail}`);
      console.log(`   Data:`, test.data);
      
      const { data: testData, error: testError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: test.data
        }
      });

      if (testError) {
        console.log(`   ❌ Failed: ${testError.message}`);
      } else {
        console.log(`   ✅ Success: ${testData.user?.id}`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. Check if there are any existing users
    console.log('\n4. 📊 Checking existing data...');
    
    try {
      const { count: profileCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      console.log(`User profiles in database: ${profileCount || 0}`);
      
      if (profileCount && profileCount > 0) {
        const { data: sampleProfiles } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, created_at')
          .limit(3);
        
        console.log('Sample profiles:');
        sampleProfiles?.forEach(profile => {
          console.log(`  - ${profile.email} (${profile.full_name}) - ${profile.created_at}`);
        });
      }
    } catch (e) {
      console.log(`⚠️ Could not check existing profiles: ${e.message}`);
    }

    // 5. Test auth configuration
    console.log('\n5. ⚙️ Testing auth configuration...');
    
    // Check if email confirmation is required
    console.log('Checking if email confirmation affects registration...');
    
    // Try with a different approach - using a very simple email
    const simpleEmail = `simple${Date.now()}@test.com`;
    console.log(`Testing with simple email: ${simpleEmail}`);
    
    const { data: simpleData, error: simpleError } = await supabase.auth.signUp({
      email: simpleEmail,
      password: '123456'
    });

    if (simpleError) {
      console.log(`❌ Simple test failed: ${simpleError.message}`);
      
      // Analyze the error more deeply
      console.log('\n🔍 ERROR ANALYSIS:');
      console.log(`Error message: "${simpleError.message}"`);
      console.log(`Error status: ${simpleError.status || 'N/A'}`);
      
      if (simpleError.message.includes('Database error saving new user')) {
        console.log('\n🎯 ROOT CAUSE IDENTIFIED:');
        console.log('The issue is with the database trigger on auth.users table');
        console.log('The create_user_profile trigger is failing when trying to insert into user_profiles');
        console.log('\n💡 SOLUTIONS:');
        console.log('1. Disable the trigger temporarily');
        console.log('2. Fix the trigger function');
        console.log('3. Use manual profile creation (already implemented in frontend)');
      }
    } else {
      console.log(`✅ Simple test worked: ${simpleData.user?.id}`);
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('======================');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

// Run the debug
debugAuthDatabaseConstraints();
