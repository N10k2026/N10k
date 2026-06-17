'use client';

import { useRef, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { BlurIn, BlurFadeUp } from '@/components/n10k/TextAnimations';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useScrollVisibleWithRef, useStaggerChildren } from '@/hooks/use-scroll-visible';

const testimonials = [
  {
    name: 'Carlos M.',
    location: 'Barquisimeto',
    text: 'La calidad del Hoodie BOLD es increíble. Lo uso todos los días y sigue como nuevo. N10K no falla.',
    rating: 5,
    product: 'Hoodie BOLD',
  },
  {
    name: 'Miguel R.',
    location: 'Valencia',
    text: 'Los Shorts BREEZE son lo más cómodo que he usado. Perfectos para el gym y para salir. 100% recomendados.',
    rating: 5,
    product: 'Shorts BREEZE',
  },
  {
    name: 'Andrés P.',
    location: 'Maracaibo',
    text: 'El Sweater PEARL es una obra de arte. Se nota la calidad premium. Llegó súper rápido por MRW.',
    rating: 5,
    product: 'Sweater PEARL',
  },
  {
    name: 'José L.',
    location: 'Barquisimeto',
    text: 'Me encanta el estilo N10K. La franela LIMITLESS tiene un estampado que responde. Ya quiero más colores.',
    rating: 4,
    product: 'Tee LIMITLESS',
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useScrollVisibleWithRef(sectionRef, 0.1);
  useStaggerChildren(sectionRef, isVisible, '.testimonial-card', 0.15);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current!.querySelectorAll('.testimonial-card');
      gsap.set(cards, { autoAlpha: 0, y: 40, scale: 0.95 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="testimonials" className={`py-8 sm:py-20 px-4 relative overflow-hidden animate-section-slide-up ${isVisible ? 'is-visible' : ''}`}>
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E30613]/[0.02] to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <BlurIn delay={0.1} duration={0.8}>
          <div className="text-center mb-6 sm:mb-12">
            <p className="text-[.65rem] font-montserrat-bold tracking-[.2em] uppercase text-[#E30613] mb-2 flex items-center justify-center gap-2.5">
              <span className="inline-block w-5 h-[1.5px] bg-[#E30613]" />
              Lo que dicen nuestros clientes
              <span className="inline-block w-5 h-[1.5px] bg-[#E30613]" />
            </p>
            <h2 className="font-montserrat-extrabold text-white leading-[.95] text-2xl sm:text-4xl md:text-5xl tracking-[-0.01em]">
              OPINIONES REALES
            </h2>
          </div>
        </BlurIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="testimonial-card glass-card-pro p-4 sm:p-6 group hover:border-[#E30613]/20 transition-all duration-500"
            >
              {/* Quote icon */}
              <Quote className="h-6 w-6 text-[#E30613]/20 mb-3 group-hover:text-[#E30613]/40 transition-colors" />

              {/* Rating */}
              <div className="flex gap-0.5 mb-3" role="img" aria-label={`${testimonial.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 ${si < testimonial.rating ? 'text-[#E30613] fill-[#E30613]' : 'text-gray-600'}`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 font-montserrat-medium">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E30613] to-[#ff4d4f] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-montserrat-black">{testimonial.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white text-xs font-montserrat-bold">{testimonial.name}</p>
                  <p className="text-gray-500 text-[10px] font-montserrat-medium">{testimonial.location}</p>
                </div>
              </div>

              {/* Product badge */}
              <div className="mt-3">
                <span className="inline-block bg-[#E30613]/10 text-[#E30613] text-[9px] font-montserrat-bold tracking-wider uppercase px-2 py-0.5 rounded-full">
                  {testimonial.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
