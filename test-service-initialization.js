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

// Simulate the exact ShippingZoneService behavior
class TestShippingZoneService {
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
    console.log('🏗️ Service constructor called');
    console.log('🔑 Initial API Key:', this.settings.googleMapsApiKey ? 'Present' : 'Empty');
    this.loadSettings();
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
        // Use database values as primary, only fill missing fields with defaults
        const defaultSettings = { ...this.settings };
        this.settings = { ...defaultSettings, ...data.value };
        console.log('✅ Shipping settings loaded from database');
        console.log('🔑 API Key loaded:', this.settings.googleMapsApiKey ? 'Present' : 'Missing');
        console.log('📊 Loaded settings:', this.settings);
      } else {
        console.log('⚠️ No shipping settings found in database, using defaults');
        console.log('🔑 Default API Key:', this.settings.googleMapsApiKey ? 'Present' : 'Missing');
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
    }
  }

  async reloadFromDatabase() {
    console.log('🔄 Force reloading shipping zones from database...');
    await this.loadSettings();
  }

  getSettings() {
    return { ...this.settings };
  }

  getDeliveryZones() {
    return [...this.deliveryZones];
  }
}

const testServiceInitialization = async () => {
  console.log('🧪 Testing ShippingZoneService Initialization');
  console.log('=' .repeat(60));
  
  try {
    console.log('1️⃣ Creating new service instance...');
    const service = new TestShippingZoneService();
    
    // Wait for constructor's loadSettings to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n2️⃣ Getting settings after initialization...');
    const initialSettings = service.getSettings();
    console.log('📊 Initial settings:', {
      googleMapsApiKey: initialSettings.googleMapsApiKey || 'EMPTY',
      enabled: initialSettings.enabled,
      restaurantAddress: initialSettings.restaurantAddress
    });
    
    console.log('\n3️⃣ Calling reloadFromDatabase()...');
    await service.reloadFromDatabase();
    
    console.log('\n4️⃣ Getting settings after reload...');
    const reloadedSettings = service.getSettings();
    console.log('📊 Reloaded settings:', {
      googleMapsApiKey: reloadedSettings.googleMapsApiKey || 'EMPTY',
      enabled: reloadedSettings.enabled,
      restaurantAddress: reloadedSettings.restaurantAddress
    });
    
    console.log('\n5️⃣ Getting delivery zones...');
    const zones = service.getDeliveryZones();
    console.log('📊 Delivery zones:', zones.length, 'zones');
    
    console.log('\n🎯 FINAL DIAGNOSIS:');
    if (reloadedSettings.googleMapsApiKey) {
      console.log('✅ SUCCESS: API Key is properly loaded');
      console.log('🔑 Value:', reloadedSettings.googleMapsApiKey);
      console.log('💡 The service is working correctly');
    } else {
      console.log('❌ PROBLEM: API Key is not loaded');
      console.log('🔍 This indicates an issue with the service logic');
    }
    
    console.log('\n6️⃣ Testing timing issue...');
    console.log('⏱️ Creating another service and checking immediately...');
    
    const quickService = new TestShippingZoneService();
    const quickSettings = quickService.getSettings();
    console.log('📊 Immediate settings (before async load):', {
      googleMapsApiKey: quickSettings.googleMapsApiKey || 'EMPTY',
      enabled: quickSettings.enabled
    });
    
    console.log('⏱️ Waiting 2 seconds for async load...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const delayedSettings = quickService.getSettings();
    console.log('📊 Delayed settings (after async load):', {
      googleMapsApiKey: delayedSettings.googleMapsApiKey || 'EMPTY',
      enabled: delayedSettings.enabled
    });
    
    if (quickSettings.googleMapsApiKey !== delayedSettings.googleMapsApiKey) {
      console.log('⚠️ TIMING ISSUE DETECTED!');
      console.log('💡 The frontend might be reading settings before async load completes');
    } else {
      console.log('✅ No timing issue detected');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testServiceInitialization();
