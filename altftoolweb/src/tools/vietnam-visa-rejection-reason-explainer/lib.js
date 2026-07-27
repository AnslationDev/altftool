/**
 * Vietnam e-Visa rejection grounds.
 *
 * Vietnam's e-Visa is issued by the Immigration Department under Law No. 47/2014/QH13 on
 * Entry, Exit, Transit and Residence of Foreigners, as amended. Since 15 August 2023 the
 * e-Visa is open to holders of all passports, is valid for up to 90 days and can be issued
 * single or multiple entry. Applications are decided on the uploaded file alone - there is
 * no interview - which is why the overwhelming majority of rejections are caused by the
 * photograph, the passport scan or a data mismatch rather than by anything about the
 * traveller.
 *
 * Informational only, not immigration advice.
 */

export const COUNTRY_LABEL = "Vietnam";

/** Image quality is the single most common cause of an e-Visa rejection. */
export const DEFAULT_GROUND_ID = "photo-scan";

/**
 * There is no appeal and no refund: the e-Visa fee, USD 25 for single entry and USD 50 for
 * multiple entry, is charged per application and is not returned when the application is
 * unsuccessful. The routes forward are a corrected fresh application, or a visa obtained
 * through a Vietnamese embassy or consulate.
 */
export const APPEAL_RULE = {
  title: "No appeal, no refund - what to do instead",
  detail:
    "A rejected Vietnamese e-Visa cannot be appealed and the fee is not refunded. The fee is USD 25 for a single-entry e-Visa and USD 50 for multiple entry, charged per application, so a careless resubmission costs the same as the first attempt. Two routes exist. The first is a corrected application on the official portal - fix the exact defect, re-check every field against the passport character by character, and apply again. The second is to apply through a Vietnamese embassy or consulate, which is slower but allows a person to look at documents that the automated flow will not accept. Only use the government portal: unofficial sites charge a mark-up and are a common source of mistyped applications.",
};

export const SEVERITY_LABELS = {
  low: "Low - an upload or typing defect, fixable the same day",
  medium: "Medium - an eligibility or trip-detail problem",
  high: "High - an entry suspension or immigration record applies",
};

const SEVERITY_ORDER = { low: 1, medium: 2, high: 3 };

export const READINESS_BANDS = [
  { min: 0, label: "Not ready - the same upload would be rejected again" },
  { min: 40, label: "Partly ready - the main defect is still there" },
  { min: 70, label: "Nearly ready - one or two items left" },
  { min: 100, label: "Ready - every listed gap is closed" },
];

export const REFUSAL_GROUNDS = [
  {
    id: "photo-scan",
    code: "Portrait photo / passport scan",
    title: "Photograph or passport page did not meet the specification",
    legalBasis: "Vietnam Immigration Department e-Visa upload requirements",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The portal needs two images: a straight-on passport-style portrait with the full face visible and no glasses or head covering, and a clear colour scan of the whole passport data page. Glare on the laminate, a cropped edge, a shadow across the face or a photo taken at an angle are each enough on their own.",
    triggers: [
      "A portrait cropped too tight, taken at an angle, or with glasses or a hat",
      "A passport data page scan with glare, a missing corner or the machine-readable lines cut off",
      "A photo of a photo, or a screenshot rather than a scan",
      "An image below the portal's size or resolution limits",
    ],
    fixes: [
      "Shoot a fresh front-facing portrait on a plain light background with no glasses and a neutral expression",
      "Scan the passport data page flat, in colour, with all four corners and both machine-readable lines visible",
      "Use a scanner or a scanning app rather than an angled phone photo, and check for glare before uploading",
      "Confirm both files sit inside the portal's stated file type and size limits before submitting",
    ],
    keywords: ["photo", "portrait", "passport page", "scan", "image quality", "blurry", "glare"],
  },
  {
    id: "data-mismatch",
    code: "Data mismatch",
    title: "Form details do not match the passport exactly",
    legalBasis: "Law No. 47/2014/QH13 art. 16 - accuracy of declared information",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The system compares what you typed against the passport image. Name order, a missing middle name, a transposed digit in the passport number, the wrong date format or the wrong issuing country all cause a rejection, and none of them are corrected for you.",
    triggers: [
      "Given name and surname entered in the wrong fields",
      "A middle name on the passport that was left out of the form",
      "A single wrong character in the passport number",
      "Date of birth entered in the wrong order, or the wrong nationality selected",
    ],
    fixes: [
      "Copy every field straight from the machine-readable zone of the passport, character by character",
      "Enter names exactly as printed, including middle names, in the same order as the passport",
      "Re-read the passport number for the classic confusions between 0 and O, and 1 and I",
      "Check the date format the portal expects before typing the date of birth and the entry date",
    ],
    keywords: ["mismatch", "incorrect information", "passport number", "name", "date of birth", "typo"],
  },
  {
    id: "passport-validity",
    code: "Passport validity",
    title: "Passport does not have enough validity left",
    legalBasis: "Law No. 47/2014/QH13 - conditions for entry",
    severity: "low",
    reapplyWaitDays: 0,
    meaning:
      "The passport must be valid for at least six months from the date of entry, and it must have blank pages for stamps. An e-Visa cannot be issued against a passport that expires inside that window, and an approved e-Visa is tied to the passport number it was issued against.",
    triggers: [
      "Less than six months left on the passport from the intended entry date",
      "A passport renewed after the e-Visa was approved, leaving the visa tied to the old number",
      "An emergency or temporary travel document",
    ],
    fixes: [
      "Renew the passport before applying if it will not have six months left on the entry date",
      "Apply only after the new passport is in hand, using the new number",
      "Carry the old passport alongside the new one if a valid visa was issued against it",
    ],
    keywords: ["passport validity", "six months", "expired passport", "blank pages", "renewed passport"],
  },
  {
    id: "checkpoint",
    code: "Entry and exit checkpoint",
    title: "Entry or exit checkpoint not valid for an e-Visa",
    legalBasis: "Government list of international checkpoints accepting e-Visa holders",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "An e-Visa is valid only at the international air, land and sea checkpoints on the published list, and you must enter through the checkpoint you selected on the form. Choosing a border crossing that is not on the list, or arriving somewhere other than the one you named, causes problems at the border even when the visa itself was approved.",
    triggers: [
      "Selecting a land border crossing that does not accept e-Visa holders",
      "Planning to enter through a different airport from the one declared",
      "A cruise or ferry arrival at a port not on the approved list",
    ],
    fixes: [
      "Check the current published list of e-Visa checkpoints before choosing one on the form",
      "Name the checkpoint you will actually arrive at, and travel through that one",
      "Where the route is uncertain, choose a major international airport that is definitely on the list",
    ],
    keywords: ["checkpoint", "port of entry", "border gate", "airport", "land border", "entry point"],
  },
  {
    id: "dates-purpose",
    code: "Travel dates and purpose",
    title: "Entry date or stated purpose does not work",
    legalBasis: "Law No. 47/2014/QH13 - visa purpose and duration",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "The e-Visa runs from the entry date you declare, for the period granted, and it cannot be used before that date. A purpose that does not fit the e-Visa - taking up employment, for instance - needs a sponsored visa arranged by a Vietnamese organisation instead.",
    triggers: [
      "An entry date in the past by the time the application is processed",
      "A stay longer than the e-Visa duration allows",
      "Applying for tourism while intending to work, and needing a sponsored visa instead",
      "Duplicate applications for the same passport running at the same time",
    ],
    fixes: [
      "Set the entry date at least a week ahead so processing cannot overtake it",
      "Keep the whole trip inside the e-Visa duration, or apply for the correct longer visa class",
      "For work, have the Vietnamese employer sponsor the appropriate visa rather than using an e-Visa",
      "Never run two applications for the same passport at once - wait for the first result",
    ],
    keywords: ["entry date", "duration of stay", "purpose", "work", "duplicate application", "90 days"],
  },
  {
    id: "overstay",
    code: "Previous overstay or administrative penalty",
    title: "Previous overstay or fine on the Vietnamese record",
    legalBasis: "Decree 144/2021/ND-CP - administrative penalties in immigration matters",
    severity: "high",
    reapplyWaitDays: 180,
    meaning:
      "Overstaying is an administrative offence with a fine that scales with the length of the overstay, and the record stays with your passport details. A previous fine does not automatically bar a new visa but it is visible to the Immigration Department and weighs against the next application.",
    triggers: [
      "Staying past the last day printed on the visa or the entry stamp",
      "Leaving without settling an administrative fine",
      "Repeated short overstays across several visits",
    ],
    fixes: [
      "Keep the receipt for any fine paid and the exit stamp showing the departure date",
      "Establish exactly how long the overstay ran - the length decides how seriously it reads",
      "Apply through an embassy rather than the portal where the history needs explaining",
      "Allow a clear gap and travel elsewhere on time before applying again",
    ],
    keywords: ["overstay", "overstayed", "fine", "administrative penalty", "exit stamp"],
  },
  {
    id: "entry-suspension",
    code: "Law 47/2014/QH13 art. 21",
    title: "Entry suspended after deportation or forced exit",
    legalBasis: "Law No. 47/2014/QH13 on Entry, Exit, Transit and Residence of Foreigners, art. 21",
    severity: "high",
    reapplyWaitDays: 1095,
    meaning:
      "Article 21 lists the cases in which entry is suspended. A person deported from Vietnam is not permitted to enter for three years from the deportation decision, and a person subjected to forced exit is not permitted to enter for six months. Entry can also be suspended on public health, security or national defence grounds.",
    triggers: [
      "A deportation decision issued against you in Vietnam",
      "A forced exit ordered by the Immigration Department",
      "A record raised on security, public order or public health grounds",
    ],
    fixes: [
      "Establish which measure was taken and the date of the decision - the clock runs from that date",
      "Keep the decision document; you will need it to show the suspension period has ended",
      "Take Vietnamese legal advice where the suspension appears to be recorded wrongly",
      "Do not apply while the period runs; a second rejection adds nothing but a further record",
    ],
    keywords: ["deported", "deportation", "forced exit", "entry suspended", "article 21", "banned"],
  },
  {
    id: "unofficial-site",
    code: "Unofficial application channel",
    title: "Applied through an unofficial or copycat website",
    legalBasis: "Official e-Visa portal operated by the Vietnam Immigration Department",
    severity: "medium",
    reapplyWaitDays: 0,
    meaning:
      "A large number of sites resell the e-Visa at a mark-up, and some simply retype your details into the official portal, introducing errors and delays. If your confirmation did not come from the government system, you may hold a receipt rather than a visa.",
    triggers: [
      "A fee far above USD 25 for single entry or USD 50 for multiple entry",
      "A confirmation email from a commercial domain rather than the government portal",
      "No official registration code to check the result with",
      "Personal data typed in by a third party you cannot verify",
    ],
    fixes: [
      "Apply only on the Vietnam Immigration Department's own e-Visa portal",
      "Keep the registration code issued at submission and use it to check the result yourself",
      "Compare the fee against the official USD 25 and USD 50 amounts before paying",
      "Print the approved e-Visa from the official site and check every field against your passport before travelling",
    ],
    keywords: ["unofficial", "agent website", "scam", "registration code", "official portal", "fee"],
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
    return `Allow at least about ${plural(Math.round(days / 30), "month")} before applying again.`;
  }
  return `An entry suspension measured in years applies - roughly ${plural(Math.round(days / 365), "year")} from the decision date.`;
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
    appealSummary: "No appeal and no refund - correct the application, or apply through a Vietnamese mission",
  };
}
