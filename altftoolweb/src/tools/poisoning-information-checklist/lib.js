/**
 * Poisoning information checklist.
 *
 * THIS DOES NOT TREAT ANYTHING. It collects, in the order a poison centre or
 * emergency dispatcher asks for it, the information that lets them advise you,
 * and it flags the situations where you should stop filling in a form and
 * call for an ambulance instead.
 *
 * Content sources:
 *  - The standard intake set used by poison information centres: who, what,
 *    how much, by what route, when, current symptoms, and what has already
 *    been done.
 *  - AAP / AAPCC guidance that syrup of ipecac is no longer recommended and
 *    vomiting should not be induced at home.
 *  - Standard first aid for chemical exposure: irrigate eyes and skin with
 *    lukewarm running water for 15 to 20 minutes, move to fresh air after
 *    inhalation, and take the container or packaging with you.
 *
 * Informational only, and no substitute for calling a poison centre.
 */

export const REGIONS = [
  {
    id: "india",
    label: "India",
    emergency: "112",
    poisonLine: "National Poisons Information Centre, AIIMS New Delhi — 1800 116 117",
  },
  {
    id: "us",
    label: "United States",
    emergency: "911",
    poisonLine: "Poison Help — 1-800-222-1222",
  },
  {
    id: "uk",
    label: "United Kingdom",
    emergency: "999",
    poisonLine: "NHS 111 (the clinician there consults the National Poisons Information Service)",
  },
  {
    id: "au",
    label: "Australia",
    emergency: "000",
    poisonLine: "Poisons Information Centre — 13 11 26",
  },
  {
    id: "eu",
    label: "European Union",
    emergency: "112",
    poisonLine: "Your national poison centre — ask for it when you call 112",
  },
  {
    id: "other",
    label: "Somewhere else",
    emergency: "your local emergency number",
    poisonLine: "Your national or regional poison information centre",
  },
];

/** Any of these means stop and call an ambulance rather than a poison line. */
export const RED_FLAGS = [
  { id: "unresponsive", label: "Unresponsive or cannot be woken" },
  { id: "not-breathing", label: "Not breathing, or breathing is noisy or struggling" },
  { id: "seizure", label: "Fitting or having a seizure" },
  { id: "collapse", label: "Collapsed, floppy or grey and clammy" },
  { id: "burns", label: "Burns or blistering in the mouth, throat or on the skin" },
  { id: "chest-pain", label: "Chest pain or an irregular, racing heartbeat" },
  { id: "deliberate", label: "Taken deliberately, or intent to self-harm" },
];

/** Exposure routes and the first aid that goes with each one. */
export const ROUTES = [
  {
    id: "swallowed",
    label: "Swallowed",
    firstAid: [
      "Wipe or rinse out the mouth gently — do not make the person swallow anything else yet.",
      "Do not give milk, salt water or anything to induce vomiting.",
      "Keep the container and any remaining contents to read out on the call.",
    ],
  },
  {
    id: "eye",
    label: "In the eye",
    firstAid: [
      "Irrigate the open eye with lukewarm running water for 15 to 20 minutes, from the inner corner outwards.",
      "Remove contact lenses once irrigation has started, and keep irrigating while you call.",
      "Do not rub the eye or use eye drops or neutralising solutions.",
    ],
  },
  {
    id: "skin",
    label: "On the skin",
    firstAid: [
      "Take off contaminated clothing and jewellery, protecting your own hands.",
      "Rinse the skin with lukewarm running water for 15 to 20 minutes.",
      "Do not scrub, and do not apply creams or try to neutralise the chemical.",
    ],
  },
  {
    id: "inhaled",
    label: "Breathed in",
    firstAid: [
      "Get the person into fresh air immediately without putting yourself at risk.",
      "Open doors and windows on the way out; do not re-enter an enclosed space.",
      "If a fuel-burning appliance may be involved, treat carbon monoxide as a possibility and get everyone, including pets, out.",
    ],
  },
  {
    id: "injected",
    label: "Injected",
    firstAid: [
      "Keep the person still and the limb below heart level if you can.",
      "Do not apply a tourniquet, cut the site or try to suck anything out.",
      "Keep the syringe, vial or packaging safe for identification.",
    ],
  },
  {
    id: "bite",
    label: "Bite or sting",
    firstAid: [
      "Keep the person calm and still — movement speeds venom spread.",
      "Immobilise the bitten limb at heart level and remove rings and watches before swelling starts.",
      "Do not cut, suck, apply ice or use a tourniquet. Photograph the creature only if it is safe.",
    ],
  },
];

/** Things people commonly do that make poisoning worse. */
export const DO_NOTS = [
  "Do not make the person vomit — syrup of ipecac is no longer recommended and vomiting a corrosive burns the throat twice.",
  "Do not give salt water, mustard water or any home remedy.",
  "Do not give activated charcoal unless a clinician tells you to.",
  "Do not wait for symptoms before you call; many poisons act hours later.",
  "Do not throw the container away — take it, and any vomit, with you to hospital.",
];

/** The information a poison centre asks for, in the order they ask. */
export const FIELDS = [
  { id: "patientAge", label: "Age of the person", group: "Who", required: true },
  { id: "patientWeight", label: "Weight (kg) — doses are calculated per kg", group: "Who", required: true },
  { id: "patientConditions", label: "Medical conditions, pregnancy, regular medicines", group: "Who", required: false },
  { id: "productName", label: "Product name exactly as printed on the label", group: "What", required: true },
  { id: "activeIngredients", label: "Active ingredients and strength from the label", group: "What", required: true },
  { id: "amount", label: "Largest amount that could have been taken", group: "How much", required: true },
  { id: "containerSize", label: "Container size and how much is missing", group: "How much", required: false },
  { id: "symptoms", label: "Symptoms right now", group: "Condition", required: true },
  { id: "actionsTaken", label: "Anything already given, done or induced", group: "Condition", required: true },
  { id: "location", label: "Where you are and a callback number", group: "Contact", required: true },
];

export const FIELD_GROUPS = ["Who", "What", "How much", "Condition", "Contact"];

const DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Parse a datetime-local string into a timestamp, or NaN. */
function parseLocalDateTime(value) {
  if (typeof value !== "string" || !DATETIME.test(value.trim())) return Number.NaN;
  const [datePart, timePart] = value.trim().split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31 || hh > 23 || mm > 59) return Number.NaN;
  const ts = Date.UTC(y, m - 1, d, hh, mm);
  const back = new Date(ts);
  if (back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return Number.NaN;
  return ts;
}

/** Whole minutes between two datetime-local strings, or null if either is invalid. */
export function minutesBetween(fromValue, toValue) {
  const from = parseLocalDateTime(fromValue);
  const to = parseLocalDateTime(toValue);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return Math.round((to - from) / 60000);
}

export function getRegion(id) {
  return REGIONS.find((region) => region.id === id) || REGIONS[REGIONS.length - 1];
}

export function getRoute(id) {
  return ROUTES.find((route) => route.id === id) || ROUTES[0];
}

/**
 * Assemble the brief.
 *
 * @param {object} input
 * @param {Record<string,string>} input.answers  FIELDS id -> text
 * @param {string[]} input.redFlags              RED_FLAGS ids ticked
 * @param {string} input.routeId
 * @param {string} input.regionId
 * @param {string} input.exposureAt              "YYYY-MM-DDTHH:MM"
 * @param {string} input.nowAt                   "YYYY-MM-DDTHH:MM" — passed in, never read from the clock here
 * @returns {object} brief, or { error }
 */
export function buildPoisoningBrief({
  answers = {},
  redFlags = [],
  routeId = "swallowed",
  regionId = "india",
  exposureAt,
  nowAt,
} = {}) {
  if (answers === null || typeof answers !== "object") {
    return { error: "Answers must be supplied as an object of field values." };
  }
  const minutesSince = minutesBetween(exposureAt, nowAt);
  if (minutesSince === null) {
    return { error: "Enter both the time of exposure and the current time as a date and a time." };
  }
  if (minutesSince < 0) {
    return { error: "The time of exposure is in the future — check the two times." };
  }

  const region = getRegion(regionId);
  const route = getRoute(routeId);

  const flags = RED_FLAGS.filter((flag) => redFlags.includes(flag.id));
  const urgent = flags.length > 0;

  const filled = FIELDS.filter(
    (field) => typeof answers[field.id] === "string" && answers[field.id].trim().length > 0,
  );
  const requiredFields = FIELDS.filter((field) => field.required);
  const missingRequired = requiredFields.filter(
    (field) => !(typeof answers[field.id] === "string" && answers[field.id].trim().length > 0),
  );
  const completeness = Math.round((filled.length / FIELDS.length) * 100);
  const requiredCompleteness = Math.round(
    ((requiredFields.length - missingRequired.length) / requiredFields.length) * 100,
  );

  const hours = Math.floor(minutesSince / 60);
  const mins = minutesSince % 60;
  const sinceLabel =
    minutesSince < 60 ? `${minutesSince} minutes ago` : `${hours} h ${mins} min ago`;

  const scriptLines = [];
  scriptLines.push(
    urgent
      ? `EMERGENCY — call ${region.emergency} now. Poisoning with red-flag signs.`
      : `Poisoning enquiry — ${region.poisonLine}`,
  );
  scriptLines.push("");
  scriptLines.push(`Route: ${route.label.toLowerCase()}`);
  scriptLines.push(`Time of exposure: ${exposureAt.replace("T", " ")} (${sinceLabel})`);
  if (urgent) {
    scriptLines.push(`Red flags: ${flags.map((flag) => flag.label.toLowerCase()).join("; ")}`);
  }
  for (const group of FIELD_GROUPS) {
    const groupFields = FIELDS.filter((field) => field.group === group);
    const values = groupFields
      .filter((field) => typeof answers[field.id] === "string" && answers[field.id].trim())
      .map((field) => `  ${field.label}: ${answers[field.id].trim()}`);
    if (values.length > 0) {
      scriptLines.push("", `${group}:`, ...values);
    }
  }
  if (missingRequired.length > 0) {
    scriptLines.push(
      "",
      "Still needed:",
      ...missingRequired.map((field) => `  - ${field.label}`),
    );
  }
  scriptLines.push("", "First aid for this route:", ...route.firstAid.map((item) => `  - ${item}`));

  return {
    urgent,
    urgentFlags: flags.map((flag) => flag.label),
    regionLabel: region.label,
    emergencyNumber: region.emergency,
    poisonLine: region.poisonLine,
    routeLabel: route.label,
    firstAid: route.firstAid,
    doNots: DO_NOTS,
    minutesSince,
    sinceLabel,
    filledCount: filled.length,
    totalFields: FIELDS.length,
    completeness,
    requiredCompleteness,
    missingRequired: missingRequired.map((field) => field.label),
    readyToCall: missingRequired.length === 0,
    script: scriptLines.join("\n"),
  };
}
