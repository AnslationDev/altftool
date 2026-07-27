/**
 * SOP (Statement of Purpose) Prompt Builder — pure logic.
 *
 * Real computations:
 *  1. resolveLimit() converts between a word limit and a character limit so a
 *     UCAS-style character cap and a Common App-style word cap can be planned
 *     the same way.
 *  2. allocateWordBudget() splits the resolved word limit across the six
 *     sections of a statement by the largest-remainder method, so the section
 *     figures always sum to the limit.
 *  3. scanCliches() flags the stock openings admissions readers see hundreds of
 *     times per cycle.
 *  4. countAnchors() counts the programme-specific details that separate a
 *     statement written for one department from one sent to twelve.
 *
 * No React, no DOM, no Date.now().
 */

/**
 * Characters per word used for limit conversion. The convention comes from
 * typing-speed measurement, where one "word" is defined as five characters
 * plus the space that follows it.
 */
export const CHARS_PER_WORD = 6;

/**
 * Published limits, plus honest ranges where the limit is set per programme.
 * Always confirm the figure on the programme page before submitting — these are
 * the common cases, not a guarantee for any particular institution.
 */
export const SOP_PRESETS = [
  {
    key: "commonapp",
    label: "US undergraduate — Common App personal essay",
    limitType: "words",
    limit: 650,
    note: "650 words is the hard maximum set by the Common Application; the form will not accept more.",
  },
  {
    key: "ucas",
    label: "UK undergraduate — UCAS personal statement",
    limitType: "chars",
    limit: 4000,
    note: "4,000 characters including spaces, spread across the UCAS questions. Confirm the current question set on the UCAS site for your entry year.",
  },
  {
    key: "gradms",
    label: "Graduate taught (MS or MA)",
    limitType: "words",
    limit: 800,
    note: "Most taught programmes ask for 500-1,000 words. Confirm the exact figure on the programme page.",
  },
  {
    key: "gradphd",
    label: "PhD or research programme",
    limitType: "words",
    limit: 1000,
    note: "Commonly 800-1,500 words. Many departments want a separate research proposal as well.",
  },
  {
    key: "mba",
    label: "MBA essay",
    limitType: "words",
    limit: 500,
    note: "Most schools set 300-750 words per essay question and mark anything over the limit down.",
  },
  {
    key: "scholarship",
    label: "Scholarship or funding statement",
    limitType: "words",
    limit: 600,
    note: "Set by the funder and varies widely. Check the call document.",
  },
  {
    key: "custom",
    label: "Custom limit",
    limitType: "words",
    limit: 700,
    note: "Enter the exact limit from the application form.",
  },
];

export const LIMIT_TYPES = [
  { key: "words", label: "Words" },
  { key: "chars", label: "Characters (including spaces)" },
];

/** Practical bounds so a typo cannot produce an absurd plan. */
export const MIN_WORDS = 100;
export const MAX_WORDS = 3000;

/**
 * Section weights for a statement of purpose. Ordered the way admissions
 * readers expect. Weights sum to 1. Preparation, evidence and fit together take
 * roughly two thirds because those are the parts a committee scores.
 */
export const SECTION_WEIGHTS = [
  { key: "hook", label: "Opening: the specific question or problem that drew you in", weight: 0.14 },
  { key: "academic", label: "Academic preparation, with named courses and results", weight: 0.22 },
  { key: "experience", label: "Research, project or work evidence", weight: 0.24 },
  { key: "fit", label: "Why this department, naming people and resources", weight: 0.22 },
  { key: "goals", label: "What you intend to do next and why this degree is required", weight: 0.13 },
  { key: "closing", label: "Closing", weight: 0.05 },
];

/** Stock openings admissions readers report seeing most often. */
export const CLICHE_PHRASES = [
  { phrase: "from a young age", fix: "Start with the specific problem, not your childhood." },
  { phrase: "ever since i was a child", fix: "Open on the work, not the origin story." },
  { phrase: "ever since i was little", fix: "Open on the work, not the origin story." },
  { phrase: "i have always been passionate about", fix: "Show the passion with an example instead of asserting it." },
  { phrase: "i have always been fascinated by", fix: "Name what you did about the fascination." },
  { phrase: "dictionary defines", fix: "Never open with a dictionary definition." },
  { phrase: "in today's world", fix: "Cut it — it says nothing." },
  { phrase: "in today's fast-paced world", fix: "Cut it — it says nothing." },
  { phrase: "since time immemorial", fix: "Cut it." },
  { phrase: "little did i know", fix: "Cut it — it signals a story rather than evidence." },
  { phrase: "changed my life forever", fix: "Say what specifically changed in your work." },
  { phrase: "i want to make a difference", fix: "Name the difference and the mechanism." },
  { phrase: "prestigious university", fix: "Flattery reads as filler. Name a person or a lab instead." },
  { phrase: "world-class faculty", fix: "Name the two faculty members and what they work on." },
  { phrase: "state-of-the-art facilities", fix: "Name the actual instrument or dataset you need." },
  { phrase: "my dream has always been", fix: "Replace with what you have already done towards it." },
  { phrase: "i am writing to express my interest", fix: "Cut the cover-letter opening; get to the substance." },
];

/** Word count of a string. */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Character count including spaces, as application forms count it. */
export function countChars(text) {
  return typeof text === "string" ? text.length : 0;
}

/** Split a textarea into a clean list of lines. */
export function parseLines(raw, max = 20) {
  if (typeof raw !== "string") return [];
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    const item = line
      .replace(/^\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/^[-*•–]\s*/, "")
      .trim();
    if (!item) continue;
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Convert whichever limit the form gives into both units.
 * Returns { error } for anything unusable; never NaN.
 */
export function resolveLimit({ limitType = "words", limit } = {}) {
  const value = Math.round(Number(limit));
  if (!Number.isFinite(value)) return { error: "The limit must be a number." };
  if (value <= 0) return { error: "The limit must be greater than zero." };

  const words = limitType === "chars" ? Math.round(value / CHARS_PER_WORD) : value;
  const chars = limitType === "chars" ? value : value * CHARS_PER_WORD;

  if (words < MIN_WORDS) {
    return {
      error: `That works out at about ${words} words, which is too short to plan as a statement. Check the limit on the form.`,
    };
  }
  if (words > MAX_WORDS) {
    return {
      error: `That works out at about ${words} words. Statements over ${MAX_WORDS} words are almost always a misread limit.`,
    };
  }

  return {
    words,
    chars,
    limitType,
    exact: limitType === "chars"
      ? `${chars} characters ≈ ${words} words at ${CHARS_PER_WORD} characters per word`
      : `${words} words ≈ ${chars} characters at ${CHARS_PER_WORD} characters per word`,
  };
}

/** Largest-remainder split of the word limit across the sections. */
export function allocateWordBudget(target, weights = SECTION_WEIGHTS) {
  const total = Math.round(Number(target));
  const usable = weights.filter((section) => Number(section.weight) > 0);
  if (!Number.isFinite(total) || total < 0 || usable.length === 0) return [];

  const weightSum = usable.reduce((sum, section) => sum + Number(section.weight), 0);
  const exact = usable.map((section) => (total * Number(section.weight)) / weightSum);
  const floors = exact.map((value) => Math.floor(value));
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);

  const order = exact
    .map((value, index) => ({ index, frac: value - floors[index] }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  for (let i = 0; remainder > 0 && i < order.length; i += 1) {
    floors[order[i].index] += 1;
    remainder -= 1;
  }

  return usable.map((section, index) => ({
    key: section.key,
    label: section.label,
    words: floors[index],
    share: total > 0 ? floors[index] / total : 0,
  }));
}

/** Cliché phrases present in the supplied text. */
export function scanCliches(text) {
  if (typeof text !== "string" || !text.trim()) return [];
  const haystack = text.toLowerCase().replace(/[’‘]/g, "'");
  return CLICHE_PHRASES.filter((entry) => haystack.includes(entry.phrase));
}

/**
 * Count programme-specific anchors: named faculty, named courses or modules,
 * and named labs, centres or resources. Two is the practical floor for a
 * statement to read as written for one department rather than mail-merged.
 */
export const MIN_ANCHORS = 2;

export function countAnchors({ facultyRaw = "", coursesRaw = "", resourcesRaw = "" } = {}) {
  const faculty = parseLines(facultyRaw);
  const courses = parseLines(coursesRaw);
  const resources = parseLines(resourcesRaw);
  const total = faculty.length + courses.length + resources.length;
  return { faculty, courses, resources, total, sufficient: total >= MIN_ANCHORS };
}

/** Assemble the prompt. Returns { error } for unusable input. */
export function buildSopPrompt(input = {}) {
  const {
    preset = "gradms",
    limitType = "words",
    limit = 800,
    programme = "",
    university = "",
    fieldOfStudy = "",
    background = "",
    experienceRaw = "",
    facultyRaw = "",
    coursesRaw = "",
    resourcesRaw = "",
    goals = "",
    draftOpening = "",
    gapExplanation = "",
  } = input;

  const programmeName = String(programme).trim();
  if (!programmeName) return { error: "Enter the programme you are applying to." };

  const resolved = resolveLimit({ limitType, limit });
  if (resolved.error) return { error: resolved.error };

  const experience = parseLines(experienceRaw);
  if (experience.length === 0) {
    return {
      error: "Add at least one piece of evidence — a project, a job, a paper or a piece of coursework, one per line.",
    };
  }

  const anchors = countAnchors({ facultyRaw, coursesRaw, resourcesRaw });
  const cliches = scanCliches([draftOpening, background, goals].join("\n"));
  const budget = allocateWordBudget(resolved.words);
  const presetEntry = SOP_PRESETS.find((entry) => entry.key === preset) || SOP_PRESETS[SOP_PRESETS.length - 1];

  const openingWords = countWords(draftOpening);
  const openingChars = countChars(draftOpening);
  const openingOverBudget = openingWords > budget[0].words;

  const numbered = (items) => items.map((item, i) => `${i + 1}. ${item}`).join("\n");

  const lines = [];
  lines.push(
    `You are helping me draft a statement of purpose. Hard limit: ${resolved.limitType === "chars" ? `${resolved.chars} characters including spaces (about ${resolved.words} words)` : `${resolved.words} words (about ${resolved.chars} characters)`}. Going over the limit is an automatic problem — stay under it.`,
  );
  lines.push("");
  lines.push("APPLICATION");
  lines.push(`- Programme: ${programmeName}`);
  if (String(university).trim()) lines.push(`- Institution: ${String(university).trim()}`);
  if (String(fieldOfStudy).trim()) lines.push(`- Field: ${String(fieldOfStudy).trim()}`);
  lines.push(`- Application type: ${presetEntry.label}`);
  if (String(background).trim()) lines.push(`- My background so far: ${String(background).trim()}`);
  if (String(goals).trim()) lines.push(`- What I want to do after the degree: ${String(goals).trim()}`);
  if (String(gapExplanation).trim()) {
    lines.push(
      `- Gap or weakness to address factually in one or two sentences, without apology: ${String(gapExplanation).trim()}`,
    );
  }
  lines.push("");
  lines.push(`MY EVIDENCE (${experience.length} items — use these, do not add others)`);
  lines.push(numbered(experience));
  lines.push("");
  lines.push(`PROGRAMME-SPECIFIC ANCHORS (${anchors.total})`);
  if (anchors.faculty.length) lines.push(`People: ${anchors.faculty.join("; ")}`);
  if (anchors.courses.length) lines.push(`Courses or modules: ${anchors.courses.join("; ")}`);
  if (anchors.resources.length) lines.push(`Labs, groups or resources: ${anchors.resources.join("; ")}`);
  if (anchors.total === 0) {
    lines.push(
      "None supplied. Do not invent faculty names, labs or course titles. Insert [NAME A FACULTY MEMBER AND WHAT THEY WORK ON] and [NAME A MODULE] for me to fill in.",
    );
  } else if (!anchors.sufficient) {
    lines.push(
      `Only ${anchors.total} supplied, which reads as a generic statement. Use what is here and mark [ADD ONE MORE SPECIFIC ANCHOR] where a second would go. Invent nothing.`,
    );
  }
  lines.push("");
  if (String(draftOpening).trim()) {
    lines.push(`MY DRAFT OPENING (${openingWords} words)`);
    lines.push(String(draftOpening).trim());
    lines.push("");
  }
  lines.push("SECTION WORD BUDGET (stay close to each figure)");
  for (const row of budget) lines.push(`- ${row.label}: ~${row.words} words`);
  lines.push("");
  lines.push("RULES");
  lines.push("1. First person, past and present tense, plain sentences. No thesaurus words.");
  lines.push(
    "2. Every claim about my ability must point at one of the evidence items above. Cut any sentence that does not.",
  );
  lines.push(
    "3. Do not open with childhood, a dictionary definition, a famous quotation, or a sentence about how prestigious the institution is.",
  );
  lines.push(
    "4. Invent nothing: no grades, dates, publications, faculty names, lab names or job titles that are not in the facts above. Use [SQUARE BRACKETS] for anything missing.",
  );
  lines.push(
    "5. Show the fit in the specifics — a named person and what they actually work on beats any amount of praise for the department.",
  );
  lines.push(
    "6. Do not mention health, family circumstances, religion or nationality unless I supplied them above as something to address.",
  );
  lines.push(
    `7. Count the finished draft and report the total at the end. If it is over ${resolved.words} words, cut it and report what you cut.`,
  );
  if (cliches.length) {
    lines.push(
      `8. My input contains these stock phrases — remove them and rewrite the idea concretely: ${cliches.map((entry) => `"${entry.phrase}"`).join(", ")}.`,
    );
  }
  lines.push("");
  lines.push("OUTPUT");
  lines.push(
    "The statement as continuous prose with no headings, then a short list titled \"Checks\" giving the word count, every [BRACKET] placeholder left for me, and any claim the evidence does not fully support.",
  );

  const prompt = lines.join("\n");

  return {
    prompt,
    preset: presetEntry,
    resolved,
    budget,
    budgetTotal: budget.reduce((sum, row) => sum + row.words, 0),
    experience,
    anchors,
    cliches,
    openingWords,
    openingChars,
    openingOverBudget,
    charCount: prompt.length,
  };
}
