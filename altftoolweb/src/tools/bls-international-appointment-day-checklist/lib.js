/**
 * BLS International application centre appointment-day checklist.
 *
 * BLS International Services is a visa, passport and consular outsourcing
 * operator. Like other outsourced centres it does not decide the application —
 * it verifies that the file is complete against a published checklist, takes
 * the fee, captures biometrics where the client government requires them, and
 * forwards the passport to the mission.
 *
 * Two things distinguish a BLS visit from other centres and are modelled here:
 *  1. BLS document checklists are photocopy-heavy — most schemes want the
 *     original plus at least one self-attested copy of every sheet, and copying
 *     at the centre is chargeable and slow. Hence the photocopy planner.
 *  2. Consular work (passport re-issue, OCI, renunciation) has no live
 *     biometric capture at the counter, so the fingertip-preparation rules that
 *     matter for a Schengen visa simply do not apply.
 *
 * Pure module: no React, no DOM, no clock reads. All times are passed in.
 */

/** BLS centre guidance across its appointment pages: reach the centre about
 * 15 minutes before the slot. Waiting halls are sized to booked slots, so
 * arriving far earlier normally means queuing outside. */
export const ARRIVE_BEFORE_MINUTES = 15;

/** Editable allowance for traffic, parking and the security queue. Not a BLS
 * rule — a planning default. */
export const DEFAULT_CONTINGENCY_MINUTES = 30;

/** BLS checklists normally ask for the original plus one copy of each sheet. */
export const DEFAULT_COPIES_PER_DOCUMENT = 1;

/** Passport pages a centre typically wants copied: the bio/data page, and for
 * Indian passports the last page carrying the address. */
export const DEFAULT_PASSPORT_PAGES = 2;

/** Sheets a duplex print produces from a given page count: two sides per sheet. */
export const SIDES_PER_SHEET = 2;

const MINUTES_PER_DAY = 24 * 60;

/**
 * Schemes handled at BLS International centres.
 *
 * fingerprintMinAge follows the client government's own rule:
 *  - Schengen visas: fingerprints are not collected from children under 12
 *    (EU Visa Code, Regulation 810/2009, Article 13(7)(b)). The set is reused
 *    for 59 months, so a recent Schengen application may mean none are taken.
 *  - Indian consular services: no live biometric capture at the counter; the
 *    photograph and signature are supplied with the application instead.
 */
export const SCHEMES = {
  spain: {
    key: "spain",
    label: "Spain Schengen visa (BLS Spain centre)",
    biometrics: true,
    fingerprintMinAge: 12,
    insuranceRequired: true,
    referenceDoc: "Printed BLS appointment confirmation showing the barcode and reference number",
    photoSpec: "35 × 45 mm, white background, taken within the last 6 months",
    selfAttest: true,
  },
  portugal: {
    key: "portugal",
    label: "Portugal Schengen visa (BLS centre)",
    biometrics: true,
    fingerprintMinAge: 12,
    insuranceRequired: true,
    referenceDoc: "Printed BLS appointment confirmation showing the barcode and reference number",
    photoSpec: "35 × 45 mm, white background, taken within the last 6 months",
    selfAttest: true,
  },
  schengenOther: {
    key: "schengenOther",
    label: "Another Schengen member state at a BLS centre",
    biometrics: true,
    fingerprintMinAge: 12,
    insuranceRequired: true,
    referenceDoc: "Printed BLS appointment confirmation showing the barcode and reference number",
    photoSpec: "35 × 45 mm, light plain background, taken within the last 6 months",
    selfAttest: true,
  },
  indiaConsular: {
    key: "indiaConsular",
    label: "Indian passport, OCI or consular service (BLS centre)",
    biometrics: false,
    fingerprintMinAge: null,
    insuranceRequired: false,
    referenceDoc:
      "Printed online application form with its web reference number, plus the appointment confirmation",
    photoSpec: "Follow the size on the centre's own checklist — it differs by country and service",
    selfAttest: true,
  },
  other: {
    key: "other",
    label: "Another BLS International centre",
    biometrics: true,
    fingerprintMinAge: 0,
    insuranceRequired: false,
    referenceDoc: "Printed appointment confirmation from the centre's booking system",
    photoSpec: "Check the centre's photo specification before printing anything",
    selfAttest: false,
  },
};

export const SCHEME_KEYS = ["spain", "portugal", "schengenOther", "indiaConsular", "other"];

/** Age of majority used for the consent and accompanying-adult rules. */
export const ADULT_AGE = 18;

/**
 * Checklist catalogue.
 * group    — "carry" | "wear" | "leave"
 * critical — true when getting this wrong normally ends the visit
 * when     — pure predicate over the derived context; absent means "always"
 */
const ITEMS = [
  // ---------------------------------------------------------------- carry
  {
    id: "appointment-printout",
    group: "carry",
    critical: true,
    label: (context) => SCHEMES[context.scheme].referenceDoc,
    detail:
      "Security scans the barcode at the entrance. Print it — phones are frequently held at the door, and a dead battery is not an accepted excuse.",
  },
  {
    id: "checklist-page",
    group: "carry",
    critical: true,
    label: "The centre's own printed document checklist, ticked and signed",
    detail:
      "BLS counters verify against the published checklist line by line. Bringing it ticked in your own hand turns a rejection into a conversation about one missing sheet.",
  },
  {
    id: "passport-original",
    group: "carry",
    critical: true,
    label: "Original passport, signed, with at least two facing blank pages",
    detail:
      "An unsigned passport is refused at the counter. Bring older passports too — they evidence your travel history.",
  },
  {
    id: "copy-set",
    group: "carry",
    critical: true,
    label: "One self-attested photocopy of every document, including passport pages",
    detail:
      "Copying at the centre is chargeable and the copy desk queue often runs longer than the appointment slot itself. Self-attest means sign each copy yourself.",
    when: (context) => SCHEMES[context.scheme].selfAttest,
  },
  {
    id: "application-form",
    group: "carry",
    critical: true,
    label: "Application form, printed single-sided and signed in ink",
    detail:
      "Unsigned or double-sided forms are the most common bounce-back. Signatures must stay inside the box — a signature crossing the border fails the scan.",
  },
  {
    id: "photographs",
    group: "carry",
    critical: false,
    label: (context) => `Recent photographs — ${SCHEMES[context.scheme].photoSpec}`,
    detail:
      "Carry a spare pair even if the centre offers photo capture; a rejected photo with no backup means rebooking.",
  },
  {
    id: "insurance",
    group: "carry",
    critical: true,
    label: "Travel medical insurance covering at least €30,000 across the Schengen area",
    detail:
      "Article 15 of the EU Visa Code sets the €30,000 minimum, covering emergency medical treatment and repatriation for the whole intended stay.",
    when: (context) => SCHEMES[context.scheme].insuranceRequired,
  },
  {
    id: "prev-indian-passport",
    group: "carry",
    critical: true,
    label: "Previous Indian passport, or the renunciation / surrender certificate",
    detail:
      "Indian consular services will not process a passport re-issue or an OCI application without proof of what happened to the earlier Indian passport.",
    when: (context) => context.scheme === "indiaConsular",
  },
  {
    id: "consular-fee-instrument",
    group: "carry",
    critical: true,
    label: "Fee paid exactly as the centre's fee page specifies — personal cheques are not accepted",
    detail:
      "Consular centres typically take a money order or cashier's cheque made out to a specific payee name. A wrong payee or a personal cheque means the file is not accepted.",
    when: (context) => context.scheme === "indiaConsular",
  },
  {
    id: "fee-payment",
    group: "carry",
    critical: true,
    label: "The visa fee and the BLS service fee, in the form that centre accepts",
    detail:
      "Payment policy is set centre by centre — some take card only, others cash only. Carry both, and carry exact change if you may be paying cash.",
    when: (context) => context.scheme !== "indiaConsular",
  },
  {
    id: "photo-id",
    group: "carry",
    critical: false,
    label: "A separate government photo ID for the visitor log",
    detail: "Security logs an ID at the door, distinct from the passport you are submitting.",
  },
  {
    id: "minor-consent",
    group: "carry",
    critical: true,
    label: "Birth certificate plus both parents' signed consent and ID copies",
    detail:
      "An applicant under 18 cannot submit alone. Consent has to be signed by everyone with parental responsibility, with their identity documents attached.",
    when: (context) => context.age < ADULT_AGE,
  },
  {
    id: "guardian-present",
    group: "carry",
    critical: true,
    label: "The parent or legal guardian named in the consent, in person",
    detail: "Centres admit one adult with a minor applicant, and it has to be the named guardian.",
    when: (context) => context.age < ADULT_AGE,
  },
  {
    id: "return-envelope",
    group: "carry",
    critical: false,
    label: "Completed courier form or pre-paid return envelope with a deliverable address",
    detail:
      "Fill in the flat, floor and tower on the day. An incomplete address is the usual cause of a failed passport delivery weeks later.",
    when: (context) => context.courierReturn,
  },
  {
    id: "premium-receipt",
    group: "carry",
    critical: false,
    label: "Proof of the premium lounge or add-on service you paid for",
    detail:
      "Optional services are billed separately and are only honoured if the receipt or booking reference is presented at the counter.",
    when: (context) => context.premiumService,
  },
  {
    id: "pen-and-folder",
    group: "carry",
    critical: false,
    label: "A black pen and a slim document folder",
    detail:
      "Declarations and courier slips get signed on the day, and a folder is the only bag-shaped thing you will get past security.",
  },

  // ----------------------------------------------------------------- wear
  {
    id: "avoid-white",
    group: "wear",
    critical: false,
    label: "Wear a dark or mid-tone top rather than white",
    detail:
      "Photo capture uses a plain white or off-white backdrop, and a white shirt blends into it.",
    when: (context) => context.livePhoto,
  },
  {
    id: "glasses-off",
    group: "wear",
    critical: false,
    label: "Expect to remove glasses for the photograph",
    detail: "Both eyes must be visible with no frame or glare across the pupils.",
    when: (context) => context.livePhoto,
  },
  {
    id: "face-visible",
    group: "wear",
    critical: false,
    label: "Head coverings only for religious reasons, and clear of the face",
    detail:
      "The face has to be visible from the bottom of the chin to the top of the forehead and from ear to ear. No hats, no sunglasses, no uniform.",
    when: (context) => context.livePhoto,
  },
  {
    id: "fingertips-ready",
    group: "wear",
    critical: true,
    label: "Fingertips clean, dry and unmarked — let fresh henna fade first",
    detail:
      "Ten-print scanners read the ridge pattern. Henna, dye, deep cuts and peeling skin cause failed captures and a repeat appointment.",
    when: (context) => context.fingerprints,
  },
  {
    id: "no-lotion",
    group: "wear",
    critical: false,
    label: "No hand cream or sanitiser in the hour before your slot",
    detail:
      "A film of lotion smears the ridges. Very dry hands scan badly too, so moisturise the night before instead.",
    when: (context) => context.fingerprints,
  },
  {
    id: "short-nails",
    group: "wear",
    critical: false,
    label: "Trim long or artificial nails before you go",
    detail:
      "Long nails stop the finger pad lying flat on the platen, which reads as a partial print.",
    when: (context) => context.fingerprints,
  },
  {
    id: "dress-for-queue",
    group: "wear",
    critical: false,
    label: "Dress for standing and for air conditioning",
    detail:
      "Slots run late once the morning queue backs up, and seating is limited to the hall's capacity.",
  },

  // ---------------------------------------------------------------- leave
  {
    id: "no-bags",
    group: "leave",
    critical: true,
    label: "Backpacks, handbags, trolleys and any luggage",
    detail:
      "Most centres have no cloakroom, or a small paid locker that fills within the first hour. Carry a folder instead.",
  },
  {
    id: "no-devices",
    group: "leave",
    critical: true,
    label: "Laptops, tablets, cameras, power banks, USB drives and headphones",
    detail:
      "Electronics beyond a phone are refused at security and there is usually nowhere to store them.",
  },
  {
    id: "phone-risk",
    group: "leave",
    critical: false,
    label: "Assume your phone may be taken at the door — switch it off",
    detail:
      "Rules differ centre to centre. Never let your only copy of a document live on the phone.",
  },
  {
    id: "no-sealed",
    group: "leave",
    critical: false,
    label: "Sealed envelopes, wrapped parcels and stapled bundles",
    detail:
      "Sealed items have to be opened at security, and staples must be removed before scanning. Bring everything loose.",
  },
  {
    id: "no-sharp",
    group: "leave",
    critical: false,
    label: "Scissors, staplers, nail cutters and penknives",
    detail: "Confiscated at security and not reliably returned.",
  },
  {
    id: "no-flammable",
    group: "leave",
    critical: false,
    label: "Lighters, matches, aerosols and large perfume bottles",
    detail: "Inflammable items appear on every centre's prohibited list.",
  },
  {
    id: "no-food",
    group: "leave",
    critical: false,
    label: "Food and drink",
    detail: "There is rarely anywhere to eat inside, and no re-entry once you leave the queue.",
  },
  {
    id: "no-extra-people",
    group: "leave",
    critical: true,
    label: "Anyone who is not applying",
    detail:
      "Only applicants are admitted. The usual exception is one adult with a minor, an elderly applicant or someone needing assistance.",
    when: (context) => context.age >= ADULT_AGE,
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Whether fingerprints will actually be captured for this scheme and age.
 *
 * @param {string} scheme
 * @param {number} age
 * @returns {{ fingerprints: boolean, reason: string }}
 */
export function fingerprintStatus(scheme, age) {
  const meta = SCHEMES[scheme];
  if (!meta || !isNum(age)) return { fingerprints: false, reason: "" };
  if (!meta.biometrics || meta.fingerprintMinAge === null) {
    return {
      fingerprints: false,
      reason:
        "This service has no live biometric capture at the counter — your photograph and signature travel with the form instead.",
    };
  }
  if (age < meta.fingerprintMinAge) {
    return {
      fingerprints: false,
      reason: `Under ${meta.fingerprintMinAge}, so fingerprints are not collected. A facial image is usually still captured.`,
    };
  }
  return {
    fingerprints: true,
    reason:
      "Ten fingerprints will be scanned at the counter, so the fingertip rules below matter.",
  };
}

/**
 * Build the appointment-day checklist.
 *
 * @param {{ scheme:string, age:number, biometricsBooked?:boolean,
 *           courierReturn?:boolean, premiumService?:boolean }} input
 * @returns {object} grouped checklist, or { error }
 */
export function buildChecklist(input) {
  const scheme = input?.scheme;
  if (!SCHEMES[scheme]) return { error: "Choose which BLS service you are attending for." };

  const age = Number(input?.age);
  if (!isNum(age)) return { error: "Enter the applicant's age in whole years." };
  if (age < 0) return { error: "Age cannot be negative." };
  if (age > 120) return { error: "Enter an age of 120 or under." };

  const meta = SCHEMES[scheme];
  const booked = input?.biometricsBooked !== false;
  const prints = fingerprintStatus(scheme, age);
  // The checklist items below are gated on `booked`, so the summary stat and
  // its explanation must reflect the same booked-adjusted verdict rather than
  // the raw scheme/age fingerprint rule.
  const bookedPrints = booked
    ? prints
    : {
        fingerprints: false,
        reason:
          "Biometrics booked is unchecked for this visit, so no fingerprints will be captured today — the fingertip rules below do not apply.",
      };

  const context = {
    scheme,
    age,
    fingerprints: booked && prints.fingerprints,
    // A facial image is captured whenever the scheme is a biometric one, even
    // for applicants too young to be fingerprinted.
    livePhoto: booked && meta.biometrics,
    courierReturn: Boolean(input?.courierReturn),
    premiumService: Boolean(input?.premiumService),
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
    schemeLabel: meta.label,
    age,
    isMinor: age < ADULT_AGE,
    fingerprints: bookedPrints,
    groups,
    all,
    total: all.length,
    criticalTotal: all.filter((item) => item.critical).length,
  };
}

/**
 * Readiness score over the ticked items.
 *
 * @param {Array<{id:string, critical:boolean}>} items
 * @param {Set<string>|Array<string>} checked
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

/**
 * Photocopy planner.
 *
 * pages  = supportingDocuments * copies + passports * passportPages * copies
 * sheets = ceil(pages / 2) when printed double-sided
 *
 * @param {{ supportingDocuments:number, copiesPerDocument?:number,
 *           passportsToCopy?:number, passportPages?:number }} input
 * @returns {object} page counts, or { error }
 */
export function computeCopySet(input) {
  const documents = Number(input?.supportingDocuments);
  if (!isNum(documents)) return { error: "Enter how many document pages your checklist asks for." };
  if (documents < 0) return { error: "The number of document pages cannot be negative." };

  const copies =
    input?.copiesPerDocument === undefined || input?.copiesPerDocument === null
      ? DEFAULT_COPIES_PER_DOCUMENT
      : Number(input.copiesPerDocument);
  if (!isNum(copies) || copies < 0) return { error: "Copies per document must be zero or more." };

  const passports =
    input?.passportsToCopy === undefined || input?.passportsToCopy === null
      ? 1
      : Number(input.passportsToCopy);
  if (!isNum(passports) || passports < 0) return { error: "Number of passports cannot be negative." };

  const passportPages =
    input?.passportPages === undefined || input?.passportPages === null
      ? DEFAULT_PASSPORT_PAGES
      : Number(input.passportPages);
  if (!isNum(passportPages) || passportPages < 0) {
    return { error: "Passport pages to copy cannot be negative." };
  }

  const documentCopies = documents * copies;
  const passportCopies = passports * passportPages * copies;
  const totalCopies = documentCopies + passportCopies;

  if (totalCopies > 10000) return { error: "That is more than 10,000 pages — check the figures." };

  return {
    documentCopies,
    passportCopies,
    totalCopies,
    duplexSheets: Math.ceil(totalCopies / SIDES_PER_SHEET),
    // Everything you physically hand over: originals plus the copy set.
    pagesToHandOver: documents + passports * passportPages + totalCopies,
  };
}

/** "HH:MM" -> minutes after midnight, or null. */
export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutes after midnight -> "HH:MM" on the 24-hour clock. */
export function formatClock(totalMinutes) {
  if (!isNum(totalMinutes)) return "";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

/**
 * Work back from the slot to a leave-home time.
 *
 * @param {{ appointmentTime:string, travelMinutes:number, contingencyMinutes?:number }} input
 */
export function computeTiming({ appointmentTime, travelMinutes, contingencyMinutes }) {
  const appointment = parseClock(appointmentTime);
  if (appointment === null) return { error: "Enter the appointment time as HH:MM, e.g. 09:45." };

  const travel = Number(travelMinutes);
  if (!isNum(travel)) return { error: "Enter your travel time in minutes." };
  if (travel < 0) return { error: "Travel time cannot be negative." };
  if (travel > MINUTES_PER_DAY) return { error: "Enter a travel time under 24 hours." };

  const contingency =
    contingencyMinutes === undefined || contingencyMinutes === null
      ? DEFAULT_CONTINGENCY_MINUTES
      : Number(contingencyMinutes);
  if (!isNum(contingency) || contingency < 0) {
    return { error: "Contingency buffer must be zero or more minutes." };
  }

  const arriveByMinutes = appointment - ARRIVE_BEFORE_MINUTES;
  const leaveHomeMinutes = arriveByMinutes - travel - contingency;

  // How many calendar days before the appointment date each time falls, not just whether it's
  // "the previous day" - travel + contingency can push leave-home two or more days earlier.
  const arriveByDaysBefore = arriveByMinutes < 0 ? Math.ceil(-arriveByMinutes / MINUTES_PER_DAY) : 0;
  const daysBefore = leaveHomeMinutes < 0 ? Math.ceil(-leaveHomeMinutes / MINUTES_PER_DAY) : 0;

  return {
    appointment: formatClock(appointment),
    arriveBy: formatClock(arriveByMinutes),
    arriveByPreviousDay: arriveByMinutes < 0,
    arriveByDaysBefore,
    leaveHomeBy: formatClock(leaveHomeMinutes),
    previousDay: leaveHomeMinutes < 0,
    daysBefore,
    totalLeadMinutes: ARRIVE_BEFORE_MINUTES + travel + contingency,
  };
}
