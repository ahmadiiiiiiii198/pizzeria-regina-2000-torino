import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import useUserOrders from '@/hooks/useUserOrders';

import { useStockManagement } from '@/hooks/useStockManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const AuthDebugger: React.FC = () => {
  const { user, profile, session, loading: authLoading, isAuthenticated } = useCustomerAuth();
  const { orders, loading: ordersLoading, error: ordersError } = useUserOrders();

  const { settings: stockSettings, isLoading: stockLoading } = useStockManagement();

  const [productsCount, setProductsCount] = useState<number>(0);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Test products loading
  useEffect(() => {
    const testProductsLoad = async () => {
      try {
        setProductsLoading(true);
        const { data, error, count } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('is_active', true);

        if (error) {
          setProductsError(error.message);
        } else {
          setProductsCount(count || 0);
          setProductsError(null);
        }
      } catch (err) {
        setProductsError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setProductsLoading(false);
      }
    };

    testProductsLoad();
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-blue-800">🔍 Auth Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {/* Authentication State */}
          <div className="space-y-1">
            <div className="font-semibold text-gray-700">Authentication:</div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={authLoading ? "secondary" : "outline"}>
                Auth Loading: {authLoading ? "YES" : "NO"}
              </Badge>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                Authenticated: {isAuthenticated ? "YES" : "NO"}
              </Badge>
            </div>
            <div className="text-gray-600">
              User ID: {user?.id ? user.id.substring(0, 8) + "..." : "None"}
            </div>
            <div className="text-gray-600">
              Profile: {profile ? "Loaded" : "None"}
            </div>
            <div className="text-gray-600">
              Session: {session ? "Active" : "None"}
            </div>
          </div>

          {/* Products State */}
          <div className="space-y-1 border-t pt-2">
            <div className="font-semibold text-gray-700">Products:</div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={productsLoading ? "secondary" : "outline"}>
                Products Loading: {productsLoading ? "YES" : "NO"}
              </Badge>
              <Badge variant={stockLoading ? "secondary" : "outline"}>
                Stock Loading: {stockLoading ? "YES" : "NO"}
              </Badge>
            </div>
            <div className="text-gray-600">
              Products Count: {productsCount}
            </div>
            <div className="text-gray-600">
              Stock Enabled: {stockSettings.enabled ? "YES" : "NO"}
            </div>
            {productsError && (
              <div className="text-red-600 text-xs">
                Products Error: {productsError}
              </div>
            )}
          </div>

          {/* Orders State */}
          <div className="space-y-1 border-t pt-2">
            <div className="font-semibold text-gray-700">Orders:</div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={ordersLoading ? "secondary" : "outline"}>
                Orders Loading: {ordersLoading ? "YES" : "NO"}
              </Badge>
              <Badge variant={persistentLoading ? "secondary" : "outline"}>
                Persistent Loading: {persistentLoading ? "YES" : "NO"}
              </Badge>
            </div>
            <div className="text-gray-600">
              User Orders: {orders.length} orders
            </div>
            <div className="text-gray-600">
              Persistent Order: {persistentOrder ? "Yes" : "None"}
            </div>
            {ordersError && (
              <div className="text-red-600 text-xs">
                Error: {ordersError}
              </div>
            )}
          </div>

          {/* Loading States Summary */}
          <div className="space-y-1 border-t pt-2">
            <div className="font-semibold text-gray-700">Loading Summary:</div>
            <div className="text-gray-600">
              Any Loading: {(authLoading || ordersLoading || persistentLoading || productsLoading || stockLoading) ? "YES" : "NO"}
            </div>
            <div className="text-gray-600">
              Ready to Show Content: {(!authLoading && !ordersLoading && !productsLoading && !stockLoading) ? "YES" : "NO"}
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500 border-t pt-1">
            Last Update: {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebugger;
