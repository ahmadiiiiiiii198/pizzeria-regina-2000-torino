// Emergency fix for business hours - check and update immediately
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixBusinessHours() {
  console.log('\n🔧 ============================================');
  console.log('🔧 EMERGENCY BUSINESS HOURS FIX');
  console.log('🔧 ============================================\n');

  try {
    // Step 1: Check current state
    console.log('📊 Step 1: Checking current business hours...');
    const { data: currentData, error: fetchError } = await supabase
      .from('settings')
      .select('value, updated_at')
      .eq('key', 'businessHours')
      .single();

    if (fetchError) {
      console.error('❌ Error fetching:', fetchError);
      if (fetchError.code === 'PGRST116') {
        console.log('⚠️  No business hours exist! Creating now...');
      } else {
        return;
      }
    } else {
      console.log('Current hours in database:');
      console.log(JSON.stringify(currentData.value, null, 2));
      console.log('\nLast updated:', currentData.updated_at);
    }

    // Step 2: Set business hours to be ALWAYS OPEN (24/7) for testing
    console.log('\n🔧 Step 2: Setting business hours to ALWAYS OPEN for testing...');
    
    const alwaysOpenHours = {
      monday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      tuesday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      wednesday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      thursday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      friday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      saturday: { isOpen: true, openTime: '00:00', closeTime: '23:59' },
      sunday: { isOpen: true, openTime: '00:00', closeTime: '23:59' }
    };

    const { error: updateError } = await supabase
      .from('settings')
      .upsert({
        key: 'businessHours',
        value: alwaysOpenHours,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (updateError) {
      console.error('❌ Failed to update:', updateError);
      console.error('Error details:', JSON.stringify(updateError, null, 2));
      return;
    }

    console.log('✅ Business hours set to ALWAYS OPEN (00:00-23:59 every day)');

    // Step 3: Verify the update
    console.log('\n🔍 Step 3: Verifying update...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: verifyData, error: verifyError } = await supabase
      .from('settings')
      .select('value, updated_at')
      .eq('key', 'businessHours')
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('Verified hours in database:');
    console.log('  Monday:', verifyData.value.monday);
    console.log('  Tuesday:', verifyData.value.tuesday);
    console.log('  Updated at:', verifyData.updated_at);

    // Check if it matches
    const matches = verifyData.value.monday.openTime === '00:00' && 
                   verifyData.value.monday.closeTime === '23:59';

    if (matches) {
      console.log('\n✅ SUCCESS: Business hours are now ALWAYS OPEN!');
      console.log('');
      console.log('🎯 Next steps:');
      console.log('1. Refresh your browser (F5)');
      console.log('2. Try adding a product to cart');
      console.log('3. You should now be able to order!');
      console.log('');
      console.log('⚠️  IMPORTANT: These are set to 24/7 for TESTING.');
      console.log('   Go to Admin Panel > Orari to set your real business hours.');
    } else {
      console.log('\n❌ FAILURE: Update did not persist!');
      console.log('Expected: 00:00-23:59, Got:', verifyData.value.monday);
      console.log('\nThis indicates a DATABASE PERMISSION or RLS POLICY issue.');
      console.log('You may need to check your Supabase RLS policies for the settings table.');
    }

  } catch (error) {
    console.error('\n❌ Script error:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }

  console.log('\n🔧 Fix attempt complete!\n');
}

fixBusinessHours().catch(console.error);
