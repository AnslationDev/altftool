/**
 * Student Prompt Pack — prompt library + a pure template engine.
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
  "Understanding",
  "Study & Revision",
  "Writing & Essays",
  "Exam Prep",
  "Planning",
];

export const PROMPTS = [
  {
    id: "feynman-check",
    title: "Feynman technique: explain it back",
    category: "Understanding",
    goal: "Explain a topic in your own words and get the gaps in your understanding exposed.",
    tags: ["feynman", "understanding", "explanation", "gaps"],
    tip: "Write your explanation from memory first, without the textbook open — that is the whole exercise.",
    variables: [
      { key: "topic", label: "Topic", placeholder: "osmosis and why cells swell in pure water" },
      { key: "my_explanation", label: "Your explanation, from memory", placeholder: "water moves from high to low concentration through the membrane because..." },
      { key: "level", label: "Course level", placeholder: "high school biology, final year" },
    ],
    template: `I am using the Feynman technique. I wrote this explanation of {{topic}} from memory — check it, do not rewrite it for me.

My explanation: {{my_explanation}}
Course level: {{level}}

Do exactly this: (1) list what I got right, briefly; (2) list every error or imprecision, quoting my words and stating what is wrong with them at my course level; (3) list what a complete explanation at this level includes that I skipped entirely; (4) ask me three questions, from easier to harder, that target my weakest spot — questions only, do NOT answer them; (5) name the simplest example or edge case that my current explanation cannot handle.

Do not write a model explanation of the topic. The point is that I rewrite mine after your feedback — end by telling me to do that and which single gap to fix first.`,
  },
  {
    id: "concept-unpack",
    title: "Break a hard concept into prerequisites",
    category: "Understanding",
    goal: "Find out which missing prerequisite is actually blocking you, then fix that first.",
    tags: ["prerequisites", "concepts", "stuck", "foundations"],
    tip: "Describe where exactly you get lost — 'all of it' hides the one step that actually breaks.",
    variables: [
      { key: "concept", label: "The concept you are stuck on", placeholder: "integration by parts" },
      { key: "stuck_point", label: "Where exactly you get lost", placeholder: "I can follow the formula but never know which part to call u" },
      { key: "background", label: "What you are comfortable with", placeholder: "differentiation rules fine, product rule fine, basic integrals fine" },
    ],
    template: `I am stuck on {{concept}}. Diagnose the blockage before explaining anything.

Where exactly I get lost: {{stuck_point}}
What I am already comfortable with: {{background}}

Step 1 — list the prerequisite ideas this concept is built from, as a dependency chain, and mark which one my stuck-point suggests is the weak link. Tell me your reasoning.

Step 2 — give me one quick self-test question for the suspected weak prerequisite. Wait — actually include the question AND its answer hidden at the end, so I can attempt it first.

Step 3 — explain ONLY the link between that prerequisite and {{concept}}: why the concept is the natural next step from what I know, using one fully worked example where you narrate the decision at each step (especially the decision I said I get lost on), then one example that is set up but left for me to finish.

Do not explain parts I said I am comfortable with. End with the rule of thumb for my specific stuck-point, stated in one memorable line.`,
  },
  {
    id: "active-recall-quiz",
    title: "Active recall quiz from your notes",
    category: "Study & Revision",
    goal: "A self-test built from your own notes, with the answers withheld until you commit.",
    tags: ["active recall", "quiz", "testing", "notes"],
    tip: "Testing yourself beats re-reading — paste notes you have already read once and let the quiz find the holes.",
    variables: [
      { key: "notes", label: "Your notes (paste them)", placeholder: "The French Revolution: causes — fiscal crisis, estates system..." },
      { key: "exam_format", label: "How you will be examined", placeholder: "short answer and one essay, closed book" },
      { key: "count", label: "Number of questions", placeholder: "10" },
    ],
    template: `Build an active recall quiz from my own notes. Questions first, answers withheld.

My notes: {{notes}}
Exam format: {{exam_format}}
Questions: {{count}}

Write {{count}} questions that: (1) come only from my notes — if my notes have an obvious gap a typical syllabus would cover, list that under "your notes do not cover", do not quiz on it; (2) match my exam format's style; (3) mix three depths — direct recall, "explain why", and one question that forces me to connect two separate parts of my notes; (4) are ordered so related questions do NOT sit next to each other.

Then STOP. Do not print the answers yet. Instead print: "Reply 'answers' when you have attempted every question on paper." When I do, give the answer key with a one-line marking guide per question — what a full-credit answer must contain — so I can grade myself honestly.`,
  },
  {
    id: "spaced-schedule",
    title: "Spaced repetition schedule to exam day",
    category: "Study & Revision",
    goal: "A dated review plan that spaces each topic at expanding intervals before the exam.",
    tags: ["spaced repetition", "schedule", "revision", "planning"],
    tip: "Give real dates and honest hours — a plan built on fantasy hours collapses in week one.",
    variables: [
      { key: "topics", label: "Topics to revise", placeholder: "6 chemistry topics: bonding, moles, rates, equilibrium, organic, energetics" },
      { key: "exam_date", label: "Exam date", placeholder: "exam on 20 June, today is 26 May" },
      { key: "weak_topics", label: "Weakest topics", placeholder: "moles calculations and equilibrium" },
      { key: "hours", label: "Honest hours per week", placeholder: "8 hours: 1 on weekdays, 1.5 each weekend day" },
    ],
    template: `Build me a spaced revision schedule.

Topics: {{topics}}
Exam date and today's date: {{exam_date}}
Weakest topics: {{weak_topics}}
Honest available time: {{hours}}

Rules for the plan: every topic gets a first study session, then reviews at roughly expanding intervals (about 1 day, 3 days, 7 days, then 14 if time allows) — show which interval each session is; weak topics get their first session earliest and one extra review; each session is active (recall test, past-paper questions, blank-page brain dump) — name the method per session, never "re-read notes"; the final 3 days before the exam are mixed retrieval of everything, not new learning.

Output a dated table: date, topic, review number, method, minutes. Respect my weekly hours exactly — if the topics do not fit, say what to cut and why, do not silently overbook me. End with the one rule to follow when I miss a day.`,
  },
  {
    id: "essay-outline",
    title: "Essay outline from your own thesis",
    category: "Writing & Essays",
    goal: "Structure your argument and stress-test it — without the model writing the essay.",
    tags: ["essay", "outline", "thesis", "argument"],
    tip: "Bring your own thesis, even a rough one — asking the model for a thesis outsources the only part that is graded as thinking.",
    variables: [
      { key: "question", label: "The essay question", placeholder: "To what extent was the Treaty of Versailles responsible for WWII?" },
      { key: "thesis", label: "Your position, roughly", placeholder: "significant but indirect — it created conditions others exploited" },
      { key: "evidence", label: "Evidence you plan to use", placeholder: "reparations figures, Ruhr occupation, historians Taylor vs Overy" },
      { key: "length", label: "Required length", placeholder: "1,500 words" },
    ],
    template: `Help me structure an essay. This is MY essay — you organise and stress-test, you do not write prose for me.

Question: {{question}}
My position: {{thesis}}
Evidence I plan to use: {{evidence}}
Length: {{length}}

Give me: (1) my thesis sharpened into one arguable sentence — keep my position, improve its precision, and say what you changed; (2) a paragraph-by-paragraph outline sized for {{length}}: each paragraph's single claim, which of MY evidence supports it, and how it advances the thesis rather than just relating to the topic; (3) the strongest counter-argument to my thesis and where in the structure to engage it; (4) the weakest point in my evidence — where a marker will push — and what would shore it up; (5) three sentence-starters for linking paragraphs (starters only, not sentences).

Do not write the introduction or any paragraph. If my thesis does not actually answer the question as asked, say so bluntly before anything else.`,
  },
  {
    id: "draft-feedback",
    title: "Feedback on your draft against the rubric",
    category: "Writing & Essays",
    goal: "Marker-style feedback on your own writing, tied to the actual grading criteria.",
    tags: ["feedback", "draft", "marking", "rubric"],
    tip: "Paste the assignment's real criteria — feedback against imagined criteria is a different assignment.",
    variables: [
      { key: "draft", label: "Your draft (paste it)", placeholder: "paste the full draft or the section you want reviewed" },
      { key: "criteria", label: "The grading criteria", placeholder: "argument 40%, evidence 30%, structure 20%, style 10%" },
      { key: "worry", label: "What you are most unsure about", placeholder: "whether my paragraphs actually link back to the question" },
    ],
    template: `Give me feedback on my draft as a marker would — against the actual criteria, without rewriting my work.

My draft: {{draft}}
Grading criteria and weights: {{criteria}}
What I am most unsure about: {{worry}}

For each criterion, in weight order: what the draft currently does well (quote me), the single biggest weakness (quote the exact place it shows), and what a stronger version would do differently — described as a change I make, not text you write. Address my specific worry directly with a verdict and the evidence for it.

Then: mark the one paragraph that least earns its place and say why; list any claims lacking support; flag sentences where the meaning is unclear by quoting them (no rewrites — I fix them). End with the three changes that would raise the grade most, ranked, with which criterion each one moves. Do not produce replacement prose anywhere — improving the writing is my job and my academic integrity policy requires it.`,
  },
  {
    id: "past-paper-marking",
    title: "Mark my past-paper answer like an examiner",
    category: "Exam Prep",
    goal: "Score your practice answer against the mark scheme and find the marks you left behind.",
    tags: ["past paper", "marking", "exam technique", "mark scheme"],
    tip: "Paste the official mark scheme if you have it — examiner marking is scheme-driven, not impression-driven.",
    variables: [
      { key: "question", label: "The exam question and total marks", placeholder: "Explain how vaccination leads to long-term immunity. [6 marks]" },
      { key: "my_answer", label: "Your answer, exactly as written", placeholder: "paste your answer without fixing it up" },
      { key: "mark_scheme", label: "Mark scheme (paste if available)", placeholder: "1 mark each: antigen, memory cells, faster secondary response..." },
    ],
    template: `Mark my practice answer like an examiner. Be strict — generous marking now costs me marks later.

Question: {{question}}
My answer, exactly as I wrote it: {{my_answer}}
Mark scheme: {{mark_scheme}}

Do: (1) award a mark with point-by-point justification — where the scheme is supplied, follow it exactly; quote the phrase in my answer that earns each point, and where I said something close but not creditworthy, show the gap between my wording and the creditable wording; (2) list the marks I missed and for each: was it missing knowledge, or knowledge I had but did not state explicitly enough to credit; (3) exam technique notes: did I answer the command word (explain vs describe vs evaluate), did length match marks available; (4) write the model answer AFTER the marking, sized to the marks, so I see the target only after seeing my gap.

End with the single habit change that would recover the most marks across similar questions.`,
  },
  {
    id: "formula-sheet",
    title: "Condensed one-page summary for a topic",
    category: "Exam Prep",
    goal: "A dense revision sheet from your material — every item paired with a self-test cue.",
    tags: ["summary", "cheat sheet", "condensed", "revision"],
    tip: "The sheet is for the final pass, not for learning — make it after you have studied, from your own material.",
    variables: [
      { key: "material", label: "Your material (paste notes/list)", placeholder: "kinematics: v=u+at, s=ut+half at squared... common errors: sign of g..." },
      { key: "exam_type", label: "Exam and what is provided", placeholder: "physics final, formula sheet NOT provided, calculator allowed" },
      { key: "trouble", label: "What you keep forgetting", placeholder: "when to use energy methods instead of kinematics" },
    ],
    template: `Condense my material into a one-page revision sheet built for retrieval, not for reading.

My material: {{material}}
Exam: {{exam_type}}
What I keep forgetting: {{trouble}}

Structure the sheet as: (1) must-memorise items (formulas, definitions, dates — whatever my material contains), each with a three-word retrieval cue on the left I can cover-and-test with; (2) decision rules — "when to use which" — with my stated trouble spot turned into an if-then rule at the top; (3) traps and common errors from my material, each phrased as "if you wrote X, check Y"; (4) the three items from my material most likely to be forgotten under pressure, flagged.

Rules: only content from my material — list anything that looks missing as "check your notes for", do not fill it in from your own knowledge; telegraphic phrasing, no sentences where a fragment works; fits one page at readable size. End with how to use the sheet: cover the right column, recall from cues, mark failures for tomorrow.`,
  },
  {
    id: "semester-plan",
    title: "Workload triage for a heavy week",
    category: "Planning",
    goal: "Turn a pile of deadlines into a day-by-day plan with honest cuts where needed.",
    tags: ["planning", "deadlines", "workload", "time management"],
    tip: "Include the fixed commitments you cannot move — plans that ignore your job or training always fail.",
    variables: [
      { key: "deadlines", label: "Everything due (with dates and weights)", placeholder: "essay Fri 40% of module; lab report Wed 10%; quiz Thu; reading for Mon seminar" },
      { key: "fixed", label: "Fixed commitments", placeholder: "lectures 9-12 daily, work Tue/Thu evenings, sport Sat morning" },
      { key: "state", label: "Current state of each task", placeholder: "essay: research done no outline; lab: data collected; quiz: not started" },
    ],
    template: `Triage my week. Everything feels urgent — make the priorities explicit and the plan concrete.

Due: {{deadlines}}
Fixed commitments I cannot move: {{fixed}}
Current state of each task: {{state}}

Do: (1) rank the tasks by (grade weight x how far each is from done), showing the reasoning in one line each — challenge me if a low-weight task is eating premium time; (2) build a day-by-day plan around my fixed commitments with specific blocks: task, what "done" looks like for that block, and minutes — no block over 90 without a break; (3) schedule the highest-stakes work in the earliest good slots, not the last day; (4) if the honest arithmetic says everything cannot be done well, SAY SO and show the triage options: what to do adequately rather than well, and what the grade arithmetic says each option costs.

Include one contingency: the plan if today's first block slips entirely. Keep total planned hours realistic — count my fixed commitments' true cost including travel.`,
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
