// Diagnostic script to check business hours persistence
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnoseBusinessHours() {
  console.log('🔍 ============================================');
  console.log('🔍 BUSINESS HOURS PERSISTENCE DIAGNOSTIC');
  console.log('🔍 ============================================\n');

  try {
    // Step 1: Check if settings table exists and is accessible
    console.log('📊 Step 1: Checking settings table access...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('settings')
      .select('key')
      .limit(1);

    if (tableError) {
      console.error('❌ Settings table error:', tableError);
      console.error('   Code:', tableError.code);
      console.error('   Message:', tableError.message);
      console.error('   Details:', tableError.details);
      return;
    }
    console.log('✅ Settings table is accessible\n');

    // Step 2: Check current business hours in database
    console.log('📊 Step 2: Fetching current business hours from database...');
    const { data: currentHours, error: fetchError } = await supabase
      .from('settings')
      .select('key, value, created_at, updated_at')
      .eq('key', 'businessHours')
      .single();

    if (fetchError) {
      console.error('❌ Error fetching business hours:', fetchError);
      if (fetchError.code === 'PGRST116') {
        console.log('⚠️  Business hours do not exist in database!');
        console.log('   This might be the problem - the record was never created.\n');
      }
      return;
    }

    console.log('✅ Business hours found in database:');
    console.log('   Created at:', currentHours.created_at);
    console.log('   Updated at:', currentHours.updated_at);
    console.log('   Value:', JSON.stringify(currentHours.value, null, 2));
    console.log('');

    // Step 3: Check for duplicate or conflicting records
    console.log('📊 Step 3: Checking for duplicate business hours records...');
    const { data: allBusinessHours, error: duplicateError } = await supabase
      .from('settings')
      .select('key, id, created_at, updated_at')
      .eq('key', 'businessHours');

    if (duplicateError) {
      console.error('❌ Error checking duplicates:', duplicateError);
    } else {
      console.log(`   Found ${allBusinessHours.length} record(s) with key "businessHours"`);
      if (allBusinessHours.length > 1) {
        console.log('⚠️  WARNING: Multiple business hours records found!');
        allBusinessHours.forEach((record, index) => {
          console.log(`   Record ${index + 1}:`, {
            id: record.id,
            created: record.created_at,
            updated: record.updated_at
          });
        });
      } else {
        console.log('✅ Only one business hours record (correct)');
      }
    }
    console.log('');

    // Step 4: Check all settings keys to look for conflicts
    console.log('📊 Step 4: Listing all settings keys...');
    const { data: allSettings, error: listError } = await supabase
      .from('settings')
      .select('key, updated_at');

    if (listError) {
      console.error('❌ Error listing settings:', listError);
    } else {
      console.log(`   Total settings in database: ${allSettings.length}`);
      allSettings.forEach(setting => {
        console.log(`   - ${setting.key} (updated: ${setting.updated_at})`);
      });
    }
    console.log('');

    // Step 5: Test update operation
    console.log('📊 Step 5: Testing update operation...');
    const testHours = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
      sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
    };

    console.log('   Attempting to save test business hours...');
    const { error: updateError } = await supabase
      .from('settings')
      .upsert({
        key: 'businessHours',
        value: testHours,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (updateError) {
      console.error('❌ Update operation failed:', updateError);
      console.error('   This is likely the root cause of the problem!');
      console.error('   Error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
    } else {
      console.log('✅ Update operation succeeded');
    }
    console.log('');

    // Step 6: Verify the update persisted
    console.log('📊 Step 6: Verifying update persisted...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('settings')
      .select('value, updated_at')
      .eq('key', 'businessHours')
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('✅ Update verified:');
      console.log('   Updated at:', verifyData.updated_at);
      console.log('   Saturday is open:', verifyData.value.saturday.isOpen, '(should be false)');
      console.log('   Sunday is open:', verifyData.value.sunday.isOpen, '(should be false)');
      
      if (!verifyData.value.saturday.isOpen && !verifyData.value.sunday.isOpen) {
        console.log('✅ Test data matches what we saved!');
      } else {
        console.log('❌ Test data does NOT match - persistence issue confirmed!');
      }
    }
    console.log('');

    // Step 7: Check database policies
    console.log('📊 Step 7: Checking RLS policies (if any)...');
    console.log('   Note: We cannot directly query pg_policies from the client');
    console.log('   But we can test if RLS is blocking our operations');
    
    // Try to read with and without auth
    const { data: publicRead } = await supabase
      .from('settings')
      .select('key')
      .eq('key', 'businessHours')
      .single();
    
    if (publicRead) {
      console.log('✅ Public (unauthenticated) read access works');
    } else {
      console.log('❌ Public read access blocked - might be RLS issue');
    }
    console.log('');

    // Final diagnosis
    console.log('🎯 ============================================');
    console.log('🎯 DIAGNOSIS SUMMARY');
    console.log('🎯 ============================================');
    
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('❌ PROBLEM FOUND: Business hours record does not exist in database');
      console.log('   SOLUTION: Run add-business-hours.js to create the initial record');
    } else if (updateError) {
      console.log('❌ PROBLEM FOUND: Cannot update business hours in database');
      console.log('   CAUSE:', updateError.message);
      console.log('   SOLUTION: Check database permissions and RLS policies');
    } else {
      console.log('✅ Database operations work correctly');
      console.log('   If changes are still lost after refresh, the problem is likely in:');
      console.log('   1. Frontend caching (check businessHoursService.ts cache)');
      console.log('   2. Component state management (check BusinessHoursManager.tsx)');
      console.log('   3. Database initialization overwriting values (check initializeDatabase.ts)');
    }

  } catch (error) {
    console.error('❌ Diagnostic script error:', error);
  }
}

// Run diagnostic
diagnoseBusinessHours().catch(console.error);
