import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://sixnfemtvmighstbgrbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendProducts() {
  try {
    console.log('🧪 Testing frontend product loading...');

    // Test 1: Check categories
    console.log('\n📂 Testing categories...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (catError) {
      console.error('❌ Categories error:', catError);
      return;
    }

    console.log('✅ Categories found:', categories.length);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    // Test 2: Check products with categories (same query as frontend)
    console.log('\n🍕 Testing products with categories...');
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (productsError) {
      console.error('❌ Products error:', productsError);
      return;
    }

    console.log('✅ Products found:', productsData.length);

    // Group products by category (same logic as frontend)
    const groupedProducts = {};
    productsData.forEach((product) => {
      const categorySlug = product.categories?.slug || 'uncategorized';
      if (!groupedProducts[categorySlug]) {
        groupedProducts[categorySlug] = [];
      }
      groupedProducts[categorySlug].push(product);
    });

    console.log('\n📊 Products by category:');
    Object.keys(groupedProducts).forEach(slug => {
      const products = groupedProducts[slug];
      console.log(`   ${slug}: ${products.length} products`);
      
      // Show first few products in each category
      products.slice(0, 3).forEach(product => {
        console.log(`     - ${product.name} (€${product.price})`);
      });
      if (products.length > 3) {
        console.log(`     ... and ${products.length - 3} more`);
      }
    });

    // Test 3: Check specific products
    console.log('\n🎯 Testing specific key products...');
    const keyProducts = ['Pizza Regina', 'Margherita', 'Marinara', 'Degustazione Regina 2000'];
    
    for (const productName of keyProducts) {
      const product = productsData.find(p => p.name === productName);
      if (product) {
        console.log(`✅ ${productName}: €${product.price} - ${product.description.substring(0, 50)}...`);
      } else {
        console.log(`❌ ${productName}: NOT FOUND`);
      }
    }

    // Test 4: Check category order (same as frontend)
    console.log('\n🔄 Testing category ordering...');
    const categoryOrder = ['semplici', 'speciali', 'extra'];
    const allCategoriesWithProducts = Object.keys(groupedProducts).filter(slug => 
      groupedProducts[slug] && groupedProducts[slug].length > 0
    );

    const sortedCategories = [
      ...categoryOrder.filter(slug => allCategoriesWithProducts.includes(slug)),
      ...allCategoriesWithProducts.filter(slug => !categoryOrder.includes(slug)).sort()
    ];

    console.log('Category display order:', sortedCategories);

    // Test 5: Check if frontend would show products
    console.log('\n🖥️ Frontend display simulation...');
    if (sortedCategories.length === 0) {
      console.log('❌ Frontend would show: "Nessun prodotto disponibile al momento."');
    } else {
      console.log('✅ Frontend would show categories:');
      sortedCategories.forEach((categorySlug, index) => {
        const categoryProducts = groupedProducts[categorySlug] || [];
        const displayName = getCategoryDisplayName(categorySlug);
        console.log(`   ${index + 1}. ${displayName} (${categoryProducts.length} products)`);
      });
    }

    console.log('\n🎉 Frontend product test completed successfully!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Helper function to match frontend logic
function getCategoryDisplayName(categorySlug) {
  switch (categorySlug) {
    case 'semplici':
      return 'SEMPLICI - Classic Pizzas & Focacce';
    case 'speciali':
      return 'SPECIALI - Signature & Gourmet';
    case 'extra':
      return 'EXTRA - Toppings';
    default:
      return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace('-', ' ');
  }
}

// Run the test
testFrontendProducts();
