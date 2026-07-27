/**
 * Canadian temporary resident visa / study permit / work permit refusal grounds.
 *
 * IRCC refusal letters are built from a fixed set of checkboxes. The officer ticks the
 * conclusion (usually "you will not leave Canada at the end of your stay") and then ticks
 * the factors that led there. The catalogue below maps those checkboxes to the provisions
 * of the Immigration and Refugee Protection Act (IRPA) and its Regulations (IRPR) that
 * they come from, and to the evidence that normally answers each one.
 *
 * The real reasoning always sits in the officer's Global Case Management System notes,
 * which are released through an access-to-information request. Informational only, not
 * legal advice.
 */

export const COUNTRY_LABEL = "Canada";

/** The dual-intent conclusion under R179(b) appears on almost every visitor refusal. */
export const DEFAULT_GROUND_ID = "will-not-leave";

/**
 * There is no administrative appeal from a temporary resident refusal. The two real
 * routes are a fresh application, and an application for leave and judicial review in the
 * Federal Court under s.72 of IRPA. Section 72(2)(b) sets the filing window at 15 days
 * where the matter arose in Canada and 60 days where it arose outside Canada.
 */
export const APPEAL_RULE = {
  title: "There is no appeal - but there are two real routes",
  detail:
    "A refused visitor visa, study permit or work permit carries no right of appeal to the Immigration Appeal Division. Route one is to reapply, which is usually faster and cheaper, and only works if you fix the specific factor the officer ticked. Route two is an application for leave and judicial review in the Federal Court under section 72 of IRPA: the window in section 72(2)(b) is 15 days if the matter arose inside Canada and 60 days if it arose outside Canada, the court reviews whether the decision was reasonable rather than re-deciding it, and you normally need Canadian counsel. Before doing either, request the officer's Global Case Management System notes through an access-to-information request - those notes, not the template letter, tell you what actually happened.",
};

export const SEVERITY_LABELS = {
  low: "Low - a missing document or an unmet numeric requirement",
  medium: "Medium - a discretionary assessment of your circumstances",
  high: "High - a statutory inadmissibility with a fixed exclusion period",
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3 };

export const READINESS_BANDS = [
  { min: 0, label: "Not ready - the same file would draw the same refusal" },
  { min: 40, label: "Partly ready - the ticked factor is still unaddressed" },
  { min: 70, label: "Nearly ready - one or two items left" },
  { min: 100, label: "Ready - every listed gap is closed" },
];

export const REFUSAL_GROUNDS = [
  {
    id: "will-not-leave",
    code: "IRPR 179(b) / 216(1)(b)",
    title: "Not satisfied you will leave Canada at the end of your stay",
    legalBasis: "Immigration and Refugee Protection Regulations s.179(b); s.216(1)(b) for study permits",
    severity: "medium",
    reapplyWaitDays: 60,
    meaning:
      "This is the conclusion on nearly every refused visitor visa and study permit. Regulation 179(b) requires the officer to be satisfied you will leave by the end of the authorised period. It is not a finding that you lied - it is a finding that the file, as filed, did not tip the balance. The ticked sub-factors below the sentence tell you which part of the balance failed.",
    triggers: [
      "Travel history: no previous trips, or none to a visa-requiring country",
      "Purpose of visit inconsistent with a temporary stay",
      "Family ties in Canada outweighing ties in your country of residence",
      "Current employment situation, or limited employment prospects at home",
      "Immigration status in your country of residence, if you are a third-country resident",
    ],
    fixes: [
      "Answer each ticked sub-factor explicitly in a one-page cover letter on the next application",
      "File an employer letter with role, salary, tenure, approved leave dates and the date you resume duty",
      "Evidence what you return to: property papers, a running lease, dependants, ongoing study or a business",
      "Build travel history first with a short trip to another visa-requiring country",
      "Ask for a stay length that matches the itinerary rather than the maximum available",
    ],
    keywords: [
      "will leave canada at the end",
      "leave canada at the end of your stay",
      "179 b",
      "216 1 b",
      "purpose of your visit",
      "travel history",
      "family ties",
      "employment prospects",
    ],
  },
  {
    id: "funds",
    code: "IRPR 179(b) - financial",
    title: "Not satisfied you have sufficient funds",
    legalBasis: "IRPR s.179(b) for visitors; s.220 for study permits",
    severity: "low",
    reapplyWaitDays: 30,
    meaning:
      "The officer was not satisfied you can support yourself, and any dependants, for the stay and the return journey without working. For study permits the bar is set: tuition for the first year plus a published cost-of-living amount plus travel. IRCC raised that single-applicant living-cost figure from CAD 10,000 to CAD 20,635 on 1 January 2024 and updates it annually, so always check the current number before you file.",
    triggers: [
      "A balance that only just clears the threshold on the final statement line",
      "A large deposit made days before filing with no traceable source",
      "A sponsor named with no proof of their income or of the relationship",
      "Statements covering a shorter period than IRCC asked for",
    ],
    fixes: [
      "File four to six months of bank statements showing a stable balance, not a single snapshot",
      "Document the source of any large recent credit with its underlying paperwork",
      "For a study permit, check the current published cost-of-living figure and cover tuition plus living costs plus travel",
      "If a relative funds the trip, add their statements, income proof and evidence of the relationship",
    ],
    keywords: [
      "sufficient funds",
      "adequately support yourself",
      "financial status",
      "personal assets and financial status",
      "proof of funds",
    ],
  },
  {
    id: "purpose",
    code: "IRPR 179 - purpose of visit",
    title: "Purpose of visit not consistent with a temporary stay",
    legalBasis: "IRPR s.179; s.20(1)(b) IRPA",
    severity: "medium",
    reapplyWaitDays: 30,
    meaning:
      "The stated reason for coming did not hold together against the rest of the file. A three-week holiday booked by someone with no leave approval, a conference with no registration, or a family visit with no explanation of who is being visited and why now, all land here.",
    triggers: [
      "An itinerary that does not match the requested dates or the invitation",
      "A study plan that does not fit your existing qualifications or career path",
      "An invitation letter with no host details, status in Canada or stated relationship",
      "A stay far longer than the stated reason requires",
    ],
    fixes: [
      "Write a dated day-by-day itinerary that matches the application dates exactly",
      "For a study permit, write a study plan explaining why this programme, this school and this country now",
      "Attach a complete invitation letter with the host's status document, address and relationship to you",
      "Attach the event registration, conference letter or business correspondence for a work trip",
    ],
    keywords: [
      "purpose of visit",
      "purpose of your visit is not consistent",
      "temporary stay",
      "study plan",
      "letter of acceptance",
    ],
  },
  {
    id: "misrepresentation",
    code: "IRPA 40(1)(a)",
    title: "Misrepresentation",
    legalBasis: "IRPA s.40(1)(a), with the exclusion period in s.40(2)(a)",
    severity: "high",
    reapplyWaitDays: 1825,
    meaning:
      "A finding that you directly or indirectly withheld or misrepresented a material fact. Section 40(2)(a) makes a person inadmissible for five years from the date of the final determination, and during that period you cannot apply for permanent residence. Materiality is judged by whether the error could have induced an error in the administration of the Act, so an omission counts even if it would not have changed the outcome.",
    triggers: [
      "A prior refusal from Canada or another country not disclosed on the form",
      "An employment letter, bank statement or degree the officer could not verify",
      "Details filed by an agent that you never read before signing",
      "Answers that differ between a current application and an earlier one",
    ],
    fixes: [
      "Request the Global Case Management System notes to see exactly which statement was found false",
      "Instruct a Canadian immigration lawyer - this ground is not answered with better documents",
      "Gather proof if a representative filed the misstatement without your knowledge",
      "Count the five years from the date of the final determination, not from when you found out",
      "Disclose the misrepresentation finding on every later application anywhere; concealing it compounds it",
    ],
    keywords: [
      "misrepresentation",
      "40 1 a",
      "withholding material facts",
      "inadmissible for a period of five years",
      "material facts relating to a relevant matter",
    ],
  },
  {
    id: "criminal",
    code: "IRPA 36",
    title: "Criminal inadmissibility",
    legalBasis: "IRPA s.36(1) serious criminality and s.36(2) criminality",
    severity: "high",
    reapplyWaitDays: 1825,
    meaning:
      "A conviction abroad makes you inadmissible if the equivalent Canadian offence would be an indictable one. Impaired driving is the classic trap: since December 2018 it is treated as serious criminality in Canada. Deemed rehabilitation can apply automatically once enough time has passed since the sentence was completed for a single less serious offence; otherwise you apply for individual rehabilitation, or for a temporary resident permit for urgent travel.",
    triggers: [
      "A drink-driving conviction, which Canada now treats as serious criminality",
      "A conviction that was discharged, spent or expunged at home but still exists on the record",
      "Multiple summary offences, which together can trigger inadmissibility",
    ],
    fixes: [
      "Obtain certified court records showing the charge, the statute, the sentence and the completion date",
      "Have counsel assess the equivalent Canadian offence - the Canadian equivalent decides everything",
      "Check whether deemed rehabilitation already applies given the time since your sentence ended",
      "File for individual rehabilitation, or a temporary resident permit where the travel cannot wait",
    ],
    keywords: [
      "criminal inadmissibility",
      "section 36",
      "36 1",
      "36 2",
      "serious criminality",
      "conviction",
      "rehabilitation",
    ],
  },
  {
    id: "medical",
    code: "IRPA 38(1)",
    title: "Medical inadmissibility",
    legalBasis: "IRPA s.38(1), including the excessive demand test in s.38(1)(c)",
    severity: "medium",
    reapplyWaitDays: 90,
    meaning:
      "You are inadmissible if your condition is a danger to public health or public safety, or would place an excessive demand on health or social services. The excessive-demand threshold was set at three times the average Canadian per-capita health and social services cost in 2018 and IRCC republishes the dollar figure each year. Visitors are usually only screened on public health and safety; excessive demand mainly affects longer stays and permanent residence.",
    triggers: [
      "Active tuberculosis or another notifiable condition found at the panel physician's exam",
      "A condition needing costly ongoing treatment, assessed against the published threshold",
      "An incomplete immigration medical examination or missing follow-up tests",
    ],
    fixes: [
      "Complete every test the panel physician ordered and get the file closed properly",
      "Complete treatment and obtain written clearance before the next application",
      "Where excessive demand is raised, respond to the procedural fairness letter with a costed care plan",
      "Have counsel check the current published cost threshold against your actual projected costs",
    ],
    keywords: [
      "medical inadmissibility",
      "section 38",
      "excessive demand",
      "danger to public health",
      "immigration medical examination",
    ],
  },
  {
    id: "documents",
    code: "IRPA 16(1)",
    title: "Documents missing, unreadable or not translated",
    legalBasis: "IRPA s.16(1) - duty to answer truthfully and produce required documents",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The application was refused because a required document was absent, illegible, expired or filed in a language other than English or French without a certified translation. This is the cheapest refusal to fix and the easiest to avoid.",
    triggers: [
      "A document in a third language with no certified translation and translator declaration",
      "A scan that is cropped, dark or missing pages",
      "A passport with too little validity left for the requested stay",
      "A study permit application without the required provincial attestation letter or letter of acceptance",
    ],
    fixes: [
      "Re-scan every page at full size in colour and check each file opens after upload",
      "Attach a certified translation plus the translator's declaration for every non-English, non-French document",
      "Renew the passport if its validity does not comfortably cover the requested stay",
      "Work down the document checklist for your exact application type before you submit",
    ],
    keywords: [
      "required documents",
      "certified translation",
      "illegible",
      "section 16",
      "document checklist",
      "provincial attestation letter",
    ],
  },
  {
    id: "prior-status",
    code: "IRPA 41 / prior non-compliance",
    title: "Previous overstay or breach of a condition in Canada",
    legalBasis: "IRPA s.41 - non-compliance with the Act",
    severity: "high",
    reapplyWaitDays: 365,
    meaning:
      "A previous overstay, working or studying without authorisation, or an exclusion order sits on your record and weighs against every later application. An exclusion order normally bars return for one year unless you obtain an Authorization to Return to Canada, and a removal carried out at Canada's expense must be repaid before you are allowed back.",
    triggers: [
      "Staying beyond the date stamped or recorded on entry",
      "Working or studying without the permit the activity required",
      "An exclusion order or a departure order that became a deportation order",
    ],
    fixes: [
      "Establish exactly what was issued - a departure order, exclusion order or removal order - and when",
      "Apply for an Authorization to Return to Canada if the applicable bar has not run out",
      "Repay any removal costs Canada bore, and keep the receipt for the next application",
      "Explain the past breach openly in the next application with proof of what has changed since",
    ],
    keywords: [
      "overstay",
      "exclusion order",
      "removal order",
      "authorization to return to canada",
      "non compliance",
      "worked without authorization",
    ],
  },
];

const GROUND_BY_ID = new Map(REFUSAL_GROUNDS.map((ground) => [ground.id, ground]));

export function getGround(id) {
  return GROUND_BY_ID.get(id) || null;
}

const norm = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Match the text of an IRCC refusal letter against each ground's keyword list.
 * Deterministic: score is the count of distinct keywords found, confidence is that
 * count as a percentage of the ground's keyword list.
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
  if (days <= 0) return "No waiting period applies - reapply as soon as the missing document exists.";
  if (days < 365) {
    return `Allow at least about ${plural(Math.round(days / 30), "month")} so a concrete factor has changed.`;
  }
  return `Expect a wait measured in years - roughly ${plural(Math.round(days / 365), "year")} - before a fresh application can succeed.`;
}

/**
 * Combine the fix checklists for the selected grounds and score readiness to reapply.
 *
 * @returns {{error:string}|object}
 */
export function buildActionPlan({ groundIds = [], completedSteps = [] } = {}) {
  if (!Array.isArray(groundIds)) return { error: "Select at least one refusal ground." };
  const grounds = groundIds.map(getGround).filter(Boolean);
  if (grounds.length === 0) {
    return { error: "Select at least one refusal ground to see what it means and what to fix." };
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
    appealSummary:
      "No appeal - reapply, or seek leave and judicial review in the Federal Court (15 days inside Canada, 60 days outside)",
  };
}
