'use client';

import { useCartStore, Product } from '@/lib/store';
import { Heart, Trash2, ShoppingBag, X } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { getFirstAvailableSize } from '@/lib/product-utils';
import { handleKeyboardClick } from '@/lib/a11y-utils';

/** Get images for a given product and color name */
function getImagesForColor(product: Product, colorName: string): string[] {
  if (product.colorImages && product.colorImages[colorName]) {
    return product.colorImages[colorName];
  }
  return product.images.length > 0 ? product.images : [product.image];
}

export default function WishlistSection() {
  const wishlist = useCartStore((state) => state.wishlist);
  const removeWishlistItem = useCartStore((state) => state.removeWishlistItem);
  const addItem = useCartStore((state) => state.addItem);
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct);
  const setPreselectedColor = useCartStore((state) => state.setPreselectedColor);
  const setDetailOpen = useCartStore((state) => state.setDetailOpen);
  const addRecentlyViewed = useCartStore((state) => state.addRecentlyViewed);
  const products = useCartStore((state) => state.products);
  const setWishlistOpen = useCartStore((state) => state.setWishlistOpen);

  // Look up full product objects from wishlist items (product+color pairs)
  const wishlistEntries = useMemo(() => {
    const productMap = new Map(products.map((p) => [p.id, p]));
    return wishlist
      .map((w) => {
        const product = productMap.get(w.productId);
        if (!product) return null;
        return { product, colorName: w.colorName };
      })
      .filter(Boolean) as { product: Product; colorName: string }[];
  }, [wishlist, products]);

  const handleMoveToCart = useCallback((product: Product, colorName: string) => {
    const size = getFirstAvailableSize(product);
    if (!size) {
      toast({
        title: 'Producto agotado',
        description: `${product.name} no tiene tallas disponibles.`,
        variant: 'destructive',
      });
      return;
    }
    addItem({
      product,
      quantity: 1,
      selectedSize: size,
      selectedColor: colorName,
    });
    removeWishlistItem(product.id, colorName);
    toast({
      title: 'Movido al carrito',
      description: `${product.name} — ${colorName}`,
    });
  }, [addItem, removeWishlistItem, setSelectedProduct, setPreselectedColor, setDetailOpen, addRecentlyViewed]);

  const handleRemove = useCallback((productId: string, colorName: string) => {
    removeWishlistItem(productId, colorName);
    toast({
      title: 'Eliminado de favoritos',
      description: 'Se quitó de tu lista de deseos',
    });
  }, [removeWishlistItem]);

  // Product detail disabled
  const handleViewProduct = useCallback((product: Product, colorName: string) => {
    setSelectedProduct(product);
    setPreselectedColor(colorName);
    setDetailOpen(true);
    addRecentlyViewed(product.id);
  }, [setSelectedProduct, setPreselectedColor, setDetailOpen, addRecentlyViewed]);

  // Don't render if wishlist is empty
  if (wishlistEntries.length === 0) return null;

  return (
    <div className="bg-[#0D0D0D] border-b border-white/[0.04] relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#E30613]/3 via-transparent to-[#E30613]/3 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Heart className="h-4 w-4 text-[#E30613] fill-[#E30613]" />
            <h3 className="text-sm font-montserrat-extrabold text-white tracking-wider uppercase">
              Mi Lista de Deseos
              <span className="text-[#E30613] ml-1.5">({wishlistEntries.length})</span>
            </h3>
          </div>
          <button
            onClick={() => setWishlistOpen(true)}
            className="text-xs text-white/30 hover:text-[#E30613] transition-colors cursor-pointer font-montserrat-bold tracking-wide"
          >
            Ver todo
          </button>
        </div>

        {/* Horizontal scroll of wishlist items */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {wishlistEntries.map((entry) => {
            const { product, colorName } = entry;
            const colorObj = product.colors.find((c) => c.name === colorName);
            const colorImages = getImagesForColor(product, colorName);
            const displayImage = colorImages[0] || product.image;

            return (
              <div
                key={`${product.id}-${colorName}`}
                className="wishlist-section-item flex-shrink-0 w-[160px] sm:w-[180px] bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden group hover:border-[#E30613]/30 transition-all duration-300 animate-fade-in"
              >
                {/* Thumbnail */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver ${product.name}, color ${colorName}`}
                  className="relative w-full h-[140px] sm:h-[160px] overflow-hidden cursor-pointer"
                  onClick={() => handleViewProduct(product, colorName)}
                  onKeyDown={(e) => handleKeyboardClick(e, () => handleViewProduct(product, colorName))}
                >
                  <img
                    src={displayImage}
                    alt={`${product.name} — ${colorName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Remove button overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(product.id, colorName);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-[#E30613] hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    aria-label="Eliminar de favoritos"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {/* Color indicator */}
                  {colorObj && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: colorObj.hex }}
                      />
                      <span className="text-[9px] text-white/70 capitalize">{colorName}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 sm:p-3">
                  <p className="text-xs font-montserrat-bold text-white truncate">{product.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-montserrat-extrabold text-[#E30613]">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleMoveToCart(product, colorName)}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 bg-[#E30613]/15 text-[#E30613] text-[10px] font-montserrat-bold tracking-wide uppercase rounded-lg hover:bg-[#E30613] hover:text-white transition-all duration-300 cursor-pointer border border-[#E30613]/20 hover:border-[#E30613]/60"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    Mover al Carrito
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
