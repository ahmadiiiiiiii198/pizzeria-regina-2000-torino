// Debug script to test frontend loading mechanism
import { createClient } from '@supabase/supabase-js';

// Correct Supabase configuration for Pizzeria Regina 2000 (same as frontend)
const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simulate the exact same loading process as the frontend
const simulateFrontendLoading = async () => {
  console.log('🔍 DEBUGGING FRONTEND LOADING MECHANISM');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Simulate ShippingZoneService loadSettings() method
    console.log('\n1️⃣ Simulating ShippingZoneService.loadSettings()...');
    
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'shippingZoneSettings')
      .single();

    console.log('📊 Database query result:');
    console.log('  - Error:', error);
    console.log('  - Data:', data);
    
    if (!error && data && data.value) {
      console.log('✅ Settings loaded from database');
      console.log('🔑 API Key in data:', data.value.googleMapsApiKey ? 'Present' : 'Missing');
      
      if (data.value.googleMapsApiKey) {
        console.log('🔑 API Key value:', data.value.googleMapsApiKey);
        console.log('📏 API Key length:', data.value.googleMapsApiKey.length);
      }
      
      // Step 2: Simulate the settings merge process
      console.log('\n2️⃣ Simulating settings merge...');
      const defaultSettings = {
        enabled: true,
        restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
        restaurantLat: 45.0703,
        restaurantLng: 7.6869,
        maxDeliveryDistance: 15,
        deliveryFee: 5.00,
        freeDeliveryThreshold: 50.00,
        googleMapsApiKey: '' // Default empty
      };
      
      const mergedSettings = { ...defaultSettings, ...data.value };
      console.log('📊 Merged settings:', mergedSettings);
      console.log('🔑 API Key after merge:', mergedSettings.googleMapsApiKey ? 'Present' : 'Missing');
      
      // Step 3: Simulate frontend component loading
      console.log('\n3️⃣ Simulating frontend component loading...');
      
      // This simulates what happens in ShippingZoneManager useEffect
      console.log('🔄 Calling reloadFromDatabase()...');
      
      // Reload from database (same query again)
      const { data: reloadData, error: reloadError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'shippingZoneSettings')
        .single();
      
      if (!reloadError && reloadData && reloadData.value) {
        const reloadedSettings = { ...defaultSettings, ...reloadData.value };
        console.log('✅ Settings reloaded successfully');
        console.log('📊 Reloaded settings:', reloadedSettings);
        console.log('🔑 API Key after reload:', reloadedSettings.googleMapsApiKey ? 'Present' : 'Missing');
        
        // Step 4: Test what the frontend component would receive
        console.log('\n4️⃣ Testing frontend component state...');
        
        // This is what setSettings() would receive
        const frontendState = reloadedSettings;
        console.log('📱 Frontend component would receive:', frontendState);
        console.log('🔑 API Key in frontend state:', frontendState.googleMapsApiKey ? 'Present' : 'Missing');
        
        if (frontendState.googleMapsApiKey) {
          console.log('✅ API Key would be displayed in frontend');
          console.log('🔑 Value for input field:', frontendState.googleMapsApiKey);
        } else {
          console.log('❌ API Key would NOT be displayed in frontend');
          console.log('🔍 Checking what went wrong...');
          
          // Debug the issue
          console.log('🔍 Debug info:');
          console.log('  - Original data.value:', data.value);
          console.log('  - Reloaded data.value:', reloadData.value);
          console.log('  - Default settings:', defaultSettings);
          console.log('  - Merge result:', mergedSettings);
        }
        
      } else {
        console.log('❌ Failed to reload settings');
        console.log('Error:', reloadError);
      }
      
    } else {
      console.log('❌ No settings found in database or error occurred');
      console.log('Error details:', error);
    }
    
    // Step 5: Test direct API key extraction
    console.log('\n5️⃣ Testing direct API key extraction...');
    
    const { data: directData, error: directError } = await supabase
      .from('settings')
      .select('value->googleMapsApiKey as api_key, value')
      .eq('key', 'shippingZoneSettings')
      .single();
    
    if (!directError && directData) {
      console.log('📊 Direct extraction result:', directData);
      console.log('🔑 Direct API key:', directData.api_key);
    } else {
      console.log('❌ Direct extraction failed:', directError);
    }
    
  } catch (error) {
    console.error('💥 Debug script failed:', error);
  }
};

// Run the debug
simulateFrontendLoading().then(() => {
  console.log('\n🎯 Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});
