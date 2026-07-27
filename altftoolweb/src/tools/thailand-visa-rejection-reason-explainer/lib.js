/**
 * Thai visa refusal grounds.
 *
 * Thai visas are granted by the Royal Thai Embassy or Consulate-General with jurisdiction
 * over the applicant's place of residence, under the Immigration Act B.E. 2522 (1979).
 * Since the Thai e-Visa system was rolled out worldwide on 1 January 2025 almost all
 * applications are filed online, and the rejection notice is usually a short line rather
 * than a reasoned decision. The catalogue below maps the short lines that do appear onto
 * the underlying requirement and the evidence that satisfies it.
 *
 * Informational only, not immigration advice.
 */

export const COUNTRY_LABEL = "Thai";

/** Financial evidence is the most frequent cause of a Thai e-Visa rejection. */
export const DEFAULT_GROUND_ID = "funds";

/**
 * There is no appeal against a Thai visa refusal. The e-Visa fee is not refunded. A fresh
 * application may be filed at any time, and it must go to the mission with jurisdiction
 * over your place of residence. A blacklist entry is a separate matter handled by the
 * Immigration Bureau, not by the embassy.
 */
export const APPEAL_RULE = {
  title: "No appeal - reapply to the right mission, or petition Immigration",
  detail:
    "Thailand has no appeal process for a refused visa, and the e-Visa fee is not refunded. You may reapply immediately, but two things decide whether that is worth doing. First, jurisdiction: an application must go to the Royal Thai Embassy or Consulate-General that covers your place of residence, and filing to the wrong mission is a common cause of rejection on its own. Second, whether the problem is the file or the record. A weak bank statement or a missing hotel booking is fixed by a better application. A blacklist entry after an overstay or a deportation is not - that is held by the Immigration Bureau under the Immigration Act B.E. 2522 and only the Bureau can review it, which normally requires Thai legal representation.",
};

export const SEVERITY_LABELS = {
  low: "Low - a document or format problem, fixable in days",
  medium: "Medium - the substance of the trip was not established",
  high: "High - an immigration record or a ban is in play",
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3 };

export const READINESS_BANDS = [
  { min: 0, label: "Not ready - the same application would be rejected again" },
  { min: 40, label: "Partly ready - the main gap is still open" },
  { min: 70, label: "Nearly ready - one or two items left" },
  { min: 100, label: "Ready - every listed gap is closed" },
];

export const REFUSAL_GROUNDS = [
  {
    id: "funds",
    code: "Financial evidence",
    title: "Insufficient or unacceptable proof of funds",
    legalBasis: "Immigration Act B.E. 2522 s.12(2) - adequate means of living for the period of stay",
    severity: "medium",
    reapplyWaitDays: 30,
    meaning:
      "Thai missions want a bank statement covering the recent months with a balance that plausibly funds the trip. The long-standing immigration benchmark for a tourist is at least 20,000 baht per person or 40,000 baht per family, and consulates commonly ask for more than the bare minimum. Long-stay categories set their own explicit figures - the Destination Thailand Visa asks for 500,000 baht, and the retirement route asks for 800,000 baht on deposit or 65,000 baht in monthly income.",
    triggers: [
      "A statement showing only the current day's balance instead of the last three to six months",
      "A large deposit made days before applying with no explanation of its source",
      "A balance close to the minimum with an itinerary that clearly costs more",
      "A statement that is not stamped or issued by the bank itself",
    ],
    fixes: [
      "Upload three to six months of bank statements, stamped or issued by the bank, in your own name",
      "Hold a balance comfortably above the benchmark for the whole statement period, not just at the end",
      "Document the source of any recent large credit with the underlying paperwork",
      "For a long-stay category, check the exact published figure for that visa and meet it with room to spare",
    ],
    keywords: ["financial", "bank statement", "proof of funds", "insufficient funds", "balance", "20000 baht"],
  },
  {
    id: "documents",
    code: "Document and photo specification",
    title: "Documents or photograph do not meet the e-Visa specification",
    legalBasis: "Thai e-Visa application requirements (thaievisa.go.th)",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The e-Visa portal rejects files that do not meet its format rules, and a caseworker rejects an application whose documents are unreadable or expired. This is the cheapest and most common rejection to avoid.",
    triggers: [
      "A passport with less than six months validity remaining from the date of entry",
      "A photograph that is not recent, not front-facing or not on a plain background",
      "Scans that are cropped, dark or uploaded in the wrong file type or size",
      "Documents in a language other than Thai or English with no translation",
    ],
    fixes: [
      "Renew the passport if it will not have six months validity left on the date of entry",
      "Take a fresh front-facing photograph on a plain background to the portal's stated pixel size",
      "Re-scan every document in colour at full page size and confirm each upload opens",
      "Attach an English translation for any document not already in Thai or English",
    ],
    keywords: ["photograph", "passport validity", "six months", "document format", "upload", "scan"],
  },
  {
    id: "itinerary",
    code: "Travel plan and accommodation",
    title: "Itinerary, accommodation or onward travel not established",
    legalBasis: "Immigration Act B.E. 2522 s.12 - conditions of entry",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "The mission wants to see where you will stay and how you will leave. A missing confirmed onward ticket is a particularly common rejection reason because Thai immigration and the airline both check it at boarding.",
    triggers: [
      "No accommodation booking, or bookings covering only part of the stay",
      "A one-way ticket with no onward or return leg",
      "Dates on the bookings that do not match the dates on the application",
      "An address given as a hotel that cannot be confirmed",
    ],
    fixes: [
      "Book accommodation covering every night of the stay in the traveller's own name",
      "Hold a confirmed onward or return ticket dated inside the permitted stay",
      "Make the booking dates match the application dates exactly",
      "Write a short day-by-day plan for a longer trip so the dates and the route hang together",
    ],
    keywords: ["accommodation", "hotel booking", "return ticket", "onward ticket", "itinerary", "flight"],
  },
  {
    id: "wrong-category",
    code: "Wrong visa category",
    title: "Applied in the wrong visa category",
    legalBasis: "Immigration Act B.E. 2522 and the Ministerial Regulations on visa classes",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "Thailand's categories are narrow and the activity has to fit. Remote work, study, retirement, business and volunteering each have their own class, and a tourist visa does not stretch to cover them. Applying in the wrong class is rejected rather than converted.",
    triggers: [
      "Applying for a tourist visa while planning to work remotely or take up employment",
      "Enrolling in a course on a tourist visa instead of an education visa",
      "Repeated back-to-back tourist entries that read as residence",
      "A business trip without the Thai company's invitation and registration documents",
    ],
    fixes: [
      "Match the activity to the category before paying: tourism, business, education, retirement or the long-stay route",
      "For a business visit, attach the Thai company's invitation, registration certificate and shareholder list",
      "For remote work or a long stay, check the qualifying and financial criteria of the correct long-stay class",
      "Do not describe activities on the form that the category you chose does not allow",
    ],
    keywords: ["visa category", "wrong visa", "tourist visa", "non immigrant", "purpose of visit", "dtv"],
  },
  {
    id: "jurisdiction",
    code: "Wrong mission or residency",
    title: "Applied to a mission that does not cover your place of residence",
    legalBasis: "Consular jurisdiction rules of the Royal Thai Embassy network",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "Thai missions accept applications only from people who live in the territory they cover, and the e-Visa portal asks you to select that mission. Choosing the wrong one, or applying from a country where you have no residence status, is rejected without the substance being considered.",
    triggers: [
      "Selecting a mission because it looked faster rather than because it covers where you live",
      "Applying while travelling, from a country where you hold no residence permit",
      "A residence permit that expires before the intended travel dates",
    ],
    fixes: [
      "Identify the Royal Thai Embassy or Consulate-General whose consular district covers your address",
      "Upload a residence permit or long-term visa for the country you are applying from, if you are not a national",
      "Check the residence document is valid for the whole processing and travel period",
    ],
    keywords: ["jurisdiction", "consular district", "residence permit", "wrong embassy", "place of residence"],
  },
  {
    id: "overstay-ban",
    code: "Overstay ban",
    title: "Previous overstay carrying a re-entry ban",
    legalBasis: "Immigration Bureau Order 1/2558, in force since 20 March 2016",
    severity: "high",
    reapplyWaitDays: 1095,
    meaning:
      "Thailand attaches fixed re-entry bans to overstays. Where a person surrenders voluntarily at departure, an overstay of more than 90 days brings a one-year ban, more than one year brings three years, more than three years brings five years, and more than five years brings ten years. Where the person is arrested instead, an overstay under one year brings a five-year ban and over one year brings ten years. A daily fine of 500 baht, capped at 20,000 baht, is charged on top.",
    triggers: [
      "Staying past the date stamped on entry or the date on an extension",
      "Being arrested rather than surrendering voluntarily at the airport",
      "Assuming a border run resets the permitted stay",
    ],
    fixes: [
      "Establish the exact overstay length and whether you surrendered or were arrested - both decide the ban length",
      "Keep the fine receipt and the departure record; you will need them to show the ban has run out",
      "Count the ban from the departure date and do not apply until it has fully expired",
      "Take Thai legal advice if the ban was recorded incorrectly or the record does not match your passport stamps",
    ],
    keywords: ["overstay", "overstayed", "re entry ban", "banned", "500 baht per day", "immigration order"],
  },
  {
    id: "blacklist",
    code: "Immigration Act s.12 - prohibited persons",
    title: "Blacklist or prohibited-person record",
    legalBasis: "Immigration Act B.E. 2522 (1979) s.12",
    severity: "high",
    reapplyWaitDays: 1825,
    meaning:
      "Section 12 lists the classes of people who may not enter Thailand, including those without adequate means, those with certain convictions or deportation histories, and those considered a danger to public order or health. A blacklist entry is held by the Immigration Bureau, is not visible to you, and cannot be removed by a consulate.",
    triggers: [
      "A previous deportation from Thailand",
      "A criminal conviction in Thailand or abroad",
      "Working in Thailand without a work permit",
      "A record of using false documents to enter",
    ],
    fixes: [
      "Instruct a Thai lawyer to check whether a blacklist entry exists and on what basis",
      "Assemble certified court and immigration records covering the incident",
      "Petition the Immigration Bureau for review rather than repeatedly reapplying at a consulate",
      "Do not attempt entry while a ban runs - a refused entry adds a second record to the first",
    ],
    keywords: ["blacklist", "prohibited person", "section 12", "deported", "work permit", "banned from thailand"],
  },
  {
    id: "insurance",
    code: "Health insurance requirement",
    title: "Required health insurance not evidenced",
    legalBasis: "Category-specific conditions, notably the Non-Immigrant O-A long-stay visa",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "Not every Thai visa needs insurance, but the long-stay categories do, and the policy has to meet the published minimum cover and be valid for the whole permitted stay. A policy that ends when the flight home was booked, rather than when the visa expires, fails.",
    triggers: [
      "A policy expiring before the end of the permitted stay",
      "Cover below the minimum required for the category",
      "A certificate that does not name the traveller or the policy period",
      "An insurer not accepted by the mission for that visa class",
    ],
    fixes: [
      "Check the exact cover and duration the category requires before buying",
      "Buy a policy running to the end of the permitted stay, not the end of the booked trip",
      "Print a certificate naming the traveller, the policy number, the sum insured and the dates",
      "Use an insurer the mission accepts for that visa class",
    ],
    keywords: ["health insurance", "medical insurance", "insurance certificate", "o a visa", "cover"],
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
  if (days <= 0) return "No waiting period applies - reapply as soon as the document problem is fixed.";
  if (days < 365) {
    return `Allow at least about ${plural(Math.round(days / 30), "month")} so the file is genuinely different.`;
  }
  return `A ban or record measured in years applies - roughly ${plural(Math.round(days / 365), "year")} - so confirm it has expired first.`;
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
    appealSummary: "No appeal - reapply to the mission covering your residence, or petition the Immigration Bureau",
  };
}
