# AltF Bazaar — accessibility and Core Web Vitals audit

Scope: every route under `/bazaar`. Audit-and-repair pass, not a feature.
Everything below is either a **measurement** (stated with its number and the
conditions it was taken under) or, where labelled, an **inference** from the
source. Where a check could not be run, it says so instead of guessing.

---

## 1. How this was measured

| | |
|---|---|
| Build under test | production build in `.next`, `BUILD_ID` `HBtqmN664PLrsf9Eag71H`, served with `next start` on `:3045` |
| Browser | `chrome-headless-shell` 1217 (the Playwright-cached Chromium), driven over raw CDP from Node 24 |
| Why not axe / Lighthouse | neither is installed and the wave forbids `npm install`, so all eight checks below are hand-written page JS. Harness scripts live in this session's scratchpad, not in the repo |
| Viewports | 1280×900 and 360×780 |
| Themes | light and dark, selected by seeding `localStorage.appThemeMode` **before** first paint so the app's own `theme-init` script sets `data-theme` *and* `style.colorScheme` — setting only one of them produces false positives on native controls |
| Pages | `/bazaar`, `/bazaar/c/cars`, `/bazaar/item/2012-hyundai-i20-sportz-bhopal-101`, `/bazaar/search?q=iphone`, `/bazaar/post`, `/bazaar/compare`, `/bazaar/in/mumbai`, `/bazaar/trending` |
| Settle time | 4 s after `load` before probing, so hydration and lazy images are done |

**Two limits worth stating up front.**

1. **The fixes in §5 could not be re-measured on a production build.** Four other
   agents were editing this tree concurrently; rebuilding would have picked up
   their in-flight work and replaced the `.next` other people were measuring
   against. The fixes were instead verified end-to-end on the dev server another
   agent already had running on `:3040`, which serves live source. Structural,
   keyboard and colour results transfer from dev to prod unchanged. **CLS and LCP
   numbers do not**, and no post-fix vitals number is claimed anywhere below.
2. Two findings (§4.7, §4.8) appear only on the dev server. They come from
   components that are not in the audited build — `BazaarSearchBar`'s combobox
   and `ListingMap` — i.e. other agents' in-flight work. They are reported for
   those owners, not fixed here.

### The colour-measurement gotcha, because it changed the answer

The first pass resolved colours by regex-parsing `getComputedStyle().color`.
That silently dropped every value Chrome reports as `color-mix(…)` — which is
how `bazaar.css` defines `--bzr-muted`, `--bzr-soft`, `--bzr-shell`,
`--bzr-media` and `--bzr-card`. The card meta text, the hero subtitle and the
soft-surface panels were therefore **not measured at all** on the first run, and
three real failures were invisible. It also produced four false failures by
treating gradient-filled buttons and image-overlay pills as having no
background.

The numbers in §3 come from a second pass that pushes every colour through a
1×1 `<canvas>` so `color-mix`, `color(srgb …)` and `oklch` all arrive as sRGB
bytes, composites `rgba` layers up the ancestor chain, and reads gradient stops
off the live element. **If you re-run this audit, use that method** — the naive
one is confidently wrong here.

---

## 2. Accessibility — the clean results

Measured on the production build, all eight pages, both themes. These are
genuinely good and are recorded so a regression is visible:

| Check | Result |
|---|---|
| Images with no `alt` | **0** across 102 `<img>` elements on the eight pages |
| Decorative images | correct: leaflet tiles and every `aria-hidden` icon carry `alt=""` |
| Interactive elements with no accessible name | **0** of 1,541 visible interactive elements (name computed via `aria-labelledby` → `aria-label` → `<label>`/`labels` → content incl. descendant `alt` → `title`) |
| Form controls without a real label | **0** — no control relies on `placeholder` alone |
| Exactly one `<h1>` | yes, on all eight |
| Dangling `aria-labelledby` / `aria-describedby` / `aria-controls` | **0** on the built version (see §4.7 for a dev-only regression) |
| Invalid `role` values | **0** |
| `aria-pressed` / `aria-expanded` / `aria-selected` on wrong elements, or with invalid values | **0** |
| Duplicate `id`s | **0** |
| `<main>` landmarks per page | exactly 1 |
| `html lang` | `en` |

### Focus visibility — passes

Walked with real `Input.dispatchKeyEvent` Tab presses, up to 320 stops per page,
then diffed each stop's computed `outline` / `box-shadow` / `background` /
`border` / `text-decoration` **while focused** against the same element
**unfocused**. A static box-shadow therefore cannot be mistaken for a focus
indicator, which the first version of the check would have done.

- **0 of 2,285 focus stops** had no style change on focus — 689 of those stops
  were inside `.bazaar-page`, the rest site chrome.
- 34 distinct Bazaar focus indicators; 31 of them are `outline: solid 2px
  rgb(13,148,136)` at `outline-offset: 2px`.
- That indicator measures **3.53:1** against the page background
  `rgb(247,248,251)` — over the 3:1 WCAG 2.2 SC 1.4.11 needs for a non-text
  indicator. Passes, but with only 0.53 of headroom.

### Dialog focus traps — three of four passed

Each dialog opened by clicking its real trigger, then 45 Tab presses, then
Escape:

| Dialog | Focus moved in | Tab escapes | Escape closes | Focus restored to trigger |
|---|---|---|---|---|
| Gallery lightbox | yes | 0 / 45 | yes | yes |
| Report ad | yes (first radio) | 0 / 45 | yes | yes |
| Share sheet | yes | 0 / 45 | yes | yes |
| **Mobile filter sheet** | **no** | **45 / 45** | yes | **no** |

The filter sheet is finding §4.1. The offer dialog named in the brief
(`MakeOfferDialog.jsx`) **exists in source but is not in the audited build**, so
it was not tested — do not read the three passes above as covering it.

---

## 3. Colour contrast — measured, both themes

Sampled every element in `<main>` with a direct non-empty text node, on six
pages, in both themes; deduplicated by class + resolved foreground + composited
background + size + weight. Threshold 4.5:1 normal, 3:1 for ≥24px or ≥18.66px
bold.

Sizes below are **computed**, not what the class names imply. On `<button>`
elements the two disagree, for the reason in §4.9; it never moves a verdict
across a threshold, but it explains rows like "16px/400" on an element whose
class list says `text-xs font-semibold`.

### 3a. The prediction in the brief was half right

The brief expected muted meta text to be an offender. On the plain surfaces it
is **not**:

| Foreground | Surface | Ratio |
|---|---|---|
| `--muted-foreground` rgb(96,112,131) | `--background` rgb(247,248,251) | **4.77:1** pass |
| `--muted-foreground` | `--card` rgb(255,255,255) | **5.07:1** pass |
| `--bzr-muted` rgb(104,109,120) | `--card` | **5.19:1** pass |
| `--muted-foreground` (dark) rgb(148,163,184) | `--background` rgb(7,13,24) | **7.58:1** pass |

It fails only where the same token is put on Bazaar's *tinted* surfaces, which
is a real and easily-missed defect:

| Foreground | Surface | Ratio | Where |
|---|---|---|---|
| `--muted-foreground` | `--bzr-media` rgb(229,230,234) | **4.06:1** fail | `/bazaar/item` — "Approximate area only …" under the map |
| `--muted-foreground` | `--bzr-soft` rgb(231,241,243) | **4.41:1** fail | `/bazaar` hero subtitle and the "live ads" stat labels |
| `--muted-foreground` | `--bzr-shell` rgb(240,245,248) | 4.62:1 pass (barely) | the browse shell strip |

Dark theme passes on all three tinted surfaces (5.69 / 6.22 / 6.98:1). This is a
**light-theme-only, token-level** problem: 4.77:1 on the plain background leaves
0.27 of headroom, so any tint at all pushes it under.

### 3b. Badge pills — the brief's other prediction, confirmed, and worse in dark

`.bzr-badge` variants set a bright fill and `color: #fff`:

| Badge | Light | Dark |
|---|---|---|
| `.bzr-badge-urgent` white on rgb(239,68,68) / rgb(248,113,113) | **3.76:1** fail | **2.77:1** fail |
| `.bzr-badge-free` white on rgb(22,163,74) / rgb(74,222,128) | **3.30:1** fail | **1.74:1** fail |
| `.bzr-badge-verified` white on rgb(14,165,233) / rgb(56,189,248) | **2.77:1** fail | **2.14:1** fail |
| `.bzr-badge-featured` **rgb(31,19,0)** on rgb(245,158,11) / rgb(251,191,36) | 8.49:1 pass | 10.93:1 pass |

All at 9.9px/700, which needs 4.5:1. `--bzr-free` at 1.74:1 in dark theme is
white text on mint green — effectively unreadable.

**The fix already exists in the same file.** `.bzr-badge-featured` uses a dark
ink on its bright fill and clears the threshold in both themes by a wide margin.
The other three need the same treatment. I did not apply it: the rule lives in
`bazaar.css`, which this wave forbids me to edit, and there is no
theme-independent dark-ink token to reach for from JSX (`--foreground` inverts
with the theme, and a raw hex in a `className` breaks the no-raw-hex rule).
Recommended one-line changes for the file's owner, `bazaar.css` lines 265–281:

```css
.bzr-badge-urgent   { color: #2a0505; }  /* from #fff */
.bzr-badge-free     { color: #04210f; }
.bzr-badge-verified { color: #041f2e; }
```

### 3c. The Sell CTA — the worst single failure, on every page

`.bzr-btn-sell` in the sticky sub-header, `--primary-foreground` text on
`linear-gradient(135deg, var(--primary), var(--secondary))`. Gradient stops read
off the live element, contrast computed against each:

| Theme | Text | Stop 1 | Stop 2 |
|---|---|---|---|
| Light | white | rgb(13,148,136) → **3.74:1** | rgb(34,211,238) → **1.81:1** |
| Dark | rgb(7,17,31) | rgb(45,212,191) → 10.17:1 | rgb(34,211,238) → 10.48:1 |

At 14.4px/800 it needs 4.5:1, so in light theme the label fails across the whole
sweep and is at 1.81:1 over the cyan end. Dark theme is fine because
`--primary-foreground` inverts to near-black there.

Not fixed: the gradient is in `bazaar.css` and the text colour is a global
token. The cheapest correct change is to make `.bzr-btn-sell` set an explicit
dark ink like `.bzr-badge-featured` does, rather than inherit
`--primary-foreground`.

### 3d. `--primary` as small text — fixed

| | Light | Dark |
|---|---|---|
| `--primary` rgb(13,148,136) on `--background` | **3.53:1** fail | 10.45:1 pass |
| `--primary` on `--bzr-shell` rgb(240,245,248) | **3.41:1** fail | pass |
| `--primary-text` rgb(15,118,110) on `--background` | **5.15:1** pass | 10.45:1 pass |

`--primary-text` is a first-class token (`globals.css` lines 30 and 87) that
`.bzr-section-link` already uses, and it resolves to `--primary` in dark theme —
so switching to it changes light theme only. Applied in §5.4.

### 3e. Everything else that fails, and why it is not mine

| Element | Light | Dark | Owner |
|---|---|---|---|
| `.bzr-btn` white on `--primary` — "Next", "Chat with seller", "Browse Bazaar" | **3.74:1** fail | 10.17:1 pass | global `--primary` / `--primary-foreground` pair; site-wide, not Bazaar |
| `.bzr-chip.is-active`, `.bzr-step-dot` (same pair) | **3.74:1** fail | 10.17:1 pass | same |
| `p.bzr-card-price.is-free` — `--bzr-free` on the card | **3.30:1** fail | 11.16:1 pass | `bazaar.css:181` |
| Site header "Bazaar" nav item, `--primary` on `--muted` | **3.35:1** fail | pass | `platform/navigation` |

The `.bzr-btn` result means the **"Try again" button in the new error boundary
also measures 3.74:1**. It is inheriting the vertical's primary-button style
deliberately rather than inventing a private one; it will clear 4.5:1 the moment
the token pair does.

**Four failures reported by the naive first pass are false and are listed here
so nobody chases them:** the site logo wordmark (gradient-clipped text), the
`.bzr-btn-sell` label measured against the page background instead of its
gradient, and the two gallery overlay pills ("Tap to enlarge", "1 / 4") — those
two do have a `bg-black/65` scrim and pass once `rgba` compositing is applied.

---

## 4. Findings

### 4.1 The mobile filter sheet is a keyboard trap in reverse — FIXED

`role="dialog" aria-modal="true"` with none of the behaviour that claim implies.
Measured on `/bazaar/c/cars` at 360×780, sheet opened by clicking its real
trigger:

- focus stayed on `<body>` when the sheet opened;
- **45 of 45** Tab presses landed on controls *behind* the sheet — the sort
  `<select>`, "Save this search", every card's heart button, every card title
  link — while the sheet still covered the entire screen;
- Escape did close it, but focus went to whatever card the Tab walk had reached,
  not back to the Filters button.

A screen-reader user is told the dialog is modal and then walked through a page
they cannot see. Severity: highest a11y finding in the vertical.

### 4.2 Heading order skipped h1 → h3 on the browse pages — FIXED

Measured heading sequences:

| Page | Sequence | Verdict |
|---|---|---|
| `/bazaar/c/cars` | h1 → h3 ×24 → h3 | **skip** |
| `/bazaar/search?q=iphone` | h1 → h3 ×6 | **skip** |
| `/bazaar` | h1 → h2 → h2 → h3 ×n | fine |
| `/bazaar/item/…` | h1 → h2 ×7 → h3 ×8 | fine |

Card titles are `h3`, which is right on home and the detail page because a
visible `h2` section head precedes them. The two `BrowseView` pages had no `h2`
at all, so the outline jumped a level and offered no "here are the results"
landmark to anyone navigating by heading.

### 4.3 195 Tab presses to reach the first ad — FIXED

Counted with real Tab presses, from page load and again after activating the
existing global "Skip to main content" link:

| Page | Viewport | Tabs to first result card (cold) | …after the global skip link |
|---|---|---|---|
| `/bazaar/c/cars` | 1280 | **195** | **61** |
| `/bazaar/search?q=iphone` | 1280 | 156 | 22 |
| `/bazaar/in/mumbai` | 1280 | 222 | 88 |
| `/bazaar/c/cars` | 360 | 27 | 21 |

The global link targets `#main-content`, which on a browse page is still above
the Bazaar sub-header, the locale strip, the breadcrumbs and the filter rail —
and the cars rail alone is **41 focus stops**. Repeated on every category page,
every time. WCAG 2.4.1 exists for exactly this. Fixed for the `BrowseView`
pages; `/bazaar/in/[city]` still measures 88 and is noted in §6.

### 4.4 CLS: the browse pages shift by 0.21–0.32 at 360px — NOT FIXED, root cause proven

The headline vitals finding. Measured CLS via `PerformanceObserver` on
`layout-shift`, buffered, production build:

| Page | 1280 light | 1280 dark | 360 run A | 360 run B |
|---|---|---|---|---|
| `/bazaar` | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| `/bazaar/c/cars` | 0.0111 | 0.0000 | **0.2200** | **0.2111** |
| `/bazaar/item/…` | 0.0002 | 0.0000 | 0.0000 | 0.0000 |
| `/bazaar/search?q=iphone` | 0.0000 | 0.0000 | 0.0000 | **0.3167** |
| `/bazaar/post` | 0.0003 | 0.0000 | 0.0000 | 0.0000 |
| `/bazaar/compare` | 0.0000 | 0.0000 | 0.0367 | 0.0367 |
| `/bazaar/in/mumbai` | 0.0000 | 0.0000 | 0.0275 | 0.0000 |
| `/bazaar/trending` | 0.0000 | 0.0000 | 0.0000 | 0.0000 |

0.1 is the "good" ceiling and 0.25 the "poor" floor, so `/bazaar/search` at
0.3167 is poor and `/bazaar/c/cars` at 0.21 is not good. It is **timing
dependent, not random** — six isolated runs of `/bazaar/c/cars` at 360 with the
HTTP cache disabled, 4× CPU throttling and 10 Mbps all measured 0.0000 (four
completed before the harness timed out). It reproduces when the page is loaded
warm and fast, which is when the browser paints earliest.

**Root cause, measured rather than inferred.** The single shift on
`/bazaar/c/cars` is one entry of +0.21105, and its sources are the LinkCloud
`div.mt-12.border-t` moving from `[16,536 328×173]` to an empty rect, and the
footer likewise. Both are pushed out of the viewport by content appearing above
them. Byte offsets in the prerendered HTML say what that content is:

```
/bazaar/c/cars static HTML: 473,285 bytes
  <footer …>                 at   41,217
  hidden Suspense containers at   85,977 · 210,381 · 235,833 · 261,285 · 271,665
  LinkCloud div.mt-12        at  270,714
  first .bzr-grid            at  283,476   ← inside <div hidden id="S:4">
  $RC("B:4","S:4")           swaps it into place
```

The grid markup sits **after** the LinkCloud, inside the hidden `S:4` container.
So the browser lays out and paints the page *without* the 24 cards — FCP was
measured at 228 ms in one run — the LinkCloud and footer sit at y≈536 and y≈773,
and then `$RC` moves ~190 KiB of card markup into the boundary and everything
below jumps thousands of pixels. `/bazaar/search` is the same shape (grid at
byte 276,262 of 350,303).

That is the direct cost of `fallback={null}`, chosen in blueprint §9 to stop the
fallback duplicating every card and to halve the HTML. The weight fix was
correct; it just traded HTML bytes for CLS, and nobody measured the other side
of the trade.

**Why I did not fix it.** The fix is a space-reserving fallback — a skeleton of
24 empty `.bzr-card`-shaped divs, which reserves nearly the exact height (card
height is driven by `.bzr-card-media`'s `aspect-ratio: 4/3`) for roughly 1–2 KiB
of structural markup, against 462 KiB of headroom before the 1 MiB gate. But it
requires editing `c/[category]/page.jsx`, `c/[category]/[sub]/page.jsx` and
`search/page.jsx` — three files being actively rewritten by the filters and
search agents this wave — and, more importantly, **I could not verify it**:
proving the shift is gone needs a production rebuild, and rebuilding mid-wave
would have swept up four agents' unfinished work. Shipping an unverified change
to three contended files to fix a number I could not re-measure is the wrong
trade. Handing over the proven root cause and the exact fix is the right one.

### 4.5 LCP — no lazy-loaded LCP element anywhere

| Page | LCP element | Time (1280 light) | `loading` | `fetchpriority` |
|---|---|---|---|---|
| `/bazaar/c/cars` | `<img>` card photo | 532 ms | **eager** | — |
| `/bazaar/item/…` | `<img>` gallery photo | 400 ms | **eager** | **high** |
| `/bazaar/search` | `<img>` card photo | 612 ms | **eager** | — |
| `/bazaar` | hero subtitle `<p>` | 4688 ms | n/a | n/a |
| `/bazaar/post` | `<span>` | 464 ms | n/a | n/a |
| `/bazaar/compare` | empty-state `<p>` | 692 ms | n/a | n/a |
| `/bazaar/in/mumbai` | intro `<p>` | 780 ms | n/a | n/a |
| `/bazaar/trending` | intro `<p>` | 1832 ms | n/a | n/a |

The classic own-goal is absent: every image LCP is `loading="eager"`, and the
detail page also sets `fetchpriority="high"`. Absolute times are from a local
server and vary by 3–5× between runs (home measured 4688 ms and 1992 ms on two
runs of the same page) — treat the *element identification* as the finding and
the milliseconds as indicative only.

**Above-the-fold lazy images — flagged, then dismissed on the evidence.** At
1280×900 the cars grid is 4-up, so row 2 (`index 4..7`) is inside the viewport
at `top=738` while `AdCard` marks only `index < 4` as eager. Four above-the-fold
images are therefore `loading="lazy"`. I did not "fix" it: Chrome loads lazy
images already within ~1250 px of the viewport, so these fetch immediately
anyway, none of them was the LCP element in any run, and raising the threshold
to `index < 8` would eagerly fetch eight remote photos at 360px where only one
or two are visible. That is a regression dressed as a fix.

### 4.6 `/bazaar/compare` transfers 2.1 MB — NOT FIXED, cause is outside `/bazaar`

Cold cache, fresh browser profile per page, 1280×900:

| Page | HTML (gzip / raw) | Total transfer | Requests | RSC prefetch fetches |
|---|---|---|---|---|
| `/bazaar` | 54 / 473 KiB | 1100 KiB | 194 | 117 |
| `/bazaar/c/cars` | 48 / 463 KiB | 1036 KiB | 163 | 90 |
| `/bazaar/in/mumbai` | 52 / 469 KiB | 1026 KiB | 183 | 112 |
| `/bazaar/trending` | 43 / 433 KiB | 1081 KiB | 156 | 108 |
| `/bazaar/item/…` | 46 / 405 KiB | 896 KiB | 103 | 38 |
| `/bazaar/search` | 41 / 342 KiB | 922 KiB | 99 | 44 |
| `/bazaar/post` | 34 / 318 KiB | 800 KiB | 62 | 18 |
| **`/bazaar/compare`** | 31 / 299 KiB | **2131 KiB** | **250** | 134 |

Compare is 2.1× the next heaviest page while having the *smallest* HTML and no
images. It pulls **89 script requests / 1514 KiB**, versus 37–42 everywhere
else, and the biggest single asset is
`/_next/static/chunks/app/supportsetting/page-db277429fc76587b.js` at **427 KiB**
— a chunk for an unrelated route. `/top11` (70 KiB) too.

Cause: the compare page's empty state is short, so the site-wide footer and
destination list are entirely inside the viewport at load, and Next prefetches
every `<Link>` in view. The served HTML contains `href="/supportsetting"`,
`/top11`, `/n8n`, `/bops`, `/altfgame` and ~35 more. On the taller Bazaar pages
those links sit below the prefetch threshold, which is why only compare pays.
The fix is `prefetch={false}` on the site footer / discovery-band links, in
`src/platform/navigation` — not a Bazaar file.

Also site-wide, on every Bazaar page: **5 render-blocking resources** — three
stylesheets (largest **144 KiB**), `polyfills-*.js`, and the GTM script.

**DOM size** (production, 1280): home 2,687 · city 2,409 · category 2,319 ·
trending 2,034 · item 1,904 · search 1,765 · post 1,643 · compare 1,429. Max
depth 11–14. Nothing pathological — Lighthouse errors above 3,000 and home is
the only page in its warning band, driven by 337 links, which is the point of a
directory home page. No action.

### 4.7 Dev-only: `aria-controls` points at an id that is not in the DOM

`BazaarSearchBar.jsx` gives the search input `role="combobox"` with
`aria-controls={LISTBOX_ID}` (line 255), but the listbox that receives
`id="bazaar-search-suggestions"` is only rendered when `suggestOpen` (line 333).
While the popup is closed the IDREF resolves to nothing — measured on **all
eight pages** on the dev server, and absent from the audited build, so this is
new work. Low severity (Chrome and NVDA tolerate it; the APG examples keep the
popup in the DOM), but it is the only dangling ARIA reference in the vertical.
Left for the search agent rather than edited mid-rewrite.

### 4.8 Dev-only, and a false positive of my own check

The `noDims` check flagged 8 images on `/bazaar/item` and 15 on
`/bazaar/in/mumbai` as having no reserved dimensions. They are all
`img.leaflet-tile` from `ListingMap`. They are `position: absolute` inside a
`.leaflet-container` with a resolved height of 318 px, they carry `alt=""`, and
the page measured **CLS 0.0000**. Absolutely-positioned images cannot shift
in-flow content; the check should exclude them. Recorded so the map agent is not
sent after a non-issue.

### 4.9 The `display` cascade trap has a `font` twin — still live, in `globals.css`

Found by accident: the contrast probe kept reporting `text-xs font-semibold`
buttons as **16px / 400**. They are.

`src/app/globals.css:199` declares, **outside every `@layer`**:

```css
button, input, textarea, select { font: inherit; }
```

`font` is a shorthand, so it resets `font-size`, `font-weight`, `font-family`,
`line-height`, `font-style`, `font-variant` and `font-stretch`. Unlayered author
declarations outrank every layered one, so on a `<button>` this beats Tailwind's
`utilities` layer *and* `bazaar.css`'s `components` layer. Measured on the
production build, same page, same component classes:

| Element | Production | `.bzr-*` intends |
|---|---|---|
| `a.bzr-btn` "Chat with seller" | 14.4px / 700 ✔ | 14.4 / 700 |
| **`button.bzr-btn`** "Next", "Back" | **16px / 400** ✘ | 14.4 / 700 |
| **`button.bzr-btn.bzr-btn-secondary`** "Filters", "Report this ad", "Show phone number" | **16px / 400** ✘ | 14.4 / 700 |
| `a.bzr-chip` "Hatchback", `a.bzr-chip.is-active` | 12.48px / 600 ✔ | 12.48 / 600 |
| **`button.bzr-chip`** "Save this search" | **16px / 400** ✘ | 12.48 / 600 |
| **`button.text-xs.font-semibold`** "Show all n", "Clear all" | **16px / 400** ✘ | 12 / 600 |

So every button that has an anchor twin on the same screen renders 11–28% larger
and at normal instead of bold weight, while the anchor renders correctly. This is
the same class of bug the blueprint documents for `display` on unlayered
`bazaar.css` — that one was fixed by wrapping the file in `@layer components`;
this one is in `globals.css` and is still open.

**Dev and production disagree, which is why it has survived.** On the dev server
the `.bzr-*` component rules *do* win on buttons (`button.bzr-btn` measures
14.4px/700 there) and only the Tailwind utilities lose. Anyone checking this in
`next dev` sees half the problem.

Not an accessibility failure in itself — the text ends up larger, and 16px/400
carries the same 4.5:1 threshold as 12px/600, so none of the contrast verdicts in
§3 change. It is a visual-consistency defect, and it is the reason several rows in
§3 report sizes that do not match their class names. Not fixed: `globals.css` is
outside this vertical. Recommended: narrow the reset to `font-family: inherit`
(which is what form controls actually need), or move the rule inside
`@layer base`.

### 4.10 Two small shifts I could not attribute to Bazaar

- `/bazaar/compare` @360, **0.0367**, reproduced in both runs at ~200 ms. Sources
  are four `svg.h-5.w-5.text-white` at 48 px spacing being removed and the
  footer moving up 90 px. That class appears nowhere in `src/app/bazaar` — it is
  the site footer's social icon row re-rendering on hydration. Site chrome.
- `/bazaar/in/mumbai` @360, **0.0275** in run A, **0.0000** in run B. Sources are
  `a.bzr-chip` elements re-wrapping at 1800 ms. Did not reproduce; not chased
  further, and no number is claimed for it beyond the one run.

---

## 5. What was fixed, and the measurement that proves it

Verified on the dev server at `:3040` (live source), 1280×900 and 360×780, both
themes.

### 5.1 `src/app/bazaar/error.jsx` — NEW

The vertical's error boundary. Client component, `{ error, reset }`.

Measured after triggering it with a temporary throwing route (since deleted):

- renders inside `<main class="bazaar-page">`, so `--bzr-*` resolve
  (`--bzr-radius` = `.75rem`) and `.bzr-btn` paints `rgb(13,148,136)`;
- one `h1`, one `h2`, one button ("Try again", wired to `reset()` — clicking it
  re-rendered the segment, which threw again because the probe route always
  throws, which is the correct behaviour);
- 10 links, **all inside `/bazaar`**: home, six categories, all-categories,
  cities, help. The visitor never leaves the vertical;
- **no internals leak.** The probe threw
  `Error: … ORACLE_PASSWORD=hunter2`; the rendered boundary contains none of it.
  The full error goes to `console.error`, and only `error.digest` is shown, as an
  opaque "Reference";
- 0 controls without an accessible name, 0 images without `alt`;
- contrast: h1 17.74:1, body copy 5.07:1, section label 5.07:1, category links
  16.7:1. The "Try again" button is 3.74:1 — the shared `.bzr-btn` token issue
  from §3e, inherited on purpose rather than papered over locally.

It deliberately does not render `<BazaarShell>`: the shell's search bar posts to
a route that may be the thing that just failed, and pulling the shell's client
children into the error bundle would make recovery depend on more code than the
page it is recovering. `bazaar.css` is imported directly because Bazaar has no
layout file. The six recovery categories are written out rather than read from
`data/categories.js`, which would ship the whole taxonomy into the browser to
draw six links; the slugs were asserted against the data layer.

### 5.2 `src/app/bazaar/components/SkipToResults.jsx` — NEW, and wired into `BrowseView`

Justified by §4.3. After the fix, measured:

| | Before | After |
|---|---|---|
| `/bazaar/c/cars` @1280, tabs from the global skip link to bypass the rail | 61 | **18 to reach the link, then 1 to be inside the results** |
| `/bazaar/search` @1280 | 22 | **9, then 1** |
| Layout shift caused by focusing and activating it | — | **0.0000** |
| Focus after activation | — | `#bazaar-results` (`tabIndex={-1}`, so focus moves, not just scroll) |
| Next Tab after activation | — | inside `#bazaar-results`, not in the `<aside>` |

**The verification caught a real bug in my own first version.** I built it as
`sr-only` + a list of `focus:` overrides, and measured `clip-path: inset(50%)`
still applied while the link was focused: laid out, outlined, focused, and
completely invisible. Tailwind v4's `sr-only` hides with `clip-path`, and I had
overridden position and size but not that. Both states are now written out
property by property. Re-measured: `clip-path: none` when focused, 123×38 px at
(16, 112), `position: fixed` (so it cannot shift the page), `--card` background
in both themes, 2px `--primary` outline. Confirmed visually in both themes.

### 5.3 `src/app/bazaar/components/BrowseView.jsx`

Three fixes, all in this one shared file so category, sub-category and search
all get them:

1. **Filter-sheet focus trap** (§4.1). Added the same `FOCUSABLE` selector and
   Tab-cycling handler the other three Bazaar dialogs already use, focus-in on
   open, and focus restoration to the trigger on every close path (X, "Show n
   ads", "Clear all", Escape). The trigger is captured from the click event's
   `currentTarget`, so `BrowseToolbar` did not have to change.
   Re-measured at 360×780: focus lands on "Close filters"; **0 of 68** Tab and
   Shift+Tab presses escaped the dialog; Escape closes it; focus returns to the
   Filters button; `body.style.overflow` released.
2. **`<h2 className="sr-only">Results</h2>`** above the results column (§4.2).
   Re-measured: `/bazaar/c/cars` and `/bazaar/search` now read h1 → h2 → h3 with
   **0 skipped levels**, one `h1` each. Visually hidden rather than drawn because
   the toolbar already states the count on screen and the card grid is
   deliberately quiet.
3. `id="bazaar-results" tabIndex={-1}` on the results column, as the skip-link
   target.

### 5.4 Contrast fixes in JSX

| File | Change | Before | After |
|---|---|---|---|
| `components/AdFreshness.jsx` | headline text `${tone}` → `text-(--foreground)`; the icon keeps the tone | `--bzr-free` **2.93:1**, `--bzr-featured` **2.02:1**, `--bzr-urgent` **3.54:1** at 14px/600 | **15.76:1** light, **15.52:1** dark |
| `components/ActiveFilterChips.jsx` | "Clear all": `text-(--primary)` → `text-(--primary-text)` | **3.41:1** | **4.98:1** light, **9.61:1** dark |
| `components/FilterRail.jsx` | "Show all n" / "Show less": same swap | **3.41:1** | **4.98:1** light, **9.61:1** dark |

`AdFreshness` keeps the colour where colour is allowed to carry meaning: the
icon is a non-text graphic (SC 1.4.11, 3:1) and clears it, and the wording
already says "Stale — 34 days old" / "expires in 2 days" / "Posted today", so
state is never conveyed by colour alone (SC 1.4.1). Dark theme passed on all
three tones before the change and still does.

### 5.5 Regression check

The full accessibility probe was re-run on all eight pages after the fixes:
**0 heading skips, 0 images without `alt`, 0 controls without an accessible
name, 0 unlabelled form controls, 0 duplicate `id`s, one `h1` per page** — and
the new `id="bazaar-results"` collides with nothing.

---

## 6. Deliberately not fixed

| Finding | Why not |
|---|---|
| Browse-page CLS 0.21 / 0.32 (§4.4) | Needs a production rebuild to verify and touches three files under active rewrite. Root cause proven, fix specified. |
| Badge pill contrast, 1.74–3.76:1 (§3b) | The rule is in `bazaar.css`, which this wave forbids editing. Exact three-line change given. |
| Sell CTA contrast, 1.81–3.74:1 light (§3c) | Same file, plus a global token. |
| `.bzr-btn` / `.bzr-chip.is-active` 3.74:1 (§3e) | The global `--primary` / `--primary-foreground` pair; site-wide, far outside `/bazaar`. |
| `--muted-foreground` on tinted surfaces, 4.06 / 4.41:1 (§3a) | The surfaces are `bazaar.css` vars. Recommendation: darken `--bzr-muted` slightly and use it (not `--muted-foreground`) on `--bzr-soft` / `--bzr-media`; it already measures marginally better (4.52 vs 4.41 on `--bzr-soft`) and one step darker would clear it on both. |
| `/bazaar/compare` 2.1 MB (§4.6) | Cause is footer/discovery-band prefetch in `src/platform/navigation`. |
| 5 render-blocking resources, 144 KiB CSS (§4.6) | Site-wide build output. |
| Unlayered `font: inherit` breaking button typography (§4.9) | `globals.css`, site-wide. Fix specified. |
| `aria-controls` dangling in `BazaarSearchBar` (§4.7) | Another agent's file, mid-rewrite. |
| 4 lazy above-the-fold card images at 1280 (§4.5) | Measured as harmless; the obvious "fix" regresses mobile. |
| `/bazaar/in/[city]` still 88 tabs to the first ad (§4.3) | It renders its own grid rather than `BrowseView`. `SkipToResults` is deliberately generic (`targetId` prop) so that page can adopt it in one line. |
| `MakeOfferDialog` focus trap | Not in the audited build; untested rather than passed. |

---

## 7. Files changed

| File | |
|---|---|
| `src/app/bazaar/error.jsx` | new — the vertical's error boundary |
| `src/app/bazaar/components/SkipToResults.jsx` | new — scoped skip link |
| `src/app/bazaar/components/BrowseView.jsx` | focus trap, `sr-only` `h2`, skip link + results target |
| `src/app/bazaar/components/AdFreshness.jsx` | headline contrast |
| `src/app/bazaar/components/ActiveFilterChips.jsx` | "Clear all" contrast |
| `src/app/bazaar/components/FilterRail.jsx` | "Show all n" contrast |
| `docs/BAZAAR_A11Y_AUDIT.md` | new — this document |

`bazaar.css` was not touched.

`npx eslint src/app/bazaar` — 0 errors, 1 warning
(`components/primitives.jsx:70`, the documented pre-existing
`react-hooks/static-components` false positive).
