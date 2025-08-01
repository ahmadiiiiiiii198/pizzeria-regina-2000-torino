import { supabase } from '@/integrations/supabase/client';

interface PizzeriaHours {
  isOpen: boolean;
  periods: {
    openTime: string;
    closeTime: string;
  }[];
}

interface WeeklyPizzeriaHours {
  monday: PizzeriaHours;
  tuesday: PizzeriaHours;
  wednesday: PizzeriaHours;
  thursday: PizzeriaHours;
  friday: PizzeriaHours;
  saturday: PizzeriaHours;
  sunday: PizzeriaHours;
}

interface PizzeriaHoursResult {
  isOpen: boolean;
  displayText: string;
  todayHours?: PizzeriaHours;
}

class PizzeriaHoursService {
  private static instance: PizzeriaHoursService;
  private cachedHours: WeeklyPizzeriaHours | null = null;
  private lastFetch = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): PizzeriaHoursService {
    if (!PizzeriaHoursService.instance) {
      PizzeriaHoursService.instance = new PizzeriaHoursService();
    }
    return PizzeriaHoursService.instance;
  }

  /**
   * Get default pizzeria hours based on Google Maps information
   */
  private getDefaultHours(): WeeklyPizzeriaHours {
    return {
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
  }

  /**
   * Get pizzeria hours from database with fallback to defaults
   */
  async getPizzeriaHours(): Promise<WeeklyPizzeriaHours> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cachedHours && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedHours;
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'pizzeriaDisplayHours')
        .single();

      if (error || !data?.value) {
        console.log('📅 [PizzeriaHours] Using default hours (no database entry)');
        this.cachedHours = this.getDefaultHours();
      } else {
        this.cachedHours = data.value as WeeklyPizzeriaHours;
        console.log('📅 [PizzeriaHours] Loaded from database');
      }

      this.lastFetch = now;
      return this.cachedHours;
    } catch (error) {
      console.error('❌ [PizzeriaHours] Error loading hours:', error);
      return this.getDefaultHours();
    }
  }

  /**
   * Check if pizzeria is currently open and get display text
   */
  async getPizzeriaStatus(checkTime?: Date): Promise<PizzeriaHoursResult> {
    const hours = await this.getPizzeriaHours();
    const now = checkTime || new Date();
    
    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = now.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[dayOfWeek] as keyof WeeklyPizzeriaHours;
    
    const todayHours = hours[currentDay];
    
    if (!todayHours.isOpen) {
      return {
        isOpen: false,
        displayText: 'Chiuso Oggi',
        todayHours
      };
    }

    // Format display text for today's hours
    const periodsText = todayHours.periods.map(period => 
      `${period.openTime}-${period.closeTime}`
    ).join(', ');

    // Check if currently open
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const isCurrentlyOpen = todayHours.periods.some(period => {
      const openTime = period.openTime;
      const closeTime = period.closeTime;
      
      // Handle overnight periods (e.g., 18:30-02:00)
      if (closeTime < openTime) {
        return currentTime >= openTime || currentTime <= closeTime;
      } else {
        return currentTime >= openTime && currentTime <= closeTime;
      }
    });

    return {
      isOpen: isCurrentlyOpen,
      displayText: periodsText,
      todayHours
    };
  }

  /**
   * Get formatted hours for a specific day
   */
  async getFormattedDayHours(day: keyof WeeklyPizzeriaHours): Promise<string> {
    const hours = await this.getPizzeriaHours();
    const dayHours = hours[day];
    
    if (!dayHours.isOpen) {
      return 'Chiuso';
    }
    
    return dayHours.periods.map(period => 
      `${period.openTime}-${period.closeTime}`
    ).join(', ');
  }

  /**
   * Get all formatted hours for display
   */
  async getAllFormattedHours(): Promise<string> {
    const hours = await this.getPizzeriaHours();
    const dayNames = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mer',
      thursday: 'Gio',
      friday: 'Ven',
      saturday: 'Sab',
      sunday: 'Dom'
    };

    const formattedDays: string[] = [];
    
    Object.entries(hours).forEach(([day, dayHours]) => {
      const dayName = dayNames[day as keyof typeof dayNames];
      if (dayHours.isOpen) {
        const periodsText = dayHours.periods.map(period => 
          `${period.openTime}-${period.closeTime}`
        ).join(', ');
        formattedDays.push(`${dayName}: ${periodsText}`);
      } else {
        formattedDays.push(`${dayName}: Chiuso`);
      }
    });

    return formattedDays.join('\n');
  }
}

// Create singleton instance
export const pizzeriaHoursService = PizzeriaHoursService.getInstance();
