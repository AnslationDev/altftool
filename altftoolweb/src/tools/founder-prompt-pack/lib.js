/**
 * Founder Prompt Pack — pure prompt-assembly logic.
 *
 * Every prompt is a template containing {{placeholder}} tokens. The tool
 * substitutes the founder's own context into those tokens and reports any
 * token that was left unfilled, so a prompt is never pasted into a model with
 * a literal "{{company}}" still inside it.
 */

/**
 * Rule-of-thumb used by every major tokeniser vendor for ordinary English
 * prose: one token is roughly four characters. Used only for a rough size
 * estimate, never for billing.
 */
export const AVERAGE_CHARS_PER_TOKEN = 4;

/** Placeholder syntax: {{key}} with optional surrounding whitespace. */
const TOKEN_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** The single context form shared by every prompt in the pack. */
export const CONTEXT_FIELDS = [
  {
    key: "company",
    label: "Company name",
    placeholder: "Northwind Labs",
    type: "text",
    required: true,
  },
  {
    key: "product",
    label: "What you build (one line)",
    placeholder: "an inventory forecasting app for small retailers",
    type: "text",
    required: true,
  },
  {
    key: "audience",
    label: "Who you sell to",
    placeholder: "operations managers at 5-50 store retail chains",
    type: "text",
    required: true,
  },
  {
    key: "stage",
    label: "Stage",
    type: "select",
    required: true,
    options: ["Bootstrapped", "Pre-seed", "Seed", "Series A", "Series B or later"],
  },
  {
    key: "context",
    label: "Situation or extra detail",
    placeholder: "we grew 18% MoM but churn doubled last quarter",
    type: "textarea",
    required: false,
  },
];

export const PROMPT_CATEGORIES = [
  "Strategy",
  "Investor comms",
  "Hiring",
  "Customers",
];

export const FOUNDER_PROMPTS = [
  {
    id: "positioning-statement",
    title: "Sharpen the positioning statement",
    category: "Strategy",
    useWhen: "The website, the pitch and the sales call each describe the product differently.",
    template: `You are a positioning strategist who has worked with early-stage B2B companies.

Company: {{company}} ({{stage}})
Product: {{product}}
Customer: {{audience}}
Extra context: {{context}}

Write three competing positioning statements for this company. Each one must follow the form:
"For [customer] who [problem], {{company}} is the [category] that [key benefit]. Unlike [alternative], we [differentiator]."

For each statement, name the category it claims, the alternative it fights, and the single proof point the company would need to make the claim credible. Then say which of the three you would ship and why, in no more than four sentences. Do not invent customer names, revenue figures or funding amounts.`,
  },
  {
    id: "quarterly-okrs",
    title: "Draft quarterly OKRs",
    category: "Strategy",
    useWhen: "You need a quarter plan that fits on one page and is actually measurable.",
    template: `Act as an operating partner helping a {{stage}} founder plan the next quarter.

Company: {{company}}
Product: {{product}}
Customer: {{audience}}
Current situation: {{context}}

Propose exactly three Objectives. Each Objective gets two to four Key Results. Every Key Result must state a starting number, a target number and the date it is measured, and must be something the team can move directly rather than a lagging outcome they only observe. Flag any Key Result that is really a task list rather than a measurement, and rewrite it. Finish with the one thing the company should explicitly NOT do this quarter, and the cost of that choice.`,
  },
  {
    id: "strategy-premortem",
    title: "Run a strategy pre-mortem",
    category: "Strategy",
    useWhen: "Before committing the team to a big bet you cannot easily reverse.",
    template: `Run a pre-mortem on the plan below.

Company: {{company}} ({{stage}})
Product: {{product}}
Customer: {{audience}}
The plan: {{context}}

Assume it is twelve months from now and this plan failed badly. Write the post-mortem: list the eight most likely causes of failure, ordered by probability, and for each one give the earliest observable signal that it is happening and the specific metric or check that would surface that signal. Separate the causes that are inside the team's control from the ones that are not. End with the two cheapest experiments that would falsify the riskiest assumption before the money is spent.`,
  },
  {
    id: "pricing-experiment",
    title: "Design a pricing experiment",
    category: "Strategy",
    useWhen: "You suspect you are underpriced but cannot risk breaking the funnel.",
    template: `You are a pricing advisor for a {{stage}} software company.

Company: {{company}}
Product: {{product}}
Customer: {{audience}}
What we charge today and what worries us: {{context}}

Propose three pricing structures: one packaging change, one value-metric change, and one price-level change. For each, state the hypothesis, the value metric it bills on, who it would upset, and how to test it on new customers only so existing accounts are not disturbed. Specify the sample size logic in plain words, the minimum test length, and the single decision rule that ends the test. Do not claim a percentage revenue lift you cannot support.`,
  },
  {
    id: "investor-update",
    title: "Write the monthly investor update",
    category: "Investor comms",
    useWhen: "The end of the month arrived and the update is late again.",
    template: `Write a monthly investor update email for a {{stage}} company.

Company: {{company}}
Product: {{product}}
Customer: {{audience}}
This month's raw notes: {{context}}

Structure it as: one-line TL;DR, Metrics (a short table of the figures given, with the change from last month), What went well, What did not, Asks (two or three specific, named requests investors can act on), and Runway. Keep it under 400 words. Use only numbers that appear in my notes — if a number is missing, insert [TBC] rather than estimating it. Lead with the bad news, not the good news.`,
  },
  {
    id: "pitch-narrative",
    title: "Build the pitch narrative",
    category: "Investor comms",
    useWhen: "The deck is a pile of slides rather than an argument.",
    template: `You are a pitch coach preparing a {{stage}} founder for investor meetings.

Company: {{company}}
Product: {{product}}
Customer: {{audience}}
What we have proven so far: {{context}}

Turn this into a ten-slide narrative arc: change in the world, the problem it creates, why now, what we built, how it works, early proof, market, business model, team, and the ask. Write the single sentence that each slide must land, then the one piece of evidence that sentence stands on. Mark every sentence that currently has no evidence behind it. Do not fabricate traction, logos or market sizes.`,
  },
  {
    id: "objection-prep",
    title: "Prepare for investor objections",
    category: "Investor comms",
    useWhen: "You keep getting a second meeting and then silence.",
    template: `Play a sceptical partner at a fund that sees hundreds of {{stage}} companies a year.

Company: {{company}}
Product: {{product}}
Customer: {{audience}}
Known weak spots: {{context}}

List the fifteen hardest questions you would ask, ordered from most to least likely to kill the deal. For each: why the question is really being asked, the worst possible answer, and the shape of a strong answer in two sentences. Then pick the three questions this company currently cannot answer well and say what evidence would need to exist before the next meeting.`,
  },
  {
    id: "role-scorecard",
    title: "Write a hiring scorecard",
    category: "Hiring",
    useWhen: "You are about to open a role and the job description is a wish list.",
    template: `Write a hiring scorecard, not a job advert.

Company: {{company}} ({{stage}})
Product: {{product}}
Customer: {{audience}}
The role and why it exists now: {{context}}

Produce: the mission of the role in one sentence; four to six outcomes with a number and a deadline attached to each; the competencies required to hit those outcomes; and the competencies that are explicitly not required. Then list three signals in a CV that would be genuinely predictive for these outcomes and three that founders commonly over-weight and should ignore. Keep the language free of seniority inflation.`,
  },
  {
    id: "interview-questions",
    title: "Generate interview questions that discriminate",
    category: "Hiring",
    useWhen: "Every candidate sounds good in the interview and struggles in the job.",
    template: `Design a structured interview for a small {{stage}} team.

Company: {{company}}
Product: {{product}}
Customer: {{audience}}
Role and the outcomes it owns: {{context}}

Give me eight behavioural questions that ask about what the candidate actually did, not what they would do. For each: the competency it tests, the follow-up probe that separates people who did the work from people who watched it, and a three-level scoring rubric (below bar, at bar, above bar) with a concrete example answer at each level. Avoid brain teasers, hypotheticals and culture-fit questions that reward similarity to the interviewer.`,
  },
  {
    id: "first-90-days",
    title: "Plan a new hire's first 90 days",
    category: "Hiring",
    useWhen: "Someone senior is starting and there is no plan beyond week one.",
    template: `Write a 30/60/90 day plan for a new joiner at a {{stage}} company.

Company: {{company}}
Product: {{product}}
Customer: {{audience}}
Role, reporting line and the state of the team: {{context}}

For each phase give: what they should have learned, what they should have shipped, who they must have met and why, and the one decision they are expected to own by the end of that phase. Add the three failure modes most likely for this role in a small team and the check-in question that catches each one early. End with what the manager must do in week one to make the plan possible.`,
  },
  {
    id: "discovery-script",
    title: "Write a customer discovery script",
    category: "Customers",
    useWhen: "You need real problem evidence, not people politely liking your idea.",
    template: `Write a customer discovery interview script.

Company: {{company}} ({{stage}})
Product: {{product}}
Person being interviewed: {{audience}}
What I am trying to learn: {{context}}

Produce twelve questions about the interviewee's past behaviour and current workarounds, with no mention of my product until the very end. Order them from broad context to specific incident. Mark which questions test problem existence, which test problem severity, and which test willingness to pay. List five leading questions I must avoid and the neutral rewrite of each. Finish with the three signals in a transcript that mean the problem is real and the three that mean the interviewee was just being polite.`,
  },
  {
    id: "churn-diagnosis",
    title: "Diagnose churn from first principles",
    category: "Customers",
    useWhen: "Retention slipped and nobody agrees on why.",
    template: `Help a {{stage}} founder diagnose churn.

Company: {{company}}
Product: {{product}}
Customer: {{audience}}
What we know about the churn so far: {{context}}

Build a diagnosis tree: separate churn caused by bad acquisition fit, by onboarding failure, by missing value delivery, by a competitor, and by the buyer's own circumstances. For each branch state the data cut that would confirm or rule it out, using data a small company plausibly has. Then write the five questions to ask a churned customer in a ten-minute call, in the order that gets the most honest answers. Do not propose a discount as the first remedy.`,
  },
];

/** Every {{token}} used inside a template, in order of first appearance. */
export function extractTokens(template) {
  if (typeof template !== "string") return [];
  const found = [];
  const pattern = new RegExp(TOKEN_PATTERN.source, "g");
  let match = pattern.exec(template);
  while (match !== null) {
    if (!found.includes(match[1])) found.push(match[1]);
    match = pattern.exec(template);
  }
  return found;
}

function normaliseValues(values) {
  const clean = {};
  if (values && typeof values === "object") {
    for (const key of Object.keys(values)) {
      const raw = values[key];
      clean[key] = typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw).trim();
    }
  }
  return clean;
}

/**
 * Substitute values into a template.
 * Returns the filled text plus the list of tokens that had no value.
 */
export function fillTemplate(template, values) {
  if (typeof template !== "string" || template.length === 0) {
    return { error: "The prompt template is empty." };
  }
  const clean = normaliseValues(values);
  const missing = [];
  const text = template.replace(TOKEN_PATTERN, (whole, key) => {
    const value = clean[key];
    if (!value) {
      if (!missing.includes(key)) missing.push(key);
      return `[${key}]`;
    }
    return value;
  });
  return { text, missing };
}

/** Rough size of a piece of text: characters, words and an approximate token count. */
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

/** Look up one prompt by id. */
export function getPrompt(promptId) {
  return FOUNDER_PROMPTS.find((prompt) => prompt.id === promptId) || null;
}

/**
 * Build one finished prompt.
 * @returns {{error:string}|{id,title,category,useWhen,text,missing,characters,words,approxTokens}}
 */
export function buildPrompt({ promptId, values } = {}) {
  const prompt = getPrompt(promptId);
  if (!prompt) return { error: "Pick a prompt from the list to build." };
  const filled = fillTemplate(prompt.template, values);
  if (filled.error) return { error: filled.error };
  const size = measureText(filled.text);
  return {
    id: prompt.id,
    title: prompt.title,
    category: prompt.category,
    useWhen: prompt.useWhen,
    text: filled.text,
    missing: filled.missing,
    ...size,
  };
}

/** Filter the library by category and free-text search. */
export function filterPrompts({ category, query } = {}) {
  const wanted = typeof category === "string" ? category.trim() : "";
  const needle = typeof query === "string" ? query.trim().toLowerCase() : "";
  return FOUNDER_PROMPTS.filter((prompt) => {
    if (wanted && wanted !== "All" && prompt.category !== wanted) return false;
    if (!needle) return true;
    return (
      prompt.title.toLowerCase().includes(needle) ||
      prompt.category.toLowerCase().includes(needle) ||
      prompt.useWhen.toLowerCase().includes(needle)
    );
  });
}

/**
 * Build every prompt in a category (or the whole pack) as one copyable document.
 */
export function buildPack({ values, category } = {}) {
  const prompts = filterPrompts({ category });
  if (prompts.length === 0) return { error: "No prompts match that category." };
  const blocks = [];
  const missing = [];
  for (const prompt of prompts) {
    const built = buildPrompt({ promptId: prompt.id, values });
    if (built.error) continue;
    for (const key of built.missing) if (!missing.includes(key)) missing.push(key);
    blocks.push(`## ${built.title}\nUse when: ${built.useWhen}\n\n${built.text}`);
  }
  if (blocks.length === 0) return { error: "No prompts could be built." };
  const text = blocks.join("\n\n---\n\n");
  return { text, count: blocks.length, missing, ...measureText(text) };
}
