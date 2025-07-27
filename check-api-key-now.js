const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://despodpgvkszyexvcbft.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlc3BvZHBndmtzenlleHZjYmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTcyMTAsImV4cCI6MjA2MzkzMzIxMH0.zyjFQA-Kr317M5l_6qjV_a-6ED2iU4wraRuYaa0iGEg'
);

async function checkApiKey() {
  console.log('Checking API key in database...');
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('key', 'shippingZoneSettings')
    .single();

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  if (data) {
    console.log('Settings found:');
    console.log('- Updated:', data.updated_at);
    console.log('- API Key:', data.value?.googleMapsApiKey ? 'Present' : 'Missing');
    if (data.value?.googleMapsApiKey) {
      console.log('- Key value:', data.value.googleMapsApiKey);
    }
  } else {
    console.log('No settings found');
  }
}

checkApiKey();
