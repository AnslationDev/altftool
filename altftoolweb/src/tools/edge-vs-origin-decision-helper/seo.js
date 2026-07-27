const seo = {
  intro:
    "This helper decides whether an API endpoint belongs on an edge runtime or at the origin by modelling the latency that actually matters: edge latency = user-to-edge RTT + (miss rate × origin data calls × edge-to-origin RTT), compared against simply serving from the origin region. It also applies the hard blockers — strong consistency against a single-region database, compute beyond edge runtime limits, and data-residency rules — that force origin regardless of latency. It is for developers choosing between edge functions (Cloudflare Workers, Vercel Edge, Lambda@Edge) and regional serverless or servers.",
  useCases: [
    "Checking whether moving a personalisation endpoint to edge functions actually helps when every request still queries a us-east-1 database",
    "Quantifying the win for a geolocation or A/B-bucketing endpoint that needs no per-request origin data",
    "Justifying, with numbers, why the checkout API stays regional while static rendering moves to the edge",
  ],
  benefits: [
    ["Models the edge tax", "The miss-rate × round-trips × RTT cost of reaching back to your data is computed, not hand-waved."],
    ["Hard blockers respected", "Consistency, compute limits and data residency override the latency maths when they apply."],
    ["Actionable flip conditions", "When origin wins, it tells you what would change the answer — replicate data, batch calls, or split the endpoint."],
  ],
  faqs: [
    [
      "When is an edge function actually faster than a regional server?",
      "When it can answer without crossing back to the origin region — static or cached content, redirects, auth-token checks against replicated data, geolocation logic. If every request still makes an uncached call to a single-region database, the edge adds a hop instead of removing one and is often slower.",
    ],
    [
      "What is the 'edge tax' in serverless architecture?",
      "It is the extra latency an edge function pays each time it fetches data from the origin region: the full edge-to-origin round trip, repeated for every sequential call. Two 100 ms round trips from an edge PoP cost 200 ms — more than many users would spend just reaching the origin directly.",
    ],
    [
      "Which endpoints should stay at the origin?",
      "Endpoints needing strong read-after-write consistency against a single-region primary, heavy CPU or memory beyond edge runtime limits, long-running work, or processing pinned to a region by data-residency rules. For these, edge execution either cannot work or saves nothing because every request must reach the origin anyway.",
    ],
    [
      "How do I make a database-backed endpoint fast at the edge?",
      "Raise the edge hit ratio so most requests never leave the PoP: cache responses or query results at the edge, use a globally replicated store (edge KV, read replicas) for read-mostly data, and collapse multiple sequential origin calls into one batched request. The model shows the break-even hit ratio for your RTTs.",
    ],
  ],
};

export default seo;
