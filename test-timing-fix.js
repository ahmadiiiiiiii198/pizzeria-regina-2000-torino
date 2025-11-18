import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the FIXED ShippingZoneService behavior
class FixedShippingZoneService {
  constructor() {
    this.settings = {
      enabled: true,
      restaurantAddress: 'Piazza della Repubblica, 10100 Torino TO',
      restaurantLat: 45.0703,
      restaurantLng: 7.6869,
      maxDeliveryDistance: 15,
      deliveryFee: 5.00,
      freeDeliveryThreshold: 50.00,
      googleMapsApiKey: ''
    };
    this.deliveryZones = [];
    this.isInitialized = false;
    this.initializationPromise = null;
    
    console.log('🏗️ Fixed service constructor called');
    console.log('🔑 Initial API Key:', this.settings.googleMapsApiKey ? 'Present' : 'Empty');
    
    // Initialize asynchronously but track the promise
    this.initializationPromise = this.loadSettings();
  }

  // Ensure initialization is complete before proceeding
  async ensureInitialized() {
    if (!this.isInitialized && this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  async loadSettings() {
    try {
      console.log('🔄 Loading shipping settings from database...');

      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'shippingZoneSettings')
        .single();

      if (!error && data && data.value) {
        const defaultSettings = { ...this.settings };
        this.settings = { ...defaultSettings, ...data.value };
        console.log('✅ Shipping settings loaded from database');
        console.log('🔑 API Key loaded:', this.settings.googleMapsApiKey ? 'Present' : 'Missing');
      } else {
        console.log('⚠️ No shipping settings found in database, using defaults');
      }

      // Load delivery zones
      const { data: zonesData, error: zonesError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'deliveryZones')
        .single();

      if (!zonesError && zonesData && zonesData.value !== null) {
        this.deliveryZones = zonesData.value;
        console.log('✅ Delivery zones loaded from database:', this.deliveryZones.length, 'zones');
      } else {
        console.log('⚠️ No delivery zones found in database');
        this.deliveryZones = [];
      }
    } catch (error) {
      console.error('Failed to load shipping zone settings:', error);
    } finally {
      // Mark as initialized regardless of success/failure
      this.isInitialized = true;
      console.log('🏁 Service initialization completed');
    }
  }

  async reloadFromDatabase() {
    console.log('🔄 Force reloading shipping zones from database...');
    this.isInitialized = false;
    this.initializationPromise = this.loadSettings();
    await this.initializationPromise;
  }

  async getSettings() {
    await this.ensureInitialized();
    return { ...this.settings };
  }

  async getDeliveryZones() {
    await this.ensureInitialized();
    return [...this.deliveryZones];
  }
}

const testTimingFix = async () => {
  console.log('🧪 Testing Timing Fix for API Key Loading');
  console.log('=' .repeat(60));
  
  try {
    console.log('1️⃣ Creating new fixed service instance...');
    const service = new FixedShippingZoneService();
    
    console.log('\n2️⃣ Immediately calling getSettings() (should wait for initialization)...');
    const immediateSettings = await service.getSettings();
    console.log('📊 Immediate settings:', {
      googleMapsApiKey: immediateSettings.googleMapsApiKey || 'EMPTY',
      enabled: immediateSettings.enabled,
      restaurantAddress: immediateSettings.restaurantAddress
    });
    
    console.log('\n3️⃣ Calling getDeliveryZones() immediately...');
    const immediateZones = await service.getDeliveryZones();
    console.log('📊 Immediate zones:', immediateZones.length, 'zones');
    
    console.log('\n4️⃣ Calling reloadFromDatabase()...');
    await service.reloadFromDatabase();
    
    console.log('\n5️⃣ Getting settings after reload...');
    const reloadedSettings = await service.getSettings();
    console.log('📊 Reloaded settings:', {
      googleMapsApiKey: reloadedSettings.googleMapsApiKey || 'EMPTY',
      enabled: reloadedSettings.enabled,
      restaurantAddress: reloadedSettings.restaurantAddress
    });
    
    console.log('\n🎯 TIMING FIX RESULTS:');
    console.log('=' .repeat(40));
    
    if (immediateSettings.googleMapsApiKey) {
      console.log('✅ SUCCESS: API Key is available immediately after service creation');
      console.log('✅ No timing issue - getSettings() waits for initialization');
      console.log('🔑 API Key Value:', immediateSettings.googleMapsApiKey);
    } else {
      console.log('❌ FAILURE: API Key still not available immediately');
      console.log('🔍 This indicates the fix didn\'t work properly');
    }
    
    if (immediateSettings.googleMapsApiKey === reloadedSettings.googleMapsApiKey) {
      console.log('✅ CONSISTENCY: Settings are consistent between calls');
    } else {
      console.log('⚠️ INCONSISTENCY: Settings differ between calls');
    }
    
    console.log('\n6️⃣ Testing multiple rapid calls...');
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(service.getSettings());
    }
    
    const rapidResults = await Promise.all(promises);
    const allHaveApiKey = rapidResults.every(result => !!result.googleMapsApiKey);
    
    if (allHaveApiKey) {
      console.log('✅ SUCCESS: All rapid calls return API key');
    } else {
      console.log('❌ FAILURE: Some rapid calls missing API key');
    }
    
    console.log('\n🎉 FINAL VERDICT:');
    if (immediateSettings.googleMapsApiKey && allHaveApiKey) {
      console.log('✅ TIMING ISSUE FIXED!');
      console.log('✅ Frontend should now display API key after refresh');
    } else {
      console.log('❌ TIMING ISSUE NOT FULLY RESOLVED');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testTimingFix();
