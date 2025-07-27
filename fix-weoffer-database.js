// Fix WeOffer database content structure
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixWeOfferContent() {
  console.log('🔧 Fixing WeOffer database content structure...');
  
  try {
    // Check current content
    const { data: currentData, error: fetchError } = await supabase
      .from('settings')
      .select('key, value')
      .eq('key', 'weOfferContent')
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching current content:', fetchError);
      return false;
    }
    
    console.log('📄 Current content:', JSON.stringify(currentData.value, null, 2));
    
    // New correct structure
    const newWeOfferContent = {
      heading: "Offriamo",
      subheading: "Scopri le nostre autentiche specialità italiane",
      offers: [
        {
          id: 1,
          title: "Pizza Metro Finchi 5 Gusti",
          description: "Prova la nostra pizza metro caratteristica con fino a 5 gusti diversi in un'unica creazione straordinaria. Perfetta da condividere con famiglia e amici.",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          badge: "Specialità"
        },
        {
          id: 2,
          title: "Usiamo la Farina 5 Stagioni Gusti, Alta Qualità",
          description: "Utilizziamo farina premium 5 Stagioni, ingredienti della migliore qualità che rendono il nostro impasto per pizza leggero, digeribile e incredibilmente saporito.",
          image: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          badge: "Qualità"
        },
        {
          id: 3,
          title: "Creiamo Tutti i Tipi di Pizza Italiana di Alta Qualità",
          description: "Dalla classica Margherita alle specialità gourmet, prepariamo ogni pizza con passione, utilizzando tecniche tradizionali e i migliori ingredienti per un'autentica esperienza italiana.",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          badge: "Autentica"
        }
      ]
    };
    
    // Update the database
    const { error: updateError } = await supabase
      .from('settings')
      .update({
        value: newWeOfferContent,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'weOfferContent');
    
    if (updateError) {
      console.error('❌ Error updating content:', updateError);
      return false;
    }
    
    console.log('✅ WeOffer content structure fixed successfully!');
    console.log('📄 New content:', JSON.stringify(newWeOfferContent, null, 2));
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function checkDatabaseStructure() {
  console.log('🔍 Checking database structure...');
  
  try {
    // Get all settings
    const { data: allSettings, error } = await supabase
      .from('settings')
      .select('key, value, created_at, updated_at')
      .order('key');
    
    if (error) {
      console.error('❌ Error fetching settings:', error);
      return;
    }
    
    console.log('📊 Database Settings:');
    console.log('===================');
    
    allSettings.forEach(setting => {
      console.log(`\n🔑 Key: ${setting.key}`);
      console.log(`📅 Updated: ${setting.updated_at}`);
      console.log(`📄 Value:`, typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : setting.value);
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

// Main execution
async function main() {
  console.log('🍕 WeOffer Database Fix Tool');
  console.log('============================');
  
  await checkDatabaseStructure();
  
  console.log('\n🔧 Fixing WeOffer content...');
  const success = await fixWeOfferContent();
  
  if (success) {
    console.log('\n✅ Fix completed successfully!');
    console.log('💡 The WeOffer section should now display correctly');
  } else {
    console.log('\n❌ Fix failed. Please check the errors above.');
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { fixWeOfferContent, checkDatabaseStructure };
