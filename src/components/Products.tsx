import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pizza, Sparkles, ChefHat, Users, ShoppingBag, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import OrderOptionsModal from './OrderOptionsModal';

import { Product, ProductsByCategory } from '@/types/category';
import { useStockManagement } from '@/hooks/useStockManagement';

const Products = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const { isProductAvailable } = useStockManagement();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Use React Query for products loading with caching
  const { data: products = {}, isLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<ProductsByCategory> => {
      console.log('🍕 [PRODUCTS-QUERY] Loading products with React Query...');
      const startTime = Date.now();

      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('🍕 [PRODUCTS-QUERY] Error:', error);
        throw error;
      }

      // Group products by category slug
      const groupedProducts: ProductsByCategory = {};

      productsData?.forEach((product) => {
        const categorySlug = product.categories?.slug || 'uncategorized';
        if (!groupedProducts[categorySlug]) {
          groupedProducts[categorySlug] = [];
        }

        // Transform database product to frontend format
        const transformedProduct: Product = {
          ...product,
          category: product.categories?.name || 'Uncategorized',
          category_slug: categorySlug,
          is_available: product.is_active && isProductAvailable(product.stock_quantity),
          images: product.gallery ? (Array.isArray(product.gallery) ? product.gallery : [product.image_url].filter(Boolean)) : [product.image_url].filter(Boolean)
        };

        groupedProducts[categorySlug].push(transformedProduct);
      });

      const queryTime = Date.now() - startTime;
      console.log(`🍕 [PRODUCTS-QUERY] Completed in ${queryTime}ms, found ${Object.values(groupedProducts).flat().length} products`);

      return groupedProducts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Use React Query for content sections
  const { data: contentData } = useQuery({
    queryKey: ['content-sections', 'products'],
    queryFn: async () => {
      console.log('🍕 [CONTENT-QUERY] Loading content sections...');

      const { data, error } = await supabase
        .from('content_sections')
        .select('section_key, content_value')
        .in('section_key', ['products_heading', 'products_subheading'])
        .eq('is_active', true);

      if (error) {
        console.warn('🍕 [CONTENT-QUERY] Error loading content, using defaults:', error);
        return null;
      }

      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  // Set heading and subheading from content data
  const heading = useMemo(() => {
    const headingData = contentData?.find(item => item.section_key === 'products_heading');
    return headingData?.content_value || "Le Nostre Pizze";
  }, [contentData]);

  const subheading = useMemo(() => {
    const subheadingData = contentData?.find(item => item.section_key === 'products_subheading');
    return subheadingData?.content_value || "Autentica pizza italiana preparata con ingredienti freschi e forno a legna tradizionale";
  }, [contentData]);

  // Update search active state when search term changes
  useEffect(() => {
    setIsSearchActive(!!searchTerm.trim());
  }, [searchTerm]);

  // Memoized filtered products to prevent unnecessary re-calculations
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    } else {
      const filtered: ProductsByCategory = {};

      Object.entries(products).forEach(([categorySlug, categoryProducts]) => {
        const matchingProducts = categoryProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (matchingProducts.length > 0) {
          filtered[categorySlug] = matchingProducts;
        }
      });

      return filtered;
    }
  }, [searchTerm, products]);

  // Remove old loading functions - now using React Query

  // Memoized event handlers to prevent unnecessary re-renders
  const toggleCategoryExpansion = useCallback((categorySlug: string) => {
    console.log(`🔄 Toggling category expansion for: ${categorySlug}`);
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categorySlug)) {
        newSet.delete(categorySlug);
        console.log(`📉 Collapsed category: ${categorySlug}`);
      } else {
        newSet.add(categorySlug);
        console.log(`📈 Expanded category: ${categorySlug}`);
      }
      return newSet;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setIsSearchActive(false);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);



  // Memoized utility functions to prevent recreation on every render
  const getIconForCategory = useCallback((categorySlug: string) => {
    switch (categorySlug) {
      case 'semplici':
        return <Pizza className="text-pizza-orange" size={28} />;
      case 'speciali':
        return <ChefHat className="text-pizza-red" size={28} />;
      case 'extra':
        return <Sparkles className="text-green-600" size={28} />;
      default:
        return <Pizza className="text-pizza-orange" size={28} />;
    }
  }, []);

  const getColorForCategory = useCallback((categorySlug: string) => {
    switch (categorySlug) {
      case 'semplici':
        return 'from-pizza-orange to-pizza-red';
      case 'speciali':
        return 'from-pizza-red to-red-600';
      case 'extra':
        return 'from-green-500 to-green-600';
      default:
        return 'from-pizza-orange to-pizza-red';
    }
  }, []);

  // Category display names
  const getCategoryDisplayName = (categorySlug: string) => {
    switch (categorySlug) {
      case 'semplici':
        return 'SEMPLICI - Classic Pizzas & Focacce';
      case 'speciali':
        return 'SPECIALI - Signature & Gourmet';
      case 'extra':
        return 'EXTRA - Toppings';
      case 'pizze-al-metro-per-4-5-persone':
        return 'Pizze al metro per 4-5 persone';
      default:
        return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace('-', ' ');
    }
  };

  // Get category pricing information
  const getCategoryPricingInfo = (categorySlug: string) => {
    switch (categorySlug) {
      case 'pizze-al-metro-per-4-5-persone':
        return 'Prezzo chef, si stabilisce secondo i gusti';
      default:
        return null;
    }
  };

  console.log('🍕 [PRODUCTS-RENDER] Render state:', {
    isLoading,
    productsCount: Object.values(products).flat().length,
    filteredProductsCount: Object.values(filteredProducts).flat().length,
    searchTerm,
    isSearchActive
  });

  // Show error state
  if (productsError) {
    console.log('🍕 [PRODUCTS-RENDER] Showing error state:', productsError);
    return (
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Oops! Qualcosa è andato storto</h2>
            <p className="text-lg text-gray-600 mb-8">Non riusciamo a caricare i nostri prodotti al momento. Riprova tra poco.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Ricarica la pagina
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    console.log('🍕 [PRODUCTS-RENDER] Showing loading state');
    return (
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center animate-fade-in-up">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto animate-pulse-glow"></div>
            <p className="mt-4 text-gray-600 animate-bounce-gentle">Caricamento prodotti...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show all categories that have products, with preferred order for pizza categories
  // Exclude 'extra' category as it should only appear in pizza customization modal
  const categoryOrder = ['semplici', 'speciali'];
  const allCategoriesWithProducts = Object.keys(filteredProducts).filter(slug =>
    filteredProducts[slug] &&
    filteredProducts[slug].length > 0 &&
    slug !== 'extra' // Exclude extras from main menu display
  );

  // Sort categories: preferred order first, then any others alphabetically
  const sortedCategories = [
    ...categoryOrder.filter(slug => allCategoriesWithProducts.includes(slug)),
    ...allCategoriesWithProducts.filter(slug => !categoryOrder.includes(slug)).sort()
  ];



  return (
    <>
      <section id="products" className="py-20 bg-gradient-to-br from-pizza-cream via-white to-pizza-orange/10 overflow-hidden relative">
        {/* Pizza-themed background decorations */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-pizza-red rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-pizza-orange rounded-full blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pizza-green rounded-full blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-pizza-dark mb-4 font-fredoka animate-scale-in">
              🍕 {heading || "Le Nostre Pizze"}
            </h2>
            <p className="text-xl text-pizza-brown max-w-2xl mx-auto font-roboto animate-fade-in-up animate-stagger-1">
              {subheading || "Autentica pizza italiana preparata con ingredienti freschi e di qualità"}
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4 text-pizza-orange animate-fade-in-up animate-stagger-2">
              <Sparkles className="animate-wiggle" size={20} />
              <span className="font-pacifico text-lg">Forno a legna tradizionale</span>
              <Sparkles className="animate-wiggle animation-delay-2000" size={20} />
            </div>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up animate-stagger-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-pizza-brown/60" />
              </div>
              <input
                type="text"
                placeholder="Cerca pizze, bevande, dolci... 🔍"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-12 py-4 bg-white/90 backdrop-blur-sm border-2 border-pizza-orange/20 rounded-2xl text-pizza-dark placeholder-pizza-brown/60 focus:outline-none focus:border-pizza-orange focus:ring-4 focus:ring-pizza-orange/20 transition-all duration-300 shadow-lg hover:shadow-xl font-roboto text-lg"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-pizza-brown/60 hover:text-pizza-red transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Results Info */}
            {isSearchActive && (
              <div className="mt-4 text-center">
                <p className="text-pizza-brown font-roboto">
                  {Object.keys(filteredProducts).length === 0 ? (
                    <span className="text-pizza-red">
                      🔍 Nessun risultato trovato per "{searchTerm}"
                    </span>
                  ) : (
                    <span className="text-pizza-green">
                      ✨ Trovati {Object.values(filteredProducts).flat().length} prodotti per "{searchTerm}"
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Category Sections */}
          <div className="space-y-16">
            {sortedCategories.length === 0 ? (
              <div className="text-center py-12">
                <Pizza className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nessun prodotto disponibile al momento.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Aggiungi prodotti dal pannello admin per visualizzarli qui.
                </p>
              </div>
            ) : (
              sortedCategories.map((categorySlug, categoryIndex) => {
              const categoryProducts = filteredProducts[categorySlug] || [];
              const displayName = getCategoryDisplayName(categorySlug);
              const icon = getIconForCategory(categorySlug);
              const colorClass = getColorForCategory(categorySlug);

              return (
                <div
                  key={categorySlug}
                  className={`space-y-8 animate-slide-in-up animate-stagger-${Math.min(categoryIndex + 2, 5)}`}
                >
                  {/* Category Header */}
                  <div className="text-center animate-fade-in-down">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`p-4 rounded-full bg-gradient-to-r ${colorClass} shadow-lg hover-lift animate-bounce-gentle`}>
                        <div className="bg-white p-2 rounded-full animate-heartbeat">
                          {icon}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2 font-playfair animate-fade-in-up">
                      {displayName}
                    </h3>
                    {getCategoryPricingInfo(categorySlug) && (
                      <p className="text-lg text-pizza-orange font-semibold mb-3 animate-fade-in-up italic">
                        {getCategoryPricingInfo(categorySlug)}
                      </p>
                    )}
                    <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto rounded-full animate-shimmer"></div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {(expandedCategories.has(categorySlug) ? categoryProducts : categoryProducts.slice(0, 4)).map((product, productIndex) => (
                      <div
                        key={product.id}
                        className={`animate-scale-in animate-stagger-${Math.min(productIndex + 1, 5)} hover-lift`}
                      >
                        <ProductCard
                          product={product}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Show more/less button if there are more than 4 products */}
                  {categoryProducts.length > 4 && (
                    <div className="text-center animate-fade-in-up animate-stagger-5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleCategoryExpansion(categorySlug);
                        }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-full hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover-glow animate-pulse-glow cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        aria-label={expandedCategories.has(categorySlug) ? `Nascondi prodotti ${displayName}` : `Mostra tutti i prodotti ${displayName}`}
                        title={expandedCategories.has(categorySlug) ? `Nascondi prodotti ${displayName}` : `Mostra tutti i prodotti ${displayName}`}
                      >
                        <ShoppingBag size={20} className="animate-wiggle" />
                        {expandedCategories.has(categorySlug) ? (
                          <>
                            Mostra meno {displayName}
                            <span className="bg-white/20 px-2 py-1 rounded-full text-sm animate-bounce-gentle">
                              -{categoryProducts.length - 4}
                            </span>
                          </>
                        ) : (
                          <>
                            Vedi tutti i prodotti {displayName}
                            <span className="bg-white/20 px-2 py-1 rounded-full text-sm animate-bounce-gentle">
                              +{categoryProducts.length - 4}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center animate-slide-in-up animate-stagger-5">
            <div className="bg-gradient-to-br from-pizza-cream/50 via-white to-pizza-orange/10 rounded-2xl p-8 border border-pizza-orange/20 hover-lift animate-pulse-glow">
              <div className="flex items-center justify-center mb-4">
                <Pizza className="text-pizza-red animate-pizza-spin mr-3" size={32} />
                <h3 className="text-2xl font-bold text-pizza-dark font-fredoka animate-fade-in-up">
                  🍕 Vuoi una Pizza Personalizzata?
                </h3>
                <Pizza className="text-pizza-orange animate-pizza-spin ml-3 animation-delay-2000" size={32} />
              </div>
              <p className="text-pizza-brown mb-6 font-roboto text-lg animate-fade-in-up animate-stagger-1">
                Chiamaci per pizze su misura ed eventi speciali per le tue feste!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-stagger-2">
                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  className="bg-gradient-to-r from-pizza-red to-pizza-orange text-white px-8 py-4 rounded-full hover:from-pizza-red hover:to-pizza-tomato transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover-glow animate-heartbeat font-fredoka font-bold text-lg"
                >
                  Richiedi Preventivo Personalizzato
                </button>
                <button
                  onClick={() => {
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="border-2 border-emerald-500 text-emerald-600 px-8 py-3 rounded-full hover:bg-emerald-50 transition-all duration-300 hover-lift animate-bounce-gentle"
                >
                  Contattaci
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Options Modal */}
      <OrderOptionsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </>
  );
};

export default Products;
