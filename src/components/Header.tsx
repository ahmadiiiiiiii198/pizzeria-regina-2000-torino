import React, { useState } from 'react';
import { ShoppingCart, Pizza, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';
import OrderOptionsModal from './OrderOptionsModal';
import { useSimpleCart } from '@/hooks/use-simple-cart';
import SimpleCart from './SimpleCart';
import ProductSearch from './ProductSearch';
import MobileSearchModal from './MobileSearchModal';
import { useLanguage } from '@/hooks/use-language';
import CustomerAccountWidget from './customer/CustomerAccountWidget';
import logoImage from '@/assets/logo.png';


const Header = () => {
  const { getTotalItems, openCart } = useSimpleCart();
  const { t } = useLanguage();

  // Use static logo settings to avoid hook issues
  const logoSettings = {
    logoUrl: "/flegrea-logo.png?v=" + Date.now(),
    altText: "Flegrea Pizzeria Logo",
  };

  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-b-2 border-pizza-orange/20 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8 animate-fade-in-left">
              <div className="flex items-center space-x-3 logo-container hover-scale">
                {/* Direct logo display for testing */}
                <img
                  src={logoImage}
                  alt="Flegrea Pizzeria Logo"
                  className="h-12 w-auto transition-all duration-300 hover:scale-105"
                  onLoad={() => console.log('✅ Logo loaded successfully')}
                  onError={(e) => {
                    console.error('❌ Logo failed to load:', e);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />

                {/* Fallback text logo */}
                <div className="h-12 hidden items-center px-4 bg-gradient-to-r from-flegrea-burgundy to-flegrea-deep-red text-white rounded-xl font-fredoka font-bold text-lg shadow-lg">
                  🍕 Flegrea
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-pizza-dark hover:text-pizza-red transition-colors font-medium font-roboto relative group animate-fade-in-up animate-stagger-1 hover-scale">
                  {t('home')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pizza-red to-pizza-orange transition-all duration-300 group-hover:w-full animate-shimmer"></span>
                </a>
                <a href="/#products" className="text-pizza-dark hover:text-pizza-orange transition-colors font-medium font-roboto relative group animate-fade-in-up animate-stagger-2 hover-scale">
                  🍕 {t('menu')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pizza-orange to-pizza-red transition-all duration-300 group-hover:w-full animate-shimmer"></span>
                </a>
                <a href="/#gallery" className="text-pizza-dark hover:text-pizza-green transition-colors font-medium font-roboto relative group animate-fade-in-up animate-stagger-3 hover-scale">
                  📸 {t('gallery')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pizza-green to-pizza-basil transition-all duration-300 group-hover:w-full animate-shimmer"></span>
                </a>
                <a href="/#about" className="text-pizza-dark hover:text-pizza-brown transition-colors font-medium font-roboto relative group animate-fade-in-up animate-stagger-4 hover-scale">
                  👨‍🍳 {t('about')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pizza-brown to-pizza-orange transition-all duration-300 group-hover:w-full animate-shimmer"></span>
                </a>
                <a href="/#contact" className="text-pizza-dark hover:text-pizza-yellow transition-colors font-medium font-roboto relative group animate-fade-in-up animate-stagger-5 hover-scale">
                  📞 {t('contact')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pizza-yellow to-pizza-orange transition-all duration-300 group-hover:w-full animate-shimmer"></span>
                </a>
              </nav>
            </div>

            {/* Search Component - Hidden on mobile */}
            <div className="hidden lg:block flex-1 max-w-md mx-8 animate-fade-in-up animate-stagger-3">
              <ProductSearch
                placeholder="Cerca pizze, bevande..."
                compact={true}
                onProductSelect={(product) => {
                  console.log('🔍 Product selected from search:', product);
                  // Scroll to products section
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
            </div>

            <div className="flex items-center space-x-4 animate-fade-in-right">
              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="lg:hidden p-2 text-pizza-dark hover:text-pizza-red transition-colors bg-pizza-cream hover:bg-pizza-orange/20 rounded-full animate-scale-in animate-stagger-1"
                aria-label="Cerca prodotti"
                title="Cerca prodotti"
              >
                <Search size={20} />
              </button>

              <div className="animate-scale-in animate-stagger-1">
                <CustomerAccountWidget />
              </div>
              <div className="animate-scale-in animate-stagger-1">
                <LanguageSelector />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🍕 Order button clicked, opening modal...');
                  try {
                    setIsOrderModalOpen(true);
                  } catch (error) {
                    console.error('❌ Error opening order modal:', error);
                  }
                }}
                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pizza-red to-pizza-orange text-white rounded-full hover:from-pizza-red hover:to-pizza-tomato transition-all duration-300 shadow-lg hover:shadow-xl font-bold font-fredoka hover-lift animate-pulse-glow animate-scale-in animate-stagger-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pizza-red focus:ring-offset-2"
                aria-label="Ordina ora"
                title="Ordina ora"
              >
                <Pizza size={18} className="animate-wiggle" />
                🍕 {t('makeReservation')}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🛒 Cart button clicked, opening cart...');
                  try {
                    openCart();
                  } catch (error) {
                    console.error('❌ Error opening cart:', error);
                  }
                }}
                className="relative p-3 text-gray-700 hover:text-red-600 transition-colors bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 rounded-full group shadow-md hover:shadow-lg hover-lift animate-bounce-gentle animate-scale-in animate-stagger-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label={`Apri carrello (${getTotalItems()} articoli)`}
                title={`Carrello (${getTotalItems()} articoli)`}
              >
                <ShoppingCart size={20} className="group-hover:animate-wiggle" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs rounded-full flex items-center justify-center font-inter font-semibold shadow-md animate-heartbeat">
                  {getTotalItems()}
                </span>
                <Pizza className="absolute -bottom-1 -right-1 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce animate-float" size={12} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <OrderOptionsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
      <MobileSearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />
      <SimpleCart />
    </>
  );
};

export default Header;
