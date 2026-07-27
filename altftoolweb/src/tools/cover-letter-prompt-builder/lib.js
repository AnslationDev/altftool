/**
 * Cover Letter Prompt Builder.
 *
 * Assembles a structured cover-letter prompt for a general-purpose AI assistant.
 * The structure encoded here is the conventional four-move cover letter taught by
 * university career services and used in recruiter guidance:
 *   1. Opening  — name the exact role, where you saw it, and a one-line hook.
 *   2. Fit      — one or two achievements mapped directly onto the job's requirements.
 *   3. Company  — specific, researched evidence of why this employer and not a generic one.
 *   4. Close    — availability and a plain call to action.
 * The tool also enforces a word budget per paragraph, because the single most common
 * failure of AI-generated cover letters is length drift and padded, generic praise.
 */

/**
 * Conventional length band for a posted-role cover letter: one page, three to four
 * paragraphs, roughly 250-400 words. Shorter reads as thin; longer stops being read.
 */
export const RECOMMENDED_MIN_WORDS = 250;
export const RECOMMENDED_MAX_WORDS = 400;

/** Hard bounds the builder will accept at all. */
export const MIN_WORDS = 100;
export const MAX_WORDS = 800;

/**
 * An emailed cover letter (letter pasted into the message body rather than attached)
 * is conventionally shorter — around 150-200 words — because it is read on a phone.
 */
export const EMAIL_BODY_MAX_WORDS = 200;

const MAX_TEXT = 4000;
const MAX_SHORT = 200;

/**
 * Share of the total word budget given to each move, as whole percentages so the
 * arithmetic stays exact (0.35 * 350 is 122.4999... in binary floating point, which
 * would round the wrong way). Percentages sum to exactly 100; the closing paragraph
 * absorbs any rounding remainder so the parts always add up to the requested total.
 */
export const PARAGRAPH_PLAN = [
  {
    id: "opening",
    label: "Opening hook",
    sharePercent: 15,
    brief:
      "State the exact role and where it was seen, then one specific sentence about why I am writing — no 'I am writing to apply for' boilerplate and no restating my job title.",
  },
  {
    id: "fit",
    label: "Proof of fit",
    sharePercent: 35,
    brief:
      "Take the two requirements that matter most in the posting and answer each with one concrete achievement of mine, including the number or outcome. Do not summarise my whole resume.",
  },
  {
    id: "company",
    label: "Why this employer",
    sharePercent: 30,
    brief:
      "Use only the research notes I supply to show specific knowledge of the company, and connect that to what I want to work on. If the notes are thin, say so rather than inventing praise.",
  },
  {
    id: "close",
    label: "Close and call to action",
    sharePercent: 20,
    brief:
      "One short paragraph: what I would bring in the first months, availability, and a direct request for a conversation. No thanking them for their time twice.",
  },
];

/** Letter situations, each of which changes the framing of the opening and fit paragraphs. */
export const LETTER_TYPES = [
  {
    id: "posted",
    label: "Applying to a posted job",
    instruction:
      "This is a response to an advertised opening, so mirror the language of the posting where it is honest to do so.",
    needsReferrer: false,
  },
  {
    id: "referral",
    label: "Referred by someone inside",
    instruction:
      "This is a referral. Name the referrer in the first sentence and say briefly how they know my work — a referral is the strongest opening available, so do not bury it.",
    needsReferrer: true,
  },
  {
    id: "cold",
    label: "Cold / speculative outreach",
    instruction:
      "There is no advertised opening. Lead with a specific problem the company plausibly has (based only on my research notes) and what I could do about it, then ask whether a role like this exists.",
    needsReferrer: false,
  },
  {
    id: "switch",
    label: "Career change",
    instruction:
      "I am changing field. Address the switch directly and early in one confident sentence, then spend the fit paragraph on transferable, evidenced skills rather than apologising for the gap.",
    needsReferrer: false,
  },
  {
    id: "internal",
    label: "Internal move or promotion",
    instruction:
      "This is an internal application. Assume the reader knows the company, so skip the 'why this employer' praise and use that space for what I have already delivered here and what I would do in the new scope.",
    needsReferrer: false,
  },
];

export const TONE_OPTIONS = [
  { id: "warm", label: "Warm and professional (default)", phrase: "warm but businesslike — plain sentences, first person, no exclamation marks" },
  { id: "formal", label: "Formal", phrase: "formal and restrained, suited to law, finance, academia or government" },
  { id: "direct", label: "Direct / startup", phrase: "direct and concrete, short sentences, suited to startups and product teams" },
  { id: "academic", label: "Academic", phrase: "measured and evidence-led, referring to research interests and methods rather than 'passion'" },
];

export const FORMAT_OPTIONS = [
  {
    id: "letter",
    label: "Full letter (attached document)",
    instruction:
      "Format as a standard letter: my contact block, the date, the hiring manager's name if I supply one, a salutation, the body paragraphs, and a sign-off. Leave clearly marked placeholders such as [Your address] for anything I have not given you.",
  },
  {
    id: "email",
    label: "Email body",
    instruction:
      "Format as the body of an email: no address block, a salutation, short paragraphs with a blank line between them, and a sign-off with my name and phone number placeholder.",
  },
  {
    id: "portal",
    label: "Plain text for an application portal",
    instruction:
      "Format as plain text for a form field: no address block, no markdown, no bullet characters, and no line longer than is comfortable in a small textarea.",
  },
];

/** Concrete research angles worth a sentence; used as prompt hints, not as claims. */
export const RESEARCH_ANGLES = [
  "A product, feature or service they shipped recently",
  "A funding round, acquisition or market they just entered",
  "Something specific in their published values or mission",
  "An engineering, design or research post from their team",
  "A named person on the team and what they work on",
  "A problem in their space I have already solved elsewhere",
];

/**
 * Split a total word budget across the four moves.
 * The final paragraph absorbs rounding so the parts sum to exactly `totalWords`.
 *
 * @param {number} totalWords
 * @returns {Array<{id:string,label:string,words:number,brief:string}>}
 */
export function computeParagraphBudget(totalWords) {
  const total = Math.round(Number(totalWords));
  if (!Number.isFinite(total) || total <= 0) {
    return { error: "Enter the letter length as a positive number of words." };
  }
  const head = PARAGRAPH_PLAN.slice(0, -1).map((part) => ({
    id: part.id,
    label: part.label,
    brief: part.brief,
    words: Math.round((total * part.sharePercent) / 100),
  }));
  const used = head.reduce((sum, part) => sum + part.words, 0);
  const last = PARAGRAPH_PLAN[PARAGRAPH_PLAN.length - 1];
  return [
    ...head,
    {
      id: last.id,
      label: last.label,
      brief: last.brief,
      words: total - used,
    },
  ];
}

/** Whitespace-delimited word count of the generated prompt. */
export function countWords(text) {
  const trimmed = String(text || "").trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Build the cover letter prompt.
 *
 * @param {object} input
 * @param {string} input.typeId          One of LETTER_TYPES ids.
 * @param {string} input.role            Target role (required).
 * @param {string} input.company         Employer name (required).
 * @param {string} [input.source]        Where the role was seen.
 * @param {string} [input.hiringManager] Named addressee.
 * @param {string} [input.referrer]      Referrer name (required for the referral type).
 * @param {string} [input.research]      Researched facts about the employer.
 * @param {string} [input.achievements]  The user's evidence, with numbers.
 * @param {string} input.toneId          One of TONE_OPTIONS ids.
 * @param {string} input.formatId        One of FORMAT_OPTIONS ids.
 * @param {number} input.wordTarget      Total word budget for the letter.
 * @returns {{prompt:string,budget:Array,notes:string[],checklist:string[],wordCount:number}|{error:string}}
 */
export function buildCoverLetterPrompt({
  typeId,
  role,
  company,
  source = "",
  hiringManager = "",
  referrer = "",
  research = "",
  achievements = "",
  toneId,
  formatId,
  wordTarget,
}) {
  const type = LETTER_TYPES.find((item) => item.id === typeId);
  const tone = TONE_OPTIONS.find((item) => item.id === toneId);
  const format = FORMAT_OPTIONS.find((item) => item.id === formatId);
  if (!type || !tone || !format) {
    return { error: "Choose a letter type, tone and format from the lists." };
  }

  const targetRole = String(role || "").trim();
  const employer = String(company || "").trim();
  if (!targetRole) return { error: "Enter the role you are applying for." };
  if (!employer) return { error: "Enter the name of the employer." };

  for (const [label, value] of [
    ["role", targetRole],
    ["employer name", employer],
    ["source", source],
    ["hiring manager", hiringManager],
    ["referrer", referrer],
  ]) {
    if (String(value).length > MAX_SHORT) {
      return { error: `Keep the ${label} under ${MAX_SHORT} characters.` };
    }
  }
  for (const [label, value] of [
    ["research notes", research],
    ["achievements", achievements],
  ]) {
    if (String(value).length > MAX_TEXT) {
      return { error: `Keep the ${label} under ${MAX_TEXT} characters.` };
    }
  }

  const referrerName = String(referrer).trim();
  if (type.needsReferrer && !referrerName) {
    return { error: "A referral letter needs the name of the person who referred you." };
  }

  const total = Number(wordTarget);
  if (!Number.isFinite(total)) return { error: "Enter the letter length as a number of words." };
  if (total < MIN_WORDS || total > MAX_WORDS) {
    return { error: `Choose a length between ${MIN_WORDS} and ${MAX_WORDS} words.` };
  }

  const budget = computeParagraphBudget(total);
  if (budget.error) return { error: budget.error };
  const researchNotes = String(research).trim();
  const evidence = String(achievements).trim();
  const sourceNote = String(source).trim();
  const addressee = String(hiringManager).trim();

  const lines = [];
  lines.push(
    `Act as a hiring manager who has read thousands of cover letters, writing on my behalf. Write a cover letter for the ${targetRole} role at ${employer}.`,
  );
  lines.push("");
  lines.push(`Situation: ${type.instruction}`);
  if (referrerName) {
    lines.push(`I was referred by ${referrerName}.`);
  }
  if (sourceNote) {
    lines.push(`I found the role via ${sourceNote}.`);
  }
  lines.push(
    addressee
      ? `Address it to ${addressee}.`
      : "I do not have a named contact, so open with 'Dear Hiring Team' — never 'To Whom It May Concern'.",
  );
  lines.push("");
  lines.push(`Total length: about ${Math.round(total)} words. Structure it as:`);
  for (const part of budget) {
    lines.push(`- ${part.label} (~${part.words} words): ${part.brief}`);
  }
  lines.push("");
  lines.push(`Tone: ${tone.phrase}.`);
  lines.push(`Format: ${format.instruction}`);
  if (evidence) {
    lines.push("");
    lines.push(`These are my real achievements — use them, do not embellish them: ${evidence}`);
  }
  if (researchNotes) {
    lines.push("");
    lines.push(
      `These are the only facts I have verified about ${employer}. Use them and nothing else about the company: ${researchNotes}`,
    );
  } else {
    lines.push("");
    lines.push(
      `I have not supplied research about ${employer}, so leave a clearly marked placeholder such as [company research: ...] in the third paragraph instead of writing generic praise.`,
    );
  }
  lines.push("");
  lines.push(
    "Hard rules: invent nothing about me or the company — no employers, dates, metrics, product names or claims I have not given you. Do not use the words 'passionate', 'dynamic', 'synergy' or 'I believe I would be a great fit'. Do not repeat my resume line by line. Ask me for anything missing rather than filling it in.",
  );
  lines.push("");
  lines.push("I will paste my resume below.");

  const prompt = lines.join("\n");

  const notes = [];
  if (total < RECOMMENDED_MIN_WORDS) {
    notes.push(
      `${Math.round(total)} words is below the usual ${RECOMMENDED_MIN_WORDS}-${RECOMMENDED_MAX_WORDS} word band — fine for an email or a referral note, thin for a formal application.`,
    );
  } else if (total > RECOMMENDED_MAX_WORDS) {
    notes.push(
      `${Math.round(total)} words runs past one page. Most readers stop around ${RECOMMENDED_MAX_WORDS} words.`,
    );
  } else {
    notes.push(
      `${Math.round(total)} words sits inside the conventional ${RECOMMENDED_MIN_WORDS}-${RECOMMENDED_MAX_WORDS} word, one-page band.`,
    );
  }
  if (format.id === "email" && total > EMAIL_BODY_MAX_WORDS) {
    notes.push(
      `An emailed letter is usually read on a phone; consider trimming to about ${EMAIL_BODY_MAX_WORDS} words.`,
    );
  }
  if (type.id === "internal" && researchNotes) {
    notes.push(
      "For an internal move, spend the third paragraph on results you already delivered here rather than on company research.",
    );
  }

  const checklist = [
    "Paste your resume after the prompt so the model works from real experience, not guesses.",
    researchNotes
      ? "Re-check each company fact in the output against your notes — models embellish research."
      : "Add two or three verified facts about the employer; the third paragraph is worthless without them.",
    addressee
      ? "Confirm the spelling of the hiring manager's name before you send it."
      : "Spend five minutes looking for a named addressee — a name beats 'Dear Hiring Team'.",
    "Read the final letter aloud; cut any sentence that would fit any other company.",
  ];

  return {
    prompt,
    budget,
    notes,
    checklist,
    wordCount: countWords(prompt),
    totalWords: Math.round(total),
    typeLabel: type.label,
    toneLabel: tone.label,
    formatLabel: format.label,
    targetRole,
    employer,
  };
}
