// Test script to verify business hours persistence
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPersistence() {
  console.log('\n🧪 ============================================');
  console.log('🧪 BUSINESS HOURS PERSISTENCE TEST');
  console.log('🧪 ============================================\n');

  try {
    // Step 1: Read current hours
    console.log('📖 Step 1: Reading current business hours...');
    const { data: beforeData, error: beforeError } = await supabase
      .from('settings')
      .select('value, updated_at')
      .eq('key', 'businessHours')
      .single();

    if (beforeError) {
      console.error('❌ Error reading business hours:', beforeError);
      if (beforeError.code === 'PGRST116') {
        console.log('\n⚠️  Business hours do not exist! Creating initial record...');
        
        const initialHours = {
          monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          saturday: { isOpen: true, openTime: '10:00', closeTime: '16:00' },
          sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' }
        };

        const { error: insertError } = await supabase
          .from('settings')
          .insert({
            key: 'businessHours',
            value: initialHours,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ Failed to create initial record:', insertError);
          return;
        }

        console.log('✅ Initial business hours created');
        return;
      }
      return;
    }

    console.log('✅ Current hours loaded:');
    console.log('   Updated at:', beforeData.updated_at);
    console.log('   Monday:', beforeData.value.monday);
    console.log('   Tuesday:', beforeData.value.tuesday);

    // Step 2: Make a test change
    console.log('\n🔄 Step 2: Making test changes...');
    const testHours = {
      ...beforeData.value,
      monday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
      tuesday: { isOpen: true, openTime: '10:00', closeTime: '20:00' }
    };

    console.log('   Changing Monday to: 10:00-20:00');
    console.log('   Changing Tuesday to: 10:00-20:00');

    const { error: updateError } = await supabase
      .from('settings')
      .update({
        value: testHours,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'businessHours');

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }

    console.log('✅ Update sent to database');

    // Step 3: Wait a moment then read back
    console.log('\n⏳ Step 3: Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📖 Step 4: Reading back from database...');
    const { data: afterData, error: afterError } = await supabase
      .from('settings')
      .select('value, updated_at')
      .eq('key', 'businessHours')
      .single();

    if (afterError) {
      console.error('❌ Error reading back:', afterError);
      return;
    }

    console.log('✅ Data read back:');
    console.log('   Updated at:', afterData.updated_at);
    console.log('   Monday:', afterData.value.monday);
    console.log('   Tuesday:', afterData.value.tuesday);

    // Step 4: Verify changes persisted
    console.log('\n🔍 Step 5: Verifying changes...');
    const mondayMatch = afterData.value.monday.openTime === '10:00' && 
                       afterData.value.monday.closeTime === '20:00';
    const tuesdayMatch = afterData.value.tuesday.openTime === '10:00' && 
                        afterData.value.tuesday.closeTime === '20:00';

    if (mondayMatch && tuesdayMatch) {
      console.log('✅ SUCCESS: Changes persisted correctly!');
      console.log('   The database is working properly.');
      console.log('   If you still see old values after refresh, the problem is:');
      console.log('   1. Frontend cache in businessHoursService.ts');
      console.log('   2. Browser localStorage');
      console.log('   3. Component initial state in BusinessHoursManager.tsx');
    } else {
      console.log('❌ FAILURE: Changes did NOT persist!');
      console.log('   Expected Monday: 10:00-20:00, Got:', afterData.value.monday);
      console.log('   Expected Tuesday: 10:00-20:00, Got:', afterData.value.tuesday);
      console.log('   This indicates a database-level problem.');
    }

    // Step 5: Restore original values
    console.log('\n🔄 Step 6: Restoring original values...');
    const { error: restoreError } = await supabase
      .from('settings')
      .update({
        value: beforeData.value,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'businessHours');

    if (restoreError) {
      console.error('❌ Failed to restore:', restoreError);
    } else {
      console.log('✅ Original values restored');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }

  console.log('\n🧪 Test complete!\n');
}

testPersistence().catch(console.error);
