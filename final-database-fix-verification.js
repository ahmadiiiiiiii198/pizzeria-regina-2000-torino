#!/usr/bin/env node

/**
 * Final Database Fix Verification Script
 * This script verifies that ALL files now use the correct pizzeria database
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
      } else if (file.match(/\.(js|ts|tsx|jsx|toml|md|env)$/)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results;
}

async function finalDatabaseFixVerification() {
  console.log('🎯 FINAL DATABASE FIX VERIFICATION');
  console.log('='.repeat(60));
  console.log('✅ Correct database: sixnfemtvmighstbgrbd');
  console.log('❌ Wrong databases to check for:', WRONG_DATABASES.join(', '));
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

  // 2. Scan all files for wrong database references
  console.log('2. 📁 Scanning all files for wrong database references...');
  const allFiles = scanDirectory('.');
  const problemFiles = [];
  
  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      const issues = [];
      
      // Check for wrong databases
      WRONG_DATABASES.forEach(db => {
        if (content.includes(db)) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes(db)) {
              issues.push({
                line: index + 1,
                database: db,
                content: line.trim()
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
    console.log('   ✅ No wrong database references found!');
  } else {
    console.log(`   ⚠️ Found ${problemFiles.length} files with wrong database references:`);
    console.log('');
    
    problemFiles.forEach(({ file, issues }) => {
      console.log(`   📄 ${file}:`);
      issues.forEach(issue => {
        console.log(`      Line ${issue.line}: ${issue.database}`);
        console.log(`      Content: ${issue.content.substring(0, 80)}...`);
      });
      console.log('');
    });
  }
  
  console.log('');

  // 3. Check critical application files specifically
  console.log('3. 🎯 Checking critical application files...');
  const criticalFiles = [
    'src/integrations/supabase/client.ts',
    'src/lib/supabase.ts',
    '.env',
    'setup-new-supabase.js',
    'test-new-supabase.js',
    'set-maximum-volume.js',
    'fix-image-upload-complete.js',
    'fix-database-schema.js',
    'mcp-database-check.js',
    'analyze-database.js'
  ];
  
  let allCriticalCorrect = true;
  
  for (const file of criticalFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      const hasCorrect = content.includes('sixnfemtvmighstbgrbd');
      const hasWrong = WRONG_DATABASES.some(db => content.includes(db));
      
      if (hasCorrect && !hasWrong) {
        console.log(`   ✅ ${file}: CORRECT`);
      } else if (hasWrong) {
        console.log(`   ❌ ${file}: Contains wrong database reference`);
        allCriticalCorrect = false;
      } else {
        console.log(`   ⚠️ ${file}: No database reference found`);
      }
    } catch (error) {
      console.log(`   ❓ ${file}: File not found or unreadable`);
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
  console.log('🎉 VERIFICATION COMPLETE!');
  console.log('='.repeat(50));
  
  if (allCriticalCorrect && problemFiles.length === 0) {
    console.log('✅ ALL SYSTEMS VERIFIED: Using correct pizzeria database!');
    console.log('✅ Database: sixnfemtvmighstbgrbd (CORRECT)');
    console.log('✅ All critical files: CORRECT');
    console.log('✅ No wrong database references found');
    console.log('');
    console.log('🚀 READY FOR PRODUCTION!');
  } else {
    console.log('⚠️ ISSUES FOUND: Some files still contain wrong database references');
    console.log('📝 Please review the issues listed above');
  }
  
  console.log('');
}

// Run the verification
finalDatabaseFixVerification().catch(console.error);
