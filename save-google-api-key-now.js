// Save Google API key to database
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Your Google API key
const YOUR_API_KEY = 'AIzaSyDnJS3eyAnguEeCdZIMmYUNzq8LOBhmkMA';

async function saveGoogleApiKey() {
  console.log('\n🔑 ============================================');
  console.log('🔑 SAVING GOOGLE API KEY TO DATABASE');
  console.log('🔑 ============================================\n');

  try {
    // Step 1: Load current shipping settings
    console.log('📊 Step 1: Loading current shipping settings...');
    const { data: currentData, error: fetchError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'shippingZoneSettings')
      .single();

    let settings = {
      enabled: true,
      restaurantAddress: 'Corso Regina Margherita, 53/b, 10124, Torino TO, Italia',
      restaurantLat: 45.0703,
      restaurantLng: 7.6869,
      maxDeliveryDistance: 15,
      deliveryFee: 5.00,
      freeDeliveryThreshold: 50.00,
      googleMapsApiKey: YOUR_API_KEY
    };

    if (!fetchError && currentData?.value) {
      // Merge with existing settings
      settings = { ...settings, ...currentData.value, googleMapsApiKey: YOUR_API_KEY };
      console.log('✅ Current settings loaded, will update API key');
    } else {
      console.log('⚠️  No existing settings, will create new with API key');
    }

    // Step 2: Save with the new API key
    console.log('\n💾 Step 2: Saving API key to database...');
    console.log('   API Key:', YOUR_API_KEY);

    const { error: saveError } = await supabase
      .from('settings')
      .upsert({
        key: 'shippingZoneSettings',
        value: settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (saveError) {
      console.error('❌ Failed to save:', saveError);
      console.error('Error details:', JSON.stringify(saveError, null, 2));
      return;
    }

    console.log('✅ API key saved successfully!');

    // Step 3: Verify
    console.log('\n🔍 Step 3: Verifying save...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: verifyData, error: verifyError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('Verified API Key in database:', verifyData.value.googleMapsApiKey);

    if (verifyData.value.googleMapsApiKey === YOUR_API_KEY) {
      console.log('\n✅ SUCCESS! Google API key is now saved in the database.');
      console.log('');
      console.log('🎯 Next steps:');
      console.log('1. Restart your dev server (Ctrl+C, then npm run dev)');
      console.log('2. Refresh your browser');
      console.log('3. The Google Maps should now work with your API key!');
    } else {
      console.log('\n❌ FAILURE: API key does not match!');
      console.log('Expected:', YOUR_API_KEY);
      console.log('Got:', verifyData.value.googleMapsApiKey);
    }

  } catch (error) {
    console.error('\n❌ Script error:', error);
  }

  console.log('\n🔑 Save complete!\n');
}

saveGoogleApiKey().catch(console.error);
