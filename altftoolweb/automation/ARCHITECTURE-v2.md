# Tool Factory v2 — Definitive Architecture

Three organizing principles:

1. **Cheapest reliable path first.** Escalate to a costlier tier only when
   verification fails. Most tools never reach a paid/cloud model.
2. **Verification is the judge, not the model.** Nothing ships until it passes a
   deterministic ladder that produces a confidence score.
3. **The factory learns.** Every verified tool becomes a reusable recipe; live
   errors and search demand feed back in. Cost decays, quality rises over time.

---

## A. Generation cascade (stop at the first tier that verifies)

| Tier | Method | AI | Covers |
|------|--------|----|--------|
| **1. Cluster templates** | ~150 parameterised generators (case-, date-, unit-, hash-, loan-, BMI-style…) | **0** | the bulk of 1,500 tools |
| **2. Self-RAG memory** | reuse a past *verified* recipe, light local adapt (Ollama) | local | tools similar to ones already built |
| **3. Retrieve + generate** | Stream A: algorithm + test vectors (RFC / npm / Wikipedia). Stream B: feature set (own repo → GitHub). Agents adapt + assemble | free cloud | genuinely new tools |

**Clustering is the #1 cost lever** — 1,500 names ≈ 150 patterns → build once, parameterise. **Self-RAG** makes cost *decay*: the more you build, the more Tier-1/2 hits.

### Retrieval = two streams (Tier 3)
- **Correctness:** RFC / Wikipedia / npm registry / GitHub Code Search → real algorithm **and** canonical test vectors (free ground truth).
- **Depth:** your **own 599-tool repo first** (free, licensed, on-style), then GitHub → the *consensus feature set* (features common across good versions **and** feasible client-side). Not "union everything" — kitchen-sink is a failure mode.

---

## B. Verify ladder (deterministic → confidence score)

Run in order; each adds confidence. **No ship without the sandbox at minimum.**

1. **Sandbox** — runs clean: no throw, no NaN/undefined/empty, no missing-key refs, no fake strings, no banned capabilities. *(built)*
2. **Invariants** — round-trip (`decode(encode(x))===x`, `C→F→C`), metamorphic (`%change` sign-flip, sort idempotent, `gcd` divides both). **Catches wrong-algorithm bugs with zero ground truth.**
3. **Differential** — run generated `compute` **and** a real npm package on the same inputs; must agree.
4. **Behavior** — run against scraped/authoritative test vectors (`Hello→JBSWY3DP`).
5. **Vision UI** — render → screenshot → Gemini (free, vision) judges "complete tool or shallow stub?" Catches depth/layout.

**Repair loop:** on any fail, a *different* model gets the exact failing check + inputs → fix → re-verify (×3) → else **fall back a tier**.

---

## C. Triage by confidence (not all-or-nothing)

| Confidence | Signals | Action |
|------------|---------|--------|
| **High** | vectors + round-trip + differential all green | auto-ship |
| **Medium** | runs + some checks | ship as **beta** |
| **Low** | only sandbox, or ambiguous name | **review queue** / stay pending |

---

## D. Emit + runtime safety
- Write the 4 files, lint-gate, regenerate registries, checkpoint *(built)*.
- **Wrap `compute` in a Web Worker with a timeout** → a bad/ReDoS regex can't
  freeze the user's tab; the tool shows "timed out" instead.

---

## E. Learning loops
- **Grow memory:** every verified tool + algorithm + vectors → a Tier-2 recipe.
- **Production loop:** the app already emits `altftool:tool-runtime-error` — pipe
  those live failures back → auto re-queue the tool for rebuild.
- **Demand + audit:** search trends prioritise which tools to build; a scheduled
  self-audit re-queues any regressions.

---

## F. Free API + retrieval stack

**Retrieval (no/low LLM):** Wikipedia API, GitHub Code Search API, npm registry, Tavily/Brave search, Stack Exchange, Rosetta Code, **+ own repo**.

**LLM roles (free tiers):**
| Role | Model |
|------|-------|
| Read pages, synthesize features, design, vision review | **Gemini 2.x Flash** (long context, JSON, vision, search-grounding) |
| Code / adapt | **Groq** + **Cerebras** (fastest) + **Mistral Codestral** |
| Review / repair (different model) | **OpenRouter `:free`** (DeepSeek) + **GitHub Models** |
| Fallback / bulk / offline | **local Ollama** |

`ProviderPool` rotates keys, fails over on 429/timeout, Ollama last resort.

---

## G. Fits existing code (no rewrite)
The whole cascade is one new `ToolGenerator` (`CascadeToolGenerator`) behind the
existing interface. `build-batch`, `ToolSpec`, `sandbox`, `ToolRuntime`,
manifest, checkpointing, resume — unchanged.
```
TOOLGEN=cascade node automation/build-batch.mjs --count 200
```

## H. Build order
1. **Clustering** (Tier 1) — biggest cost cut, all deterministic. Start here.
2. **Invariant + differential testing** — correctness for free; extends the sandbox.
3. **Self-RAG memory + production error loop** — the compounding flywheel.
4. **Retrieval (Stream A then B)** — Wikipedia/npm/GitHub APIs + repo mining.
5. **Multi-agent generate + ProviderPool** — Gemini/Groq/etc. for the novel tail.
6. **Vision review, Web-Worker runtime, triage queue** — polish + safety.
