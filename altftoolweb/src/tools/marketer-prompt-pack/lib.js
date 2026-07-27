/**
 * Marketer Prompt Pack — prompt library + a pure template engine.
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
  "Strategy & Positioning",
  "Awareness",
  "Consideration",
  "Conversion",
  "Retention & Analysis",
];

export const PROMPTS = [
  {
    id: "positioning-statement",
    title: "Positioning statement with proof",
    category: "Strategy & Positioning",
    goal: "A positioning statement built on a real alternative, not an imagined competitor.",
    tags: ["positioning", "strategy", "differentiation", "messaging"],
    tip: "Name the alternative customers actually use today — often it is a spreadsheet, not a rival product.",
    variables: [
      { key: "product", label: "Product", placeholder: "an inventory app for independent pharmacies" },
      { key: "audience", label: "Best-fit customer", placeholder: "single-location pharmacy owners with 2-5 staff" },
      { key: "alternative", label: "What they use today", placeholder: "a shared Excel sheet updated at closing time" },
      { key: "difference", label: "Provable difference", placeholder: "scans expiry dates and flags stock 90 days out" },
      { key: "proof", label: "Evidence you have", placeholder: "pilot stores cut expired write-offs by a third" },
    ],
    template: `Act as a positioning strategist using April Dunford's method. Position {{product}}.

Best-fit customer: {{audience}}
What they actually use today: {{alternative}}
Provable difference: {{difference}}
Evidence: {{proof}}

Produce: (1) the market category we should anchor to and one we must avoid, each with a one-line reason; (2) a positioning statement in plain words — for whom, what it is, unlike the alternative, the one difference that matters, backed by the evidence; (3) three headline-ready phrasings of the difference, none using the words "seamless", "powerful" or "all-in-one"; (4) the customer for whom we are the WRONG choice, stated honestly.

Every claim must trace to the evidence I gave. Where evidence is thin, say "needs proof" rather than inventing a number.`,
  },
  {
    id: "audience-personas",
    title: "Buying-committee snapshot",
    category: "Strategy & Positioning",
    goal: "Who is involved in the purchase, what each one fears, and the message for each.",
    tags: ["persona", "buying committee", "b2b", "objections"],
    tip: "Base it on real sales calls if you have them — paste fragments into the interviews field.",
    variables: [
      { key: "product", label: "Product and price point", placeholder: "fleet-tracking SaaS, about 40 dollars per vehicle per month" },
      { key: "buyer", label: "Who signs", placeholder: "operations director" },
      { key: "interviews", label: "What you have heard from real buyers", placeholder: "drivers hate feeling watched; finance asks about contract lock-in" },
    ],
    template: `Map the buying committee for {{product}}.

Economic buyer: {{buyer}}
What we have actually heard from buyers: {{interviews}}

For each role in the committee (signer, day-to-day user, blocker, influencer): name the role, the outcome they personally need, their biggest fear about this purchase, the single message most likely to move them, and the content format that reaches them.

Ground everything possible in what I said we have heard; label anything else as "hypothesis — verify in next three sales calls". Finish with the two questions to add to our discovery calls that would sharpen this map fastest, and the one persona we should stop marketing to.`,
  },
  {
    id: "ad-variants",
    title: "Ad copy variants for one angle",
    category: "Awareness",
    goal: "Five ad variants that test one variable at a time, with the hypothesis stated.",
    tags: ["ads", "ppc", "social ads", "testing", "copy"],
    tip: "One angle per batch — five different angles teach you nothing when one wins.",
    variables: [
      { key: "product", label: "Product", placeholder: "meal-prep delivery for shift workers" },
      { key: "platform", label: "Platform and format", placeholder: "Meta feed, single image, primary text under 125 characters" },
      { key: "angle", label: "The one angle to test", placeholder: "time saved on Sunday, not health" },
      { key: "audience", label: "Audience", placeholder: "nurses and warehouse staff working rotating shifts" },
      { key: "cta", label: "Call to action", placeholder: "get your first week half price" },
    ],
    template: `Write ad copy for {{product}} on {{platform}}.

The ONE angle this batch tests: {{angle}}
Audience: {{audience}}
Call to action: {{cta}}

Give five variants that all hold the angle constant and vary exactly one element each — hook wording, specificity, social proof, framing (gain vs loss), and question vs statement. Label which element each variant varies and the hypothesis ("if V3 wins, specificity beats brevity for this audience").

Rules: primary text within the platform limit I stated, no clickbait that the landing page cannot honour, no fake urgency, and write numerals as numerals. Add a one-line image direction per variant. End with which single variant to run first if budget only allows one, and why.`,
  },
  {
    id: "seo-brief",
    title: "SEO content brief",
    category: "Awareness",
    goal: "A brief a writer can execute without guessing: intent, outline, entities, internal links.",
    tags: ["seo", "content brief", "search intent", "outline"],
    tip: "Paste the actual top-ranking titles if you can — the model should not guess the SERP.",
    variables: [
      { key: "keyword", label: "Target query", placeholder: "how to reduce warehouse picking errors" },
      { key: "serp_notes", label: "What ranks today", placeholder: "listicles of 10 tips, one vendor comparison, nothing with real numbers" },
      { key: "product", label: "Your product and its honest relevance", placeholder: "barcode scanning app; relevant to 2 of the likely tips" },
      { key: "proof_assets", label: "Unique assets you hold", placeholder: "error-rate data from 40 warehouses, one named customer story" },
    ],
    template: `Write an SEO content brief for the query "{{keyword}}".

What ranks today (my notes, not your guess): {{serp_notes}}
Our product and its honest relevance: {{product}}
Unique assets we can use: {{proof_assets}}

Deliver: (1) the dominant search intent in one sentence and the content type that serves it; (2) an H2/H3 outline where every section earns its place by answering something a searcher at this intent actually needs — mark the two sections our unique assets make better than anything ranking; (3) entities and subtopics to cover, as a checklist; (4) title and meta description options within 60 and 155 characters; (5) where the product mention belongs and where it must NOT appear.

State the honest win condition: what this page must do better than the current results, given my SERP notes.`,
  },
  {
    id: "nurture-email",
    title: "Nurture email that teaches one thing",
    category: "Consideration",
    goal: "A middle-of-funnel email that earns the open by being useful before it sells.",
    tags: ["email", "nurture", "middle of funnel", "education"],
    tip: "Pick a lesson the reader can apply without buying — that is what makes them open the next one.",
    variables: [
      { key: "product", label: "Product", placeholder: "an expense-approval tool" },
      { key: "reader", label: "Reader and their stage", placeholder: "finance managers who downloaded our benchmark report last week" },
      { key: "lesson", label: "The one useful lesson", placeholder: "the three approval steps that cause 80 percent of delays" },
      { key: "next_step", label: "Soft next step", placeholder: "a 12-minute teardown video of a real approval flow" },
    ],
    template: `Write a nurture email for {{product}}.

Reader: {{reader}}
The one lesson this email teaches: {{lesson}}
Soft next step: {{next_step}}

Structure: a subject line under 45 characters that promises the lesson, not the product; a first line that would still make sense if the reader forgot who we are; the lesson itself in under 120 words, concrete enough to act on without buying anything; then the next step framed as "if you want to go deeper", one link only.

Rules: no "just checking in", no feature list, product named at most once, and the reader must get full value even if they never click. Give two subject line alternatives and say which psychological trigger each uses. Plain-text feel, no images required.`,
  },
  {
    id: "comparison-page",
    title: "Comparison page outline (vs competitor)",
    category: "Consideration",
    goal: "An honest us-vs-them page that converts without inviting a legal letter.",
    tags: ["comparison", "competitor", "landing page", "bottom of funnel"],
    tip: "List where the competitor genuinely wins — the page is only credible if it concedes something real.",
    variables: [
      { key: "product", label: "Your product", placeholder: "Relay, phone system for small clinics" },
      { key: "competitor", label: "Competitor", placeholder: "the incumbent enterprise phone suite" },
      { key: "we_win", label: "Where you provably win", placeholder: "setup in a day, no per-line fees, HIPAA-ready call recording" },
      { key: "they_win", label: "Where they genuinely win", placeholder: "multi-site call centres, established integrations" },
      { key: "switcher_fear", label: "Biggest switching fear", placeholder: "losing existing numbers during porting" },
    ],
    template: `Outline a comparison page: {{product}} vs {{competitor}}.

Where we provably win: {{we_win}}
Where they genuinely win: {{they_win}}
The switcher's biggest fear: {{switcher_fear}}

Produce: (1) a headline that names the real difference in choice, not "the better alternative"; (2) a section order with the job of each section; (3) the comparison table rows — only criteria a buyer actually weighs, each row marked win/lose/depends, with the "depends" rows explained honestly; (4) a section that concedes where {{competitor}} is the right choice and for whom; (5) a section that dismantles the switching fear with specifics, not reassurance.

Rules: every claim about the competitor must be checkable from their public materials — flag any I need to verify. No superlatives without a number attached.`,
  },
  {
    id: "landing-page-audit",
    title: "Landing page conversion audit",
    category: "Conversion",
    goal: "A prioritised list of conversion problems from your own page description.",
    tags: ["cro", "landing page", "audit", "conversion"],
    tip: "Paste the actual page copy — the audit is only as real as the description you give.",
    variables: [
      { key: "goal", label: "Conversion goal", placeholder: "start a free trial, no card required" },
      { key: "traffic", label: "Who lands here and from where", placeholder: "cold traffic from Meta ads about invoice chasing" },
      { key: "page_copy", label: "Current page copy (paste it)", placeholder: "headline: Get paid faster. Subhead: ... buttons: ..." },
      { key: "data", label: "Any data you have", placeholder: "62 percent bounce, mobile converts at half of desktop" },
    ],
    template: `Audit this landing page for conversion.

Goal of the page: {{goal}}
Who lands here and from where: {{traffic}}
Current copy: {{page_copy}}
Data I have: {{data}}

Evaluate in order: message match with the traffic source, clarity of the headline in five seconds, one-job-per-page focus, evidence and proof near the claim it supports, friction in the call to action, objection handling, and mobile experience implied by my data.

For each problem: what is wrong, why it costs conversions for THIS traffic, and the specific fix with rewritten copy where relevant. Rank the top three fixes by expected impact against effort. Do not suggest A/B tests where the sample size in my data makes them pointless — say so instead.`,
  },
  {
    id: "launch-plan",
    title: "Launch announcement across channels",
    category: "Conversion",
    goal: "One launch message correctly reshaped for email, social, blog and sales outreach.",
    tags: ["launch", "announcement", "channels", "messaging"],
    tip: "Define what the feature lets customers DO — a launch about the feature itself always underperforms.",
    variables: [
      { key: "launch", label: "What is launching", placeholder: "automatic payment reminders with per-client schedules" },
      { key: "outcome", label: "What it lets customers do", placeholder: "stop writing awkward chasing emails by hand" },
      { key: "audience_state", label: "Who cares most", placeholder: "existing users who invoice more than 10 clients monthly" },
      { key: "cta", label: "Primary call to action", placeholder: "turn it on from the billing tab" },
    ],
    template: `Plan the announcement for: {{launch}}.

The outcome it unlocks: {{outcome}}
Who cares most: {{audience_state}}
Primary call to action: {{cta}}

Write: (1) the core message in one sentence framed on the outcome, which every channel version must preserve; (2) an in-app/email announcement under 100 words; (3) a social post native to a text platform — hook first line, no hashtag stuffing; (4) the blog post outline with an honest "who this is not for yet" note; (5) a two-sentence version a salesperson can say on a call.

Each version must sound like its channel, keep the same core message, and end on the same call to action. Flag which single channel to invest in most for this specific audience and why.`,
  },
  {
    id: "campaign-retro",
    title: "Campaign retrospective from the numbers",
    category: "Retention & Analysis",
    goal: "An honest read of campaign results that separates signal from noise.",
    tags: ["analysis", "retrospective", "metrics", "reporting"],
    tip: "Include spend and absolute numbers, not just percentages — the model cannot judge scale without them.",
    variables: [
      { key: "campaign", label: "Campaign and goal", placeholder: "6-week webinar funnel; goal was 80 qualified signups" },
      { key: "numbers", label: "The actual numbers", placeholder: "spend 4,200; 61 signups; 38 attended; 9 demos; 2 closed" },
      { key: "context", label: "What else was happening", placeholder: "pricing page changed mid-campaign; one competitor launched" },
    ],
    template: `Run a campaign retrospective.

Campaign and goal: {{campaign}}
Actual numbers: {{numbers}}
Context that might pollute the read: {{context}}

Produce: (1) the funnel laid out stage by stage with conversion rates computed from my numbers — show the arithmetic; (2) the single stage where we lost the most against plan, with two plausible explanations, one flattering and one not; (3) which conclusions the sample size can actually support and which would be reading tea leaves; (4) how the context I listed could distort each conclusion; (5) the one change to make before running it again, and the number that will prove it worked.

Be blunt. If the campaign lost money on any reasonable payback assumption, open with that sentence.`,
  },
  {
    id: "churn-winback",
    title: "Win-back email for lapsed customers",
    category: "Retention & Analysis",
    goal: "A win-back message matched to the real reason they left, with an honest offer.",
    tags: ["churn", "winback", "retention", "email"],
    tip: "Segment by leave reason first — one email to all lapsed users is why win-backs get marked as spam.",
    variables: [
      { key: "product", label: "Product", placeholder: "a social scheduling tool" },
      { key: "segment", label: "Lapsed segment and why they left", placeholder: "cancelled within 60 days, exit survey says 'too complicated'" },
      { key: "whats_new", label: "What has genuinely changed", placeholder: "rebuilt onboarding, setup now under 10 minutes" },
      { key: "offer", label: "The offer you can honour", placeholder: "30 days free on return, no card upfront" },
    ],
    template: `Write a win-back email for {{product}}.

Segment and their leave reason: {{segment}}
What has genuinely changed since they left: {{whats_new}}
Offer: {{offer}}

Structure: a subject line that acknowledges they left without guilt-tripping; a first line that names the reason they left in their own words; proof the specific problem changed — concrete, not "we've been busy improving"; the offer stated plainly with its real terms; one-click path back.

Rules: under 130 words, no "we miss you", no fake personal sender if it will come from a system, and if what changed does not actually address their leave reason, say the honest version: tell me this segment is not winnable yet and what would have to change first. Provide one variant for mobile preview under 40 characters of preheader.`,
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
