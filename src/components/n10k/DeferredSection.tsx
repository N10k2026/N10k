'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DeferredSectionProps {
  children: ReactNode;
  /** IntersectionObserver rootMargin — load before entering viewport */
  rootMargin?: string;
  /** Placeholder min-height to limit CLS while deferred */
  minHeight?: string;
  className?: string;
}

/**
 * Mount children only when near the viewport (PERF-012).
 * Pairs with next/dynamic for below-the-fold code splitting.
 */
export default function DeferredSection({
  children,
  rootMargin = '300px 0px',
  minHeight,
  className,
}: DeferredSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, visible]);

  return (
    <div
      ref={ref}
      className={className}
      style={!visible && minHeight ? { minHeight } : undefined}
      aria-hidden={!visible ? true : undefined}
    >
      {visible ? children : null}
    </div>
  );
}
