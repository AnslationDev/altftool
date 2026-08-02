/**
 * VFS Global application centre appointment-day checklist.
 *
 * VFS Global runs visa application centres (VACs) on behalf of client
 * governments. The centre does not decide the visa; it checks that the file is
 * complete, captures biometrics and forwards the passport to the mission. That
 * means everything on this list is about getting *through the door* and out
 * again with a usable submission, not about whether the visa is granted.
 *
 * Rules encoded here are the ones VFS Global states consistently across its
 * centre pages and the client governments' own biometric rules. Centre-specific
 * variations exist, so each item carries the reason it is on the list and the
 * output tells the user to confirm against their own centre page.
 *
 * Pure module: no React, no DOM, no clock reads. All times are passed in.
 */

/** VFS Global appointment guidance across its centre pages: reach the centre
 * about 15 minutes before the slot. Arriving much earlier is usually refused
 * because the waiting hall is sized to the booked slots. */
export const ARRIVE_BEFORE_MINUTES = 15;

/** Default contingency the planner adds on top of travel time. Not a VFS rule —
 * an editable allowance for traffic, parking and the security queue. */
export const DEFAULT_CONTINGENCY_MINUTES = 30;

/** Minutes in a day, used for wrapping the leave-home clock. */
const MINUTES_PER_DAY = 24 * 60;

/**
 * Visa schemes whose centres VFS Global operates, with the scheme-specific
 * paperwork and biometric age rules.
 *
 * fingerprintMinAge / fingerprintMaxAge are the client government's own rules:
 *  - Schengen: fingerprints are not collected from children under 12
 *    (EU Visa Code, Regulation 810/2009, Article 13(7)(b)).
 *  - UK: fingerprints are not taken from children under 5; a facial image is
 *    still captured (UKVI biometric enrolment policy).
 *  - Canada: biometrics are required from applicants aged 14 to 79 inclusive
 *    (IRCC biometrics requirement).
 *  - Australia: a facial image is captured for all ages; fingerprints are
 *    collected from applicants aged 5 and over.
 */
export const SCHEMES = {
  schengen: {
    key: "schengen",
    label: "Schengen visa (any EU/EEA member state)",
    referenceDoc: "Printed VFS appointment confirmation with the reference number",
    fingerprintMinAge: 12,
    fingerprintMaxAge: null,
    photoSpec: "35 × 45 mm, taken within the last 6 months, plain light background",
    insuranceRequired: true,
  },
  uk: {
    key: "uk",
    label: "United Kingdom visa (UKVI)",
    referenceDoc: "UKVI appointment confirmation showing your GWF or UAN reference",
    fingerprintMinAge: 5,
    fingerprintMaxAge: null,
    photoSpec: "Captured at the centre — no printed photo needed for most UK routes",
    insuranceRequired: false,
  },
  canada: {
    key: "canada",
    label: "Canada visa / permit (IRCC)",
    referenceDoc: "Biometric Instruction Letter (BIL) issued by IRCC",
    fingerprintMinAge: 14,
    fingerprintMaxAge: 79,
    photoSpec: "35 × 45 mm where a printed photo is asked for; usually captured at the centre",
    insuranceRequired: false,
  },
  australia: {
    key: "australia",
    label: "Australia visa (Australian BCC)",
    referenceDoc: "Biometrics collection letter quoting your TRN",
    fingerprintMinAge: 5,
    fingerprintMaxAge: null,
    photoSpec: "Captured at the centre",
    insuranceRequired: false,
  },
  other: {
    key: "other",
    label: "Another country's VFS centre",
    referenceDoc: "Printed appointment confirmation from the centre's booking system",
    fingerprintMinAge: 0,
    fingerprintMaxAge: null,
    photoSpec: "Check the centre's photo specification before you print anything",
    insuranceRequired: false,
  },
};

export const SCHEME_KEYS = ["schengen", "uk", "canada", "australia", "other"];

/** Age of majority used for the accompanying-adult and consent rules. */
export const ADULT_AGE = 18;

/**
 * The checklist catalogue.
 *
 * group  — "carry" | "wear" | "leave"
 * critical — true when getting this wrong normally ends the appointment
 * when(context) — pure predicate; omitted means "always applies"
 */
const ITEMS = [
  // ---------------------------------------------------------------- carry
  {
    id: "appointment-letter",
    group: "carry",
    critical: true,
    label: "Printed appointment confirmation",
    detail:
      "Security checks this at the door before you reach the counter. A screenshot on a phone is not reliably accepted, and phones are often not allowed inside.",
  },
  {
    id: "scheme-reference",
    group: "carry",
    critical: true,
    label: (context) => SCHEMES[context.scheme].referenceDoc,
    detail:
      "The centre cannot open your file without the reference the client government issued. Print it rather than quoting it from memory.",
    when: (context) => context.scheme !== "other",
  },
  {
    id: "passport",
    group: "carry",
    critical: true,
    label: "Original passport plus every older passport you still hold",
    detail:
      "Previous passports evidence your travel history. Check the passport is signed and has at least two facing blank pages.",
  },
  {
    id: "passport-copies",
    group: "carry",
    critical: true,
    label: "Photocopies of the passport bio page and all previous visas",
    detail:
      "Centres will not photocopy for free at the counter, and the queue for the on-site copy desk can be longer than the appointment slot.",
  },
  {
    id: "application-form",
    group: "carry",
    critical: true,
    label: "Application form, printed and signed in ink",
    detail:
      "An unsigned form is the single most common reason a submission is bounced back at the counter.",
  },
  {
    id: "photographs",
    group: "carry",
    critical: false,
    label: (context) => `Passport photographs — ${SCHEMES[context.scheme].photoSpec}`,
    detail:
      "Even where the centre captures your photo, a spare printed set costs nothing to carry and saves a second visit if the capture fails.",
  },
  {
    id: "supporting-docs",
    group: "carry",
    critical: true,
    label: "Supporting documents in the order of the official checklist, unstapled",
    detail:
      "Staples and plastic sleeves have to be removed before scanning. Ordering the file yourself is faster than having the counter clerk do it.",
  },
  {
    id: "insurance",
    group: "carry",
    critical: true,
    label: "Travel medical insurance certificate covering at least €30,000",
    detail:
      "Article 15 of the EU Visa Code requires cover of at least €30,000 valid across the Schengen area for the whole stay, including repatriation and emergency medical treatment.",
    when: (context) => SCHEMES[context.scheme].insuranceRequired,
  },
  {
    id: "fee-payment",
    group: "carry",
    critical: true,
    label: "Means to pay the visa fee and VFS service fee",
    detail:
      "Fee policy varies by centre — some take card only, some cash only. Carry both, and carry the exact amount if you are paying cash.",
  },
  {
    id: "cash-exact",
    group: "carry",
    critical: false,
    label: "Exact change for the fee — counters often cannot give change",
    detail: "Cash counters at busy centres routinely run out of small notes by mid-morning.",
    when: (context) => context.payingByCash,
  },
  {
    id: "photo-id",
    group: "carry",
    critical: false,
    label: "A government photo ID for the visitor log",
    detail:
      "Many centres record an ID at security separately from the passport you are submitting.",
  },
  {
    id: "minor-consent",
    group: "carry",
    critical: true,
    label: "Birth certificate and both parents' signed consent, with their ID copies",
    detail:
      "An applicant under 18 cannot submit alone. Consent must be signed by everyone holding parental responsibility, with copies of their identity documents attached.",
    when: (context) => context.age < ADULT_AGE,
  },
  {
    id: "accompanying-adult",
    group: "carry",
    critical: true,
    label: "The accompanying parent or legal guardian, in person",
    detail:
      "Centres admit one adult with a minor applicant. Bring the guardian named in the consent, not a relative standing in.",
    when: (context) => context.age < ADULT_AGE,
  },
  {
    id: "courier-form",
    group: "carry",
    critical: false,
    label: "Completed courier / passport-return form with a deliverable address",
    detail:
      "The return address has to be filled in on the day. A tower and flat number missing here means a failed delivery attempt later.",
    when: (context) => context.courierReturn,
  },
  {
    id: "black-pen",
    group: "carry",
    critical: false,
    label: "A black ballpoint pen",
    detail: "Declarations, courier slips and corrections all get signed at the counter.",
  },
  {
    id: "printed-itinerary",
    group: "carry",
    critical: false,
    label: "Printed flight and hotel reservations, and any invitation letter",
    detail:
      "Reservations held only in an email inbox are unreachable once your phone is in the locker.",
  },

  // ----------------------------------------------------------------- wear
  {
    id: "avoid-white",
    group: "wear",
    critical: false,
    label: "Wear a dark or mid-tone top — not white",
    detail:
      "Biometric photos are captured against a plain white or off-white background, and a white shirt merges into it.",
  },
  {
    id: "no-glasses",
    group: "wear",
    critical: false,
    label: "Be ready to take your glasses off for the photo",
    detail:
      "Both eyes must be visible with no glare or frame across the pupils, so glasses are removed for the capture.",
  },
  {
    id: "head-covering",
    group: "wear",
    critical: false,
    label: "Head coverings only for religious reasons, worn clear of the face",
    detail:
      "The face has to be visible from the bottom of the chin to the top of the forehead, and from ear to ear.",
  },
  {
    id: "no-uniform",
    group: "wear",
    critical: false,
    label: "No uniform, no hat, no sunglasses",
    detail: "Uniforms and headwear are rejected in visa photographs across every scheme.",
  },
  {
    id: "clean-fingertips",
    group: "wear",
    critical: true,
    label: "Fingertips clean, dry and unmarked — no fresh mehndi or henna",
    detail:
      "The scanner reads ridge patterns. Henna, dye, deep cuts and peeling skin all cause failed captures and repeat appointments. Allow henna to fade before the appointment.",
    when: (context) => context.biometricsRequired,
  },
  {
    id: "no-hand-cream",
    group: "wear",
    critical: false,
    label: "Skip hand cream and sanitiser just before your slot",
    detail:
      "A film of moisturiser blurs the ridges; very dry hands scan badly too, so moisturise the night before instead.",
    when: (context) => context.biometricsRequired,
  },
  {
    id: "trim-nails",
    group: "wear",
    critical: false,
    label: "Trim long or artificial nails on the scanning hand",
    detail:
      "Long nails stop the finger pad from lying flat on the platen, which the scanner reads as a partial print.",
    when: (context) => context.biometricsRequired,
  },
  {
    id: "dress-for-wait",
    group: "wear",
    critical: false,
    label: "Dress for a long, air-conditioned wait",
    detail:
      "Slots run late when the queue backs up, and seating in the waiting hall is limited.",
  },

  // ---------------------------------------------------------------- leave
  {
    id: "no-bags",
    group: "leave",
    critical: true,
    label: "Backpacks, handbags and luggage",
    detail:
      "Most centres have no cloakroom, or a small paid locker that fills early. Carry documents in a slim file folder instead.",
  },
  {
    id: "no-electronics",
    group: "leave",
    critical: true,
    label: "Laptops, tablets, cameras, power banks, USB drives and headphones",
    detail:
      "Electronic items other than a phone are refused at security, and there is usually nowhere to store them.",
  },
  {
    id: "phone-off",
    group: "leave",
    critical: false,
    label: "Treat your phone as if it may be refused — switch it off at the door",
    detail:
      "Some centres allow a switched-off phone, others take it at security. Never keep your only copy of a document on it.",
  },
  {
    id: "no-sealed",
    group: "leave",
    critical: false,
    label: "Sealed envelopes and wrapped packages",
    detail:
      "Anything sealed has to be opened at security, so bring documents loose in a file.",
  },
  {
    id: "no-sharp",
    group: "leave",
    critical: false,
    label: "Scissors, nail cutters, penknives and any sharp object",
    detail: "Confiscated at the security check and not always returned.",
  },
  {
    id: "no-flammable",
    group: "leave",
    critical: false,
    label: "Lighters, matches, aerosols and large perfume bottles",
    detail: "Inflammable items are on every centre's prohibited list.",
  },
  {
    id: "no-food",
    group: "leave",
    critical: false,
    label: "Food and drink",
    detail: "Eat before you go; there is rarely anywhere to eat inside.",
  },
  {
    id: "no-companions",
    group: "leave",
    critical: true,
    label: "Friends and family who are not applying",
    detail:
      "Only applicants are admitted. The exception is one adult accompanying a minor, an elderly applicant or someone needing assistance.",
    when: (context) => context.age >= ADULT_AGE,
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Decide whether the applicant's fingerprints will actually be taken,
 * given the scheme's age rules.
 *
 * @param {string} scheme
 * @param {number} age
 * @returns {{ fingerprints: boolean, reason: string }}
 */
export function fingerprintStatus(scheme, age) {
  const meta = SCHEMES[scheme];
  if (!meta || !isNum(age)) return { fingerprints: false, reason: "" };
  if (age < meta.fingerprintMinAge) {
    return {
      fingerprints: false,
      reason: `Under ${meta.fingerprintMinAge}, so fingerprints are not collected — a facial image usually still is.`,
    };
  }
  if (meta.fingerprintMaxAge !== null && age > meta.fingerprintMaxAge) {
    return {
      fingerprints: false,
      reason: `Over ${meta.fingerprintMaxAge}, so this scheme exempts you from biometrics.`,
    };
  }
  return { fingerprints: true, reason: "Fingerprints will be scanned at the counter." };
}

/**
 * Build the appointment-day checklist for one applicant.
 *
 * @param {{ scheme: string, age: number, biometricsRequired?: boolean,
 *           payingByCash?: boolean, courierReturn?: boolean }} input
 * @returns {object} grouped checklist, or { error } for unusable input
 */
export function buildChecklist(input) {
  const scheme = input?.scheme;
  if (!SCHEMES[scheme]) return { error: "Choose which country's VFS centre you are visiting." };

  const rawAge = input?.age;
  const trimmedAge = typeof rawAge === "string" ? rawAge.trim() : rawAge;
  if (trimmedAge === "" || trimmedAge === null || trimmedAge === undefined) {
    return { error: "Enter the applicant's age in whole years." };
  }
  const age = Number(trimmedAge);
  if (!isNum(age)) return { error: "Enter the applicant's age in whole years." };
  if (age < 0) return { error: "Age cannot be negative." };
  if (age > 120) return { error: "Enter an age of 120 or under." };

  const wantsBiometrics = input?.biometricsRequired !== false;
  const prints = fingerprintStatus(scheme, age);

  const context = {
    scheme,
    age,
    // Fingertip-preparation items only matter if prints are genuinely being taken.
    biometricsRequired: wantsBiometrics && prints.fingerprints,
    payingByCash: Boolean(input?.payingByCash),
    courierReturn: Boolean(input?.courierReturn),
  };

  const groups = { carry: [], wear: [], leave: [] };
  for (const item of ITEMS) {
    if (typeof item.when === "function" && !item.when(context)) continue;
    groups[item.group].push({
      id: item.id,
      group: item.group,
      critical: item.critical,
      label: typeof item.label === "function" ? item.label(context) : item.label,
      detail: item.detail,
    });
  }

  const all = [...groups.carry, ...groups.wear, ...groups.leave];

  return {
    scheme,
    schemeLabel: SCHEMES[scheme].label,
    age,
    isMinor: age < ADULT_AGE,
    fingerprints: prints,
    groups,
    all,
    total: all.length,
    criticalTotal: all.filter((item) => item.critical).length,
  };
}

/**
 * Readiness score for the items the user has ticked.
 *
 * @param {Array<{id:string, critical:boolean}>} items
 * @param {Set<string>|Array<string>} checked
 * @returns {{ total:number, done:number, percent:number, criticalTotal:number,
 *             criticalDone:number, criticalMissing:number, ready:boolean }}
 */
export function computeReadiness(items, checked) {
  const list = Array.isArray(items) ? items : [];
  const ticked = checked instanceof Set ? checked : new Set(checked || []);
  const total = list.length;
  const done = list.filter((item) => ticked.has(item.id)).length;
  const criticals = list.filter((item) => item.critical);
  const criticalDone = criticals.filter((item) => ticked.has(item.id)).length;
  return {
    total,
    done,
    percent: total > 0 ? (done / total) * 100 : 0,
    criticalTotal: criticals.length,
    criticalDone,
    criticalMissing: criticals.length - criticalDone,
    ready: total > 0 && criticalDone === criticals.length,
  };
}

/** "HH:MM" -> minutes after midnight, or null when unparseable. */
export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutes after midnight -> "HH:MM", wrapping into the 24-hour clock. */
export function formatClock(totalMinutes) {
  if (!isNum(totalMinutes)) return "";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Work backwards from the appointment slot to a leave-home time.
 *
 * arriveBy    = appointment - ARRIVE_BEFORE_MINUTES
 * leaveHomeBy = arriveBy - travel - contingency
 *
 * @param {{ appointmentTime: string, travelMinutes: number, contingencyMinutes?: number }} input
 * @returns {object} timings, or { error }
 */
export function computeTiming({ appointmentTime, travelMinutes, contingencyMinutes }) {
  const appointment = parseClock(appointmentTime);
  if (appointment === null) return { error: "Enter the appointment time as HH:MM, e.g. 10:30." };

  const travel = Number(travelMinutes);
  if (!isNum(travel)) return { error: "Enter your travel time in minutes." };
  if (travel < 0) return { error: "Travel time cannot be negative." };
  if (travel >= MINUTES_PER_DAY) return { error: "Enter a travel time under 24 hours." };

  const contingency =
    contingencyMinutes === undefined || contingencyMinutes === null
      ? DEFAULT_CONTINGENCY_MINUTES
      : Number(contingencyMinutes);
  if (!isNum(contingency) || contingency < 0) {
    return { error: "Contingency buffer must be zero or more minutes." };
  }

  const arriveByMinutes = appointment - ARRIVE_BEFORE_MINUTES;
  const leaveHomeMinutes = arriveByMinutes - travel - contingency;

  return {
    appointment: formatClock(appointment),
    arriveBy: formatClock(arriveByMinutes),
    leaveHomeBy: formatClock(leaveHomeMinutes),
    // Negative means the plan reaches back past midnight into the previous day.
    arriveByPreviousDay: arriveByMinutes < 0,
    previousDay: leaveHomeMinutes < 0,
    totalLeadMinutes: ARRIVE_BEFORE_MINUTES + travel + contingency,
  };
}
