#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Checking what status values exist in current orders...\n');

const { data, error } = await supabase
  .from('orders')
  .select('status, order_status')
  .limit(10);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Found', data.length, 'orders:\n');
  
  const uniqueStatuses = new Set();
  const uniqueOrderStatuses = new Set();
  
  data.forEach((order, i) => {
    console.log(`Order ${i + 1}:`);
    console.log(`  status: "${order.status}"`);
    console.log(`  order_status: "${order.order_status}"`);
    uniqueStatuses.add(order.status);
    uniqueOrderStatuses.add(order.order_status);
  });
  
  console.log('\n───────────────────────────────');
  console.log('Unique VALUES found:');
  console.log('───────────────────────────────');
  console.log('status field:', Array.from(uniqueStatuses));
  console.log('order_status field:', Array.from(uniqueOrderStatuses));
}
