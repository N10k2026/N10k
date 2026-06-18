'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { Button } from '@/components/ui/button';
import { Zap, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { usePerformancePrefs } from '@/hooks/use-performance-prefs';
import { devError } from '@/lib/dev-log';
import MobileBannerHero from '@/components/n10k/MobileBannerHero';

/**
 * ScrollVideoHero — Canvas-based scroll-driven video hero (desktop only).
 *
 * On mobile: displays an auto-cycling banner carousel with smooth crossfade
 * + the same overlay content (badge, logo, CTAs).
 *
 * Desktop flow:
 * 1. Pre-extract ALL video frames as ImageBitmap (loading progress shown)
 * 2. 3D entrance animation on canvas
 * 3. Scroll drives frame-by-frame playback (zero seek latency)
 * 4. When scroll reaches last frame → freeze, smooth overlay with logo + CTAs
 * 5. Header & nav reappear, page content is accessible below
 */

const VIDEO_SRC = '/video/hero-banner-hd.mp4';
const SCROLL_DISTANCE = '+=200%';
const PROGRESS_BATCH = 4;
const BODY_CLASS = 'video-hero-active';

type HeroFrame = ImageBitmap | HTMLCanvasElement;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < 18; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        opacity: 0.1 + Math.random() * 0.25,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 6,
      });
    }
    setParticles(arr);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-particle absolute rounded-full bg-[#E30613]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function ScrollVideoHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const logoGlowRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const prefs = usePerformancePrefs();
  const useStaticHero = prefs.useStaticHero;
  const isMobile = prefs.isMobile;

  // On mobile, always use the banner carousel instead of video scroll
  const useMobileBanners = isMobile || useStaticHero;

  const [extractionProgress, setExtractionProgress] = useState(0);
  const [framesReady, setFramesReady] = useState(false);
  const [showEntrance, setShowEntrance] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [mobileReady, setMobileReady] = useState(false);

  const framesRef = useRef<HeroFrame[]>([]);
  const scrollProgressRef = useRef(0);
  const rafIdRef = useRef(0);
  const currentFrameRef = useRef(-1);
  const canvasReadyRef = useRef(false);
  const overlayTriggeredRef = useRef(false);
  const overlayAnimRefs = useRef<gsap.core.Tween[]>([]);

  // ── Mobile: show overlay with entrance animation ──
  useEffect(() => {
    if (!useMobileBanners) return;
    // Small delay to let the banner image load
    const timer = setTimeout(() => {
      setMobileReady(true);
      setShowOverlay(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [useMobileBanners]);

  // ── Desktop: Static hero fallback (reduced motion/data) ──
  useEffect(() => {
    if (useStaticHero || useMobileBanners) return;
    setFramesReady(true);
    setShowEntrance(true);
    setShowOverlay(true);
    document.body.classList.add(BODY_CLASS);
    return () => {
      document.body.classList.remove(BODY_CLASS);
    };
  }, [useStaticHero, useMobileBanners]);

  // ── Desktop: Phase 0 — Load video & extract frames ──
  useEffect(() => {
    if (useStaticHero || useMobileBanners) return;

    let alive = true;
    const frameRate = prefs.heroFrameRate;
    const extractMaxWidth = prefs.heroExtractMaxWidth;

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = prefs.heroVideoPreload;
    video.crossOrigin = 'anonymous';
    video.src = VIDEO_SRC;

    const extractFrames = async () => {
      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          video.removeEventListener('canplaythrough', onReady);
          video.removeEventListener('error', onError);
          resolve();
        };
        const onError = () => {
          video.removeEventListener('canplaythrough', onReady);
          video.removeEventListener('error', onError);
          reject(new Error('Video load failed'));
        };
        if (video.readyState >= 3) {
          resolve();
        } else {
          video.addEventListener('canplaythrough', onReady, { once: true });
          video.addEventListener('error', onError, { once: true });
          video.load();
        }
      });

      const duration = video.duration;
      const totalFrames = Math.floor(duration * frameRate);
      const frames: HeroFrame[] = [];

      const nativeW = video.videoWidth;
      const nativeH = video.videoHeight;
      const scale =
        extractMaxWidth > 0 && nativeW > extractMaxWidth
          ? extractMaxWidth / nativeW
          : 1;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = Math.round(nativeW * scale);
      offCanvas.height = Math.round(nativeH * scale);
      const offCtx = offCanvas.getContext('2d')!;

      for (let i = 0; i < totalFrames; i++) {
        if (!alive) return;

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked, { once: true });
          video.currentTime = i / frameRate;
        });

        offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);

        try {
          const bitmap = await createImageBitmap(offCanvas);
          frames.push(bitmap);
        } catch {
          const snap = document.createElement('canvas');
          snap.width = offCanvas.width;
          snap.height = offCanvas.height;
          snap.getContext('2d')!.drawImage(offCanvas, 0, 0);
          frames.push(snap);
        }

        if (i === totalFrames - 1 || i % PROGRESS_BATCH === 0) {
          setExtractionProgress((i + 1) / totalFrames);
        }
      }

      if (!alive) return;
      framesRef.current = frames;
      setFramesReady(true);

      video.src = '';
      video.load();
      offCanvas.width = 0;
      offCanvas.height = 0;
    };

    extractFrames().catch((err) => {
      devError('[ScrollVideoHero] Frame extraction failed:', err);
    });

    return () => {
      alive = false;
      framesRef.current.forEach((f) => {
        try { (f as ImageBitmap).close?.(); } catch { /* ok */ }
      });
      framesRef.current = [];
      video.src = '';
      video.load();
      document.body.classList.remove(BODY_CLASS);
    };
  }, [useStaticHero, useMobileBanners, prefs.heroFrameRate, prefs.heroExtractMaxWidth, prefs.heroVideoPreload]);

  // ── Desktop: Phase 1 — Entrance animation ──
  useEffect(() => {
    if (!framesReady || useMobileBanners) return;
    document.body.classList.add(BODY_CLASS);
    const timer = setTimeout(() => setShowEntrance(true), 100);
    return () => clearTimeout(timer);
  }, [framesReady, useMobileBanners]);

  // ── Desktop: Phase 2 — Canvas + ScrollTrigger + Overlay ──
  useEffect(() => {
    if (useStaticHero || useMobileBanners || !framesReady || !sectionRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const frames = framesRef.current;

    if (frames.length === 0) return;

    const drawFrame = (frameIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(frameIndex, frames.length - 1));
      const source = frames[clampedIndex];
      if (!source) return;

      const canvasW = canvas.width;
      const canvasH = canvas.height;
      const sourceW = source.width;
      const sourceH = source.height;

      const sourceAspect = sourceW / sourceH;
      const canvasAspect = canvasW / canvasH;

      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (sourceAspect > canvasAspect) {
        drawH = canvasH;
        drawW = canvasH * sourceAspect;
        drawX = (canvasW - drawW) / 2;
        drawY = 0;
      } else {
        drawW = canvasW;
        drawH = canvasW / sourceAspect;
        drawX = 0;
        drawY = (canvasH - drawH) / 2;
      }

      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.drawImage(source, drawX, drawY, drawW, drawH);
      currentFrameRef.current = clampedIndex;
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, prefs.canvasDprCap);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      drawFrame(currentFrameRef.current >= 0 ? currentFrameRef.current : 0);
    };

    const ctx = canvas.getContext('2d', { alpha: false })!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    resizeCanvas();
    drawFrame(0);
    canvasReadyRef.current = true;

    let lastProgress = -1;
    let idleFrames = 0;
    let tabVisible = !document.hidden;
    const tick = () => {
      if (!tabVisible) {
        rafIdRef.current = 0;
        return;
      }
      if (canvasReadyRef.current && frames.length > 0) {
        const targetFrame = Math.floor(scrollProgressRef.current * (frames.length - 1));
        if (targetFrame !== currentFrameRef.current) {
          drawFrame(targetFrame);
          idleFrames = 0;
        } else if (scrollProgressRef.current !== lastProgress) {
          idleFrames = 0;
        } else {
          idleFrames++;
        }
        lastProgress = scrollProgressRef.current;
        if (idleFrames < 60) {
          rafIdRef.current = requestAnimationFrame(tick);
        } else {
          rafIdRef.current = 0;
        }
      } else {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);

    const wakeRaf = () => {
      if (!rafIdRef.current) {
        idleFrames = 0;
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };
    const onVisibilityChange = () => {
      tabVisible = !document.hidden;
      if (tabVisible) wakeRaf();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    window.addEventListener('scroll', wakeRaf, { passive: true });
    window.addEventListener('resize', wakeRaf, { passive: true });

    const killOverlayAnims = () => {
      overlayAnimRefs.current.forEach((t) => t.kill());
      overlayAnimRefs.current = [];
    };

    const triggerOverlay = () => {
      if (overlayTriggeredRef.current) return;
      overlayTriggeredRef.current = true;

      drawFrame(frames.length - 1);
      setShowOverlay(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!overlayRef.current) return;

          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          tl.fromTo(overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.35 }
          );

          if (ctaRef.current) {
            gsap.set(ctaRef.current, { autoAlpha: 0, y: 18 });
            tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.45 }, '<0.05');
          }

          if (badgeRef.current) {
            gsap.set(badgeRef.current, { autoAlpha: 0, y: -12, scale: 0.92 });
            tl.to(badgeRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45 }, '<0.02');
          }

          if (brandRef.current) {
            gsap.set(brandRef.current, { autoAlpha: 0, scale: 0.7, y: 28 });
            tl.to(brandRef.current, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'power4.out' }, '<0.05');
          }

          if (brandRef.current) {
            const floatTween = gsap.to(brandRef.current, { y: -12, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.8 });
            overlayAnimRefs.current.push(floatTween);
          }

          if (logoGlowRef.current) {
            const glowTween = gsap.to(logoGlowRef.current, { filter: 'drop-shadow(0 0 30px rgba(227,6,19,0.6))', duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1 });
            overlayAnimRefs.current.push(glowTween);
          }

          if (badgeRef.current) {
            const badgeTween = gsap.to(badgeRef.current, { scale: 1.03, duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.2 });
            overlayAnimRefs.current.push(badgeTween);
          }
        });
      });
    };

    const hideOverlay = () => {
      if (!overlayTriggeredRef.current) return;
      overlayTriggeredRef.current = false;
      killOverlayAnims();

      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => setShowOverlay(false),
        });
      } else {
        setShowOverlay(false);
      }
    };

    const gsapCtx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: SCROLL_DISTANCE,
        pin: true,
        pinSpacing: true,
        scrub: 0.1,
        onEnter: () => {
          document.body.classList.add(BODY_CLASS);
        },
        onLeave: () => {
          document.body.classList.remove(BODY_CLASS);
        },
        onEnterBack: () => {
          document.body.classList.add(BODY_CLASS);
        },
        onLeaveBack: () => {
          document.body.classList.remove(BODY_CLASS);
        },
        onUpdate: (self) => {
          const OVERLAY_START = 0.6;
          const videoProgress = Math.min(self.progress / OVERLAY_START, 1);
          scrollProgressRef.current = videoProgress;

          if (self.progress >= OVERLAY_START && !overlayTriggeredRef.current) {
            triggerOverlay();
          } else if (self.progress < OVERLAY_START - 0.05 && overlayTriggeredRef.current) {
            hideOverlay();
          }

          if (self.progress < 0.98) {
            document.body.classList.add(BODY_CLASS);
          } else {
            document.body.classList.remove(BODY_CLASS);
          }
        },
      });
    }, section);

    window.addEventListener('resize', resizeCanvas);

    return () => {
      gsapCtx.revert();
      killOverlayAnims();
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', wakeRaf);
      window.removeEventListener('resize', wakeRaf);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvasReadyRef.current = false;
      document.body.classList.remove(BODY_CLASS);
    };
  }, [framesReady, useStaticHero, useMobileBanners, prefs.canvasDprCap]);

  // ── Mobile overlay entrance with GSAP ──
  useEffect(() => {
    if (!useMobileBanners || !mobileReady || !overlayRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (badgeRef.current) {
      gsap.set(badgeRef.current, { autoAlpha: 0, y: -12, scale: 0.92 });
      tl.to(badgeRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 }, 0.1);
    }

    if (brandRef.current) {
      gsap.set(brandRef.current, { autoAlpha: 0, scale: 0.7, y: 28 });
      tl.to(brandRef.current, { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: 'power4.out' }, 0.2);
    }

    if (ctaRef.current) {
      gsap.set(ctaRef.current, { autoAlpha: 0, y: 18 });
      tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.3);
    }

    // Continuous animations
    if (brandRef.current) {
      const floatTween = gsap.to(brandRef.current, { y: -12, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1 });
      overlayAnimRefs.current.push(floatTween);
    }
    if (logoGlowRef.current) {
      const glowTween = gsap.to(logoGlowRef.current, { filter: 'drop-shadow(0 0 30px rgba(227,6,19,0.6))', duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.2 });
      overlayAnimRefs.current.push(glowTween);
    }
    if (badgeRef.current) {
      const badgeTween = gsap.to(badgeRef.current, { scale: 1.03, duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.4 });
      overlayAnimRefs.current.push(badgeTween);
    }

    return () => {
      overlayAnimRefs.current.forEach((t) => t.kill());
      overlayAnimRefs.current = [];
    };
  }, [useMobileBanners, mobileReady]);

  return (
    <section
      ref={sectionRef}
      id="scroll-video-hero"
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* ── Mobile: Banner Carousel ── */}
      {useMobileBanners && <MobileBannerHero />}

      {/* ── Desktop: Loading overlay ── */}
      {!framesReady && !useStaticHero && !useMobileBanners && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black">
          <div className="mb-6">
            <span className="text-2xl font-bold tracking-[0.3em] text-white/90">
              N10K
            </span>
          </div>
          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E30613] rounded-full transition-all duration-200 ease-out"
              style={{ width: `${Math.round(extractionProgress * 100)}%` }}
            />
          </div>
          <span className="mt-3 text-xs text-white/40 tracking-widest uppercase">
            {Math.round(extractionProgress * 100)}%
          </span>
        </div>
      )}

      {/* ── Desktop: Canvas wrapper with entrance animation ── */}
      {!useStaticHero && !useMobileBanners && (
        <div
          ref={wrapRef}
          className={`absolute inset-0 will-change-transform ${
            showEntrance ? 'hero-video-entered' : 'hero-video-hidden'
          }`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
            role="img"
            aria-label="Animación de video del hero N10K"
          />
        </div>
      )}

      {/* ── Vignette — always visible ── */}
      {(framesReady || useMobileBanners) && (
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      )}

      {/* ── Desktop: Scroll hint ── */}
      {framesReady && !showOverlay && !useStaticHero && !useMobileBanners && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4 animate-scroll-hint-large">
            <span className="text-base sm:text-lg md:text-xl tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/60 font-montserrat-bold">
              Scroll
            </span>
            <div className="flex flex-col items-center gap-1">
              <span className="rotate-180 sm:rotate-0 inline-flex">
                <ChevronDown className="h-8 w-8 sm:h-10 sm:w-10 text-[#E30613]/70 animate-bounce" style={{ animationDuration: '1.5s' }} />
              </span>
              <span className="rotate-180 sm:rotate-0 inline-flex -mt-4">
                <ChevronDown className="h-6 w-6 sm:h-8 sm:w-8 text-white/30 animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.15s' }} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero content overlay ── */}
      {showOverlay && (
        <div
          ref={overlayRef}
          className="absolute inset-0 z-[10] flex items-center justify-center"
          style={{ opacity: useMobileBanners || useStaticHero ? 1 : 0 }}
        >
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 pointer-events-none" />

          {/* Radial red glow behind content */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#E30613]/8 rounded-full blur-[150px] pointer-events-none" />

          {/* Floating particles */}
          <FloatingParticles />

          {/* Content */}
          <div className="relative z-10 text-center px-5 sm:px-4 max-w-5xl mx-auto">
            {/* Badge */}
            <div ref={badgeRef} className="inline-flex items-center gap-2 glass-card badge-pulse px-3 sm:px-5 py-2 sm:py-2.5 mb-6 sm:mb-8">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-[#E30613]" />
              <span className="text-animated-gradient text-[10px] sm:text-sm font-montserrat-extrabold tracking-[0.1em] sm:tracking-[0.15em] uppercase whitespace-nowrap">
                Nueva Colección 2026
              </span>
            </div>

            {/* Brand Logo */}
            <div ref={brandRef} className="mb-10 flex justify-center px-2 animate-panda-float">
              <div
                ref={logoGlowRef}
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(227,6,19,0.4)) drop-shadow(0 4px 30px rgba(227,6,19,0.2))',
                }}
              >
                <Image
                  src="/brand/logo-01-n10kcaballero-xl.webp"
                  alt="N10K Caballero"
                  width={1200}
                  height={431}
                  priority={useMobileBanners || useStaticHero}
                  sizes="(max-width: 640px) 200px, (max-width: 1024px) 420px, 500px"
                  className="w-[200px] sm:w-[350px] md:w-[420px] lg:w-[500px] h-auto max-w-full"
                />
              </div>
            </div>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <div className="shimmer-border rounded-2xl p-[2px]">
                <Button
                  size="lg"
                  className="bg-[#E30613] hover:bg-[#ff1a22] text-white font-montserrat-black text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-2xl tracking-[0.1em] uppercase shadow-lg shadow-[#E30613]/25 hover:shadow-[#E30613]/40 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 btn-press btn-inner-highlight cta-shimmer w-full"
                  asChild
                >
                  <a href="#collection">Comprar Ahora</a>
                </Button>
              </div>
              <div className="shimmer-border rounded-2xl p-[2px]">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-background/80 backdrop-blur-sm border border-white/10 text-foreground hover:bg-foreground/5 font-montserrat-bold text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-2xl tracking-[0.1em] uppercase hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 btn-press btn-inner-highlight w-full"
                  asChild
                >
                  <a href="#new-arrivals">Ver Novedades</a>
                </Button>
              </div>
            </div>
          </div>

          {/* Floating accent circles */}
          <div className="absolute top-[15%] right-[10%] w-2 h-2 bg-[#E30613]/30 rounded-full animate-float z-[5]" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[60%] left-[5%] w-1.5 h-1.5 bg-[#E30613]/20 rounded-full animate-float z-[5]" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-[20%] right-[15%] w-1 h-1 bg-[#E30613]/15 rounded-full animate-float z-[5]" style={{ animationDelay: '2s' }} />
        </div>
      )}
    </section>
  );
}