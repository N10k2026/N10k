'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '584122880228';
const WHATSAPP_MESSAGE = 'Hola N10K, quiero información sobre sus productos';
const COOKIE_CONSENT_KEY = 'n10k-cookie-consent';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [cookieVisible, setCookieVisible] = useState(true);

  // Check if cookie consent is visible. Use the storage event to react to
  // changes made in other documents/contexts, and a custom event for same-tab
  // changes (the storage event does not fire in the tab that made the change).
  useEffect(() => {
    const checkCookie = () => {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      setCookieVisible(!consent);
    };
    checkCookie();

    const onStorage = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_KEY || e.key === null) {
        checkCookie();
      }
    };
    // Custom event dispatched by CookieConsent when the user makes a choice
    // in this same tab.
    const onConsentChange = () => checkCookie();
    window.addEventListener('storage', onStorage);
    window.addEventListener('n10k-cookie-consent-change', onConsentChange);
    // Also re-check when the window regains focus (covers any other edge cases).
    window.addEventListener('focus', checkCookie);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('n10k-cookie-consent-change', onConsentChange);
      window.removeEventListener('focus', checkCookie);
    };
  }, []);

  // Show tooltip briefly on first render
  useEffect(() => {
    const showTimer = setTimeout(() => setShowTooltip(true), 2000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 5000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClick = useCallback(() => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  }, []);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // Don't render while cookie consent is visible
  if (cookieVisible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-4 sm:left-6 z-40" data-whatsapp-btn>
      {/* Tooltip */}
      <div
        className={`absolute bottom-full left-0 mb-3 px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl shadow-black/50 whitespace-nowrap transition-all duration-500 pointer-events-none ${
          showTooltip
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2'
        }`}
      >
        <p className="text-white text-xs font-bold">¿Necesitas ayuda?</p>
        <p className="text-white/50 text-[10px]">Escríbenos por WhatsApp</p>
        {/* Arrow */}
        <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-[#1A1A1A] border-r border-b border-white/10 rotate-45" />
      </div>

      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping" style={{ animationDuration: '2s' }} />

      {/* Button */}
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300 cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white fill-white" />
      </button>
    </div>
  );
}
