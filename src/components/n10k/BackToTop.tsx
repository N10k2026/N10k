'use client';

import { useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useScrollRaf } from '@/hooks/use-scroll-raf';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  useScrollRaf(() => {
    const next = window.scrollY > 600;
    if (next !== visibleRef.current) {
      visibleRef.current = next;
      setVisible(next);
    }
  });

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 w-10 h-10 sm:w-12 sm:h-12 bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#E30613] hover:border-[#E30613] transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-[#E30613]/20 hover:scale-110 cursor-pointer group"
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
    </button>
  );
}
