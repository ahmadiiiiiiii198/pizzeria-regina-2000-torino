import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, ShoppingCart, X } from 'lucide-react';
import { Product } from '@/types/category';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, calculateTotal, addPrices, roundToTwoDecimals } from '@/utils/priceUtils';

interface PizzaExtra {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface SelectedExtra extends PizzaExtra {
  quantity: number;
}

interface PizzaCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pizza: Product | null;
  onAddToCart: (pizza: Product, quantity: number, extras: SelectedExtra[], specialRequests?: string) => void;
}

const PizzaCustomizationModal: React.FC<PizzaCustomizationModalProps> = ({
  isOpen,
  onClose,
  pizza,
  onAddToCart
}) => {
  const [availableExtras, setAvailableExtras] = useState<PizzaExtra[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load available extras when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExtras();
      // Reset state when modal opens
      setSelectedExtras([]);
      setQuantity(1);
      setSpecialRequests('');
    }
  }, [isOpen]);

  const loadExtras = async () => {
    try {
      setIsLoading(true);

      // Get category IDs for both 'extra' and 'bevande'
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, slug')
        .in('slug', ['extra', 'bevande']);

      if (categoriesError) throw categoriesError;

      const categoryIds = categoriesData.map(cat => cat.id);

      // Then get products with those category_ids
      const { data: extrasData, error } = await supabase
        .from('products')
        .select('id, name, price, description')
        .eq('is_active', true)
        .in('category_id', categoryIds)
        .order('name');

      if (error) throw error;

      const extras: PizzaExtra[] = extrasData.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description || ''
      }));

      setAvailableExtras(extras);
    } catch (error) {
      console.error('Error loading extras:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare gli extra disponibili.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addExtra = (extra: PizzaExtra) => {
    setSelectedExtras(prev => {
      const existing = prev.find(item => item.id === extra.id);
      if (existing) {
        return prev.map(item =>
          item.id === extra.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...extra, quantity: 1 }];
    });
  };

  const removeExtra = (extraId: string) => {
    setSelectedExtras(prev => prev.filter(item => item.id !== extraId));
  };

  const updateExtraQuantity = (extraId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeExtra(extraId);
      return;
    }
    setSelectedExtras(prev =>
      prev.map(item =>
        item.id === extraId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotalPrice = () => {
    if (!pizza) return 0;

    const pizzaPrice = calculateTotal(pizza.price, quantity);
    const extrasPrice = selectedExtras.reduce((total, extra) =>
      addPrices(total, calculateTotal(extra.price * extra.quantity, quantity)), 0
    );

    return addPrices(pizzaPrice, extrasPrice);
  };

  const handleAddToCart = () => {
    if (!pizza) return;

    onAddToCart(pizza, quantity, selectedExtras, specialRequests);
    onClose();

    toast({
      title: 'Pizza aggiunta al carrello! 🍕',
      description: `${pizza.name} con ${selectedExtras.length} extra/bevande è stata aggiunta al carrello.`,
    });
  };

  if (!pizza) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🍕 Personalizza la tua {pizza.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pizza Info */}
          <div className="flex gap-4">
            <img
              src={pizza.image_url}
              alt={pizza.name}
              className="w-24 h-24 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{pizza.name}</h3>
              <p className="text-gray-600 text-sm">{pizza.description}</p>
              <p className="text-lg font-bold text-pizza-orange mt-2">{formatPrice(pizza.price)}</p>
            </div>
          </div>

          <Separator />

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Quantità:</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 p-0"
              >
                <Minus size={14} />
              </Button>
              <span className="font-medium w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Extras Section */}
          <div>
            <h4 className="font-semibold mb-3">Aggiungi Extra e Bevande:</h4>
            {isLoading ? (
              <div className="text-center py-4">Caricamento extra...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableExtras.map(extra => {
                  const selectedExtra = selectedExtras.find(item => item.id === extra.id);
                  return (
                    <div
                      key={extra.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{extra.name}</h5>
                          <p className="text-xs text-gray-600">{extra.description}</p>
                          <p className="text-sm font-semibold text-green-600">+€{extra.price.toFixed(2)}</p>
                        </div>
                        {!selectedExtra ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addExtra(extra)}
                            className="ml-2"
                          >
                            <Plus size={14} />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateExtraQuantity(extra.id, selectedExtra.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus size={12} />
                            </Button>
                            <span className="text-xs w-6 text-center">{selectedExtra.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateExtraQuantity(extra.id, selectedExtra.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus size={12} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeExtra(extra.id)}
                              className="h-6 w-6 p-0 ml-1 text-red-500 hover:text-red-700"
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Extras Summary */}
          {selectedExtras.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Extra Selezionati:</h4>
                <div className="space-y-2">
                  {selectedExtras.map(extra => (
                    <div key={extra.id} className="flex justify-between items-center text-sm">
                      <span>{extra.name} x{extra.quantity}</span>
                      <span className="font-medium">+€{(extra.price * extra.quantity * quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Special Requests */}
          <div>
            <label className="block font-medium mb-2">Richieste Speciali:</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Es: senza cipolla, cottura ben cotta, ecc..."
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
            />
          </div>

          <Separator />

          {/* Total and Add to Cart */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Totale:</span>
              <span className="text-pizza-orange">{formatPrice(calculateTotalPrice())}</span>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annulla
              </Button>
              <Button onClick={handleAddToCart} className="flex-1 bg-pizza-orange hover:bg-pizza-red">
                <ShoppingCart size={16} className="mr-2" />
                Aggiungi al Carrello
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PizzaCustomizationModal;
