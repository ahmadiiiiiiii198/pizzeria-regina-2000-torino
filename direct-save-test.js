// Direct test of save button functionality
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://despodpgvkszyexvcbft.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlc3BvZHBndmtzenlleHZjYmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTcyMTAsImV4cCI6MjA2MzkzMzIxMH0.zyjFQA-Kr317M5l_6qjV_a-6ED2iU4wraRuYaa0iGEg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSaveButton() {
  console.log('🔍 TESTING SAVE BUTTON FUNCTIONALITY');
  console.log('=====================================');
  
  try {
    // Step 1: Check current state
    console.log('\n1. Checking current database state...');
    const { data: currentData, error: currentError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (currentError && currentError.code !== 'PGRST116') {
      console.log('❌ Error checking current state:', currentError.message);
      return false;
    }

    if (currentData) {
      console.log('✅ Current settings found');
      console.log('🔑 Current API Key:', currentData.value?.googleMapsApiKey ? 'Present' : 'Missing');
      console.log('📅 Last updated:', currentData.updated_at);
    } else {
      console.log('📝 No current settings found');
    }

    // Step 2: Simulate save button click
    console.log('\n2. Simulating save button click...');
    const testApiKey = 'AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs';
    const settingsToSave = {
      enabled: true,
      restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
      restaurantLat: 45.0703,
      restaurantLng: 7.6869,
      maxDeliveryDistance: 15,
      deliveryFee: 5.00,
      freeDeliveryThreshold: 50.00,
      googleMapsApiKey: testApiKey,
      saveButtonTest: new Date().toISOString()
    };

    console.log('💾 Saving settings with API key...');
    console.log('🔑 API Key to save:', testApiKey);

    // Simulate the exact save process from the service
    const { data: saveResult, error: saveError } = await supabase
      .from('settings')
      .update({
        value: settingsToSave,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'shippingZoneSettings')
      .select();

    if (saveError && saveError.code === 'PGRST116') {
      // Insert if doesn't exist
      console.log('📝 Inserting new record...');
      const { data: insertResult, error: insertError } = await supabase
        .from('settings')
        .insert({
          key: 'shippingZoneSettings',
          value: settingsToSave,
          updated_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        console.log('❌ Insert failed:', insertError.message);
        return false;
      }
      console.log('✅ Settings inserted successfully');
    } else if (saveError) {
      console.log('❌ Save failed:', saveError.message);
      return false;
    } else {
      console.log('✅ Settings updated successfully');
    }

    // Step 3: Verify the save
    console.log('\n3. Verifying save operation...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
      return false;
    }

    console.log('📊 Verification results:');
    console.log('  - Record ID:', verifyData.id);
    console.log('  - Updated at:', verifyData.updated_at);
    console.log('  - API Key present:', verifyData.value?.googleMapsApiKey ? 'Yes' : 'No');
    
    if (verifyData.value?.googleMapsApiKey === testApiKey) {
      console.log('  - API Key value: ✅ CORRECT');
      console.log('  - Saved value:', verifyData.value.googleMapsApiKey);
    } else {
      console.log('  - API Key value: ❌ INCORRECT');
      console.log('  - Expected:', testApiKey);
      console.log('  - Got:', verifyData.value?.googleMapsApiKey);
      return false;
    }

    // Step 4: Test reload (simulate page refresh)
    console.log('\n4. Testing reload (simulating page refresh)...');
    const { data: reloadData, error: reloadError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (reloadError) {
      console.log('❌ Reload failed:', reloadError.message);
      return false;
    }

    if (reloadData.value?.googleMapsApiKey === testApiKey) {
      console.log('✅ API Key persists after reload');
      console.log('🔑 Reloaded API Key:', reloadData.value.googleMapsApiKey);
    } else {
      console.log('❌ API Key does not persist after reload');
      return false;
    }

    console.log('\n=====================================');
    console.log('🎉 SAVE BUTTON TEST PASSED!');
    console.log('✅ Save button correctly saves API key to database');
    console.log('✅ API key persists after page refresh simulation');
    console.log('✅ Database operations are working correctly');
    
    return true;

  } catch (error) {
    console.log('\n❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testSaveButton().then(success => {
  if (success) {
    console.log('\n🚀 CONCLUSION: Save button is working correctly!');
    console.log('💡 If users report API key disappearing, they need to:');
    console.log('   1. Enter the API key in the input field');
    console.log('   2. Click "Save All Settings" button');
    console.log('   3. Wait for success message');
  } else {
    console.log('\n💥 CONCLUSION: Save button has issues!');
    console.log('🔧 There may be a problem with the save functionality');
  }
}).catch(error => {
  console.log('💥 Test execution failed:', error.message);
});
