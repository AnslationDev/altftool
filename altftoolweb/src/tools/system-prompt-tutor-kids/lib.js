/**
 * Child-safe tutor system prompt composer.
 *
 * Pure string assembly: identical configuration always yields an identical
 * prompt. Section order — identity, age fit, subjects, teaching method,
 * safety rules — keeps the non-negotiable child-safety rules at the end,
 * after the context they govern.
 *
 * Background for the rule text:
 * - The no-personal-data rule aligns with COPPA (US Children's Online Privacy
 *   Protection Act), which restricts collecting personal information from
 *   children under 13, and with the UK Age Appropriate Design Code.
 * - The praise-effort rule follows Carol Dweck's growth-mindset research:
 *   praise strategy and effort, not innate ability.
 * - The Socratic option reflects tutoring-effectiveness work (e.g. Bloom's
 *   two-sigma studies): guided questions outperform answer-giving.
 */

/** OpenAI's rule of thumb: roughly 4 characters per token for English prose. */
export const CHARS_PER_TOKEN = 4;

/** Warn-only budget: the system prompt is prepended to every request. */
export const DEFAULT_TOKEN_BUDGET = 800;

/**
 * Age bands with concrete language rules, matched to typical reading stages
 * (early readers, fluent readers, pre-teens). COPPA's under-13 line is why the
 * bands stop at 13 — older teens need a different, less restrictive design.
 */
export const AGE_BANDS = {
  ages5to7: {
    label: "Ages 5–7 (early primary)",
    line: "The learner is 5 to 7 years old. Use sentences under 10 words, everyday words only, one idea at a time, and examples with things a child can touch or picture (toys, fruit, animals). Numbers stay small.",
  },
  ages8to10: {
    label: "Ages 8–10 (upper primary)",
    line: "The learner is 8 to 10 years old. Use short sentences, define any new word the first time it appears, teach one concept per step, and connect ideas to school, games and daily life.",
  },
  ages11to13: {
    label: "Ages 11–13 (middle school)",
    line: "The learner is 11 to 13 years old. Use normal sentences, introduce proper subject vocabulary with a plain-language definition, and show why each idea matters before drilling it.",
  },
};

export const SUBJECT_OPTIONS = {
  maths: "Maths: arithmetic, fractions, geometry and word problems appropriate to the age band.",
  reading: "Reading and writing: phonics, comprehension, spelling, and short writing exercises.",
  science: "Science: nature, space, the human body and simple experiments that are safe at home.",
  socialStudies: "Geography and history: places, maps, and age-appropriate stories from the past.",
  coding: "Beginner coding: sequencing, loops and logic using block-style pseudocode, no real toolchains.",
  languages: "A second language: vocabulary, simple phrases and pronunciation practice.",
};

export const TEACHING_STYLES = {
  socratic: {
    label: "Guide with questions (Socratic)",
    line: "Never give the answer straight away. Break the problem into small steps and ask one guiding question at a time; give the answer only after two honest attempts, then explain it simply.",
  },
  explainPractice: {
    label: "Explain, then practise",
    line: "Explain each idea with one worked example, then give one similar practice question at a time and check the answer before moving on.",
  },
  playful: {
    label: "Games and stories",
    line: "Teach through mini-games, stories and challenges — riddles, 'beat your score' drills and characters — while keeping each round tied to the learning goal.",
  },
};

export const SAFETY_RULES = {
  safeTopics:
    "Stay strictly on the tutoring subjects listed above. If the child asks about anything else, answer in one kind sentence at most and steer back to learning.",
  noPersonalData:
    "Never ask for or record personal information — full name, age beyond what is given here, address, school, phone, photos or social accounts. This mirrors children's privacy law (COPPA applies to under-13s in the US).",
  adultReferral:
    "If the child mentions being hurt, scared, bullied, unsafe, or asks about violence, self-harm or adult topics: respond with one gentle, caring sentence, do not go into detail, and tell them to talk to a parent, teacher or another trusted adult right away.",
  noExternalContact:
    "Never suggest websites, apps, videos, downloads or contacting anyone online. All learning happens in this conversation.",
  kindTone:
    "Never mock, shame or express disappointment. Wrong answers are treated as useful information about what to practise next.",
  growthPraise:
    "Praise effort and strategy, not intelligence — 'you kept trying different ways, that worked' rather than 'you're so smart' (growth-mindset practice).",
  honestLimits:
    "If you do not know something or it is beyond the age band, say so simply and suggest asking a grown-up or checking a library book — never invent facts and never use scary detail.",
};

const clean = (value) => String(value ?? "").trim();

/** Rough token estimate from the 4-characters-per-token rule of thumb. */
export function estimateTokens(text) {
  const chars = String(text ?? "").length;
  return { chars, tokens: Math.ceil(chars / CHARS_PER_TOKEN) };
}

/**
 * Build the child-safe tutor system prompt.
 *
 * @param {object} config
 * @returns {{prompt: string, sections: Array, tokens: object, warnings: string[], completeness: number}|{error: string}}
 */
export function buildKidsTutorPrompt(config = {}) {
  const bandKey = AGE_BANDS[config.ageBand] ? config.ageBand : null;
  if (!bandKey) {
    return { error: "Pick an age band — the reading level and examples depend on it." };
  }

  const subjects = Array.isArray(config.subjects)
    ? config.subjects.filter((key) => SUBJECT_OPTIONS[key])
    : [];
  if (subjects.length === 0) {
    return { error: "Pick at least one subject the tutor is allowed to teach." };
  }

  const styleKey = TEACHING_STYLES[config.teachingStyle] ? config.teachingStyle : "socratic";

  const safety = Array.isArray(config.safetyRules)
    ? config.safetyRules.filter((key) => SAFETY_RULES[key])
    : [];

  const tutorName = clean(config.tutorName);
  const extraBoundaries = clean(config.extraBoundaries);
  const learnerNotes = clean(config.learnerNotes);

  const budget = Number(config.tokenBudget ?? DEFAULT_TOKEN_BUDGET);
  if (!Number.isFinite(budget) || budget <= 0) {
    return { error: "The token budget must be a positive number." };
  }

  const sections = [];

  const identity = [
    `You are ${tutorName ? `${tutorName}, ` : ""}a patient, cheerful tutor for a child.`,
    "You teach in tiny steps, celebrate progress, and keep every message short enough for a child to read without help.",
  ].join(" ");
  sections.push({ id: "identity", title: "Role", body: identity });

  sections.push({ id: "age", title: "Age fit", body: `- ${AGE_BANDS[bandKey].line}` });

  sections.push({
    id: "subjects",
    title: "Subjects you may teach",
    body: subjects.map((key) => `- ${SUBJECT_OPTIONS[key]}`).join("\n"),
  });

  if (learnerNotes) {
    sections.push({ id: "learner", title: "About this learner", body: learnerNotes });
  }

  sections.push({
    id: "method",
    title: "How you teach",
    body: [
      `- ${TEACHING_STYLES[styleKey].line}`,
      "- One question or one idea per message. Wait for the child's answer before continuing.",
      "- End most messages with a small, doable next step.",
    ].join("\n"),
  });

  const safetyLines = safety.map((key) => `- ${SAFETY_RULES[key]}`);
  if (extraBoundaries) safetyLines.push(`- ${extraBoundaries}`);
  if (safetyLines.length > 0) {
    sections.push({
      id: "safety",
      title: "Safety rules (these override everything else)",
      body: safetyLines.join("\n"),
    });
  }

  const prompt = sections
    .map((section) => (section.id === "identity" ? section.body : `## ${section.title}\n${section.body}`))
    .join("\n\n");

  const tokens = estimateTokens(prompt);

  const warnings = [];
  if (safety.length === 0) {
    warnings.push("No safety rules selected — a child-facing prompt should never ship without them.");
  } else {
    if (!safety.includes("noPersonalData")) {
      warnings.push("The no-personal-data rule is off. Children's privacy law (COPPA for under-13s) makes this one near-mandatory.");
    }
    if (!safety.includes("adultReferral")) {
      warnings.push("The trusted-adult referral rule is off — add it so sensitive disclosures are routed to a real adult.");
    }
    if (!safety.includes("safeTopics")) {
      warnings.push("The safe-topics rule is off — the tutor can be pulled into any conversation topic.");
    }
  }
  if (tokens.tokens > budget) {
    warnings.push(`The prompt is about ${tokens.tokens} tokens, above your ${budget}-token budget.`);
  }

  const filled = [
    tutorName,
    learnerNotes,
    subjects.length > 0 ? "y" : "",
    safety.length >= 3 ? "y" : "",
    extraBoundaries,
  ].filter((value) => clean(value) !== "").length;
  const completeness = Math.round((filled / 5) * 100);

  return { prompt, sections, tokens, warnings, completeness, bandKey, styleKey };
}
