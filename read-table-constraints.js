#!/usr/bin/env node

/**
 * READ TABLE CONSTRAINTS SCRIPT
 * This reads the CHECK constraints on the orders table
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('═══════════════════════════════════════════════');
console.log('🔍 READING TABLE CONSTRAINTS');
console.log('═══════════════════════════════════════════════\n');

async function testStatusValues() {
  console.log('Testing which status values are ALLOWED:\n');
  
  const statusValues = [
    'pending',
    'payment_pending',
    'confirmed',
    'preparing',
    'ready',
    'delivered',
    'cancelled',
    'paid',
    'processing',
    'completed'
  ];

  for (const status of statusValues) {
    try {
      // Try to insert a test order with this status
      const testOrder = {
        order_number: `TEST_STATUS_${Date.now()}`,
        customer_name: 'Test',
        customer_email: 'test@test.com',
        customer_phone: '123',
        customer_address: 'Test',
        total_amount: 1,
        status: status,
        payment_status: 'pending',
        payment_method: 'test'
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single();

      if (error) {
        if (error.message.includes('check constraint')) {
          console.log(`❌ "${status}" - NOT ALLOWED (check constraint)`);
        } else {
          console.log(`❌ "${status}" - ERROR: ${error.message}`);
        }
      } else {
        console.log(`✅ "${status}" - ALLOWED`);
        // Clean up
        await supabase.from('orders').delete().eq('id', data.id);
      }
    } catch (e) {
      console.log(`❌ "${status}" - ERROR: ${e.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('✅ CONSTRAINT TESTING COMPLETE');
  console.log('═══════════════════════════════════════════════\n');
}

testStatusValues();
