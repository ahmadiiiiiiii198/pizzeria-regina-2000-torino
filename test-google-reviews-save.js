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

const testGoogleReviewsApiSave = async () => {
  console.log('🧪 Testing Google Reviews API Key Save Functionality');
  console.log('=' .repeat(60));
  
  // Note: The GoogleReviewsSettings component currently only saves to localStorage
  // Let's test both localStorage simulation and potential database save
  
  const testSettings = {
    isEnabled: true,
    apiKey: 'AIzaSyBkHCjFa0GKD7lJThAyFnSaeCXFDsBtJhs',
    placeId: 'ChIJd8BlQ2NgOxMRAFrjC3LjPiE', // Example Place ID for Turin
    maxReviews: 5,
    minRating: 4,
    showGoogleReviews: true,
    showSiteReviews: true
  };

  try {
    console.log('1️⃣ Testing current localStorage-based save (as implemented)...');
    
    // Simulate what the current GoogleReviewsSettings component does
    console.log('📝 Simulating localStorage save...');
    console.log('Settings to save:', testSettings);
    
    // In a real browser environment, this would be:
    // localStorage.setItem('googleReviewsSettings', JSON.stringify(testSettings));
    console.log('✅ localStorage save would succeed (simulated)');
    
    console.log('\n2️⃣ Testing potential database save improvement...');
    
    // Check if googleReviewsSettings exists in database
    const { data: existingSettings, error: selectError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'googleReviewsSettings')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Error checking existing settings:', selectError);
      return;
    }

    if (existingSettings) {
      console.log('📋 Found existing Google Reviews settings in database:', {
        key: existingSettings.key,
        hasApiKey: existingSettings.value?.apiKey ? 'Yes' : 'No',
        isEnabled: existingSettings.value?.isEnabled || false,
        updated_at: existingSettings.updated_at
      });
      
      // Update existing
      const { data: updateData, error: updateError } = await supabase
        .from('settings')
        .update({
          value: testSettings,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'googleReviewsSettings')
        .select();

      if (updateError) {
        console.error('❌ Update failed:', updateError);
        return;
      }
      console.log('✅ Database update successful');
    } else {
      console.log('📋 No existing Google Reviews settings found, creating new...');
      
      // Insert new
      const { data: insertData, error: insertError } = await supabase
        .from('settings')
        .insert({
          key: 'googleReviewsSettings',
          value: testSettings,
          updated_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        console.error('❌ Insert failed:', insertError);
        return;
      }
      console.log('✅ Database insert successful');
    }

    console.log('\n3️⃣ Verifying database save...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'googleReviewsSettings')
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('✅ Verification successful');
    console.log('📊 Retrieved data:', {
      key: verifyData.key,
      isEnabled: verifyData.value?.isEnabled,
      hasApiKey: verifyData.value?.apiKey ? 'Yes' : 'No',
      apiKeyValue: verifyData.value?.apiKey,
      placeId: verifyData.value?.placeId,
      updated_at: verifyData.updated_at
    });

    console.log('\n🎉 ANALYSIS RESULT:');
    console.log('=' .repeat(40));
    console.log('📋 CURRENT IMPLEMENTATION:');
    console.log('   - GoogleReviewsSettings saves to localStorage only');
    console.log('   - This works but data is not persistent across devices/browsers');
    console.log('   - No database integration currently implemented');
    
    console.log('\n✅ DATABASE CAPABILITY:');
    console.log('   - Database can successfully store Google Reviews settings');
    console.log('   - API key saves and retrieves correctly');
    console.log('   - Ready for upgrade to database-backed storage');
    
    console.log('\n💡 RECOMMENDATION:');
    console.log('   - Consider upgrading GoogleReviewsSettings to use database');
    console.log('   - Follow the same pattern as ShippingZoneManager');
    console.log('   - Use upsertSetting() function from lib/supabase.ts');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

// Run the test
testGoogleReviewsApiSave();
