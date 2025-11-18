// Diagnostic script to test notification system
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnoseNotifications() {
  console.log('\n🔍 ============================================');
  console.log('🔍 NOTIFICATION SYSTEM DIAGNOSTIC');
  console.log('🔍 ============================================\n');

  try {
    // Step 1: Check if orders table exists and has data
    console.log('📊 Step 1: Checking orders table...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error('❌ Error reading orders:', ordersError);
    } else {
      console.log(`✅ Found ${orders.length} recent orders:`);
      orders.forEach(order => {
        console.log(`   - ${order.order_number} (${order.customer_name}) - ${order.status} - ${new Date(order.created_at).toLocaleString()}`);
      });
    }

    // Step 2: Test real-time subscription
    console.log('\n📡 Step 2: Testing real-time subscription...');
    console.log('   Setting up listener for new orders...');

    const channel = supabase
      .channel('test-orders-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        console.log('🚨 NEW ORDER DETECTED IN REAL-TIME!');
        console.log('   Order:', payload.new);
      })
      .subscribe((status) => {
        console.log('   Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription ACTIVE');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription FAILED');
        }
      });

    // Step 3: Create a test order
    console.log('\n🧪 Step 3: Creating test order...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for subscription

    const testOrder = {
      order_number: `DIAG-${Date.now()}`,
      customer_name: 'Diagnostic Test',
      customer_email: 'test@diagnostic.com',
      customer_phone: '+1234567890',
      customer_address: 'Test Address',
      total_amount: 15.99,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'pay_later',
      notes: 'Diagnostic test order',
      metadata: {
        test: true,
        diagnostic: true,
        created_at: new Date().toISOString()
      }
    };

    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create test order:', insertError);
    } else {
      console.log('✅ Test order created:', newOrder.order_number);
      console.log('   Waiting 3 seconds to see if notification triggers...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Step 4: Check notification_sounds table
    console.log('\n🎵 Step 4: Checking notification sounds configuration...');
    const { data: sounds, error: soundsError } = await supabase
      .from('notification_sounds')
      .select('*')
      .eq('is_active', true);

    if (soundsError) {
      if (soundsError.code === 'PGRST116') {
        console.log('⚠️  notification_sounds table does not exist');
      } else {
        console.error('❌ Error reading notification_sounds:', soundsError);
      }
    } else {
      console.log(`✅ Found ${sounds?.length || 0} active notification sound(s)`);
      sounds?.forEach(sound => {
        console.log(`   - ${sound.name} (${sound.sound_type})`);
      });
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await supabase.removeChannel(channel);

    console.log('\n📋 DIAGNOSTIC SUMMARY:');
    console.log('═══════════════════════════════════════════════');
    console.log('1. Orders table: ' + (ordersError ? '❌ ERROR' : '✅ OK'));
    console.log('2. Real-time subscription: Check logs above');
    console.log('3. Test order creation: ' + (insertError ? '❌ FAILED' : '✅ SUCCESS'));
    console.log('4. Notification sounds: ' + (soundsError ? '⚠️  TABLE MISSING' : '✅ OK'));
    console.log('');
    console.log('🔍 Next Steps:');
    console.log('- Check browser console on the ordini page');
    console.log('- Look for "🚨 NEW ORDER DETECTED!" messages');
    console.log('- Verify sound is enabled (toggle button)');
    console.log('- Check if audioNotifier is initialized');

  } catch (error) {
    console.error('\n❌ Diagnostic error:', error);
  }

  console.log('\n🔍 Diagnostic complete!\n');
  process.exit(0);
}

diagnoseNotifications().catch(console.error);
