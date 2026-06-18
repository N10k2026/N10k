'use client';

import { useCartStore, Product, categories } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, ShoppingBag, Heart, Minus, Plus, ChevronLeft, ChevronRight, Play, Ruler, Share2, Link2, MessageCircle, Bell, Send, Star, Home } from 'lucide-react';
import SizeGuide from '@/components/n10k/SizeGuide';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { getFirstAvailableSize, isProductSizeOutOfStock, getProductShareUrl, parseStoredNotificationEntries } from '@/lib/product-utils';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { getBreadcrumbJsonLd } from '@/lib/structured-data';
import { SITE_URL } from '@/lib/site-config';

export default function ProductDetail() {
  const isDetailOpen = useCartStore((state) => state.isDetailOpen);
  const setDetailOpen = useCartStore((state) => state.setDetailOpen);
  const selectedProduct = useCartStore((state) => state.selectedProduct);
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct);
  const preselectedColor = useCartStore((state) => state.preselectedColor);
  const setPreselectedColor = useCartStore((state) => state.setPreselectedColor);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlistItem = useCartStore((state) => state.toggleWishlistItem);
  const wishlist = useCartStore((state) => state.wishlist);
  const addRecentlyViewed = useCartStore((state) => state.addRecentlyViewed);
  // Track whether the user has manually changed size/color (overrides defaults)
  const [userSelectedSize, setUserSelectedSize] = useState<string | null>(null);
  const [userSelectedColor, setUserSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [heartAnimating, setHeartAnimating] = useState(false);
  // activeSlideIndex: -1 = video, 0+ = image index in currentImages
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const detailVideoRef = useRef<HTMLVideoElement>(null);
  const detailVideoRefMobile = useRef<HTMLVideoElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  // Stock notification state
  const [notifySize, setNotifySize] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  // Lightbox/zoom removed — was causing bugs on mobile

  // Computed defaults — first available size and first color (or preselected)
  const defaultSize = selectedProduct ? (getFirstAvailableSize(selectedProduct) ?? '') : '';
  const defaultColor = preselectedColor || selectedProduct?.colors[0]?.name || '';

  // Final selected values: user choice > default
  const selectedSize = userSelectedSize ?? defaultSize;
  const selectedColor = userSelectedColor ?? defaultColor;
  const isAddToCartDisabled =
    !selectedProduct ||
    !selectedSize ||
    !selectedColor ||
    isProductSizeOutOfStock(selectedProduct, selectedSize);

  // Whether current product has a video
  const hasVideo = !!selectedProduct?.video;
  // Video slide index = number of images (last position)
  const videoSlideIndex = useMemo(() => {
    if (!selectedProduct) return -1;
    const imgCount = selectedProduct.colorImages && selectedColor && selectedProduct.colorImages[selectedColor]
      ? selectedProduct.colorImages[selectedColor].length
      : (selectedProduct.images.length > 0 ? selectedProduct.images.length : 1);
    return imgCount; // video is at the end
  }, [selectedProduct, selectedColor]);
  // Whether we are currently showing the video slide
  const showingVideo = hasVideo && activeSlideIndex === videoSlideIndex;

  // Total slides: images + video (if exists)
  const totalSlides = useMemo(() => {
    const imgCount = selectedProduct ? (
      selectedProduct.colorImages && selectedColor && selectedProduct.colorImages[selectedColor]
        ? selectedProduct.colorImages[selectedColor].length
        : (selectedProduct.images.length > 0 ? selectedProduct.images.length : 1)
    ) : 0;
    return imgCount + (hasVideo ? 1 : 0);
  }, [selectedProduct, selectedColor, hasVideo]);

  // Reset user selections when opening a product or switching products (BUG-013)
  useEffect(() => {
    if (!isDetailOpen || !selectedProduct?.id) return;

    setUserSelectedSize(null);
    setUserSelectedColor(null);
    setQuantity(1);
    setHeartAnimating(false);
    setActiveSlideIndex(0);
    setShowDescription(false);
    setShareOpen(false);
    setLightboxOpen(false);
    setLightboxZoom(1);
    setLightboxOffset({ x: 0, y: 0 });
    setNotifySize(null);
    setNotifyEmail('');
  }, [isDetailOpen, selectedProduct?.id]);

  useEffect(() => {
    if (isDetailOpen && selectedProduct?.id) {
      addRecentlyViewed(selectedProduct.id);
    }
  }, [isDetailOpen, selectedProduct?.id, addRecentlyViewed]);

  // Auto-play video when video slide is active, pause when switching away
  useEffect(() => {
    if (showingVideo && isDetailOpen) {
      const timer = setTimeout(() => {
        const videoEl = detailVideoRef.current;
        const videoElMobile = detailVideoRefMobile.current;
        if (videoEl) videoEl.play().catch(() => {});
        if (videoElMobile) videoElMobile.play().catch(() => {});
      }, 100);
      return () => {
        clearTimeout(timer);
        const videoEl = detailVideoRef.current;
        const videoElMobile = detailVideoRefMobile.current;
        if (videoEl) { videoEl.pause(); videoEl.currentTime = 0; }
        if (videoElMobile) { videoElMobile.pause(); videoElMobile.currentTime = 0; }
      };
    } else {
      // Pause videos when not on video slide
      const videoEl = detailVideoRef.current;
      const videoElMobile = detailVideoRefMobile.current;
      if (videoEl) { videoEl.pause(); }
      if (videoElMobile) { videoElMobile.pause(); }
    }
  }, [showingVideo, isDetailOpen]);

  const handleAddToCart = useCallback(() => {
    if (!selectedProduct) return;
    if (!selectedSize || !selectedColor) {
      toast({
        title: 'Selecciona talla y color',
        description: 'Elige una talla y un color antes de agregar al carrito.',
        variant: 'destructive',
      });
      return;
    }
    if (isProductSizeOutOfStock(selectedProduct, selectedSize)) {
      toast({
        title: 'Talla agotada',
        description: `La talla ${selectedSize} no está disponible.`,
        variant: 'destructive',
      });
      return;
    }
    addItem({
      product: selectedProduct,
      quantity,
      selectedSize,
      selectedColor,
    });
    toast({
      title: 'Agregado al carrito',
      description: `${selectedProduct.name} — ${selectedColor}`,
    });
    setDetailOpen(false);
  }, [selectedProduct, selectedSize, selectedColor, quantity, addItem, setDetailOpen]);

  // Close share dropdown on click outside
  useEffect(() => {
    if (!shareOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareOpen]);

  const handleCopyLink = useCallback(async () => {
    if (!selectedProduct) return;
    const url = getProductShareUrl(selectedProduct);
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Enlace copiado', description: 'El enlace del producto se copió al portapapeles' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo copiar el enlace' });
    }
    setShareOpen(false);
  }, [selectedProduct]);

  const handleShareWhatsApp = useCallback(() => {
    if (!selectedProduct) return;
    const url = getProductShareUrl(selectedProduct);
    const text = `¡Mira este producto de N10K! ${selectedProduct.name} - $${selectedProduct.price.toFixed(2)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    setShareOpen(false);
  }, [selectedProduct]);

  const handleShareTwitter = useCallback(() => {
    if (!selectedProduct) return;
    const url = getProductShareUrl(selectedProduct);
    const text = `¡Mira esto de N10K! ${selectedProduct.name}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShareOpen(false);
  }, [selectedProduct]);

  // Related products — enhanced recommendation engine
  const products = useCartStore((state) => state.products);
  const recommendedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    // Same category first (excluding current product)
    const sameCategory = products
      .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id);
    // Best sellers from other categories (excluding current product and already in sameCategory)
    const sameCategoryIds = new Set(sameCategory.map((p) => p.id));
    const bestSellers = products
      .filter((p) => p.isBestSeller && p.id !== selectedProduct.id && !sameCategoryIds.has(p.id));
    // Fill: same category first, then best sellers, up to 6
    const combined = [...sameCategory, ...bestSellers].slice(0, 6);
    return combined;
  }, [products, selectedProduct]);

  // Out-of-stock sizes for the current product
  const outOfStockSizes = useMemo(() => {
    if (!selectedProduct) return new Set<string>();
    return new Set(selectedProduct.outOfStock || []);
  }, [selectedProduct]);

  const isSizeOutOfStock = (size: string) => outOfStockSizes.has(size);

  // Handle quick stock notification bell click
  const handleStockNotifyBell = useCallback((size: string) => {
    if (!selectedProduct) return;
    // Store in localStorage
    try {
      const stored = parseStoredNotificationEntries(localStorage.getItem('n10k-stock-notifications'));
      const entry = { productId: selectedProduct.id, size, timestamp: Date.now() };
      const exists = stored.some((n) => n.productId === entry.productId && n.size === entry.size);
      if (!exists) {
        stored.push(entry);
        localStorage.setItem('n10k-stock-notifications', JSON.stringify(stored));
      }
    } catch {
      // ignore localStorage errors
    }
    toast({ title: 'Te notificaremos cuando vuelva a estar disponible', description: `${selectedProduct.name} — Talla ${size}` });
    setNotifySize(size);
  }, [selectedProduct]);

  // Handle notify me submission
  const handleNotifySubmit = useCallback(() => {
    if (!notifyEmail || !notifySize || !selectedProduct) return;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail.trim());
    if (!emailValid) {
      toast({
        title: 'Email inválido',
        description: 'Introduce un correo electrónico válido.',
        variant: 'destructive',
      });
      return;
    }
    setNotifySubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // Store in localStorage
      try {
        const stored = parseStoredNotificationEntries(localStorage.getItem('n10k-stock-notifications'));
        const entry = { productId: selectedProduct.id, size: notifySize, email: notifyEmail.trim(), timestamp: Date.now() };
        const exists = stored.some((n) => n.productId === entry.productId && n.size === entry.size);
        if (!exists) {
          stored.push(entry);
        } else {
          const idx = stored.findIndex((n) => n.productId === entry.productId && n.size === entry.size);
          if (idx !== -1) stored[idx] = entry;
        }
        localStorage.setItem('n10k-stock-notifications', JSON.stringify(stored));
      } catch {
        // ignore localStorage errors
      }
      toast({ title: 'Te notificaremos cuando esté disponible', description: `${selectedProduct.name} — Talla ${notifySize}` });
      setNotifyEmail('');
      setNotifySize(null);
      setNotifySubmitting(false);
    }, 800);
  }, [notifyEmail, notifySize, selectedProduct]);

  // Helper: render star rating
  const renderStars = (rating?: number) => {
    if (!rating || rating <= 0) return null;
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < full ? 'text-[#E30613] fill-[#E30613]' : i === full && half ? 'text-[#E30613] fill-[#E30613]/50' : 'text-white/20'}`}
          />
        ))}
        <span className="text-[10px] text-white/40 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Long press handlers for description overlay
  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowDescription(true);
    }, 400);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setShowDescription(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowDescription(true);
    }, 400);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setShowDescription(false);
  }, []);

  // Get images for the currently selected color
  const currentImages = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.colorImages && selectedColor && selectedProduct.colorImages[selectedColor]) {
      return selectedProduct.colorImages[selectedColor];
    }
    return selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image];
  }, [selectedProduct, selectedColor]);

  // Reset slide index when color changes — go to first image
  const handleColorChange = (color: string) => {
    setUserSelectedColor(color);
    setActiveSlideIndex(0); // First image (not video)
  };

  // Navigate between slides (images + video at the end)
  const navigateSlide = (direction: 'prev' | 'next') => {
    if (totalSlides <= 1) return;
    const maxIdx = totalSlides - 1;
    if (direction === 'prev') {
      setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : maxIdx));
    } else {
      setActiveSlideIndex((prev) => (prev < maxIdx ? prev + 1 : 0));
    }
  };

  // Keyboard navigation for gallery
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedProduct || !isDetailOpen) return;
    if (totalSlides <= 1) return;
    const maxIdx = totalSlides - 1;
    if (e.key === 'ArrowLeft') {
      setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : maxIdx));
    } else if (e.key === 'ArrowRight') {
      setActiveSlideIndex((prev) => (prev < maxIdx ? prev + 1 : 0));
    }
  }, [selectedProduct, isDetailOpen, totalSlides]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // SEO-010: BreadcrumbList JSON-LD when product detail is open
  useEffect(() => {
    if (!isDetailOpen || !selectedProduct) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'n10k-product-breadcrumb-jsonld';
    script.textContent = JSON.stringify(
      getBreadcrumbJsonLd([
        { name: 'Inicio', url: SITE_URL },
        { name: selectedProduct.category, url: `${SITE_URL}/#collection` },
        { name: selectedProduct.name },
      ]),
    );
    document.head.appendChild(script);

    return () => {
      document.getElementById('n10k-product-breadcrumb-jsonld')?.remove();
    };
  }, [isDetailOpen, selectedProduct]);

  if (!selectedProduct) return null;

  const isWished = selectedProduct ? wishlist.some((w) => w.productId === selectedProduct.id && w.colorName === selectedColor) : false;

  // Current slide position for display (1-based)
  const currentSlidePosition = activeSlideIndex + 1;

  return (
    <Dialog open={isDetailOpen} onOpenChange={setDetailOpen}>
      <DialogContent className="!max-w-6xl !w-[98vw] !h-[95vh] !flex !flex-col bg-[#000000]/98 backdrop-blur-xl border-white/10 !p-0 !gap-0 overflow-hidden rounded-3xl">
        <DialogTitle className="sr-only">{selectedProduct.name}</DialogTitle>
        <DialogDescription className="sr-only">{selectedProduct.description}</DialogDescription>

        {/* ===== MOBILE LAYOUT (vertical stack) ===== */}
        <div className="flex flex-col h-full overflow-y-auto md:hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Breadcrumb - Mobile */}
          <nav className="px-5 pt-4 pb-0" aria-label="Navegación de migas">
            <ol className="flex items-center gap-1.5 text-[10px] font-montserrat-medium">
              <li>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="text-white/40 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Home className="h-3 w-3" />
                  Inicio
                </button>
              </li>
              <li className="text-[#E30613]">›</li>
              <li>
                <button
                  onClick={() => {
                    setDetailOpen(false);
                    // Set category and scroll after a brief delay
                    setTimeout(() => {
                      const cat = selectedProduct.category;
                      if (categories.includes(cat)) {
                        // We need to trigger category change in ProductGrid
                        // Dispatch custom event for ProductGrid to listen
                        window.dispatchEvent(new CustomEvent('n10k-navigate-category', { detail: cat }));
                        const el = document.getElementById('collection');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 200);
                  }}
                  className="text-white/40 hover:text-[#E30613] transition-colors cursor-pointer"
                >
                  {selectedProduct.category}
                </button>
              </li>
              <li className="text-[#E30613]">›</li>
              <li className="text-white/60 truncate max-w-[120px]">{selectedProduct.name}</li>
            </ol>
          </nav>

          {/* Title + Close + Heart */}
          <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
            <div className="flex-1 min-w-0">
              <p className="text-[#E30613] text-[10px] font-montserrat-bold tracking-[0.15em] uppercase mb-0.5">
                {selectedProduct.category}
              </p>
              <h2 className="text-xl font-montserrat-extrabold text-white tracking-[-0.01em] leading-tight truncate">
                {selectedProduct.name}
              </h2>
            </div>
            <button
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isWished
                  ? 'bg-white/5 border border-[#E30613]/40 text-[#E30613] shadow-lg shadow-[#E30613]/30'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:text-[#E30613] hover:border-[#E30613]/30'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                const wasWished = isWished;
                toggleWishlistItem(selectedProduct.id, selectedColor);
                if (!wasWished) {
                  toast({ title: 'Agregado a favoritos', description: `Se guardó en tu lista de deseos` });
                }
                setHeartAnimating(true);
                setTimeout(() => setHeartAnimating(false), 700);
              }}
              aria-label={isWished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {heartAnimating && isWished && (
                <span className="absolute inset-0 rounded-full border-2 border-[#E30613] heart-burst-ring" />
              )}
              <Heart className={`h-4 w-4 transition-all duration-300 ${isWished ? 'fill-[#E30613] text-[#E30613]' : ''} ${heartAnimating ? 'heart-animate' : ''}`} />
            </button>
            <button
              onClick={() => setDetailOpen(false)}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300 cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Share button - mobile */}
            <div className="relative" ref={shareRef}>
              <button
                className="flex-shrink-0 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#E30613] hover:border-[#E30613]/30 transition-all duration-300 cursor-pointer"
                aria-label="Compartir producto"
                aria-haspopup="menu"
                aria-expanded={shareOpen}
                onClick={() => setShareOpen(!shareOpen)}
              >
                <Share2 className="h-4 w-4" />
              </button>
              {shareOpen && (
                <div className="absolute right-0 top-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl p-2 w-48 z-50 shadow-2xl shadow-black/50">
                  <button
                    onClick={() => { handleCopyLink(); setShareOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Link2 className="h-4 w-4" />
                    Copiar enlace
                  </button>
                  <button
                    onClick={() => { handleShareWhatsApp(); setShareOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => { handleShareTwitter(); setShareOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X (Twitter)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 px-5 pb-3">
            <span className="text-2xl font-montserrat-extrabold text-white">
              ${selectedProduct.price.toFixed(2)}
            </span>
            {selectedProduct.originalPrice && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  ${selectedProduct.originalPrice.toFixed(2)}
                </span>
                <Badge className="bg-[#E30613] text-white rounded-lg font-bold text-[10px]">
                  -{Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                </Badge>
              </>
            )}
            {selectedProduct.isNew && (
              <Badge className="bg-[#E30613] text-white font-bold rounded-lg text-[9px] px-2 py-0.5">NUEVO</Badge>
            )}
          </div>

          {/* Color Selection */}
          <div className="px-5 pb-3">
            <p className="text-xs font-montserrat-bold text-white tracking-[0.06em] mb-1.5">
              Color: <span className="text-[#E30613]">{selectedColor}</span>
            </p>
            <div className="flex gap-2.5">
              {selectedProduct.colors.map((color) => (
                <button
                  key={color.name}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                    selectedColor === color.name
                      ? 'border-[#E30613] scale-110 shadow-lg shadow-[#E30613]/25'
                      : 'border-white/20 hover:border-white/50 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleColorChange(color.name)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-montserrat-bold text-white tracking-[0.06em]">
                Talla: <span className="text-[#E30613]">{selectedSize}</span>
              </p>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#E30613] transition-colors font-montserrat-bold tracking-wider uppercase cursor-pointer"
              >
                <Ruler className="h-3 w-3" />
                Guía de tallas
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedProduct.sizes.map((size) => {
                const isOOS = isSizeOutOfStock(size);
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isOOS}
                    aria-disabled={isOOS}
                    aria-label={isOOS ? `Talla ${size}, agotada` : `Talla ${size}`}
                    className={`relative min-w-[36px] h-9 px-2.5 text-xs font-bold uppercase rounded-lg transition-all duration-300 cursor-pointer ${
                      isOOS
                        ? 'bg-transparent text-white/20 border border-white/10 line-through opacity-60'
                        : isSelected
                          ? 'bg-[#E30613] text-white border-[#E30613] shadow-lg shadow-[#E30613]/20'
                          : 'bg-transparent text-gray-400 border border-white/20 hover:border-[#E30613] hover:text-white'
                    }`}
                    onClick={() => {
                      if (isOOS) return;
                      setUserSelectedSize(size);
                      setNotifySize(null);
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Subtotal */}
          <div className="px-5 pb-4">
            <p className="text-xs font-montserrat-bold text-white tracking-[0.06em] mb-1.5">
              Cantidad
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-white/20 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[#E30613] hover:bg-transparent h-9 w-9 cursor-pointer"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Reducir cantidad"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-10 text-center text-white font-bold text-sm" aria-live="polite" aria-atomic="true">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[#E30613] hover:bg-transparent h-9 w-9 cursor-pointer"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <span className="text-gray-500 text-xs">
                Subtotal: <span className="text-white font-bold">${(selectedProduct.price * quantity).toFixed(2)}</span>
              </span>
            </div>
          </div>

          {/* Images */}
          <div className="relative bg-[#0A0A0A]">
            {/* Main Image with long-press for description */}
            <div
              className="relative aspect-[4/5] overflow-hidden select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {showingVideo ? (
                <video
                  ref={detailVideoRefMobile}
                  src={selectedProduct.video}
                  muted
                  loop
                  playsInline
                  autoPlay
                  aria-label={`Video de ${selectedProduct.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  key={`main-${selectedColor}-${activeSlideIndex}`}
                  src={currentImages[activeSlideIndex] || currentImages[0]}
                  alt={`${selectedProduct.name} ${selectedColor} - imagen ${activeSlideIndex + 1}`}
                  className="w-full h-full object-contain ken-burns-image"
                />
              )}

              {/* Image count badge - top right */}
              {!showingVideo && currentImages.length > 1 && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="bg-black/50 backdrop-blur-sm text-white text-[9px] font-montserrat-bold px-2 py-0.5 rounded-full">
                    {currentSlidePosition}/{totalSlides}
                  </span>
                </div>
              )}

              {/* Description overlay — gradient from bottom to top, appears on long press */}
              <div
                className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 pointer-events-none ${
                  showDescription ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16 pb-6 px-5">
                  <p className="text-white text-xs leading-relaxed font-montserrat-medium">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              {/* Navigation arrows */}
              {totalSlides > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#E30613]/80 transition-all duration-300 cursor-pointer z-10"
                    onClick={() => navigateSlide('prev')}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#E30613]/80 transition-all duration-300 cursor-pointer z-10"
                    onClick={() => navigateSlide('next')}
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Slide counter */}
              {totalSlides > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
                  {currentSlidePosition} / {totalSlides}
                </div>
              )}
            </div>

            {/* Thumbnail strip — always visible, includes video thumbnail */}
            {totalSlides > 1 && (
              <div className="flex gap-2 px-3 py-2.5 bg-[#0A0A0A] overflow-x-auto justify-center">
                {/* Image thumbnails */}
                {currentImages.map((img, idx) => (
                  <button
                    key={`thumb-${selectedColor}-${idx}`}
                    className={`relative flex-shrink-0 w-12 h-15 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                      activeSlideIndex === idx
                        ? 'ring-2 ring-[#E30613] scale-105 shadow-lg shadow-[#E30613]/30 opacity-100'
                        : 'ring-1 ring-white/5 opacity-40 hover:opacity-80 hover:ring-white/20'
                    }`}
                    onClick={() => setActiveSlideIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {/* Video thumbnail — at the end */}
                {hasVideo && (
                  <button
                    key={`thumb-video`}
                    className={`relative flex-shrink-0 w-12 h-15 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                      activeSlideIndex === videoSlideIndex
                        ? 'ring-2 ring-[#E30613] scale-105 shadow-lg shadow-[#E30613]/30 opacity-100'
                        : 'ring-1 ring-white/5 opacity-40 hover:opacity-80 hover:ring-white/20'
                    }`}
                    onClick={() => setActiveSlideIndex(videoSlideIndex)}
                    aria-label="Ver video"
                  >
                    <img
                      src={currentImages[0]}
                      alt="Video"
                      className="w-full h-full object-cover"
                    />
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-3.5 w-3.5 text-white fill-white" />
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Subtle reflection/shadow below image area */}
            <div className="h-6 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Add to Cart — below images */}
          <div className="p-4 bg-[#0A0A0A]">
            <Button
              className="w-full bg-[#E30613] hover:bg-[#ff2d34] text-white font-montserrat-bold text-sm py-4 rounded-2xl tracking-[0.06em] shadow-lg shadow-[#E30613]/25 transition-all duration-300 hover:scale-[1.02] whitespace-nowrap cursor-pointer"
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
            >
              <ShoppingBag className="h-5 w-5 mr-2 flex-shrink-0" />
              Agregar al Carrito
            </Button>
          </div>

          {/* Customers Also Viewed - Mobile */}
          {recommendedProducts.length > 0 && (
            <div className="px-5 py-2 bg-[#0A0A0A] border-t border-white/5">
              <p className="text-[10px] font-montserrat-bold text-white/40 tracking-[0.12em] uppercase mb-2">
                Porque te puede interesar
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x snap-mandatory">
                {recommendedProducts.map((rp) => (
                  <button
                    key={rp.id}
                    className="flex-shrink-0 w-20 text-left cursor-pointer group snap-start"
                    onClick={() => {
                      setSelectedProduct(rp);
                      setPreselectedColor(null);
                    }}
                  >
                    <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-[#1A1A1A] border border-white/5 group-hover:border-[#E30613]/30 transition-all duration-300">
                      <img
                        src={rp.image}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-white text-[9px] font-montserrat-bold truncate mt-1 group-hover:text-[#E30613] transition-colors">
                      {rp.name}
                    </p>
                    <p className="text-[#E30613] text-[10px] font-montserrat-extrabold">
                      ${rp.price.toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== DESKTOP LAYOUT (side-by-side) ===== */}
        <div className="hidden md:flex md:flex-row h-full overflow-hidden">
          {/* LEFT: Product Info */}
          <div className="md:w-[45%] flex flex-col overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Breadcrumb - Desktop */}
            <nav className="mb-3" aria-label="Navegación de migas">
              <ol className="flex items-center gap-1.5 text-[11px] font-montserrat-medium">
                <li>
                  <button
                    onClick={() => setDetailOpen(false)}
                    className="text-white/40 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Home className="h-3 w-3" />
                    Inicio
                  </button>
                </li>
                <li className="text-[#E30613]">›</li>
                <li>
                  <button
                    onClick={() => {
                      setDetailOpen(false);
                      setTimeout(() => {
                        const cat = selectedProduct.category;
                        if (categories.includes(cat)) {
                          window.dispatchEvent(new CustomEvent('n10k-navigate-category', { detail: cat }));
                          const el = document.getElementById('collection');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 200);
                    }}
                    className="text-white/40 hover:text-[#E30613] transition-colors cursor-pointer"
                  >
                    {selectedProduct.category}
                  </button>
                </li>
                <li className="text-[#E30613]">›</li>
                <li className="text-white/60 truncate max-w-[200px]">{selectedProduct.name}</li>
              </ol>
            </nav>

            {/* Category */}
            <p className="text-[#E30613] text-xs font-montserrat-bold tracking-[0.15em] uppercase mb-1">
              {selectedProduct.category}
            </p>

            {/* Title + Heart + Close */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-2xl sm:text-3xl font-montserrat-extrabold text-white tracking-[-0.01em] leading-tight">
                {selectedProduct.name}
              </h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isWished
                      ? 'bg-white/5 border border-[#E30613]/40 text-[#E30613] shadow-lg shadow-[#E30613]/30'
                      : 'bg-white/5 border border-white/10 text-white/40 hover:text-[#E30613] hover:border-[#E30613]/30'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const wasWished = isWished;
                    toggleWishlistItem(selectedProduct.id, selectedColor);
                    if (!wasWished) {
                      toast({ title: 'Agregado a favoritos', description: `Se guardó en tu lista de deseos` });
                    }
                    setHeartAnimating(true);
                    setTimeout(() => setHeartAnimating(false), 700);
                  }}
                  aria-label={isWished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {heartAnimating && isWished && (
                    <span className="absolute inset-0 rounded-full border-2 border-[#E30613] heart-burst-ring" />
                  )}
                  <Heart className={`h-5 w-5 transition-all duration-300 ${isWished ? 'fill-[#E30613] text-[#E30613]' : ''} ${heartAnimating ? 'heart-animate' : ''}`} />
                </button>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all duration-300 cursor-pointer"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
                {/* Share button - desktop */}
                <div className="relative" ref={shareRef}>
                  <button
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#E30613] hover:border-[#E30613]/30 transition-all duration-300 cursor-pointer"
                    aria-label="Compartir producto"
                    aria-haspopup="menu"
                    aria-expanded={shareOpen}
                    onClick={() => setShareOpen(!shareOpen)}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  {shareOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl p-2 w-48 z-50 shadow-2xl shadow-black/50">
                      <button
                        onClick={() => { handleCopyLink(); setShareOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Link2 className="h-4 w-4" />
                        Copiar enlace
                      </button>
                      <button
                        onClick={() => { handleShareWhatsApp(); setShareOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => { handleShareTwitter(); setShareOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        X (Twitter)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-montserrat-extrabold text-white">
                ${selectedProduct.price.toFixed(2)}
              </span>
              {selectedProduct.originalPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ${selectedProduct.originalPrice.toFixed(2)}
                  </span>
                  <Badge className="bg-[#E30613] text-white rounded-xl font-bold text-xs">
                    -{Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {selectedProduct.isNew && (
                <Badge className="bg-[#E30613] text-white font-bold rounded-lg text-[10px] px-2.5 py-0.5">NUEVO</Badge>
              )}
              {selectedProduct.isBestSeller && (
                <Badge className="bg-white/90 text-black font-bold rounded-lg text-[10px] px-2.5 py-0.5">TOP VENTAS</Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm leading-relaxed mb-5 font-montserrat-medium">
              {selectedProduct.description}
            </p>

            {/* Color Selection */}
            <div className="mb-4">
              <p className="text-sm font-montserrat-bold text-white tracking-[0.06em] mb-2">
                Color: <span className="text-[#E30613]">{selectedColor}</span>
              </p>
              <div className="flex gap-3">
                {selectedProduct.colors.map((color) => (
                  <button
                    key={color.name}
                    className={`relative w-9 h-9 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                      selectedColor === color.name
                        ? 'border-[#E30613] scale-110 shadow-lg shadow-[#E30613]/25'
                        : 'border-white/20 hover:border-white/50 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorChange(color.name)}
                    title={color.name}
                  >

                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-montserrat-bold text-white tracking-[0.06em]">
                  Talla: <span className="text-[#E30613]">{selectedSize}</span>
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#E30613] transition-colors font-montserrat-bold tracking-wider uppercase cursor-pointer"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  Guía de tallas
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.sizes.map((size) => {
                  const isOOS = isSizeOutOfStock(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOOS}
                      aria-disabled={isOOS}
                      aria-label={isOOS ? `Talla ${size}, agotada` : `Talla ${size}`}
                      className={`relative min-w-[40px] h-10 px-3 text-sm font-bold uppercase rounded-xl transition-all duration-300 cursor-pointer ${
                        isOOS
                          ? 'bg-transparent text-white/20 border border-white/10 line-through opacity-60'
                          : isSelected
                            ? 'bg-[#E30613] text-white border-[#E30613] shadow-lg shadow-[#E30613]/20'
                            : 'bg-transparent text-gray-400 border border-white/20 hover:border-[#E30613] hover:text-white'
                      }`}
                      onClick={() => {
                        if (isOOS) return;
                        setUserSelectedSize(size);
                        setNotifySize(null);
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + Subtotal */}
            <div className="mb-6">
              <p className="text-sm font-montserrat-bold text-white tracking-[0.06em] mb-2">
                Cantidad
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/20 rounded-xl overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-[#E30613] hover:bg-transparent h-10 w-10 cursor-pointer"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Reducir cantidad"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-white font-bold" aria-live="polite" aria-atomic="true">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-[#E30613] hover:bg-transparent h-10 w-10 cursor-pointer"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-gray-500 text-sm">
                  Subtotal: <span className="text-white font-bold">${(selectedProduct.price * quantity).toFixed(2)}</span>
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT: Images + Add to Cart */}
          <div className="md:w-[55%] flex flex-col h-full bg-[#0A0A0A]">
            {/* Main Image / Video */}
            <div className="relative flex-1 min-h-0 overflow-hidden">
              {showingVideo ? (
                <video
                  ref={detailVideoRef}
                  src={selectedProduct.video}
                  muted
                  loop
                  playsInline
                  autoPlay
                  aria-label={`Video de ${selectedProduct.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  key={`main-${selectedColor}-${activeSlideIndex}`}
                  src={currentImages[activeSlideIndex] || currentImages[0]}
                  alt={`${selectedProduct.name} ${selectedColor} - imagen ${activeSlideIndex + 1}`}
                  className="w-full h-full object-contain ken-burns-image hidden md:block"
                />
              )}

              {/* Image count badge - top right */}
              {!showingVideo && currentImages.length > 1 && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-montserrat-bold px-2.5 py-1 rounded-full">
                    {currentSlidePosition}/{totalSlides}
                  </span>
                </div>
              )}

              {/* Navigation arrows */}
              {totalSlides > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#E30613]/80 transition-all duration-300 hover:scale-110 cursor-pointer"
                    onClick={() => navigateSlide('prev')}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#E30613]/80 transition-all duration-300 hover:scale-110 cursor-pointer"
                    onClick={() => navigateSlide('next')}
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Slide counter */}
              {totalSlides > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {currentSlidePosition} / {totalSlides}
                </div>
              )}
            </div>

            {/* Thumbnail strip — always visible, includes video thumbnail */}
            {totalSlides > 1 && (
              <div className="flex gap-2 p-3 bg-[#0A0A0A] overflow-x-auto justify-center">
                {/* Image thumbnails */}
                {currentImages.map((img, idx) => (
                  <button
                    key={`thumb-${selectedColor}-${idx}`}
                    className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                      activeSlideIndex === idx
                        ? 'ring-2 ring-[#E30613] scale-105 shadow-lg shadow-[#E30613]/30 opacity-100'
                        : 'ring-1 ring-white/5 opacity-40 hover:opacity-80 hover:ring-white/20'
                    }`}
                    onClick={() => setActiveSlideIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {/* Video thumbnail — at the end */}
                {hasVideo && (
                  <button
                    key={`thumb-video`}
                    className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                      activeSlideIndex === videoSlideIndex
                        ? 'ring-2 ring-[#E30613] scale-105 shadow-lg shadow-[#E30613]/30 opacity-100'
                        : 'ring-1 ring-white/5 opacity-40 hover:opacity-80 hover:ring-white/20'
                    }`}
                    onClick={() => setActiveSlideIndex(videoSlideIndex)}
                    aria-label="Ver video"
                  >
                    <img
                      src={currentImages[0]}
                      alt="Video"
                      className="w-full h-full object-cover"
                    />
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Subtle reflection/shadow below image area */}
            <div className="h-8 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

            {/* Add to Cart — below images */}
            <div className="p-5 bg-[#0A0A0A]">
              <Button
                className="w-full bg-[#E30613] hover:bg-[#ff2d34] text-white font-montserrat-bold text-sm sm:text-base py-4 rounded-2xl tracking-[0.06em] shadow-lg shadow-[#E30613]/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#E30613]/30 whitespace-nowrap cursor-pointer"
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
              >
                <ShoppingBag className="h-5 w-5 mr-2 flex-shrink-0" />
                Agregar al Carrito
              </Button>
            </div>
          </div>
        </div>

        {/* Customers Also Viewed - Desktop (compact, limited height so image/thumbnails/add-to-cart get more space) */}
        {recommendedProducts.length > 0 && (
          <div className="hidden md:block border-t border-white/5 bg-[#0A0A0A] px-6 md:px-8 py-2">
            <p className="text-[10px] font-montserrat-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
              Porque te puede interesar
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" style={{ maxHeight: '120px' }}>
              {recommendedProducts.map((rp) => (
                <button
                  key={rp.id}
                  className="flex-shrink-0 w-[72px] text-left cursor-pointer group"
                  onClick={() => {
                    setSelectedProduct(rp);
                    setPreselectedColor(null);
                  }}
                >
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-[#1A1A1A] border border-white/5 group-hover:border-[#E30613]/30 transition-all duration-300">
                    <img
                      src={rp.image}
                      alt={rp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-white text-[9px] font-montserrat-bold truncate mt-0.5 group-hover:text-[#E30613] transition-colors leading-tight">
                    {rp.name}
                  </p>
                  <p className="text-[#E30613] text-[10px] font-montserrat-extrabold leading-tight">
                    ${rp.price.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>

      {/* Size Guide Modal */}
      <SizeGuide isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </Dialog>
  );
}
