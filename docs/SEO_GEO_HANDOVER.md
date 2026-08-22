# SEO / GEO work — handover

Branch: `seo/geo-current` — 15 commits on top of `acf239d40`, build-verified.
Last build: **212.18 MiB** against the 215 MiB Amplify gate, prerender gate clear.

Built in an isolated worktree because the deploy branch was being actively
edited. The earlier `seo/integrated-2026-07-27` branch is superseded: its work
was cherry-picked onto the current HEAD here, so merge this one.

Two build-time guards run before `next build` and will fail the build rather
than let a false claim ship: `scripts/assert-no-server-tool-loader.mjs` and
`scripts/assert-transform-manifest.mjs`.

---

## 1. Merge it

```
git merge seo/integrated-2026-07-27
```

Then build once with the flags Amplify uses, or the artifact number is
meaningless:

```
ALTFT_DEFER_BULK_PRERENDER=true ALTFT_NODE_MAX_OLD_SPACE_SIZE=10240 npm run build
```

If a build reports a wildly high artifact (5,207 MiB happened twice), a dev
server was writing into the same `.next`. Kill it, `rm -rf .next`, rebuild.

---

## 2. What was built

**Internal linking** — `src/platform/linking/`: a static graph of ~1,700
linkable pages, a token-overlap scorer with three presets, and one shared
server-rendered band. Live on 20+ route families. Server-only (`server-only`
guard) because the graph imports the 12k-line tool registry.

**Embeddable widgets** — `/embed` hub plus `/embed/widget/[slug]` for 280
calculator and converter tools. Every embed carries a "Widget by AltFTool"
attribution link. This is the backlink engine: each site that embeds a widget
links back. `frame-ancestors *` is set only on the widget routes.

**`/alternatives`** — 23 comparison pages against incumbents whose pricing and
free-tier limits were read off their own sites and dated. Each page runs the
matching tool live on the page, which none of the competing pages do, and each
carries an honest "what they do better" section.

**`/deals`** — rebuilt from invented savings into dated price research: 28 paid
products, each with the date its price was read, the vendor's own free-tier
wording, and the free page that does the same job. The hub is built to be
cited.

**Indexing repairs** — `/tools/<unknown>` used to return an indexable 325 KB
page for any string; it now 301s. The root layout declared `canonical: "/"`,
so any page with an early metadata return told Google it was the homepage.
Category hubs render a crawlable index (0 → 66 links on one hub), 441 duplicate
tool titles were removed, and 59 self-competing URLs were consolidated by
canonical.

**GEO** — answer-first sentences and entity-anchored headings across 1,451 tool
pages, FAQ/HowTo schema on 103 calculators from content that already existed,
first structured data on 51 PDF/image tools, and `llms.txt` rewritten from a
tool dump into a 400-line machine-readable site map generated from live data.

**Doorway removal** — 141 geo pages were 84% identical. 140 are now noindex
behind an explicit allowlist and `/locations/india` is a real hub over 94
verified India-specific tools. Text similarity between two geo pages dropped
from 0.837 to 0.078.

---

## 3. Fabricated content removed

This took most of the session and recurred in every family audited. Removed:

- fake `AggregateRating` (4.5 stars / 1,200 reviews) on 8 fictional books, fake
  app ratings and download counts, fake game play counts
- 5 invented journalists with invented credentials, assigned at random per
  render and published as the JSON-LD author on real news stories
- `datePublished` falling back to now, so six-month-old stories restamped
  themselves as published today on every revalidation
- a newsletter form that waited 1.2s and said "check your email" without
  sending or storing anything
- an invented insurance company (name, CEO, address, phone, three testimonials)
  on an indexable YMYL page
- 100 invented quiz authors, 14 invented app reviewers, 16 invented deal
  testimonials
- 58 images hotlinked from three real companies' CDNs, and ~64 fabricated phone
  numbers
- two cloaked redirects: `/smartlink` (removed) and the Firestore-injected one
  on `/imgprompt` (neutralised at serve time — see below)

**The recurring one:** "everything runs in your browser / files are never
uploaded" was asserted absolutely in three places — 1,030 tool templates,
`/locations/india` (inside FAQPage schema), and `ALTFTOOL_POSITION`, which
feeds `llms.txt`. At least 129 tools call a network API. All three are now
scoped. If you write this claim again, scope it.

---

## 4. Still on you

1. **Clear the Firestore injected code** for `/imgprompt` and `/altpintrest`
   from the admin panel. The serve-time guard in
   `src/app/api/seo/page-code/route.js` strips navigation code, but the stored
   config still contains it. Watch server logs for
   `[seo/page-code] stripped navigating admin code from …` to find any others.
   Global injected code (rendered from `layout.jsx`) has the same gap and is
   not covered by that guard.

2. **The apex 302.** `altftool.com` → `www` is a 302; it should be a 301 or
   Google never consolidates the apex. This is emitted by Amplify/CloudFront
   before the request reaches the app — it needs a console change, not code.

3. **Blog bodies.** `blogSeoDefaults.js` replaces the body of every post under
   260 words with a generated template; all 31 static posts carry the same four
   headings. A separate task was started for this.

4. **Robots policy.** Bytespider (ByteDance) and CCBot (Common Crawl) are
   allowed. They feed training corpora rather than a citing assistant, so
   unlike GPTBot/ClaudeBot/PerplexityBot they return no traffic or attribution.
   Deliberate decision, not an oversight — change it if you disagree.

5. **Backlinks.** `docs/BACKLINK_EXECUTION_KIT.md` has the verified targets and
   ready-to-paste copy. The cheapest first move is creating the AlternativeTo
   account so its 7-day submission cooldown starts.

6. **Prices go stale.** Every figure under `/deals` and `/alternatives` carries
   the date it was checked, so ageing is visible rather than silent — but they
   need a refresh pass every few months.

7. **Activate Bing/IndexNow.** All the code is shipped but dormant — it is
   console work only (set `ALTFT_INDEXNOW_KEY` in Amplify, add the site to
   Bing Webmaster Tools, run the bulk script after deploys). Full operator
   checklist: `docs/BING_INDEXNOW_ACTIVATION.md`.

---

## 5. Known limits of this work

- One review run lost 19 of its verifiers to a session limit. Its findings were
  triaged in a later pass, but that pass was scoped to removal damage; the
  schema-validity and canonical-indexing dimensions were never completed.
- The `/bops/housing-services` landers are fictional brands ("Crestnova
  Roofing, Trusted Since 1967"). They are noindex, and the stolen images and
  fake phone numbers are gone, but the invented company identity remains. If
  they are demo templates that is fine; if they are meant to be real, they are
  not.
- `/apps` category counts are hardcoded and will drift as apps are added.
- Seven Wattpad books now have no reason to exist — they are noindexed rather
  than deleted, because deleting content is the owner's call.

---

## Added 29–30 July 2026

### Two new families indexed, one deindexed

`/transform` (64 converters) and `/exam-photo` (12 exams) shipped as orphans —
nothing linked to either, and `/exam-photo` was absent from the sitemap
entirely. Both are now in the linking graph, the sitemap, `/site-map`, and
`llms.txt` / `llms-full.txt` / `ai.txt`.

`/altfworld` went the other way. It is a display-only demo generating 5,000
members, 30,000 threads, 2,000 listings and 1,000 resources from word lists, and
it had seven URLs in the sitemap. Every route under it is noindex/nofollow now,
the sitemap entries are gone, and `robots.txt` disallows `/altfworld/forums/`
and `/altfworld/profile/` — an unbounded crawl space with nothing to index.
Restore by passing `noindex: false` from pages holding real content; do not flip
the default in `altfworld/seo.js`, because the mock routes will still exist.

### Four converters never worked

Running all 64 against their own sample found `svg-to-jsx`,
`svg-to-react-native`, `typescript-to-flow` and `flow-to-javascript` returning
"Cannot find module" — `@svgr/plugin-jsx`, `flowgen` and `@babel/preset-flow`
were never installed, while all four shipped a page saying they worked. Five
packages added (MIT/ISC), plus a Babel preset-resolution fix. 64 of 64 now
produce output.

Four `lib` values also credited packages that never ran — `html-to-pug` named
`html2pug`, which this repo has never depended on. `scripts/assert-transform-manifest.mjs`
now checks library attribution, the `uses` list on hand-written converters, the
`engine` flag against the client-loader registry, and that every converter still
produces output. It is wired into `npm run build`.

### `/top9` was returning 500

The hub and all 49 list pages. `Top9Client.jsx` rendered three components it
never imported, `ContentArea.jsx` and `FeaturedList.jsx` were unparseable JSX,
and `compactBrandedTitle` was called without an import. The build passed
throughout because the broken files were orphaned. Fixed, and `top9.css`
deleted — 55 selectors, none referenced.

### Fabrications removed

- `/wattpad`: `AggregateRating` and an INR `Offer` built from seed data (all
  eight ratings between 4.3 and 4.8, no review mechanism, no checkout). The one
  indexable title claimed 25 chapters and has 2. Part counts are counted now.
- `/top9`: invented view counts, ratings, "Trusted by Millions", plus title
  arrays printed over links to different slugs.
- `llms.txt` claimed CSV converters (there are none) and advertised
  `/transform/{from}-to-{to}` as the route pattern (true for 19 of 64).
- `/smartlink`'s cloaked ad-network redirect came back through a release sync
  and was removed again. **Check this after every sync.**

### Design tokens

`--danger-text`, `--success-text` and `--warning-text` are used 72 times across
38 files and resolved to nothing: `altftoolweb/packages/ui/src/tokens.css` (what
`node_modules/@altftool/ui` symlinks to) lacked the six declarations the root
copy has, and `globals.css` never aliased them. Measured in the browser, light
theme: base tokens 3.54 / 2.02 / 3.10:1 (AA fail), `-text` variants 6.09 / 4.73
/ 4.72:1 (pass). Both layers wired; the two `tokens.css` copies now match.

### Open, needs your decision

- Firestore-injected page code for `/imgprompt` and `/altpintrest`.
- The Amplify apex 302 → 301 (console, not code).
- Whether the ~39 fictional-brand `/bops/housing-services` landers are intended.
- `/top9`: Hero's search input is decorative, and 28 live list routes have no
  link from the hub.

---

## Added 8 August 2026 — share cards, footer reach, and the last unsourced numbers

### Per-tool share cards

`tools/all/[slug]/opengraph-image.jsx` generates a card per tool. Before this,
all ~3,800 tool pages fell back to `/assets/og-default.png`, so every link
looked the same wherever it was shared and nothing invited a click.

Two traps worth knowing if you touch it:

- `createPageMetadata` always sets `openGraph.images`, and an explicit images
  array **overrides** Next's file-based `opengraph-image` convention. The route
  must pass `image: /tools/all/<slug>/opengraph-image` or the file is generated
  and never used. `blogs/[slug]` is wired the same way.
- The catalog's `iconColor` is a Tailwind **class** (`"text-teal-600"`), not a
  colour. Passing it to satori threw and returned 500 for every tool — a build
  that passed while the feature was completely broken. It is resolved to a hue
  and mapped to a shade readable on the dark card; the catalog's own shades were
  picked for white backgrounds and most fail AA on navy.
- The server tool-loader guard substring-matches the whole file, comments
  included. Naming the guarded modules in a comment fails the build even when
  nothing imports them.

### The link-earning pages were unreachable

`Footer.jsx` renders `HOME_FOOTER_GROUPS` whenever `usesLandingChrome` is true,
which is nearly every page; `FOOTER_ROUTE_GROUPS` — the one carrying the embed
hub — renders only on the hidden-shell minority. So `/embed`, `/open-data` and
`/press` were reachable from tool pages and `/site-map` and nowhere else. All
three are in the main footer now.

### Academy ratings

All 17 platform ratings were bare unsourced numbers about third parties. 16 are
now sourced from each platform's own Google Play India listing with value,
rating count, source URL, check date and a `measures` field stating that the
number rates *that company's Android app* — not the platform, not its courses.
One platform publishes no first-party rating anywhere and its rating is gone.

**16 of 17 published figures were wrong.** Khan Academy showed 4.8 against an
actual 4.4; Unacademy and upGrad showed 4.5 against 4.1.

**This removes ratings from the live cards too, and that is deliberate.**
`/academy` renders from Firestore, and `normalizeAcademy` coerces `rating` to a
bare number, which the new `getAcademyRating` gate rejects. To bring ratings
back on the live page, add a provenance field to the academy CMS record and pass
it through `normalizeAcademy` — do not loosen the gate.

### Still unsourced on /academy, not fixed

Every `price` (17 claims about third parties, no source or date), the
`description` superlatives ("Best platform for UPSC, JEE, NEET, SSC"), and the
`badge`/`specs` feature assertions. Same class as the ratings were.

### Document version verifier

`collectBoundedPdfTextItems` existed only as a spec-first test that failed at
import, so `npm run validate` could not pass. Implemented and wired into the PDF
path with a 250,000-character budget — the exact threshold at which the
comparator rejects a side, so extraction can no longer produce text the
comparison will refuse. `npm run test:unit` is 923 pass / 0 fail.

The `hasEOL` normalisation the test describes was deliberately **not** adopted in
the live path: pdf.js sets it per visual line, which would turn a 100-page PDF
from ~300 lines into 3,000-5,500, and `alignLineChanges` throws above 3,000. That
would trade an unbounded-string risk for a new hard-failure class across much of
the tool's supported range.

Extraction `warnings` were produced by all three extractors and rendered
nowhere, so a rejected 200 MB file looked like an empty document. They render
now.
