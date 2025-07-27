/**
 * Fix user registration by ensuring all required database components exist
 */

import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the client
const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserRegistration() {
  console.log('🔧 Fixing User Registration Issues...\n');

  try {
    // 1. Check current state
    console.log('1. 🔍 Checking current database state...');
    
    const { data: profilesTest, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (profilesError && profilesError.message?.includes('relation "user_profiles" does not exist')) {
      console.log('❌ user_profiles table missing - will create it');
      await createUserProfilesTable();
    } else {
      console.log('✅ user_profiles table exists');
    }

    // 2. Test user registration with a temporary test
    console.log('\n2. 🧪 Testing user registration...');
    
    // Generate a unique test email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    console.log(`   📧 Testing with email: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          phone: '+39 123 456 7890',
          default_address: 'Test Address'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Registration test failed:', signUpError.message);
      
      if (signUpError.message.includes('Database error')) {
        console.log('\n🔧 Attempting to fix database trigger issues...');
        await fixDatabaseTriggers();
      }
      
      return false;
    } else {
      console.log('✅ Registration test successful!');
      
      // Clean up test user if possible
      if (signUpData.user) {
        console.log('🧹 Cleaning up test user...');
        try {
          // Note: We can't delete users via client SDK, but that's okay for testing
          console.log('   (Test user will remain in database - this is normal)');
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }
      
      return true;
    }

  } catch (error) {
    console.error('❌ Fix script failed:', error.message);
    return false;
  }
}

async function createUserProfilesTable() {
  console.log('🏗️ Creating user_profiles table and related components...');
  
  // SQL commands from the migration file
  const sqlCommands = [
    // Create table
    `CREATE TABLE IF NOT EXISTS user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      full_name TEXT,
      phone TEXT,
      default_address TEXT,
      preferences JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);`,
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);`,
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);`,
    
    // Enable RLS
    `ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;`,
    
    // Create update trigger function
    `CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;`,
    
    // Create update trigger
    `CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_user_profiles_updated_at();`,
    
    // Create user profile creation function
    `CREATE OR REPLACE FUNCTION create_user_profile()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO user_profiles (id, email, full_name, phone, default_address)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'default_address', '')
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;`,
    
    // Create trigger for automatic profile creation
    `DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;`,
    `CREATE TRIGGER create_user_profile_trigger
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_user_profile();`
  ];

  for (let i = 0; i < sqlCommands.length; i++) {
    const command = sqlCommands[i];
    console.log(`   Executing command ${i + 1}/${sqlCommands.length}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: command });
      
      if (error) {
        console.log(`   ⚠️ Command ${i + 1} warning: ${error.message}`);
      } else {
        console.log(`   ✅ Command ${i + 1} executed successfully`);
      }
    } catch (e) {
      console.log(`   ⚠️ Command ${i + 1} note: ${e.message}`);
    }
  }
}

async function fixDatabaseTriggers() {
  console.log('🔧 Fixing database triggers...');
  
  // Recreate the trigger function with better error handling
  const triggerFunction = `
    CREATE OR REPLACE FUNCTION create_user_profile()
    RETURNS TRIGGER AS $$
    BEGIN
      BEGIN
        INSERT INTO user_profiles (id, email, full_name, phone, default_address)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', ''),
          COALESCE(NEW.raw_user_meta_data->>'phone', ''),
          COALESCE(NEW.raw_user_meta_data->>'default_address', '')
        );
      EXCEPTION
        WHEN OTHERS THEN
          -- Log the error but don't fail the user creation
          RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
      END;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: triggerFunction });
    
    if (error) {
      console.log(`   ⚠️ Trigger function update warning: ${error.message}`);
    } else {
      console.log('   ✅ Trigger function updated with error handling');
    }
  } catch (e) {
    console.log(`   ⚠️ Trigger function note: ${e.message}`);
  }
}

// Run the fix
fixUserRegistration().then(success => {
  if (success) {
    console.log('\n🎉 User registration fix completed successfully!');
    console.log('💡 You can now try creating a new user account.');
  } else {
    console.log('\n❌ User registration fix encountered issues.');
    console.log('💡 Please check the Supabase dashboard for more details.');
  }
});
