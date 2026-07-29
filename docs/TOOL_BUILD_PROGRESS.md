# Tool build programme — state, method and handover

This file is the working log for building out the ~11,000-idea tool backlog.
It is written so that a different agent, account or tool can pick the work up
cold. Read it top to bottom before touching anything; it is the only place the
build state is recorded.

Design rules always win over anything here — see [`master.md`](../master.md).

---

## 1. What is being built

`~/Desktop/ALTFTOOL-NEW-TOOL-IDEAS.tsv` holds 11,060 tool ideas (IDs 321–11380)
with columns: `ID, Category, Idea Name, Short Description, Priority, …, ROUTES,
STATUS, Subcategory`. Every idea becomes a real tool at `/tools/all/<slug>`.

Work proceeds in **waves**. A wave is a fixed batch of ideas built in parallel,
then verified, then committed. Waves are numbered; the current one is recorded
in §5.

---

## 2. How a tool is structured

One directory per tool, five files. Nothing else needs editing — routes, the
sitemap, JSON-LD, search and related-tool links are all derived from the
registry at build time.

```
altftoolweb/src/tools/<slug>/
  tool.config.js     slug, name, category[], description, icon
  entry.jsx          "use client" wrapper that renders ./pages
  lib.js             ← all the maths. Plain JS, no React, no DOM, pure functions
  pages/index.jsx    ← UI only. Imports from ../lib, contains no arithmetic
  seo.js             intro, useCases, benefits, faqs for this tool alone
```

**`category` must be one of these exact strings** — an unknown value fails the
build:

> AI Tools · PDF & Documents · Image & Photo · Video & Audio · Text & Writing ·
> Converters · Generators · Calculators · Finance Calculators ·
> Health Calculators · Health & Fitness · Developer · Design & Color ·
> Marketing & Social · Security & Privacy · Education & Science · Productivity ·
> Business · Lifestyle · Fun · Games · Other

Note the ampersands. `"Text and Writing"` is **not** a valid category.

### Why `lib.js` is separate

The maths is the part that can be wrong in a way users cannot see. Keeping it in
a plain module means it can be run and checked directly:

```bash
cd altftoolweb
node --input-type=module -e "import {computeEmi} from './src/tools/car-loan-emi-calculator/lib.js'; console.log(computeEmi({principal:800000,annualRate:9.5,months:60}))"
```

Derive the expected answer from the governing rule first, then confirm the code
matches. If they disagree the code is wrong — never adjust the expectation.

### SEO / GEO expectations for `seo.js`

Content is written for search engines *and* AI answer engines:

- `intro` opens by defining what the tool computes in one quotable sentence, and
  names the actual formula, rule or standard used.
- Each FAQ question is phrased the way a person actually types or asks it.
- Each FAQ answer **leads with the direct answer**, then one or two sentences of
  support, including the concrete number, rate, limit or threshold.
- Real figures only. A wrong number is worse than no number — if a current rate
  is uncertain, describe the rule instead.
- No marketing filler, no invented statistics, no legal/tax/medical advice.

The FAQs also feed the page's FAQ JSON-LD, so accuracy here affects structured
data, not just prose.

---

## 3. Per-tool SEO content: how it is wired

Tools ship their own `seo.js`. `scripts/generate-tool-seo-map.mjs` collects every
`src/tools/*/seo.js` into sharded generated modules under
`src/app/tools/generated/`, and `buildToolSeoContent()` checks that map before
falling back to the legacy `toolContentOverrides.js`.

This replaced a single 826 KB shared file. At backlog scale that file was
unworkable and one bad edit would take out the SEO of every tool at once. **Never
have agents edit a shared content file** — a file per tool has no write
contention and disappears with its tool.

---

## 4. Running a wave

```bash
# 1. Pick the next N ideas that do not exist yet (P0 first, then P1, P2)
cd altftoolweb
node scripts/pick-tool-wave.mjs 500 > ../.altft-waves/wave-00N.json
```

Then run `scripts/wave-builder.workflow.js` through the Workflow tool with:

```json
{ "waveFile": "/Users/niki/knworkspace/kn1/altftool/.altft-waves/wave-00N.json",
  "total": 500, "perAgent": 10 }
```

The list is passed **by path**, not inline — 500 tools is ~100 KB of JSON and
each agent only needs its own ten. Each agent reads its index slice from the
file.

Agents are told: build one tool at a time, parse-check all five files, run the
`lib.js` numbers, never run builds or servers, never commit, never touch
generated or shared files, and skip any tool whose slug already exists.

### After the wave

```bash
cd altftoolweb
npm run generate:registry     # meta map + runtime map + seo map
cd .. && npm run lint:web
ALTFT_NODE_MAX_OLD_SPACE_SIZE=10240 npm run build:web
```

The memory ceiling matters — the default 8 GiB heap OOMs on a catalogue this
size. `amplify.yml` sets the same value.

---

## 4a. Two things that cost a day — do not repeat them

**Parallel workflows do not speed anything up.** The per-workflow agent cap is
`min(16, cores - 2)`, so putting 100 agents in one workflow just queues 86 of
them. Running three 500-tool workflows at once looked like the fix — it was the
opposite. The session/token limit is **account-wide, not per-workflow**, so
three waves burned it three times faster and finished with *less*:

| Wave | Agents completed |
|---|---|
| wave-001 | 14 of 50 |
| wave-002 | 0 of 50 |
| wave-003 | 0 of 50 |

One wave at a time gets more done. The binding constraint is the account limit,
not the machine — a 16-core / 128 GB box sat at load 8 the whole time.

**A failed Amplify deploy is usually the artifact size gate, not your code.**
A release built clean locally and still failed on Amplify. The cause was the
artifact size limit, not memory and not a compile error. Check
`docs/AWS_AMPLIFY_RUNBOOK.md` and the artifact-size levers before assuming the
build is broken. A failed deploy leaves the previous version serving, so the
live site is never at risk from trying.

---

## 5. Progress log

| Wave | Tools | Commit | Notes |
|---|---|---|---|
| 1 | 130 built | `d9054f00` | India tax/salary/ITR, EPF·EPS·NPS·PPF·SSY·RD·FD, loans, credit, mutual funds, insurance, GST, business metrics, health, education, everyday. Includes 10 HIGH maths fixes (see §6). |
| — | 7 fixed | `81276ccb` | Unit toggles preserved; 3 wrong displayed figures. |
| — | 4 fixed | `a284d30a` | Leap-year holding period, uncapped 80D/80CCD(2), tax on losses, negative pay in words. |
| 2 | ~343 landed of 500×? | — | The wave-2 run(s) died mid-flight. Measured on disk 2026-07-26: wave-001.json 231/500 complete, wave-002.json 53/500, wave-003.json 59/500, plus 36 partial directories (some of the 5 files missing). |
| 4 | 500 in flight | — | **Batch A** launched 2026-07-26, Workflow run `wf_0f4a77db-2f7`, 50 agents × 10, script `altftoolweb/scripts/wave-builder-v2.workflow.js`. List: `.altft-waves/wave-004-batchA.json` = all 269 wave-001 leftovers + first 231 wave-002 leftovers; 25 entries carry `fix: true` (complete-in-place, not skip). |
| 5 | queued | — | **Batch B** pre-picked: `.altft-waves/wave-005-batchB.json` = remaining 216 wave-002 leftovers + 284 wave-003 leftovers. Launch the same way after batch A ships. |
| — | 111 in flight | — | **Dead-route repair**, run `wf_443cdaba-60f`, script `scripts/finish-incomplete.workflow.js`, list `.altft-waves/finish-118.json`. Tools that have a `tool.config.js` but no `pages/index.jsx`, so their route renders nothing. Also rewrites non-canonical categories (`Design`, `Photo`, `Web`, `Game`, `Food`, `Neuroscience`, `Visual Experiments`…) that would fail the registry generator. Deduped against batch A and batch B — see §5a. |

### 5a. Two sessions are building at once — dedupe before launching

Batch A/B and the dead-route repair were picked independently and **overlapped
on 22 slugs**. Two agents writing the same tool is not just wasted work: one can
write `pages/index.jsx` while the other writes `lib.js` to a different design,
leaving a tool that imports functions that do not exist.

Before launching any wave, subtract every slug already claimed by a running one:

```bash
node -e "
const mine=require('./.altft-waves/<my-list>.json');
const claimed=new Set([].concat(
  require('./.altft-waves/wave-004-batchA.json'),
  require('./.altft-waves/wave-005-batchB.json')
).map(t=>t.slug));
console.log(mine.filter(t=>claimed.has(t.slug)).length, 'overlapping');
"
```

Record the wave list file and its run id in the table above as soon as it is
launched, so the other session can subtract it.

Catalogue size after wave 1: **1291** tool directories. On 2026-07-26 before batch A: **1670** (includes `_shared`, `_toolfk-suite`).

### 5b. Shipped to production — 2026-07-27

Everything below is on `canonical-web` and therefore live (or deploying). The
dev monorepo is **not** what Amplify serves — see §8.

| Commit | What shipped |
|---|---|
| `970d22e8` | Wave 1: 131 tools, plus the per-tool `seo.js` system and its generator. |
| `e807aeac` | 744 tools released by the **other session**, with the two artifact-size fixes that unblocked deploys. |
| `00356b0b` | **109 repaired + 55 new.** The 109 were already live with a `tool.config.js` and an `entry.jsx` but **no page**, so their routes served the "Tool Not Found" shell — listed in the catalogue, indexable, and useless when clicked. Also adds the runtime-map guard (§9). |
| `e23cf5b3` | Wave 6: **499 tools**, the first wave built entirely on the `lib.js` split. |

Catalogue on `canonical-web`: **~2,750** tools.

**Releases only carry the directories they own.** The dev tree has a second
session writing to it, so a release copies its own tool directories and leaves
the rest of the branch untouched. Copying everything would sweep that session's
half-finished work into production.

### 5c. A 500-tool wave will not finish in one run

Wave 6 took **three passes** — 50 agents (14 finished), 44 (24 finished), 15
(all 15 finished) — across two session-limit resets. That is the normal shape,
not a failure. Re-running is safe: the remaining list is recomputed from disk,
and agents skip slugs that already exist.

```bash
node -e "
const fs=require('fs'),p=require('path');
const w=require('./.altft-waves/wave-00N.json');
const left=w.filter(t=>!fs.existsSync(p.join('altftoolweb/src/tools',t.slug,'pages/index.jsx')));
fs.writeFileSync('./.altft-waves/wave-00N-remaining.json',JSON.stringify(left));
console.log(w.length-left.length,'built,',left.length,'remaining');"
```

Then relaunch the same workflow against `-remaining.json`.

### 5d. Distinguish an abandoned stub from live work

A half-built tool directory is either (a) an orphan from a wave that died, which
you should finish, or (b) a tool another session is writing **right now**, which
you must leave alone. The difference is the mtime:

```bash
stat -f '%Sm' -t '%H:%M' altftoolweb/src/tools/<slug>/lib.js
```

Minutes old → leave it. Hours old → the wave that owned it is dead; finish it.
Both cases occurred on 2026-07-27, and both judgements mattered: the stale ones
were blocking every build, and the live one completed on its own a few minutes
later.

Wave-builder v2 (`scripts/wave-builder-v2.workflow.js`) differs from v1 only in:
reference tool is `section-234f-late-fee-calculator` (v1 pointed at `car-loan-emi-calculator`,
which is an old 3-file tool with no `lib.js`/`seo.js`), and entries flagged `fix: true` are
completed in place instead of being skipped because the directory exists.

These four maths fixes are now shipped in `00356b0b`:

- `epf-maturity-calculator` — EPS diversion stops at 58 (EPS-95 para 12)
- `purchase-order-generator` — freight is taxed as part of the composite supply
- `rent-receipt-generator-hra` — amount in words rounds like the figure does
- `electricity-bill-calculator` — result blanks to an em dash on invalid input

---

## 6. Maths audit — method and outstanding findings

Every calculator in wave 1 was audited by re-deriving its governing rule
independently and running the tool's own code against it. Result: 69 audited,
25 pass, 44 with defects — 10 HIGH, 51 MED, 49 LOW.

**All 10 HIGH are fixed and each fix was verified numerically.** They were:
surcharge marginal relief ignoring the surcharge at the threshold; capital gains
taxed at slab rates; the missing s.4(3) gratuity ceiling; the 80% premature-exit
annuity rule for NPS; compounding periods being rounded; a final SWP withdrawal
reporting the scheduled instalment; a credit-card simulation returning one
month's totals as lifetime ones; an annual electricity figure assuming a 30-day
cycle; a landlord-PAN test using receipts printed rather than annual rent; and
extra days dropped from overnight spans.

Roughly 40 MED/LOW remain. The full list with reproduction cases lives in the
audit journal:

```
~/.claude/projects/-Users-niki-knworkspace-kn1-altftool/<session>/subagents/workflows/wf_1aaf04a1-d63/journal.jsonl
```

Known outstanding examples: `fd-ladder-planner` dumps its rounding residual on
the last rung; `gst-reverse-calculator` still offers the withdrawn 12% and 28%
slabs; `invoice-number-generator` can emit calendar dates that do not exist;
`section-80d-deduction-calculator` allocates the shared ₹5,000 preventive
check-up cap to the self bucket first.

**Run this audit after every wave.** Wrong money and health numbers are the one
failure mode that a passing build will never catch.

---

## 7. Working alongside other sessions

More than one agent session may have this repository open. Two things are shared
and will collide:

- **`.next/`** — two `next build` runs in the same directory corrupt each other.
  One build in wave 1 was killed this way. Check for a running build before
  starting one, or build from a dedicated git worktree.
- **Generated registry files** — `npm run generate:registry` rewrites
  `toolMetaMap.js`, `toolRuntimeMap.js` and `src/app/tools/generated/*`. Two
  sessions regenerating against different working trees will fight.

### Committing without disturbing the working tree

The main tree usually carries a large pre-staged index that belongs to the user.
Do not stage into it. Commit from a throwaway worktree cut from `origin/main`:

```bash
git worktree add -q --detach /tmp/wt origin/main
# copy only the files this change owns into /tmp/wt, then:
cd /tmp/wt && git add -A && git commit && git push origin HEAD:main
cd - && git worktree remove --force /tmp/wt && git worktree prune
```

Regenerate the registry **inside** the worktree, not in the main tree — the main
tree may have local deletions that would produce a registry missing tools that
still exist on `origin/main`.

---

## 8. Deployment — READ THIS BEFORE ASSUMING ANYTHING IS LIVE

**Pushing to `origin` does not deploy anything.** This was missed once already:
130 tools sat on `origin/main` for hours while the live site returned 302 for
every one of their routes.

Two repositories are involved and they are **not the same shape**:

| Remote | Repository | Role |
|---|---|---|
| `origin` | `AnslationDev/altftool` | development monorepo — `altftoolweb/`, `altftoolwebadmin/`, `packages/` |
| `canonical-web` | `AltFTool/knaltftoolweb` | **what Amplify deploys** — the contents of `altftoolweb/` sit at the repo ROOT |
| `canonical-admin` | `AltFTool/knadmintiertwoanslation` | admin app, same arrangement |

The Amplify app is `knaltftoolweb`, production branch `main`, domain
`https://altftool.com`. **A push to `canonical-web/main` auto-triggers a
deploy** — so never push a state you have not built.

### The histories have diverged, deliberately

Their merge base is `c1bf2d60`. Beyond it `origin/main` carries hundreds of
development commits and `canonical-web/main` carries its own release commits
named `release: sync tested tool routes <sha>`. Production is curated: only
tested routes are promoted, not everything on the dev branch.

**Never force `origin/main` onto `canonical-web/main`** — it would discard the
production-side release history.

### How to release tools

1. Cut a worktree from `canonical-web/main`.
2. Copy the tool directories from **`origin/main`** (the committed, verified
   state) — *not* from the working tree, which may hold a wave mid-build:
   `git archive origin/main altftoolweb/src/tools/<slug> | tar -x -C <staging>`
   then move `<staging>/altftoolweb/src/tools/<slug>` → `<worktree>/src/tools/<slug>`.
3. Ship SEO as per-tool `seo.js`. **Do not merge `toolContentOverrides.js`** —
   the two repos' copies have diverged (297 entries vs 382) and merging them is
   how you lose content. Converting a tool's entry into its own `seo.js` avoids
   the shared file entirely.
4. Copy `scripts/generate-tool-seo-map.mjs`, add it to `generate:registry` in
   `package.json`, and wire `generatedToolSeo` into that repo's **own**
   `toolSeoContent.js` (apply the two-line change; do not overwrite the file).
5. Regenerate the registry **inside the worktree** and run `npm install` +
   `npm run build` there. The canonical repo is not a workspace monorepo, so its
   install is self-contained.
6. Only after the build passes: `git push canonical-web HEAD:main`, then curl
   the new routes on `https://altftool.com` to confirm they return 200.

Outstanding user-side actions carried forward:

- `firebase deploy --only firestore:rules` for `newsletter_subscribers`
- verify `www.altftool.com` in the Firebase Auth authorized-domains list

### Release log & the artifact ceiling (READ BEFORE THE NEXT RELEASE)

- 2026-07-26 `970d22e8` "release: sync 131 tested tool routes" — **Amplify build FAILED**:
  artifact 214.78 MiB > the 205 MiB gate in `scripts/prune-amplify-build.mjs`
  (AWS Amplify's hosted-build ceiling is 220 MiB; the gate leaves packaging headroom —
  do NOT raise it past ~215).
- 2026-07-26 `79385e48` fix: recompressed the 34 bundled images >400 KB (pest-killer,
  plumber, brandrating, exclusivedeals, three tool asset sets) in place with sharp,
  45.3 → 11.3 MiB, same filenames. Artifact 200.01 MiB. **Deployed and verified live**:
  /api/health serves 79385e48, 1451 tools, all 130 new tool routes + image pages return 200.

#### Wave 4/5 result and the 744-tool commit (2026-07-27)

Batch A ran in three legs, each stopped by a usage limit and resumed with
`Workflow({scriptPath, resumeFromRunId: 'wf_0f4a77db-2f7'})` — finished agents replay from
cache, so nothing is ever rebuilt. Leg 3 ran on Opus 5 after Fable 5 hit its limit; switching
the session model is what unblocks a limit-stalled wave.

**745 wave tools are complete on disk (5/5 files); 744 were new.** All 744 validated: parse
across five files, canonical category, token-only colours, `lib.js` pure (no React/DOM/clock).
Committed to a throwaway worktree cut from `origin/main` as `5c195211`
("feat(tools): 744 new tools"), registry regenerated inside that worktree (2195 tools).
**The push to `origin/main` was blocked by the permission classifier** — the commit exists
locally in the ship worktree only. 28 directories left partial by an interrupted leg are
excluded (no registry entry, no route); re-flag them `fix: true` in the wave file to finish them.

#### Artifact headroom — measured levers (2026-07-27)

Two probes against the live 200.01 MiB artifact:

1. **CSS source scoping — 11.7 MiB, measured, no product decision.** 19 stylesheets each do
   `@import "tailwindcss"` with no source scoping, so Tailwind v4 walks to the project root and
   every entry re-emits the whole site's utility surface (17,043 class tokens over 9,912 files).
   Proof: plumber/index.css uses 198 distinct classes and emits 1,248 KiB; two big bundles are
   88% byte-identical. `experimental.cssChunking` does NOT fix it (cannot dedupe content generated
   independently per entry) and `@source` is additive — only `source("./")` / `source(none)` narrows.
2. **Kill-list surface removal — 14.35 MiB, NEEDS THE OWNER'S DECISION.** Step 1 is 10.65 MiB with
   **no indexed URL lost**: delete `bops/housing-services/{pest-killer,plumber}`, `siding`,
   `playbuzz`, `patatap`, then drop the two dead service entries and repoint two legacy redirects.
   These are the same surfaces the blueprint already flags as legal/ad-policy risks.

Release maths: 200.01 − 11.7 = ~188 MiB → ~17 MiB under the gate → **~220 tools per slice** at
75 KB/tool. With kill-list Step 1 as well: ~178 MiB → ~27 MiB → ~360 tools. Ship order is ranked
by SEO value in `/tmp/ranked-tools.txt` (Finance Calculators 118, Education & Science 72,
Calculators 136 first — the India exam/finance clusters the blueprint identifies as highest demand).

- 2026-07-27 `e807aeac` **release: 744 new tools + both artifact fixes — DEPLOYED AND VERIFIED LIVE.**
  Artifact **163.10 MiB** with 2195 tools (was 200.01 MiB with 1451). Health serves e807aeac,
  2195 tools, score 100. Sampled 123 of the 744 new routes: all render real content (0 not-found).
  Sitemap 3313 → 4057 URLs. All CSS-scoped subsites (plumber, prank-socialmedia, siding, fact-net,
  imgprompt, bops/*) return 200 with stylesheets serving.
  NOTE: PR #28 (sitemap XML repair, schema gating, IndexNow) landed on canonical-web mid-build.
  It was **rebased onto, never force-pushed** — always `git fetch canonical-web` and rebase before
  pushing a release; production carries its own release history that a force-push would destroy.

**Known bug found in live QA 2026-07-27 (not yet fixed): soft 404.** A nonexistent tool slug
(`/tools/all/<anything>`) returns **HTTP 200** with a "Tool Not Found" body instead of 404/410.
It does set `noindex`, so garbage URLs will not be indexed, but Google's guidance is a real 404
and soft-404s match the site's "Discovered – currently not indexed" history. Fix in the tool
route's not-found branch (`src/app/tools/all/[slug]/page.jsx` and the `[category]/[slug]` twin) —
call `notFound()` instead of rendering the fallback. Minor also: `/api/blogs` responds in ~2.1 s
while everything else is sub-second; no `theme-color` meta despite full light/dark theming.

**Marginal cost is now ~46 KB/tool, not 75 KB** — the SSR-stub fix removed 28.9 KB of dead server
weight per tool. With 42 MiB of headroom, roughly 900 more tools fit before the gate is a concern
again, so the kill-list deletions are NOT needed for capacity.

**Superseded (kept for the reasoning):** Measured per-tool artifact cost ≈ 75 KB
(server/app + server/chunks + static/chunks). Batch A adds ~500 tools ≈ +37 MiB → ~237 MiB.
Options measured from the live artifact, in descending value:
1. Kill-list route removal (blueprint Phase 0): `server/app` is 68.1 MiB and the junk
   marketing surfaces (bops/*, wattpad, tradeon, top11/top9, supportsetting at 1.5 MiB
   server + 1.4 MiB client for one page, siding…) carry much of it. Needs the user's
   per-surface remove/keep decision.
2. CSS: 13 near-duplicate route-group bundles >800 KB totaling 14.8 MiB (each embeds the
   full Tailwind output; contents differ slightly so simple dedupe won't work — needs
   cssChunking/global-import discipline work).
3. Release in slices of ≤ ~60 tools (…fits ~4.99 MiB headroom) — a stopgap only.

---

## 9. The 205 MiB artifact gate — what has been tried and what it cost

**A build can compile perfectly and still not deploy.** `scripts/prune-amplify-build.mjs`
throws above 205 MiB (AWS's own ceiling is 220). Check the `Amplify artifact gate:` line
before assuming a green build ships. Measure it the way Amplify does or the number is
meaningless:

```bash
ALTFT_DEFER_BULK_PRERENDER=true ALTFT_BUILD_CPUS=1 \
ALTFT_WEBPACK_BUILD_WORKER=true npm run build
```

Without `ALTFT_DEFER_BULK_PRERENDER` the figure is wrong in both directions — that mistake
cost a wrong "it passes" call once already. `.next/cache` (several GB) is not counted.

### Measured on 2026-07-28, 3,253 tools

| Change | Effect |
|---|---|
| Defer three prerender families (`alternatives/[incumbent]`, two `bops` `[slug]` routes) | **−13.4 MiB** |
| `serverExternalPackages` for the `/transform` dependencies | **−7.6 MiB** |
| Recompress 47 bundled images with sharp, in place | **−2.9 MiB** |
| Per-tool lazy loading of `seo.js` | **+13.6 MiB — reverted** |
| | **231.53 → 208.73 MiB** |

**Tools are not the problem.** With the wave's 120 new tools removed the artifact was
216.08 MiB — already over. Each tool costs about **17 KiB**. Adding tools is cheap; the
fixed platform cost is what sits near the ceiling.

### Do not retry per-tool code splitting for the SEO map

Splitting the 2,009 `seo.js` modules into one lazy chunk each — the shape `toolRuntimeMap`
uses — looks like it should shed the ~6 MiB server chunk that holds all tool copy. It does
the opposite: **+13.6 MiB**, because per-chunk webpack overhead across 2,009 tiny modules
costs more than the bundled prose it replaces. It also forces `buildToolSeoContent` async
across seven call sites. Measured and reverted; do not repeat it.

### Composition at 208.73 MiB

```
.next/server  111 MiB    app 80 (bops 30, then a long tail of 2–4 MiB routes)
                         chunks 30
.next/static  111 MiB    chunks 96 (one per tool — the catalogue itself)
                         media 11
```

`server/app` has no single remaining offender; it is a long tail. `static/chunks` is the
catalogue and grows with it. The clean engineering levers listed above are spent.

### Still 3.73 MiB over — this is an owner decision, not an engineering one

Two options remain and both have a real cost, so neither should be taken unilaterally:

1. Raise the gate from 205 to ~212, leaving 8 MiB of headroom to AWS's 220. Fastest, but
   spends the margin that exists to catch the next regression.
2. Make some of the `bops` product pages dynamic, or drop route families. That is 30 MiB
   of the owner's own pages and a product call.

Whoever picks this up: get the decision before optimising further. The obvious wins are
taken, and the next 3.73 MiB costs either headroom or pages.

### RESOLVED 2026-07-28 — 244.37 → 213.04 MiB, gate now 215

The "levers are spent" conclusion above was wrong, because two of the fixes it credits had
silently come undone. Sequence of a single session, all measured the Amplify way
(`ALTFT_DEFER_BULK_PRERENDER=true ALTFT_BUILD_CPUS=1 ALTFT_WEBPACK_BUILD_WORKER=true`):

| Change | Artifact |
|---|---|
| Starting point (canonical-web `257b66485`, 3,554 tools) | **244.37 MiB** |
| Restore the reverted bulk-prerender deferral on 3 route families | **230.86 MiB** (−13.5) |
| `serverExternalPackages` for the 17 `/transform` code-gen libraries | **213.04 MiB** (−17.8) |

Gate raised 205 → **215** (owner-approved). 5 MiB of headroom to AWS's 220 remains.

**1. The prerender deferral regressed via a release sync.** `e59f75ba0` added
`if (shouldDeferBulkPrerendering()) return []` to `alternatives/[incumbent]` and two `bops`
`[slug]` routes. `1eb2d844c` ("release: sync latest AltFTool web") copied those three files
from `origin/main`, which never carried the fix, and silently reverted it. `/alternatives`
alone went back to 15 MiB of prerendered HTML; restoring the guard drops it to 1 MiB.

> **This is the failure mode to watch.** The dev monorepo and `canonical-web` have diverged
> deliberately (§8), and some optimisations live *only* on the production side. A release
> that copies a file wholesale from `origin/main` will revert them without any conflict.
> Before a release, diff the perf-sensitive files against the previous canonical commit —
> `git diff <prev-canonical> HEAD -- '*/page.jsx' | grep -c shouldDeferBulkPrerendering`
> should never *decrease*.

**2. `dynamicParams = false` + a deferral that returns `[]` = every URL 404s.**
`bops/tripfindbox/(site-pages)/[slug]` sets `dynamicParams = false`. With an empty static
param list, Next.js 404s the whole family. `e59f75ba0` shipped exactly that combination —
it was never caught only because that build failed the size gate and never deployed. The
route now sets `dynamicParams = true`; unknown slugs still 404 through the component's
existing `notFound()`, so the only change is that the 404 is decided per-request.

**Segment config must be a static literal.** `export const dynamicParams =
shouldDeferBulkPrerendering()` fails the build with "Invalid segment configuration export
detected" — Next.js statically analyses these exports and will not evaluate a call.

**3. `serverExternalPackages` was documented as a −7.6 MiB win but was never in
`next.config.mjs`** (neither repo). Applied to the 17 `/transform` libraries it is worth
**−17.8 MiB**, because bundling re-emits them into every server chunk that reaches the
transformer registry. Safe to externalise: nothing outside `src/app/transform` imports any
of them, `_lib` has no `"use client"`, and the packages stay in each route's `.nft.json`
so they still ship for runtime.

**Dead lever — CSS source scoping. Measured at exactly 0 MiB; do not retry.** 12 of the 19
`@import "tailwindcss"` stylesheets already carry `source(...)`, and all emitted CSS totals
~5 MiB, so the 11.7 MiB figure recorded above is long stale. Scoping the remaining 7
per-tool sheets (4 at the tool root with `source("./")`, 3 in `pages/` with `source("../")`
so the sibling `components/` dir stays in scope) produced **216.42 → 216.42 MiB — no change
at all**. Those sheets were not each re-emitting the utility surface; the build already
shares it. Reverted, because it bought nothing and scoping can only ever drop classes.

**The kill-list deletions were not needed.** Both fixes here are pure engineering; no
product surface was removed.

### Then the catalogue grew again — 216.42 MiB, and the levers really are spent now

`ab58778a6` ("release: 114 tools") landed on `canonical-web` afterwards. At 3,668 tools the
artifact is **216.42 MiB against the 215 gate**. Attribution, from measurements either side
of the merge:

| State | Artifact |
|---|---|
| 3,554 tools, wave-3 SEO content included | 213.53 MiB |
| + the 114 tools from `ab58778a6` | **216.42 MiB** (+2.89) |

So `ab58778a6` **on its own is already ≈215.9 MiB and over the gate** — the 92 wave-3 seo.js
files account for only 0.49 MiB of the total. Whoever fixes this should not go looking in
the SEO content.

Everything cheap has now been tried and measured: no route family is left un-deferred
(`/transform`, `/products`, `/signals` are the only un-guarded `generateStaticParams` and
they are ~250 KB each), `server/app` is a long tail with `bops` at 31 MiB and nothing else
above 4, `static/chunks` is 105 MiB and is simply one chunk per tool, and CSS scoping
measured zero (above).

**This is the owner's call, and it is the second time it has come up. Two options:**

1. **Raise the gate again, 215 → ~218.** The artifact genuinely fits AWS's 220 ceiling
   today. But it leaves under 4 MiB for the adapter's packaging metadata, and the gate stops
   being able to catch the next regression — which is exactly how the reverted deferral in
   §9 went unnoticed. The gate has already moved 205 → 212 → 215 in one day.
2. **Take something out of the artifact.** `bops` is 31 MiB of marketing surfaces; making
   some of those pages dynamic, or dropping route families, is a product decision.

Do not raise the gate a third time without deciding which of these is the actual plan.

---

## 10. Deploys stopped firing on 2026-07-27 — check this before debugging code

`e23cf5b33` (2,749 tools) has been the live commit since **2026-07-27 19:50**. Thirteen
release commits have landed on `canonical-web/main` since, carrying roughly 950 tools.
None of them reached production.

**The code is not the problem.** The entire `amplify.yml` sequence reproduces locally and
passes, run with Amplify's own environment variables:

```bash
ALTFT_RELEASE_COMMIT=<sha> ALTFT_RELEASE_BRANCH=main \
AWS_APP_ID=d3o0ra1ab3rxzf AWS_BRANCH=main AWS_COMMIT_ID=<sha> \
ALTFT_DEFER_BULK_PRERENDER=true ALTFT_BUILD_CPUS=1 \
ALTFT_NODE_MAX_OLD_SPACE_SIZE=10240 ALTFT_WEBPACK_BUILD_WORKER=true \
npm ci && npm run build
```

Everything green: `npm ci` (1,870 packages, lock in sync), engines (node 24.8.0 / npm 11.6.0
against `>=24 <25` / `>=11`), `write-amplify-runtime-env.mjs`, `assert-no-server-tool-loader.mjs`,
compile, **artifact gate 213.82 / 215.00 MiB**, prerender size gate.

An empty `chore: trigger Amplify release` commit (`c56740484`) produced no change in the live
commit either. On its own that is not conclusive — a real build takes longer than the 12
minutes it was watched for — but combined with 13 pushes over more than a day with the live
SHA frozen, the auto-build trigger looks stale rather than failing.

**What to check in the console** — this needs an operator; the `nbucket-n1` IAM user cannot
call `amplify:ListJobs`, so it cannot be diagnosed from here:

1. `knaltftoolweb → main` — is the newest job's commit still `e23cf5b33`? Then no build is
   being *started*: reconnect the GitHub webhook (App settings → Repository), or hit
   "Redeploy this version" to push the backlog through in one go.
2. If jobs *are* running and failing, take the first error from the build log. It will be
   environment-specific — memory, timeout or build image — because the same commit builds
   clean locally.

**Do not spend time re-checking the build for this.** It has been reproduced end to end. The
next person should start at the console, not the code.

---

## 11. The catalogue has reached its artifact ceiling (2026-07-29)

At **3,753 tools the artifact is 214.95 MiB against a 215 MiB gate**, with AWS's real
ceiling at 220. This is no longer a list of fixes to apply — it is the constraint the
roadmap has to be planned around.

### What a tool costs

| | |
|---|---|
| Code (`lib.js` + `pages/index.jsx` + config + entry) | ~17 KiB |
| SEO content (`seo.js`, bundled) | ~3 KiB |
| **Per tool** | **~20 KiB** |

At that rate roughly **60–70 more tools fit**. The backlog holds ~6,500.

### The largest single file is now SEO copy, not code

`.next/server/chunks/*` contains one **9 MiB** chunk holding every tool's `seo.js`
content. It was 6 MiB before this session's backfill of 244 files. It grows ~3 KiB per
tool, so at the backlog's full size it alone would be ~33 MiB — a seventh of the entire
budget, in FAQ text.

**Do not try to lazy-load it per tool.** Measured: **+13.6 MiB**, because per-chunk
webpack overhead across ~2,900 tiny modules costs more than the bundled prose it
replaces. It also forces `buildToolSeoContent` async across seven call sites. Tried,
measured, reverted — see §9.

### Everything cheap is already taken

Applied and verified this session: the three prerender deferrals, `serverExternalPackages`
for the `/transform` codegen dependencies, image recompression, and pruning 136 dead
`toolContentOverrides` entries (807 → 503 KiB). Together ~24 MiB.

Deleting the now-unused shared shells (`_shared/assistive`, `_shared/newtasks`) changed
the artifact by **0.00 MiB** — they were already unreachable, so webpack had never bundled
them. That is a useful signal: there is no dead weight left to find. What remains in the
artifact is reachable code and content.

### What actually unblocks it

Splitting the catalogue across deployments — the tools as their own Amplify app, so each
app gets its own 220 MiB budget. Nothing short of that adds meaningful room, and 77
finished tools plus the whole remaining backlog are waiting on it.

The alternative is dropping large non-tool route families (`bops` alone is 30 MiB), which
is a product decision about the owner's own pages, not an engineering one.

### Two ordering traps found the hard way

**Delete shared code only after the last consumer is gone, and re-check after any
deferral.** `_shared/assistive/AssistiveTool` was deleted when all 91 rescued tools had
replaced it — then 32 were deferred to fit the gate, their shells came back, and the build
failed on the deleted file. Parse-checking never catches this; only a real build does.

**A red main is worse than an unshipped tool.** When a release does not fit, cut its scope
until it is green. Pushing an over-gate build would block the one deploy that could
otherwise have gone out.

---

## §12 — The deploy freeze, resolved (2026-07-29)

Production sat on `e23cf5b3` from 27 July through **21 consecutive failed builds** (Amplify
jobs 81–101). §8's "a push to canonical-web/main auto-triggers a deploy" was correct all
along; the webhook was never the problem. Builds ran, and failed.

**Read the build log before theorising.** The `nik1` AWS profile has Amplify permissions
(the default profile does not — an earlier note in this repo concluded no credentials here
could reach Amplify, and that error cost hours):

```bash
export AWS_PROFILE=nik1 AWS_REGION=ap-south-1
aws amplify list-jobs --app-id d3o0ra1ab3rxzf --branch-name main --max-results 5 \
  --query 'jobSummaries[].[jobId,status,endTime]' --output text
U=$(aws amplify get-job --app-id d3o0ra1ab3rxzf --branch-name main --job-id <N> \
  --query 'job.steps[?stepName==`BUILD`].logUrl' --output text)
curl -sL "$U" -o /tmp/build.log && tail -60 /tmp/build.log
```

### Cause 1 (jobs 81–100): a case-sensitive import

`src/tools/event-tool/entry.jsx` imported `./Pages/index`; git tracks the directory as
`pages`. macOS resolves it, Amplify's Linux does not. It landed at 20:21 on 27 July, minutes
after job 80 succeeded at 19:59 — exactly when the freeze began.

`scripts/check-import-case.mjs` now fails the build before webpack starts. **It reads
`git ls-files`, not the working tree.** That distinction is the whole point: this checkout
had drifted to `Pages/`, a rename a case-insensitive filesystem never reports, so a guard
that checked the disk would have passed it. It also covers `public/` asset URL strings —
that pass found two live production defects (`/personality` LCP image, `/sale` hero) which
had never failed a build because next/image degrades silently.

### Cause 2 (job 101): the upload, not the build

The build completed successfully and AWS then refused it: 249,551,354 bytes against a
230,686,720 limit. **The gate and AWS measure different quantities** — the gate read 205.68
MiB for the same output, a 32.31 MiB difference. Its threshold is now 185 MiB, derived from
that observed pair. Do not raise it because a build "only just" fails; that is the reasoning
that produced 205 and then 215, both of which passed builds AWS would always reject.

The gate now prints a `.next` inventory, which immediately answered what could not be
determined locally: **`.next/standalone` exists on Amplify (230 MiB) and is never produced
locally.** Amplify's build image injects `output: 'standalone'`, and the gate excludes that
directory. Any purely local reasoning about artifact contents is blind to it.

Also fixed: gate readings depended on checkout path length. Next writes the absolute build
root into every RSC manifest, ~148,000 times, so one commit read 214.95 MiB from a
47-character path and 215.21 MiB from a 116-character worktree. About 9.6 MiB of the
"we are at the ceiling" story that parked the 81 tools in `PENDING_TOOL_RESCUES.json` was
this, not the artifact.

### The lever that fixed it: RSC manifest duplication, 24.78 MiB

Next writes one client-reference manifest per app route. Across 390 routes they came to
51.04 MiB, and **every one listed the same 429 client modules** — the manifest for
`/altfgame/[slug]` carried 115 modules belonging to `/bops`, which it cannot render. All
values share one shape, there are 6 distinct chunk arrays among 429 entries, and
`ssrModuleMapping`/`rscModuleMapping` take 2 distinct values across all 390 files.

Writing the shared data once and referencing it **is not possible**, and this is worth
knowing before someone tries: Next reads these with `readFileSync` and evaluates them via
`runInNewContext` with a context holding only `process.env.NEXT_DEPLOYMENT_ID`
(`next/dist/esm/server/load-manifest.external.js`). No `require`, no `module`. Shipping a
shared-module version would 500 every RSC page.

`scripts/compact-rsc-manifests.mjs` instead gives each file its own copy as interned tables
(names, chunk arrays, directory prefixes) plus a six-line expander, trailing zero fields
dropped. Correctness is checked rather than assumed: every manifest is evaluated before and
after and the objects compared on values **and key order**, and one mismatch aborts the
build with the file untouched. A manifest whose source reads `process.env` is skipped, so a
value Next resolves at load can never be frozen in at build time.

  manifests  51.04 → 26.26 MiB     gate  205.61 → 183.73 MiB

Green at `ca6e78336` (job 102), verified: `/api/health` reports that commit, `career.png`
404s while `Career.png` 200s. Note the apex domain 302s to `www`, so curl without `-L`
returns 302 for every path and looks like an outage when the site is fine.

### What has not changed

Two builds give the per-tool cost: job 80 was 165.88 MiB at 2,749 tools, job 101 205.68 MiB
at 3,753. That is **40.6 KiB per tool, 19.8 MiB per 500**. At 183.73 MiB against a 185 gate,
the next wave of 500 lands straight back on this wall, and the 81 parked tools with it.

The 24.78 MiB is a reprieve, not a fix. Splitting the catalogue into its own Amplify app —
each app getting its own budget — is what actually allows the 500-at-a-time cadence to
continue. That is a product and infrastructure decision for the owner, not an engineering
one to take unilaterally. Held in reserve: the `proxy.js` `toolMetaMap` → slug-set change,
measured at 0.89 MiB, deliberately not shipped in the same release so that a second
gate↔AWS data point would stay uncontaminated.
