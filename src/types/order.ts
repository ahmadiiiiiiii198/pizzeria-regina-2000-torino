// Unified Order Types for the Pizzeria Application

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  product_price?: number; // For compatibility with useUserOrders
  unit_price?: number;    // For compatibility with use-persistent-order
  subtotal: number;
  special_requests?: string;
  toppings?: string | string[]; // Support both formats
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string; // Made optional for compatibility
  total_amount: number;
  status: string;
  order_status?: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  order_items?: OrderItem[]; // Made optional for compatibility
}

export interface StoredOrderInfo {
  orderNumber: string;
  customerEmail: string;
  lastChecked: string;
  orderId?: string;
}

// Order status information
export interface OrderStatusInfo {
  label: string;
  color: string;
  icon: string;
}

// Hook return types
export interface UseUserOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  getActiveOrder: () => Order | null;
  hasActiveOrders: boolean;
}

export interface UsePersistentOrderReturn {
  order: Order | null;
  loading: boolean;
  error: string | null;
  searchOrder: (orderNumber: string, customerEmail: string) => Promise<void>;
  clearOrder: () => void;
  refreshOrder: () => Promise<void>;
  hasStoredOrder: boolean;
  storedOrderInfo: StoredOrderInfo | null;
}

// Helper function to normalize order item price
export const getOrderItemPrice = (item: OrderItem): number => {
  return item.product_price || item.unit_price || 0;
};

// Helper function to normalize toppings
export const getOrderItemToppings = (item: OrderItem): string[] => {
  if (!item.toppings) return [];
  if (Array.isArray(item.toppings)) return item.toppings;
  return [item.toppings];
};

// Helper function to format toppings for display
export const formatToppings = (item: OrderItem): string => {
  const toppings = getOrderItemToppings(item);
  return toppings.join(', ');
};
