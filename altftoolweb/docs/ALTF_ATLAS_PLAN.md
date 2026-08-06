# AltF Atlas

A curated directory of **useful** websites, at `/altfatlas`.

## What it is

Roughly 300 hand-checked websites that do one useful thing inside a browser
tab — no installation, no server of your own. Organised into 24 categories, 16
task-shaped use cases and 10 curated collections. Every entry has its own page.

## The name

`AltF Atlas`. An atlas is a maintained reference volume rather than an article,
which is exactly the difference the product is arguing for: a listicle is
published once and rots, an atlas gets a new edition. It also carries the whole
information architecture without strain — the map, regions, entries — and it
sits naturally beside `altfworld`, `altfgame` and `altfcalculators` in the URL
namespace.

## Where it came from

Seeded from the classic viral lists (`invespcro.com/blog/109-useful-websites`,
the "101 most useful websites" list circulated on Scribd), then expanded well
past both. Those lists are the competition and the case study at the same time:
they are now roughly half link rot, which is the single strongest argument for
building this as a directory instead of an article.

## Not to be confused with AltF Rabbithole

`/rabbithole` covers **interesting** websites and is organised around time to
joy. `/altfatlas` covers **useful** websites and is organised around what a
site costs you and whether your files leave your device.

They must not overlap. `fun-and-curiosities` was deliberately removed from the
Atlas taxonomy after Rabbithole landed — two pages on one domain competing for
"cool websites" is self-harm, and the Atlas data model (access level, "where it
stops") is meaningless applied to a generative art toy. If a fun site is
proposed for the Atlas, it belongs in Rabbithole.

## The load-bearing idea: what does this cost me before it works?

Every directory tells you what a site does. Almost none tell you the two things
you actually need before clicking:

1. **Access** — `open` (no account at all), `account` (free but there is a form
   in the way), `freemium` (real free tier, wall further in). Recorded as what
   the site costs before it does its **main job**, not what the top tier costs.
2. **Runtime** — `local` (processed in your browser, the file never uploads) or
   `hosted`. This is a privacy claim, so anything uncertain is recorded as
   `hosted`. A wrong `local` is worse than a missing one.

These drive the signature visual device: a coloured rule down the leading edge
of every card (`.afa-stripe`), learned once on the home page and readable
everywhere after. Do not "simplify" this into a generic tag — it is the product.

The third editorial requirement is `limits`: one honest sentence naming the wall
you will hit. A directory where every entry reads as excellent carries no
information; the limitation is the reason to believe the recommendation.

## Link rot is modelled as data

A site that shuts down is **not deleted**. It becomes `status: "retired"` with a
`successor` pointing at a live entry, chosen by the job it did rather than by
what it looked like. `/altfatlas/archive` is the whole set as retired → successor
pairs.

This is the differentiator no competitor has, and it targets a real query shape
("what replaced <dead site>") that nobody currently answers well.

## Routes

| Route | What it is |
| --- | --- |
| `/altfatlas` | Home — stats, legend, spotlight, categories, tasks, collections, archive teaser, FAQ |
| `/altfatlas/browse` | Full directory, client-side search + filters |
| `/altfatlas/categories` | Category index, grouped |
| `/altfatlas/category/[slug]` | One category × 24 |
| `/altfatlas/site/[slug]` | Entry detail × ~300 — the long-tail SEO surface |
| `/altfatlas/use-case` | Task index |
| `/altfatlas/use-case/[slug]` | One task × 16 — answer-first, the GEO surface |
| `/altfatlas/collections` | Collection index |
| `/altfatlas/collections/[slug]` | One collection × 10 |
| `/altfatlas/archive` | Retired entries with successors |
| `/altfatlas/learn` + `/learn/[slug]` | 6 editorial guides, incl. the public methodology |
| `/altfatlas/tags` + `/tag/[slug]` | 40 tag pages (≥5 entries each) |
| `/altfatlas/compare` | 2–4 tools side by side — **noindex**, see below |
| `/altfatlas/search-index.json` | Static index for the ⌘K palette |

All of it goes in the main `/sitemap.xml` — 426 URLs, nowhere near the size cap
that forced `/ideas` into its own document.

## Why compare is noindex and browse is not query-driven

They look like the same decision and are opposites, so both are deliberate:

- **`/browse` keeps filters in component state.** Every filter combination worth
  indexing already has a real server-rendered route, so `?category=` would mint
  thin duplicates competing with the pages that should rank.
- **`/compare` DOES sync to `?sites=`,** because a comparison is a thing you
  send to someone. That is also exactly why it is `noindex, follow` — every
  slug combination is a valid URL and a crawler would enumerate thousands.

## Derived data is memoised

`getFacetCounts`, `getTagCounts`, `getIndexableTags` and the slug→entries index
are wrapped in `memo()`. They are pure functions of frozen data but get called
from `generateStaticParams`, `generateMetadata` and the page body of every
route. Uncached, the tag grouping was O(tags × entries) and pushed tag routes
past their compile budget — the test suite alone went from 50 ms to 4 s.
**Treat the returned objects as read-only**; callers share one instance.

## Tags are grouped by SLUG, not by authored string

`open source` and `open-source` were authored separately and produce the same
slug. Two `generateStaticParams` entries for one route is a hard build failure,
so `getIndexableTags()` merges by slug, recounts against entries (an entry
carrying both spellings must count once) and labels with the commonest form.
The data was normalised too, but the merge stays as the guard.

## Code map

```
packages/core/src/atlas/
  taxonomy.js        categories, use cases, collections, access/runtime/status vocabularies
  catalog.js         assembly, import-time validation, all selectors
  catalog.test.mjs   editorial + taxonomy-coverage tests
  data/
    make-and-edit.js       files, PDF, images, video, design, writing
    build-and-analyse.js   AI, dev, data, diagrams, web utilities
    work-and-organise.js   notes, meetings, transfer, email, money, career
    learn-and-live.js      learning, research, privacy, travel, health, music, media
    archive.js             retired entries — authored last so successors resolve

src/app/altfatlas/
  atlas.css          --afa-* token layer, both themes
  layout.jsx         imports the CSS, mounts AtlasNav
  _components/       Pills, SiteCard + SiteGrid + SitePlate, Shell, AtlasNav, BrowseExplorer
```

`catalog.js` validates at import time and **throws** on a bad category slug, a
missing successor, an over-length tagline or a duplicate slug. That is
deliberate: a bad slug would otherwise silently drop an entry off its category
page with nothing anywhere complaining.

## Things that will bite you

- **`validate()` failing breaks the whole app, not just the Atlas.** It runs on
  import, and `sitemap.js` and `answerEngineManifest.js` both import the
  catalog. Read the thrown message; it lists every problem at once.
- **The plates are monograms, not favicons, on purpose.** Fetching 80 favicons
  from a third-party on the browse page would tell that service which directory
  pages a visitor reads — indefensible for a product whose flagship collection
  is "nothing leaves your device".
- **`/browse` filters are component state, not query params.** Every
  filter combination worth indexing already has a real server-rendered route;
  `?category=` would mint thin duplicates competing with those pages.
- **`AtlasNav` sticks at `top-16`** because the global header is `h-16` and
  `sticky top-0 z-50`. If the header height changes, this and the detail-page
  sidebar's `lg:top-32` both need updating.
- **The design system is theme-aware** (`html[data-theme="light"|"dark"]`, light
  is the default). Every `--afa-*` token is defined for both; the dark 400-weight
  hues fail contrast on the near-white light page.
- Repo convention: `page.jsx` is a server component holding metadata + JsonLd,
  with any interactivity in a separate client component. SEO helpers live at
  `@/platform/seo/generateMetadata`.

## Editorial rules (also published at `/altfatlas/learn/how-altf-atlas-is-maintained`)

- An entry must be the best, or a meaningfully different, answer to a real
  question. Near-duplicates are cut — what a curated list leaves out is what
  makes it worth reading.
- It must work in a browser tab with no installation. Desktop software goes to
  `/desktop`.
- `limits` is mandatory and may never say "no limits".
- Shutting down moves an entry to the archive. Only becoming actively harmful
  (dark patterns, paywalling the previously free feature, an ownership change
  that turns it into an ad vector) removes one.
- Nothing is a paid placement. Where AltFTool has its own tool for the same job,
  the entry links to it **alongside** the external site, never in place of it.
