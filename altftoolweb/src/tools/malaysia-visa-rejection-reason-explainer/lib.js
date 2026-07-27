/**
 * Malaysian visa and eVISA rejection grounds.
 *
 * Malaysian visas are issued by the Immigration Department of Malaysia (Jabatan Imigresen
 * Malaysia) under the Immigration Act 1959/63 and the Immigration Regulations 1963. Most
 * short-stay applications now run through the eVISA portal, which decides on the uploaded
 * file, so rejections are dominated by document specification failures, mismatched data
 * and records held in the immigration monitoring system rather than by interviews.
 *
 * Note two separate things travellers often confuse: the visa, which is permission to
 * travel, and the Malaysia Digital Arrival Card, which every foreign traveller submits
 * free of charge shortly before arrival and which is not a visa at all.
 *
 * Informational only, not immigration advice.
 */

export const COUNTRY_LABEL = "Malaysian";

/** Document and photograph specification failures dominate eVISA rejections. */
export const DEFAULT_GROUND_ID = "documents";

/**
 * There is no appeal against an eVISA rejection and the fee is not refunded. A corrected
 * fresh application is the normal route. A blacklist entry is different: it is held in the
 * Immigration Department's monitoring system and is dealt with by the Department, not by
 * the portal.
 */
export const APPEAL_RULE = {
  title: "No appeal - correct the file, or clear the record first",
  detail:
    "A rejected Malaysian eVISA carries no appeal and the fee is not refunded, so the practical route is a corrected fresh application on the official portal. Before paying again, work out which of two problems you have. If the rejection was about documents - the photograph, the passport scan, a missing return ticket or hotel booking - it is fixed the same week. If there is a record against your passport in the Immigration Department's monitoring system, usually after an overstay, a removal or a refusal of entry, no amount of new paperwork helps: that has to be taken up with the Immigration Department directly, normally through a representative in Malaysia. Separately, employment, student and dependant passes need a Visa With Reference approved in Malaysia by the sponsor before the mission can issue anything.",
};

export const SEVERITY_LABELS = {
  low: "Low - an upload or specification defect, fixable this week",
  medium: "Medium - the trip or the visa type was not established",
  high: "High - an immigration record or blacklist entry applies",
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3 };

export const READINESS_BANDS = [
  { min: 0, label: "Not ready - the same application would be rejected again" },
  { min: 40, label: "Partly ready - the main defect is still there" },
  { min: 70, label: "Nearly ready - one or two items left" },
  { min: 100, label: "Ready - every listed gap is closed" },
];

export const REFUSAL_GROUNDS = [
  {
    id: "documents",
    code: "eVISA document specification",
    title: "Photograph or documents did not meet the specification",
    legalBasis: "Immigration Regulations 1963 and the eVISA portal upload requirements",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The portal enforces its photograph and scan rules strictly, and a caseworker rejects an application whose supporting documents are unreadable, expired or missing. Nothing about the traveller is assessed once a file fails at this stage.",
    triggers: [
      "A photograph that is not a recent colour image on a plain white background at the stated size",
      "A passport with less than six months validity remaining from the date of arrival",
      "A passport data page scan with glare, cropping or missing machine-readable lines",
      "A supporting document uploaded in the wrong file type or above the size limit",
    ],
    fixes: [
      "Take a fresh photograph to the portal's stated dimensions on a plain white background",
      "Renew the passport if it will not have six months validity left on the arrival date",
      "Scan the passport data page flat in colour with all corners and both machine-readable lines visible",
      "Check each uploaded file opens and is inside the portal's file type and size limits",
    ],
    keywords: ["photograph", "photo specification", "passport validity", "scan", "upload", "file size"],
  },
  {
    id: "itinerary",
    code: "Travel plan evidence",
    title: "Return ticket, accommodation or itinerary not evidenced",
    legalBasis: "Immigration Act 1959/63 s.8 - conditions for admission",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "Malaysian immigration expects a confirmed onward or return ticket, accommodation for the stay and an itinerary that fits the dates. This is checked twice: once by the visa caseworker, and again by the officer at the counter, who can refuse entry even to a visa holder who cannot show them.",
    triggers: [
      "A one-way ticket with no onward leg",
      "Accommodation booked for part of the stay only",
      "Booking dates that do not match the dates on the application",
      "A stated host address that cannot be confirmed",
    ],
    fixes: [
      "Hold a confirmed onward or return ticket dated inside the permitted stay",
      "Book accommodation covering every night, in the traveller's own name",
      "Align the booking dates with the application dates exactly",
      "Carry printed copies for the counter as well - the officer at arrival asks for them again",
    ],
    keywords: ["return ticket", "onward ticket", "hotel booking", "accommodation", "itinerary", "flight"],
  },
  {
    id: "funds",
    code: "Financial capacity",
    title: "Insufficient evidence of funds for the visit",
    legalBasis: "Immigration Act 1959/63 s.8(3)(a) - persons without adequate means of support",
    severity: "medium",
    reapplyWaitDays: 30,
    meaning:
      "Section 8 treats a person unable to show adequate means of supporting themselves as a prohibited immigrant. Malaysia publishes no single daily figure, so the test is whether the funds shown plausibly cover the itinerary that was filed.",
    triggers: [
      "A single-day balance instead of a statement history",
      "A recent large deposit with no evidence of its source",
      "No employment, business or income evidence at all",
      "A sponsor named with no proof of their means or the relationship",
    ],
    fixes: [
      "Upload three to six months of bank statements, issued or stamped by the bank",
      "Keep the balance stable rather than topping it up immediately before applying",
      "Document the source of any recent large credit with its underlying paperwork",
      "Where someone else pays, add their statements, income proof and a signed undertaking",
    ],
    keywords: ["sufficient funds", "bank statement", "means of support", "financial", "sponsor"],
  },
  {
    id: "data-mismatch",
    code: "Data mismatch",
    title: "Application details do not match the passport",
    legalBasis: "Immigration Regulations 1963 - accuracy of particulars declared",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The portal checks what you typed against the passport image. Name order, a missing middle name, one wrong character in the passport number or the wrong nationality will each end the application, and nothing is corrected for you.",
    triggers: [
      "Given name and surname entered in the wrong fields",
      "A name on the form that does not exactly match the passport",
      "A transposed digit in the passport number or the wrong issue or expiry date",
      "The wrong nationality or wrong passport type selected",
    ],
    fixes: [
      "Copy every field from the passport machine-readable zone, character by character",
      "Enter names exactly as printed, in the same order, including middle names",
      "Re-check the passport number for the classic 0 and O, 1 and I confusions",
      "Verify nationality, passport type and both passport dates before submitting",
    ],
    keywords: ["mismatch", "name", "passport number", "incorrect details", "typo", "particulars"],
  },
  {
    id: "wrong-type",
    code: "Wrong visa type or missing Visa With Reference",
    title: "Wrong visa type, or a Visa With Reference was required",
    legalBasis: "Immigration Act 1959/63 and the pass and permit classes in the Immigration Regulations",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "Social visit, business, student, employment and dependant categories are separate, and several of them cannot start with the traveller at all. Employment, student and dependant applications need a Visa With Reference, applied for inside Malaysia by the employer, institution or sponsor and approved by the Immigration Department before a mission can issue anything.",
    triggers: [
      "Applying for a social visit visa while intending to work or study",
      "Applying at a mission for a category that requires prior approval inside Malaysia",
      "Choosing single entry when the trip needs multiple entries",
      "A business trip filed with no invitation from the Malaysian company",
    ],
    fixes: [
      "Match the category to the activity before paying - social visit, business, student, employment or dependant",
      "For work or study, have the Malaysian employer or institution obtain the Visa With Reference approval first",
      "Attach the Malaysian company's invitation letter and registration details for a business trip",
      "Choose single or multiple entry to match the actual travel plan",
    ],
    keywords: ["visa with reference", "vdr", "wrong visa type", "social visit", "employment pass", "student pass"],
  },
  {
    id: "overstay",
    code: "Overstay under the Immigration Act",
    title: "Previous overstay in Malaysia",
    legalBasis: "Immigration Act 1959/63 s.15 - remaining after the pass has expired",
    severity: "high",
    reapplyWaitDays: 1095,
    meaning:
      "Remaining in Malaysia after a pass expires is an offence under section 15 of the Immigration Act, punishable by a fine of up to RM 10,000 or imprisonment of up to five years, or both. Beyond the penalty, an overstay normally puts the traveller's details into the Immigration Department's monitoring list, which blocks later applications regardless of how good the new file is.",
    triggers: [
      "Staying beyond the date stamped on the social visit pass, not the date on the visa",
      "Assuming an exit and re-entry resets the permitted period",
      "Leaving without settling a compound or fine",
    ],
    fixes: [
      "Establish the exact overstay length and the departure date from your passport stamps",
      "Keep every compound receipt and departure record; you may need to prove the matter was closed",
      "Check whether your details sit on the Immigration Department's monitoring list before applying",
      "Deal with any listing through the Immigration Department, normally via a representative in Malaysia",
    ],
    keywords: ["overstay", "overstayed", "section 15", "compound", "fine", "expired pass"],
  },
  {
    id: "blacklist",
    code: "Immigration monitoring list",
    title: "Blacklisted, removed or previously refused entry",
    legalBasis: "Immigration Act 1959/63 s.8 - prohibited immigrants; departmental monitoring system",
    severity: "high",
    reapplyWaitDays: 1095,
    meaning:
      "Section 8 lists the classes of prohibited immigrant, and the Immigration Department keeps a monitoring list of people who have been removed, refused entry, or found working without the right pass. An entry on that list is not visible on your passport and is not something the eVISA portal will explain - it simply produces repeated rejections.",
    triggers: [
      "A previous removal or deportation from Malaysia",
      "A not-to-land decision at a Malaysian airport",
      "Working in Malaysia on a social visit pass",
      "A conviction or an outstanding immigration matter",
    ],
    fixes: [
      "Check the Immigration Department's monitoring status for your passport details before reapplying",
      "Collect the paperwork from the original incident - removal order, compound receipt, court record",
      "Instruct a Malaysian representative to take the listing up with the Immigration Department",
      "Do not keep resubmitting the eVISA while a listing stands; each rejection costs another fee",
    ],
    keywords: ["blacklist", "blacklisted", "sspi", "not to land", "removed", "deported", "prohibited immigrant"],
  },
  {
    id: "arrival-card",
    code: "Malaysia Digital Arrival Card",
    title: "Arrival card not submitted, or confused with the visa",
    legalBasis: "Malaysia Digital Arrival Card requirement, in force since 1 January 2024",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The Malaysia Digital Arrival Card is a free online declaration that foreign travellers submit shortly before arrival, generally within three days of travel. It is not a visa and it does not replace one, but arriving without it causes problems at the counter, and travellers who paid an unofficial site for it often assume they now hold a visa when they do not.",
    triggers: [
      "Assuming the arrival card is the visa, or the visa removes the need for the card",
      "Submitting the card too early, outside the accepted window before arrival",
      "Paying a third-party site for what is a free government declaration",
      "Details on the card that do not match the passport",
    ],
    fixes: [
      "Submit the arrival card on the official government site, free of charge, inside the accepted window",
      "Check whether your nationality or pass type is exempt before submitting",
      "Confirm separately whether your nationality needs a visa - the two are different requirements",
      "Match every detail on the card to the passport and keep the confirmation to hand at the counter",
    ],
    keywords: ["mdac", "digital arrival card", "arrival card", "free", "three days before arrival"],
  },
];

const GROUND_BY_ID = new Map(REFUSAL_GROUNDS.map((ground) => [ground.id, ground]));

export function getGround(id) {
  return GROUND_BY_ID.get(id) || null;
}

const norm = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Match the rejection wording against each ground's keyword list. Deterministic: score is
 * the count of distinct keywords found, confidence is that count as a percentage of the
 * ground's keyword list.
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
  if (days <= 0) return "No waiting period applies - correct the file and apply again straight away.";
  if (days < 365) {
    return `Allow at least about ${plural(Math.round(days / 30), "month")} so the file is genuinely different.`;
  }
  return `A record measured in years is likely - roughly ${plural(Math.round(days / 365), "year")} - so clear it before paying another fee.`;
}

/**
 * Combine the fix checklists for the selected grounds and score readiness to reapply.
 *
 * @returns {{error:string}|object}
 */
export function buildActionPlan({ groundIds = [], completedSteps = [] } = {}) {
  if (!Array.isArray(groundIds)) return { error: "Select at least one rejection reason." };
  const grounds = groundIds.map(getGround).filter(Boolean);
  if (grounds.length === 0) {
    return { error: "Select at least one rejection reason to see what it means and what to fix." };
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
    appealSummary: "No appeal - a corrected application, or take a monitoring-list entry up with the Immigration Department",
  };
}
