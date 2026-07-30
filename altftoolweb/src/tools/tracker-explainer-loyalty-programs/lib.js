/**
 * Loyalty Program Data Explainer — inference catalogue and footprint maths.
 *
 * Pure module: no React, no DOM, no clock reads, no network.
 *
 * A loyalty card turns an anonymous basket into an itemised, timestamped record tied to a
 * name, an address, a payment card and usually a phone number and email. The value to the
 * retailer is not the individual purchase but the sequence: what changed, and when.
 *
 * The classification used below comes from Article 9 of the GDPR, which defines "special
 * categories" of personal data — racial or ethnic origin, political opinions, religious or
 * philosophical beliefs, trade union membership, genetic data, biometric data used for
 * identification, data concerning health, and data concerning a person's sex life or
 * sexual orientation. Processing these is prohibited unless a specific condition in
 * Article 9(2) applies, and the European Data Protection Board's position is that data
 * from which such a characteristic can be *inferred* falls in scope, not only data that
 * states it outright. That is why a repeat purchase of gluten-free staples is treated here
 * as health data rather than as grocery data.
 *
 * "Sensitive" below marks inferences that are not Article 9 data but are still the kind of
 * thing people are surprised to find in a file about them.
 *
 * Airline codes referenced are IATA standards used on real bookings: special meal codes
 * such as KSML (kosher), MOML (Muslim), HNML (Hindu) and VGML (vegetarian vegan), and
 * special service requests such as WCHR (wheelchair required to the aircraft door).
 */

export const SENSITIVITY = {
  special: {
    id: "special",
    label: "Special-category data",
    weight: 5,
    note: "Falls within GDPR Article 9, so it needs a specific condition before it can be processed at all.",
  },
  sensitive: {
    id: "sensitive",
    label: "Sensitive, not Article 9",
    weight: 3,
    note: "Ordinary personal data in law, but rarely what people expect a shop to hold.",
  },
  ordinary: {
    id: "ordinary",
    label: "Ordinary personal data",
    weight: 1,
    note: "Expected, and usually the reason you joined the scheme.",
  },
};

export const CATEGORIES = [
  { id: "health", label: "Health" },
  { id: "belief", label: "Religion or belief" },
  { id: "household", label: "Household make-up" },
  { id: "money", label: "Money and pressure" },
  { id: "movement", label: "Where you are" },
];

export const SIGNAL_GROUPS = [
  { id: "grocery", label: "Supermarket basket" },
  { id: "travel", label: "Airline and hotel" },
  { id: "account", label: "How the account is set up" },
];

export const SIGNALS = [
  {
    id: "prenatal-vitamins",
    group: "grocery",
    label: "Prenatal vitamins, then unscented products",
    infers: "A pregnancy, and an estimated due date from when the buying pattern changes.",
    category: "health",
    sensitivity: "special",
    note: "Retailers value a due date because household buying habits reset around a birth and are then easy to capture.",
  },
  {
    id: "nappy-sizes",
    group: "grocery",
    label: "Nappies moving up a size over time",
    infers: "A child in the household and their age to within a couple of months.",
    category: "household",
    sensitivity: "sensitive",
    note: "The size progression is a clock; it keeps working even if you never mention a child.",
  },
  {
    id: "gluten-free",
    group: "grocery",
    label: "Regular gluten-free staples",
    infers: "Coeliac disease or gluten intolerance in the household.",
    category: "health",
    sensitivity: "special",
    note: "A one-off is a trial; a standing weekly line is a diagnosis.",
  },
  {
    id: "religious-range",
    group: "grocery",
    label: "Halal, kosher or festival-specific ranges",
    infers: "Religious observance, and often which festivals the household keeps.",
    category: "belief",
    sensitivity: "special",
    note: "Seasonal spikes around specific dates sharpen the inference considerably.",
  },
  {
    id: "period-products",
    group: "grocery",
    label: "Period products bought on a cycle",
    infers: "Menstrual timing, and any interruption to it.",
    category: "health",
    sensitivity: "special",
    note: "An interruption is one of the earliest signals of pregnancy available to a retailer.",
  },
  {
    id: "smoking-cessation",
    group: "grocery",
    label: "Nicotine replacement products",
    infers: "A quit attempt now, and a smoking habit before it.",
    category: "health",
    sensitivity: "special",
    note: "Both halves are health data, and both are of interest well beyond the shop.",
  },
  {
    id: "mobility-aids",
    group: "grocery",
    label: "Incontinence pads, mobility or care items",
    infers: "An older adult or a care need in the household.",
    category: "health",
    sensitivity: "special",
    note: "Often bought by a carer, so it can be attributed to the wrong person entirely.",
  },
  {
    id: "pharmacy-collection",
    group: "grocery",
    label: "Prescriptions collected at the in-store pharmacy",
    infers: "Specific medicines, and therefore specific conditions.",
    category: "health",
    sensitivity: "special",
    note: "Pharmacy records are normally held separately under stricter rules — check before you let them be linked to the card.",
  },
  {
    id: "baby-formula",
    group: "grocery",
    label: "A switch between infant formula brands",
    infers: "Feeding difficulty, and a newborn's approximate age.",
    category: "health",
    sensitivity: "special",
    note: "Formula marketing is restricted in many countries precisely because this signal is so valuable.",
  },
  {
    id: "own-brand-ratio",
    group: "grocery",
    label: "A shift from branded to own-brand lines",
    infers: "Falling disposable income, months before any other record shows it.",
    category: "money",
    sensitivity: "sensitive",
    note: "The trend matters more than the level; a sharp switch reads as a job loss.",
  },
  {
    id: "single-portion",
    group: "grocery",
    label: "Single portions bought late in the evening",
    infers: "Living alone, and possibly shift work.",
    category: "household",
    sensitivity: "sensitive",
    note: "Basket size and timing together are a reliable household-size estimator.",
  },
  {
    id: "alcohol-frequency",
    group: "grocery",
    label: "Frequency and volume of alcohol purchases",
    infers: "A drinking pattern, and any change in it.",
    category: "health",
    sensitivity: "sensitive",
    note: "Ordinary data on its own, but treated as health-related the moment it is used to infer a condition or a risk score.",
  },
  {
    id: "pet-food",
    group: "grocery",
    label: "Pet food volume and type",
    infers: "How many pets you have and roughly what size.",
    category: "household",
    sensitivity: "ordinary",
    note: "Harmless in itself, and useful as a check on other household-size guesses.",
  },
  {
    id: "school-items",
    group: "grocery",
    label: "Lunchbox items appearing on a term timetable",
    infers: "School-age children and which local term dates you follow.",
    category: "household",
    sensitivity: "ordinary",
    note: "The on-off pattern across holidays is what makes it readable.",
  },
  {
    id: "store-switch",
    group: "grocery",
    label: "Your usual store changing to a different town",
    infers: "A house move, before any change of address is filed.",
    category: "movement",
    sensitivity: "sensitive",
    note: "Moving home triggers a burst of spending, which is why it is watched for.",
  },
  {
    id: "special-meal-code",
    group: "travel",
    label: "A special meal code on your booking",
    infers: "Religious observance or dietary belief, recorded as a code such as KSML, MOML, HNML or VGML.",
    category: "belief",
    sensitivity: "special",
    note: "The code travels with the booking and is visible to the airline, the handling agent and the caterer.",
  },
  {
    id: "wheelchair-ssr",
    group: "travel",
    label: "A wheelchair or assistance service request",
    infers: "A disability or mobility need, recorded against your frequent flyer profile.",
    category: "health",
    sensitivity: "special",
    note: "Codes such as WCHR sit in the booking record and are often retained on the loyalty profile.",
  },
  {
    id: "pilgrimage-route",
    group: "travel",
    label: "A pilgrimage or festival route flown at a fixed time of year",
    infers: "Religious observance, from the route and the date alone.",
    category: "belief",
    sensitivity: "special",
    note: "No meal code required — the itinerary is enough.",
  },
  {
    id: "repeat-route",
    group: "travel",
    label: "The same city pair flown most weeks",
    infers: "Where you live and where you work, or the location of a second home.",
    category: "movement",
    sensitivity: "sensitive",
    note: "Combined with fare class, this is a strong guess at your employer.",
  },
  {
    id: "companion-passenger",
    group: "travel",
    label: "The same companion on repeated bookings",
    infers: "A relationship graph — who you travel with, and how that changes.",
    category: "household",
    sensitivity: "sensitive",
    note: "This creates records about the other person too, without them joining anything.",
  },
  {
    id: "fare-class-mix",
    group: "travel",
    label: "Your mix of fare classes and how tickets are paid for",
    infers: "Income band, and whether an employer is paying.",
    category: "money",
    sensitivity: "sensitive",
    note: "Corporate fare codes make the employer inference close to explicit.",
  },
  {
    id: "same-email",
    group: "account",
    label: "The same email and phone number as everywhere else",
    infers: "A join key that links this profile to every advertiser list holding that address.",
    category: "movement",
    sensitivity: "sensitive",
    note: "Hashed email matching is how a supermarket profile reaches an ad platform.",
  },
  {
    id: "app-location",
    group: "account",
    label: "Location permission granted to the retailer app",
    infers: "Store visits and dwell time, including visits where you bought nothing.",
    category: "movement",
    sensitivity: "sensitive",
    note: "This extends the record beyond transactions into presence.",
  },
];

/** What you can actually do, in the order that gets the most back for the least effort. */
export const LEVERS = [
  {
    id: "sar",
    label: "Ask for a copy of everything",
    detail:
      "A subject access request under GDPR Article 15 obliges the operator to give you the personal data it holds, including the inferences and profiles derived from it, normally within one month and free of charge.",
  },
  {
    id: "object",
    label: "Object to profiling for marketing",
    detail:
      "Under Article 21(2) you can object to processing for direct marketing at any time, and there is no balancing test — the processing must stop.",
  },
  {
    id: "separate-identity",
    label: "Use a distinct email alias and phone number",
    detail:
      "Breaking the join key stops the loyalty profile from being matched to advertiser lists that use the same address.",
  },
  {
    id: "location-off",
    label: "Refuse location permission in the app",
    detail: "Keeps the record limited to what you bought rather than everywhere you stood.",
  },
  {
    id: "split-basket",
    label: "Keep the categories you care about off the card",
    detail:
      "Pharmacy, alcohol and anything health-related can be bought without scanning the card; the discount is rarely worth the linkage.",
  },
  {
    id: "close-account",
    label: "Close the account and ask about retention",
    detail:
      "Closing rarely deletes history immediately. Ask in writing what is kept, for how long, and on what basis.",
  },
];

export const MAX_SHOPS_PER_WEEK = 21;
export const MAX_YEARS = 40;
export const MAX_ITEMS_PER_BASKET = 200;
export const WEEKS_PER_YEAR = 52;

export const DEPTH_BANDS = [
  { id: "thin", label: "Thin profile", max: 24, advice: "Little more than a purchase list at this point." },
  { id: "shaped", label: "Household shape visible", max: 49, advice: "Enough to guess who lives with you and roughly how you live." },
  { id: "detailed", label: "Detailed household picture", max: 74, advice: "Health, money or belief signals are in the file, not just groceries." },
  { id: "intimate", label: "Intimate picture", max: 100, advice: "Several Article 9 inferences are available from this record alone." },
];

const MAX_WEIGHT = SIGNALS.reduce(
  (sum, signal) => sum + SENSITIVITY[signal.sensitivity].weight,
  0,
);

/** Total sensitivity weight across the whole catalogue. */
export function maxSignalWeight() {
  return MAX_WEIGHT;
}

function bandFor(percent) {
  return DEPTH_BANDS.find((band) => percent <= band.max) || DEPTH_BANDS[DEPTH_BANDS.length - 1];
}

/**
 * Work out what a loyalty record can infer, and how large it is.
 *
 * @param {object} input
 * @param {string[]} input.signalIds      signals that apply to you
 * @param {number}   input.shopsPerWeek   card-scanned transactions per week
 * @param {number}   input.years          years you have held the card
 * @param {number}   input.itemsPerBasket typical number of item lines per transaction
 * @returns {object} analysis, or { error }
 */
export function analyzeLoyaltyFootprint({ signalIds, shopsPerWeek, years, itemsPerBasket } = {}) {
  if (!Array.isArray(signalIds)) {
    return { error: "Tick the patterns that apply to you." };
  }
  const shops = Number(shopsPerWeek);
  const yearsHeld = Number(years);
  const items = Number(itemsPerBasket);

  if (!Number.isFinite(shops) || !Number.isFinite(yearsHeld) || !Number.isFinite(items)) {
    return { error: "Shops per week, years and basket size must all be numbers." };
  }
  if (shops <= 0 || shops > MAX_SHOPS_PER_WEEK) {
    return { error: `Enter between 1 and ${MAX_SHOPS_PER_WEEK} card-scanned shops per week.` };
  }
  if (yearsHeld <= 0 || yearsHeld > MAX_YEARS) {
    return { error: `Enter between 1 and ${MAX_YEARS} years of membership.` };
  }
  if (items <= 0 || items > MAX_ITEMS_PER_BASKET) {
    return { error: `Enter between 1 and ${MAX_ITEMS_PER_BASKET} items in a typical basket.` };
  }

  const wanted = new Set(signalIds);
  const matched = SIGNALS.filter((signal) => wanted.has(signal.id)).map((signal) => ({
    ...signal,
    sensitivityLabel: SENSITIVITY[signal.sensitivity].label,
    weight: SENSITIVITY[signal.sensitivity].weight,
    categoryLabel: CATEGORIES.find((category) => category.id === signal.category).label,
  }));

  const weight = matched.reduce((sum, signal) => sum + signal.weight, 0);
  const depthPercent = MAX_WEIGHT > 0 ? Math.round((weight / MAX_WEIGHT) * 100) : 0;
  const band = bandFor(depthPercent);

  const specialCount = matched.filter((signal) => signal.sensitivity === "special").length;
  const sensitiveCount = matched.filter((signal) => signal.sensitivity === "sensitive").length;

  const categoriesCovered = CATEGORIES.map((category) => ({
    ...category,
    count: matched.filter((signal) => signal.category === category.id).length,
  }));
  const coveredCount = categoriesCovered.filter((category) => category.count > 0).length;

  const transactions = Math.round(shops * WEEKS_PER_YEAR * yearsHeld);
  const itemLines = Math.round(transactions * items);

  const ranked = [...matched].sort(
    (a, b) => b.weight - a.weight || a.categoryLabel.localeCompare(b.categoryLabel),
  );

  const recommendedLevers = LEVERS.filter((lever) => {
    if (lever.id === "location-off") return wanted.has("app-location");
    if (lever.id === "separate-identity") return wanted.has("same-email");
    if (lever.id === "split-basket") return specialCount > 0;
    return true;
  });

  return {
    matched: ranked,
    matchedCount: matched.length,
    totalSignals: SIGNALS.length,
    weight,
    maxWeight: MAX_WEIGHT,
    depthPercent,
    bandId: band.id,
    bandLabel: band.label,
    bandAdvice: band.advice,
    specialCount,
    sensitiveCount,
    categoriesCovered,
    coveredCount,
    totalCategories: CATEGORIES.length,
    transactions,
    itemLines,
    recommendedLevers,
  };
}
