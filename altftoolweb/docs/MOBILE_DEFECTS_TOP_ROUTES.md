# Mobile defect sweep — top-traffic routes

Measured 2026-07-31 against the running dev server at `http://localhost:3002` with
Playwright/Chromium 147, contexts created as `isMobile: true, hasTouch: true,
deviceScaleFactor: 3`, iOS 17 Safari UA. **All 8 assigned routes were measured, each at
both 390×844 and 360×640** — 16 page loads for the base sweep, plus six follow-up
sweeps for hit-target verification, clipping analysis, layout shift and one
false-positive check.

Two routes (`/tools/calculators`, `/blogs`) exceeded a 90 s navigation timeout on their
first-ever dev compile at 390×844 and were re-measured immediately afterwards; every
number below comes from a completed load.

Nothing in `src/` was edited. `node scripts/run-unit-tests.mjs` → **946 pass, 0 fail**.

---

## Read this first: `document.scrollWidth - clientWidth` is structurally 0 on this site

`src/app/globals.css:151` and `src/app/globals.css:222` set `overflow-x: clip` on
`html` and `body`. **Every one of the 16 measurements returned
`document.documentElement.scrollWidth - clientWidth === 0`, and that zero is the clip
doing its job, not evidence that nothing overflows.** Content that overflows is
*silently discarded* — it cannot even be swiped to.

So the useful measurement is per-element: `el.scrollWidth - el.clientWidth`, plus
"which elements have a right edge past their nearest clipping ancestor". Both are
reported below. Where a route is clean, one line says so.

### Overflow, per route (both widths)

| Route | doc overflow 390 / 360 | element-level overflow that is genuinely lost |
| --- | --- | --- |
| `/` | 0 / 0 | none — only decorative `absolute` glows inside `overflow-hidden` sections |
| `/tools/all/step-counter` | 0 / 0 | none |
| `/tools/all/age-gender-detector` | 0 / 0 | shell scrolls 14 px / 44 px (already known; scrollable, not lost) |
| `/tools/all/wheregoes-tool` | 0 / 0 | none |
| `/tools/all/utm-link-builder` | 0 / 0 | none @390; **one button loses 12.2 px @360** to the tool's own `overflow-hidden` card — see F5 |
| `/tools/calculators` | 0 / 0 | none outside the intentional snap carousels |
| `/blogs` | 0 / 0 | none outside the intentional snap carousels |
| `/news` | 0 / 0 | 20 px past `<main>` at both widths — **investigated and benign**, see F4 |

---

## Ranked findings

Ranked by the mobile impressions of the routes each one affects. Mobile is 84 % of
clicks (12,502 impressions / 1,137 clicks / CTR 9.09 % / avg position 7.86).

---

### F1 — Global footer: 50 links per page with hit boxes of 17 px and 24 px
**Affects all 8 routes → the full 12,502 mobile impressions.**

| File | Line | Measured hit box | Count |
| --- | --- | --- | --- |
| `src/platform/navigation/Footer.jsx` | **130** | **88.1 × 17** @360, 67.6 × 17 @390 | 32 |
| `src/platform/navigation/Footer.jsx` | **107** | **54 × 24** @360, 45.2 × 24 @390 | 18 |

Line 130 is a bare inline `<a>` (`text-sm font-medium leading-6`). `line-height` does
not give an *inline* element a taller box, so the touch target is the 17 px font box —
**39 % of the 44 px minimum**, the second-worst measured on the site. Line 107 is
`inline-flex` with `leading-6` and no `min-height`, so 24 px.

These 50 links dominate the sub-44 px population on every content route:

| Route @360×640 | effectively < 44 px | of which are these 50 footer links |
| --- | --- | --- |
| `/tools/all/step-counter` | 55 | 50 (91 %) |
| `/tools/all/age-gender-detector` | 56 | 50 (89 %) |
| `/tools/all/utm-link-builder` | 56 | 50 (89 %) |
| `/tools/all/wheregoes-tool` | 63 | 50 (79 %) |
| `/` | 67 | 50 (75 %) |
| `/news` | 74 | 50 (68 %) |
| `/blogs` | 76 | 50 (66 %) |
| `/tools/calculators` | 610 | 50 (8 %) |

**How "effectively" was measured.** A border box under 44 px is not automatically a
defect — `.tool-save-button` (`src/app/tools/tools-directory.css:1483-1502`) is 34 × 34
but carries an `::after { inset: -6px }` expander. So each undersized element was
re-probed with `document.elementsFromPoint` at ±21 px from its centre in all four
directions; it counts as a defect only if the element does not receive the touch there.
On `/tools/calculators` that rescued **24** elements (646 border-box failures → 610
effective). **None of the 50 footer links is rescued.**

Fixing one file removes 50 defects from every page on the site.

---

### F2 — `/tools/calculators`: 503 category-index anchors at 328 × 32 px, plus the only iOS-zoom input on the site

**F2a — the anchor list.** `src/app/tools/[category]/page.jsx:219`

```
className="block py-1.5 text-sm text-[var(--muted-foreground)] transition-colors …"
```

`py-1.5` (6 px) + `text-sm` line box (20 px) = **32 px tall**, measured 328 × 32 on 503
anchors at 360×640. At `columns-1` on a phone they stack with no gap, so 503 rows sit
12 px under the minimum with adjacent targets 32 px apart. This single line is 82 % of
the route's 610 effective failures and is the largest tap-target defect on the site by
count.

**F2b — the search field iOS will zoom into.** `src/app/tools/tools-directory.css:1140`

```
.tools-category-search input { … height: 40px; font-size: 12px; }
```

Measured `getComputedStyle(...).fontSize === "12px"`, box 302 × 40. **This is the only
`input`/`select`/`textarea` under 16 px across all 8 routes at both widths** — every
other field measured ≥ 16 px.

The global guard already exists at `src/app/globals.css:273-279`:

```
@media (pointer: coarse) { input:not([type="checkbox"], …) { font-size: max(1rem, 1em); } }
```

`input:not([type="…"])` is specificity (0,1,1) and `.tools-category-search input` is
also (0,1,1), so the later rule wins — the exact failure the guard's own comment
documents for `.alt-ui-input`, repeated here. Adding the size to the guard's
`:not()` chain, or raising the declaration to 16 px, fixes it.

**F2c — other undersized controls on this route** (real, but lower volume):

| Selector | File:line | Measured | Count |
| --- | --- | --- | --- |
| `.tool-open-link` | `src/app/tools/tools-directory.css:1574` (`font-size: 12px`, no padding) | 52.7 × 34 | 24 |
| sidebar category buttons | `src/app/tools/tools-directory.css:1171-1190` (`padding: 9px 10px`) | 302 × 37.7 | 23 |

---

### F3 — `/news`: 4-pixel-tall carousel dots, and 20 px save buttons
**`/news` — the smallest interactive elements measured anywhere in this sweep.**

`src/app/news/components/NewsHome.jsx:79-85`

```jsx
className={`rounded-full transition-all ${i === current ? "w-[22px] bg-[var(--primary)]" : "w-[10px] bg-white/40 …"}`}
style={{ height: 4 }}
```

Measured **10 × 4 px** (×4) and **22 × 4 px** (×1) at both 390×844 and 360×640. The
inline `style={{ height: 4 }}` *is* the hit box; there is no padding wrapper and no
pseudo-element expander (verified — not rescued by the `elementsFromPoint` re-probe).
4 px is 9 % of the minimum.

Same route, same class of defect:

| Element | File:line | Measured | Count |
| --- | --- | --- | --- |
| "Save" icon button | `src/app/news/components/NewsHome.jsx:535`, `src/app/news/components/NewsListing.jsx:183` | 20 × 20 | 6 |
| "Save" icon button | `src/app/news/components/NewsHome.jsx:625`, `src/app/news/components/NewsListing.jsx:271` | 24 × 24 | 4 |
| "View All" links | `src/app/news/components/NewsHome.jsx:406`, `NewsListing.jsx:354,428` | 57.8 × 22.5 | 3 |
| carousel scroll arrows | `src/app/news/components/CategoriesSection.jsx:57,85` (`h-9 w-9`) | 36 × 36 | 2 |

---

### F4 — `/news`: the 20 px `<main>` overhang is **benign** — chased down and cleared

Recording this because the number looks alarming and someone will re-find it.

`main.min-w-0` (`src/app/news/layout.jsx:47`) measures a constant overhang at both
widths:

* 390×844 — `scrollWidth 370`, `clientWidth 350` → **+20 px**
* 360×640 — `scrollWidth 340`, `clientWidth 320` → **+20 px**

The single element responsible is `src/app/news/components/CategoriesSection.jsx:85`,
`absolute -right-5 … h-9 w-9` — `-right-5` is −1.25 rem = **−20 px**, exactly the
observed delta. It is the category carousel's "Scroll right" button, deliberately hung
into the 20 px gutter that `.news-page`'s `px-5` (`src/app/news/layout.jsx:37`)
provides.

**It is not lost, and my first reading of it was wrong.** Direct measurement of both
arrows:

| Width | Arrow | rect | px past viewport L / R | centre receives touch |
| --- | --- | --- | --- | --- |
| 360×640 | Scroll left | 0 → 36 | 0 / 0 | **yes** |
| 360×640 | Scroll right | 324 → 360 | 0 / 0 | **yes** |
| 390×844 | Scroll left | 0 → 36 | 0 / 0 | **yes** |
| 390×844 | Scroll right | 354 → 390 | 0 / 0 | **yes** |

Both are fully inside the viewport and both are hit-testable at their centre
(`document.elementsFromPoint`). No content is lost on `/news`. **No action** — except
that at 36 × 36 they belong to the tap-target list in F3.

The general lesson for anyone repeating this sweep: an element-level
`scrollWidth - clientWidth` is a *lead*, not a finding. It has to be resolved to the
specific element and then checked against the viewport before it counts.

---

### F5 — `/tools/all/utm-link-builder`: the tool card clips its own content, and the tool ignores the design system

**F5a — the "Reset" button is cut in half at 360 px.**

The card at `src/tools/utm-link-builder/components/Main.jsx:244` is `overflow-hidden`
and measures `scrollWidth - clientWidth` = **59 px at 360×640, 29 px at 390×844**. The
workspace shell above it does not absorb any of it — the shell's own delta measured
**0** on this route at both widths, so it is not scrollable away.

A second pass walked every element in `<main>` to its nearest clipping ancestor and
compared right edges, to find what is *actually* lost rather than what merely widens
the scroll area. The answer is narrower than the 59 px suggests, and worth stating
precisely:

* **360×640 — exactly one element is destroyed: the "Reset" button loses 12.2 px**
  (`src/tools/utm-link-builder/components/Main.jsx:292-297`).
* **390×844 — zero elements lost.** The defect exists only at the narrow width.

The cause is the progress strip at
`src/tools/utm-link-builder/components/Main.jsx:285` — `flex items-center gap-4 … px-5`
with a `shrink-0` label, a `flex-1` bar and a `shrink-0` button, and no wrap. At 360 px
the row cannot fit, and because both end items are `shrink-0` the overflow lands on the
button, which the `overflow-hidden` card then clips.

**F5b — hardcoded palette.** 27 occurrences of raw Tailwind palette classes under
`src/tools/utm-link-builder/` (`bg-white`, `bg-slate-50/50`, `text-slate-900`,
`border-slate-200`, `bg-indigo-50`, `from-indigo-500 via-purple-500 to-pink-500`),
starting at `Main.jsx:240,244,246,253,262,265`. `master.md` requires semantic tokens
and light + dark on every screen; this tool renders a hardcoded white card regardless
of theme.

---

### F6 — Layout shift: the mobile inline-ad slot reserves no height

Measured with a `PerformanceObserver({type:'layout-shift', buffered:true})` at
360×640, 5 s after `networkidle`:

| Route | CLS | Largest shift source |
| --- | --- | --- |
| `/tools/all/utm-link-builder` | **0.8325** | `div`, `div.mt-6` |
| `/tools/all/wheregoes-tool` | **0.1600** | `div.mt-6` |
| `/tools/all/step-counter` | **0.1563** | `div.mt-6` |
| `/tools/all/age-gender-detector` | **0.1563** | `div.mt-6` |
| `/` | 0 | — |
| `/tools/calculators` | 0 | — |
| `/blogs` | 0 | — |
| `/news` | 0.0108 | `div.mx-auto.w-full` |

`div.mt-6` is `src/app/tools/[category]/[slug]/ToolDetailChrome.jsx:116` — the wrapper
holding the H1 and **all** the indexable prose on a tool page. It is pushed down by the
sibling above it: `src/app/tools/[category]/[slug]/ToolDetailChrome.jsx:102`

```jsx
<RouteLazySection className="mx-auto mt-6 w-full max-w-6xl" idleDelay={2500}>
```

`RouteLazySection` (`src/components/ui/RouteLazySection.jsx:56`) applies a placeholder
height **only when a `minHeight` prop is passed**. This call site passes none, while
the bottom-banner call at line 119 does pass `minHeight={120}`. The child it reveals
after 2.5 s is `AdInlineCard`, which is a fixed
`h-[250px] w-[300px]` (`src/ads/layouts/tools/AdInlineCard.jsx:29`) — a known,
constant size that could be reserved exactly.

The in-code comment at `ToolDetailChrome.jsx:95-99` justifies omitting `minHeight`
because "at ≥97rem both in-flow slots collapse to 0". That is true on desktop; below
48 rem — phones, i.e. 84 % of this site's clicks — the slot does render 250 px, late,
with nothing held for it. 0.1563 is over the 0.1 "good" CWV threshold on the site's two
highest-traffic pages (3,379 + 3,196 impressions).

**Confirmed by a natural experiment.** Ads are served from Firestore, so a given load
may or may not get one. A repeat run recorded per-shift timing and rects:

* `/tools/all/step-counter` — inline ad present, measured **328 × 250**; a single
  layout-shift entry at **t = 3,144 ms** (just past the 2,500 ms `idleDelay`),
  source `div.mt-6`. CLS 0.1563.
* `/tools/all/age-gender-detector` — **no ad served on that load**; the inline slot
  measured `null`, **zero layout-shift entries**, CLS 0.

Ad present → 0.1563. Ad absent → 0. Same page, same viewport, same probe.

`/tools/all/utm-link-builder` at 0.8325 is 8× the threshold; there the same
`div.mt-6` is displaced by the whole `ssr:false` tool body (2,185 px) arriving late,
so the fix is a reserved height for the tool mount as well as for the ad.

*Caveat, stated because it matters:* these are dev-server numbers. Dev serves unbundled
chunks and different timing, so production CLS will differ in magnitude. The
**structural** cause — an unreserved, delayed 300×250 insertion above the page's main
prose — is a property of the source, not of the dev server.

---

### F7 — `/blogs`: three undersized control clusters

| Element | File:line | Measured @360 | Count |
| --- | --- | --- | --- |
| featured-carousel dots | `src/app/blogs/components/BlogExplorerClient.jsx:485` (`h-8 … px-1`) | 14 × 32 and 32 × 32 | 5 |
| filter pills | `src/app/blogs/components/BlogExplorerClient.jsx:913` (`h-8`) | 79.1 × 32 | 8 |
| hero shortcut pills | `src/app/blogs/page.jsx:97` and `:108` (`h-9`) | 127.6 × 36 | 6 |
| lane eyebrow / "Quick Search" labels | `src/app/blogs/page.jsx:91`, `:270` (`text-[10px]`) | 10 px text | 5 |

`/blogs` is otherwise clean: no lost overflow, CLS 0, 27 images all with reserved boxes.

---

### F8 — Where the primary content starts (top offset of main content)

Measured as the document-space `top` of the first visible block inside `<main>`, which
on a 640 px phone with a 57 px sticky header decides what the visitor actually sees.

| Route | `<main>` top | first visible block | what it is |
| --- | --- | --- | --- |
| `/tools/all/step-counter` | 65 | **66** | `h2 "Step counter"` — tool is first, good |
| `/tools/all/age-gender-detector` | 65 | **65** | `h1 "Age & Gender Detector"` — good |
| `/tools/all/wheregoes-tool` | 65 | **65** | `h1 "URL Redirect Checker"` — good |
| `/blogs` | 57 | **81** | `h1 "AltFTool Blog"` |
| `/tools/calculators` | 57 | **89** | `h1 "Ready to find your perfect tool?"` |
| `/` | 57 | 113 / **165** | badge / `h1` |
| `/tools/all/utm-link-builder` | 65 | **167** | `h1 "UTM Builder"` — 102 px of card chrome first |
| `/news` | 57 | **506** | first readable headline |

`/news` is the outlier by an order of magnitude. `src/app/news/components/NewsHome.jsx:40`
pins the hero slider to a fixed `h-[530px]`, and the headline is absolutely positioned
at its bottom, so on a 360×640 phone the visitor's entire first screen is one photo and
a "Top Story" badge, with the first words of news landing at y=506 of a 583 px content
viewport. The second story is entirely below the fold.

The three tool pages are the best result in the table and reflect the deliberate
fold-first ordering documented at `ToolDetailChrome.jsx:72-79`. No change needed there.

---

### F9 — `position: fixed` and the safe area — **verified compliant, no defect**

Six to eight fixed/sticky elements per route, consistently:

| Element | File:line | Height @360 |
| --- | --- | --- |
| `a.skip-to-content` (fixed) | — | 44 |
| `header#main-header` (sticky, top:0) | — | 57 |
| `nav.fixed.inset-x-0.bottom-0.z-[80]` | `src/platform/navigation/MobileNav.jsx:330` | 57 |
| 3 × full-screen nav sheets | `src/platform/navigation/MobileNav.jsx:146` | 640 |
| `aside[data-testid="newsletter-prompt"]` | `src/platform/consentalerts/NewsletterSubscribeDialog.jsx:137` | 158 |

`env(safe-area-inset-bottom)` **is** respected, in code and in the live stylesheets
(4–5 matching CSS rules found in `document.styleSheets` on every route):

* `src/platform/navigation/MobileNav.jsx:332` — bottom nav `paddingBottom: env(safe-area-inset-bottom, 0px)`
* `src/platform/navigation/MobileNav.jsx:326` — `body { padding-bottom: calc(nav-height + env(safe-area-inset-bottom,0px)) }`
* `src/app/globals.css:243` — `body > footer { padding-bottom: env(safe-area-inset-bottom) }`
* `src/platform/consentalerts/NewsletterSubscribeDialog.jsx:137` — `bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]`
* viewport meta measured as `width=device-width, initial-scale=1, viewport-fit=cover`
  (`src/app/layout.jsx:207-212`) — without `viewport-fit=cover` all of the above would
  evaluate to 0.

Headless Chromium reports every inset as `0px` because it emulates no notch, so this is
a code-and-rule verification rather than a device measurement — but the rules are
present and correct. **No action.**

One measured cost worth naming: the 57 px sticky header plus the 57 px fixed bottom nav
permanently occupy **114 px of a 640 px viewport — 17.8 %.**

---

### F10 — `100vh`: present, and measured to be inert on these 8 routes

Two of the eight routes carry an unguarded `100vh` (no `100svh` companion):

* `src/app/news/news-theme.css:5` — `.news-page { min-height: 100vh; }`
* `src/tools/utm-link-builder/components/Main.jsx:240` — `min-h-screen`

Both were measured. `.news-page` computes `min-height: 640px` while the element is
**6,327 px** tall; the utm-link-builder root computes `640px` while the element is
**2,185 px** tall. The `min-height` never binds, so neither produces the phantom-scroll
symptom on these routes today. Worth correcting for consistency with the pattern
already used at `src/app/globals.css:207-208` and `:553-554`, but this is hygiene, not
a live defect — do not spend the 44 px-target budget here first.

For contrast, `.route-page-shell` (`src/app/globals.css:553-554`) and `body`
(`src/app/globals.css:207-208`) already do the `100vh` → `100svh` pair correctly.

---

### F11 — Text under 14 px

Every route carries 12–32 distinct sub-14 px text groups. The two floors, both global:

* **10 px** — `src/app/blogs/page.jsx:91` (`text-[10px]` "Quick Search"),
  `src/app/blogs/page.jsx:270` (lane eyebrows), `span.tool-tag` on `/tools/calculators`
  (×26), `dt.text-[10px]` age/confidence labels on `/tools/all/age-gender-detector`
  (×20 across three groups), "Sponsored" badges on all four tool pages,
  `src/tools/utm-link-builder/components/Main.jsx:253`.
* **11 px** — breadcrumb `span.text-[0.6875rem]` (×4, every route),
  `span.text-[11px]` "Top N" pills on tool pages (×6).

Counts of distinct sub-14 px groups per route @360×640: `/` 12, `/tools/calculators`
19, `/tools/all/step-counter` 18, `/news` 18, `/tools/all/wheregoes-tool` 23,
`/tools/all/age-gender-detector` 27, `/blogs` 31,
`/tools/all/utm-link-builder` 32.

This is a design-system decision rather than a bug, and 10 px is used for badges and
eyebrows rather than body copy, so it is listed last. The one place small text is
unambiguously a defect — a form field at 12 px that makes iOS zoom — is F2b.

---

### F12 — Images without intrinsic dimensions

`src/components/ui/ManagedImage.jsx:41` renders a raw `<img>` with no `width`/`height`
and no `next/image`, by design (remote/Firestore URLs). Counts of dimensionless,
non-`next/image` images: `/news` 11, `/tools/calculators` 6, each tool page 4 (ad
creatives), `/` 0, `/blogs` 0.

**These are not causing layout shift.** `/news`, `/tools/calculators` and `/blogs` all
measured **CLS 0** (F6) because each image sits inside a parent with a definite height
(`h-full w-full object-cover`). Reporting them as a CLS risk without the CLS number
would have been wrong; the measured shift on this site comes from the unreserved ad
slot in F6, not from these images.

---

## Clean results (stated once, not padded)

* `/` — no lost overflow, CLS 0, no images without reserved boxes, no field under
  16 px. Its 67 undersized targets are 50 footer links plus 17 near-misses at 38–40 px
  (`src/platform/assistant/AiAssistantBox.jsx:136,204` at `min-h-9` = 38 px;
  `src/app/(marketing)/components/{CategoriesSection.jsx:79, FAQSection.jsx:58,
  TrendingSection.jsx:89}` and `IntentSelector.jsx:59` at `min-h-10` = 40 px).
* `/tools/all/step-counter` — apart from the global footer and F6's CLS, clean: 55
  effective failures of which 50 are the footer, 0 lost overflow, no undersized fields,
  content starts at y=66.
* `/tools/all/age-gender-detector` — same; 56 effective failures, 50 of them the
  footer. The 14 px/44 px workspace-shell overflow already on record is *scrollable*:
  the shell measured `scrollWidth 372 / clientWidth 328` at 360×640 and **zero elements
  clipped**, so nothing is lost. The open issue there remains the two-axis-scroll side
  effect, not content loss — and that is confirmed here: the shell computes
  `overflow-x: auto` **and `overflow-y: auto`** on every tool page measured
  (`ToolDetailChrome.jsx:84`), including the ones whose horizontal delta is 0.

---

## Suggested order of work

1. `src/platform/navigation/Footer.jsx:107,130` — one file, −50 defects on every page.
2. `src/app/tools/[category]/page.jsx:219` — one class change, −503 defects on the
   category pages.
3. `src/app/tools/[category]/[slug]/ToolDetailChrome.jsx:102` — add `minHeight={250}`;
   CLS 0.156 → ~0 on the two highest-traffic pages.
4. `src/app/tools/tools-directory.css:1140` — 12 px → 16 px; removes the only iOS
   focus-zoom on the eight routes.
5. `src/app/news/components/NewsHome.jsx:79-85` — 4 px dots.
6. `src/tools/utm-link-builder/components/Main.jsx:285` — let the progress strip wrap
   so "Reset" stops being clipped at 360 px; then the 27 hardcoded palette classes.

Explicitly **not** on this list, because they were measured and cleared: the 20 px
`<main>` overhang on `/news` (F4), the `100vh` declarations on `/news` and
`/tools/all/utm-link-builder` (F10), the dimensionless `ManagedImage` tags (F12), and
safe-area handling (F9).

---

## Reproduction

Probes and runners are in the session scratchpad
(`…/scratchpad/mobsweep/{probe,probe2,probe3,probe4,probe5,probe6}.js`,
`run.mjs` … `run8.mjs`); raw output in `results.json`, `results2.json`,
`results3.json`, `results4.json`, `results6.json`, `cls.json`, `cls2.json`,
`arrows.json`.

Method notes worth keeping:

* Each width used a **fresh browser context**, so media queries and any
  `matchMedia`-driven layout resolved at the correct width on first paint — resizing an
  existing page does not fire those listeners.
* Tool runtimes load with `ssr: false`, so every probe waited for `networkidle` plus a
  further 4 s (8 s for the CLS-source pass) before reading the DOM.
* Tap targets were counted by **effective** hit area (`elementsFromPoint` at ±21 px),
  not border box, so pseudo-element expanders are not reported as defects.
* Every byte/timing figure here is from the **dev server** and is not a production
  measurement; the geometry figures (box sizes, offsets, computed styles) are not
  dev-specific.
