/**
 * LinkedIn Headline Prompt Builder.
 *
 * Two jobs:
 *  1. A character budget for the LinkedIn headline field, which is a hard limit
 *     imposed by the platform, split across the positioning segments the user wants.
 *  2. Assembly of a headline prompt and an About-section prompt for an AI model,
 *     carrying that budget and the user's positioning inputs into the instruction.
 *
 * Platform limits used below are LinkedIn's own published field maximums for a
 * member profile. They are hard truncation points, not style advice.
 */

/**
 * LinkedIn member headline field maximum. LinkedIn raised this from 120 to 220
 * characters in 2020; 220 is the current limit on the member profile headline.
 */
export const HEADLINE_MAX_CHARS = 220;

/** LinkedIn "About" (summary) section maximum. */
export const ABOUT_MAX_CHARS = 2600;

/** Maximum length of the title field inside a single Experience entry. */
export const JOB_TITLE_MAX_CHARS = 100;

/**
 * Front-load budget. LinkedIn truncates the headline in search results, comment
 * threads and connection requests, so the opening characters carry the positioning.
 * The exact cut-off varies by surface and screen width, so this is a writing
 * heuristic with a sensible default, not a platform constant — the user can change it.
 */
export const DEFAULT_PREVIEW_CHARS = 60;
export const PREVIEW_CHARS_MIN = 20;
export const PREVIEW_CHARS_MAX = HEADLINE_MAX_CHARS;

/** Segment count the headline is divided into (role, niche, proof, call to action...). */
export const SEGMENT_MIN = 1;
export const SEGMENT_MAX = 6;

/** Separators commonly used between headline segments, with their rendered width. */
export const SEPARATORS = [
  { id: "pipe", label: "Vertical bar  |", value: " | " },
  { id: "bullet", label: "Bullet  •", value: " • " },
  { id: "dash", label: "En dash  –", value: " – " },
  { id: "arrow", label: "Arrow  →", value: " → " },
  { id: "comma", label: "Comma", value: ", " },
];

/** Who the profile is being written for — changes what the headline must earn. */
export const GOALS = [
  {
    id: "job-search",
    label: "Land a job / get recruiter attention",
    instruction:
      "The reader is a recruiter or hiring manager scanning search results. Lead with the exact job title they would search for, then the domain and one proof of scale or result. Do not write 'open to work' inside the headline — LinkedIn has a separate setting for that.",
    aboutInstruction:
      "Open with the role I want and the problem I solve, then three to four short paragraphs: what I do now, two quantified achievements, the skills and tools I work with, and a closing line inviting recruiters to message me.",
  },
  {
    id: "clients",
    label: "Attract clients / freelance work",
    instruction:
      "The reader is a prospective client. Lead with who I help and the outcome I produce for them, not my job title. Name the niche narrowly and include one number that shows the outcome is real.",
    aboutInstruction:
      "Open with the client's problem in their own words, then what I do about it, the process in three steps, proof (results, clients, numbers), who I am the wrong fit for, and how to start a conversation.",
  },
  {
    id: "thought-leadership",
    label: "Build an audience / thought leadership",
    instruction:
      "The reader is a peer deciding whether to follow me. Lead with the subject I publish about and the point of view I hold on it, then my credibility marker.",
    aboutInstruction:
      "Open with the point of view I am known for, then why I hold it, what I have built or seen that earns it, what I publish and how often, and an invitation to follow.",
  },
  {
    id: "sales",
    label: "Sales / business development outreach",
    instruction:
      "The reader is a buyer who just received my connection request. Lead with the segment I serve and the specific result, avoid the word 'sales' as a self-description, and make the headline read like value rather than a pitch.",
    aboutInstruction:
      "Open with the buyer's situation, then the outcomes my customers get with a number, two short proof points, and a low-pressure next step.",
  },
];

export const TONES = [
  { id: "plain", label: "Plain and direct", phrase: "plain, direct and free of buzzwords" },
  { id: "warm", label: "Warm and human", phrase: "warm and conversational, written the way I would speak" },
  { id: "formal", label: "Formal / corporate", phrase: "formal and measured, suited to banking, law or the public sector" },
  { id: "bold", label: "Bold and opinionated", phrase: "bold and opinionated, taking a clear position" },
];

/** Words that make a headline generic; the prompt tells the model to avoid them. */
export const BANNED_CLICHES = [
  "results-driven",
  "passionate about",
  "guru",
  "ninja",
  "rockstar",
  "thought leader",
  "seasoned professional",
  "dynamic",
  "synergy",
  "self-starter",
];

const MAX_FIELD_CHARS = 600;

const clean = (value) => String(value ?? "").trim();

/** Split a comma-separated string into a de-duplicated, trimmed list. */
export function parseKeywords(raw) {
  const seen = new Set();
  const out = [];
  for (const part of String(raw ?? "").split(",")) {
    const token = part.trim();
    if (!token) continue;
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(token);
  }
  return out;
}

/**
 * Character budget for the headline.
 *
 * usable = HEADLINE_MAX_CHARS - separatorWidth * (segments - 1)
 * perSegment = floor(usable / segments)
 *
 * @param {object} input
 * @param {number|string} input.segmentCount   How many segments the headline holds.
 * @param {string} input.separatorValue        The separator string, e.g. " | ".
 * @param {number|string} [input.previewChars] Front-load budget in characters.
 * @param {string} [input.draft]               An existing headline to measure.
 * @param {string[]} [input.keywords]          Keywords that should appear in the headline.
 * @returns {object} budget, or { error } when the input cannot produce a budget.
 */
export function planHeadline({
  segmentCount,
  separatorValue,
  previewChars = DEFAULT_PREVIEW_CHARS,
  draft = "",
  keywords = [],
}) {
  const segments = Number(segmentCount);
  if (!Number.isFinite(segments) || !Number.isInteger(segments)) {
    return { error: "Enter a whole number of headline segments." };
  }
  if (segments < SEGMENT_MIN || segments > SEGMENT_MAX) {
    return { error: `Use between ${SEGMENT_MIN} and ${SEGMENT_MAX} headline segments.` };
  }

  const separator = typeof separatorValue === "string" && separatorValue.length > 0
    ? separatorValue
    : " | ";

  const preview = Number(previewChars);
  if (!Number.isFinite(preview) || !Number.isInteger(preview)) {
    return { error: "Enter the front-load length as a whole number of characters." };
  }
  if (preview < PREVIEW_CHARS_MIN || preview > PREVIEW_CHARS_MAX) {
    return {
      error: `Front-load length must be between ${PREVIEW_CHARS_MIN} and ${PREVIEW_CHARS_MAX} characters.`,
    };
  }

  const separatorTotal = separator.length * (segments - 1);
  const usableChars = HEADLINE_MAX_CHARS - separatorTotal;
  if (usableChars < segments) {
    return { error: "That many segments with this separator leaves no room for text." };
  }
  const perSegmentChars = Math.floor(usableChars / segments);

  const draftText = String(draft ?? "");
  const draftChars = draftText.length;
  const remainingChars = HEADLINE_MAX_CHARS - draftChars;
  const previewText = draftText.slice(0, preview);

  const lowerDraft = draftText.toLowerCase();
  const keywordList = Array.isArray(keywords) ? keywords : parseKeywords(keywords);
  const keywordsFound = keywordList.filter((k) => lowerDraft.includes(k.toLowerCase()));
  const keywordsMissing = keywordList.filter((k) => !lowerDraft.includes(k.toLowerCase()));
  const keywordsInPreview = keywordList.filter((k) =>
    previewText.toLowerCase().includes(k.toLowerCase()),
  );
  const clichesFound = BANNED_CLICHES.filter((c) => lowerDraft.includes(c));

  const warnings = [];
  if (draftChars > HEADLINE_MAX_CHARS) {
    warnings.push(
      `The draft is ${draftChars - HEADLINE_MAX_CHARS} characters over the ${HEADLINE_MAX_CHARS}-character limit and LinkedIn will refuse to save it.`,
    );
  }
  if (draftChars > 0 && keywordsMissing.length > 0) {
    warnings.push(`Not in the draft yet: ${keywordsMissing.join(", ")}.`);
  }
  if (draftChars > 0 && keywordList.length > 0 && keywordsInPreview.length === 0) {
    warnings.push(
      `No target keyword appears in the first ${preview} characters, which is the part most readers see before truncation.`,
    );
  }
  if (clichesFound.length > 0) {
    warnings.push(`Clichés to cut: ${clichesFound.join(", ")}.`);
  }

  return {
    maxChars: HEADLINE_MAX_CHARS,
    aboutMaxChars: ABOUT_MAX_CHARS,
    segments,
    separator,
    separatorTotal,
    usableChars,
    perSegmentChars,
    previewChars: preview,
    previewText,
    draftChars,
    remainingChars,
    overBy: Math.max(0, draftChars - HEADLINE_MAX_CHARS),
    keywords: keywordList,
    keywordsFound,
    keywordsMissing,
    keywordsInPreview,
    clichesFound,
    warnings,
  };
}

/**
 * Build the headline and About-section prompts.
 *
 * @param {object} input
 * @param {string} input.currentRole  What the user does today (required).
 * @param {string} input.targetRole   Title or positioning they want to be found for (required).
 * @param {string} [input.audience]   Who they want to reach.
 * @param {string} [input.proof]      A number, credential or named result.
 * @param {string} [input.differentiator] What makes them different.
 * @param {string} input.goalId       One of GOALS ids.
 * @param {string} input.toneId       One of TONES ids.
 * @param {object} input.budget       The object returned by planHeadline.
 * @param {number} [input.variantCount] How many headline options to request.
 * @returns {{text:string, chars:number, words:number}|{error:string}}
 */
export function buildHeadlinePrompt({
  currentRole,
  targetRole,
  audience = "",
  proof = "",
  differentiator = "",
  goalId,
  toneId,
  budget,
  variantCount = 5,
}) {
  const goal = GOALS.find((g) => g.id === goalId);
  const tone = TONES.find((t) => t.id === toneId);
  if (!goal || !tone) return { error: "Choose a goal and a tone from the lists." };
  if (!budget || budget.error) return { error: budget?.error || "Fix the headline budget first." };

  const nowRole = clean(currentRole);
  const wantRole = clean(targetRole);
  if (!nowRole) return { error: "Enter what you do today." };
  if (!wantRole) return { error: "Enter the role or positioning you want to be found for." };

  const variants = Number(variantCount);
  if (!Number.isFinite(variants) || !Number.isInteger(variants) || variants < 1 || variants > 12) {
    return { error: "Ask for between 1 and 12 headline options." };
  }

  for (const [label, value] of [
    ["current role", nowRole],
    ["target role", wantRole],
    ["audience", audience],
    ["proof point", proof],
    ["differentiator", differentiator],
  ]) {
    if (clean(value).length > MAX_FIELD_CHARS) {
      return { error: `Keep the ${label} under ${MAX_FIELD_CHARS} characters.` };
    }
  }

  const who = clean(audience);
  const evidence = clean(proof);
  const edge = clean(differentiator);

  const lines = [];
  lines.push(
    `Act as a LinkedIn positioning strategist. Write my profile headline and About section.`,
  );
  lines.push("");
  lines.push("About me:");
  lines.push(`- What I do today: ${nowRole}`);
  lines.push(`- What I want to be found for: ${wantRole}`);
  if (who) lines.push(`- Who I want to reach: ${who}`);
  if (evidence) lines.push(`- Proof I can point to: ${evidence}`);
  if (edge) lines.push(`- What makes me different: ${edge}`);
  if (budget.keywords.length > 0) {
    lines.push(`- Terms recruiters or clients search for: ${budget.keywords.join(", ")}`);
  }
  lines.push("");
  lines.push(`Goal: ${goal.instruction}`);
  lines.push("");
  lines.push("Part 1 — headline");
  lines.push(
    `Give me ${variants} headline options. Each must fit inside LinkedIn's ${budget.maxChars}-character headline limit, and each must be built from ${budget.segments} segment${budget.segments === 1 ? "" : "s"} separated by "${budget.separator.trim()}", with roughly ${budget.perSegmentChars} characters per segment.`,
  );
  lines.push(
    `Put the single most searchable term inside the first ${budget.previewChars} characters, because the rest is truncated in search results and comment threads.`,
  );
  if (budget.keywords.length > 0) {
    lines.push(
      `Every option must contain at least one of these search terms verbatim: ${budget.keywords.join(", ")}.`,
    );
  }
  lines.push(`Print the character count in brackets after each option.`);
  lines.push("");
  lines.push("Part 2 — About section");
  lines.push(
    `${goal.aboutInstruction} Stay under LinkedIn's ${budget.aboutMaxChars}-character About limit, and keep the first three lines strong because LinkedIn collapses the rest behind a "see more" link.`,
  );
  lines.push("");
  lines.push(`Tone: ${tone.phrase}.`);
  lines.push(
    `Never use these words: ${BANNED_CLICHES.join(", ")}. Never invent an employer, a title, a certification or a number I did not give you — if a headline needs a metric I have not supplied, leave a bracketed blank for me to fill.`,
  );

  const text = lines.join("\n");
  return {
    text,
    chars: text.length,
    words: text.split(/\s+/).filter(Boolean).length,
  };
}
