'use client';

import { useCartStore, Product } from '@/lib/store';
import { Clock, ArrowRight, X } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { BlurIn } from '@/components/n10k/TextAnimations';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';

export default function RecentlyViewedSection() {
  const recentlyViewed = useCartStore((state) => state.recentlyViewed);
  const products = useCartStore((state) => state.products);
  const clearRecentlyViewed = useCartStore((state) => state.clearRecentlyViewed);
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct);
  const setDetailOpen = useCartStore((state) => state.setDetailOpen);

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current || recentlyViewed.length === 0) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current!.querySelectorAll('.rv-card');
      gsap.set(cards, { autoAlpha: 0, x: -30 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            autoAlpha: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [recentlyViewed.length]);

  // Map IDs to full product objects, preserving order
  const viewedProducts = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  if (viewedProducts.length === 0) {
    // Products might not be loaded yet — don't return null if we have IDs but no products
    if (recentlyViewed.length > 0 && products.length === 0) {
      return (
        <section className="py-6 sm:py-16 px-4 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#E30613] animate-pulse" />
              <h3 className="text-sm sm:text-lg font-montserrat-extrabold text-white/50 tracking-wider uppercase">
                Cargando...
              </h3>
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  return (
    <section ref={sectionRef} className="py-6 sm:py-16 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <BlurIn delay={0.1} duration={0.6}>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#E30613]" />
              <h3 className="text-sm sm:text-lg font-montserrat-extrabold text-white tracking-wider uppercase">
                Vistos Recientemente
              </h3>
            </div>
            <button
              onClick={clearRecentlyViewed}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 hover:text-[#E30613] transition-colors font-montserrat-bold tracking-wider uppercase cursor-pointer"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          </div>
        </BlurIn>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {viewedProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="rv-card flex-shrink-0 w-36 sm:w-44 group cursor-pointer text-left"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1A1A1A] border border-white/5 group-hover:border-[#E30613]/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#E30613]/10">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                  <span className="text-white text-[10px] font-montserrat-bold tracking-wider uppercase flex items-center gap-1">
                    Ver detalle
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-white text-[11px] sm:text-xs font-montserrat-bold truncate group-hover:text-[#E30613] transition-colors">
                  {product.name}
                </p>
                <p className="text-[#E30613] text-xs sm:text-sm font-montserrat-extrabold">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
