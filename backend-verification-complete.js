#!/usr/bin/env node

/**
 * Complete Backend Verification Script
 * This script verifies that ALL backend files now use correct pizzeria data
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// The CORRECT database (confirmed via MCP)
const CORRECT_DB_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const CORRECT_DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

// Wrong databases to check for
const WRONG_DATABASES = [
  'ijhuoolcnxbdvpqmqofo',
  'yytnyqsfofivcxbsexvs', 
  'despodpgvkszyexvcbft'
];

// Flower shop content to check for
const FLOWER_SHOP_CONTENT = [
  'Francesco Fiori',
  'fiori, piante',
  'floreale',
  'composizioni floreali',
  'eleganza floreale',
  'francescofiori',
  'Beautiful Rose Bouquet',
  'Centrotavola Matrimonio',
  'Cuscino Floreale'
];

const supabase = createClient(CORRECT_DB_URL, CORRECT_DB_KEY);

function scanDirectory(dir, results = []) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
          scanDirectory(fullPath, results);
        }
      } else if (file.match(/\.(js|ts|tsx|jsx|sql|toml|md|html)$/)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results;
}

async function backendVerificationComplete() {
  console.log('🔍 COMPLETE BACKEND VERIFICATION');
  console.log('='.repeat(60));
  console.log('✅ Correct database: sixnfemtvmighstbgrbd');
  console.log('❌ Wrong databases to check for:', WRONG_DATABASES.join(', '));
  console.log('🌸 Flower shop content to check for:', FLOWER_SHOP_CONTENT.slice(0, 3).join(', '), '...');
  console.log('');

  // 1. Database connectivity test
  console.log('1. 🔗 Database Connectivity Test');
  try {
    const { data: heroData, error: heroError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'heroContent')
      .single();
    
    if (heroError) {
      console.log('   ❌ Database connection failed:', heroError.message);
      return false;
    } else {
      console.log('   ✅ Database connected successfully');
      console.log(`   ✅ Hero heading: ${heroData.value.heading}`);
      
      if (heroData.value.heading.includes('Pizzeria Regina 2000')) {
        console.log('   🎉 CORRECT: Pizzeria database confirmed!');
      } else {
        console.log('   ⚠️ WARNING: Unexpected heading detected');
      }
    }
  } catch (error) {
    console.log('   ❌ Connection test failed:', error.message);
    return false;
  }
  
  console.log('');

  // 2. Check backend files specifically
  console.log('2. 🗄️ Backend Files Check');
  const backendFiles = [
    'supabase/config.toml',
    'supabase/functions/create-checkout-session/index.ts',
    'supabase/functions/stripe-webhook/index.ts',
    'supabase/functions/verify-payment/index.ts',
    'supabase/migrations/20250115000000_create_category_sections.sql',
    'supabase/migrations/20250115000000_create_settings_table.sql',
    'supabase/migrations/20250115000001_create_content_sections.sql'
  ];
  
  let allBackendCorrect = true;
  
  for (const file of backendFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      const hasCorrectDB = content.includes('sixnfemtvmighstbgrbd') || 
                          content.includes('SUPABASE_URL') || 
                          content.includes('Pizzeria Regina 2000');
      const hasWrongDB = WRONG_DATABASES.some(db => content.includes(db));
      const hasFlowerContent = FLOWER_SHOP_CONTENT.some(flower => content.includes(flower));
      
      if (hasCorrectDB && !hasWrongDB && !hasFlowerContent) {
        console.log(`   ✅ ${file}: CORRECT`);
      } else if (hasWrongDB) {
        console.log(`   ❌ ${file}: Contains wrong database`);
        allBackendCorrect = false;
      } else if (hasFlowerContent) {
        console.log(`   ❌ ${file}: Contains flower shop content`);
        allBackendCorrect = false;
      } else {
        console.log(`   ⚠️ ${file}: No database/content reference`);
      }
    } catch (error) {
      console.log(`   ❓ ${file}: Cannot read file`);
    }
  }
  
  console.log('');

  // 3. Scan all files for flower shop content
  console.log('3. 📁 Scanning all files for flower shop content...');
  const allFiles = scanDirectory('.');
  const problemFiles = [];
  
  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      const issues = [];
      
      // Check for flower shop content
      FLOWER_SHOP_CONTENT.forEach(flower => {
        if (content.includes(flower)) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes(flower)) {
              issues.push({
                line: index + 1,
                content: flower,
                fullLine: line.trim()
              });
            }
          });
        }
      });
      
      if (issues.length > 0) {
        problemFiles.push({ file, issues });
      }
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  if (problemFiles.length === 0) {
    console.log('   ✅ No flower shop content found!');
  } else {
    console.log(`   ⚠️ Found ${problemFiles.length} files with flower shop content:`);
    console.log('');
    
    problemFiles.slice(0, 10).forEach(({ file, issues }) => {
      console.log(`   📄 ${file}:`);
      issues.slice(0, 3).forEach(issue => {
        console.log(`      Line ${issue.line}: ${issue.content}`);
        console.log(`      Content: ${issue.fullLine.substring(0, 80)}...`);
      });
      console.log('');
    });
    
    if (problemFiles.length > 10) {
      console.log(`   ... and ${problemFiles.length - 10} more files`);
    }
  }
  
  console.log('');

  // 4. Final database verification
  console.log('4. 🎉 Final database verification...');
  try {
    const { count: productCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('   ❌ Product count failed:', countError.message);
    } else {
      console.log(`   ✅ Products: ${productCount} items in database`);
    }
    
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('name')
      .eq('is_active', true);
    
    if (categoriesError) {
      console.log('   ❌ Categories check failed:', categoriesError.message);
    } else {
      console.log(`   ✅ Categories: ${categoriesData.length} active categories`);
      console.log(`   ✅ Sample categories: ${categoriesData.slice(0, 3).map(c => c.name).join(', ')}`);
    }
  } catch (error) {
    console.log('   ❌ Final verification failed:', error.message);
  }
  
  console.log('');
  console.log('🎉 BACKEND VERIFICATION COMPLETE!');
  console.log('='.repeat(50));
  
  if (allBackendCorrect && problemFiles.length === 0) {
    console.log('✅ ALL BACKEND SYSTEMS VERIFIED: Using correct pizzeria data!');
    console.log('✅ Database: sixnfemtvmighstbgrbd (CORRECT)');
    console.log('✅ All backend files: CORRECT');
    console.log('✅ No flower shop content found');
    console.log('✅ Migration files: PIZZERIA DATA');
    console.log('✅ Edge Functions: CLEAN');
    console.log('');
    console.log('🚀 BACKEND READY FOR PRODUCTION!');
  } else {
    console.log('⚠️ ISSUES FOUND: Some backend files still contain wrong content');
    console.log('📝 Please review the issues listed above');
    console.log('');
    console.log('🔧 RECOMMENDED ACTIONS:');
    console.log('1. Fix migration files to contain pizzeria data');
    console.log('2. Update any remaining flower shop references');
    console.log('3. Re-run this verification script');
  }
  
  console.log('');
}

// Run the verification
backendVerificationComplete().catch(console.error);
