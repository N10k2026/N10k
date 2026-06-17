'use client';

import { useEffect, useRef } from 'react';
import { usePerformancePrefs } from '@/hooks/use-performance-prefs';

export default function InteractiveBackground() {
  const prefs = usePerformancePrefs();
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const currentPos = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefs.disableBackgroundParallax) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX / window.innerWidth;
      mousePos.current.y = e.clientY / window.innerHeight;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePos.current.x = e.touches[0].clientX / window.innerWidth;
        mousePos.current.y = e.touches[0].clientY / window.innerHeight;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [prefs.disableBackgroundParallax]);

  useEffect(() => {
    if (prefs.disableBackgroundParallax) return;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    let tabVisible = !document.hidden;

    const animate = () => {
      if (!isVisibleRef.current || !tabVisible) {
        rafRef.current = 0;
        return;
      }

      const prev = currentPos.current;
      const target = mousePos.current;

      const x = lerp(prev.x, target.x, 0.03);
      const y = lerp(prev.y, target.y, 0.03);
      currentPos.current = { x, y };

      const offsetX = (x - 0.5) * 40;
      const offsetY = (y - 0.5) * 40;
      const scale = 1.15 + (x - 0.5) * 0.05;
      const glowX = (x - 0.5) * 100;
      const glowY = (y - 0.5) * 100;

      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate(${-offsetX * 0.5}px, ${-offsetY * 0.5}px) scale(1.2)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(calc(-50% + ${glowX}%), calc(-50% + ${glowY}%))`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const container = containerRef.current;
    if (!container) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !rafRef.current && tabVisible) {
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0 },
    );
    io.observe(container);

    const onVisibilityChange = () => {
      tabVisible = !document.hidden;
      if (tabVisible && isVisibleRef.current && !rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [prefs.disableBackgroundParallax]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref={layer1Ref}
        className="absolute inset-0"
        style={{ willChange: prefs.disableBackgroundParallax ? undefined : 'transform' }}
      >
        <img
          src="/brand/bg-n10k.webp"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          style={{
            filter: 'blur(3px) brightness(0.3) saturate(1.3)',
          }}
        />
      </div>

      <div
        ref={layer2Ref}
        className="absolute inset-0"
        style={{
          willChange: prefs.disableBackgroundParallax ? undefined : 'transform',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(227,6,19,0.04) 0%, transparent 60%)',
          mixBlendMode: 'overlay',
        }}
      />

      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2"
        style={{
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(227,30,36,0.12) 0%, rgba(227,30,36,0.04) 40%, transparent 70%)',
          willChange: prefs.disableBackgroundParallax ? undefined : 'transform',
        }}
      />

      <div className="absolute inset-0 bg-[#000000]/60" />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.8) 100%)',
        }}
      />
    </div>
  );
}
