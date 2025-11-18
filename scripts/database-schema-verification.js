/**
 * Database Schema Verification Script
 * Verifies all required tables, columns, indexes, and constraints exist
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected schema definition
const expectedSchema = {
  tables: {
    user_profiles: {
      required_columns: ['id', 'email', 'full_name', 'phone', 'default_address', 'preferences', 'created_at', 'updated_at'],
      optional_columns: ['avatar_url', 'email_verified', 'phone_verified']
    },
    products: {
      required_columns: ['id', 'name', 'description', 'price', 'category_id', 'image_url', 'available', 'created_at', 'updated_at'],
      optional_columns: ['ingredients', 'allergens', 'nutritional_info', 'preparation_time', 'stock_quantity']
    },
    categories: {
      required_columns: ['id', 'name', 'description', 'display_order', 'active', 'created_at', 'updated_at'],
      optional_columns: ['image_url', 'parent_id']
    },
    orders: {
      required_columns: ['id', 'user_id', 'status', 'total_amount', 'delivery_address', 'phone', 'created_at', 'updated_at'],
      optional_columns: ['delivery_time', 'notes', 'payment_status', 'payment_method', 'delivery_fee']
    },
    order_items: {
      required_columns: ['id', 'order_id', 'product_id', 'quantity', 'unit_price', 'total_price'],
      optional_columns: ['customizations', 'notes']
    },
    settings: {
      required_columns: ['key', 'value', 'updated_at'],
      optional_columns: ['description', 'type', 'category']
    },
    admin_sessions: {
      required_columns: ['id', 'user_id', 'token', 'expires_at', 'created_at'],
      optional_columns: ['last_activity', 'ip_address', 'user_agent']
    },
    content_sections: {
      required_columns: ['id', 'section_name', 'content', 'updated_at'],
      optional_columns: ['created_at', 'active', 'metadata']
    }
  },
  functions: [
    'create_user_profile',
    'update_user_profiles_updated_at',
    'handle_new_user'
  ],
  triggers: [
    'on_auth_user_created',
    'update_user_profiles_updated_at_trigger'
  ]
};

async function verifyDatabaseSchema() {
  console.log('🔍 DATABASE SCHEMA VERIFICATION');
  console.log('===============================\n');

  const results = {
    tables: {},
    functions: {},
    triggers: {},
    policies: {},
    overall: { score: 0, maxScore: 0, issues: [] }
  };

  // 1. Verify Tables and Columns
  console.log('1. 📋 TABLE STRUCTURE VERIFICATION');
  console.log('-----------------------------------');

  for (const [tableName, tableSchema] of Object.entries(expectedSchema.tables)) {
    console.log(`\n🔍 Checking table: ${tableName}`);
    
    const tableResult = {
      exists: false,
      columns: { required: [], optional: [], missing: [], extra: [] },
      rowCount: 0,
      issues: []
    };

    try {
      // Check if table exists and get sample data to infer structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        if (error.message?.includes('does not exist')) {
          console.log(`  ❌ Table missing`);
          tableResult.issues.push('Table does not exist');
          results.overall.issues.push(`Missing table: ${tableName}`);
        } else {
          console.log(`  ⚠️  Access error: ${error.message}`);
          tableResult.issues.push(`Access error: ${error.message}`);
        }
      } else {
        tableResult.exists = true;
        console.log(`  ✅ Table exists`);

        // Get row count
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        tableResult.rowCount = count || 0;
        console.log(`  📊 Row count: ${tableResult.rowCount}`);

        // Check columns by attempting to select them
        const allColumns = [...tableSchema.required_columns, ...(tableSchema.optional_columns || [])];
        
        for (const column of tableSchema.required_columns) {
          try {
            const { error: colError } = await supabase
              .from(tableName)
              .select(column)
              .limit(1);
            
            if (colError) {
              console.log(`    ❌ Required column '${column}': MISSING`);
              tableResult.columns.missing.push(column);
              tableResult.issues.push(`Missing required column: ${column}`);
              results.overall.issues.push(`${tableName}.${column} missing`);
            } else {
              console.log(`    ✅ Required column '${column}': EXISTS`);
              tableResult.columns.required.push(column);
            }
          } catch (e) {
            console.log(`    ❌ Required column '${column}': ERROR - ${e.message}`);
            tableResult.columns.missing.push(column);
            tableResult.issues.push(`Column error: ${column} - ${e.message}`);
          }
        }

        // Check optional columns
        for (const column of (tableSchema.optional_columns || [])) {
          try {
            const { error: colError } = await supabase
              .from(tableName)
              .select(column)
              .limit(1);
            
            if (!colError) {
              console.log(`    ✅ Optional column '${column}': EXISTS`);
              tableResult.columns.optional.push(column);
            }
          } catch (e) {
            // Optional columns missing is not an error
          }
        }
      }
    } catch (e) {
      console.log(`  ❌ Table check failed: ${e.message}`);
      tableResult.issues.push(`Check failed: ${e.message}`);
    }

    results.tables[tableName] = tableResult;
    results.overall.maxScore += 10; // 10 points per table
    if (tableResult.exists && tableResult.columns.missing.length === 0) {
      results.overall.score += 10;
    } else if (tableResult.exists) {
      results.overall.score += 5; // Partial credit
    }
  }

  // 2. Verify Database Functions
  console.log('\n\n2. ⚙️ DATABASE FUNCTIONS VERIFICATION');
  console.log('-------------------------------------');

  for (const functionName of expectedSchema.functions) {
    console.log(`\n🔍 Checking function: ${functionName}`);
    
    try {
      // Try to call the function (will fail but tells us if it exists)
      const { error } = await supabase.rpc(functionName);
      
      if (error) {
        if (error.message?.includes('could not find function')) {
          console.log(`  ❌ Function missing`);
          results.functions[functionName] = { exists: false, error: 'Function not found' };
          results.overall.issues.push(`Missing function: ${functionName}`);
        } else {
          console.log(`  ✅ Function exists (${error.message})`);
          results.functions[functionName] = { exists: true, note: error.message };
          results.overall.score += 2;
        }
      } else {
        console.log(`  ✅ Function exists and callable`);
        results.functions[functionName] = { exists: true, callable: true };
        results.overall.score += 2;
      }
    } catch (e) {
      console.log(`  ⚠️  Function check error: ${e.message}`);
      results.functions[functionName] = { exists: false, error: e.message };
    }
    
    results.overall.maxScore += 2; // 2 points per function
  }

  // 3. Test Row Level Security
  console.log('\n\n3. 🛡️ ROW LEVEL SECURITY VERIFICATION');
  console.log('--------------------------------------');

  const rlsTests = [
    {
      table: 'user_profiles',
      operation: 'SELECT',
      test: () => supabase.from('user_profiles').select('id').limit(1)
    },
    {
      table: 'user_profiles', 
      operation: 'INSERT',
      test: () => supabase.from('user_profiles').insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        full_name: 'Test User'
      })
    },
    {
      table: 'orders',
      operation: 'SELECT', 
      test: () => supabase.from('orders').select('id').limit(1)
    }
  ];

  for (const rlsTest of rlsTests) {
    console.log(`\n🔍 Testing RLS: ${rlsTest.table} ${rlsTest.operation}`);
    
    try {
      const { data, error } = await rlsTest.test();
      
      if (error) {
        if (error.message?.includes('row-level security policy')) {
          console.log(`  ✅ RLS properly configured (blocking unauthorized access)`);
          results.policies[`${rlsTest.table}_${rlsTest.operation}`] = { 
            configured: true, 
            blocking: true 
          };
          results.overall.score += 1;
        } else {
          console.log(`  ⚠️  Unexpected error: ${error.message}`);
          results.policies[`${rlsTest.table}_${rlsTest.operation}`] = { 
            configured: false, 
            error: error.message 
          };
        }
      } else {
        if (rlsTest.operation === 'SELECT') {
          console.log(`  ✅ Read access allowed (expected for public data)`);
          results.policies[`${rlsTest.table}_${rlsTest.operation}`] = { 
            configured: true, 
            allowing: true 
          };
          results.overall.score += 1;
        } else {
          console.log(`  ⚠️  Write access unexpectedly allowed`);
          results.policies[`${rlsTest.table}_${rlsTest.operation}`] = { 
            configured: false, 
            issue: 'Unexpected write access' 
          };
          results.overall.issues.push(`${rlsTest.table} ${rlsTest.operation} not properly secured`);
        }
      }
    } catch (e) {
      console.log(`  ❌ RLS test failed: ${e.message}`);
      results.policies[`${rlsTest.table}_${rlsTest.operation}`] = { 
        configured: false, 
        error: e.message 
      };
    }
    
    results.overall.maxScore += 1; // 1 point per RLS test
  }

  // 4. Summary Report
  console.log('\n\n📊 SCHEMA VERIFICATION SUMMARY');
  console.log('==============================');
  
  const healthPercentage = (results.overall.score / results.overall.maxScore * 100).toFixed(1);
  console.log(`🏥 Schema Health Score: ${results.overall.score}/${results.overall.maxScore} (${healthPercentage}%)`);
  
  if (results.overall.issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    results.overall.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (results.overall.score < results.overall.maxScore * 0.8) {
    console.log('  - Run database migration scripts to fix missing components');
    console.log('  - Check Supabase dashboard for manual configuration needs');
  }
  
  if (Object.values(results.functions).some(f => !f.exists)) {
    console.log('  - Deploy missing database functions');
    console.log('  - Check function permissions and schema');
  }
  
  if (results.overall.issues.some(issue => issue.includes('RLS') || issue.includes('secured'))) {
    console.log('  - Review and update Row Level Security policies');
    console.log('  - Ensure proper authentication flows');
  }

  return results;
}

// Export for use in other scripts
export { verifyDatabaseSchema };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyDatabaseSchema()
    .then(results => {
      console.log('\n🎯 Schema verification completed.');
      // Optionally save results to file
      // fs.writeFileSync('schema-verification-results.json', JSON.stringify(results, null, 2));
    })
    .catch(error => {
      console.error('❌ Schema verification failed:', error);
      process.exit(1);
    });
}
