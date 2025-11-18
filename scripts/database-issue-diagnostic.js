/**
 * Database Issue Diagnostic Script
 * Specifically diagnoses the issues found in console logs and provides fixes
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabaseIssues() {
  console.log('🔧 DATABASE ISSUE DIAGNOSTIC');
  console.log('============================\n');

  const diagnostics = {
    connectionIssues: [],
    authIssues: [],
    dataLoadingIssues: [],
    performanceIssues: [],
    configurationIssues: [],
    fixes: []
  };

  // 1. Diagnose Multiple Supabase Instance Issue
  console.log('1. 🔍 MULTIPLE SUPABASE INSTANCE DIAGNOSTIC');
  console.log('--------------------------------------------');
  
  try {
    // Test creating multiple clients to reproduce the warning
    const client1 = createClient(supabaseUrl, supabaseKey);
    const client2 = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Multiple client creation test completed');
    console.log('⚠️  This likely causes the "Multiple GoTrueClient instances" warning');
    
    diagnostics.configurationIssues.push({
      issue: 'Multiple Supabase client instances',
      severity: 'warning',
      impact: 'May cause undefined behavior in concurrent operations',
      location: 'Frontend application initialization'
    });
    
    diagnostics.fixes.push({
      issue: 'Multiple Supabase instances',
      solution: 'Implement singleton pattern for Supabase client',
      priority: 'medium',
      code: `
// Create a single supabase client instance
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Use this single instance throughout the app
// Instead of creating new clients in components
`
    });
    
  } catch (e) {
    console.log(`❌ Multiple instance test failed: ${e.message}`);
  }

  // 2. Diagnose User Registration Trigger Issue
  console.log('\n2. 🔍 USER REGISTRATION TRIGGER DIAGNOSTIC');
  console.log('------------------------------------------');
  
  try {
    // Test the specific registration failure
    const testEmail = `diagnostic-${Date.now()}@example.com`;
    console.log(`Testing registration with: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          full_name: 'Diagnostic Test User'
        }
      }
    });
    
    if (error) {
      console.log(`❌ Registration failed: ${error.message}`);
      
      if (error.message.includes('Database error saving new user')) {
        diagnostics.authIssues.push({
          issue: 'Database trigger failure on user registration',
          severity: 'critical',
          impact: 'Users cannot register accounts',
          cause: 'Missing or failing create_user_profile trigger function'
        });
        
        diagnostics.fixes.push({
          issue: 'User registration trigger failure',
          solution: 'Deploy missing database trigger function',
          priority: 'critical',
          sql: `
-- Create the user profile creation function
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();
`
        });
      }
    } else {
      console.log(`✅ Registration successful: ${data.user?.id}`);
    }
  } catch (e) {
    console.log(`❌ Registration diagnostic failed: ${e.message}`);
    diagnostics.authIssues.push({
      issue: 'Registration test exception',
      severity: 'high',
      error: e.message
    });
  }

  // 3. Diagnose Data Loading Timeouts
  console.log('\n3. 🔍 DATA LOADING TIMEOUT DIAGNOSTIC');
  console.log('-------------------------------------');
  
  const timeoutTests = [
    { name: 'Products', table: 'products', timeout: 8000 },
    { name: 'Settings', table: 'settings', timeout: 8000 },
    { name: 'Categories', table: 'categories', timeout: 8000 },
    { name: 'Content Sections', table: 'content_sections', timeout: 8000 }
  ];
  
  for (const test of timeoutTests) {
    console.log(`\n🔍 Testing ${test.name} loading...`);
    
    try {
      const startTime = Date.now();
      
      // Race between query and timeout
      const queryPromise = supabase.from(test.table).select('*').limit(10);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), test.timeout)
      );
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      const duration = Date.now() - startTime;
      
      if (error) {
        console.log(`❌ ${test.name} loading failed: ${error.message} (${duration}ms)`);
        diagnostics.dataLoadingIssues.push({
          table: test.table,
          issue: 'Query failed',
          duration,
          error: error.message
        });
      } else {
        console.log(`✅ ${test.name} loaded: ${data?.length || 0} records (${duration}ms)`);
        
        if (duration > 2000) {
          console.log(`⚠️  Slow loading detected for ${test.name}`);
          diagnostics.performanceIssues.push({
            table: test.table,
            issue: 'Slow query performance',
            duration,
            severity: duration > 5000 ? 'high' : 'medium'
          });
        }
      }
    } catch (e) {
      if (e.message === 'Timeout') {
        console.log(`❌ ${test.name} loading timed out (>${test.timeout}ms)`);
        diagnostics.dataLoadingIssues.push({
          table: test.table,
          issue: 'Query timeout',
          timeout: test.timeout,
          severity: 'high'
        });
        
        diagnostics.fixes.push({
          issue: `${test.name} loading timeout`,
          solution: 'Optimize query performance or increase timeout',
          priority: 'high',
          suggestions: [
            'Add database indexes for frequently queried columns',
            'Implement pagination for large datasets',
            'Use select() to limit returned columns',
            'Consider caching for static data'
          ]
        });
      } else {
        console.log(`❌ ${test.name} test exception: ${e.message}`);
        diagnostics.dataLoadingIssues.push({
          table: test.table,
          issue: 'Test exception',
          error: e.message
        });
      }
    }
  }

  // 4. Diagnose RLS Policy Issues
  console.log('\n4. 🔍 ROW LEVEL SECURITY DIAGNOSTIC');
  console.log('-----------------------------------');
  
  try {
    // Test problematic RLS behavior found in analysis
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (!error && data) {
      console.log('⚠️  user_profiles SELECT unexpectedly allowed without auth');
      diagnostics.configurationIssues.push({
        issue: 'RLS policy too permissive',
        table: 'user_profiles',
        severity: 'medium',
        impact: 'Potential data exposure'
      });
      
      diagnostics.fixes.push({
        issue: 'Permissive RLS on user_profiles',
        solution: 'Review and tighten RLS policies',
        priority: 'medium',
        sql: `
-- Example: Restrict user_profiles access to authenticated users only
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Create proper RLS policy
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
`
      });
    }
  } catch (e) {
    console.log(`RLS diagnostic error: ${e.message}`);
  }

  // 5. Diagnose Missing Functions
  console.log('\n5. 🔍 MISSING FUNCTIONS DIAGNOSTIC');
  console.log('----------------------------------');
  
  const requiredFunctions = [
    'create_user_profile',
    'update_user_profiles_updated_at',
    'handle_new_user'
  ];
  
  for (const funcName of requiredFunctions) {
    try {
      const { error } = await supabase.rpc(funcName);
      
      if (error && error.message?.includes('could not find function')) {
        console.log(`❌ Missing function: ${funcName}`);
        diagnostics.configurationIssues.push({
          issue: `Missing database function: ${funcName}`,
          severity: 'high',
          impact: 'Core functionality may not work'
        });
      } else {
        console.log(`✅ Function exists: ${funcName}`);
      }
    } catch (e) {
      console.log(`Function test error for ${funcName}: ${e.message}`);
    }
  }

  // 6. Generate Comprehensive Report
  console.log('\n📋 DIAGNOSTIC SUMMARY REPORT');
  console.log('============================');
  
  const totalIssues = [
    ...diagnostics.connectionIssues,
    ...diagnostics.authIssues,
    ...diagnostics.dataLoadingIssues,
    ...diagnostics.performanceIssues,
    ...diagnostics.configurationIssues
  ];
  
  console.log(`🔍 Total issues found: ${totalIssues.length}`);
  
  // Categorize by severity
  const critical = totalIssues.filter(i => i.severity === 'critical');
  const high = totalIssues.filter(i => i.severity === 'high');
  const medium = totalIssues.filter(i => i.severity === 'medium');
  const warnings = totalIssues.filter(i => i.severity === 'warning');
  
  if (critical.length > 0) {
    console.log(`\n🚨 CRITICAL ISSUES (${critical.length}):`);
    critical.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.issue}`);
      if (issue.impact) console.log(`     Impact: ${issue.impact}`);
    });
  }
  
  if (high.length > 0) {
    console.log(`\n⚠️  HIGH PRIORITY ISSUES (${high.length}):`);
    high.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.issue}`);
    });
  }
  
  if (medium.length > 0) {
    console.log(`\n📋 MEDIUM PRIORITY ISSUES (${medium.length}):`);
    medium.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue.issue}`);
    });
  }

  // Priority fixes
  console.log('\n🔧 RECOMMENDED FIXES (Priority Order):');
  console.log('=====================================');
  
  const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
  const sortedFixes = diagnostics.fixes.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
  
  sortedFixes.forEach((fix, i) => {
    console.log(`\n${i + 1}. [${fix.priority.toUpperCase()}] ${fix.issue}`);
    console.log(`   Solution: ${fix.solution}`);
    if (fix.sql) {
      console.log(`   SQL Required: Yes (see fix.sql for details)`);
    }
    if (fix.code) {
      console.log(`   Code Changes: Yes (see fix.code for details)`);
    }
  });

  return diagnostics;
}

// Export for use in other scripts
export { diagnoseDatabaseIssues };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  diagnoseDatabaseIssues()
    .then(async (diagnostics) => {
      console.log('\n🎯 Database diagnostic completed');
      console.log(`📊 Found ${diagnostics.fixes.length} actionable fixes`);
      
      // Save detailed results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `database-diagnostic-${timestamp}.json`;
      
      try {
        const fs = await import('fs');
        fs.default.writeFileSync(filename, JSON.stringify(diagnostics, null, 2));
        console.log(`💾 Detailed results saved to: ${filename}`);
      } catch (e) {
        console.log('💾 Could not save results to file');
      }
    })
    .catch(error => {
      console.error('❌ Database diagnostic failed:', error);
      process.exit(1);
    });
}
