import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPizzeriaDisplayHours() {
  console.log('🍕 Setting up Pizzeria Display Hours...');
  console.log('📅 Based on Google Maps information for Pizzeria Regina 2000');
  
  try {
    // Check if pizzeria display hours already exist
    const { data: existingData, error: checkError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'pizzeriaDisplayHours')
      .single();

    if (existingData && !checkError) {
      console.log('✅ Pizzeria display hours already exist in database');
      console.log('📋 Current hours:', JSON.stringify(existingData.value, null, 2));
      return;
    }

    // Pizzeria display hours based on Google Maps
    const pizzeriaDisplayHours = {
      monday: {
        isOpen: true,
        periods: [
          { openTime: '12:00', closeTime: '14:30' },
          { openTime: '18:00', closeTime: '00:00' }
        ]
      },
      tuesday: {
        isOpen: true,
        periods: [
          { openTime: '12:00', closeTime: '14:30' },
          { openTime: '18:00', closeTime: '00:00' }
        ]
      },
      wednesday: {
        isOpen: true,
        periods: [
          { openTime: '12:00', closeTime: '14:30' },
          { openTime: '18:00', closeTime: '00:00' }
        ]
      },
      thursday: {
        isOpen: true,
        periods: [
          { openTime: '12:00', closeTime: '14:30' },
          { openTime: '18:00', closeTime: '00:00' }
        ]
      },
      friday: {
        isOpen: true,
        periods: [
          { openTime: '12:00', closeTime: '14:30' },
          { openTime: '18:30', closeTime: '02:00' }
        ]
      },
      saturday: {
        isOpen: true,
        periods: [
          { openTime: '18:30', closeTime: '02:00' }
        ]
      },
      sunday: {
        isOpen: true,
        periods: [
          { openTime: '12:00', closeTime: '14:30' },
          { openTime: '18:00', closeTime: '00:00' }
        ]
      }
    };

    console.log('📝 Inserting pizzeria display hours...');
    
    const { data, error } = await supabase
      .from('settings')
      .insert({
        key: 'pizzeriaDisplayHours',
        value: pizzeriaDisplayHours,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('❌ Failed to insert pizzeria display hours:', error.message);
      return false;
    }

    console.log('✅ Pizzeria display hours added successfully!');
    console.log('📋 Hours schedule:');
    console.log('   Monday-Thursday: 12:00-14:30, 18:00-00:00');
    console.log('   Friday: 12:00-14:30, 18:30-02:00');
    console.log('   Saturday: 18:30-02:00');
    console.log('   Sunday: 12:00-14:30, 18:00-00:00');
    console.log('');
    console.log('🔄 Note: These are DISPLAY hours (what customers see)');
    console.log('📝 Order hours (when customers can place orders) are managed separately');
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up pizzeria display hours:', error);
    return false;
  }
}

// Run the setup
setupPizzeriaDisplayHours()
  .then((success) => {
    if (success) {
      console.log('🎉 Setup completed successfully!');
    } else {
      console.log('❌ Setup failed');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
