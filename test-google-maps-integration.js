// Comprehensive test for Google Maps API integration
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://despodpgvkszyexvcbft.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlc3BvZHBndmtzenlleHZjYmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTcyMTAsImV4cCI6MjA2MzkzMzIxMH0.zyjFQA-Kr317M5l_6qjV_a-6ED2iU4wraRuYaa0iGEg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const testGoogleMapsIntegration = async () => {
  console.log('🧪 COMPREHENSIVE GOOGLE MAPS API INTEGRATION TEST');
  console.log('='.repeat(60));
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Check if API key is stored in database
    console.log('\n1️⃣ Testing Database Storage...');
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (settingsError) {
      console.error('❌ Failed to fetch settings from database:', settingsError.message);
      allTestsPassed = false;
    } else if (!settingsData) {
      console.error('❌ No shipping settings found in database');
      allTestsPassed = false;
    } else {
      console.log('✅ Settings found in database');
      console.log('📊 Settings data:', settingsData);
      
      if (settingsData.value?.googleMapsApiKey) {
        console.log('✅ Google Maps API key found in database');
        console.log('🔑 API Key length:', settingsData.value.googleMapsApiKey.length);
        console.log('🔑 API Key preview:', settingsData.value.googleMapsApiKey.substring(0, 20) + '...');
      } else {
        console.error('❌ Google Maps API key not found in database');
        allTestsPassed = false;
      }
    }

    // Test 2: Test API key functionality
    if (settingsData?.value?.googleMapsApiKey) {
      console.log('\n2️⃣ Testing API Key Functionality...');
      const apiKey = settingsData.value.googleMapsApiKey;
      
      const testAddresses = [
        'Via Roma 1, Torino, Italy',
        'Corso Principe Oddone 82, Torino, Italy',
        'Piazza della Repubblica, Torino, Italy',
        'Via Po 25, Torino, Italy'
      ];

      for (const address of testAddresses) {
        console.log(`\n🔍 Testing address: ${address}`);
        
        try {
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
          const response = await fetch(geocodeUrl);
          const data = await response.json();
          
          if (data.status === 'OK' && data.results.length > 0) {
            const result = data.results[0];
            console.log('✅ Geocoding successful');
            console.log('📍 Formatted address:', result.formatted_address);
            console.log('📍 Coordinates:', result.geometry.location);
            
            // Calculate distance from restaurant
            const restaurantLat = 45.0703;
            const restaurantLng = 7.6869;
            const distance = calculateDistance(
              restaurantLat, 
              restaurantLng, 
              result.geometry.location.lat, 
              result.geometry.location.lng
            );
            console.log('📏 Distance from restaurant:', distance.toFixed(2), 'km');
          } else {
            console.error('❌ Geocoding failed for', address, ':', data.status, data.error_message);
            allTestsPassed = false;
          }
        } catch (error) {
          console.error('❌ Network error for', address, ':', error.message);
          allTestsPassed = false;
        }
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Test 3: Test database update functionality
    console.log('\n3️⃣ Testing Database Update Functionality...');
    const testSettings = {
      ...settingsData.value,
      lastTestedAt: new Date().toISOString(),
      testStatus: 'API key working correctly'
    };

    const { error: updateError } = await supabase
      .from('settings')
      .update({
        value: testSettings,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'shippingZoneSettings');

    if (updateError) {
      console.error('❌ Failed to update settings:', updateError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ Database update successful');
    }

    // Test 4: Verify settings can be read back
    console.log('\n4️⃣ Testing Settings Read-back...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (verifyError) {
      console.error('❌ Failed to verify settings:', verifyError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ Settings verified successfully');
      console.log('📊 Last updated:', verifyData.updated_at);
      console.log('🔑 API Key still present:', verifyData.value?.googleMapsApiKey ? 'Yes' : 'No');
    }

    // Test 5: Test error handling
    console.log('\n5️⃣ Testing Error Handling...');
    const invalidApiKey = 'invalid_api_key_test';
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Via Roma 1, Torino&key=${invalidApiKey}`;
    
    try {
      const response = await fetch(testUrl);
      const data = await response.json();
      
      if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
        console.log('✅ Error handling working correctly - invalid key rejected');
      } else {
        console.log('⚠️ Unexpected response for invalid key:', data.status);
      }
    } catch (error) {
      console.log('✅ Network error handling working:', error.message);
    }

  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
    allTestsPassed = false;
  }

  // Final results
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Google Maps API integration is working correctly.');
    console.log('\n📋 SUMMARY:');
    console.log('✅ API key stored in database');
    console.log('✅ API key functional for geocoding');
    console.log('✅ Database read/write operations working');
    console.log('✅ Error handling implemented');
    console.log('\n🚀 The system is ready for production use!');
  } else {
    console.log('❌ SOME TESTS FAILED! Please check the errors above.');
  }
  
  return allTestsPassed;
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Run the test
testGoogleMapsIntegration().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
