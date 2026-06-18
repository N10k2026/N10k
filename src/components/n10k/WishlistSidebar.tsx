'use client';

import { useCartStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import React from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight, Share2, Copy, MessageCircle } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

/** Get images for a given product and color name */
function getImagesForColor(product: Product, colorName: string): string[] {
  if (product.colorImages && product.colorImages[colorName]) {
    return product.colorImages[colorName];
  }
  return product.images.length > 0 ? product.images : [product.image];
}

const WishlistSidebar = function WishlistSidebar() {
  // Zustand selectors — subscribe only to what we need
  const wishlist = useCartStore((state) => state.wishlist);
  const isWishlistOpen = useCartStore((state) => state.isWishlistOpen);
  const setWishlistOpen = useCartStore((state) => state.setWishlistOpen);
  const removeWishlistItem = useCartStore((state) => state.removeWishlistItem);
  const clearWishlist = useCartStore((state) => state.clearWishlist);
  const addItem = useCartStore((state) => state.addItem);
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct);
  const setPreselectedColor = useCartStore((state) => state.setPreselectedColor);
  const setDetailOpen = useCartStore((state) => state.setDetailOpen);
  const products = useCartStore((state) => state.products);

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

  // WhatsApp number for sharing
  const WHATSAPP_NUMBER = '584122880228';

  // Share wishlist via WhatsApp
  const handleShareWhatsApp = useCallback(() => {
    if (wishlistEntries.length === 0) return;
    const lines = wishlistEntries.map((entry, i) =>
      `${i + 1}. *${entry.product.name}* — ${entry.colorName} — $${entry.product.price.toFixed(2)}`
    );
    const message = [
      `*Mi Lista de Favoritos — N10K Clothes*`,
      ``,
      lines.join('\n'),
      ``,
      `Total: *$${wishlistEntries.reduce((sum, e) => sum + e.product.price, 0).toFixed(2)}*`,
      ``,
      `¡Mira lo que me gusta de N10K!`,
    ].join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    toast({ title: 'Lista compartida', description: 'Se abrió WhatsApp con tu lista de favoritos' });
  }, [wishlistEntries]);

  // Copy wishlist to clipboard
  const handleCopyList = useCallback(async () => {
    if (wishlistEntries.length === 0) return;
    const lines = wishlistEntries.map((entry, i) =>
      `${i + 1}. ${entry.product.name} — ${entry.colorName} — $${entry.product.price.toFixed(2)}`
    );
    const text = [
      `Mi Lista de Favoritos — N10K Clothes`,
      ``,
      ...lines,
      ``,
      `Total: $${wishlistEntries.reduce((sum, e) => sum + e.product.price, 0).toFixed(2)}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Lista copiada', description: 'Se copió tu lista de favoritos al portapapeles' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo copiar la lista' });
    }
  }, [wishlistEntries]);

  return (
    <Sheet open={isWishlistOpen} onOpenChange={setWishlistOpen}>
      <SheetContent side="left" className="cart-sidebar-gradient w-full sm:max-w-md border-r border-border p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground font-black tracking-wider flex items-center gap-3">
              <Heart className="h-5 w-5 text-[#E30613]" />
              FAVORITOS
              <span className="text-sm text-[#E30613] font-bold">({wishlist.length})</span>
            </SheetTitle>
            <SheetDescription className="sr-only">Lista de favoritos</SheetDescription>
          </div>
          {/* Share wishlist buttons */}
          {wishlist.length > 0 && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 text-[#25D366] text-[11px] font-bold hover:bg-[#25D366]/25 transition-colors cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Compartir Lista
              </button>
              <button
                onClick={handleCopyList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-[11px] font-bold hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar lista
              </button>
            </div>
          )}
        </SheetHeader>

        {/* Wishlist Items */}
        {wishlist.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-bold text-lg mb-1.5">No tienes favoritos aún</p>
            <p className="text-muted-foreground text-sm text-center mb-6">
              <span className="block">Explora nuestras colecciones y</span>
              <span className="block">guarda las prendas que más te gusten</span>
            </p>
            <Button
              className="bg-[#E30613] hover:bg-[#ff2d34] text-white font-bold text-sm px-6 py-2.5 rounded-full tracking-wide btn-press"
              onClick={() => setWishlistOpen(false)}
              asChild
            >
              <a href="#collection">Colección</a>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlistEntries.map((entry) => {
                const { product, colorName } = entry;
                const colorObj = product.colors.find((c) => c.name === colorName);
                const colorImages = getImagesForColor(product, colorName);
                const displayImage = colorImages[0] || product.image;

                return (
                  <div
                    key={`${product.id}-${colorName}`}
                    className="wishlist-item-enter flex gap-4 bg-card p-3 border border-border group hover:border-[#E30613]/30 transition-colors duration-300"
                  >
                    {/* Product image */}
                    <div
                      className="w-20 h-24 flex-shrink-0 overflow-hidden cursor-pointer"
                      onClick={() => {
                        setWishlistOpen(false);
                      }}
                    >
                      <img
                        src={displayImage}
                        alt={`${product.name} — ${colorName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-foreground line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {product.category}
                          </p>
                          {/* Color indicator */}
                          {colorObj && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <span
                                className="w-3 h-3 rounded-full border border-border"
                                style={{ backgroundColor: colorObj.hex }}
                              />
                              <span className="text-[10px] text-muted-foreground capitalize">{colorName}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-[#E30613] -mt-1 -mr-1 transition-colors duration-300"
                          onClick={() => removeWishlistItem(product.id, colorName)}
                          aria-label="Quitar de favoritos"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Quick add to cart — uses the specific color */}
                        <button
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E30613]/15 backdrop-blur-sm text-[#E30613] text-[10px] font-montserrat-bold tracking-[0.08em] uppercase transition-all duration-300 hover:bg-[#E30613] hover:text-white cursor-pointer border border-[#E30613]/20 hover:border-[#E30613]/60 btn-press"
                          onClick={() => {
                            // Pick the first in-stock size; show an error toast
                            // if the product is completely out of stock.
                            const inStockSize = product.sizes.find(
                              (s) => !product.outOfStock?.includes(s)
                            );
                            if (!inStockSize) {
                              toast({
                                title: 'Sin stock',
                                description: `${product.name} no está disponible en este momento.`,
                                variant: 'destructive',
                              });
                              return;
                            }
                            addItem({
                              product,
                              quantity: 1,
                              selectedSize: inStockSize,
                              selectedColor: colorName,
                            });
                            toast({
                              title: 'Agregado al carrito',
                              description: `${product.name} — ${colorName}`,
                            });
                          }}
                        >
                          <ShoppingBag className="h-2.5 w-2.5" />
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6 space-y-4 bg-gradient-to-b from-[#0a0a0a] to-[#111111]">
              <Button
                className="w-full bg-[#E30613] hover:bg-[#ff2d34] text-white font-black text-base py-6 rounded-none tracking-wider uppercase shadow-lg shadow-[#E30613]/20 btn-press transition-colors duration-300"
                onClick={() => {
                  // Add all wishlist items to cart with their specific colors.
                  // Pick the first in-stock size for each item; skip items that
                  // are completely out of stock.
                  let added = 0;
                  let skipped = 0;
                  wishlistEntries.forEach((entry) => {
                    const inStockSize = entry.product.sizes.find(
                      (s) => !entry.product.outOfStock?.includes(s)
                    );
                    if (!inStockSize) {
                      skipped++;
                      return;
                    }
                    addItem({
                      product: entry.product,
                      quantity: 1,
                      selectedSize: inStockSize,
                      selectedColor: entry.colorName,
                    });
                    added++;
                  });
                  setWishlistOpen(false);
                  if (skipped > 0) {
                    toast({
                      title: 'Algunos productos no están disponibles',
                      description: `${added} agregado(s). ${skipped} sin stock.`,
                      variant: 'destructive',
                    });
                  } else if (added > 0) {
                    toast({
                      title: 'Agregados al carrito',
                      description: `${added} producto(s) de tu lista de favoritos.`,
                    });
                  }
                }}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Agregar Todo al Carrito
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                className="w-full border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-montserrat-bold rounded-none transition-colors duration-300"
                onClick={() => setWishlistOpen(false)}
              >
                Seguir Explorando
              </Button>

              <button
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-[#E30613] transition-colors duration-300 cursor-pointer py-2"
                onClick={clearWishlist}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="font-montserrat-semibold tracking-wide uppercase">Vaciar Favoritos</span>
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default React.memo(WishlistSidebar);
