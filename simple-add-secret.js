import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sixnfemtvmighstbgrbd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I'
);

console.log('Starting...');

const result = await supabase
  .from('settings')
  .upsert({
    key: 'stripe_webhook_secret',
    value: 'whsec_GugH1IiteNO2a0d4p8QKzE0q2yF4AIaf',
  })
  .select();

console.log('Result:', result);

if (result.error) {
  console.error('ERROR:', result.error);
} else {
  console.log('✅ SUCCESS!', result.data);
}
