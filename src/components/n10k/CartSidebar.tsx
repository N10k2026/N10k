'use client';

import React, { useMemo, useCallback } from 'react';
import { useCartStore, selectTotalItems, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, ShoppingBag, Trash2, MessageCircle, Truck, Clock, AlertTriangle } from 'lucide-react';

/** Calculate estimated delivery date (3-5 business days from now) */
function getEstimatedDelivery(): { minDate: Date; maxDate: Date; minDays: number; maxDays: number; formattedMin: string; formattedMax: string } {
  const now = new Date();
  let minDays = 0;
  let maxDays = 0;
  const minDate = new Date(now);
  const maxDate = new Date(now);

  // Add 3 business days for min
  while (minDays < 3) {
    minDate.setDate(minDate.getDate() + 1);
    const day = minDate.getDay();
    if (day !== 0 && day !== 6) minDays++;
  }

  // Add 5 business days for max
  while (maxDays < 5) {
    maxDate.setDate(maxDate.getDate() + 1);
    const day = maxDate.getDay();
    if (day !== 0 && day !== 6) maxDays++;
  }

  return {
    minDate,
    maxDate,
    minDays,
    maxDays,
    formattedMin: minDate.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }),
    formattedMax: maxDate.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }),
  };
}

/** Get images for a given product and color name */
function getImagesForColor(product: Product, colorName: string): string[] {
  if (product.colorImages && product.colorImages[colorName]) {
    return product.colorImages[colorName];
  }
  return product.images.length > 0 ? product.images : [product.image];
}

const CartSidebar = function CartSidebar() {
  // Zustand selectors — subscribe only to what we need
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const setOpen = useCartStore((state) => state.setOpen);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  // Derived selector for totalItems (PERF-9)
  const totalItems = useCartStore(selectTotalItems);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items]);
  // Compute delivery estimate once per render instead of calling the function
  // multiple times in JSX.
  const delivery = useMemo(() => getEstimatedDelivery(), [items.length]);

  // WhatsApp number (country code + number, no + or spaces)
  const WHATSAPP_NUMBER = '584122880228';

  // Build WhatsApp message from cart
  const buildWhatsAppMessage = useCallback(() => {
    const lines = items.map((item, i) => {
      const subtotal = (item.product.price * item.quantity).toFixed(2);
      return `${i + 1}. *${item.product.name}*\n   Talla: ${item.selectedSize} | Color: ${item.selectedColor}\n   Cant: ${item.quantity} x $${item.product.price.toFixed(2)} = *$${subtotal}*`;
    });

    const message = [
      `*NUEVO PEDIDO - N10K Clothes*`,
      ``,
      lines.join('\n\n'),
      ``,
      `----------------------------`,
      `Subtotal: $${totalPrice.toFixed(2)}`,
      `Envio: Cobro a destino MRW`,
      `*Total: $${totalPrice.toFixed(2)}*`,
      ``,
      `Gracias por comprar con N10K!`,
    ].join('\n');

    return encodeURIComponent(message);
  }, [items, totalPrice]);

  const handleWhatsAppCheckout = useCallback(() => {
    const message = buildWhatsAppMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  }, [buildWhatsAppMessage]);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="cart-sidebar-gradient w-full sm:max-w-md border-l border-border p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground font-black tracking-wider flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-[#E30613]" />
              CARRITO
              <span key={totalItems} className="text-sm text-[#E30613] font-bold animate-bounce" style={{ animationIterationCount: 1, animationDuration: '0.4s' }}>({totalItems})</span>
            </SheetTitle>
            <SheetDescription className="sr-only">Carrito de compras</SheetDescription>
          </div>
        </SheetHeader>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-bold text-lg mb-1.5">Tu carrito está vacío</p>
            <p className="text-muted-foreground text-sm text-center mb-6">
              <span className="block">Explora nuestras colecciones y</span>
              <span className="block">encuentra tu próximo look N10K</span>
            </p>
            <Button
              className="bg-[#E30613] hover:bg-[#ff2d34] text-white font-bold text-sm px-6 py-2.5 rounded-full tracking-wide btn-press"
              onClick={() => setOpen(false)}
              asChild
            >
              <a href="#collection">Colección</a>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-0">
              {items.map((item, idx) => {
                const colorImages = getImagesForColor(item.product, item.selectedColor);
                const displayImage = colorImages[0] || item.product.image;
                const colorObj = item.product.colors.find((c) => c.name === item.selectedColor);
                const hasSelectedColor = !!colorObj;

                return (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                  className={`cart-item-enter flex gap-4 bg-card p-3 border border-border transition-all duration-300 hover:border-white/10 ${
                    hasSelectedColor ? 'border-l-[#E30613] border-l-2' : ''
                  } ${idx > 0 ? 'mt-3 pt-3 border-t border-white/5' : ''}`}
                >
                  <div className="w-20 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={displayImage}
                      alt={`${item.product.name} — ${item.selectedColor}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          {colorObj && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-border flex-shrink-0"
                              style={{ backgroundColor: colorObj.hex }}
                            />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {item.selectedSize} · {item.selectedColor}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-[#E30613] -mt-1 -mr-1"
                        onClick={() =>
                          removeItem(item.product.id, item.selectedSize, item.selectedColor)
                        }
                        aria-label="Eliminar del carrito"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor,
                              item.quantity - 1
                            )
                          }
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-foreground text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor,
                              item.quantity + 1
                            )
                          }
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-black text-foreground">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>

            {/* Summary */}
            <div className="border-t border-border p-4 sm:p-6 space-y-4 bg-gradient-to-b from-[#0a0a0a] to-[#111111]">
              {/* Delivery badge */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl">
                <Truck className="h-4 w-4 text-[#25D366]" />
                <span className="text-[#25D366] text-xs font-bold">Envío disponible</span>
              </div>

              {/* Estimated Delivery Countdown */}
              {items.length > 0 && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
                  {/* Urgency header */}
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#E30613]" />
                    <span className="text-[11px] font-montserrat-extrabold text-[#E30613] uppercase tracking-wider">
                      ¡Pide ahora y recíbelo antes del {delivery.formattedMax}!
                    </span>
                  </div>

                  {/* Delivery estimate */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-lg bg-[#E30613]/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-[#E30613] animate-truck" />
                      </div>
                      {/* Animated dot */}
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E30613] animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-white/30 uppercase tracking-wide">Recíbelo estimado</p>
                      <p className="text-sm font-montserrat-extrabold text-white">
                        {delivery.formattedMin} – {delivery.formattedMax}
                      </p>
                    </div>
                  </div>

                  {/* Countdown-like display */}
                  <div className="flex items-center gap-2 bg-[#E30613]/5 rounded-lg px-3 py-2">
                    <Clock className="h-3.5 w-3.5 text-[#E30613]/60" />
                    <span className="text-[11px] text-white/50">
                      En camino en <span className="text-[#E30613] font-bold">{delivery.minDays}-{delivery.maxDays}</span> días hábiles
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm items-start">
                  <span className="text-muted-foreground">Envío</span>
                  <div className="text-right">
                    <span className="text-foreground font-bold text-xs">Cobro a destino</span>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">MRW · Solo Venezuela</span>
                    </div>
                  </div>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between">
                  <span className="text-foreground font-bold text-lg">Total</span>
                  <span className="text-[#E30613] font-black text-xl">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0e7a6d] text-white font-black text-base py-6 rounded-xl tracking-wider uppercase shadow-lg shadow-[#25D366]/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 btn-press"
                onClick={handleWhatsAppCheckout}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Pedir por WhatsApp
              </Button>

              <Button
                variant="outline"
                className="w-full border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-montserrat-bold rounded-xl transition-colors duration-300"
                onClick={() => setOpen(false)}
              >
                Seguir Comprando
              </Button>

              <button
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-[#E30613] transition-colors duration-300 cursor-pointer py-2"
                onClick={clearCart}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="font-montserrat-semibold tracking-wide uppercase">Limpiar Carrito</span>
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default React.memo(CartSidebar);
