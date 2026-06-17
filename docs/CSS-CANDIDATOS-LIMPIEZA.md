# CSS — Candidatos a limpieza (sin borrar aún)

> **Fecha:** 2026-06-17  
> **Contexto:** Mantenimiento post-eliminación de `HeroSection.tsx` y `QuickView.tsx` [QA-001], [ARQ-012].  
> **Regla:** No eliminar bloques hasta verificación visual desktop + mobile.

---

## 1. Clases huérfanas confirmadas (0 referencias en `src/`)

| Clase / selector | Ubicación `globals.css` | Último uso | Riesgo visual |
|------------------|---------------------------|------------|---------------|
| `.animate-text-glow` | ~2062, ~2107 (PRM) | Solo `HeroSection.tsx` (eliminado) | **Bajo** |
| `.n10k-pattern-diagonal` (+ `::after`) | ~914–930 | Solo `HeroSection.tsx` (eliminado) | **Bajo** |

**Acción recomendada (fase futura):** Eliminar bloques tras captura baseline; no afectan componentes montados.

---

## 2. Duplicados / conflictos documentados

| ID auditoría | Hallazgo | Ubicación | Riesgo |
|--------------|----------|-----------|--------|
| PERF-003 / QA-014 | `.animate-float` definida **dos veces** con keyframes distintos (`float` vs `n10k-float`) | `globals.css` ~577 y ~1321 | **Medio** — la segunda sobrescribe; usada en hero decorativo y cards |
| ARQ-005 / DEP-003 | Config dual Tailwind 3 (`tailwind.config.ts`) + Tailwind 4 (`@import "tailwindcss"`) | `globals.css:1`, `tailwind.config.ts` | **Medio** — no unificar sin QA visual completo |

---

## 3. Monolito `globals.css` (~2450 LOC)

| Bloque temático | Líneas aprox. | Usado por | Notas |
|-----------------|---------------|-----------|-------|
| Tokens / shadcn | 1–200 | Layout, UI scaffold | Mantener |
| Tipografía Montserrat utilities | 140–170 | Toda la UI n10k | Mantener |
| Glass / frost / shimmer | 400–1100 | Header, cards, modales | **Alto riesgo** si se toca |
| Hero video scroll | 2340–2450 | `ScrollVideoHero.tsx` | **Alto riesgo** |
| Animaciones decorativas | 1900–2200 | Marquees, stats, footer | Revisar uso antes de podar |

**Acción:** Split modular (tokens / components / hero) en fase F5+ — ver [QA-014], [ARQ-024].

---

## 4. Clases compartidas hero actual (NO borrar)

Usadas por `ScrollVideoHero.tsx` y otras secciones:

- `.floating-particle`, `.animate-panda-float`, `.badge-pulse`, `.text-animated-gradient`
- `.hero-video-hidden`, `.hero-video-entered`, `body.video-hero-active`
- `.font-montserrat-extrabold`, `.font-montserrat-black`, `.text-gradient-red`

---

## 5. Scaffold UI no montado

Componentes `src/components/ui/*` no importados desde `n10k/` mantienen estilos vía tokens globales. **No podar tokens shadcn** hasta decidir destino del scaffold [ARQ-015].

---

## 6. Checklist antes de eliminar CSS

- [ ] Baseline visual §2.1 en `PLAN-CORRECCION-AUDITORIA.md` (4 viewports)
- [ ] `rg "nombre-clase" src/` → 0 matches
- [ ] `bun run build` exitoso
- [ ] Comparación hero + glass UI post-cambio
