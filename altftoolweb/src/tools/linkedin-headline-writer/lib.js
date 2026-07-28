/**
 * LinkedIn headline writer.
 *
 * Builds headline variants from six patterns and measures each against the two
 * constraints that decide whether a headline works: the field's character limit,
 * and how much of it survives truncation in feed and search listings.
 *
 * Pure module — no React, no DOM, no network.
 */

/** LinkedIn's headline field accepts up to 220 characters. */
export const HEADLINE_MAX_CHARS = 220;

/**
 * Feed comments, search results and connection requests show only the opening
 * of a headline before an ellipsis. The exact cut varies by surface and screen;
 * 70 characters is a safe planning figure for the visible portion.
 */
export const PREVIEW_CHARS = 70;

/** Below this the headline is just a job title and wastes the field. */
export const MIN_USEFUL_CHARS = 40;

export const SEPARATORS = [
  { id: "pipe", label: "Pipe |", value: " | " },
  { id: "dot", label: "Middot ·", value: " · " },
  { id: "dash", label: "En dash –", value: " – " },
];

export const FORMULAS = [
  {
    id: "role-value-proof",
    label: "Role → value → proof",
    note: "The default. Recruiters search the role, humans read the value, the proof earns the click.",
    build: ({ role, outcome, proof }) => [role, outcome, proof],
  },
  {
    id: "i-help",
    label: "Helping [audience]: [outcome]",
    note: "Best for consultants and freelancers who sell an outcome rather than a title.",
    build: ({ role, audience, outcome, proof }) => [
      audience && outcome ? `Helping ${audience}: ${lowerFirst(outcome)}` : role,
      role,
      proof,
    ],
  },
  {
    id: "outcome-first",
    label: "Outcome first",
    note: "Leads with the number, so the visible portion in search carries the result.",
    build: ({ role, outcome, proof }) => [outcome, role, proof],
  },
  {
    id: "keyword-stack",
    label: "Keyword stack",
    note: "Front-loads the terms recruiters actually type into LinkedIn search.",
    build: ({ role, keywords, outcome }) => [
      [role, ...keywords.slice(0, 3)].filter(Boolean).join(" · "),
      outcome,
    ],
  },
  {
    id: "open-to",
    label: "Open to work",
    note: "For an active search: says the target role and the evidence, not just 'seeking opportunities'.",
    build: ({ role, seeking, keywords, proof }) => [
      seeking ? `${role} seeking ${seeking}` : role,
      keywords.slice(0, 3).join(", "),
      proof,
    ],
  },
  {
    id: "available",
    label: "Freelance / available",
    note: "For contractors: role, who it is for, and when you are next free.",
    build: ({ role, audience, proof, availability }) => [
      audience ? `${role} for ${audience}` : role,
      proof,
      availability,
    ],
  },
];

function lowerFirst(text) {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : "";
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function splitKeywords(raw, limit = 8) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[,\n;|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

/** What a viewer sees before the headline is cut off in a listing. */
export function previewOf(text, limit = PREVIEW_CHARS) {
  if (typeof text !== "string") return "";
  return text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}…`;
}

/** True when the text contains a digit — a number is the cheapest proof available. */
export function hasNumber(text) {
  return typeof text === "string" && /\d/.test(text);
}

/**
 * Score one headline: 0-5, one point each for fitting the limit, using enough of
 * it, carrying a number, keeping the role inside the visible preview, and
 * containing at least one search keyword.
 */
export function scoreHeadline(text, { role, keywords }) {
  const chars = text.length;
  const preview = text.slice(0, PREVIEW_CHARS).toLowerCase();
  const roleInPreview = Boolean(role) && preview.includes(role.toLowerCase().slice(0, 12));
  const keywordHit = keywords.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase()));

  const points = [
    { label: `Within ${HEADLINE_MAX_CHARS} characters`, ok: chars <= HEADLINE_MAX_CHARS },
    { label: `Uses at least ${MIN_USEFUL_CHARS} characters`, ok: chars >= MIN_USEFUL_CHARS },
    { label: "Contains a number", ok: hasNumber(text) },
    { label: `Role visible in the first ${PREVIEW_CHARS} characters`, ok: roleInPreview },
    { label: "Contains at least one search keyword", ok: keywordHit },
  ];

  return { points, score: points.filter((point) => point.ok).length, scoreMax: points.length };
}

/**
 * Generate every headline variant.
 * Returns { headlines, best, ... } or { error }.
 */
export function generateHeadlines(input = {}) {
  const role = clean(input.role);
  if (!role) return { error: "Add the role or title you want to be found for." };

  const outcome = clean(input.outcome);
  if (!outcome) {
    return { error: "Add the value you deliver — the middle of the headline is the part people read." };
  }

  const keywords = splitKeywords(input.keywords);
  const separator =
    SEPARATORS.find((item) => item.id === clean(input.separatorId))?.value || SEPARATORS[0].value;

  const parts = {
    role,
    outcome,
    proof: clean(input.proof),
    audience: clean(input.audience),
    seeking: clean(input.seeking),
    availability: clean(input.availability),
    keywords,
  };

  const headlines = FORMULAS.map((formula) => {
    const seen = new Set();
    const segments = formula
      .build(parts)
      .map((segment) => clean(segment))
      .filter(Boolean)
      // A missing optional field can make two slots collapse to the same text.
      .filter((segment) => {
        const key = segment.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    const text = segments.join(separator).slice(0, HEADLINE_MAX_CHARS * 2);
    const scored = scoreHeadline(text, { role, keywords });
    return {
      id: formula.id,
      label: formula.label,
      note: formula.note,
      text,
      chars: text.length,
      overLimit: text.length > HEADLINE_MAX_CHARS,
      remaining: HEADLINE_MAX_CHARS - text.length,
      preview: previewOf(text),
      truncated: text.length > PREVIEW_CHARS,
      ...scored,
    };
  })
    // Drop variants that collapsed to the bare role, and identical duplicates.
    .filter((headline) => headline.text.length > 0 && headline.text !== role)
    .filter((headline, index, all) => all.findIndex((other) => other.text === headline.text) === index);

  if (headlines.length === 0) {
    return { error: "Not enough input to build a headline — add a role and a value line." };
  }

  const best = headlines.reduce(
    (winner, item) =>
      item.score > winner.score || (item.score === winner.score && item.chars < winner.chars)
        ? item
        : winner,
    headlines[0],
  );

  return {
    headlines,
    best,
    keywords,
    averageChars: Math.round(
      headlines.reduce((sum, item) => sum + item.chars, 0) / headlines.length,
    ),
    anyOverLimit: headlines.some((item) => item.overLimit),
  };
}
