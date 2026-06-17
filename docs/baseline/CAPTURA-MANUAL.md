# Guía de captura manual — Baseline F0

Ejecutar **antes de F1**. Objetivo: referencia visual pixel-a-pixel para regresión.

## Prerrequisitos

```powershell
# Desde la raíz del proyecto
bun install          # si no hay node_modules
bun run dev          # http://localhost:3000
```

## Viewports (DevTools → Toggle device toolbar)

| ID | Ancho | Dispositivo referencia |
|----|-------|------------------------|
| `desktop` | 1280×800 | Desktop |
| `tablet` | 768×1024 | iPad |
| `mobile-390` | 390×844 | iPhone 14 |
| `mobile-360` | 360×780 | Android compacto |

## Convención de nombres

Guardar en `docs/baseline/screenshots/`:

```
{viewport}-{seccion}-{estado}.png
```

Ejemplos:
- `desktop-hero-post-loading.png`
- `desktop-product-detail-modal.png`
- `mobile-390-home-above-fold.png`
- `mobile-360-product-grid.png`
- `tablet-header-menu-open.png`

## Secuencia mínima (18 capturas)

### Todas las resoluciones

1. **Home above-fold** — tras LoadingScreen (~4 s desde load)
2. **Hero mid-scroll** — mitad del pin canvas
3. **Hero end** — overlay logo/texto final visible
4. **Marquee rojo** — sección `#E30613` entre hero y Featured
5. **ProductGrid** — al menos 4 cards visibles
6. **ProductDetail abierto** — un producto cualquiera
7. **CartSidebar abierto** — con ≥1 item si es posible
8. **CookieConsent visible** — esperar 1,5 s tras load

### Solo mobile (390 + 360)

9. **FloatingNavBar + WhatsApp** — parte inferior
10. **SearchModal abierto**
11. **Header menú hamburguesa abierto** (390/768)
12. **WishlistSection** — scroll horizontal

### Solo desktop

13. **FeaturedProducts hover** — quick-add visible (`opacity-100`)
14. **ProductGrid card hover** — frost overlay visible

## Video opcional (recomendado mobile 390)

- Grabar 30–45 s: load → scroll hero completo → abrir producto → cerrar
- Nombre: `mobile-390-scroll-journey.webm`
- Anotar tiempo hasta primer tap interactivo (TTI percibido)

## Lighthouse (mobile 4G)

```text
Chrome DevTools → Lighthouse → Mobile → Performance + Accessibility
```

Exportar JSON/HTML a `docs/baseline/lighthouse-mobile-2026-06-16.json` (opcional).

Registrar en [BASELINE-TECNICO-2026-06-16.md](./BASELINE-TECNICO-2026-06-16.md):
- LCP, TBT, CLS, Performance score

## Comandos técnicos post-captura

```powershell
bun run lint
bunx tsc --noEmit
bun run build
```

Actualizar tabla §2.2 en BASELINE-TECNICO con resultados.

## Firma baseline

Cuando checklist + capturas estén listos, marcar en [CHECKLIST-VISUAL-2026-06-16.md](./CHECKLIST-VISUAL-2026-06-16.md):

- Fecha captura: ___________
- Responsable QA: ___________
- Dev server commit/hash (si aplica): ___________
