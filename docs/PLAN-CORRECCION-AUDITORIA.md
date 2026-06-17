# Plan de Corrección — Auditoría Técnica N10K

> **Fase:** Planificación y baseline (sin cambios de código).  
> **Fecha:** 2026-06-16  
> **Fuente:** [AUDITORIA-TECNICA.md](./AUDITORIA-TECNICA.md)  
> **Stack objetivo:** Next.js 16 · React 19 · TypeScript 5 · Tailwind 4 · Bun  
> **Principio rector:** Corregir bugs, seguridad, performance, mobile, datos, a11y y SEO **sin rediseñar** la página.

---

## 0. Resumen ejecutivo

| Métrica | Valor |
|---------|-------|
| Hallazgos totales | **293** |
| 🔴 Críticos | 17 |
| 🟠 Altos | 70 |
| 🟡 Medios | 154 |
| 🔵 Bajos | 43 |
| ⚪ Informativos | 9 |
| Componentes `n10k/` | 28 `.tsx` + `Plasma.css` |
| Tests automatizados | 0 |
| `public/` verificado | 74 archivos · 16,25 MB (`hero-banner-hd.mp4` ≈ 8,65 MB) |

### Conteo por prefijo

| Prefijo | Total | 🔴 | 🟠 | 🟡 | 🔵 | ⚪ | Sección |
|---------|-------|----|----|----|----|-----|---------|
| **ARQ** | 28 | 2 | 8 | 14 | 3 | 1 | Arquitectura |
| **BUG** | 31 | 3 | 8 | 17 | 3 | 0 | Bugs funcionales |
| **PERF** | 19 | 2 | 6 | 10 | 1 | 0 | Rendimiento |
| **MOB** | 38 | 2 | 11 | 20 | 5 | 0 | Mobile |
| **ANIM** | 18 | 1 | 4 | 10 | 2 | 1 | Animaciones / WebGL |
| **SEC** | 34 | 6 | 10 | 14 | 1 | 3 | Seguridad |
| **DATA** | 29 | 1 | 6 | 17 | 4 | 1 | Datos / Prisma |
| **A11Y** | 34 | 0 | 6 | 18 | 9 | 1 | Accesibilidad |
| **SEO** | 14 | 0 | 6 | 5 | 2 | 1 | SEO |
| **QUAL** | 10 | 0 | 1 | 5 | 3 | 1 | Calidad / i18n |
| **QA** | 23 | 0 | 2 | 13 | 8 | 0 | Mantenibilidad / DX |
| **DEP** | 15 | 0 | 2 | 10 | 3 | 0 | Dependencias |

### Fases recomendadas (orden de ejecución)

| Orden | Fase | Objetivo | Riesgo visual | Commit |
|-------|------|----------|---------------|--------|
| **1** | **F0 — Baseline** | Capturar estado visual/técnico antes de tocar código | Ninguno | — |
| | | 🟡 **En progreso** — ver [baseline/](./baseline/) · capturas manuales pendientes | | |
| **2** | **F1 — Bloqueadores** | Build, integridad e-commerce, crashes React | **Bajo** | 1 commit |
| **3** | **F2 — Seguridad mínima** | Auth real, rate limit, XSS reviews, Caddy | **Bajo–Medio** | 1 commit |
| **4** | **F3 — Mobile perf (quick wins)** | Hero, carga, touch, safe-area | **Medio** | 1 commit |
| **5** | **F4 — Datos e infra** | ✅ Schema, migraciones, seed, APIs (2026-06-16) | **Bajo** | 1 commit |
| **6** | **F5 — Estructural** | RSC catálogo, rutas producto, split componentes | **Medio–Alto** | 1 commit |
| **7** | **F6 — a11y / SEO / calidad** | Headings, modales, sitemap, tests, lint | **Bajo–Medio** | 1 commit |

> **Regla de commits:** Un commit por fase (F1–F6). Mensaje sugerido: `fix(fase-N): <resumen>` — ver §8.

---

## 1. Verificación de comandos de validación

Scripts declarados en `package.json` (verificado 2026-06-16):

| Comando | ¿Existe? | Notas |
|---------|----------|-------|
| `bun run dev` | ✅ Sí | `next dev -p 3000` + `tee dev.log`. Requiere Bun en PATH. |
| `bun run build` | ✅ Sí | `next build` + copia `standalone`. **Roto hoy:** falta `output: 'standalone'` [ARQ-002]; usa `cp` Unix [ARQ-020]. |
| `bun run lint` | ✅ Sí | `eslint .` |
| `bun run typecheck` | ✅ Sí | `"typecheck": "tsc --noEmit"` — añadido 2026-06-17 [QA-019] |
| `bun run start` | ✅ Sí | Producción vía `.next/standalone/server.js` |
| `bun run db:*` | ✅ Sí | `db:push`, `db:generate`, `db:migrate`, `db:reset`, `db:seed` |

**Comandos manuales recomendados para baseline y regresión:**

```bash
# Typecheck (hasta que exista script)
bunx tsc --noEmit

# Lint
bun run lint

# Build producción
bun run build

# Dev local
bun run dev
```

**Validación visual (manual, obligatoria tras cada fase con UI):**

- Desktop ≥1280px
- Tablet 768px
- Mobile 390px (iPhone 14)
- Mobile 360px (Android compacto)

**Herramientas opcionales (no en repo):** Lighthouse mobile, React DevTools, Network throttling 4G.

> ⚠️ **Entorno local:** Bun no estaba en PATH en la sesión de planificación. Verificar instalación antes de F1.

---

## 2. Baseline visual y técnico (F0 — ejecutar antes de F1)

### 2.1 Checklist visual base

Capturar screenshots o video corto en **cada viewport** antes de cualquier cambio. Comparar pixel-a-pixel tras cada fase.

#### Desktop (≥1280px)

- [ ] LoadingScreen GSAP completa (~1,8 s) y transición al hero
- [ ] Hero canvas scroll-driven: pin, scrub, logo y texto final
- [ ] Plasma WebGL visible en fondo (opacidad/blur glass)
- [ ] Marquee rojo `#E30613` entre hero y colección
- [ ] FeaturedProducts: hover quick-add, cards, badges NEW/BEST
- [ ] ProductGrid: filtros, sort, cards, animaciones scroll
- [ ] ProductDetail modal: galería, tallas, colores, carrito
- [ ] CartSidebar / WishlistSidebar apertura y totales
- [ ] Header sticky + FloatingNavBar + WhatsApp flotante
- [ ] Footer, Newsletter, CookieConsent (delay ~1,5 s)
- [ ] AuthModal login/registro

#### Tablet (768px)

- [ ] Header menú hamburguesa
- [ ] Hero pin journey (longitud scroll)
- [ ] Grid 2 columnas productos
- [ ] Modales centrados sin overflow horizontal
- [ ] CookieConsent no tapa CTAs críticos

#### Mobile 390px

- [ ] Safe-area: notch/home indicator vs nav flotante y WhatsApp
- [ ] Hero: tiempo hasta interactividad (nota: lento hoy — baseline)
- [ ] Quick-add en touch (hoy muchos solo hover — documentar estado actual)
- [ ] WishlistSection horizontal scroll
- [ ] SearchModal + teclado virtual
- [ ] ProductDetail galería swipe
- [ ] `100vh` jumps barra URL iOS (documentar si ocurre)

#### Mobile 360px

- [ ] Sin overflow horizontal en ninguna sección
- [ ] Marquee tipográfico no rompe layout
- [ ] Targets táctiles mínimos visibles (documentar los &lt;44px)
- [ ] Textos comerciales legibles sin truncado crítico

### 2.2 Baseline técnico (registrar valores)

| Métrica | Valor baseline | Cómo medir |
|---------|----------------|------------|
| `hero-banner-hd.mp4` | ~8,65 MB | `public/video/` |
| `public/` total | 16,25 MB / 74 archivos | filesystem |
| Build exitoso | ❌ Pendiente verificar | `bun run build` |
| Lint limpio | Pendiente | `bun run lint` |
| Typecheck | Pendiente | `bunx tsc --noEmit` |
| LCP mobile (4G) | Pendiente | Lighthouse |
| HTML inicial con productos | ❌ No (client-only) | View Source |

### 2.3 Hallazgos críticos verificados en código (muestra)

| ID | Verificación | Evidencia |
|----|--------------|-----------|
| ARQ-002 | ✅ | `next.config.ts` sin `output: 'standalone'` |
| BUG-013 | ✅ | `ProductDetail.tsx:87-104` — `setState` en render al cambiar producto |
| BUG-014 | ✅ | `ProductDetail.tsx:138-159` — `handleAddToCart` no consulta `outOfStock` |
| BUG-015 | ✅ | `ProductGrid.tsx:162-173` — quick-add usa `product.sizes[0]` sin stock |
| SEC-001 | ✅ | `auth-utils.ts:14` — `x-user-id` header |
| PERF-019 / MOB-020 | ✅ | MP4 8,65 MB; `ScrollVideoHero.tsx:24,105` `preload='auto'` |
| QA-019 | ✅ | `package.json` sin script `typecheck` |

Hallazgos **pendientes de verificación runtime** (marcar en implementación):

- PERF-001 / ANIM-001 — duración exacta extracción frames (requiere perf en dispositivo)
- MOB-030 — jank scroll cuantificado (requiere Performance panel)
- SEC-004 — rate limiting (no implementado; verificar tras F2)
- DATA-010 — comportamiento multi-instancia (requiere deploy)

---

## 3. Archivos críticos — NO tocar sin necesidad

Estos archivos definen identidad visual, animaciones signature y composición. Cambios solo **quirúrgicos** y con checklist §2.1.

### 3.1 Identidad visual y tokens (riesgo ALTO)

| Archivo | Motivo |
|---------|--------|
| `src/app/globals.css` | Tokens N10K (`--color-n10k-red`, glass, frost, marquees). ~2448 LOC. |
| `src/app/layout.tsx` | Montserrat 5 pesos, metadata, LoadingScreen en root |
| `public/brand/*` | Logos, mascota, fondos de marca |
| Secciones con `#E30613` hardcoded | Marquees, CTAs, acentos — **no cambiar hex** |

### 3.2 Hero y animaciones signature (riesgo ALTO)

| Archivo | Motivo |
|---------|--------|
| `src/components/n10k/ScrollVideoHero.tsx` | Hero canvas + scroll pin — corazón visual |
| `src/components/n10k/Plasma.tsx` + `Plasma.css` | WebGL background |
| `src/components/n10k/LoadingScreen.tsx` | Primera impresión GSAP |
| `src/components/n10k/TextAnimations.tsx` | SplitText, Marquee, BlurIn |
| `src/lib/gsap-init.ts` | Registro GSAP global |
| `public/video/hero-banner-hd.mp4` | Asset hero — optimizar peso, no reemplazar look |

### 3.3 Composición de página (riesgo MEDIO–ALTO)

| Archivo | Motivo |
|---------|--------|
| `src/app/page.tsx` | Orden y composición de todas las secciones |
| `src/components/n10k/InteractiveBackground.tsx` | Capa blur interactiva |
| `src/components/n10k/Header.tsx` | Nav principal + glass |
| `src/components/n10k/FloatingNavBar.tsx` | Nav inferior flotante |
| `src/components/n10k/FeaturedProducts.tsx` | Banner destacados |
| `src/components/n10k/NewsletterSection.tsx` | Marquees + formulario |
| `src/components/n10k/Footer.tsx` | Cierre visual |

### 3.4 Seguros para cambios funcionales (riesgo BAJO si se respeta UI)

| Archivo | Tipo de cambio permitido |
|---------|--------------------------|
| `src/lib/auth-store.ts`, `src/lib/auth-utils.ts` | Lógica auth sin tocar modales visualmente |
| `src/lib/store.ts` | Validación stock, carrito |
| `src/app/api/**` | Endpoints, Zod, rate limit |
| `prisma/schema.prisma` | Schema (con migración) |
| `next.config.ts`, `Caddyfile` | Config infra |
| `scripts/*.mjs` | Ops (restringir los peligrosos) |

### 3.5 Excluidos de refactor en este plan

- **No** split masivo de `ProductGrid.tsx` / `ProductDetail.tsx` hasta F5
- **No** eliminar shadcn/ui scaffold en bloque
- **No** migrar colores hardcoded a tokens en F1–F3 (QA-007 → F6)

---

## 4. Hallazgos por prioridad y riesgo visual

### 4.1 🔴 Críticos (17) — F1 + F2 + inicio F3

| Grupo | IDs | Riesgo visual | Fase |
|-------|-----|---------------|------|
| Build / deploy | ARQ-002, ARQ-020 | **Bajo** | F1 |
| Integridad venta | BUG-013, BUG-014, BUG-015, BUG-031 | **Bajo** (UI igual; botones deshabilitados) | F1 |
| Auth / sesión | SEC-001, SEC-002, SEC-003, SEC-011, SEC-012, SEC-013, ARQ-010, BUG-001 | **Bajo–Medio** (flujo login puede cambiar sutilmente) | F2 |
| Hero / perf | PERF-001, PERF-019, MOB-020, MOB-030, ANIM-001 | **Medio–Alto** (timing/carga; mismo look objetivo) | F3 |
| Datos prod | DATA-010 | **Bajo** | F4 |

### 4.2 🟠 Altos (70) — F2, F3, F4, F5

| Grupo | IDs (representativos) | Riesgo visual | Fase |
|-------|----------------------|---------------|------|
| API / seguridad | SEC-004–006, SEC-014–019, SEC-026, ARQ-007, ARQ-017, ARQ-026 | **Bajo** | F2 |
| Mobile touch | MOB-001, MOB-009, MOB-010, MOB-011, MOB-014, MOB-018–019 | **Medio** (nuevos affordances táctiles) | F3 |
| Rendimiento | PERF-002, PERF-003, PERF-010, PERF-011, PERF-013, PERF-017 | **Bajo–Medio** | F3–F5 |
| E-commerce lógica | BUG-002–004, BUG-016–018, DATA-001, DATA-011, DATA-017–018 | **Bajo** | F1–F4 |
| SEO alto impacto | SEO-001–004, SEO-011, SEO-013 | **Medio** (URLs/meta; HTML inicial) | F5–F6 |
| a11y alto | A11Y-001, A11Y-002, A11Y-008, A11Y-018, A11Y-019, A11Y-022 | **Bajo–Medio** (semántica; sin cambio cromático) | F6 |
| Animaciones | ANIM-002, ANIM-003, ANIM-010, ANIM-013 | **Medio–Alto** | F3–F5 |

### 4.3 🟡 Medios (154) — F3–F6 según grupo

Distribuidos en todos los prefijos. Priorizar los que bloquean mobile (MOB-003, MOB-012–013, MOB-033, MOB-038) y datos (DATA-014–029) en F3–F4.

### 4.4 🔵 Bajos + ⚪ Informativos (52) — F6 / backlog

Limpieza, DRY, docs, dependencias informativas. Riesgo visual **bajo** salvo QA-007 (theming — posponer).

---

## 5. Plan de fases detallado

### F0 — Baseline (pre-requisito)

**Estado (2026-06-16):** Parcialmente completado.

| Acción | Estado |
|--------|--------|
| Carpeta `docs/baseline/` + informes | ✅ |
| Baseline técnico estático (assets, LOC, código) | ✅ [BASELINE-TECNICO-2026-06-16.md](./baseline/BASELINE-TECNICO-2026-06-16.md) |
| Checklist visual 4 viewports | ✅ plantilla [CHECKLIST-VISUAL-2026-06-16.md](./baseline/CHECKLIST-VISUAL-2026-06-16.md) |
| Guía captura manual | ✅ [CAPTURA-MANUAL.md](./baseline/CAPTURA-MANUAL.md) |
| Screenshots / Lighthouse | ⏳ Pendiente (`bun install` + `bun run dev`) |
| lint / tsc / build | ⏳ Pendiente — sin Node/Bun en PATH |

**Acciones restantes:**
1. `bun install && bun run dev`
2. Capturas según [CAPTURA-MANUAL.md](./baseline/CAPTURA-MANUAL.md)
3. `bun run lint`, `bunx tsc --noEmit`, `bun run build` — anotar en BASELINE-TECNICO §9
4. Firmar checklist visual

**Entregable:** Informe baseline firmado por QA antes de F1.

---

### F1 — Bloqueadores producción e integridad e-commerce

**Estado (2026-06-16):** ✅ Implementado

**Riesgo visual global: BAJO** — sin cambios de layout, colores ni composición.

| # | Hallazgos | Cambio |
|---|-----------|--------|
| 1 | ARQ-002 | `output: 'standalone'` en `next.config.ts` |
| 2 | ARQ-020 | `scripts/copy-standalone.mjs` + build/start cross-platform |
| 3 | BUG-013 | Reset estado en `useEffect` (`ProductDetail.tsx`) |
| 4 | BUG-014, BUG-015, BUG-019 | Guards stock + `getFirstAvailableSize` en Detail/Grid/Featured/Wishlist |
| 5 | BUG-031 | Guard `ALLOW_ENABLE_ALL_SIZES` + bloqueo prod en script |
| 6 | BUG-016 | `useToast` — deps `[]` en listener effect |
| 7 | BUG-017, ANIM-010 | `ScrollTrigger.kill()` en cleanup (3 cards ProductGrid) |
| 8 | QA-011 | `src/app/error.tsx`, `src/app/not-found.tsx` |

**Validación pendiente en tu máquina:**
```powershell
bun install
bun run lint
bunx tsc --noEmit
bun run build
bun run start
```

**Commit sugerido:** `fix(fase-1): build standalone, stock guards y crash ProductDetail`

---

### F2 — Seguridad mínima viable

**Riesgo visual global: BAJO–MEDIO**

| # | Hallazgos | Acción conservadora |
|---|-----------|-------------------|
| 1 | SEC-001–003, SEC-011–015, ARQ-010, BUG-001–003 | Sesión HTTP-only (NextAuth o JWT cookie); eliminar mock plaintext |
| 2 | SEC-004, SEC-005, ARQ-026 | Rate limit auth y mutaciones |
| 3 | SEC-018, DATA-024 | Sanitizar POST `/api/reviews` |
| 4 | SEC-026, ARQ-007 | Restringir `XTransformPort` en Caddyfile; headers básicos |
| 5 | SEC-006, SEC-023–025, ARQ-017 | CSP gradual (report-only primero si hay duda visual) |
| 6 | ARQ-011, SEC-014 | Implementar `checkSession()` real vía `/api/auth/me` |

**Validación F2:** Tests manuales auth + intento XSS en review + `curl` rate limit

**Commit:** `fix(fase-2): auth server-side, rate limit y sanitización reviews`

---

### F3 — Quick wins mobile y rendimiento (sin reescribir hero)

**Estado (2026-06-16):** ✅ Implementado (parcial — ver §13)

**Riesgo visual global: MEDIO**

| # | Hallazgos | Acción conservadora | Impacto visual |
|---|-----------|---------------------|----------------|
| 1 | PERF-019, MOB-020, MOB-023, BUG-004 | Variante MP4 mobile + `saveData` → poster estático **mismo frame** | Carga más rápida; look igual al completar |
| 2 | MOB-001, MOB-029 | `env(safe-area-inset-*)` padding en nav/WhatsApp | Pequeño ajuste márgenes |
| 3 | MOB-009 | `min-h-dvh` donde hoy `min-h-screen` | Menos jump iOS |
| 4 | MOB-010, MOB-011, MOB-003, MOB-038 | Botón quick-add visible en touch (sin quitar hover desktop) | **Nuevo control táctil** — validar que no rompe card |
| 5 | PERF-011, QA-005 | `dynamic()` modales/sidebars below-fold | Ninguno si loading=null |
| 6 | MOB-033, ANIM-004 | `prefers-reduced-motion` en LoadingScreen/GSAP | Skip anim en accesibilidad |
| 7 | MOB-032 | Reducir blur solo en `@media (max-width: 767px)` | Glass ligeramente menos intenso en mobile |
| 8 | PERF-004, MOB-025 | Reducir pesos Montserrat (mantener 700+900) | Tipografía casi imperceptible |
| 9 | MOB-018, PERF-005 | `sizes` + `next/image` en cards (mismas dimensiones CSS) | Misma composición |

**⚠️ Posponer a F5 (riesgo ALTO visual):**
- MOB-002, MOB-030, ANIM-003 — replantear hero pin / scroll journey
- PERF-001 completo — pre-bake sprite sheet

**Validación F3:** Lighthouse mobile 4G + checklist §2.1 mobile 390/360

**Commit:** `fix(fase-3): mobile perf, safe-area, touch quick-add y hero optimizado`

---

### F4 — Datos e infraestructura

**Riesgo visual global: BAJO**

| # | Hallazgos | Acción |
|---|-----------|--------|
| 1 | DATA-010, DATA-011 | PostgreSQL + migraciones Prisma |
| 2 | DATA-001 | Precios en centavos (interno; UI sigue `$X.XX`) |
| 3 | DATA-017, DATA-018 | Transacciones order+stock; alinear IDs static/DB |
| 4 | DATA-029, QA-021 | Documentar scripts; paths portables |
| 5 | PERF-017, DATA-014 | Cache headers + paginación API (sin cambiar grid visual) |

**Commit:** `fix(fase-4): postgres, migraciones y consistencia datos`

---

### F5 — Refactors estructurales (congelar look)

**Riesgo visual global: MEDIO–ALTO**

| # | Hallazgos | Acción | Precaución |
|---|-----------|--------|------------|
| 1 | ARQ-001, ARQ-027, SEO-003, SEO-004 | RSC catálogo + rutas `/p/[slug]` | Misma UI; URLs nuevas — redirects |
| 2 | MOB-030, ANIM-003, PERF-001 | Hero: desactivar pin solo mobile **o** sprite pre-baked | Requiere A/B visual vs baseline |
| 3 | QA-002, QA-003, PERF-008 | Split interno ProductGrid/Detail (sin cambiar JSX output) | Solo estructura archivos |
| 4 | ARQ-014 | Sincronizar cart/wishlist Prisma ↔ Zustand | Sin cambio UI |
| 5 | ARQ-003, DEP-007, QUAL-009 | Prune deps muertas | Verificar build |

**Commit:** `fix(fase-5): RSC catálogo, rutas producto y hero mobile`

---

### F6 — a11y, SEO, calidad y DX

**Estado (2026-06-16):** ✅ Implementado (a11y/SEO — ver §14)

**Riesgo visual global: BAJO–MEDIO**

| # | Hallazgos | Acción |
|---|-----------|--------|
| 1 | A11Y-001, A11Y-027 | `<h1>` visualmente oculto o semántico sin cambiar tamaños |
| 2 | A11Y-002, A11Y-008, A11Y-025, MOB-014, MOB-015 | Focus trap modales (sin cambiar estilos) |
| 3 | SEO-001, SEO-002, SEO-005, SEO-012 | sitemap, OG image, metadataBase, JSON-LD |
| 4 | QA-019, QUAL-003, DEP-013 | Script typecheck; reactivar reglas ESLint críticas |
| 5 | QUAL-002 | Smoke tests auth/cart/API |
| 6 | QA-001, QA-022 | Eliminar legacy huérfano |
| 7 | MOB-012, A11Y-004 | Targets ≥44px (padding invisible) |

**Commit:** `fix(fase-6): a11y, SEO, typecheck y smoke tests`

---

## 6. Cambios con riesgo de afectar visualmente la página

| Cambio | Fase | Riesgo | Mitigación |
|--------|------|--------|------------|
| Optimización / variante hero MP4 | F3 | Medio | Mismo poster/frame; comparar video lado a lado |
| Reducir `backdrop-blur` en mobile | F3 | Medio | Solo `@media mobile`; A/B vs baseline |
| Quick-add visible en touch | F3 | Medio | Mantener hover desktop; icono mismo estilo |
| Safe-area padding nav/WhatsApp | F3 | Bajo | Solo insets; no mover posición relativa |
| `min-h-dvh` vs `100vh` | F3 | Bajo | Verificar hero fullscreen |
| Desactivar hero pin en mobile | F5 | **Alto** | Solo si perf confirma; feature flag |
| Pre-baked sprite / skip canvas | F5 | **Alto** | Debe replicar frames exactos |
| Rutas `/p/[slug]` + SEO | F5 | Medio | UI igual; cambian URLs compartidas |
| Reducir pesos Montserrat | F3 | Bajo | Mantener bold/black visibles |
| Focus rings a11y | F6 | Bajo | Usar `focus-visible` discreto |
| CSP estricta | F2 | Bajo | Inline styles actuales — probar report-only |
| `<h1>` semántico | F6 | Bajo | Clase existente o sr-only |

**Cambios que NO deben alterar visual:** auth backend, stock guards, build config, PostgreSQL, rate limit, sanitización API, typecheck, tests.

---

## 7. Matriz impacto vs esfuerzo (priorizar)

```
                    ESFUERZO
                 S          M          L
              ┌──────────┬──────────┬──────────┐
    ALTO      │ F1:      │ F3:      │ F5:      │
 IMPACTO      │ BUG-014  │ PERF-019 │ ARQ-001  │
              │ ARQ-002  │ MOB-010  │ SEO-004  │
              │ BUG-013  │ SEC-004  │ DATA-010 │
              │ BUG-017  │ PERF-011 │ MOB-030  │
              ├──────────┼──────────┼──────────┤
    MEDIO     │ MOB-001  │ F2:      │ QA-002   │
              │ SEO-002  │ SEC-018  │ QA-003   │
              ├──────────┼──────────┼──────────┤
    BAJO      │ QA-022   │ QUAL-003 │ ARQ-024  │
              └──────────┴──────────┴──────────┘
```

**Cuadrante prioritario:** F1 ítems 1–5 + F3 ítems 1–6 (alto impacto, esfuerzo S/M, riesgo visual controlado).

---

## 8. Regla de commits

| Regla | Detalle |
|-------|---------|
| Granularidad | **Un commit por fase** (F1–F6) |
| Formato | Conventional Commits: `fix(fase-N): descripción breve` |
| Pre-commit | `bun run lint` + `bunx tsc --noEmit` + checklist visual §2.1 |
| No incluir | Cambios de fases mezcladas; refactors oportunistas |
| Tag opcional | `baseline-pre-fase-N` antes de cada fase |

Ejemplos:
```
fix(fase-1): build standalone, stock guards y crash ProductDetail
fix(fase-3): mobile perf, safe-area, touch quick-add y hero optimizado
```

---

## 9. Definition of Done por fase

- [ ] Todos los hallazgos de la fase implementados o documentados como *won't fix* con motivo
- [ ] `bun run lint` sin errores nuevos
- [ ] `bunx tsc --noEmit` sin errores nuevos
- [ ] `bun run build` exitoso (desde F1)
- [ ] Checklist visual §2.1 en 4 viewports — **sin regresión vs baseline F0**
- [ ] Un commit único por fase
- [ ] Entrada en changelog interno (opcional)

---

## 10. Referencias

- Auditoría completa: [AUDITORIA-TECNICA.md](./AUDITORIA-TECNICA.md) — §13 Roadmap original
- Config: `next.config.ts`, `tsconfig.json`, `Caddyfile`, `package.json`
- Entry points: `src/app/page.tsx`, `src/app/layout.tsx`
- Componentes: `src/components/n10k/*`
- Estado: `src/lib/*`, `src/hooks/*`
- Datos: `prisma/schema.prisma`

---

*Documento generado en fase de planificación. Actualizado tras ejecución F2 (seguridad) y F1 runtime (2026-06-16).*

---

## 12. Ejecución F1 — Runtime, React, e-commerce (2026-06-16)

### 12.1 IDs abordados en esta fase

| ID | Estado | Notas |
|----|--------|-------|
| **ARQ-002** | ✅ Ya corregido (pre-F1) | `output: 'standalone'` en `next.config.ts` |
| **BUG-013** | ✅ Ya corregido (pre-F1) | Reset de estado en `useEffect` keyed por `selectedProduct?.id` |
| **BUG-014** | ✅ Corregido | Guard OOS en handler + botón `disabled` vía `isAddToCartDisabled` |
| **BUG-015** | ✅ Ya corregido (pre-F1) | `getFirstAvailableSize` en ProductGrid, WishlistSection, FeaturedProducts |
| **BUG-016** | ✅ Ya corregido (pre-F1) | `useToast` deps `[]` |
| **BUG-017** | ✅ Ya corregido (pre-F1) | `ScrollTrigger.kill()` en cleanup de cards |
| **BUG-018** | ✅ Corregido | Flag `alive` en extracción async de `ScrollVideoHero` |
| **BUG-019** | ✅ Ya corregido (pre-F1) | `colors[0]?.name` optional chaining |
| **BUG-020** | ✅ Corregido | `Array.isArray` en `fetchProducts` |
| **BUG-022** | ✅ Corregido | `parseStoredStringArray` / `parseStoredNotificationEntries` |
| **BUG-023** | ⚠️ Parcial | Tope `MAX_CART_QUANTITY=99` + guard OOS en `addItem`; sin inventario numérico |
| **BUG-025** | ✅ Corregido | Navegación teclado condicionada a query activa |
| **BUG-026** | ✅ Corregido | `slug` en `transformProduct` |
| **BUG-027** | ✅ Corregido | Guard `mounted` en menú móvil cuenta |
| **BUG-028** | ✅ Corregido | Partículas generadas post-mount en `useEffect` |
| **BUG-029** | ⚠️ Parcial | Validación email básica; backend real pendiente |
| **BUG-030** | ✅ Corregido | Login/register exigen `data.user.id` |
| **BUG-031** | ✅ Ya corregido (pre-F1) | Script requiere `ALLOW_ENABLE_ALL_SIZES=true` + bloqueo prod |
| **BUG-008** | ✅ Corregido | `getProductShareUrl` + deep link `/?product=` en `page.tsx` |

### 12.2 IDs verificados — sin cambio necesario o pendientes

| ID | Estado | Motivo |
|----|--------|--------|
| **BUG-001–003** | ✅ F2 | Auth mock eliminado en fase seguridad |
| **BUG-004–005** | ⏳ Pendiente | Fallback hero frames — F3 |
| **BUG-006–007** | ⏳ Pendiente | APIs no consumidas — fuera alcance runtime |
| **BUG-009–012** | ⏳ Pendiente | GSAP/text/fetchGuard — baja prioridad |
| **BUG-021** | ⏳ Pendiente | Refetch catálogo con TTL — riesgo medio |
| **BUG-024** | ⏳ Pendiente | Centavos enteros — F4 datos |

### 12.3 Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/lib/product-utils.ts` | Helpers stock, slug, share URL, parse JSON seguro |
| `src/lib/store.ts` | Validación array API, guard OOS, tope cantidad carrito |
| `src/components/n10k/ProductDetail.tsx` | Share URL, OOS disabled, JSON/email defensivo |
| `src/components/n10k/SearchModal.tsx` | JSON seguro, teclado sin resultados |
| `src/components/n10k/Header.tsx` | Hydration-safe menú móvil cuenta |
| `src/components/n10k/ScrollVideoHero.tsx` | Cancelación async, partículas post-mount |
| `src/app/page.tsx` | Deep link `?product=` |
| `src/lib/auth-store.ts` | Validación `user.id` en login/register |
| `src/hooks/use-long-press-video.ts` | Cleanup timer en unmount |

### 12.4 Riesgo visual global F1

**Bajo** — Sin cambios CSS/Tailwind. Botones agotados ya deshabilitados visualmente (mismo estilo). Partículas hero aparecen ~1 frame después del mount (imperceptible).

### 12.5 Validaciones ejecutadas

| Comando | Resultado |
|---------|-----------|
| `git status` | ❌ `git` no disponible en PATH |
| `bun run lint` | ❌ Bun/Node no en PATH; `node_modules` ausente |
| `bunx tsc --noEmit` | ❌ No ejecutado — mismo motivo |
| `bun run build` | ❌ No ejecutado — mismo motivo |
| ReadLints (IDE) | ✅ Sin errores en archivos editados |
| Prueba manual navegador | ❌ No ejecutada — servidor dev no levantado |

### 12.6 Bugs no reproducidos en inspección de código

- **BUG-016** — deps ya eran `[]` antes de esta sesión.
- **BUG-017** — cleanup ST ya presente en las 3 cards.
- **BUG-013/015/019** — correcciones previas verificadas en código actual.


---

## 11. Ejecución F2 — Seguridad mínima (2026-06-16)

### 11.1 IDs abordados en esta fase

| ID | Estado | Notas |
|----|--------|-------|
| **SEC-001** | ✅ Corregido | `x-user-id` eliminado; sesión verificada vía cookie HMAC firmada (`src/lib/session.ts`) |
| **SEC-002** | ✅ Corregido | Login/register emiten cookie `httpOnly` `n10k_session` |
| **SEC-003** | ✅ Corregido | Mock `n10k-mock-users` y contraseñas plaintext eliminados de `AuthModal.tsx` |
| **SEC-004** | ✅ Corregido | Rate limit auth: login 10/15min, register 5/h |
| **SEC-005** | ✅ Corregido | Rate limit mutaciones: reviews 5/15min, newsletter 5/h |
| **SEC-006** | ⚠️ Parcial | Headers básicos en Next + Caddy; **CSP no aplicada** (riesgo visual/scripts inline) |
| **SEC-009** | ✅ Corregido | `role` ya no se expone al cliente (`toPublicUser`) |
| **SEC-011** | ⏳ Pendiente | `next-auth` sigue en deps sin integrar; sesión propia es fuente de verdad |
| **SEC-012** | ✅ Corregido | Token firmado server-side (HMAC-SHA256), no JWT estándar pero verificable |
| **SEC-013** | ✅ Corregido | Bypass mock localStorage eliminado; API es única vía de login/register |
| **SEC-014** | ✅ Corregido | `checkSession()` consulta `GET /api/auth/me` con cookie |
| **SEC-015** | ✅ Corregido | Sesión fuera de `localStorage`; Zustand auth sin `persist` |
| **SEC-016** | ✅ Corregido | Schemas Zod en auth, reviews, newsletter |
| **SEC-017** | ✅ Corregido | Límite `name`/`phone` en PUT perfil (100/30 chars) |
| **SEC-018** | ✅ Corregido | `sanitizeText()` en reviews POST |
| **SEC-019** | ⚠️ Parcial | Reseñas siguen anónimas; sanitización reduce suplantación XSS |
| **SEC-020** | ✅ Corregido | Login usa `select` explícito; password no retornado |
| **SEC-021** | ✅ Corregido | `parseJsonBody()` límite 16 KB |
| **SEC-023** | ✅ Corregido | HSTS en Next (prod) y Caddy |
| **SEC-024** | ✅ Corregido | `Permissions-Policy` en Next y Caddy |
| **SEC-025** | ⏳ Pendiente | CSP estricta — pospuesta (GSAP/inline styles) |
| **SEC-026** | ✅ Corregido | Caddy `XTransformPort` restringido a puerto 3000 |
| **SEC-029** | ⚠️ Parcial | Requiere `AUTH_SECRET` en producción; fallback solo dev |
| **ARQ-010** | ⚠️ Parcial | Unificado flujo cookie+API; NextAuth sin usar |
| **ARQ-011** | ✅ Corregido | `checkSession()` implementado |
| **ARQ-017** | ⚠️ Parcial | Headers ampliados; sin CSP |
| **ARQ-026** | ⏳ Pendiente | Sin `middleware.ts` global; rate limit por ruta |
| **ARQ-007** | ✅ Corregido | Headers seguridad en Caddyfile |
| **BUG-001** | ✅ Corregido | Mock plaintext eliminado |
| **BUG-002** | ✅ Corregido | Register usa solo API (sin fire-and-forget mock) |
| **BUG-003** | ✅ Corregido | `updateProfile` persiste vía PUT `/api/auth/me` |
| **DATA-022** | ✅ Corregido | Email newsletter normalizado a lowercase |
| **DATA-023** | ✅ Corregido | Email register normalizado a lowercase |
| **DATA-024** | ✅ Corregido | Reviews: rate limit, sanitización, límites longitud |

### 11.2 Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/lib/session.ts` | **Nuevo** — cookie firmada httpOnly |
| `src/lib/rate-limit.ts` | **Nuevo** — rate limit in-memory por IP |
| `src/lib/validation.ts` | **Nuevo** — Zod, sanitize, body limit, `toPublicUser` |
| `src/lib/auth-utils.ts` | Sesión cookie; sin `x-user-id`; select sin campos sensibles |
| `src/lib/auth-store.ts` | Sin persist localStorage; `credentials: include`; checkSession/logout/updateProfile reales |
| `src/app/api/auth/login/route.ts` | Cookie sesión, Zod, rate limit, select password |
| `src/app/api/auth/register/route.ts` | Cookie sesión, Zod, rate limit, email normalizado |
| `src/app/api/auth/me/route.ts` | Zod PUT, body limit, sin role |
| `src/app/api/auth/logout/route.ts` | **Nuevo** — limpia cookie |
| `src/app/api/reviews/route.ts` | Zod, sanitize, rate limit, paginación take 50 |
| `src/app/api/newsletter/route.ts` | Zod, rate limit, email normalizado |
| `src/components/n10k/AuthModal.tsx` | Eliminado mock auth; perfil async |
| `next.config.ts` | HSTS (prod), Permissions-Policy |
| `Caddyfile` | Headers seguridad; SSRF port restrict |

### 11.3 Riesgo de regresión

| Área | Riesgo | Mitigación |
|------|--------|------------|
| Login/register | **Medio** | Usuarios mock previos en `localStorage` ya no funcionan — deben registrarse en API |
| Sesión persistente | **Bajo** | Cookie 7 días; recarga valida con `/api/auth/me` |
| UI / layout | **Bajo** | Sin cambios CSS/JSX visual; solo lógica auth |
| Deploy prod | **Medio** | **Obligatorio** definir `AUTH_SECRET` en entorno |

### 11.4 Validaciones ejecutadas

| Comando | Resultado |
|---------|-----------|
| `git status` | ❌ `git` no disponible en PATH del entorno |
| `bun run lint` | ❌ No ejecutado — Bun/Node no encontrados en PATH; `node_modules` ausente |
| `bunx tsc --noEmit` | ❌ No ejecutado — mismo motivo |
| `bun run build` | ❌ No ejecutado — mismo motivo |
| Login/register/logout manual | ❌ No ejecutado — servidor dev no levantado en sesión |
| Home visual | ✅ Sin cambios de layout/estilos en archivos tocados |
| ReadLints (IDE) | ✅ Sin errores en archivos editados |

### 11.5 Pendientes post-F2

1. **SEC-011 / NextAuth** — evaluar remover dep o migrar si se necesita OAuth.
2. **SEC-025 / CSP** — implementar report-only y endurecer gradualmente.
3. **SEC-022 / CSRF** — tokens CSRF si se añaden cookies adicionales cross-site.
4. **ARQ-026 / middleware.ts** — rate limit y auth guard centralizados.
5. **SEC-019 / DATA-025** — reseñas autenticadas (vincular a sesión) en fase futura.
6. **Rate limit multi-instancia** — actual in-memory no escala; Redis en F4/deploy.
7. Configurar `AUTH_SECRET` en producción (`.env` / secrets manager).

### 11.6 Riesgo visual global F2

**Bajo** — No se modificaron colores, layout, tipografía ni componentes visuales. Cambios limitados a flujo auth (mensajes toast/error) y backend.

---

## 13. Ejecución F3 — Mobile performance & assets (2026-06-16)

> **Prompt:** Performance Engineer mobile — quick wins sin alterar look desktop.

### 13.1 IDs PERF/MOB/ANIM corregidos

| ID | Estado | Cambio | Riesgo visual |
|----|--------|--------|---------------|
| **PERF-001** | ⚠️ Parcial | Mobile: 8 fps + extracción max 960px + batch setState; saveData/reduced-motion: skip extracción | Bajo–Medio |
| **PERF-002** | ⚠️ Parcial | Pausa RAF hero/Plasma/background en tab oculta + IO | Bajo |
| **PERF-006** | ✅ | `InteractiveBackground`: `loading="lazy"`, `fetchPriority="low"` | Bajo |
| **PERF-007** | ✅ | `ScrollProgress`: DOM directo + rAF throttle (sin setState/scroll) | Bajo |
| **PERF-011** | ✅ | `dynamic()` + mount condicional modales/sidebars | Bajo |
| **PERF-012** | ✅ | `DeferredSection` + dynamic below-the-fold | Bajo |
| **PERF-013** | ⚠️ Parcial | `loading="lazy"` + `sizes` en cards Featured/Grid (sigue `<img>`) | Bajo |
| **PERF-018** | ✅ | Eliminado `priority` del logo Header (solo LoadingScreen) | Bajo |
| **PERF-019** | ⏳ Propuesta | Variante MP4 mobile — requiere asset nuevo | — |
| **MOB-018** | ⚠️ Parcial | `sizes` en hero overlay + cards; pendiente `next/image` catálogo | Bajo |
| **MOB-019** | ⚠️ Parcial | lazy/decoding/sizes en `<img>` catálogo | Bajo |
| **MOB-001** | ⏳ Pendiente | Safe-area no implementado en `src/` (verificado QA 2026-06-17) | — |
| **MOB-009** | ⏳ Pendiente | `min-h-dvh` no implementado | — |
| **MOB-029** | ⏳ Pendiente | Sin `viewportFit: cover` en layout | — |
| **MOB-010/011** | ✅ | Overlay/info cards siempre visibles en touch (`globals.css` `@media (hover: none)`) | Bajo |
| **MOB-020** | ⚠️ Parcial | `preload=metadata` mobile; saveData skip descarga | Medio (solo reduced) |
| **MOB-022** | ✅ | Vídeos producto `preload="none"` | Bajo |
| **MOB-023** | ✅ | `prefers-reduced-data` + `navigator.connection.saveData` → hero estático | Bajo (degradado) |
| **MOB-024** | ⚠️ Parcial | Plasma desactivado en mobile (CSS gradients mantienen look) | Medio mobile |
| **MOB-026** | ✅ | Un solo `priority` competidor (LoadingScreen) | Bajo |
| **MOB-027** | ✅ | Background lazy + parallax off mobile | Bajo |
| **MOB-028** | ✅ | Canvas hero DPR cap 1.5 mobile | Bajo |
| **MOB-030** | ⏳ Propuesta | Pin+scrub sin cambios — ver §13.3 | — |
| **MOB-033** | ✅ | LoadingScreen skip GSAP con `prefers-reduced-motion` | Bajo |
| **ANIM-001** | ⚠️ Parcial | Mismas optimizaciones que PERF-001 | Medio |
| **ANIM-004** | ⚠️ Parcial | reduced-motion: LoadingScreen, Marquee, BackToTop scroll | Bajo |
| **ANIM-009** | ✅ | Logo hero: ref en wrapper (no en `next/image`) | Bajo |
| **ANIM-012** | ✅ | Plasma pausa en `document.hidden` | Bajo |
| **ANIM-013** | ⚠️ Parcial | Batch progress + resolución mobile; sin `rvfc` | Bajo |
| **ANIM-015** | ✅ | Glow background usa `transform` (no `left`/`top`) | Bajo |
| **ANIM-016** | ✅ | Marquee GSAP skip con reduced-motion | Bajo |
| **ANIM-018** | ⚠️ Parcial | rAF throttle ScrollProgress, BackToTop, Header | Bajo |

### 13.2 Archivos nuevos / modificados

| Archivo | Cambio |
|---------|--------|
| `src/lib/performance-prefs.ts` | **Nuevo** — prefs runtime (mobile, reduced-motion/data) |
| `src/hooks/use-performance-prefs.ts` | **Nuevo** — hook SSR-safe |
| `src/hooks/use-scroll-raf.ts` | **Nuevo** — scroll/resize throttled vía rAF |
| `src/components/n10k/DeferredSection.tsx` | **Nuevo** — mount diferido near-viewport |
| `src/app/page.tsx` | dynamic imports, modales lazy, Plasma condicional |
| `src/components/n10k/ScrollVideoHero.tsx` | Degradación progresiva hero, DPR, visibility |
| `src/components/n10k/Plasma.tsx` | Pausa tab oculta |
| `src/components/n10k/InteractiveBackground.tsx` | lazy img, transform glow, parallax off mobile |
| `src/components/n10k/LoadingScreen.tsx` | reduced-motion fast path |
| `src/components/n10k/ScrollProgress.tsx` | Sin re-render React en scroll |
| `src/components/n10k/BackToTop.tsx` | rAF scroll + reduced-motion scrollTo |
| `src/components/n10k/Header.tsx` | rAF scroll; sin priority logo |
| `src/components/n10k/ProductGrid.tsx` | lazy/sizes imgs; video preload none |
| `src/components/n10k/FeaturedProducts.tsx` | lazy/sizes imgs |
| `src/components/n10k/TextAnimations.tsx` | Marquee skip reduced-motion |

### 13.3 Cambios pospuestos (riesgo visual alto / requiere assets)

| ID | Propuesta | Motivo |
|----|-----------|--------|
| **MOB-002**, **MOB-030**, **ANIM-003** | Acortar o desactivar hero pin solo mobile | Altera scroll journey signature |
| **PERF-001** completo | Pre-bake sprite sheet / secuencia WebP | Requiere pipeline assets + QA frame-a-frame |
| **PERF-019**, **MOB-020** | `hero-banner-mobile.mp4` (~1–2 MB) | Asset no presente en repo |
| **PERF-005**, **MOB-019** | Migrar catálogo a `next/image` + srcset | Riesgo layout/quality sin QA visual |
| **PERF-004**, **MOB-025** | Reducir pesos Montserrat 5→3 | Tipografía sutil pero perceptible |
| **MOB-032** | Reducir `backdrop-blur` mobile | Glass UI menos intenso |
| **PERF-003**, **PERF-008** | Split CSS / ProductGrid | Refactor estructural F5 |
| **PERF-010** | Dynamic import GSAP en TextAnimations | Riesgo flash animaciones |

### 13.4 Impacto esperado mobile (estimado)

| Métrica | Antes (baseline audit) | Después (estimado) |
|---------|------------------------|-------------------|
| Bundle JS inicial | ~todo en chunk page | −15–25% parse (modales + secciones split) |
| Requests iniciales | Modales + 6 secciones eager | Modales 0 hasta interacción |
| Peso red hero (saveData) | 8,9 MB MP4 | 0 MB (hero estático) |
| Peso red hero (mobile 4G) | 8,9 MB + extracción | ~8,9 MB pero ~40% menos frames + resolución ↓ |
| TBT hero extracción | 3–8 s gama media | 1,5–4 s mobile; ~0 s saveData/reduced |
| LCP | Canvas negro + loading | Mejor en saveData; mobile similar hasta frames |
| Scroll jank (INP) | 6+ listeners setState | 3 listeners rAF-throttled |
| WebGL mobile | Plasma activo | Desactivado; gradientes CSS equivalentes |

### 13.5 Validaciones

| Comando | Resultado |
|---------|-----------|
| `git status` | ❌ `git` no en PATH |
| `bun run lint` | ❌ Bun/Node no en PATH; `node_modules` ausente |
| `bunx tsc --noEmit` | ❌ No ejecutado |
| `bun run build` | ❌ No ejecutado |
| ReadLints IDE | ✅ Sin errores en archivos editados |
| Lighthouse mobile | ⏳ Pendiente en máquina local |

**Commit sugerido:** `fix(fase-3): mobile perf — lazy modales, hero degradado y scroll rAF`

### 13.6 Riesgo visual global F3

| Contexto | Riesgo |
|----------|--------|
| Desktop potente | **Bajo** — animaciones hero/GSAP/Plasma intactas |
| Mobile normal | **Medio-bajo** — Plasma off (cubierto por overlays); extracción más rápida |
| saveData / reduced-motion | **Medio** — hero estático (mismo overlay final); sin marquees GSAP |

---

## 14. Ejecución F6 — Accesibilidad y SEO (2026-06-16)

> **Prompt:** Accessibility + SEO Engineer — correcciones semánticas sin alterar layout/estética.

### 14.1 IDs A11Y corregidos

| ID | Estado | Cambio | Riesgo visual |
|----|--------|--------|---------------|
| **A11Y-001** | ✅ | `<h1 class="sr-only">` en `page.tsx` | Bajo |
| **A11Y-002** | ✅ | `SearchModal`: `role="dialog"`, `aria-modal`, focus trap, label input | Bajo |
| **A11Y-003** | ✅ | Sort dropdown: `aria-expanded`, `listbox`/`option` | Bajo |
| **A11Y-004** | ✅ | Product cards: `role="button"`, teclado Enter/Space | Bajo |
| **A11Y-005** | ✅ | SplitText: `sr-only` + `aria-hidden` en chars animados | Bajo |
| **A11Y-008** | ✅ | Menú móvil: `aria-expanded`, `aria-controls`, focus trap, Escape | Bajo |
| **A11Y-009** | ✅ | Header carrito/favoritos: `aria-label` dinámico con contadores | Bajo |
| **A11Y-010** | ✅ | FloatingNavBar: `aria-current`, label carrito dinámico | Bajo |
| **A11Y-011** | ✅ | FeaturedProducts card: teclado + `aria-label` | Bajo |
| **A11Y-012** | ✅ | WishlistSection thumbnail: teclado | Bajo |
| **A11Y-013** | ✅ | SearchModal: `aria-label` / `id` en input | Bajo |
| **A11Y-014** | ✅ | Pills categoría: `aria-pressed` | Bajo |
| **A11Y-015** | ⚠️ Parcial | Swatches Featured: `aria-label`; ProductGrid ya tenía labels | Bajo |
| **A11Y-016** | ✅ | Tallas agotadas: `disabled`, `aria-disabled`, `aria-label` | Bajo |
| **A11Y-017** | ✅ | Share dropdown: `aria-expanded`, `aria-haspopup` | Bajo |
| **A11Y-018** | ⚠️ Parcial | Vídeos detalle: `aria-label`; sin controles visibles (pospuesto) | — |
| **A11Y-019** | ✅ | Canvas hero: `role="img"`, `aria-label` | Bajo |
| **A11Y-020** | ✅ | Marquee decorativo: `aria-hidden="true"` | Bajo |
| **A11Y-021** | ✅ | Testimonials: rating accesible `role="img"` | Bajo |
| **A11Y-022** | ✅ | AuthModal: `role="alert"`, `aria-invalid` en login | Bajo |
| **A11Y-023** | ✅ | AuthModal tabs: patrón `tablist`/`tab`/`tabpanel` | Bajo |
| **A11Y-024** | ✅ | QuickView: dialog semantics + focus trap | Bajo |
| **A11Y-025** | ✅ | Lightbox: focus trap + retorno foco | Bajo |
| **A11Y-026** | ✅ | CookieConsent: `role="region"` + label | Bajo |
| **A11Y-027** | ⚠️ Parcial | h1 añadido; h2/h3 sin reordenar (sin cambio visual) | Bajo |
| **A11Y-028** | ✅ | Nav móvil: `aria-label="Menú móvil"` | Bajo |
| **A11Y-029** | ✅ | Featured quick-add: toast de confirmación | Bajo |
| **A11Y-030** | ✅ | `scroll-behavior: auto` bajo `prefers-reduced-motion` | Bajo |
| **A11Y-031** | ✅ | LoadingScreen: `role="status"`, `aria-live`, texto sr-only | Bajo |
| **A11Y-032** | ✅ | Plasma: `aria-hidden="true"` | Bajo |
| **A11Y-034** | ✅ | Cantidad producto: `aria-live="polite"` | Bajo |

### 14.2 IDs A11Y pospuestos (riesgo visual o alcance)

| ID | Motivo |
|----|--------|
| **A11Y-006** | Scrollbar visible en wishlist strip — cambio visual |
| **A11Y-018** (completo) | Controles/captions de vídeo — requiere UI visible |
| **A11Y-033** | Contraste marquee decorativo — cambio cromático |

### 14.3 IDs SEO corregidos

| ID | Estado | Cambio | Riesgo visual |
|----|--------|--------|---------------|
| **SEO-001** | ✅ | `src/app/sitemap.ts` + `Sitemap:` en robots.txt | Bajo |
| **SEO-002** | ✅ | OG images/locale/url + Twitter card en `layout.tsx` | Bajo |
| **SEO-003** | ⚠️ Parcial | JSON-LD `ItemList`/`Product` en HTML inicial (static) | Bajo |
| **SEO-004** | ⚠️ Parcial | Product schema en ItemList; sin rutas `/p/[slug]` | Bajo |
| **SEO-005** | ✅ | `metadataBase`, `alternates.canonical` | Bajo |
| **SEO-007** | ✅ | `manifest: "/manifest.json"` en metadata | Bajo |
| **SEO-008** | ✅ | Ya existía `not-found.tsx` (F1) | Bajo |
| **SEO-009** | ✅ | `Disallow: /api/` en robots.txt | Bajo |
| **SEO-010** | ⚠️ Parcial | BreadcrumbList JSON-LD al abrir ProductDetail | Bajo |
| **SEO-012** | ✅ | JSON-LD Organization + WebSite en layout | Bajo |
| **SEO-014** | ✅ | OG description alineada con meta principal | Bajo |

### 14.4 IDs SEO pospuestos

| ID | Motivo |
|----|--------|
| **SEO-003** (completo) | Catálogo RSC en HTML — F5 estructural |
| **SEO-004** (completo) | Rutas producto indexables — F5 |
| **SEO-011** | Share URL por producto parcial (`?product=`); rutas dedicadas en F5 |
| **SEO-013** | CWV — requiere perf hero/loading (F3–F5) |

### 14.5 Archivos nuevos / modificados

| Archivo | Cambio |
|---------|--------|
| `src/lib/site-config.ts` | **Nuevo** — URL, nombres, OG defaults |
| `src/lib/a11y-utils.ts` | **Nuevo** — teclado + selector focusable |
| `src/lib/structured-data.ts` | **Nuevo** — JSON-LD helpers |
| `src/hooks/use-focus-trap.ts` | **Nuevo** — focus trap reutilizable |
| `src/app/sitemap.ts` | **Nuevo** — sitemap App Router |
| `src/app/layout.tsx` | metadataBase, OG, Twitter, manifest, JSON-LD |
| `src/app/page.tsx` | h1 sr-only |
| `src/app/globals.css` | PRM scroll-behavior |
| `public/robots.txt` | Disallow /api/, Sitemap |
| `src/components/n10k/*` | A11Y en modales, nav, cards, forms (ver §14.1) |

### 14.6 Configuración producción

Definir `NEXT_PUBLIC_SITE_URL=https://tu-dominio.com` para canonical, OG absolutas, sitemap y JSON-LD correctos. Fallback actual: `https://nutrition10k.com`.

### 14.7 Validaciones

| Comando | Resultado |
|---------|-----------|
| `git status` | ❌ git no en PATH |
| `bun run lint` | ❌ Bun/Node no en PATH |
| `bunx tsc --noEmit` | ❌ No ejecutado |
| `bun run build` | ❌ No ejecutado |
| ReadLints IDE | ✅ Sin errores en archivos editados |

**Commit sugerido:** `fix(fase-6): a11y semántica, SEO metadata y JSON-LD`

### 14.8 Riesgo visual global F6

**Bajo** — Cambios invisibles o sr-only. Focus-visible ya existía en `globals.css`. Sin alteración de layout, colores ni composición.

*Documento actualizado tras ejecución F6 a11y/SEO (2026-06-16).*

---

## 15. Ejecución mantenimiento — Deuda técnica segura (2026-06-17)

> **Prompt:** Tech Lead mantenimiento — QA/DEP/ARQ/QUAL sin alterar UI.

### 15.1 IDs corregidos

| ID | Estado | Cambio | Riesgo visual |
|----|--------|--------|---------------|
| **QA-001** | ✅ | Eliminados `HeroSection.tsx`, `QuickView.tsx` (0 imports verificados) | **Bajo** |
| **QA-018** | ✅ | `import dynamic` movido al bloque superior en `page.tsx` | Ninguno |
| **QA-019** | ✅ | Script `"typecheck": "tsc --noEmit"` | Ninguno |
| **QA-020** | ⚠️ Parcial | `devError()` en cliente (`store.ts`, `ScrollVideoHero.tsx`); API routes mantienen `console.error` server-side | Ninguno |
| **QA-022** | ✅ | Eliminado hook huérfano `use-scroll-animation.ts` (`useMouseGlow`) | Ninguno |
| **ARQ-004** | ✅ | `prisma` CLI → `devDependencies` | Ninguno |
| **ARQ-006** | ✅ | `tailwind.config.ts` incluye `src/hooks/`, `src/lib/` | **Bajo** |
| **ARQ-012** | ✅ | Consolidado con QA-001 | **Bajo** |
| **ARQ-019** | ⚠️ Parcial | ESLint: `no-debugger` error; `no-unused-vars`/`prefer-const` warn incremental | Ninguno |
| **ARQ-021** | ⚠️ Parcial | 14 deps sin imports eliminadas (ver §15.2) | Ninguno |
| **DEP-005** | ✅ | `prisma` → devDependencies | Ninguno |
| **DEP-006** | ✅ | `uuid` eliminado (0 uso) | Ninguno |
| **DEP-007** | ⚠️ Parcial | Subconjunto verificado eliminado; scaffold UI deps conservadas | Ninguno |
| **DEP-013** | ⚠️ Parcial | 3 reglas reactivadas (warn/error); resto off | Ninguno |
| **DEP-014** | ✅ | `framer-motion` eliminado (0 uso) | Ninguno |
| **QUAL-003** | ⚠️ Parcial | Mismo endurecimiento ESLint incremental | Ninguno |
| **QUAL-009** | ⚠️ Parcial | Inventario deps muertas reducido (14 paquetes) | Ninguno |

### 15.2 Dependencias eliminadas (0 imports en repo)

`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@mdxeditor/editor`, `@reactuses/core`, `@tanstack/react-query`, `@tanstack/react-table`, `framer-motion`, `next-auth`, `next-intl`, `next-themes`, `react-markdown`, `react-syntax-highlighter`, `uuid`, `z-ai-web-dev-sdk`

**Dependencia movida:** `prisma` → `devDependencies` (`@prisma/client` permanece en `dependencies`).

### 15.3 Archivos eliminados

| Archivo | LOC | Motivo |
|---------|-----|--------|
| `src/components/n10k/HeroSection.tsx` | ~263 | Reemplazado por `ScrollVideoHero` |
| `src/components/n10k/QuickView.tsx` | ~158 | Flujo sustituido por `ProductDetail` modal |
| `src/hooks/use-scroll-animation.ts` | ~38 | `useMouseGlow` sin consumidores |

### 15.4 Archivos nuevos / modificados

| Archivo | Cambio |
|---------|--------|
| `package.json` | `typecheck`; prune deps; `prisma` en devDeps |
| `eslint.config.mjs` | Reglas incrementales warn/error |
| `tailwind.config.ts` | `content` hooks + lib |
| `src/lib/dev-log.ts` | **Nuevo** — logging cliente solo dev |
| `src/lib/store.ts` | `devError` en fetch fallido |
| `src/components/n10k/ScrollVideoHero.tsx` | `devError` en extracción frames |
| `src/app/page.tsx` | Orden imports |
| `docs/CSS-CANDIDATOS-LIMPIEZA.md` | **Nuevo** — candidatos CSS sin borrar |

### 15.5 Limpiezas pospuestas (riesgo)

| ID | Motivo | Documentación |
|----|--------|---------------|
| **QA-014**, **ARQ-024**, **PERF-003** | CSS monolítico; duplicado `.animate-float` | [CSS-CANDIDATOS-LIMPIEZA.md](./CSS-CANDIDATOS-LIMPIEZA.md) |
| **ARQ-005**, **DEP-003** | Dual Tailwind 3/4 — unificar rompe purge | Posponer |
| **QA-016**, **QUAL-001**, **QA-017** | `next-themes`/`next-intl` deps ya eliminadas; i18n/theming no implementado | Backlog F6+ |
| **QUAL-006** | Dual toast Sonner/Radix — layout usa Radix | Posponer |
| **ARQ-015** | Scaffold shadcn (~48 componentes) | Posponer |
| **QA-021** | Scripts con paths `/home/z/my-project/` | Posponer — ops only |
| **ARQ-018**, **QUAL-008**, **DEP-015** | `noImplicitAny: false` | Posponer — muchos errores TS |
| **SEC-011** | `next-auth` dep eliminada; sesión propia es fuente de verdad | ✅ alineado |

### 15.6 Validaciones

| Comando | Resultado |
|---------|-----------|
| `git status` | ❌ `git` no en PATH del entorno |
| `bun install` | ⏳ Pendiente — Bun/Node no en PATH; sin `node_modules` |
| `bun run typecheck` | ⏳ Pendiente |
| `bun run lint` | ⏳ Pendiente |
| `bun run build` | ⏳ Pendiente |
| Prueba visual desktop/mobile | ⏳ Pendiente — requiere `bun run dev` |
| ReadLints IDE | ✅ Sin errores en archivos editados |

### 15.7 Riesgo visual global

**Bajo** — Sin cambios CSS, clases ni composición JSX montada. Eliminación de código no referenciado.

**Commit sugerido:** `chore(mantenimiento): typecheck, deps muertas y legacy huérfano`

*Documento actualizado tras mantenimiento deuda técnica segura (2026-06-17).*

---

## 16. Verificación QA + Release (2026-06-17)

> **Prompt:** QA Engineer + Release Manager — regresión visual/funcional post-correcciones.  
> **Entregable:** [REPORTE-FINAL-CORRECCIONES.md](./REPORTE-FINAL-CORRECCIONES.md)

### 16.1 Entorno de verificación

| Recurso | Estado |
|---------|--------|
| `git` / `.git/` | ❌ No disponible en PATH; workspace sin historial git |
| Bun / Node | ❌ No en PATH |
| `node_modules/` | ❌ Ausente |
| `bun run lint` / `typecheck` / `build` | ❌ No ejecutados |
| Navegador / `bun run dev` | ❌ No ejecutado |
| ReadLints IDE | ✅ Sin errores en `src/` |

### 16.2 Regresiones obvias

**Ninguna detectada en inspección estática.** Los archivos de identidad visual (`globals.css` tokens, marquees `#E30613`, composición `page.tsx`) no muestran cambios destructivos.

### 16.3 Discrepancias plan vs código (corregidas en este reporte)

| ID | Estado en §5 F3 | Estado real en `src/` |
|----|-----------------|----------------------|
| **MOB-001** | Listado como acción F3 | ⏳ **Pendiente** — 0 matches `safe-area` en `src/` |
| **MOB-009** | `min-h-dvh` | ⏳ **Pendiente** — sigue `min-h-screen` |
| **MOB-029** | `viewportFit: cover` | ⏳ **Pendiente** — sin `export const viewport` en layout |
| **MOB-010/011** | Quick-add touch | ✅ Implementado vía `@media (hover: none)` en `globals.css` |

### 16.4 Matriz de estado global (muestra por categoría)

| Categoría | Corregido | Parcial | Pendiente | Pospuesto riesgo visual | Decisión manual |
|-----------|-----------|---------|-----------|-------------------------|-----------------|
| F1 Bloqueadores | 15 | 2 | 4 | 0 | 0 |
| F2 Seguridad | 18 | 5 | 3 | 1 (CSP) | 0 |
| F3 Mobile/PERF | 12 | 10 | 4 | 6 | 2 (hero pin) |
| F4 Datos | 20 | 4 | 5 | 0 | 1 (Postgres) |
| F5 Estructural | 0 | 0 | 8+ | 3 | 2 |
| F6 a11y/SEO | 28 | 8 | 4 | 3 | 0 |
| Mantenimiento | 10 | 6 | 8 | 4 | 0 |
| **Resto auditoría** | — | — | **~150** | **~15** | **~5** |

### 16.5 Veredicto release

| Pregunta | Respuesta |
|----------|-----------|
| ¿Regresión visual obvia? | **No** (pendiente validación manual 4 viewports) |
| ¿Regresión funcional obvia? | **No** en código; runtime no probado |
| ¿Listo para merge staging? | **Sí, con reservas** — ejecutar lint/build antes |
| ¿Listo para producción? | **No** — PERF-001, DATA-010, pruebas manuales, AUTH_SECRET |

*Documento actualizado tras verificación QA (2026-06-17).*

---

## 14. Ejecución F4 — Datos, APIs e integridad e-commerce (2026-06-16)

> **Prompt:** Backend/Data Engineer — Prisma + SQLite sin cambios visuales ni migraciones destructivas.

### 14.1 IDs DATA/BUG/SEC corregidos

| ID | Estado | Cambio | Riesgo visual |
|----|--------|--------|---------------|
| **DATA-002** | ✅ | `enum OrderStatus` en schema | Bajo |
| **DATA-003** | ✅ | `@@unique([userId, productId, color, size])` + `color`/`size` default `""` | Bajo |
| **DATA-004** | ✅ | `WishlistItem.colorName` non-null default `""` | Bajo |
| **DATA-005** | ✅ | `@@index([category])`, `@@index([isNew, sortOrder])` | Bajo |
| **DATA-006** | ✅ | `@@index([productId])` en Review | Bajo |
| **DATA-011** | ✅ | Migración inicial + `migration_lock.toml` | Bajo |
| **DATA-012** | ✅ | `prisma/seed.ts` alinea IDs/slugs con static | Bajo |
| **DATA-013** | ✅ | Singleton Prisma en prod + `$disconnect` en SIGTERM | Bajo |
| **DATA-014** | ✅ | Límite 500 + paginación opt-in `?paginated=true` | Bajo |
| **DATA-015** | ✅ | Paginación opt-in; default array ≤50 reviews | Bajo |
| **DATA-016** | ✅ | `select` explícito en products (misma forma vía `transformProduct`) | Bajo |
| **DATA-017** | ⚠️ Parcial | `src/lib/order-utils.ts` con `$transaction` (sin API checkout aún) | Bajo |
| **DATA-018** | ✅ | Seed usa `id`/`slug` de `static-products.ts` | Bajo |
| **DATA-019** | ✅ | Static soporta `outOfStock[]`; fallback ya no hardcodea `[]` | Bajo |
| **DATA-020** | ⚠️ Parcial | Static soporta `rating`; recálculo en POST review (DATA-026) | Bajo |
| **DATA-021** | ✅ | Verificado — `transformProduct` incluye `slug` (F1) | Bajo |
| **DATA-022** | ✅ | Verificado F2 + race P2002 en newsletter | Bajo |
| **DATA-023** | ✅ | Verificado F2 + `normalizeEmail` en login | Bajo |
| **DATA-024** | ✅ | Verificado F2 (Zod, sanitize, rate limit) | Bajo |
| **DATA-025** | ✅ | `reviewerKey` + `@@unique([productId, reviewerKey])` + 409 en dup | Bajo |
| **DATA-026** | ✅ | Transacción POST review + `Product.rating` agregado | Bajo |
| **DATA-027** | ✅ | `enum UserRole { customer admin }` | Bajo |
| **DATA-028** | ✅ | Fallback solo si `ALLOW_STATIC_CATALOG_FALLBACK` o dev; header `X-Catalog-Source`; 503 en prod si DB caída | Bajo |
| **DATA-029** | ⚠️ Parcial | `db:check-sizes`, `db:migrate:deploy` en package.json | Bajo |
| **BUG-026** | ✅ | Verificado — slug en transform (F1) | Bajo |
| **SEC-018** | ✅ | Verificado F2 — sanitize reviews | Bajo |

### 14.2 IDs pospuestos (documentados — no implementados)

| ID | Motivo | Plan seguro |
|----|--------|-------------|
| **DATA-001** | Migrar Float→centavos rompe pedidos/API existentes | Fase 1: util `money.ts` redondeo; Fase 2: columnas `priceCents Int`; Fase 3: dual-write; Fase 4: drop Float |
| **DATA-007** | Campo `stock Int` requiere backfill inventario real | Añadir columna nullable → script ops → UI sin cambio hasta checkout DB |
| **DATA-009** | SQLite concurrencia escritura | Postgres managed en prod; SQLite solo dev |
| **DATA-010** | Multi-instancia serverless | `DATABASE_URL` remoto + desactivar fallback en prod (`ALLOW_STATIC_CATALOG_FALLBACK=false`) |
| **DATA-008** | Informativo — cascade OK | Evaluar `Restrict` en OrderItem→Product cuando exista histórico |
| **BUG-024** | Aritmética float carrito client-side | Resolver junto DATA-001 en capa money |

### 14.3 Cambios de schema (`prisma/schema.prisma`)

- Enums: `UserRole`, `OrderStatus`
- Índices: `Product.category`, `Product(isNew, sortOrder)`, `Review.productId`, `Order(userId, status)`
- Unique: `CartItem(userId, productId, color, size)`, `ProductSize(productId, label)`, `Review(productId, reviewerKey)`
- Review: campo `reviewerKey` (dedupe case-insensitive)
- CartItem/WishlistItem: claves compuestas con `""` en lugar de NULL

### 14.4 Migraciones

**Archivo:** `prisma/migrations/20250616120000_schema_integrity_indexes/migration.sql`

**Aplicar en entorno local (con backup):**

```powershell
# 1. Backup obligatorio
Copy-Item db/custom.db db/custom.db.bak-$(Get-Date -Format yyyyMMdd)

# 2. Generar client + aplicar migración
bun run db:generate
bun run db:migrate:deploy

# 3. Poblar catálogo alineado con static (clone fresco)
bun run db:push          # solo si no hay DB aún
bun run db:seed
```

**Riesgos de migración:**

- Duplicados en `CartItem`, `WishlistItem` o `Review` → deduplicar manualmente antes de aplicar (SQL incluye dedupe reviews).
- `ProductSize` duplicados `(productId, label)` → resolver con `scripts/check-sizes.mjs` antes de migrar.
- Enums `UserRole`/`OrderStatus`: valores existentes deben ser `customer|admin` y `pending|confirmed|...`.

**Alternativa clone fresco (sin backup de prod):**

```powershell
bun run db:push
bun run db:seed
```

### 14.5 Variables de entorno nuevas

| Variable | Default | Uso |
|----------|---------|-----|
| `ALLOW_STATIC_CATALOG_FALLBACK` | `true` en dev, implícito `false` en prod | Permite catálogo static si SQLite no abre |
| `DATABASE_URL` | `file:./db/custom.db` | Sin cambio |

### 14.6 Archivos nuevos / modificados

| Archivo | Cambio |
|---------|--------|
| `prisma/schema.prisma` | Enums, índices, uniques, `reviewerKey` |
| `prisma/migrations/.../migration.sql` | Migración segura aditiva |
| `prisma/seed.ts` | **Nuevo** — catálogo desde static |
| `src/lib/db.ts` | Singleton prod + shutdown hook |
| `src/lib/pagination.ts` | **Nuevo** — helpers paginación |
| `src/lib/catalog-fallback.ts` | **Nuevo** — fallback controlado |
| `src/lib/order-utils.ts` | **Nuevo** — transacción order (futuro checkout) |
| `src/lib/validation.ts` | `normalizeReviewerKey` |
| `src/lib/static-products.ts` | Tipos `outOfStock`, `rating` |
| `src/app/api/products/route.ts` | select, paginación, fallback 503/header |
| `src/app/api/reviews/route.ts` | dedupe, transacción rating, paginación |
| `src/app/api/newsletter/route.ts` | race P2002 |
| `src/app/api/auth/login/route.ts` | `normalizeEmail` consistente |
| `package.json` | `db:migrate:deploy`, `db:check-sizes` |

### 14.7 Compatibilidad UI (ProductGrid / ProductDetail)

- `GET /api/products` **sin query params** sigue devolviendo **array JSON** idéntico en forma (`id`, `slug`, `sizes`, `outOfStock`, `colors`, etc.).
- Header opcional `X-Catalog-Source: database|static` — la UI no lo consume.
- Paginación opt-in (`?paginated=true&page=1&limit=20`) para consumidores futuros; store actual no afectado.

### 14.8 Validaciones ejecutadas

| Comando | Resultado |
|---------|-----------|
| `git status` | ❌ `git` no en PATH |
| `bun run db:generate` | ❌ Bun/Node no en PATH |
| `bun run db:migrate:deploy` | ⏳ Pendiente en máquina local |
| `bun run lint` | ❌ No ejecutado |
| `bunx tsc --noEmit` | ❌ No ejecutado |
| `bun run build` | ❌ No ejecutado |
| ReadLints IDE | ✅ Sin errores en archivos editados |

### 14.9 Riesgo visual global F4

**Bajo** — Cambios exclusivamente backend/schema. La UI recibe la misma forma de producto. Único efecto funcional visible: reseñas duplicadas rechazadas (409) y rating de producto actualizado tras POST review (cuando la UI consuma la API).

**Commit sugerido:** `fix(fase-4): schema integrity, seed, API pagination y review dedupe`

