import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import useUserOrders, { getOrderStatusInfo, formatPrice } from '@/hooks/useUserOrders';
import { getOrderItemPrice } from '@/types/order';
import { MapPin } from 'lucide-react';

// Clean Pizza Delivery Animation Component
const BigMotorcycleAnimation: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <div className="relative w-full h-48 flex justify-center items-center overflow-hidden">
    <style jsx>{`
      @keyframes delivery-float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-6px);
        }
      }

      @keyframes wheel-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes speed-dash {
        0% {
          opacity: 0;
          transform: translateX(30px);
        }
        50% {
          opacity: 1;
          transform: translateX(0px);
        }
        100% {
          opacity: 0;
          transform: translateX(-30px);
        }
      }

      @keyframes pizza-heat {
        0%, 100% {
          opacity: 0.7;
          transform: translateY(0px) scale(1);
        }
        50% {
          opacity: 1;
          transform: translateY(-6px) scale(1.1);
        }
      }

      .delivery-vehicle {
        animation: ${isActive ? 'delivery-float 2s ease-in-out infinite' : 'none'};
      }

      .wheel-animation {
        animation: ${isActive ? 'wheel-rotate 0.4s linear infinite' : 'none'};
        transform-origin: center;
      }

      .speed-lines {
        animation: ${isActive ? 'speed-dash 1s ease-out infinite' : 'none'};
      }

      .pizza-steam {
        animation: pizza-heat 2.5s ease-in-out infinite;
      }
    `}</style>

    {/* Clean Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl"></div>

    {/* Speed Lines */}
    {isActive && (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="speed-lines absolute top-1/2 right-0 w-12 h-0.5 bg-gradient-to-l from-orange-400 to-transparent rounded-full"
            style={{
              animationDelay: `${i * 0.2}s`,
              top: `${50 + i * 8}%`
            }}
          />
        ))}
      </div>
    )}

    <svg viewBox="0 0 240 120" className="w-full h-48 relative z-10">
      <defs>
        <linearGradient id="scooterBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
        <linearGradient id="deliveryBox" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA500" />
          <stop offset="50%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FF7F00" />
        </linearGradient>
      </defs>

      {/* Simple Road */}
      <rect x="0" y="100" width="240" height="20" fill="#6B7280" rx="2"/>
      <line
        x1="0" y1="110" x2="240" y2="110"
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeDasharray="10,5"
      />

      {/* Vehicle Shadow */}
      <ellipse cx="120" cy="115" rx="35" ry="5" fill="#000000" opacity="0.15"/>

      {/* CLEAN DELIVERY SCOOTER */}
      <g className="delivery-vehicle">

        {/* Simple Scooter Body */}
        <ellipse cx="120" cy="75" rx="45" ry="15" fill="url(#scooterBody)" stroke="#B91C1C" strokeWidth="2"/>
        <ellipse cx="120" cy="72" rx="35" ry="8" fill="#F87171" opacity="0.6"/>

        {/* Handlebars */}
        <line x1="70" y1="65" x2="85" y2="75" stroke="#374151" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="70" cy="65" r="3" fill="#6B7280"/>

        {/* Headlight */}
        <circle cx="65" cy="70" r="5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
        <circle cx="65" cy="70" r="3" fill="#FFFFFF" opacity="0.8"/>

        {/* Front Wheel */}
        <g className="wheel-animation">
          <circle cx="85" cy="95" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
          <circle cx="85" cy="95" r="8" fill="#374151"/>
          <circle cx="85" cy="95" r="4" fill="#6B7280"/>
          {/* Simple spokes */}
          <line x1="79" y1="95" x2="91" y2="95" stroke="#9CA3AF" strokeWidth="1"/>
          <line x1="85" y1="89" x2="85" y2="101" stroke="#9CA3AF" strokeWidth="1"/>
          <line x1="80" y1="90" x2="90" y2="100" stroke="#9CA3AF" strokeWidth="1"/>
          <line x1="90" y1="90" x2="80" y2="100" stroke="#9CA3AF" strokeWidth="1"/>
        </g>

        {/* Rear Wheel */}
        <g className="wheel-animation">
          <circle cx="155" cy="95" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
          <circle cx="155" cy="95" r="8" fill="#374151"/>
          <circle cx="155" cy="95" r="4" fill="#6B7280"/>
          {/* Simple spokes */}
          <line x1="149" y1="95" x2="161" y2="95" stroke="#9CA3AF" strokeWidth="1"/>
          <line x1="155" y1="89" x2="155" y2="101" stroke="#9CA3AF" strokeWidth="1"/>
          <line x1="150" y1="90" x2="160" y2="100" stroke="#9CA3AF" strokeWidth="1"/>
          <line x1="160" y1="90" x2="150" y2="100" stroke="#9CA3AF" strokeWidth="1"/>
        </g>

        {/* Pizza Delivery Box */}
        <rect x="105" y="50" width="30" height="25" rx="4" fill="url(#deliveryBox)" stroke="#FF7F00" strokeWidth="2"/>
        <rect x="108" y="53" width="24" height="19" rx="3" fill="#FFD700"/>
        <text x="120" y="65" textAnchor="middle" fontSize="10" fill="#DC2626" fontWeight="bold">🍕</text>
        <text x="120" y="58" textAnchor="middle" fontSize="6" fill="#991B1B" fontWeight="bold">PIZZA</text>

        {/* Pizza Steam */}
        <g className="pizza-steam">
          <circle cx="110" cy="45" r="1.5" fill="#E5E7EB" opacity="0.8"/>
          <circle cx="120" cy="42" r="1.2" fill="#E5E7EB" opacity="0.6"/>
          <circle cx="130" cy="46" r="1.3" fill="#E5E7EB" opacity="0.7"/>
        </g>

        {/* Simple Exhaust */}
        <rect x="165" y="80" width="10" height="4" rx="2" fill="#6B7280"/>

        {/* Delivery Text */}
        {isActive && (
          <text x="120" y="25" textAnchor="middle" fontSize="10" fill="#DC2626" fontWeight="bold" className="animate-pulse">
            🏍️ IN CONSEGNA 🍕
          </text>
        )}

      </g>
    </svg>
  </div>


);

function OrderTrackingSection(): JSX.Element | null {
  const { isAuthenticated } = useCustomerAuth();
  const { orders: userOrders, loading } = useUserOrders();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeOrders = useMemo(() => {
    if (!isAuthenticated || !userOrders) return [];
    return userOrders.filter(order =>
      order.status !== 'delivered' &&
      order.status !== 'cancelled'
    );
  }, [isAuthenticated, userOrders]);

  if (!isAuthenticated || !activeOrders.length || loading) {
    return null;
  }

  // Check if there are any active orders (show banner for all statuses)
  const hasActiveDelivery = activeOrders.length > 0;

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 15;
      case 'confirmed': return 30;
      case 'preparing': return 50;
      case 'ready': return 70;
      case 'delivering': case 'out_for_delivery': return 85;
      case 'arrived': return 95;
      case 'delivered': return 100;
      default: return 10;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '📦';
      case 'delivering': case 'out_for_delivery': return '🏍️';
      case 'arrived': return '🚪';
      case 'delivered': return '🎉';
      default: return '📋';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      {/* Clean Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-pizza-orange/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-red-500/10 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-500/10 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-green-500/10 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Special Delivery Banner */}
        {hasActiveDelivery && (
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white p-6 rounded-2xl shadow-2xl mb-8 animate-pulse">
            <div className="flex items-center justify-center gap-4">
              <span className="text-3xl animate-bounce">🏍️</span>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-1">CONSEGNA IN CORSO!</h3>
                <p className="text-blue-100">Il tuo rider è in viaggio verso di te con la tua pizza calda!</p>
              </div>
              <span className="text-3xl animate-bounce delay-300">🍕</span>
            </div>
          </div>
        )}

        {/* Clean Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-pizza-orange to-red-500 p-6 rounded-full shadow-2xl animate-pulse">
              <span className="text-4xl">🍕</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pizza-orange via-red-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Traccia i Tuoi Ordini
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Segui in tempo reale lo stato dei tuoi ordini dalla preparazione alla consegna
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((order) => {
              const currentStatus = order.status || order.order_status || 'pending';
              let statusInfo;
              try {
                statusInfo = getOrderStatusInfo(currentStatus);
              } catch (error) {
                console.error('Error getting status info:', error);
                statusInfo = { label: 'In elaborazione', color: 'bg-yellow-500' };
              }

              return (
                <Card key={order.id} className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-white rounded-2xl overflow-hidden">
                  {/* Clean Card Header */}
                  <CardHeader className="bg-gradient-to-r from-pizza-orange to-red-500 text-white p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍕</span>
                        <div>
                          <CardTitle className="text-xl font-bold">
                            Ordine #{order.order_number || order.id?.slice(-8)}
                          </CardTitle>
                          <p className="text-white/90 text-sm">
                            {formatTime(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold">
                          €{formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Big Motorcycle Animation for All Order Statuses */}
                    {currentStatus && (
                      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border-2 border-blue-300 shadow-xl mb-6">
                        <div className="text-center mb-4">
                          <h3 className="text-2xl font-bold text-blue-800 mb-2">
                            {currentStatus === 'preparing' && '👨‍🍳 Pizza in Preparazione! 🍕'}
                            {currentStatus === 'ready' && '✅ Pizza Pronta! 🍕'}
                            {currentStatus === 'delivering' && '🏍️ Il Tuo Ordine è in Viaggio! 🍕'}
                            {currentStatus === 'out_for_delivery' && '🏍️ Il Tuo Ordine è in Viaggio! 🍕'}
                            {currentStatus === 'arrived' && '🚪 Il Rider è Arrivato! 🍕'}
                            {currentStatus === 'delivered' && '🎉 Ordine Consegnato! 🍕'}
                            {!['preparing', 'ready', 'delivering', 'out_for_delivery', 'arrived', 'delivered'].includes(currentStatus) && '🍕 Il Tuo Ordine! 🍕'}
                          </h3>
                          <p className="text-blue-600 font-medium">
                            {currentStatus === 'preparing' && 'I nostri chef stanno preparando la tua pizza con ingredienti freschi!'}
                            {currentStatus === 'ready' && 'La tua pizza è pronta e sta aspettando il rider!'}
                            {currentStatus === 'delivering' && 'Il nostro rider sta arrivando da te con la tua pizza calda!'}
                            {currentStatus === 'out_for_delivery' && 'Il nostro rider sta arrivando da te con la tua pizza calda!'}
                            {currentStatus === 'arrived' && 'Il nostro rider è arrivato alla tua porta con la pizza calda!'}
                            {currentStatus === 'delivered' && 'La tua pizza è stata consegnata con successo! Buon appetito!'}
                            {!['preparing', 'ready', 'delivering', 'out_for_delivery', 'arrived', 'delivered'].includes(currentStatus) && 'Segui il progresso del tuo ordine qui!'}
                          </p>
                        </div>
                        <BigMotorcycleAnimation isActive={currentStatus === 'delivering' || currentStatus === 'out_for_delivery'} />
                        <div className="mt-6">
                          <div className="w-full bg-blue-200 rounded-full h-4 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                              style={{ width: `${getProgressPercentage(currentStatus)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex justify-between mt-2 text-sm font-bold text-blue-700">
                            <span>Partito</span>
                            <span>In viaggio</span>
                            <span>Quasi arrivato</span>
                          </div>
                        </div>
                      </div>
                    )}



                    {/* Order Items */}
                    {order.order_items && Array.isArray(order.order_items) && order.order_items.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          <span className="text-xl">🍕</span>
                          I Tuoi Prodotti
                        </h4>
                        <div className="space-y-3">
                          {order.order_items.slice(0, 2).map((item, index) => (
                            <div key={item.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <span className="bg-pizza-orange text-white font-bold text-sm px-2 py-1 rounded-full">
                                    {item.quantity}x
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {item.product_name}
                                  </span>
                                </div>
                                <span className="font-bold text-pizza-orange">
                                  €{formatPrice(getOrderItemPrice(item))}
                                </span>
                              </div>
                            </div>
                          ))}
                          {order.order_items.length > 2 && (
                            <p className="text-sm text-gray-600 text-center">
                              +{order.order_items.length - 2} altri prodotti
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Address Section */}
                    {order.customer_address && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-green-600 mt-1" />
                          <div>
                            <h5 className="font-bold text-gray-800 mb-1">Indirizzo di Consegna</h5>
                            <p className="text-gray-700">{order.customer_address}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderTrackingSection;
