/**
 * Singapore entry visa refusal grounds.
 *
 * Singapore's Immigration & Checkpoints Authority does not publish a reason when an entry
 * visa application is unsuccessful, and it is not obliged to. That makes a Singapore
 * refusal different from a Schengen or IRCC one: there is no ticked box to read. What can
 * be done is to work through the requirements that the application is assessed against -
 * Form 14A and its supporting documents, the local contact or sponsor, financial capacity,
 * the applicant's immigration record and the purpose of the visit - and close every gap
 * before reapplying.
 *
 * The grounds below are the assessment areas behind Singapore's visa framework, not
 * quotations from a refusal letter, because no such letter is issued. Informational only.
 */

export const COUNTRY_LABEL = "Singapore";

/** Form and document compliance is the most common fixable cause. */
export const DEFAULT_GROUND_ID = "form-documents";

/**
 * Under the Immigration Act 1959 the grant of an entry visa is at the discretion of the
 * Controller of Immigration. There is no statutory appeal, and ICA states that reasons for
 * an unsuccessful application are not disclosed. A fresh application may be submitted at
 * any time; a separate, later decision is still made at the checkpoint.
 */
export const APPEAL_RULE = {
  title: "No reasons, no appeal - what actually helps",
  detail:
    "The grant of a Singapore entry visa is a discretionary decision of the Controller of Immigration under the Immigration Act, and ICA does not disclose the reason an application was unsuccessful. There is no appeal channel and no review tribunal. Three things do help. First, you may submit a fresh application at any time - there is no waiting period - but only a materially better file changes the outcome, and the processing fee is charged again and is not refundable. Second, applications submitted through an authorised visa agent or a local contact who is a Singapore citizen or permanent resident aged 21 or above, with a proper Letter of Introduction, are assessed on a fuller picture. Third, remember an approved visa is only permission to travel: the immigration officer at the checkpoint still decides whether to grant a visit pass and for how long.",
};

export const SEVERITY_LABELS = {
  low: "Low - a form or document gap you can close this week",
  medium: "Medium - a question about the substance of the visit",
  high: "High - an immigration or enforcement record working against you",
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3 };

export const READINESS_BANDS = [
  { min: 0, label: "Not ready - the same file would fail again" },
  { min: 40, label: "Partly ready - the main gap is still open" },
  { min: 70, label: "Nearly ready - one or two items left" },
  { min: 100, label: "Ready - every listed gap is closed" },
];

export const REFUSAL_GROUNDS = [
  {
    id: "form-documents",
    code: "Form 14A compliance",
    title: "Form 14A or supporting documents not compliant",
    legalBasis: "Immigration Regulations - application for entry visa on Form 14A through the SAVE system",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The application form or its attachments did not meet the stated requirements. Singapore is unusually strict about the photograph and scan specifications, and a submission that fails them can be rejected without the substance ever being weighed.",
    triggers: [
      "A photograph that is not a recent colour image on a plain white background, taken within the last three months",
      "A passport with less than six months validity remaining from the date of intended entry",
      "A blank or inconsistent field on Form 14A, including an incomplete address history",
      "Scans that are cropped, low resolution or missing pages of the passport biodata page",
    ],
    fixes: [
      "Reshoot the photograph to the published pixel and size specification on a plain white background",
      "Renew the passport if it will not have at least six months validity on the date of entry",
      "Complete every field of Form 14A, including previous names and any earlier Singapore visits",
      "Re-scan the passport biodata page in colour at full size and confirm the file opens after upload",
    ],
    keywords: ["form 14a", "photograph", "passport validity", "incomplete form", "supporting documents"],
  },
  {
    id: "local-contact",
    code: "Local contact / Letter of Introduction",
    title: "Local contact or sponsor requirement not properly met",
    legalBasis: "ICA requirement for submission by an authorised visa agent, a local contact or a strategic partner",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "Applications are submitted through an authorised local agent, a strategic partner, or a local contact who is a Singapore citizen or permanent resident aged 21 or above. Where a Letter of Introduction is required, it must identify the contact, their status, the relationship and the purpose of the visit. A vague or missing letter leaves the application without the local accountability the framework expects.",
    triggers: [
      "A local contact under 21, or holding neither citizenship nor permanent residence",
      "A Letter of Introduction with no stated relationship, address or purpose",
      "A contact who cannot be reached on the number given",
      "Submitting directly where your nationality requires an agent or local sponsor",
    ],
    fixes: [
      "Confirm your local contact is a Singapore citizen or PR aged 21 or above before filing",
      "Have the contact write a dated Letter of Introduction stating the relationship, the purpose and the dates",
      "Attach the contact's identity document and a reachable phone number and email",
      "Where no local contact exists, submit through an authorised visa agent rather than alone",
    ],
    keywords: ["local contact", "letter of introduction", "loi", "sponsor", "authorised visa agent"],
  },
  {
    id: "purpose",
    code: "Purpose of visit",
    title: "Purpose of visit unclear or inconsistent with a short social visit",
    legalBasis: "Immigration Act 1959 - conditions for the grant of a visit pass",
    severity: "medium",
    reapplyWaitDays: 30,
    meaning:
      "The short-term visit pass is for tourism, a family visit or business meetings. If the file reads as though the real purpose is employment, a long stay or repeated near-continuous presence, the application is weighed differently. Any activity amounting to work needs a work pass, not a visit pass.",
    triggers: [
      "An itinerary with no accommodation, no return booking and no stated activity",
      "Business travel with no letter from either company and no meeting details",
      "A pattern of back-to-back visits that reads as living in Singapore on visit passes",
      "Any indication of taking up employment while on a visit pass",
    ],
    fixes: [
      "File a day-by-day itinerary with confirmed accommodation matching the requested dates",
      "For business travel, attach letters from both the sending and the receiving company",
      "Book a confirmed onward or return ticket before travelling",
      "If the purpose is work, apply for the correct work pass instead of a visit pass",
    ],
    keywords: ["purpose of visit", "social visit pass", "short term visit pass", "itinerary", "work pass"],
  },
  {
    id: "funds",
    code: "Financial capacity",
    title: "Insufficient evidence of funds for the visit",
    legalBasis: "Immigration Act 1959 - visit pass conditions, including means of support",
    severity: "medium",
    reapplyWaitDays: 30,
    meaning:
      "You are expected to be able to support yourself for the stay and to leave at the end of it. Singapore publishes no fixed daily figure, so the test is whether the money and the sponsorship shown plausibly cover the itinerary filed.",
    triggers: [
      "A single-day balance snapshot instead of a statement history",
      "A recent large deposit with no traceable source",
      "No evidence of income, employment or business activity at home",
      "A host said to be paying with no proof of their means",
    ],
    fixes: [
      "Attach three to six months of bank statements showing a steady balance",
      "Document the source of any recent large credit with the underlying paperwork",
      "Add employment or business proof - a letter, pay slips, or registration and tax filings",
      "Where a host funds the trip, attach their income proof and a signed undertaking",
    ],
    keywords: ["sufficient funds", "financial", "bank statement", "means of support", "sponsorship"],
  },
  {
    id: "ties",
    code: "Ties to your country of residence",
    title: "Weak evidence that you will leave at the end of the visit",
    legalBasis: "Immigration Act 1959 - discretion of the Controller of Immigration",
    severity: "medium",
    reapplyWaitDays: 60,
    meaning:
      "Every immigration system weighs whether a visitor will go home, and Singapore is no exception even though it never says so. Stable employment, dependants, property, an ongoing course or a business are what carry that weight.",
    triggers: [
      "Unemployment, or a recent job change with no confirmation of leave",
      "No dependants, property or other commitment shown at home",
      "A requested stay far longer than the stated purpose needs",
      "First-time international travel with no prior record of returning on time",
    ],
    fixes: [
      "Attach an employer letter with role, tenure, approved leave dates and the resumption date",
      "Show what you return to: dependants, property papers, a lease, an ongoing course or a business",
      "Request only the number of days the trip actually needs",
      "Build a record of on-time returns from other destinations before reapplying",
    ],
    keywords: ["ties", "employment", "intention to return", "length of stay", "travel history"],
  },
  {
    id: "immigration-record",
    code: "Adverse immigration record",
    title: "Previous overstay, refused entry or enforcement action",
    legalBasis: "Immigration Act 1959 - prohibited immigrant provisions and overstaying offences",
    severity: "high",
    reapplyWaitDays: 730,
    meaning:
      "A past overstay, a refusal of entry at the checkpoint, or an enforcement action stays on the record and weighs against every later application. Singapore treats overstaying seriously: overstaying beyond 90 days is a criminal offence carrying imprisonment and, for male offenders, caning, and offenders are normally barred from returning.",
    triggers: [
      "Staying beyond the date endorsed on the visit pass, even by a short period",
      "A previous refusal of entry at a Singapore checkpoint",
      "Working in Singapore without the correct pass",
      "Any past deportation or removal from Singapore",
    ],
    fixes: [
      "Establish exactly what happened and on what dates - the endorsed pass date, not the visa date, governs",
      "Regularise anything outstanding before filing, and keep every receipt or clearance letter",
      "Apply through an authorised visa agent who can present the history properly",
      "Allow a substantial gap and build a clean record elsewhere before reapplying",
    ],
    keywords: ["overstay", "overstayed", "refused entry", "prohibited immigrant", "deported", "barred"],
  },
  {
    id: "security-health",
    code: "Security, criminal or public health record",
    title: "Security, criminal or public health concern",
    legalBasis: "Immigration Act 1959 - prohibited immigrant classes",
    severity: "high",
    reapplyWaitDays: 365,
    meaning:
      "The Immigration Act lists classes of prohibited immigrant, including people convicted of certain offences and people considered undesirable on security or public health grounds. Decisions on this basis are not explained and are not negotiable through the ordinary application route.",
    triggers: [
      "A criminal conviction, whether or not it is spent at home",
      "An adverse security or watchlist record",
      "A notifiable communicable disease",
    ],
    fixes: [
      "Obtain a current police clearance certificate and the court order closing any case",
      "Take legal advice before reapplying rather than repeating the same application",
      "Complete any medical treatment and obtain written clearance before travelling",
      "Never conceal a conviction - a concealed record turns a refusal into a credibility finding",
    ],
    keywords: ["criminal record", "conviction", "security", "prohibited immigrant", "public health"],
  },
];

const GROUND_BY_ID = new Map(REFUSAL_GROUNDS.map((ground) => [ground.id, ground]));

export function getGround(id) {
  return GROUND_BY_ID.get(id) || null;
}

const norm = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Match free text - an agent's message, an ICA outcome notice or your own notes - against
 * each assessment area's keyword list. Deterministic: score is the count of distinct
 * keywords found, confidence is that count as a percentage of the keyword list.
 *
 * @returns {{error:string}|{matches:Array<{id:string,title:string,score:number,confidence:number,matchedTerms:string[]}>}}
 */
export function matchRefusalText(text, { limit = 3 } = {}) {
  if (typeof text !== "string") return { error: "Refusal text must be a string." };
  const haystack = norm(text);
  if (haystack.length === 0) return { matches: [] };

  const matches = [];
  for (const ground of REFUSAL_GROUNDS) {
    const matchedTerms = ground.keywords.filter((keyword) => haystack.includes(norm(keyword)));
    if (matchedTerms.length === 0) continue;
    matches.push({
      id: ground.id,
      title: ground.title,
      score: matchedTerms.length,
      confidence: Math.round((matchedTerms.length / ground.keywords.length) * 100),
      matchedTerms,
    });
  }

  matches.sort((a, b) => b.score - a.score || b.confidence - a.confidence);
  return { matches: matches.slice(0, Math.max(1, Math.trunc(limit))) };
}

function bandFor(readiness) {
  let label = READINESS_BANDS[0].label;
  for (const band of READINESS_BANDS) {
    if (readiness >= band.min) label = band.label;
  }
  return label;
}

const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;

function describeWait(days) {
  if (days <= 0) return "No waiting period applies - reapply as soon as the file is genuinely better.";
  if (days < 365) {
    return `Allow at least about ${plural(Math.round(days / 30), "month")} so something concrete has changed.`;
  }
  return `Allow a long gap - roughly ${plural(Math.round(days / 365), "year")} - and expect the record to be visible throughout.`;
}

/**
 * Combine the fix checklists for the selected assessment areas and score readiness.
 *
 * @returns {{error:string}|object}
 */
export function buildActionPlan({ groundIds = [], completedSteps = [] } = {}) {
  if (!Array.isArray(groundIds)) return { error: "Select at least one area to review." };
  const grounds = groundIds.map(getGround).filter(Boolean);
  if (grounds.length === 0) {
    return { error: "Select at least one area to review - ICA does not state a reason, so work through the likely ones." };
  }

  const done = new Set(Array.isArray(completedSteps) ? completedSteps : []);
  const steps = [];
  const seen = new Set();
  for (const ground of grounds) {
    ground.fixes.forEach((text, index) => {
      if (seen.has(text)) return;
      seen.add(text);
      steps.push({ key: `${ground.id}-${index}`, groundId: ground.id, text });
    });
  }

  const totalSteps = steps.length;
  const doneSteps = steps.filter((step) => done.has(step.key)).length;
  const readiness = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const severity = grounds.reduce(
    (worst, ground) => (SEVERITY_ORDER[ground.severity] > SEVERITY_ORDER[worst] ? ground.severity : worst),
    "low",
  );
  const reapplyWaitDays = grounds.reduce((max, ground) => Math.max(max, ground.reapplyWaitDays), 0);

  return {
    grounds,
    steps,
    totalSteps,
    doneSteps,
    openSteps: totalSteps - doneSteps,
    readiness,
    band: bandFor(readiness),
    severity,
    reapplyWaitDays,
    reapplyAdvice: describeWait(reapplyWaitDays),
    appealSummary: "No appeal and no reasons given - a fresh, materially stronger application is the only route",
  };
}
