/**
 * Test the registration workaround (no metadata in auth.signUp)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRegistrationWorkaround() {
  console.log('🧪 Testing Registration Workaround...\n');

  try {
    const testEmail = `workaround-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const profileData = {
      fullName: 'Workaround Test User',
      phone: '+39 123 456 7890',
      address: 'Via Workaround 123, Torino, Italy'
    };

    console.log(`📧 Testing with: ${testEmail}`);
    console.log(`👤 Profile data:`, profileData);

    // Step 1: Auth signup WITHOUT metadata (this should work)
    console.log('\n1. 🔐 Testing auth.signUp without metadata...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
      // No options.data - this should avoid the trigger failure
    });

    if (authError) {
      console.log(`❌ Auth signup still failed: ${authError.message}`);
      return false;
    }

    console.log(`✅ Auth user created successfully: ${authData.user?.id}`);
    console.log(`📧 Email confirmed: ${authData.user?.email_confirmed_at ? 'Yes' : 'No'}`);

    // Step 2: Wait a moment then create profile manually
    if (authData.user) {
      console.log('\n2. ⏳ Waiting 1 second for user to be fully created...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('3. 👤 Creating user profile manually...');
      
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
        
        if (profileError.message?.includes('row-level security policy')) {
          console.log('\n🔐 Trying with authenticated user...');
          
          // Sign in the user to get auth context
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
          });
          
          if (signInError) {
            console.log(`❌ Sign in failed: ${signInError.message}`);
          } else {
            console.log(`✅ User signed in: ${signInData.user?.id}`);
            
            // Try profile creation again
            const { error: retryError } = await supabase
              .from('user_profiles')
              .insert({
                id: signInData.user.id,
                email: signInData.user.email || testEmail,
                full_name: profileData.fullName || '',
                phone: profileData.phone || '',
                default_address: profileData.address || ''
              });
            
            if (retryError) {
              console.log(`❌ Retry profile creation failed: ${retryError.message}`);
            } else {
              console.log('✅ Profile created successfully after authentication!');
            }
            
            // Sign out
            await supabase.auth.signOut();
            console.log('🔓 Signed out after profile creation');
          }
        }
      } else {
        console.log('✅ Profile created successfully without authentication!');
      }

      // Step 4: Verify the profile
      console.log('\n4. 🔍 Verifying profile...');
      
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

    console.log('\n🎉 Workaround test completed!');
    console.log('💡 If this worked, the frontend fix should resolve the registration issue');
    
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testRegistrationWorkaround();
