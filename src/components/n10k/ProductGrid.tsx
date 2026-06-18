'use client';

import React from 'react';
import { Product, useCartStore, categories, FetchStatus, fetchGuard } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, ArrowRight, AlertCircle, RefreshCw, ChevronDown, Play, Star } from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { SplitWords, BlurIn } from '@/components/n10k/TextAnimations';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { toast } from '@/hooks/use-toast';
import { useLongPressVideo } from '@/hooks/use-long-press-video';
import { getFirstAvailableSize } from '@/lib/product-utils';
import { handleKeyboardClick } from '@/lib/a11y-utils';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price-asc', label: 'Precio: Menor a Mayor' },
  { value: 'price-desc', label: 'Precio: Mayor a Menor' },
  { value: 'newest', label: 'Más Recientes' },
  { value: 'name-asc', label: 'Nombre: A-Z' },
];

/** Skeleton loading card — matches the product card layout */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image skeleton-shimmer" />
      <div className="product-card-info">
        <div className="skeleton-text skeleton-shimmer mb-2" />
        <div className="flex items-center justify-between">
          <div className="skeleton-price skeleton-shimmer" />
          <div className="flex gap-1.5">
            <div className="skeleton-dot skeleton-shimmer" />
            <div className="skeleton-dot skeleton-shimmer" />
            <div className="skeleton-dot skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const products = useCartStore((state) => state.products);
  const productsStatus = useCartStore((state) => state.productsStatus);
  const productsError = useCartStore((state) => state.productsError);
  const fetchProducts = useCartStore((state) => state.fetchProducts);
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct);
  const setPreselectedColor = useCartStore((state) => state.setPreselectedColor);
  const setDetailOpen = useCartStore((state) => state.setDetailOpen);
  const addRecentlyViewed = useCartStore((state) => state.addRecentlyViewed);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlistItem = useCartStore((state) => state.toggleWishlistItem);
  const wishlist = useCartStore((state) => state.wishlist);
  const setWishlistOpen = useCartStore((state) => state.setWishlistOpen);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Listen for breadcrumb navigation events from ProductDetail
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      const cat = customEvent.detail as string;
      if (cat && categories.includes(cat)) {
        setActiveCategory(cat);
      }
    };
    window.addEventListener('n10k-navigate-category', handler);
    return () => window.removeEventListener('n10k-navigate-category', handler);
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    if (sortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sortOpen]);

  // Retry handler — resets status and refetches
  const handleRetry = useCallback(() => {
    useCartStore.setState({ productsStatus: 'idle' as FetchStatus, productsError: null });
    fetchGuard.inProgress = false; // Reset guard so fetch can run again
    fetchProducts();
  }, [fetchProducts]);

  // PERF-5: Memoize filtered products
  const filteredProducts = useMemo(
    () => products.filter((p) => {
      const catMatch = activeCategory === 'Todos' || p.category === activeCategory;
      return catMatch;
    }),
    [products, activeCategory]
  );

  // Sort filtered products based on sortBy
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // New items first; fall back to insertion order for ties.
        sorted.sort((a, b) => {
          const diff = (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
          if (diff !== 0) return diff;
          // Preserve original order (stable sort) — rely on the fact that
          // modern engines sort stably, and keep ties in source order.
          return 0;
        });
        break;
      case 'name-asc':
        // Use an explicit Spanish locale for consistent accent handling.
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
        break;
      case 'featured':
      default:
        // Default order (featured): best sellers first, then by id
        sorted.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  // When a specific category is selected, expand products by color
  // Each color variant becomes its own card
  const colorExpandedProducts = useMemo(() => {
    if (activeCategory === 'Todos') return [];
    return sortedProducts.flatMap((product) =>
      product.colors.map((color) => ({
        product,
        color,
        images: getImagesForColor(product, color.name),
        key: `${product.id}-${color.name}`,
      }))
    );
  }, [sortedProducts, activeCategory]);

  // PERF-5: Memoize new products
  const newProducts = useMemo(
    () => products.filter((p) => p.isNew),
    [products]
  );

  // PERF-6: Use Set for O(1) wishlist lookup — composite keys for color-specific wishlists
  const wishlistSet = useMemo(() => new Set(wishlist.map((w) => `${w.productId}|${w.colorName}`)), [wishlist]);

  const handleQuickAdd = useCallback((product: Product, colorName?: string) => {
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
    if (!color) {
      toast({
        title: 'Selecciona un color',
        description: 'Este producto no tiene colores disponibles.',
        variant: 'destructive',
      });
      return;
    }
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
  }, [addItem]);

  const handleViewDetail = useCallback((product: Product, colorName?: string) => {
    setSelectedProduct(product);
    setPreselectedColor(colorName || null);
    setDetailOpen(true);
    addRecentlyViewed(product.id);
  }, [setSelectedProduct, setPreselectedColor, setDetailOpen, addRecentlyViewed]);

  const handleToggleWishlist = useCallback((productId: string, colorName: string) => {
    toggleWishlistItem(productId, colorName);
    const isCurrentlyWished = wishlistSet.has(`${productId}|${colorName}`);
    if (!isCurrentlyWished) {
      toast({
        title: 'Agregado a favoritos',
        description: `Se guardó en tu lista de deseos`,
      });
    }
  }, [toggleWishlistItem, wishlistSet]);

  const activeSortLabel = sortOptions.find((o) => o.value === sortBy)?.label || 'Destacados';

  return (
    <>
      {/* Full Collection - DARK BACKGROUND */}
      <section id="collection" className="relative py-16 sm:py-24 px-4 collection-pattern-bg overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Collection Header — Desine-style: kicker + title + description */}
          <div className="mb-12 sm:mb-16">
            {/* Kicker: small red label with line before text */}
            <BlurIn delay={0.1} duration={0.8}>
              <p className="text-[.65rem] font-montserrat-bold tracking-[.2em] uppercase text-[#E30613] mb-2 flex items-center gap-2.5">
                <span className="inline-block w-5 h-[1.5px] bg-[#E30613]" />
                Ropa de Caballero
              </p>
            </BlurIn>

            {/* Large Montserrat Black title */}
            <SplitWords
              text="Colecciones"
              tag="h2"
              className="font-montserrat-black text-foreground leading-[.95] mb-3 break-words"
              style={{ fontSize: 'clamp(2rem, 10vw, 5.5rem)', letterSpacing: 'clamp(0.01em, 0.04em, 0.04em)' }}
              staggerDelay={0.08}
              threshold={0.2}
            />

            {/* Description — muted, left-aligned, max-width */}
            <BlurIn delay={0.4} duration={0.8}>
              <p className="text-sm sm:text-[.88rem] text-muted-foreground leading-[1.7] max-w-[380px] mb-8 font-montserrat-medium break-words hyphens-auto">
                Una selección de prendas masculinas que reflejan nuestra esencia — audaz, auténtica y hecha para el hombre que marca su propio estilo urbano.
              </p>
            </BlurIn>

            {/* Category Filters + Sort Controls */}
            <BlurIn delay={0.5} duration={0.8}>
              <div className="flex flex-wrap items-center gap-2.5">
                {categories.map((cat) => {
                  const count = cat === 'Todos'
                    ? products.length
                    : products.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      className={`category-pill px-4 sm:px-5 py-1.5 sm:py-2 text-[.65rem] sm:text-[.7rem] font-montserrat-semibold tracking-[.08em] uppercase transition-all duration-300 cursor-pointer border rounded-full inline-flex items-center gap-1.5 ${
                        activeCategory === cat
                          ? 'bg-[#E30613] border-[#E30613] text-white shadow-lg shadow-[#E30613]/30 active:scale-95'
                          : 'bg-[#111] border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 active:scale-95'
                      }`}
                      onClick={() => setActiveCategory(cat)}
                      aria-pressed={activeCategory === cat}
                    >
                      {cat}
                      <span className={`text-[9px] sm:text-[10px] font-montserrat-bold ${
                        activeCategory === cat
                          ? 'text-white/70'
                          : 'text-muted-foreground/50'
                      }`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}

                {/* Sort Dropdown */}
                {productsStatus === 'success' && filteredProducts.length > 0 && (
                  <div ref={sortRef} className="sort-dropdown ml-auto">
                    <button
                      type="button"
                      id="sort-dropdown-button"
                      aria-haspopup="listbox"
                      aria-expanded={sortOpen}
                      aria-controls="sort-dropdown-list"
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-[.65rem] sm:text-[.7rem] font-montserrat-semibold tracking-[.08em] uppercase transition-all duration-200 cursor-pointer border border-border text-muted-foreground hover:text-foreground hover:border-foreground/25"
                      onClick={() => setSortOpen(!sortOpen)}
                    >
                      <span className="hidden sm:inline">Ordenar:</span> {activeSortLabel}
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      id="sort-dropdown-list"
                      role="listbox"
                      aria-labelledby="sort-dropdown-button"
                      className={`sort-dropdown-menu ${sortOpen ? 'open' : ''}`}
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={sortBy === option.value}
                          className={`sort-dropdown-item ${sortBy === option.value ? 'active' : ''}`}
                          onClick={() => {
                            setSortBy(option.value);
                            setSortOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </BlurIn>

          </div>

          {/* Product Grid - 2 Column Orvian Cascade */}
          {productsStatus === 'loading' && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {productsStatus === 'error' && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="h-10 w-10 text-[#E30613]" />
              <p className="text-muted-foreground text-sm font-montserrat-medium text-center max-w-xs">{productsError || 'Error al cargar productos'}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#E30613] text-white text-xs font-montserrat-bold tracking-wider uppercase hover:bg-[#c20510] transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </button>
            </div>
          )}

          {productsStatus === 'success' && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-muted-foreground text-sm font-montserrat-medium">No hay productos en esta categoría</p>
            </div>
          )}

          {productsStatus === 'success' && activeCategory === 'Todos' && sortedProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 items-start">
              {sortedProducts.map((product, index) => {
                const colIndex = index % 2;
                const staggerOffset = colIndex * 80;

                return (
                  <MemoizedProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    staggerOffset={staggerOffset}
                    colIndex={colIndex}
                    wishlistSet={wishlistSet}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickAdd={handleQuickAdd}
                    onViewDetail={handleViewDetail}
                  />
                );
              })}
            </div>
          )}

          {productsStatus === 'success' && activeCategory !== 'Todos' && colorExpandedProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 items-start">
              {colorExpandedProducts.map((item, index) => {
                const colIndex = index % 2;
                const staggerOffset = colIndex * 80;

                return (
                  <MemoizedColorProductCard
                    key={item.key}
                    product={item.product}
                    color={item.color}
                    images={item.images}
                    index={index}
                    staggerOffset={staggerOffset}
                    colIndex={colIndex}
                    isWished={wishlistSet.has(`${item.product.id}|${item.color.name}`)}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickAdd={handleQuickAdd}
                    onViewDetail={handleViewDetail}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Highlight - RED BACKGROUND */}
      <MemoizedNewArrivalsSection
        newProducts={newProducts}
        onQuickAdd={handleQuickAdd}
        onViewDetail={handleViewDetail}
      />
    </>
  );
}

/** Get images for a given product and color name */
function getImagesForColor(product: Product, colorName: string): string[] {
  if (product.colorImages && product.colorImages[colorName]) {
    return product.colorImages[colorName];
  }
  return product.images.length > 0 ? product.images : [product.image];
}

function ProductCard({
  product,
  index,
  wishlistSet,
  onToggleWishlist,
  onQuickAdd,
  onViewDetail,
  staggerOffset = 0,
  colIndex = 0,
}: {
  product: Product;
  index: number;
  wishlistSet: Set<string>;
  onToggleWishlist: (productId: string, colorName: string) => void;
  onQuickAdd: (product: Product, colorName?: string) => void;
  onViewDetail: (product: Product, colorName?: string) => void;
  staggerOffset?: number;
  colIndex?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [parallaxStyle, setParallaxStyle] = useState({ transform: '' });
  const [isVideoHovering, setIsVideoHovering] = useState(false);
  const hasVideo = !!product.video;

  // Mobile: long-press to play the product video (mirrors desktop hover)
  const longPress = useLongPressVideo(
    videoRef,
    () => hasVideo,
    () => setIsVideoHovering(true),
    () => setIsVideoHovering(false)
  );

  // Track selected color for image switching
  const [activeColor, setActiveColor] = useState(product.colors[0]?.name || '');

  // Derived: is the active color wished?
  const isWished = wishlistSet.has(`${product.id}|${activeColor}`);

  // Get current images based on selected color
  const currentImages = useMemo(() => getImagesForColor(product, activeColor), [product, activeColor]);

  // Image carousel state — clamp index to valid range when images change
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const safeImageIndex = Math.min(activeImageIndex, Math.max(currentImages.length - 1, 0));

  // Auto-cycle images
  useEffect(() => {
    if (currentImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % currentImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentImages.length]);

  // GSAP entrance animation with stagger cascade offset
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.set(cardRef.current, { autoAlpha: 0, y: 60 + staggerOffset });
    const trigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: 'top 108%',
      once: true,
      onEnter: () => {
        gsap.to(cardRef.current, {
          autoAlpha: 1,
          y: staggerOffset,
          duration: 0.8,
          delay: colIndex * 0.1,
          ease: 'power3.out',
        });
      },
    });
    return () => {
      trigger.kill();
    };
  }, [index, staggerOffset, colIndex]);

  // Parallax effect on hover - shift image based on mouse position
  const handleParallaxMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallaxStyle({
      transform: `translate(${x * -8}px, ${y * -8}px) scale(1.05)`,
    });
  }, []);

  const handleParallaxLeave = useCallback(() => {
    setParallaxStyle({ transform: '' });
  }, []);

  // Video hover play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;
    if (isVideoHovering) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isVideoHovering, hasVideo]);

  return (
    <div
      ref={cardRef}
      className="stagger-card"
      style={{ '--stagger-offset': `${staggerOffset}px` } as React.CSSProperties}
    >
      <div
        className="group relative glass-card-strong-red gradient-border-red glass-glow overflow-hidden cursor-pointer"
        style={{ '--glow-x': '50%', '--glow-y': '50%' } as React.CSSProperties}
        role="button"
        tabIndex={0}
        aria-label={`Ver detalle de ${product.name}`}
        onClick={() => {
          if (longPress.consumedClick()) return; // long-press played video, swallow tap
          onViewDetail(product, activeColor);
        }}
        onKeyDown={(e) => handleKeyboardClick(e, () => onViewDetail(product, activeColor))}
        onMouseMove={handleParallaxMove}
        onMouseEnter={() => hasVideo && setIsVideoHovering(true)}
        onMouseLeave={() => { handleParallaxLeave(); setIsVideoHovering(false); }}
        {...longPress.handlers}
      >
        {/* Image Area with Zoom + Frosted Blur Effect */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[12px] sm:rounded-t-[24px]">
          {/* Primary image - zooms and blurs on hover, parallax on mouse move */}
          <img
            ref={imageRef}
            key={`primary-${activeColor}-${safeImageIndex}`}
            src={currentImages[safeImageIndex] || currentImages[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`product-card-image product-card-parallax w-full h-full object-cover transition-opacity duration-500 ${
              hasVideo && isVideoHovering ? 'opacity-0' : ''
            }`}
            style={parallaxStyle}
          />

          {/* Video layer - plays on hover */}
          {hasVideo && (
            <video
              ref={videoRef}
              src={product.video}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isVideoHovering ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Badges - always visible at top-left */}
          <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <Badge className="bg-[#E30613] text-white font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5 shadow-lg shadow-black/30">
                NUEVO
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-white/90 backdrop-blur-sm text-black font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5">
                TOP
              </Badge>
            )}
            {product.originalPrice && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
            {hasVideo && (
              <Badge className="bg-black/60 backdrop-blur-sm text-[#E30613] font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5 flex items-center gap-1">
                <Play className="h-2.5 w-2.5 fill-[#E30613]" />
                Video
              </Badge>
            )}
          </div>

          {/* Wishlist button - top right, always visible */}
          <button
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isWished
                ? 'bg-black/50 backdrop-blur-sm text-[#E30613] shadow-lg shadow-[#E30613]/30'
                : 'bg-black/40 backdrop-blur-sm text-white/60 hover:bg-black/60 hover:text-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id, activeColor);
              setHeartAnimating(true);
              setTimeout(() => setHeartAnimating(false), 700);
            }}
            aria-label={isWished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {/* Burst ring animation on like */}
            {heartAnimating && isWished && (
              <span className="absolute inset-0 rounded-full border-2 border-[#E30613] heart-burst-ring" />
            )}
            <Heart
              className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${isWished ? 'fill-[#E30613] text-[#E30613]' : ''} ${heartAnimating ? 'heart-animate' : ''}`}
            />
          </button>

          {/* ===== FROSTED GLASS OVERLAY - appears on hover ===== */}
          <div className="frost-overlay" />

          {/* Image Carousel Dots + Progress Bar */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-[6] flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                {currentImages.map((_, imgIdx) => (
                  <button
                    key={imgIdx}
                    className={`carousel-dot w-2 h-2 rounded-full transition-all duration-300 ${
                      imgIdx === safeImageIndex
                        ? 'bg-[#E30613] scale-125 shadow-sm shadow-[#E30613]/50'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(imgIdx);
                    }}
                    aria-label={`Imagen ${imgIdx + 1}`}
                  />
                ))}
              </div>
              {/* Progress bar */}
              <div className="w-12 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E30613] rounded-full transition-all duration-300"
                  style={{ width: `${((safeImageIndex + 1) / currentImages.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Frosted content that slides in on hover */}
          <div className="frost-content">
            {/* Category */}
            <div className="frost-content-item">
              <p className="text-white/60 text-xs font-montserrat-semibold tracking-[0.25em] uppercase mb-2">
                {product.category}
              </p>
            </div>

            {/* Product name */}
            <div className="frost-content-item">
              <h3 className="text-white text-xl sm:text-2xl font-montserrat-extrabold tracking-[0.06em] text-center leading-tight mb-2">
                {product.name}
              </h3>
            </div>

            {/* Divider */}
            <div className="frost-content-item">
              <div className="frost-divider mx-auto mb-3" />
            </div>

            {/* Price */}
            <div className="frost-content-item">
              <div className="flex items-center gap-2 justify-center mb-4">
                <span className="text-2xl font-montserrat-black text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-white/50 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Color dots */}
            {product.colors.length > 1 && (
              <div className="frost-content-item">
                <div className="flex gap-2.5 justify-center mb-5">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-200 hover:scale-125 cursor-pointer ${
                        activeColor === color.name
                          ? 'border-white scale-110 shadow-sm shadow-white/40'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      aria-label={`Color ${color.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveColor(color.name);
                        setActiveImageIndex(0);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="frost-content-item flex items-center gap-3">
              <button
                className="frost-pill-red flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd(product, activeColor);
                }}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Ver
              </button>

              <button
                className="frost-icon-btn-red"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(product, activeColor);
                }}
                aria-label="Ver detalle del producto"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Below-Image Info Section — always visible */}
        <div className="product-card-info">
          <p className="text-foreground text-[11px] sm:text-xs font-montserrat-bold tracking-[0.04em] truncate mb-0.5">
            {product.name}
          </p>
          {/* Star Rating */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-0.5 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-[10px] w-[10px] ${i < Math.round(product.rating!) ? 'text-[#E30613] fill-[#E30613]' : 'text-white/20'}`}
                />
              ))}
              <span className="text-[9px] text-muted-foreground ml-0.5 font-montserrat-semibold">{product.rating.toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-foreground text-[11px] sm:text-xs font-montserrat-black">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-muted-foreground text-[9px] sm:text-[10px] line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.colors.length > 1 && (
              <div className="flex gap-1">
                {product.colors.slice(0, 4).map((color) => (
                  <span
                    key={color.name}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border transition-all duration-200 ${
                      activeColor === color.name
                        ? 'border-foreground/60 scale-110'
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-muted-foreground text-[8px] sm:text-[9px] self-center ml-0.5">
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// PERF-8: React.memo on ProductCard
const MemoizedProductCard = React.memo(ProductCard);

/** Color-specific product card — shown when a category filter is active.
 *  Each card represents one product in one specific color. */
function ColorProductCard({
  product,
  color,
  images,
  index,
  isWished,
  onToggleWishlist,
  onQuickAdd,
  onViewDetail,
  staggerOffset = 0,
  colIndex = 0,
}: {
  product: Product;
  color: { name: string; hex: string };
  images: string[];
  index: number;
  isWished: boolean;
  onToggleWishlist: (productId: string, colorName: string) => void;
  onQuickAdd: (product: Product, colorName?: string) => void;
  onViewDetail: (product: Product, colorName?: string) => void;
  staggerOffset?: number;
  colIndex?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [parallaxStyle, setParallaxStyle] = useState({ transform: '' });
  const [isVideoHovering, setIsVideoHovering] = useState(false);
  const hasVideo = !!product.video;

  // Mobile: long-press to play the product video (mirrors desktop hover)
  const longPress = useLongPressVideo(
    videoRef,
    () => hasVideo,
    () => setIsVideoHovering(true),
    () => setIsVideoHovering(false)
  );

  // Image carousel state — clamp index to valid range when images change
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const safeImageIndexColor = Math.min(activeImageIndex, Math.max(images.length - 1, 0));

  // Auto-cycle images
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.set(cardRef.current, { autoAlpha: 0, y: 60 + staggerOffset });
    const trigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: 'top 108%',
      once: true,
      onEnter: () => {
        gsap.to(cardRef.current, {
          autoAlpha: 1,
          y: staggerOffset,
          duration: 0.8,
          delay: colIndex * 0.1,
          ease: 'power3.out',
        });
      },
    });
    return () => {
      trigger.kill();
    };
  }, [index, staggerOffset, colIndex]);

  // Parallax effect on hover
  const handleParallaxMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallaxStyle({
      transform: `translate(${x * -8}px, ${y * -8}px) scale(1.05)`,
    });
  }, []);

  const handleParallaxLeave = useCallback(() => {
    setParallaxStyle({ transform: '' });
  }, []);

  // Video hover play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;
    if (isVideoHovering) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isVideoHovering, hasVideo]);

  return (
    <div
      ref={cardRef}
      className="stagger-card"
      style={{ '--stagger-offset': `${staggerOffset}px` } as React.CSSProperties}
    >
      <div
        className="group relative glass-card-strong-red gradient-border-red glass-glow overflow-hidden cursor-pointer"
        style={{ '--glow-x': '50%', '--glow-y': '50%' } as React.CSSProperties}
        onClick={() => {
          if (longPress.consumedClick()) return; // long-press played video, swallow tap
          onViewDetail(product, color.name);
        }}
        onMouseMove={handleParallaxMove}
        onMouseEnter={() => hasVideo && setIsVideoHovering(true)}
        onMouseLeave={() => { handleParallaxLeave(); setIsVideoHovering(false); }}
        {...longPress.handlers}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[12px] sm:rounded-t-[24px]">
          <img
            ref={imageRef}
            key={`primary-${color.name}-${safeImageIndexColor}`}
            src={images[safeImageIndexColor] || images[0]}
            alt={`${product.name} — ${color.name}`}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`product-card-image product-card-parallax w-full h-full object-cover transition-opacity duration-500 ${
              hasVideo && isVideoHovering ? 'opacity-0' : ''
            }`}
            style={parallaxStyle}
          />

          {/* Video layer - plays on hover */}
          {hasVideo && (
            <video
              ref={videoRef}
              src={product.video}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isVideoHovering ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <Badge className="bg-[#E30613] text-white font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5 shadow-lg shadow-black/30">
                NUEVO
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-white/90 backdrop-blur-sm text-black font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5">
                TOP
              </Badge>
            )}
            {product.originalPrice && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
            {hasVideo && (
              <Badge className="bg-black/60 backdrop-blur-sm text-[#E30613] font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5 flex items-center gap-1">
                <Play className="h-2.5 w-2.5 fill-[#E30613]" />
                Video
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isWished
                ? 'bg-black/50 backdrop-blur-sm text-[#E30613] shadow-lg shadow-[#E30613]/30'
                : 'bg-black/40 backdrop-blur-sm text-white/60 hover:bg-black/60 hover:text-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id, color.name);
              setHeartAnimating(true);
              setTimeout(() => setHeartAnimating(false), 700);
            }}
            aria-label={isWished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {heartAnimating && isWished && (
              <span className="absolute inset-0 rounded-full border-2 border-[#E30613] heart-burst-ring" />
            )}
            <Heart
              className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${isWished ? 'fill-[#E30613] text-[#E30613]' : ''} ${heartAnimating ? 'heart-animate' : ''}`}
            />
          </button>

          {/* Frosted overlay */}
          <div className="frost-overlay" />

          {/* Image Carousel Dots + Progress Bar */}
          {images.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-[6] flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                {images.map((_, imgIdx) => (
                  <button
                    key={imgIdx}
                    className={`carousel-dot w-2 h-2 rounded-full transition-all duration-300 ${
                      imgIdx === safeImageIndexColor
                        ? 'bg-[#E30613] scale-125 shadow-sm shadow-[#E30613]/50'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(imgIdx);
                    }}
                    aria-label={`Imagen ${imgIdx + 1}`}
                  />
                ))}
              </div>
              {/* Progress bar */}
              <div className="w-12 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E30613] rounded-full transition-all duration-300"
                  style={{ width: `${((safeImageIndexColor + 1) / images.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Frosted content */}
          <div className="frost-content">
            {/* Category */}
            <div className="frost-content-item">
              <p className="text-white/60 text-xs font-montserrat-semibold tracking-[0.25em] uppercase mb-2">
                {product.category}
              </p>
            </div>

            {/* Product name + color */}
            <div className="frost-content-item">
              <h3 className="text-white text-xl sm:text-2xl font-montserrat-extrabold tracking-[0.06em] text-center leading-tight mb-1">
                {product.name}
              </h3>
              <span className="text-white/60 text-sm font-montserrat-medium capitalize">{color.name}</span>
            </div>

            {/* Divider */}
            <div className="frost-content-item">
              <div className="frost-divider mx-auto mb-3" />
            </div>

            {/* Price */}
            <div className="frost-content-item">
              <div className="flex items-center gap-2 justify-center mb-4">
                <span className="text-2xl font-montserrat-black text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-white/50 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Color swatch */}
            <div className="frost-content-item">
              <div className="flex items-center gap-1.5 justify-center mb-4">
                <span
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-white/50 text-xs font-montserrat-medium capitalize">{color.name}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="frost-content-item flex items-center gap-3">
              <button
                className="frost-pill-red flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd(product, color.name);
                }}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Ver
              </button>

              <button
                className="frost-icon-btn-red"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(product, color.name);
                }}
                aria-label="Ver detalle del producto"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Below-Image Info Section — always visible */}
        <div className="product-card-info">
          <p className="text-foreground text-[11px] sm:text-xs font-montserrat-bold tracking-[0.04em] truncate mb-0.5">
            {product.name}
          </p>
          {/* Star Rating */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-0.5 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-[10px] w-[10px] ${i < Math.round(product.rating!) ? 'text-[#E30613] fill-[#E30613]' : 'text-white/20'}`}
                />
              ))}
              <span className="text-[9px] text-muted-foreground ml-0.5 font-montserrat-semibold">{product.rating.toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-foreground text-[11px] sm:text-xs font-montserrat-black">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-muted-foreground text-[9px] sm:text-[10px] line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-muted-foreground text-[9px] sm:text-[10px] capitalize">{color.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MemoizedColorProductCard = React.memo(ColorProductCard);

function NewArrivalsSection({
  newProducts,
  onQuickAdd,
  onViewDetail,
}: {
  newProducts: Product[];
  onQuickAdd: (product: Product, colorName?: string) => void;
  onViewDetail: (product: Product, colorName?: string) => void;
}) {
  return (
    <section id="new-arrivals" className="py-10 sm:py-20 px-4 novedades-bg overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-12">
          <BlurIn delay={0.1} duration={0.8}>
            <p className="text-white/70 text-sm font-montserrat-bold tracking-[0.15em] mb-2">
              Lo Nuevo
            </p>
          </BlurIn>
          <SplitWords
            text="NOVEDADES"
            tag="h2"
            className="text-3xl sm:text-5xl md:text-6xl font-montserrat-black text-white tracking-[-0.02em] break-words"
            staggerDelay={0.06}
            threshold={0.2}
          />
          <BlurIn delay={0.3} duration={0.8}>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mt-4" />
          </BlurIn>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {newProducts.map((product, index) => {
            return (
              <MemoizedNewArrivalCard
                key={product.id}
                product={product}
                index={index}
                onQuickAdd={onQuickAdd}
                onViewDetail={onViewDetail}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewArrivalCard({
  product,
  index,
  onQuickAdd,
  onViewDetail,
}: {
  product: Product;
  index: number;
  onQuickAdd: (product: Product, colorName?: string) => void;
  onViewDetail: (product: Product, colorName?: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // GSAP entrance animation
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.set(cardRef.current, { autoAlpha: 0, x: -50 });
    const trigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(cardRef.current, {
          autoAlpha: 1,
          x: 0,
          duration: 0.8,
          delay: index * 0.12,
          ease: 'power3.out',
        });
      },
    });
    return () => {
      trigger.kill();
    };
  }, [index]);

  // Play/pause video on hover
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isHovering) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovering]);

  // Track selected color for image switching
  const [activeColor, setActiveColor] = useState(product.colors[0]?.name || '');
  const currentImages = useMemo(() => getImagesForColor(product, activeColor), [product, activeColor]);

  const hasVideo = !!product.video;

  return (
    <div
      ref={cardRef}
    >
      <div
        className="orvian-card group relative overflow-hidden cursor-pointer rounded-md sm:rounded-xl"
        role="button"
        tabIndex={0}
        aria-label={`Ver detalle de ${product.name}`}
        onClick={() => onViewDetail(product, activeColor)}
        onKeyDown={(e) => handleKeyboardClick(e, () => onViewDetail(product, activeColor))}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Image fills the ENTIRE card - 4:5 aspect ratio */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-md sm:rounded-xl">
          {/* Static image - fades out when video plays on hover */}
          <img
            key={`primary-${activeColor}`}
            src={currentImages[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              hasVideo ? 'sm:group-hover:opacity-0 sm:group-hover:scale-105' : 'sm:group-hover:scale-105'
            }`}
          />

          {/* Video layer - plays on hover (desktop only) */}
          {hasVideo && (
            <video
              ref={videoRef}
              src={product.video}
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover opacity-0 sm:group-hover:opacity-100 transition-opacity duration-700 ease-out"
            />
          )}

          {/* NEW Badge - always visible */}
          <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <Badge className="bg-[#E30613] text-white font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5 shadow-lg shadow-black/30">
                NUEVO
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-white/90 backdrop-blur-sm text-black font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5">
                TOP
              </Badge>
            )}
            {product.originalPrice && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-md text-[9px] sm:text-[10px] px-2 py-0.5">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
          </div>

          {/* Image count */}
          {currentImages.length > 1 && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
              <Badge className="bg-black/50 backdrop-blur-sm text-white font-bold rounded-lg sm:rounded-xl text-[9px] sm:text-xs px-1.5 sm:px-3 py-0.5 sm:py-1">
                {currentImages.length} fotos
              </Badge>
            </div>
          )}

          {/* ===== BOTTOM OVERLAY - hover (desktop) / always visible (mobile) ===== */}
          <div className="orvian-card-overlay" />

          {/* Info content at bottom of card */}
          <div className="orvian-card-info">
            {/* Row 1: Product name */}
            <div className="orvian-info-item">
              <h3 className="text-white text-xs sm:text-sm md:text-base font-montserrat-extrabold tracking-[0.04em] leading-tight line-clamp-1 mb-1">
                {product.name}
              </h3>
            </div>

            {/* Row 2: Price + Ver button */}
            <div className="orvian-info-item">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex flex-col min-w-0">
                  <span className="text-white text-xs sm:text-sm font-montserrat-bold leading-tight">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-white/40 text-[8px] sm:text-[10px] line-through leading-tight">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 sm:px-3 sm:py-1.5 rounded-full bg-[#E30613] text-white text-[11px] sm:text-[10px] font-montserrat-bold tracking-[0.06em] uppercase transition-colors duration-200 active:bg-[#c20510] sm:hover:bg-[#c20510] cursor-pointer border-none shadow-sm shadow-[#E30613]/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(product, activeColor);
                    }}
                  >
                    <ShoppingBag className="h-3 w-3 sm:h-3 sm:w-3" />
                    <span>Ver</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: Color dots + Category tag (hidden on mobile to save space) */}
            <div className="orvian-info-item hidden sm:block">
              <div className="flex items-center justify-between gap-2 mt-1.5">
                {product.colors.length > 1 && (
                  <div className="flex gap-1">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-all duration-200 hover:scale-125 cursor-pointer ${
                          activeColor === color.name
                            ? 'border-white scale-110'
                            : 'border-white/20 hover:border-white/50'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-label={`Color ${color.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveColor(color.name);
                        }}
                      />
                    ))}
                  </div>
                )}

                <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white/80 text-[9px] sm:text-[10px] font-montserrat-bold tracking-[0.1em] uppercase">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// PERF-8: React.memo on NewArrivalCard
const MemoizedNewArrivalCard = React.memo(NewArrivalCard);

// PERF-8: React.memo on NewArrivalsSection
const MemoizedNewArrivalsSection = React.memo(NewArrivalsSection);
