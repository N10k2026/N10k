'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

const BANNERS = [
  '/banners/hero-1.webp',
  '/banners/hero-2.webp',
  '/banners/hero-3.webp',
  '/banners/hero-4.webp',
];

const SLIDE_INTERVAL = 5000;
const FADE_DURATION = 1200;

export default function MobileBannerHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  const advance = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // All slides are stacked with absolute positioning; we fade between them.
    const slides = container.querySelectorAll<HTMLElement>('[data-slide]');
    const prev = indexRef.current;
    const next = (prev + 1) % BANNERS.length;

    // Fade out previous
    slides[prev]?.style.setProperty('opacity', '0');
    slides[prev]?.style.setProperty('transition', `opacity ${FADE_DURATION}ms ease-in-out`);

    // Fade in next
    slides[next]?.style.setProperty('opacity', '1');
    slides[next]?.style.setProperty('transition', `opacity ${FADE_DURATION}ms ease-in-out`);
    slides[next]?.style.setProperty('z-index', '2');
    slides[prev]?.style.setProperty('z-index', '1');

    indexRef.current = next;
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(advance, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advance]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden md:hidden">
      {BANNERS.map((src, i) => (
        <div
          key={src}
          data-slide
          className="absolute inset-0"
          style={{
            opacity: i === 0 ? 1 : 0,
            zIndex: i === 0 ? 2 : 1,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          }}
        >
          <Image
            src={src}
            alt={`Banner N10K ${i + 1}`}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}
    </div>
  );
}