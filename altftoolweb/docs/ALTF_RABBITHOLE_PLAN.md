# AltF Rabbithole

A curated directory of interesting websites, at `/rabbithole`.

## What it is

345 hand-checked websites — strange, beautiful, useful or quietly brilliant —
organised into 18 categories, 4 time bands, 12 vibes and 8 mood-based
collections. Every entry has its own page. 389 routes in total; 30 entries come
from the Beebom listicle this supersedes, the rest are ours.

The competition for these queries ("cool websites", "interesting websites",
"websites to visit when bored") is listicles: Beebom, MakeUseOf, HubSpot. A
listicle gives you thirty links in a fixed order and goes stale the week it is
published. The wedge is that this is a **directory, not an article** — it can be
filtered, it has a page per entry, and entries get corrected rather than
republished with a new year in the title.

## The load-bearing idea: time to joy

The distinguishing axis is not topic, it is **how long a site takes to be worth
it**. Every entry is classified `instant`, `one-minute`, `coffee-break` or
`rabbit-hole`.

This is the filter a visitor actually wants and no listicle offers. It is also
the structure of every category page — sites are grouped by time band rather
than dumped in one grid, which gives each page real internal sections and
question-shaped headings.

Do not "simplify" this into a generic tag. It is the product.

## The three axes

Categories, vibes and time bands are deliberately different shapes, and each
gets its own set of landing pages because each answers a different query:

| Axis | Answers | Pages |
|---|---|---|
| Category | "what kind of thing is it" | 18 |
| Vibe | "what mood am I in" | 12 |
| Time band | "how long have I got" | sections, not pages |

Vibe pages are not duplicate content: they cut across all 18 categories, and
each one leads with the spread of categories it actually spans. Time bands
stay as sections because "instant websites" is not a thing anyone searches for.

## Layout

```
packages/core/src/rabbithole/
  taxonomy.js       categories, vibes, time bands, collections, brand, REVIEWED_ON
  catalog.js        merges + validates the site data, derives every lookup
  hash.js           FNV-1a, split out so client components can import it
  lost.js           the sites-we-lost register (verified failures only)
  sites/part-N.js   the curated entries, five files
  catalog.test.mjs  data-quality suite (wired into npm run test:unit)
  lost.test.mjs     stops the graveyard contradicting the live catalog

src/app/rabbithole/
  page.jsx                     landing
  browse/                      filterable directory, facet counts, URL state
  category/[slug]/             18 pages
  vibe/[slug]/                 12 pages
  site/[slug]/                 345 pages
  collections/, collections/[slug]/
  built-by-altf/               our own versions of listed ideas
  how-we-pick/                 editorial standards, linked from every category
  sites-we-lost/               the graveyard
  feed.xml/                    RSS
  _components/, _lib/, rabbithole.css
```

389 routes in total.

## Things that will cost you time if you do not know them

- **The catalog throws on invalid data, by design.** `catalog.js` validates
  every record at import and fails the build on a schema violation. This is
  static data compiled at build time, so a bad record is always an authoring
  mistake and always fixable — a broken build is far better than a category
  page that silently lost half its entries. Duplicate slugs and duplicate URLs
  are the one recoverable case: first entry wins, and the collision lands in
  `CATALOG_NOTES`, which `catalog.test.mjs` asserts is empty.

- **`_lib/presentation.js` must never import `catalog.js`.** It imports
  `taxonomy.js` and `hash.js` only. Client components use these helpers, and
  reaching into the catalog would pull all 345 records into the browser bundle.
  `hash.js` exists purely to make that separation possible.

- **The browse page ships a projection, not records.** `_lib/projection.js`
  strips `description` and `whyItsGood`, which are about three quarters of a
  record's weight and are only read on detail pages. There is a 1 MiB prerender
  guard in `scripts/check-prerender-size.mjs`; sending full records would put
  `/rabbithole/browse` in range of it.

- **Everything is deterministic.** No `Date.now()`, no `Math.random()` at
  render time — featured rotations and the browse page's default order are
  seeded through `hashString`, so a rebuild produces identical HTML. The only
  `Math.random()` is inside click handlers ("Surprise me"), which is fine
  because it runs in the browser after hydration.

- **One hue per category, set once.** An element gets `.rh-toned` plus an
  inline `--rh-hue`, and every tint, ring and border below it derives from that
  variable. Adding a category needs no stylesheet change. Light mode uses the
  600 ramp and dark the 400 ramp — the dark hues fail contrast on the near-white
  light page, so every tone is declared twice.

- **No third-party screenshots or favicons.** `SiteMark` generates a mark from
  the slug. 345 favicon requests would mean a referer leak per card, a slow
  grid, and steady rot as sites redesign. The generated mark costs nothing and
  never breaks.

- **Detail pages are the indexable asset.** A card's primary click goes to
  `/rabbithole/site/[slug]`, not out to the site. The outbound link is a
  deliberate secondary affordance. Thin-content risk on ~345 near-identical
  pages is handled with per-entry unique copy (`description`, `whyItsGood`),
  four data-derived FAQ answers, a related rail, and collection membership.

- **Outbound links are followed.** These are genuine editorial recommendations
  with no payment involved, which is exactly the case Google's guidance says
  should be a normal link. They carry `rel="noopener"` for security only.

## Why this is not "an intermediary site"

The March 2026 core update moved rankings away from aggregators and toward
specialist sites, which is an existential problem for anything shaped like a
directory. Three things are the defence, and none of them should be quietly
dropped later:

1. **`/rabbithole/how-we-pick` states the method** — what gets in, what does
   not, that nobody can pay, and that dead links are removed. Every category
   page links to it. Published methodology was the one attribute that held up
   through the listicle contraction.
2. **Per-entry writing that is not derivable from the source site.** The
   `whyItsGood` field is the test: if it could have been scraped from the site's
   own meta description, the entry is not pulling its weight.
3. **A visible, machine-readable review date.** `REVIEWED_ON` is surfaced on
   detail, category and vibe pages and emitted as `dateModified`.

## Accessibility rules that are load-bearing

- **The light hue ramp is contrast-tuned, not chosen by eye.** Six of the
  eighteen sit one step darker than the obvious 600 weight because they failed
  AA as text on an 8% tint of themselves — the surface `.rh-chip--toned` uses
  everywhere. `--rh-sky` was the worst at 3.50:1. Re-check the maths before
  touching any value; dark mode is clear at 5:1 minimum and needs no change.
- **`--rh-sticky-top` must clear the global header.** The site header is sticky
  at `4rem` with a higher z-index, so leaving the token undefined parks the
  browse filter bar invisibly underneath it.
- **`min-w-0` on grid and flex children.** Two separate bugs here already: the
  mobile chip rows stretching to 2100px instead of scrolling, and a truncating
  host label that only fitted by luck of the current data.

## Known gaps, in priority order

- **The review date is corpus-level, not per-entry.** Honest for now, because
  the catalog is verified in sweeps, but a per-entry timestamp becomes the right
  model once entries are added continuously rather than in batches.
- **Collection pages show a capped slice.** Several rules match most of the
  catalog, so the page states "showing 36 of 333" and hands off to the browse
  page for the rest via `collection.browse`. Real pagination would be better.
- **The landing page is deep.** Roughly 780px to the first listing against a
  ~287px benchmark for filtered directories. The hero and stat block earn their
  place on a page that has to explain what this is, but it is worth revisiting.
- **`the-old-internet` has no browse hand-off**, because the browse page has no
  year filter to hand off to.

## Adding sites

Append to any `sites/part-N.js` — the split is historical, from parallel
curation, and the files are concatenated. Then:

```bash
npm run test:unit
```

The suite checks slug and URL uniqueness, https, absence of tracking
parameters, copy lengths, duplicate blurbs, minimum category size, that every
collection still resolves to at least six sites, and that no detail page is
left without internal links out.

## Where it is wired in

- `src/app/sitemap.js` — static routes plus category, collection and site loops
- `src/platform/navigation/siteRoutes.js` — top-level header nav item and footer
- `src/platform/navigation/publicRouteTaxonomy.js` — under the experiences family
- `src/platform/seo/answerEngineManifest.js` — an `llms.txt` section, so answer
  engines have the facts to cite the directory rather than paraphrase a listicle
