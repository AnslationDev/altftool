/*
 * AltF Ideas — deterministic idea composition.
 *
 * This module is the single implementation of "given a point in the DNA space,
 * what is the idea". Both the build-time generator and the runtime rehydrator
 * call `composeIdea` with the same arguments, which is what makes it safe to
 * store only ~120 bytes per idea and reconstruct the other ~2.3KB on demand.
 *
 * Two rules keep that guarantee:
 *   1. Every pseudo-random draw comes from a PRNG seeded by the idea's own DNA
 *      fingerprint — no Date.now(), no Math.random().
 *   2. Draw ORDER is part of the contract. Reordering, adding, or removing a
 *      draw inside composeIdea changes every downstream idea. If you must
 *      change it, regenerate the corpus in the same commit.
 *
 * `scripts/verify-rehydration.mjs` asserts rehydrated output is byte-identical
 * to the stored records, so a violation of rule 2 fails loudly.
 */

import {
  VERTICALS,
  JOBS,
  MECHANISMS,
  WEDGES,
  MODELS,
  TITLE_PATTERNS,
  BUYER_PLURAL,
  COLLECTION_RULES,
} from "./taxonomy.js";

/* ---------- deterministic PRNG ---------- */
export function hash32(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

export function rngFor(seed) {
  let a = hash32(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (arr, r) => arr[Math.floor(r() * arr.length) % arr.length];
const jitter = (r, spread) => Math.round((r() * 2 - 1) * spread);

export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ---------- copy pools ---------- */
const PROBLEM_OPENERS = [
  (v) => `A typical ${v} operation runs this on people, memory, and a shared spreadsheet.`,
  (v) => `In most ${v} businesses this job has never had software written for it.`,
  () => `The work sits between two systems that were never designed to talk.`,
  () => `Nobody owns this process, which is exactly why it keeps breaking.`,
  () => `It is the kind of task that is too small to fund and too costly to ignore.`,
  (v) => `Every ${v} team solves this the same way: someone stays late.`,
];

const PROBLEM_CONSEQUENCE = [
  "The cost is invisible on any P&L line, which is why it never gets fixed.",
  "The error rate is tolerated because measuring it would cost more than the errors.",
  "Whoever knows how it works becomes a single point of failure.",
  "It scales linearly with headcount, so growth makes it worse rather than better.",
  "The backlog only surfaces when a customer or an auditor finds it first.",
  "Most operators assume this is simply the cost of doing business.",
];

/* Mechanism names include "anomaly detector" and "autonomous agent", so the
   article is derived rather than hardcoded — otherwise "a anomaly detector"
   ships on tens of thousands of pages. */
const article = (phrase) => (/^[aeiou]/i.test(String(phrase).trim()) ? "an" : "a");
const withArticle = (phrase) => `${article(phrase)} ${phrase}`;

const SOLUTION_FRAME = [
  (m, j) =>
    `${withArticle(m).replace(/^./, (c) => c.toUpperCase())} that handles ${j} end to end and hands a human the exceptions rather than the queue.`,
  (m, j) => `Point ${withArticle(m)} at ${j}, and let people review output instead of producing it.`,
  (m, j) => `A narrow ${m} scoped to ${j} alone — no platform, no migration, no six-month rollout.`,
  (m, j) =>
    `${withArticle(m).replace(/^./, (c) => c.toUpperCase())} that sits beside the existing system, reads what it already produces, and closes ${j}.`,
  (m, j) =>
    `${j.charAt(0).toUpperCase() + j.slice(1)} handled by ${withArticle(m)}, with a human signing rather than writing.`,
];

const HARDEST = [
  "Integrations with the incumbent system of record are undocumented and gatekept.",
  "Accuracy is unforgiving here — one wrong output costs more than the subscription.",
  "The buying cycle is slower than the build, so runway assumptions matter more than code.",
  "The data you need lives on paper in a back office; digitisation is half the product.",
  "Every customer wants their own edge cases encoded, so onboarding cost is the real constraint.",
  "The incumbent is a person, and displacing a person is a change-management problem.",
  "Trust has to be earned before anyone lets this run unsupervised.",
];

const RISK_POOL = [
  "Incumbent suites can bundle this as a feature once the category is proven.",
  "A single high-profile error can end the pilot and the reference.",
  "Source systems change formats without notice; maintenance is ongoing, not one-off.",
  "Buyers in this segment churn when their own business turns down.",
  "Pricing on outcomes invites disputes about what counts as an outcome.",
  "Regulatory interpretation varies by jurisdiction and can shift under you.",
  "The champion who buys this is often not the person who uses it.",
  "Data access can be revoked by a partner who later competes with you.",
];

const COMPETITOR_ARCHETYPES = [
  { n: "The incumbent suite", g: "Sells a platform; this job is one neglected module inside it" },
  { n: "A spreadsheet", g: "The real incumbent in most of the market, and it is free" },
  { n: "An offshore back office", g: "Cheaper per hour, but does not scale down to the tail" },
  { n: "An internal hire", g: "Works until volume doubles, then breaks again" },
  { n: "A generalist AI tool", g: "No domain grounding, so output needs full human review" },
  { n: "A vertical competitor", g: "Priced and scoped for enterprise accounts, not this segment" },
];

export const EFFORT_BY_FEAS = (f) =>
  f >= 85 ? "weekend" : f >= 72 ? "month" : f >= 56 ? "quarter" : "year";

const COST_BASE = { weekend: 2200, month: 5500, quarter: 14000, year: 34000 };

export const SIGNAL_KEYS = ["demand", "moat", "money", "feasibility", "timing", "competition"];
export const WEIGHTS = { demand: 22, moat: 20, money: 18, feasibility: 16, timing: 14, competition: 10 };

/* ---------- job x vertical coherence ---------- */
const BUYER_JOB_AFFINITY = {
  Dispatcher: ["dispatch", "route planning", "scheduling", "field reporting"],
  "Fleet owner": ["route planning", "dispatch", "maintenance planning", "asset tracking"],
  "Route planner": ["route planning", "dispatch", "demand forecasting"],
  Scheduler: ["scheduling", "dispatch", "onboarding"],
  "Compliance lead": ["compliance audit", "permit & licence tracking", "incident reporting", "training & competency", "risk assessment"],
  "Quality lead": ["quality control", "inspection", "incident reporting"],
  "Maintenance lead": ["maintenance planning", "asset tracking", "inspection"],
  Estimator: ["quoting & estimating", "pricing", "proposal writing"],
  Underwriter: ["risk assessment", "document review", "claims & appeals"],
  "Claims lead": ["claims & appeals", "document review", "reconciliation"],
  "Inventory planner": ["inventory planning", "demand forecasting", "reconciliation"],
  "Warehouse lead": ["inventory planning", "asset tracking", "quality control"],
  CFO: ["reconciliation", "margin monitoring", "expense review", "reporting & analytics"],
  Registrar: ["reporting & analytics", "onboarding", "grant & funding tracking"],
  Recruiter: ["lead qualification", "onboarding", "scheduling"],
  Surveyor: ["inspection", "field reporting", "document review"],
  "Plant supervisor": ["shift handover", "quality control", "maintenance planning", "incident reporting"],
  "Field supervisor": ["field reporting", "inspection", "shift handover", "dispatch"],
  Grower: ["demand forecasting", "risk assessment", "inspection"],
  Broker: ["lead qualification", "quoting & estimating", "renewal management"],
  "Property manager": ["maintenance planning", "renewal management", "collections", "vendor management"],
  "Store manager": ["inventory planning", "scheduling", "quality control"],
  Partner: ["document review", "contract analysis", "proposal writing", "invoicing"],
  "Solo practitioner": ["document review", "invoicing", "intake & triage", "scheduling"],
  "Clinic admin": ["intake & triage", "claims & appeals", "scheduling", "compliance audit"],
  "Practice owner": ["intake & triage", "scheduling", "margin monitoring", "collections"],
  "Office manager": ["scheduling", "invoicing", "intake & triage", "collections"],
  "Owner-operator": ["quoting & estimating", "invoicing", "scheduling", "margin monitoring", "collections"],
  "Project manager": ["permit & licence tracking", "document review", "vendor management", "reporting & analytics"],
  "Ops manager": ["reporting & analytics", "vendor management", "onboarding", "renewal management"],
  "Agency owner": ["lead qualification", "invoicing", "proposal writing", "collections"],
  "Program director": ["grant & funding tracking", "reporting & analytics", "training & competency"],
  Franchisee: ["compliance audit", "inspection", "margin monitoring"],
  "Service manager": ["scheduling", "warranty & returns", "quoting & estimating"],
};

export function jobsForVertical(v) {
  const affinity = new Set();
  for (const b of v.buyers) (BUYER_JOB_AFFINITY[b] || []).forEach((j) => affinity.add(j));
  const r = rngFor(`jobs:${v.slug}`);
  return JOBS.map((j) => ({ j, score: (affinity.has(j.name) ? 100 : 0) + r() * 60 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 26)
    .map((x) => x.j);
}

export function modelsFor(v, job, r) {
  const pool = MODELS.filter((m) => {
    if (m.name === "Per-vehicle")
      return /logistic|freight|delivery|waste|fleet|transport|rail|automotive/i.test(v.slug) || /route|dispatch/.test(job.name);
    if (m.name === "Per-location") return /retail|restaurant|hospitality|franchis|fitness|salon|childcare|auto-repair/i.test(v.slug);
    if (m.name === "Per-matter") return /legal|insurance|accounting|wealth/i.test(v.slug);
    if (m.name === "Site licence") return /manufactur|energy|utilit|industrial|government|aviation|rail/i.test(v.slug);
    if (m.name === "Take-rate") return /claim|collection|reconcil|renewal|margin|pricing/.test(job.name);
    if (m.name === "Per-project") return /construction|architecture|events|marketing|professional|solar/i.test(v.slug);
    return true;
  });
  const shuffled = [...pool].sort(() => r() - 0.5);
  return shuffled.slice(0, 2);
}

/* ============================================================
   composeIdea — the deterministic core
   ------------------------------------------------------------
   DRAW ORDER IS A CONTRACT. See the module header before editing.
   ============================================================ */
export function composeIdea({ vertical: v, buyer, job, mechKey, wedge, model }) {
  const mech = MECHANISMS[mechKey];
  const fingerprint = `${v.slug}|${buyer}|${job.name}|${mechKey}|${wedge.name}|${model.name}`;
  const r = rngFor(fingerprint);

  // 1. raw signals
  const rawScores = {
    demand: v.d + job.mech.length * 3 + jitter(r, 14),
    moat: mech.moat * 0.5 + v.m * 0.5 + jitter(r, 13),
    money: model.mon * 0.7 + v.d * 0.3 + jitter(r, 13),
    feasibility: mech.feas + (model.ttfr <= 45 ? 8 : -4) + jitter(r, 14),
    timing: mech.time + v.cagr * 0.4 + jitter(r, 13),
    competition: v.o + wedge.open + jitter(r, 14),
  };

  // 2. title
  const buyerPl = BUYER_PLURAL[buyer] || `${buyer}s`;
  const pattern = pick(TITLE_PATTERNS, r);
  const title = pattern({ mech: mech.label, job: job.noun, vert: v.name, buyer: buyerPl })
    .replace(/\s+/g, " ")
    .trim();

  // 3. money
  const acvScale = 0.55 + (v.tam / 86e8) * 0.9 + r() * 0.35;
  const acvLowUsd = Math.round((model.acv[0] * acvScale) / 100) * 100;
  const acvHighUsd = Math.round((model.acv[1] * acvScale) / 1000) * 1000;
  const costRoll = [r(), r()];

  // 4. prose
  const oneLiner = `${pick(SOLUTION_FRAME, r)(mech.name, job.name)} Aimed at ${v.name.toLowerCase()} ${buyerPl.toLowerCase()}, ${wedge.phrase}.`;

  const hoursN = 4 + Math.floor(r() * 16);
  const problem = [
    `${v.name} teams lose ${job.pain.replace("{N}", hoursN)}.`,
    pick(PROBLEM_OPENERS, r)(v.name.toLowerCase()),
    pick(PROBLEM_CONSEQUENCE, r),
  ].join(" ");

  const solution = `${pick(SOLUTION_FRAME, r)(mech.name, job.name)} Revenue is ${model.name.toLowerCase()}, which suits a buyer who wants the cost to track the value rather than the seat count.`;

  const whyNow =
    `${mech.why.charAt(0).toUpperCase() + mech.why.slice(1)}. ` +
    `${v.name} is growing at roughly ${v.cagr}% a year, and this job has not been re-tooled since it was designed around paper.`;

  const competitors = [...COMPETITOR_ARCHETYPES]
    .sort(() => r() - 0.5)
    .slice(0, 3)
    .map((c) => ({ name: c.n, gap: c.g }));

  const risks = [...RISK_POOL].sort(() => r() - 0.5).slice(0, 3);

  // 5. market + remaining draws (order matters: matches the original record shape)
  const tamUsd = Math.round(v.tam * (0.15 + r() * 0.5));
  const cagrPct = v.cagr + jitter(r, 3);
  const timeToFirstRevenueDays = model.ttfr + jitter(r, 12);
  const hardestPart = pick(HARDEST, r);

  return {
    fingerprint,
    title,
    oneLiner,
    problem,
    solution,
    whyNow,
    competitors,
    risks,
    rawScores,
    costRoll,
    dna: {
      vertical: v.name,
      verticalSlug: v.slug,
      buyer,
      job: job.name,
      mechanism: mech.name,
      mechanismKey: mechKey,
      wedge: wedge.name,
      model: model.name,
    },
    market: { tamUsd, cagrPct },
    money: { pricingModel: model.name, acvLowUsd, acvHighUsd, timeToFirstRevenueDays },
    build: { hardestPart },
    tags: [v.slug, mechKey, slugify(model.name), slugify(job.name)],
  };
}

/**
 * Attach the calibrated values a single idea cannot know on its own — the
 * percentile mapping needs the whole corpus — and resolve everything derived
 * from them.
 */
export function finalizeIdea(composed, { id, slug, rank, scores, aos }) {
  const entries = Object.entries(scores);
  const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const worst = entries.reduce((a, b) => (b[1] < a[1] ? b : a));

  const effort = EFFORT_BY_FEAS(scores.feasibility);
  const [r1, r2] = composed.costRoll;
  const startupCostLowUsd = Math.round((COST_BASE[effort] * (0.8 + r1 * 0.5)) / 500) * 500;
  const startupCostHighUsd = Math.round((startupCostLowUsd * (2.2 + r2 * 1.4)) / 1000) * 1000;

  const idea = {
    id,
    slug,
    rank,
    title: composed.title,
    oneLiner: composed.oneLiner,
    problem: composed.problem,
    solution: composed.solution,
    dna: composed.dna,
    scores,
    aos,
    confidence: aos >= 76 ? "high" : aos >= 58 ? "medium" : "low",
    scoreRationale: `Carried by ${best[0]} (${best[1]}), held back by ${worst[0]} (${worst[1]}).`,
    market: composed.market,
    money: { ...composed.money, startupCostLowUsd, startupCostHighUsd },
    build: { effort, hardestPart: composed.build.hardestPart },
    whyNow: composed.whyNow,
    competitors: composed.competitors,
    risks: composed.risks,
    tags: composed.tags,
    collections: [],
    votes: { up: Math.round(aos * aos * (0.4 + r1 * 1.6)), down: Math.round(aos * (0.5 + r2 * 3)) },
    views: Math.round(aos * 140 * (0.3 + r2 * 3)),
  };

  idea.collections = COLLECTION_RULES.filter((c) => c.test(idea)).map((c) => c.slug);
  return idea;
}

/** Resolve the axis objects a compact record points at. */
export function axesFromCompact(compact) {
  const vertical = VERTICALS[compact.vi];
  if (!vertical) return null;
  const buyer = vertical.buyers[compact.bi];
  const job = JOBS[compact.ji];
  const wedge = WEDGES[compact.wi];
  const model = MODELS[compact.moi];
  if (!buyer || !job || !wedge || !model || !MECHANISMS[compact.mk]) return null;
  return { vertical, buyer, job, mechKey: compact.mk, wedge, model };
}

/** Full record from a compact record — the whole point of this module. */
export function rehydrate(compact) {
  const axes = axesFromCompact(compact);
  if (!axes) return null;
  return finalizeIdea(composeIdea(axes), {
    id: compact.i,
    slug: compact.s,
    rank: compact.r,
    scores: {
      demand: compact.sc[0],
      moat: compact.sc[1],
      money: compact.sc[2],
      feasibility: compact.sc[3],
      timing: compact.sc[4],
      competition: compact.sc[5],
    },
    aos: compact.a,
  });
}
