
import React, { useState } from 'react';
import { ShoppingCart, Eye, Tag } from 'lucide-react';
import { Product } from '@/types/category';

import { useToast } from '@/hooks/use-toast';
import { useSimpleCart, PizzaExtra } from '@/hooks/use-simple-cart';
import { Badge } from '@/components/ui/badge';
import PizzaCustomizationModal from './PizzaCustomizationModal';
import { formatPrice } from '@/utils/priceUtils';
import { useStockManagement } from '@/hooks/useStockManagement';

interface ProductCardProps {
  product?: Product;
  // Legacy props for backward compatibility
  name?: string;
  price?: string;
  image?: string;
  description?: string;
  onOrder?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  name,
  price,
  image,
  description,
  onOrder,
  onViewDetails
}) => {
  const { toast } = useToast();
  const { addItem } = useSimpleCart();
  const { isProductAvailable, getStockStatus, getStockMessage, isStockManagementEnabled } = useStockManagement();
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  // Use product data if available, otherwise fall back to legacy props
  const productName = product?.name || name || '';
  const productPrice = product ? formatPrice(product.price) : price || '';
  const productImage = product?.image_url || image || '';
  const productDescription = product?.description || description || '';
  const stockQuantity = product?.stock_quantity || 0;

  // Use stock management logic to determine availability
  const isAvailable = isProductAvailable(stockQuantity);
  const stockStatus = getStockStatus(stockQuantity);
  const stockMessage = getStockMessage(stockQuantity);

  // Check if this is a pizza that can be customized (SEMPLICI or SPECIALI categories)
  const isPizza = product?.category_slug === 'semplici' || product?.category_slug === 'speciali';
  const isExtra = product?.category_slug === 'extra';

  const handleOrderClick = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    console.log('🛒 Add to cart button clicked', { product, isAvailable, isPizza });

    if (product && isAvailable) {
      // For pizzas, open customization modal
      if (isPizza) {
        setIsCustomizationOpen(true);
        return;
      }

      // For non-pizza items (like extras), add directly to cart
      try {
        const result = await addItem(product, 1);
        if (result !== null) {
          toast({
            title: 'Prodotto aggiunto al carrello! 🛒',
            description: `${product.name} è stato aggiunto al tuo carrello.`,
          });
          console.log('✅ Product added to cart successfully');
        }
        // If result is null, business hours validation failed and user was already notified
      } catch (error) {
        console.error('❌ Error adding product to cart:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile aggiungere il prodotto al carrello.',
          variant: 'destructive'
        });
      }
    } else {
      console.warn('⚠️ Cannot add to cart:', { product: !!product, isAvailable });
      if (!product) {
        toast({
          title: 'Errore',
          description: 'Dati prodotto non disponibili.',
          variant: 'destructive'
        });
      } else if (!isAvailable) {
        toast({
          title: 'Non disponibile',
          description: 'Questo prodotto non è attualmente disponibile.',
          variant: 'destructive'
        });
      }
    }
  };

  const handlePizzaCustomization = async (pizza: Product, quantity: number, extras: PizzaExtra[], specialRequests?: string) => {
    try {
      const result = await addItem(pizza, quantity, extras, specialRequests);
      if (result !== null) {
        console.log('✅ Customized pizza added to cart successfully');
        toast({
          title: 'Pizza personalizzata aggiunta! 🍕',
          description: `${pizza.name} personalizzata è stata aggiunta al tuo carrello.`,
        });
      }
      // If result is null, business hours validation failed and user was already notified
    } catch (error) {
      console.error('❌ Error adding customized pizza to cart:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere la pizza personalizzata al carrello.',
        variant: 'destructive'
      });
    }
  };

  const handleViewDetails = () => {
    if (product && onViewDetails) {
      onViewDetails(product);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-peach-50/30 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-peach-100/50">
      <div className="relative overflow-hidden">
        <img
          src={productImage}
          alt={productName}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-peach-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Stock indicator */}
        {product && isStockManagementEnabled && (
          <div className="absolute top-3 left-3">
            {stockStatus === 'out_of_stock' ? (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Non Disponibile
              </span>
            ) : stockStatus === 'low' ? (
              <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                {stockMessage}
              </span>
            ) : stockStatus === 'available' ? (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Disponibile
              </span>
            ) : null}
          </div>
        )}

        {/* Product Labels overlay on images */}
        {product && product.labels && product.labels.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {product.labels.map((label, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-white/90 text-blue-700 border-blue-200 text-xs backdrop-blur-sm"
              >
                <Tag className="w-3 h-3 mr-1" />
                {label}
              </Badge>
            ))}
          </div>
        )}

        {/* Action buttons overlay */}
        {product && (onOrder || onViewDetails) && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
            {onViewDetails && (
              <button
                onClick={handleViewDetails}
                className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full hover:bg-white transition-all duration-300 shadow-lg"
                title="Visualizza dettagli"
              >
                <Eye size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 font-playfair">{productName}</h3>
        <p className="text-gray-600 mb-4 text-sm font-inter line-clamp-2">{productDescription}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-coral-600 font-playfair">
            {productPrice}
          </span>

          {product ? (
            <button
              type="button"
              onClick={handleOrderClick}
              disabled={!isAvailable}
              className={`p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 group/btn focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                isAvailable
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={isAvailable ? (isPizza ? 'Personalizza pizza' : 'Aggiungi al carrello') : 'Non disponibile'}
              aria-label={isAvailable ? (isPizza ? `Personalizza ${product.name}` : `Aggiungi ${product.name} al carrello`) : 'Prodotto non disponibile'}
            >
              <ShoppingCart size={20} className={isAvailable ? 'group-hover/btn:animate-bounce' : ''} />
            </button>
          ) : (
            <button
              type="button"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-full hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 group/btn cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              onClick={() => console.log('Legacy button clicked - no product data')}
              aria-label="Aggiungi al carrello"
            >
              <ShoppingCart size={20} className="group-hover/btn:animate-bounce" />
            </button>
          )}
        </div>

        {/* Category badge */}
        {product && (
          <div className="mt-3">
            <span className="inline-block bg-peach-100 text-peach-800 px-2 py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
          </div>
        )}
      </div>

      {/* Pizza Customization Modal */}
      {product && isPizza && (
        <PizzaCustomizationModal
          isOpen={isCustomizationOpen}
          onClose={() => setIsCustomizationOpen(false)}
          pizza={product}
          onAddToCart={handlePizzaCustomization}
        />
      )}
    </div>
  );
};

export default ProductCard;
