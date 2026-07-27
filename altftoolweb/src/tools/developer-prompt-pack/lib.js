/**
 * Developer Prompt Pack — prompt library + a pure template engine.
 *
 * No React, no JSX, no DOM. Every export is deterministic: same input -> same output.
 * Placeholders inside a template are written as {{snake_case}}.
 */

/**
 * Placeholder syntax. Kept as a source string so callers can build their own
 * stateful RegExp instances instead of sharing lastIndex with this one.
 */
export const PLACEHOLDER_SOURCE = "\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}";

/**
 * ~4 characters per token for English prose is the vendor-published rule of thumb
 * used by OpenAI's tokenizer documentation. It is an estimate for sizing a prompt
 * against a context window, never an exact billing figure.
 */
export const CHARS_PER_TOKEN = 4;

/**
 * Above this estimated size a prompt starts to crowd small context windows
 * (8K-token models leave roughly this much room once a long answer is reserved).
 */
export const LONG_PROMPT_TOKENS = 700;

export const CATEGORIES = [
  "Debugging",
  "Code Review",
  "Testing",
  "Documentation",
  "Design & Refactoring",
];

export const PROMPTS = [
  {
    id: "bug-hypotheses",
    title: "Debugging: ranked hypotheses from symptoms",
    category: "Debugging",
    goal: "Turn a vague bug report into ranked causes, each with a cheap test to confirm or kill it.",
    tags: ["debugging", "hypotheses", "root cause", "triage"],
    tip: "Include what you already ruled out — otherwise the first three suggestions are things you tried yesterday.",
    variables: [
      { key: "symptom", label: "Exact symptom", placeholder: "checkout returns 500 for ~2 percent of requests, spikes at the top of each hour" },
      { key: "stack", label: "Stack and versions", placeholder: "Node 20, Express, Postgres 15 on RDS, behind ALB" },
      { key: "started", label: "When it started and what changed", placeholder: "began Tuesday; deployed a cron for invoice PDFs on Monday" },
      { key: "ruled_out", label: "Already ruled out", placeholder: "not memory — heap stable; not a bad deploy — rolled back, still happens" },
    ],
    template: `Act as a senior engineer helping me debug. Do not guess a single cause — enumerate and rank.

Symptom, exactly: {{symptom}}
Stack: {{stack}}
When it started and what changed around then: {{started}}
Already ruled out: {{ruled_out}}

Give me the five most plausible causes ranked by (likelihood given the timing evidence) x (cheapness to test). For each: the mechanism in one sentence, the specific observation that would CONFIRM it, the observation that would ELIMINATE it, and the exact command, query or log filter to get that observation.

Respect my ruled-out list. Note which hypotheses the hourly spike pattern supports or kills. End with the single test that splits the hypothesis space closest to in half — that is what I run first.`,
  },
  {
    id: "error-explain",
    title: "Explain this error and stack trace",
    category: "Debugging",
    goal: "What the error actually means, the likely cause in YOUR code, and the fix.",
    tags: ["error", "stack trace", "exception", "explanation"],
    tip: "Paste the whole trace including the caused-by chain — the real error is usually at the bottom.",
    variables: [
      { key: "error_text", label: "Full error and stack trace", placeholder: "TypeError: Cannot read properties of undefined (reading 'map') at OrderList..." },
      { key: "code_context", label: "The code around the failing line", placeholder: "const items = await fetchOrders(); return items.map(...)" },
      { key: "when", label: "When it happens", placeholder: "only on first page load, gone after refresh" },
    ],
    template: `Explain this error precisely, then find the cause in my code.

Error and stack trace:
{{error_text}}

Code around the failing line:
{{code_context}}

When it happens: {{when}}

Answer in this order: (1) what this error literally means in the runtime, two sentences, no analogies; (2) the most likely cause given MY code and the timing pattern — point to the exact expression; (3) the fix, as a minimal diff, plus the defensive change that makes this class of error impossible here; (4) two other causes that produce this same error, and the one-line check that rules each out.

If the trace and my code snippet are inconsistent with each other, say so instead of harmonising them — mismatch usually means I am looking at the wrong build.`,
  },
  {
    id: "pr-review",
    title: "Review this diff like a senior engineer",
    category: "Code Review",
    goal: "A review that separates blocking defects from taste, with severity on every comment.",
    tags: ["code review", "pull request", "diff", "feedback"],
    tip: "State the PR's intent — reviewers who don't know the goal review the style instead.",
    variables: [
      { key: "intent", label: "What the PR is supposed to do", placeholder: "add retry with backoff to the webhook sender" },
      { key: "diff", label: "The diff (paste it)", placeholder: "diff --git a/src/webhooks.ts ..." },
      { key: "constraints", label: "House rules to enforce", placeholder: "no new dependencies; all IO must be cancellable; we use Result types not throws" },
    ],
    template: `Review this diff as a senior engineer. The bar is: would this defect page someone at 3am, or is it taste?

Intent of the change: {{intent}}
House rules to enforce: {{constraints}}

Diff:
{{diff}}

Report findings in three sections, each comment tagged with file/line: (1) BLOCKING — correctness, concurrency, error handling, security, data loss; state the failing scenario concretely, inputs to consequence; (2) SHOULD FIX — violations of my house rules, missing tests for the risky path, misleading names; (3) NITS — free to ignore, one line each.

Then answer: does the diff actually accomplish the stated intent, and what case is untested that the intent implies? Do not pad sections — an empty BLOCKING section is a valid and useful answer. No rewrites of working code for style.`,
  },
  {
    id: "security-pass",
    title: "Security pass over one endpoint or function",
    category: "Code Review",
    goal: "A focused check against the vulnerability classes that actually apply to this code.",
    tags: ["security", "owasp", "injection", "authz", "review"],
    tip: "Say where untrusted input enters — the whole review hangs off the trust boundary.",
    variables: [
      { key: "code", label: "The code (paste it)", placeholder: "app.post('/api/orders/:id/refund', async (req, res) => { ... })" },
      { key: "trust_boundary", label: "Where untrusted input enters", placeholder: "req.params.id and req.body from logged-in users; admin check is upstream middleware" },
      { key: "sensitive", label: "What is at stake", placeholder: "can trigger real refunds via Stripe; order ownership matters" },
    ],
    template: `Do a security review of this code. Work from the trust boundary, not a generic checklist.

Code:
{{code}}

Untrusted input enters at: {{trust_boundary}}
What is at stake: {{sensitive}}

Check, in order of relevance to THIS code: authorization (can user A act on user B's resource — trace the ownership check or its absence), input validation at the boundary, injection into any interpreter the code touches (SQL, shell, template, header), unsafe deserialization, race conditions on the sensitive operation (double-refund on concurrent requests), information leaked in errors, and missing rate limiting on an abusable action.

For each finding: the concrete attack as a request an attacker would actually send, the impact, and the minimal fix. Rank by exploitability x impact. Say explicitly which classes you checked and found clean — silence is not clearance. This is a first pass, not a substitute for a real audit.`,
  },
  {
    id: "test-plan",
    title: "Test cases for a function or endpoint",
    category: "Testing",
    goal: "A test list that covers boundaries, error paths and the case that will actually break in prod.",
    tags: ["testing", "unit tests", "edge cases", "coverage"],
    tip: "Give the real signature and types — half of all good edge cases fall out of the types alone.",
    variables: [
      { key: "code_or_signature", label: "Function code or signature", placeholder: "function splitPayment(totalCents: number, shares: number[]): number[]" },
      { key: "behavior", label: "Intended behaviour", placeholder: "split proportionally; remainders distributed largest-first; result must sum to total" },
      { key: "framework", label: "Test framework", placeholder: "vitest" },
    ],
    template: `Design the test suite for this code.

Code or signature:
{{code_or_signature}}

Intended behaviour: {{behavior}}
Framework: {{framework}}

First, list the test cases as a table BEFORE writing any code: name, input, expected output, and which risk it covers. Cover: the documented happy path, every boundary implied by the types (empty, zero, one element, negative, huge, non-integer where the type allows), the invariant stated in the behaviour (as a property, not one example), error inputs and what the contract says they do, and any floating-point or rounding trap the domain implies.

Mark the three cases most likely to catch a real regression. Then write the suite in {{framework}}, one assertion of intent per test, no shared mutable fixtures, test names that state the rule ("remainder goes to largest share first"). If my behaviour description is ambiguous anywhere, list the ambiguity as a question instead of picking silently.`,
  },
  {
    id: "failing-test-repro",
    title: "Minimal reproduction from a flaky failure",
    category: "Testing",
    goal: "Shrink a flaky or intermittent test failure into a deterministic reproduction.",
    tags: ["flaky", "repro", "intermittent", "race condition"],
    tip: "Paste the failure output from at least two different runs — the differences between them are the clue.",
    variables: [
      { key: "test_code", label: "The flaky test", placeholder: "it('sends welcome email after signup', async () => { ... })" },
      { key: "failures", label: "Failure output from 2+ runs", placeholder: "run 1: expected 1 email, got 0. run 2: timeout at 5000ms. passes locally always" },
      { key: "environment", label: "Where it fails vs passes", placeholder: "fails ~1 in 8 on CI (2 vCPU), never locally (M3)" },
    ],
    template: `Help me turn a flaky test into a deterministic reproduction.

The test:
{{test_code}}

Failure output from multiple runs:
{{failures}}

Where it fails vs passes: {{environment}}

Diagnose: (1) classify the flake — unawaited async, ordering assumption, shared state between tests, time/timer dependence, resource exhaustion, or genuine race in the code under test — and say which the differing failure outputs point to; (2) explain why the environment difference (CPU count, speed) changes the failure rate for that class; (3) give me the modification that makes it fail EVERY time locally — inserted delay, forced scheduling, seeded clock, single-threaded pool — the failure I can hold still; (4) then the real fix, and why it removes the class of flake rather than papering over this instance.

Never suggest increasing the timeout or adding a retry as the fix — those are how flakes become permanent residents.`,
  },
  {
    id: "readme-writer",
    title: "README for a repo or internal package",
    category: "Documentation",
    goal: "A README ordered by what a new user needs, with runnable examples first.",
    tags: ["readme", "docs", "onboarding", "getting started"],
    tip: "Paste real commands you ran today — invented install steps are the most common README lie.",
    variables: [
      { key: "project", label: "What the project is", placeholder: "internal npm package wrapping our feature-flag service" },
      { key: "audience", label: "Who reads this", placeholder: "product engineers at our company, first exposure" },
      { key: "commands", label: "Real commands that work today", placeholder: "npm i @acme/flags; flags.isOn('checkout-v2', { userId })" },
      { key: "gotchas", label: "Known gotchas", placeholder: "needs FLAGS_ENV set; stale cache up to 30s; no SSR support yet" },
    ],
    template: `Write a README for: {{project}}

Reader: {{audience}}
Commands and snippets that genuinely work today: {{commands}}
Known gotchas: {{gotchas}}

Order: one-sentence purpose (what it does, not what it "empowers"), a 60-second quickstart using ONLY the commands I supplied, the three most common tasks as copy-paste examples with expected output, configuration as a table (name, required, default, effect), the gotchas section stated plainly under its own heading, and where to get help.

Rules: no badges wall, no feature adjectives, every code block runnable as-is, and if a section would need information I did not give you, insert TODO(owner) rather than inventing plausible commands. Add the one-paragraph "how it works" only at the end — newcomers need usage before architecture.`,
  },
  {
    id: "adr-writer",
    title: "Architecture decision record",
    category: "Documentation",
    goal: "An ADR that records the options you rejected and why, not just the winner.",
    tags: ["adr", "architecture", "decision", "record"],
    tip: "The rejected options are the document's value — future-you needs to know why not, not just what.",
    variables: [
      { key: "decision", label: "The decision made", placeholder: "move image processing from request path to a queue with S3 handoff" },
      { key: "context", label: "Forces that drove it", placeholder: "uploads time out at 30s on the ALB; p95 processing is 22s and growing" },
      { key: "options", label: "Options considered", placeholder: "1) raise timeout 2) process async via SQS 3) offload to Lambda 4) third-party API" },
      { key: "tradeoffs", label: "Accepted downsides", placeholder: "eventual consistency in the UI; new infra to operate; retry semantics to design" },
    ],
    template: `Write an architecture decision record.

Decision: {{decision}}
Context and forces: {{context}}
Options considered: {{options}}
Downsides we accept: {{tradeoffs}}

Format: Title (imperative), Status, Context (the forces as facts with numbers, no advocacy), Decision (one paragraph, active voice), then Options Considered — for EACH rejected option: what it was, its genuine advantages, and the specific reason it lost, so a future reader can tell whether that reason still holds. Then Consequences, split into positive, negative (from my accepted downsides, stated without spin), and neutral/follow-ups. End with "Revisit when" — the measurable conditions under which this decision should be re-opened.

Keep it under 600 words. No marketing language about the chosen option; the record must read the same whether the decision aged well or badly.`,
  },
  {
    id: "refactor-plan",
    title: "Incremental refactor plan (no big bang)",
    category: "Design & Refactoring",
    goal: "A sequence of safe, shippable steps from current mess to target shape.",
    tags: ["refactoring", "incremental", "strangler", "migration"],
    tip: "State what must keep working — the plan is shaped by what cannot break, not by the target design.",
    variables: [
      { key: "current", label: "Current state", placeholder: "one 3,000-line OrderService doing pricing, tax, inventory and email" },
      { key: "target", label: "Target shape", placeholder: "separate pricing and tax modules with typed interfaces; email via events" },
      { key: "invariants", label: "What must keep working throughout", placeholder: "checkout cannot go down; tax totals must not change by a cent" },
      { key: "budget", label: "Time budget per step", placeholder: "no step larger than one day, shippable behind a flag" },
    ],
    template: `Plan an incremental refactor. Big-bang rewrites are off the table.

Current state: {{current}}
Target shape: {{target}}
Invariants that must hold at every step: {{invariants}}
Step budget: {{budget}}

Produce an ordered list of steps where each one: fits the budget, leaves the system releasable, and is individually revertible. For each step: what moves, the seam or technique used (extract-and-delegate, parallel implementation with comparison, strangler route, characterization tests first), how the invariant is verified before merging (name the actual check — diff of computed totals, shadow traffic, golden tests), and what becomes deletable afterwards.

Front-load the step that buys the most safety for later steps. Mark the point of no return, if any, and the earliest step at which we get real benefit even if the refactor pauses forever there — that is the plan's true measure.`,
  },
  {
    id: "api-design-review",
    title: "API design review before you build it",
    category: "Design & Refactoring",
    goal: "Pressure-test an endpoint or interface design against the errors that are expensive to fix later.",
    tags: ["api design", "rest", "interface", "contracts"],
    tip: "Include a real example request and response — reviews of abstract descriptions miss the concrete traps.",
    variables: [
      { key: "api", label: "Proposed API (paths, verbs, payloads)", placeholder: "POST /v1/transfers {from, to, amountCents, idempotencyKey} -> 201 {id, status}" },
      { key: "consumers", label: "Who calls it", placeholder: "our mobile app now; partner integrations within a year" },
      { key: "operations", label: "Operations semantics", placeholder: "transfers are async; status polls until settled or failed" },
    ],
    template: `Review this API design before any code exists. Focus on the mistakes that are expensive to fix after consumers exist.

Proposed API:
{{api}}

Consumers, now and later: {{consumers}}
Semantics: {{operations}}

Evaluate: idempotency and retry safety for every mutating call (what exactly happens on a repeated request); error shape — can a client distinguish retryable from permanent from your-fault without string matching; pagination and ordering guarantees before the collection grows; evolution — where will version 2 fields go, and what breaks the partner who deserializes strictly; async semantics — how a poller distinguishes in-progress, succeeded, failed and never-existed; naming consistency with itself; and what the API forces the client to store.

For each issue: the future consumer bug it causes, and the change that avoids it. Then write the two example flows — happy path and a retry-after-timeout — as literal request/response pairs, because that is where hidden ambiguity shows up.`,
  },
];

/** Every distinct {{placeholder}} in a template, in first-appearance order. */
export function extractVariables(template) {
  if (typeof template !== "string" || template === "") return [];
  const pattern = new RegExp(PLACEHOLDER_SOURCE, "g");
  const found = [];
  const seen = new Set();
  let match = pattern.exec(template);
  while (match !== null) {
    const key = match[1];
    if (!seen.has(key)) {
      seen.add(key);
      found.push(key);
    }
    match = pattern.exec(template);
  }
  return found;
}

/** Rough size estimate only — see CHARS_PER_TOKEN. Never negative, never NaN. */
export function estimateTokens(text) {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

export function getPrompt(id) {
  return PROMPTS.find((prompt) => prompt.id === id) || null;
}

/** Case-insensitive AND search across title, goal, category and tags. */
export function searchPrompts({ query = "", category = "All" } = {}) {
  const terms = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return PROMPTS.filter((prompt) => {
    if (category && category !== "All" && prompt.category !== category) return false;
    if (terms.length === 0) return true;
    const haystack = `${prompt.title} ${prompt.goal} ${prompt.category} ${prompt.tags.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

/**
 * Substitute values into a template.
 * Blank or missing values keep their {{placeholder}} visible and are reported
 * in `missing` so nothing silently disappears from the copied prompt.
 */
export function fillPrompt({ template, values } = {}) {
  if (typeof template !== "string" || template.trim() === "") {
    return { error: "Choose a prompt first — there is no template to fill in." };
  }
  if (values !== undefined && (values === null || typeof values !== "object")) {
    return { error: "Variable values must be given as an object of key/value pairs." };
  }

  const supplied = values || {};
  const variables = extractVariables(template);
  const missing = [];
  const pattern = new RegExp(PLACEHOLDER_SOURCE, "g");

  const text = template.replace(pattern, (_whole, key) => {
    const raw = supplied[key];
    const value = raw === undefined || raw === null ? "" : String(raw).trim();
    if (value === "") {
      if (!missing.includes(key)) missing.push(key);
      return `{{${key}}}`;
    }
    return value;
  });

  const estimatedTokens = estimateTokens(text);

  return {
    text,
    variables,
    missing,
    totalCount: variables.length,
    filledCount: variables.length - missing.length,
    characters: text.length,
    words: countWords(text),
    estimatedTokens,
    isLong: estimatedTokens > LONG_PROMPT_TOKENS,
  };
}
