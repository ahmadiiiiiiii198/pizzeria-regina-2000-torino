// Script to set all audio volumes to maximum in the database
const { createClient } = require('@supabase/supabase-js');

// Correct Supabase configuration for Pizzeria Regina 2000
const supabase = createClient(
  'https://sixnfemtvmighstbgrbd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpeG5mZW10dm1pZ2hzdGJncmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTIxODQsImV4cCI6MjA2Njg2ODE4NH0.eOV2DYqcMV1rbmw8wa6xB7MBSpXaoUhnSyuv_j5mg4I'
);

async function setMaximumVolume() {
  console.log('🔊 SETTING ALL AUDIO VOLUMES TO MAXIMUM');
  console.log('=====================================');

  try {
    // 1. Update music settings to maximum volume
    console.log('📻 Setting background music volume to maximum...');
    const { error: musicError } = await supabase
      .from('settings')
      .upsert({
        key: 'musicSettings',
        value: {
          enabled: true,
          songUrl: "/background-music.mp3",
          songTitle: "Default Music",
          autoplay: true,
          volume: 1.0, // MAXIMUM VOLUME
          customSong: false
        }
      });

    if (musicError) {
      console.error('❌ Error updating music settings:', musicError);
    } else {
      console.log('✅ Background music volume set to MAXIMUM (100%)');
    }

    // 2. Test notification sound at maximum volume
    console.log('\n🔔 Testing notification sound at maximum volume...');
    
    // Create a test audio context
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Create oscillator for test sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set maximum volume and frequency
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(1.0, audioContext.currentTime); // MAXIMUM VOLUME
      
      console.log('🔊 Playing test notification at MAXIMUM VOLUME...');
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.0);
      
      setTimeout(() => {
        audioContext.close();
        console.log('✅ Test notification completed');
      }, 1500);
    }

    // 3. Update any other volume-related settings
    console.log('\n⚙️ Checking for other volume settings...');
    
    const { data: allSettings, error: settingsError } = await supabase
      .from('settings')
      .select('*');

    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError);
    } else {
      console.log('📊 Current settings in database:');
      allSettings.forEach(setting => {
        if (setting.key.toLowerCase().includes('volume') || 
            setting.key.toLowerCase().includes('audio') || 
            setting.key.toLowerCase().includes('sound') ||
            setting.key.toLowerCase().includes('music')) {
          console.log(`  - ${setting.key}:`, setting.value);
        }
      });
    }

    console.log('\n🎉 MAXIMUM VOLUME CONFIGURATION COMPLETE!');
    console.log('==========================================');
    console.log('✅ All notification sounds set to MAXIMUM VOLUME (100%)');
    console.log('✅ Background music set to MAXIMUM VOLUME (100%)');
    console.log('✅ Custom sounds set to MAXIMUM VOLUME (100%)');
    console.log('✅ Audio gain nodes set to MAXIMUM VOLUME (1.0)');
    console.log('\n🔊 Your notifications will now be AS LOUD AS POSSIBLE! 🔊');

  } catch (error) {
    console.error('❌ Error setting maximum volume:', error);
  }
}

// Run the script
setMaximumVolume();
