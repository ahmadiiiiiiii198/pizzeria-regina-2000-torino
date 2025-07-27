import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://sixnfemtvmighstbgrbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(supabaseUrl, supabaseKey);

// Pizza categories
const categories = [
  {
    name: 'SEMPLICI',
    slug: 'semplici',
    description: 'Classic Pizzas & Focacce - Le nostre pizze tradizionali e focacce',
    sort_order: 1,
    is_active: true
  },
  {
    name: 'SPECIALI',
    slug: 'speciali', 
    description: 'Signature & Gourmet - Creazioni speciali della casa',
    sort_order: 2,
    is_active: true
  },
  {
    name: 'EXTRA',
    slug: 'extra',
    description: 'Extra Toppings - Aggiunte per personalizzare la tua pizza',
    sort_order: 3,
    is_active: true
  }
];

// SEMPLICI products (Classic Pizzas & Focacce)
const sempliciProducts = [
  { name: 'Marinara', price: 6.00, description: 'doppio pomodoro, aglio, olio, origano' },
  { name: 'Margherita', price: 6.00, description: 'pomodoro, mozzarella, basilico' },
  { name: 'Napoli', price: 6.50, description: 'pomodoro, mozzarella, acciughe, origano' },
  { name: 'Funghi', price: 6.50, description: 'pomodoro, mozzarella, funghi, origano' },
  { name: 'Prosciutto', price: 7.00, description: 'pomodoro, mozzarella, prosciutto' },
  { name: 'Biancaneve', price: 6.00, description: 'mozzarella, olio, parmigiano' },
  { name: 'Diavola', price: 7.00, description: 'pomodoro, mozzarella, ventricina' },
  { name: 'Capricciosa', price: 8.00, description: 'pomodoro, mozzarella, prosciutto, funghi, olive, carciofi, würstel' },
  { name: 'Formaggi', price: 7.00, description: 'pomodoro, mozzarella, fontina, gorgonzola, brie, parmigiano' },
  { name: '4 Stagioni', price: 7.50, description: 'pomodoro, mozzarella, prosciutto, funghi, olive, carciofi' },
  { name: 'Greca', price: 6.50, description: 'pomodoro, mozzarella, olive, origano' },
  { name: 'Calzone', price: 6.50, description: 'mozzarella, prosciutto, parmigiano, olio, origano' },
  { name: 'Romana', price: 7.00, description: 'pomodoro, mozzarella, acciughe, capperi' },
  { name: 'Pugliese', price: 7.00, description: 'pomodoro, mozzarella, cipolle, olive, olio, origano' },
  { name: 'Prosciutto e Funghi', price: 7.50, description: 'pomodoro, mozzarella, prosciutto, funghi' },
  { name: 'Norma', price: 7.50, description: 'pomodoro, mozzarella, melanzane, ricotta' },
  { name: 'Vegetariana', price: 8.00, description: 'verdure al forno' },
  { name: 'Focaccia al Crudo', price: 6.50, description: 'prosciutto crudo, olio, origano' },
  { name: 'Focaccia allo Speck', price: 6.50, description: 'speck, olio, origano' },
  { name: 'Focaccia Primavera', price: 6.50, description: 'mozzarella, rucola, pomodorini freschi, olive' },
  { name: 'Degustazione Regina 2000', price: 14.00, description: 'Dall\'antipasto al dolce con focacce farcite a sorpresa (minimo 2 persone)' }
];

// SPECIALI products (Signature & Gourmet)
const specialiProducts = [
  { name: 'Pizza Regina', price: 9.00, description: 'crema di porcini, mozzarella, prosciutto cotto, funghi porcini, ventricina, parmigiano' },
  { name: 'Salsiccia e Melanzane', price: 7.50, description: 'pomodoro, mozzarella, salsiccia, melanzane, parmigiano' },
  { name: 'Chef', price: 8.00, description: 'pomodoro, mozzarella, prosciutto, funghi, panna' },
  { name: 'Torinese', price: 7.50, description: 'mozzarella, acciughe, peperoni, parmigiano' },
  { name: 'Partenopea', price: 7.50, description: 'mozzarella, friarielli, salsiccia, parmigiano' },
  { name: 'Boscaiola', price: 9.00, description: 'pomodoro, mozzarella, salsiccia, funghi porcini, champignon, parmigiano' },
  { name: 'Parmigiana', price: 9.00, description: 'pomodoro, mozzarella, friarielli, melanzane, ventricina, peperoni, prosciutto, parmigiano' },
  { name: 'Chèvre', price: 9.00, description: 'pomodoro, mozzarella, caprino, bresaola, pomodoro fresco' },
  { name: 'Petite', price: 9.00, description: 'pomodoro, mozzarella, prosciutto, olive, carciofi, funghi, tonno' },
  { name: 'Peperlizia', price: 7.50, description: 'pomodoro, mozzarella, ricotta fresca, peperoni' },
  { name: 'Carciofi', price: 7.50, description: 'crema di carciofi, mozzarella, carciofini, parmigiano' },
  { name: 'Piemontese', price: 7.50, description: 'crema di noci, mozzarella, gorgonzola, pere, parmigiano' },
  { name: 'Messicana', price: 9.00, description: 'fagioli messicani, mozzarella, pancetta, cipolla, pomodoro, parmigiano' },
  { name: 'Filadelfia', price: 7.50, description: 'pomodoro fresco, mozzarella, filadelfia, olive, mais, rucola' },
  { name: 'Pizza al Metro (fino a 5 gusti)', price: 7.50, description: 'pomodoro fresco, mozzarella, brie, olio, prosciutto crudo, origano' },
  { name: 'Fagotto al Crudo', price: 7.50, description: 'prosciutto crudo, mozzarella, brie, melanzane, speck, olio, origano' },
  { name: 'Fagotto allo Speck', price: 7.50, description: 'pomodoro, mozzarella, speck, brie, melanzane, olio, origano' },
  { name: 'Schiacciata Catanese', price: 14.00, description: 'ingredienti a sorpresa, chiedi allo chef' },
  { name: 'Schiacciata Campagnola', price: 14.00, description: 'ingredienti a sorpresa, chiedi allo chef' },
  { name: 'Schiacciata Sacense', price: 9.00, description: 'ingredienti a sorpresa, chiedi allo chef' },
  { name: 'Meraviglia', price: 9.00, description: 'crema di porcini al tartufo, mozzarella, bresaola, scaglie, uovo di quaglia' },
  { name: 'Imperiale', price: 8.00, description: 'crema di carciofi, mozzarella, uova di quaglia, rucola' },
  { name: 'Gustosa', price: 9.00, description: 'mozzarella, gorgonzola, peperoni, cime di rapa' },
  { name: 'Praga', price: 9.00, description: 'mozzarella, prosciutto crudo, pomodorini freschi, rucola, parmigiano' },
  { name: 'Trevigiana', price: 8.00, description: 'mozzarella, radicchio trevigiana, gorgonzola, pomodori freschi' },
  { name: 'Student Special', price: 7.00, description: 'Margherita + bibita (solo a pranzo, riservato agli studenti)' }
];

// EXTRA products (Toppings)
const extraProducts = [
  { name: 'Affettati', price: 1.50, description: 'Aggiungi affettati alla tua pizza' },
  { name: 'Bresaola', price: 2.50, description: 'Aggiungi bresaola alla tua pizza' },
  { name: 'Crudo', price: 2.00, description: 'Aggiungi prosciutto crudo alla tua pizza' },
  { name: 'Bufala', price: 2.00, description: 'Aggiungi mozzarella di bufala alla tua pizza' },
  { name: 'Burrata', price: 2.00, description: 'Aggiungi burrata alla tua pizza' },
  { name: 'Porcini', price: 2.00, description: 'Aggiungi funghi porcini alla tua pizza' }
];

async function updatePizzeriaProducts() {
  try {
    console.log('🍕 Starting pizzeria products update...');

    // Step 1: Create/Update Categories
    console.log('📂 Creating categories...');
    
    // Delete existing categories first
    const { error: deleteCatError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteCatError) {
      console.log('Note: Could not delete existing categories:', deleteCatError.message);
    }

    // Insert new categories
    const { data: insertedCategories, error: catError } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (catError) {
      console.error('❌ Error creating categories:', catError);
      return;
    }

    console.log('✅ Categories created successfully:', insertedCategories.length);

    // Create category mapping
    const categoryMap = {};
    insertedCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Step 2: Clear existing products
    console.log('🗑️ Clearing existing products...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('Note: Could not delete existing products:', deleteError.message);
    }

    // Step 3: Insert SEMPLICI products
    console.log('🍕 Adding SEMPLICI products...');
    const sempliciProductsWithCategory = sempliciProducts.map((product, index) => ({
      ...product,
      category_id: categoryMap['semplici'],
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      is_active: true,
      is_featured: index < 5, // First 5 are featured
      sort_order: index + 1,
      stock_quantity: 100,
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }));

    const { data: sempliciData, error: sempliciError } = await supabase
      .from('products')
      .insert(sempliciProductsWithCategory)
      .select();

    if (sempliciError) {
      console.error('❌ Error adding SEMPLICI products:', sempliciError);
      return;
    }

    console.log('✅ SEMPLICI products added:', sempliciData.length);

    // Step 4: Insert SPECIALI products
    console.log('🌟 Adding SPECIALI products...');
    const specialiProductsWithCategory = specialiProducts.map((product, index) => ({
      ...product,
      category_id: categoryMap['speciali'],
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      is_active: true,
      is_featured: index < 3, // First 3 are featured
      sort_order: index + 1,
      stock_quantity: 100,
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }));

    const { data: specialiData, error: specialiError } = await supabase
      .from('products')
      .insert(specialiProductsWithCategory)
      .select();

    if (specialiError) {
      console.error('❌ Error adding SPECIALI products:', specialiError);
      return;
    }

    console.log('✅ SPECIALI products added:', specialiData.length);

    // Step 5: Insert EXTRA products
    console.log('➕ Adding EXTRA products...');
    const extraProductsWithCategory = extraProducts.map((product, index) => ({
      ...product,
      category_id: categoryMap['extra'],
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      is_active: true,
      is_featured: false,
      sort_order: index + 1,
      stock_quantity: 1000,
      image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }));

    const { data: extraData, error: extraError } = await supabase
      .from('products')
      .insert(extraProductsWithCategory)
      .select();

    if (extraError) {
      console.error('❌ Error adding EXTRA products:', extraError);
      return;
    }

    console.log('✅ EXTRA products added:', extraData.length);

    // Step 6: Summary
    console.log('\n🎉 PIZZERIA PRODUCTS UPDATE COMPLETE!');
    console.log('📊 Summary:');
    console.log(`   Categories: ${insertedCategories.length}`);
    console.log(`   SEMPLICI products: ${sempliciData.length}`);
    console.log(`   SPECIALI products: ${specialiData.length}`);
    console.log(`   EXTRA products: ${extraData.length}`);
    console.log(`   Total products: ${sempliciData.length + specialiData.length + extraData.length}`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the update
updatePizzeriaProducts();
