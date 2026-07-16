# Tool Detail Pages — Ad Placement Redesign Plan

**Status:** Approved (with refinements below) — Phase 1 implemented
**Scope:** Every Tool Details page (`/tools/all/[slug]` and `/tools/[category]/[slug]`) — all placements render through `ToolDetailChrome.jsx`, so this plan applies platform-wide from a single change surface.
**Owner docs:** follows `master.md` (tokens, light+dark, AA, no hardcoded styles)

---

## 1. Problem

The current layout wraps every tool in two sticky 250px sidebar rails (`tool_detail_left`, `tool_detail_right`) plus a full-bleed bottom banner (`tool_detail_bottom`). This causes five concrete problems.

The rails permanently reserve roughly 560px of horizontal space at `xl+`, squeezing the tool workspace to ~810px on a standard 1440px laptop even though the workspace is designed for `max-w-6xl` (1152px). Tool layouts have to be over-engineered (container queries, compressed grids) to survive the squeeze. The `w-[250px]` wrapper divs render even when no ad fills the slot, so the width is lost whether or not an ad is present. The creatives are unconstrained portrait images (`max-h-screen`, hover zoom) that read as wallpaper skins rather than premium sponsorship. Ad images have no reserved dimensions, so slots shift the layout as they load (CLS). And below `xl` the rails disappear entirely, which means tablet and mobile carry almost no inventory while wide desktop feels ad-heavy — the worst of both.

## 2. Design principles

Ads must never compete with the tool for width or attention. The tool workspace always gets its full `max-w-6xl`; ads occupy space the tool does not need (true margin on ultra-wide screens) or moments after the job is done (below the workspace in the scroll flow). Every ad renders as a design-system card — token borders, `rounded-lg`, consistent "Sponsored" chip, light + dark, reduced-motion safe — with fixed, reserved dimensions so nothing shifts. Unfilled slots collapse to zero. Maximum three placements visible on any page.

## 3. Target layout

### Desktop, ultra-wide (viewport ≥ ~1536px / `2xl`)

One conditional right rail, single 300×600 slot (IAB half-page), sticky below the action bar. The rail renders **only when the viewport fits the full 1152px workspace plus the rail and gaps** — i.e. it lives in what is otherwise empty margin and never subtracts from the tool. No left rail at any size.

### Desktop / laptop (1024–1536px)

No rails at all. The workspace takes its full designed width. Inventory moves in-flow (below).

### All widths — in-flow placements

| Slot | Position | Size (reserved) | Notes |
|---|---|---|---|
| Native card | One card slot inside the **Related Tools** grid | Same card dimensions as tool cards | Styled identically to a tool card (icon, title, description) + "Sponsored" chip; feels native, not interruptive |
| Inline card (mobile/tablet only, `<lg`) | Between tool workspace and the workflow-guide section | 300×250 centered card | First real mobile inventory; single slot, never above the tool |
| Bottom banner | After the workflow guide / FAQ section (existing position) | 970×250 desktop, 320×100 mobile, fixed aspect ratio inside a rounded card | Replaces today's full-bleed 200px stretch; `object-cover` inside a contained card, no distortion |

Frequency rule: a page shows at most the rail (when ultra-wide) + one in-flow card + the bottom banner. The mobile inline card and the rail are mutually exclusive by breakpoint, so the cap holds everywhere.

## 4. Placement key mapping (backward compatible)

No admin-app changes required on day one. The existing Firestore placement keys keep serving:

| Existing key | New slot it feeds |
|---|---|
| `tool_detail_right` | Conditional right rail (`2xl+`) |
| `tool_detail_left` | Native card in Related Tools grid (first fill), then mobile inline card |
| `tool_detail_bottom` | Bottom banner (unchanged key, new component) |

Mapping lives in `ToolDetailChrome` where `useToolAds` is called — the provider and admin remain untouched. A follow-up (optional, later) can introduce clean keys (`tool_detail_rail`, `tool_detail_inline`, `tool_detail_banner`) in the admin with these as aliases.

Existing portrait creatives keep working in the rail (letterboxed into 300×600 with `object-contain` on `--surface-soft`); new creative guidance for advertisers: 300×600, 300×250, 970×250, 320×100.

## 5. Component changes

**`app/tools/[category]/[slug]/ToolDetailChrome.jsx`** — remove the left rail block; wrap the right rail in the width condition and render nothing (no wrapper div) when the slot is unfilled or the viewport is too narrow; pass the mapped ads down; add the mobile inline slot after `{children}`; keep breadcrumb/action bar/SEO sections as-is.

**`ads/layouts/shared/AdSidebar.jsx` → `AdRail`** — fixed 300×600 card: token border, `rounded-lg`, `bg-(--surface)`, Sponsored chip, `loading="lazy"`, no hover scale (respect `prefers-reduced-motion`; a subtle border-color hover is enough), collapses to null cleanly (already does).

**`ads/layouts/shared/AdBottomBanner.jsx`** — contained rounded card with fixed aspect-ratio box (970:250 desktop, 320:100 mobile via container/media query), `object-cover`, reserved height before image load.

**New `ads/layouts/tools/AdNativeCard.jsx`** — mirrors the Related Tools card markup (h-9 icon tile, truncated title, 2-line description, "Open →" affordance) fed by ad `title`/`description`/`bannerUrl` fields with a Sponsored chip; falls back to image-only card when text fields are absent.

**New `ads/layouts/shared/AdInlineCard.jsx`** — 300×250 centered card for `<lg`, same token treatment.

Rail visibility uses CSS only (`hidden min-[1560px]:flex` or a `2xl` variant tuned to 1152 + 300 + gaps) — no JS measurement, no hydration mismatch, no CLS.

## 6. Accessibility & performance

Meaningful `alt` from the ad record (fallback: advertiser name, never bare "Sponsored Ad"); Sponsored chip meets AA contrast in both themes; all ad images `loading="lazy"` and `decoding="async"`; every slot has reserved dimensions (zero CLS); rails and cards are plain links — keyboard focus ring per token spec; no animation beyond 150ms border/opacity hover, gated by `prefers-reduced-motion`.

## 7. Rollout & verification

Phase 1 implements the chrome + component changes and the key mapping (one PR; both apps build with `next build --webpack`). Phase 2 verifies with Playwright/manual passes at 390 / 768 / 1280 / 1440 / 1680 widths in light and dark on a representative tool set — age-calculator (dense dashboard), an image tool (wide canvas), a code/text tool (editor) — checking: workspace gets full width ≤1536px, rail appears only above the threshold and never squeezes the workspace, unfilled slots leave no gaps, no CLS on ad load, ads render correctly with existing Firestore creatives and with mock data (`NEXT_PUBLIC_USE_MOCK`). Phase 3 (optional, later): clean placement keys + admin UI options, creative-size guidance for the ads admin, and per-slot impression/click tracking if not already captured.

Success criteria: tool workspace ≥1152px available on all viewports ≥1200px; zero layout shift from ads; inventory present on mobile; at most 3 ad units per page; visual consistency with `master.md` tokens in both themes.

---

## 8. Approved refinements (incorporated)

**Content-width gating, not viewport gating.** The rail's visibility is driven by a container query (`@container/toolpage` on the page wrapper, rail visible at `@[93rem]`), so it responds to the actual content area — page padding, scrollbars and future chrome changes are accounted for automatically. The threshold is a single documented constant (72rem workspace + 18.75rem rail + 2rem gap); if the workspace max-width ever changes, one class changes with it.

**No wrapper without an ad.** The entire rail `<aside>` renders only when a creative exists (`showRail`); there is never an empty flex column. The in-flow and banner slots follow the same rule — components return `null` and their wrappers are conditionally rendered.

**Native card is optional by design.** The in-flow slot renders only when a creative is available — no placeholder otherwise. One adaptation from the original sketch: the Related Tools grid on tool pages is server-rendered inside `ToolSeoSection` specifically so crawlers see real HTML (it fixed an indexing problem), and ads are client-side Firestore data. Injecting a client ad into that server grid would compromise the SSR content, so the native card instead renders as a native-styled sponsored strip in the in-flow slot directly after the workspace — same premium, content-like treatment, zero impact on the SEO section. If the related grid ever becomes client-rendered, the ≥4-items injection rule from the review applies as written.

**Below-the-fold placements lazy-load.** The native/inline slot and the bottom banner are wrapped in `RouteLazySection` (the platform's existing IntersectionObserver deferral component, 520px root margin) with reserved `minHeight`, so they neither compete with the tool's initial render nor shift layout when they materialize.

**Per-tool rail opt-out.** Tools that benefit from maximum horizontal space (canvas, image, PDF, code editors) can set `wideWorkspace: true` in their `tool.config.js`. The meta generator (`scripts/generate-tool-meta.mjs`) passes the flag through to `toolMetaMap`; `ToolDetailChrome` then disables the rail and lifts the workspace width cap for that tool only.

**Placement-level performance tracking.** Each slot records viewable impressions (≥50% visible for 1s, once per placement+ad+path, IAB-style) and clicks, keyed by placement: `tool_detail_rail`, `tool_detail_native`, `tool_detail_inline`, `tool_detail_banner`. Events beacon to a new `/api/ad-events` route that follows the existing `/api/vitals` pattern — default-inert (accepted and dropped), `ALTFT_AD_EVENTS_LOG=1` enables server logs, with a marked extension point for a Firestore/analytics sink. CTR per placement = clicks/impressions from this stream.

## 9. Phase 1 implementation map

| File | Change |
|---|---|
| `src/app/tools/[category]/[slug]/ToolDetailChrome.jsx` | Left rail removed; conditional container-query right rail; in-flow native/inline slots; lazy-loaded banner; `wideWorkspace` support; placement key mapping |
| `src/ads/layouts/tools/AdRail.jsx` (new) | 300×600 token card, letterboxes legacy creatives, impression/click tracking |
| `src/ads/layouts/tools/AdNativeCard.jsx` (new) | Native sponsored strip (icon/title/description/CTA), `lg+` |
| `src/ads/layouts/tools/AdInlineCard.jsx` (new) | Centered 300×250 card, `<lg` |
| `src/ads/layouts/tools/AdToolBanner.jsx` (new) | Fixed-aspect contained bottom banner |
| `src/ads/track.js` (new) | `useAdImpression` hook + `trackAdEvent` beacon |
| `src/app/api/ad-events/route.js` (new) | Default-inert collector (mirrors `/api/vitals`) |
| `scripts/generate-tool-meta.mjs` | Passes `wideWorkspace` from tool.config.js into `toolMetaMap` |

`ads/layouts/shared/AdSidebar.jsx` and `AdBottomBanner.jsx` are intentionally untouched — they are shared by pranx, ad-preview and buysmart pages; tool pages now use the tool-specific components above.
