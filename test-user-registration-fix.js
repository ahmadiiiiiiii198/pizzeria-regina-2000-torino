/**
 * Test the user registration fix
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserRegistrationFix() {
  console.log('🧪 Testing User Registration Fix...\n');

  try {
    const testEmail = `fix-test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const profileData = {
      fullName: 'Fix Test User',
      phone: '+39 123 456 7890',
      address: 'Via Test 123, Torino, Italy'
    };

    console.log(`📧 Testing registration with: ${testEmail}`);
    console.log(`👤 Profile data:`, profileData);

    // Step 1: Try auth signup
    console.log('\n1. 🔐 Testing auth.signUp...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: profileData.fullName,
          phone: profileData.phone,
          default_address: profileData.address,
        },
      },
    });

    if (authError) {
      console.log(`❌ Auth signup failed: ${authError.message}`);
      return false;
    }

    console.log(`✅ Auth user created: ${authData.user?.id}`);

    // Step 2: Manually create profile (simulating the frontend fix)
    if (authData.user) {
      console.log('\n2. 👤 Creating user profile manually...');
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email || testEmail,
          full_name: profileData.fullName || '',
          phone: profileData.phone || '',
          default_address: profileData.address || ''
        });

      if (profileError) {
        console.log(`❌ Profile creation failed: ${profileError.message}`);
        
        // Check if it's a permission issue
        if (profileError.message?.includes('row-level security policy')) {
          console.log('🔍 This is an RLS policy issue - the user needs to be authenticated to create their profile');
          console.log('💡 The frontend fix should work because the user will be authenticated after signup');
        }
        
        return false;
      } else {
        console.log('✅ Profile created successfully!');
      }

      // Step 3: Verify profile was created
      console.log('\n3. 🔍 Verifying profile creation...');
      
      setTimeout(async () => {
        try {
          const { data: profile, error: verifyError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (verifyError) {
            console.log(`⚠️ Profile verification failed: ${verifyError.message}`);
          } else {
            console.log('✅ Profile verified successfully!');
            console.log(`   ID: ${profile.id}`);
            console.log(`   Email: ${profile.email}`);
            console.log(`   Name: ${profile.full_name}`);
            console.log(`   Phone: ${profile.phone}`);
            console.log(`   Address: ${profile.default_address}`);
          }
        } catch (e) {
          console.log(`❌ Profile verification exception: ${e.message}`);
        }
      }, 2000);
    }

    console.log('\n🎉 Registration test completed!');
    console.log('💡 The frontend fix should resolve the "Database error saving new user" issue');
    
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testUserRegistrationFix();
