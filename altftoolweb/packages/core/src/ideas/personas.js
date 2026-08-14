/*
 * AltF Ideas — persona hubs and the programmatic modifier tier.
 *
 * Both exist to answer a real search intent ("startup ideas for solo
 * developers", "startup ideas under $5000") with a genuinely different
 * ranking, not the same list under a different heading. Each persona carries
 * its own signal weighting, so the ordering actually changes.
 */

/** Persona hubs — /ideas/for/[slug] */
export const PERSONAS = Object.freeze([
  {
    slug: "solo-founders",
    name: "Solo founders",
    headline: "Startup ideas for solo founders",
    intent: "one person, no team, no funding",
    lede: "Ranked for one person shipping alone: feasibility is weighted more than twice as heavily as moat, because an idea you cannot finish is worth nothing regardless of how defensible it would have been.",
    weights: { demand: 16, moat: 8, money: 18, feasibility: 34, timing: 14, competition: 10 },
    filter: (r) => r.e === "weekend" || r.e === "month",
  },
  {
    slug: "non-technical-founders",
    name: "Non-technical founders",
    headline: "Startup ideas for non-technical founders",
    intent: "no engineering background",
    lede: "Weighted toward ideas where the hard part is distribution or domain knowledge rather than engineering, and away from mechanisms that need a research team.",
    weights: { demand: 26, moat: 10, money: 26, feasibility: 26, timing: 8, competition: 4 },
    filter: (r) => ["workflow", "scrape", "classify", "extract"].includes(r.m),
  },
  {
    slug: "bootstrappers",
    name: "Bootstrappers",
    headline: "Startup ideas for bootstrappers",
    intent: "profitable early, no outside money",
    lede: "Monetisation carries almost twice its normal weight and timing carries half. A bootstrapper needs revenue before a window closes, not a bet on one opening.",
    weights: { demand: 18, moat: 10, money: 34, feasibility: 22, timing: 8, competition: 8 },
    filter: (r) => r.e !== "year",
  },
  {
    slug: "students",
    name: "Students",
    headline: "Startup ideas for students",
    intent: "small budget, limited hours",
    lede: "Filtered to what fits around coursework: a small first version, low startup cost, and a first customer reachable without a network you do not have yet.",
    weights: { demand: 20, moat: 6, money: 16, feasibility: 38, timing: 12, competition: 8 },
    filter: (r) => r.e === "weekend" || r.e === "month",
  },
  {
    slug: "agencies",
    name: "Agencies",
    headline: "Startup ideas for agencies and consultancies",
    intent: "productising existing service work",
    lede: "For teams that already sell hours and want a product. Weighted to monetisation and feasibility, because the distribution problem is already solved.",
    weights: { demand: 24, moat: 6, money: 26, feasibility: 24, timing: 10, competition: 10 },
    filter: (r) => ["per-project", "managed-service", "per-matter", "seat-saas"].includes(r.mo),
  },
  {
    slug: "developers",
    name: "Developers",
    headline: "Startup ideas for developers",
    intent: "can build, wants a market",
    lede: "Assumes the build is the easy part. Moat and open field are weighted up, so the list favours ideas where the durable advantage is not just shipping first.",
    weights: { demand: 22, moat: 24, money: 18, feasibility: 8, timing: 16, competition: 12 },
    filter: null,
  },
  {
    slug: "vc-track",
    name: "VC-track founders",
    headline: "Venture-scale startup ideas",
    intent: "raising, needs a large outcome",
    lede: "Moat and demand dominate, feasibility barely counts. These are the ideas that are hard to build on purpose, because that is the point.",
    weights: { demand: 26, moat: 32, money: 18, feasibility: 4, timing: 16, competition: 4 },
    filter: (r) => r.a >= 65,
  },
  {
    slug: "career-changers",
    name: "Career changers",
    headline: "Startup ideas for career changers",
    intent: "leaving a job, has domain knowledge",
    lede: "For people whose advantage is knowing an industry from the inside. Ranked so that domain-heavy, unglamorous workflows rise rather than sink.",
    weights: { demand: 20, moat: 22, money: 24, feasibility: 18, timing: 8, competition: 8 },
    filter: (r) => r.a >= 60,
  },
]);

/**
 * Programmatic modifier tier — /ideas-for/[slug].
 *
 * Each entry must produce a genuinely different set, otherwise it is a thin
 * duplicate of browse and does not belong in the sitemap. `minCount` is the
 * anti-thin-content gate applied before a page is indexed.
 */
export const MODIFIERS = Object.freeze([
  { slug: "under-5000-dollars", name: "under $5,000", kind: "budget",
    lede: "Every idea here reaches a working first version inside a four-figure budget.",
    filter: (r, idea) => idea.money.startupCostLowUsd < 5000 },
  { slug: "under-1000-dollars", name: "under $1,000", kind: "budget",
    lede: "The cheapest starts in the corpus — mostly weekend builds on existing tooling.",
    filter: (r, idea) => idea.money.startupCostLowUsd < 1000 },
  { slug: "no-code", name: "buildable without code", kind: "skill",
    lede: "Mechanisms that assemble from off-the-shelf tooling rather than custom engineering.",
    filter: (r) => ["workflow", "scrape", "classify"].includes(r.m) },
  { slug: "weekend-projects", name: "weekend projects", kind: "effort",
    lede: "A first shippable version in two days, by one person.",
    filter: (r) => r.e === "weekend" },
  { slug: "recurring-revenue", name: "with recurring revenue", kind: "model",
    lede: "Subscription and licence models where revenue compounds instead of resetting.",
    filter: (r) => ["seat-saas", "flat-saas", "site-licence", "data-subscription"].includes(r.mo) },
  { slug: "high-ticket", name: "with high contract values", kind: "model",
    lede: "Small buyer counts, large contracts — you do not need many customers.",
    filter: (r, idea) => idea.money.acvHighUsd >= 100000 },
  { slug: "b2b-saas", name: "B2B SaaS", kind: "model",
    lede: "Software sold to businesses on a repeating licence.",
    filter: (r) => ["seat-saas", "flat-saas", "site-licence"].includes(r.mo) },
  { slug: "ai-agents", name: "using AI agents", kind: "mechanism",
    lede: "Ideas built on tool-using agents that close a loop without supervision.",
    filter: (r) => r.m === "agent" },
  { slug: "voice-ai", name: "using voice AI", kind: "mechanism",
    lede: "Real-time speech models replacing phone and dictation work.",
    filter: (r) => r.m === "voice" },
  { slug: "computer-vision", name: "using computer vision", kind: "mechanism",
    lede: "Vision models reading photos and video that a human currently inspects.",
    filter: (r) => r.m === "vision" },
  { slug: "document-automation", name: "for document automation", kind: "mechanism",
    lede: "Parsing and generating the paperwork that currently moves by hand.",
    filter: (r) => ["extract", "longctx", "rag"].includes(r.m) },
  { slug: "boring-industries", name: "in boring industries", kind: "market",
    lede: "Unglamorous sectors where the incumbent is a spreadsheet and nobody is competing for attention.",
    filter: (r) => r.a >= 62 && ["funeral-services", "waste-management", "maritime", "rail", "pest-control", "trade-schools", "equipment-rental", "utilities"].includes(r.v) },
  { slug: "fast-revenue", name: "with fast first revenue", kind: "speed",
    lede: "Money in within a month, useful when the idea has to fund itself.",
    filter: (r, idea) => idea.money.timeToFirstRevenueDays <= 30 },
  { slug: "regulated-markets", name: "in regulated markets", kind: "market",
    lede: "Compliance is the moat: hard to enter, hard to displace once you are in.",
    filter: (r) => ["healthcare", "legal", "insurance", "government", "public-safety", "life-sciences", "aviation", "utilities", "lending"].includes(r.v) },
  { slug: "small-teams", name: "for small teams", kind: "effort",
    lede: "Buildable and operable by two or three people without an ops hire.",
    filter: (r) => r.e === "weekend" || r.e === "month" },
  { slug: "underserved-markets", name: "in underserved markets", kind: "market",
    lede: "High open-field scores — incumbents have not covered these workflows properly.",
    filter: (r, idea) => idea.scores.competition >= 82 },
]);

export const MIN_IDEAS_FOR_INDEX = 8;

export function findPersona(slug) {
  return PERSONAS.find((p) => p.slug === slug) ?? null;
}

export function findModifier(slug) {
  return MODIFIERS.find((m) => m.slug === slug) ?? null;
}
