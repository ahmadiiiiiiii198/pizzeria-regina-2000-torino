// Fix Pizzeria Database - Replace Francesco Fiori with Pizzeria Regina 2000
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixPizzeriaDatabase() {
  console.log('🍕 FIXING PIZZERIA DATABASE - Removing Francesco Fiori branding');
  console.log('='.repeat(60));
  
  try {
    // 1. Check current settings
    console.log('1. 🔍 Checking current database settings...');
    const { data: currentSettings, error: fetchError } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['logoSettings', 'heroContent']);
    
    if (fetchError) {
      console.error('❌ Error fetching settings:', fetchError);
      return;
    }
    
    console.log('📊 Current problematic settings found:');
    currentSettings?.forEach(setting => {
      console.log(`   ${setting.key}:`, JSON.stringify(setting.value, null, 2));
    });
    console.log('');
    
    // 2. Update logoSettings with correct pizzeria logo
    console.log('2. 🖼️ Updating logo settings...');
    const correctLogoSettings = {
      logoUrl: "/pizzeria-regina-logo.png",
      altText: "Pizzeria Regina 2000 Torino Logo"
    };
    
    const { data: logoUpdate, error: logoError } = await supabase
      .from('settings')
      .upsert({
        key: 'logoSettings',
        value: correctLogoSettings,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (logoError) {
      console.error('❌ Failed to update logo settings:', logoError);
    } else {
      console.log('✅ Logo settings updated successfully!');
      console.log('   New logo:', correctLogoSettings.logoUrl);
    }
    
    // 3. Update heroContent with correct pizzeria content
    console.log('3. 🏠 Updating hero content...');
    const correctHeroContent = {
      heading: "🍕 PIZZERIA Regina 2000",
      subheading: "Autentica pizza napoletana preparata con ingredienti freschi e forno a legna tradizionale nel cuore di Torino",
      backgroundImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    };
    
    const { data: heroUpdate, error: heroError } = await supabase
      .from('settings')
      .upsert({
        key: 'heroContent',
        value: correctHeroContent,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (heroError) {
      console.error('❌ Failed to update hero content:', heroError);
    } else {
      console.log('✅ Hero content updated successfully!');
      console.log('   New heading:', correctHeroContent.heading);
    }
    
    // 4. Verify the changes
    console.log('4. ✅ Verifying changes...');
    const { data: verifySettings, error: verifyError } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['logoSettings', 'heroContent']);
    
    if (verifyError) {
      console.error('❌ Error verifying changes:', verifyError);
    } else {
      console.log('📊 Updated settings:');
      verifySettings?.forEach(setting => {
        console.log(`   ✅ ${setting.key}:`);
        if (setting.key === 'logoSettings') {
          console.log(`      Logo URL: ${setting.value.logoUrl}`);
          console.log(`      Alt Text: ${setting.value.altText}`);
        } else if (setting.key === 'heroContent') {
          console.log(`      Heading: ${setting.value.heading}`);
          console.log(`      Subheading: ${setting.value.subheading.substring(0, 50)}...`);
        }
      });
    }
    
    console.log('');
    console.log('🎉 DATABASE FIX COMPLETED!');
    console.log('='.repeat(60));
    console.log('✅ Francesco Fiori branding has been replaced with Pizzeria Regina 2000');
    console.log('✅ Logo settings updated to use pizzeria logo');
    console.log('✅ Hero content updated with pizza-themed content');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Refresh your website: http://localhost:3000');
    console.log('2. Check the admin panel: http://localhost:3000/admin');
    console.log('3. The logo should now show the correct pizzeria branding');
    console.log('');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the fix
fixPizzeriaDatabase().catch(console.error);
