// Save Google API Key to the CORRECT database (sixnfemtvmighstbgrbd)
import { createClient } from '@supabase/supabase-js';

// Use the CORRECT database that the frontend uses
const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const saveApiKeyToCorrectDatabase = async () => {
  console.log('🔑 Saving Google API Key to CORRECT Database');
  console.log('=' .repeat(60));
  console.log('📍 Database:', SUPABASE_URL);
  console.log('');

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

  const deliveryZones = [
    {
      id: '1',
      name: 'Zone 1 (0-5km)',
      maxDistance: 5,
      deliveryFee: 3.00,
      estimatedTime: '20-30 minutes',
      isActive: true
    },
    {
      id: '2',
      name: 'Zone 2 (5-10km)',
      maxDistance: 10,
      deliveryFee: 5.00,
      estimatedTime: '30-45 minutes',
      isActive: true
    },
    {
      id: '3',
      name: 'Zone 3 (10-15km)',
      maxDistance: 15,
      deliveryFee: 7.00,
      estimatedTime: '45-60 minutes',
      isActive: true
    }
  ];

  try {
    console.log('1️⃣ Checking current database state...');
    
    // Check current settings
    const { data: currentSettings, error: currentError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (currentError && currentError.code !== 'PGRST116') {
      console.error('❌ Error checking current settings:', currentError.message);
      return;
    }

    if (currentSettings) {
      console.log('📋 Found existing settings:');
      console.log('   - Updated:', currentSettings.updated_at);
      console.log('   - Has API Key:', currentSettings.value?.googleMapsApiKey ? 'Yes' : 'No');
      console.log('   - API Key Value:', currentSettings.value?.googleMapsApiKey || 'None');
    } else {
      console.log('📋 No existing settings found');
    }

    console.log('\n2️⃣ Saving shipping zone settings...');
    
    // Save or update shipping settings
    const { data: settingsResult, error: settingsError } = await supabase
      .from('settings')
      .upsert({
        key: 'shippingZoneSettings',
        value: shippingSettings,
        updated_at: new Date().toISOString()
      })
      .select();

    if (settingsError) {
      console.error('❌ Error saving settings:', settingsError.message);
      return;
    }

    console.log('✅ Shipping settings saved successfully');
    console.log('🔑 API Key saved:', shippingSettings.googleMapsApiKey);

    console.log('\n3️⃣ Saving delivery zones...');
    
    // Save delivery zones
    const { data: zonesResult, error: zonesError } = await supabase
      .from('settings')
      .upsert({
        key: 'deliveryZones',
        value: deliveryZones,
        updated_at: new Date().toISOString()
      })
      .select();

    if (zonesError) {
      console.error('❌ Error saving zones:', zonesError.message);
      return;
    }

    console.log('✅ Delivery zones saved successfully');
    console.log('📊 Zones saved:', deliveryZones.length);

    console.log('\n4️⃣ Verifying save...');
    
    // Verify the save
    const { data: verifySettings, error: verifyError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying save:', verifyError.message);
      return;
    }

    console.log('✅ Verification successful:');
    console.log('   - Key:', verifySettings.key);
    console.log('   - Updated:', verifySettings.updated_at);
    console.log('   - API Key Present:', !!verifySettings.value?.googleMapsApiKey);
    console.log('   - API Key Value:', verifySettings.value?.googleMapsApiKey);
    console.log('   - Restaurant Address:', verifySettings.value?.restaurantAddress);

    console.log('\n🎉 SUCCESS!');
    console.log('=' .repeat(40));
    console.log('✅ Google API key saved to CORRECT database');
    console.log('✅ Frontend should now load the API key properly');
    console.log('✅ Admin panel should display the API key after refresh');
    console.log('');
    console.log('🔄 Please refresh the admin panel to see the changes');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
};

// Run the script
saveApiKeyToCorrectDatabase();
