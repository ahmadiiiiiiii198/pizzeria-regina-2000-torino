import { createClient } from '@supabase/supabase-js';

// Correct Supabase configuration for Pizzeria Regina 2000
const supabaseUrl = 'https://sixnfemtvmighstbgrbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDatabase() {
  console.log('🔍 COMPREHENSIVE DATABASE ANALYSIS');
  console.log('=====================================\n');
  
  const tables = ['products', 'categories', 'orders', 'order_items', 'settings'];
  
  for (const tableName of tables) {
    console.log(`📋 TABLE: ${tableName.toUpperCase()}`);
    console.log('-'.repeat(40));
    
    try {
      // Try to get one record to see the structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        console.log(`   Code: ${error.code}`);
        console.log(`   Details: ${error.details}`);
        console.log(`   Hint: ${error.hint}`);
      } else {
        console.log(`✅ Table exists`);
        console.log(`📊 Records found: ${data.length}`);
        
        if (data.length > 0) {
          console.log(`🔑 Columns: ${Object.keys(data[0]).join(', ')}`);
          console.log(`📝 Sample data structure:`);
          Object.entries(data[0]).forEach(([key, value]) => {
            const type = value === null ? 'null' : typeof value;
            const preview = value === null ? 'null' : 
                          typeof value === 'string' ? `"${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"` :
                          JSON.stringify(value);
            console.log(`   ${key}: ${type} = ${preview}`);
          });
        } else {
          console.log(`📝 No data in table, trying to insert test record to see structure...`);
          
          // Try a minimal insert to see what columns are required/available
          if (tableName === 'products') {
            const { error: insertError } = await supabase
              .from('products')
              .insert({ name: 'TEST_STRUCTURE_CHECK' })
              .select();
            
            if (insertError) {
              console.log(`🔍 Insert error reveals structure: ${insertError.message}`);
            }
          }
        }
      }
    } catch (err) {
      console.log(`💥 Unexpected error: ${err.message}`);
    }
    
    console.log('\n');
  }
  
  // Try to get database schema information
  console.log('🏗️  SCHEMA INFORMATION');
  console.log('-'.repeat(40));
  
  try {
    const { data, error } = await supabase
      .rpc('get_schema_info')
      .select();
    
    if (error) {
      console.log(`❌ Schema RPC not available: ${error.message}`);
    } else {
      console.log(`✅ Schema info:`, data);
    }
  } catch (err) {
    console.log(`💥 Schema query failed: ${err.message}`);
  }
  
  console.log('\n🎯 ANALYSIS COMPLETE');
}

analyzeDatabase().catch(console.error);
