'use client';

import { useRef } from 'react';
import { useScrollRaf } from '@/hooks/use-scroll-raf';

export default function ScrollProgress() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useScrollRaf(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled =
      docHeight <= 0 ? 0 : Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    progressRef.current = scrolled;

    if (containerRef.current) {
      containerRef.current.style.opacity = scrolled < 0.5 ? '0' : '1';
      containerRef.current.style.pointerEvents = 'none';
    }
    if (barRef.current) {
      barRef.current.style.width = `${scrolled}%`;
    }
    if (containerRef.current) {
      containerRef.current.setAttribute('aria-valuenow', String(Math.round(scrolled)));
    }
  });

  return (
    <div
      ref={containerRef}
      data-scroll-progress
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none opacity-0 transition-opacity duration-150"
      role="progressbar"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso de desplazamiento"
    >
      <div
        ref={barRef}
        className="h-full bg-[#E30613]"
        style={{ width: '0%' }}
      />
    </div>
  );
}
