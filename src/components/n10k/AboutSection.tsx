'use client';

import { useRef, useEffect } from 'react';
import { Flame, Target, Zap, Heart } from 'lucide-react';
import Image from 'next/image';
import { SplitChars, SplitWords, BlurIn } from '@/components/n10k/TextAnimations';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Story card animation
      if (storyRef.current) {
        gsap.set(storyRef.current, { autoAlpha: 0, x: -60 });
        ScrollTrigger.create({
          trigger: storyRef.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(storyRef.current, {
              autoAlpha: 1,
              x: 0,
              duration: 1,
              ease: 'power3.out',
            });
          },
        });
      }

      // Values cards staggered animation
      if (valuesRef.current) {
        const cards = valuesRef.current.querySelectorAll('.value-card');
        gsap.set(cards, { autoAlpha: 0, y: 40, scale: 0.95 });
        ScrollTrigger.create({
          trigger: valuesRef.current,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              stagger: 0.15,
              ease: 'power3.out',
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="py-5 sm:py-20 px-4 relative overflow-hidden bg-transparent">
      {/* ===== Moving Background Text (Orvian-style) ===== */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Row 1 - scrolling right */}
        <div className="absolute top-[10%] left-0 w-full">
          <div
            className="flex whitespace-nowrap"
            style={{
              animation: 'marquee-scroll 50s linear infinite',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <span
                key={`a1-${i}`}
                className="font-montserrat-black text-[10vw] sm:text-[8vw] uppercase tracking-[0.06em] text-[#E30613]/[0.04] blur-[2px] px-4 select-none"
              >
                SOMOS N10K
              </span>
            ))}
          </div>
        </div>

        {/* Row 1.5 - scrolling left, "LIVE LIMITLESS" */}
        <div className="absolute top-[30%] left-0 w-full">
          <div
            className="flex whitespace-nowrap"
            style={{
              animation: 'marquee-scroll 55s linear infinite reverse',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <span
                key={`a1b-${i}`}
                className="font-montserrat-black text-[8vw] sm:text-[6vw] uppercase tracking-[0.15em] text-[#E30613]/[0.03] blur-[2px] px-4 select-none"
              >
                LIVE LIMITLESS
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 - scrolling left */}
        <div className="absolute top-[50%] left-0 w-full">
          <div
            className="flex whitespace-nowrap"
            style={{
              animation: 'marquee-scroll 60s linear infinite reverse',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <span
                key={`a2-${i}`}
                className="font-montserrat-black text-[12vw] sm:text-[10vw] uppercase tracking-[0.04em] text-[#E30613]/[0.03] blur-[3px] px-6 select-none"
              >
                CABALLERO
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient overlay on top of moving text — lighter to let Plasma show through */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/40 to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E30613]/3 rounded-full blur-[200px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-4 sm:mb-16 text-center">
          <BlurIn delay={0.1} duration={0.8}>
            <p className="text-[.65rem] font-montserrat-bold tracking-[.2em] uppercase text-[#E30613] mb-2 flex items-center justify-center gap-2.5">
              <span className="inline-block w-5 h-[1.5px] bg-[#E30613]" />
              Nuestra Esencia
              <span className="inline-block w-5 h-[1.5px] bg-[#E30613]" />
            </p>
          </BlurIn>
          <SplitChars
            text="SOMOS N10K"
            tag="h2"
            className="font-montserrat-extrabold text-white leading-[.95] break-words"
            style={{ fontSize: 'clamp(2rem, 8vw, 5.5rem)', letterSpacing: '.04em' }}
            staggerDelay={0.06}
            threshold={0.2}
          />
          <div className="section-divider max-w-[120px] mt-3 sm:mt-4 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-12 items-center">
          {/* Left - Brand Story */}
          <div ref={storyRef}>
            <div className="glass-card-strong gradient-border p-3 sm:p-8">
              <div className="flex items-center gap-3 mb-2 sm:mb-6">
                <Image
                  src="/brand/logo-01-n10kcaballero.webp"
                  alt="N10K Caballero"
                  width={600}
                  height={215}
                  className="h-10 sm:h-20 w-auto object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 12px rgba(227,6,19,0.4))',
                  }}
                />
              </div>
              <p className="text-gradient-red font-montserrat-black text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-2 sm:mb-4">Live Limitless</p>

              <SplitWords
                text="N10K nació de la convicción de que la moda no debe tener límites. Fusionamos el streetwear urbano con la energía del deporte, creando prendas que empoweran al hombre moderno a vivir sin restricciones."
                className="text-gray-400 text-[10px] sm:text-sm md:text-base leading-relaxed mb-1 sm:mb-4 font-montserrat-medium"
                staggerDelay={0.04}
                threshold={0.1}
              />
              <SplitWords
                text="Nuestro panda representa la dualidad entre la calma y la fiereza. Cada pieza N10K es una declaración: no hay techo, no hay fronteras."
                className="text-gray-400 text-[10px] sm:text-sm md:text-base leading-relaxed mb-1 sm:mb-4 font-montserrat-medium"
                staggerDelay={0.04}
                threshold={0.1}
              />
              <SplitWords
                text="Desde hoodies oversize hasta franelas y shorts de alta calidad, diseñados con materiales premium para confort, durabilidad y estilo."
                className="text-gray-400 text-[10px] sm:text-sm md:text-base leading-relaxed mb-2 sm:mb-6 font-montserrat-medium"
                staggerDelay={0.04}
                threshold={0.1}
              />

              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/n10kstore?igsh=MXZmM284YWx1MXBjbA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E30613] font-bold text-xs sm:text-sm tracking-wider uppercase hover:underline"
                >
                  @N10KSTORE
                </a>
                <span className="text-gray-600">|</span>
                <a
                  href="https://nutrition10k.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 font-bold text-xs sm:text-sm tracking-wider uppercase hover:text-[#E30613] hover:underline"
                >
                  NUTRITION10K.COM
                </a>
              </div>
            </div>
          </div>

          {/* Right - Values */}
          <div ref={valuesRef} className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 sm:gap-4">
            <div className="value-card glass-card-pro p-2.5 sm:p-6 group">
              <div className="mb-1 sm:mb-4 group-hover:scale-110 transition-transform duration-300"><Flame className="h-4 w-4 sm:h-7 sm:w-7 text-[#E30613]" /></div>
              <h4 className="text-white font-montserrat-extrabold text-xs sm:text-lg sm:text-xl mb-0.5 sm:mb-2">Pasión</h4>
              <p className="text-gray-400 text-[9px] sm:text-xs sm:text-sm leading-snug sm:leading-relaxed font-montserrat-medium line-clamp-2 sm:line-clamp-none">Cada diseño nace del fuego creativo. Creamos declaraciones de actitud.</p>
            </div>
            <div className="value-card glass-card-pro p-2.5 sm:p-6 group">
              <div className="mb-1 sm:mb-4 group-hover:scale-110 transition-transform duration-300"><Target className="h-4 w-4 sm:h-7 sm:w-7 text-[#E30613]" /></div>
              <h4 className="text-white font-montserrat-extrabold text-xs sm:text-lg sm:text-xl mb-0.5 sm:mb-2">Enfoque</h4>
              <p className="text-gray-400 text-[9px] sm:text-xs sm:text-sm leading-snug sm:leading-relaxed font-montserrat-medium line-clamp-2 sm:line-clamp-none">Diseños con propósito. Cada prenda cuenta una historia.</p>
            </div>
            <div className="value-card glass-card-pro p-2.5 sm:p-6 group">
              <div className="mb-1 sm:mb-4 group-hover:scale-110 transition-transform duration-300"><Zap className="h-4 w-4 sm:h-7 sm:w-7 text-[#E30613]" /></div>
              <h4 className="text-white font-montserrat-extrabold text-xs sm:text-lg sm:text-xl mb-0.5 sm:mb-2">Energía</h4>
              <p className="text-gray-400 text-[9px] sm:text-xs sm:text-sm leading-snug sm:leading-relaxed font-montserrat-medium line-clamp-2 sm:line-clamp-none">Colores vibrantes, cortes atrevidos. La energía de quien no se detiene.</p>
            </div>
            <div className="value-card glass-card-pro p-2.5 sm:p-6 group">
              <div className="mb-1 sm:mb-4 group-hover:scale-110 transition-transform duration-300"><Heart className="h-4 w-4 sm:h-7 sm:w-7 text-[#E30613]" /></div>
              <h4 className="text-white font-montserrat-extrabold text-xs sm:text-lg sm:text-xl mb-0.5 sm:mb-2">Autenticidad</h4>
              <p className="text-gray-400 text-[9px] sm:text-xs sm:text-sm leading-snug sm:leading-relaxed font-montserrat-medium line-clamp-2 sm:line-clamp-none">Sin filtros, sin copias. N10K es originalidad pura.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
