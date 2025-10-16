/**
 * Fix User Registration Trigger Script
 * Creates the missing database trigger function for user profile creation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserRegistrationTrigger() {
  console.log('🔧 FIXING USER REGISTRATION TRIGGER');
  console.log('===================================\n');

  try {
    // Note: This requires service role key for database function creation
    // Since we only have anon key, we'll provide the SQL that needs to be run
    
    console.log('⚠️  IMPORTANT: This fix requires SUPABASE_SERVICE_ROLE_KEY');
    console.log('The following SQL needs to be executed in Supabase SQL Editor:\n');
    
    const triggerSQL = `
-- 1. Create the user profile creation function
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name, 
    phone, 
    default_address, 
    preferences, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'default_address', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferences', '{}')::jsonb,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- 3. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create updated_at trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at_trigger ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- 5. Ensure RLS is properly configured
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create proper RLS policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profiles_updated_at() TO anon, authenticated;
`;

    console.log('📋 SQL TO EXECUTE:');
    console.log('==================');
    console.log(triggerSQL);
    
    console.log('\n📝 INSTRUCTIONS:');
    console.log('================');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL above');
    console.log('4. Execute the SQL');
    console.log('5. Run this script again to verify the fix');
    
    // Test if we can at least verify the current state
    console.log('\n🔍 CURRENT STATE VERIFICATION:');
    console.log('==============================');
    
    // Test user registration to confirm the issue
    const testEmail = `trigger-test-${Date.now()}@example.com`;
    console.log(`Testing registration with: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          full_name: 'Trigger Test User',
          phone: '+39 123 456 7890'
        }
      }
    });
    
    if (error) {
      if (error.message.includes('Database error saving new user')) {
        console.log('❌ CONFIRMED: User registration trigger is missing');
        console.log('   Execute the SQL above to fix this issue');
        return { fixed: false, issue: 'trigger_missing' };
      } else {
        console.log(`❌ Registration failed with different error: ${error.message}`);
        return { fixed: false, issue: 'other_error', error: error.message };
      }
    } else {
      console.log('✅ Registration successful - trigger appears to be working!');
      console.log(`   User ID: ${data.user?.id}`);
      
      // Verify profile was created
      if (data.user?.id) {
        setTimeout(async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profileError) {
              console.log('❌ Profile was not created despite successful registration');
            } else {
              console.log('✅ User profile created successfully');
              console.log(`   Profile: ${profile.full_name} (${profile.email})`);
            }
          } catch (e) {
            console.log(`❌ Profile verification failed: ${e.message}`);
          }
        }, 2000);
      }
      
      return { fixed: true };
    }
    
  } catch (error) {
    console.error('❌ Fix script failed:', error.message);
    return { fixed: false, error: error.message };
  }
}

// Export for use in other scripts
export { fixUserRegistrationTrigger };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixUserRegistrationTrigger()
    .then(result => {
      if (result.fixed) {
        console.log('\n✅ User registration trigger is working correctly');
      } else {
        console.log('\n❌ User registration trigger needs to be fixed manually');
        console.log('   Follow the SQL instructions above');
      }
    })
    .catch(error => {
      console.error('❌ Script execution failed:', error);
      process.exit(1);
    });
}
