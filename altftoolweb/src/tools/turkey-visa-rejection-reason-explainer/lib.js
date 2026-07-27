/**
 * Turkish visa refusal grounds.
 *
 * Turkey runs two parallel routes. The e-Visa at the government portal covers tourism and
 * trade for eligible nationalities and is decided automatically against eligibility rules;
 * everything else - work, study, family reunification, long stays - needs a sticker visa
 * from a Turkish consulate, decided by a person. Both sit under Law No. 6458 on Foreigners
 * and International Protection, administered by the Presidency of Migration Management.
 *
 * Two rules cause a disproportionate share of Turkish refusals and both are arithmetic
 * rather than discretionary: the passport must remain valid for at least 60 days beyond the
 * duration of stay granted by the visa, and short stays are capped at 90 days in any
 * 180-day period.
 *
 * Informational only, not immigration advice.
 */

export const COUNTRY_LABEL = "Turkish";

/** The 60-day passport validity margin is the classic e-Visa rejection. */
export const DEFAULT_GROUND_ID = "passport-validity";

/**
 * There is no appeal against an e-Visa rejection and the fee is not refunded. A consular
 * refusal is notified in writing and the notice states the remedy available under Turkish
 * administrative law, which is normally an administrative application or an action in the
 * administrative court within the period stated on the notice.
 */
export const APPEAL_RULE = {
  title: "e-Visa rejections versus consular refusals",
  detail:
    "An e-Visa rejection is an automated eligibility outcome: there is no appeal, no refund, and no person to write to. The correct response is either to fix the eligibility problem - passport validity, the supporting visa or residence permit a conditional nationality needs, the data you typed - or to apply for a sticker visa at a Turkish consulate, which is assessed by a person and can consider documents the portal cannot. A consular refusal is different: it is an administrative decision notified in writing, and the notice sets out the remedy and the deadline available under Turkish administrative law. Read that notice carefully, because the period for challenging an administrative act is short. Apply only through the official government e-Visa site; the copycat sites that dominate search results charge a mark-up and are a common source of mistyped applications.",
};

export const SEVERITY_LABELS = {
  low: "Low - an eligibility or data defect you can fix immediately",
  medium: "Medium - the wrong route was used for the trip",
  high: "High - an entry ban or immigration record applies",
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3 };

export const READINESS_BANDS = [
  { min: 0, label: "Not ready - the same application would fail again" },
  { min: 40, label: "Partly ready - the main defect is still there" },
  { min: 70, label: "Nearly ready - one or two items left" },
  { min: 100, label: "Ready - every listed gap is closed" },
];

export const REFUSAL_GROUNDS = [
  {
    id: "passport-validity",
    code: "60-day validity margin",
    title: "Passport does not have 60 days validity beyond the stay",
    legalBasis: "Turkish entry requirement: passport valid at least 60 days beyond the visa's duration of stay",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "Turkey does not use the common six-month rule. It requires the passport to remain valid for at least 60 days after the end of the duration of stay the visa grants. For a 90-day e-Visa that means roughly five months of validity from entry, which catches people whose passport would comfortably satisfy any other country.",
    triggers: [
      "A passport expiring less than 60 days after the last day of the permitted stay",
      "Counting validity from the travel date rather than from the end of the stay period",
      "Assuming the six-month rule used elsewhere applies to Turkey",
    ],
    fixes: [
      "Add the visa's duration of stay to your entry date, then add 60 days, and check the passport outlives that date",
      "Renew the passport before applying if the margin does not clearly hold",
      "Apply with the new passport number once renewed - the visa is tied to the passport it was issued against",
    ],
    keywords: ["passport validity", "60 days", "sixty days", "expiry", "duration of stay", "validity margin"],
  },
  {
    id: "eligibility",
    code: "e-Visa eligibility conditions",
    title: "Nationality not eligible, or a conditional requirement not met",
    legalBasis: "e-Visa eligibility rules published on the official Turkish e-Visa portal",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "The e-Visa is open to some nationalities unconditionally and to others only on conditions - typically holding a valid visa or residence permit from a Schengen country, the United States, the United Kingdom or Ireland, and holding an ordinary passport. If the condition is not met, or the supporting document expires before the trip, the application fails on eligibility and nothing else is considered.",
    triggers: [
      "A conditional nationality applying without the required supporting visa or residence permit",
      "A supporting document that expires before the intended travel date",
      "A special, service or diplomatic passport where the route is open only to ordinary passports",
      "A nationality that is not eligible for the e-Visa at all and needs a consular sticker visa",
    ],
    fixes: [
      "Check the eligibility page for your exact nationality and passport type before paying",
      "Hold a supporting Schengen, US, UK or Ireland visa or residence permit that is still valid on the travel dates",
      "Upload or carry the supporting document - it is checked again at the airport",
      "Where the e-Visa route is closed to you, apply for a sticker visa at a Turkish consulate instead",
    ],
    keywords: ["eligibility", "not eligible", "conditional", "residence permit", "supporting visa", "ordinary passport"],
  },
  {
    id: "wrong-route",
    code: "Wrong visa route for the purpose",
    title: "e-Visa used for a purpose it does not cover",
    legalBasis: "Law No. 6458 on Foreigners and International Protection - visa types and purposes",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "The e-Visa covers tourism and trade visits only. Work, study, internships, family reunification, medical treatment arrangements and any stay beyond the short-stay limit need the corresponding sticker visa from a consulate, and a stay of more than 90 days needs a residence permit obtained after arrival.",
    triggers: [
      "Planning to work, study or take an internship on an e-Visa",
      "Planning a stay longer than the short-stay allowance",
      "A purpose the e-Visa form does not list among its options",
      "Assuming a residence permit can be arranged on arrival without the right entry visa",
    ],
    fixes: [
      "Match the route to the purpose: e-Visa for tourism and trade, sticker visa for everything else",
      "For work or study, obtain the correct visa type from a Turkish consulate before travelling",
      "For a stay over the short-stay limit, plan the residence permit application timeline before you enter",
      "Do not describe on the form a purpose the e-Visa does not cover",
    ],
    keywords: ["purpose", "tourism", "work visa", "student visa", "residence permit", "long stay", "sticker visa"],
  },
  {
    id: "ninety-days",
    code: "90 days in 180",
    title: "Short-stay allowance already used up",
    legalBasis: "Short-stay limit of 90 days within any 180-day period",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "Short stays in Turkey are capped at 90 days within any 180-day period, counted backwards from each day of presence. The calculation is arithmetic, so the only remedy is to wait until enough days age out of the window, or to obtain a residence permit for a longer stay.",
    triggers: [
      "Repeated visits totalling more than 90 days without tracking the rolling window",
      "Counting only whole months and missing the arrival and departure days, which both count",
      "Assuming a short exit and re-entry resets the counter",
    ],
    fixes: [
      "Recount every entry and exit stamp against a rolling 180-day window, counting arrival and departure days",
      "Move the trip to a date on which the 90-day allowance has recovered",
      "For a genuinely longer stay, apply for a residence permit rather than repeated short visits",
    ],
    keywords: ["90 days", "180 days", "ninety days", "short stay limit", "rolling period"],
  },
  {
    id: "data-mismatch",
    code: "Data mismatch or payment failure",
    title: "Details do not match the passport, or the payment failed",
    legalBasis: "Accuracy of the particulars declared on the e-Visa application",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The e-Visa is bound to the passport number, name and date of birth you typed, and it is checked against the passport at check-in and at the border. A wrong character produces a document that is technically invalid for travel, even though the payment went through.",
    triggers: [
      "Given name and surname entered in the wrong fields",
      "A single wrong character in the passport number",
      "Date of birth or expiry date entered in the wrong format",
      "A payment that failed or was reversed, leaving no valid e-Visa despite a confirmation email",
    ],
    fixes: [
      "Copy every field from the passport machine-readable zone, character by character",
      "Check the printed e-Visa against the passport before travelling, not at the airport",
      "Confirm the e-Visa is retrievable from the official portal using its reference, not just from an email",
      "If a detail is wrong, apply again correctly - an issued e-Visa cannot be edited",
    ],
    keywords: ["mismatch", "passport number", "name", "payment failed", "incorrect details", "typo"],
  },
  {
    id: "unofficial-site",
    code: "Unofficial e-Visa website",
    title: "Applied through a copycat or reseller site",
    legalBasis: "Official e-Visa portal operated by the Republic of Türkiye",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "Turkey's e-Visa attracts an unusually large number of lookalike sites that charge a substantial mark-up on the government fee and retype your details into the official system. Some deliver a valid visa late, some deliver only a receipt.",
    triggers: [
      "A fee far above the official government charge for your nationality",
      "A confirmation from a commercial domain rather than the government portal",
      "No reference number that works on the official site",
      "Details typed in by a third party you cannot check",
    ],
    fixes: [
      "Apply only on the official government e-Visa site",
      "Verify the issued e-Visa on the official portal using its reference number before travelling",
      "Compare the fee against the official published amount for your nationality",
      "Print the verified e-Visa and check every field against the passport",
    ],
    keywords: ["unofficial", "copycat", "reseller", "agency fee", "official portal", "verify"],
  },
  {
    id: "entry-ban",
    code: "Entry ban under Law No. 6458",
    title: "Existing entry ban after an overstay or removal",
    legalBasis: "Law No. 6458 on Foreigners and International Protection - entry bans and removal decisions",
    severity: "high",
    reapplyWaitDays: 730,
    meaning:
      "Turkey imposes entry bans on people who overstayed, were removed, or breached the conditions of a permit. The length scales with the seriousness and with how long the overstay ran, from a few months up to several years, and leaving an administrative fine unpaid tends to lengthen it. No visa can be issued while a ban stands.",
    triggers: [
      "Staying beyond the permitted period and paying the fine only at departure - or not at all",
      "A removal decision issued by the Presidency of Migration Management",
      "Working in Turkey without a work permit",
      "Breaching the conditions of a residence permit",
    ],
    fixes: [
      "Establish the exact overstay length, the fine paid and the date of departure",
      "Keep the fine receipt and the exit record - an unpaid fine can extend the ban",
      "Have the ban's existence and end date confirmed before applying again",
      "Where the ban appears to be recorded wrongly, take Turkish legal advice rather than reapplying repeatedly",
    ],
    keywords: ["entry ban", "banned", "overstay", "deported", "removal decision", "tahdit", "fine"],
  },
  {
    id: "consular-documents",
    code: "Sticker visa document requirements",
    title: "Consular application incomplete or unconvincing",
    legalBasis: "Law No. 6458 - conditions for the grant of a visa by a consulate",
    severity: "medium",
    reapplyWaitDays: 30,
    meaning:
      "A sticker visa is decided by a consular officer on the documents filed: purpose, funds, accommodation, travel insurance where required, and evidence that you will leave at the end of the stay. A thin file is refused the same way it would be anywhere else.",
    triggers: [
      "No confirmed accommodation or return travel for the requested dates",
      "Bank statements covering a single day rather than several months",
      "An invitation with no host details or stated relationship",
      "No evidence of employment, study or other commitments at home",
    ],
    fixes: [
      "File an itinerary with confirmed accommodation and return travel matching the requested dates",
      "Attach three to six months of bank statements showing a stable balance",
      "Add an employer or institution letter with role, tenure, approved leave and the resumption date",
      "Where a host invites you, include their identity document, address and stated relationship to you",
    ],
    keywords: ["consulate", "sticker visa", "supporting documents", "bank statement", "invitation", "insurance"],
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
  if (days <= 0) return "No waiting period applies - fix the eligibility problem and apply again.";
  if (days < 365) {
    return `Allow at least about ${plural(Math.round(days / 30), "month")} so the file is genuinely different.`;
  }
  return `An entry ban measured in years is likely - roughly ${plural(Math.round(days / 365), "year")} - so confirm it has ended first.`;
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
    appealSummary:
      "No appeal for an e-Visa rejection - fix eligibility or use a consulate; a consular refusal notice states its own remedy",
  };
}
