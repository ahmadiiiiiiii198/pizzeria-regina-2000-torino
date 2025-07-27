// Update Pizzeria Regina 2000 Menu from Real Menu
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updatePizzeriaMenu() {
  console.log('🍕 Updating Pizzeria Regina 2000 Menu...');
  
  try {
    // Step 1: Delete all existing products
    console.log('🗑️ Deleting all existing products...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.error('❌ Error deleting products:', deleteError.message);
      return false;
    }
    console.log('✅ All products deleted');

    // Step 2: Get category IDs
    console.log('📋 Getting categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('❌ Error getting categories:', categoriesError.message);
      return false;
    }

    const sempliciId = categories.find(c => c.slug === 'pizze-classiche')?.id;
    const specialiId = categories.find(c => c.slug === 'pizze-speciali')?.id;

    if (!sempliciId || !specialiId) {
      console.error('❌ Required categories not found');
      return false;
    }

    // Step 3: Create products from the real menu
    console.log('📝 Creating products from Pizzeria Regina 2000 menu...');
    
    const menuProducts = [
      // SEMPLICI (Pizze Classiche)
      {
        name: 'Marinara',
        description: 'Pomodoro, aglio, origano',
        price: 6.00,
        slug: 'marinara',
        category_id: sempliciId,
        is_active: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Margherita',
        description: 'Pomodoro, mozzarella',
        price: 6.00,
        slug: 'margherita',
        category_id: sempliciId,
        is_active: true,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Napoli',
        description: 'Pomodoro, mozzarella, acciughe, origano',
        price: 6.50,
        slug: 'napoli',
        category_id: sempliciId,
        is_active: true,
        sort_order: 3,
        image_url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Funghi',
        description: 'Pomodoro, mozzarella, funghi',
        price: 6.50,
        slug: 'funghi',
        category_id: sempliciId,
        is_active: true,
        sort_order: 4,
        image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Prosciutto',
        description: 'Pomodoro, mozzarella, prosciutto',
        price: 7.00,
        slug: 'prosciutto',
        category_id: sempliciId,
        is_active: true,
        sort_order: 5,
        image_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Bianca',
        description: 'Mozzarella, olio, prosciutto',
        price: 7.00,
        slug: 'bianca',
        category_id: sempliciId,
        is_active: true,
        sort_order: 6,
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Rustica',
        description: 'Pomodoro, mozzarella, salsiccia',
        price: 7.00,
        slug: 'rustica',
        category_id: sempliciId,
        is_active: true,
        sort_order: 7,
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Capricciosa',
        description: 'Pomodoro, mozzarella, prosciutto, funghi, carciofi, olive',
        price: 8.00,
        slug: 'capricciosa',
        category_id: sempliciId,
        is_active: true,
        sort_order: 8,
        image_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Quattro Formaggi',
        description: 'Pomodoro, mozzarella, fontina, gorgonzola, parmigiano',
        price: 7.50,
        slug: 'quattro-formaggi',
        category_id: sempliciId,
        is_active: true,
        sort_order: 9,
        image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Diavola',
        description: 'Pomodoro, mozzarella, salame piccante',
        price: 6.50,
        slug: 'diavola',
        category_id: sempliciId,
        is_active: true,
        sort_order: 10,
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Calzone',
        description: 'Pomodoro, mozzarella, prosciutto',
        price: 6.50,
        slug: 'calzone',
        category_id: sempliciId,
        is_active: true,
        sort_order: 11,
        image_url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Romana',
        description: 'Pomodoro, mozzarella, acciughe, capperi',
        price: 7.00,
        slug: 'romana',
        category_id: sempliciId,
        is_active: true,
        sort_order: 12,
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Salsiccia',
        description: 'Pomodoro, mozzarella, salsiccia',
        price: 7.00,
        slug: 'salsiccia',
        category_id: sempliciId,
        is_active: true,
        sort_order: 13,
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Prosciutto e Funghi',
        description: 'Pomodoro, mozzarella, prosciutto, funghi',
        price: 7.50,
        slug: 'prosciutto-e-funghi',
        category_id: sempliciId,
        is_active: true,
        sort_order: 14,
        image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Norma',
        description: 'Pomodoro, mozzarella, melanzane, ricotta',
        price: 7.50,
        slug: 'norma',
        category_id: sempliciId,
        is_active: true,
        sort_order: 15,
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Vegetariana',
        description: 'Pomodoro, mozzarella, verdure grigliate, rucola',
        price: 8.00,
        slug: 'vegetariana',
        category_id: sempliciId,
        is_active: true,
        sort_order: 16,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Focaccia al Crudo',
        description: 'Focaccia, prosciutto crudo, rucola',
        price: 6.50,
        slug: 'focaccia-al-crudo',
        category_id: sempliciId,
        is_active: true,
        sort_order: 17,
        image_url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Focaccia allo Speck',
        description: 'Focaccia, speck, stracchino',
        price: 6.50,
        slug: 'focaccia-allo-speck',
        category_id: sempliciId,
        is_active: true,
        sort_order: 18,
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Focaccia Primavera',
        description: 'Focaccia, pomodorini, mozzarella, rucola',
        price: 6.50,
        slug: 'focaccia-primavera',
        category_id: sempliciId,
        is_active: true,
        sort_order: 19,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        stock_quantity: 100
      },

      // SPECIALI (Pizze Speciali)
      {
        name: 'Pizza Regina',
        description: 'Crema di porcini, mozzarella, prosciutto, rucola',
        price: 9.00,
        slug: 'pizza-regina',
        category_id: specialiId,
        is_active: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Patanegra',
        description: 'Pomodoro, mozzarella, salame, mascarpone, champignon',
        price: 7.50,
        slug: 'patanegra',
        category_id: specialiId,
        is_active: true,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Tonno',
        description: 'Pomodoro, mozzarella, tonno, cipolla',
        price: 8.00,
        slug: 'tonno',
        category_id: specialiId,
        is_active: true,
        sort_order: 3,
        image_url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Torinese',
        description: 'Pomodoro, mozzarella, salsiccia, peperoni',
        price: 7.50,
        slug: 'torinese',
        category_id: specialiId,
        is_active: true,
        sort_order: 4,
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Quattro Stagioni',
        description: 'Pomodoro, mozzarella, prosciutto, funghi, carciofi, olive',
        price: 8.50,
        slug: 'quattro-stagioni',
        category_id: specialiId,
        is_active: true,
        sort_order: 5,
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Boscaiola',
        description: 'Pomodoro, mozzarella, salsiccia, funghi porcini',
        price: 8.00,
        slug: 'boscaiola',
        category_id: specialiId,
        is_active: true,
        sort_order: 6,
        image_url: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Parmigiana',
        description: 'Pomodoro, mozzarella, melanzane, parmigiano',
        price: 8.00,
        slug: 'parmigiana',
        category_id: specialiId,
        is_active: true,
        sort_order: 7,
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Chèvre',
        description: 'Pomodoro, mozzarella, caprino, bresaola',
        price: 8.00,
        slug: 'chevre',
        category_id: specialiId,
        is_active: true,
        sort_order: 8,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        stock_quantity: 100
      },
      {
        name: 'Petite',
        description: 'Pomodoro, mozzarella, prosciutto, olive',
        price: 8.00,
        slug: 'petite',
        category_id: specialiId,
        is_active: true,
        sort_order: 9,
        image_url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&h=600&fit=crop',
        stock_quantity: 100
      }
    ];

    // Insert products in batches to avoid timeout
    const batchSize = 10;
    let totalCreated = 0;
    
    for (let i = 0; i < menuProducts.length; i += batchSize) {
      const batch = menuProducts.slice(i, i + batchSize);
      
      const { data: createdProducts, error: insertError } = await supabase
        .from('products')
        .insert(batch)
        .select();
      
      if (insertError) {
        console.error(`❌ Error creating batch ${Math.floor(i/batchSize) + 1}:`, insertError.message);
        return false;
      }
      
      totalCreated += createdProducts.length;
      console.log(`✅ Created batch ${Math.floor(i/batchSize) + 1}: ${createdProducts.length} products`);
    }
    
    console.log(`🎉 Successfully created ${totalCreated} products from Pizzeria Regina 2000 menu!`);
    console.log('💡 You can now view the authentic menu on the website');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the update
updatePizzeriaMenu().then(success => {
  if (success) {
    console.log('🍕 Menu update complete! Check your website now.');
  } else {
    console.log('❌ Menu update failed. Check the errors above.');
  }
  process.exit(success ? 0 : 1);
});
