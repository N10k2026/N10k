'use client';

import { useRef, useEffect, useState } from 'react';
import { Users, ShoppingBag, MapPin, Award } from 'lucide-react';
import { BlurIn } from '@/components/n10k/TextAnimations';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useScrollVisibleWithRef, useStaggerChildren } from '@/hooks/use-scroll-visible';

// NOTE: We use IntersectionObserver (not ScrollTrigger) for the counter
// trigger because the ScrollVideoHero GSAP pin changes the page height
// dynamically as video frames load asynchronously. This can leave
// ScrollTrigger's cached start positions stale, so the onEnter callback
// never fires and the counters stay stuck at 0. IntersectionObserver is
// immune to those layout shifts.

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { icon: <Users className="h-5 w-5 sm:h-7 sm:w-7" />, value: 2500, suffix: '+', label: 'Clientes Satisfechos' },
  { icon: <ShoppingBag className="h-5 w-5 sm:h-7 sm:w-7" />, value: 50, suffix: '+', label: 'Productos Únicos' },
  { icon: <MapPin className="h-5 w-5 sm:h-7 sm:w-7" />, value: 24, suffix: '', label: 'Ciudades en Venezuela' },
  { icon: <Award className="h-5 w-5 sm:h-7 sm:w-7" />, value: 98, suffix: '%', label: 'Satisfacción' },
];

function AnimatedCounter({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    // Use IntersectionObserver instead of ScrollTrigger: the hero's GSAP
    // pin shifts the page height as video frames load, which can leave
    // ScrollTrigger's start position stale and prevent onEnter from firing.
    const startAnimation = () => {
      hasAnimated.current = true;
      const end = value;
      const startTime = performance.now();
      const durationMs = duration * 1000;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(end * eased));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsFinished(true);
        }
      };
      requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            startAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <div className="relative">
      <span
        ref={ref}
        className={`count-up-number font-montserrat-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white tabular-nums inline-block whitespace-nowrap leading-none ${isFinished ? 'animate-red-pulse' : ''}`}
      >
        {count.toLocaleString('es-VE')}{suffix}
      </span>
      {/* Gradient underline below the number */}
      <div className="mt-1 sm:mt-2 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-[#E30613]/60 to-transparent opacity-70" />
    </div>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useScrollVisibleWithRef(sectionRef, 0.15);
  useStaggerChildren(sectionRef, isVisible, '.stats-card', 0.15);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const line = sectionRef.current!.querySelector('.stats-line');
      if (line) {
        gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
        ScrollTrigger.create({
          trigger: line,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(line, {
              scaleX: 1,
              duration: 1.5,
              ease: 'power3.out',
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={`py-8 sm:py-20 px-4 relative overflow-hidden animate-section-fade-left ${isVisible ? 'is-visible' : ''}`}>
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#E30613]/[0.03] via-transparent to-[#E30613]/[0.03]" />

      <div className="max-w-5xl mx-auto relative z-10">
        <BlurIn delay={0.1} duration={0.8}>
          <div className="text-center mb-6 sm:mb-10">
            <p className="text-[.65rem] font-montserrat-bold tracking-[.2em] uppercase text-[#E30613] mb-2 flex items-center justify-center gap-2.5">
              <span className="inline-block w-5 h-[1.5px] bg-[#E30613]" />
              Números que hablan
              <span className="inline-block w-5 h-[1.5px] bg-[#E30613]" />
            </p>
            <h2 className="font-montserrat-extrabold text-white leading-[.95] text-xl sm:text-3xl md:text-4xl tracking-[-0.01em]">
              LA COMUNIDAD N10K
            </h2>
          </div>
        </BlurIn>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stats-card glass-card-pro p-4 sm:p-6 text-center group hover:border-[#E30613]/20 transition-all duration-500 animate-section-counter"
            >
              <div className="mx-auto mb-2 sm:mb-3 w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-[#E30613]/10 flex items-center justify-center text-[#E30613] group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="stat-label text-gray-500 text-[9px] sm:text-xs font-montserrat-bold tracking-wider uppercase mt-1 sm:mt-2 transition-all duration-300">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Animated line */}
        <div className="stats-line h-[2px] bg-gradient-to-r from-transparent via-[#E30613]/40 to-transparent" />
      </div>
    </section>
  );
}
