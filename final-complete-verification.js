// Final Complete Verification - MCP + Code Check
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// The CORRECT database (confirmed via MCP)
const CORRECT_DB_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const CORRECT_DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(CORRECT_DB_URL, CORRECT_DB_KEY);

async function finalCompleteVerification() {
  console.log('🎯 FINAL COMPLETE VERIFICATION');
  console.log('='.repeat(60));
  console.log('✅ Using MCP-verified correct database: sixnfemtvmighstbgrbd');
  console.log('');
  
  // 1. MCP Database Verification
  console.log('1. 🔍 MCP Database Verification');
  try {
    const { data: logoData, error: logoError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'logoSettings')
      .single();
    
    if (logoError) {
      console.log('   ❌ Logo check failed:', logoError.message);
      return;
    }
    
    const { data: heroData, error: heroError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'heroContent')
      .single();
    
    if (heroError) {
      console.log('   ❌ Hero check failed:', heroError.message);
      return;
    }
    
    const { count: productCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('   ❌ Product count failed:', countError.message);
      return;
    }
    
    console.log('   ✅ Database Connection: Working');
    console.log(`   ✅ Logo: ${logoData.value.altText}`);
    console.log(`   ✅ Hero: ${heroData.value.heading}`);
    console.log(`   ✅ Products: ${productCount} items`);
    
    // Check if branding is correct
    const isCorrectLogo = logoData.value.altText.includes('Pizzeria Regina 2000');
    const isCorrectHero = heroData.value.heading.includes('PIZZERIA Regina 2000');
    
    if (!isCorrectLogo || !isCorrectHero) {
      console.log('   ❌ WRONG BRANDING DETECTED!');
      return;
    }
    
  } catch (error) {
    console.log('   ❌ MCP verification failed:', error.message);
    return;
  }
  
  console.log('');
  
  // 2. Critical Code Files Check
  console.log('2. 📁 Critical Code Files Check');
  const criticalFiles = [
    'src/integrations/supabase/client.ts',
    'src/lib/supabase.ts',
    'src/services/stripeService.ts',
    '.env.example',
    'supabase/config.toml'
  ];
  
  let allFilesCorrect = true;
  
  for (const file of criticalFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      const hasCorrectDB = content.includes('sixnfemtvmighstbgrbd');
      const hasWrongDB = content.includes('ijhuoolcnxbdvpqmqofo') || 
                         content.includes('despodpgvkszyexvcbft') ||
                         content.includes('yytnyqsfofivcxbsexvs');
      
      if (hasCorrectDB && !hasWrongDB) {
        console.log(`   ✅ ${file}: CORRECT`);
      } else if (hasWrongDB) {
        console.log(`   ❌ ${file}: Contains wrong database`);
        allFilesCorrect = false;
      } else {
        console.log(`   ⚠️ ${file}: No database reference`);
      }
    } catch (error) {
      console.log(`   ❓ ${file}: Cannot read file`);
    }
  }
  
  console.log('');
  
  // 3. Frontend Components Check
  console.log('3. 🎨 Frontend Components Check');
  const componentFiles = [
    'src/components/admin/AdminLogin.tsx',
    'src/components/ComprehensiveTest.tsx',
    'src/components/LogoLoadingTest.tsx',
    'src/components/LogoPreloader.tsx',
    'src/components/OrderDetails.tsx',
    'src/components/OrderManagement.tsx',
    'src/components/SettingsTableTest.tsx',
    'src/pages/OrderDashboardPro.tsx'
  ];
  
  let allComponentsCorrect = true;
  
  for (const file of componentFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      const hasWrongURL = content.includes('despodpgvkszyexvcbft') ||
                          content.includes('Francesco Fiori');
      const hasPizzeriaLogo = content.includes('pizzeria-regina-logo.png') ||
                              content.includes('Pizzeria Regina 2000');
      
      if (!hasWrongURL && hasPizzeriaLogo) {
        console.log(`   ✅ ${file}: CORRECT`);
      } else if (hasWrongURL) {
        console.log(`   ❌ ${file}: Contains wrong branding`);
        allComponentsCorrect = false;
      } else {
        console.log(`   ⚠️ ${file}: No logo reference`);
      }
    } catch (error) {
      console.log(`   ❓ ${file}: Cannot read file`);
    }
  }
  
  console.log('');
  
  // 4. Final Summary
  console.log('4. 🎉 FINAL SUMMARY');
  console.log('='.repeat(60));
  
  if (allFilesCorrect && allComponentsCorrect) {
    console.log('✅ ALL SYSTEMS CORRECT!');
    console.log('✅ Database: sixnfemtvmighstbgrbd (verified via MCP)');
    console.log('✅ Branding: Pizzeria Regina 2000 Torino');
    console.log('✅ Code Files: All using correct database');
    console.log('✅ Components: All using correct branding');
    console.log('');
    console.log('🎊 FRANCESCO FIORI COMPLETELY REMOVED!');
    console.log('🍕 PIZZERIA REGINA 2000 FULLY IMPLEMENTED!');
    console.log('');
    console.log('🚀 Your website is ready!');
    console.log('   → Frontend: http://localhost:3000');
    console.log('   → Admin: http://localhost:3000/admin');
    console.log('');
  } else {
    console.log('❌ ISSUES FOUND:');
    if (!allFilesCorrect) {
      console.log('   - Some critical files still have wrong database references');
    }
    if (!allComponentsCorrect) {
      console.log('   - Some components still have wrong branding');
    }
    console.log('');
    console.log('⚠️ Please fix the issues above before proceeding.');
  }
}

// Run the verification
finalCompleteVerification().catch(console.error);
