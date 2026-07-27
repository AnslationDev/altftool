/**
 * Interview recording consent form builder.
 *
 * The required elements come from UK/EU GDPR Article 7 (consent must be freely given,
 * specific, informed and unambiguous, and as easy to withdraw as to give) read with
 * Article 13 (the information a controller must supply when collecting personal data:
 * identity of the controller, purposes, recipients, retention period and data-subject
 * rights). Nothing here is legal advice — it produces a draft to review.
 *
 * Plain-language scoring uses the published Flesch Reading Ease and
 * Flesch-Kincaid Grade Level formulas (Flesch 1948; Kincaid et al. 1975).
 */

/** Flesch Reading Ease constants (Flesch, 1948). */
const FRE_BASE = 206.835;
const FRE_WORDS_PER_SENTENCE = 1.015;
const FRE_SYLLABLES_PER_WORD = 84.6;

/** Flesch-Kincaid Grade Level constants (Kincaid et al., 1975). */
const FKGL_WORDS_PER_SENTENCE = 0.39;
const FKGL_SYLLABLES_PER_WORD = 11.8;
const FKGL_OFFSET = 15.59;

/** Plain-English guidance: aim for Reading Ease 60+ / grade 9 or below. */
export const PLAIN_LANGUAGE_TARGET = { readingEase: 60, gradeLevel: 9 };

/** How the recording may be used. Each option carries the sentence printed in the form. */
export const USAGE_OPTIONS = [
  {
    id: "internal",
    label: "Internal research and reference only",
    sentence: "used inside our team for research and reference, and not published",
  },
  {
    id: "quotes",
    label: "Written quotes in articles or reports",
    sentence: "quoted in writing in articles, reports or research outputs",
  },
  {
    id: "audio",
    label: "Audio publication (podcast, radio)",
    sentence: "published as audio, including podcast and radio episodes",
  },
  {
    id: "video",
    label: "Video publication (film, streaming, social)",
    sentence: "published as video, including film, streaming and social platforms",
  },
  {
    id: "promo",
    label: "Marketing and promotional clips",
    sentence: "cut into short clips used to promote the project",
  },
  {
    id: "archive",
    label: "Deposit in a public or academic archive",
    sentence: "deposited in an archive where others may listen to or view it later",
  },
  {
    id: "training",
    label: "Training internal staff",
    sentence: "used to train our own staff",
  },
];

/** Attribution choices offered to the interviewee. */
export const ATTRIBUTION_OPTIONS = [
  { id: "named", label: "Named — full name and role may be used", sentence: "your name and role may be used" },
  { id: "role", label: "Role only — job title, no name", sentence: "only your role or job title will be used, not your name" },
  { id: "anonymous", label: "Anonymous — no identifying details", sentence: "you will not be named and identifying details will be removed" },
  { id: "choice", label: "Interviewee chooses at signing", sentence: "you choose at signing whether you are named, described by role only, or anonymous" },
];

/** Territory of use. */
export const TERRITORY_OPTIONS = [
  { id: "worldwide", label: "Worldwide", sentence: "anywhere in the world" },
  { id: "country", label: "One country only", sentence: "in the country named above only" },
  { id: "region", label: "One region (for example the EU or South Asia)", sentence: "in the named region only" },
];

/** The elements a usable consent form must contain, with the rule each one answers. */
export const REQUIRED_ELEMENTS = [
  { id: "controller", label: "Who is collecting the recording", basis: "GDPR Art. 13(1)(a) — identity of the controller" },
  { id: "project", label: "What the project is", basis: "GDPR Art. 7(2) — consent must be specific" },
  { id: "purpose", label: "Why the recording is being made", basis: "GDPR Art. 13(1)(c) — purposes of processing" },
  { id: "usage", label: "How the recording may be used", basis: "GDPR Art. 13(1)(e) — recipients and uses" },
  { id: "attribution", label: "Whether the interviewee is named", basis: "Consent must be informed and unambiguous" },
  { id: "retention", label: "How long the recording is kept", basis: "GDPR Art. 13(2)(a) — storage period" },
  { id: "withdrawal", label: "How to withdraw consent", basis: "GDPR Art. 7(3) — withdrawal as easy as giving consent" },
  { id: "contact", label: "A contact point for questions", basis: "GDPR Art. 13(1)(b) — contact details" },
  { id: "signature", label: "Signature and date block", basis: "Evidence that consent was given — GDPR Art. 7(1)" },
];

const VOWEL_GROUPS = /[aeiouy]+/g;

/** Rough syllable count used by both readability formulas. */
export function countSyllables(word) {
  const clean = String(word || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (!clean) return 0;
  let groups = clean.match(VOWEL_GROUPS);
  let count = groups ? groups.length : 0;
  // A silent trailing "e" does not form a syllable unless it is the only vowel group.
  if (clean.length > 2 && clean.endsWith("e") && count > 1) count -= 1;
  return Math.max(1, count);
}

/**
 * Flesch Reading Ease and Flesch-Kincaid Grade Level for a block of text.
 * @param {string} text
 * @returns {object} { words, sentences, syllables, readingEase, gradeLevel } or { error }
 */
export function readability(text) {
  const source = String(text || "").trim();
  if (!source) return { error: "There is no text to score." };

  const sentenceParts = source.split(/[.!?]+(?=\s|$)/).filter((part) => part.trim().length > 0);
  const wordList = source.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const sentences = Math.max(1, sentenceParts.length);
  const words = wordList.length;
  if (words === 0) return { error: "There are no words to score." };

  const syllables = wordList.reduce((sum, word) => sum + countSyllables(word), 0);
  const wps = words / sentences;
  const spw = syllables / words;

  const readingEase = FRE_BASE - FRE_WORDS_PER_SENTENCE * wps - FRE_SYLLABLES_PER_WORD * spw;
  const gradeLevel = FKGL_WORDS_PER_SENTENCE * wps + FKGL_SYLLABLES_PER_WORD * spw - FKGL_OFFSET;

  return {
    words,
    sentences,
    syllables,
    wordsPerSentence: wps,
    syllablesPerWord: spw,
    readingEase: Math.round(readingEase * 10) / 10,
    gradeLevel: Math.max(0, Math.round(gradeLevel * 10) / 10),
  };
}

function joinList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function sentenceCase(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Build the consent form.
 * @param {object} input
 * @returns {object} { text, missing, covered, completeness, readability, wordCount } or { error }
 */
export function buildConsentForm({
  organisation = "",
  interviewer = "",
  projectName = "",
  purpose = "",
  usageIds = [],
  attribution = "named",
  territory = "worldwide",
  territoryName = "",
  retentionYears = 5,
  keepIndefinitely = false,
  withdrawalDays = 14,
  contactEmail = "",
  interviewDate = "",
  paid = false,
  allowEdits = true,
} = {}) {
  const org = String(organisation).trim();
  const project = String(projectName).trim();

  if (!org) return { error: "Enter the organisation or person collecting the recording." };
  if (!project) return { error: "Enter a project name so the consent is specific to it." };

  const usageList = Array.isArray(usageIds) ? usageIds : [];
  const chosenUsage = USAGE_OPTIONS.filter((option) => usageList.includes(option.id));
  if (chosenUsage.length === 0) {
    return { error: "Pick at least one way the recording may be used — blanket consent is not specific." };
  }

  const years = Number(retentionYears);
  if (!keepIndefinitely && (!Number.isFinite(years) || years <= 0)) {
    return { error: "Retention must be a positive number of years, or tick keep indefinitely." };
  }
  if (!keepIndefinitely && years > 100) {
    return { error: "Set a retention period of 100 years or less." };
  }

  const days = Number(withdrawalDays);
  if (!Number.isFinite(days) || days < 0 || days > 365) {
    return { error: "The withdrawal window must be between 0 and 365 days." };
  }

  const attributionOption =
    ATTRIBUTION_OPTIONS.find((option) => option.id === attribution) || ATTRIBUTION_OPTIONS[0];
  const territoryOption =
    TERRITORY_OPTIONS.find((option) => option.id === territory) || TERRITORY_OPTIONS[0];
  const territorySentence =
    territoryOption.id === "worldwide"
      ? territoryOption.sentence
      : String(territoryName).trim()
        ? `in ${String(territoryName).trim()}`
        : territoryOption.sentence;

  const retentionSentence = keepIndefinitely
    ? "We keep the recording for as long as the project archive exists. You can ask us to delete it at any time."
    : `We keep the recording for ${years} ${years === 1 ? "year" : "years"} after the interview, then delete it. You can ask us to delete it sooner.`;

  const withdrawalSentence =
    days === 0
      ? "You can withdraw your consent at any time before we publish. Once something is published we cannot always take it back, but we will stop using it again."
      : `You can withdraw your consent at any time, and up to ${days} days after the interview we will remove your material from anything not yet published. Once something is published we cannot always take it back, but we will stop using it again.`;

  const person = String(interviewer).trim();
  const contact = String(contactEmail).trim();
  const dateLine = String(interviewDate).trim();

  const lines = [];
  lines.push(`CONSENT TO RECORD AN INTERVIEW`);
  lines.push("");
  lines.push(`Project: ${project}`);
  lines.push(`Recorded by: ${org}${person ? ` (${person})` : ""}`);
  if (dateLine) lines.push(`Date of interview: ${dateLine}`);
  lines.push("");
  lines.push("1. What this is");
  lines.push(
    `${org} would like to record an interview with you for ${project}. Please read this page before you sign it. You can ask us anything about it first.`,
  );
  lines.push("");
  lines.push("2. Why we are recording");
  lines.push(
    purpose.trim()
      ? sentenceCase(purpose.trim())
      : `We want an accurate record of what you say so we can use it in ${project}.`,
  );
  lines.push("");
  lines.push("3. How we may use the recording");
  lines.push(
    `The recording, and any transcript of it, may be ${joinList(chosenUsage.map((option) => option.sentence))}. It may be used ${territorySentence}.`,
  );
  if (allowEdits) {
    lines.push("We may edit the recording for length and clarity, but not in a way that changes your meaning.");
  } else {
    lines.push("We will not edit your words other than to remove pauses and false starts.");
  }
  lines.push("");
  lines.push("4. Being named");
  lines.push(`In anything we publish, ${attributionOption.sentence}.`);
  lines.push("");
  lines.push("5. How long we keep it");
  lines.push(retentionSentence);
  lines.push("");
  lines.push("6. Changing your mind");
  lines.push(withdrawalSentence);
  lines.push(
    contact
      ? `To withdraw, or to ask anything about this form, email ${contact}. Withdrawing is as easy as giving consent, and there is no penalty for it.`
      : "To withdraw, or to ask anything about this form, contact us using the details below. Withdrawing is as easy as giving consent, and there is no penalty for it.",
  );
  lines.push("");
  lines.push("7. Payment");
  lines.push(
    paid
      ? "You are being paid for this interview. The fee will be agreed with you separately and does not change any of your rights above."
      : "You are not being paid for this interview, and you are taking part because you want to.",
  );
  lines.push("");
  lines.push("8. Your agreement");
  lines.push("I have read this form. I understand it. I agree to be recorded on the terms above.");
  lines.push("");
  lines.push("Name (please print): ______________________________");
  lines.push("Signature: ________________________________________");
  lines.push("Date: _____________________________________________");
  lines.push("");
  lines.push(`Contact for questions: ${contact || "______________________________"}`);
  lines.push("");
  lines.push(
    "This is a draft for you to review. Rules on recording, personal data and publicity differ by country — have a qualified adviser check it before you use it with the public.",
  );

  const text = lines.join("\n");

  const covered = {
    controller: Boolean(org),
    project: Boolean(project),
    purpose: true,
    usage: chosenUsage.length > 0,
    attribution: true,
    retention: true,
    withdrawal: true,
    contact: Boolean(contact),
    signature: true,
  };
  const missing = REQUIRED_ELEMENTS.filter((element) => !covered[element.id]);
  const coveredCount = REQUIRED_ELEMENTS.length - missing.length;
  const completeness = (coveredCount / REQUIRED_ELEMENTS.length) * 100;

  const body = lines
    .filter((line) => !line.includes("____") && line.trim().length > 0)
    .join(" ");
  const score = readability(body);

  return {
    text,
    missing,
    coveredCount,
    totalElements: REQUIRED_ELEMENTS.length,
    completeness,
    readability: score.error ? null : score,
    wordCount: score.error ? 0 : score.words,
    usageCount: chosenUsage.length,
    retentionLabel: keepIndefinitely ? "Indefinite" : `${years} ${years === 1 ? "year" : "years"}`,
    withdrawalLabel: days === 0 ? "Any time before publication" : `${days} days after the interview`,
  };
}
