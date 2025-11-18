// Quick Database Initialization Script
// Run this to initialize the database if the admin panel isn't working

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function initializeSettings() {
  console.log('🚀 Initializing database settings...');
  
  try {
    // Check if settings table exists by trying to query it
    console.log('📋 Checking settings table...');
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('key')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Settings table does not exist or is not accessible:', checkError.message);
      console.log('💡 Please run the Supabase migrations first or use the /database-setup page');
      return false;
    }
    
    console.log('✅ Settings table exists');
    
    // Initialize default settings
    const defaultSettings = [
      {
        key: 'heroContent',
        value: {
          heading: "🍕 PIZZERIA Regina 2000",
          subheading: "Autentica pizza napoletana preparata con ingredienti freschi e forno a legna tradizionale nel cuore di Torino",
          backgroundImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        }
      },
      {
        key: 'logoSettings',
        value: {
          logoUrl: "/pizzeria-regina-logo.png",
          altText: "Pizzeria Regina 2000 Torino Logo"
        }
      },
      {
        key: 'contactContent',
        value: {
          address: "Corso Regina Margherita, 53/b, 10124, Torino TO, Italia",
          phone: "0110769211",
          email: "anilamyzyri@gmail.com",
          mapUrl: "https://maps.google.com",
          hours: "Lun-Dom: 08:00 - 19:00"
        }
      },
      {
        key: 'businessHours',
        value: {
          monday: { isOpen: true, openTime: '08:00', closeTime: '19:00' },
          tuesday: { isOpen: true, openTime: '08:00', closeTime: '19:00' },
          wednesday: { isOpen: true, openTime: '08:00', closeTime: '19:00' },
          thursday: { isOpen: true, openTime: '08:00', closeTime: '19:00' },
          friday: { isOpen: true, openTime: '08:00', closeTime: '19:00' },
          saturday: { isOpen: true, openTime: '08:00', closeTime: '19:00' },
          sunday: { isOpen: true, openTime: '08:00', closeTime: '19:00' }
        }
      },
      {
        key: 'stripeConfig',
        value: {
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
          secretKey: process.env.STRIPE_SECRET_KEY || '',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
          isTestMode: false
        }
      }
    ];
    
    console.log('📝 Inserting default settings (only if they don\'t exist)...');

    for (const setting of defaultSettings) {
      // Check if setting already exists
      const { data: existingSetting } = await supabase
        .from('settings')
        .select('key')
        .eq('key', setting.key)
        .single();

      if (existingSetting) {
        console.log(`⏭️  ${setting.key} already exists, skipping to preserve user changes`);
        continue;
      }

      // Only insert if it doesn't exist
      const { data, error } = await supabase
        .from('settings')
        .insert({
          key: setting.key,
          value: setting.value,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error(`❌ Failed to insert ${setting.key}:`, error.message);
      } else {
        console.log(`✅ Inserted ${setting.key}`);
      }
    }
    
    console.log('🎉 Database initialization complete!');
    console.log('💡 You can now go to the admin panel and configure Stripe settings');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🌸 Francesco Fiori & Piante - Database Initialization');
  console.log('================================================');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('❌ Cannot proceed without database connection');
    return;
  }
  
  const initOk = await initializeSettings();
  if (initOk) {
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Go to http://localhost:8484/admin');
    console.log('2. Click on the "Stripe" tab');
    console.log('3. Enter your Stripe keys and save');
    console.log('4. Test the payment integration');
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { initializeSettings, testConnection };
