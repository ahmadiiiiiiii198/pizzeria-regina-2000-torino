
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
import { UpdateNotification } from "./components/UpdateNotification";
// import DiagnosticInfo from "./components/DiagnosticInfo"; // Removed diagnostic button
import BackgroundInitializer from "./components/BackgroundInitializer";
// import ButtonDebugger from "./components/ButtonDebugger"; // Removed debug component
// OrderNotificationSystem moved to admin panel only to prevent conflicts
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminMinimal from "./pages/AdminMinimal";
import Ordini from "./pages/Ordini";

import OrderDashboardPro from "./pages/OrderDashboardPro";
import OrderTracking from "./pages/OrderTracking";
import MenuPage from "./pages/MenuPage";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

// DatabaseSetup component removed to prevent accidental initialization
import SimpleStripeTest from "./components/SimpleStripeTest";
import AuthTest from "./components/AuthTest";
import AuthTestHelper from "./components/AuthTestHelper";
import AuthSeparationTest from "./components/AuthSeparationTest";
import MyOrders from "./pages/MyOrders";
import UnifiedOrderTracker from "./components/UnifiedOrderTracker";
import ComponentLoadingTest from "./tests/ComponentLoadingTest";

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
            <UpdateNotification />
            <Toaster />
            <Sonner />
            <BrowserRouter>
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

            {/* Global Order Tracker removed - order tracking works in hero section */}

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
