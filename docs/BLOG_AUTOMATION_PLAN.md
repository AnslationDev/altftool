# ALTFTool — Content Automation Plan (Blog + SEO, AI Auto-Content via OpenAI API)

> Status: **PLAN — approved decisions baked in** · Date: 2026-07-06 · Updated: SEO section automation + unified flow added (Sections 10–13)
> Decisions: Draft/Proposal → admin review · Admin topic queue · Admin app API + cron · **10 blog drafts/day (configurable in Admin Settings)**
> Governance: follows `master.md` (tokens only, light+dark, AA, backward-compatible, inert behind feature flag).

---

## 1. Executive summary

Ek server-side generation pipeline admin app (`altftoolwebadmin`) ke andar banegi. Cron har run par **Topic Queue** se pending topics uthayega, OpenAI (GPT-4o) se schema-compatible blog JSON generate karega, existing quality audit se score karega, aur post ko `status:"draft"` + `workflowState:"in_review"` mein Firestore par likh dega. Admin existing review flow (`/altftool/blogs`) se approve → publish karega. Public site (`altftoolweb`) mein **zero changes** — wo pehle se `status:"published"` hi render karta hai, ISR (3600s) + revalidate bridge already exist karta hai.

---

## 2. Grounded audit — aaj kya exist karta hai (verified from code)

### Data model (Firestore: `projects/altftool/{module}`)
- **`blogs`** — fields written by `add-blogs/page.jsx` → `createBlog()`:
  `heading, slug, slugLower, category, author, authorRole, reviewedBy, editorialNote, reviewedAt, sources[], sourceNotes, description (HTML), excerpt (≤160), date, seoTitle, seoDescription, image, imageAlt, views, likesCount, commentsCount, feedbackCount, helpfulCount, notHelpfulCount, status ("draft"|"published"), tags[], createdAt, updatedAt` (+ admin-only `workflowState`, scheduling ke liye `publishAt`).
- **`categories`**, **`blogRevisions`** (write-before-mutate snapshots), **`blogBulkJobs`**, **`blogQualityRollbacks`**.
- Slug uniqueness: `slugLower` equality query (`fetchBlogBySlug`).

### Key code we reuse (koi duplication nahi)
| Concern | Existing code |
|---|---|
| Firestore CRUD | `altftoolwebadmin/src/projects/altftool/modules/blogs/services/blogsService.js` (`createBlog`, `fetchBlogBySlug`) |
| Workflow state machine | `modules/blogs/lib/workflow.js` (`WORKFLOW.IN_REVIEW`, `statusForWorkflow`) |
| Quality gate (score ≥ 75) | `modules/blogs/components/blogQualityAudit.js`, `blogSeoHealth.js`, `@altftool/core` blogContentHealth |
| Admin API auth pattern | `src/app/api/blogs/revalidate/route.js` → `verifyAdminRequest()` (Firebase ID token + `admins` collection) |
| OpenAI server pattern | `altftoolweb/src/app/api/tools/ai-domain-generator/openai/route.js` + `@altftool/core/env` — **`SERVER_ENV.openai = "OPENAI_API_KEY"` already defined** in `packages/core/src/services.js` |
| Publish → live | `requestBlogRevalidation(slug)` admin→public bridge (inert until configured) |
| FAQ markup contract | `FAQ_WRAPPER / FAQ_ITEM / FAQ_Q / FAQ_A` HTML blocks (see `BlogWritingAssistant.jsx`) — public renderer + FAQ JSON-LD schema isi par depend karte hain |

### Content contract
`description` = CKEditor-compatible **HTML** (H2 sections, lists, FAQ block markup above). Trust fields (`authorRole`, `reviewedBy`, `editorialNote`, `sources[]`) quality score mein count hote hain — AI in sabko bharega.

---

## 3. Target architecture

```
Vercel Cron (hourly, admin app)
   └─ POST /api/blogs/generate  (x-cron-secret header)
        1. Read settings doc → enabled? dailyLimit (default 10)? posts created today?
        2. Pick next pending topic from `blogTopics` (priority, FIFO)
        3. Dedupe: slugLower + fuzzy heading match against existing blogs
        4. OpenAI GPT-4o → structured JSON (response_format: json_schema)
        5. Sanitize HTML (allowlist tags), inject FAQ block markup, build excerpt
        6. Server-side quality audit (reuse blogQualityAudit logic via shared lib)
           · score < threshold → 1 retry with critique prompt → still low = topic "failed"
        7. adminDb.createBlog: status:"draft", workflowState:"in_review",
           author:"AltFTool Editorial", generatedBy:"ai", aiModel, aiRunId
        8. Mark topic "done", write run log to `blogAutomationRuns`
   └─ Admin reviews in /altftool/blogs (existing UI) → Publish → revalidate (existing)
```

**Public app untouched.** Drafts kabhi render nahi hote (`status:"published"` filter already enforced).

---

## 4. New Firestore collections (same `projects/altftool/` namespace)

| Collection / doc | Purpose | Fields |
|---|---|---|
| `blogTopics` | Topic queue | `topic, keywords[], category, brief (optional), priority, status: pending\|generating\|done\|failed, error, blogId, createdBy, createdAt, updatedAt` |
| `blogAutomationRuns` | Run history / audit | `startedAt, finishedAt, trigger: cron\|manual, topicsAttempted, created[], failed[], tokensUsed, costEstimate` |
| `settings/blogAutomation` (single doc) | Config | `enabled:false, dailyLimit:10, model:"gpt-4o", minQualityScore:75, defaultAuthor, temperature` |

Firestore rules: teeno **admin-only** (same rule shape as `blogBulkJobs`). Server writes via `firebaseAdmin` (rules bypass), reads admin UI se client SDK.

---

## 5. New code — Admin app only

### 5.1 API routes (`altftoolwebadmin/src/app/api/blogs/...`)
- **`generate/route.js`** (POST) — core pipeline (Section 3). Auth: `x-cron-secret === BLOG_AUTOMATION_CRON_SECRET` **ya** `verifyAdminRequest()` (manual "Generate now" button). `runtime:"nodejs"`, `maxDuration: 300`. Daily-limit check `blogAutomationRuns` ke today aggregate se.
- **`generate/preview/route.js`** (POST, admin auth) — ek topic ka one-off generation **bina save kiye** (UI preview ke liye).

### 5.2 Generation lib (`modules/blogs/lib/aiGeneration.js`)
- `buildBlogPrompt(topic, settings)` — system prompt: AltFTool voice, HTML-only output, H2 structure, FAQ block contract, 1200–1800 words, internal-link suggestions to `/tools/*`, E-E-A-T trust fields, sources with real URLs flagged `needsVerification`.
- OpenAI call with `response_format: { type: "json_schema" }` → exact blog-doc shape. Zod-style validation + HTML sanitize (allowlist: `p,h2,h3,ul,ol,li,strong,em,a,blockquote,table…` + FAQ classes).
- Server-safe quality scoring: `blogQualityAudit.js` ke pure functions ko `modules/blogs/lib/` (already non-React) se import.

### 5.3 Admin UI — new module `modules/blogs/automation/`
Blog left-rail mein ek naya item **"Automation"** (existing `BlogNav.jsx` mein add). Ek page, teen tabs — **one primary action per view** (master.md):

1. **Topic Queue** (default) — table/cards: topic, category, priority, status chip (existing tone tokens), add-topic modal (bulk paste supported), reorder, delete. Primary action: **"Add topics"**.
2. **Runs** — `blogAutomationRuns` list: created/failed counts, cost, per-topic errors. Row → created draft ka editor link.
3. **Settings** — `enabled` toggle, `dailyLimit` (default **10**), model, min quality score, default author. Primary action: **"Save settings"**. + **"Generate now"** secondary (manual trigger, respects limit).

Sab screens: semantic tokens only (`bg-surface`, `text-muted`, `border-border`, `bg-primary-soft`…), light+dark, WCAG AA, ≥44px targets, mobile cards — Phase-0 `BlogTable` patterns reuse.

### 5.4 Review flow integration (tiny touches)
- `view-blogs` list: `generatedBy:"ai"` par ek **"AI" badge** (`bg-secondary-soft` chip) + filter.
- Editor already sab handle karta hai (draft open → quality gate → publish). **Koi editor change nahi.**
- Image: AI drafts `image:""` ke saath aate hain; reviewer publish se pehle image attach karta hai (existing upload flow). *(Auto-image = Phase 4.)*

### 5.5 Cron (`altftoolwebadmin/vercel.json`)
```json
{ "crons": [{ "path": "/api/blogs/generate", "schedule": "0 * * * *" }] }
```
Hourly tick; route khud pace karta hai (`dailyLimit=10` → har run max `ceil(remaining/remaining_hours)` ya simple: 1–2 per tick jab tak daily limit hit). Vercel cron header + secret dono verify.

---

## 6. Env vars (server-only, kabhi client bundle mein nahi)

| Var | App | Note |
|---|---|---|
| `OPENAI_API_KEY` | admin | Key name **already registered** in `@altftool/core` `SERVER_ENV.openai` |
| `BLOG_AUTOMATION_CRON_SECRET` | admin | Cron/manual trigger auth |
| `ALTFT_BLOG_AUTOMATION_ENABLED` | admin | Feature flag — default **off/inert** (SEO-engine pattern). Flag off ⇒ route returns `{skipped}` , nav item hidden |

---

## 7. Safeguards

- **Inert by default** — flag + settings `enabled:false`; merge karne par kuch nahi chalta jab tak explicitly on na ho.
- **Never auto-publish** — pipeline sirf `draft`/`in_review` likh sakta hai; `status:"published"` code path mein hai hi nahi.
- **Dedupe** — `slugLower` + normalized-heading similarity vs `fetchAllBlogs` index; duplicate ⇒ topic failed with reason.
- **Quality floor** — score < `minQualityScore` (75) ⇒ one critique-retry ⇒ fail (kabhi low-quality draft queue mein nahi girta bina flag ke — failed topics Runs tab mein dikhte hain).
- **Cost cap** — dailyLimit + per-run token logging; `blogAutomationRuns.costEstimate`. ~10 posts/day @ GPT-4o ≈ **$1–3/day**.
- **Hallucination control** — sources `needsVerification:true` flag ke saath; `editorialNote` mein "AI-assisted draft — verify facts & links before publish" auto-set; existing link-check API (`/api/blogs/link-check`) reviewer ke liye available.
- **Audit trail** — `logAuditEvent(action:"BLOG_AI_GENERATE")` + run logs + existing `blogRevisions` on edits.

---

## 8. Phased delivery (backward-compatible, shippable increments)

| Phase | Scope | Deliverable |
|---|---|---|
| **1. Engine** | `blogTopics` + settings doc + `generate` API + prompt/sanitize/quality libs + cron config (flag off) | Manual curl se end-to-end draft generation |
| **2. Admin UI** | Automation page (Queue/Runs/Settings tabs) + nav + AI badge/filter | Team topics daal kar drafts dekh sakti hai |
| **3. Hardening** | Preview endpoint, critique-retry, cost logging, dedupe fuzzy match, alerts (failed run banner) | Production enable |
| **4. Optional** | Auto hero-image (DALL·E/stock → Storage), GSC-driven topic suggestions, hybrid auto-publish (score ≥ threshold), n8n hook | Growth features |

Build check har phase: `next build --webpack` (dono apps), light+dark screenshots, AA contrast.

---

## 9. Open items (implementation ke waqt confirm)

1. OpenAI org/key provisioning + monthly budget cap.
2. `admins` ke liye failed-run notification channel (in-app banner vs email).
3. Default author name AI drafts ke liye ("AltFTool Editorial" proposed).
4. Firestore rules diff review (`blogTopics`, `blogAutomationRuns`, `settings/blogAutomation`).

---

# PART 2 — SEO Section Automation (`/altftool/seo`)

## 10. Grounded audit — SEO section aaj (verified from code)

### Data model
- **Central config doc: `projects/altftool/seo/runtime`** (path constants in `@altftool/core/seo/schemas.js`) — shape: `{ global, pages: { "/path": entry }, redirects, versions }`.
- **Per-page entry** (`modules/seo/lib/seoModel.js` → `emptyPageEntry()`):
  `title, description, keywords[], canonical, slug, noindex, follow, sitemap{include,priority,changeFreq}, og{title,description,image,type}, twitter{card,title,description,image}, hreflang[], schema[] (JSON-LD), code{head, bodyStart, bodyEnd}`.
  → Yehi hai user-facing "head / body / meta description / sabhi sections" — **sab isi entry mein automatable hain.**
- **Page taxonomy**: 13 page types (`tools, blogs, news, policies, landing, brandrating, buysmart, exclusivedeals, wattpad, top, homeserv, altflovepdf, altfloveimg`).
- **GSC data**: `gscDailyMetrics` collection (28-day sync), report API with `query|page|country|device|date` dimensions — **trending queries ka ready data source.**

### Existing infra we reuse
| Concern | Existing code |
|---|---|
| Config read/write (audited, versioned) | `/api/seo/config` (GET/PUT) + client `seoService.js` → `saveSeoConfig()` |
| **AI recommendations (already live!)** | `/api/seo/recommendations` — Gemini 2.5 Flash + deterministic heuristic fallback; prompt/parse/normalize in `@altftool/core/seo/recommendations.js`. Abhi sirf `{title, description, keywords}` deta hai, one-page-at-a-time, manual click |
| Page inventory (all site pages) | `/api/seo/registry` → `seoRegistrySource.js` (public app inventory + local fallback), `computePageHealth()` flags missing title/description |
| Health/audit | `/api/seo/health` + `analyzeSeoHealth()` (`@altftool/core/seo/health.js`) |
| Trending / performance | `/api/seo/gsc/report` (top queries, low-CTR pages), `/api/seo/gsc/sync` |
| Bulk apply | `/altftool/seo/bulk` CSV import/export (`csvToPages`/`pagesToCsv`) |
| Admin auth | `verifyActiveAdmin()` (`@/lib/serverAdminAuth`) + rate limits |
| Public consumption | `altftoolweb/src/platform/seo/seoConfigSource.js` — inert behind `ALTFT_SEO_ENGINE_ENABLED` |

**Gap**: AI abhi single-page, 3-field, manual hai. Automation chahiye: **all pages × all fields × trending-aware × scheduled**, with review.

## 11. SEO automation design

### 11.1 Pipeline (naya route: `/api/seo/generate`)
```
Cron / "Generate now"
  1. Registry se pages lo → computePageHealth se prioritize:
     (a) missing title/description  (b) GSC low-CTR / position 5–20 ("striking distance")
     (c) stale entries  (d) admin-selected paths
  2. GSC report (query dimension) se page-relevant trending queries nikalo
  3. OpenAI GPT-4o (structured JSON) per page → FULL entry:
     title (≤60), description (120–160), keywords, og{title,description}, twitter,
     schema[] (page-type-appropriate JSON-LD: WebPage/SoftwareApplication/Article/FAQPage),
     canonical + sitemap suggestion. `code.head/bodyStart/bodyEnd` = sirf structured
     snippets (JSON-LD/meta) — arbitrary script injection NAHI (safety).
  4. Validate: length clamps, `normalizeSuggestion()` extend, JSON-LD schema check
  5. PROPOSAL save → `seoProposals` collection (config doc ko touch NAHI karta)
  6. Run log → `blogAutomationRuns` (shared, `kind:"seo"`)
```

### 11.2 Review → Apply (kabhi direct config write nahi)
- Nayi admin screen **SEO → Proposals**: per-page diff card (current vs proposed, `SeoPreviews.jsx` SERP/OG previews reuse) → **Approve** / Edit / Reject.
- Approve ⇒ existing `saveSeoConfig()` path (audited, versioned, conflict-checked) — wahi path jo manual editor use karta hai. Bulk-approve supported (CSV bulk pattern).
- Firestore: `seoProposals` = `{ path, pageType, current, proposed, rationale, gscSnapshot{clicks,impressions,ctr,position,topQueries[]}, status: pending|approved|rejected|applied, createdAt, appliedAt, appliedBy }`.

### 11.3 Trending intake (shared with blog)
Naya lib `modules/automation/lib/trending.js`:
- Source 1: GSC top/rising queries (existing report API) — property-wide + per-page.
- Source 2: registry gap analysis (pages bina overrides ke).
- Output dono jagah feed hota hai: **SEO proposals** (page-wise) + **blog Topic Queue** (`blogTopics` mein `source:"trending"` suggestions, admin approve karke queue mein daale).

### 11.4 Settings (same hub)
`settings/blogAutomation` doc ko generalize → **`settings/automation`**:
```
{ blog: { enabled, dailyLimit:10, model, minQualityScore },
  seo:  { enabled, dailyPageLimit:25, model, autoRefreshStaleDays:90,
          fields: { title:true, description:true, og:true, twitter:true, schema:true, codeHead:false } },
  trending: { enabled, gscLookbackDays:28, suggestBlogTopics:true } }
```

## 12. Unified optimized flow (Blog + SEO ek engine)

```
                    ┌────────────── Vercel Cron (hourly) ──────────────┐
                    │        /api/automation/run  (x-cron-secret)      │
                    └──────┬──────────────┬──────────────┬─────────────┘
                     [trending]      [blog lane]     [seo lane]
                    GSC queries →   blogTopics →    registry+GSC →
                    topic/page      GPT-4o draft    GPT-4o proposal
                    suggestions     (in_review)     (seoProposals)
                           │              │               │
                           └──────► ADMIN REVIEW (single "Automation" hub) ◄──┘
                              Approve blog → publish → requestBlogRevalidation
                              Approve SEO  → saveSeoConfig → public ISR pickup
```

**Shared core (`modules/automation/lib/`)**: ek OpenAI client (retry/timeout/token-logging), ek run-logger (`blogAutomationRuns` with `kind:"blog"|"seo"|"trending"`), ek settings reader, ek cron entrypoint jo dono lanes ko daily limits ke hisaab se pace karta hai. Blog Section-5 wala `/api/blogs/generate` is orchestrator ke andar lane ban jata hai (route alag bhi callable rahega).

**Admin UI — ek "Automation" hub** (nav: Blogs rail + SEO rail dono se linked), 5 tabs:
1. **Overview** — aaj ke runs, created/pending/failed counts, cost meter
2. **Blog Queue** — (Part 1 §5.3 wala Topic Queue)
3. **SEO Proposals** — diff cards + bulk approve
4. **Trending** — GSC rising queries → one-click "Add as blog topic" / "Generate SEO proposal"
5. **Settings** — `settings/automation` (blog + seo + trending sections)

**Cross-linking (optimization)**: blog generator ko us page ke SEO keywords/GSC queries prompt mein milte hain; SEO generator published blogs ke liye entry propose karta hai. Ek hi content-brief context dono lanes share karte hain — duplicate AI calls nahi.

## 13. SEO-lane safeguards + phases

Safeguards (Part 1 §7 ke upar):
- **Proposals-only writes** — `seo/runtime` doc sirf existing audited `saveSeoConfig` path se badalta hai, AI kabhi direct nahi.
- **No arbitrary code injection** — `code.*` fields default OFF settings mein; on hone par bhi sirf validated JSON-LD/meta snippets.
- **Public inert** — `ALTFT_SEO_ENGINE_ENABLED` off ⇒ public par koi asar nahi (existing contract).
- **Robots/canonical caution** — AI `noindex`, `canonical` change propose kar sakta hai lekin ye "high-risk" flag ke saath alag section mein dikhte hain, bulk-approve se excluded.
- Rate/cost: `dailyPageLimit` (25 default) ⇒ ~$0.02–0.05/page ⇒ **<$1.5/day** SEO lane.

Delivery (Part 1 §8 ke saath merge):
| Phase | Blog lane | SEO lane |
|---|---|---|
| **1. Engine** ✅ SHIPPED | generate API + topic queue | `seoProposals` + `/api/seo/generate` + trending lib |
| **2. Admin UI** ✅ SHIPPED | Queue tab | Proposals + Trending tabs, unified Automation hub |
| **3. Hardening** ✅ SHIPPED | retry/costs/alerts | high-risk gating, bulk approve, GSC snapshot in cards |
| **4. Optional** | auto-image, hybrid publish | auto-apply for low-risk fields (score-gated), news/tools lanes |

---

## 14. Phase 1 — SHIPPED (2026-07-06)

**New files (admin app):**
- `src/lib/automation/` — `constants.js`, `settings.js` (defaults: all lanes OFF), `openaiClient.js` (strict-JSON, retry, cost est.), `runLog.js` (daily-limit accounting), `blogPrompt.js`, `blogLane.js`, `seoPrompt.js`, `seoLane.js`, `trending.js`
- `src/app/api/automation/run/route.js` (orchestrator, GET=cron/POST=manual), `src/app/api/blogs/generate/route.js`, `src/app/api/seo/generate/route.js`
- `vercel.json` (hourly cron) · `firestore.rules` — admin-only matches for `blogTopics`, `blogAutomationRuns`, `seoProposals`, `settings` (catch-all was world-readable)

**Verified:** syntax (node --check all files), all named imports/exports resolve, smoke tests PASS — sanitizer strips script/onclick/js:/iframe; FAQ markup matches public contract; assembled draft scores 91/100 on `evaluateBlogContent` (only image missing, by design); doc contract draft+in_review+generatedBy:ai; SEO proposal validation clamps title ≤60, drops invalid JSON-LD, lowercases keywords.
**Note:** sandbox 45s process limit ke kaaran full `next build --webpack` yahan complete nahi ho paya — deploy se pehle locally run karein.

**Enable karne ke liye:**
1. Env (admin app): `OPENAI_API_KEY`, `AUTOMATION_CRON_SECRET`, `ALTFT_CONTENT_AUTOMATION_ENABLED=true`
2. `firebase deploy --only firestore:rules`
3. Firestore doc `projects/altftool/settings/automation` mein `{ blog: { enabled: true }, seo: { enabled: true }, trending: { enabled: true } }` (limits defaults: blog 10/day, seo 25/day)
4. Topics daalo: `projects/altftool/blogTopics` mein `{ topic, keywords: [], priority: 0, status: "pending" }`
5. Test: `curl -X POST https://<admin>/api/blogs/generate -H "x-cron-secret: <secret>" -H "Content-Type: application/json" -d '{"count":1}'`

---

## 15. Phase 2 — SHIPPED (2026-07-06)

**Automation hub UI** at **`/altftool/blogs/automation`** (Blogs top-bar + SEO nav dono se linked):
- `modules/blogs/automation/page.jsx` — 5 tabs: Overview (today counters, cost meter, runs table) · Blog Queue (bulk add topics, priority, retry failed, open draft, "Generate 1 now") · SEO Proposals (diff cards current vs proposed, GSC top queries, Approve & apply / Reject, filter, "Generate 3 now") · Trending ("Scan GSC now", promote suggestion → queue) · Settings (sab lanes ke toggles + limits, `settings/automation` doc)
- `services/automationService.js` — client SDK CRUD + authed lane triggers; **Approve = merge over current entry → existing audited `saveSeoConfig` path** → proposal marked `applied`
- `components/` — shared.jsx (StatusChip/PanelCard/buttons, tones), OverviewPanel, TopicQueuePanel, ProposalsPanel, TrendingPanel, SettingsPanel
- Wiring: `adminModuleRouteKeys.js` + `adminModuleLoaders.js` mein `automation` route; `BlogTopBar` + `SeoNav` mein "Automation" item

**Design system**: sirf semantic tokens (`bg-surface`, `text-muted`, `bg-primary-soft`, `*-soft` tones…), light+dark auto, focus-visible outlines, aria tablist/status, responsive grids. **Verified**: sab 12 files SWC JSX parse OK; sab token classes codebase mein pehle se validated. Full `next build --webpack` locally chala kar confirm karein.

**Next: Phase 3 (Hardening)** — failed-run alert banner (admin layout), bulk approve for proposals, high-risk gating (noindex/canonical alag section), per-page GSC snapshot cards, cost caps.

---

## 16. Phase 3 — SHIPPED (2026-07-06)

**Server hardening:**
- **Fuzzy dedupe** (`blogLane.js`) — exact `slugLower` ke upar token-containment check (stop-words hata kar, ≥80% overlap ⇒ near-duplicate reject). Existing slugs server-side projection (`.select("slugLower")`) se ek hi read mein.
- **Daily cost cap** (`settings.limits.dailyCostCapUsd`, default $10) — `sumCostToday()` sab lanes ke run logs se; cap hit ⇒ blog + SEO lanes skip until tomorrow (UTC).
- **Preview endpoint** — `POST /api/blogs/generate/preview` `{topic, keywords?, brief?}` (admin-only, rate-limited 5/min): full draft + quality audit + token cost, **kuch save nahi hota**. Prompt tuning ke liye.

**UI hardening:**
- **Bulk approve** (Proposals tab) — multi-select checkboxes + "Select all safe" + ek hi audited `saveSeoConfig` call mein saare selected paths apply.
- **High-risk gating** — `isHighRiskProposal()` (noindex/follow/canonical/sitemap/code fields) ⇒ danger badge, checkbox disabled, bulk se excluded; sirf individual approve.
- **Failed-run banner** — hub par 24h ke failures ka `role="alert"` banner (Overview → Recent runs + Queue retry pointers).
- **Cost cap setting** — Settings tab mein "Safety limits" card.

**Verified:** sab modified files SWC parse OK; fuzzy dedupe smoke test PASS (near-dup 0.83 detect, unrelated topic pass).

**Phase 4 (Optional, on demand):** auto hero-image (DALL·E → Firebase Storage), GSC-driven auto-apply for low-risk SEO fields, hybrid auto-publish (score-gated), n8n hook, news/tools lanes.

---

## 17. Production hardening pass — SHIPPED (2026-07-06)

### 17.1 AI provider abstraction (provider-agnostic)
- **`lib/automation/providers.js`** — single `generateJson()` entrypoint, provider registry: **openai** (default, json_schema strict mode) · **gemini** (fully implemented — project ke paas GEMINI_API_KEY pehle se hai; JSON mime mode) · **claude / deepseek** (registered; key set hone tak clear error, koi silent fallback nahi). Per-model cost table. `openaiClient.js` ab thin re-export (backward compatible).
- Provider + model **per lane** Admin Settings se (Blog lane / SEO lane cards mein dropdown + model field). Keys sirf server env: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`.
- **`.env.example`** added (admin app) — sab automation env vars documented, real values kabhi commit nahi (`.gitignore`: `.env*`).

### 17.2 Reusable prompt templates
- **`lib/automation/promptTemplates.js`** — saare prompts (blogSystem/blogUser/blogCritique/seoSystem/seoUser) `{{placeholder}}` templates; unknown placeholder ⇒ empty (kabhi crash nahi). Admin override: `settings/automation → templates.<key>` (empty ⇒ built-in default). `blogPrompt.js`/`seoPrompt.js` ab templates render karte hain — koi hardcoded prompt nahi.

### 17.3 Idempotency & exactly-once (API cost audit)
| Surface | Guarantee |
|---|---|
| Topic claim | **Firestore transaction** pending→generating — overlapping cron/manual runs kabhi double-generate nahi karte |
| SEO proposal | **Deterministic doc ID** (`{path}--{yyyymmdd}` + `.create()`) — same page/day duplicate write impossible |
| Trending suggestion | Deterministic ID (query slug) + `.create()` with ALREADY_EXISTS swallow |
| Provider retry | Max **1**, sirf transient (429/5xx/unparseable); 429 = unbilled |
| Quality retry | Max **1** critique pass per topic |
| Cron | Single hourly entry (`vercel.json`), secret-gated GET; daily limits + **$ cost cap** har entry point par |
| React UI | Data fetch sirf mount + explicit action ke baad; **no polling, no onSnapshot, no setInterval, no useEffect loops** (audited) |
| Firestore triggers | Koi cloud-function trigger use nahi hota — duplicate trigger risk zero |

### 17.4 Security audit (verified by grep)
- Automation server libs (`lib/automation/*`) ka **koi client-side import nahi** (sirf API routes).
- AI key refs **kisi .jsx/client file mein nahi**; koi `NEXT_PUBLIC_*` AI key nahi; koi key logging nahi. Browser bundle mein key jaane ka koi path nahi (keys sirf `requireServerEnv` se, nodejs runtime routes mein).
- `.env*` gitignored (verified `git check-ignore`), `.env.example` whitelisted.
- All lane endpoints: cron-secret **ya** Firebase admin token (`admins` collection + isActive) + rate limits; flag off ⇒ sab inert.

### 17.5 Regression surface
Existing systems **untouched**: CKEditor CDN implementation, add/edit blog flows, publish/revalidation bridge, SEO config save path (proposals usi audited path se apply hote hain), GSC OAuth/sync, search/pagination, workflow state machine, firestore rules for existing collections. New collections admin-only rules ke saath catch-all se shielded.

### 17.6 Verification status
- SWC parse: automation ke saare 20+ files OK. Smoke tests PASS: sanitizer, FAQ contract, quality gate (91/100), doc contract, proposal validation, fuzzy dedupe (0.83 detect), template render/override/fallback, provider registry, cost estimator, claude stub error.
- ⚠️ Sandbox 45s process limit ke kaaran full `next build --webpack` + eslint yahan complete nahi ho sakte — **deploy se pehle locally chalayen**: `cd altftoolwebadmin && npm run build` (webpack), phir `/altftool/blogs/automation` par light+dark smoke check.

### 17.6b Blog Module Stabilization — SHIPPED (2026-07-06)

Root-cause fixes (public web + rules), sab live-verified browser mein:

| Issue | Root cause | Fix |
|---|---|---|
| Published blogs search mein nahi | `BACKGROUND_SYNC_PAGE_LIMIT=1` ⇒ sirf newest 72 posts searchable; SSR catalog flag off ⇒ static 31-post snapshot | Limit 1→12 (800+ posts, idle-paced, ISR-cached `/api/blogs`); `ALTFT_BLOGS_SSR_FIREBASE=true` + timeout env added |
| Naya publish 5 min tak 404 | `blogBySlug` null result 300s cache + 3.5s REST timeout flap | Negative cache 30s; timeout default 8s; **stale-while-error** (Firestore fail ⇒ last good LIVE data, static snapshot nahi) |
| Visitor console mein Firestore errors | Rules sirf views/likes/comments allow karte the; web helpful/notHelpful/feedback/toolClick fields + `feedback/{sessionId}` subdoc likhta hai | Rules updated (engagement fields + feedback subcollection) — `firebase deploy --only firestore:rules` required |
| External links | In-content anchors mein target/rel missing; `javascript:` risk | `BlogContent` transform: external ⇒ `_blank` + `noopener noreferrer nofollow`, js: URLs neutralized (unit-tested 4/4) |
| Cards mein raw `<p>` text | Legacy docs ke `excerpt` mein HTML | `normalizeBlog` ab excerpt hamesha `stripHtml` karta hai |
| Search accuracy | slug words indexed nahi the | `searchText` mein slug words added |
| Nested lists/quotes flatten; long URLs overflow; mobile tables | ckeditor.css gaps | Nested list/blockquote levels, `overflow-wrap`, ≤640px table scroll added |
| Admin↔Web sync | — | Bridge already configured verify hua (secrets match, URL sahi); publish ⇒ revalidate active |

**Live-verified:** search "password protect" ⇒ naya post cover+highlights ke saath; detail page light+dark; external/source links 6/6 safe; categories live counts; background pagination. **User actions:** `firebase deploy --only firestore:rules` + web dev server restart (env changes).

### 17.6c Deep audit round 2 — SHIPPED (2026-07-06)

**Naya fix:** Global/header search (`/search`) mein blogs bilkul indexed nahi the (sirf tools + extensions) — `SearchContent.jsx` ab existing ISR-cached `/api/blogs` se lazy blog index banata hai (valid query par ek fetch, AbortController cleanup) + "Guides & Blogs" result section + summary chip. Live-verified: "password protect" ⇒ 1 guide match.

**Audit findings jo fix ki zaroorat NAHI thi (verified):**
- `BlogDetailClient.jsx` (duplicate view-increment suspect) **dead code hai** — kahin import nahi hota; live path sirf `BlogEngagement` (idle-scheduled, session-deduped via views subdoc, cleanup ✓)
- Blog card images: `next/image` default lazy hai (sirf top-2 eager by design), sizes present ✓
- `getBlogDetailBySlug` React `cache()` se properly dedup (generateMetadata + page ek hi fetch)

**Regression sweep (live):** blog detail full reload ⇒ 0 console errors, 0 permission/hydration warnings; search/listing/detail/dark-light sab green.

### 17.6d Audit round 3 — SHIPPED (2026-07-06)

**CRITICAL fixed:**
- **Revalidation bridge silently skipping** — admin route sirf `ALTFT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_SITE_URL` padhta tha jabki deployments `ALTFT_WEB_REVALIDATE_URL` set karte hain ⇒ har publish par "not configured" skip. Ab teeno accepted (bridge URL se base derive).
- **Archive pages stale after publish** — bridge ab blog doc se category/tags derive karke `/blogs/category/{slug}` + `/blogs/tag/{slug}` (≤6) bhi revalidate karta hai; N requests ki jagah **ek batched `paths[]` request** (public route already supports).
- **`/api/blogs` hasMore off-by-one** — `posts.length === limit` heuristic page-boundary par ek guaranteed-empty extra fetch karata tha; ab limit+1 probe ⇒ exact hasMore (verified: beyond-end ⇒ `{count:0, hasMore:false}`).

**MODERATE fixed:** `BlogEngagement.loadComments` stale-response guard — slow in-flight comments read ab navigation ke baad naye post ka state overwrite nahi kar sakta.

**MINOR fixed:** `BlogFeedback` localStorage ab 6-month TTL + timestamp format (legacy plain-string values backward-compatible).

**By-design (no change):** trending/featured engagement scores ISR-cached hote hain (real-time nahi) — performance tradeoff documented. `getBlogFreshness` Date.now() sirf server components mein — koi hydration mismatch nahi.

**Clean-verified areas:** zero onSnapshot listeners (sab one-shot getDocs + timeout), views session-dedup subdoc se, rules-shape match, React cache() dedup, image lazy defaults.

**Regression (live):** `/api/blogs` page1 ✓ / beyond-end ✓; detail page reload ⇒ 0 console errors; sab pichhle checks green.

### 17.6e SEO Pages editor — "Generate with AI" — SHIPPED (2026-07-06)

`/altftool/seo/pages` par koi bhi URL/path kholo → header mein **Generate with AI** button (Clear override / Save ke beech) → existing SEO-lane engine se **saare sections ek click mein fill**: meta title, description, keywords, OG, Twitter card, JSON-LD (page-type-aware, e.g. tools ⇒ SoftwareApplication) — page-registry context + **live GSC trending queries** ke saath. Kuch bhi auto-save NAHI hota: admin review karke "Save & publish" (audited config path) se hi lagta hai.

Implementation (zero duplicate logic): `seoLane.js` mein pure `generateEntryProposal()` extract + `generateSeoPreviewForPath()` (registry entry ya path-se-guessed pageType, unknown paths bhi supported); `/api/seo/generate` mein `preview:true` mode (persist nahi, admin-auth, rate-limited); `seoService.generateSeoPageEntry()`; PageEditor button (Sparkles, schemaText sync). Live-verified `/tools/json-formatter` par: title 30/60, description 131/160, 3 keywords, valid SoftwareApplication JSON-LD, SERP preview update, success banner.

### 17.6f SEO module UI polish — SHIPPED (2026-07-06)

- **Centered save-success dialog** (`SuccessDialog` in `modules/seo/components/ui.jsx`) — professional confirmation har save/update par: backdrop blur, success icon ring, page path + config version message, Done button, Escape/backdrop close, auto-dismiss (2.6s) with progress bar. Tokens-only, light+dark, `role="dialog"`. Wired into all 5 save flows: Config (JSON), Pages, Global, Technical, Bulk (dono save paths).
- **SeoNav upgrade** — border-bottom tabs → SaaS-style pill container (rounded card, active pill with ring + shadow, focus-visible outlines). Poore SEO module par ek saath asar.
- Zero functionality changes — sirf presentation. Live-verified: Pages save ⇒ centered popup "Changes applied successfully — Saved page SEO for /tools/json-formatter (v17)".

### 17.7 Go-live checklist
1. `altftoolwebadmin/.env.local`: `OPENAI_API_KEY=<aapki key>`, `AUTOMATION_CRON_SECRET=<random 32+ chars>`, `ALTFT_CONTENT_AUTOMATION_ENABLED=true`
2. `firebase deploy --only firestore:rules`
3. Local build verify → deploy admin app (Vercel cron auto-register hoga)
4. Admin → Blogs → Automation → Settings: Blog lane ON (10/day), SEO lane ON (25/day), Trending ON; cost cap confirm ($10)
5. Blog Queue mein 2-3 topics daal kar **"Generate 1 now"** se end-to-end verify: draft All Blogs mein "In review" + AI badge ke saath dikhna chahiye → review → publish → revalidate
