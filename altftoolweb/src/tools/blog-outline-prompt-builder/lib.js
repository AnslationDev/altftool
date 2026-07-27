/**
 * Blog Outline Prompt Builder.
 *
 * Turns a target article length into an explicit word budget per outline block,
 * then writes the outline prompt around that budget so the model plans a piece
 * that actually fits the length asked for.
 */

/**
 * Mean silent reading rate for English non-fiction, 238 words per minute
 * (Brysbaert, 2019, meta-analysis of 190 reading-rate studies).
 */
export const READING_WORDS_PER_MINUTE = 238;

/** Share of the article given to the introduction, with a practical floor. */
export const INTRO_SHARE = 0.1;
export const MIN_INTRO_WORDS = 80;

/** Share given to the conclusion, with a practical floor. */
export const CONCLUSION_SHARE = 0.08;
export const MIN_CONCLUSION_WORDS = 60;

/** A key-takeaways box is a fixed-size block, not a share of the article. */
export const KEY_TAKEAWAYS_WORDS = 90;

/** A useful FAQ answer runs about three sentences. */
export const FAQ_WORDS_PER_QUESTION = 60;

/** A section thinner than this cannot say anything; thicker than this needs splitting. */
export const MIN_SECTION_WORDS = 120;
export const MAX_SECTION_WORDS = 500;

/** Share of a section's budget reserved for its lead-in when it has subsections. */
export const SECTION_LEAD_SHARE = 0.15;

export const LIMITS = {
  totalWords: { min: 200, max: 10000 },
  sections: { min: 1, max: 15 },
  subsections: { min: 0, max: 6 },
  faqs: { min: 0, max: 12 },
};

export const SEARCH_INTENTS = [
  { id: "informational", label: "Informational — the reader wants to understand", directive: "Explain the concept before the tactics. Define every term the first time it appears." },
  { id: "how-to", label: "How-to — the reader wants to do it", directive: "Sequence the outline as numbered steps with a stated prerequisite and an outcome for each." },
  { id: "comparison", label: "Comparison — the reader is choosing", directive: "Give each option a like-for-like section and one shared criteria table; state who each option suits." },
  { id: "opinion", label: "Opinion — the reader wants a position", directive: "State the argument in the introduction, then structure sections as claim, evidence, objection, answer." },
  { id: "listicle", label: "List — the reader wants options to scan", directive: "Make each item independently useful, ordered by usefulness rather than alphabetically." },
];

export const ANGLES = [
  "Beginner explainer",
  "Advanced deep dive",
  "Contrarian take",
  "Case study led",
  "Data led",
  "Mistakes and fixes",
  "Buyer's guide",
  "Process walkthrough",
];

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

/**
 * Split a whole-number budget into `parts` pieces that sum exactly to it.
 * The first (budget mod parts) pieces get one extra word.
 */
export function splitEvenly(budget, parts) {
  if (!(parts > 0)) return [];
  const base = Math.floor(budget / parts);
  const remainder = budget - base * parts;
  return Array.from({ length: parts }, (unused, index) => base + (index < remainder ? 1 : 0));
}

/**
 * Allocate a target word count across the outline blocks.
 * @returns {{error:string}|object}
 */
export function planOutline({
  totalWords,
  sectionCount,
  subsectionsPerSection,
  faqCount,
  includeKeyTakeaways,
} = {}) {
  const total = toInt(totalWords);
  const sections = toInt(sectionCount);
  const subs = toInt(subsectionsPerSection ?? 0);
  const faqs = toInt(faqCount ?? 0);

  if ([total, sections, subs, faqs].some((value) => Number.isNaN(value))) {
    return { error: "Enter whole numbers for the length, sections, subsections and FAQs." };
  }
  if (total < LIMITS.totalWords.min || total > LIMITS.totalWords.max) {
    return {
      error: `Target length must be between ${LIMITS.totalWords.min} and ${LIMITS.totalWords.max} words.`,
    };
  }
  if (sections < LIMITS.sections.min || sections > LIMITS.sections.max) {
    return { error: `Use between ${LIMITS.sections.min} and ${LIMITS.sections.max} main sections.` };
  }
  if (subs < LIMITS.subsections.min || subs > LIMITS.subsections.max) {
    return { error: `Subsections per section must be between ${LIMITS.subsections.min} and ${LIMITS.subsections.max}.` };
  }
  if (faqs < LIMITS.faqs.min || faqs > LIMITS.faqs.max) {
    return { error: `FAQ count must be between ${LIMITS.faqs.min} and ${LIMITS.faqs.max}.` };
  }

  const intro = Math.max(MIN_INTRO_WORDS, Math.round(total * INTRO_SHARE));
  const conclusion = Math.max(MIN_CONCLUSION_WORDS, Math.round(total * CONCLUSION_SHARE));
  const takeaways = includeKeyTakeaways ? KEY_TAKEAWAYS_WORDS : 0;
  const faqBlock = faqs * FAQ_WORDS_PER_QUESTION;
  const body = total - intro - conclusion - takeaways - faqBlock;

  if (body < sections) {
    return {
      error: `Only ${Math.max(0, body)} words are left for ${sections} sections after the intro, conclusion, FAQs and takeaways box. Raise the target length or cut the extras.`,
    };
  }

  const sectionWords = splitEvenly(body, sections);
  const perSection = body / sections;

  const sectionPlan = sectionWords.map((words, index) => {
    const lead = subs > 0 ? Math.max(30, Math.round(words * SECTION_LEAD_SHARE)) : words;
    const subBudget = subs > 0 ? words - lead : 0;
    return {
      index: index + 1,
      words,
      leadWords: lead,
      subsectionWords: subs > 0 ? splitEvenly(subBudget, subs) : [],
    };
  });

  const warnings = [];
  if (perSection < MIN_SECTION_WORDS) {
    warnings.push(
      `Each section only gets ${Math.round(perSection)} words. Below about ${MIN_SECTION_WORDS} a section cannot make a point — use fewer sections or a longer article.`,
    );
  }
  if (perSection > MAX_SECTION_WORDS) {
    warnings.push(
      `Each section carries ${Math.round(perSection)} words. Above about ${MAX_SECTION_WORDS} readers lose the thread — add sections or subsections.`,
    );
  }
  if (subs > 0 && subs * 60 > perSection) {
    warnings.push(
      `${subs} subsections leave under 60 words each. Reduce subsections or lengthen the article.`,
    );
  }

  return {
    total,
    intro,
    conclusion,
    takeaways,
    faqBlock,
    faqs,
    body,
    sections,
    subsections: subs,
    perSection,
    sectionPlan,
    readingMinutes: total / READING_WORDS_PER_MINUTE,
    headingCount: 1 + sections + sections * subs + (faqs > 0 ? 1 : 0),
    warnings,
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

export function getIntent(intentId) {
  return SEARCH_INTENTS.find((intent) => intent.id === intentId) || null;
}

/**
 * Write the outline prompt, embedding the computed word budget.
 * @returns {{error:string}|{text:string, plan:object, ...}}
 */
export function buildOutlinePrompt({
  topic,
  audience,
  angle,
  intentId,
  keyword,
  notes,
  plan,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid word budget first." };
  const intent = getIntent(intentId);
  if (!intent) return { error: "Choose what the reader wants from the article." };
  const subject = typeof topic === "string" && topic.trim() ? topic.trim() : "";
  if (!subject) return { error: "Enter the article topic." };
  const reader = typeof audience === "string" && audience.trim() ? audience.trim() : "a general reader";
  const stance = typeof angle === "string" && angle.trim() ? angle.trim() : ANGLES[0];
  const target = typeof keyword === "string" ? keyword.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    "Write a detailed article outline. Outline only — do not draft the article.",
    "",
    `TOPIC: ${subject}`,
    `READER: ${reader}`,
    `ANGLE: ${stance}`,
    `WHAT THE READER WANTS: ${intent.label.split("—")[0].trim()} — ${intent.directive}`,
  ];
  if (target) lines.push(`PRIMARY SEARCH TERM: ${target} (use it naturally in the H1 and at least one H2; do not repeat it in every heading)`);
  lines.push(
    "",
    `WORD BUDGET — total ${plan.total} words, about ${plan.readingMinutes.toFixed(0)} minutes to read at ${READING_WORDS_PER_MINUTE} words per minute:`,
    `- Introduction: ${plan.intro} words`,
  );
  if (plan.takeaways > 0) lines.push(`- Key takeaways box: ${plan.takeaways} words`);
  for (const section of plan.sectionPlan) {
    if (plan.subsections > 0) {
      lines.push(
        `- H2 section ${section.index}: ${section.words} words (${section.leadWords}-word lead-in, then ${plan.subsections} H3s of about ${section.subsectionWords[0]} words each)`,
      );
    } else {
      lines.push(`- H2 section ${section.index}: ${section.words} words`);
    }
  }
  if (plan.faqBlock > 0) {
    lines.push(`- FAQ: ${plan.faqs} questions at about ${FAQ_WORDS_PER_QUESTION} words each (${plan.faqBlock} words)`);
  }
  lines.push(`- Conclusion: ${plan.conclusion} words`);

  lines.push(
    "",
    "FOR EVERY SECTION GIVE:",
    "1. The H2 (or H3) as it will appear, written as a phrase a reader would search or say.",
    "2. The single point that section must land, in one sentence.",
    "3. The evidence, example or data the writer needs to make that point.",
    "4. The word budget from the list above.",
    "",
    "RULES:",
    "- Order sections so each one is answerable using only what came before it.",
    "- No section may repeat a point made in another; if two overlap, merge them and say so.",
    "- Do not invent statistics, studies or quotations — instead write [source needed] where evidence is required.",
    "- Name the one question the article must answer in its first 100 words.",
    "- End with the three strongest internal-link targets a site on this topic should already have.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, intent, ...measureText(text) };
}
