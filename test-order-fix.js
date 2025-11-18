// Test Order Fix - Verify all database operations work correctly
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testOrderCreation() {
  console.log('🧪 TESTING ORDER CREATION WITH ALL FIXES');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Create order
    console.log('1. Creating order...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: 'TEST-FINAL-FIX',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: 'Non fornito',
        customer_address: 'corso principe oddone 82',
        delivery_type: 'delivery',
        total_amount: 13.00,
        delivery_fee: 3.00,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'cash_on_delivery',
        special_instructions: 'Test order with all fixes'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation failed:', orderError);
      return;
    }

    console.log('✅ Order created:', order.id);

    // Step 2: Get a real product ID
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(1);

    if (productError || !products.length) {
      console.error('❌ No products found:', productError);
      return;
    }

    const product = products[0];
    console.log('✅ Using product:', product.name);

    // Step 3: Create order item with all required fields
    console.log('2. Creating order item...');
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: 1,
        subtotal: product.price,
        unit_price: product.price,
        special_requests: 'Test item with all required fields'
      })
      .select()
      .single();

    if (itemError) {
      console.error('❌ Order item creation failed:', itemError);
      return;
    }

    console.log('✅ Order item created:', orderItem.id);

    // Step 4: Clean up test data
    console.log('3. Cleaning up test data...');
    await supabase.from('order_items').delete().eq('id', orderItem.id);
    await supabase.from('orders').delete().eq('id', order.id);

    console.log('✅ Test data cleaned up');
    console.log('');
    console.log('🎉 ALL TESTS PASSED! Order creation should work now.');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testOrderCreation();
