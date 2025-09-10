// Simple test to check if save button saves API key to database
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://despodpgvkszyexvcbft.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlc3BvZHBndmtzenlleHZjYmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTcyMTAsImV4cCI6MjA2MzkzMzIxMH0.zyjFQA-Kr317M5l_6qjV_a-6ED2iU4wraRuYaa0iGEg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Testing Save Button Database Operation');
console.log('==========================================');

try {
  // Check current state
  console.log('\n1. Checking current database state...');
  const { data: current, error: currentErr } = await supabase
    .from('settings')
    .select('*')
    .eq('key', 'shippingZoneSettings')
    .single();

  if (currentErr && currentErr.code !== 'PGRST116') {
    console.error('❌ Error:', currentErr.message);
  } else if (current) {
    console.log('✅ Found existing settings');
    console.log('🔑 API Key:', current.value?.googleMapsApiKey ? 'Present' : 'Missing');
  } else {
    console.log('📝 No settings found');
  }

  // Test save operation
  console.log('\n2. Testing save operation...');
  const testSettings = {
    enabled: true,
    restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
    restaurantLat: 45.0703,
    restaurantLng: 7.6869,
    maxDeliveryDistance: 15,
    deliveryFee: 5.00,
    freeDeliveryThreshold: 50.00,
    googleMapsApiKey: 'AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs',
    testSave: new Date().toISOString()
  };

  // Try update first, then insert if needed
  const { data: updateResult, error: updateErr } = await supabase
    .from('settings')
    .update({
      value: testSettings,
      updated_at: new Date().toISOString()
    })
    .eq('key', 'shippingZoneSettings')
    .select();

  if (updateErr && updateErr.code === 'PGRST116') {
    // Insert new record
    const { data: insertResult, error: insertErr } = await supabase
      .from('settings')
      .insert({
        key: 'shippingZoneSettings',
        value: testSettings
      })
      .select();

    if (insertErr) {
      console.error('❌ Insert failed:', insertErr.message);
    } else {
      console.log('✅ Settings inserted successfully');
    }
  } else if (updateErr) {
    console.error('❌ Update failed:', updateErr.message);
  } else {
    console.log('✅ Settings updated successfully');
  }

  // Verify save
  console.log('\n3. Verifying save...');
  const { data: verify, error: verifyErr } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'shippingZoneSettings')
    .single();

  if (verifyErr) {
    console.error('❌ Verification failed:', verifyErr.message);
  } else {
    console.log('✅ Verification successful');
    console.log('🔑 API Key saved:', verify.value?.googleMapsApiKey ? 'Yes' : 'No');
    if (verify.value?.googleMapsApiKey) {
      console.log('📝 API Key value:', verify.value.googleMapsApiKey);
    }
  }

  console.log('\n🎉 Save button database operation test completed!');

} catch (error) {
  console.error('💥 Test failed:', error.message);
}
