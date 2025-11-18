import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import useUserOrders, { getOrderStatusInfo, formatPrice, formatDate } from '@/hooks/useUserOrders';
import { Order, getOrderItemPrice } from '@/types/order';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  Eye
} from 'lucide-react';

// Beautiful Motorcycle Delivery Animation Component
const MotorcycleDeliveryIcon: React.FC<{ className?: string; isAnimated?: boolean }> = ({
  className = "h-6 w-6",
  isAnimated = true
}) => (
  <div className={`${className} relative`}>
    <style jsx>{`
      @keyframes motorcycle-ride {
        0%, 100% { transform: translateX(0px) rotate(0deg); }
        25% { transform: translateX(1px) rotate(1deg); }
        50% { transform: translateX(0px) rotate(0deg); }
        75% { transform: translateX(-1px) rotate(-1deg); }
      }

      @keyframes wheel-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes exhaust-puff {
        0% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 0.3; transform: scale(1.2); }
        100% { opacity: 0; transform: scale(1.5); }
      }

      .motorcycle-body {
        animation: ${isAnimated ? 'motorcycle-ride 2s ease-in-out infinite' : 'none'};
      }

      .wheel-rotation {
        animation: ${isAnimated ? 'wheel-spin 0.5s linear infinite' : 'none'};
        transform-origin: center;
      }

      .exhaust-smoke {
        animation: ${isAnimated ? 'exhaust-puff 1.5s ease-out infinite' : 'none'};
      }
    `}</style>
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Road */}
      <defs>
        <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>

        {/* Motorcycle gradient */}
        <linearGradient id="bikeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>

        {/* Pizza box gradient */}
        <linearGradient id="pizzaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Animated road lines */}
      <rect x="0" y="75" width="100" height="8" fill="url(#roadGradient)" rx="2" />
      <g className={isAnimated ? "animate-pulse" : ""}>
        <rect x="10" y="78" width="8" height="2" fill="white" opacity="0.8" rx="1" />
        <rect x="25" y="78" width="8" height="2" fill="white" opacity="0.6" rx="1" />
        <rect x="40" y="78" width="8" height="2" fill="white" opacity="0.8" rx="1" />
        <rect x="55" y="78" width="8" height="2" fill="white" opacity="0.6" rx="1" />
        <rect x="70" y="78" width="8" height="2" fill="white" opacity="0.8" rx="1" />
        <rect x="85" y="78" width="8" height="2" fill="white" opacity="0.6" rx="1" />
      </g>

      {/* Motorcycle body */}
      <g className="motorcycle-body">
        {/* Main body */}
        <ellipse cx="45" cy="65" rx="12" ry="6" fill="url(#bikeGradient)" />

        {/* Wheels with spinning animation */}
        <g className="wheel-rotation">
          <circle cx="35" cy="70" r="5" fill="#374151" stroke="#1f2937" strokeWidth="1" />
          <circle cx="35" cy="70" r="3" fill="#6b7280" />
          <line x1="32" y1="70" x2="38" y2="70" stroke="#1f2937" strokeWidth="0.5" />
          <line x1="35" y1="67" x2="35" y2="73" stroke="#1f2937" strokeWidth="0.5" />
        </g>

        <g className="wheel-rotation">
          <circle cx="55" cy="70" r="5" fill="#374151" stroke="#1f2937" strokeWidth="1" />
          <circle cx="55" cy="70" r="3" fill="#6b7280" />
          <line x1="52" y1="70" x2="58" y2="70" stroke="#1f2937" strokeWidth="0.5" />
          <line x1="55" y1="67" x2="55" y2="73" stroke="#1f2937" strokeWidth="0.5" />
        </g>

        {/* Handlebars */}
        <rect x="42" y="58" width="6" height="2" fill="#374151" rx="1" />

        {/* Driver */}
        <circle cx="45" cy="55" r="4" fill="#fbbf24" />
        <rect x="43" y="59" width="4" height="8" fill="#3b82f6" rx="1" />

        {/* Pizza delivery box with subtle glow */}
        <rect x="50" y="58" width="8" height="6" fill="url(#pizzaGradient)" rx="1" stroke="#92400e" strokeWidth="0.5" />
        <text x="54" y="62" fontSize="3" fill="white" textAnchor="middle">🍕</text>

        {/* Delivery flag */}
        <rect x="58" y="56" width="4" height="3" fill="#ef4444" rx="0.5" />
        <line x1="58" y1="56" x2="58" y2="64" stroke="#374151" strokeWidth="0.5" />
      </g>

      {/* Speed lines for movement effect */}
      <g className={isAnimated ? "animate-pulse" : ""} opacity="0.6">
        <line x1="20" y1="60" x2="15" y2="60" stroke="#ef4444" strokeWidth="1" />
        <line x1="22" y1="65" x2="17" y2="65" stroke="#ef4444" strokeWidth="1" />
        <line x1="18" y1="70" x2="13" y2="70" stroke="#ef4444" strokeWidth="1" />
      </g>

      {/* Delivery smoke/exhaust with custom animation */}
      <g className="exhaust-smoke">
        <circle cx="30" cy="68" r="1" fill="#9ca3af" opacity="0.4" />
        <circle cx="28" cy="66" r="0.8" fill="#9ca3af" opacity="0.3" />
        <circle cx="26" cy="64" r="0.6" fill="#9ca3af" opacity="0.2" />
      </g>

      {/* Additional exhaust puffs for more realistic effect */}
      {isAnimated && (
        <>
          <g className="exhaust-smoke" style={{ animationDelay: '0.5s' }}>
            <circle cx="32" cy="69" r="0.8" fill="#d1d5db" opacity="0.3" />
            <circle cx="29" cy="67" r="0.6" fill="#d1d5db" opacity="0.2" />
          </g>
          <g className="exhaust-smoke" style={{ animationDelay: '1s' }}>
            <circle cx="31" cy="70" r="0.7" fill="#e5e7eb" opacity="0.2" />
          </g>
        </>
      )}
    </svg>
  </div>
);

const UnifiedOrderTracker: React.FC = () => {
  // ✅ ALL HOOKS MUST BE CALLED AT TOP LEVEL - NO CONDITIONAL EXECUTION
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { isAuthenticated } = useCustomerAuth();
  const { orders: userOrders, loading: userOrdersLoading } = useUserOrders();

  // Delay rendering until after initial mount to prevent context timing issues
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const frame = requestAnimationFrame(() => {
      setHasInitialized(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // ✅ SIMPLIFIED: Calculate active order directly - more stable than function dependency
  const activeOrder = useMemo(() => {
    if (!isAuthenticated || !userOrders || userOrders.length === 0) return null;

    const activeStatuses = ['confirmed', 'preparing', 'ready', 'arrived'];
    const foundOrder = userOrders.find(order => {
      const currentStatus = order.status || order.order_status;
      return activeStatuses.includes(currentStatus);
    });

    return foundOrder || null;
  }, [isAuthenticated, userOrders]);

  console.log('🎯 [ORDER-TRACKER] Render state:', {
    isAuthenticated,
    userOrdersCount: userOrders?.length || 0,
    userOrdersLoading,
    hasActiveOrder: !!activeOrder
  });

  // ✅ EARLY RETURNS AFTER ALL HOOKS
  if (!hasInitialized) return null;
  if (!isAuthenticated) return null;
  if (!activeOrder) return null;
  if (userOrdersLoading) return null;

  // Safety checks for order data
  if (!activeOrder || (!activeOrder.order_number && !activeOrder.id)) {
    console.warn('UnifiedOrderTracker: Invalid order data', activeOrder);
    return null;
  }

  // Get current status with safe fallback
  const currentStatus = activeOrder?.status || activeOrder?.order_status || 'pending';

  let statusInfo;
  try {
    statusInfo = getOrderStatusInfo(currentStatus);
    if (!statusInfo) {
      statusInfo = { label: 'Stato sconosciuto', color: 'bg-gray-100 text-gray-800', icon: '❓' };
    }
  } catch (err) {
    console.error('Error getting status info:', err);
    statusInfo = { label: 'Stato sconosciuto', color: 'bg-gray-100 text-gray-800', icon: '❓' };
  }

  const handleViewAllOrders = () => {
    if (isAuthenticated) {
      window.location.href = '/my-orders';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('UnifiedOrderTracker rendering:', {
    hasActiveOrder: !!activeOrder,
    isExpanded,
    orderNumber: activeOrder?.order_number,
    status: currentStatus
  });

  let portalContent;
  try {
    portalContent = (
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
          width: isExpanded ? '320px' : '240px',
          maxWidth: '90vw',
          pointerEvents: 'auto'
        }}
      >
      <Card className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 rounded-lg">
        <CardHeader
          className={`cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'pb-2 px-4 py-3' : 'px-2 py-1.5'}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className={`p-0.5 rounded-full ${statusInfo.color.replace('text-', 'bg-').replace('100', '500')} text-white`}>
                {currentStatus === 'arrived' || currentStatus === 'delivering' ? (
                  <MotorcycleDeliveryIcon className="h-2.5 w-2.5" isAnimated={true} />
                ) : (
                  <Package className="h-2.5 w-2.5" />
                )}
              </div>
              <div>
                <CardTitle className="text-xs font-medium text-gray-800">
                  #{activeOrder.order_number || 'N/A'}
                </CardTitle>
                {!isExpanded && (
                  <Badge className={`${statusInfo.color} text-xs mt-0.5 px-1 py-0`}>
                    {statusInfo.label}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {userOrdersLoading && <RefreshCw className="h-2.5 w-2.5 animate-spin text-gray-400" />}
              {isExpanded ? (
                <ChevronUp className="h-2.5 w-2.5 text-gray-500" />
              ) : (
                <ChevronDown className="h-2.5 w-2.5 text-gray-500" />
              )}
            </div>
          </div>
          {isExpanded && (
            <Badge className={`${statusInfo.color} text-xs mt-2`}>
              {statusInfo.icon} {statusInfo.label}
            </Badge>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 px-4 pb-4 space-y-3">
            {/* Order Details */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Totale:</span>
                <span className="font-semibold">{formatPrice(activeOrder?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Ordinato alle:</span>
                <span className="text-gray-800">{formatTime(activeOrder?.created_at || new Date().toISOString())}</span>
              </div>
              {activeOrder?.customer_address && activeOrder.customer_address.trim() && (
                <div className="text-sm">
                  <span className="text-gray-600">Indirizzo:</span>
                  <p className="text-gray-800 text-xs mt-1">{activeOrder.customer_address}</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            {activeOrder?.order_items && Array.isArray(activeOrder.order_items) && activeOrder.order_items.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Articoli:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {activeOrder.order_items.map((item, index) => (
                    <div key={item?.id || index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                      <div>
                        <span className="font-medium">{item?.product_name || 'Prodotto'}</span>
                        {item?.special_requests && (
                          <p className="text-gray-500 text-xs">Note: {item.special_requests}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{item?.quantity || 1}x</span>
                        <p className="text-gray-600">{formatPrice(item?.subtotal || (getOrderItemPrice(item) * (item?.quantity || 1)))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Progress */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Stato ordine:</h4>
              <div className="space-y-1">
                {[
                  { status: 'confirmed', label: 'Confermato', icon: CheckCircle },
                  { status: 'preparing', label: 'In preparazione', icon: Clock },
                  { status: 'ready', label: 'Pronto', icon: Package },
                  { status: 'arrived', label: 'Arrivato alla porta', icon: MapPin },
                  { status: 'delivered', label: 'Consegnato', icon: Truck },
                ].map(({ status, label, icon: Icon }) => {
                  const isActive = currentStatus === status;
                  const isPassed = ['confirmed', 'preparing', 'ready', 'arrived', 'delivered'].indexOf(currentStatus) >=
                                   ['confirmed', 'preparing', 'ready', 'arrived', 'delivered'].indexOf(status);

                  return (
                    <div key={status} className={`flex items-center space-x-2 text-xs ${
                      isActive ? 'text-blue-600 font-medium' :
                      isPassed ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {(status === 'arrived' || status === 'delivered') ? (
                        <div className="h-3 w-3">
                          <MotorcycleDeliveryIcon
                            className="h-3 w-3"
                            isAnimated={isActive}
                          />
                        </div>
                      ) : (
                        <Icon className="h-3 w-3" />
                      )}
                      <span>{label}</span>
                      {isActive && (
                        <span className="text-blue-500 flex items-center">
                          ← Attuale
                          {(status === 'arrived' || status === 'delivered') && (
                            <span className="ml-1 animate-pulse">🏍️</span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              {isAuthenticated && (
                <Button
                  onClick={handleViewAllOrders}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Tutti gli ordini
                </Button>
              )}
              {!isAuthenticated && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  <User className="h-3 w-3" />
                  <span>Accedi per vedere tutti i tuoi ordini</span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
  } catch (error) {
    console.error('UnifiedOrderTracker render error:', error);
    portalContent = null;
  }

  if (!portalContent) return null;

  return createPortal(portalContent, document.body);
};

export default UnifiedOrderTracker;
