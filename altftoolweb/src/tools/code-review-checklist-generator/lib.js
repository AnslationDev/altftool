/**
 * Checklist content is drawn from published review practice:
 *  - The core sections (design, functionality, complexity, tests, naming,
 *    comments, documentation) mirror Google's "Code Review Developer Guide —
 *    What to look for in a code review".
 *  - Security items follow the OWASP Code Review Guide v2 focus areas
 *    (input validation, authentication, authorization, session management,
 *    secrets, injection).
 *  - The "review under ~400 changed lines" advice comes from the widely cited
 *    SmartBear / Cisco study of 2,500 reviews (defect discovery drops sharply
 *    beyond 400 LOC per session).
 */

export const LANGUAGES = [
  { key: "typescript", label: "TypeScript / JavaScript" },
  { key: "python", label: "Python" },
  { key: "go", label: "Go" },
  { key: "java", label: "Java / Kotlin" },
  { key: "csharp", label: "C#" },
  { key: "ruby", label: "Ruby" },
  { key: "sql", label: "SQL / database" },
  { key: "generic", label: "Any language" },
];

export const CHANGE_TYPES = [
  { key: "feature", label: "New feature" },
  { key: "bugfix", label: "Bug fix" },
  { key: "refactor", label: "Refactor" },
  { key: "hotfix", label: "Hotfix / incident patch" },
  { key: "dependency", label: "Dependency upgrade" },
  { key: "config", label: "Config / infrastructure" },
];

export const RISK_LEVELS = [
  { key: "low", label: "Low — internal tool, easy rollback" },
  { key: "medium", label: "Medium — user-facing, standard release" },
  { key: "high", label: "High — money, auth, data or compliance" },
];

export const FOCUS_AREAS = [
  { key: "security", label: "Touches auth, secrets or user input" },
  { key: "database", label: "Touches database schema or queries" },
  { key: "api", label: "Changes a public API contract" },
  { key: "ui", label: "Changes user interface" },
  { key: "performance", label: "Performance-sensitive path" },
  { key: "concurrency", label: "Concurrency / async code" },
];

/** Google review guide: recommended maximum lines per review session. */
export const RECOMMENDED_MAX_REVIEW_LINES = 400;

/** Core sections adapted from Google's Code Review Developer Guide. */
const CORE_SECTIONS = [
  {
    title: "Design",
    items: [
      "The change belongs where it was made — right layer, right module, no new circular dependencies.",
      "The approach is the simplest one that solves the stated problem; no speculative generality.",
      "New code reuses existing helpers instead of duplicating logic that already exists.",
    ],
  },
  {
    title: "Functionality",
    items: [
      "The code does what the pull-request description says it does.",
      "Edge cases are handled: empty input, zero, negative numbers, missing fields, duplicate submits.",
      "Failure paths are exercised mentally: what happens when the network call, file read or parse fails?",
    ],
  },
  {
    title: "Complexity and readability",
    items: [
      "A future reader can understand each function without scrolling elsewhere.",
      "Names say what things are; no misleading or single-letter names outside tiny scopes.",
      "Comments explain why, not what; dead and commented-out code is removed.",
    ],
  },
  {
    title: "Tests",
    items: [
      "New behaviour has tests that fail if the behaviour regresses.",
      "Tests assert observable behaviour, not implementation details.",
      "No test depends on execution order, wall-clock time or live network access.",
    ],
  },
  {
    title: "Documentation",
    items: [
      "Public functions, endpoints or flags that changed have updated docs or docstrings.",
      "The pull-request description explains what changed, why, and how it was verified.",
    ],
  },
];

/** Language-specific pitfalls worth a dedicated glance. */
const LANGUAGE_ITEMS = {
  typescript: [
    "No new `any` or `@ts-ignore` without a comment justifying it.",
    "Promises are awaited or returned — no floating promises.",
    "Null and undefined are narrowed before use; optional chaining is not hiding a logic error.",
  ],
  python: [
    "No mutable default arguments (`def f(x, acc=[])`).",
    "Exceptions caught are specific — no bare `except:`.",
    "Type hints on changed public signatures still match what the code returns.",
  ],
  go: [
    "Every returned error is handled or explicitly ignored with a reason.",
    "Errors are wrapped with `%w` so the chain survives for `errors.Is/As`.",
    "No goroutine is started without a clear owner that stops it.",
  ],
  java: [
    "No swallowed exceptions — every catch logs with context or rethrows.",
    "Resources (streams, connections) are closed via try-with-resources.",
    "Equals/hashCode stay consistent if fields changed on a value class.",
  ],
  csharp: [
    "Async methods are awaited — no `async void` outside event handlers.",
    "`IDisposable` instances are wrapped in `using`.",
    "`ConfigureAwait` / cancellation tokens are used consistently with the codebase.",
  ],
  ruby: [
    "No rescue of `Exception` — rescue `StandardError` or narrower.",
    "Metaprogramming additions are justified; grep-ability is preserved.",
    "N+1 queries checked on any new ActiveRecord association access.",
  ],
  sql: [
    "New queries use bound parameters — no string-built SQL.",
    "Indexes exist for the new query's filter and join columns.",
    "Migrations are backward-compatible with the currently deployed code.",
  ],
  generic: [],
};

/** OWASP Code Review Guide focus areas. */
const AREA_ITEMS = {
  security: {
    title: "Security (OWASP)",
    items: [
      "All external input is validated or encoded before use — no injection path (SQL, command, HTML).",
      "Authorization is checked on the server for every new endpoint or action, not only in the UI.",
      "No secrets, tokens or credentials appear in code, config defaults or logs.",
      "Sensitive data is not written to logs or error messages returned to clients.",
    ],
  },
  database: {
    title: "Database",
    items: [
      "Schema migrations run safely on a live database (no long table locks on big tables).",
      "Rollback path exists: the migration is reversible or explicitly documented as not.",
      "Queries on new columns are covered by an index or an explain plan was checked.",
    ],
  },
  api: {
    title: "API contract",
    items: [
      "The change is backward-compatible, or the version is bumped and consumers are notified.",
      "Error responses keep their documented shape and status codes.",
      "New fields are optional for existing clients; removed fields went through deprecation.",
    ],
  },
  ui: {
    title: "User interface",
    items: [
      "Interactive elements are keyboard-reachable and labelled for screen readers (WCAG 2.1 AA).",
      "Loading, empty and error states are designed, not accidental.",
      "Layout was checked at mobile width and with longer translated strings.",
    ],
  },
  performance: {
    title: "Performance",
    items: [
      "No new work inside hot loops that could run per-request or per-render.",
      "Caching or pagination is used where the data set is unbounded.",
      "A measurement (profile, benchmark or query plan) backs any performance claim.",
    ],
  },
  concurrency: {
    title: "Concurrency",
    items: [
      "Shared mutable state is protected or eliminated; no check-then-act races.",
      "Timeouts and cancellation exist on every blocking or long-running call.",
      "Locks are acquired in a consistent order; no lock is held across I/O.",
    ],
  },
};

/** Items added per change type. */
const CHANGE_TYPE_ITEMS = {
  feature: [
    "The feature is behind a flag or safe default if it is not ready for all users.",
    "Analytics or logging exist to tell whether the feature works in production.",
  ],
  bugfix: [
    "A test reproduces the original bug and fails without this fix.",
    "The root cause is fixed, not just the symptom; similar call sites were checked.",
  ],
  refactor: [
    "Behaviour is unchanged — the diff contains no functional edits mixed in.",
    "Test coverage existed before the refactor, or characterization tests were added first.",
  ],
  hotfix: [
    "The change is the minimum needed to stop the incident; cleanup is ticketed separately.",
    "The fix was verified against the actual failing case from the incident.",
    "A follow-up task exists for the proper fix and post-incident review.",
  ],
  dependency: [
    "The changelog between the old and new version was read, including breaking changes.",
    "The lockfile diff contains only expected transitive updates.",
    "License of the new version is still acceptable for this codebase.",
  ],
  config: [
    "The change was applied to all environments that need it, in the right order.",
    "A wrong value fails safe — the rollback is documented and quick.",
    "Secrets stay in the secret store, not in the config file.",
  ],
};

/** Extra scrutiny items switched on by risk level. */
const RISK_ITEMS = {
  low: [],
  medium: [
    "Rollback plan is known: revert commit, flag off, or redeploy previous version.",
    "Monitoring or alerts will catch it if this change misbehaves in production.",
  ],
  high: [
    "A second reviewer with domain context has approved.",
    "Rollback was actually tested, not just described.",
    "Data migrations or money-moving paths were verified against production-like data.",
    "Audit logging captures who did what for the changed sensitive actions.",
  ],
};

const clean = (value) => String(value == null ? "" : value).trim();

/**
 * Build the checklist.
 *
 * @param {object} input
 * @param {string} input.language    One of LANGUAGES keys.
 * @param {string} input.changeType  One of CHANGE_TYPES keys.
 * @param {string} input.riskLevel   One of RISK_LEVELS keys.
 * @param {string[]} [input.areas]   Subset of FOCUS_AREAS keys.
 * @param {string} [input.title]     Optional heading for the markdown output.
 * @returns {{ sections: Array<{title: string, items: string[]}>, itemCount: number, markdown: string } | { error: string }}
 */
export function generateChecklist({
  language = "generic",
  changeType = "feature",
  riskLevel = "medium",
  areas = [],
  title = "",
} = {}) {
  if (!LANGUAGES.some((item) => item.key === language)) {
    return { error: "Pick a language from the list." };
  }
  const change = CHANGE_TYPES.find((item) => item.key === changeType);
  if (!change) return { error: "Pick a change type from the list." };
  const risk = RISK_LEVELS.find((item) => item.key === riskLevel);
  if (!risk) return { error: "Pick a risk level from the list." };
  const chosenAreas = Array.isArray(areas)
    ? areas.filter((key) => Object.prototype.hasOwnProperty.call(AREA_ITEMS, key))
    : [];

  const sections = CORE_SECTIONS.map((section) => ({
    title: section.title,
    items: [...section.items],
  }));

  const languageItems = LANGUAGE_ITEMS[language] || [];
  if (languageItems.length > 0) {
    const label = LANGUAGES.find((item) => item.key === language).label;
    sections.push({ title: `${label} specifics`, items: [...languageItems] });
  }

  const changeItems = CHANGE_TYPE_ITEMS[changeType] || [];
  if (changeItems.length > 0) {
    sections.push({ title: `${change.label} checks`, items: [...changeItems] });
  }

  for (const key of chosenAreas) {
    const area = AREA_ITEMS[key];
    sections.push({ title: area.title, items: [...area.items] });
  }

  const riskItems = RISK_ITEMS[riskLevel] || [];
  if (riskItems.length > 0) {
    sections.push({ title: "Release safety", items: [...riskItems] });
  }

  const itemCount = sections.reduce((sum, section) => sum + section.items.length, 0);

  const heading = clean(title) || "Code review checklist";
  const lines = [
    `## ${heading}`,
    "",
    `_${change.label} · ${risk.label.split(" — ")[0]} risk. Aim to review under ${RECOMMENDED_MAX_REVIEW_LINES} changed lines per session._`,
    "",
  ];
  for (const section of sections) {
    lines.push(`### ${section.title}`, "");
    for (const item of section.items) lines.push(`- [ ] ${item}`);
    lines.push("");
  }

  return {
    sections,
    itemCount,
    sectionCount: sections.length,
    markdown: `${lines.join("\n").trim()}\n`,
    changeLabel: change.label,
    riskLabel: risk.label,
  };
}
