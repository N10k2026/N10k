'use client';

import { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap-init';

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const cornersRef = useRef<HTMLDivElement[]>([]);
  const scanRef = useRef<HTMLDivElement>(null);

  const revealScreen = useCallback(() => {
    if (!containerRef.current) return;

    // Unlock scroll
    document.body.classList.remove('is-loading');

    const revealTl = gsap.timeline({
      onComplete: () => {
        // Remove loading screen from DOM
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
        }
      },
    });

    revealTl
      .to(containerRef.current, {
        autoAlpha: 0,
        scale: 1.05,
        duration: 0.7,
        ease: 'power3.inOut',
      })
      .set(containerRef.current, { pointerEvents: 'none' }, 0);
  }, []);

  // Lock body scroll while loading
  useEffect(() => {
    document.body.classList.add('is-loading');
    return () => {
      document.body.classList.remove('is-loading');
    };
  }, []);

  // Safety timeout — force-remove loading screen after 3.5 seconds
  // even if GSAP animation fails or gets stuck
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = reducedMotion ? 300 : 3500;
    const safetyTimer = setTimeout(() => {
      if (containerRef.current && containerRef.current.style.display !== 'none') {
        document.body.classList.remove('is-loading');
        gsap.to(containerRef.current, {
          autoAlpha: 0,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            if (containerRef.current) {
              containerRef.current.style.display = 'none';
            }
          },
        });
      }
    }, delay);
    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      revealScreen();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        // Start the reveal phase
        revealScreen();
      },
    });

    // Initial states - everything hidden
    gsap.set(logoRef.current, { autoAlpha: 0, scale: 0.6 });
    gsap.set(glowRef.current, { autoAlpha: 0, scale: 0.8 });
    gsap.set(cornersRef.current, { autoAlpha: 0 });
    gsap.set(progressFillRef.current, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(scanRef.current, { autoAlpha: 0 });

    // Phase 1: Glow + Logo entrance
    tl.to(glowRef.current, {
      autoAlpha: 1,
      scale: 1,
      duration: 1.2,
      ease: 'power2.out',
    })
      .to(
        logoRef.current,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
        },
        '-=0.8'
      )

      // Phase 2: Corners appear
      .to(
        cornersRef.current,
        {
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        },
        '-=0.3'
      )

      // Phase 3: Progress bar fills up
      .to(progressFillRef.current, {
        scaleX: 1,
        duration: 1.8,
        ease: 'power1.inOut',
        onUpdate: function () {
          const progress = Math.round(this.progress() * 100);
          if (percentRef.current) {
            percentRef.current.textContent = `${progress}%`;
          }
          // Move scan line
          if (scanRef.current) {
            gsap.set(scanRef.current, { top: `${progress}%`, autoAlpha: 0.04 });
          }
        },
      })

      // Small pause after complete
      .to({}, { duration: 0.3 });

    // Glow pulsing loop
    const glowTween = gsap.to(glowRef.current, {
      scale: 1.1,
      autoAlpha: 0.2,
      duration: 1.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 1,
    });

    return () => {
      glowTween.kill();
      tl.kill();
    };
  }, [revealScreen]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Cargando N10K</span>
      {/* Red glow behind logo */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(227,6,19,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Brand Logo Image */}
      <div ref={logoRef} className="relative z-10">
        <Image
          src="/brand/logo-01-n10kcaballero.webp"
          alt="N10K Caballero"
          width={600}
          height={215}
          priority
          className="w-[180px] sm:w-[220px] md:w-[280px] h-auto"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(227,6,19,0.5))',
          }}
        />
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 w-48 sm:w-64">
        {/* Progress track */}
        <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div
            ref={progressFillRef}
            className="h-full bg-gradient-to-r from-[#E30613] to-[#ff4d4f] rounded-full"
          />
        </div>
        {/* Percentage */}
        <div className="mt-3 flex justify-between items-center">
          <span className="text-white/30 text-[10px] font-montserrat-bold tracking-[0.2em]">
            LOADING
          </span>
          <span
            ref={percentRef}
            className="text-white/50 text-[10px] font-montserrat-semibold tracking-[0.1em]"
          >
            0%
          </span>
        </div>
      </div>

      {/* Decorative corner lines */}
      <div
        ref={(el) => {
          if (el) cornersRef.current[0] = el;
        }}
        className="absolute top-8 left-8 w-12 h-12 border-l border-t border-[#E30613]/20"
      />
      <div
        ref={(el) => {
          if (el) cornersRef.current[1] = el;
        }}
        className="absolute top-8 right-8 w-12 h-12 border-r border-t border-[#E30613]/20"
      />
      <div
        ref={(el) => {
          if (el) cornersRef.current[2] = el;
        }}
        className="absolute bottom-8 left-8 w-12 h-12 border-l border-b border-[#E30613]/20"
      />
      <div
        ref={(el) => {
          if (el) cornersRef.current[3] = el;
        }}
        className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-[#E30613]/20"
      />

      {/* Subtle scanning line effect */}
      <div
        ref={scanRef}
        className="absolute left-0 w-full h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #E30613, transparent)',
          top: '0%',
        }}
      />
    </div>
  );
}
