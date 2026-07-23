# AltFTool — Tool Factory Automation

An automated system that **generates, verifies, and ships** browser tools for the
AltFTool site (the tools that live under `src/tools/<slug>/` and render at
`/tools/all/<slug>`).

It builds a tool from nothing but a **name** in a manifest, using the cheapest
reliable method first (deterministic templates), escalating to a local model and
then free cloud AI only when needed — and **nothing ships until it passes a
verification ladder**. A tool that can't be verified is skipped, never shipped
broken.

> New here? Read this top to bottom once, then use the **Cookbook** section.
> Deeper design rationale lives in [ARCHITECTURE-v2.md](./ARCHITECTURE-v2.md).

---

## Table of contents
1. [What it produces](#1-what-it-produces)
2. [Requirements & one-time setup](#2-requirements--one-time-setup)
3. [Quick start](#3-quick-start)
4. [Mental model (how it thinks)](#4-mental-model-how-it-thinks)
5. [Commands — full reference](#5-commands--full-reference)
6. [Cookbook (common workflows)](#6-cookbook-common-workflows)
7. [How a tool is structured](#7-how-a-tool-is-structured)
8. [Extending it (add a cluster)](#8-extending-it-add-a-cluster)
9. [Configuration & env vars](#9-configuration--env-vars)
10. [Data files & run reports](#10-data-files--run-reports)
11. [Troubleshooting](#11-troubleshooting)
12. [Guarantees & known limitations](#12-guarantees--known-limitations)
13. [File map](#13-file-map)

---

## 1. What it produces

Each generated tool is a folder `src/tools/<slug>/` with four files:

```
src/tools/<slug>/
  tool.config.js    # registry metadata (name, category, icon)
  entry.jsx         # runtime entrypoint (dynamic-imported by the app)
  spec.js           # the ToolSpec: declarative fields + a pure compute() function
  pages/index.jsx   # <ToolRuntime spec={spec} />
```

Every tool renders through **one shared component**,
`src/tools/_shared/toolkit/ToolRuntime.jsx`, which turns a `ToolSpec` into a
complete UI (inputs, live result + breakdown, presets, copy/download, history,
empty/error states, responsive, dark mode). **No per-tool UI code is written.**

After building, two auto-generated registries wire tools into the app:
`src/platform/registry/toolMetaMap.js` and `toolRuntimeMap.js`.

---

## 2. Requirements & one-time setup

| Requirement | Notes |
|---|---|
| **Node ≥ 24** | The repo pins `>=24 <25`. Check with `node --version`. |
| **Run from the repo root** | All commands below assume CWD = repo root (`knaltftoolweb/`). |
| **Ollama** (optional) | Local fallback model. Install from ollama.com, then `ollama pull qwen2.5-coder:7b`. Not required if you use cloud keys. |
| **Free cloud API keys** (optional) | Gemini + Groq make the AI tier fast/strong. See below. |

### Setting up free AI keys
Create a **git-ignored** `.env` in the repo root (never commit it):

```dotenv
GEMINI_API_KEY=your_gemini_key      # https://aistudio.google.com/apikey  (free tier)
GROQ_API_KEY=your_groq_key          # https://console.groq.com/keys       (free tier)
# optional extras for more provider diversity / failover:
# OPENROUTER_API_KEY=
# MISTRAL_API_KEY=
# CEREBRAS_API_KEY=
```

The automation auto-loads `.env` (via `automation/lib/env.mjs`) — plain `node`
scripts don't read `.env` on their own, so this loader handles it. If no keys are
set and Ollama is running, it uses Ollama. If neither, only the **template tier**
(0-AI) works.

Verify what's live:
```bash
node -e "import('./automation/lib/env.mjs').then(()=>import('./automation/generator/providers.mjs')).then(async({ProviderPool})=>console.log('live:', (await new ProviderPool(['gemini','groq','ollama']).ready()).join(', ')))"
```

---

## 3. Quick start

```bash
# See where things stand
node automation/run.mjs status

# Build tools with the v2 factory (templates + memory, 0 AI, instant):
node automation/build-cascade.mjs --count 100

# Same but also let the free AI build the novel ones (small batch — free tiers
# are rate-limited, so keep it small):
node automation/build-cascade.mjs --count 15 --allow-generate

# Verify everything on disk still works:
node automation/test-logic.mjs
```

Nothing here ever touches git. Review, then commit yourself.

---

## 4. Mental model (how it thinks)

Every tool goes through an **escalating cascade** — cheapest reliable path first —
then a **verification ladder**, then **triage**:

```
manifest entry (name + category)
      │
      ▼  feasibility gate  → unsupported (audio/video/AI/image/PDF/games/network)? → SKIP
      │
   ┌──┴─ Tier 1: cluster template   (0 AI, instant)          ┐
   │     Tier 2: self-RAG memory    (reuse a past recipe)    │  stop at the first
   │     Tier 3: agentic generation (free cloud/Ollama)      ┘  tier that verifies
      │
      ▼  VERIFY LADDER (deterministic):
      │   sandbox (runs, no NaN/fake/missing-key)
      │   invariants (round-trip / metamorphic)
      │   differential (vs Node crypto/zlib + RFC references)
      │   behavior (vs known test vectors)
      │   quality lint (dead fields, weak labels, shallow, thin selects)
      │        → confidence score + level
      │
      ▼  TRIAGE:  high → ship · medium → ship · low → SKIP (never ship broken)
      │
      ▼  emit files → lint gate → regenerate registries → remember recipe
```

Key idea: **the verifier is the judge, not the model.** Free/imperfect models are
fine because a tool only ships if it *provably* runs, does what its name says, and
passes the design lint. Everything else is skipped and stays `pending`.

---

## 5. Commands — full reference

All commands are `node automation/<script>.mjs [flags]`, run from the repo root.

### 5.1 `run.mjs` — the orchestrator (start here)
Chains the other commands. Every stage is idempotent/resumable.

```bash
node automation/run.mjs status               # counts + what's left to do
node automation/run.mjs cascade [N]          # v2 factory over N pending (recommended)
node automation/run.mjs build [N]            # v1 single-model generation
node automation/run.mjs enhance [N]          # enrich N existing tools
node automation/run.mjs upgrade              # migrate any legacy level-1 tools
node automation/run.mjs scrape               # fetch ideas → fold into manifest
node automation/run.mjs all [N]              # scrape-if-low → build → test
```
Pass-through flags (forwarded to the underlying script): `--provider`, `--model`,
`--allow-generate`, `--min`, `--force`.

### 5.2 `build-cascade.mjs` — the v2 factory ⭐
The main way to build tools. Runs the cascade + verify ladder + triage.

```bash
node automation/build-cascade.mjs [flags]
```
| Flag | Default | Meaning |
|---|---|---|
| `--count N` | 50 | Take the next N pending tools. |
| `--slugs a,b,c` | — | Build specific tools (any status). |
| `--allow-generate` | off | Enable Tier-3 AI generation. Off = templates + memory only (0 AI). |
| `--min high\|medium` | medium | Minimum confidence to ship. `high` = only differential/round-trip-verified. |
| `--dry` | off | Validate + verify but write nothing. |
| `--no-regen` | off | Skip registry regeneration (faster when iterating). |
| `--force` | off | Rebuild even if the tool already exists on disk. |

Per tool it prints the tier used and the confidence, e.g.
`OK  cluster:finance  ·  conf high(85) ✓differential`. Full results →
`automation/last-cascade.json`. Verified recipes → `automation/data/recipes.json`.

**Rate-limit tip:** free cloud tiers cap ~30 req/min, and each AI tool makes 3–5
calls. Keep `--allow-generate` batches **small (≤15)** or it will rate-limit and
fall back to slow local Ollama.

### 5.3 `build-batch.mjs` — v1 single-model generator
Older path: one model produces the whole tool. Manifest-driven, resumable,
checkpointed. Prefer `build-cascade` for new work.
```bash
node automation/build-batch.mjs --count 50 --provider ollama
# flags: --count --slugs --provider auto|ollama|template --model --dry --no-regen --force --regen-every N
```

### 5.4 `enhance-tools.mjs` — improve existing tools
Adds features/depth to already-built tools (functionality first, then UX).
```bash
node automation/enhance-tools.mjs --last               # enhance the last build
node automation/enhance-tools.mjs --slugs bmi-calculator
node automation/enhance-tools.mjs --category Finance --count 10
node automation/enhance-tools.mjs --all --count 20
```

### 5.5 `scrape-tools.mjs` — get new tool ideas
Fetches candidate names from the sites in the manifest's `scrapeSources`,
**de-dupes against every known slug**, drops the infeasible ones, and appends new
ones to `automation/data/pending-extra.json`.
```bash
node automation/scrape-tools.mjs [--limit 250] [--source tinywow]
node automation/generate-manifest.mjs   # then fold the ideas into the manifest
```

### 5.6 `generate-manifest.mjs` — rebuild the master list
Rebuilds `automation/tools-manifest.json`: existing tools (from the live registry)
→ `made`; authored backlog + scraped ideas → `pending` (deduped). Run after
building or scraping to refresh counts.

### 5.7 `test-logic.mjs` — validate every tool
Imports every `src/tools/*/spec.js` and runs its `compute()` in the sandbox
against sample + preset inputs. Exits non-zero on any failure.
```bash
node automation/test-logic.mjs
```

### 5.8 `repair-tools.mjs` — deterministic key-fixer
Fixes field-key ⇆ compute-key case mismatches in-place (no AI). Rarely needed now
(the generator keeps keys in sync), but handy after manual edits.
```bash
node automation/repair-tools.mjs [--dry]
```

### 5.9 `ingest-errors.mjs` — production error loop
Reads real runtime errors the app reports to
`automation/data/runtime-errors.json` (`[{slug, message, url}]`) and queues those
tools for rebuild.
```bash
node automation/ingest-errors.mjs [--rebuild]
```

### 5.10 Repo-side registry scripts (usually run for you)
`build-cascade`/`build-batch` call these automatically, but you can run them
manually after hand-editing tools:
```bash
node scripts/generate-tool-meta.mjs          # rebuild toolMetaMap.js
node scripts/generate-tool-runtime-map.mjs   # rebuild toolRuntimeMap.js
node scripts/build-icons.mjs                 # rebuild public/icons.svg
```

---

## 6. Cookbook (common workflows)

**Build a big batch of the cheap, safe tools (0 AI):**
```bash
node automation/build-cascade.mjs --count 300        # templates + memory only
node automation/test-logic.mjs
```

**Build a few novel tools with free AI (rate-limit-safe):**
```bash
node automation/build-cascade.mjs --count 12 --allow-generate
```

**Top up ideas when pending runs low:**
```bash
node automation/scrape-tools.mjs
node automation/generate-manifest.mjs
```

**Preview without writing anything:**
```bash
node automation/build-cascade.mjs --count 20 --allow-generate --dry
```

**Rebuild a specific tool from scratch:**
```bash
node automation/build-cascade.mjs --slugs my-tool --force --allow-generate
```

**See a tool in the browser:**
```bash
npm run dev        # then open http://localhost:3002/tools/all/<slug>
```

---

## 7. How a tool is structured

The only artifact a generator produces is a **ToolSpec** (see `lib/spec.mjs`):

```js
{
  slug, title, description, badge, category, icon, iconColor,
  modes?: [{ id, label }],               // optional tabs
  fields: [
    { key, label, type, default, choices?, min?, max?, step?, suffix?, placeholder?, mode?, required? }
    // type: number | text | textarea | select | date | range | toggle | file
  ],
  presets?: [{ label, values }],
  regenerate?: true,                      // for "press-a-button" generators
  note?, outputLabel?,
  compute: (values, mode) => ({           // PURE function — the only logic
    result: "string",                     // required
    caption?, rows?: [[label,value]], list?: [], table?: { headers, rows }, error?
  })
}
```

Rules the pipeline enforces on `compute`:
- Pure JS only — no `fetch`, DOM, `require`, or Node APIs. Allowed globals:
  `Math, Date, Number, String, Array, Object, JSON, Intl, BigInt, RegExp,
  crypto.subtle, TextEncoder, btoa, atob`.
- Field **keys must match** exactly what `compute` reads from `values`.
- Must return a real `result` (no `NaN`, no placeholder/echo strings).
- number/range fields arrive as Numbers; file fields as `{name,type,size,text?,dataUrl?}`.

---

## 8. Extending it (add a cluster)

Clusters are the **0-AI templates** — the highest-ROI way to grow coverage. Add
one in `automation/clusters.mjs`. A cluster is:

```js
{
  id: "my-family",
  match: (nameLower) => /my (pattern|regex)/.test(nameLower) ? { variant: "x" } : null,
  build: (entry, params) => ({
    raw: {                       // a ToolSpec (compute is a real function)
      title: entry.name, category: entry.category, icon: "calculator", iconColor: "text-blue-600",
      description: "...", fields: [...], presets: [...],
      compute: (values) => ({ result: "...", rows: [...] }),
    },
    verify: { invariants: ["idempotent"] },   // optional hints for the ladder
  }),
}
```
Notes:
- `compute` may use `num(...)` and `money(...)` helpers — they're auto-injected.
- Keep `match` **precise** (word-anchored) so it doesn't grab unrelated names.
- Test coverage quickly: `node automation/build-cascade.mjs --count 300 --dry`.

---

## 9. Configuration & env vars

| Var | Used by | Default |
|---|---|---|
| `GEMINI_API_KEY` | Tier-3 designer | — |
| `GROQ_API_KEY` | Tier-3 coder/reviewer | — |
| `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`, `CEREBRAS_API_KEY` | extra providers | — |
| `OLLAMA_MODEL` | local model name | `qwen2.5-coder:7b` |
| `GEMINI_MODEL`, `GROQ_MODEL`, `OPENROUTER_MODEL` | model overrides | sensible defaults |
| `TOOLGEN` | v1 `build-batch` provider | `auto` |

Provider roles & failover order live in `automation/generator/agentic.mjs`
(`makePools`). Each role tries its providers in order and fails over on
rate-limit/timeout, with local Ollama as the last resort.

---

## 10. Data files & run reports

| File | What it is |
|---|---|
| `tools-manifest.json` | Master list: every tool + `made`/`pending` + build spec + scrape sources. |
| `data/recipes.json` | Self-RAG memory — every verified tool, reused to build similar ones. |
| `data/pending-extra.json` | Scraped tool ideas waiting to be folded into the manifest. |
| `data/runtime-errors.json` | (You provide) production errors for the rebuild loop. |
| `last-cascade.json` | Result of the last `build-cascade` run (built + skipped + reasons). |
| `last-run.json`, `last-batch.json`, `last-enhance.json` | Reports from the other commands. |

---

## 11. Troubleshooting

**"No pending tools to build"** — the manifest's pending list is empty or all
already built. Run `scrape-tools.mjs` + `generate-manifest.mjs`, or use `--slugs`.

**Everything skips as "no tier could build it"** — you ran without
`--allow-generate` and no cluster matched. Either add a cluster (§8) or add
`--allow-generate` (needs Ollama or a cloud key).

**AI tier is very slow / seems stuck** — free cloud tiers are rate-limited
(HTTP 429); the pool then falls back to local Ollama (~45s/call). Keep
`--allow-generate` batches **≤15**. If a run hangs, it's usually a single hard
tool looping — safe to Ctrl-C (progress is checkpointed).

**Gemini returns 429** — its free daily/RPM quota is used up; the pool
automatically falls through to Groq/Ollama. Wait for the quota to reset or add
`OPENROUTER_API_KEY`.

**A tool won't ship (always "SKIP conf low")** — the verify ladder or quality
lint rejected it (wrong output, NaN, dead field, etc.). That's the safety net
working. Check `last-cascade.json` for the exact reason.

**Windows path errors from `import()`** — the scripts already use `file://` URLs;
if you add new dynamic imports, wrap paths with `pathToFileURL()`.

**Registries look stale after manual edits** — run the three `scripts/generate-*`
commands (§5.10), or just run any `build-cascade` (it regenerates at the end).

**Keys not picked up** — make sure they're in `.env` (not only `.env.example`),
in the repo root, as `KEY=value` lines. Verify with the snippet in §2.

---

## 12. Guarantees & known limitations

**Guarantees (enforced by the verify ladder + triage):**
- Never ships a tool that crashes, returns `NaN`/empty, is a fake/placeholder, or
  references a missing field.
- Never fakes an infeasible tool (audio/video/AI/image/PDF/games/network are
  detected and skipped).
- Catches wrong-algorithm bugs via differential testing (e.g. Base32 built with
  Base64 is rejected).
- Catches design defects (dead fields, weak labels, thin selects) via the quality
  lint; poor-quality tools are downgraded to review, not auto-shipped.
- No duplicates: de-duplicated at scrape, manifest, and build (idempotent).

**Limitations (honest):**
- **Depth/subjective polish** isn't fully automatable — the quality lint catches
  ~70% mechanically; layout/taste still benefits from a vision-review agent
  (not yet built) or a human glance.
- **Free-tier throughput** — the AI tier is rate-limited; large novel batches are
  slow. The 0-AI template + memory tiers are where fast scale happens.
- **Semantic correctness of the AI tier** is bounded by what the model/reference
  knows; unverifiable tools are safely skipped, not shipped.

---

## 13. File map

```
automation/
  run.mjs                    # orchestrator (status/cascade/build/enhance/scrape/all)
  build-cascade.mjs          # ★ v2 factory (cascade + verify ladder + triage)
  build-batch.mjs            # v1 single-model generator
  enhance-tools.mjs          # enrich existing tools
  scrape-tools.mjs           # fetch + dedupe tool ideas
  generate-manifest.mjs      # (re)build the master list
  test-logic.mjs             # validate every tool
  repair-tools.mjs           # deterministic key fixer
  ingest-errors.mjs          # production error → rebuild queue
  handcrafted-tools.mjs      # one-off: the hand-authored seed batch

  clusters.mjs               # Tier-1 deterministic template families

  lib/
    env.mjs                  # loads .env for node scripts
    spec.mjs                 # ToolSpec contract, normalize, emit files
    sandbox.mjs              # safe VM to run compute() at build time
    authoring.mjs            # self-contained compute + buildAndValidate
    capability.mjs           # feasibility classifier (what can't be built)
    memory.mjs               # Tier-2 self-RAG recipe store
    manifest.mjs             # read/query the manifest
    overrides.mjs            # write SEO content overrides
    pipeline.mjs             # shared steps (lint, regen, run)

  generator/
    ToolGenerator.mjs        # the model-agnostic interface + JSON contract
    OllamaToolGenerator.mjs  # local model
    TemplateToolGenerator.mjs# deterministic fallback
    agentic.mjs              # ★ Tier-3 multi-agent (designer→coder→reviewer)
    providers.mjs            # free-API pool + failover (Gemini/Groq/OpenRouter/Ollama)
    index.mjs                # provider factory
    validate.mjs             # normalize + shape + sandbox gate

  verify/
    ladder.mjs               # invariants + behavior + confidence score
    differential.mjs         # compare vs Node crypto/zlib + RFC references
    quality.mjs              # deterministic UX/design lint

  retrieval/
    index.mjs                # Wikipedia + npm + own-repo grounding

  data/                      # recipes, scraped ideas, (runtime errors)
  *.json                     # manifest + per-run reports

  ARCHITECTURE-v2.md         # the definitive design (read for the "why")
  ARCHITECTURE-agents.md     # earlier multi-agent design notes
```

Also relevant, outside `automation/`:
```
src/tools/_shared/toolkit/ToolRuntime.jsx   # the one generic renderer
src/platform/registry/toolMetaMap.js        # auto-generated (do not edit)
src/platform/registry/toolRuntimeMap.js     # auto-generated (do not edit)
```
