import React, { useState, useEffect } from 'react';
import { Pizza, ChefHat, Clock, Star, Camera, Phone } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { usePizzeriaHours } from '@/hooks/usePizzeriaHours';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useHeroContent, useLogoSettings } from '@/hooks/use-settings';

const Hero = () => {
  const { t } = useLanguage();
  const { displayText, allHours, isLoading: hoursLoading } = usePizzeriaHours();
  const { isAuthenticated, user } = useCustomerAuth();

  // Use the proper hooks to load content from database
  const [heroContent, , heroLoading] = useHeroContent();
  const [logoSettings, , logoLoading] = useLogoSettings();

  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Combine loading states
  const isLoading = heroLoading || logoLoading || hoursLoading;

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <section className="relative min-h-screen overflow-x-hidden hero-container-mobile">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-pizza-red/20 via-pizza-orange/10 to-pizza-cheese/20"></div>

        {/* Loading skeleton */}
        <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">

            {/* Left Column Skeleton */}
            <div className="text-center lg:text-left space-y-8">
              {/* Logo skeleton */}
              <div className="flex justify-center lg:justify-start mb-8">
                <div className="h-96 md:h-[480px] w-96 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl animate-pulse flex items-center justify-center">
                  <Pizza className="text-red-400 animate-float" size={64} />
                </div>
              </div>

              {/* Text skeleton */}
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/2"></div>
              </div>

              {/* Hours skeleton */}
              <div className="bg-gradient-to-br from-pizza-red/90 to-pizza-orange/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
                <div className="text-center">
                  <div className="text-5xl mb-4">⏰</div>
                  <div className="h-6 bg-white/20 rounded animate-pulse mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="relative">
              <div className="h-96 md:h-[500px] bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl animate-pulse flex items-center justify-center">
                <Pizza className="text-red-400 animate-float" size={64} />
                <div className="ml-4 text-red-600 font-semibold">
                  Caricamento...
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Loading indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-pizza-red rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pizza-orange rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-pizza-cheese rounded-full animate-bounce animation-delay-400"></div>
            <span className="text-white text-sm ml-2">Caricamento contenuto...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-x-hidden hero-container-mobile">
      {/* Pizza background video - Mobile Optimized */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {!videoError ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }
            /* Mobile-optimized video display */
            object-cover object-center
            sm:object-cover sm:object-center
            md:object-cover md:object-center
            lg:object-cover lg:object-center
            /* Ensure video scales properly on mobile */
            min-w-full min-h-full
            /* Better mobile positioning */
            transform scale-105 sm:scale-100
            /* Apply mobile-specific CSS class */
            hero-video-mobile
            `}
            style={{
              /* Additional mobile optimizations */
              objectPosition: 'center center',
              /* Ensure video covers the entire area on mobile */
              width: '100vw',
              height: '100vh',
              minWidth: '100%',
              minHeight: '100%'
            }}
            onLoadedData={() => {
              setVideoLoaded(true);
            }}
            onError={(e) => {
              setVideoError(true);
            }}
          >
            <source src="/20250509_211620.mp4" type="video/mp4" />
          </video>
        ) : null}

        {/* Fallback to background image if video fails or is loading - iOS OPTIMIZED */}
        {(videoError || !videoLoaded) && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat
            /* iOS Safari compatible - NO background-attachment fixed */
            /* Apply mobile-specific CSS class */
            hero-bg-mobile
            "
            style={{
              backgroundImage: `url('${heroContent.backgroundImage}')`,
              /* iOS-specific background optimizations */
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundAttachment: 'scroll', /* CRITICAL: iOS doesn't support 'fixed' */
              backgroundRepeat: 'no-repeat',
              /* Ensure full coverage on all devices */
              minHeight: '100vh',
              minWidth: '100%',
              width: '100%',
              height: '100%',
              /* iOS performance optimization */
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)'
            }}
          ></div>
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
      </div>

      {/* Pizza-themed decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pizza-tomato to-pizza-red rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pizza-cheese to-pizza-orange rounded-full blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-pizza-red to-pizza-orange rounded-full blur-2xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating pizza icons */}
      <div className="absolute top-10 right-20 text-pizza-orange/30 animate-float">
        <Pizza size={60} />
      </div>
      <div className="absolute bottom-10 left-20 text-pizza-red/30 animate-float animation-delay-2000">
        <Pizza size={40} />
      </div>
      <div className="absolute top-1/3 right-1/4 text-pizza-green/30 animate-float animation-delay-4000">
        <ChefHat size={50} />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh] hero-main-grid">

          {/* Left Column - Logo and Text */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in-left">
            <div className="flex justify-center lg:justify-start mb-8">
              <div className="relative">
                {/* Logo loading placeholder */}
                {!logoImageLoaded && (
                  <div className="h-96 md:h-[480px] w-96 bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl animate-pulse flex items-center justify-center">
                    <Pizza className="text-red-400 animate-float" size={64} />
                  </div>
                )}

                {/* Main logo image */}
                {logoSettings.logoUrl && (
                  <img
                    src={logoSettings.logoUrl}
                    alt={logoSettings.altText}
                    className={`h-96 md:h-[480px] w-auto object-contain drop-shadow-2xl transition-all duration-700 hover-scale animate-scale-in ${
                      logoImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => {
                      setLogoImageLoaded(true);
                    }}
                    onError={(e) => {
                      setLogoImageLoaded(true);
                    }}
                  />
                )}

                {/* Fallback text if logo fails */}
                <div className="hidden text-center">
                  <Pizza className="h-24 w-24 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 font-playfair">Pizzeria Regina 2000</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image - FORCED VISIBILITY */}
          <div
            className="relative animate-fade-in-right animate-stagger-1 hero-image-column"
            style={{
              opacity: 1,
              position: 'relative',
              zIndex: 25
            }}
          >
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-white via-red-50 to-orange-50 p-8 hover-lift"
              style={{
                minHeight: '550px'
              }}
            >
              {/* Hero image loading placeholder */}
              {!heroImageLoaded && (
                <div className="absolute inset-8 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 animate-pulse flex items-center justify-center">
                  <Pizza className="text-red-400 animate-float" size={64} />
                  <div className="ml-4 text-red-600 font-semibold">
                    Caricamento immagine...
                  </div>
                </div>
              )}
              <img
                src={heroContent.heroImage || heroContent.backgroundImage}
                alt="Delicious authentic Italian pizza"
                className={`w-full h-96 md:h-[500px] lg:h-[600px] object-cover rounded-2xl transition-opacity duration-700 hover-scale hero-main-image ${
                  heroImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  height: '500px',
                  minHeight: '400px',
                  maxWidth: '100%',
                  // @ts-ignore - iOS optimization properties
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                  WebkitTransform: 'translateZ(0)',
                  transform: 'translateZ(0)'
                } as React.CSSProperties}
                loading="eager"
                decoding="async"
                onLoad={(e) => {
                  setHeroImageLoaded(true);
                  console.log('🍕 [Hero Image] Loaded successfully');
                }}
                onError={(e) => {
                  // Try fallback image
                  const fallbackImage = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                  if (e.currentTarget.src !== fallbackImage) {
                    console.log('⚠️ [Hero] Primary image failed, trying fallback');
                    e.currentTarget.src = fallbackImage;
                  } else {
                    console.warn('⚠️ [Hero] Fallback image also failed');
                    setHeroImageLoaded(false);
                  }
                }}
              />
              <div className="absolute inset-8 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>




            </div>
          </div>
        </div>

        {/* Bottom Section - Modern Hero Design */}
        <div className="text-center z-10 relative max-w-6xl mx-auto px-4 space-y-12 animate-fade-in-up animate-stagger-2 mt-12">
          {/* Main Title Section */}
          <div className="space-y-8">
            {/* Pizza Icon + PIZZERIA - Bigger and Better */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
              <div className="text-7xl md:text-9xl lg:text-[10rem] animate-pizza-spin filter drop-shadow-2xl">
                🍕
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tight leading-none transform hover:scale-105 transition-all duration-500 font-serif">
                  <span className="relative inline-block">
                    PIZZERIA
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-600/30 to-red-600/30 rounded-2xl blur-xl opacity-50"></div>
                  </span>
                </h1>
              </div>
            </div>

            {/* Regina 2000 - Elegant Typography */}
            <div className="relative mb-6">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text font-bold tracking-wide drop-shadow-2xl">
                Regina 2000
              </h2>
              <div className="absolute inset-0 text-5xl md:text-7xl lg:text-8xl font-serif italic text-yellow-400/20 blur-sm">
                Regina 2000
              </div>
            </div>

            {/* Subtitle with Better Typography */}
            <h3 className="text-2xl md:text-3xl lg:text-4xl text-white/90 font-light tracking-wide mb-6 drop-shadow-lg">
              {t('pizzeriaLocation')} • {t('heroSubtitle')}
            </h3>

            {/* Store Address - Modern Card Design */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <div className="text-2xl animate-pulse">📍</div>
                <p className="text-white text-lg md:text-xl font-medium tracking-wide">
                  {t('storeAddress')}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Pills - Modern Design */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
              <div className="group flex items-center gap-4 bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-xl rounded-full px-8 py-4 border border-orange-400/30 hover:border-orange-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <span className="text-3xl group-hover:animate-bounce">🔥</span>
                <span className="text-white font-semibold text-lg tracking-wide">
                  Forno a Legna Tradizionale
                </span>
              </div>

              <div className="group flex items-center gap-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-xl rounded-full px-8 py-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <span className="text-3xl group-hover:animate-bounce">🇮🇹</span>
                <span className="text-white font-semibold text-lg tracking-wide">
                  Ingredienti Freschi
                </span>
              </div>

              <div className="group flex items-center gap-4 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 backdrop-blur-xl rounded-full px-8 py-4 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <span className="text-3xl group-hover:animate-bounce">👨‍🍳</span>
                <span className="text-white font-semibold text-lg tracking-wide">
                  Ricette Autentiche
                </span>
              </div>
            </div>
          </div>

          {/* Info Cards - Premium Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="group bg-gradient-to-br from-yellow-500/25 to-orange-500/25 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-2">
              <div className="text-5xl mb-4 group-hover:animate-pulse text-center">⏰</div>
              <div className="text-white">
                <div className="font-bold text-xl mb-4 tracking-wide text-center text-yellow-300">
                  Orari di Apertura
                </div>
                {hoursLoading ? (
                  <div className="text-center text-yellow-200">Caricamento...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-1 text-center">
                    <div className="text-yellow-200 font-mono text-sm font-medium">
                      Lun-Gio: 12:00-14:30, 18:00-00:00
                    </div>
                    <div className="text-yellow-200 font-mono text-sm font-medium">
                      Ven-Sab: 12:00-14:30, 18:30-02:00
                    </div>
                    <div className="text-yellow-200 font-mono text-sm font-medium">
                      Domenica: 12:00-14:30, 18:00-00:00
                    </div>
                  </div>
                )}
              </div>
            </div>



            <div className="group bg-gradient-to-br from-red-500/25 to-pink-500/25 backdrop-blur-xl rounded-3xl p-8 border border-red-400/30 hover:border-red-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-2">
              <div className="text-5xl mb-4 group-hover:animate-pulse">🇮🇹</div>
              <div className="text-white">
                <div className="font-bold text-xl mb-2 tracking-wide">
                  Pizza Italiana
                </div>
                <div className="text-red-300 font-mono text-2xl font-bold">100% Autentica</div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Premium Design */}
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-center pt-8 animate-fade-in-up animate-stagger-2">
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {/* Primary CTA - Order Pizza */}
              <button
                onClick={() => {
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group relative bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:from-red-500 hover:via-orange-400 hover:to-red-500 transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-3xl border-2 border-yellow-400/60 hover:border-yellow-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-4 z-10">
                  <Pizza className="group-hover:animate-spin" size={32} />
                  <span className="tracking-wide">🍕 ORDINA PIZZA</span>
                </span>
              </button>

              {/* Secondary CTA - Call Now */}
              <button
                onClick={() => {
                  window.open('tel:0110769211', '_self');
                }}
                className="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:from-green-500 hover:to-emerald-500 transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-3xl border-2 border-green-300/60 hover:border-green-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-4 z-10">
                  <Phone className="group-hover:animate-bounce" size={32} />
                  <span className="tracking-wide">📞 CHIAMA ORA</span>
                </span>
              </button>

              {/* Tertiary CTA - Gallery */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  try {
                    const gallerySection = document.getElementById('gallery');
                    if (gallerySection) {
                      gallerySection.scrollIntoView({ behavior: 'smooth' });
                    }
                  } catch (error) {
                    // Handle error silently
                  }
                }}
                className="group relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:from-purple-500 hover:to-indigo-500 transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-3xl border-2 border-purple-300/60 hover:border-purple-200 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                aria-label={t('goToGallery')}
                title={t('goToGallery')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-4 z-10">
                  <Camera className="group-hover:animate-pulse" size={32} />
                  <span className="tracking-wide">📸 {t('gallery').toUpperCase()}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
