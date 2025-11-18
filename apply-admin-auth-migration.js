// Apply Admin Authentication Migration
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔐 APPLYING ADMIN AUTHENTICATION MIGRATION');
console.log('=========================================');

async function applyAdminAuthMigration() {
  try {
    console.log('\n1. 📄 Reading migration file...');
    
    const migrationSQL = readFileSync('./supabase/migrations/20250117000001_enhance_admin_authentication.sql', 'utf8');
    console.log('✅ Migration file loaded successfully');
    
    console.log('\n2. 🗄️ Applying database changes...');
    
    // Split SQL into individual commands
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));
    
    console.log(`   Found ${sqlCommands.length} SQL commands to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      try {
        console.log(`   Executing command ${i + 1}/${sqlCommands.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.log(`   ❌ Command ${i + 1} failed: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Command ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (e) {
        console.log(`   ❌ Command ${i + 1} error: ${e.message}`);
        errorCount++;
      }
    }
    
    console.log('\n3. 📊 Migration Results');
    console.log('=======================');
    console.log(`✅ Successful commands: ${successCount}`);
    console.log(`❌ Failed commands: ${errorCount}`);
    console.log(`📊 Total commands: ${sqlCommands.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Admin authentication migration completed successfully!');
    } else {
      console.log('\n⚠️ Migration completed with some errors. Manual review may be needed.');
    }
    
    console.log('\n4. 🧪 Testing new admin features...');
    
    // Test admin_sessions table
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('   ❌ admin_sessions table test failed:', error.message);
      } else {
        console.log('   ✅ admin_sessions table is working');
      }
    } catch (e) {
      console.log('   ❌ admin_sessions table test error:', e.message);
    }
    
    // Test admin_activity_log table
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('   ❌ admin_activity_log table test failed:', error.message);
      } else {
        console.log('   ✅ admin_activity_log table is working');
      }
    } catch (e) {
      console.log('   ❌ admin_activity_log table test error:', e.message);
    }
    
    // Test admin settings
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['adminSecuritySettings', 'adminUISettings']);
      
      if (error) {
        console.log('   ❌ Admin settings test failed:', error.message);
      } else {
        console.log(`   ✅ Admin settings loaded: ${data?.length || 0} settings found`);
      }
    } catch (e) {
      console.log('   ❌ Admin settings test error:', e.message);
    }
    
    console.log('\n🏁 Admin authentication migration process complete!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyAdminAuthMigration();
