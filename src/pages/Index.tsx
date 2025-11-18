
import React, { useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import Header from '../components/Header';
import Hero from '../components/Hero';
import OrderTrackingSection from '../components/OrderTrackingSection';

import WeOffer from '../components/WeOffer';
import YouTubeSection from '../components/YouTubeSection';
import Products from '../components/Products';
import Gallery from '../components/Gallery';

import About from '../components/About';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import BusinessHoursBanner from '../components/BusinessHoursBanner';
// Pizzeria Regina 2000 Torino - Complete transformation


const Index = () => {
  // Redirect to /ordini if launched from PWA
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isPWA = urlParams.get('source') === 'pwa';
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isPWA || isStandalone) {
      console.log('📱 [PWA] Redirecting from home to /ordini');
      window.location.href = '/ordini?source=pwa';
    }
  }, []);

  return (
    <div className="min-h-screen font-inter overflow-x-hidden">
      <Header />
      <BusinessHoursBanner />
      <ErrorBoundary componentName="Hero">
        <div className="animate-fade-in-up">
          <Hero />
        </div>
      </ErrorBoundary>

      <ErrorBoundary componentName="OrderTrackingSection">
        <div className="animate-fade-in-up animate-stagger-1">
          <OrderTrackingSection />
        </div>
      </ErrorBoundary>

      <ErrorBoundary componentName="WeOffer">
        <div className="animate-fade-in-up animate-stagger-2">
          <WeOffer />
        </div>
      </ErrorBoundary>
      <ErrorBoundary componentName="YouTubeSection">
        <div className="animate-fade-in-up animate-stagger-4">
          <YouTubeSection />
        </div>
      </ErrorBoundary>
      <ErrorBoundary componentName="Products">
        <div className="animate-fade-in-right animate-stagger-5">
          <Products />
        </div>
      </ErrorBoundary>
      <ErrorBoundary componentName="Gallery">
        <div className="animate-fade-in-up animate-stagger-6">
          <Gallery />
        </div>
      </ErrorBoundary>
      <ErrorBoundary componentName="About">
        <div className="animate-slide-in-up animate-stagger-7">
          <About />
        </div>
      </ErrorBoundary>
      <ErrorBoundary componentName="ContactSection">
        <div className="animate-fade-in-up animate-stagger-8">
          <ContactSection />
        </div>
      </ErrorBoundary>
      <ErrorBoundary componentName="Footer">
        <div className="animate-fade-in-up animate-stagger-9">
          <Footer />
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default Index;
