
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/use-language";
import { SimpleCartProvider } from "@/hooks/use-simple-cart";
import { CustomerAuthProvider } from "@/hooks/useCustomerAuth";
import { BusinessHoursProvider } from "@/contexts/BusinessHoursContext";
import { initializeDatabaseOnlyTracking } from "@/utils/clearLocalStorageOrders";

import ErrorBoundary from "./components/ErrorBoundary";
import BackgroundInitializer from "./components/BackgroundInitializer";

// Home page loaded eagerly for instant first-paint
import Index from "./pages/Index";

// Lazy-load secondary and admin routes for fast initial page load
const Admin = lazy(() => import("./pages/Admin"));
const Ordini = lazy(() => import("./pages/Ordini"));
const OrderDashboardPro = lazy(() => import("./pages/OrderDashboardPro"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const SimpleStripeTest = lazy(() => import("./components/SimpleStripeTest"));
const AuthTest = lazy(() => import("./components/AuthTest"));
const AuthTestHelper = lazy(() => import("./components/AuthTestHelper"));
const AuthSeparationTest = lazy(() => import("./components/AuthSeparationTest"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const ComponentLoadingTest = lazy(() => import("./tests/ComponentLoadingTest"));

const RouteLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium text-sm">Caricamento...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once instead of 3 times
      retryDelay: 1000, // Wait 1 second before retry
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on component mount if data exists
    },
  },
});

// Initialize database-only order tracking (clear localStorage/cookies)
initializeDatabaseOnlyTracking();

const App = () => (
  <ErrorBoundary componentName="App">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <CustomerAuthProvider>
            <BusinessHoursProvider>
              <SimpleCartProvider>
              <BackgroundInitializer />
            {/* OrderNotificationSystem now only loads in admin panel */}
            {/* ButtonDebugger removed - no more debug overlays */}
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<RouteLoadingSpinner />}>
                <Routes>
                  <Route path="/" element={
                    <ErrorBoundary componentName="Index">
                      <Index />
                    </ErrorBoundary>
                  } />
                  <Route path="/admin" element={
                    <ErrorBoundary componentName="Admin">
                      <Admin />
                    </ErrorBoundary>
                  } />

                  <Route path="/ordini" element={
                    <ErrorBoundary componentName="Ordini">
                      <Ordini />
                    </ErrorBoundary>
                  } />

                  <Route path="/orders" element={
                    <ErrorBoundary componentName="OrderDashboard">
                      <OrderDashboardPro />
                    </ErrorBoundary>
                  } />

                  <Route path="/track-order" element={
                    <ErrorBoundary componentName="OrderTracking">
                      <OrderTracking />
                    </ErrorBoundary>
                  } />

                  <Route path="/menu" element={
                    <ErrorBoundary componentName="MenuPage">
                      <MenuPage />
                    </ErrorBoundary>
                  } />
                  <Route path="/payment/success" element={
                    <ErrorBoundary componentName="PaymentSuccess">
                      <PaymentSuccess />
                    </ErrorBoundary>
                  } />
                  <Route path="/payment/cancel" element={
                    <ErrorBoundary componentName="PaymentCancel">
                      <PaymentCancel />
                    </ErrorBoundary>
                  } />
                  {/* Database setup route removed to prevent accidental initialization */}
                  <Route path="/stripe-test" element={
                    <div className="min-h-screen bg-gray-50 py-12">
                      <ErrorBoundary componentName="SimpleStripeTest">
                        <SimpleStripeTest />
                      </ErrorBoundary>
                    </div>
                  } />

                  <Route path="/auth-test" element={
                    <ErrorBoundary componentName="AuthTest">
                      <AuthTest />
                    </ErrorBoundary>
                  } />
                  <Route path="/auth-helper" element={
                    <ErrorBoundary componentName="AuthTestHelper">
                      <AuthTestHelper />
                    </ErrorBoundary>
                  } />
                  <Route path="/auth-separation-test" element={
                    <ErrorBoundary componentName="AuthSeparationTest">
                      <AuthSeparationTest />
                    </ErrorBoundary>
                  } />
                  <Route path="/my-orders" element={
                    <ErrorBoundary componentName="MyOrders">
                      <MyOrders />
                    </ErrorBoundary>
                  } />
                  <Route path="/test-components" element={
                    <ErrorBoundary componentName="ComponentLoadingTest">
                      <ComponentLoadingTest />
                    </ErrorBoundary>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          {/* <DiagnosticInfo /> */}
              </SimpleCartProvider>
            </BusinessHoursProvider>
          </CustomerAuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
