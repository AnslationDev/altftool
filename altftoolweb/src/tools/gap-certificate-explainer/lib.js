/**
 * Gap certificate / gap affidavit explainer.
 *
 * In Indian admissions and recruitment, a "gap certificate" is in practice a GAP
 * AFFIDAVIT: a self-declaration by the candidate (or a parent, for minors),
 * executed on non-judicial stamp paper and notarised, explaining a break between
 * leaving one course/qualification and joining the next. No authority "issues" it
 * — the candidate declares it. Institutional practice, reflected in the admission
 * brochures of most universities and technical boards, is broadly:
 *  - Gap under ~6 months, within the same admission cycle: usually no document
 *    at all — the next academic session simply had not started.
 *  - Gap of ~6–12 months: many institutions accept a simple self-declaration;
 *    some already want the notarised affidavit.
 *  - Gap of 1 academic year or more: a notarised gap affidavit is the norm.
 *  - Gap over ~2 years: the affidavit plus supporting evidence of what the
 *    candidate did (employment letters, medical papers, coaching enrolment) is
 *    commonly demanded, and some professional courses cap total permissible gap.
 * The thresholds below encode that common practice; individual institutions can
 * and do differ, which the tool says explicitly.
 */

/** Below this many months of gap, institutions generally ask for nothing. */
export const NO_DOCUMENT_MAX_MONTHS = 6;
/** From this many months, a notarised gap affidavit is the standard expectation. */
export const AFFIDAVIT_THRESHOLD_MONTHS = 12;
/** Beyond this, supporting evidence of the gap activity is commonly demanded too. */
export const EXTRA_EVIDENCE_THRESHOLD_MONTHS = 24;

/** Common declared reasons and how admission offices usually read them. */
export const REASON_OPTIONS = [
  {
    id: "entrance-prep",
    label: "Preparing for entrance exams (JEE/NEET/UPSC etc.)",
    phrase: "preparing for competitive entrance examinations",
    evidence: "Coaching enrolment letter, admit cards or scorecards of the attempts made",
  },
  {
    id: "health",
    label: "Health / medical treatment",
    phrase: "undergoing medical treatment and recovery",
    evidence: "Medical certificates, discharge summary or treatment records",
  },
  {
    id: "family",
    label: "Family circumstances",
    phrase: "attending to unavoidable family circumstances",
    evidence: "A brief supporting statement; documents only if the institution asks",
  },
  {
    id: "financial",
    label: "Financial difficulties",
    phrase: "financial difficulties in the family",
    evidence: "Income certificate or a brief supporting statement if asked",
  },
  {
    id: "work",
    label: "Employment / earning experience",
    phrase: "gainful employment",
    evidence: "Experience or relieving letter, payslips or Form 16 for the period",
  },
  {
    id: "improvement",
    label: "Repeating / improving an examination",
    phrase: "reappearing in examinations to improve my result",
    evidence: "Marksheets or admit cards of the improvement attempts",
  },
  {
    id: "other",
    label: "Other (describe your own)",
    phrase: "",
    evidence: "Whatever document best evidences the stated activity",
  },
];

/** What every gap affidavit is expected to contain, per common university checklists. */
export const AFFIDAVIT_CONTENTS = [
  "Full name of the candidate and parent/guardian name",
  "Last qualification passed, with board/university, year and roll number",
  "Exact gap period — month/year the gap started to month/year it ended",
  "The reason for the gap, stated plainly",
  "A declaration that the candidate was not enrolled in any other institution during the gap",
  "A declaration that the candidate was not involved in any unlawful activity during the gap",
  "Deponent's signature before a Notary Public, on non-judicial stamp paper of the value prescribed in your state",
];

const MONTH_PATTERN = /^\d{4}-\d{2}$/;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Parse "yyyy-mm" into { year, month } or null. */
export function parseMonth(value) {
  if (typeof value !== "string" || !MONTH_PATTERN.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  if (month < 1 || month > 12 || year < 1900 || year > 2100) return null;
  return { year, month };
}

/** Human label like "June 2024" for a yyyy-mm string; null when invalid. */
export function formatMonth(value) {
  const parsed = parseMonth(value);
  if (!parsed) return null;
  return `${MONTHS[parsed.month - 1]} ${parsed.year}`;
}

/** Whole months from the start month to the end month (June 2024 -> June 2025 = 12). */
export function monthsBetween(startValue, endValue) {
  const start = parseMonth(startValue);
  const end = parseMonth(endValue);
  if (!start || !end) return null;
  return (end.year - start.year) * 12 + (end.month - start.month);
}

/** Express a month count as "1 year 3 months" style text. */
export function describeMonths(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months > 0 || years === 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
  return parts.join(" ");
}

/**
 * Assess a study gap: how long it is, whether a gap affidavit is normally needed,
 * what to prepare, and a draft affidavit.
 *
 * @param {object} input
 * @param {string} input.gapStart        Month the gap began (yyyy-mm) — usually when the last course ended.
 * @param {string} input.gapEnd          Month the gap ends (yyyy-mm) — usually the month of new admission.
 * @param {string} input.reasonId        One of REASON_OPTIONS ids.
 * @param {string} input.customReason    Free text when reasonId === "other".
 * @param {string} input.candidateName   For the draft affidavit (optional — placeholder used if empty).
 * @param {string} input.parentName      Parent/guardian for the affidavit (optional).
 * @param {string} input.lastQualification e.g. "Class 12 (CBSE), 2024, Roll No. 4152873" (optional).
 * @returns {object} assessment, or { error }.
 */
export function assessGap({
  gapStart,
  gapEnd,
  reasonId,
  customReason = "",
  candidateName = "",
  parentName = "",
  lastQualification = "",
}) {
  const startLabel = formatMonth(gapStart);
  const endLabel = formatMonth(gapEnd);
  if (!startLabel) return { error: "Pick the month the gap started (usually when your last course ended)." };
  if (!endLabel) return { error: "Pick the month the gap ends (usually the month of your new admission)." };

  const months = monthsBetween(gapStart, gapEnd);
  if (months < 0) return { error: "The gap end month cannot be before the gap start month." };
  if (months > 600) return { error: "That is a gap of over 50 years — check the months you selected." };

  const reason = REASON_OPTIONS.find((option) => option.id === reasonId);
  if (!reason) return { error: "Choose the reason for the gap." };
  const reasonPhrase =
    reason.id === "other" ? customReason.trim().replace(/\s+/g, " ") : reason.phrase;
  if (!reasonPhrase) return { error: "Describe the reason for the gap in a few words." };

  let band;
  let verdict;
  let guidance;
  if (months < NO_DOCUMENT_MAX_MONTHS) {
    band = "none";
    verdict = "Usually no gap certificate needed";
    guidance =
      `Your gap is under ${NO_DOCUMENT_MAX_MONTHS} months. Breaks shorter than this, especially within the same admission cycle, are normally treated as the ordinary wait for the next session and need no document. Carry your marksheets showing the dates; prepare an affidavit only if the institution's checklist explicitly asks for one.`;
  } else if (months < AFFIDAVIT_THRESHOLD_MONTHS) {
    band = "declaration";
    verdict = "Self-declaration likely; affidavit possible";
    guidance =
      `Your gap is between ${NO_DOCUMENT_MAX_MONTHS} and ${AFFIDAVIT_THRESHOLD_MONTHS} months. Many institutions accept a simple signed self-declaration for gaps under one year, but a significant number already want the notarised affidavit. Keep the draft below ready — notarising it costs little and removes any doubt at the admission counter.`;
  } else if (months < EXTRA_EVIDENCE_THRESHOLD_MONTHS) {
    band = "affidavit";
    verdict = "Notarised gap affidavit expected";
    guidance =
      `Your gap is ${describeMonths(months)} — one academic year or more. At this length virtually every institution asks for a gap affidavit on non-judicial stamp paper, notarised, stating the period and reason. Prepare it before the admission or document-verification day.`;
  } else {
    band = "affidavit-plus-evidence";
    verdict = "Affidavit plus supporting evidence expected";
    guidance =
      `Your gap is ${describeMonths(months)} — beyond ${EXTRA_EVIDENCE_THRESHOLD_MONTHS / 12} years. Alongside the notarised affidavit, institutions commonly ask for evidence of what you did (${reason.evidence.toLowerCase()}). Some professional courses also cap the permissible gap or seat-allotment eligibility, so read the specific admission brochure carefully.`;
  }

  const name = candidateName.trim().replace(/\s+/g, " ") || "[Full Name]";
  const guardian = parentName.trim().replace(/\s+/g, " ") || "[Parent/Guardian Name]";
  const qualification =
    lastQualification.trim().replace(/\s+/g, " ") ||
    "[Last qualification, board/university, year, roll number]";

  const draftAffidavit = [
    `GAP AFFIDAVIT`,
    `(to be executed on non-judicial stamp paper of the value prescribed in your state and notarised)`,
    ``,
    `I, ${name}, son/daughter of ${guardian}, do hereby solemnly affirm and declare as under:`,
    ``,
    `1. That I passed ${qualification}.`,
    `2. That after the said examination I did not pursue any regular course of study from ${startLabel} to ${endLabel}, a period of ${describeMonths(Math.max(months, 1))}.`,
    `3. That the said gap was on account of ${reasonPhrase}.`,
    `4. That during the said period I was not enrolled in any school, college or university, and my admission was not cancelled by, nor was I expelled from, any institution.`,
    `5. That I was not involved in any unlawful activity during the said period.`,
    ``,
    `I state that the contents of this affidavit are true and correct to the best of my knowledge and belief, and nothing material has been concealed.`,
    ``,
    `Deponent: ${name}`,
    `Place: ____________`,
    `Date: ____________`,
    ``,
    `(Signature of Deponent — to be signed before the Notary Public)`,
  ].join("\n");

  return {
    months,
    gapText: describeMonths(months),
    startLabel,
    endLabel,
    band,
    verdict,
    guidance,
    evidenceSuggestion: reason.evidence,
    contents: AFFIDAVIT_CONTENTS,
    draftAffidavit,
  };
}
