#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Testing order_status field values:\n');

const statusValues = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
  'awaiting_payment',
  'paid',
  'processing'
];

for (const orderStatus of statusValues) {
  try {
    const testOrder = {
      order_number: `TEST_${Date.now()}`,
      customer_name: 'Test',
      customer_email: 'test@test.com',
      customer_phone: '123',
      customer_address: 'Test',
      total_amount: 1,
      payment_status: 'pending',
      payment_method: 'test',
      order_status: orderStatus
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();

    if (error) {
      if (error.message.includes('check constraint')) {
        console.log(`❌ "${orderStatus}" - REJECTED by check constraint`);
      } else {
        console.log(`❌ "${orderStatus}" - ERROR: ${error.message.substring(0, 80)}`);
      }
    } else {
      console.log(`✅ "${orderStatus}" - ALLOWED`);
      // Clean up
      await supabase.from('orders').delete().eq('id', data.id);
    }
  } catch (e) {
    console.log(`❌ "${orderStatus}" - ERROR: ${e.message}`);
  }
}

console.log('\n✅ Test complete');
