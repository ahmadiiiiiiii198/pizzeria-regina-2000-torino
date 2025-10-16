/**
 * Enhanced Database Connection Test Script
 * Tests connection speed, latency, and basic functionality
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔗 DATABASE CONNECTION TEST');
  console.log('============================\n');

  const results = {
    connectionTest: null,
    latencyTest: null,
    throughputTest: null,
    authTest: null,
    realtimeTest: null
  };

  // 1. Basic Connection Test
  console.log('1. 🔌 Basic Connection Test');
  console.log('---------------------------');
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('settings')
      .select('count')
      .limit(1);
    
    const connectionTime = Date.now() - startTime;
    
    if (error) {
      console.log(`❌ Connection failed (${connectionTime}ms): ${error.message}`);
      results.connectionTest = { success: false, time: connectionTime, error: error.message };
      return results;
    }
    
    console.log(`✅ Connection successful (${connectionTime}ms)`);
    results.connectionTest = { success: true, time: connectionTime };
  } catch (e) {
    console.log(`❌ Connection exception: ${e.message}`);
    results.connectionTest = { success: false, error: e.message };
    return results;
  }

  // 2. Latency Test (Multiple Quick Queries)
  console.log('\n2. ⚡ Latency Test (5 quick queries)');
  console.log('------------------------------------');
  const latencies = [];
  
  for (let i = 0; i < 5; i++) {
    try {
      const start = Date.now();
      await supabase.from('settings').select('count').limit(1);
      const latency = Date.now() - start;
      latencies.push(latency);
      console.log(`Query ${i + 1}: ${latency}ms`);
    } catch (e) {
      console.log(`Query ${i + 1}: Failed - ${e.message}`);
      latencies.push(-1);
    }
  }
  
  const avgLatency = latencies.filter(l => l > 0).reduce((a, b) => a + b, 0) / latencies.filter(l => l > 0).length;
  console.log(`📊 Average latency: ${avgLatency.toFixed(2)}ms`);
  results.latencyTest = { latencies, average: avgLatency };

  // 3. Throughput Test (Larger Query)
  console.log('\n3. 📈 Throughput Test');
  console.log('---------------------');
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(50);
    
    const throughputTime = Date.now() - start;
    const recordCount = data?.length || 0;
    
    if (error) {
      console.log(`❌ Throughput test failed: ${error.message}`);
      results.throughputTest = { success: false, error: error.message };
    } else {
      console.log(`✅ Retrieved ${recordCount} records in ${throughputTime}ms`);
      console.log(`📊 Throughput: ${(recordCount / throughputTime * 1000).toFixed(2)} records/second`);
      results.throughputTest = { 
        success: true, 
        time: throughputTime, 
        records: recordCount,
        throughput: recordCount / throughputTime * 1000
      };
    }
  } catch (e) {
    console.log(`❌ Throughput test exception: ${e.message}`);
    results.throughputTest = { success: false, error: e.message };
  }

  // 4. Auth System Test
  console.log('\n4. 🔐 Auth System Test');
  console.log('----------------------');
  try {
    const start = Date.now();
    const { data: { session }, error } = await supabase.auth.getSession();
    const authTime = Date.now() - start;
    
    if (error) {
      console.log(`❌ Auth test failed (${authTime}ms): ${error.message}`);
      results.authTest = { success: false, time: authTime, error: error.message };
    } else {
      console.log(`✅ Auth system responsive (${authTime}ms)`);
      console.log(`📊 Current session: ${session ? 'Active' : 'None'}`);
      results.authTest = { success: true, time: authTime, hasSession: !!session };
    }
  } catch (e) {
    console.log(`❌ Auth test exception: ${e.message}`);
    results.authTest = { success: false, error: e.message };
  }

  // 5. Real-time Connection Test
  console.log('\n5. 📡 Real-time Connection Test');
  console.log('-------------------------------');
  try {
    const start = Date.now();
    
    // Test real-time subscription setup
    const channel = supabase
      .channel('connection-test')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'settings' }, 
        (payload) => {
          console.log('📨 Real-time event received:', payload);
        }
      );
    
    const subscribeResult = await channel.subscribe();
    const realtimeTime = Date.now() - start;
    
    if (subscribeResult === 'SUBSCRIBED') {
      console.log(`✅ Real-time connection established (${realtimeTime}ms)`);
      results.realtimeTest = { success: true, time: realtimeTime };
      
      // Clean up
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
    } else {
      console.log(`❌ Real-time connection failed: ${subscribeResult}`);
      results.realtimeTest = { success: false, status: subscribeResult };
    }
  } catch (e) {
    console.log(`❌ Real-time test exception: ${e.message}`);
    results.realtimeTest = { success: false, error: e.message };
  }

  // 6. Summary Report
  console.log('\n📋 CONNECTION TEST SUMMARY');
  console.log('==========================');
  
  const overallHealth = [
    results.connectionTest?.success,
    results.latencyTest?.average < 2000,
    results.throughputTest?.success,
    results.authTest?.success,
    results.realtimeTest?.success
  ].filter(Boolean).length;
  
  console.log(`🏥 Overall Health Score: ${overallHealth}/5`);
  
  if (results.connectionTest?.time > 1000) {
    console.log('⚠️  Warning: Slow initial connection (>1s)');
  }
  
  if (results.latencyTest?.average > 1000) {
    console.log('⚠️  Warning: High average latency (>1s)');
  }
  
  if (!results.realtimeTest?.success) {
    console.log('⚠️  Warning: Real-time features may not work properly');
  }
  
  console.log('\n💾 Detailed results saved to results object');
  return results;
}

// Export for use in other scripts
export { testDatabaseConnection };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseConnection()
    .then(results => {
      console.log('\n🎯 Test completed. Results:', JSON.stringify(results, null, 2));
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}
