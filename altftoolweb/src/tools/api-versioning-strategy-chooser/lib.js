/**
 * API versioning strategy chooser.
 *
 * The four mainstream strategies, with real-world anchors:
 *  - URL path (/v1/users): used by Stripe's public paths, Twilio, most REST APIs.
 *  - Query parameter (?api-version=2024-06-01): Azure REST API guidelines.
 *  - Custom request header (Stripe-Version: 2024-06-20): Stripe's date-based
 *    pinning; also X-API-Version patterns.
 *  - Media type / content negotiation (Accept: application/vnd.github.v3+json):
 *    GitHub's classic v3 media type.
 *
 * Ratings are 0-5 editorial scores per criterion. Caching scores follow HTTP
 * semantics: URL-based versions give each version a distinct cache key for
 * free, while header/media-type versions require a Vary response header
 * (RFC 9110 §12.5.5) for shared caches to store versions separately.
 */

export const RATING_MAX = 5;

export const CRITERIA = [
  {
    id: "cacheability",
    label: "HTTP cache friendliness",
    hint: "Distinct cache keys per version without Vary gymnastics.",
  },
  {
    id: "clientSimplicity",
    label: "Client simplicity",
    hint: "How easy it is for any client (curl, browser, SDK) to call a version.",
  },
  {
    id: "gatewayRouting",
    label: "Gateway routing & ops",
    hint: "Routing versions to different backends at the load balancer or gateway.",
  },
  {
    id: "restPurity",
    label: "REST / HTTP semantics",
    hint: "One resource, one URI — representation chosen by negotiation.",
  },
  {
    id: "explorability",
    label: "Explorability & debuggability",
    hint: "Visible in browser address bars, logs and pasted links.",
  },
  {
    id: "urlStability",
    label: "URL stability",
    hint: "Links keep working across versions; no /v1/ baked into bookmarks.",
  },
];

export const STRATEGIES = [
  {
    id: "path",
    name: "URL path versioning",
    example: "GET /v2/users/42",
    usedBy: "Stripe (paths), Twilio, the majority of public REST APIs",
    ratings: {
      cacheability: 5,
      clientSimplicity: 5,
      gatewayRouting: 5,
      restPurity: 2,
      explorability: 5,
      urlStability: 1,
    },
    migration: {
      effort: "Medium",
      note: "Every client must rewrite base URLs for each major version; old versions stay routable side by side, which eases gradual cutover.",
    },
  },
  {
    id: "query",
    name: "Query parameter versioning",
    example: "GET /users/42?api-version=2024-06-01",
    usedBy: "Microsoft Azure REST APIs",
    ratings: {
      cacheability: 4,
      clientSimplicity: 5,
      gatewayRouting: 4,
      restPurity: 2,
      explorability: 5,
      urlStability: 3,
    },
    migration: {
      effort: "Low",
      note: "Clients add one parameter; the server can default missing versions to the oldest supported, so unversioned callers keep working.",
    },
  },
  {
    id: "header",
    name: "Custom header versioning",
    example: "GET /users/42\nStripe-Version: 2024-06-20",
    usedBy: "Stripe (Stripe-Version), many internal APIs (X-API-Version)",
    ratings: {
      cacheability: 2,
      clientSimplicity: 3,
      gatewayRouting: 3,
      restPurity: 3,
      explorability: 2,
      urlStability: 5,
    },
    migration: {
      effort: "Low",
      note: "URLs never change and accounts can be pinned server-side to a default version; caches and gateways must key on the header (Vary) and browsers cannot select versions from a link.",
    },
  },
  {
    id: "media",
    name: "Media type versioning (content negotiation)",
    example: "GET /users/42\nAccept: application/vnd.example.v2+json",
    usedBy: "GitHub API v3 (application/vnd.github.v3+json)",
    ratings: {
      cacheability: 2,
      clientSimplicity: 2,
      gatewayRouting: 2,
      restPurity: 5,
      explorability: 1,
      urlStability: 5,
    },
    migration: {
      effort: "High",
      note: "Every client must set vendor Accept headers correctly and handle 406 responses; caches need Vary: Accept. The most correct HTTP story and the most client friction.",
    },
  },
];

export const DEFAULT_WEIGHTS = Object.fromEntries(CRITERIA.map((c) => [c.id, 3]));

/**
 * Rank strategies: score = 100 * sum(rating*weight) / (RATING_MAX * sum(weight)).
 *
 * @param {object} weights Map criterion id -> importance 0..5.
 * @returns {{ranking: Array<object>, totalWeight: number} | {error: string}}
 */
export function chooseStrategy(weights) {
  if (!weights || typeof weights !== "object") {
    return { error: "Set at least one criterion weight above zero." };
  }
  const clean = {};
  for (const c of CRITERIA) {
    const w = Number(weights[c.id]);
    if (!Number.isFinite(w) || w < 0) {
      return { error: `Weight for "${c.label}" must be a number of 0 or more.` };
    }
    clean[c.id] = Math.min(RATING_MAX, w);
  }
  const totalWeight = CRITERIA.reduce((sum, c) => sum + clean[c.id], 0);
  if (totalWeight === 0) {
    return { error: "All weights are zero — raise at least one criterion above zero to rank the strategies." };
  }
  const maxPoints = RATING_MAX * totalWeight;

  const ranking = STRATEGIES.map((s) => ({
    id: s.id,
    name: s.name,
    example: s.example,
    usedBy: s.usedBy,
    migration: s.migration,
    weightedPoints: CRITERIA.reduce((sum, c) => sum + s.ratings[c.id] * clean[c.id], 0),
    maxPoints,
  }))
    .map((s) => ({ ...s, score: Math.round((s.weightedPoints / maxPoints) * 1000) / 10 }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return { ranking, totalWeight };
}
