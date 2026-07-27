/**
 * Australian visa refusal grounds.
 *
 * Every Australian visa refusal is a decision under section 65 of the Migration Act 1958:
 * the delegate was not satisfied that all the criteria for the subclass were met. The
 * decision record names the criterion - a clause in Schedule 2 of the Migration
 * Regulations 1994 for subclass-specific requirements, or a Public Interest Criterion
 * from Schedule 4 for the requirements that apply across visas.
 *
 * Informational only, not migration advice. Only a registered migration agent or an
 * Australian legal practitioner may advise on your case.
 */

export const COUNTRY_LABEL = "Australian";

/** The genuine-temporary-stay criterion is the most common visitor visa refusal. */
export const DEFAULT_GROUND_ID = "genuine-visitor";

/**
 * Merits review moved from the Administrative Appeals Tribunal to the Administrative
 * Review Tribunal on 14 October 2024. Review rights depend on where you were when the
 * decision was made: most offshore visitor refusals carry no review right unless the
 * application was sponsored by an eligible Australian sponsor, who then holds the right.
 */
export const APPEAL_RULE = {
  title: "Review rights at the Administrative Review Tribunal",
  detail:
    "Merits review of migration decisions is handled by the Administrative Review Tribunal, which replaced the Administrative Appeals Tribunal on 14 October 2024. Whether you have a review right depends on the visa and on where you were when the decision was made: refusals of onshore applications are generally reviewable, while most offshore visitor refusals are not, unless the visa was sponsored, in which case the review right sits with the Australian sponsor rather than the applicant. The time limit is stated in your decision notice and it is strict - the Tribunal cannot extend it - so read the notice the day it arrives. Where no review right exists, the practical route is a fresh application that addresses the exact criterion the delegate was not satisfied about.",
};

export const SEVERITY_LABELS = {
  low: "Low - an evidentiary gap the delegate was not satisfied about",
  medium: "Medium - a discretionary satisfaction test about your circumstances",
  high: "High - a criterion that carries an exclusion period or a character finding",
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3 };

export const READINESS_BANDS = [
  { min: 0, label: "Not ready - the same criterion would fail again" },
  { min: 40, label: "Partly ready - the criterion is still unmet" },
  { min: 70, label: "Nearly ready - one or two items left" },
  { min: 100, label: "Ready - every listed gap is closed" },
];

export const REFUSAL_GROUNDS = [
  {
    id: "genuine-visitor",
    code: "Schedule 2, cl. 600.211",
    title: "Not a genuine temporary visitor",
    legalBasis: "Migration Regulations 1994, Schedule 2 cl.600.211; refusal under Migration Act s.65",
    severity: "medium",
    reapplyWaitDays: 90,
    meaning:
      "The delegate was not satisfied you genuinely intend to stay temporarily for the purpose stated. This looks at your personal circumstances at home, your immigration history, the situation in your country of residence and any other relevant matter. It is a satisfaction test on the file, not an allegation of dishonesty.",
    triggers: [
      "No previous international travel, or none returned from on time",
      "No ongoing employment, study or business to return to",
      "Close family already in Australia with no offsetting ties at home",
      "A requested stay far longer than the stated purpose needs",
      "A prior visa refusal or breach recorded against you anywhere",
    ],
    fixes: [
      "Write a statement of purpose that names the dates, the itinerary and the reason you must return",
      "Attach an employer letter with role, salary, tenure, approved leave and the resumption date",
      "Evidence assets and obligations at home: property, business registration, a lease, dependants",
      "Ask for the stay length the trip actually needs rather than the maximum the subclass allows",
      "Explain any earlier refusal openly and show what has changed since",
    ],
    keywords: [
      "genuine visitor",
      "genuine temporary",
      "600 211",
      "intends genuinely to stay temporarily",
      "temporary stay",
      "personal circumstances",
    ],
  },
  {
    id: "funds",
    code: "Schedule 2, cl. 600.213",
    title: "Insufficient funds to support the stay",
    legalBasis: "Migration Regulations 1994, Schedule 2 cl.600.213",
    severity: "low",
    reapplyWaitDays: 30,
    meaning:
      "The delegate was not satisfied you have adequate means, or access to adequate means, to support yourself during the stay. Australia does not publish a single visitor threshold, so the test is whether the money shown plausibly covers the itinerary you filed, including flights, accommodation and daily costs.",
    triggers: [
      "A balance shown only for the day the application was filed",
      "A recent large deposit with no evidence of where it came from",
      "A sponsor or host named but no evidence of their capacity to pay",
      "Funds that clearly do not cover the itinerary as filed",
    ],
    fixes: [
      "Provide at least three to six months of bank statements showing a stable balance",
      "Document the source of any recent large credit with the underlying paperwork",
      "Cost the itinerary out and show funds that comfortably exceed it",
      "If someone else is paying, add their statements, income evidence and a signed undertaking",
    ],
    keywords: [
      "adequate means to support",
      "600 213",
      "sufficient funds",
      "financial capacity",
      "access to adequate means",
    ],
  },
  {
    id: "pic4020",
    code: "PIC 4020",
    title: "False or misleading information, or a bogus document",
    legalBasis: "Migration Regulations 1994, Schedule 4, Public Interest Criterion 4020",
    severity: "high",
    reapplyWaitDays: 1095,
    meaning:
      "PIC 4020 is the strictest criterion in the system. If false or misleading information or a bogus document was given in support of this application, or one lodged in the previous 12 months, the visa must be refused and a three-year exclusion period applies to most later applications. Where identity itself was not established the exclusion period is ten years. A waiver is possible only on compelling circumstances affecting Australia's interests, or compassionate or compelling circumstances affecting an Australian citizen or permanent resident.",
    triggers: [
      "An employment, bank or education document the Department could not verify",
      "A previous refusal or a change of name that was not declared",
      "Statements that conflict between this application and an earlier one",
      "Documents supplied by an agent that the applicant never checked",
    ],
    fixes: [
      "Get the exact wording of the PIC 4020 finding and identify which document or statement was in question",
      "Instruct a registered migration agent or an Australian lawyer before lodging anything else",
      "Assemble proof from the issuing institution if a genuine document was wrongly treated as bogus",
      "Establish whether the three-year or the ten-year exclusion period applies, and from what date",
      "Test whether a waiver is realistic - it needs compelling or compassionate circumstances, not a good explanation",
    ],
    keywords: [
      "pic 4020",
      "public interest criterion 4020",
      "bogus document",
      "false or misleading information",
      "exclusion period",
    ],
  },
  {
    id: "health",
    code: "PIC 4005 / 4007",
    title: "Health requirement not met",
    legalBasis: "Migration Regulations 1994, Schedule 4, Public Interest Criteria 4005 and 4007",
    severity: "medium",
    reapplyWaitDays: 90,
    meaning:
      "A Medical Officer of the Commonwealth assessed that your condition is a threat to public health, or that care for it would cost Australian health and community services more than the significant cost threshold, or would prejudice access to services in short supply. PIC 4007 allows a waiver for some visa subclasses; PIC 4005 does not.",
    triggers: [
      "Active tuberculosis or another notifiable condition found at the medical",
      "A condition needing ongoing treatment costed above the significant cost threshold",
      "An incomplete health examination, or follow-up tests never submitted",
    ],
    fixes: [
      "Complete every examination and follow-up test the panel clinic requested",
      "Complete treatment for a notifiable condition and obtain written clearance before reapplying",
      "Check whether your subclass sits under waivable PIC 4007 rather than PIC 4005",
      "Where a waiver is available, prepare evidence of the cost actually likely to fall on Australian services",
    ],
    keywords: [
      "health requirement",
      "pic 4005",
      "pic 4007",
      "medical officer of the commonwealth",
      "significant cost threshold",
    ],
  },
  {
    id: "character",
    code: "Migration Act s.501",
    title: "Character test not passed",
    legalBasis: "Migration Act 1958 s.501, with 'substantial criminal record' defined in s.501(7)",
    severity: "high",
    reapplyWaitDays: 730,
    meaning:
      "Section 501 lets the Minister or a delegate refuse a visa where the applicant does not pass the character test. Section 501(7) defines a substantial criminal record to include a sentence of death or life imprisonment, a sentence of 12 months or more, or two or more sentences totalling 12 months or more. Association, past conduct and risk of future conduct also feed the test.",
    triggers: [
      "A criminal sentence of 12 months or more, anywhere in the world",
      "Two or more sentences that add up to 12 months or more",
      "An undisclosed conviction found on a police certificate the Department requested",
      "Adverse security or conduct information from any source",
    ],
    fixes: [
      "Obtain certified court documents showing the charge, the sentence and its completion date",
      "Get current police clearance certificates for every country you have lived in for 12 months or more",
      "Instruct a registered migration agent or lawyer - character decisions turn on submissions, not documents alone",
      "Prepare rehabilitation evidence: time since the offence, employment record, family responsibilities",
    ],
    keywords: [
      "character test",
      "section 501",
      "501 7",
      "substantial criminal record",
      "police certificate",
    ],
  },
  {
    id: "genuine-student",
    code: "Subclass 500 - Genuine Student",
    title: "Genuine Student requirement not met",
    legalBasis: "Migration Regulations 1994, Schedule 2 subclass 500 criteria",
    severity: "medium",
    reapplyWaitDays: 60,
    meaning:
      "The Genuine Student requirement replaced the Genuine Temporary Entrant test for student visas on 23 March 2024. The delegate weighs your course choice against your study and work history, your financial position, and whether the qualification makes sense for your career - a course that looks like a route to residence rather than to a qualification fails here.",
    triggers: [
      "A course unrelated to your previous study or current career",
      "A step down in qualification level with no explanation",
      "A confirmation of enrolment, health cover or English evidence that does not cover the whole course",
      "Financial evidence that does not cover tuition plus living costs plus travel",
    ],
    fixes: [
      "Answer the Genuine Student questions in your own words, linking the course to a concrete career step",
      "Explain any gap in study or any downgrade in qualification level with documents",
      "Confirm the enrolment, Overseas Student Health Cover and English results all cover the full course duration",
      "Show tuition, living costs and travel funded from a documented and traceable source",
    ],
    keywords: [
      "genuine student",
      "genuine temporary entrant",
      "gte",
      "subclass 500",
      "confirmation of enrolment",
      "course of study",
    ],
  },
  {
    id: "documents",
    code: "Migration Act s.56 / s.57",
    title: "Requested information or documents not provided",
    legalBasis: "Migration Act 1958 s.56 (request for information) and s.57 (natural justice)",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The Department asked for something under section 56, or put adverse information to you under section 57, and the deadline passed without a complete answer. The delegate then decided on what was already on file. This is a process failure rather than a judgement about you.",
    triggers: [
      "A request letter that went to an old email address or to a former agent",
      "A partial response that missed one of the listed items",
      "A document filed in another language with no accredited translation",
      "A response sent after the deadline stated in the request",
    ],
    fixes: [
      "Keep your ImmiAccount contact details current and check the account, not just email",
      "Answer every numbered item in a request in a single, complete submission before the deadline",
      "Attach accredited English translations for every non-English document",
      "If an agent handled the file, confirm in writing that they received and answered the request",
    ],
    keywords: [
      "section 56",
      "section 57",
      "requested information",
      "natural justice",
      "did not respond",
      "translation",
    ],
  },
  {
    id: "prior-breach",
    code: "PIC 4013 / 4014, conditions 8503 and 8558",
    title: "Previous visa breach or an exclusion period",
    legalBasis: "Migration Regulations 1994, Schedule 4 PIC 4013 and 4014; Schedule 8 conditions",
    severity: "high",
    reapplyWaitDays: 1095,
    meaning:
      "A previous cancellation, or a period spent in Australia as an unlawful non-citizen, can attract a three-year exclusion period under PIC 4013 or 4014. Separately, condition 8503 (no further stay) blocks a further visa while you are in Australia unless it is waived, and condition 8558 limits visitors to 12 months in any 18-month period.",
    triggers: [
      "A visa cancelled under section 116 or section 128",
      "Time spent in Australia after a visa expired, then departing or being removed",
      "A visa carrying condition 8503 that was never waived",
      "Repeated long visitor stays that breach the 12-months-in-18 limit",
    ],
    fixes: [
      "Establish which exclusion period applies and the exact date it began",
      "Request your movement records and visa history from the Department before reapplying",
      "Where compelling circumstances beyond your control caused the breach, prepare documentary evidence for a waiver",
      "For condition 8503, apply for a waiver on compelling and compassionate grounds before the visa expires",
    ],
    keywords: [
      "pic 4013",
      "pic 4014",
      "8503",
      "no further stay",
      "8558",
      "unlawful non citizen",
      "visa cancelled",
    ],
  },
];

const GROUND_BY_ID = new Map(REFUSAL_GROUNDS.map((ground) => [ground.id, ground]));

export function getGround(id) {
  return GROUND_BY_ID.get(id) || null;
}

const norm = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Match the text of a decision record against each ground's keyword list.
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
  if (days <= 0) return "No waiting period applies - reapply once the requested material exists.";
  if (days < 365) {
    return `Allow at least about ${plural(Math.round(days / 30), "month")} so the criterion can actually be met.`;
  }
  return `An exclusion period measured in years applies - roughly ${plural(Math.round(days / 365), "year")} - unless a waiver succeeds.`;
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
      "Administrative Review Tribunal where a review right exists - the deadline is on your decision notice",
  };
}
