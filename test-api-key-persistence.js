// Test API key persistence after manual entry
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://despodpgvkszyexvcbft.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlc3BvZHBndmtzenlleHZjYmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTcyMTAsImV4cCI6MjA2MzkzMzIxMH0.zyjFQA-Kr317M5l_6qjV_a-6ED2iU4wraRuYaa0iGEg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const testApiKeyPersistence = async () => {
  console.log('🧪 TESTING API KEY PERSISTENCE');
  console.log('='.repeat(50));
  
  const testApiKey = 'AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs';
  
  try {
    // Step 1: Clear any existing settings to simulate fresh state
    console.log('\n1️⃣ Clearing existing settings...');
    const { error: deleteError } = await supabase
      .from('settings')
      .delete()
      .eq('key', 'shippingZoneSettings');
    
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('❌ Error clearing settings:', deleteError.message);
    } else {
      console.log('✅ Settings cleared (or didn\'t exist)');
    }

    // Step 2: Simulate manual entry by creating settings with API key
    console.log('\n2️⃣ Simulating manual API key entry...');
    const newSettings = {
      enabled: true,
      restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
      restaurantLat: 45.0703,
      restaurantLng: 7.6869,
      maxDeliveryDistance: 15,
      deliveryFee: 5.00,
      freeDeliveryThreshold: 50.00,
      googleMapsApiKey: testApiKey
    };

    const { data: insertData, error: insertError } = await supabase
      .from('settings')
      .insert({
        key: 'shippingZoneSettings',
        value: newSettings,
        updated_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ API key saved to database');
    console.log('📊 Saved data:', insertData[0]);

    // Step 3: Simulate page refresh by reading settings back
    console.log('\n3️⃣ Simulating page refresh - reading settings...');
    const { data: readData, error: readError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (readError) {
      throw readError;
    }

    console.log('✅ Settings read after refresh');
    console.log('📊 Read data:', readData);
    
    // Step 4: Verify API key is present and correct
    console.log('\n4️⃣ Verifying API key persistence...');
    if (readData.value?.googleMapsApiKey) {
      if (readData.value.googleMapsApiKey === testApiKey) {
        console.log('✅ API key persisted correctly!');
        console.log('🔑 Key matches expected value');
        console.log('📏 Key length:', readData.value.googleMapsApiKey.length);
      } else {
        console.error('❌ API key value mismatch!');
        console.log('Expected:', testApiKey);
        console.log('Got:', readData.value.googleMapsApiKey);
        return false;
      }
    } else {
      console.error('❌ API key not found in persisted data!');
      return false;
    }

    // Step 5: Test API key functionality
    console.log('\n5️⃣ Testing API key functionality...');
    const testAddress = 'Via Roma 1, Torino, Italy';
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${readData.value.googleMapsApiKey}`;
    
    const response = await fetch(geocodeUrl);
    const geocodeData = await response.json();
    
    if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
      console.log('✅ API key is functional');
      console.log('📍 Test address geocoded successfully');
      console.log('📍 Result:', geocodeData.results[0].formatted_address);
    } else {
      console.error('❌ API key test failed:', geocodeData.status, geocodeData.error_message);
      return false;
    }

    // Step 6: Test update scenario
    console.log('\n6️⃣ Testing update scenario...');
    const updatedSettings = {
      ...readData.value,
      testUpdate: new Date().toISOString(),
      deliveryFee: 6.00 // Change something
    };

    const { data: updateData, error: updateError } = await supabase
      .from('settings')
      .update({
        value: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'shippingZoneSettings')
      .select();

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Settings updated successfully');
    
    // Verify API key still present after update
    if (updateData[0].value?.googleMapsApiKey === testApiKey) {
      console.log('✅ API key preserved during update');
    } else {
      console.error('❌ API key lost during update!');
      return false;
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL PERSISTENCE TESTS PASSED!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ API key saves correctly to database');
    console.log('✅ API key persists after page refresh');
    console.log('✅ API key remains functional');
    console.log('✅ API key preserved during updates');
    console.log('\n🚀 The persistence issue has been resolved!');
    
    return true;

  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
    return false;
  }
};

// Run the test
testApiKeyPersistence().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
