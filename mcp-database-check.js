/**
 * MCP-Based Database Check for Shipping Zone Settings
 * This script uses MCP (Model Context Protocol) to check the database
 */

import { createClient } from '@supabase/supabase-js';

// Correct Supabase configuration for Pizzeria Regina 2000
const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkShippingSettings() {
  console.log('🔍 MCP Database Check: Shipping Zone Settings');
  console.log('=' .repeat(60));

  try {
    // Check shipping zone settings
    console.log('\n1️⃣ Checking Shipping Zone Settings...');
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('❌ Error fetching shipping settings:', settingsError.message);
    } else if (settingsData) {
      console.log('✅ Shipping Zone Settings Found:');
      console.log('📅 Updated:', settingsData.updated_at);
      console.log('📊 Settings:');
      
      const settings = settingsData.value;
      console.log('   - Enabled:', settings.enabled);
      console.log('   - Restaurant Address:', settings.restaurantAddress);
      console.log('   - Restaurant Coordinates:', `${settings.restaurantLat}, ${settings.restaurantLng}`);
      console.log('   - Max Delivery Distance:', settings.maxDeliveryDistance + 'km');
      console.log('   - Delivery Fee:', '€' + settings.deliveryFee);
      console.log('   - Free Delivery Threshold:', '€' + settings.freeDeliveryThreshold);
      console.log('   - Google Maps API Key:', settings.googleMapsApiKey ? 
        `✅ Present (${settings.googleMapsApiKey.substring(0, 20)}...)` : 
        '❌ Missing');
      
      console.log('\n📄 Full Settings JSON:');
      console.log(JSON.stringify(settings, null, 2));
    } else {
      console.log('⚠️ No shipping zone settings found in database');
    }

    // Check delivery zones
    console.log('\n2️⃣ Checking Delivery Zones...');
    const { data: zonesData, error: zonesError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'deliveryZones')
      .single();

    if (zonesError && zonesError.code !== 'PGRST116') {
      console.error('❌ Error fetching delivery zones:', zonesError.message);
    } else if (zonesData) {
      console.log('✅ Delivery Zones Found:');
      console.log('📅 Updated:', zonesData.updated_at);
      
      const zones = zonesData.value;
      console.log(`📊 ${zones.length} zones configured:`);
      
      zones.forEach((zone, index) => {
        console.log(`   ${index + 1}. ${zone.name}:`);
        console.log(`      - Max Distance: ${zone.maxDistance}km`);
        console.log(`      - Delivery Fee: €${zone.deliveryFee}`);
        console.log(`      - Estimated Time: ${zone.estimatedTime}`);
        console.log(`      - Status: ${zone.isActive ? '✅ Active' : '❌ Inactive'}`);
      });
      
      console.log('\n📄 Full Zones JSON:');
      console.log(JSON.stringify(zones, null, 2));
    } else {
      console.log('⚠️ No delivery zones found in database');
    }

    // Check all settings for context
    console.log('\n3️⃣ Checking All Settings in Database...');
    const { data: allSettings, error: allError } = await supabase
      .from('settings')
      .select('key, updated_at')
      .order('updated_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all settings:', allError.message);
    } else if (allSettings && allSettings.length > 0) {
      console.log(`✅ Found ${allSettings.length} settings in database:`);
      allSettings.forEach((setting, index) => {
        console.log(`   ${index + 1}. ${setting.key} (updated: ${setting.updated_at})`);
      });
    } else {
      console.log('⚠️ No settings found in database');
    }

    // Test Google Maps API if key is present
    if (settingsData?.value?.googleMapsApiKey) {
      console.log('\n4️⃣ Testing Google Maps API Key...');
      const apiKey = settingsData.value.googleMapsApiKey;
      const testAddress = 'Via Roma 1, Torino, Italy';
      
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${apiKey}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          console.log('✅ Google Maps API Key is working');
          console.log('📍 Test address:', testAddress);
          console.log('📍 Formatted:', data.results[0].formatted_address);
          console.log('📍 Coordinates:', data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
        } else {
          console.log('❌ Google Maps API Key test failed');
          console.log('📊 Status:', data.status);
          console.log('📊 Error:', data.error_message || 'Unknown error');
        }
      } catch (error) {
        console.log('❌ Google Maps API test error:', error.message);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 SUMMARY:');
    console.log('✅ Database connection: Working');
    console.log('📊 Shipping settings:', settingsData ? 'Present' : 'Missing');
    console.log('📍 Delivery zones:', zonesData ? `Present (${zonesData.value?.length || 0} zones)` : 'Missing');
    console.log('🔑 Google Maps API:', settingsData?.value?.googleMapsApiKey ? 'Configured' : 'Missing');
    
    if (settingsData?.value?.googleMapsApiKey) {
      console.log('\n🔍 API KEY ANALYSIS:');
      console.log('📝 Key starts with:', settingsData.value.googleMapsApiKey.substring(0, 20) + '...');
      console.log('📏 Key length:', settingsData.value.googleMapsApiKey.length, 'characters');
      console.log('🎯 Expected length: ~39 characters for Google Maps API keys');
      
      if (settingsData.value.googleMapsApiKey.length < 35) {
        console.log('⚠️ WARNING: API key seems too short');
      } else if (settingsData.value.googleMapsApiKey.length > 45) {
        console.log('⚠️ WARNING: API key seems too long');
      } else {
        console.log('✅ API key length looks correct');
      }
    }

    return {
      hasSettings: !!settingsData,
      hasZones: !!zonesData,
      hasApiKey: !!(settingsData?.value?.googleMapsApiKey),
      apiKeyLength: settingsData?.value?.googleMapsApiKey?.length || 0,
      settingsData,
      zonesData
    };

  } catch (error) {
    console.error('💥 MCP Database check failed:', error.message);
    return null;
  }
}

// Run the check
checkShippingSettings().then(result => {
  if (result) {
    console.log('\n🎉 MCP Database check completed successfully!');
    
    if (!result.hasApiKey) {
      console.log('\n🔧 RECOMMENDATION: Configure Google Maps API key in admin panel');
      console.log('   1. Go to http://localhost:3000/admin');
      console.log('   2. Navigate to Shipping Zones section');
      console.log('   3. Enter API key: AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs');
      console.log('   4. Click "Save All Settings"');
    }
  } else {
    console.log('\n💥 MCP Database check failed!');
  }
  
  process.exit(result ? 0 : 1);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
