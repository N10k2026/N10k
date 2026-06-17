# Baseline técnico — 2026-06-16 (F0)

> Entorno de captura: Windows 10 · workspace local N10K  
> Modo: solo lectura + métricas filesystem (sin modificar código app)

---

## 1. Stack verificado

| Tecnología | Versión declarada | Verificado en repo |
|------------|-------------------|-------------------|
| Next.js | `^16.1.1` | ✅ `package.json`, App Router `src/app/` |
| React | `^19.0.0` | ✅ |
| TypeScript | `^5` | ✅ `tsconfig.json` |
| Tailwind | `^4` | ✅ `globals.css`, `@tailwindcss/postcss` |
| Prisma | `^6.11.1` | ✅ `prisma/schema.prisma` — SQLite |
| Bun | scripts | ⚠️ No en PATH en sesión F0 |
| Node/npm | — | ⚠️ No en PATH · `node_modules/` ausente |

---

## 2. Métricas filesystem (`public/`)

| Métrica | Valor |
|---------|-------|
| Archivos totales | **74** |
| Peso total | **16,25 MB** |
| `hero-banner-hd.mp4` | **8,65 MB** (53,2 % del total) |
| WebP | 62 archivos · 3,41 MB |
| MP4 (todos) | 3 archivos · 12,64 MB |
| PNG | 5 archivos · 214 KB |

---

## 3. Métricas código

| Archivo / área | Valor |
|----------------|-------|
| `globals.css` | **2177** LOC |
| `page.tsx` imports estáticos | **22** componentes + 1 dynamic (`Plasma`) |
| `ProductDetail.tsx` | **1393** LOC |
| `ProductGrid.tsx` | **1252** LOC |
| `ScrollVideoHero.tsx` | **533** LOC |
| `AuthModal.tsx` | **778** LOC |
| Componentes `n10k/*.tsx` | **28** archivos |
| Hooks `src/hooks/` | **5** archivos |
| Tests automatizados | **0** |

---

## 4. Comportamiento documentado en código (referencia visual)

### 4.1 LoadingScreen

| Parámetro | Valor | Archivo |
|-----------|-------|---------|
| Safety timeout | **3500 ms** | `LoadingScreen.tsx:52-66` |
| GSAP reveal | ~0,7 s fade | `LoadingScreen.tsx:31-38` |
| Body scroll lock | `is-loading` class | `LoadingScreen.tsx:42-47` |

### 4.2 Hero scroll-driven

| Parámetro | Valor | Archivo |
|-----------|-------|---------|
| Video source | `/video/hero-banner-hd.mp4` | `ScrollVideoHero.tsx:24` |
| Preload | `auto` | `ScrollVideoHero.tsx:105` |
| Scroll distance | `+=200%` viewport | `ScrollVideoHero.tsx:26` |
| Pin | `true` | `ScrollVideoHero.tsx:393` |
| Scrub | `0.1` | `ScrollVideoHero.tsx:395` |

### 4.3 CookieConsent

| Parámetro | Valor | Archivo |
|-----------|-------|---------|
| Delay aparición | **1500 ms** | `CookieConsent.tsx:14` |
| z-index | `z-[70]` | `CookieConsent.tsx:41` |
| Dismiss (X) | `hidden sm:flex` — **no visible en mobile** | `CookieConsent.tsx:75` |

### 4.4 Touch vs hover (estado actual — documentar en capturas)

| Elemento | Comportamiento touch | Evidencia |
|----------|---------------------|-----------|
| Featured quick-add | **Invisible** (solo `group-hover:opacity-100`) | `FeaturedProducts.tsx:146` |
| ProductGrid frost overlay | **Invisible** (`@media (hover: hover)` only) | `globals.css:403-409` |
| Wishlist remove btn | **Invisible** (`opacity-0 group-hover:opacity-100`, 24×24px) | `WishlistSection.tsx:121` |
| RecentlyViewed overlay | **Invisible** en touch | `RecentlyViewedSection.tsx` — hover overlay |
| Novedades video preview | Hover/long-press hook existe | `use-long-press-video.ts` — verificar en captura |

### 4.5 Targets táctiles (<44px) — verificar visualmente

| Elemento | Tamaño CSS | Archivo |
|----------|------------|---------|
| Header icon buttons | `size-9` = **36×36px** | `button.tsx:28`, `Header.tsx` |
| Cookie dismiss (desktop only) | **32×32px** (`w-8 h-8`) | `CookieConsent.tsx:75` |
| Wishlist remove | **24×24px** (`w-6 h-6`) | `WishlistSection.tsx:121` |
| BackToTop | 40×40 mobile / 48×48 sm | `BackToTop.tsx:26` |

### 4.6 Safe-area / viewport

| Item | Estado código |
|------|---------------|
| `env(safe-area-inset-*)` | ❌ No encontrado en `n10k/` |
| `export const viewport` | ❌ Ausente en `layout.tsx` |
| `min-h-screen` / `h-screen` | ✅ Usado (100vh, no dvh) — `page.tsx:44,55` |

---

## 5. Validación técnica (runtime)

| Comando | Resultado F0 | Notas |
|---------|--------------|-------|
| `bun run lint` | ⏳ **No ejecutado** | Sin runtime Node/Bun; sin `node_modules` |
| `bunx tsc --noEmit` | ⏳ **No ejecutado** | Idem |
| `bun run build` | ⏳ **No ejecutado** | Se espera fallo por [ARQ-002] hasta F1 |
| `bun run dev` | ⏳ **No ejecutado** | Requiere `bun install` |
| Lighthouse mobile 4G | ⏳ **Pendiente** | Ver [CAPTURA-MANUAL.md](./CAPTURA-MANUAL.md) |

### HTML inicial (View Source)

| Check | Resultado |
|-------|-----------|
| `'use client'` en `page.tsx` | ✅ Línea 1 |
| Productos en HTML inicial | ❌ **No** — catálogo 100 % client-side [SEO-003] |
| `<h1>` en DOM inicial | ❌ **No** verificado en código [A11Y-001] |

---

## 6. Hallazgos críticos — snapshot pre-fix

| ID | Estado | Evidencia |
|----|--------|-----------|
| ARQ-002 | ✅ Confirmado | `next.config.ts` — sin `output: 'standalone'` |
| ARQ-020 | ✅ Confirmado | `package.json` build usa `cp` POSIX |
| BUG-013 | ✅ Confirmado | `ProductDetail.tsx:87-104` setState en render |
| BUG-014 | ✅ Confirmado | `ProductDetail.tsx:138-159` sin guard outOfStock |
| BUG-015 | ✅ Confirmado | `ProductGrid.tsx:162-167` quick-add sin stock |
| SEC-001 | ✅ Confirmado | `auth-utils.ts:14` header `x-user-id` |
| PERF-019 | ✅ Confirmado | MP4 8,65 MB |
| MOB-020 | ✅ Confirmado | `preload='auto'` + extracción frames |
| MOB-030 | ✅ Confirmado | pin + scrub 0.1 + canvas redraw |
| QA-019 | ✅ Confirmado | Sin script `typecheck` |

---

## 7. Orden de secciones en página (composición baseline)

Secuencia en `src/app/page.tsx` — **no alterar en F1–F3**:

1. Skip link · ScrollProgress · InteractiveBackground  
2. Header · WishlistSection  
3. **ScrollVideoHero**  
4. Marquee rojo `#E30613`  
5. FeaturedProducts · ProductGrid  
6. RecentlyViewedSection · Marquee 2  
7. StatsSection · TestimonialsSection  
8. AboutSection + Plasma · NewsletterSection  
9. Footer · FloatingNavBar · Modales (Cart, Wishlist, Auth, Search)  
10. WhatsApp · BackToTop · CookieConsent · ProductDetail  

---

## 8. Tokens visuales congelados (no cambiar en correcciones)

| Token | Valor |
|-------|-------|
| Rojo marca | `#E30613` |
| Hover rojo | `#ff2d34` / `#ff1a22` |
| Fondo dark | `oklch(0.07 0 0)` / `#1A1A1A` |
| Fuente | Montserrat 500–900 |
| theme-color meta | `#E30613` |

---

## 9. Actualización post-captura manual

Completar tras ejecutar [CAPTURA-MANUAL.md](./CAPTURA-MANUAL.md):

| Campo | Valor |
|-------|-------|
| LCP mobile (4G) | _pendiente_ |
| TBT | _pendiente_ |
| CLS | _pendiente_ |
| Performance score | _pendiente_ |
| Lint exit code | _pendiente_ |
| Typecheck exit code | _pendiente_ |
| Build exit code | _pendiente_ |
| TTI hero mobile (manual) | _pendiente_ |
| Screenshots en `screenshots/` | _0 / 18 mínimo_ |

---

*Generado en F0. Sin cambios de código de aplicación.*
