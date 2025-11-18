/**
 * Database Performance Monitoring Script
 * Monitors query performance, connection health, and identifies bottlenecks
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

class DatabasePerformanceMonitor {
  constructor() {
    this.metrics = {
      queries: [],
      connections: [],
      errors: [],
      realtime: []
    };
    this.isMonitoring = false;
    this.startTime = null;
  }

  async startMonitoring(duration = 60000) { // Default 60 seconds
    console.log('📊 DATABASE PERFORMANCE MONITORING');
    console.log('==================================\n');
    
    this.isMonitoring = true;
    this.startTime = Date.now();
    
    console.log(`🚀 Starting ${duration/1000}s monitoring session...`);
    console.log('📈 Collecting performance metrics...\n');

    // Start concurrent monitoring tasks
    const monitoringTasks = [
      this.monitorQueries(),
      this.monitorConnections(),
      this.monitorRealtime(),
      this.performLoadTest()
    ];

    // Run monitoring for specified duration
    setTimeout(() => {
      this.isMonitoring = false;
      console.log('\n⏰ Monitoring session completed');
    }, duration);

    // Wait for monitoring to complete
    await Promise.all(monitoringTasks);
    
    return this.generateReport();
  }

  async monitorQueries() {
    const queries = [
      { name: 'products_list', query: () => supabase.from('products').select('*').limit(10) },
      { name: 'categories_list', query: () => supabase.from('categories').select('*') },
      { name: 'settings_fetch', query: () => supabase.from('settings').select('*').limit(5) },
      { name: 'user_profiles_count', query: () => supabase.from('user_profiles').select('*', { count: 'exact', head: true }) },
      { name: 'orders_recent', query: () => supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5) }
    ];

    while (this.isMonitoring) {
      for (const queryTest of queries) {
        const startTime = Date.now();
        try {
          const { data, error } = await queryTest.query();
          const duration = Date.now() - startTime;
          
          this.metrics.queries.push({
            name: queryTest.name,
            duration,
            success: !error,
            error: error?.message,
            recordCount: data?.length || 0,
            timestamp: new Date().toISOString()
          });

          if (error) {
            console.log(`❌ Query ${queryTest.name}: ${error.message} (${duration}ms)`);
          } else if (duration > 1000) {
            console.log(`⚠️  Slow query ${queryTest.name}: ${duration}ms`);
          }
        } catch (e) {
          const duration = Date.now() - startTime;
          this.metrics.queries.push({
            name: queryTest.name,
            duration,
            success: false,
            error: e.message,
            timestamp: new Date().toISOString()
          });
          console.log(`❌ Query ${queryTest.name} exception: ${e.message}`);
        }
      }
      
      // Wait before next round
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async monitorConnections() {
    while (this.isMonitoring) {
      const startTime = Date.now();
      try {
        // Test basic connection
        const { error } = await supabase.from('settings').select('count').limit(1);
        const duration = Date.now() - startTime;
        
        this.metrics.connections.push({
          duration,
          success: !error,
          error: error?.message,
          timestamp: new Date().toISOString()
        });

        if (error) {
          console.log(`🔌 Connection issue: ${error.message} (${duration}ms)`);
        }
      } catch (e) {
        const duration = Date.now() - startTime;
        this.metrics.connections.push({
          duration,
          success: false,
          error: e.message,
          timestamp: new Date().toISOString()
        });
        console.log(`🔌 Connection exception: ${e.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
    }
  }

  async monitorRealtime() {
    try {
      const channel = supabase
        .channel('performance-monitor')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'settings' }, 
          (payload) => {
            this.metrics.realtime.push({
              event: payload.eventType,
              table: payload.table,
              timestamp: new Date().toISOString()
            });
            console.log(`📡 Real-time event: ${payload.eventType} on ${payload.table}`);
          }
        );

      const subscribeStart = Date.now();
      const result = await channel.subscribe();
      const subscribeTime = Date.now() - subscribeStart;
      
      if (result === 'SUBSCRIBED') {
        console.log(`📡 Real-time monitoring active (${subscribeTime}ms setup)`);
        
        // Keep channel open during monitoring
        setTimeout(() => {
          supabase.removeChannel(channel);
          console.log('📡 Real-time monitoring stopped');
        }, 55000); // Stop 5 seconds before main monitoring ends
      } else {
        console.log(`❌ Real-time setup failed: ${result}`);
      }
    } catch (e) {
      console.log(`❌ Real-time monitoring error: ${e.message}`);
    }
  }

  async performLoadTest() {
    console.log('🏋️  Starting load test...');
    
    const concurrentQueries = 5;
    const iterations = 3;
    
    for (let i = 0; i < iterations; i++) {
      console.log(`🏋️  Load test iteration ${i + 1}/${iterations}`);
      
      const promises = [];
      for (let j = 0; j < concurrentQueries; j++) {
        promises.push(this.performConcurrentQuery(`load_test_${i}_${j}`));
      }
      
      const startTime = Date.now();
      const results = await Promise.allSettled(promises);
      const totalTime = Date.now() - startTime;
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`🏋️  Iteration ${i + 1}: ${successful}/${concurrentQueries} queries successful in ${totalTime}ms`);
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait between iterations
    }
  }

  async performConcurrentQuery(testId) {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(20);
      
      const duration = Date.now() - startTime;
      
      this.metrics.queries.push({
        name: testId,
        duration,
        success: !error,
        error: error?.message,
        recordCount: data?.length || 0,
        timestamp: new Date().toISOString(),
        type: 'load_test'
      });
      
      return { success: !error, duration, records: data?.length || 0 };
    } catch (e) {
      const duration = Date.now() - startTime;
      this.metrics.queries.push({
        name: testId,
        duration,
        success: false,
        error: e.message,
        timestamp: new Date().toISOString(),
        type: 'load_test'
      });
      throw e;
    }
  }

  generateReport() {
    console.log('\n📋 PERFORMANCE MONITORING REPORT');
    console.log('================================\n');

    const totalDuration = Date.now() - this.startTime;
    console.log(`⏱️  Total monitoring duration: ${(totalDuration/1000).toFixed(1)}s`);

    // Query Performance Analysis
    console.log('\n1. 🔍 QUERY PERFORMANCE ANALYSIS');
    console.log('--------------------------------');
    
    const queries = this.metrics.queries;
    const successfulQueries = queries.filter(q => q.success);
    const failedQueries = queries.filter(q => !q.success);
    
    console.log(`📊 Total queries: ${queries.length}`);
    console.log(`✅ Successful: ${successfulQueries.length} (${(successfulQueries.length/queries.length*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failedQueries.length} (${(failedQueries.length/queries.length*100).toFixed(1)}%)`);
    
    if (successfulQueries.length > 0) {
      const durations = successfulQueries.map(q => q.duration);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      console.log(`⚡ Average query time: ${avgDuration.toFixed(2)}ms`);
      console.log(`🐌 Slowest query: ${maxDuration}ms`);
      console.log(`🚀 Fastest query: ${minDuration}ms`);
      
      // Identify slow queries
      const slowQueries = successfulQueries.filter(q => q.duration > 1000);
      if (slowQueries.length > 0) {
        console.log(`\n⚠️  Slow queries (>1s):`);
        slowQueries.forEach(q => {
          console.log(`   ${q.name}: ${q.duration}ms`);
        });
      }
    }

    // Connection Health Analysis
    console.log('\n2. 🔌 CONNECTION HEALTH ANALYSIS');
    console.log('--------------------------------');
    
    const connections = this.metrics.connections;
    const successfulConnections = connections.filter(c => c.success);
    
    if (connections.length > 0) {
      console.log(`📊 Connection tests: ${connections.length}`);
      console.log(`✅ Successful: ${successfulConnections.length} (${(successfulConnections.length/connections.length*100).toFixed(1)}%)`);
      
      if (successfulConnections.length > 0) {
        const connDurations = successfulConnections.map(c => c.duration);
        const avgConnTime = connDurations.reduce((a, b) => a + b, 0) / connDurations.length;
        console.log(`⚡ Average connection time: ${avgConnTime.toFixed(2)}ms`);
      }
    }

    // Real-time Analysis
    console.log('\n3. 📡 REAL-TIME ANALYSIS');
    console.log('------------------------');
    
    const realtimeEvents = this.metrics.realtime;
    console.log(`📊 Real-time events captured: ${realtimeEvents.length}`);
    
    if (realtimeEvents.length > 0) {
      const eventTypes = [...new Set(realtimeEvents.map(e => e.event))];
      console.log(`📋 Event types: ${eventTypes.join(', ')}`);
    }

    // Performance Recommendations
    console.log('\n4. 💡 PERFORMANCE RECOMMENDATIONS');
    console.log('---------------------------------');
    
    const recommendations = [];
    
    if (successfulQueries.length > 0) {
      const avgQueryTime = successfulQueries.reduce((sum, q) => sum + q.duration, 0) / successfulQueries.length;
      
      if (avgQueryTime > 500) {
        recommendations.push('Consider optimizing slow queries or adding database indexes');
      }
      
      if (failedQueries.length / queries.length > 0.1) {
        recommendations.push('High query failure rate - check database connectivity and permissions');
      }
    }
    
    if (connections.length > 0) {
      const avgConnTime = successfulConnections.reduce((sum, c) => sum + c.duration, 0) / successfulConnections.length;
      
      if (avgConnTime > 1000) {
        recommendations.push('Slow connection times - consider connection pooling or geographic optimization');
      }
    }
    
    if (realtimeEvents.length === 0) {
      recommendations.push('Real-time functionality may not be working - check WebSocket connections');
    }
    
    if (recommendations.length === 0) {
      console.log('✅ No major performance issues detected');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    return {
      summary: {
        totalQueries: queries.length,
        successRate: successfulQueries.length / queries.length,
        averageQueryTime: successfulQueries.length > 0 ? 
          successfulQueries.reduce((sum, q) => sum + q.duration, 0) / successfulQueries.length : 0,
        connectionHealth: successfulConnections.length / connections.length,
        realtimeEvents: realtimeEvents.length
      },
      metrics: this.metrics,
      recommendations
    };
  }
}

// Export for use in other scripts
export { DatabasePerformanceMonitor };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new DatabasePerformanceMonitor();
  
  // Get duration from command line args or use default
  const duration = process.argv[2] ? parseInt(process.argv[2]) * 1000 : 60000;
  
  monitor.startMonitoring(duration)
    .then(report => {
      console.log('\n🎯 Performance monitoring completed');
      // Optionally save report to file
      // fs.writeFileSync(`performance-report-${Date.now()}.json`, JSON.stringify(report, null, 2));
    })
    .catch(error => {
      console.error('❌ Performance monitoring failed:', error);
      process.exit(1);
    });
}
