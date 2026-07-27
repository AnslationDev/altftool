/**
 * Teacher Prompt Pack — prompt library + a pure template engine.
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
  "Lesson Planning",
  "Assessment & Grading",
  "Differentiation",
  "Parent Communication",
  "Classroom Management",
];

export const PROMPTS = [
  {
    id: "lesson-plan",
    title: "Single lesson plan with timings",
    category: "Lesson Planning",
    goal: "A minute-by-minute plan built backwards from what students should be able to do.",
    tags: ["lesson plan", "objectives", "timings", "planning"],
    tip: "State the prior knowledge honestly — plans fail on what the model assumes students already know.",
    variables: [
      { key: "subject", label: "Subject and topic", placeholder: "Grade 8 science, photosynthesis" },
      { key: "duration", label: "Lesson length", placeholder: "45 minutes" },
      { key: "objective", label: "Learning objective", placeholder: "explain why plants need light using the word equation" },
      { key: "prior_knowledge", label: "What students already know", placeholder: "parts of a plant cell, but not chemical equations" },
      { key: "materials", label: "Materials available", placeholder: "projector, mini whiteboards, no lab access this week" },
    ],
    template: `Act as an experienced teacher planning a {{duration}} lesson on {{subject}}.

Learning objective: by the end, students can {{objective}}
What they already know: {{prior_knowledge}}
Materials available: {{materials}}

Plan backwards from the objective. Give me a timed sequence: starter (with the exact question on the board), direct instruction in chunks of no more than 8 minutes, a guided practice task, an independent task, and an exit ticket that directly measures the objective.

For each segment: minutes, what the teacher does, what students do, and the one misconception to listen for. Include a two-minute buffer and say what to cut if the starter overruns. Do not include activities that need materials I did not list.`,
  },
  {
    id: "unit-outline",
    title: "Multi-week unit outline",
    category: "Lesson Planning",
    goal: "A sequenced unit where each lesson builds on the last, with assessment points marked.",
    tags: ["unit", "scheme of work", "sequence", "curriculum"],
    tip: "Give the number of lessons you actually have, not the number the textbook assumes.",
    variables: [
      { key: "subject", label: "Subject and unit", placeholder: "Grade 6 history, ancient Egypt" },
      { key: "lessons", label: "Number of lessons", placeholder: "12 lessons of 50 minutes" },
      { key: "end_goal", label: "End-of-unit assessment", placeholder: "a source-analysis essay comparing two accounts" },
      { key: "constraints", label: "Fixed constraints", placeholder: "library day in week 2, must include one group project" },
    ],
    template: `Act as a curriculum planner. Outline a unit on {{subject}} across {{lessons}}.

End-of-unit assessment: {{end_goal}}
Fixed constraints: {{constraints}}

For each lesson give: a one-line objective phrased as "students can...", the key content, the main activity type, and any homework. Sequence so every lesson depends only on earlier ones — name the dependency explicitly where it exists.

Mark two low-stakes checkpoints before the final assessment and state exactly what each checkpoint samples. Flag the lesson most likely to need two sessions and what to drop if it does. End with a list of the three things you deliberately left out of this unit and why.`,
  },
  {
    id: "rubric-builder",
    title: "Assessment rubric with level descriptors",
    category: "Assessment & Grading",
    goal: "A rubric where the difference between levels is observable, not adjectives.",
    tags: ["rubric", "grading", "criteria", "descriptors"],
    tip: "Ban the words 'good' and 'excellent' up front — that is what makes descriptors usable.",
    variables: [
      { key: "task", label: "Task being assessed", placeholder: "a persuasive letter to the city council" },
      { key: "year_level", label: "Year level", placeholder: "Grade 7" },
      { key: "criteria", label: "Criteria to assess", placeholder: "argument structure, evidence, tone, conventions" },
      { key: "levels", label: "Number of levels", placeholder: "4 levels" },
    ],
    template: `Build an assessment rubric for {{task}} at {{year_level}} level.

Criteria: {{criteria}}
Levels: {{levels}}

Rules for descriptors: every level must describe observable features of the work — what is present, absent, or done how often — never quality adjectives like "good", "strong" or "excellent". A colleague who has never met me must be able to place a piece of work using only the words in the cell.

Lay it out as a table: criteria as rows, levels as columns. Under the table, add: (1) the single fastest discriminator between the top two levels for each criterion, and (2) three student-facing "I can" statements per criterion written in {{year_level}} language.`,
  },
  {
    id: "feedback-comments",
    title: "Written feedback from notes",
    category: "Assessment & Grading",
    goal: "Turn shorthand marking notes into specific, forward-looking student comments.",
    tags: ["feedback", "marking", "comments", "next steps"],
    tip: "Paste your real shorthand — the model is good at expanding notes but bad at inventing accurate praise.",
    variables: [
      { key: "task", label: "Task", placeholder: "narrative writing draft" },
      { key: "year_level", label: "Year level", placeholder: "Grade 5" },
      { key: "notes", label: "Your marking notes", placeholder: "great dialogue; paragraphs run on; endings rushed; capital letters inconsistent" },
      { key: "focus", label: "One improvement focus", placeholder: "paragraphing" },
    ],
    template: `Turn my marking notes into written feedback for a {{year_level}} student on their {{task}}.

My notes: {{notes}}
The one improvement focus for this student: {{focus}}

Write three short paragraphs: what worked (specific to my notes, no generic praise), the one thing to improve (only {{focus}} — ignore other errors for now), and a concrete next step the student can do in under ten minutes on this same piece of work.

Use second person, {{year_level}}-appropriate vocabulary, and a warm but honest tone. Maximum 120 words. Do not mention anything not present in my notes. Then give me a one-line version for my mark book.`,
  },
  {
    id: "question-bank",
    title: "Retrieval question set at three depths",
    category: "Assessment & Grading",
    goal: "Recall, application and transfer questions on one topic, with answers.",
    tags: ["questions", "retrieval", "quiz", "blooms"],
    tip: "Ask for the wrong-answer options to be real misconceptions, not obvious throwaways.",
    variables: [
      { key: "topic", label: "Topic", placeholder: "fractions of an amount" },
      { key: "year_level", label: "Year level", placeholder: "Grade 4" },
      { key: "count", label: "Questions per depth", placeholder: "5" },
      { key: "misconceptions", label: "Known misconceptions", placeholder: "dividing by the numerator instead of the denominator" },
    ],
    template: `Write a retrieval question set on {{topic}} for {{year_level}}.

Give {{count}} questions at each of three depths:
1. Recall — can be answered from memory in one line.
2. Application — a routine problem using the idea in a familiar format.
3. Transfer — the same idea in an unfamiliar context or combined with earlier learning.

Known misconceptions to target: {{misconceptions}}

For multiple-choice questions, every distractor must be the answer a student with a specific misconception would give — name the misconception in brackets after each distractor. Provide the answer key with a one-line worked solution per question. Finish with the two questions I should reuse in a fortnight for spaced retrieval.`,
  },
  {
    id: "differentiation-plan",
    title: "Differentiated versions of one task",
    category: "Differentiation",
    goal: "Scaffolded and stretch versions of a task that keep the same learning objective.",
    tags: ["differentiation", "scaffold", "stretch", "support"],
    tip: "Insist the objective stays identical — differentiation that changes the objective is just a different task.",
    variables: [
      { key: "task", label: "The core task", placeholder: "write a paragraph explaining the water cycle" },
      { key: "objective", label: "Learning objective", placeholder: "sequence evaporation, condensation and precipitation correctly" },
      { key: "support_needs", label: "Support needs in the room", placeholder: "two students with reading age ~3 years below, one EAL beginner" },
      { key: "stretch", label: "What the strongest students can already do", placeholder: "already describe the cycle accurately from memory" },
    ],
    template: `Differentiate this task without changing its learning objective.

Core task: {{task}}
Objective every version must still meet: {{objective}}
Support needs: {{support_needs}}
Strongest students: {{stretch}}

Produce three versions:
1. Scaffolded — same task with supports (sentence starters, word bank, partially completed model). List each scaffold and the exact wording.
2. Core — the task as given, tightened if needed.
3. Stretch — deeper, not longer: add analysis, an unfamiliar case, or a constraint. Never "do more of the same".

For each version state how I check the objective was met in under a minute per student. Flag any scaffold that risks doing the thinking for the student, and say when to remove it.`,
  },
  {
    id: "iep-accommodations",
    title: "Classroom accommodation ideas",
    category: "Differentiation",
    goal: "Practical accommodations for one student, sorted by preparation effort.",
    tags: ["accommodations", "sen", "inclusion", "support"],
    tip: "Describe behaviour you observe, not a diagnosis — never put a student's name or records into an AI tool.",
    variables: [
      { key: "observed", label: "What you observe (no names)", placeholder: "loses track during multi-step instructions, strong verbally, avoids writing tasks" },
      { key: "subject", label: "Subject and setting", placeholder: "mainstream Grade 6 maths, 28 students" },
      { key: "tried", label: "Already tried", placeholder: "seating near front, printed instructions — partial help" },
    ],
    template: `Suggest classroom accommodations for a student I will describe only by observed behaviour — no diagnosis, no personal details.

Observed: {{observed}}
Setting: {{subject}}
Already tried: {{tried}}

Give eight accommodation ideas grouped by preparation cost: (a) zero-prep habits I can start tomorrow, (b) low-prep materials under ten minutes to make, (c) structural changes worth discussing with the SEN coordinator.

For each: what to do, why it matches the observed behaviour, and the sign within two weeks that it is or is not working. Do not diagnose. Do not suggest anything that singles the student out visibly in front of peers. Remind me at the end that formal adjustments belong with the school's SEN process, not a chatbot.`,
  },
  {
    id: "parent-email-concern",
    title: "Parent email about a concern",
    category: "Parent Communication",
    goal: "Raise an academic or behaviour concern in writing without triggering defensiveness.",
    tags: ["parent email", "concern", "behaviour", "communication"],
    tip: "Facts first, feelings never guessed — the model must not speculate about the home.",
    variables: [
      { key: "concern", label: "The concern, factually", placeholder: "homework not submitted 4 of the last 5 weeks, quality slipping" },
      { key: "positives", label: "Genuine positives", placeholder: "contributes well in discussion, kind to younger students" },
      { key: "action", label: "What you propose", placeholder: "a 10-minute phone call this week and a shared homework checklist" },
      { key: "tone_note", label: "Relationship context", placeholder: "first contact with this family, previous school reports were glowing" },
    ],
    template: `Draft an email to a parent raising a concern. Do not use the student's name — write [Student] and I will replace it.

The concern, stated factually: {{concern}}
Genuine positives to include: {{positives}}
What I propose: {{action}}
Relationship context: {{tone_note}}

Structure: warm opening with a specific positive, the concern in plain observable facts (dates and counts, no interpretation of motives), a sentence inviting their perspective, then the proposed next step with a concrete time.

Rules: under 180 words, no education jargon, no speculation about causes at home, no "I'm sure it's nothing", and nothing that reads as building a paper trail. Give me a subject line that is honest without being alarming, plus one alternative version of the email that is warmer, for a family I know well.`,
  },
  {
    id: "report-comments",
    title: "Report card comment set",
    category: "Parent Communication",
    goal: "Three report comments from grades and notes, within a strict character limit.",
    tags: ["reports", "comments", "grades", "writing"],
    tip: "Give the character limit exactly — report systems truncate silently.",
    variables: [
      { key: "subject", label: "Subject", placeholder: "English, Grade 9" },
      { key: "limit", label: "Character limit", placeholder: "350 characters" },
      { key: "student_notes", label: "Grades and notes (no name)", placeholder: "B+, strong analysis, oral work excellent, deadlines slip under pressure" },
      { key: "school_style", label: "School style rules", placeholder: "third person, 'she', no abbreviations, must include one target" },
    ],
    template: `Write report card comments for {{subject}} within a hard limit of {{limit}} per comment. Use [Student] instead of a name.

Student data: {{student_notes}}
School style rules: {{school_style}}

Write three versions of the comment: one leading with achievement, one leading with attitude, one leading with the target. Every sentence must trace back to the data I gave — no invented specifics, no filler like "a pleasure to teach" unless my notes support it.

The target must be actionable by the student this term and measurable ("submits all four assessed drafts on time", not "improve organisation"). State the character count of each version so I can check it fits.`,
  },
  {
    id: "routine-reset",
    title: "Classroom routine reset script",
    category: "Classroom Management",
    goal: "A script and one-week plan to re-establish a routine that has drifted.",
    tags: ["behaviour", "routines", "management", "script"],
    tip: "Name the routine precisely — 'entry to the room' resets better than 'behaviour'.",
    variables: [
      { key: "routine", label: "The routine that drifted", placeholder: "entry: students settle and start the do-now within 3 minutes" },
      { key: "current_state", label: "What actually happens now", placeholder: "8-10 minutes of drift, phones out, do-now ignored" },
      { key: "class_profile", label: "Class profile", placeholder: "Grade 10, 26 students, good relationship overall, last period on Fridays" },
    ],
    template: `Help me re-establish a classroom routine that has drifted.

The routine as it should be: {{routine}}
What actually happens now: {{current_state}}
Class: {{class_profile}}

Give me: (1) a 90-second re-launch script in my actual voice — plain, warm, no lecture about respect — that names the routine, the reason, and exactly what I will do each time it slips; (2) the precise teacher actions for the first slip, second slip, and refusal, kept consistent with the script; (3) a five-day reinforcement plan where the routine gets narrated praise daily and the scaffold fades by day five.

No sarcasm, no whole-class punishments, no rhetorical questions. End with the one thing teachers most often do in week two that undoes the reset.`,
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
