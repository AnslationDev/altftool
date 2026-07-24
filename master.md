# ALTFTool — MASTER (read this first)

> **MANDATORY.** Any agent or developer working anywhere inside this repository **must read this file before writing or changing code.** It is the single source of truth for the ALTFTool design language, theming rules, and engineering standards. When in doubt, match this document exactly. Do not introduce styles, colours, or patterns that contradict it.

Companion references (read when relevant, but this file wins on conflicts):
- `ALTFTool-Design-System.pdf` — full visual design system guide (the canonical spec this file summarises).
- `ALTF_ENGINE_PLATFORM_ARCHITECTURE.md` / `ALTF_ENGINE_PHASE1_IMPLEMENTATION.md` — SEO/CMS engine architecture & status.

---

## 0. Golden rules (non-negotiable)

1. **Theme everything through tokens.** Never hardcode colours, radius, shadows, or spacing. Use semantic tokens / Tailwind utilities (`bg-primary`, `text-foreground`, `rounded-lg`, `shadow-md`, `var(--surface)`).
2. **One unified product.** Every surface — web, admin, tools, blog, news, dashboard, auth, settings, error/loading pages, and every future feature — must look and feel identical. No page should look "different".
3. **Light + Dark, always.** Every screen must work in both themes via the same semantic token names.
4. **Backward compatible & no SEO regressions.** Changes default to inert; never break existing behaviour. The SEO engine stays gated behind `ALTFT_SEO_ENGINE_ENABLED`.
5. **Accessibility is not optional.** WCAG 2.1 AA contrast, visible focus rings, keyboard operability, `prefers-reduced-motion`.
6. **Verify before you ship.** Run the relevant build/tests; both apps build with **`next build --webpack`** (Turbopack does not resolve the `@altftool/*` workspace packages — keep `--webpack`).

---

## 1. Brand & theme

- **Identity:** modern, intelligent, trustworthy. Calm teal–cyan brand on cool neutral (slate) canvases, generous whitespace, crisp Geist typography, soft shadows, rounded surfaces.
- **Primary (Light): Teal-500 `#14B8A6`** is the brand identity colour. The functional `--primary` action token implements **Teal-600 `#0D9488`** so white-on-fill and primary-text-on-white meet **WCAG AA** (Teal-500 white-text ≈ 2.4:1 fails). Hover `#0F766E` (700), pressed `#115E59` (800). Do **not** set `--primary` back to Teal-500 — it reintroduces the contrast bug.
- **Secondary: Cyan-400 `#22D3EE`**.
- **Dark theme:** navy backgrounds; primary brightens to **Teal-400 `#2DD4BF`**, secondary **Cyan-400 `#22D3EE`** for ≥4.5:1 contrast.
- Colour carries meaning — never decoration. One primary action per view.

---

## 2. Design tokens (the source of truth)

Build against the **semantic** layer (`--primary`, `--surface`, …) or Tailwind utilities. Editing the **primitive** layer re-themes the whole platform in one place.

### Brand — Teal (primary)
| 50 | 100 | 200 | 300 | 400 | **500 ★** | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| `#F0FDFA` | `#CCFBF1` | `#99F6E4` | `#5EEAD4` | `#2DD4BF` | **`#14B8A6`** | `#0D9488` | `#0F766E` | `#115E59` | `#134E4A` |

### Secondary — Cyan
`Cyan-400 ★ #22D3EE` · Cyan-300 `#67E8F9` · Cyan-500 `#06B6D4` · Accent Violet `#8B5CF6`

### Semantic / status
| Role | HEX |
|---|---|
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#0EA5E9` |

### Neutrals — Light
| Role | HEX | Token |
|---|---|---|
| Page | `#F7F8FB` | `--page` |
| Surface / Card | `#FFFFFF` | `--surface` |
| Surface soft | `#EEF3F6` | `--surface-soft` |
| Border | `#E2E8F0` | `--border` |
| Border strong | `#CBD5E1` | `--border-strong` |
| Text | `#111827` | `--foreground` |
| Muted | `#607083` | `--muted` |

### Neutrals — Dark (navy)
| Role | HEX | Token |
|---|---|---|
| Page | `#070D18` | `--page` |
| Canvas | `#0B1220` | `--canvas` |
| Surface / Card | `#101827` | `--surface` |
| Surface soft | `#142033` | `--surface-soft` |
| Border | `#1E293B` | `--border` |
| Text | `#F8FAFC` | `--foreground` |
| Muted | `#94A3B8` | `--muted` |

### Typography — Geist / Geist Mono
Display 40–48/800 · H1 32/700 · H2 24/700 · H3 18/600 · Body 15–16/400 (line-height 1.55) · Small 13–14 · Caption/Label 11–12/600 · Button 13–14/600–700 · Mono 13.

### Spacing — 4px scale
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`. Card padding 16–20. Default gap 16. Mobile drops one step.

### Radius
`sm 6 · md 8 · lg 12 · xl 16 · pill 9999 · circle 50%`. Inputs/buttons = 8, cards = 12, modals = 16.

### Shadows
| Level | Light | Dark | Use |
|---|---|---|---|
| sm | `0 1px 2px rgba(15,23,42,.06)` | `0 1px 2px rgba(0,0,0,.36)` | resting |
| md | `0 8px 24px rgba(15,23,42,.08)` | `0 10px 28px rgba(0,0,0,.36)` | hover/dropdown |
| lg | `0 20px 48px rgba(15,23,42,.12)` | `0 24px 56px rgba(0,0,0,.46)` | modal/floating |

Glass: `backdrop-filter: blur(16px)`; focus ring: `0 0 0 3px rgba(20,184,166,.35)`.

---

## 3. Token architecture (how theming is wired)

```
Primitive   packages/ui/src/tokens.css              (raw values — one place)
   ↓
Semantic    --primary: var(--anslation-ds-primary) (role alias used in UI)
   ↓
Theme map   packages/ui/src/theme.css               (Tailwind utility mapping)
   ↓
Utility     bg-primary / text-primary / border-primary          (what components use)
```

- Light/Dark switch via `[data-theme="dark"]` overriding the **same** semantic names.
- `packages/ui/src/theme.css` must expose every semantic colour as a Tailwind utility (`--color-surface`, `--color-danger-soft`, etc.) — if a `bg-*`/`text-*` class doesn't render, add the mapping there; don't hardcode it in an app.
- Web and admin `globals.css` files may retain compatibility aliases while legacy routes migrate, but they must not redefine raw `--anslation-ds-*` primitives.
- Static AltFTool marks are generated from `packages/ui/src/brand/brand.js` with `npm run brand:sync`; shells use `BrandLogo` / `BrandMark`.

---

## 4. Component standards (must match)

- **Button:** 40px tall, radius 8, weight 600–700, 3px focus ring. Variants: primary (teal), secondary (white+border), ghost, outline, danger, success, disabled (60%), loading (spinner + label).
- **Input/Form:** 40px, radius 8, 1px `--border`; focus = primary border + ring; error = `#EF4444` + message; disabled = soft fill.
- **Card:** radius 12, 1px `--border`, padding 16–20, elevation sm→md on hover; title→body 8px gap; one primary CTA.
- **Nav:** top navbar 64px sticky/blur; admin sidebar active = brand fill + white text; footer dark navy; tap targets ≥44px.
- **Library:** badges/pills, alerts (left status border + soft tint), toasts, modals (radius 16 + dim backdrop), dropdowns, tabs (2px brand underline), accordions, tooltips (dark bubble), pagination, loaders, skeletons, avatars, charts (teal+cyan+violet), tables (uppercase header on soft fill).
- **Icons:** Lucide, stroke 1.75–2, sizes 16/20/24, inherit text colour (brand when active), 8px from text.
- **Motion:** hover 150ms ease-out · modal 200ms · drawer 250ms cubic-bezier(.4,0,.2,1) · spinner 1s linear. Honour `prefers-reduced-motion`.

---

## 5. Per-section consistency

These must all share the exact same tokens & components:
`Home · Dashboard · Extensions · Tool Pages · Search · Blog · News · Pricing · Authentication · Profile · Settings · Admin Panel · Documentation · Error pages · Loading pages · every future feature.`

Web app = `altftoolweb` · Admin = `altftoolwebadmin` · Shared = `packages/core` (`@altftool/core`), `packages/ui` (`@altftool/ui`). Tokens, Tailwind mappings, brand primitives, and shared component recipes live in `packages/ui`; app globals are compatibility and product-composition layers only.

---

## 6. Workflow for any change (checklist)

1. **Read this file** + the Design System PDF for the area you touch.
2. Use existing **tokens, utilities, and components** — never new hardcoded values or one-off styles.
3. Support **light AND dark**.
4. Meet **AA accessibility** (contrast, focus, keyboard, reduced-motion).
5. Keep changes **backward-compatible**; SEO engine stays inert by default.
6. **Build both apps with `--webpack`** and run relevant tests before declaring done.
7. If you must add a token, add it at the **primitive + semantic + @theme** layers — never inline.

---

*ALTFTool MASTER v1.0 — the single source of truth. Update this file (and the Design System PDF) whenever the design language evolves; everything else follows it.*
