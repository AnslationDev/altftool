/**
 * Trademark name clearance checklist + distinctiveness heuristic.
 *
 * Rules encoded here:
 *  - Distinctiveness spectrum (generic → descriptive → suggestive → arbitrary → fanciful).
 *    Generic terms are never registrable as trademarks; merely descriptive terms are refused
 *    unless the owner proves acquired distinctiveness. Geographic terms and surnames get the
 *    same treatment in most systems (in the US, 15 U.S.C. §1052(e)).
 *  - Goods and services are filed under the Nice Classification, which has 45 classes:
 *    classes 1-34 cover goods and classes 35-45 cover services. Official fees are charged per
 *    class in every major office, so class count drives cost directly.
 *  - Opposition windows and renewal terms below are the published statutory periods for each
 *    office. Registrations renew every 10 years in the US, EU, UK and India.
 *  - Registering a company name, buying a domain or grabbing a social handle creates no
 *    trademark right; in the US unregistered common-law rights arise from actual use in commerce.
 *
 * Informational only — this is not legal advice and it is not a legal clearance search.
 */

export const JURISDICTIONS = {
  us: {
    label: "United States",
    office: "USPTO",
    searchTool: "USPTO Trademark Search (the system that replaced TESS)",
    oppositionWindow: "30 days from publication in the Official Gazette, extendable on request",
    renewalYears: 10,
    notes: [
      "US rights can exist without registration: continuous use in commerce creates common-law rights in the area of use, so a clear register is not a clear field.",
      "You can file on an intent-to-use basis under §1(b) before you launch, then file a statement of use once you are trading.",
      "Between the 5th and 6th year after registration you must file a declaration of continued use or the registration is cancelled.",
    ],
  },
  eu: {
    label: "European Union",
    office: "EUIPO",
    searchTool: "EUIPO eSearch plus and TMview",
    oppositionWindow: "3 months from publication of the EU trade mark application",
    renewalYears: 10,
    notes: [
      "One EU trade mark covers all member states, but a single successful opposition in any one country can block the whole application.",
      "There is no use requirement at filing, though the mark becomes vulnerable to a non-use cancellation five years after registration.",
    ],
  },
  uk: {
    label: "United Kingdom",
    office: "UKIPO",
    searchTool: "UKIPO trade mark search",
    oppositionWindow: "2 months from publication, extendable to 3 months by filing a notice of threatened opposition",
    renewalYears: 10,
    notes: [
      "The UKIPO notifies earlier rights holders of your application, so conflicting owners hear about it whether or not they were watching.",
      "Since Brexit an EU trade mark no longer covers the UK — file separately if you trade in both.",
    ],
  },
  in: {
    label: "India",
    office: "Trade Marks Registry (IP India)",
    searchTool: "IP India public trade mark search",
    oppositionWindow: "4 months from advertisement in the Trade Marks Journal",
    renewalYears: 10,
    notes: [
      "Official fees are charged per class per mark, with a reduced rate for individuals, startups and small enterprises filing online.",
      "Expect an examination report; replying to objections within the stated deadline is what keeps the application alive.",
    ],
  },
  intl: {
    label: "Multiple countries / international",
    office: "WIPO",
    searchTool: "WIPO Global Brand Database and TMview",
    oppositionWindow: "Set by each designated country once the international registration reaches it",
    renewalYears: 10,
    notes: [
      "The Madrid Protocol lets you extend one home application to over 100 member countries in a single filing.",
      "A Madrid international registration depends on the home application for five years — if that base falls, every designation falls with it.",
    ],
  },
};

/**
 * Common industries mapped to the Nice classes they normally fall in.
 * Class numbers follow the Nice Classification (1-34 goods, 35-45 services).
 */
export const INDUSTRIES = {
  software: { label: "Software / SaaS / app", classes: [9, 42], detail: "Class 9 for downloadable software, class 42 for SaaS and software development services." },
  ecommerce: { label: "Online store / retail", classes: [35], detail: "Class 35 covers retail and online retail services; the goods themselves may need their own class." },
  clothing: { label: "Clothing / footwear / accessories", classes: [25, 35], detail: "Class 25 is clothing, footwear and headgear; class 35 covers selling it." },
  food: { label: "Food / beverage brand", classes: [29, 30, 32], detail: "Classes 29, 30 and 32 split foods and non-alcoholic drinks; check which one your product sits in." },
  restaurant: { label: "Restaurant / café / catering", classes: [43], detail: "Class 43 covers services for providing food and drink and temporary accommodation." },
  cosmetics: { label: "Cosmetics / personal care", classes: [3], detail: "Class 3 covers non-medicated cosmetics, soaps and perfumery." },
  health: { label: "Healthcare / clinic / wellness", classes: [44, 5], detail: "Class 44 covers medical services; class 5 covers pharmaceuticals and supplements." },
  education: { label: "Education / courses / training", classes: [41], detail: "Class 41 covers education, training and entertainment services." },
  finance: { label: "Financial / insurance / fintech", classes: [36], detail: "Class 36 covers financial, monetary, banking and insurance services." },
  consulting: { label: "Consulting / marketing / agency", classes: [35], detail: "Class 35 covers advertising, business management and consultancy." },
  media: { label: "Publishing / media / creator brand", classes: [16, 41], detail: "Class 16 for printed matter, class 41 for entertainment and publishing services." },
  games: { label: "Games / toys", classes: [28, 41], detail: "Class 28 covers games and playthings; class 41 covers online game services." },
  other: { label: "Something else", classes: [], detail: "Look your goods and services up in the Nice Classification before filing — the class list defines the scope of your protection." },
};

/** Words that describe the goods themselves; a mark built only from these is refused as descriptive or generic. */
export const DESCRIPTIVE_TOKENS = [
  "app", "apps", "software", "cloud", "tech", "technologies", "digital", "online", "web",
  "shop", "store", "mart", "market", "bazaar", "coffee", "cafe", "bakery", "pizza", "burger",
  "kitchen", "foods", "fitness", "gym", "clinic", "dental", "care", "legal", "law", "bank",
  "pay", "payments", "insure", "insurance", "travel", "tours", "hotel", "auto", "autos", "cars",
  "kids", "toys", "books", "media", "news", "design", "designs", "studio", "agency", "consulting",
  "consultants", "solutions", "systems", "services", "labs", "works", "best", "premium", "quick",
  "kwik", "easy", "fast", "lite", "fresh", "pure", "natural", "organic", "eco", "smart", "pro",
  "plus", "max", "ultra", "super", "cheap", "value", "discount", "express",
];

/** Place names read as primarily geographically descriptive when the business is actually there. */
export const GEOGRAPHIC_TOKENS = [
  "america", "american", "usa", "british", "england", "london", "paris", "berlin", "york",
  "texas", "california", "florida", "india", "indian", "mumbai", "delhi", "bengaluru", "chennai",
  "euro", "europe", "asia", "asian", "pacific", "atlantic", "north", "south", "east", "west",
  "valley", "silicon", "midwest", "nordic", "alpine",
];

/** Corporate suffixes add nothing distinctive — offices disregard them when comparing marks. */
export const ENTITY_SUFFIXES = ["inc", "llc", "ltd", "limited", "corp", "corporation", "co", "gmbh", "plc", "pvt", "private", "llp", "company"];

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 60;

/** Weightings for the indicative strength score. Descriptive terms cost the most because they are the commonest ground of refusal. */
const PENALTY_DESCRIPTIVE = 30;
const PENALTY_GEOGRAPHIC = 25;
const PENALTY_SUFFIX = 15;
const PENALTY_ALL_FLAGGED = 20;
const PENALTY_VERY_SHORT = 30;
const MIN_SCORE = 5;

export function tokenizeName(name) {
  return String(name ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Indicative distinctiveness assessment. This is a heuristic hint, not a legal opinion.
 * Pure function.
 */
export function assessDistinctiveness(name) {
  const tokens = tokenizeName(name);
  if (tokens.length === 0) return { error: "Enter a brand name made of letters or numbers." };

  const descriptive = tokens.filter((token) => DESCRIPTIVE_TOKENS.includes(token));
  const geographic = tokens.filter((token) => GEOGRAPHIC_TOKENS.includes(token));
  const suffixes = tokens.filter((token) => ENTITY_SUFFIXES.includes(token));
  const flaggedSet = new Set([...descriptive, ...geographic, ...suffixes]);
  const distinctiveTokens = tokens.filter((token) => !flaggedSet.has(token));

  let score = 100;
  score -= descriptive.length * PENALTY_DESCRIPTIVE;
  score -= geographic.length * PENALTY_GEOGRAPHIC;
  score -= suffixes.length * PENALTY_SUFFIX;
  if (distinctiveTokens.length === 0) score -= PENALTY_ALL_FLAGGED;
  if (String(name).trim().length <= MIN_NAME_LENGTH) score -= PENALTY_VERY_SHORT;
  score = Math.max(MIN_SCORE, Math.min(100, score));

  const flags = [];
  if (descriptive.length > 0) {
    flags.push({
      code: "descriptive",
      title: "Descriptive wording",
      detail: `"${descriptive.join('", "')}" describes the goods or a quality of them. Descriptive terms are refused unless you can prove the public already associates them with you, and a deliberate misspelling such as Kwik or Lite is treated exactly like the correctly spelled word.`,
    });
  }
  if (geographic.length > 0) {
    flags.push({
      code: "geographic",
      title: "Geographic wording",
      detail: `"${geographic.join('", "')}" reads as a place name. A mark that is primarily geographically descriptive of where you actually trade is a standard ground of refusal.`,
    });
  }
  if (suffixes.length > 0) {
    flags.push({
      code: "suffix",
      title: "Corporate suffix carries no weight",
      detail: `Offices ignore "${suffixes.join('", "')}" when comparing marks, so it will not distinguish you from an existing registration.`,
    });
  }
  if (distinctiveTokens.length === 0) {
    flags.push({
      code: "no-distinctive-element",
      title: "Nothing distinctive left",
      detail: "Every word in the name either describes the goods, names a place or is a corporate suffix. There is no element for the registration to actually protect.",
    });
  }
  if (String(name).trim().length <= MIN_NAME_LENGTH) {
    flags.push({
      code: "too-short",
      title: "Very short mark",
      detail: "One- and two-character marks are crowded and are often refused as lacking distinctive character unless heavily stylised.",
    });
  }

  let band;
  if (score >= 80) band = { key: "strong", label: "Strong — coined or arbitrary", tone: "success" };
  else if (score >= 50) band = { key: "mixed", label: "Mixed — only part of it is protectable", tone: "warning" };
  else band = { key: "weak", label: "Weak — likely descriptive or generic", tone: "danger" };

  return { tokens, descriptive, geographic, suffixes, distinctiveTokens, score, band, flags };
}

/**
 * Build the clearance checklist for a specific name, market and industry.
 * Pure function: same inputs always give the same steps.
 *
 * @returns {{error: string} | {name: string, score: number, band: object, flags: object[],
 *   classes: number[], steps: object[], jurisdiction: object, industryDetail: string}}
 */
export function buildClearanceChecklist(input = {}) {
  const name = String(input.name ?? "").replace(/\s+/g, " ").trim();
  if (!name) return { error: "Enter the brand name you want to check." };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Brand names longer than ${MAX_NAME_LENGTH} characters are almost never filed as word marks. Trim it to the part you actually use.` };
  }

  const jurisdictionKey = String(input.jurisdiction ?? "").trim() || "us";
  const jurisdiction = JURISDICTIONS[jurisdictionKey];
  if (!jurisdiction) return { error: "Pick the market where you want protection." };

  const industryKey = String(input.industry ?? "").trim() || "software";
  const industry = INDUSTRIES[industryKey];
  if (!industry) return { error: "Pick the closest industry so the right Nice classes are suggested." };

  const assessment = assessDistinctiveness(name);
  if (assessment.error) return { error: assessment.error };

  const classText = industry.classes.length
    ? `classes ${industry.classes.join(" and ")}`
    : "the Nice classes that match your actual goods and services";

  const steps = [
    {
      title: "Check the name is distinctive enough to own",
      detail:
        "Coined and arbitrary names register easily; names that describe the product do not. Fix this first, because no amount of searching rescues a generic name.",
    },
    {
      title: `Search the ${jurisdiction.office} register`,
      detail: `Run the exact name, then obvious variants and misspellings, through ${jurisdiction.searchTool}. Search ${classText} plus any class where a similar business could sit.`,
    },
    {
      title: "Search for similar marks, not just identical ones",
      detail:
        "Refusal is based on likelihood of confusion, so check names that sound alike, look alike or mean the same thing. Try dropping vowels, swapping C for K, and reading the name aloud.",
    },
    {
      title: "Check unregistered use in the wild",
      detail:
        "Search the open web, app stores, marketplaces, company registers and trade directories. A business already trading under the name can have enforceable rights even with nothing on the register.",
    },
    {
      title: "Check the name across the classes you will grow into",
      detail: `${industry.detail} Filing narrowly is cheaper today and expensive to fix when you add a product line.`,
    },
    {
      title: "Check domains and handles last, not first",
      detail:
        "An available .com is a marketing convenience, not a legal right — and an unavailable one does not mean the trademark is taken. Do the register work first.",
    },
    {
      title: "Check the name in the languages of your markets",
      detail:
        "A word that is meaningless in English can be descriptive, rude or already registered elsewhere. This bites hardest on EU and Madrid filings that cover many languages at once.",
    },
    {
      title: "File, then watch the opposition window",
      detail: `Once published, third parties can oppose: ${jurisdiction.oppositionWindow}. Diary the date and keep the file open until it passes.`,
    },
    {
      title: "Diary the renewal and use requirements",
      detail: `Registration lasts ${jurisdiction.renewalYears} years and is renewable indefinitely, but a mark you stop using becomes vulnerable to cancellation.`,
    },
    {
      title: "Get a professional clearance opinion before you spend on the brand",
      detail:
        "A knock-out search you run yourself catches the obvious conflicts. A trademark attorney's opinion is what you rely on before printing packaging or signing a franchise deal.",
    },
  ];

  return {
    name,
    score: assessment.score,
    band: assessment.band,
    flags: assessment.flags,
    distinctiveTokens: assessment.distinctiveTokens,
    classes: industry.classes,
    industryDetail: industry.detail,
    steps,
    jurisdiction,
    jurisdictionNotes: jurisdiction.notes,
  };
}
