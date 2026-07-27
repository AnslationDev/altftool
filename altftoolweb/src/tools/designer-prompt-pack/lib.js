/**
 * Designer Prompt Pack — prompt library + a pure template engine.
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
  "Discovery",
  "Direction",
  "UI & Layout",
  "Copy & Microcopy",
  "Critique & Review",
  "Design System",
];

export const PROMPTS = [
  {
    id: "moodboard-brief",
    title: "Moodboard direction brief",
    category: "Direction",
    goal: "Turn a vague 'make it feel premium' request into three defensible visual directions.",
    tags: ["moodboard", "brand", "visual direction", "kickoff"],
    tip: "Paste the answer next to real reference images — the model names directions, you still curate them.",
    variables: [
      { key: "project", label: "Project or brand", placeholder: "Northwind, a payroll app for clinics" },
      { key: "product_type", label: "Product type", placeholder: "B2B web dashboard" },
      { key: "audience", label: "Audience", placeholder: "practice managers aged 35-55, low tolerance for clutter" },
      { key: "mood", label: "Desired feeling", placeholder: "calm, precise, quietly expensive" },
      { key: "constraints", label: "Hard constraints", placeholder: "must keep the existing navy logo, dense data tables" },
    ],
    template: `Act as a senior brand designer. I am building a moodboard for {{project}}, a {{product_type}} aimed at {{audience}}.

Desired feeling: {{mood}}
Hard constraints: {{constraints}}

Give me:
1. Three distinct visual directions, each with a one-line name and a two-sentence rationale.
2. For each direction: five imagery keywords, two typeface pairings (one display, one text, both available on Google Fonts), and a five-colour palette with hex codes and the role each colour plays.
3. One "avoid this" note per direction naming the cliche it could slide into.

Tie every rationale to the audience and the constraints, not to general taste.`,
  },
  {
    id: "palette-rationale",
    title: "Accessible colour palette with contrast maths",
    category: "Direction",
    goal: "Get a full token palette where every pair is checked against WCAG contrast minimums.",
    tags: ["colour", "palette", "contrast", "accessibility", "tokens"],
    tip: "Always re-check the returned ratios in a real contrast checker; models can miscompute them.",
    variables: [
      { key: "project", label: "Project", placeholder: "Northwind design system" },
      { key: "brand_color", label: "Brand anchor colour", placeholder: "the teal already used in our logo" },
      { key: "theme", label: "Themes required", placeholder: "light and dark, both first-class" },
      { key: "context", label: "Product context", placeholder: "dense data tables, long reading sessions" },
    ],
    template: `You are a design systems specialist. Build an accessible colour palette for {{project}}.

Brand anchor colour: {{brand_color}}
Themes required: {{theme}}
Product context: {{context}}

Return a table with: token name, hex, role, intended background, and the WCAG 2.2 contrast ratio for that pair. Body text pairs must reach at least 4.5:1, large text and UI component boundaries at least 3:1.

Cover primary, secondary, success, warning, danger, muted, foreground, background, card and border roles, and give every token a matching value for each theme. Flag any pair that fails the minimum and propose a corrected hex rather than leaving the failure in the table. Finish with the three pairings you would never allow and why.`,
  },
  {
    id: "landing-sections",
    title: "Landing page section plan",
    category: "UI & Layout",
    goal: "Decide what goes on the page and in what order before touching a canvas.",
    tags: ["landing page", "layout", "conversion", "information architecture"],
    tip: "Force the model to justify position; that is where weak sections fall out.",
    variables: [
      { key: "product", label: "Product", placeholder: "a scheduling tool for physiotherapy clinics" },
      { key: "audience", label: "Primary audience", placeholder: "clinic owners who currently use paper diaries" },
      { key: "goal", label: "Single conversion goal", placeholder: "book a 15-minute demo" },
      { key: "proof", label: "Strongest proof available", placeholder: "used by 340 clinics, average 6 hours saved per week" },
    ],
    template: `Act as a conversion-focused product designer. Plan the section order for a landing page for {{product}}.

Primary audience: {{audience}}
Single conversion goal: {{goal}}
Strongest proof we have: {{proof}}

For each section give: section name, the one job it does, the headline in eight words or fewer, the supporting line, the visual, and the reason it belongs at that position rather than higher or lower.

Stop at the number of sections the argument actually needs. Then list the three sections you deliberately left out and the argument for leaving them out.`,
  },
  {
    id: "empty-states",
    title: "Empty state and edge case set",
    category: "UI & Layout",
    goal: "Design the four screens most teams forget until QA finds them.",
    tags: ["empty state", "edge cases", "ux writing", "states"],
    tip: "Ask for the permission-denied variant explicitly or you will only get the happy-empty one.",
    variables: [
      { key: "product", label: "Product", placeholder: "a shared expense tracker" },
      { key: "screen", label: "Screen", placeholder: "the transactions list" },
      { key: "reason", label: "Why it can be empty", placeholder: "new workspace, or filters exclude everything" },
      { key: "action", label: "Next best action", placeholder: "connect a bank account" },
    ],
    template: `You are a product designer writing the empty and edge states for {{product}}.

Screen: {{screen}}
Why it can be empty: {{reason}}
Next best action: {{action}}

Write the first-use, no-results, load-error and permission-denied variants. Each one needs: an illustration idea in one line, a heading of six words or fewer, a body of at most two sentences, a primary button label of at most three words, and an optional secondary link.

Rules: never blame the user, never use "oops" or "uh-oh", and keep the primary action identical across variants unless the state makes it impossible. End with the screen-reader announcement for each state.`,
  },
  {
    id: "microcopy-rewrite",
    title: "Interface microcopy rewrite",
    category: "Copy & Microcopy",
    goal: "Three honest alternatives for a piece of UI copy, with the trade-off named.",
    tags: ["microcopy", "ux writing", "rewrite", "tone"],
    tip: "Give the model the surrounding screen too — copy judged in isolation usually gets longer, not shorter.",
    variables: [
      { key: "component", label: "Component or surface", placeholder: "delete-account confirmation modal" },
      { key: "current_copy", label: "Current copy", placeholder: "Are you sure you want to proceed with this action?" },
      { key: "reading_level", label: "Reading level", placeholder: "plain English, roughly grade 8" },
      { key: "tone", label: "Tone", placeholder: "calm and direct, no jokes" },
    ],
    template: `Rewrite this interface copy as a UX writer.

Component: {{component}}
Current copy: {{current_copy}}
Reading level: {{reading_level}}
Tone: {{tone}}

Give three rewrites: the shortest that still works, the clearest, and the warmest. For each, state the word count and exactly what you cut or added.

Constraints: sentence case, active voice, second person, no idioms that break in translation, no vague verbs like "manage" or "handle". Finish by naming the version you would ship and the one situation where a different version would win.`,
  },
  {
    id: "error-messages",
    title: "Error message set for one failure",
    category: "Copy & Microcopy",
    goal: "Inline, toast and full-page wording for the same error, plus the announcement text.",
    tags: ["errors", "microcopy", "recovery", "accessibility"],
    tip: "Keep the raw error code out of the sentence and in a copyable details string.",
    variables: [
      { key: "product", label: "Product", placeholder: "an invoicing web app" },
      { key: "failure", label: "What failed", placeholder: "the payment provider timed out while charging a card" },
      { key: "known_cause", label: "What the system knows", placeholder: "provider returned 504, the charge was not created" },
      { key: "recovery", label: "What the user can do", placeholder: "retry now, or use a different card" },
    ],
    template: `You are writing user-facing error messages for {{product}}.

Failure: {{failure}}
What the system actually knows: {{known_cause}}
What the user can do next: {{recovery}}

Produce three versions of the same message: inline (next to the field or control), toast, and full-page. Each must state what happened, why, then the single next step, in that order, and stay under 140 characters wherever the surface allows.

Do not put an error code in the sentence — supply it as a separate copyable "details" string. Never imply the user broke something when the system did. Add the ARIA live-region announcement text and say whether it should be polite or assertive.`,
  },
  {
    id: "design-critique",
    title: "Structured design critique",
    category: "Critique & Review",
    goal: "A critique ordered by what matters, with blocking issues separated from polish.",
    tags: ["critique", "review", "feedback", "hierarchy"],
    tip: "State the stage — early-stage work critiqued on visual polish wastes everyone's time.",
    variables: [
      { key: "artifact", label: "Screen or flow", placeholder: "the three-step onboarding wizard" },
      { key: "goal", label: "Design goal", placeholder: "get a first project created within two minutes" },
      { key: "constraints", label: "Known constraints", placeholder: "cannot change the backend field order this quarter" },
      { key: "stage", label: "Stage", placeholder: "mid-fidelity wireframe" },
    ],
    template: `Run a structured critique of a design.

Screen or flow: {{artifact}}
Design goal: {{goal}}
Known constraints: {{constraints}}
Stage: {{stage}}

Critique in this order, labelling each section: (1) does it meet the stated goal, (2) information hierarchy, (3) affordance and interaction, (4) content and copy, (5) accessibility, (6) consistency with the existing system.

For each point give the observation, the impact on the user, and one concrete change. Separate blocking issues from polish in two clearly headed lists. Given the stage is {{stage}}, only raise visual finish where it affects comprehension. End with the single change with the highest ratio of impact to effort.`,
  },
  {
    id: "a11y-audit",
    title: "WCAG 2.2 AA review pass",
    category: "Critique & Review",
    goal: "Catch the accessibility problems that are cheapest to fix at design time.",
    tags: ["accessibility", "wcag", "audit", "keyboard", "contrast"],
    tip: "Ask for the criterion number so each finding is checkable rather than an opinion.",
    variables: [
      { key: "artifact", label: "What is being audited", placeholder: "the checkout flow, Figma frames 12-19" },
      { key: "platform", label: "Platform", placeholder: "responsive web, mobile first" },
      { key: "interactions", label: "Interactions involved", placeholder: "multi-step form, modal, drag-to-reorder list" },
    ],
    template: `Act as an accessibility specialist reviewing {{artifact}} against WCAG 2.2 level AA.

Platform: {{platform}}
Interactions involved: {{interactions}}

Work through: text contrast (4.5:1 body, 3:1 large), non-text and UI component contrast (3:1), focus visibility and focus order, full keyboard operability including a way out of every trap, target size of at least 24 by 24 CSS pixels under 2.5.8, motion and reduced-motion handling, form labels and error identification, heading structure and landmarks, and status message announcement.

For each finding: cite the success criterion number, mark it blocking or minor, and give the specific fix. Finally list what cannot be judged from a static design and name the test needed for each.`,
  },
  {
    id: "token-naming",
    title: "Design token naming scheme",
    category: "Design System",
    goal: "A three-tier token structure a team can apply without asking you every time.",
    tags: ["design tokens", "naming", "design system", "migration"],
    tip: "Include your legacy names — the migration map is the part that actually saves time.",
    variables: [
      { key: "system_name", label: "Design system name", placeholder: "Northwind DS" },
      { key: "platforms", label: "Platforms to support", placeholder: "web (CSS variables), iOS, Android" },
      { key: "themes", label: "Themes", placeholder: "light, dark, high contrast" },
      { key: "legacy_names", label: "Legacy names to keep working", placeholder: "brandBlue, greyLight2, dangerRed" },
    ],
    template: `You are a design systems architect. Propose a token naming scheme for {{system_name}}.

Platforms to support: {{platforms}}
Themes: {{themes}}
Legacy names that must keep working: {{legacy_names}}

Give a three-tier structure — primitive, semantic, component — with the naming pattern for each tier and eight worked examples per tier. State the rule for when a new component token is justified instead of reusing a semantic one, and the rule for when a token should be deleted.

Include a migration table mapping every legacy name to its new token, and close with a short "how to name a new token" checklist a designer can follow unaided.`,
  },
  {
    id: "component-spec",
    title: "Component specification",
    category: "Design System",
    goal: "The full contract for a component: anatomy, states, API, a11y and misuse.",
    tags: ["component", "spec", "states", "api", "documentation"],
    tip: "The 'when not to use this' section prevents more inconsistency than any other part.",
    variables: [
      { key: "component", label: "Component", placeholder: "segmented control" },
      { key: "system_name", label: "Design system", placeholder: "Northwind DS" },
      { key: "purpose", label: "Purpose", placeholder: "switch between two to five mutually exclusive views" },
      { key: "variants", label: "Variants needed", placeholder: "sizes sm/md, with and without icons, full-width" },
    ],
    template: `Write a complete specification for a {{component}} in {{system_name}}.

Purpose: {{purpose}}
Variants needed: {{variants}}

Cover, in this order: anatomy with named parts; props or API with types and defaults; every state (default, hover, focus-visible, active, selected, disabled, loading, error, read-only); responsive behaviour at 375px and 1280px; the keyboard interaction map; ARIA role and attributes; content rules including maximum label length and overflow behaviour; and when NOT to use this component with the alternative to reach for instead.

Finish with three correct usage examples and three misuse examples, each one sentence.`,
  },
  {
    id: "kickoff-questions",
    title: "Design kickoff question set",
    category: "Discovery",
    goal: "Twelve questions that surface the real constraints in the first meeting.",
    tags: ["kickoff", "stakeholders", "discovery", "scope"],
    tip: "Send the questions ahead of the meeting; you will get better answers than live.",
    variables: [
      { key: "project", label: "Project", placeholder: "redesign of the reporting module" },
      { key: "stakeholders", label: "Who is in the room", placeholder: "head of product, two engineers, support lead" },
      { key: "business_goal", label: "Business goal as stated", placeholder: "reduce support tickets about exports" },
      { key: "unknowns", label: "What we do not know yet", placeholder: "who actually opens these reports and how often" },
    ],
    template: `Prepare a design kickoff for {{project}} with {{stakeholders}}.

Business goal as stated: {{business_goal}}
What we do not know yet: {{unknowns}}

Write twelve questions grouped as: outcome and success measure, users and their current workaround, scope and explicit non-goals, constraints and dependencies, decision rights and timeline.

Every question must be open, answerable in under two minutes, and impossible to answer with yes or no. Mark the one question most likely to be uncomfortable and explain in one line why it still has to be asked. End with the three answers that would mean this project should not start yet.`,
  },
  {
    id: "interview-script",
    title: "User interview script",
    category: "Discovery",
    goal: "A 30-minute script grounded in past behaviour rather than opinions about features.",
    tags: ["research", "interview", "script", "bias"],
    tip: "If a question asks 'would you use', it is not research — cut it.",
    variables: [
      { key: "topic", label: "Research topic", placeholder: "how teams currently share weekly reports" },
      { key: "participants", label: "Participants", placeholder: "six ops managers at 20-100 person companies" },
      { key: "decision", label: "Decision this informs", placeholder: "whether to build scheduled email digests" },
    ],
    template: `Write a 30-minute user interview script about {{topic}}.

Participants: {{participants}}
Decision this research will inform: {{decision}}

Structure it as: warm-up, current behaviour, a walkthrough of the last time they did this task, pain points, workarounds they built themselves, and wrap-up. Ask about past behaviour and observed workarounds only — no hypothetical or "would you use" questions.

Under each question add two follow-up probes. Give timing per section. Note what a "no signal" answer looks like so I do not over-read it. Close with the three biases most likely to distort this session and one countermeasure each.`,
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
