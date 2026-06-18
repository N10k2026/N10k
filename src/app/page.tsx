'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';
import dynamic from 'next/dynamic';
import Header from '@/components/n10k/Header';
import FeaturedProducts from '@/components/n10k/FeaturedProducts';
import ProductGrid from '@/components/n10k/ProductGrid';
import InteractiveBackground from '@/components/n10k/InteractiveBackground';
import FloatingNavBar from '@/components/n10k/FloatingNavBar';
import BackToTop from '@/components/n10k/BackToTop';
import ScrollProgress from '@/components/n10k/ScrollProgress';
import CookieConsent from '@/components/n10k/CookieConsent';
import WhatsAppButton from '@/components/n10k/WhatsAppButton';
import WishlistSection from '@/components/n10k/WishlistSection';
import DeferredSection from '@/components/n10k/DeferredSection';
import { Marquee } from '@/components/n10k/TextAnimations';
import ScrollVideoHero from '@/components/n10k/ScrollVideoHero';
import { usePerformancePrefs } from '@/hooks/use-performance-prefs';

const Plasma = dynamic(() => import('@/components/n10k/Plasma'), {
  ssr: false,
  loading: () => null,
});

const AboutSection = dynamic(() => import('@/components/n10k/AboutSection'), {
  loading: () => null,
});
const TestimonialsSection = dynamic(() => import('@/components/n10k/TestimonialsSection'), {
  loading: () => null,
});
const StatsSection = dynamic(() => import('@/components/n10k/StatsSection'), {
  loading: () => null,
});
const RecentlyViewedSection = dynamic(() => import('@/components/n10k/RecentlyViewedSection'), {
  loading: () => null,
});
const NewsletterSection = dynamic(() => import('@/components/n10k/NewsletterSection'), {
  loading: () => null,
});
const Footer = dynamic(() => import('@/components/n10k/Footer'), {
  loading: () => null,
});

const CartSidebar = dynamic(() => import('@/components/n10k/CartSidebar'), {
  ssr: false,
  loading: () => null,
});
const WishlistSidebar = dynamic(() => import('@/components/n10k/WishlistSidebar'), {
  ssr: false,
  loading: () => null,
});
const SearchModal = dynamic(() => import('@/components/n10k/SearchModal'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const prefs = usePerformancePrefs();
  const isCartOpen = useCartStore((state) => state.isOpen);
  const isWishlistOpen = useCartStore((state) => state.isWishlistOpen);
  const isSearchOpen = useCartStore((state) => state.isSearchOpen);

  const [cartMounted, setCartMounted] = useState(false);
  const [wishlistMounted, setWishlistMounted] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);

  useEffect(() => {
    if (isCartOpen) setCartMounted(true);
  }, [isCartOpen]);
  useEffect(() => {
    if (isWishlistOpen) setWishlistMounted(true);
  }, [isWishlistOpen]);
  useEffect(() => {
    if (isSearchOpen) setSearchMounted(true);
  }, [isSearchOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>

      <ScrollProgress />
      <InteractiveBackground />

      <div className="relative z-10 flex flex-col min-h-screen pb-20">
        <Header />
        <WishlistSection />
        <main id="main-content" className="flex-1">
          <h1 className="sr-only">N10K — Ropa de caballero urbana y deportiva</h1>
          <ScrollVideoHero />

          <section className="py-1.5 sm:py-7 bg-[#E30613] relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.15) 20px, rgba(0,0,0,0.15) 21px)`,
              }}
            />
            <Marquee
              texts={['N10K', 'CABALLERO', 'LIMITLESS']}
              speed={80}
              separator="✦"
            />
          </section>

          <FeaturedProducts />
          <ProductGrid />

          <DeferredSection minHeight="280px">
            <RecentlyViewedSection />
          </DeferredSection>

          <section className="py-1.5 sm:py-7 bg-background border-y border-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E30613]/5 via-transparent to-[#E30613]/5 pointer-events-none" />
            <Marquee
              texts={['N10K', 'ROPA MASCULINA', 'STYLE']}
              speed={70}
              reverse
              separator="◆"
            />
          </section>

          <DeferredSection minHeight="200px">
            <StatsSection />
          </DeferredSection>

          <DeferredSection minHeight="320px">
            <TestimonialsSection />
          </DeferredSection>

          <div className="relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              {!prefs.disablePlasma && (
                <Plasma
                  color="#E30613"
                  speed={0.5}
                  direction="forward"
                  scale={1.6}
                  opacity={0.55}
                  mouseInteractive={!prefs.isMobile}
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/30 to-background/60 pointer-events-none z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#E30613]/8 via-transparent to-[#E30613]/8 pointer-events-none z-[1]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#E30613]/6 rounded-full blur-[200px] pointer-events-none z-[1]" />

            <DeferredSection minHeight="480px" className="relative z-[2]">
              <AboutSection />
              <NewsletterSection />
            </DeferredSection>
          </div>
        </main>

        <DeferredSection minHeight="240px">
          <Footer />
        </DeferredSection>
      </div>

      <FloatingNavBar />
      <BackToTop />
      <CookieConsent />
      <WhatsAppButton />

      {cartMounted && <CartSidebar />}
      {wishlistMounted && <WishlistSidebar />}
      {searchMounted && <SearchModal />}
    </div>
  );
}
