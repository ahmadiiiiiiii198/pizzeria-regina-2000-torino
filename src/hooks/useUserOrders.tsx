import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  total_amount: number;
  status: string;
  order_status?: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    product_price: number;
    subtotal: number;
    special_requests?: string;
    toppings?: string;
  }>;
}

interface UseUserOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  getActiveOrder: () => Order | null;
  hasActiveOrders: boolean;
}

export const useUserOrders = (): UseUserOrdersReturn => {
  const { user, isAuthenticated } = useCustomerAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user orders from database
  const loadUserOrders = useCallback(async () => {
    console.log('📋 [USER-ORDERS] Starting loadUserOrders...');
    console.log('📋 [USER-ORDERS] Auth state:', { isAuthenticated, userId: user?.id });

    if (!isAuthenticated || !user) {
      console.log('📋 [USER-ORDERS] Not authenticated or no user, clearing orders');
      setOrders([]);
      return;
    }

    console.log('📋 [USER-ORDERS] Setting loading to true');
    const startTime = Date.now();
    setLoading(true);
    setError(null);

    try {
      console.log('📋 [USER-ORDERS] Executing user orders query...');

      // Add timeout protection
      const queryPromise = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          total_amount,
          status,
          order_status,
          payment_status,
          created_at,
          updated_at,
          order_items (
            id,
            product_name,
            quantity,
            product_price,
            subtotal,
            special_requests,
            toppings
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('User orders query timeout')), 5000)
      );

      const { data, error: fetchError } = await Promise.race([queryPromise, timeoutPromise]) as any;

      const queryTime = Date.now() - startTime;
      console.log(`📋 [USER-ORDERS] Query completed in ${queryTime}ms`);
      console.log('📋 [USER-ORDERS] Query result:', {
        ordersCount: data?.length || 0,
        hasError: !!fetchError,
        errorMessage: fetchError?.message
      });

      if (fetchError) {
        console.error('📋 [USER-ORDERS] Error loading user orders:', fetchError);

        // Handle specific error cases
        if (fetchError.message?.includes('user_id')) {
          console.warn('📋 [USER-ORDERS] User ID related error, user may not be fully authenticated yet');
          setError('Caricamento ordini in corso...');
        } else {
          setError('Errore durante il caricamento degli ordini');
        }
        return;
      }

      console.log('📋 [USER-ORDERS] Setting orders state with', data?.length || 0, 'orders');
      setOrders(data || []);
    } catch (error) {
      console.error('📋 [USER-ORDERS] Exception in loadUserOrders:', error);
      setError('Si è verificato un errore durante il caricamento degli ordini');
    } finally {
      const totalTime = Date.now() - startTime;
      console.log(`📋 [USER-ORDERS] loadUserOrders completed in ${totalTime}ms, setting loading to false`);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Refresh orders - FIXED to avoid circular dependency
  const refreshOrders = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          total_amount,
          status,
          order_status,
          payment_status,
          created_at,
          updated_at,
          order_items (
            id,
            product_name,
            quantity,
            product_price,
            subtotal,
            special_requests,
            toppings
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Errore durante il caricamento degli ordini');
        return;
      }

      setOrders(data || []);
    } catch (error) {
      setError('Si è verificato un errore durante il caricamento degli ordini');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Get the most recent active order (not delivered or cancelled)
  const getActiveOrder = useCallback((): Order | null => {
    const activeStatuses = ['confirmed', 'preparing', 'ready', 'arrived'];
    const activeOrder = orders.find(order => {
      // FIXED: Prioritize 'status' over 'order_status' based on MCP database analysis
      const currentStatus = order.status || order.order_status;
      return activeStatuses.includes(currentStatus);
    });
    return activeOrder || null;
  }, [orders]);

  // Check if user has any active orders - memoized to prevent recalculation
  const hasActiveOrders = useMemo((): boolean => {
    const activeStatuses = ['confirmed', 'preparing', 'ready', 'arrived'];
    return orders.some(order => {
      // FIXED: Prioritize 'status' over 'order_status' based on MCP database analysis
      const currentStatus = order.status || order.order_status;
      return activeStatuses.includes(currentStatus);
    });
  }, [orders]);

  // Load orders when user authentication changes - FIXED infinite loop by inlining
  useEffect(() => {
    console.log('📋 [USER-ORDERS-EFFECT] Auth state changed, checking if should load orders...');
    console.log('📋 [USER-ORDERS-EFFECT] State:', { isAuthenticated, hasUser: !!user });

    if (isAuthenticated && user) {
      console.log('📋 [USER-ORDERS-EFFECT] User authenticated, loading orders...');

      // INLINE the loadUserOrders logic to avoid dependency issues
      const loadOrdersInline = async () => {
        console.log('📋 [USER-ORDERS] Starting loadUserOrders...');
        console.log('📋 [USER-ORDERS] Auth state:', { isAuthenticated, userId: user?.id });

        const startTime = Date.now();
        setLoading(true);
        setError(null);

        try {
          console.log('📋 [USER-ORDERS] Executing user orders query...');

          const { data, error: fetchError } = await supabase
            .from('orders')
            .select(`
              id,
              order_number,
              customer_name,
              customer_email,
              customer_phone,
              customer_address,
              total_amount,
              status,
              order_status,
              payment_status,
              created_at,
              updated_at,
              order_items (
                id,
                product_name,
                quantity,
                product_price,
                subtotal,
                special_requests,
                toppings
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          const queryTime = Date.now() - startTime;
          console.log(`📋 [USER-ORDERS] Query completed in ${queryTime}ms`);

          if (fetchError) {
            console.error('📋 [USER-ORDERS] Error loading user orders:', fetchError);
            setError('Errore durante il caricamento degli ordini');
            return;
          }

          console.log('📋 [USER-ORDERS] Setting orders state with', data?.length || 0, 'orders');
          setOrders(data || []);
        } catch (error) {
          console.error('📋 [USER-ORDERS] Exception in loadUserOrders:', error);
          setError('Si è verificato un errore durante il caricamento degli ordini');
        } finally {
          const totalTime = Date.now() - startTime;
          console.log(`📋 [USER-ORDERS] loadUserOrders completed in ${totalTime}ms, setting loading to false`);
          setLoading(false);
        }
      };

      // Add delay to allow profile to load first
      const loadTimer = setTimeout(() => {
        loadOrdersInline();
      }, 100);

      return () => clearTimeout(loadTimer);
    } else {
      console.log('📋 [USER-ORDERS-EFFECT] User not authenticated, clearing orders');
      setOrders([]);
      setError(null);
    }
  }, [isAuthenticated, user]); // REMOVED loadUserOrders dependency

  // Set up real-time subscription for user orders - FIXED to prevent multiple subscriptions
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log('📋 [USER-ORDERS-SUB] Setting up subscription for user:', user.id);

    // Generate unique channel name with timestamp to prevent reuse
    const timestamp = Date.now();
    const channelName = `user-orders-hook-${user.id}-${timestamp}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('📋 [USER-ORDERS-SUB] Order updated:', payload);

        // Update the specific order in the list
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === payload.new.id
              ? { ...order, ...payload.new }
              : order
          )
        );

        // Show notification
        toast({
          title: 'Ordine aggiornato!',
          description: 'Lo stato di uno dei tuoi ordini è cambiato',
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('📋 [USER-ORDERS-SUB] New order created:', payload);

        // INLINE the loadUserOrders logic to avoid dependency issues
        const loadNewOrder = async () => {
          if (!user) return;

          setLoading(true);
          setError(null);

          try {
            const { data, error: fetchError } = await supabase
              .from('orders')
              .select(`
                id,
                order_number,
                customer_name,
                customer_email,
                customer_phone,
                customer_address,
                total_amount,
                status,
                order_status,
                payment_status,
                created_at,
                updated_at,
                order_items (
                  id,
                  product_name,
                  quantity,
                  product_price,
                  subtotal,
                  special_requests,
                  toppings
                )
              `)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (!fetchError) {
              setOrders(data || []);
            }
          } catch (error) {
            console.error('Error reloading orders after insert:', error);
          } finally {
            setLoading(false);
          }
        };

        loadNewOrder();

        toast({
          title: 'Nuovo ordine creato!',
          description: 'Il tuo ordine è stato registrato con successo',
        });
      })
      .subscribe((status) => {
        console.log('📋 [USER-ORDERS-SUB] Subscription status:', status);
      });

    return () => {
      console.log('📋 [USER-ORDERS-SUB] Cleaning up subscription for:', channelName);
      // Unsubscribe first, then remove channel
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user]); // REMOVED toast dependency to prevent multiple subscriptions

  return {
    orders,
    loading,
    error,
    refreshOrders,
    getActiveOrder,
    hasActiveOrders,
  };
};

// Helper function to get order status info
export const getOrderStatusInfo = (status: string) => {
  const statusMap = {
    'pending': { label: 'In attesa', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    'confirmed': { label: 'Confermato', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    'preparing': { label: 'In preparazione', color: 'bg-orange-100 text-orange-800', icon: '👨‍🍳' },
    'ready': { label: 'Pronto', color: 'bg-green-100 text-green-800', icon: '📦' },
    'arrived': { label: 'Arrivato', color: 'bg-purple-100 text-purple-800', icon: '🚪' },
    'delivered': { label: 'Consegnato', color: 'bg-green-100 text-green-800', icon: '🚚' },
    'cancelled': { label: 'Annullato', color: 'bg-red-100 text-red-800', icon: '❌' },
  };

  return statusMap[status] || statusMap['pending'];
};

// Helper function to format price
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default useUserOrders;
