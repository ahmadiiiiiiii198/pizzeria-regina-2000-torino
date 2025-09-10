// Browser Console Test - Copy and paste this into the browser console
// when you're on the admin panel page

console.log('🧪 Browser Console Test - Google API Key Loading');
console.log('=' .repeat(60));

// Test if we can access the ShippingZoneService
if (window.shippingZoneService) {
  console.log('✅ ShippingZoneService found in window');
  
  // Test getting settings
  window.shippingZoneService.getSettings().then(settings => {
    console.log('📊 Current settings:', settings);
    console.log('🔑 API Key:', settings.googleMapsApiKey ? 'Present' : 'Missing');
    console.log('📍 Restaurant Address:', settings.restaurantAddress);
  }).catch(error => {
    console.error('❌ Error getting settings:', error);
  });
  
} else {
  console.log('⚠️ ShippingZoneService not found in window');
  console.log('💡 This is normal - the service is not exposed globally');
  console.log('🔍 Check the Network tab for database requests');
  console.log('🔍 Check the Console for service initialization logs');
}

// Alternative: Test direct Supabase access if available
if (window.supabase) {
  console.log('✅ Supabase client found in window');
  
  window.supabase
    .from('settings')
    .select('*')
    .eq('key', 'shippingZoneSettings')
    .single()
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Database error:', error.message);
      } else {
        console.log('✅ Database query successful');
        console.log('🔑 API Key in database:', data.value?.googleMapsApiKey ? 'Present' : 'Missing');
        console.log('📊 Full data:', data);
      }
    });
    
} else {
  console.log('⚠️ Supabase client not found in window');
}

console.log('');
console.log('🔍 DEBUGGING STEPS:');
console.log('1. Open Network tab and refresh the page');
console.log('2. Look for requests to /settings or Supabase');
console.log('3. Check if the API key is being loaded from database');
console.log('4. Look for console logs from ShippingZoneService');
console.log('5. Check if the input field is populated after page load');

// Instructions for manual testing
console.log('');
console.log('📋 MANUAL TEST CHECKLIST:');
console.log('□ Navigate to admin panel (/admin)');
console.log('□ Go to Shipping Zone Settings section');
console.log('□ Check if Google Maps API Key field shows: AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs');
console.log('□ Refresh the page');
console.log('□ Check if API key is still visible after refresh');
console.log('□ Check browser console for any errors');
console.log('□ Check Network tab for database requests');
