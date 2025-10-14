// Force update Google API key - completely replace it
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const YOUR_API_KEY = 'AIzaSyDnJS3eyAnguEeCdZIMmYUNzq8LOBhmkMA';

async function forceUpdateApiKey() {
  console.log('\n🔧 ============================================');
  console.log('🔧 FORCE UPDATE GOOGLE API KEY');
  console.log('🔧 ============================================\n');

  try {
    // Step 1: Get current settings
    console.log('📊 Step 1: Reading current settings...');
    const { data: currentData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'shippingZoneSettings')
      .single();

    let currentSettings = currentData?.value || {};
    console.log('Current API key in DB:', currentSettings.googleMapsApiKey || 'NONE');

    // Step 2: Delete the old record completely
    console.log('\n🗑️  Step 2: Deleting old settings record...');
    const { error: deleteError } = await supabase
      .from('settings')
      .delete()
      .eq('key', 'shippingZoneSettings');

    if (deleteError) {
      console.log('⚠️  Delete warning:', deleteError.message);
    } else {
      console.log('✅ Old record deleted');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Create fresh settings with YOUR API key
    console.log('\n💾 Step 3: Creating new settings with YOUR API key...');
    
    const newSettings = {
      enabled: true,
      restaurantAddress: currentSettings.restaurantAddress || 'Corso Regina Margherita, 53/b, 10124, Torino TO, Italia',
      restaurantLat: currentSettings.restaurantLat || 45.0703,
      restaurantLng: currentSettings.restaurantLng || 7.6869,
      maxDeliveryDistance: currentSettings.maxDeliveryDistance || 15,
      deliveryFee: currentSettings.deliveryFee || 5.00,
      freeDeliveryThreshold: currentSettings.freeDeliveryThreshold || 50.00,
      googleMapsApiKey: YOUR_API_KEY
    };

    console.log('New settings:');
    console.log('  API Key:', newSettings.googleMapsApiKey);
    console.log('  Restaurant:', newSettings.restaurantAddress);

    const { error: insertError } = await supabase
      .from('settings')
      .insert({
        key: 'shippingZoneSettings',
        value: newSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      return;
    }

    console.log('✅ New settings inserted successfully!');

    // Step 4: Verify
    console.log('\n🔍 Step 4: Verifying...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: verifyData, error: verifyError } = await supabase
      .from('settings')
      .select('value, updated_at')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('Verified data:');
    console.log('  API Key:', verifyData.value.googleMapsApiKey);
    console.log('  Updated at:', verifyData.updated_at);

    if (verifyData.value.googleMapsApiKey === YOUR_API_KEY) {
      console.log('\n✅ ✅ ✅ SUCCESS! ✅ ✅ ✅');
      console.log('Your Google API key is NOW in the database!');
      console.log('');
      console.log('🎯 Next steps:');
      console.log('1. Restart your dev server (Ctrl+C, then npm run dev)');
      console.log('2. Hard refresh browser (Ctrl+Shift+R)');
      console.log('3. Your API key will now work for:');
      console.log('   - Contact page Google Maps ✓');
      console.log('   - Address validation ✓');
      console.log('   - Delivery zone calculations ✓');
    } else {
      console.log('\n❌ FAILURE: API key still does not match!');
      console.log('Expected:', YOUR_API_KEY);
      console.log('Got:', verifyData.value.googleMapsApiKey);
      console.log('\nThis may be a database permissions issue.');
    }

  } catch (error) {
    console.error('\n❌ Script error:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }

  console.log('\n🔧 Update complete!\n');
}

forceUpdateApiKey().catch(console.error);
