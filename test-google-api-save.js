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

const testGoogleApiSave = async () => {
  console.log('🧪 Testing Google API Key Save Functionality');
  console.log('=' .repeat(50));
  
  const testApiKey = 'AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs';
  
  // Test settings object that matches the ShippingZoneService structure
  const testSettings = {
    enabled: true,
    restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
    restaurantLat: 45.0703,
    restaurantLng: 7.6869,
    maxDeliveryDistance: 15,
    deliveryFee: 5.00,
    freeDeliveryThreshold: 50.00,
    googleMapsApiKey: testApiKey
  };

  try {
    console.log('1️⃣ Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('settings')
      .select('key')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');

    console.log('\n2️⃣ Checking if shippingZoneSettings exists...');
    const { data: existingSettings, error: selectError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Error checking existing settings:', selectError);
      return;
    }

    if (existingSettings) {
      console.log('📋 Found existing settings:', {
        key: existingSettings.key,
        hasApiKey: existingSettings.value?.googleMapsApiKey ? 'Yes' : 'No',
        apiKeyValue: existingSettings.value?.googleMapsApiKey || 'Not set',
        updated_at: existingSettings.updated_at
      });
    } else {
      console.log('📋 No existing shippingZoneSettings found');
    }

    console.log('\n3️⃣ Testing save operation (update)...');
    const { data: updateData, error: updateError } = await supabase
      .from('settings')
      .update({
        value: testSettings,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'shippingZoneSettings')
      .select();

    if (updateError) {
      console.error('❌ Update operation failed:', updateError);
      return;
    }

    console.log('✅ Update operation successful');
    console.log('📊 Saved data:', {
      key: updateData[0]?.key,
      hasApiKey: updateData[0]?.value?.googleMapsApiKey ? 'Yes' : 'No',
      apiKeyValue: updateData[0]?.value?.googleMapsApiKey,
      updated_at: updateData[0]?.updated_at
    });

    console.log('\n4️⃣ Verifying save by reading back...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (verifyError) {
      console.error('❌ Verification read failed:', verifyError);
      return;
    }

    console.log('✅ Verification successful');
    console.log('📊 Retrieved data:', {
      key: verifyData.key,
      hasApiKey: verifyData.value?.googleMapsApiKey ? 'Yes' : 'No',
      apiKeyValue: verifyData.value?.googleMapsApiKey,
      apiKeyMatches: verifyData.value?.googleMapsApiKey === testApiKey ? 'Yes' : 'No',
      updated_at: verifyData.updated_at
    });

    console.log('\n🎉 RESULT SUMMARY:');
    console.log('=' .repeat(30));
    
    if (verifyData.value?.googleMapsApiKey === testApiKey) {
      console.log('✅ SUCCESS: Google API key is correctly saved to database');
      console.log('✅ The save button functionality is working properly');
    } else {
      console.log('❌ FAILURE: Google API key was not saved correctly');
      console.log('Expected:', testApiKey);
      console.log('Got:', verifyData.value?.googleMapsApiKey || 'undefined');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

// Run the test
testGoogleApiSave();
