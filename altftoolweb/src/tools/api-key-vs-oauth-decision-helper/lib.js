/**
 * API key vs OAuth vs mutual TLS decision model.
 *
 * The five candidates are the credential mechanisms actually defined by the IETF
 * for HTTP APIs, plus the de-facto static shared secret:
 *
 *  - Static API key      a bearer shared secret sent on every call. Not an IETF grant;
 *                        it identifies the *application*, never an end user.
 *  - Client credentials  OAuth 2.0 grant, RFC 6749 section 4.4. Machine-to-machine.
 *                        The long-lived client secret is exchanged for a short-lived
 *                        access token, so the credential that travels on API calls expires.
 *  - Authorization code
 *    + PKCE              OAuth 2.0 RFC 6749 section 4.1 with PKCE, RFC 7636. OAuth 2.1
 *                        makes PKCE mandatory for every authorization code request and
 *                        drops the implicit and password grants entirely.
 *  - Device grant        OAuth 2.0 device authorization grant, RFC 8628, for clients with
 *                        no browser or no keyboard (TVs, CLIs, headless installers).
 *  - Mutual TLS          client certificate authentication; RFC 8705 defines how a TLS
 *                        client certificate authenticates an OAuth client and how a token
 *                        can be certificate-bound (sender-constrained).
 *
 * DECISION MODEL. Two independent passes:
 *  1. GATES. Structural facts that make a mechanism unable to express the requirement at
 *     all — for example a static API key cannot carry an end user's consent, and a public
 *     client (browser, mobile, desktop) cannot keep any shared secret confidential
 *     (RFC 6749 section 2.1). A gated option is marked "ruled out" with the reason.
 *  2. WEIGHTED RUBRIC. Every option is scored 0-3 on eight criteria, each with a fixed
 *     weight, so options that survive the gates can still be compared. The blast-radius
 *     criterion carries a weight that grows with data sensitivity, because how long a
 *     credential lives only matters in proportion to what it unlocks.
 *
 * Scoring is deterministic: same input, same output. No dates, no randomness.
 */

/** Score any option can earn on one criterion. Kept small so weights, not scores, drive the model. */
const MAX_CRITERION_SCORE = 3;

/* ------------------------------------------------------------------ *
 * Criterion weights. Relative importance only; the total is normalised
 * to a percentage so the numbers stay comparable across inputs.
 * ------------------------------------------------------------------ */
const W_DELEGATION = 5; // can the mechanism carry "user X allowed app Y"?
const W_SECRECY = 5; // can the client actually keep the credential secret?
const W_SCOPES = 3; // per-permission narrowing of what the credential may do
const W_REVOCATION = 4; // how surgically access can be withdrawn
const W_ROTATION = 3; // effort to replace the credential on a schedule
const W_UNATTENDED = 4; // works with no human and no browser present
const W_EASE = 5; // integration and support cost for the consumer

/** Blast-radius weight rises with sensitivity: long-lived secrets matter more over sensitive data. */
const BLAST_WEIGHT_BY_SENSITIVITY = { low: 2, medium: 4, high: 6 };

export const OPTIONS = [
  {
    id: "api-key",
    name: "Static API key",
    spec: "Shared secret, no IETF grant",
    summary:
      "One long-lived secret string sent on every request. Identifies the calling application only.",
    header: 'Authorization: Bearer sk_live_… (or X-API-Key: …)',
    implementation: [
      "Generate at least 128 bits of entropy and show the value exactly once.",
      "Store only a salted hash of the key, never the key itself.",
      "Prefix keys so leaked values are greppable by secret scanners (for example ak_live_).",
      "Support two live keys per consumer so rotation never needs downtime.",
    ],
  },
  {
    id: "oauth-client-credentials",
    name: "OAuth 2.0 client credentials",
    spec: "RFC 6749 §4.4",
    summary:
      "The client swaps a confidential client secret at the token endpoint for a short-lived access token.",
    header: "POST /token  grant_type=client_credentials&scope=orders.read",
    implementation: [
      "Issue access tokens with a short expiry (5-60 minutes is typical) and no refresh token.",
      "Authenticate the client with client_secret_basic, a private_key_jwt assertion, or mTLS.",
      "Put the granted scopes in the token so the resource server never has to call back.",
      "Consider sender-constrained tokens (RFC 8705 or DPoP, RFC 9449) for high-value APIs.",
    ],
  },
  {
    id: "oauth-auth-code-pkce",
    name: "OAuth 2.1 authorization code + PKCE",
    spec: "RFC 6749 §4.1 + RFC 7636",
    summary:
      "The end user signs in at the authorization server and consents; the app receives a code it exchanges for tokens.",
    header: "GET /authorize?response_type=code&code_challenge=…&code_challenge_method=S256",
    implementation: [
      "PKCE with S256 is mandatory in OAuth 2.1 for every client, confidential ones included.",
      "Register exact redirect URIs; OAuth 2.1 requires exact string matching, no wildcards.",
      "Use refresh token rotation with reuse detection for public clients.",
      "Never use the implicit grant; it was removed in OAuth 2.1.",
    ],
  },
  {
    id: "oauth-device-code",
    name: "OAuth 2.0 device authorization grant",
    spec: "RFC 8628",
    summary:
      "The device shows a short user code; the person approves it on a phone or laptop, and the device polls for tokens.",
    header: "POST /device_authorization → user_code + verification_uri, then poll /token",
    implementation: [
      "Honour the interval field and back off on slow_down responses when polling.",
      "Keep user codes short, unambiguous and single-use, and expire them in minutes.",
      "Show the verification URI on screen; a QR code is a convenience, not a substitute.",
      "Rate-limit device code issuance — the endpoint is unauthenticated.",
    ],
  },
  {
    id: "mtls",
    name: "Mutual TLS client certificates",
    spec: "RFC 8705",
    summary:
      "The client proves possession of a private key during the TLS handshake, before any HTTP request is parsed.",
    header: "TLS handshake presents client cert; API sees the verified subject DN or SPKI thumbprint",
    implementation: [
      "Pin either the full certificate chain to your own CA or the self-signed SPKI thumbprint.",
      "Plan certificate lifetime and automated renewal before onboarding the first consumer.",
      "Terminate TLS where you can still read the client certificate, or forward it as a verified header.",
      "Combine with certificate-bound access tokens when you also need scopes.",
    ],
  },
];

const OPTION_IDS = OPTIONS.map((option) => option.id);

export const CONSUMER_TYPES = [
  {
    id: "internal-service",
    label: "Internal service (your own backend)",
    preset: { actsOnBehalfOfUsers: false, canStoreSecret: true, interactiveBrowser: false },
  },
  {
    id: "partner-backend",
    label: "Named partner's backend",
    preset: { actsOnBehalfOfUsers: false, canStoreSecret: true, interactiveBrowser: false },
  },
  {
    id: "third-party-app",
    label: "Third-party app acting for its own users",
    preset: { actsOnBehalfOfUsers: true, canStoreSecret: true, interactiveBrowser: true },
  },
  {
    id: "browser-spa",
    label: "Browser single-page app",
    preset: { actsOnBehalfOfUsers: true, canStoreSecret: false, interactiveBrowser: true },
  },
  {
    id: "mobile-app",
    label: "Mobile or desktop app",
    preset: { actsOnBehalfOfUsers: true, canStoreSecret: false, interactiveBrowser: true },
  },
  {
    id: "device-cli",
    label: "Headless device, TV or CLI",
    preset: { actsOnBehalfOfUsers: true, canStoreSecret: false, interactiveBrowser: false },
  },
];

export const SENSITIVITY_LEVELS = [
  { id: "low", label: "Low — public or non-personal data" },
  { id: "medium", label: "Medium — business data, some personal fields" },
  { id: "high", label: "High — payments, health, identity or bulk personal data" },
];

export const ROTATION_MODES = [
  { id: "automated", label: "Automated (secret manager or CI rotates it)" },
  { id: "manual", label: "Manual (someone edits an env var)" },
  { id: "none", label: "None planned" },
];

export const DEFAULT_INPUT = {
  consumer: "third-party-app",
  actsOnBehalfOfUsers: true,
  canStoreSecret: true,
  interactiveBrowser: true,
  dataSensitivity: "medium",
  needScopes: true,
  needPerUserRevocation: true,
  rotation: "manual",
};

/* ------------------------------------------------------------------ *
 * Gates — structural impossibilities, not preferences.
 * ------------------------------------------------------------------ */
const GATES = [
  {
    id: "needs-delegation",
    applies: (input) => input.actsOnBehalfOfUsers === true,
    rulesOut: ["api-key", "oauth-client-credentials", "mtls"],
    reason:
      "The consumer acts for an end user, and only a user-delegation grant carries that user's consent. An application-level credential proves which app is calling, never which person authorised it.",
  },
  {
    id: "no-user-present",
    applies: (input) => input.actsOnBehalfOfUsers === false,
    rulesOut: ["oauth-auth-code-pkce", "oauth-device-code"],
    reason:
      "There is no end user in the loop, so there is nobody to approve anything at an authorization endpoint. Machine-to-machine traffic uses an application credential instead.",
  },
  {
    id: "public-client",
    applies: (input) => input.canStoreSecret === false,
    rulesOut: ["api-key", "oauth-client-credentials", "mtls"],
    reason:
      "A public client — browser, mobile or desktop code the user controls — cannot keep a shared secret confidential (RFC 6749 §2.1). Any key shipped inside it must be treated as published.",
  },
  {
    id: "no-browser",
    applies: (input) => input.interactiveBrowser === false && input.actsOnBehalfOfUsers === true,
    rulesOut: ["oauth-auth-code-pkce"],
    reason:
      "The authorization code flow needs a browser redirect back to the client. With no browser on the device, RFC 8628's device grant moves the approval to a second screen instead.",
  },
];

/* ------------------------------------------------------------------ *
 * Rubric.
 * ------------------------------------------------------------------ */
const CRITERIA = [
  {
    id: "delegation",
    label: "Carries end-user delegation",
    weight: () => W_DELEGATION,
    scores: (input) =>
      input.actsOnBehalfOfUsers
        ? { "api-key": 0, "oauth-client-credentials": 0, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 0 }
        : { "api-key": 3, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 0, "oauth-device-code": 0, mtls: 3 },
    note: (input) =>
      input.actsOnBehalfOfUsers
        ? "Consent has to be recorded per user, so an application-only credential cannot express it."
        : "No user consent to record, so an application-level credential is the right shape.",
  },
  {
    id: "secrecy",
    label: "Credential stays secret on the client",
    weight: () => W_SECRECY,
    scores: (input) =>
      input.canStoreSecret
        ? { "api-key": 3, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 3 }
        : { "api-key": 0, "oauth-client-credentials": 0, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 0 },
    note: (input) =>
      input.canStoreSecret
        ? "A server-side consumer can hold a long-lived secret in a vault or environment variable."
        : "PKCE replaces the client secret with a per-request proof, which is exactly why it exists.",
  },
  {
    id: "scopes",
    label: "Per-permission scoping",
    weight: () => W_SCOPES,
    scores: (input) =>
      input.needScopes
        ? { "api-key": 1, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 1 }
        : { "api-key": 3, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 3 },
    note: (input) =>
      input.needScopes
        ? "Scopes are part of the OAuth token request; with keys or certificates you have to build the mapping yourself."
        : "Full access on one credential is acceptable here, so scoping is not a differentiator.",
  },
  {
    id: "revocation",
    label: "Revocation granularity",
    weight: () => W_REVOCATION,
    scores: (input) =>
      input.needPerUserRevocation
        ? { "api-key": 0, "oauth-client-credentials": 1, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 1 }
        : { "api-key": 2, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 3 },
    note: (input) =>
      input.needPerUserRevocation
        ? "One user withdrawing access must not disconnect everyone else on the same integration."
        : "Revoking the whole integration at once is acceptable, so all mechanisms can do the job.",
  },
  {
    id: "blast-radius",
    label: "Blast radius if the credential leaks",
    weight: (input) => BLAST_WEIGHT_BY_SENSITIVITY[input.dataSensitivity] ?? BLAST_WEIGHT_BY_SENSITIVITY.medium,
    scores: (input) => {
      if (input.dataSensitivity === "high") {
        return { "api-key": 0, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 2 };
      }
      if (input.dataSensitivity === "low") {
        return { "api-key": 3, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 3 };
      }
      return { "api-key": 1, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 2 };
    },
    note: (input) =>
      input.dataSensitivity === "low"
        ? "Low-value data, so a leaked credential is an operational nuisance rather than an incident."
        : "A leaked static key is valid until someone notices; an access token expires on its own within minutes.",
  },
  {
    id: "rotation",
    label: "Rotation effort",
    weight: () => W_ROTATION,
    scores: (input) => {
      if (input.rotation === "automated") {
        return { "api-key": 3, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 3 };
      }
      if (input.rotation === "none") {
        return { "api-key": 0, "oauth-client-credentials": 2, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 0 };
      }
      return { "api-key": 1, "oauth-client-credentials": 2, "oauth-auth-code-pkce": 3, "oauth-device-code": 3, mtls: 1 };
    },
    note: (input) =>
      input.rotation === "automated"
        ? "Rotation is already automated, so a long-lived secret is far less of a liability."
        : "Token-based mechanisms rotate the credential on the wire automatically; keys and certificates do not.",
  },
  {
    id: "unattended",
    label: "Runs unattended, no browser",
    weight: () => W_UNATTENDED,
    scores: (input) =>
      input.interactiveBrowser
        ? { "api-key": 3, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 3, "oauth-device-code": 2, mtls: 3 }
        : { "api-key": 3, "oauth-client-credentials": 3, "oauth-auth-code-pkce": 0, "oauth-device-code": 2, mtls: 3 },
    note: (input) =>
      input.interactiveBrowser
        ? "A browser is available, so a redirect-based flow is not a constraint."
        : "No browser on the device, so any flow that needs a redirect back to the client is out.",
  },
  {
    id: "ease",
    label: "Integration and support cost",
    weight: () => W_EASE,
    scores: () => ({
      "api-key": 3,
      "oauth-client-credentials": 2,
      "oauth-auth-code-pkce": 1,
      "oauth-device-code": 1,
      mtls: 1,
    }),
    note: () =>
      "A key is one header; OAuth needs an authorization server; mTLS needs certificate lifecycle management on both sides.",
  },
];

const VALID_SENSITIVITY = SENSITIVITY_LEVELS.map((level) => level.id);
const VALID_ROTATION = ROTATION_MODES.map((mode) => mode.id);
const VALID_CONSUMER = CONSUMER_TYPES.map((type) => type.id);

/**
 * Rank the five credential mechanisms for one API consumer.
 *
 * @param {object} input
 * @param {string} input.consumer               one of CONSUMER_TYPES ids
 * @param {boolean} input.actsOnBehalfOfUsers   does the caller act for an end user?
 * @param {boolean} input.canStoreSecret        confidential client (true) or public client (false)
 * @param {boolean} input.interactiveBrowser    is a browser available on the client device?
 * @param {string} input.dataSensitivity        "low" | "medium" | "high"
 * @param {boolean} input.needScopes            per-permission narrowing required?
 * @param {boolean} input.needPerUserRevocation must access be withdrawable for one user alone?
 * @param {string} input.rotation               "automated" | "manual" | "none"
 * @returns {object} { recommendation, ranked, criteria, gates, warning, maxScore } or { error }
 */
export function evaluateAuthChoice(input = {}) {
  const merged = { ...DEFAULT_INPUT, ...input };

  if (!VALID_CONSUMER.includes(merged.consumer)) {
    return { error: "Choose a consumer type from the list." };
  }
  if (!VALID_SENSITIVITY.includes(merged.dataSensitivity)) {
    return { error: "Choose a data sensitivity level of low, medium or high." };
  }
  if (!VALID_ROTATION.includes(merged.rotation)) {
    return { error: "Choose a rotation plan of automated, manual or none." };
  }
  for (const flag of ["actsOnBehalfOfUsers", "canStoreSecret", "interactiveBrowser", "needScopes", "needPerUserRevocation"]) {
    if (typeof merged[flag] !== "boolean") {
      return { error: "Every yes/no requirement must be answered before a recommendation can be made." };
    }
  }

  // Pass 1 — gates.
  const firedGates = GATES.filter((gate) => gate.applies(merged));
  const ruledOut = new Map();
  for (const gate of firedGates) {
    for (const id of gate.rulesOut) {
      if (!ruledOut.has(id)) ruledOut.set(id, gate.reason);
    }
  }

  // Pass 2 — weighted rubric.
  const criteria = CRITERIA.map((criterion) => ({
    id: criterion.id,
    label: criterion.label,
    weight: criterion.weight(merged),
    scores: criterion.scores(merged),
    note: criterion.note(merged),
  }));

  const maxScore = criteria.reduce((sum, c) => sum + c.weight * MAX_CRITERION_SCORE, 0);
  if (maxScore <= 0) return { error: "The rubric has no weighted criteria to score against." };

  const ranked = OPTIONS.map((option) => {
    let score = 0;
    const breakdown = criteria.map((criterion) => {
      const raw = criterion.scores[option.id] ?? 0;
      const weighted = raw * criterion.weight;
      score += weighted;
      return { id: criterion.id, label: criterion.label, raw, weight: criterion.weight, weighted };
    });
    return {
      ...option,
      score,
      percent: Math.round((score / maxScore) * 100),
      viable: !ruledOut.has(option.id),
      ruledOutReason: ruledOut.get(option.id) ?? null,
      breakdown,
    };
  });

  // Highest score wins. Ties go to the earlier entry in OPTIONS, which is ordered
  // simplest-first, so a tie resolves toward the mechanism that costs least to run.
  const ordered = [...ranked].sort((a, b) => {
    if (a.viable !== b.viable) return a.viable ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return OPTION_IDS.indexOf(a.id) - OPTION_IDS.indexOf(b.id);
  });

  const viableCount = ordered.filter((option) => option.viable).length;
  const recommendation = ordered[0];
  const runnerUp = ordered.find((option) => option.id !== recommendation.id && option.viable) ?? null;

  let warning = null;
  if (viableCount === 0) {
    warning =
      "Every mechanism was ruled out. A client that cannot keep a secret and has no end user to authenticate has nothing to prove — put the call behind your own backend and let that backend hold the credential.";
  } else if (recommendation.id === "api-key" && merged.dataSensitivity === "high") {
    warning =
      "A static key over highly sensitive data is only defensible with automated rotation, per-key scoping and alerting on unusual use.";
  }

  return {
    input: merged,
    recommendation,
    runnerUp,
    ranked: ordered,
    criteria,
    gates: firedGates.map((gate) => ({ id: gate.id, reason: gate.reason, rulesOut: gate.rulesOut })),
    maxScore,
    viableCount,
    warning,
  };
}

/** Plain-text summary of a result, for the copy button. */
export function formatDecision(result) {
  if (!result || result.error) return "";
  const lines = [
    "API Key vs OAuth Decision Helper",
    `Recommended: ${result.recommendation.name} (${result.recommendation.spec}) — ${result.recommendation.percent}% fit`,
  ];
  if (result.runnerUp) {
    lines.push(`Runner-up: ${result.runnerUp.name} — ${result.runnerUp.percent}% fit`);
  }
  lines.push("", "Ruled out:");
  const out = result.ranked.filter((option) => !option.viable);
  if (out.length === 0) lines.push("  (nothing ruled out)");
  for (const option of out) lines.push(`  ${option.name}: ${option.ruledOutReason}`);
  lines.push("", "Implementation notes:");
  for (const note of result.recommendation.implementation) lines.push(`  - ${note}`);
  if (result.warning) lines.push("", `Warning: ${result.warning}`);
  return lines.join("\n");
}
