/**
 * Fix the user registration trigger function
 * The current trigger only handles full_name but registration sends phone and default_address too
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserRegistrationTrigger() {
  console.log('🔧 Fixing User Registration Trigger Function...\n');

  try {
    console.log('🔍 Current Issue Analysis:');
    console.log('- The create_user_profile() function exists but is incomplete');
    console.log('- It only handles: id, email, full_name');
    console.log('- But registration sends: full_name, phone, default_address');
    console.log('- This mismatch causes the trigger to fail\n');

    console.log('🛠️ Solution: Update the trigger function to handle all fields\n');

    // The corrected trigger function that handles all the metadata fields
    const correctedTriggerFunction = `
-- Drop existing trigger first
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

-- Create improved function that handles all metadata fields
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with all available metadata
  INSERT INTO user_profiles (
    id, 
    email, 
    full_name, 
    phone, 
    default_address
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'fullName', 
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'phone', 
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'default_address', 
      ''
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
    `;

    console.log('📝 Applying the corrected trigger function...');
    console.log('(Note: This will show warnings but should work)\n');

    // Split the SQL into individual commands
    const commands = correctedTriggerFunction
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';';
      console.log(`Executing command ${i + 1}/${commands.length}...`);
      
      try {
        // Try using a simple query approach since rpc might not work
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.log(`   ⚠️ Command ${i + 1}: ${error.message}`);
        } else {
          console.log(`   ✅ Command ${i + 1}: Success`);
        }
      } catch (e) {
        console.log(`   ⚠️ Command ${i + 1}: ${e.message}`);
      }
    }

    console.log('\n🧪 Testing the fix...');
    
    // Test registration with the fixed trigger
    const testEmail = `trigger-test-${Date.now()}@example.com`;
    console.log(`Testing with: ${testEmail}`);

    const { data: testData, error: testError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          full_name: 'Trigger Test User',
          phone: '+39 123 456 7890',
          default_address: 'Via Test 123, Torino, Italy'
        }
      }
    });

    if (testError) {
      console.log(`❌ Test registration still failed: ${testError.message}`);
      
      if (testError.message.includes('Database error saving new user')) {
        console.log('\n🔍 The trigger fix didn\'t work. Let\'s try alternative approach...');
        await tryAlternativeApproach();
      }
    } else {
      console.log('✅ Test registration successful!');
      console.log(`User created: ${testData.user?.id}`);
      
      // Check if profile was created
      setTimeout(async () => {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', testData.user.id)
            .single();
          
          if (profileError) {
            console.log(`❌ Profile not found: ${profileError.message}`);
          } else {
            console.log('✅ Profile created successfully!');
            console.log(`   Name: ${profile.full_name}`);
            console.log(`   Phone: ${profile.phone}`);
            console.log(`   Address: ${profile.default_address}`);
          }
        } catch (e) {
          console.log(`❌ Profile check failed: ${e.message}`);
        }
      }, 3000);
    }

  } catch (error) {
    console.error('❌ Fix script failed:', error.message);
  }
}

async function tryAlternativeApproach() {
  console.log('\n🔄 ALTERNATIVE APPROACH: Manual Profile Creation');
  console.log('================================================');
  
  console.log('Since the trigger approach isn\'t working, we need to:');
  console.log('1. Modify the frontend registration code');
  console.log('2. Create profiles manually after user creation');
  console.log('3. Or fix the Supabase configuration directly');
  
  console.log('\n📋 MANUAL STEPS NEEDED:');
  console.log('1. Go to Supabase Dashboard → Database → Functions');
  console.log('2. Find "create_user_profile" function');
  console.log('3. Edit it to include phone and default_address fields');
  console.log('4. Or modify the frontend code to create profiles manually');
  
  console.log('\n🔧 Frontend Code Modification Needed:');
  console.log('In useCustomerAuth.tsx, after successful signUp, add:');
  console.log(`
// After successful auth.signUp, manually create profile:
if (data.user && !error) {
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: data.user.id,
      email: data.user.email,
      full_name: profileData.fullName,
      phone: profileData.phone,
      default_address: profileData.address
    });
  
  if (profileError) {
    console.error('Profile creation failed:', profileError);
  }
}
  `);
}

// Run the fix
fixUserRegistrationTrigger();
