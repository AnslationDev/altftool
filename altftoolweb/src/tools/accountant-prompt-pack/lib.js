/**
 * Accountant Prompt Pack — prompt library + a pure template engine.
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
  "Reconciliation & Close",
  "Analysis & Reporting",
  "Client Communication",
  "Process & Controls",
];

export const PROMPTS = [
  {
    id: "recon-differences",
    title: "Reconciliation difference triage",
    category: "Reconciliation & Close",
    goal: "A systematic checklist of where a reconciliation difference can hide, ordered for your case.",
    tags: ["reconciliation", "bank rec", "differences", "close"],
    tip: "Give the exact difference amount — divisibility by 9 or by 2 changes which causes are likely.",
    variables: [
      { key: "recon_type", label: "What is being reconciled", placeholder: "bank statement vs cash ledger, single operating account" },
      { key: "difference", label: "Exact difference", placeholder: "ledger higher by 4,806.00" },
      { key: "period", label: "Period and volume", placeholder: "June close, roughly 1,400 transactions" },
      { key: "checked", label: "Already checked", placeholder: "opening balances agree; deposits in transit listed and agreed" },
    ],
    template: `Act as an experienced accountant helping me chase a reconciliation difference. Work only from what I give you — never invent figures.

Reconciling: {{recon_type}}
Exact difference: {{difference}}
Period and volume: {{period}}
Already checked: {{checked}}

First, apply the classic difference tests to my number and tell me what each implies: divisible by 9 (possible transposition), divisible by 2 (possible item posted to the wrong side — look for one item of half the difference), matches a round fee or a single recurring amount. Show the arithmetic.

Then give a search checklist ordered by likelihood for my situation, excluding what I already checked: timing items, duplicates, sign errors, items recorded in the wrong period, unrecorded bank charges or interest, and one-sided entries. For each: exactly where to look and the fastest filter or sort that exposes it. End with the two causes that would NOT show up in either listing alone, and how to catch those.`,
  },
  {
    id: "journal-explainer",
    title: "Journal entry with narrative",
    category: "Reconciliation & Close",
    goal: "The correct debit/credit structure for a transaction, with a reviewer-ready narrative.",
    tags: ["journal", "entries", "accruals", "close"],
    tip: "State your framework and materiality — the right entry can differ between GAAP, IFRS and tax books.",
    variables: [
      { key: "transaction", label: "The transaction", placeholder: "received 36,000 on 1 June for a 12-month service contract starting 1 June" },
      { key: "framework", label: "Reporting framework", placeholder: "accrual basis, US GAAP, monthly reporting" },
      { key: "accounts", label: "Relevant accounts you use", placeholder: "1000 Cash, 2400 Deferred revenue, 4000 Service revenue" },
    ],
    template: `Draft the accounting entries for this transaction. Use only the account names I give you; if an account is missing, say which one is needed rather than inventing a code.

Transaction: {{transaction}}
Framework: {{framework}}
Chart of accounts available: {{accounts}}

Provide: (1) the initial entry with debits and credits, amounts computed from my facts with the arithmetic shown; (2) any subsequent recurring entries (accrual releases, amortisation) with their schedule — state the monthly amount and how many periods; (3) a two-sentence narrative for each entry written so a reviewer or auditor understands the why without asking; (4) the balance each affected account should show after each period-end, as a small table.

Flag any judgement involved (recognition pattern, cut-off) as a judgement, and state the alternative treatment if one is defensible. This is preparation support, not professional advice — remind me at the end to have a qualified reviewer sign off anything material.`,
  },
  {
    id: "variance-analysis",
    title: "Variance analysis narrative from numbers",
    category: "Analysis & Reporting",
    goal: "Turn a budget-vs-actual table into a narrative that separates price, volume and timing.",
    tags: ["variance", "budget", "actuals", "narrative", "fp&a"],
    tip: "Paste the raw lines, not your conclusions — the value is a second pair of eyes on the same numbers.",
    variables: [
      { key: "numbers", label: "Budget vs actual lines (paste)", placeholder: "Revenue: bud 410k act 371k; Payroll: bud 180k act 197k; Marketing: bud 40k act 22k" },
      { key: "period", label: "Period", placeholder: "Q2, second quarter of the fiscal year" },
      { key: "known_events", label: "Known events in the period", placeholder: "two enterprise renewals slipped to July; hired backfill early" },
      { key: "audience", label: "Who reads it", placeholder: "the board pack, one page, non-accountants" },
    ],
    template: `Write a variance analysis from these numbers. Compute every variance yourself and show it — never restate my numbers incorrectly.

Budget vs actual: {{numbers}}
Period: {{period}}
Known events: {{known_events}}
Audience: {{audience}}

For each line: the variance in absolute terms and percent (show the arithmetic), classified as favourable or unfavourable from the reader's perspective, and attributed where my known events allow — separating price/rate effects, volume effects and pure timing shifts that reverse next period. Where attribution is not possible from what I gave you, write "requires investigation: [specific question]" instead of a guess.

Then produce the narrative for {{audience}}: lead with the total picture in two sentences, then only the variances that are material to the story, each with its cause and whether it persists. No filler phrases like "due to various factors". End with the three questions a sharp board member will ask, and the data I need on hand for each.`,
  },
  {
    id: "report-plain-english",
    title: "Financial statements in plain English",
    category: "Analysis & Reporting",
    goal: "Explain a set of figures to a non-financial owner without dumbing them down wrong.",
    tags: ["reporting", "plain english", "client", "explanation"],
    tip: "Say what the client already worries about — the explanation should meet their question, not a generic one.",
    variables: [
      { key: "figures", label: "The key figures (paste)", placeholder: "revenue 1.2m up 9%; gross margin 41% down from 47%; cash 85k; debtor days 61 up from 44" },
      { key: "client_context", label: "Client and their worry", placeholder: "family manufacturing business; owner worried about cash despite growing sales" },
      { key: "one_action", label: "The action you want them to take", placeholder: "approve a credit-control tightening and a price review" },
    ],
    template: `Explain these financials to a non-financial business owner. Accuracy first: simplify the language, never the meaning.

Figures: {{figures}}
Client and what they worry about: {{client_context}}
The action I want them to agree to: {{one_action}}

Write: (1) a three-sentence summary that answers their actual worry first, using the figures; (2) the story connecting the numbers — if margin fell while sales grew and debtor days stretched, walk the cause-and-effect chain in everyday words, with each claim tied to a figure I gave; (3) one analogy maximum, only if it genuinely maps; (4) the recommendation, framed as the decision and its cost of delay, leading to {{one_action}}.

Rules: no jargon without an immediate plain translation in brackets, no figure I did not supply, percentages always anchored to absolute amounts. Keep it under 250 words — it should survive being read aloud in a meeting.`,
  },
  {
    id: "fee-increase-letter",
    title: "Client email: fee increase or scope creep",
    category: "Client Communication",
    goal: "Raise fees or push back on out-of-scope work while keeping the client relationship warm.",
    tags: ["fees", "engagement", "scope", "client email"],
    tip: "List what the engagement letter actually covers — the email argues from the agreement, not from effort.",
    variables: [
      { key: "situation", label: "The situation", placeholder: "monthly bookkeeping fee unchanged 3 years; client now sends 3x the volume plus payroll queries" },
      { key: "agreement", label: "What the engagement covers", placeholder: "bookkeeping to 200 transactions/month and quarterly VAT; payroll not included" },
      { key: "proposal", label: "Your proposal", placeholder: "new fee from next quarter, payroll as a separate fixed add-on" },
      { key: "relationship", label: "Relationship context", placeholder: "8 years, pays promptly, refers other clients" },
    ],
    template: `Draft a client email about fees or scope. Firm on the facts, warm in tone, and no apologising for charging for work.

Situation: {{situation}}
What the engagement letter covers: {{agreement}}
My proposal: {{proposal}}
Relationship: {{relationship}}

Structure: open with something true and specific about the relationship (from my context, not flattery); state plainly how the work has changed, in countable terms; anchor to what the current agreement covers; present the proposal with its effective date and exactly what the client gets; close with an invitation to discuss and a genuine thank-you.

Rules: under 200 words, no "unfortunately", no cost-of-living justifications, no ultimatums, and never frame it as punishment for their growth — frame it as keeping the service matched to the work. Provide a subject line, plus a two-line variant of the key paragraph for a client I expect to push back hard.`,
  },
  {
    id: "records-chase",
    title: "Missing records chase sequence",
    category: "Client Communication",
    goal: "A three-touch chase sequence for missing documents that escalates without souring.",
    tags: ["chasing", "records", "documents", "deadline"],
    tip: "Name the real consequence and its date — vague urgency trains clients to ignore you.",
    variables: [
      { key: "missing", label: "What is missing", placeholder: "bank statements for Feb-Apr, mileage log, two purchase invoices over 5k" },
      { key: "deadline", label: "Real deadline and consequence", placeholder: "filing due 31 Jan; late filing penalty starts at 100 and interest accrues" },
      { key: "client_style", label: "Client and history", placeholder: "sole trader, always late but always responds to phone calls, prefers WhatsApp" },
    ],
    template: `Write a three-touch chase sequence for missing client records.

Missing: {{missing}}
Real deadline and consequence: {{deadline}}
Client and their history: {{client_style}}

Touch 1 (now, friendly): a short message listing the items as a numbered checklist they can reply against, with the easiest possible return route given how this client communicates. Touch 2 (one week later): same list marked with anything received, the deadline stated with its date, and the consequence in one factual sentence — money and dates, not drama. Touch 3 (final): the cutoff date after which I file with what I have or must move to an extension, what that means for them, and that the choice is theirs — stated respectfully.

Rules: every touch under 120 words, checklist format survives copy-paste into WhatsApp, no passive-aggressive "as per my last message", and the tone never implies they are a bad person — only that the calendar does not move. Suggest the ideal day and time to send each touch for this client.`,
  },
  {
    id: "process-documentation",
    title: "Month-end close checklist from a brain dump",
    category: "Process & Controls",
    goal: "Turn how-you-actually-close into a sequenced checklist someone else could run.",
    tags: ["close", "checklist", "process", "documentation"],
    tip: "Brain-dump in any order — sequencing and dependency-mapping is exactly what the model is good at.",
    variables: [
      { key: "brain_dump", label: "Everything you do at close (any order)", placeholder: "recs for 3 banks, accrue payroll, depreciation journal, review aged debtors, lock the period, send pack..." },
      { key: "systems", label: "Systems involved", placeholder: "Xero, Dext for receipts, spreadsheet for prepayments" },
      { key: "deadline", label: "Close deadline", placeholder: "working day 5, pack to directors by day 7" },
    ],
    template: `Turn my brain dump into a month-end close checklist another accountant could run without me.

What I do, in no particular order: {{brain_dump}}
Systems: {{systems}}
Deadline: {{deadline}}

Produce: (1) the tasks sequenced by dependency — say explicitly why each ordering matters where it does (what breaks if swapped); (2) each task with: the system it happens in, its trigger (calendar day or completion of a prior task), an estimated day within the {{deadline}} timetable, and its done-check — the observable state that proves completion, like "all three bank recs show zero difference"; (3) tasks that can run in parallel, marked; (4) the gaps — steps a complete close normally includes that my dump did not mention, listed as questions, not silently inserted.

Format as a table I can paste into a spreadsheet: order, task, system, depends on, target day, done-check.`,
  },
  {
    id: "control-gaps",
    title: "Internal control gap review for a small team",
    category: "Process & Controls",
    goal: "Segregation-of-duties and control gaps in a small finance function, with proportionate fixes.",
    tags: ["controls", "segregation of duties", "fraud", "small business"],
    tip: "List who does what honestly, including the awkward overlaps — that is the entire point of the review.",
    variables: [
      { key: "team", label: "Who does what", placeholder: "one bookkeeper enters bills, pays them and reconciles the bank; owner signs nothing under 5k" },
      { key: "flows", label: "Money flows", placeholder: "supplier payments by bank transfer, customer receipts by card and transfer, petty cash box" },
      { key: "size", label: "Business size", placeholder: "12 staff, 2m revenue, no internal audit" },
    ],
    template: `Review internal controls for a small finance function. Be proportionate — the fixes must fit a business this size, not a listed company.

Who does what: {{team}}
Money flows: {{flows}}
Size: {{size}}

Identify: (1) segregation-of-duties conflicts in my description — for each, the specific fraud or error it permits, described as the concrete sequence of actions one person could take; (2) missing basic controls for the money flows I listed (authorisation thresholds, bank mandate rules, supplier detail change verification, reconciliation review by a second person); (3) for each gap, a proportionate fix costing little or nothing — owner review routines, bank dual-authorisation, exception reports — and the residual risk that remains after it.

Rank by exposure: likelihood times amount accessible. Do NOT pad with irrelevant enterprise controls. End with the three highest-value checks the owner personally should do monthly in under 30 minutes total, described step by step. Note that this is a hygiene review, not an audit or fraud investigation.`,
  },
  {
    id: "deadline-explainer",
    title: "Explain a tax or filing rule to a client",
    category: "Client Communication",
    goal: "A plain-language explanation of a rule the client keeps getting wrong, without giving formal advice.",
    tags: ["tax", "explanation", "client", "rules"],
    tip: "Paste the rule text or official guidance you rely on — the model explains what you supply, it must not be the source.",
    variables: [
      { key: "rule_text", label: "The rule (paste the official wording)", placeholder: "estimated tax payments are due quarterly when tax not withheld exceeds..." },
      { key: "client_error", label: "What the client keeps doing wrong", placeholder: "pays annually in April, then gets surprised by penalties and interest" },
      { key: "client_profile", label: "Client profile", placeholder: "freelance designer, first profitable year, no finance background" },
    ],
    template: `Help me explain a rule to a client in plain language. IMPORTANT: work strictly from the rule text I paste — do not add thresholds, rates or dates from your own memory, because they may be outdated or from the wrong jurisdiction.

The rule, as officially worded: {{rule_text}}
What the client keeps doing wrong: {{client_error}}
Client: {{client_profile}}

Write: (1) the rule in three sentences a non-accountant follows, keeping every number exactly as pasted; (2) "what this means for you" applied to this client's error — the specific behaviour change, framed as dates and actions; (3) what happens if they continue as-is, using only consequences stated in or directly implied by the pasted text, labelled clearly where I need to confirm current penalty figures; (4) a two-line calendar summary they can screenshot.

Tone: helpful, no scolding for past mistakes. End with a sentence I can adapt that says this is general guidance and their specific position should be confirmed with me directly — keeping the formal advice inside the engagement.`,
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
