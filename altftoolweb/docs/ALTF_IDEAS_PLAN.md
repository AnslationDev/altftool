# AltF Ideas — product plan and build status

**Route root:** `/ideas` · **Product line:** Discovery, sibling to AltF Signals and AltF IdeaLab
**Positioning:** *Every idea, scored in the open, with the evidence and the first move.*

---

## 1. Competitive research

| Site | Model | Volume | Depth per idea | Weakness we exploit |
|---|---|---|---|---|
| **ideasai.com** | AI ideas + upvotes | 48,295 | Title + votes only | No depth, no filters, no next step. 1,782 near-duplicate pSEO pages |
| **stratup.ai** | Generator + DB + reports | 100,000+ | One paragraph | Search gated behind $49/mo |
| **ideaproof.io** | 120s validation engine | ~750 lists | Very deep — TAM, CAGR, cost, competitors, verdict | No browsable corpus, credit paywall |
| **ideamap.ai** | AI brainstorm canvas | n/a | n/a | Team tool, not discovery |
| **ideanote.io** | Enterprise idea management | 9 per run | Shallow | Corporate innovation, not founders |
| **startup.ai** | Idea → prototype builder | n/a | Score /10 | Browse is an afterthought |

**The gap:** nobody has volume *and* depth *and* a next step. IdeasAI has volume with no depth; IdeaProof has depth with no volume; Stratup has both but hides it.

### Three moats
1. **Transparent scoring.** Competitors show a black-box number. We publish all six signals and their weights, and let users re-weight them live.
2. **Structured Idea DNA.** Every idea is a typed composite, not a text blob — which is what makes 117k ideas genuinely filterable instead of an infinite scroll.
3. **Ecosystem next-step.** AltFTool has 2,749 working tools. Every dossier ends in a build path linking to them. No idea site can copy this.

---

## 2. The AltF Opportunity Score (AOS)

Six signals, all visible, all re-weightable. **AOS is the plain weighted mean of the six displayed signals** — if a user adds up the parts they must get the whole, or the product's central claim is a lie.

| Signal | Weight | Measures |
|---|---|---|
| Demand | 22% | Search trend, community pain frequency, existing spend |
| Moat | 20% | Data loop, workflow lock-in, regulation, distribution |
| Monetisation | 18% | Contract value × willingness to pay × retention shape |
| Feasibility | 16% | MVP scope, tech risk, integration surface |
| Timing | 14% | Enabling shift, cost curve, regulation, behaviour change |
| Open field | 10% | Inverse of crowding |

**Tiers are percentile-anchored**, not absolute grades — a tier answers "how does this rank against the alternatives", which is the question a founder is actually asking.

| Tier | AOS | Share of corpus |
|---|---|---|
| S | ≥ 78 | 1,252 (1.1%) |
| A | ≥ 70 | 10,884 (9.3%) |
| B | ≥ 59 | 48,842 (41.7%) |
| C | < 59 | 56,286 (48%) |

Badges (`Underserved`, `Weekend build`, `Cash machine`, `Deep moat`, `Timing window`, `Contrarian`) are **computed from scores, never authored**, so a badge cannot claim something the numbers do not support.

---

## 3. Idea DNA

```
Idea = Vertical × Buyer × Job × Mechanism × Wedge × Model
```

| Axis | Count | Notes |
|---|---|---|
| Vertical | 61 | Each carries TAM, CAGR, and open-field base rates |
| Buyer | ~35 | Drives job affinity |
| Job | 40 | The unit of work being replaced; carries the pain language |
| Mechanism | 14 | `name` must be a **countable noun** — prose renders it as "a {name} that handles {job}" |
| Wedge | 16 | Adjusts open field |
| Model | 12 | Drives monetisation, ACV band, time to first revenue |

Source of truth: [`packages/core/src/ideas/taxonomy.js`](../packages/core/src/ideas/taxonomy.js)

---

## 4. Corpus generation

`npm run generate:ideas` → `scripts/generate-ideas.mjs`

**Fully deterministic.** No `Date.now()`, no `Math.random()` — every "random" choice is a hash of the idea's own DNA fingerprint, so builds are reproducible and diffable. A consequence worth keeping: any idea's full record can be *recomputed* from its DNA, so storage is an optimisation rather than the source of truth.

Three passes:
1. **Expand** — walk the six axes with coherence gating (buyer→job affinity, model→vertical fit). Slug collisions are disambiguated with progressively more DNA, never dropped.
2. **Calibrate** — raw signals cluster around their axis means, which would make every SignalBars fingerprint look identical. Each signal is mapped onto its own percentile curve so the corpus spreads across 21–97. AOS is then recomputed as the true weighted mean.
3. **Write** — split by how the data is actually read, not how it was written.

Current output: **117,264 ideas**, AOS 31–87 (median 59).

```
public/data/ideas/
  shards/         full records for the published top 12,000 (static pages + sitemap)
  by-vertical/    compact records for all 117k, one file per vertical (~500KB each)
  top-index.json  default browse payload
  slug-map.json   slug -> vertical, so resolving any idea reads two small files
  facets.json     filter-rail counts (4KB, no records needed)
  manifest.json   corpus stats — imported by llms.txt so quoted figures cannot drift
```

### Rehydration — why every idea has a dossier

Composition lives in `packages/core/src/ideas/compose.js` and is shared verbatim
between the generator and the runtime. A compact record stores only the DNA axis
indices plus the six calibrated scores (~120 bytes); `rehydrate()` reconstructs
the other ~2.3 KB on demand by re-running the same `composeIdea`.

That is what lets all **117,264** ideas have a working detail page while only
12,000 full records ship.

**The draw order inside `composeIdea` is a contract.** Inserting, removing, or
reordering a single PRNG draw silently changes every downstream idea.
`npm run verify:ideas` diffs all 12,000 stored records against their rehydrated
twins and exits non-zero on any mismatch — it runs in `prebuild`, so a violation
fails the build instead of shipping subtly-wrong prose on a hundred thousand
pages. It has already caught one real bug (an unclamped final shard slice that
wrote 500 records with no index entry).

**The corpus is committed** (`public/data/ideas/`, ~77 MB, 70 files). It is fully
regenerable, so committing it is redundant in principle — but it keeps a deploy
from depending on the generator succeeding in CI, which needs ~4 GB of heap and
would otherwise be a single point of failure for the whole build.

The tradeoff is a new failure mode: edit `taxonomy.js`, forget to regenerate,
and the checked-in corpus silently drifts from the code. `npm run verify:ideas`
catches exactly that — rehydration runs through the *current* `composeIdea`, so
any drift shows up as a mismatch — and it runs in `prebuild`.

After changing anything in `taxonomy.js` or `compose.js`:

```
npm run generate:ideas && npm run verify:ideas && git add public/data/ideas
```

---

## 5. Design system

Extends the shared AltFTool token layer; everything namespaced `--afi-*` so nothing leaks. Defined for **both themes** — the site ships a light default with a dark toggle, so the dark-tuned 400-weight ramp is swapped for 600-weights in light mode to hold contrast.

**One hue per signal, used identically everywhere** — score ring, bars, filter rail, compare table, quadrant map. Learn it once, read it everywhere.

| Component | Notes |
|---|---|
| `ScoreRing` | Six arc segments, one per signal, filled proportionally, AOS in the centre. Pure SVG, no client JS — it renders 24× per browse page. Sizes sm 46 / md 72 / lg 168 |
| `SignalBars` | Six 3px bars — the compact fingerprint. Fill has no radius: a rounded 2px fill reads as a floating dot |
| `SignalRows` | Labelled breakdown; score is never colour-only |
| `IdeaCard` | Fixed anatomy so 117k cards read as one system |
| `IdeaListing` | Shared shell for browse / verticals / collections |
| `WeightTuner` | The only client component. Six sliders + five presets, live re-ranking |

**Animation is opt-in, not default.** Grids render at final value immediately; only the hero opts into the draw-on. Animating every ring in a 60-card grid is noisy and expensive.

---

## 6. Built so far

| Route | Status |
|---|---|
| `/ideas` | Home — hero, answer-first block, six-signal methodology, leaderboard, weight tuner, collections, 61 verticals, FAQ |
| `/ideas/browse` | Paginated corpus, curated shortlists, industry jump-off |
| `/ideas/idea/[slug]` | Full dossier for **all 117,264** ideas — answer-first, score breakdown with rationale, problem, solution, market table, why now, competitors, risks, hardest part, 4-step build path, FAQ, related. Top 1,000 pre-rendered, rest ISR. Ideas outside the published 12,000 render identically but carry a visible caveat and `noindex, follow` |
| `/ideas/verticals` | 61 industries with TAM, CAGR, open-field bars |
| `/ideas/verticals/[slug]` | Industry hub with computed FAQ carrying real figures |
| `/ideas/collections` | 12 computed shortlists |
| `/ideas/collections/[slug]` | Shortlist with rule-derived membership |
| `/ideas/for` | Persona and filter index |
| `/ideas/for/[slug]` | 8 persona hubs + 16 modifier pages in one namespace |
| `/ideas/learn` | Guides hub |
| `/ideas/learn/scoring-methodology` | The citable page — full method, thresholds, and limits |
| `/ideas/learn/[slug]` | 5 long-form guides |
| `/ideas/map` | Effort-vs-reward scatter, median-split quadrants, industry filter |
| `/ideas/rankings` | 7 leaderboards — overall plus one per signal |
| `/ideas/compare` | Up to 4 ideas side by side, per-row winners marked |
| `/ideas/generate` | Generator that navigates the DNA space by industry / job / mechanism / model / effort |
| `/ideas/tools` | Free-tool hub, cross-linked into the wider AltFTool catalogue |
| `/ideas/tools/score-my-idea` | Score your own idea on the six signals; percentile against the real corpus distribution. Fully client-side |

**Persona hubs re-score rather than re-filter.** Each carries its own signal weighting, so `/ideas/for/solo-founders` and `/ideas/for/vc-track` surface entirely different ideas at the top — verified, no overlap in the first three. A hub that only reordered the same list would not deserve a page.

**Modifiers live under `/ideas/for/` too**, not a root-level `/ideas-for/`, which would collide with the site's existing root catch-all route.

**The map splits its quadrants at the median, not at 50.** It plots the highest-scoring ideas, so a fixed midpoint left two of four quadrants completely empty and the framing decorative. Median-split guarantees all four are populated and reframes the question as "harder or easier than the other strong ideas" — which is the comparison a founder is actually making. Axes auto-scale to the plotted range for the same reason.

**The generator navigates rather than hallucinates.** Every competitor's generator calls a model and returns prose nobody has checked. This one resolves to real records that already carry a score, market figures, competitors and risks — so the output can be argued with. Verified that filters genuinely change results rather than reshuffling one list.

**Sitemaps are split.** The 12,000 dossier URLs live at `/ideas/sitemap.xml`, referenced from `robots.txt`. Folding them into the main sitemap added ~1.7 MB and pushed it past the 2 MB ceiling on Next's `unstable_cache`, which made the **entire** sitemap fail to render — taking every other section down with it. Main sitemap is back to 0.92 MB.

**SEO/GEO wiring:** 115 `/ideas/*` hub URLs in the main `sitemap.xml` plus 12,000 dossiers in the dedicated one (12,000 dossiers, 61 verticals, 12 collections, 24 persona/modifier, 6 guides, 9 static); `Article` + `FAQPage` + `BreadcrumbList` + `CollectionPage` + `ItemList` JSON-LD; `llms.txt` extended with a dedicated AltF Ideas section whose figures import from `manifest.json` so they cannot drift. Every page opens with an answer-first paragraph — the chunk generative engines lift. `/ideas/compare` with a user-chosen set is `noindex, follow`; the empty picker state is indexable.

Verified: 24 route variants return 200 with zero runtime errors, lint clean, no horizontal overflow at 375px, and a scripted scan confirms no lost inter-word spaces from JSX whitespace collapsing.

---

## 7. Not yet built

- Time-sliced leaderboards (`today` / `week` / `rising`) — needs a published-at or vote-velocity field the corpus does not currently carry. Faking dates on a product whose pitch is transparent scoring is not an option
- Votes/saves persisted to Firestore
- Client-side search over the index
- Full-corpus detail pages via DNA rehydration — currently only the published 12,000 have dossiers, though the deterministic generator means the other 105k could be recomputed on demand
- Votes/saves persisted to Firestore
- Client-side search over the index

**Anti-thin-content rule for the programmatic tier:** implemented as `MIN_IDEAS_FOR_INDEX` in `packages/core/src/ideas/personas.js` — a page resolving to fewer than 8 ideas is noindexed at the page level. IdeasAI's 1,782 pages are near-duplicates; ours must not be. Expanding the modifier set past ~16 entries should keep this gate and add a unique-analysis requirement.

---

## 8. Gotchas worth remembering

- **Mechanism names must be countable nouns.** The prose frames render "a {name} that handles {job}". "classification" and "retrieval over a private corpus" shipped broken sentences across the whole corpus before this was fixed.
- **Indefinite articles must be derived.** `withArticle()` in `scoring.js` — "a anomaly detector" appeared on tens of thousands of pages.
- **Effort needs a prose form.** `EFFORT_PHRASES` ("a weekend"), separate from `EFFORT_LABELS` ("Weekend") used in chips.
- **The corpus is a build dependency.** `answerEngineManifest.js` imports `manifest.json`, so a build without `generate:ideas` fails at import. Both `prebuild` and `predev` run it.
- **Signal calibration is load-bearing for the design**, not just the data. Uncalibrated scores cluster, and the SignalBars fingerprint — the thing that makes two ideas visibly different — stops working.
- **Anything plotting or bucketing the published set must account for its skew.** These are the top 12,000 of 117,264, so their scores sit in the upper range. Fixed midpoints produce empty buckets; use medians or percentiles of the plotted set.
- **The main sitemap is near Next's 2 MB `unstable_cache` ceiling.** Exceeding it does not truncate — the whole document throws and every section loses its sitemap. Any large new section needs its own sitemap route serving a plain `Response`, plus a `robots.txt` entry.
- **`createPageMetadata` takes `noindex`/`follow` booleans, not a `robots` object.** Passing `robots: {...}` is silently ignored and the page ships indexable.
- **A duplicate DOM subtree in the preview pane is usually `<div hidden id="S:n">`** — React's streaming-SSR placeholder, not a real double render. Scope DOM assertions to `#main-content` before concluding there is a bug.
- **JSX collapses whitespace around expressions at line ends.** `{expr} word` wrapped across lines silently rendered as `12,000published`. Use an explicit `{" "}` when an expression is followed by text and the line wraps. A scan script for this pattern is worth re-running after copy edits.
