#!/usr/bin/env node

/**
 * READ DATABASE SCHEMA SCRIPT
 * This script connects to Supabase and reads the ACTUAL database structure
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
dotenv.config({ path: join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('═══════════════════════════════════════════════');
console.log('📖 READING ACTUAL DATABASE SCHEMA');
console.log('═══════════════════════════════════════════════');
console.log('🔗 Database URL:', SUPABASE_URL);
console.log('');

async function readDatabaseSchema() {
  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      return;
    }

    console.log('✅ Connection successful!\n');

    // Get sample order to see structure
    console.log('═══════════════════════════════════════════════');
    console.log('📊 ORDERS TABLE - ACTUAL COLUMNS');
    console.log('═══════════════════════════════════════════════\n');

    if (testData && testData.length > 0) {
      const order = testData[0];
      const columns = Object.keys(order);
      
      console.log('Found', columns.length, 'columns:\n');
      
      columns.forEach((column, index) => {
        const value = order[column];
        const type = typeof value;
        const valuePreview = value === null ? 'NULL' : 
                            type === 'object' ? JSON.stringify(value).substring(0, 50) + '...' :
                            String(value).substring(0, 50);
        
        console.log(`${index + 1}. ${column}`);
        console.log(`   Type: ${type}`);
        console.log(`   Sample: ${valuePreview}`);
        console.log('');
      });
    } else {
      // No data, try to insert and read back to see structure
      console.log('⚠️  No orders in database yet.');
      console.log('📝 Creating a test order to read schema...\n');
      
      const testOrder = {
        order_number: 'TEST_' + Date.now(),
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '1234567890',
        total_amount: 10.00,
        status: 'test',
        payment_status: 'test'
      };

      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Could not create test order:', insertError.message);
        console.log('\nTrying to read from empty table structure...');
        
        // Try selecting with specific fields to see what's allowed
        const commonFields = [
          'id', 'order_number', 'customer_name', 'customer_email', 'customer_phone',
          'customer_address', 'shipping_address', 'billing_address',
          'total_amount', 'status', 'payment_status', 'payment_method',
          'stripe_session_id', 'stripe_payment_intent_id',
          'paid_amount', 'paid_at', 'notes', 'metadata',
          'delivery_type', 'delivery_fee', 'delivery_address',
          'user_id', 'tracking_number', 'order_status',
          'created_at', 'updated_at'
        ];

        console.log('\n🔍 Testing which fields exist:\n');
        
        for (const field of commonFields) {
          try {
            const { error } = await supabase
              .from('orders')
              .select(field)
              .limit(1);
            
            if (!error) {
              console.log(`✅ ${field} - EXISTS`);
            } else if (error.message.includes('does not exist')) {
              console.log(`❌ ${field} - DOES NOT EXIST`);
            } else {
              console.log(`⚠️  ${field} - ${error.message}`);
            }
          } catch (e) {
            console.log(`❌ ${field} - ERROR: ${e.message}`);
          }
        }
      } else {
        console.log('✅ Test order created!\n');
        const columns = Object.keys(newOrder);
        
        console.log('Found', columns.length, 'columns:\n');
        
        columns.forEach((column, index) => {
          const value = newOrder[column];
          const type = typeof value;
          
          console.log(`${index + 1}. ${column}`);
          console.log(`   Type: ${type}`);
          console.log('');
        });

        // Clean up test order
        await supabase
          .from('orders')
          .delete()
          .eq('id', newOrder.id);
        
        console.log('🧹 Test order cleaned up\n');
      }
    }

    // Read order_items table structure
    console.log('═══════════════════════════════════════════════');
    console.log('📊 ORDER_ITEMS TABLE - ACTUAL COLUMNS');
    console.log('═══════════════════════════════════════════════\n');

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);

    if (itemsError) {
      console.log('❌ Could not read order_items:', itemsError.message);
    } else if (itemsData && itemsData.length > 0) {
      const item = itemsData[0];
      const columns = Object.keys(item);
      
      console.log('Found', columns.length, 'columns:\n');
      
      columns.forEach((column, index) => {
        console.log(`${index + 1}. ${column}`);
      });
    } else {
      console.log('⚠️  No order items in database yet.');
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ DATABASE SCHEMA READ COMPLETE');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error);
  }
}

readDatabaseSchema();
