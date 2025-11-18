// Test address setting/geocoding functionality
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';
const API_KEY = 'AIzaSyDnJS3eyAnguEeCdZIMmYUNzq8LOBhmkMA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAddressSetting() {
  console.log('\n🧪 ============================================');
  console.log('🧪 TESTING ADDRESS SETTING FUNCTIONALITY');
  console.log('🧪 ============================================\n');

  // Test address
  const testAddress = 'Corso Regina Margherita, 53, Torino, Italy';
  
  console.log('📍 Test Address:', testAddress);
  console.log('🔑 API Key:', API_KEY);
  console.log('');

  try {
    // Step 1: Test geocoding directly
    console.log('📊 Step 1: Testing geocoding with Google Maps API...');
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${API_KEY}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    console.log('Status:', data.status);

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      console.log('✅ Geocoding successful!');
      console.log('   Formatted Address:', result.formatted_address);
      console.log('   Latitude:', result.geometry.location.lat);
      console.log('   Longitude:', result.geometry.location.lng);

      // Step 2: Try to save to database
      console.log('\n💾 Step 2: Saving to database...');

      const { data: currentSettings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'shippingZoneSettings')
        .single();

      const updatedSettings = {
        ...currentSettings?.value,
        restaurantAddress: testAddress,
        restaurantLat: result.geometry.location.lat,
        restaurantLng: result.geometry.location.lng,
        googleMapsApiKey: API_KEY
      };

      const { error: saveError } = await supabase
        .from('settings')
        .update({
          value: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'shippingZoneSettings');

      if (saveError) {
        console.error('❌ Failed to save:', saveError);
      } else {
        console.log('✅ Address saved to database successfully!');

        // Verify
        console.log('\n🔍 Step 3: Verifying save...');
        const { data: verifyData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'shippingZoneSettings')
          .single();

        console.log('Verified address:', verifyData.value.restaurantAddress);
        console.log('Verified coordinates:', {
          lat: verifyData.value.restaurantLat,
          lng: verifyData.value.restaurantLng
        });
      }

    } else if (data.status === 'REQUEST_DENIED') {
      console.log('❌ Geocoding failed: REQUEST_DENIED');
      console.log('   Error:', data.error_message);
      console.log('');
      console.log('🔧 This means:');
      console.log('   - The API key is being used');
      console.log('   - But something is wrong with the API configuration');
      console.log('');
      console.log('📋 Check:');
      console.log('   1. Is "Geocoding API" enabled at:');
      console.log('      https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com');
      console.log('   2. Are there API restrictions on the key?');
      console.log('   3. Is the key linked to the correct project with billing?');
    } else {
      console.log('⚠️  Unexpected status:', data.status);
      console.log('   Message:', data.error_message || 'No message');
    }

  } catch (error) {
    console.error('\n❌ Test error:', error);
  }

  console.log('\n🧪 Test complete!\n');
}

testAddressSetting().catch(console.error);
