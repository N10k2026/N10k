'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect when an element enters the viewport using IntersectionObserver.
 * Accepts an external ref so you can share it with other hooks/logic.
 * Returns a boolean indicating visibility.
 *
 * Robustness notes:
 * - On mount, if the element is already (even partially) within the viewport, we
 *   set isVisible=true immediately. This fixes the "animation never plays" bug
 *   that happens when a section loads already in view (e.g. after a route push
 *   or when the section is near the top) and the IntersectionObserver callback
 *   fires inconsistently across browsers.
 * - We still attach the IntersectionObserver as a fallback for elements that
 *   start below the fold, and we keep the "trigger once" behaviour.
 */
export function useScrollVisibleWithRef<T extends HTMLElement = HTMLDivElement>(
  externalRef: React.RefObject<T | null>,
  threshold = 0.15,
  rootMargin = '0px 0px -50px 0px'
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = externalRef.current;
    if (!el) return;

    let rafId = 0;
    let observer: IntersectionObserver | null = null;

    // Fast-path: if the element is already intersecting the viewport on mount,
    // reveal it on the next frame instead of waiting for the observer (which
    // can be flaky for above-the-fold content). Using rAF avoids the React 19
    // "setState synchronously within an effect" lint error and cascading
    // renders, while still making the animation visible almost immediately.
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      rafId = requestAnimationFrame(() => setIsVisible(true));
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer?.unobserve(el); // Only trigger once
          }
        },
        { threshold, rootMargin }
      );
      observer.observe(el);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [externalRef, threshold, rootMargin]);

  return isVisible;
}

/**
 * Hook to add staggered animation delays to children elements.
 * Call this after the parent becomes visible, then set animation-delay on each child.
 * The delays are applied via a data attribute so they survive child re-renders,
 * and are cleaned up (reset to empty) when the parent is no longer visible.
 */
export function useStaggerChildren(
  parentRef: React.RefObject<HTMLElement | null>,
  isVisible: boolean,
  selector: string,
  baseDelay = 0.1
) {
  useEffect(() => {
    if (!parentRef.current) return;

    const children = parentRef.current.querySelectorAll(selector);
    children.forEach((child, i) => {
      const el = child as HTMLElement;
      if (isVisible) {
        el.style.animationDelay = `${i * baseDelay}s`;
      } else {
        // Reset so a future re-trigger starts fresh.
        el.style.animationDelay = '';
      }
    });
  }, [isVisible, parentRef, selector, baseDelay]);
}
