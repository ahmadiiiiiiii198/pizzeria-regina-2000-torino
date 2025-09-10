import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const debugLoadingIssue = async () => {
  console.log('🔍 Debugging API Key Loading Issue After Refresh');
  console.log('=' .repeat(60));
  
  try {
    console.log('1️⃣ Checking current database state...');
    
    // Check what's actually in the database
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (settingsError) {
      console.error('❌ Error loading settings:', settingsError);
      return;
    }

    console.log('📊 Database contains:', {
      key: settingsData.key,
      hasValue: !!settingsData.value,
      hasApiKey: !!settingsData.value?.googleMapsApiKey,
      apiKeyValue: settingsData.value?.googleMapsApiKey || 'NOT FOUND',
      updated_at: settingsData.updated_at
    });

    console.log('\n2️⃣ Simulating ShippingZoneService.loadSettings()...');
    
    // This is exactly what the service does
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (!error && data && data.value) {
      const defaultSettings = {
        enabled: true,
        restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
        restaurantLat: 45.0703,
        restaurantLng: 7.6869,
        maxDeliveryDistance: 15,
        deliveryFee: 5.00,
        freeDeliveryThreshold: 50.00,
        googleMapsApiKey: ''
      };
      
      const mergedSettings = { ...defaultSettings, ...data.value };
      
      console.log('✅ Service would load:', {
        hasApiKey: !!mergedSettings.googleMapsApiKey,
        apiKeyValue: mergedSettings.googleMapsApiKey || 'EMPTY',
        enabled: mergedSettings.enabled,
        restaurantAddress: mergedSettings.restaurantAddress
      });
      
      console.log('📊 Full merged settings:', mergedSettings);
    } else {
      console.log('❌ Service would fail to load:', { error, data });
    }

    console.log('\n3️⃣ Simulating frontend component loading...');
    
    // Simulate what happens in the useEffect
    console.log('🔄 Calling reloadFromDatabase()...');
    
    // This would call loadSettings() again
    const { data: reloadData, error: reloadError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (!reloadError && reloadData && reloadData.value) {
      console.log('✅ Reload successful');
      console.log('🔑 API Key after reload:', reloadData.value.googleMapsApiKey ? 'Present' : 'Missing');
      console.log('📊 API Key value:', reloadData.value.googleMapsApiKey || 'EMPTY');
    } else {
      console.log('❌ Reload failed:', { reloadError, reloadData });
    }

    console.log('\n4️⃣ Testing getSettings() method simulation...');
    
    // This simulates what getSettings() would return
    if (reloadData && reloadData.value) {
      const defaultSettings = {
        enabled: true,
        restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
        restaurantLat: 45.0703,
        restaurantLng: 7.6869,
        maxDeliveryDistance: 15,
        deliveryFee: 5.00,
        freeDeliveryThreshold: 50.00,
        googleMapsApiKey: ''
      };
      
      const finalSettings = { ...defaultSettings, ...reloadData.value };
      
      console.log('📊 getSettings() would return:', {
        googleMapsApiKey: finalSettings.googleMapsApiKey,
        enabled: finalSettings.enabled,
        restaurantAddress: finalSettings.restaurantAddress
      });
      
      console.log('🎯 DIAGNOSIS:');
      if (finalSettings.googleMapsApiKey) {
        console.log('✅ API Key should be visible in frontend');
        console.log('🔑 Value:', finalSettings.googleMapsApiKey);
      } else {
        console.log('❌ API Key would be empty in frontend');
        console.log('🔍 Raw database value:', reloadData.value.googleMapsApiKey);
        console.log('🔍 Default override:', defaultSettings.googleMapsApiKey);
      }
    }

    console.log('\n5️⃣ Checking for potential issues...');
    
    // Check if there are multiple records
    const { data: allSettings, error: allError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings');

    if (!allError) {
      console.log('📊 Total records with key "shippingZoneSettings":', allSettings.length);
      if (allSettings.length > 1) {
        console.log('⚠️ WARNING: Multiple records found!');
        allSettings.forEach((record, index) => {
          console.log(`   Record ${index + 1}:`, {
            id: record.id,
            hasApiKey: !!record.value?.googleMapsApiKey,
            apiKey: record.value?.googleMapsApiKey || 'EMPTY',
            updated_at: record.updated_at
          });
        });
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

// Run the debug
debugLoadingIssue();
