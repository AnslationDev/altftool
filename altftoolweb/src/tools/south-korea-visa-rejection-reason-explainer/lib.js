/**
 * South Korean visa refusal grounds.
 *
 * Korean visas are issued by the Ministry of Justice through embassies, consulates and
 * Korea Visa Application Centres, under the Immigration Act and its Enforcement Decree and
 * Rules. The result appears on the visa portal with a short reason line rather than a
 * reasoned decision, so the practical work is matching that line to the underlying
 * requirement for the status you applied for.
 *
 * One feature of the Korean system shapes everything else: missions commonly state that a
 * fresh application will not be accepted within six months of a refusal unless
 * circumstances have materially changed. That makes a rushed resubmission worse than
 * useless, so the checklists below are built around fixing the file properly once.
 *
 * Informational only, not immigration advice.
 */

export const COUNTRY_LABEL = "Korean";

/** Document sufficiency is the reason line most applicants see. */
export const DEFAULT_GROUND_ID = "documents";

/**
 * There is no statutory appeal from a visa refusal. Korean missions publish a
 * reapplication restriction: normally no new application within six months of a refusal
 * unless there has been a material change of circumstances.
 */
export const APPEAL_RULE = {
  title: "No appeal, and a six-month reapplication rule",
  detail:
    "A refused Korean visa carries no appeal to a tribunal or court, and the application fee is not refunded. Korean missions commonly apply a reapplication restriction of six months from the refusal, waived only where circumstances have materially changed - a new job, a new sponsor, a completed course, a resolved record. Read the notice from your own mission, because the exact wording and any exceptions are set locally. Two practical points follow. First, treat the next application as the only one you get for half a year and build it completely. Second, a refusal is recorded, so the next mission sees it: explain it openly rather than filing as though the first application never happened.",
};

export const SEVERITY_LABELS = {
  low: "Low - a document set that was incomplete or unverifiable",
  medium: "Medium - the substance of the stay was not established",
  high: "High - a record, a ban or a false-document finding applies",
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3 };

export const READINESS_BANDS = [
  { min: 0, label: "Not ready - the same file would be refused again" },
  { min: 40, label: "Partly ready - the main gap is still open" },
  { min: 70, label: "Nearly ready - one or two items left" },
  { min: 100, label: "Ready - every listed gap is closed" },
];

export const REFUSAL_GROUNDS = [
  {
    id: "documents",
    code: "Insufficient documents",
    title: "Required documents incomplete or not verifiable",
    legalBasis: "Immigration Act and Enforcement Rules - documents required for each visa status",
    severity: "low",
    reapplyWaitDays: 180,
    meaning:
      "The document list for a Korean visa is set per status and per country, and missions apply it literally. A missing certificate, an unstamped statement or a document a mission could not verify with the issuer ends the application - officers do not usually come back for a second round.",
    triggers: [
      "A document on the mission's checklist that was simply not filed",
      "Bank or employment papers with no issuer stamp or verifiable contact",
      "A document in a third language with no certified translation",
      "An application form with blank fields or a signature that does not match the passport",
    ],
    fixes: [
      "Work through your own mission's published checklist for your exact visa status, line by line",
      "File original or issuer-stamped documents rather than self-printed copies",
      "Attach certified English or Korean translations for every other-language document",
      "Give a switchboard number and work email for every employer or institution named, so verification succeeds",
    ],
    keywords: ["insufficient documents", "incomplete", "required documents", "checklist", "translation", "verification"],
  },
  {
    id: "funds",
    code: "Financial capacity",
    title: "Financial capacity not established",
    legalBasis: "Immigration Act - conditions for the grant of status of sojourn",
    severity: "medium",
    reapplyWaitDays: 180,
    meaning:
      "Korean missions ask for a balance certificate and, for study and long-stay statuses, evidence that living costs and tuition are covered for the period. There is no single national figure - each mission publishes its own guidance for the country it serves - so the test is whether the money shown plausibly funds the stay and looks genuinely yours.",
    triggers: [
      "A balance certificate issued for a single day rather than a six-month history",
      "A large deposit made shortly before the application, with no explanation",
      "A sponsor named without their own income proof or a family-relation certificate",
      "Funds well below the level the mission's own guidance asks for",
    ],
    fixes: [
      "Obtain a bank balance certificate covering the period your mission asks for, usually around six months",
      "Keep the balance stable across the period rather than topping it up just before applying",
      "Document the source of any recent large credit with the underlying paperwork",
      "Where a family member sponsors you, add their income proof and an official family relation certificate",
    ],
    keywords: ["financial", "balance certificate", "bank", "insufficient funds", "sponsor", "tuition"],
  },
  {
    id: "purpose",
    code: "Purpose of visit",
    title: "Purpose of the visit not established or not credible",
    legalBasis: "Immigration Act - status of sojourn must match the intended activity",
    severity: "medium",
    reapplyWaitDays: 180,
    meaning:
      "Korean statuses are narrow: C-3 for a short visit, D-2 for degree study, D-4 for language training, E-series for work, H-1 for working holiday. The activity has to match the status applied for, and the itinerary has to hang together with the invitation, the booking and the dates.",
    triggers: [
      "An itinerary with no accommodation or a return date that does not match the bookings",
      "An invitation with no host details, status in Korea or stated relationship",
      "Applying for a short visit while intending to study, work or stay long term",
      "A study plan that does not connect to previous study or a career direction",
    ],
    fixes: [
      "Match the status to the activity before applying - a visit status does not cover work or a degree",
      "File a day-by-day itinerary with confirmed accommodation matching the application dates",
      "Attach a complete invitation letter with the host's identity document, address and relationship",
      "For study, write a study plan linking the programme to your previous study and your plans afterwards",
    ],
    keywords: ["purpose of visit", "status of sojourn", "c 3", "d 2", "d 4", "invitation", "study plan"],
  },
  {
    id: "ties",
    code: "Risk of unauthorised stay",
    title: "Doubt that you would leave at the end of the stay",
    legalBasis: "Immigration Act - discretion in the issuance of visas",
    severity: "medium",
    reapplyWaitDays: 180,
    meaning:
      "Korea weighs the likelihood that a short-term visitor becomes an unauthorised resident, and that assessment takes account of your employment, income, family situation and travel record, and of the pattern from your region. It is a probability judgement about the file, not an accusation.",
    triggers: [
      "No steady employment, or a recent job change with no leave approval",
      "No previous international travel with a record of returning on time",
      "Relatives already in Korea without status, or a history of family members overstaying",
      "A requested stay far longer than the stated purpose requires",
    ],
    fixes: [
      "File an employer certificate with role, tenure, salary, approved leave and the resumption date",
      "Show income continuity through pay slips, tax records or business registration",
      "Evidence what you return to: dependants, property, a lease or an ongoing course",
      "Build a record of on-time returns from other destinations before applying again",
    ],
    keywords: ["illegal stay", "unauthorised stay", "overstay risk", "ties", "employment", "travel history"],
  },
  {
    id: "false-documents",
    code: "False or altered documents",
    title: "False, altered or fabricated documents submitted",
    legalBasis: "Immigration Act - prohibition of entry and restriction on visa issuance",
    severity: "high",
    reapplyWaitDays: 1825,
    meaning:
      "Submitting a fabricated bank statement, employment letter, diploma or family document is treated as a serious offence rather than an error. It attracts a restriction on visa issuance and an entry prohibition, and the finding is recorded against your identity, so it surfaces on every later application. Agents who promise a guaranteed outcome are the usual source.",
    triggers: [
      "A bank balance certificate or employment letter the mission could not confirm with the issuer",
      "A diploma or transcript that the awarding institution did not verify",
      "A family relation certificate that does not match the civil register",
      "Documents prepared by an agent that the applicant never read",
    ],
    fixes: [
      "Obtain the exact wording of the finding and identify precisely which document was rejected",
      "Get written confirmation from the issuing institution where a genuine document was doubted",
      "Instruct a Korean immigration lawyer or a licensed administrative scrivener before applying again",
      "Never file a document you have not personally verified with its issuer - the applicant carries the consequence",
      "Expect the record to persist for years and plan the timing accordingly",
    ],
    keywords: ["false document", "fabricated", "forged", "altered", "fake certificate", "verification failed"],
  },
  {
    id: "entry-ban",
    code: "Entry prohibition",
    title: "Existing entry ban from a previous overstay or removal",
    legalBasis: "Immigration Act art. 11 - prohibition of entry; Enforcement Rules on ban periods",
    severity: "high",
    reapplyWaitDays: 1095,
    meaning:
      "Article 11 of the Immigration Act lists the categories of foreign national who may be refused entry, and a separate schedule sets ban periods after an overstay or a removal. The ban scales with the length of the overstay - broadly around a year for a short one, rising to ten years for one running several years - and no visa can be issued while it runs.",
    triggers: [
      "An overstay on a previous Korean visa, however it ended",
      "Removal or forced departure from Korea",
      "Working in Korea on a status that did not permit it",
      "Departing under a voluntary departure programme without confirming the ban period attached",
    ],
    fixes: [
      "Establish the exact overstay length and departure date - both decide the ban period",
      "Keep any voluntary departure paperwork; it usually shortens the ban and you may need to prove it",
      "Confirm the ban has actually expired before applying, rather than assuming",
      "Take Korean legal advice where the record appears wrong or the ban period is disputed",
    ],
    keywords: ["entry ban", "entry prohibition", "article 11", "overstay", "deported", "forced departure"],
  },
  {
    id: "criminal-health",
    code: "Criminal or public health record",
    title: "Criminal record or public health concern",
    legalBasis: "Immigration Act art. 11 - prohibition of entry",
    severity: "high",
    reapplyWaitDays: 365,
    meaning:
      "Article 11 also covers people with certain criminal records, people considered likely to harm public safety or public order, and people with a communicable disease that could endanger public health. Teaching statuses in the E-series require a criminal record check and an apostilled clearance certificate, so a record surfaces there even where it would not elsewhere.",
    triggers: [
      "A criminal conviction disclosed on an apostilled police clearance certificate",
      "A drug-related offence, which Korea treats particularly strictly",
      "A notifiable communicable disease found on the health check for a long-stay status",
    ],
    fixes: [
      "Obtain a current police clearance certificate, apostilled or consular-legalised as your status requires",
      "Collect certified court records showing the charge, the sentence and its completion",
      "Complete any medical treatment and obtain written clearance before applying for a long-stay status",
      "Take legal advice before reapplying rather than filing the same application again",
    ],
    keywords: ["criminal record", "police clearance", "apostille", "public health", "communicable disease", "drug"],
  },
  {
    id: "keta",
    code: "K-ETA",
    title: "K-ETA denied or not obtained for visa-free travel",
    legalBasis: "Korea Electronic Travel Authorization, in operation since 1 September 2021",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "K-ETA is the travel authorisation for nationals who may enter Korea without a visa. It is applied for online before departure, carries a fee, and is checked by the airline at boarding. A temporary exemption has applied to a list of countries, so check whether yours is currently on it. A K-ETA denial is not a visa refusal, but it blocks visa-free travel, and the answer is usually to apply for a short-term visit visa instead.",
    triggers: [
      "Applying too close to departure - K-ETA should be filed well before, not at the airport",
      "A mismatch between the passport details and the K-ETA application",
      "A previous immigration issue that makes visa-free entry inappropriate",
      "Applying through an unofficial site that charges a mark-up and mistypes the details",
    ],
    fixes: [
      "Apply on the official K-ETA site only, well ahead of departure rather than in the final days",
      "Copy every field from the passport machine-readable zone and re-check before submitting",
      "Check whether your nationality is currently covered by the temporary exemption before applying",
      "If K-ETA is denied, apply for a short-term visit visa at a mission instead of retrying repeatedly",
    ],
    keywords: ["k eta", "keta", "travel authorization", "visa free", "electronic travel authorization"],
  },
];

const GROUND_BY_ID = new Map(REFUSAL_GROUNDS.map((ground) => [ground.id, ground]));

export function getGround(id) {
  return GROUND_BY_ID.get(id) || null;
}

const norm = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Match the reason line from the visa portal against each ground's keyword list.
 * Deterministic: score is the count of distinct keywords found, confidence is that count
 * as a percentage of the ground's keyword list.
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
  if (days <= 0) return "No waiting period applies - this route can be retried once the defect is fixed.";
  if (days < 365) {
    return `Expect a reapplication restriction of about ${plural(Math.round(days / 30), "month")} unless circumstances have materially changed.`;
  }
  return `A ban or restriction measured in years applies - roughly ${plural(Math.round(days / 365), "year")} - so confirm it has ended first.`;
}

/**
 * Combine the fix checklists for the selected grounds and score readiness to reapply.
 *
 * @returns {{error:string}|object}
 */
export function buildActionPlan({ groundIds = [], completedSteps = [] } = {}) {
  if (!Array.isArray(groundIds)) return { error: "Select at least one refusal reason." };
  const grounds = groundIds.map(getGround).filter(Boolean);
  if (grounds.length === 0) {
    return { error: "Select at least one refusal reason to see what it means and what to fix." };
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
    appealSummary: "No appeal - a fresh application, normally not before six months unless circumstances changed",
  };
}
