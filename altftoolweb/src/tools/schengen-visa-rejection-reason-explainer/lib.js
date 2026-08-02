/**
 * Schengen visa refusal grounds.
 *
 * When a Schengen short-stay (type C) or airport transit (type A) visa is refused, the
 * consulate must hand over the standard form in Annex VI of the Visa Code
 * (Regulation (EC) No 810/2009, as amended by Regulation (EU) 2019/1155). That form is a
 * fixed, numbered tick-list: the officer ticks one or more boxes and the numbering is the
 * same in every Schengen consulate worldwide. The catalogue below reproduces those grounds
 * in plain language, with the article of the Visa Code / Schengen Borders Code behind each.
 *
 * Nothing here is legal advice. It is a reading aid for the form plus a checklist of the
 * evidence that normally answers each ground.
 */

export const COUNTRY_LABEL = "Schengen";

/** Default ground shown at first paint: the most frequently ticked box. */
export const DEFAULT_GROUND_ID = "return-intent";

/**
 * Article 32(3) of the Visa Code gives every refused applicant a right of appeal, brought
 * against the Member State that took the final decision and conducted under that state's
 * national law. The form itself must state where and by when the appeal is lodged, because
 * the deadline is national, not EU-wide.
 */
export const APPEAL_RULE = {
  title: "Your appeal rights under Article 32(3) of the Visa Code",
  detail:
    "Article 32(3) of Regulation (EC) No 810/2009 gives you a right of appeal against a Schengen visa refusal. The appeal is always against the Member State that decided the case - not against the country you happen to have applied through - and it follows that state's national procedure. The refusal form must name the authority and the deadline, so read the bottom of the form: the window is set nationally and is typically counted in weeks from the day you were notified, and it is short. An appeal argues the decision was wrong on the evidence already filed; if your file was genuinely thin, a fresh application with better evidence is usually faster than an appeal.",
};

export const SEVERITY_LABELS = {
  low: "Low - a paperwork gap, usually fixable in one round",
  medium: "Medium - the officer doubted the substance of your case",
  high: "High - touches credibility, security or a recorded ban",
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
    id: "purpose",
    code: "Annex VI box 2",
    title: "Purpose and conditions of stay not justified",
    legalBasis: "Visa Code art. 32(1)(a)(ii); Schengen Borders Code art. 6(1)(c)",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "The consulate could not see, from the papers you filed, what you were going to do day by day and where you were going to sleep. This box is about the completeness and coherence of the itinerary, not about your honesty.",
    triggers: [
      "Hotel or flight reservations that do not line up with the dates on the application form",
      "An invitation letter with no address, no host ID copy and no stated relationship",
      "A business trip with no letter from either the sending or the receiving company",
      "Bookings covering only part of the requested stay",
    ],
    fixes: [
      "File a day-by-day itinerary that matches the entry and exit dates on the form exactly",
      "Attach confirmed accommodation covering every night of the stay, in the traveller's name",
      "Add a cover letter explaining the purpose in one page, in the first person",
      "For a business or conference trip, attach letters from both companies plus the event registration",
    ],
    keywords: [
      "purpose and conditions",
      "purpose of the intended stay",
      "justification for the purpose",
      "conditions of the intended stay",
      "box 2",
    ],
  },
  {
    id: "means",
    code: "Annex VI box 3",
    title: "Insufficient means of subsistence",
    legalBasis: "Visa Code art. 32(1)(a)(iii); Schengen Borders Code art. 6(1)(c) and art. 6(4)",
    severity: "medium",
    reapplyWaitDays: 60,
    meaning:
      "You did not show enough money for the length of the stay and for the return journey. Each Member State publishes its own reference amount per day under Article 6(4) of the Schengen Borders Code, so the bar depends on which country you applied to, and the officer also looks at whether the balance is genuinely yours.",
    triggers: [
      "A balance that only clears the daily reference amount on the last statement line",
      "A large lump sum deposited days before applying, with no explanation",
      "Statements covering less than the three or six months the consulate asked for",
      "Relying on a sponsor without the sponsor's own bank proof and a formal undertaking",
    ],
    fixes: [
      "Attach at least three to six months of stamped bank statements showing a steady balance",
      "Check the host country's published daily reference amount and cover the whole trip plus the return fare",
      "Explain any lump-sum credit in writing with its source document (sale deed, bonus letter, loan sanction)",
      "If a sponsor pays, add their formal undertaking, their bank proof and evidence of the relationship",
    ],
    keywords: [
      "sufficient means of subsistence",
      "means of subsistence",
      "proof of sufficient means",
      "return to the country of origin",
      "box 3",
    ],
  },
  {
    id: "return-intent",
    code: "Annex VI box 9",
    title: "Doubts about your intention to leave before the visa expires",
    legalBasis: "Visa Code art. 32(1)(b)",
    severity: "high",
    reapplyWaitDays: 90,
    meaning:
      "This is the immigration-risk box and the single most common Schengen refusal. The officer is not accusing you of lying; they are saying your ties to your home country - job, family, property, income - did not outweigh the pull of staying on. It is judged on the file, so the answer is more and better evidence of what you are coming back to.",
    triggers: [
      "No travel history, or no previously used visa from a comparable destination",
      "Unemployed, freelance or recently changed employer with no leave-approval letter",
      "Single, no dependants, no property and no other anchor shown in the file",
      "A long requested stay that does not match the stated reason for travel",
    ],
    fixes: [
      "Add an employer letter naming your role, salary, tenure, approved leave dates and the date you resume duty",
      "Show income continuity: salary slips, tax returns or business registration and GST/VAT filings",
      "Evidence family and asset ties - dependants at home, property papers, ongoing loans or a lease",
      "Ask for a stay length that matches the itinerary rather than the maximum the visa allows",
      "Build a travel record first with a shorter trip to a country that visas more readily",
    ],
    keywords: [
      "intention to leave",
      "intention to leave the territory",
      "before the expiry of the visa",
      "reasonable doubts as to your intention",
      "box 9",
    ],
  },
  {
    id: "insurance",
    code: "Annex VI box 7",
    title: "No adequate travel medical insurance",
    legalBasis: "Visa Code art. 15",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "Article 15 of the Visa Code requires cover of at least EUR 30,000 for medical emergency, urgent hospital treatment and repatriation, valid across the whole Schengen area for the whole stay. This box is a pure paperwork failure and is normally cured in a single day.",
    triggers: [
      "A policy below the EUR 30,000 minimum",
      "Cover that ends before the last day of the requested visa validity",
      "A policy valid only for the destination country instead of the whole Schengen area",
      "A credit-card travel benefit with no certificate naming the traveller and the dates",
    ],
    fixes: [
      "Buy a policy with at least EUR 30,000 cover including repatriation, valid for all Schengen states",
      "Make the policy dates cover the full visa validity requested, not just the booked nights",
      "Print the certificate showing the traveller name, policy number, sum insured and territory",
    ],
    keywords: [
      "travel medical insurance",
      "adequate and valid travel medical insurance",
      "medical insurance",
      "box 7",
    ],
  },
  {
    id: "documents",
    code: "Annex VI form (no dedicated box)",
    title: "Doubts about the authenticity of your supporting documents",
    legalBasis: "Visa Code art. 32(1)(b)",
    severity: "high",
    reapplyWaitDays: 180,
    meaning:
      "The consulate could not verify a document, or verification came back wrong. This is the credibility box: even one document the consulate could not confirm taints the whole file, and consulates do call employers and banks. If a document really was forged the case moves toward the fraud territory of box 1, which follows a person for years.",
    triggers: [
      "An employer who did not answer, or answered differently, when the consulate called",
      "Bank statements printed without a branch stamp or verifiable reference",
      "Reservations made through an agent that the hotel or airline could not confirm",
      "Any document supplied by a consultant that you have not personally read",
    ],
    fixes: [
      "Re-file only documents you can have independently confirmed by the issuer on request",
      "Give live contact details - a switchboard number and a work email - for every employer or sponsor named",
      "Use bank statements issued and stamped directly by the branch, not internet printouts",
      "Book refundable but genuine, confirmable reservations rather than agent-generated dummy ones",
      "Never file a document you did not read; you carry the consequence, not the agent",
    ],
    keywords: [
      "authenticity of the supporting documents",
      "veracity of their contents",
      "reliability of the statements",
      "supporting documents submitted",
    ],
  },
  {
    id: "false-document",
    code: "Annex VI box 1",
    title: "False, counterfeit or forged travel document presented",
    legalBasis: "Visa Code art. 32(1)(a)(i)",
    severity: "high",
    reapplyWaitDays: 365,
    meaning:
      "The gravest box on the form. It records that the passport or travel document itself was found to be false, counterfeit or forged. The finding is stored against your biometrics in the Visa Information System, which every Schengen consulate queries, and it will surface on every future application.",
    triggers: [
      "A passport with altered pages, a substituted photo or a fabricated visa or entry stamp",
      "A travel document reported lost or stolen and still in circulation",
      "Identity details that do not match the civil register of the issuing country",
    ],
    fixes: [
      "Get a properly issued passport from your national authority and keep the issuance record",
      "Take formal legal advice before reapplying - this ground is not fixed by better paperwork alone",
      "Prepare a written explanation with documentary proof if an agent filed the document without your knowledge",
      "Expect the record to persist in the Visa Information System and plan a long gap before reapplying",
    ],
    keywords: [
      "false counterfeit or forged travel document",
      "forged travel document",
      "counterfeit",
      "box 1",
    ],
  },
  {
    id: "sis-alert",
    code: "Annex VI box 5",
    title: "An alert has been issued in the Schengen Information System",
    legalBasis: "Visa Code art. 32(1)(a)(v); SIS Regulation (EU) 2018/1861",
    severity: "high",
    reapplyWaitDays: 365,
    meaning:
      "One Member State has entered you in the Schengen Information System for the purpose of refusing entry. Any consulate that queries SIS then has to refuse. The alert belongs to the state that entered it, so the fix runs through that state's authority, not the consulate that refused you.",
    triggers: [
      "A past overstay or removal decision recorded by one Member State",
      "A prior entry ban that has not yet expired or was never formally lifted",
      "Mistaken identity where a name and date of birth collide with a flagged record",
    ],
    fixes: [
      "Use your data-subject right of access under the SIS Regulation to ask which state entered the alert and why",
      "Apply to that state's authority for correction or deletion if the alert is wrong or has expired",
      "Take legal advice in the country that entered the alert - the refusing consulate cannot remove it",
      "Do not reapply until the alert is confirmed lifted; the refusal repeats automatically",
    ],
    keywords: [
      "alert has been issued in the schengen information system",
      "schengen information system",
      "sis",
      "purpose of refusing entry",
      "box 5",
    ],
  },
  {
    id: "ninety-days",
    code: "Annex VI box 4",
    title: "You have already used 90 days in the current 180-day period",
    legalBasis: "Schengen Borders Code art. 6(1); Visa Code art. 32(1)(a)(iv)",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "Short-stay rights are capped at 90 days of presence in any rolling 180-day window, counted backwards from each day of stay across all Schengen states combined. The count is arithmetic, not discretionary, so the only cure is to wait until enough days age out of the window.",
    triggers: [
      "Repeated trips totalling more than 90 days without noticing the rolling window",
      "Counting per country instead of across the whole Schengen area",
      "Counting only full months and missing arrival and departure days, both of which count",
    ],
    fixes: [
      "Recount every Schengen entry and exit stamp against a rolling 180-day window, counting arrival and departure days",
      "Move the trip to a date on which the 90-day allowance has recovered",
      "If you genuinely need longer, apply for the relevant national long-stay (type D) visa instead",
    ],
    keywords: [
      "90 days during the current 180 day period",
      "already stayed for 90 days",
      "180 day period",
      "box 4",
    ],
  },
  {
    id: "public-policy",
    code: "Annex VI box 6",
    title: "Considered a threat to public policy, internal security or public health",
    legalBasis: "Visa Code art. 32(1)(a)(vi); Schengen Borders Code art. 2(21)",
    severity: "high",
    reapplyWaitDays: 365,
    meaning:
      "One or more Member States objected during the consultation stage. Reasons are rarely spelled out, and they can rest on a criminal record, an intelligence flag or a communicable-disease concern as defined in Article 2(21) of the Schengen Borders Code.",
    triggers: [
      "A criminal conviction, whether or not it was disclosed on the form",
      "An objection raised by another Member State during prior-consultation",
      "A public-health notification concerning a disease with epidemic potential",
    ],
    fixes: [
      "Obtain a police clearance certificate and, where a case is closed, the court order that closed it",
      "Take legal advice before reapplying - this ground needs representations, not more bank statements",
      "Disclose any past conviction accurately; a concealed record turns this into a fraud finding",
    ],
    keywords: [
      "threat to public policy",
      "internal security",
      "public health",
      "international relations",
      "box 6",
    ],
  },
];

const GROUND_BY_ID = new Map(REFUSAL_GROUNDS.map((ground) => [ground.id, ground]));

export function getGround(id) {
  return GROUND_BY_ID.get(id) || null;
}

const norm = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Match free text from a refusal notice against the keyword list of each ground.
 * Deterministic: score is the count of distinct keywords found, confidence is that
 * count as a percentage of the ground's keyword list, both rounded.
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
  if (days <= 0) return "No waiting period applies - reapply as soon as the missing evidence exists.";
  if (days < 180) {
    return `Allow at least about ${plural(Math.round(days / 30), "month")} so something in your file has genuinely changed.`;
  }
  return `Allow at least about ${plural(Math.round(days / 30), "month")}, and expect the record to stay visible to every Schengen consulate in the meantime.`;
}

/**
 * Build the combined fix checklist for the selected grounds and score how ready the
 * applicant is to reapply.
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
      "Appeal to the Member State that decided the case, within the deadline printed on the refusal form",
  };
}
