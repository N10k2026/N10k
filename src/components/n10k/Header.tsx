'use client';

import { useCartStore, selectTotalItems } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { ShoppingCart, Menu, X, Search, User, Heart } from 'lucide-react';
import { useState, useEffect, useSyncExternalStore, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useFocusTrap } from '@/hooks/use-focus-trap';

export default function Header() {
  // Zustand selectors — subscribe only to what we need
  const setOpen = useCartStore((state) => state.setOpen);
  const wishlist = useCartStore((state) => state.wishlist);
  const setWishlistOpen = useCartStore((state) => state.setWishlistOpen);
  const setSearchOpen = useCartStore((state) => state.setSearchOpen);

  const user = useAuthStore((state) => state.user);
  const setAuthModalOpen = useAuthStore((state) => state.setAuthModalOpen);
  const setAuthMode = useAuthStore((state) => state.setAuthMode);

  const [menuOpen, setMenuOpen] = useState(false);
  const mobileNavRef = useFocusTrap(menuOpen, () => setMenuOpen(false));
  const totalItems = useCartStore(selectTotalItems);
  const isSearchOpen = useCartStore((state) => state.isSearchOpen);

  // Hydration-safe: don't render localStorage-dependent UI until client mounts
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const wishlistLabel =
    mounted && wishlist.length > 0
      ? `Favoritos, ${wishlist.length} artículo${wishlist.length === 1 ? '' : 's'}`
      : 'Favoritos';
  const cartLabel =
    mounted && totalItems > 0
      ? `Carrito, ${totalItems} artículo${totalItems === 1 ? '' : 's'}`
      : 'Carrito vacío';

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      rafId = 0;
      const next = window.scrollY > 50;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }
    };
    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#scroll-video-hero' },
    { label: 'Colección', href: '#collection' },
    { label: 'Novedades', href: '#new-arrivals' },
    { label: 'Nosotros', href: '#about' },
    { label: 'Contacto', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    // "Inicio" should always bring the user back to the very top (hero).
    if (href === '#scroll-video-hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAccountClick = () => {
    setMenuOpen(false);
    if (user) {
      setAuthMode('profile');
    } else {
      setAuthMode('login');
    }
    setAuthModalOpen(true);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-[#E30613]/5 border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a
            href="#scroll-video-hero"
            className="flex items-center gap-2 group"
            onClick={(e) => { e.preventDefault(); handleNavClick('#scroll-video-hero'); }}
          >
            <Image
              src="/brand/logo-2-n10kcaballero.webp"
              alt="N10K Caballero"
              width={400}
              height={132}
              className="h-9 sm:h-11 w-auto object-contain group-hover:drop-shadow-[0_0_8px_rgba(227,6,19,0.5)] transition-all duration-300"
              sizes="120px"
            />
          </a>

          {/* Desktop Nav */}
          <nav aria-label="Menú principal" className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="text-sm font-montserrat-bold text-muted-foreground hover:text-[#E30613] transition-colors duration-300 tracking-[0.08em]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className={`text-muted-foreground hover:text-[#E30613] hover:bg-transparent transition-colors duration-300 ${isSearchOpen ? 'text-[#E30613]' : ''}`}
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Account */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-[#E30613] hover:bg-transparent transition-colors duration-300"
              onClick={handleAccountClick}
              aria-label="Cuenta"
            >
              {mounted && user ? (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E30613] to-[#ff4d4f] flex items-center justify-center">
                  <span className="text-[10px] font-black text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-[#E30613] hover:bg-transparent transition-colors duration-300"
              onClick={() => setWishlistOpen(true)}
              aria-label={wishlistLabel}
            >
              <Heart className="h-5 w-5" />
              {mounted && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E30613] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse-red">
                  {wishlist.length}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-[#E30613] hover:bg-transparent transition-colors duration-300"
              onClick={() => setOpen(true)}
              aria-label={cartLabel}
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E30613] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse-red">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-[#E30613] hover:bg-transparent transition-colors duration-300"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Slide in from right */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu panel */}
          <nav
            id="mobile-nav-panel"
            ref={mobileNavRef as React.RefObject<HTMLElement>}
            aria-label="Menú móvil"
            className="absolute right-0 top-0 h-full w-72 bg-card/95 backdrop-blur-2xl border-l border-border pointer-events-auto animate-slide-in-right"
          >
            <div className="flex flex-col px-5 py-6 gap-1">
              {/* User info at top */}
              {mounted && user && (
                <div className="flex items-center gap-3 pb-4 mb-2 border-b border-border">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E30613] to-[#ff4d4f] flex items-center justify-center">
                    <span className="text-xs font-montserrat-black text-white">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-montserrat-bold">{user.name}</p>
                    <p className="text-muted-foreground text-[10px]">{user.email}</p>
                  </div>
                </div>
              )}

              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                  className="flex items-center gap-3 text-sm font-montserrat-bold py-3 px-3 rounded-xl transition-all duration-300 tracking-[0.06em] text-muted-foreground hover:text-foreground hover:bg-accent/10"
                >
                  {link.label}
                </a>
              ))}

              {/* Divider */}
              <div className="h-px bg-border my-2" />

              {/* Account */}
              <button
                onClick={handleAccountClick}
                className="flex items-center gap-3 text-sm font-montserrat-bold text-muted-foreground hover:text-[#E30613] transition-colors duration-300 py-3 px-3 rounded-xl hover:bg-accent/10 tracking-[0.06em] cursor-pointer"
              >
                <User className="h-4 w-4" />
                {mounted ? (user ? 'Mi Cuenta' : 'Iniciar Sesión') : 'Iniciar Sesión'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
