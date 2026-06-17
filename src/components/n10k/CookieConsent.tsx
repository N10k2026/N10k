'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('n10k-cookie-consent');
    if (!consent) {
      // Small delay so it doesn't flash immediately on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('n10k-cookie-consent', 'accepted');
    setVisible(false);
    window.dispatchEvent(new Event('n10k-cookie-consent-change'));
  };

  const handleReject = () => {
    localStorage.setItem('n10k-cookie-consent', 'rejected');
    setVisible(false);
    window.dispatchEvent(new Event('n10k-cookie-consent-change'));
  };

  const handleDismiss = () => {
    // Persist the dismissal so the banner doesn't reappear on every navigation.
    localStorage.setItem('n10k-cookie-consent', 'dismissed');
    setVisible(false);
    window.dispatchEvent(new Event('n10k-cookie-consent-change'));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-500" role="region" aria-label="Consentimiento de cookies">
      <div className="max-w-4xl mx-auto bg-[#111111] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon + Text */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E30613]/10 border border-[#E30613]/20 flex items-center justify-center">
              <Cookie className="h-5 w-5 text-[#E30613]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white text-sm font-montserrat-bold tracking-[0.04em] mb-1">
                Usamos cookies
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-montserrat-medium">
                Utilizamos cookies para mejorar tu experiencia de navegación y analizar el tráfico del sitio. Puedes aceptar todas las cookies o rechazarlas.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/20 text-white/60 text-xs font-montserrat-bold tracking-[0.06em] uppercase hover:border-white/40 hover:text-white transition-all duration-200 cursor-pointer"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#E30613] text-white text-xs font-montserrat-bold tracking-[0.06em] uppercase hover:bg-[#ff2d34] transition-all duration-200 shadow-lg shadow-[#E30613]/25 cursor-pointer"
            >
              Aceptar
            </button>
            <button
              onClick={handleDismiss}
              className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
