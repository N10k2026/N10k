'use client';

import React, { useRef, useEffect, forwardRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap-init';

/**
 * Inner span that forwards ref — avoids the react-hooks/refs lint error
 * that fires when refs are passed via React.createElement().
 */
const SplitTextSpan = forwardRef<HTMLSpanElement, { text: string }>(
  function SplitTextSpan({ text }, ref) {
    return <span ref={ref}>{text}</span>;
  }
);

/**
 * SplitCharsGSAP - Animates each character using GSAP SplitText + ScrollTrigger
 * Professional character-by-character reveal with blur and stagger
 */
export function SplitChars({
  text,
  className = '',
  tag = 'h2',
  staggerDelay = 0.04,
  threshold = 0.2,
  style,
}: {
  text: string;
  className?: string;
  tag?: keyof React.JSX.IntrinsicElements;
  staggerDelay?: number;
  threshold?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const split = SplitText.create(ref.current!, {
        type: 'chars,words',
        charsClass: 'n10k-char',
        wordsClass: 'n10k-word',
        aria: 'auto',
      });

      gsap.set(split.chars, { autoAlpha: 0, y: 40, scale: 0.9, filter: 'blur(6px)' });

      ScrollTrigger.create({
        trigger: ref.current!,
        start: `top ${100 - threshold * 100}%`,
        once: true,
        onEnter: () => {
          gsap.to(split.chars, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.6,
            stagger: staggerDelay,
            ease: 'power3.out',
          });
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [staggerDelay, threshold]);

  const Tag = tag;
  return (
    <Tag className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        <SplitTextSpan ref={ref} text={text} />
      </span>
    </Tag>
  );
}

/**
 * SplitWordsGSAP - Animates each word using GSAP SplitText + ScrollTrigger
 */
export function SplitWords({
  text,
  className = '',
  tag = 'p',
  staggerDelay = 0.06,
  threshold = 0.2,
  style,
}: {
  text: string;
  className?: string;
  tag?: keyof React.JSX.IntrinsicElements;
  staggerDelay?: number;
  threshold?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const split = SplitText.create(ref.current!, {
        type: 'words',
        aria: 'auto',
      });

      gsap.set(split.words, { autoAlpha: 0, y: '100%', filter: 'blur(4px)' });

      ScrollTrigger.create({
        trigger: ref.current!,
        start: `top ${100 - threshold * 100}%`,
        once: true,
        onEnter: () => {
          gsap.to(split.words, {
            autoAlpha: 1,
            y: '0%',
            filter: 'blur(0px)',
            duration: 0.6,
            stagger: staggerDelay,
            ease: 'power3.out',
          });
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [staggerDelay, threshold]);

  const Tag = tag;
  return (
    <Tag className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        <SplitTextSpan ref={ref} text={text} />
      </span>
    </Tag>
  );
}

/**
 * BlurInGSAP - Element fades in from blurred state with ScrollTrigger
 */
export function BlurIn({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  threshold = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.set(ref.current!, { autoAlpha: 0, scale: 0.95, filter: 'blur(10px)' });

      ScrollTrigger.create({
        trigger: ref.current!,
        start: `top ${100 - threshold * 100}%`,
        once: true,
        onEnter: () => {
          gsap.to(ref.current!, {
            autoAlpha: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration,
            delay,
            ease: 'power2.out',
          });
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [delay, duration, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * BlurFadeUpGSAP - Element fades in from below with blur and ScrollTrigger
 */
export function BlurFadeUp({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  translateY = 30,
  threshold = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  translateY?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.set(ref.current!, { autoAlpha: 0, y: translateY, filter: 'blur(8px)' });

      ScrollTrigger.create({
        trigger: ref.current!,
        start: `top ${100 - threshold * 100}%`,
        once: true,
        onEnter: () => {
          gsap.to(ref.current!, {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration,
            delay,
            ease: 'power2.out',
          });
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [delay, duration, translateY, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * MarqueeGSAP - Infinite seamless horizontal scrolling text powered by GSAP
 * Uses a continuous tween with modular position wrapping so there is
 * absolutely no visible seam when the loop resets — the text flows forever.
 *
 * `speed` = pixels per second (higher = faster). Typical range: 40–120.
 */
export function Marquee({
  texts,
  className = '',
  speed = 60,
  reverse = false,
  separator = '✦',
}: {
  texts: string[];
  className?: string;
  speed?: number;
  reverse?: boolean;
  separator?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current || !wrapperRef.current) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const track = trackRef.current;
    const wrapper = wrapperRef.current;

    const ctx = gsap.context(() => {
      requestAnimationFrame(() => {
        const firstSet = track.querySelector('.marquee-set') as HTMLElement;
        if (!firstSet) return;

        const oneSetWidth = firstSet.offsetWidth;

        // Ensure enough copies to always fill the viewport
        const viewportWidth = wrapper.offsetWidth;
        const requiredSets = Math.ceil(viewportWidth / oneSetWidth) + 2;
        const currentSets = track.querySelectorAll('.marquee-set').length;

        if (currentSets < requiredSets) {
          // Clone via DOM nodes (not innerHTML) to avoid any XSS risk if the
          // marquee content were ever to include user-provided text.
          for (let i = currentSets; i < requiredSets; i++) {
            const clone = firstSet.cloneNode(true) as HTMLElement;
            track.appendChild(clone);
          }
        }

        // Re-measure after possible DOM additions
        const finalOneSetWidth = (track.querySelector('.marquee-set') as HTMLElement).offsetWidth;

        // Duration based on pixels-per-second speed
        const duration = finalOneSetWidth / speed;

        // Seamless loop: animate by exactly one set width using modular
        // wrapping so the reset is invisible (identical content snaps back)
        if (reverse) {
          gsap.fromTo(
            track,
            { x: -finalOneSetWidth },
            {
              x: 0,
              duration,
              ease: 'none',
              repeat: -1,
              modifiers: {
                x: gsap.utils.unitize((x: number) => {
                  return parseFloat(String(x)) % finalOneSetWidth;
                }),
              },
            }
          );
        } else {
          gsap.fromTo(
            track,
            { x: 0 },
            {
              x: -finalOneSetWidth,
              duration,
              ease: 'none',
              repeat: -1,
              modifiers: {
                x: gsap.utils.unitize((x: number) => {
                  return parseFloat(String(x)) % -finalOneSetWidth;
                }),
              },
            }
          );
        }
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [speed, reverse, texts.join(''), separator]);

  // Render enough copies to fill any viewport seamlessly
  const items = [...texts, ...texts, ...texts, ...texts, ...texts, ...texts];

  return (
    <div ref={wrapperRef} className={`overflow-hidden ${className}`} aria-hidden="true">
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {items.map((text, i) => (
          <div key={i} className="flex whitespace-nowrap marquee-set">
            <span className="flex items-center shrink-0">
              <span className="font-montserrat-black text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] uppercase tracking-tight text-white/15 hover:text-white/40 transition-colors duration-500 px-4">
                {text}
              </span>
              {separator && (
                <span className="font-montserrat-black text-4xl sm:text-6xl text-white/20 mx-6">
                  {separator}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
