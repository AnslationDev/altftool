/**
 * Code Review Prompt Builder.
 *
 * Assembles a review prompt from focus-specific checklists (correctness,
 * security, performance, style, maintainability), a severity scheme, and a
 * review-size check based on the widely cited finding that defect-discovery
 * effectiveness drops sharply on changes larger than about 400 lines.
 */

/**
 * SmartBear's study of Cisco code reviews ("Best Kept Secrets of Peer Code
 * Review") found defect density detected per line falls off sharply above
 * roughly 400 lines of code per review, and recommends reviewing at no more
 * than about 500 LOC/hour; 300 LOC/hour is the often-quoted careful pace.
 */
export const MAX_EFFECTIVE_REVIEW_LOC = 400;
export const CAREFUL_REVIEW_LOC_PER_HOUR = 300;

/** Bounds that keep the estimate meaningful. */
export const LIMITS = { loc: { min: 1, max: 100000 } };

/**
 * Focus areas. The security checklist items map to OWASP Top 10 (2021)
 * categories; correctness items are the classic defect classes from
 * inspection literature (boundary, null, error path, resource, concurrency).
 */
export const FOCUS_AREAS = [
  {
    id: "correctness",
    label: "Correctness",
    checklist: [
      "Off-by-one and boundary conditions on every loop, slice and comparison",
      "Null / undefined / empty-collection handling on every input and return",
      "Error paths: what happens when each call that can fail actually fails",
      "Resource lifecycle: every open/acquire has a close/release on all paths, including exceptions",
      "Concurrency: shared state mutated without synchronisation, await/async ordering",
    ],
  },
  {
    id: "security",
    label: "Security",
    checklist: [
      "Injection: any string concatenated into SQL, shell, HTML or eval (OWASP A03:2021)",
      "Broken access control: authorisation checked on every path, not just the happy one (OWASP A01:2021)",
      "Cryptographic failures: secrets in code, weak hashing, home-made crypto (OWASP A02:2021)",
      "Insecure design: trust boundaries crossed without validation (OWASP A04:2021)",
      "Vulnerable dependencies and outdated components introduced by this change (OWASP A06:2021)",
      "Logging of secrets or personal data, and missing logging of security events (OWASP A09:2021)",
    ],
  },
  {
    id: "performance",
    label: "Performance",
    checklist: [
      "Algorithmic complexity: nested loops or repeated lookups that grow worse than O(n log n) on realistic input",
      "N+1 patterns: a query, RPC or file read inside a loop",
      "Unnecessary allocation or copying in hot paths",
      "Missing caching or memoisation where the same expensive result is recomputed",
      "Blocking calls on latency-sensitive paths (sync IO on a request thread / event loop)",
    ],
  },
  {
    id: "style",
    label: "Style & readability",
    checklist: [
      "Names that say what a thing is for, not how it is stored",
      "Functions doing one job; flag any that need a scroll to read",
      "Dead code, commented-out code and unused imports",
      "Consistency with the surrounding file's conventions over personal preference",
      "Comments that explain why, not what; outdated comments that now lie",
    ],
  },
  {
    id: "maintainability",
    label: "Maintainability & tests",
    checklist: [
      "Duplication introduced that a small extraction would remove",
      "Public API changes: are they backward compatible, and are breaking changes flagged",
      "Test coverage of the changed behaviour, including at least one failure-path test",
      "Hidden coupling: reaching into another module's internals",
      "Magic numbers and strings that deserve named constants",
    ],
  },
];

/** A conventional four-level severity scheme used by most review tooling. */
export const SEVERITY_LEVELS = [
  ["blocker", "must be fixed before merge — bug, vulnerability or data loss"],
  ["major", "should be fixed before merge — likely defect or significant debt"],
  ["minor", "worth fixing — small defect or clear improvement"],
  ["nit", "style preference — author may ignore"],
];

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

/**
 * Review-size assessment: chunks needed at 400 LOC per effective review and
 * careful-review minutes at 300 LOC/hour.
 * @returns {{error:string}|{loc:number, chunks:number, minutes:number, oversized:boolean}}
 */
export function assessReviewSize({ loc } = {}) {
  const lines = toInt(loc);
  if (Number.isNaN(lines)) return { error: "Enter the size of the change in lines of code." };
  if (lines < LIMITS.loc.min) return { error: "The change must be at least 1 line." };
  if (lines > LIMITS.loc.max) {
    return { error: `Above ${LIMITS.loc.max.toLocaleString("en-US")} LOC this is a migration, not a review — split it first.` };
  }
  const chunks = Math.ceil(lines / MAX_EFFECTIVE_REVIEW_LOC);
  const minutes = Math.round((lines / CAREFUL_REVIEW_LOC_PER_HOUR) * 60);
  return { loc: lines, chunks, minutes, oversized: lines > MAX_EFFECTIVE_REVIEW_LOC };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the review prompt from the selected focus areas.
 * @returns {{error:string}|{text:string, size:object}}
 */
export function buildReviewPrompt({ language, focusIds, context, code, size } = {}) {
  if (!size || size.error) return { error: size?.error || "Enter a valid change size first." };
  const lang = typeof language === "string" && language.trim() ? language.trim() : "";
  if (!lang) return { error: "Enter the language or stack under review." };
  const ids = Array.isArray(focusIds) ? focusIds : [];
  const areas = FOCUS_AREAS.filter((area) => ids.includes(area.id));
  if (areas.length === 0) return { error: "Select at least one review focus." };
  const contextText = typeof context === "string" ? context.trim() : "";
  const codeText = typeof code === "string" ? code.trim() : "";

  const lines = [
    `Review the following ${lang} change as a senior engineer. Report findings only — do not rewrite the code wholesale.`,
    "",
    `CHANGE SIZE: about ${size.loc.toLocaleString("en-US")} lines.`,
  ];
  if (size.oversized) {
    lines.push(
      `This exceeds the ~${MAX_EFFECTIVE_REVIEW_LOC}-LOC effective review limit — review it in ${size.chunks} passes and say at the top which portion each pass covered.`,
    );
  }
  if (contextText) lines.push("", `CONTEXT: ${contextText}`);
  lines.push("", "REVIEW FOR, in priority order:");
  for (const area of areas) {
    lines.push(`${area.label.toUpperCase()}:`);
    for (const item of area.checklist) lines.push(`- ${item}`);
  }
  lines.push(
    "",
    "SEVERITY — label every finding with exactly one:",
    ...SEVERITY_LEVELS.map(([name, meaning]) => `- ${name}: ${meaning}`),
    "",
    "FOR EVERY FINDING GIVE:",
    "1. Severity, file and line (or the quoted snippet if lines are not numbered).",
    "2. What is wrong, in one sentence.",
    "3. A concrete failure scenario: the input or state that triggers it and what goes wrong.",
    "4. The minimal fix, as a short diff or one-line description.",
    "",
    "RULES:",
    "- Verify each finding against the code before reporting it; do not report speculative issues you cannot point to a line for.",
    "- If a checklist area has no findings, say so in one line rather than inventing filler.",
    "- End with a verdict: approve, approve-with-nits, or request-changes, plus the single most important fix.",
  );
  if (codeText) {
    lines.push("", "CODE UNDER REVIEW:", "```", codeText, "```");
  } else {
    lines.push("", "CODE UNDER REVIEW: (paste the diff or files below this prompt)");
  }

  const text = lines.join("\n");
  return { text, size, areas: areas.map((area) => area.label), ...measureText(text) };
}
