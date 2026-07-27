/**
 * Viva Question Prompt Builder.
 *
 * Takes the candidate's abstract and methods summary, distributes a chosen
 * number of mock examiner questions across the areas a viva predictably
 * covers, and writes a prompt that makes the model act as an examiner who
 * only asks questions answerable from (or probing gaps in) that abstract.
 */

/**
 * The areas an oral examination predictably probes. This clustering follows
 * the well-known finding that viva questions are largely predictable and
 * fall into recurring clusters — originality, conceptualisation, methodology,
 * findings, critique and use — described in Trafford & Leshem's research on
 * doctoral viva questioning ("Stepping Stones to Achieving your Doctorate",
 * 2008) and repeated across university viva-preparation guides.
 */
export const QUESTION_AREAS = [
  {
    id: "opening",
    label: "Opening & summary",
    directive: "Ask the candidate to summarise the thesis and justify why the topic matters.",
  },
  {
    id: "contribution",
    label: "Originality & contribution",
    directive: "Probe exactly what is new and what the field can now do that it could not before.",
  },
  {
    id: "literature",
    label: "Literature & framing",
    directive: "Probe which debates the work sits in and which key positions it accepts or rejects.",
  },
  {
    id: "methodology",
    label: "Methodology & design",
    directive: "Probe why this design was chosen over rivals, and how threats to validity were handled.",
  },
  {
    id: "findings",
    label: "Findings & analysis",
    directive: "Probe how conclusions follow from the data and which result is most fragile.",
  },
  {
    id: "limitations",
    label: "Limitations & critique",
    directive: "Ask what the candidate would do differently and which criticism they find hardest.",
  },
  {
    id: "implications",
    label: "Implications & future work",
    directive: "Probe who should act on the findings and what the next study must be.",
  },
];

/** Bounds that keep a mock viva realistic — real vivas run roughly 10–40 substantive questions. */
export const LIMITS = {
  questions: { min: 4, max: 40 },
  abstractChars: { min: 100, max: 6000 },
};

export const DEGREE_LEVELS = [
  { id: "phd", label: "PhD / doctoral viva" },
  { id: "mphil", label: "MPhil / research master's" },
  { id: "masters", label: "Taught master's dissertation defence" },
  { id: "bachelor", label: "Undergraduate project viva" },
];

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

/**
 * Split a whole-number budget into `parts` pieces that sum exactly to it;
 * the first (budget mod parts) pieces get one extra.
 */
export function splitEvenly(budget, parts) {
  if (!(parts > 0) || !Number.isFinite(budget) || budget < 0) return [];
  const base = Math.floor(budget / parts);
  const remainder = budget - base * parts;
  return Array.from({ length: parts }, (unused, index) => base + (index < remainder ? 1 : 0));
}

/**
 * Distribute the question count across the selected areas, in catalogue order.
 * @returns {{error:string}|{total:number, areaPlan:Array}}
 */
export function distributeQuestions({ questionCount, selectedAreaIds } = {}) {
  const total = toInt(questionCount);
  if (Number.isNaN(total)) return { error: "Enter a whole number of questions." };
  if (total < LIMITS.questions.min || total > LIMITS.questions.max) {
    return {
      error: `Ask for between ${LIMITS.questions.min} and ${LIMITS.questions.max} questions — a real viva rarely holds more.`,
    };
  }
  const ids = Array.isArray(selectedAreaIds) ? selectedAreaIds : [];
  const areas = QUESTION_AREAS.filter((area) => ids.includes(area.id));
  if (areas.length === 0) {
    return { error: "Select at least one question area." };
  }
  if (total < areas.length) {
    return {
      error: `${total} questions cannot cover ${areas.length} areas — raise the count or untick areas.`,
    };
  }
  const counts = splitEvenly(total, areas.length);
  return {
    total,
    areaPlan: areas.map((area, index) => ({ ...area, count: counts[index] })),
  };
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

/**
 * Write the mock-viva prompt around the abstract, methods and question plan.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildVivaPrompt({
  title,
  abstract,
  methods,
  degreeId,
  includeFollowUps,
  includeModelAnswers,
  plan,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid question plan first." };
  const thesisTitle = typeof title === "string" && title.trim() ? title.trim() : "";
  if (!thesisTitle) return { error: "Enter your thesis title." };
  const abstractText = typeof abstract === "string" ? abstract.trim() : "";
  if (abstractText.length < LIMITS.abstractChars.min) {
    return {
      error: `Paste your abstract — at least ${LIMITS.abstractChars.min} characters, so the questions come from your actual work.`,
    };
  }
  if (abstractText.length > LIMITS.abstractChars.max) {
    return {
      error: `Abstract is over ${LIMITS.abstractChars.max.toLocaleString("en-US")} characters — paste the abstract, not a chapter.`,
    };
  }
  const methodsText = typeof methods === "string" ? methods.trim() : "";
  const degree = DEGREE_LEVELS.find((level) => level.id === degreeId);
  if (!degree) return { error: "Choose the examination level." };

  const lines = [
    `Act as the external examiner in a ${degree.label.toLowerCase()}. Generate the questions you would actually ask this candidate.`,
    "",
    `THESIS TITLE: ${thesisTitle}`,
    "",
    "ABSTRACT:",
    abstractText,
  ];
  if (methodsText) {
    lines.push("", "METHODS SUMMARY:", methodsText);
  }
  lines.push(
    "",
    `QUESTIONS — exactly ${plan.total}, grouped and numbered by area:`,
  );
  for (const area of plan.areaPlan) {
    lines.push(`- ${area.label}: ${area.count} question${area.count > 1 ? "s" : ""}. ${area.directive}`);
  }
  lines.push(
    "",
    "RULES:",
    "- Ground every question in a specific claim, method or phrase from the abstract; quote the phrase you are probing.",
    "- Where the abstract is silent on something an examiner would expect (sample size, rival explanation, ethics), ask about the gap and say it is a gap.",
    "- Order questions within each area from settling-in to most challenging.",
    "- No question may be answerable with only yes or no.",
  );
  if (includeFollowUps) {
    lines.push("- After each question, add the follow-up you would ask if the first answer is weak, marked 'Follow-up:'.");
  }
  if (includeModelAnswers) {
    lines.push("- After each question, sketch in two sentences what a strong answer must contain, marked 'Strong answer covers:'.");
  }
  lines.push("- Do not invent findings, numbers or citations that are not in the text above.");

  const text = lines.join("\n");
  return { text, plan, degree, ...measureText(text) };
}
