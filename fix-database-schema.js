// Fix Database Schema for Pizzeria Regina 2000 Torino Admin Panel
import { createClient } from '@supabase/supabase-js';

// Correct Supabase configuration for Pizzeria Regina 2000
const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔧 FIXING DATABASE SCHEMA FOR PIZZERIA REGINA 2000 TORINO');
console.log('=========================================================');

async function checkAndFixSchema() {
  console.log('\n1. Checking existing tables...');
  
  // Check if tables exist
  const tables = ['orders', 'order_items', 'gallery_images', 'youtube_videos', 'comments', 'order_notifications'];
  const existingTables = [];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: exists`);
        existingTables.push(table);
      }
    } catch (e) {
      console.log(`❌ Table ${table}: ${e.message}`);
    }
  }
  
  console.log('\n2. Fixing orders table schema...');
  
  // Add missing columns to orders table if it exists
  if (existingTables.includes('orders')) {
    try {
      // Try to add order_status column if it doesn't exist
      const { error: statusError } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_status') THEN
              ALTER TABLE orders ADD COLUMN order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'));
            END IF;
          END $$;
        `
      });
      
      if (statusError) {
        console.log('⚠️ Could not add order_status column via RPC, trying direct approach...');
        // Try direct approach
        const { error: directError } = await supabase.from('orders').select('order_status').limit(1);
        if (directError && directError.message.includes('does not exist')) {
          console.log('❌ order_status column missing and cannot be added automatically');
          console.log('💡 Please add this column manually in Supabase dashboard:');
          console.log('   ALTER TABLE orders ADD COLUMN order_status TEXT DEFAULT \'pending\';');
        }
      } else {
        console.log('✅ order_status column added/verified');
      }
    } catch (error) {
      console.log(`⚠️ Orders table schema fix: ${error.message}`);
    }
  }
  
  console.log('\n3. Fixing order_items table schema...');
  
  if (existingTables.includes('order_items')) {
    try {
      // Check if unit_price column exists
      const { data, error } = await supabase.from('order_items').select('unit_price').limit(1);
      if (error && error.message.includes('does not exist')) {
        console.log('❌ unit_price column missing in order_items');
        console.log('💡 Please add this column manually in Supabase dashboard:');
        console.log('   ALTER TABLE order_items ADD COLUMN unit_price DECIMAL(10,2);');
      } else {
        console.log('✅ unit_price column exists in order_items');
      }
    } catch (error) {
      console.log(`⚠️ order_items table check: ${error.message}`);
    }
  }
  
  console.log('\n4. Creating missing tables...');
  
  // Create gallery_images table if missing
  if (!existingTables.includes('gallery_images')) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS gallery_images (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            image_url TEXT NOT NULL,
            category TEXT DEFAULT 'restaurant',
            is_active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) {
        console.log(`❌ Failed to create gallery_images: ${error.message}`);
      } else {
        console.log('✅ gallery_images table created');
      }
    } catch (error) {
      console.log(`❌ gallery_images creation error: ${error.message}`);
    }
  }
  
  // Create youtube_videos table if missing
  if (!existingTables.includes('youtube_videos')) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS youtube_videos (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            youtube_url TEXT NOT NULL,
            thumbnail_url TEXT,
            is_active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) {
        console.log(`❌ Failed to create youtube_videos: ${error.message}`);
      } else {
        console.log('✅ youtube_videos table created');
      }
    } catch (error) {
      console.log(`❌ youtube_videos creation error: ${error.message}`);
    }
  }
  
  // Create comments table if missing
  if (!existingTables.includes('comments')) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS comments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_email TEXT,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment_text TEXT NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            is_featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) {
        console.log(`❌ Failed to create comments: ${error.message}`);
      } else {
        console.log('✅ comments table created');
      }
    } catch (error) {
      console.log(`❌ comments creation error: ${error.message}`);
    }
  }
  
  // Create order_notifications table if missing
  if (!existingTables.includes('order_notifications')) {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS order_notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'new_order' CHECK (type IN ('new_order', 'order_update', 'payment_received')),
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (error) {
        console.log(`❌ Failed to create order_notifications: ${error.message}`);
      } else {
        console.log('✅ order_notifications table created');
      }
    } catch (error) {
      console.log(`❌ order_notifications creation error: ${error.message}`);
    }
  }
  
  console.log('\n5. Adding sample pizza data...');
  
  // Add pizza categories if they don't exist
  try {
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('name')
      .in('name', ['Pizze Classiche', 'Pizze Speciali']);
    
    if (!existingCategories || existingCategories.length === 0) {
      const { error } = await supabase
        .from('categories')
        .insert([
          {
            name: 'Pizze Classiche',
            slug: 'pizze-classiche',
            description: 'Le nostre pizze tradizionali preparate con ingredienti freschi',
            image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sort_order: 1,
            is_active: true
          },
          {
            name: 'Pizze Speciali',
            slug: 'pizze-speciali',
            description: 'Creazioni uniche della casa con ingredienti selezionati',
            image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sort_order: 2,
            is_active: true
          }
        ]);
      
      if (error) {
        console.log(`⚠️ Could not add pizza categories: ${error.message}`);
      } else {
        console.log('✅ Pizza categories added');
      }
    } else {
      console.log('✅ Pizza categories already exist');
    }
  } catch (error) {
    console.log(`⚠️ Pizza categories check: ${error.message}`);
  }
  
  console.log('\n✅ Database schema fix completed!');
  console.log('🍕 Pizzeria Regina 2000 Torino database is ready!');
  console.log('\n📝 Next steps:');
  console.log('1. If any manual SQL commands were shown above, run them in Supabase SQL editor');
  console.log('2. Test the admin panel at http://localhost:3000/admin');
  console.log('3. Run the comprehensive test again to verify all fixes');
}

checkAndFixSchema().catch(console.error);
