import React, { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Pizza, Loader2, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrdersAdmin from '@/components/admin/OrdersAdmin';
import OrderNotificationSystem from '@/components/OrderNotificationSystem';
import { MobileBackgroundNotificationManager } from '@/components/MobileBackgroundNotificationManager';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import NotificationPermissionPrompt from '@/components/NotificationPermissionPrompt';
import BackgroundSyncManager from '@/components/BackgroundSyncManager';
import OrdiniHeader from '@/components/OrdiniHeader';
import AuthenticatedAdminWrapper from '@/components/admin/AuthenticatedAdminWrapper';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const Ordini = () => {
  const { handleLogout } = useAdminAuth();

  const handleBackToAdmin = () => {
    window.location.href = '/admin';
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  // PWA Setup
  useEffect(() => {
    console.log('📱 [PWA] Ordini page loaded - PWA mode');
    
    // Add PWA manifest link
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest-ordini.json';
    document.head.appendChild(manifestLink);

    // Add theme color
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#dc2626';
    document.head.appendChild(themeColor);

    return () => {
      // Cleanup on unmount
      if (manifestLink.parentNode) {
        manifestLink.parentNode.removeChild(manifestLink);
      }
      if (themeColor.parentNode) {
        themeColor.parentNode.removeChild(themeColor);
      }
    };
  }, []);

  return (
    <AuthenticatedAdminWrapper title="Gestione Ordini - Pizzeria Regina 2000" showLogout={false}>
    <>
      {/* PWA Meta Tags */}
      <Helmet>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ordini Regina" />
        <link rel="apple-touch-icon" href="/pizza-icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Ordini Regina" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          {/* Mobile Header - Compact */}
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg shadow-md">
                <Pizza className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Gestione Ordini</h1>
                <p className="text-xs text-gray-500">Pizzeria Regina 2000</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {/* Notification Controls - Mobile */}
              <div id="header-notification-controls" className="flex items-center space-x-1">
                {/* This will be populated by OrderNotificationSystem */}
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 px-2 py-1 rounded-md text-xs"
              >
                <LogOut className="w-3 h-3" />
              </Button>
              <Button
                onClick={handleBackToAdmin}
                variant="outline"
                size="sm"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-md text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
              <Button
                onClick={handleBackToHome}
                variant="outline"
                size="sm"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 px-2 py-1 rounded-md text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Desktop Header - Full */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                <Pizza className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Gestione Ordini
                </h1>
                <p className="text-lg text-gray-600 font-medium">Pizzeria Regina 2000</p>
                <p className="text-sm text-gray-500">Visualizza e gestisci tutti gli ordini ricevuti</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Notification Controls - Desktop */}
              <div id="header-notification-controls-desktop" className="flex items-center space-x-2 mr-4">
                {/* This will be populated by OrderNotificationSystem */}
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
              <Button
                onClick={handleBackToAdmin}
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Pannello Admin
              </Button>
              <Button
                onClick={handleBackToHome}
                variant="outline"
                className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Torna al Sito
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="px-2 sm:px-4 lg:px-6 py-3 sm:py-6 lg:py-8 space-y-4">
        {/* Mobile Background Notification Manager */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <MobileBackgroundNotificationManager />
        </div>

        {/* Orders Admin */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <OrdersAdmin />
        </div>
      </div>

      {/* Mobile-Optimized Footer */}
      <div className="bg-white border-t border-gray-200 mt-6 sm:mt-12">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          {/* Mobile Footer */}
          <div className="flex flex-col space-y-2 text-xs text-gray-600 md:hidden">
            <div className="flex items-center justify-center space-x-2">
              <Pizza className="h-3 w-3 text-red-500" />
              <span>Pizzeria Regina 2000</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <span>🔄 Auto</span>
              <span>🔔 Live</span>
            </div>
          </div>

          {/* Desktop Footer */}
          <div className="hidden md:flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Pizza className="h-4 w-4 text-red-500" />
              <span>Pizzeria Regina 2000 - Sistema di Gestione Ordini</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>🔄 Aggiornamento automatico attivo</span>
              <span>🔔 Notifiche in tempo reale</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Notification System - Only in Ordini Section */}
      <Suspense fallback={
        <div className="fixed top-4 right-4 z-50">
          <div className="p-3 bg-gray-100 text-gray-600 rounded-full shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </div>
      }>
        <OrderNotificationSystem />
      </Suspense>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt />

      {/* Background Sync Manager */}
      <BackgroundSyncManager />
    </div>
    </>
    </AuthenticatedAdminWrapper>
  );
};

export default Ordini;
