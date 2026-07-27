/**
 * Project Manager Prompt Pack — pure prompt-assembly logic.
 *
 * Each prompt is a template with {{token}} slots. The tool substitutes the
 * project context, a word budget derived from the chosen length, and an
 * audience directive derived from who will read the output.
 */

/** Vendor rule of thumb for English prose: about four characters per token. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

const TOKEN_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Word budgets for the three output lengths. Chosen from common corporate
 * reporting practice: a status note that fits in an email preview (~120 words),
 * a one-page update (~250 words), and a full written report section (~500).
 */
export const LENGTH_PRESETS = [
  { id: "brief", label: "Brief (email body)", words: 120 },
  { id: "standard", label: "Standard (one page)", words: 250 },
  { id: "detailed", label: "Detailed (report section)", words: 500 },
];

/** Reader profiles change how much jargon and detail the output may carry. */
export const AUDIENCE_PROFILES = [
  {
    id: "team",
    label: "Delivery team",
    directive:
      "The reader is on the delivery team. Use the project's own terminology, name systems and tickets directly, and skip background explanation.",
  },
  {
    id: "sponsor",
    label: "Sponsor / steering group",
    directive:
      "The reader is a sponsor who sees this project for fifteen minutes a month. Lead with decisions needed and money or date impact. Expand every acronym on first use.",
  },
  {
    id: "exec",
    label: "Executive / board",
    directive:
      "The reader is an executive. Give the outcome first, the reason second, and the ask third. No implementation detail, no tool names, no more than one paragraph before the ask.",
  },
  {
    id: "client",
    label: "External client",
    directive:
      "The reader is an external client. Stay factual and neutral, avoid internal blame or team names, and never commit to a date that is not stated in my notes.",
  },
];

export const PROJECT_METHODS = ["Scrum", "Kanban", "Waterfall", "Hybrid", "Not formalised"];

export const CONTEXT_FIELDS = [
  { key: "project", label: "Project name", placeholder: "Atlas billing migration", type: "text", required: true },
  { key: "goal", label: "Outcome the project must deliver", placeholder: "move 40k accounts off the legacy biller by March", type: "text", required: true },
  { key: "stakeholders", label: "Key stakeholders", placeholder: "Finance director, CS lead, two vendor PMs", type: "text", required: true },
  { key: "method", label: "Delivery method", type: "select", required: true, options: PROJECT_METHODS },
  { key: "context", label: "This period's raw notes", placeholder: "vendor API sandbox slipped 2 weeks; UAT unblocked; 3 open defects", type: "textarea", required: false },
];

export const PROMPT_CATEGORIES = ["Reporting", "Risk", "Stakeholders", "Planning"];

export const PM_PROMPTS = [
  {
    id: "status-update",
    title: "Weekly status update",
    category: "Reporting",
    useWhen: "The update is due and your notes are a bullet dump.",
    template: `You are an experienced delivery manager writing a written status update.

Project: {{project}}
Objective: {{goal}}
Delivery method: {{method}}
Stakeholders: {{stakeholders}}
This period's notes: {{context}}

{{audienceDirective}}

Write the update in at most {{wordBudget}} words using these headings: Overall status (Green / Amber / Red with a one-line reason), Progress this period, Planned next period, Risks and issues needing a decision, and Asks. Use only facts present in my notes; where a figure or date is missing write [TBC] rather than estimating it. State the status colour first, and justify an Amber or Red with the specific date or scope at risk.`,
  },
  {
    id: "raid-log",
    title: "Build a RAID log",
    category: "Risk",
    useWhen: "Risks live in people's heads instead of a register.",
    template: `Act as a PMO lead building a RAID log.

Project: {{project}}
Objective: {{goal}}
Delivery method: {{method}}
What we know today: {{context}}

Produce four tables — Risks, Assumptions, Issues, Dependencies. For every Risk give: description in cause-event-effect form, probability (Low/Medium/High), impact (Low/Medium/High), the resulting priority, the mitigation, the trigger that means it has become an Issue, and a named owner role. For every Assumption give the date it must be validated by and what breaks if it is wrong. For every Dependency give the direction (we need them / they need us) and the latest date it can land without moving the plan. Do not invent risks that are not implied by my notes; instead list the questions you would need answered.`,
  },
  {
    id: "risk-escalation",
    title: "Write a risk escalation",
    category: "Risk",
    useWhen: "A risk has crossed the threshold and needs a decision above you.",
    template: `Write an escalation memo for a project risk.

Project: {{project}}
Objective: {{goal}}
Stakeholders: {{stakeholders}}
The risk and what has changed: {{context}}

{{audienceDirective}}

Keep it under {{wordBudget}} words. Structure: what has changed, the consequence in date, cost or scope terms, what the team has already done, the options with the trade-off of each stated in one line, the recommendation, and the decision date after which the recommendation stops being available. No blame, no adjectives, no more than one option marked as recommended.`,
  },
  {
    id: "stakeholder-email",
    title: "Stakeholder email",
    category: "Stakeholders",
    useWhen: "You need one email that lands with a specific reader.",
    template: `Draft a stakeholder email.

Project: {{project}}
Objective: {{goal}}
Recipient: {{stakeholders}}
What I need to say: {{context}}

{{audienceDirective}}

Write a subject line under 60 characters that states the outcome, not the topic. Body under {{wordBudget}} words, with the ask in the first three lines and any detail below it. End with a single, explicit next step naming who does what by when. Give me one alternative subject line and one sentence explaining which reader each would suit.`,
  },
  {
    id: "delay-message",
    title: "Announce a delay",
    category: "Stakeholders",
    useWhen: "A date has moved and the message must go out today.",
    template: `Write the message announcing a schedule change.

Project: {{project}}
Objective: {{goal}}
Audience: {{stakeholders}}
What slipped and why: {{context}}

{{audienceDirective}}

Under {{wordBudget}} words. Lead with the new date, then the reason in one sentence with no hedging, then what is unaffected, then what the team changed so it does not recur, then the ask. Do not apologise more than once. Do not present a new date unless it appears in my notes — if it is not there, say when the new date will be confirmed instead.`,
  },
  {
    id: "kickoff-brief",
    title: "Project kickoff brief",
    category: "Planning",
    useWhen: "The project is starting and scope is still a conversation.",
    template: `Write a one-page project kickoff brief.

Project: {{project}}
Objective: {{goal}}
Delivery method: {{method}}
Stakeholders: {{stakeholders}}
What we know so far: {{context}}

Cover: the problem in the sponsor's words, the measurable outcome with a target and a date, what is explicitly out of scope, the decision-making model (who decides, who is consulted, who is only informed), the milestone skeleton, the top three risks, and the definition of done. Keep the whole brief under {{wordBudget}} words. Mark every statement that is currently an assumption rather than an agreement.`,
  },
  {
    id: "milestone-plan",
    title: "Draft a milestone plan",
    category: "Planning",
    useWhen: "You need a date skeleton you can defend in a steering meeting.",
    template: `Build a milestone plan.

Project: {{project}}
Objective: {{goal}}
Delivery method: {{method}}
Known dates, constraints and dependencies: {{context}}

Produce a milestone table with: milestone name, the observable evidence that it is complete, the owner role, the predecessor it depends on, and the float before it starts moving the end date. Identify the critical path explicitly and mark which milestones are not on it. Flag every milestone whose completion evidence is a document rather than a working outcome, and suggest a stronger test. Do not invent calendar dates that are not in my notes; use relative sequencing where a date is unknown.`,
  },
  {
    id: "scope-change",
    title: "Scope change request",
    category: "Planning",
    useWhen: "Someone asked for 'one small extra thing'.",
    template: `Write a scope change request.

Project: {{project}}
Objective: {{goal}}
Requester and request: {{context}}
Approvers: {{stakeholders}}

{{audienceDirective}}

Under {{wordBudget}} words. Include: the change described in the requester's terms, why it is being asked for, the impact on schedule, cost, quality and risk stated separately, what would have to be dropped to absorb it inside the current plan, and three options — accept, defer to a later phase, decline — each with its consequence. Recommend one. Never present a change as free.`,
  },
  {
    id: "retro-facilitation",
    title: "Run a retrospective",
    category: "Reporting",
    useWhen: "Retros have turned into a polite list of the same complaints.",
    template: `Design a retrospective that produces change, not a list.

Project: {{project}}
Delivery method: {{method}}
Team and stakeholders: {{stakeholders}}
What happened this period: {{context}}

Give me: a 60-minute agenda with timings, three opening questions that surface what people are avoiding, a technique for separating problems the team owns from problems it can only escalate, and a closing step that converts at most three findings into actions with an owner and a date. Add the four facilitation traps most likely with this team and the specific intervention for each. Do not propose more than three actions.`,
  },
  {
    id: "meeting-to-actions",
    title: "Turn meeting notes into actions",
    category: "Reporting",
    useWhen: "You have a page of notes and no decisions written down.",
    template: `Convert raw meeting notes into a decision and action record.

Project: {{project}}
Attendees / stakeholders: {{stakeholders}}
Raw notes: {{context}}

Output three sections: Decisions made (each with the decision, who made it and what it supersedes), Actions (each with a verb-first description, an owner, a due date and the evidence of completion), and Open questions (each with who must answer it and by when). Anything in the notes that is neither a decision, an action nor an open question goes in a final Discussion-only list. Where an owner or date is absent from the notes write [owner TBC] or [date TBC] — never assign one yourself. Keep it under {{wordBudget}} words.`,
  },
  {
    id: "dependency-check",
    title: "Interrogate a dependency",
    category: "Risk",
    useWhen: "Another team owes you something and 'it's on track'.",
    template: `Help me stress-test a cross-team dependency.

Project: {{project}}
Objective: {{goal}}
The dependency: {{context}}
People involved: {{stakeholders}}

Write ten questions I should ask the owning team that distinguish real readiness from optimism — questions about what is already working, what has been tested, and what has to be true. For each question, state the answer that should reassure me and the answer that means I need a contingency. Then propose two contingency options with the lead time each needs, and the date by which I must trigger them.`,
  },
  {
    id: "resource-conflict",
    title: "Resolve a resource conflict",
    category: "Stakeholders",
    useWhen: "Two projects want the same person in the same fortnight.",
    template: `Help me resolve a resource conflict without escalating badly.

Project: {{project}}
Objective: {{goal}}
Stakeholders: {{stakeholders}}
The conflict: {{context}}

{{audienceDirective}}

Produce, in under {{wordBudget}} words: a neutral statement of the conflict with both projects' needs given equal weight, the impact on each if it loses, three splitting options (sequence, share, substitute) with the cost of each, the data I need before the conversation, and the framing sentence I should open with. Do not argue that my project matters more; argue from dates and consequences.`,
  },
];

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

export function getPrompt(promptId) {
  return PM_PROMPTS.find((prompt) => prompt.id === promptId) || null;
}

export function getLengthPreset(lengthId) {
  return LENGTH_PRESETS.find((preset) => preset.id === lengthId) || null;
}

export function getAudienceProfile(audienceId) {
  return AUDIENCE_PROFILES.find((profile) => profile.id === audienceId) || null;
}

/**
 * Build one finished prompt, injecting the derived word budget and the
 * audience directive alongside the project context.
 */
export function buildPrompt({ promptId, values, lengthId, audienceId } = {}) {
  const prompt = getPrompt(promptId);
  if (!prompt) return { error: "Pick a prompt from the list to build." };
  const preset = getLengthPreset(lengthId);
  if (!preset) return { error: "Choose an output length." };
  const profile = getAudienceProfile(audienceId);
  if (!profile) return { error: "Choose who will read the output." };

  const merged = {
    ...(values && typeof values === "object" ? values : {}),
    wordBudget: String(preset.words),
    audienceDirective: profile.directive,
  };
  const filled = fillTemplate(prompt.template, merged);
  if (filled.error) return { error: filled.error };

  return {
    id: prompt.id,
    title: prompt.title,
    category: prompt.category,
    useWhen: prompt.useWhen,
    text: filled.text,
    missing: filled.missing,
    wordBudget: preset.words,
    audienceLabel: profile.label,
    ...measureText(filled.text),
  };
}

export function filterPrompts({ category, query } = {}) {
  const wanted = typeof category === "string" ? category.trim() : "";
  const needle = typeof query === "string" ? query.trim().toLowerCase() : "";
  return PM_PROMPTS.filter((prompt) => {
    if (wanted && wanted !== "All" && prompt.category !== wanted) return false;
    if (!needle) return true;
    return (
      prompt.title.toLowerCase().includes(needle) ||
      prompt.category.toLowerCase().includes(needle) ||
      prompt.useWhen.toLowerCase().includes(needle)
    );
  });
}

export function buildPack({ values, category, lengthId, audienceId } = {}) {
  const prompts = filterPrompts({ category });
  if (prompts.length === 0) return { error: "No prompts match that category." };
  const blocks = [];
  const missing = [];
  for (const prompt of prompts) {
    const built = buildPrompt({ promptId: prompt.id, values, lengthId, audienceId });
    if (built.error) return { error: built.error };
    for (const key of built.missing) if (!missing.includes(key)) missing.push(key);
    blocks.push(`## ${built.title}\nUse when: ${built.useWhen}\n\n${built.text}`);
  }
  const text = blocks.join("\n\n---\n\n");
  return { text, count: blocks.length, missing, ...measureText(text) };
}
