/**
 * Master Database Script Runner
 * Runs all database diagnostic scripts in sequence and provides comprehensive report
 */

import { testDatabaseConnection } from './database-connection-test.js';
import { verifyDatabaseSchema } from './database-schema-verification.js';
import { DatabasePerformanceMonitor } from './database-performance-monitor.js';
import { diagnoseDatabaseIssues } from './database-issue-diagnostic.js';

async function runAllDatabaseChecks() {
  console.log('🚀 COMPREHENSIVE DATABASE HEALTH CHECK');
  console.log('======================================\n');
  
  const startTime = Date.now();
  const results = {
    connection: null,
    schema: null,
    performance: null,
    diagnostics: null,
    summary: {
      overallHealth: 'unknown',
      criticalIssues: 0,
      recommendations: [],
      executionTime: 0
    }
  };

  try {
    // 1. Connection Test
    console.log('🔗 STEP 1: CONNECTION TEST');
    console.log('==========================');
    results.connection = await testDatabaseConnection();
    console.log('✅ Connection test completed\n');

    // 2. Schema Verification
    console.log('📋 STEP 2: SCHEMA VERIFICATION');
    console.log('==============================');
    results.schema = await verifyDatabaseSchema();
    console.log('✅ Schema verification completed\n');

    // 3. Performance Monitoring (shorter duration for comprehensive check)
    console.log('📊 STEP 3: PERFORMANCE MONITORING');
    console.log('=================================');
    const monitor = new DatabasePerformanceMonitor();
    results.performance = await monitor.startMonitoring(30000); // 30 seconds
    console.log('✅ Performance monitoring completed\n');

    // 4. Issue Diagnostics
    console.log('🔧 STEP 4: ISSUE DIAGNOSTICS');
    console.log('============================');
    results.diagnostics = await diagnoseDatabaseIssues();
    console.log('✅ Issue diagnostics completed\n');

  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    results.summary.overallHealth = 'failed';
    results.summary.criticalIssues = 999;
    return results;
  }

  // Generate comprehensive summary
  const totalTime = Date.now() - startTime;
  results.summary.executionTime = totalTime;

  console.log('📋 COMPREHENSIVE HEALTH SUMMARY');
  console.log('===============================\n');

  // Connection Health
  const connectionHealth = results.connection?.connectionTest?.success ? 'good' : 'poor';
  console.log(`🔗 Connection Health: ${connectionHealth}`);
  if (results.connection?.latencyTest?.average) {
    console.log(`   Average Latency: ${results.connection.latencyTest.average.toFixed(2)}ms`);
  }

  // Schema Health
  const schemaScore = results.schema?.overall?.score || 0;
  const schemaMax = results.schema?.overall?.maxScore || 1;
  const schemaHealth = (schemaScore / schemaMax) > 0.8 ? 'good' : 'needs attention';
  console.log(`📋 Schema Health: ${schemaHealth} (${schemaScore}/${schemaMax})`);

  // Performance Health
  const perfHealth = results.performance?.summary?.successRate > 0.9 ? 'good' : 'poor';
  console.log(`📊 Performance Health: ${perfHealth}`);
  if (results.performance?.summary?.averageQueryTime) {
    console.log(`   Average Query Time: ${results.performance.summary.averageQueryTime.toFixed(2)}ms`);
  }

  // Critical Issues Count
  const criticalIssues = [
    ...(results.diagnostics?.authIssues?.filter(i => i.severity === 'critical') || []),
    ...(results.diagnostics?.dataLoadingIssues?.filter(i => i.severity === 'critical') || []),
    ...(results.diagnostics?.configurationIssues?.filter(i => i.severity === 'critical') || [])
  ];
  
  results.summary.criticalIssues = criticalIssues.length;
  console.log(`🚨 Critical Issues: ${criticalIssues.length}`);

  // Overall Health Assessment
  let overallHealth = 'excellent';
  if (criticalIssues.length > 0) {
    overallHealth = 'critical';
  } else if (connectionHealth === 'poor' || schemaHealth === 'needs attention' || perfHealth === 'poor') {
    overallHealth = 'needs attention';
  } else if (results.schema?.overall?.issues?.length > 0) {
    overallHealth = 'good';
  }

  results.summary.overallHealth = overallHealth;
  console.log(`🏥 Overall Database Health: ${overallHealth.toUpperCase()}`);

  // Top Recommendations
  console.log('\n💡 TOP RECOMMENDATIONS:');
  console.log('=======================');
  
  const recommendations = [];
  
  // Connection recommendations
  if (results.connection?.latencyTest?.average > 1000) {
    recommendations.push('Optimize network connection - high latency detected');
  }
  
  // Schema recommendations
  if (results.schema?.overall?.issues?.length > 0) {
    recommendations.push('Fix missing database components (tables, functions, triggers)');
  }
  
  // Performance recommendations
  if (results.performance?.summary?.averageQueryTime > 500) {
    recommendations.push('Optimize slow queries - consider adding indexes');
  }
  
  // Critical issue recommendations
  if (criticalIssues.length > 0) {
    recommendations.push('URGENT: Fix critical authentication and data loading issues');
  }
  
  // Diagnostic recommendations
  if (results.diagnostics?.fixes?.length > 0) {
    const highPriorityFixes = results.diagnostics.fixes.filter(f => 
      f.priority === 'critical' || f.priority === 'high'
    );
    if (highPriorityFixes.length > 0) {
      recommendations.push(`Apply ${highPriorityFixes.length} high-priority database fixes`);
    }
  }
  
  if (recommendations.length === 0) {
    console.log('✅ No major issues detected - database is healthy!');
  } else {
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }
  
  results.summary.recommendations = recommendations;

  // Quick Action Items
  console.log('\n⚡ QUICK ACTION ITEMS:');
  console.log('=====================');
  
  if (criticalIssues.some(i => i.issue?.includes('trigger'))) {
    console.log('1. 🔧 Run: node scripts/fix-user-registration-trigger.js');
  }
  
  if (results.diagnostics?.configurationIssues?.some(i => i.issue?.includes('Multiple'))) {
    console.log('2. 🔧 Implement singleton Supabase client pattern');
  }
  
  if (results.performance?.summary?.averageQueryTime > 1000) {
    console.log('3. 🔧 Review and optimize slow database queries');
  }
  
  if (results.schema?.overall?.score < results.schema?.overall?.maxScore * 0.8) {
    console.log('4. 🔧 Run database migration scripts');
  }

  console.log(`\n⏱️  Total execution time: ${(totalTime/1000).toFixed(1)}s`);
  console.log('🎯 Comprehensive database health check completed');

  return results;
}

// Export for use in other scripts
export { runAllDatabaseChecks };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllDatabaseChecks()
    .then(async (results) => {
      // Save comprehensive results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `database-health-report-${timestamp}.json`;
      
      try {
        const fs = await import('fs');
        fs.default.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`\n💾 Comprehensive report saved to: ${filename}`);
      } catch (e) {
        console.log('\n💾 Could not save report to file');
      }
      
      // Exit with appropriate code
      if (results.summary.overallHealth === 'critical') {
        console.log('\n🚨 Exiting with error code due to critical issues');
        process.exit(1);
      } else {
        console.log('\n✅ Database health check completed successfully');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('\n❌ Comprehensive database health check failed:', error);
      process.exit(1);
    });
}
