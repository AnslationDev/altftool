# AltF Detour — architecture

**Route:** `/detour` · **Core package:** `@altftool/core/detour`

A directory of websites worth taking a wrong turn for, with a button that picks
one at random. It is the entertainment counterpart to AltF Atlas (utilities) and
sits alongside AltF Ideas in the platform's outward-facing discovery layer.

---

## 1. What problem it solves

Two products already exist in this space and each is missing the other half:

| | The Useless Web | bored.com | AltF Detour |
|---|---|---|---|
| Random button | ✅ one button | ✅ | ✅ steerable |
| Browsable directory | ❌ | ✅ ~900 links | ✅ |
| Categories | — | ~68 | **91** |
| Says how long a site takes | ❌ | ❌ | ✅ four time bands |
| Says if it is safe at a desk | ❌ | ❌ | ✅ |
| Says if it needs sound | ❌ | ❌ | ✅ |
| Says if it works on a phone | ❌ | ❌ | ✅ |
| Own hosted destinations | ❌ | ❌ | ✅ AltF originals |
| Text search | ❌ | ❌ | ✅ |
| Retraceable history | ❌ | ❌ | ✅ visit trail |
| A reason to return tomorrow | ❌ | ❌ | ✅ daily pick |

The four facts in the lower rows are the product. They are most of why somebody
picks one link over another, and both reference products make you click through
to find them out.

---

## 2. Data model

```
packages/core/src/detour/
├── taxonomy.js      families, categories, vibes, time bands, collections
├── schema.js        record shape + validator (runs in the unit test)
├── catalog.js       assembly, dedupe, indexes, facet counts, STATS
├── randomiser.js    pure filter + weighted pick, injectable RNG
├── catalog.test.mjs
└── data/
    ├── altf-originals.js   our own destinations
    └── <slice>.js          one file per authoring slice
```

### Record

```js
{
  slug, name, url,
  category,          // one of 91 category ids
  vibes: [...],      // 1-3 mood tags
  timeToJoy,         // instant | one-minute | coffee-break | rabbit-hole
  blurb,             // 40-190 chars, one sentence
  bestOn,            // desktop | mobile | both
  sfw, needsSound, free, needsAccount,   // booleans, all required
  year?, acclaimed?, origin?             // origin: "web" (default) | "altf"
}
```

### Taxonomy shape

- **8 families** — Play, Make, Learn, Wander, Unwind, Laugh, Weird, Retro.
  Navigation grouping only.
- **91 categories** — the primary SEO surface, one landing page each.
- **14 vibes** — cross-cutting moods, up to three per site.
- **4 time bands** — the primary sort, and the fact the product is built around.
- **12 collections** — editorial cross-sections computed from a `rule` at build
  time, so they never go stale as entries are added.

### Assembly rules (`catalog.js`)

Data files are authored independently, so two mechanical passes run at import:

1. **URL dedupe.** Keys ignore scheme, `www.` and trailing slashes, because
   independent authors reach one site by different spellings of its address.
   A site legitimately fitting two categories is kept in the one with *fewer*
   entries — a duplicate does more good propping up a thin landing page than
   padding a fat one. Ties break on position in the concatenated array.
2. **Name dedupe.** URL matching cannot catch a site reached through a genuinely
   different domain — a Poki mirror, a project that changed domain, a `.com` and
   `.net` serving the same thing. Restricted to entries sharing an `origin`, so
   an AltF build and the classic that inspired it both survive; those are
   renamed instead (see "Perfect Circle by AltF").
3. **Slug disambiguation.** Genuinely different sites that collide on a slug get
   the later one suffixed with its category, so no detail page is unreachable.

All three are deterministic. `STATS.dedupedFromSourceFiles` reports how many
entries passes 1–2 removed, so the discrepancy between file totals and catalog
size is visible rather than mysterious. Two unit tests hold the line: no two
entries may resolve to the same normalised URL, and no two of the same origin
may share a display name.

---

## 3. Routes

| Route | Pages | Notes |
|---|---|---|
| `/detour` | 1 | Hero, button, moods, times, categories, collections, FAQ |
| `/detour/random` | — | Route handler; 307 redirect, or JSON with `?format=json` |
| `/detour/browse` | dynamic | Search + facets via searchParams, 48/page |
| `/detour/categories` | 1 static | Index, grouped by family |
| `/detour/category/[slug]` | 91 static | See "static vs dynamic" below |
| `/detour/collections` | 1 static | |
| `/detour/collections/[slug]` | 12 dynamic | Paginated; up to 1,232 entries |
| `/detour/vibes/[slug]` | 14 dynamic | Paginated; up to 502 entries |
| `/detour/time/[slug]` | 4 dynamic | Paginated; up to 592 entries |
| `/detour/site/[slug]` | 1,306 static | The long-tail surface |
| `/detour/play` | 1 | AltF originals index |
| `/detour/play/[slug]` | 8 | Toys built for Detour |
| `/detour/today` | 1 | Deterministic daily pick; `revalidate: 3600` |
| `/detour/about`, `/detour/submit` | 2 | |
| `/detour/sitemap.xml` | — | Split out; see §5 |

### Static vs dynamic

Reading `searchParams` opts a route out of static rendering entirely. That is
the right trade for the big cross-sections — a mood page can hold 500 entries
and genuinely needs pagination — but it was the wrong one for categories, which
are the section's primary SEO surface and where **no category holds more than
20 sites**. The category route therefore takes no `searchParams` and all 91
render statically.

The catalog test *"no category outgrows a single listing page"* fails if one
ever passes 48, because at that point the page would silently stop showing its
tail rather than paginating.

Verified in a production build: **1,412 Detour pages prerendered** — 1,306 site
pages, 91 categories, 8 toys and 7 hubs. Largest is 540 KB, well inside the
1 MiB `check-prerender-size` ceiling.

### The random endpoint

`GET /detour/random` is a real URL, not only a client control:

```
/detour/random?time=instant&vibe=funny&sfw=1&silent=1&mobile=1&originals=1
```

It 307-redirects to a matching site, so the bare URL is shareable and works with
JavaScript disabled. `&format=json` returns the destination instead, which is
what the hero button uses.

**Why the button prefetches.** `GoButton` fetches its *next* destination on
mount and again after each use. That makes the click instant, and — the actual
reason — keeps `window.open` inside the user gesture. Fetching on click pushes
the open past the gesture and straight into the popup blocker.

**Why external links open in a new tab.** Both reference products replace the
tab, which means one dead link ends the session. Keeping Detour open lets you
press the button again immediately.

---

## 4. Weighting

`randomiser.js` gives AltF originals a weight of 3 against 1 for external sites.

The reason is operational, not promotional: originals are the only entries we
can promise are still online, load in under a second, and carry no third-party
tracking. A random button that serves a parked domain twice running is a broken
product. The weight is modest enough that the external web still dominates —
asserted in the unit test, which fails if originals exceed 35% of draws.

---

## 5. Finding things

Three ways in, because a random button alone is a lottery and a filter tree
alone assumes you have no idea what you want.

**Search** (`packages/core/src/detour/search.js`) is exact substring matching
over name, category, mood and blurb, scored by where the hit landed. It is
deliberately not fuzzy — on a catalog this size typo tolerance mostly surfaces
confident nonsense. Two rules earn their keep:

- **Blurbs match on word starts only.** A raw substring search across prose has
  "rain" hitting *trainer*, *constraints* and *brain*; because terms are AND-ed,
  one bad hit drags an unrelated site into the results rather than merely
  ranking it low.
- **Vibes match on prefix, not substring.** `brainy` contains `rain`, which
  quietly made every brainy site a result for "rain sounds".

A trailing "s" is stripped as a fallback so "rain sounds" still finds an entry
whose blurb says "sound". The query is a `q` param on `/detour/browse`, so a
search is linkable, server-rendered and composes with every other filter.
Result pages are `noindex`: unbounded, user-generated, and near-duplicates of
the category pages meant to rank for those terms.

**Visit trail** (`VisitTrail.jsx`) is the fix for the one genuine flaw in every
random-website button: you land on something good, close the tab, and it is
gone. Stored in `localStorage` and read through `useSyncExternalStore` — an
effect-plus-setState would cause a cascading render and get the SSR pass wrong.
Nothing leaves the browser, which is a promise the code has to keep.

**Daily pick** (`daily.js`) is a pure function of the UTC date, so the same day
yields the same site on every server with no storage, no cron and no build step.
Meta categories are excluded — "today's detour is a directory of other
directories" is a wasted day. The offset is hashed alongside the date rather
than added to the index, or a week of picks would all start with the same
letter.

---

## 6. Keyboard

| Key | Does |
|---|---|
| `Space` | Spin again (hero only, so the browse sidebar copy does not fight it) |
| `/` | Focus search |
| `Esc` | Clear search |

All three bail out when a field is focused or a modifier is held, and `Space`
only calls `preventDefault` once it knows it is acting — otherwise it eats the
scroll key.

---

## 7. SEO / GEO

- Every page uses `createPageMetadata` and emits `BreadcrumbList`;
  listings add `CollectionPage` + `ItemList`; site pages add a `WebSite` entity;
  toy pages add `WebApplication` + `HowTo`; the landing and about pages add
  `FAQPage`.
- **Filtered browse views are `noindex`.** There are thousands of filter
  permutations and every one of them is thin.
- **Own sitemap** at `/detour/sitemap.xml`, referenced from `robots.txt`. The
  per-site pages are a few thousand URLs; folding them into the main sitemap
  risks pushing it past the `unstable_cache` ceiling, which fails the *whole*
  document rather than truncating it. Only the seven hub pages go in
  `src/app/sitemap.js`.
- **GEO**: `answerEngineManifest.js` carries a dedicated `## AltF Detour`
  section. Every figure quoted there is interpolated from `STATS`, so the
  numbers given to answer engines cannot drift from the data.
- **Share cards**: `opengraph-image.jsx` at the landing, site and category
  levels. Site cards carry the four facts, category cards lead with the count
  and three real entries. Generated on demand, not at build time — 1,300
  pre-rendered images would add minutes to every build to produce mostly
  unrequested files, and Next caches each after its first hit.

  Three Satori constraints cost real debugging time and are worth knowing before
  editing these: multi-child elements need an explicit `display`, a `<br />`
  between text nodes counts as three children, numeric children abort the
  render (use `String()`), and `alignItems: "baseline"` is unsupported.

---

## 8. Commands

```bash
npm run test:unit                    # includes the Detour catalog suite
node scripts/qa-detour-links.mjs     # probes every external URL
```

`qa-detour-links.mjs` classifies rather than just counting status codes: many
well-known sites answer an automated request with 403/503 while being perfectly
alive in a browser, so only DNS failure, connection refusal, 404 and 410 count
as dead. It is deliberately **not** wired into the build — it makes ~1,500
outbound requests over networks we do not control, and a red CI run there would
say nothing about whether our own code works.

---

## 9. Known constraints

- The catalog is static data compiled into the bundle. At this size that is the
  right trade (every page stays a static render with no data layer), but past
  roughly 5,000 entries it should shard the way the Ideas corpus does.
- External links rot. `qa-detour-links.mjs` is the mitigation; it needs to
  actually be run periodically for that to mean anything.
- Category assignment is single-valued. Sites that genuinely belong in two
  places are resolved by the dedupe rule in §2 rather than appearing twice.


---

## 10. Shipped figures

Measured from `STATS`:

| | |
|---|---|
| Sites catalogued | **1,306** (bored.com: ~900) |
| Categories | **91** (bored.com: 68) |
| Families / moods / time bands / collections | 8 / 14 / 4 / 12 |
| AltF originals | 32 (8 built for Detour, 24 existing experiences) |
| Free with no account | 1,232 |
| Work on a phone | 846 |
| Safe for work and silent | 1,161 |
| Duplicates removed by the URL + name passes | 84 |
| Pages prerendered | 1,412 |
| Unit tests | 64, all passing |

**Link health — the full catalog, not a sample.** All 1,275 external URLs
probed: **0 dead**, 1,132 reachable, 123 alive behind bot protection, 14
unreachable from this network (expired or mismatched certificates, mostly).

Getting to zero took fixing the checker as well as the data. It had been
trusting a 404 from `HEAD`, and Wolfram Alpha, notify.moe, Semantris and the
X-Rite hue test all answer `HEAD` with 404 while serving the page perfectly on
`GET` — four false "dead" reports. It now retries any non-2xx with a real GET.
Two genuine problems were fixed: Samorost had moved to a hyphenated path, and
Ready Player Me no longer resolves and was removed.

**Build.** `next build` for the whole app now needs more than the 8 GiB that
`scripts/run-with-node-memory.mjs` budgets — a cold webpack compile OOMs at
~7 GiB, and completes at 14 GiB. That budget's comment still describes "the full
999-tool route graph"; the app has since grown to 3,668 tools plus four new
large sections. Raise `ALTFT_NODE_MAX_OLD_SPACE_SIZE` before this bites in CI.
It is a whole-app ceiling, not anything specific to Detour.
