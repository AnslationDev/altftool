/**
 * Job Description Prompt Builder — pure logic.
 *
 * Two real pieces of arithmetic live here:
 *  1. allocateWordBudget() splits a target word count across the six standard
 *     job-description sections using the largest-remainder (Hare quota) method,
 *     so the per-section numbers always add up to the target exactly.
 *  2. scanBiasedLanguage() word-matches the draft against a list of
 *     gender-coded, age-coded and ableist wordings that recruiting style guides
 *     ask writers to replace.
 *
 * No React, no DOM, no Date.now(). Same input -> same output.
 */

/** Seniority labels used by most applicant tracking systems. */
export const SENIORITY_LEVELS = [
  "Intern",
  "Entry level",
  "Junior",
  "Mid-level",
  "Senior",
  "Staff / Principal",
  "Manager",
  "Director",
];

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
  "Apprenticeship",
];

export const WORK_MODES = ["On-site", "Hybrid", "Remote (country-wide)", "Remote (global)"];

export const TONE_PRESETS = [
  "Warm and plain-spoken",
  "Neutral and factual",
  "Mission-led",
  "Technical and precise",
];

/**
 * Editorial cap, not a legal rule. Recruiting style guides (LinkedIn Talent,
 * Indeed and the UK Government Digital Service job-advert guidance all say the
 * same thing) advise keeping the hard filter list short and moving the rest to
 * "nice to have", because every extra must-have narrows the applicant pool —
 * disproportionately for candidates from under-represented groups.
 */
export const MUST_HAVE_CAP = 6;

/** Sanity limit so a pasted document cannot blow up the prompt. */
export const MAX_LIST_ITEMS = 25;

/** Practical bounds for a job advert. Below ~150 words an advert cannot cover
 *  role, requirements and pay; above ~900 words read-through drops sharply. */
export const WORD_TARGET_MIN = 150;
export const WORD_TARGET_MAX = 900;
export const WORD_TARGET_DEFAULT = 450;

/**
 * Section shares of the total advert. Derived from the conventional job-advert
 * running order: context, what you will do, hard requirements, optional extras,
 * package, process. Weights sum to 1.
 */
export const SECTION_WEIGHTS = [
  { key: "about", label: "About the role and team", weight: 0.2 },
  { key: "responsibilities", label: "What you will do", weight: 0.3 },
  { key: "mustHaves", label: "Must-have requirements", weight: 0.2 },
  { key: "niceToHaves", label: "Nice to have", weight: 0.1 },
  { key: "offer", label: "Pay, benefits and working pattern", weight: 0.12 },
  { key: "apply", label: "How to apply and what to expect", weight: 0.08 },
];

/**
 * Wordings recruiting style guides flag, with the reason and a suggested swap.
 * Gender-coded adjectives follow the masculine/feminine word lists used in
 * Gaucher, Friesen & Kay (2011); the age and ability items follow standard
 * equal-opportunity advert guidance.
 */
export const BIASED_TERMS = [
  { term: "rockstar", why: "Hype job title, gender-coded and vague", swap: "experienced" },
  { term: "ninja", why: "Hype job title, tells a candidate nothing", swap: "specialist" },
  { term: "guru", why: "Hype job title, vague seniority signal", swap: "lead" },
  { term: "wizard", why: "Hype job title, vague seniority signal", swap: "expert" },
  { term: "aggressive", why: "Masculine-coded adjective", swap: "determined" },
  { term: "dominant", why: "Masculine-coded adjective", swap: "leading" },
  { term: "ruthless", why: "Masculine-coded adjective", swap: "decisive" },
  { term: "fearless", why: "Masculine-coded adjective", swap: "confident" },
  { term: "young", why: "Age-coded; may breach age discrimination rules", swap: "early-career" },
  { term: "energetic", why: "Often reads as an age proxy", swap: "motivated" },
  { term: "digital native", why: "Age proxy", swap: "confident with digital tools" },
  { term: "recent graduate", why: "Age proxy unless the role is genuinely a graduate scheme", swap: "entry level" },
  { term: "manpower", why: "Gendered noun", swap: "staffing" },
  { term: "salesman", why: "Gendered job noun", swap: "salesperson" },
  { term: "he/she", why: "Excludes non-binary candidates", swap: "they" },
  { term: "his/her", why: "Excludes non-binary candidates", swap: "their" },
  { term: "able-bodied", why: "Ableist; also rarely a genuine requirement", swap: "state the actual physical task" },
  { term: "must be able to stand", why: "Ableist unless genuinely essential", swap: "describe the task, not the posture" },
  { term: "native speaker", why: "Nationality proxy", swap: "fluent in" },
  { term: "cultural fit", why: "Invites in-group bias", swap: "values match on X" },
  { term: "work hard play hard", why: "Signals long hours, deters carers", swap: "describe the actual working pattern" },
  { term: "unlimited overtime", why: "May breach working-time rules", swap: "state the expected hours" },
];

/** Words in a string. Collapses all whitespace; empty string is 0. */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Split a textarea into a clean list. Accepts newlines, commas, semicolons and
 * leading bullet characters. Case-insensitive de-duplication, order preserved.
 */
export function parseList(raw, max = MAX_LIST_ITEMS) {
  if (typeof raw !== "string") return [];
  const seen = new Set();
  const out = [];
  for (const piece of raw.split(/[\n,;]+/)) {
    const item = piece
      .replace(/^\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/^[-*•–•]\s*/, "")
      .trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Largest-remainder split of `target` words across weighted sections.
 * Guarantees sum(words) === target for any integer target >= 0.
 */
export function allocateWordBudget(target, weights = SECTION_WEIGHTS) {
  const total = Math.round(Number(target));
  if (!Number.isFinite(total) || total < 0) return [];
  const usable = weights.filter((section) => Number(section.weight) > 0);
  if (usable.length === 0) return [];

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
    // Share of the finished advert, 0-1. Zero target -> zero share, never NaN.
    share: total > 0 ? floors[index] / total : 0,
  }));
}

/** Every flagged wording found in the supplied text, in list order. */
export function scanBiasedLanguage(text) {
  if (typeof text !== "string" || !text.trim()) return [];
  const haystack = text.toLowerCase();
  return BIASED_TERMS.filter((entry) => {
    const escaped = entry.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`).test(haystack);
  });
}

/**
 * Assemble the prompt. Returns { error } for anything unusable.
 */
export function buildJobDescriptionPrompt(input = {}) {
  const {
    roleTitle = "",
    seniority = "Mid-level",
    employmentType = "Full-time",
    workMode = "Hybrid",
    location = "",
    teamContext = "",
    responsibilitiesRaw = "",
    mustHavesRaw = "",
    niceToHavesRaw = "",
    salaryRange = "",
    tone = "Warm and plain-spoken",
    wordTarget = WORD_TARGET_DEFAULT,
    includeEqualOpportunity = true,
  } = input;

  const title = String(roleTitle).trim();
  if (!title) return { error: "Enter the job title you are hiring for." };

  const target = Math.round(Number(wordTarget));
  if (!Number.isFinite(target)) return { error: "Word target must be a number." };
  if (target < WORD_TARGET_MIN || target > WORD_TARGET_MAX) {
    return {
      error: `Word target should be between ${WORD_TARGET_MIN} and ${WORD_TARGET_MAX} words for a job advert.`,
    };
  }

  const mustHaves = parseList(mustHavesRaw);
  if (mustHaves.length === 0) {
    return { error: "List at least one must-have requirement, one per line." };
  }
  const niceToHaves = parseList(niceToHavesRaw);
  const responsibilities = parseList(responsibilitiesRaw);

  const overlap = niceToHaves.filter((item) =>
    mustHaves.some((must) => must.toLowerCase() === item.toLowerCase()),
  );

  const budget = allocateWordBudget(target);
  const budgetByKey = Object.fromEntries(budget.map((row) => [row.key, row.words]));
  const overflow = Math.max(0, mustHaves.length - MUST_HAVE_CAP);

  const flags = scanBiasedLanguage(
    [title, teamContext, responsibilitiesRaw, mustHavesRaw, niceToHavesRaw].join(" \n "),
  );

  const numbered = (items) => items.map((item, i) => `${i + 1}. ${item}`).join("\n");

  const lines = [];
  lines.push(
    `You are an experienced recruiter and copywriter. Write one job advert for the role below. Total length: about ${target} words.`,
  );
  lines.push("");
  lines.push("ROLE FACTS");
  lines.push(`- Job title: ${title}`);
  lines.push(`- Level: ${seniority}`);
  lines.push(`- Employment type: ${employmentType}`);
  lines.push(`- Working pattern: ${workMode}${location ? ` — ${String(location).trim()}` : ""}`);
  if (String(teamContext).trim()) lines.push(`- Team and context: ${String(teamContext).trim()}`);
  lines.push(
    salaryRange && String(salaryRange).trim()
      ? `- Pay range to publish: ${String(salaryRange).trim()}`
      : "- Pay range: not supplied. Write a placeholder line naming the currency and interval, e.g. \"Salary: [range] per year\", and do not invent a figure.",
  );
  lines.push("");
  lines.push(`MUST-HAVE REQUIREMENTS (hard filters — ${mustHaves.length} supplied)`);
  lines.push(numbered(mustHaves));
  lines.push("");
  lines.push(
    niceToHaves.length
      ? `NICE TO HAVE (never phrased as a requirement — ${niceToHaves.length} supplied)\n${numbered(niceToHaves)}`
      : "NICE TO HAVE\nNone supplied. Omit the section entirely rather than inventing extras.",
  );
  lines.push("");
  lines.push(
    responsibilities.length
      ? `DAY-TO-DAY RESPONSIBILITIES\n${numbered(responsibilities)}`
      : "DAY-TO-DAY RESPONSIBILITIES\nNone supplied. Infer 4-6 plausible duties from the title and level, and mark each with [CONFIRM] so the hiring manager checks it.",
  );
  lines.push("");
  lines.push("STRUCTURE AND WORD BUDGET (follow this order and stay close to each figure)");
  for (const row of budget) lines.push(`- ${row.label}: ~${row.words} words`);
  lines.push("");
  lines.push("RULES");
  lines.push(`1. Tone: ${tone}. Second person ("you"), present tense, short sentences.`);
  lines.push(
    "2. Keep must-haves and nice-to-haves in separate headed sections. Nice-to-haves must read as optional: use \"helpful\" or \"a plus\", never \"required\", \"essential\" or \"minimum\".",
  );
  lines.push(
    `3. Do not exceed ${MUST_HAVE_CAP} must-have bullets in the finished advert. If more are supplied, merge the closest ones or move the weakest to nice-to-have and list at the end what you moved and why.`,
  );
  lines.push(
    "4. Write every requirement as an observable capability rather than a credential where possible (\"can debug a failing production queue\" rather than \"5+ years experience\").",
  );
  lines.push(
    "5. No gender-coded, age-coded or ableist wording: no rockstar, ninja, guru, aggressive, young, energetic, digital native, cultural fit, he/she. Use \"they\".",
  );
  lines.push("6. No unexplained internal jargon or acronyms. Expand any you keep.");
  lines.push(
    "7. Invent nothing. If a fact is missing, insert a bracketed placeholder such as [team size] instead of guessing.",
  );
  if (includeEqualOpportunity) {
    lines.push(
      "8. End with two short paragraphs: an equal-opportunity statement, and a line inviting candidates to ask for adjustments to the interview process.",
    );
  }
  lines.push("");
  lines.push("OUTPUT");
  lines.push(
    "Markdown. An H2 headline, then the sections in the order above with H3 headings and bullet lists. After the advert, add a short block titled \"Editor notes\" listing every placeholder you left and every requirement you moved between sections.",
  );

  const prompt = lines.join("\n");

  return {
    prompt,
    budget,
    budgetByKey,
    budgetTotal: budget.reduce((sum, row) => sum + row.words, 0),
    mustHaves,
    niceToHaves,
    responsibilities,
    overlap,
    overflow,
    flags,
    wordCount: countWords(prompt),
    charCount: prompt.length,
    mustHaveShare: budgetByKey.mustHaves / target,
  };
}
