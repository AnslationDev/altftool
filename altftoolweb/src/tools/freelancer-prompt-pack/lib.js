/**
 * Freelancer Prompt Pack — prompt library + a pure template engine.
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
  "Proposals & Pricing",
  "Scope & Boundaries",
  "Getting Paid",
  "Client Relationships",
  "Finding Work",
];

export const PROMPTS = [
  {
    id: "proposal-draft",
    title: "Proposal that sells the outcome",
    category: "Proposals & Pricing",
    goal: "A proposal structured around the client's outcome, with scope stated as what is and is not included.",
    tags: ["proposal", "pitch", "pricing", "outcome"],
    tip: "Quote the client's own words about their problem — proposals that mirror the brief's language win more.",
    variables: [
      { key: "project", label: "The project", placeholder: "rebuild a bakery's website with online ordering" },
      { key: "client_words", label: "The client's problem in their words", placeholder: "'we lose phone orders every Saturday and the site looks ten years old'" },
      { key: "approach", label: "Your approach and timeline", placeholder: "4 weeks: week 1 design, 2-3 build, 4 launch; Shopify base" },
      { key: "price", label: "Price and structure", placeholder: "3,800 fixed, 40% deposit, remainder at launch" },
      { key: "exclusions", label: "What is NOT included", placeholder: "product photography, copywriting beyond menu, ongoing maintenance" },
    ],
    template: `Write a project proposal I can send as a short document or long email.

Project: {{project}}
The client's problem in their own words: {{client_words}}
My approach and timeline: {{approach}}
Price and payment structure: {{price}}
Explicitly not included: {{exclusions}}

Structure: (1) open by restating their problem using their own words — one paragraph proving I listened; (2) the outcome they get, before any process talk; (3) the approach as a simple timeline with what they will see at each stage and what I need from them (with dates relative to start); (4) investment — the price stated plainly once, tied to the outcome, no apologising and no "only"; (5) "included / not included" as two clean lists, with my exclusions verbatim; (6) next step: one specific action with a validity window ("this proposal stands for 14 days").

Rules: under 500 words, no jargon, no "passionate", write as I-statements from a professional equal — not a supplicant. Add a three-line follow-up email for day 5 if they go quiet.`,
  },
  {
    id: "pricing-options",
    title: "Three-tier quote from one scope",
    category: "Proposals & Pricing",
    goal: "Turn one project into good/better/best options that anchor the client to the middle.",
    tags: ["pricing", "tiers", "anchoring", "packages"],
    tip: "The bottom tier must be genuinely viable — a decoy the client can smell kills trust in all three.",
    variables: [
      { key: "project", label: "The core project", placeholder: "brand identity for a new physio clinic" },
      { key: "core_price", label: "Your price for the core scope", placeholder: "2,500 for logo, colours, type, one-page guide" },
      { key: "extras", label: "Real extras you could add or remove", placeholder: "social templates, signage files, brand photography art direction, extra concepts" },
      { key: "client_budget_signal", label: "Any budget signal from the client", placeholder: "mentioned 'a few thousand' on the call" },
    ],
    template: `Build a three-tier quote from one project.

Core project: {{project}}
My core-scope price: {{core_price}}
Real add-ons and removables: {{extras}}
Budget signal from the client: {{client_budget_signal}}

Construct: ESSENTIAL — the core outcome with something genuinely removed (fewer concepts, fewer deliverables), priced 20-30 percent below core, still a complete result I would put my name on; RECOMMENDED — the core scope at my stated price, positioned against the budget signal; PREMIUM — core plus the extras that most increase the client's outcome (not my hours), priced 40-60 percent above core.

For each tier: a name that describes the result (not "bronze"), what is included as outcomes, one line on who should choose it, the price. Show the arithmetic you used from my core price. Then: which tier the budget signal predicts they choose, the single sentence that nudges toward RECOMMENDED without pressure, and what I say if they ask to mix tiers (rule: swaps at equal value, additions at listed value — never unpriced favours).`,
  },
  {
    id: "scope-creep-reply",
    title: "Scope creep: the 'happy to — here's how' reply",
    category: "Scope & Boundaries",
    goal: "Say yes to new work and no to free work in the same friendly email.",
    tags: ["scope creep", "boundaries", "change request", "email"],
    tip: "Reply fast — scope conversations get harder every day the extra work sits unaddressed.",
    variables: [
      { key: "request", label: "What they asked for", placeholder: "'while you're in there, can you also add a booking calendar?'" },
      { key: "agreed_scope", label: "What the agreement covers", placeholder: "proposal listed 5 pages and a contact form; calendar not mentioned" },
      { key: "impact", label: "Real impact of the request", placeholder: "roughly 12 extra hours, pushes launch by a week" },
      { key: "options", label: "Options you can offer", placeholder: "add it for 900 with launch moved; or phase 2 after launch at same rate" },
    ],
    template: `Write a scope-creep reply that protects the project without souring the relationship.

Their request: {{request}}
What the agreement covers: {{agreed_scope}}
Real impact if added now: {{impact}}
Options I can offer: {{options}}

Structure: (1) genuine enthusiasm for the idea itself — one sentence, and only if I can say it honestly; (2) the boundary as shared fact, not accusation: what the agreed scope covers, referenced casually ("the proposal covered X"), never "as per our contract" in a first exchange; (3) the impact in concrete terms — hours and dates, so the trade-off is theirs to weigh, not mine to absorb; (4) the options as a clean either/or with prices and dates, framed as "both work — which suits you?"; (5) close on the current milestone continuing on schedule either way.

Rules: under 150 words, zero passive aggression, no "unfortunately", never apologise for charging, and the word "just" is banned. Give me one firmer variant for a repeat offender — same facts, cooler warmth, and a line introducing a change-request process going forward.`,
  },
  {
    id: "requirements-questions",
    title: "Kickoff questions that prevent rework",
    category: "Scope & Boundaries",
    goal: "The questions to ask before starting that eliminate the expensive surprises later.",
    tags: ["kickoff", "requirements", "discovery", "questions"],
    tip: "Ask about approval and 'done' criteria hardest — most disputes are about who decides, not what was built.",
    variables: [
      { key: "project", label: "The project", placeholder: "monthly content retainer: 4 blog posts and a newsletter" },
      { key: "client_type", label: "The client", placeholder: "marketing manager at a 50-person B2B firm, first time outsourcing this" },
      { key: "past_pain", label: "What has burned you before", placeholder: "endless revision rounds; 'the CEO wants to see it' appearing at the end" },
    ],
    template: `Give me the kickoff questions that prevent rework and disputes on this project.

Project: {{project}}
Client: {{client_type}}
What has burned me before on similar work: {{past_pain}}

Produce questions grouped by: (1) DONE — how we will both know a deliverable is accepted: who approves, within how many days, what silence means after that window, and how many revision rounds are included; (2) DECISION-MAKERS — who else sees this work, and the question that surfaces the hidden CEO-reviewer politely; (3) INPUTS — what I need from them, by when, and what happens to the timeline when inputs are late (the dependency clause in plain words); (4) CONTEXT — the questions specific to this project type that a first-time outsourcer will not think to volunteer; (5) MY SCAR TISSUE — one targeted question per past pain I listed, engineered to make that failure impossible to repeat.

For each question: why it matters in one line, and the answer that should make me raise the price or walk away. Format as a checklist I can paste into my kickoff agenda.`,
  },
  {
    id: "invoice-chase",
    title: "Invoice chase sequence (3 touches + final)",
    category: "Getting Paid",
    goal: "A polite-to-firm escalation for an unpaid invoice that preserves the relationship until it should not.",
    tags: ["invoice", "late payment", "chasing", "email"],
    tip: "Chase on a schedule, not on anger — the calendar sends the emails, so you never sound emotional.",
    variables: [
      { key: "invoice", label: "Invoice details", placeholder: "INV-042, 1,850, due 14 days ago, for the March retainer" },
      { key: "terms", label: "Your payment terms", placeholder: "14 days; contract allows late fee of 2% per month after 30 days" },
      { key: "history", label: "Client payment history", placeholder: "usually pays on time; this is unusual; project is otherwise ongoing" },
    ],
    template: `Write my invoice chase sequence.

Invoice: {{invoice}}
My terms: {{terms}}
Client history: {{history}}

Four messages: TOUCH 1 (due date +3 days) — friendly assumption of oversight, invoice attached again, amount and original due date stated, one-line ask; TOUCH 2 (+10 days) — still warm, but adds a direct question ("is there an issue with this invoice I should know about?") and asks for a payment date by reply; TOUCH 3 (+21 days) — businesslike: the timeline of touches so far as bare facts, the late-fee provision from my terms quoted if I have one, a specific date after which the next step happens, and pausing any current work mentioned as scheduling fact, not threat; FINAL (+35 days) — the last email before formal recovery: total now owed, the exact next step and its date.

Rules: every message under 110 words, none apologise for asking, tone matched to the history I described, and each escalation quotes only facts from earlier touches. Add the one-line note on WHERE tone should differ if this client is normally excellent — and the sentence to send the day payment arrives that resets the relationship warmly.`,
  },
  {
    id: "deposit-terms",
    title: "Payment terms that protect you, explained kindly",
    category: "Getting Paid",
    goal: "State deposit, milestones and kill-fee terms in client-friendly language that still binds.",
    tags: ["deposit", "terms", "kill fee", "milestones"],
    tip: "Terms stated at proposal time feel professional; the same terms raised after a problem feel hostile.",
    variables: [
      { key: "project_type", label: "Project and duration", placeholder: "12-week app design engagement" },
      { key: "terms_wanted", label: "The protections you want", placeholder: "40% deposit; milestone payments; 25% kill fee on cancellation; IP transfers on final payment" },
      { key: "client_concern", label: "Likely client concern", placeholder: "startup, cash-conscious, nervous about paying before seeing work" },
    ],
    template: `Turn my payment protections into client-facing terms language.

Project: {{project_type}}
Protections I want: {{terms_wanted}}
The client's likely concern: {{client_concern}}

For each protection: (1) the client-facing wording — plain sentences for a proposal's terms section, each stating what happens and when, no legalese; (2) the one-line WHY I can say aloud if asked, framed as how it protects the project and both parties (deposits secure the booking; milestones mean they never pay far ahead of delivered work; the kill fee covers reserved capacity), which has the advantage of being true; (3) where their stated concern touches this term, the honest reassurance — what they can verify before each payment.

Then assemble the full terms section in order, under 200 words, readable in one pass. Flag which of my protections commonly needs a contract clause behind it (not just proposal wording) and end with a reminder that a proper contract or a lawyer's review is the actual protection — this wording is the friendly surface of it, not a substitute.`,
  },
  {
    id: "difficult-feedback-reply",
    title: "Reply to vague or harsh client feedback",
    category: "Client Relationships",
    goal: "Convert 'I don't like it' into actionable direction without defending or caving.",
    tags: ["feedback", "revisions", "client management", "email"],
    tip: "Never defend the work in round one — extract the real objection first, decide what to do second.",
    variables: [
      { key: "feedback", label: "What they said", placeholder: "'not feeling it, can we try something more modern? my partner thinks the colours are off'" },
      { key: "work_context", label: "What you delivered and the brief it met", placeholder: "two logo concepts per the brief's 'trustworthy, established' direction" },
      { key: "revisions_left", label: "Revision rounds remaining", placeholder: "this consumes round 1 of 2 included" },
    ],
    template: `Help me reply to difficult feedback in a way that gets me direction I can execute.

What they said: {{feedback}}
What I delivered and the brief it met: {{work_context}}
Revisions remaining: {{revisions_left}}

Write a reply that: (1) receives the feedback without defensiveness AND without abandoning the work — one sentence, no "sorry you feel that way"; (2) asks at most three questions engineered to convert their vague reaction into decisions — each question offering concrete either/or choices (“when you say modern: closer to A or B?”) because open questions get vague answers from vague feedback; (3) gently surfaces any new stakeholder (the partner) by asking who should be in the approval loop going forward — phrased as making sure the next round lands with everyone; (4) restates where this sits in the included rounds as calendar fact, not warning; (5) proposes the mechanism: they answer the questions, I revise once against those answers by a stated date.

Under 140 words. Also give me the two-line internal note: what in my kickoff process would have prevented this feedback pattern, so I fix the system, not just the email.`,
  },
  {
    id: "rate-rise-letter",
    title: "Rate increase for an existing client",
    category: "Client Relationships",
    goal: "Announce a rate rise with notice and confidence — no justifying, no apologising.",
    tags: ["rates", "pricing", "increase", "retainer"],
    tip: "State the new rate as fact with a date — asking permission invites a negotiation you did not open.",
    variables: [
      { key: "current_arrangement", label: "Current arrangement", placeholder: "ongoing retainer, 20 hours monthly at 60/hour, running 2 years" },
      { key: "new_rate", label: "New rate and effective date", placeholder: "75/hour from 1 September — 6 weeks notice" },
      { key: "value_delivered", label: "Value delivered recently (concrete)", placeholder: "redesign lifted their signup conversion; ship weekly without misses" },
    ],
    template: `Write a rate increase notice for an existing client.

Current arrangement: {{current_arrangement}}
New rate and effective date: {{new_rate}}
Concrete value delivered recently: {{value_delivered}}

Structure: (1) one warm sentence about the ongoing work — specific, from my value list, not generic gratitude; (2) the change as calm fact: new rate, effective date, and that everything until that date stays at the current rate; (3) at most ONE sentence of context ("aligning my rates with the current scope of what I handle") — explicitly no inflation paragraphs, no cost justifications, no market-rate defensiveness: over-explaining reads as uncertainty and invites negotiation; (4) continuity: what they can expect to stay the same or improve; (5) an open door for questions that does NOT reopen the decision ("happy to walk through what this covers" — not "let me know if this works for you").

Under 130 words. Then: the reply script if they push back — the two-tier response: first hold with warmth, then, only if strategically worth it for THIS client, one concession that trades something (longer notice, a scope trim) rather than discounting the rate itself.`,
  },
  {
    id: "cold-outreach",
    title: "Cold outreach that references real work",
    category: "Finding Work",
    goal: "A short cold email built on something true and specific about the prospect.",
    tags: ["outreach", "cold email", "leads", "pitch"],
    tip: "The observation is the email — if you have nothing specific to say about them, do not send it.",
    variables: [
      { key: "prospect", label: "Who you are writing to", placeholder: "head of marketing at a 30-person outdoor gear brand" },
      { key: "observation", label: "Something true and specific you noticed", placeholder: "their product pages are strong but the blog stopped 8 months ago and ranks are slipping" },
      { key: "service", label: "What you offer them", placeholder: "content retainer: two SEO posts monthly targeting their category terms" },
      { key: "proof", label: "Your most relevant proof", placeholder: "grew a similar retailer's organic traffic 60% in 6 months — case study link" },
    ],
    template: `Write a cold outreach email around my genuine observation. The observation carries it — the pitch rides along.

Prospect: {{prospect}}
What I actually noticed: {{observation}}
What I offer: {{service}}
Relevant proof: {{proof}}

Structure: subject line under 6 words referencing THEIR situation, not my service; first line — the observation, specific enough that this email could not be sent to anyone else, stated as a peer's noticing, not a criticism or a neg; second — the implication of the observation in their terms (what it likely costs them), one sentence, no scare tactics; third — what I do about exactly that, with my proof embedded as a fact not a boast; fourth — the smallest possible ask: a specific question they can answer in one line, NOT "a quick 30-minute call".

Under 100 words total. No "I hope this finds you well", no "quick question" subject, no flattery paragraph. Then one follow-up for day 6: new angle on the same observation — never "just bumping this". If my observation as stated is too generic to carry the email, tell me so and what a sharp enough observation would look like.`,
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
