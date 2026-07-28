/**
 * Case brief template generator.
 *
 * Structure follows the standard law-school case brief taught in US, UK, Indian and
 * Commonwealth legal-method courses, organised around the IRAC family of analytical
 * frameworks:
 *   IRAC  — Issue, Rule, Application, Conclusion.
 *   FIRAC — the same with a Facts section stated first (the common law-school variant).
 *   CREAC — Conclusion, Rule, Explanation, Application, Conclusion (the legal-writing
 *           variant used for memos and briefs, where the answer is stated up front).
 *
 * Citation formats implemented:
 *   Bluebook (US) — "Name, Volume Reporter FirstPage (Court Year)". The Bluebook omits
 *     the court parenthetical when the reporter alone identifies the court, which is the
 *     case for U.S. (Supreme Court of the United States).
 *   SCC (India)   — "Name, (Year) Volume SCC Page".
 *   Neutral       — "Name [Year] Court Number", the court-assigned neutral citation used
 *     by the UK Supreme Court, the Indian High Courts and many Commonwealth courts.
 *
 * Informational study aid only — not legal advice.
 */

/**
 * Length guidance. Legal-method texts describe a case brief as a one-page document.
 * At roughly 250-300 words per double-spaced page and 500-600 single-spaced, a usable
 * working range is 250-700 words; beyond that the brief is a case summary, not a brief.
 */
export const BRIEF_LENGTH_TARGET = { min: 250, max: 700 };

/** The components of a complete case brief and why each one is there. */
export const BRIEF_SECTIONS = [
  {
    id: "caption",
    label: "Case name and citation",
    heading: "CASE",
    required: true,
    purpose: "Identifies the decision so it can be found and cited again.",
  },
  {
    id: "court",
    label: "Court, year and judges",
    heading: "COURT",
    required: true,
    purpose: "Fixes the authority of the decision — binding, persuasive or neither.",
  },
  {
    id: "procedural",
    label: "Procedural history",
    heading: "PROCEDURAL HISTORY",
    required: true,
    purpose: "Explains who won below and what question actually reached this court.",
  },
  {
    id: "facts",
    label: "Material facts",
    heading: "FACTS",
    required: true,
    purpose: "Only the facts the court relied on — the ones that would change the outcome.",
  },
  {
    id: "issue",
    label: "Issue(s) presented",
    heading: "ISSUE",
    required: true,
    purpose: "The legal question, best phrased as a yes/no question tied to the facts.",
  },
  {
    id: "rule",
    label: "Rule of law",
    heading: "RULE",
    required: true,
    purpose: "The statute, precedent or principle the court applied or announced.",
  },
  {
    id: "holding",
    label: "Holding",
    heading: "HOLDING",
    required: true,
    purpose: "The court's answer to the issue — the part that becomes precedent.",
  },
  {
    id: "reasoning",
    label: "Reasoning / application",
    heading: "REASONING",
    required: true,
    purpose: "How the court moved from the rule to the holding on these facts.",
  },
  {
    id: "disposition",
    label: "Disposition",
    heading: "DISPOSITION",
    required: true,
    purpose: "What the court ordered — affirmed, reversed, remanded, allowed, dismissed.",
  },
  {
    id: "separate",
    label: "Concurring and dissenting opinions",
    heading: "SEPARATE OPINIONS",
    required: false,
    purpose: "Often the source of exam questions and of later doctrinal change.",
  },
  {
    id: "analysis",
    label: "Notes and significance",
    heading: "NOTES",
    required: false,
    purpose: "Your own commentary: why the case is on the syllabus, how it fits the line of authority.",
  },
];

/** Section order and any renamed headings for each analytical framework. */
export const FORMAT_STYLES = [
  {
    id: "firac",
    label: "FIRAC — Facts, Issue, Rule, Application, Conclusion",
    note: "The standard law-school case brief. Facts first, answer last.",
    order: [
      "caption",
      "court",
      "procedural",
      "facts",
      "issue",
      "rule",
      "reasoning",
      "holding",
      "disposition",
      "separate",
      "analysis",
    ],
    headings: { reasoning: "APPLICATION", holding: "CONCLUSION (HOLDING)" },
  },
  {
    id: "irac",
    label: "IRAC — Issue, Rule, Application, Conclusion",
    note: "Issue-led. Useful when you are revising doctrine rather than the story.",
    order: [
      "caption",
      "court",
      "issue",
      "rule",
      "facts",
      "procedural",
      "reasoning",
      "holding",
      "disposition",
      "separate",
      "analysis",
    ],
    headings: { reasoning: "APPLICATION", holding: "CONCLUSION (HOLDING)", facts: "MATERIAL FACTS" },
  },
  {
    id: "creac",
    label: "CREAC — Conclusion, Rule, Explanation, Application, Conclusion",
    note: "Answer-first. Mirrors how a memo or a moot skeleton argument is written.",
    order: [
      "caption",
      "court",
      "holding",
      "rule",
      "procedural",
      "facts",
      "reasoning",
      "disposition",
      "separate",
      "analysis",
    ],
    headings: {
      holding: "CONCLUSION (HOLDING)",
      rule: "RULE",
      procedural: "RULE EXPLANATION — PROCEDURAL POSTURE",
      reasoning: "APPLICATION",
    },
  },
];

/** Citation styles. */
export const CITATION_STYLES = [
  { id: "bluebook", label: "Bluebook (US) — 347 U.S. 483 (1954)" },
  { id: "scc", label: "SCC (India) — (1973) 4 SCC 225" },
  { id: "neutral", label: "Neutral — [2019] UKSC 41" },
  { id: "none", label: "No citation / not reported yet" },
];

/**
 * Reporters whose name alone identifies the court, so Bluebook Rule 10.4 omits the
 * court abbreviation from the date parenthetical.
 */
export const SELF_IDENTIFYING_REPORTERS = ["U.S.", "S. Ct.", "L. Ed.", "L. Ed. 2d"];

/** Common disposition wordings, split by tradition. */
export const DISPOSITION_OPTIONS = [
  { id: "affirmed", label: "Affirmed", sentence: "Judgment of the lower court affirmed." },
  { id: "reversed", label: "Reversed", sentence: "Judgment of the lower court reversed." },
  {
    id: "reversed-remanded",
    label: "Reversed and remanded",
    sentence: "Reversed and remanded for further proceedings consistent with the opinion.",
  },
  {
    id: "vacated-remanded",
    label: "Vacated and remanded",
    sentence: "Vacated and remanded for reconsideration.",
  },
  {
    id: "affirmed-in-part",
    label: "Affirmed in part, reversed in part",
    sentence: "Affirmed in part, reversed in part, and remanded.",
  },
  { id: "appeal-allowed", label: "Appeal allowed", sentence: "Appeal allowed." },
  { id: "appeal-dismissed", label: "Appeal dismissed", sentence: "Appeal dismissed." },
  {
    id: "petition-allowed",
    label: "Writ petition allowed",
    sentence: "Writ petition allowed; relief granted as prayed.",
  },
  { id: "dismissed", label: "Dismissed", sentence: "Petition dismissed." },
  { id: "custom", label: "Other — type it below", sentence: "" },
];

const WORD_PATTERN = /[A-Za-z0-9][A-Za-z0-9'’.-]*/g;

/** Count words in a block of text. Returns 0 for empty or non-string input. */
export function countWords(text) {
  const matches = String(text || "").match(WORD_PATTERN);
  return matches ? matches.length : 0;
}

function clean(value) {
  return String(value == null ? "" : value).trim();
}

/**
 * Format a case citation.
 * @param {object} input
 * @returns {object} { citation } or { error }
 */
export function formatCitation({
  style = "bluebook",
  caseName = "",
  volume = "",
  reporter = "",
  page = "",
  court = "",
  year = "",
} = {}) {
  const name = clean(caseName);
  if (!name) return { error: "Enter the case name before a citation can be built." };
  if (style === "none") return { citation: name };

  const vol = clean(volume);
  const rep = clean(reporter);
  const pg = clean(page);
  const ct = clean(court);
  const yr = clean(year);

  if (yr && !/^\d{3,4}$/.test(yr)) {
    return { error: "Year must be a 3- or 4-digit number, for example 1954." };
  }

  if (style === "bluebook") {
    if (!vol || !rep || !pg) {
      return { error: "Bluebook form needs a volume, a reporter and a first page — for example 347 U.S. 483." };
    }
    const showCourt = ct && !SELF_IDENTIFYING_REPORTERS.includes(rep);
    const parenthetical = [showCourt ? ct : "", yr].filter(Boolean).join(" ");
    return {
      citation: parenthetical
        ? `${name}, ${vol} ${rep} ${pg} (${parenthetical}).`
        : `${name}, ${vol} ${rep} ${pg}.`,
    };
  }

  if (style === "scc") {
    if (!yr || !vol || !pg) {
      return { error: "SCC form needs a year, a volume and a page — for example (1973) 4 SCC 225." };
    }
    return { citation: `${name}, (${yr}) ${vol} ${rep || "SCC"} ${pg}` };
  }

  if (style === "neutral") {
    if (!yr || !ct || !pg) {
      return { error: "A neutral citation needs a year, a court abbreviation and a judgment number — for example [2019] UKSC 41." };
    }
    return { citation: `${name} [${yr}] ${ct} ${pg}` };
  }

  return { error: "Pick one of the supported citation styles." };
}

function wrapBody(text) {
  return clean(text).replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * Build the case brief.
 *
 * @param {object} input Section text keyed by section id, plus format/citation settings.
 * @returns {object} { text, citation, sections, missingRequired, completeness,
 *                     wordCount, lengthVerdict, issueIsQuestion } or { error }
 */
export function buildCaseBrief({
  formatStyle = "firac",
  citationStyle = "bluebook",
  caseName = "",
  volume = "",
  reporter = "",
  page = "",
  court = "",
  year = "",
  judges = "",
  procedural = "",
  facts = "",
  issue = "",
  rule = "",
  holding = "",
  reasoning = "",
  disposition = "affirmed",
  dispositionCustom = "",
  separate = "",
  analysis = "",
  briefedBy = "",
  includeOptional = true,
} = {}) {
  const format = FORMAT_STYLES.find((item) => item.id === formatStyle);
  if (!format) return { error: "Pick one of the supported brief formats." };

  const name = clean(caseName);
  if (!name) return { error: "Enter the case name — a brief with no caption cannot be filed or found." };

  const cite = formatCitation({ style: citationStyle, caseName: name, volume, reporter, page, court, year });
  if (cite.error) return { error: cite.error };

  const dispositionOption =
    DISPOSITION_OPTIONS.find((item) => item.id === disposition) || DISPOSITION_OPTIONS[0];
  const dispositionText =
    dispositionOption.id === "custom" ? clean(dispositionCustom) : dispositionOption.sentence;
  if (dispositionOption.id === "custom" && !dispositionText) {
    return { error: "You chose a custom disposition — type what the court ordered." };
  }

  const courtLine = [clean(court), clean(year)].filter(Boolean).join(", ");
  const captionLine = cite.citation;

  const content = {
    caption: captionLine,
    court: [courtLine, clean(judges) ? `Bench: ${clean(judges)}` : ""].filter(Boolean).join("\n"),
    procedural: wrapBody(procedural),
    facts: wrapBody(facts),
    issue: wrapBody(issue),
    rule: wrapBody(rule),
    holding: wrapBody(holding),
    reasoning: wrapBody(reasoning),
    disposition: dispositionText,
    separate: wrapBody(separate),
    analysis: wrapBody(analysis),
  };

  const sections = format.order
    .map((id) => {
      const meta = BRIEF_SECTIONS.find((item) => item.id === id);
      if (!meta) return null;
      if (!meta.required && !includeOptional) return null;
      return {
        id,
        heading: format.headings[id] || meta.heading,
        label: meta.label,
        required: meta.required,
        purpose: meta.purpose,
        body: content[id] || "",
        filled: Boolean(content[id]),
      };
    })
    .filter(Boolean);

  const requiredSections = sections.filter((section) => section.required);
  const missingRequired = requiredSections.filter((section) => !section.filled);
  const filledRequired = requiredSections.length - missingRequired.length;
  const completeness = requiredSections.length
    ? (filledRequired / requiredSections.length) * 100
    : 0;

  const lines = [];
  lines.push("CASE BRIEF");
  if (clean(briefedBy)) lines.push(`Briefed by: ${clean(briefedBy)}`);
  lines.push("");
  sections.forEach((section) => {
    lines.push(section.heading);
    lines.push(section.body || `[ ${section.label} — to complete ]`);
    lines.push("");
  });
  const text = lines.join("\n").trimEnd();

  const wordCount = sections.reduce((sum, section) => sum + countWords(section.body), 0);

  let lengthVerdict;
  if (wordCount < BRIEF_LENGTH_TARGET.min) {
    lengthVerdict = {
      status: "short",
      message: `${wordCount} words — under the ${BRIEF_LENGTH_TARGET.min}-word floor for a usable one-page brief.`,
    };
  } else if (wordCount > BRIEF_LENGTH_TARGET.max) {
    lengthVerdict = {
      status: "long",
      message: `${wordCount} words — over ${BRIEF_LENGTH_TARGET.max}. Cut facts the court did not rely on.`,
    };
  } else {
    lengthVerdict = {
      status: "ok",
      message: `${wordCount} words — inside the ${BRIEF_LENGTH_TARGET.min}-${BRIEF_LENGTH_TARGET.max} word one-page range.`,
    };
  }

  const issueText = content.issue;
  const issueIsQuestion = issueText ? /\?\s*$/.test(issueText) : false;

  return {
    text,
    citation: captionLine,
    sections,
    missingRequired,
    requiredCount: requiredSections.length,
    filledRequired,
    completeness,
    wordCount,
    lengthVerdict,
    issueIsQuestion,
    formatLabel: format.label,
    formatNote: format.note,
  };
}
