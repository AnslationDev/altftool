/**
 * HR Prompt Pack — prompt library + a pure template engine.
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
  "Hiring",
  "Job Descriptions",
  "Onboarding",
  "Policies",
  "Performance",
  "Employee Comms",
];

export const PROMPTS = [
  {
    id: "job-post",
    title: "Inclusive job post from a role brief",
    category: "Job Descriptions",
    goal: "Turn a manager's rough brief into a job ad that describes the work, not a wish list.",
    tags: ["job description", "hiring", "job ad", "inclusive"],
    tip: "Give the real salary band — ads without one get measurably fewer applications and are now mandatory in several jurisdictions.",
    variables: [
      { key: "role", label: "Role title", placeholder: "Senior Support Engineer" },
      { key: "company", label: "Company and what it does", placeholder: "Northwind, payroll software for clinics, 60 people" },
      { key: "outcomes", label: "First-year outcomes", placeholder: "cut first-response time to under 2 hours, build a help centre" },
      { key: "must_haves", label: "Genuine must-haves", placeholder: "3+ years supporting a technical B2B product, SQL basics" },
      { key: "package", label: "Salary band, location and working pattern", placeholder: "GBP 48-56k, hybrid 2 days in Leeds, 4-day-week trial" },
    ],
    template: `Act as an experienced talent partner. Write a job post for a {{role}} at {{company}}.

What success looks like in year one: {{outcomes}}
Genuine must-haves: {{must_haves}}
Package, location and working pattern: {{package}}

Structure it as: a two-sentence opener about the problem the role solves, "what you will do" as five outcome statements rather than a task list, "what we need" split into must-haves and nice-to-haves with no more than five must-haves, the package and working pattern, and the hiring process step by step with the expected timeline.

Rules: no "rockstar", "ninja", "family" or "work hard play hard"; no unpaid test tasks; do not list a degree unless the work genuinely requires it; keep sentences under 25 words; write at roughly a grade 8 reading level. Flag any requirement in my brief that is likely to screen out good candidates for no real reason.`,
  },
  {
    id: "jd-debias",
    title: "De-bias an existing job advert",
    category: "Job Descriptions",
    goal: "Find the wording that narrows your applicant pool without improving the hire.",
    tags: ["bias", "job ad", "rewrite", "inclusion"],
    tip: "Paste the ad exactly as published, including the benefits section — that is where most of the coded language hides.",
    variables: [
      { key: "advert", label: "Current advert text", placeholder: "paste the full advert here" },
      { key: "role_reality", label: "What the job actually involves", placeholder: "80% ticket triage, 20% writing docs, no on-call" },
      { key: "market", label: "Market and location", placeholder: "UK, remote-first, competitive support market" },
    ],
    template: `Review this job advert for wording that narrows the applicant pool without improving the quality of hire.

Advert:
{{advert}}

What the job actually involves: {{role_reality}}
Market and location: {{market}}

Return a table with four columns: the exact phrase, why it may deter or exclude candidates, the evidence-based concern (masculine-coded language, unnecessary credential, unstated seniority signal, ableist phrasing, age proxy such as "digital native", or culture-fit language), and a replacement phrase.

Then rewrite the full advert with your replacements applied. Finally list requirements that should be removed entirely because the work described does not need them, and say which ones you are unsure about and why.`,
  },
  {
    id: "structured-interview",
    title: "Structured interview guide with scorecard",
    category: "Hiring",
    goal: "The same questions and the same rubric for every candidate, so the comparison is real.",
    tags: ["interview", "structured", "scorecard", "star"],
    tip: "Structured interviews only work if every interviewer asks the same questions — agree the guide before the first screen, not after.",
    variables: [
      { key: "role", label: "Role", placeholder: "Senior Support Engineer" },
      { key: "competencies", label: "Competencies to assess", placeholder: "technical troubleshooting, written clarity, calm under pressure" },
      { key: "stage", label: "Interview stage and length", placeholder: "second round, 45 minutes, hiring manager" },
      { key: "context", label: "Team context", placeholder: "team of 4, high ticket volume, customers are clinic staff" },
    ],
    template: `Build a structured interview guide for a {{role}}.

Competencies to assess: {{competencies}}
Stage and length: {{stage}}
Team context: {{context}}

For each competency give: two behavioural questions in STAR form ("tell me about a time when..."), two follow-up probes that dig for the candidate's own contribution rather than the team's, and a four-level rubric (1 = does not meet, 2 = partially meets, 3 = meets, 4 = exceeds) where each level describes observable evidence, not impressions.

Add a realistic time allocation that fits the stated length, an opening script explaining the format to the candidate, and five minutes for their questions. End with three questions interviewers commonly ask for this role that should NOT be asked, with the reason — legal risk, no predictive value, or answerable by anyone who has read the website.`,
  },
  {
    id: "screening-call",
    title: "Phone screen script and knockout criteria",
    category: "Hiring",
    goal: "A 20-minute screen that filters on facts rather than rapport.",
    tags: ["screening", "phone screen", "recruiter", "shortlist"],
    tip: "Decide the knockout criteria before you speak to anyone; deciding afterwards is how bias gets in.",
    variables: [
      { key: "role", label: "Role", placeholder: "Senior Support Engineer" },
      { key: "must_haves", label: "Non-negotiables", placeholder: "eligible to work in the UK, can work 2 days in Leeds" },
      { key: "package", label: "Package to disclose", placeholder: "GBP 48-56k plus 5% bonus" },
      { key: "process", label: "Rest of the process", placeholder: "take-home (paid, 90 min), panel, manager chat" },
    ],
    template: `Write a 20-minute recruiter screening script for a {{role}}.

Non-negotiables: {{must_haves}}
Package to disclose on this call: {{package}}
Rest of the process: {{process}}

Give: a 60-second role pitch; the order in which to cover motivation, relevant experience, non-negotiables, package expectations and logistics; the exact wording for each question; and a note on what a strong versus weak answer sounds like.

Cover the package early enough that neither side wastes time. Include the wording for a clean rejection at the end of the call when a non-negotiable is not met, and the wording for "we will come back to you by X". List any question that would touch a protected characteristic — age, health, family plans, religion, nationality beyond right to work — so the interviewer knows to avoid it.`,
  },
  {
    id: "onboarding-plan",
    title: "30-60-90 day onboarding plan",
    category: "Onboarding",
    goal: "A new starter plan with owners and checkpoints instead of a folder of links.",
    tags: ["onboarding", "30-60-90", "new hire", "ramp"],
    tip: "Assign a named owner to every item — unowned onboarding tasks are the ones that quietly do not happen.",
    variables: [
      { key: "role", label: "Role", placeholder: "Senior Support Engineer" },
      { key: "manager", label: "Manager and buddy", placeholder: "manager Priya, buddy Tom from the docs team" },
      { key: "first_win", label: "Target first win", placeholder: "own the Tuesday triage rota solo by week 4" },
      { key: "systems", label: "Systems and access needed", placeholder: "Zendesk, read-only DB, staging admin, on-call tool" },
    ],
    template: `Write a 30-60-90 day onboarding plan for a new {{role}}.

Manager and buddy: {{manager}}
Target first win: {{first_win}}
Systems and access needed: {{systems}}

Structure it as: day one, week one, then the 30, 60 and 90 day blocks. For each block give the outcomes (not activities), the specific people to meet and why, the systems and access required with the owner responsible for granting them, the reading or shadowing, and the checkpoint conversation with the questions the manager should ask.

Every item needs a named owner and a due day. Mark which items are blocking for the next block. End with the five signals in the first 30 days that indicate this hire is struggling and what the manager should do about each one.`,
  },
  {
    id: "welcome-comms",
    title: "First-week welcome pack and schedule",
    category: "Onboarding",
    goal: "The messages and calendar a new starter needs before day one.",
    tags: ["welcome", "first day", "communication", "new hire"],
    tip: "Send the pre-start email at least three working days ahead so equipment problems surface before day one.",
    variables: [
      { key: "name_role", label: "New starter and role", placeholder: "Sam, joining as Senior Support Engineer" },
      { key: "start_details", label: "Start date, time and place", placeholder: "Monday 3 March, 10am, Leeds office reception" },
      { key: "team", label: "Team they join", placeholder: "4-person support team, mostly remote, standup at 9:30" },
      { key: "logistics", label: "Equipment and logistics", placeholder: "laptop posted Friday, badge on arrival, no dress code" },
    ],
    template: `Draft the first-week communications for {{name_role}}.

Start date, time and place: {{start_details}}
Team they are joining: {{team}}
Equipment and logistics: {{logistics}}

Produce four things:
1. A pre-start email sent three working days ahead covering what to expect on day one, what to bring, who to ask if something goes wrong, and what NOT to worry about.
2. A team announcement message of at most 80 words, warm but not gushing, that says what the person will work on rather than listing their CV.
3. A day-one hour-by-hour schedule with breaks and no more than three hours of meetings.
4. A first-week calendar outline with named meeting owners.

Keep the tone plain and human. Do not promise anything about performance expectations that the manager has not agreed.`,
  },
  {
    id: "policy-draft",
    title: "Plain-English workplace policy draft",
    category: "Policies",
    goal: "A first draft that says what people can actually do, ready for legal review.",
    tags: ["policy", "handbook", "plain english", "compliance"],
    tip: "This produces a draft to react to, never a final policy — jurisdiction-specific rules must be checked by a lawyer.",
    variables: [
      { key: "policy_topic", label: "Policy topic", placeholder: "remote and hybrid working" },
      { key: "org", label: "Organisation and size", placeholder: "Northwind, 60 people, UK and Ireland" },
      { key: "position", label: "The position we want to take", placeholder: "2 anchor days in office, flexible hours around core 10-4" },
      { key: "edge_cases", label: "Edge cases to address", placeholder: "working abroad temporarily, home equipment, carer days" },
    ],
    template: `Draft a workplace policy on {{policy_topic}} for {{org}}.

The position we want to take: {{position}}
Edge cases that must be addressed: {{edge_cases}}

Write it in plain English at roughly a grade 8 reading level, in this structure: purpose in two sentences, who it applies to, the rules stated as what people CAN do before what they cannot, how to request an exception and who decides, what happens when the policy is not followed, and the review date.

Use short numbered clauses. Avoid legalese, "shall", and undefined terms — define anything ambiguous inline. At the end, list separately: (a) the points that must be checked against local employment law before publication, (b) the decisions a human still has to make that I did not give you, and (c) the questions employees will most likely ask that this draft does not yet answer.

Do not present this as legally reviewed or compliant.`,
  },
  {
    id: "policy-faq",
    title: "Turn a policy into an employee FAQ",
    category: "Policies",
    goal: "Answer the questions people actually ask instead of restating the clauses.",
    tags: ["faq", "policy", "internal comms", "handbook"],
    tip: "Write the awkward questions in too — if the FAQ dodges them, people will ask in group chat instead.",
    variables: [
      { key: "policy_text", label: "Policy text", placeholder: "paste the policy here" },
      { key: "audience", label: "Who is asking", placeholder: "all staff, mixed office and field-based" },
      { key: "concerns", label: "Concerns already raised", placeholder: "people worry the anchor days will creep to three" },
    ],
    template: `Turn this policy into an employee FAQ.

Policy:
{{policy_text}}

Audience: {{audience}}
Concerns already raised: {{concerns}}

Write 12 questions in the words employees would actually use, not in policy language, ordered by how often they will be asked. Each answer leads with the direct answer in the first sentence, then at most two sentences of detail, and points to the clause number it comes from.

Include the three awkward questions people will ask privately, answered honestly — if the answer is "this is a trade-off and here is why", say that. Mark any question the policy does not currently answer as "needs a decision" rather than inventing an answer. Finish with the single sentence summary someone could repeat correctly after reading once.`,
  },
  {
    id: "performance-review",
    title: "Evidence-based performance review draft",
    category: "Performance",
    goal: "A review built from specific examples rather than adjectives.",
    tags: ["performance review", "feedback", "evidence", "calibration"],
    tip: "Feed in real examples; a review generated without evidence reads as generic and will be read that way.",
    variables: [
      { key: "employee_role", label: "Employee role and level", placeholder: "Support Engineer, mid-level, 14 months in role" },
      { key: "period", label: "Review period", placeholder: "January to June" },
      { key: "evidence", label: "Specific evidence and examples", placeholder: "led the migration to the new help centre; missed two SLA weeks in March" },
      { key: "expectations", label: "Expectations for the level", placeholder: "owns a domain, unblocks self, escalates early" },
    ],
    template: `Draft a performance review for a {{employee_role}} covering {{period}}.

Evidence and examples I have: {{evidence}}
Expectations for this level: {{expectations}}

Structure: summary paragraph, what went well with the evidence attached to each point, where the impact fell short with the evidence attached, growth areas as at most three specific behaviours, and the next-period focus with measurable outcomes.

Rules: every claim must be traceable to evidence I supplied — if a section has no evidence, write "no evidence supplied" rather than filling it with adjectives. Describe behaviour and impact, never personality. Avoid "attitude", "not a team player", and any comment on communication style that could carry cultural or gender bias. Keep praise and criticism proportionate to the evidence rather than balanced for its own sake.

End with the questions the manager should ask the employee before finalising this.`,
  },
  {
    id: "difficult-conversation",
    title: "Difficult conversation script (SBI)",
    category: "Performance",
    goal: "Open a hard conversation without ambushing the person.",
    tags: ["feedback", "sbi", "conversation", "manager"],
    tip: "The Situation-Behaviour-Impact model keeps feedback on observable facts; rehearse the opening line out loud.",
    variables: [
      { key: "issue", label: "The issue", placeholder: "repeatedly missing the standup and not flagging blockers" },
      { key: "examples", label: "Specific observed examples", placeholder: "missed standup on 4, 6 and 11 March; blocker on the API surfaced a week late" },
      { key: "impact", label: "Impact on others", placeholder: "two teammates duplicated work; release slipped by three days" },
      { key: "relationship", label: "Relationship and context", placeholder: "I am their manager; they are usually strong and may be overloaded" },
    ],
    template: `Help me prepare a difficult conversation using the Situation-Behaviour-Impact model.

Issue: {{issue}}
Specific observed examples: {{examples}}
Impact on others: {{impact}}
Relationship and context: {{relationship}}

Give me: the opening two sentences word for word; the SBI statement for each example, keeping to observable behaviour with no interpretation of motive; the open question that hands them the floor; three likely responses (defensive, agreeing, disclosing something personal) with how to handle each; the agreement to reach by the end; and the follow-up commitment with a date.

Keep the whole conversation under 20 minutes. Tell me the one thing I should not say. If any part of this suggests a formal process or a health or wellbeing issue rather than a performance conversation, say so and recommend involving HR or occupational health instead of continuing.`,
  },
  {
    id: "change-announcement",
    title: "Internal change announcement",
    category: "Employee Comms",
    goal: "Say what changed, why, and what it means for me — in that order.",
    tags: ["internal comms", "announcement", "change", "restructure"],
    tip: "Publish the unanswered questions rather than hiding them; silence is filled with worse guesses.",
    variables: [
      { key: "change", label: "What is changing", placeholder: "support and success teams merging into one customer team" },
      { key: "why", label: "The honest reason", placeholder: "customers get bounced between the two teams; duplicated tooling costs" },
      { key: "impact", label: "Who is affected and how", placeholder: "9 people change manager; no roles are being removed" },
      { key: "timeline", label: "Timeline and next step", placeholder: "announced Tue, 1:1s Wed-Thu, effective 1 April" },
    ],
    template: `Write an internal announcement about a change.

What is changing: {{change}}
The honest reason: {{why}}
Who is affected and how: {{impact}}
Timeline and next step: {{timeline}}

Order it as: what is changing (one sentence), when, why, what it means for you, what happens next, and where to ask questions. Lead with the change itself — no preamble about the exciting journey.

Produce three versions: the all-hands message, a manager talking-points version with the questions their team will ask, and a two-line summary for chat. Include an explicit list of what is NOT changing, and a section of questions we cannot answer yet with the date by which we will. Do not use "synergies", "right-sizing" or "exciting opportunity" for anything that is not one.`,
  },
  {
    id: "exit-interview",
    title: "Exit interview question set",
    category: "Employee Comms",
    goal: "Questions that surface a fixable pattern rather than polite non-answers.",
    tags: ["exit interview", "attrition", "retention", "research"],
    tip: "Have someone other than the leaver's manager run it, and say up front how the answers will be used.",
    variables: [
      { key: "leaver", label: "Role and tenure", placeholder: "Support Engineer, 2 years, resigned to join a competitor" },
      { key: "known_reasons", label: "What we think we know", placeholder: "cited progression; team lost two people in six months" },
      { key: "themes", label: "Themes we want to test", placeholder: "manager load, career paths, on-call fatigue" },
    ],
    template: `Write an exit interview guide for a leaver: {{leaver}}.

What we think we already know: {{known_reasons}}
Themes we want to test: {{themes}}

Give 12 questions ordered from easiest to most sensitive, phrased to invite specifics — ask about the moment they started looking, not about general satisfaction. Include follow-up probes and a short opening script that states who will see the answers and what will not be shared with their manager.

Add: the three questions most likely to get a polite non-answer and how to rephrase them; what a "no signal" answer looks like; and how to record the responses so themes can be compared across leavers without identifying anyone in a small team. End with the two questions worth asking the leaver's manager separately.`,
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
