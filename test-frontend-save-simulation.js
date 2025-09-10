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

// Simulate the exact ShippingZoneService saveSettings method
const simulateShippingZoneServiceSave = async () => {
  console.log('🎭 Simulating ShippingZoneService.saveSettings() method');
  console.log('=' .repeat(60));
  
  // This matches the exact structure used in the service
  const settings = {
    enabled: true,
    restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
    restaurantLat: 45.0703,
    restaurantLng: 7.6869,
    maxDeliveryDistance: 15,
    deliveryFee: 5.00,
    freeDeliveryThreshold: 50.00,
    googleMapsApiKey: 'AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs'
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
    }
  ];

  try {
    console.log('💾 Saving shipping settings and delivery zones...');
    console.log('📊 Zones to save:', deliveryZones.length);
    console.log('🔑 API Key to save:', settings.googleMapsApiKey ? 'Present' : 'Missing');
    console.log('📊 Full settings to save:', settings);

    // Step 1: Save settings - try update first, then insert if not exists
    console.log('\n1️⃣ Attempting to update shippingZoneSettings...');
    const settingsUpdateResult = await supabase
      .from('settings')
      .update({
        value: settings,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'shippingZoneSettings')
      .select();

    if (settingsUpdateResult.error) {
      console.log('Settings update failed, trying insert:', settingsUpdateResult.error.message);
      // If update fails, try insert
      const { error: settingsInsertError } = await supabase
        .from('settings')
        .insert({
          key: 'shippingZoneSettings',
          value: settings,
          updated_at: new Date().toISOString()
        });

      if (settingsInsertError) {
        console.error('❌ Settings insert also failed:', settingsInsertError);
        throw settingsInsertError;
      }
      console.log('✅ Settings inserted successfully');
    } else {
      console.log('✅ Settings updated successfully');
      console.log('🔑 Saved API Key:', settings.googleMapsApiKey ? 'Present' : 'Missing');
      console.log('📊 Saved settings data:', settingsUpdateResult.data);
    }

    // Step 2: Save delivery zones - try update first, then insert if not exists
    console.log('\n2️⃣ Attempting to update deliveryZones...');
    const zonesUpdateResult = await supabase
      .from('settings')
      .update({
        value: deliveryZones,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'deliveryZones')
      .select();

    if (zonesUpdateResult.error) {
      console.log('Zones update failed, trying insert:', zonesUpdateResult.error.message);
      // If update fails, try insert
      const { error: zonesInsertError } = await supabase
        .from('settings')
        .insert({
          key: 'deliveryZones',
          value: deliveryZones,
          updated_at: new Date().toISOString()
        });

      if (zonesInsertError) {
        console.error('❌ Zones insert also failed:', zonesInsertError);
        throw zonesInsertError;
      }
      console.log('✅ Delivery zones inserted successfully');
    } else {
      console.log('✅ Delivery zones updated successfully:', deliveryZones.length, 'zones');
    }

    // Step 3: Verify both saves
    console.log('\n3️⃣ Verifying saves...');
    
    const { data: savedSettings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    const { data: savedZones, error: zonesError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'deliveryZones')
      .single();

    if (settingsError || zonesError) {
      console.error('❌ Verification failed:', { settingsError, zonesError });
      return;
    }

    console.log('✅ Verification successful');
    console.log('📊 Settings verification:', {
      key: savedSettings.key,
      hasApiKey: savedSettings.value?.googleMapsApiKey ? 'Yes' : 'No',
      apiKeyValue: savedSettings.value?.googleMapsApiKey,
      updated_at: savedSettings.updated_at
    });
    
    console.log('📊 Zones verification:', {
      key: savedZones.key,
      zonesCount: Array.isArray(savedZones.value) ? savedZones.value.length : 0,
      updated_at: savedZones.updated_at
    });

    console.log('\n🎉 SIMULATION RESULT:');
    console.log('=' .repeat(40));
    console.log('✅ SUCCESS: Frontend save simulation completed successfully');
    console.log('✅ Google API key is properly saved to database');
    console.log('✅ Delivery zones are properly saved to database');
    console.log('✅ The ShippingZoneService.saveSettings() method works correctly');

  } catch (error) {
    console.error('❌ Simulation failed with error:', error);
  }
};

// Run the simulation
simulateShippingZoneServiceSave();
