'use client';

import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';

const TYPEWRITER_PHRASES = ['LIVE LIMITLESS', 'SIN LÍMITES', 'CABALLERO', 'STYLE'];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect — carefully track all timers so cleanup never leaks
  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[currentPhraseIndex];
    let charIndex = 0;
    let typeInterval: ReturnType<typeof setInterval> | null = null;
    let pauseTimeout: ReturnType<typeof setTimeout> | null = null;
    let eraseInterval: ReturnType<typeof setInterval> | null = null;

    const clearAll = () => {
      if (typeInterval) clearInterval(typeInterval);
      if (pauseTimeout) clearTimeout(pauseTimeout);
      if (eraseInterval) clearInterval(eraseInterval);
      typeInterval = null;
      pauseTimeout = null;
      eraseInterval = null;
    };

    // Type forward
    typeInterval = setInterval(() => {
      if (charIndex < phrase.length) {
        setDisplayedText(phrase.slice(0, charIndex + 1));
        charIndex++;
      } else {
        if (typeInterval) { clearInterval(typeInterval); typeInterval = null; }
        // Pause, then erase and move to next phrase
        pauseTimeout = setTimeout(() => {
          setIsTyping(false);
          // Erase
          let eraseIndex = phrase.length;
          eraseInterval = setInterval(() => {
            if (eraseIndex > 0) {
              eraseIndex--;
              setDisplayedText(phrase.slice(0, eraseIndex));
            } else {
              if (eraseInterval) { clearInterval(eraseInterval); eraseInterval = null; }
              setIsTyping(true);
              setCurrentPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
            }
          }, 40);
        }, 2000);
      }
    }, 80);

    return clearAll;
  }, [currentPhraseIndex]);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      const cols = footerRef.current!.querySelectorAll('.footer-col');
      gsap.set(cols, { autoAlpha: 0, y: 20 });

      ScrollTrigger.create({
        trigger: footerRef.current,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(cols, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
      });

      const bottomBar = footerRef.current!.querySelector('.footer-bottom');
      if (bottomBar) {
        gsap.set(bottomBar, { autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: bottomBar,
          start: 'top 95%',
          once: true,
          onEnter: () => {
            gsap.to(bottomBar, {
              autoAlpha: 1,
              duration: 0.8,
              ease: 'power2.out',
            });
          },
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} id="contact" className="relative bg-[#E30613] pt-6 sm:pt-12 pb-2 sm:pb-6 px-4 sm:px-6 overflow-hidden">
      {/* Animated gradient border at top - red to transparent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] footer-gradient-top-border" />

      {/* N10K Monogram Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="text-white/[0.03] font-montserrat-black text-[200px] sm:text-[300px] md:text-[400px] tracking-tighter leading-none"
          aria-hidden="true"
        >
          N10K
        </span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Mobile: Compact layout */}
        <div className="sm:hidden mb-3">
          {/* Row 1: Logo with pulsing glow + Typewriter tagline */}
          <div className="footer-col flex flex-col items-center gap-2 mb-4">
            <div className="relative">
              {/* Pulsing red glow behind logo */}
              <div className="absolute inset-0 rounded-full blur-xl bg-white/20 animate-pulse-glow scale-150" />
              <Image
                src="/brand/logo-3-n10kcaballero.webp"
                alt="N10K Caballero"
                width={300}
                height={449}
                className="h-7 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] relative z-10"
              />
            </div>
            {/* Typewriter tagline */}
            <div className="flex items-center h-4">
              <span className="text-white/80 text-[10px] font-montserrat-extrabold tracking-[0.25em] uppercase">
                {displayedText}
              </span>
              <span className={`text-white/80 text-[10px] font-montserrat-extrabold ml-0.5 ${isTyping ? 'animate-cursor-blink' : ''}`}>|</span>
            </div>
            {/* Social icons */}
            <div className="flex gap-2 mt-1">
              <a
                href="https://www.instagram.com/n10kstore?igsh=MXZmM284YWx1MXBjbA=="
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link w-8 h-8 bg-black/15 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/30 hover:scale-110 hover:shadow-[0_0_16px_rgba(227,6,19,0.6)] transition-all duration-300 rounded-lg"
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.tiktok.com/@n10kstore"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link w-8 h-8 bg-black/15 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/30 hover:scale-110 hover:shadow-[0_0_16px_rgba(227,6,19,0.6)] transition-all duration-300 rounded-lg"
                aria-label="TikTok"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/></svg>
              </a>
            </div>
          </div>

          {/* Row 2: Contact info */}
          <div className="footer-col mb-3">
            <h4 className="text-white font-montserrat-extrabold text-[10px] tracking-[0.1em] mb-2">Contacto</h4>
            <div className="flex flex-col gap-1.5 text-[10px] text-white/60">
              <a href="mailto:info@nutrition10k.com" className="footer-link flex items-center gap-1.5 hover:text-white transition-colors duration-300">
                <Mail className="h-2.5 w-2.5 flex-shrink-0" />
                info@nutrition10k.com
              </a>
              <a href="https://wa.me/584122880228?text=Hola%20N10K%2C%20quiero%20información" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center gap-1.5 hover:text-white transition-colors duration-300">
                <Phone className="h-2.5 w-2.5 flex-shrink-0" />
                +58 412-2880228
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                Barquisimeto, Venezuela
              </span>
            </div>
          </div>
        </div>

        {/* Desktop: Enhanced centered layout */}
        <div className="hidden sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-12 mb-10">
          {/* Brand + Social */}
          <div className="footer-col">
            <div className="flex items-center gap-3 mb-2 relative">
              {/* Pulsing red glow behind logo */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl bg-white/15 animate-pulse-glow" />
              <Image
                src="/brand/logo-3-n10kcaballero.webp"
                alt="N10K Caballero"
                width={300}
                height={449}
                className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] relative z-10"
              />
            </div>
            {/* Typewriter tagline */}
            <div className="flex items-center h-5 mb-3">
              <span className="text-white/80 text-xs font-montserrat-extrabold tracking-[0.3em] uppercase">
                {displayedText}
              </span>
              <span className={`text-white/80 text-xs font-montserrat-extrabold ml-0.5 ${isTyping ? 'animate-cursor-blink' : ''}`}>|</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Ropa masculina urbana y deportiva. Streetwear con actitud.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/n10kstore?igsh=MXZmM284YWx1MXBjbA=="
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link w-10 h-10 bg-black/15 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/30 hover:scale-110 hover:shadow-[0_0_20px_rgba(227,6,19,0.7)] transition-all duration-300 rounded-lg"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@n10kstore"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link w-10 h-10 bg-black/15 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/30 hover:scale-110 hover:shadow-[0_0_20px_rgba(227,6,19,0.7)] transition-all duration-300 rounded-lg"
                aria-label="TikTok"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="text-white font-montserrat-extrabold text-sm tracking-[0.1em] mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Inicio', href: '#scroll-video-hero' },
                { label: 'Colección', href: '#collection' },
                { label: 'Novedades', href: '#new-arrivals' },
                { label: 'Nosotros', href: '#about' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      // "Inicio" always returns to the very top (hero).
                      if (link.href === '#scroll-video-hero') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        return;
                      }
                      const el = document.querySelector(link.href);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="footer-link text-white/60 text-sm hover:text-white transition-all duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="text-white font-montserrat-extrabold text-sm tracking-[0.1em] mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@nutrition10k.com"
                  className="footer-link text-white/60 text-sm hover:text-white transition-colors duration-300"
                >
                  info@nutrition10k.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
                <a href="https://wa.me/584122880228?text=Hola%20N10K%2C%20quiero%20información" target="_blank" rel="noopener noreferrer" className="footer-link text-white/60 text-sm hover:text-white transition-colors duration-300">+58 412-2880228</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm">Barquisimeto, Venezuela</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom border-t border-white/15 pt-3 sm:pt-5 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
          <p className="text-white/40 text-[10px] sm:text-xs flex items-center gap-1.5">
            <span>&copy; 2026 N10K</span>
            <span className="inline-block w-1 h-1 rounded-full bg-[#E30613]" />
            <span>Todos los derechos reservados.</span>
          </p>
          <p className="text-white/30 text-[10px] sm:text-xs tracking-wider uppercase font-montserrat-bold">
            Caballero
          </p>
        </div>
      </div>
    </footer>
  );
}
