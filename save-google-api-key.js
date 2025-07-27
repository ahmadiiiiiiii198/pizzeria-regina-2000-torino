// Script to save Google Maps API key to Supabase database
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://despodpgvkszyexvcbft.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlc3BvZHBndmtzenlleHZjYmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTcyMTAsImV4cCI6MjA2MzkzMzIxMH0.zyjFQA-Kr317M5l_6qjV_a-6ED2iU4wraRuYaa0iGEg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const saveGoogleMapsApiKey = async () => {
  console.log('🔑 Saving Google Maps API Key to database...');
  
  const apiKey = 'AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs';
  
  const shippingSettings = {
    enabled: true,
    restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
    restaurantLat: 45.0703,
    restaurantLng: 7.6869,
    maxDeliveryDistance: 15,
    deliveryFee: 5.00,
    freeDeliveryThreshold: 50.00,
    googleMapsApiKey: apiKey
  };

  try {
    // First, try to update existing record
    const { data: updateData, error: updateError } = await supabase
      .from('settings')
      .update({
        value: shippingSettings,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'shippingZoneSettings')
      .select();

    if (updateError && updateError.code === 'PGRST116') {
      // Record doesn't exist, insert new one
      console.log('📝 Record not found, inserting new settings...');
      const { data: insertData, error: insertError } = await supabase
        .from('settings')
        .insert({
          key: 'shippingZoneSettings',
          value: shippingSettings,
          updated_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Settings inserted successfully:', insertData);
    } else if (updateError) {
      throw updateError;
    } else {
      console.log('✅ Settings updated successfully:', updateData);
    }

    // Verify the save by reading back
    console.log('\n🔍 Verifying saved data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (verifyError) {
      throw verifyError;
    }

    console.log('📊 Verified data:', verifyData);
    console.log('🔑 API Key saved:', verifyData.value.googleMapsApiKey ? 'Present' : 'Missing');
    console.log('📏 API Key length:', verifyData.value.googleMapsApiKey?.length || 0);
    
    if (verifyData.value.googleMapsApiKey) {
      console.log('🔑 API Key preview:', verifyData.value.googleMapsApiKey.substring(0, 20) + '...');
    }

    // Test the API key
    console.log('\n🧪 Testing Google Maps API...');
    const testAddress = 'Via Roma 1, Torino, Italy';
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${apiKey}`;
    
    const response = await fetch(testUrl);
    const testData = await response.json();
    
    if (testData.status === 'OK' && testData.results.length > 0) {
      console.log('✅ Google Maps API test successful!');
      console.log('📍 Test address:', testAddress);
      console.log('📍 Formatted:', testData.results[0].formatted_address);
      console.log('📍 Coordinates:', testData.results[0].geometry.location);
    } else {
      console.log('❌ Google Maps API test failed:', testData.status, testData.error_message);
    }

  } catch (error) {
    console.error('❌ Error saving API key:', error);
    process.exit(1);
  }
};

// Run the script
saveGoogleMapsApiKey().then(() => {
  console.log('\n🎉 Google Maps API key setup completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
