'use client';

import React from 'react';
import { Home, Grid3X3, ShoppingBag, Sparkles, Headset } from 'lucide-react';
import { useCartStore, selectTotalItems } from '@/lib/store';
import { useState, useEffect, useSyncExternalStore } from 'react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  id: string;
  isAccent?: boolean;
}

function FloatingNavBar() {
  const [activeItem, setActiveItem] = useState('home');
  // Zustand selectors — subscribe only to what we need
  const setOpen = useCartStore((state) => state.setOpen);
  // Derived selector for totalItems (PERF-9)
  const totalItems = useCartStore(selectTotalItems);

  // Hydration-safe: don't render localStorage-dependent UI until client mounts
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Track scroll position to update active nav item
  useEffect(() => {
    const sections = [
      { id: 'scroll-video-hero', navId: 'home' },
      { id: 'collection', navId: 'shop' },
      { id: 'new-arrivals', navId: 'novedades' },
      { id: 'newsletter', navId: 'contacto' },
    ];

    const handleScroll = () => {
      const scrollY = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (!el) continue;
        // Use getBoundingClientRect for accurate positioning relative to the
        // viewport, then convert to absolute document coordinates.
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollY) {
          setActiveItem(sections[i].navId);
          return;
        }
      }
      setActiveItem('home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Recalculate on resize since section positions may shift.
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const navItems: NavItem[] = [
    { label: 'Inicio', icon: <Home className="h-5 w-5" />, href: '#scroll-video-hero', id: 'home' },
    { label: 'Tienda', icon: <Grid3X3 className="h-5 w-5" />, href: '#collection', id: 'shop' },
    { label: 'Carrito', icon: <ShoppingBag className="h-5 w-5" />, href: '#', id: 'cart', isAccent: true },
    { label: 'Novedades', icon: <Sparkles className="h-5 w-5" />, href: '#new-arrivals', id: 'novedades' },
    { label: 'Contacto', icon: <Headset className="h-5 w-5" />, href: '#newsletter', id: 'contacto' },
  ];

  const handleClick = (item: NavItem) => {
    if (item.id === 'cart') {
      setOpen(true);
      return;
    }

    // "Inicio" always returns to the very top (hero).
    if (item.href === '#scroll-video-hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveItem(item.id);
      return;
    }

    // Smooth scroll to section
    const el = document.querySelector(item.href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveItem(item.id);
  };

  return (
    <div data-floating-nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto">
      <nav
        aria-label="Navegación rápida"
        className="
          glass-nav
          flex items-center justify-center gap-1 sm:gap-2
          px-3 sm:px-6 py-2.5 sm:py-3
          rounded-[28px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          sm:min-w-[480px]
        "
      >
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const isCart = item.id === 'cart';
          const navLabel = isCart
            ? mounted && totalItems > 0
              ? `Carrito, ${totalItems} artículo${totalItems === 1 ? '' : 's'}`
              : 'Carrito vacío'
            : item.label;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              aria-label={navLabel}
              aria-current={isActive && !isCart ? 'page' : undefined}
              className={`
                relative flex items-center gap-2
                px-4 sm:px-5 py-2.5 sm:py-2
                rounded-[20px]
                font-montserrat-bold text-sm tracking-wide
                transition-all duration-500 ease-out
                cursor-pointer
                whitespace-nowrap
                ${
                  isCart
                    ? 'bg-[#E30613] text-white shadow-lg shadow-[#E30613]/25 hover:bg-[#ff2d34] hover:shadow-[#E30613]/40 hover:scale-105'
                    : isActive
                      ? 'bg-foreground/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                }
              `}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>

              {/* Cart badge */}
              {isCart && mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-[#E30613] text-[10px] font-black rounded-full h-5 min-w-[20px] flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}

              {/* Active indicator dot */}
              {isActive && !isCart && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#E30613] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default React.memo(FloatingNavBar);
