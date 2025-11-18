import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import useUserOrders from '@/hooks/useUserOrders';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Euro,
  Pizza,
  AlertCircle,
  Loader2,
  ChefHat,
  DoorOpen,
  Home,
  Lock,
  LogIn
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_requests?: string;
  toppings?: string[];
}

const OrderTracking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [customerEmail, setCustomerEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, user, loading: authLoading } = useCustomerAuth();
  const { orders: userOrders, loading: userOrdersLoading } = useUserOrders();

  // Order status configuration with beautiful motorcycle delivery tracking
  const orderStatuses = [
    {
      value: 'confirmed',
      label: 'Confermato',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle,
      description: 'Il tuo ordine è stato confermato e verrà preparato',
      motorcyclePosition: 0
    },
    {
      value: 'preparing',
      label: 'In preparazione',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: ChefHat,
      description: 'I nostri chef stanno preparando il tuo ordine',
      motorcyclePosition: 25
    },
    {
      value: 'ready',
      label: 'Pronto',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Package,
      description: 'Il tuo ordine è pronto per la consegna',
      motorcyclePosition: 50
    },
    {
      value: 'out_for_delivery',
      label: 'In consegna',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Truck,
      description: 'Il tuo ordine è in viaggio verso di te',
      motorcyclePosition: 75
    },
    {
      value: 'arrived',
      label: 'Arrivato alla porta',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: DoorOpen,
      description: 'Il nostro rider è arrivato alla tua porta',
      motorcyclePosition: 90
    },
    {
      value: 'delivered',
      label: 'Consegnato',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Home,
      description: 'Il tuo ordine è stato consegnato con successo',
      motorcyclePosition: 100
    },
    {
      value: 'cancelled',
      label: 'Annullato',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      description: 'Il tuo ordine è stato annullato',
      motorcyclePosition: 0
    }
  ];

  // Get current status info
  const getCurrentStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  // Get status progress with motorcycle positioning
  const getStatusProgress = (currentStatus: string) => {
    const statusOrder = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'arrived', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === 'cancelled') {
      return { current: -1, total: statusOrder.length, percentage: 0 };
    }

    // Use motorcycle position from status configuration for more accurate positioning
    const statusInfo = getCurrentStatusInfo(currentStatus);
    const percentage = statusInfo.motorcyclePosition || ((currentIndex + 1) / statusOrder.length) * 100;

    return {
      current: currentIndex + 1,
      total: statusOrder.length,
      percentage: percentage
    };
  };

  // 🔒 SECURITY: Search for order only for authenticated users
  const searchOrder = async () => {
    if (!isAuthenticated || !user) {
      setError('Devi essere autenticato per visualizzare gli ordini');
      return;
    }

    if (!orderNumber.trim()) {
      setError('Inserisci il numero ordine');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      // 🔒 SECURITY: Only search orders belonging to the authenticated user
      const { data, error: searchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            subtotal,
            special_requests,
            toppings
          )
        `)
        .eq('order_number', orderNumber.trim())
        .eq('user_id', user.id) // 🔒 SECURITY: Only user's own orders
        .single();

      if (searchError) {
        if (searchError.code === 'PGRST116') {
          setError('Ordine non trovato. Verifica il numero ordine.');
        } else {
          setError('Errore durante la ricerca dell\'ordine.');
        }
        return;
      }

      setOrder(data);
      toast({
        title: 'Ordine trovato!',
        description: `Ordine #${data.order_number} caricato con successo`,
      });

    } catch (err) {
      console.error('Search error:', err);
      setError('Errore durante la ricerca dell\'ordine.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if URL params are provided
  useEffect(() => {
    if (orderNumber && customerEmail) {
      searchOrder();
    }
  }, []);

  // Real-time order updates
  useEffect(() => {
    if (!order) return;

    // Generate unique channel name with timestamp to prevent reuse
    const timestamp = Date.now();
    const channelName = `order-tracking-${order.id}-${timestamp}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${order.id}`
      }, (payload) => {
        console.log('Order updated:', payload);
        setOrder(prev => prev ? { ...prev, ...payload.new } : null);
        
        toast({
          title: 'Ordine aggiornato!',
          description: 'Lo stato del tuo ordine è stato aggiornato',
        });
      })
      .subscribe();

    return () => {
      console.log('📋 [ORDER-TRACKING] Cleaning up subscription for:', channelName);
      // Unsubscribe first, then remove channel
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [order]); // REMOVED toast dependency to prevent multiple subscriptions

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
    return `€${price.toFixed(2)}`;
  };

  // 🔒 SECURITY: Show authentication required message if not logged in
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pizza-orange mx-auto mb-4" />
          <p className="text-lg text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-orange-50 overflow-hidden">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-pizza-orange to-red-500 text-white">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Accesso Richiesto
              </CardTitle>
              <p className="text-white/90 mt-2">
                Devi essere autenticato per visualizzare i tuoi ordini
              </p>
            </CardHeader>
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Per garantire la sicurezza e la privacy dei tuoi ordini, è necessario effettuare l'accesso al tuo account.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/my-orders')}
                    className="bg-gradient-to-r from-pizza-orange to-red-500 hover:from-red-500 hover:to-pizza-orange text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Accedi ai tuoi Ordini
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="border-pizza-orange text-pizza-orange hover:bg-pizza-orange hover:text-white py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    Torna alla Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-pizza-orange to-red-500 p-6 rounded-full shadow-2xl">
              <Pizza className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-pizza-orange to-red-500 bg-clip-text text-transparent">
            I tuoi Ordini
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Benvenuto {user?.user_metadata?.full_name || user?.email}! Inserisci il numero ordine per seguire lo stato in tempo reale
          </p>
        </div>

        {/* Modern Search Form */}
        <Card className="mb-12 shadow-2xl border-0 bg-gradient-to-br from-white to-orange-50 overflow-hidden max-w-2xl mx-auto">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-pizza-orange to-red-500 text-white">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-full">
                <Search className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Cerca il tuo Ordine
            </CardTitle>
            <p className="text-white/90 mt-2">
              Inserisci il numero ordine per iniziare il tracking
            </p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  🎫 Numero Ordine
                </label>
                <div className="relative">
                  <Input
                    placeholder="es. ORD-996366156"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full h-12 pl-12 text-lg border-2 border-gray-200 focus:border-pizza-orange rounded-xl shadow-sm transition-all duration-200"
                  />
                  <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Account: {user?.email}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Verranno mostrati solo i tuoi ordini personali
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700 animate-pulse">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <Button
              onClick={searchOrder}
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-pizza-orange to-red-500 hover:from-red-500 hover:to-pizza-orange text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Ricerca in corso...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-3" />
                  Traccia il tuo Ordine
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">
                      Ordine #{order.order_number}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      Ordinato il {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pizza-orange">
                      {formatPrice(order.total_amount)}
                    </div>
                    <Badge
                      className={`${getCurrentStatusInfo(order.status).color} border`}
                    >
                      {getCurrentStatusInfo(order.status).label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Status Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Stato dell'Ordine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {React.createElement(getCurrentStatusInfo(order.status).icon, {
                      className: "h-8 w-8 text-pizza-orange"
                    })}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {getCurrentStatusInfo(order.status).label}
                      </h3>
                      <p className="text-gray-600">
                        {getCurrentStatusInfo(order.status).description}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Ultimo aggiornamento: {formatDate(order.updated_at)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {order.status !== 'cancelled' && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progresso</span>
                        <span>{getStatusProgress(order.status).percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pizza-orange to-pizza-red h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getStatusProgress(order.status).percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Modern Motorcycle Delivery Tracking */}
                  <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 rounded-2xl border border-indigo-200 shadow-lg overflow-hidden">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-8 h-8 bg-pizza-orange rounded-full animate-pulse"></div>
                      <div className="absolute top-12 right-8 w-6 h-6 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                      <div className="absolute bottom-8 left-12 w-4 h-4 bg-green-500 rounded-full animate-pulse delay-700"></div>
                    </div>

                    {/* Modern Road with 3D Effect */}
                    <div className="absolute inset-x-0 bottom-16 h-4 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 rounded-full shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900 to-transparent rounded-full"></div>
                      {/* Animated Road Markings */}
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-90 animate-pulse"></div>
                        <div className="absolute w-full flex justify-between px-8">
                          <div className="w-8 h-0.5 bg-white opacity-60 animate-pulse delay-100"></div>
                          <div className="w-8 h-0.5 bg-white opacity-60 animate-pulse delay-300"></div>
                          <div className="w-8 h-0.5 bg-white opacity-60 animate-pulse delay-500"></div>
                          <div className="w-8 h-0.5 bg-white opacity-60 animate-pulse delay-700"></div>
                        </div>
                      </div>
                    </div>

                    {/* Status Points */}
                    <div className="relative flex justify-between items-center mb-12">
                      {orderStatuses
                        .filter(status => status.value !== 'cancelled')
                        .map((status, index) => {
                          const isCompleted = orderStatuses.findIndex(s => s.value === order.status) >= index;
                          const isCurrent = status.value === order.status;
                          const StatusIcon = status.icon;
                          const totalSteps = orderStatuses.filter(s => s.value !== 'cancelled').length;
                          const progressPercentage = (index / (totalSteps - 1)) * 100;

                          return (
                            <div
                              key={status.value}
                              className="relative flex flex-col items-center z-10"
                              style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%)' }}
                            >
                              {/* Status Point */}
                              <div className={`relative w-16 h-16 rounded-full border-4 transition-all duration-500 ${
                                isCurrent
                                  ? 'bg-pizza-orange border-pizza-orange shadow-xl scale-110 animate-pulse'
                                  : isCompleted
                                  ? 'bg-green-500 border-green-500 shadow-lg'
                                  : 'bg-gray-300 border-gray-400'
                              }`}>
                                <StatusIcon className={`h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                                  isCurrent || isCompleted ? 'text-white' : 'text-gray-600'
                                }`} />

                                {/* Ripple effect for current status */}
                                {isCurrent && (
                                  <div className="absolute inset-0 rounded-full bg-pizza-orange opacity-30 animate-ping"></div>
                                )}
                              </div>

                              {/* Status Label */}
                              <div className="mt-4 text-center max-w-24">
                                <p className={`text-sm font-semibold ${
                                  isCurrent ? 'text-pizza-orange' : isCompleted ? 'text-green-700' : 'text-gray-500'
                                }`}>
                                  {status.label}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  isCurrent ? 'text-pizza-orange/70' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                  {status.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Animated Motorcycle */}
                    <div
                      className="absolute bottom-8 transition-all duration-1000 ease-in-out z-20"
                      style={{
                        left: `${Math.max(0, Math.min(95, getStatusProgress(order.status).percentage))}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="relative">
                        {/* Beautiful Delivery Motorcycle SVG */}
                        <div className={`transition-transform duration-300 ${
                          order.status === 'delivered' ? 'animate-bounce' : 'animate-pulse'
                        }`}>
                          <svg width="80" height="50" viewBox="0 0 80 50" className="drop-shadow-2xl">
                            {/* Motorcycle Shadow */}
                            <ellipse cx="40" cy="47" rx="35" ry="3" fill="rgba(0,0,0,0.15)" />

                            {/* Front Wheel with Spokes */}
                            <circle cx="15" cy="37" r="10" fill="#1a202c" stroke="#2d3748" strokeWidth="1"/>
                            <circle cx="15" cy="37" r="7" fill="#4a5568" stroke="#718096" strokeWidth="1"/>
                            <circle cx="15" cy="37" r="4" fill="#e2e8f0"/>
                            <circle cx="15" cy="37" r="1.5" fill="#2d3748"/>
                            {/* Spokes */}
                            <g stroke="#cbd5e0" strokeWidth="0.5">
                              <line x1="15" y1="30" x2="15" y2="44"/>
                              <line x1="8" y1="37" x2="22" y2="37"/>
                              <line x1="10" y1="32" x2="20" y2="42"/>
                              <line x1="20" y1="32" x2="10" y2="42"/>
                            </g>

                            {/* Rear Wheel with Spokes */}
                            <circle cx="65" cy="37" r="10" fill="#1a202c" stroke="#2d3748" strokeWidth="1"/>
                            <circle cx="65" cy="37" r="7" fill="#4a5568" stroke="#718096" strokeWidth="1"/>
                            <circle cx="65" cy="37" r="4" fill="#e2e8f0"/>
                            <circle cx="65" cy="37" r="1.5" fill="#2d3748"/>
                            {/* Spokes */}
                            <g stroke="#cbd5e0" strokeWidth="0.5">
                              <line x1="65" y1="30" x2="65" y2="44"/>
                              <line x1="58" y1="37" x2="72" y2="37"/>
                              <line x1="60" y1="32" x2="70" y2="42"/>
                              <line x1="70" y1="32" x2="60" y2="42"/>
                            </g>

                            {/* Gradients */}
                            <defs>
                              <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3182ce"/>
                                <stop offset="50%" stopColor="#2c5282"/>
                                <stop offset="100%" stopColor="#2a4365"/>
                              </linearGradient>
                              <linearGradient id="seatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4a5568"/>
                                <stop offset="100%" stopColor="#2d3748"/>
                              </linearGradient>
                            </defs>

                            {/* Frame Body */}
                            <path d="M25 37 L55 37 L53 25 L27 25 Z" fill="url(#frameGradient)" stroke="#2c5282" strokeWidth="1"/>
                            <path d="M25 37 L15 32 L20 25 L27 25" fill="url(#frameGradient)" stroke="#2c5282" strokeWidth="1"/>
                            <path d="M55 37 L65 32 L60 25 L53 25" fill="url(#frameGradient)" stroke="#2c5282" strokeWidth="1"/>

                            {/* Seat */}
                            <ellipse cx="45" cy="22" rx="10" ry="4" fill="url(#seatGradient)" stroke="#1a202c" strokeWidth="1"/>

                            {/* Handlebars */}
                            <path d="M22 27 L12 22 M22 27 L12 32" stroke="#4a5568" strokeWidth="2.5" strokeLinecap="round"/>
                            <circle cx="12" cy="22" r="1.5" fill="#e2e8f0"/>
                            <circle cx="12" cy="32" r="1.5" fill="#e2e8f0"/>

                            {/* Rider with Better Details */}
                            <circle cx="38" cy="18" r="5" fill="#fbbf24"/>
                            <ellipse cx="38" cy="25" rx="4" ry="6" fill="#3182ce"/>
                            <ellipse cx="35" cy="30" rx="2" ry="4" fill="#2c5282"/>
                            <ellipse cx="41" cy="30" rx="2" ry="4" fill="#2c5282"/>

                            {/* Modern Helmet with Visor */}
                            <circle cx="38" cy="18" r="6" fill="#dc2626" stroke="#991b1b" strokeWidth="1"/>
                            <ellipse cx="38" cy="16" rx="4" ry="2" fill="rgba(255,255,255,0.4)"/>
                            <ellipse cx="38" cy="16" rx="3" ry="1.5" fill="rgba(59, 130, 246, 0.3)"/>

                            {/* Exhaust Pipe */}
                            <ellipse cx="70" cy="35" rx="3" ry="1" fill="#718096"/>
                            <ellipse cx="73" cy="35" rx="1" ry="0.5" fill="#a0aec0"/>

                            {/* Headlight */}
                            <circle cx="8" cy="27" r="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
                            <circle cx="8" cy="27" r="1.5" fill="#fef3c7"/>
                          </svg>

                          {/* Premium Delivery Box */}
                          <div className="absolute -top-1 -right-2 w-8 h-8 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-lg border-2 border-white shadow-lg flex items-center justify-center transform rotate-12">
                            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-white">🍕</span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Speed Lines for Motion */}
                        {(order.status === 'out_for_delivery' || order.status === 'arrived') && (
                          <div className="absolute -left-12 top-1/2 transform -translate-y-1/2">
                            <div className="flex space-x-1">
                              <div className="w-6 h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-70 animate-pulse rounded-full"></div>
                              <div className="w-4 h-0.5 bg-gradient-to-r from-blue-400 to-transparent opacity-50 animate-pulse delay-100 rounded-full"></div>
                              <div className="w-3 h-0.5 bg-gradient-to-r from-blue-300 to-transparent opacity-30 animate-pulse delay-200 rounded-full"></div>
                            </div>
                          </div>
                        )}

                        {/* Status Indicator */}
                        {order.status === 'delivered' && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                              ✓ Consegnato!
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Modern Progress Bar */}
                    <div className="absolute inset-x-8 bottom-6 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-pizza-orange via-yellow-400 to-green-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${getStatusProgress(order.status).percentage}%` }}
                      >
                        <div className="h-full bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-full"></div>
                      </div>
                    </div>

                    {/* Modern Status Message */}
                    <div className="mt-8 text-center">
                      <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 ${
                        order.status === 'delivered'
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300'
                          : order.status === 'arrived'
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-2 border-yellow-300'
                          : order.status === 'out_for_delivery'
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-300'
                          : order.status === 'preparing'
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-2 border-orange-300'
                          : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-300'
                      }`}>
                        <div className={`w-4 h-4 rounded-full shadow-sm ${
                          order.status === 'delivered' ? 'bg-green-500' :
                          order.status === 'arrived' ? 'bg-yellow-500 animate-pulse' :
                          order.status === 'out_for_delivery' ? 'bg-blue-500 animate-pulse' :
                          order.status === 'preparing' ? 'bg-orange-500 animate-pulse' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="font-bold">{getCurrentStatusInfo(order.status).description}</span>
                        {order.status === 'delivered' && <span className="text-2xl">🎉</span>}
                        {order.status === 'arrived' && <span className="text-2xl">🚪</span>}
                        {order.status === 'out_for_delivery' && <span className="text-2xl">🏍️</span>}
                        {order.status === 'preparing' && <span className="text-2xl">👨‍🍳</span>}
                      </div>
                    </div>

                    {/* Estimated Time and Additional Info */}
                    <div className="mt-4 text-center space-y-2">
                      {order.status === 'out_for_delivery' && (
                        <p className="text-sm text-blue-600 font-medium">
                          🕒 Tempo stimato di consegna: <span className="font-bold">15-30 minuti</span>
                        </p>
                      )}
                      {order.status === 'preparing' && (
                        <p className="text-sm text-orange-600 font-medium">
                          👨‍🍳 La tua pizza è in preparazione nel nostro forno a legna!
                        </p>
                      )}
                      {order.status === 'arrived' && (
                        <p className="text-sm text-yellow-600 font-medium">
                          🚪 Il nostro rider è arrivato alla tua porta! Preparati a ricevere il tuo ordine!
                        </p>
                      )}
                      {order.status === 'delivered' && (
                        <p className="text-sm text-green-600 font-medium">
                          🎉 Buon appetito! Grazie per aver scelto la nostra pizzeria!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline (Detailed View) */}
                  <div className="space-y-3 mt-8">
                    <h4 className="font-semibold text-gray-800 mb-4">Cronologia Dettagliata</h4>
                    {orderStatuses
                      .filter(status => status.value !== 'cancelled')
                      .map((status, index) => {
                        const isCompleted = orderStatuses.findIndex(s => s.value === order.status) >= index;
                        const isCurrent = status.value === order.status;
                        const StatusIcon = status.icon;

                        return (
                          <div
                            key={status.value}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                              isCurrent
                                ? 'bg-pizza-orange/10 border border-pizza-orange/20'
                                : isCompleted
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className={`p-2 rounded-full ${
                              isCurrent
                                ? 'bg-pizza-orange text-white'
                                : isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                isCurrent ? 'text-pizza-orange' : isCompleted ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                {status.label}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {status.description}
                              </p>
                            </div>
                            {isCompleted && !isCurrent && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Informazioni Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium">{order.customer_email}</span>
                    </div>
                    {order.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Telefono:</span>
                        <span className="font-medium">{order.customer_phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {order.customer_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm text-gray-600">Indirizzo:</span>
                          <p className="font-medium">{order.customer_address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {order.order_items && order.order_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pizza className="h-5 w-5" />
                    Dettagli Ordine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.order_items.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{item.product_name}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <span>Quantità: {item.quantity}</span>
                            <span className="mx-2">•</span>
                            <span>Prezzo unitario: {formatPrice(item.unit_price)}</span>
                          </div>
                          {item.special_requests && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">
                                Richieste speciali:
                              </span>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.special_requests}
                              </p>
                            </div>
                          )}
                          {item.toppings && item.toppings.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">
                                Extra:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.toppings.map((topping, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {topping}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-lg">
                            {formatPrice(item.subtotal)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Order Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Totale:</span>
                        <span className="text-2xl font-bold text-pizza-orange">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Note Ordine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Stato Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Stato pagamento:</span>
                  <Badge
                    className={
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : order.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }
                  >
                    {order.payment_status === 'paid' ? 'Pagato' :
                     order.payment_status === 'pending' ? 'In attesa' :
                     'Non pagato'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Hai bisogno di aiuto?
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Se hai domande sul tuo ordine, non esitare a contattarci
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <Phone className="h-4 w-4 mr-2" />
                      Chiamaci
                    </Button>
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <Mail className="h-4 w-4 mr-2" />
                      Invia Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
