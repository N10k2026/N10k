'use client';

import { useCartStore, Product } from '@/lib/store';
import { ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { useRef, useMemo } from 'react';
import { BlurIn, SplitWords } from '@/components/n10k/TextAnimations';
import { Badge } from '@/components/ui/badge';
import { useScrollVisibleWithRef, useStaggerChildren } from '@/hooks/use-scroll-visible';
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

export default function FeaturedProducts() {
  const products = useCartStore((state) => state.products);
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct);
  const setPreselectedColor = useCartStore((state) => state.setPreselectedColor);
  const setDetailOpen = useCartStore((state) => state.setDetailOpen);
  const addItem = useCartStore((state) => state.addItem);

  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollVisibleWithRef(sectionRef, 0.1);
  useStaggerChildren(sectionRef, isVisible, '.fp-card', 0.1);

  // Featured products: best sellers, or fallback to first 4
  const featuredProducts = useMemo(() => {
    const bestSellers = products.filter((p) => p.isBestSeller);
    if (bestSellers.length >= 3) return bestSellers.slice(0, 4);
    // Fill with other products if not enough best sellers
    const remaining = products.filter((p) => !p.isBestSeller);
    return [...bestSellers, ...remaining].slice(0, 4);
  }, [products]);

  const handleViewDetail = (product: Product, colorName?: string) => {
    setSelectedProduct(product);
    setPreselectedColor(colorName || null);
    setDetailOpen(true);
  };

  const handleQuickAdd = (product: Product, colorName?: string) => {
    const size = getFirstAvailableSize(product);
    if (!size) {
      toast({
        title: 'Producto agotado',
        description: `${product.name} no tiene tallas disponibles.`,
        variant: 'destructive',
      });
      return;
    }
    const color = colorName || product.colors[0]?.name;
    if (!color) return;
    addItem({
      product,
      quantity: 1,
      selectedSize: size,
      selectedColor: color,
    });
    toast({
      title: 'Agregado al carrito',
      description: `${product.name} — ${color}`,
    });
  };

  // Scroll to collection section
  const handleViewAll = () => {
    const el = document.getElementById('collection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (featuredProducts.length === 0) {
    // Still render the section wrapper (hidden) so the IntersectionObserver
    // in useScrollVisibleWithRef attaches to the ref on first mount.
    // Returning null here would skip the hook's effect (which runs once on
    // mount) and the observer would never be set up when products load later.
    return <section ref={sectionRef} className="py-10 sm:py-20 px-4 bg-background" aria-hidden="true" />;
  }

  return (
    <section ref={sectionRef} className={`py-10 sm:py-20 px-4 overflow-hidden bg-background animate-section-fade-left ${isVisible ? 'is-visible' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-10">
          <div>
            <BlurIn delay={0.1} duration={0.6}>
              <p className="text-[.65rem] font-montserrat-bold tracking-[.2em] uppercase text-[#E30613] mb-2 flex items-center gap-2.5">
                <span className="inline-block w-5 h-[1.5px] bg-[#E30613]" />
                Los Más Vendidos
              </p>
            </BlurIn>
            <SplitWords
              text="Productos Destacados"
              tag="h2"
              className="gradient-underline font-montserrat-black text-foreground leading-[.95] mb-1"
              style={{ fontSize: 'clamp(1.5rem, 6vw, 3.5rem)', letterSpacing: 'clamp(0.01em, 0.03em, 0.03em)' }}
              staggerDelay={0.06}
              threshold={0.2}
            />
          </div>
          <button
            onClick={handleViewAll}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted-foreground text-xs font-montserrat-bold tracking-[0.1em] uppercase hover:border-[#E30613] hover:text-[#E30613] transition-all duration-300 cursor-pointer btn-press"
          >
            Ver Todo
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Horizontal scrollable products */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-thin -mx-4 px-4"
        >
          {featuredProducts.map((product) => {
            const primaryColor = product.colors[0]?.name || '';
            const images = getImagesForColor(product, primaryColor);

            return (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalle de ${product.name}`}
                className="fp-card animate-section-slide-up product-card-gradient-hover flex-shrink-0 w-[260px] sm:w-[300px] lg:w-[320px] group cursor-pointer rounded-2xl sm:rounded-3xl"
                onClick={() => handleViewDetail(product, primaryColor)}
                onKeyDown={(e) => handleKeyboardClick(e, () => handleViewDetail(product, primaryColor))}
              >
                {/* Image container with parallax-like hover effect */}
                <div className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border group-hover:border-[#E30613]/30 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[#E30613]/10">
                  <img
                    src={images[0]}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 640px) 260px, 320px"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Parallax-like overlay gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {product.isBestSeller && (
                      <Badge className="bg-[#E30613] text-white font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5 flex items-center gap-1 shadow-lg shadow-black/30">
                        <Star className="h-3 w-3 fill-white" />
                        TOP VENTAS
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge className="bg-white/90 backdrop-blur-sm text-black font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5">
                        NUEVO
                      </Badge>
                    )}
                    {product.originalPrice && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                  </div>

                  {/* Quick add button - appears on hover */}
                  <button
                    className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full bg-[#E30613] text-white flex items-center justify-center shadow-lg shadow-[#E30613]/30 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 cursor-pointer hover:bg-[#ff2d34] hover:scale-110 btn-press"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(product, primaryColor);
                    }}
                    aria-label="Agregar al carrito"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>

                  {/* Bottom info overlay - always visible */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-[5]">
                    <h3 className="text-white text-sm sm:text-base font-montserrat-extrabold tracking-[0.04em] leading-tight line-clamp-1 mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm sm:text-lg font-montserrat-extrabold">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-white/40 text-[10px] sm:text-xs line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Color dots */}
                    {product.colors.length > 1 && (
                      <div className="flex gap-1.5 mt-2">
                        {product.colors.map((color) => (
                          <span
                            key={color.name}
                            className="w-3 h-3 rounded-full border border-white/30"
                            style={{ backgroundColor: color.hex }}
                            role="img"
                            aria-label={`Color ${color.name}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile "Ver Todo" button */}
        <div className="mt-4 sm:hidden flex justify-center">
          <button
            onClick={handleViewAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-muted-foreground text-xs font-montserrat-bold tracking-[0.1em] uppercase hover:border-[#E30613] hover:text-[#E30613] transition-all duration-300 cursor-pointer btn-press"
          >
            Ver Todo
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
