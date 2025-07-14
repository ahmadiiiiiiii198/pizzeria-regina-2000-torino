import { useState, useEffect, useCallback } from 'react';
import { businessHoursService } from '@/services/businessHoursService';
import { supabase } from '@/integrations/supabase/client';

interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface BusinessHoursResult {
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
  todayHours?: DayHours;
}

interface UseBusinessHoursReturn {
  isOpen: boolean;
  isLoading: boolean;
  message: string;
  nextOpenTime?: string;
  todayHours?: DayHours;
  formattedHours: string;
  checkBusinessStatus: () => Promise<void>;
  validateOrderTime: (orderTime?: Date) => Promise<{ valid: boolean; message: string }>;
  refreshHours: () => void;
}

/**
 * Hook for managing business hours and checking if the business is open
 */
export const useBusinessHours = (autoRefresh: boolean = true): UseBusinessHoursReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('Caricamento orari...');
  const [nextOpenTime, setNextOpenTime] = useState<string | undefined>();
  const [todayHours, setTodayHours] = useState<DayHours | undefined>();
  const [formattedHours, setFormattedHours] = useState<string>('');

  /**
   * Check current business status
   */
  const checkBusinessStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      // Reduced logging - only log in debug mode
      if (process.env.NODE_ENV === 'development') {
        console.log('🕒 Checking business hours status...');
      }

      const result: BusinessHoursResult = await businessHoursService.isBusinessOpen();
      const formatted = await businessHoursService.getFormattedHours();

      setIsOpen(result.isOpen);
      setMessage(result.message);
      setNextOpenTime(result.nextOpenTime);
      setTodayHours(result.todayHours);
      setFormattedHours(formatted);

      // Reduced logging - only log in debug mode
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Business status updated:', {
          isOpen: result.isOpen,
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ Failed to check business status:', error);
      setMessage('Errore nel caricamento degli orari');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Validate if an order can be placed at a specific time
   */
  const validateOrderTime = useCallback(async (orderTime?: Date) => {
    return await businessHoursService.validateOrderTime(orderTime);
  }, []);

  /**
   * Refresh hours by forcing complete refresh from database
   */
  const refreshHours = useCallback(async () => {
    console.log('🔄 [useBusinessHours] Force refreshing business hours...');
    try {
      setIsLoading(true);
      await businessHoursService.forceRefresh();
      await checkBusinessStatus();
    } catch (error) {
      console.error('❌ [useBusinessHours] Force refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkBusinessStatus]);

  // Initial load
  useEffect(() => {
    checkBusinessStatus();
  }, [checkBusinessStatus]);

  // Real-time subscription for business hours changes + auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    // Set up real-time subscription for immediate updates
    const channel = supabase
      .channel('business-hours-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'settings',
        filter: 'key=eq.businessHours'
      }, async (payload) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🕒 [useBusinessHours] Real-time business hours update received:', payload);
        }

        // Force refresh business hours service to get latest data
        await businessHoursService.forceRefresh();
        await checkBusinessStatus();
      })
      .subscribe();

    // Auto-refresh every 5 minutes as backup (reduced frequency since we have real-time updates)
    const interval = setInterval(async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏰ [useBusinessHours] Auto-refreshing business hours...');
      }
      try {
        await businessHoursService.getBusinessHours();
        await checkBusinessStatus();
      } catch (error) {
        console.error('❌ [useBusinessHours] Auto-refresh failed:', error);
      }
    }, 300000); // 5 minutes (300,000ms)

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [autoRefresh, checkBusinessStatus]);

  return {
    isOpen,
    isLoading,
    message,
    nextOpenTime,
    todayHours,
    formattedHours,
    checkBusinessStatus,
    validateOrderTime,
    refreshHours
  };
};

export default useBusinessHours;
