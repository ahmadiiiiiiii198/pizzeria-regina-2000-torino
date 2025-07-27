// Final verification that the Google API key loading issue is resolved
import { createClient } from '@supabase/supabase-js';

// Use the CORRECT database that the frontend uses
const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYYQzNJhUl8NiTHITUzApsm6NyUO4Bnzz5EexVAA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simulate the EXACT ShippingZoneService behavior after fixes
class FinalShippingZoneService {
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
    
    console.log('🏗️ Service constructor called');
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

const runFinalVerification = async () => {
  console.log('🎯 FINAL VERIFICATION - Google API Key Loading Fix');
  console.log('=' .repeat(70));
  console.log('📍 Database:', SUPABASE_URL);
  console.log('');

  try {
    console.log('1️⃣ Testing direct database access...');
    
    const { data: directData, error: directError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'shippingZoneSettings')
      .single();

    if (directError) {
      console.error('❌ Direct database access failed:', directError.message);
      return;
    }

    console.log('✅ Direct database access successful');
    console.log('🔑 API Key in database:', directData.value?.googleMapsApiKey ? 'Present' : 'Missing');
    console.log('📊 API Key value:', directData.value?.googleMapsApiKey);

    console.log('\n2️⃣ Testing service initialization (simulating page load)...');
    
    const service = new FinalShippingZoneService();
    
    console.log('\n3️⃣ Testing immediate getSettings() call (simulating useEffect)...');
    
    const immediateSettings = await service.getSettings();
    console.log('📊 Settings from getSettings():', {
      googleMapsApiKey: immediateSettings.googleMapsApiKey || 'EMPTY',
      enabled: immediateSettings.enabled,
      restaurantAddress: immediateSettings.restaurantAddress
    });

    console.log('\n4️⃣ Testing reloadFromDatabase() call (simulating admin panel)...');
    
    await service.reloadFromDatabase();
    const reloadedSettings = await service.getSettings();
    console.log('📊 Settings after reload:', {
      googleMapsApiKey: reloadedSettings.googleMapsApiKey || 'EMPTY',
      enabled: reloadedSettings.enabled,
      restaurantAddress: reloadedSettings.restaurantAddress
    });

    console.log('\n5️⃣ Testing delivery zones...');
    
    const zones = await service.getDeliveryZones();
    console.log('📊 Delivery zones loaded:', zones.length, 'zones');

    console.log('\n🎯 FINAL RESULTS:');
    console.log('=' .repeat(50));
    
    const hasApiKeyInDb = !!directData.value?.googleMapsApiKey;
    const hasApiKeyInService = !!immediateSettings.googleMapsApiKey;
    const hasApiKeyAfterReload = !!reloadedSettings.googleMapsApiKey;
    
    console.log('📊 Database has API key:', hasApiKeyInDb ? '✅ YES' : '❌ NO');
    console.log('📊 Service loads API key immediately:', hasApiKeyInService ? '✅ YES' : '❌ NO');
    console.log('📊 Service loads API key after reload:', hasApiKeyAfterReload ? '✅ YES' : '❌ NO');
    console.log('📊 Delivery zones working:', zones.length > 0 ? '✅ YES' : '❌ NO');
    
    if (hasApiKeyInDb && hasApiKeyInService && hasApiKeyAfterReload) {
      console.log('\n🎉 SUCCESS! All tests passed:');
      console.log('✅ Database contains the API key');
      console.log('✅ Service loads API key immediately on initialization');
      console.log('✅ Service loads API key after reload');
      console.log('✅ Frontend should now display the API key in admin panel');
      console.log('✅ The timing issue has been resolved');
      
      console.log('\n🔄 NEXT STEPS:');
      console.log('1. Open admin panel: http://localhost:3000/admin');
      console.log('2. Navigate to Shipping Zone Settings');
      console.log('3. The Google Maps API Key field should show: AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs');
      console.log('4. Refresh the page - the API key should remain visible');
    } else {
      console.log('\n❌ FAILURE! Some tests failed:');
      if (!hasApiKeyInDb) console.log('❌ Database does not contain API key');
      if (!hasApiKeyInService) console.log('❌ Service does not load API key immediately');
      if (!hasApiKeyAfterReload) console.log('❌ Service does not load API key after reload');
    }

  } catch (error) {
    console.error('❌ Final verification failed:', error);
  }
};

// Run the verification
runFinalVerification();
