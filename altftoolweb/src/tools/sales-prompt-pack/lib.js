/**
 * Sales Prompt Pack — prompt library + a pure template engine.
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
  "Prospecting",
  "Outreach",
  "Discovery",
  "Follow-up",
  "Objections",
  "Closing",
];

export const PROMPTS = [
  {
    id: "icp-triggers",
    title: "Ideal customer profile and trigger events",
    category: "Prospecting",
    goal: "Define who to call and, more usefully, when to call them.",
    tags: ["icp", "targeting", "triggers", "prospecting"],
    tip: "Base the profile on your closed-won list, not on who you wish would buy.",
    variables: [
      { key: "product", label: "What you sell", placeholder: "shift-scheduling software for multi-site restaurants" },
      { key: "best_customers", label: "Your best existing customers", placeholder: "8-40 site groups, ops director buys, replaced spreadsheets" },
      { key: "worst_fits", label: "Deals that went badly", placeholder: "single sites, enterprise chains with in-house tooling" },
      { key: "value", label: "Measured value delivered", placeholder: "cut scheduling admin from 6 hours to 45 minutes a week" },
    ],
    template: `Act as a B2B sales strategist. Define the ideal customer profile for {{product}}.

Best existing customers: {{best_customers}}
Deals that went badly: {{worst_fits}}
Measured value delivered: {{value}}

Return: (1) the firmographic profile — size, sector, structure, geography — with the reason each attribute predicts a good fit; (2) the buying committee, with the role most likely to feel the pain, the role that signs, and the role that blocks; (3) ten observable trigger events that suggest the pain is live right now, and for each the public source where it can be spotted; (4) the disqualifying signals that should stop me spending time.

Rank the triggers by how strongly they predict a purchase within 90 days, and say which of them I could realistically monitor at scale versus one account at a time.`,
  },
  {
    id: "account-research",
    title: "Pre-call account research brief",
    category: "Prospecting",
    goal: "A one-page brief that makes the first call sound informed rather than scripted.",
    tags: ["research", "account", "call prep", "discovery"],
    tip: "Ask for the questions you cannot answer from public sources — those are the ones worth asking on the call.",
    variables: [
      { key: "account", label: "Account", placeholder: "Harbour Group, 22 casual dining sites, UK" },
      { key: "contact", label: "Who you are meeting", placeholder: "Ops Director, 8 months in role, ex-retail" },
      { key: "known_facts", label: "What you already know", placeholder: "hiring 3 area managers; opened 4 sites last year" },
      { key: "product", label: "What you sell", placeholder: "shift-scheduling software" },
    ],
    template: `Prepare a pre-call research brief for a first meeting.

Account: {{account}}
Who I am meeting: {{contact}}
What I already know: {{known_facts}}
What I sell: {{product}}

Give me a one-page brief with: the likely business priorities for this role at this stage of the company, three hypotheses about where my product could matter and the evidence behind each, the two most plausible reasons they will say no, the internal metric this person is probably measured on, and who else is likely to be involved in a decision like this.

Mark every statement as either "supported by what I gave you" or "assumption to test on the call". Then give five questions I cannot answer from public information, ordered by how much they would change my approach. Do not invent facts about this company.`,
  },
  {
    id: "cold-email",
    title: "Cold email with one clear ask",
    category: "Outreach",
    goal: "Under 125 words, one idea, one question, no fake familiarity.",
    tags: ["cold email", "outreach", "copywriting", "first touch"],
    tip: "If the email would still make sense sent to a different company, it is not personalised — it is mail-merged.",
    variables: [
      { key: "recipient", label: "Recipient and company", placeholder: "Ops Director at Harbour Group, 22 restaurant sites" },
      { key: "trigger", label: "Genuine reason for writing now", placeholder: "they posted 3 area manager roles this month" },
      { key: "problem", label: "Problem you solve", placeholder: "managers rebuilding rotas by hand every week" },
      { key: "proof", label: "Proof you can point to", placeholder: "Coast Kitchens, 18 sites, cut rota admin from 6 hours to 45 minutes" },
    ],
    template: `Write a cold email.

Recipient: {{recipient}}
Genuine reason for writing now: {{trigger}}
Problem I solve: {{problem}}
Proof I can point to: {{proof}}

Constraints: under 125 words; subject line under 45 characters and not a question they can answer "no" to; open with the observation, not with "I hope this finds you well" or "I noticed you..." followed by flattery; one idea only; one specific ask that costs them under five minutes; no attachments, no calendar link in the first email, no "circling back" language, no bullet list of features.

Give three subject lines and two versions of the body: one that leads with the trigger and one that leads with the proof. Then explain in two lines which you would send and what would have to be true for the other to win. Flag anything in my inputs that would read as creepy rather than researched.`,
  },
  {
    id: "linkedin-touch",
    title: "LinkedIn connection and first message",
    category: "Outreach",
    goal: "A short message that earns a reply without pitching in the connection note.",
    tags: ["linkedin", "social selling", "outreach", "message"],
    tip: "Never pitch in the connection request; the only job of that message is to get accepted.",
    variables: [
      { key: "contact", label: "Who you are contacting", placeholder: "Ops Director, posts about multi-site staffing" },
      { key: "common_ground", label: "Genuine common ground", placeholder: "she commented on a post about rota fairness last week" },
      { key: "value_idea", label: "One useful thing you can offer", placeholder: "our benchmark of rota hours per site across 40 groups" },
      { key: "ask", label: "The eventual ask", placeholder: "15-minute call to compare their numbers with the benchmark" },
    ],
    template: `Write a LinkedIn outreach sequence.

Contact: {{contact}}
Genuine common ground: {{common_ground}}
One useful thing I can offer: {{value_idea}}
The eventual ask: {{ask}}

Produce: (1) a connection note under 250 characters that contains no pitch and no link; (2) a first message after they accept, under 70 words, that gives the useful thing without asking for anything; (3) a second message five to seven days later that makes the ask; (4) a polite final message that closes the loop.

Write in the way a person types on LinkedIn — short lines, no formal salutation, no emoji, no "I wanted to reach out". Do not claim to have read something they wrote unless I told you they wrote it. Say which message in this sequence is most likely to be ignored and why.`,
  },
  {
    id: "call-opener",
    title: "Cold call opener and permission script",
    category: "Outreach",
    goal: "The first 20 seconds, plus what to do when they push back.",
    tags: ["cold call", "script", "opener", "phone"],
    tip: "Ask permission for the time you actually need, then stick to it — that is what earns the second call.",
    variables: [
      { key: "role", label: "Who you are calling", placeholder: "Ops Director at a 22-site restaurant group" },
      { key: "reason", label: "Reason for the call", placeholder: "they are hiring area managers while still running rotas on spreadsheets" },
      { key: "product", label: "What you sell in one line", placeholder: "scheduling software built for multi-site hospitality" },
      { key: "goal", label: "Goal of this call", placeholder: "a 20-minute discovery call next week" },
    ],
    template: `Write a cold call script.

Who I am calling: {{role}}
Reason for the call: {{reason}}
What I sell, in one line: {{product}}
Goal of this call: {{goal}}

Give me: the opener in under 20 seconds including a straight permission question; the one-sentence reason for the call in their language; the single qualifying question to ask if they grant time; and the close that books {{goal}}.

Then handle these responses word for word: "I'm busy", "send me an email", "we already have something", "who gave you my number", and silence. Each response gets one honest reply and a clear exit if the answer is still no — no manipulation, no fake urgency, no "just one quick question" after they said no.

Mark where I should stop talking and wait.`,
  },
  {
    id: "discovery-questions",
    title: "Discovery call question set (SPIN and MEDDIC)",
    category: "Discovery",
    goal: "Questions that find the pain, the money and the process, not just interest.",
    tags: ["discovery", "spin", "meddic", "qualification"],
    tip: "Interest is not qualification — leave the call knowing the metric, the economic buyer and the decision process.",
    variables: [
      { key: "product", label: "What you sell", placeholder: "shift-scheduling software" },
      { key: "prospect", label: "Prospect and role", placeholder: "Ops Director, 22 sites, evaluating alongside two competitors" },
      { key: "hypothesis", label: "Your hypothesis about their pain", placeholder: "area managers spend a day a week on rotas and overtime is unplanned" },
      { key: "length", label: "Call length", placeholder: "30 minutes, first call" },
    ],
    template: `Build a discovery call plan for {{product}}.

Prospect: {{prospect}}
My hypothesis about their pain: {{hypothesis}}
Call length: {{length}}

Structure the call and allocate minutes to each part. For questions, use SPIN: situation questions kept to the minimum I could not research myself, problem questions, implication questions that make the cost of the status quo concrete, and need-payoff questions that let them describe the value in their own words.

Separately, list how I will cover each MEDDIC element — metrics, economic buyer, decision criteria, decision process, identified pain, champion — and which question gets me each one without it feeling like an interrogation.

End with: the three answers that should make me disqualify this deal, the summary I should say back to them before the call ends, and the exact next-step ask.`,
  },
  {
    id: "demo-narrative",
    title: "Tailored demo narrative",
    category: "Discovery",
    goal: "A demo built around their three problems instead of your feature menu.",
    tags: ["demo", "presentation", "narrative", "solution"],
    tip: "Show the end state first; a demo that starts at the settings screen loses the room.",
    variables: [
      { key: "product", label: "Product", placeholder: "shift-scheduling software" },
      { key: "pains", label: "Pains they told you about", placeholder: "rota rebuilds, unplanned overtime, no visibility across sites" },
      { key: "audience", label: "Who is on the call", placeholder: "Ops Director, two area managers, finance analyst" },
      { key: "time", label: "Time available", placeholder: "40 minutes including questions" },
    ],
    template: `Design a demo of {{product}} for a specific account.

Pains they told me about: {{pains}}
Who is on the call: {{audience}}
Time available: {{time}}

Build the narrative as: the end state in one screen and one sentence, then one act per pain — set the scene in their words, show the smallest path that resolves it, and stop. Give the exact click path for each act, the sentence to say at each step, and the check-in question that confirms it landed.

Tailor one moment to each person on the call and say which. Cut anything that does not serve one of the stated pains, and list what you cut so I can hold it for questions. Include the two most likely interruptions and how to handle them without losing the thread, plus a 10-minute version if the call gets cut short.`,
  },
  {
    id: "followup-sequence",
    title: "Follow-up sequence after a good meeting",
    category: "Follow-up",
    goal: "Five touches that each add something, so none of them says 'just checking in'.",
    tags: ["follow up", "sequence", "nurture", "cadence"],
    tip: "Every follow-up needs a reason to exist that is not your pipeline review.",
    variables: [
      { key: "context", label: "What happened in the meeting", placeholder: "good discovery, they liked it, budget sits with finance until April" },
      { key: "next_step", label: "Agreed next step", placeholder: "they would share last quarter's overtime numbers" },
      { key: "assets", label: "Useful things you can send", placeholder: "benchmark report, a 6-minute recorded walkthrough, a similar customer story" },
      { key: "timeline", label: "Their timeline", placeholder: "decision after the April budget cycle" },
    ],
    template: `Write a five-touch follow-up sequence.

What happened in the meeting: {{context}}
Agreed next step: {{next_step}}
Useful things I can send: {{assets}}
Their timeline: {{timeline}}

Touch one is the recap sent within a working day: what I heard, what we agreed, who does what by when, in under 120 words with no attachments. Touches two to five each need a distinct reason to exist tied to their timeline — a resource, a relevant change, a question, a decision point — and none may contain "just checking in", "touching base", "circling back" or "bumping this to the top of your inbox".

For each touch give: the day offset, the channel, the subject line, the body, and the one sentence that makes it worth opening. End with the rule for when to stop and move the deal to closed-lost, and what to do differently if the champion goes silent versus if they reply "not yet".`,
  },
  {
    id: "breakup-email",
    title: "Final email that closes the loop",
    category: "Follow-up",
    goal: "Leave the door open without guilt-tripping someone who simply got busy.",
    tags: ["breakup email", "closing the loop", "silence", "email"],
    tip: "State what you will do next rather than demanding a reply — it gets more responses and costs no goodwill.",
    variables: [
      { key: "history", label: "What happened so far", placeholder: "two calls, they asked for pricing, four weeks of silence" },
      { key: "guess", label: "Your honest guess about the silence", placeholder: "the project got deprioritised after their ops lead left" },
      { key: "door", label: "What you want to leave open", placeholder: "happy to revisit after their new ops lead starts" },
    ],
    template: `Write a final follow-up email after a prospect has gone quiet.

What happened so far: {{history}}
My honest guess about the silence: {{guess}}
What I want to leave open: {{door}}

Under 90 words. State plainly that I will stop following up, give the one-line reason I thought this was worth their time, offer the door that stays open with a specific trigger for reopening it, and make replying optional.

Do not use guilt, false deadlines, "should I close your file", "have you given up on this", or a made-up expiring discount. Do not ask three questions. Give two versions: one for a champion who went quiet, one for a contact who never really engaged, and say how the two differ and why.`,
  },
  {
    id: "objection-matrix",
    title: "Objection response matrix",
    category: "Objections",
    goal: "One honest answer per objection, plus the question that finds the real one underneath.",
    tags: ["objections", "rebuttals", "handling", "matrix"],
    tip: "Most first objections are a stand-in for something else; the clarifying question matters more than the rebuttal.",
    variables: [
      { key: "product", label: "Product", placeholder: "shift-scheduling software" },
      { key: "objections", label: "Objections you actually hear", placeholder: "too expensive, we use spreadsheets and they work, managers will not adopt it" },
      { key: "weaknesses", label: "Where you are genuinely weaker", placeholder: "no payroll integration yet; setup takes 3 weeks" },
      { key: "competitor", label: "Who you lose to", placeholder: "an incumbent HR suite that bundles scheduling" },
    ],
    template: `Build an objection handling matrix for {{product}}.

Objections I actually hear: {{objections}}
Where I am genuinely weaker: {{weaknesses}}
Who I lose to: {{competitor}}

For each objection give five things: what it usually means underneath, the clarifying question to ask before answering anything, the honest response, the proof point or example that supports it, and the point at which I should agree that we are not the right fit.

Where my product is genuinely weaker, say so plainly and give the version of the answer that concedes the gap and reframes the trade-off — no spin, no "actually that's a strength". Add the three objections I did not list that this profile of buyer usually raises, and rank all of them by how often they end deals rather than how often they are said.`,
  },
  {
    id: "pricing-pushback",
    title: "Handle price pushback without discounting first",
    category: "Objections",
    goal: "Separate 'too expensive' from 'I cannot see the value' before you touch the price.",
    tags: ["pricing", "discount", "negotiation", "value"],
    tip: "Never discount without taking something out of the deal — a free discount teaches them the list price was fiction.",
    variables: [
      { key: "price", label: "Your price and structure", placeholder: "GBP 89 per site per month, annual, 22 sites" },
      { key: "pushback", label: "What they said", placeholder: "that is about double what we expected" },
      { key: "value_case", label: "Quantified value", placeholder: "5 hours a week saved per site at roughly GBP 18 an hour" },
      { key: "flexibility", label: "What you can actually flex", placeholder: "payment terms, phased rollout, 3 free sites in year one" },
    ],
    template: `Help me handle price pushback.

My price and structure: {{price}}
What they said: {{pushback}}
Quantified value: {{value_case}}
What I can actually flex: {{flexibility}}

First, give the three questions that tell me whether this is a budget problem, a value problem, a comparison problem or a negotiating tactic, and how the answer to each changes my response.

Then give the response for each of those four cases. For the value case, show the arithmetic I should walk them through using my numbers, laid out so they can check it. For the budget case, show what to remove from the scope rather than what to knock off the price.

Rules: never discount without removing something; never invent a discount authority I did not mention; never claim a price rise is coming unless I said one is. End with the walk-away position and the sentence that states it without threatening.`,
  },
  {
    id: "mutual-action-plan",
    title: "One-page proposal and mutual action plan",
    category: "Closing",
    goal: "A proposal a champion can forward, plus the dated plan that gets it signed.",
    tags: ["proposal", "mutual action plan", "closing", "champion"],
    tip: "The mutual action plan is the deal's real forecast — if they will not agree dates, the deal is not where you think.",
    variables: [
      { key: "deal", label: "Deal summary", placeholder: "22 sites, scheduling rollout, GBP 23.5k annual" },
      { key: "problem_value", label: "Their problem and the value agreed", placeholder: "6 hours per site per week on rotas; target 45 minutes" },
      { key: "stakeholders", label: "Stakeholders and their concerns", placeholder: "Ops Director sponsor, finance wants payback under 12 months, IT wants SSO" },
      { key: "deadline", label: "Their date that matters", placeholder: "live before the summer hiring peak in June" },
    ],
    template: `Write a one-page proposal and a mutual action plan.

Deal: {{deal}}
Their problem and the value agreed: {{problem_value}}
Stakeholders and their concerns: {{stakeholders}}
The date that matters to them: {{deadline}}

The proposal must fit on one page and be readable by someone who was not on any call: the problem in their words, the outcome and how it will be measured, what is included and explicitly what is not, the commercials, the timeline, and the risks with how each is handled. No feature list, no logos, no adjectives that cannot be checked.

The mutual action plan is a table working backwards from {{deadline}}: task, owner (mine or theirs, named), date, and what it unblocks. Include security review, legal, procurement and any internal approval each stakeholder needs.

Finish with the three questions to ask my champion to confirm this plan is real, and the earliest point where I would know it is slipping.`,
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
