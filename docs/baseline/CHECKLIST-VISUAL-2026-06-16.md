# Checklist visual baseline — 2026-06-16 (F0)

> Marcar `[x]` tras captura/screenshot o verificación manual en `bun run dev`.  
> Notas **Código** = expectativa derivada del source (sin browser en F0 automático).

**Screenshots:** `docs/baseline/screenshots/` — ver [CAPTURA-MANUAL.md](./CAPTURA-MANUAL.md)

| Campo | Valor |
|-------|-------|
| Fecha captura | _pendiente_ |
| Responsable QA | _pendiente_ |
| Dev URL | `http://localhost:3000` |

---

## Desktop (≥1280px)

| # | Check | Código / expectativa | Captura | OK |
|---|-------|---------------------|---------|-----|
| D1 | LoadingScreen GSAP ~1,8s + safety 3,5s | GSAP timeline + timeout 3500ms | `desktop-loading-screen.png` | [ ] |
| D2 | Transición fade al hero | scale 1.05 + autoAlpha 0 | `desktop-hero-post-loading.png` | [ ] |
| D3 | Hero canvas pin + scrub scroll | pin `+=200%`, scrub 0.1 | `desktop-hero-mid-scroll.png` | [ ] |
| D4 | Logo/texto overlay hero final | absolute overlay en pin | `desktop-hero-end.png` | [ ] |
| D5 | Plasma WebGL en About/Newsletter | dynamic Plasma `#E30613` | `desktop-plasma-about.png` | [ ] |
| D6 | Marquee rojo `#E30613` | `bg-[#E30613]` section | `desktop-marquee-red.png` | [ ] |
| D7 | FeaturedProducts hover quick-add visible | `opacity-0 group-hover:opacity-100` → **visible en hover** | `desktop-featured-hover.png` | [ ] |
| D8 | ProductGrid filtros + sort + cards | section `#collection` | `desktop-product-grid.png` | [ ] |
| D9 | ProductGrid card hover frost overlay | `.frost-content` @hover only | `desktop-grid-frost-hover.png` | [ ] |
| D10 | ProductDetail modal completo | galería, tallas, colores | `desktop-product-detail.png` | [ ] |
| D11 | CartSidebar + totales | slide-in sidebar | `desktop-cart-sidebar.png` | [ ] |
| D12 | WishlistSidebar | idem | `desktop-wishlist-sidebar.png` | [ ] |
| D13 | Header sticky + badges | glass header | `desktop-header.png` | [ ] |
| D14 | FloatingNavBar inferior | fixed bottom | `desktop-floating-nav.png` | [ ] |
| D15 | WhatsApp flotante | fixed button | `desktop-whatsapp.png` | [ ] |
| D16 | Footer completo | social + links | `desktop-footer.png` | [ ] |
| D17 | Newsletter section | marquees + CTAs | `desktop-newsletter.png` | [ ] |
| D18 | CookieConsent tras ~1,5s | delay 1500ms, z-70 | `desktop-cookie-consent.png` | [ ] |
| D19 | AuthModal login/registro | modal overlay | `desktop-auth-modal.png` | [ ] |

---

## Tablet (768px)

| # | Check | Código / expectativa | Captura | OK |
|---|-------|---------------------|---------|-----|
| T1 | Menú hamburguesa Header | `md:hidden` toggle | `tablet-menu-open.png` | [ ] |
| T2 | Hero pin journey longitud | 200% viewport scroll | `tablet-hero-scroll.png` | [ ] |
| T3 | Grid ~2 columnas productos | responsive grid | `tablet-product-grid.png` | [ ] |
| T4 | Modales sin overflow horizontal | max-width constraints | `tablet-product-detail.png` | [ ] |
| T5 | CookieConsent vs CTAs fijos | bottom fixed z-70 | `tablet-cookie-vs-cta.png` | [ ] |

---

## Mobile 390px (iPhone 14)

| # | Check | Código / expectativa | Captura | OK |
|---|-------|---------------------|---------|-----|
| M1 | Safe-area notch vs nav/WhatsApp | **Sin safe-area en código** — documentar gap | `mobile-390-safe-area.png` | [ ] |
| M2 | TTI hero (tiempo hasta tap) | MP4 8,65MB + frame extract — **lento esperado** | anotar segundos | [ ] |
| M3 | Quick-add Featured **NO visible** en tap | solo hover — **bug conocido MOB-011** | `mobile-390-featured-tap.png` | [ ] |
| M4 | ProductGrid frost **NO visible** en tap | `@media (hover:hover)` — **MOB-010** | `mobile-390-grid-tap.png` | [ ] |
| M5 | WishlistSection scroll horizontal | horizontal strip | `mobile-390-wishlist-strip.png` | [ ] |
| M6 | SearchModal + teclado | `mt-[10vh]` — riesgo tapado | `mobile-390-search-modal.png` | [ ] |
| M7 | ProductDetail galería swipe | modal full screen mobile | `mobile-390-product-detail.png` | [ ] |
| M8 | 100vh jump barra URL | min-h-screen — **documentar si ocurre** | video opcional | [ ] |
| M9 | FloatingNav + WhatsApp stack | bottom fixed | `mobile-390-bottom-ui.png` | [ ] |
| M10 | CookieConsent sin botón X | dismiss `hidden sm:flex` — **solo Aceptar/Rechazar** | `mobile-390-cookie.png` | [ ] |

---

## Mobile 360px (Android compacto)

| # | Check | Código / expectativa | Captura | OK |
|---|-------|---------------------|---------|-----|
| S1 | Sin overflow horizontal | scroll-x none en body | `mobile-360-full-page.png` | [ ] |
| S2 | Marquee tipográfico layout OK | `text-[10rem]` track — **MOB-004** | `mobile-360-marquee.png` | [ ] |
| S3 | Targets <44px visibles | header 36px, wishlist remove 24px | anotar lista | [ ] |
| S4 | Textos comerciales legibles | sin truncado crítico en cards | `mobile-360-product-card.png` | [ ] |

---

## Regresiones conocidas a preservar como referencia (no son bugs visuales de F0)

Estos comportamientos **existen hoy** y se corregirán en F3+; documentarlos evita confundir regresión con fix:

- Quick-add invisible en touch (Featured + Grid frost)
- Hero lento en 4G (MP4 + extracción frames)
- Cookie dismiss X solo desktop
- Scroll pin hero largo en mobile

---

## Firma baseline

- [ ] 18+ capturas mínimas en `screenshots/`
- [ ] Lighthouse mobile registrado en BASELINE-TECNICO §9
- [ ] `bun run lint` + `tsc` + `build` ejecutados y anotados
- [ ] Checklist revisado por QA

**Aprobado para iniciar F1:** [ ] Sí · [ ] No — motivo: _______________
