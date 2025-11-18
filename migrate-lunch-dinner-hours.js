// Migration script to add lunch and dinner times to business hours
// This updates the existing single time period to separate lunch and dinner periods

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sixnfemtvmighstbgrbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrateLunchDinnerHours() {
  console.log('🍕 Migrating business hours to include lunch and dinner times...');
  
  try {
    // Fetch current business hours
    const { data: currentData, error: fetchError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'businessHours')
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching current business hours:', fetchError.message);
      return false;
    }
    
    if (!currentData || !currentData.value) {
      console.log('⚠️ No existing business hours found. Creating new structure...');
      const newHours = getDefaultLunchDinnerHours();
      
      const { error: insertError } = await supabase
        .from('settings')
        .insert({
          key: 'businessHours',
          value: newHours,
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('❌ Failed to insert new hours:', insertError.message);
        return false;
      }
      
      console.log('✅ New lunch/dinner hours created successfully!');
      return true;
    }
    
    console.log('📋 Current business hours:', JSON.stringify(currentData.value, null, 2));
    
    // Convert old structure to new lunch/dinner structure
    const oldHours = currentData.value;
    const newHours = {};
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const oldDayHours = oldHours[day];
      
      if (!oldDayHours) {
        // If day doesn't exist, use defaults
        newHours[day] = getDefaultDayLunchDinner();
        continue;
      }
      
      // Convert single period to lunch and dinner
      // If the period spans lunch and dinner time, split it
      // Otherwise, determine if it's lunch or dinner based on time
      const openTime = oldDayHours.openTime || '12:00';
      const closeTime = oldDayHours.closeTime || '23:00';
      const openHour = parseInt(openTime.split(':')[0]);
      const closeHour = parseInt(closeTime.split(':')[0]);
      
      let lunchOpen = false;
      let lunchStart = '12:00';
      let lunchEnd = '14:30';
      let dinnerOpen = false;
      let dinnerStart = '18:00';
      let dinnerEnd = '23:00';
      
      // Check if it's a lunch period (before 16:00)
      if (openHour < 16 && oldDayHours.isOpen) {
        lunchOpen = true;
        lunchStart = openTime;
        // If it closes after 16:00, adjust lunch end to 15:30
        if (closeHour >= 16) {
          lunchEnd = '15:30';
        } else {
          lunchEnd = closeTime;
        }
      }
      
      // Check if it's a dinner period (after 16:00 or spans into evening)
      if ((openHour >= 16 || closeHour >= 18) && oldDayHours.isOpen) {
        dinnerOpen = true;
        // If it starts before 16:00, adjust dinner start to 18:00
        if (openHour < 16) {
          dinnerStart = '18:00';
        } else {
          dinnerStart = openTime;
        }
        dinnerEnd = closeTime;
      }
      
      newHours[day] = {
        lunch: {
          isOpen: lunchOpen,
          openTime: lunchStart,
          closeTime: lunchEnd
        },
        dinner: {
          isOpen: dinnerOpen,
          openTime: dinnerStart,
          closeTime: dinnerEnd
        }
      };
    }
    
    console.log('🔄 Converted hours:', JSON.stringify(newHours, null, 2));
    
    // Update database with new structure
    const { error: updateError } = await supabase
      .from('settings')
      .update({
        value: newHours,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'businessHours');
    
    if (updateError) {
      console.error('❌ Failed to update business hours:', updateError.message);
      return false;
    }
    
    console.log('✅ Business hours successfully migrated to lunch/dinner structure!');
    console.log('📋 New structure:');
    console.log('   - Each day now has separate lunch and dinner periods');
    console.log('   - Lunch: typically 12:00-15:30');
    console.log('   - Dinner: typically 18:00-23:00');
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

function getDefaultDayLunchDinner() {
  return {
    lunch: {
      isOpen: true,
      openTime: '12:00',
      closeTime: '14:30'
    },
    dinner: {
      isOpen: true,
      openTime: '18:00',
      closeTime: '23:00'
    }
  };
}

function getDefaultLunchDinnerHours() {
  const defaultDay = getDefaultDayLunchDinner();
  
  return {
    monday: { ...defaultDay },
    tuesday: { ...defaultDay },
    wednesday: { ...defaultDay },
    thursday: { ...defaultDay },
    // Thursday open all day
    thursday: {
      lunch: { isOpen: true, openTime: '12:00', closeTime: '14:30' },
      dinner: { isOpen: true, openTime: '18:00', closeTime: '00:00' }
    },
    friday: {
      lunch: { isOpen: true, openTime: '12:00', closeTime: '14:30' },
      dinner: { isOpen: true, openTime: '18:30', closeTime: '02:00' }
    },
    saturday: {
      lunch: { isOpen: false, openTime: '12:00', closeTime: '14:30' },
      dinner: { isOpen: true, openTime: '18:30', closeTime: '02:00' }
    },
    sunday: { ...defaultDay }
  };
}

// Run migration
migrateLunchDinnerHours()
  .then(success => {
    if (success) {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Migration failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
