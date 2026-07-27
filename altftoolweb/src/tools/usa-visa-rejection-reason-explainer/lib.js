/**
 * United States visa refusal grounds.
 *
 * A US consular officer must refuse under a specific section of the Immigration and
 * Nationality Act, and the refusal slip handed over at the window names it. The catalogue
 * below covers the sections that account for almost every refusal at a visa interview,
 * with the statutory citation behind each and the evidence that normally answers it.
 *
 * Informational only - not legal advice.
 */

export const COUNTRY_LABEL = "US";

/** INA 214(b) is by far the most common refusal for B, F, M and J applicants. */
export const DEFAULT_GROUND_ID = "214b";

/**
 * There is no appeal from a consular visa refusal: under the doctrine of consular
 * non-reviewability the decision is not appealable to a court or to the Department of
 * State. 22 CFR 41.121(c) does require every nonimmigrant refusal to be reviewed by a
 * supervisory consular officer, and INA 212(d)(3)(A) allows a nonimmigrant waiver
 * recommended by the post and decided by CBP's Admissibility Review Office.
 */
export const APPEAL_RULE = {
  title: "Why there is no appeal, and what exists instead",
  detail:
    "A consular visa refusal cannot be appealed. Under consular non-reviewability neither a US court nor the Department of State substitutes its judgement for the officer's. Three real routes remain. First, 22 CFR 41.121(c) requires a supervisory consular officer to review nonimmigrant refusals, so a clear factual error can be raised with the post in writing. Second, for a statutory inadmissibility a nonimmigrant waiver under INA 212(d)(3)(A) can be recommended by the consular officer and decided by CBP's Admissibility Review Office; immigrant applicants use Form I-601 instead. Third, and most often, you simply reapply - there is no waiting period, but a fresh interview only helps if the underlying facts have changed.",
};

export const SEVERITY_LABELS = {
  low: "Low - a document or process gap, not an inadmissibility finding",
  medium: "Medium - a discretionary judgement about your circumstances",
  high: "High - a statutory inadmissibility that follows the record",
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3 };

export const READINESS_BANDS = [
  { min: 0, label: "Not ready - the same interview would end the same way" },
  { min: 40, label: "Partly ready - the core problem is still open" },
  { min: 70, label: "Nearly ready - one or two items left" },
  { min: 100, label: "Ready - every listed gap is closed" },
];

export const REFUSAL_GROUNDS = [
  {
    id: "214b",
    code: "INA 214(b)",
    title: "Failed to overcome the presumption of immigrant intent",
    legalBasis: "INA 214(b), 8 U.S.C. 1184(b)",
    severity: "medium",
    reapplyWaitDays: 90,
    meaning:
      "The law presumes every nonimmigrant applicant intends to immigrate until they prove otherwise. A 214(b) refusal means you did not overcome that presumption at the interview - the officer was not persuaded your ties abroad and your stated purpose outweighed the pull of staying. It is a discretionary finding, not a bar, and it disappears the moment a later officer is persuaded. Categories with statutory dual intent, notably H-1B and L-1, are exempt from the presumption.",
    triggers: [
      "Thin or unverifiable ties abroad: no steady job, no dependants, no assets, no lease",
      "Answers at the window that contradict the DS-160 or the stated trip purpose",
      "A trip length or itinerary that does not fit the reason given for travel",
      "Close family already living in the United States with no offsetting ties at home",
      "A history of long stays in the US on previous visits",
    ],
    fixes: [
      "Be able to answer, in one sentence, why you must return by a specific date",
      "Carry an employer letter with your role, salary, tenure, approved leave and the date you resume duty",
      "Show income continuity: pay slips, tax returns, or business registration and filings",
      "Make the DS-160 match what you will say out loud - officers read it while you speak",
      "Only reapply once a concrete fact has changed: a promotion, a new dependant, a property purchase, a completed trip elsewhere",
    ],
    keywords: [
      "214 b",
      "section 214 b",
      "nonimmigrant intent",
      "presumption of immigrant intent",
      "did not demonstrate strong ties",
      "residence abroad",
    ],
  },
  {
    id: "221g",
    code: "INA 221(g)",
    title: "Incomplete application or administrative processing",
    legalBasis: "INA 221(g), 8 U.S.C. 1201(g)",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "A 221(g) is technically a refusal but usually a pause. Either a document is missing, or the case has gone into administrative processing for further review. The case stays open and is approved once the missing item arrives or the review clears. Leave it unattended and it will be closed: an applicant who supplies nothing for a year generally has to start over with a new application and a new fee.",
    triggers: [
      "A document the officer asked for at the window and you did not have",
      "A petition or civil document that has to be verified with the issuing authority",
      "Security advisory or interagency checks triggered by the field of study, employer or travel history",
      "Name, date of birth or employer details that do not reconcile across the file",
    ],
    fixes: [
      "Read the coloured 221(g) slip - it lists the exact documents and the submission channel",
      "Submit everything requested in one batch, using the case number on the slip",
      "Do not file a new application while the 221(g) is open; it will not speed anything up",
      "Track the case status online and follow up with the post if the stated processing window passes",
      "Supply the requested evidence well inside a year - an untouched case is closed and the fee is lost",
    ],
    keywords: [
      "221 g",
      "section 221 g",
      "administrative processing",
      "additional documents",
      "further administrative processing",
    ],
  },
  {
    id: "misrepresentation",
    code: "INA 212(a)(6)(C)(i)",
    title: "Fraud or wilful misrepresentation of a material fact",
    legalBasis: "INA 212(a)(6)(C)(i), 8 U.S.C. 1182(a)(6)(C)(i)",
    severity: "high",
    reapplyWaitDays: 365,
    meaning:
      "A finding that you sought a visa or admission by fraud or by wilfully misrepresenting a material fact. This is a lifetime inadmissibility - it does not expire with time - and it attaches to the person, not the application. The only ways forward are a nonimmigrant waiver under INA 212(d)(3)(A) or, for immigrants, a Form I-601 waiver where a qualifying relative would suffer extreme hardship.",
    triggers: [
      "A fabricated employment letter, bank statement, degree or tax document",
      "Concealing a prior refusal, a prior US stay, an arrest or a relative in the US",
      "Stating a tourist purpose while intending to work or study",
      "Letting a consultant file details you never checked - the applicant signs, so the applicant owns them",
    ],
    fixes: [
      "Get the exact wording of the finding in writing before doing anything else",
      "Instruct a licensed US immigration attorney - this ground is not cured by better documents",
      "Assemble proof if the misstatement was an agent's doing without your knowledge or was immaterial",
      "Explore an INA 212(d)(3)(A) nonimmigrant waiver, recommended by the post and decided by CBP",
      "Never repeat the disputed statement on a later form; a second inconsistency ends the argument",
    ],
    keywords: [
      "212 a 6 c i",
      "misrepresentation",
      "wilful misrepresentation",
      "willful misrepresentation",
      "fraud",
      "material fact",
    ],
  },
  {
    id: "unlawful-presence",
    code: "INA 212(a)(9)(B)",
    title: "Three or ten year bar for unlawful presence",
    legalBasis: "INA 212(a)(9)(B)(i), 8 U.S.C. 1182(a)(9)(B)(i)",
    severity: "high",
    reapplyWaitDays: 1095,
    meaning:
      "Accruing more than 180 days but less than one year of unlawful presence and then departing triggers a three-year bar; one year or more of unlawful presence triggers a ten-year bar. The clock runs from the day status ended, and departure is what triggers it, which is why leaving voluntarily does not reset the problem.",
    triggers: [
      "Staying past the date on the I-94 rather than the date on the visa foil",
      "Falling out of status - dropping below a full course load, or working without authorisation",
      "A denied extension or change of status that left a gap before departure",
    ],
    fixes: [
      "Establish the exact date status ended and the exact departure date; the length decides three years or ten",
      "Retrieve your I-94 arrival and departure history from the CBP website and keep the printout",
      "Count time abroad - the bar runs from departure, so part of it may already have passed",
      "Take legal advice on a 212(d)(3)(A) nonimmigrant waiver or an I-601 / I-601A immigrant waiver",
      "Disclose the overstay on the next application; concealment converts a time-limited bar into a permanent fraud finding",
    ],
    keywords: [
      "212 a 9 b",
      "unlawful presence",
      "three year bar",
      "ten year bar",
      "overstay",
      "accrued unlawful presence",
    ],
  },
  {
    id: "crime",
    code: "INA 212(a)(2)(A)(i)(I)",
    title: "Crime involving moral turpitude",
    legalBasis: "INA 212(a)(2)(A)(i)(I) with the petty offence exception at 212(a)(2)(A)(ii)(II)",
    severity: "high",
    reapplyWaitDays: 365,
    meaning:
      "A conviction, or an admission of the acts, for a crime involving moral turpitude makes an applicant inadmissible. The petty offence exception can rescue a single offence where the maximum possible sentence was one year or less and any sentence actually imposed was six months or less. Drug offences sit under a separate provision and the petty offence exception does not reach them.",
    triggers: [
      "A theft, fraud or assault conviction anywhere in the world, however old",
      "A closed or compounded case that still shows on a police clearance certificate",
      "Admitting the elements of an offence at the interview even without a conviction",
      "Any controlled-substance offence, which is treated separately and more harshly",
    ],
    fixes: [
      "Obtain certified court records: the charge, the statute, the maximum penalty and the sentence imposed",
      "Get a current police clearance certificate from every country you have lived in",
      "Have an attorney test whether the petty offence exception applies on the maximum penalty and actual sentence",
      "Prepare a rehabilitation record - employment, family, time elapsed since the offence",
      "Answer the criminal-history questions on the DS-160 truthfully; a hidden record adds a fraud finding on top",
    ],
    keywords: [
      "212 a 2",
      "moral turpitude",
      "crime involving moral turpitude",
      "criminal record",
      "controlled substance",
    ],
  },
  {
    id: "documents",
    code: "INA 212(a)(7)",
    title: "Wrong visa category or missing required documents",
    legalBasis: "INA 212(a)(7)(A)(i)(I) and 212(a)(7)(B)",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The activity you described does not fit the visa you applied for, or a document the category requires was not there. Paid work on a B-1/B-2, a full course of study on a visitor visa, or a missing I-20 or DS-2019 all land here. It is a category problem, and the cure is to apply in the right one.",
    triggers: [
      "Planning paid work or hands-on productive activity on a B-1 business visitor visa",
      "Enrolling in a full-time academic course on a B-2 rather than an F-1",
      "Attending an interview without the I-20, DS-2019 or approval notice the category requires",
      "A petition-based category where the petition is not yet approved and in the system",
    ],
    fixes: [
      "Match the activity to the category before paying: B-1 for meetings, F-1 for study, H or L for work",
      "Carry the category document itself - I-20, DS-2019, approval notice - to the interview",
      "Confirm the petition receipt or approval number is visible in the system before booking the interview",
      "Rewrite the DS-160 purpose field so it describes the activity the category actually permits",
    ],
    keywords: [
      "212 a 7",
      "not in possession of a valid",
      "wrong visa category",
      "required documents",
      "i 20",
      "ds 2019",
    ],
  },
  {
    id: "public-charge",
    code: "INA 212(a)(4)",
    title: "Likely to become a public charge",
    legalBasis: "INA 212(a)(4), 8 U.S.C. 1182(a)(4)",
    severity: "medium",
    reapplyWaitDays: 90,
    meaning:
      "The officer weighed age, health, family status, assets, resources, education and skills and concluded you would likely become primarily dependent on the government for subsistence. It bites hardest on immigrant visa applicants, where an enforceable Affidavit of Support on Form I-864 is normally required from the petitioner.",
    triggers: [
      "A sponsor whose household income falls below the required percentage of the Federal Poverty Guidelines",
      "An incomplete Form I-864 or missing sponsor tax transcripts",
      "No demonstrated income, assets or health insurance for a long stay",
      "A medical condition needing costly ongoing treatment with no cover shown",
    ],
    fixes: [
      "Check the sponsor's income against the current year's Form I-864P poverty guideline table for the household size",
      "Add a qualifying joint sponsor if the petitioner's income falls short",
      "File complete IRS tax transcripts, not self-printed returns, for the sponsor",
      "Document assets that can be converted to cash, and any health insurance in place",
    ],
    keywords: [
      "212 a 4",
      "public charge",
      "affidavit of support",
      "i 864",
      "become primarily dependent",
    ],
  },
  {
    id: "prior-removal",
    code: "INA 212(a)(9)(A) and (C)",
    title: "Prior removal or reentry after a bar",
    legalBasis: "INA 212(a)(9)(A) and 212(a)(9)(C), 8 U.S.C. 1182(a)(9)",
    severity: "high",
    reapplyWaitDays: 1825,
    meaning:
      "Removal from the United States carries a bar of five, ten or twenty years depending on how and how often it happened, and consent to reapply on Form I-212 is needed to return inside it. Reentering or attempting to reenter without admission after more than a year of unlawful presence or after a removal triggers the far harsher 212(a)(9)(C) bar, which normally requires ten years abroad before consent can even be requested.",
    triggers: [
      "Expedited removal at a port of entry, which most travellers do not realise is a formal removal",
      "A removal order issued in absentia while you were already abroad",
      "Any reentry or attempted reentry after a previous removal",
    ],
    fixes: [
      "Obtain your complete immigration record by FOIA request to CBP, ICE and USCIS before filing anything",
      "Establish which subsection applies and exactly when the bar period started",
      "Instruct a licensed US immigration attorney - Form I-212 consent to reapply is a discretionary filing",
      "Do not attempt entry through another country or another status while the bar runs",
    ],
    keywords: [
      "212 a 9 a",
      "212 a 9 c",
      "removal",
      "expedited removal",
      "deported",
      "permanent bar",
      "consent to reapply",
    ],
  },
  {
    id: "health",
    code: "INA 212(a)(1)",
    title: "Health-related ground of inadmissibility",
    legalBasis: "INA 212(a)(1)(A), 8 U.S.C. 1182(a)(1)(A)",
    severity: "medium",
    reapplyWaitDays: 60,
    meaning:
      "The panel physician's report showed a communicable disease of public health significance, a missing required vaccination, a physical or mental disorder with associated harmful behaviour, or drug abuse or addiction. Vaccination gaps are the usual cause and are usually fixed in weeks; the drug-abuse ground is the strict one, with no waiver available for many nonimmigrant applicants.",
    triggers: [
      "A vaccination on the required list that is missing or has no documentary record",
      "Active tuberculosis or another notifiable communicable disease found at the medical",
      "A recorded history of substance abuse in the medical examination",
    ],
    fixes: [
      "Complete the missing vaccinations and have the panel physician update the medical record",
      "Complete treatment for any notifiable disease and get written clearance before rebooking",
      "Carry your full immunisation record to the medical rather than relying on recall",
      "Take legal advice where a drug-abuse or mental-health finding is recorded - waiver options are narrow",
    ],
    keywords: [
      "212 a 1",
      "health related",
      "medical examination",
      "vaccination",
      "communicable disease",
      "panel physician",
    ],
  },
];

const GROUND_BY_ID = new Map(REFUSAL_GROUNDS.map((ground) => [ground.id, ground]));

export function getGround(id) {
  return GROUND_BY_ID.get(id) || null;
}

const norm = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Match free text from a refusal slip against each ground's keyword list.
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
  if (days <= 0) return "No waiting period applies - respond or reapply as soon as the gap is closed.";
  if (days < 365) {
    return `Allow at least about ${plural(Math.round(days / 30), "month")} so a concrete fact in your file has changed.`;
  }
  return `Expect a wait measured in years - roughly ${plural(Math.round(days / 365), "year")} - unless a waiver is granted first.`;
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
      "No appeal exists - supervisory review under 22 CFR 41.121(c), an INA 212(d)(3)(A) waiver, or a fresh application",
  };
}
