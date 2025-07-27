/**
 * Script to enable stock management and verify product stock settings
 */

import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in the client
const supabaseUrl = "https://sixnfemtvmighstbgrbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndEnableStockManagement() {
  console.log('🔍 Checking current stock management settings...\n');

  try {
    // Check current stock management setting
    const { data: currentSettings, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .eq('key', 'stock_management_enabled');

    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError);
      return;
    }

    let isCurrentlyEnabled = false;
    if (currentSettings && currentSettings.length > 0) {
      try {
        const parsed = JSON.parse(currentSettings[0].value);
        isCurrentlyEnabled = parsed === true || parsed === 'true';
      } catch {
        isCurrentlyEnabled = currentSettings[0].value === 'true';
      }
    }

    console.log(`📊 Current stock management status: ${isCurrentlyEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);

    if (!isCurrentlyEnabled) {
      console.log('\n🔧 Enabling stock management...');
      
      // Enable stock management
      const { error: updateError } = await supabase
        .from('settings')
        .upsert({
          key: 'stock_management_enabled',
          value: JSON.stringify(true)
        });

      if (updateError) {
        console.error('❌ Error enabling stock management:', updateError);
        return;
      }

      console.log('✅ Stock management has been ENABLED!');
    } else {
      console.log('✅ Stock management is already enabled');
    }

    // Check products with zero stock
    console.log('\n🔍 Checking products with zero stock...');
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, is_active')
      .eq('is_active', true)
      .order('name');

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }

    const zeroStockProducts = products.filter(p => p.stock_quantity === 0);
    const availableProducts = products.filter(p => p.stock_quantity > 0);

    console.log(`\n📊 Product Stock Summary:`);
    console.log(`   Total active products: ${products.length}`);
    console.log(`   Products with stock > 0: ${availableProducts.length}`);
    console.log(`   Products with zero stock: ${zeroStockProducts.length}`);

    if (zeroStockProducts.length > 0) {
      console.log('\n❌ Products with ZERO stock (should be unavailable):');
      zeroStockProducts.forEach(product => {
        console.log(`   • ${product.name} (Stock: ${product.stock_quantity})`);
      });
    }

    if (availableProducts.length > 0) {
      console.log('\n✅ Products with stock available:');
      availableProducts.slice(0, 5).forEach(product => {
        console.log(`   • ${product.name} (Stock: ${product.stock_quantity})`);
      });
      if (availableProducts.length > 5) {
        console.log(`   ... and ${availableProducts.length - 5} more`);
      }
    }

    console.log('\n🎯 SOLUTION:');
    console.log('Stock management is now enabled. Products with stock_quantity = 0 should now appear as unavailable.');
    console.log('Please refresh your website to see the changes take effect.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
checkAndEnableStockManagement();
