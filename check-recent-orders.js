#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('═══════════════════════════════════════════════');
console.log('📊 CHECKING RECENT ORDERS');
console.log('═══════════════════════════════════════════════\n');

// Check orders created in last 30 minutes
const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .gte('created_at', thirtyMinutesAgo)
  .order('created_at', { ascending: false });

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log(`Found ${orders.length} orders in last 30 minutes:\n`);
  
  if (orders.length === 0) {
    console.log('⚠️  NO ORDERS CREATED IN LAST 30 MINUTES');
    console.log('This confirms webhook is NOT creating orders!\n');
  } else {
    orders.forEach((order, i) => {
      console.log(`\n📦 Order ${i + 1}:`);
      console.log(`  ID: ${order.id}`);
      console.log(`  Order Number: ${order.order_number}`);
      console.log(`  Customer: ${order.customer_name}`);
      console.log(`  Email: ${order.customer_email}`);
      console.log(`  Total: €${order.total_amount}`);
      console.log(`  Payment Status: ${order.payment_status}`);
      console.log(`  Payment Method: ${order.payment_method}`);
      console.log(`  Stripe Session: ${order.stripe_session_id || 'NULL'}`);
      console.log(`  Created: ${order.created_at}`);
    });
  }
}

console.log('\n═══════════════════════════════════════════════');
console.log('✅ CHECK COMPLETE');
console.log('═══════════════════════════════════════════════\n');
