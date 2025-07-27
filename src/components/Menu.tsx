
import React, { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import PatternDivider from "./PatternDivider";
import { Pizza } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categories?: {
    name: string;
    slug: string;
  };
}

const MenuSection = ({ title, items, pricingInfo }: { title: string; items: Product[]; pricingInfo?: string }) => {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-pizza-dark mb-6 text-center">
        <span className="border-b-2 border-pizza-red pb-1">{title}</span>
      </h3>
      {pricingInfo && (
        <p className="text-lg text-pizza-orange font-semibold mb-4 text-center italic">
          {pricingInfo}
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-8">
        {items.map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-baseline mb-2">
              <h4 className="text-lg font-semibold text-pizza-dark">{item.name}</h4>
              <span className="text-pizza-red font-bold">€{(typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0)).toFixed(2)}</span>
            </div>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Menu = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get category pricing information
  const getCategoryPricingInfo = (categoryName: string) => {
    if (categoryName === 'Pizze al metro per 4-5 persone') {
      return 'Prezzo chef, si stabilisce secondo i gusti';
    }
    return null;
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
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

      if (!error && productsData) {
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.categories?.name || 'Altre Specialità';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  if (isLoading) {
    return (
      <section id="menu" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Pizza className="animate-spin h-6 w-6 text-pizza-red" />
            <span>Caricamento menu...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-pizza-dark flex items-center justify-center gap-3">
            <Pizza className="h-8 w-8 text-pizza-red" />
            Le Nostre Pizze
            <Pizza className="h-8 w-8 text-pizza-red" />
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Autentica pizza italiana preparata con ingredienti freschi e forno a legna tradizionale
          </p>
        </div>

        <PatternDivider />

        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-10 rounded-lg shadow-lg">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="text-center py-12">
              <Pizza className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nessun prodotto disponibile al momento.</p>
              <p className="text-sm text-gray-500 mt-2">
                Aggiungi prodotti dal pannello admin per visualizzarli qui.
              </p>
            </div>
          ) : (
            Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
              <MenuSection
                key={categoryName}
                title={categoryName}
                items={categoryProducts}
                pricingInfo={getCategoryPricingInfo(categoryName)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Menu;
