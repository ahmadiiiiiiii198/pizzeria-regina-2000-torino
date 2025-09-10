import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, MapPin, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CustomerAuthModal from '@/components/customer/CustomerAuthModal';

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

const MyOrders: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  // Order status configuration
  const orderStatuses = [
    {
      value: 'confirmed',
      label: 'Confermato',
      color: 'bg-blue-100 text-blue-800',
      icon: CheckCircle,
      description: 'Il tuo ordine è stato confermato'
    },
    {
      value: 'preparing',
      label: 'In preparazione',
      color: 'bg-orange-100 text-orange-800',
      icon: Clock,
      description: 'I nostri chef stanno preparando il tuo ordine'
    },
    {
      value: 'ready',
      label: 'Pronto',
      color: 'bg-green-100 text-green-800',
      icon: Package,
      description: 'Il tuo ordine è pronto per la consegna'
    },
    {
      value: 'arrived',
      label: 'Arrivato',
      color: 'bg-purple-100 text-purple-800',
      icon: MapPin,
      description: 'Il corriere è arrivato alla tua porta'
    },
    {
      value: 'delivered',
      label: 'Consegnato',
      color: 'bg-green-100 text-green-800',
      icon: Truck,
      description: 'Ordine consegnato con successo'
    },
    {
      value: 'cancelled',
      label: 'Annullato',
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
      description: 'Ordine annullato'
    }
  ];

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const loadUserOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error loading orders:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare i tuoi ordini',
          variant: 'destructive',
        });
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante il caricamento degli ordini',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserOrders();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  // Real-time order updates
  useEffect(() => {
    if (!user) return;

    // Generate unique channel name with timestamp to prevent reuse
    const timestamp = Date.now();
    const channelName = `user-orders-page-${user.id}-${timestamp}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Order updated:', payload);
        loadUserOrders(); // Reload orders when any order is updated
        
        toast({
          title: 'Ordine aggiornato!',
          description: 'Lo stato di uno dei tuoi ordini è cambiato',
        });
      })
      .subscribe();

    return () => {
      console.log('📋 [MY-ORDERS] Cleaning up subscription for:', channelName);
      // Unsubscribe first, then remove channel
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user]); // REMOVED toast dependency to prevent multiple subscriptions

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento ordini...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Accesso Richiesto</CardTitle>
            <CardDescription>
              Devi effettuare l'accesso per visualizzare i tuoi ordini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowAuthModal(true)} 
              className="w-full"
            >
              Accedi al tuo Account
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBackToHome}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al Sito
            </Button>
          </CardContent>
        </Card>

        <CustomerAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab="login"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna al Sito
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">I Miei Ordini</h1>
                <p className="text-gray-600">Visualizza e traccia i tuoi ordini</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun ordine trovato
              </h3>
              <p className="text-gray-600 mb-4">
                Non hai ancora effettuato nessun ordine
              </p>
              <Button onClick={handleBackToHome}>
                Inizia a Ordinare
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStatus = order.order_status || order.status;
              const statusInfo = getStatusInfo(currentStatus);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Ordine #{order.order_number}
                        </CardTitle>
                        <CardDescription>
                          Ordinato il {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        <p className="text-lg font-bold mt-1">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium mb-2">Articoli ordinati:</h4>
                        <div className="space-y-2">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                {item.toppings && (
                                  <p className="text-sm text-gray-600">
                                    Extra: {item.toppings}
                                  </p>
                                )}
                                {item.special_requests && (
                                  <p className="text-sm text-gray-600">
                                    Note: {item.special_requests}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {item.quantity}x {formatPrice(item.product_price)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formatPrice(item.subtotal)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <h4 className="font-medium mb-1">Indirizzo di consegna:</h4>
                        <p className="text-gray-600">{order.customer_address}</p>
                      </div>

                      {/* Status Description */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <StatusIcon className="inline mr-1 h-4 w-4" />
                          {statusInfo.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
