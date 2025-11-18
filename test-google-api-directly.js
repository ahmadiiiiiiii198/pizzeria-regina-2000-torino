// Test Google API key directly with Google's servers
const API_KEY = 'AIzaSyDnJS3eyAnguEeCdZIMmYUNzq8LOBhmkMA';

async function testGoogleApi() {
  console.log('\n🧪 ============================================');
  console.log('🧪 TESTING GOOGLE API KEY DIRECTLY');
  console.log('🧪 ============================================\n');

  console.log('API Key:', API_KEY);
  console.log('');

  // Test 1: Geocoding API
  console.log('📍 Test 1: Geocoding API...');
  const testAddress = 'Corso Regina Margherita, 53, Torino, Italy';
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${API_KEY}`;

  try {
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    console.log('Status:', data.status);

    if (data.status === 'OK') {
      console.log('✅ Geocoding API is WORKING!');
      console.log('   Location:', data.results[0].formatted_address);
    } else if (data.status === 'REQUEST_DENIED') {
      console.log('❌ Geocoding API: REQUEST_DENIED');
      console.log('   Error:', data.error_message);
      console.log('');
      console.log('🔧 Solutions:');
      console.log('   1. Enable "Geocoding API" at:');
      console.log('      https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com');
      console.log('   2. Check API key restrictions at:');
      console.log('      https://console.cloud.google.com/apis/credentials');
      console.log('   3. Verify billing is enabled and linked to this project');
    } else {
      console.log('⚠️  Unexpected status:', data.status);
      console.log('   Message:', data.error_message || 'No error message');
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  console.log('');

  // Test 2: Check which project this key belongs to
  console.log('📊 Test 2: API Key Project Info...');
  console.log('To verify which project this key belongs to:');
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('2. Find key: ' + API_KEY);
  console.log('3. Check the project name at the top');
  console.log('');

  console.log('🎯 Next Steps:');
  console.log('═════════════════════════════════════════');
  console.log('If you see REQUEST_DENIED above:');
  console.log('');
  console.log('✓ Go to: https://console.cloud.google.com/apis/library');
  console.log('✓ Search for "Geocoding API"');
  console.log('✓ Click it and press "ENABLE"');
  console.log('✓ Also enable "Maps JavaScript API" and "Maps Embed API"');
  console.log('✓ Wait 1-2 minutes');
  console.log('✓ Refresh your website');
  console.log('');

  console.log('\n🧪 Test complete!\n');
}

testGoogleApi().catch(console.error);
