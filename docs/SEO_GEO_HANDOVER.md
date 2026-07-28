# SEO / GEO work — handover

Branch: `seo/integrated-2026-07-27` (26 commits, every one build-verified).
Last build: **201.85 MiB** against the 205 MiB Amplify gate.

This branch was built in an isolated worktree because the deploy branch was
being actively edited at the time. It merges cleanly and has already absorbed
`main` and `fix/sitemap-xml-escaping`.

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
