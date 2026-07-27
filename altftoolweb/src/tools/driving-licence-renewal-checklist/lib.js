/**
 * Indian driving licence renewal — checklist, fee and new validity.
 *
 * Statutory basis
 *  - Validity of a licence: Motor Vehicles Act, 1988, s.14(2) as amended by the
 *    Motor Vehicles (Amendment) Act, 2019.
 *  - Renewal, grace period and the test of competence: s.15(3) and s.15(4).
 *  - Application form and medical certificate: Central Motor Vehicles Rules,
 *    1989, Rule 18 (Form 9) and Form 1A.
 *  - Fees: CMVR Rule 32 fee table.
 *
 * Dates are "YYYY-MM-DD" strings handled in UTC; the reference date is passed in.
 */

const MS_PER_DAY = 86400000;

/** s.15(3): a renewal applied for within 30 days of expiry runs from the expiry date. */
export const GRACE_DAYS = 30;

/** Proviso to s.15(4): a test of competence may be demanded after this gap. */
export const TEST_AFTER_YEARS = 5;

/** CMVR Rule 18 read with Form 1A — a medical certificate is required from this age. */
export const MEDICAL_CERTIFICATE_AGE = 40;

/** CMVR Rule 32 fee table (amounts in rupees). States add smart-card and service charges. */
export const FEES = {
  renewal: 200,
  lateRenewalBase: 300,
  lateRenewalPerYear: 1000,
  testOfCompetence: 300,
};

/** s.14(2)(a) — transport licences. */
export const TRANSPORT_VALIDITY_YEARS = 3;
export const HAZARDOUS_VALIDITY_YEARS = 1;

export const LICENCE_TYPES = [
  {
    id: "non-transport",
    label: "Private / non-transport (LMV, motorcycle)",
    note: "Validity depends on your age at renewal — s.14(2)(b).",
  },
  {
    id: "transport",
    label: "Transport (goods or passenger)",
    note: `Renewed for ${TRANSPORT_VALIDITY_YEARS} years at a time — s.14(2)(a).`,
  },
  {
    id: "hazardous",
    label: "Transport carrying hazardous goods",
    note: `Renewed for ${HAZARDOUS_VALIDITY_YEARS} year at a time — proviso to s.14(2)(a).`,
  },
];

export function parseDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const probe = new Date(stamp);
  if (probe.getUTCFullYear() !== year) return NaN;
  if (probe.getUTCMonth() !== month - 1) return NaN;
  if (probe.getUTCDate() !== day) return NaN;
  return stamp;
}

export function toIsoDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  return new Date(stamp).toISOString().slice(0, 10);
}

export function daysBetween(from, to) {
  const a = parseDate(from);
  const b = parseDate(to);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  return Math.round((b - a) / MS_PER_DAY);
}

export function addDays(isoDate, days) {
  const stamp = parseDate(isoDate);
  if (!Number.isFinite(stamp) || !Number.isFinite(days)) return "";
  return toIsoDate(stamp + Math.trunc(days) * MS_PER_DAY);
}

/** Add whole years, clamping 29 February to 28 February in a common year. */
export function addYears(isoDate, years) {
  const stamp = parseDate(isoDate);
  if (!Number.isFinite(stamp) || !Number.isFinite(years)) return "";
  const base = new Date(stamp);
  const year = base.getUTCFullYear() + Math.trunc(years);
  const month = base.getUTCMonth();
  const day = base.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return toIsoDate(Date.UTC(year, month, Math.min(day, lastDay)));
}

/** Completed years between two dates — the way age is counted on a birthday. */
export function completedYears(fromIso, toIso) {
  const from = parseDate(fromIso);
  const to = parseDate(toIso);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return NaN;
  if (to < from) return NaN;
  let years = new Date(to).getUTCFullYear() - new Date(from).getUTCFullYear();
  if (parseDate(addYears(fromIso, years)) > to) years -= 1;
  return years;
}

/** Smallest whole number of years n such that fromIso + n years reaches toIso. */
export function yearsOrPartThereof(fromIso, toIso) {
  const gapDays = daysBetween(fromIso, toIso);
  if (!Number.isFinite(gapDays) || gapDays <= 0) return 0;
  let years = 1;
  while (years < 100 && parseDate(addYears(fromIso, years)) < parseDate(toIso)) {
    years += 1;
  }
  return years;
}

/**
 * Validity of a renewed non-transport licence, s.14(2)(b) after the 2019 amendment.
 * Returns the new expiry date given the date the renewal takes effect.
 */
export function nonTransportExpiry(dob, effectiveFrom) {
  const age = completedYears(dob, effectiveFrom);
  if (!Number.isFinite(age)) return { error: "Date of birth must be before the renewal date." };
  if (age < 30) {
    return { expiry: addYears(dob, 40), basis: "valid until you turn 40 — s.14(2)(b)(i)" };
  }
  if (age < 50) {
    return { expiry: addYears(effectiveFrom, 10), basis: "10 years — s.14(2)(b)(ii)" };
  }
  if (age < 55) {
    return { expiry: addYears(dob, 55), basis: "valid until you turn 55 — s.14(2)(b)(iii)" };
  }
  return { expiry: addYears(effectiveFrom, 5), basis: "5 years — s.14(2)(b)(iv)" };
}

/**
 * Plan a driving licence renewal.
 *
 * @param {object} input
 * @param {string} input.dob          date of birth, "YYYY-MM-DD"
 * @param {string} input.expiryDate   date the current licence expires
 * @param {string} input.applyOn      date you will apply (usually today)
 * @param {string} input.licenceType  key from LICENCE_TYPES
 * @param {boolean} [input.changedAddress]  address on the licence is out of date
 * @param {boolean} [input.wantsInternational]  also applying for an IDP
 */
export function planLicenceRenewal({
  dob,
  expiryDate,
  applyOn,
  licenceType = "non-transport",
  changedAddress = false,
} = {}) {
  const type = LICENCE_TYPES.find((item) => item.id === licenceType);
  if (!type) return { error: "Choose a licence type from the list." };
  if (!Number.isFinite(parseDate(dob))) return { error: "Enter a valid date of birth." };
  if (!Number.isFinite(parseDate(expiryDate))) {
    return { error: "Enter the expiry date printed on the licence." };
  }
  if (!Number.isFinite(parseDate(applyOn))) {
    return { error: "Enter a valid date for the renewal application." };
  }
  if (daysBetween(dob, applyOn) < 0) {
    return { error: "The application date cannot be before the date of birth." };
  }

  const ageAtApplication = completedYears(dob, applyOn);
  if (ageAtApplication < 16) {
    return { error: "A driving licence cannot be held below 16, so there is nothing to renew." };
  }

  const daysToExpiry = daysBetween(applyOn, expiryDate);
  const expired = daysToExpiry < 0;
  const daysLate = expired ? -daysToExpiry : 0;
  const graceEnds = addDays(expiryDate, GRACE_DAYS);
  const withinGrace = daysLate <= GRACE_DAYS;

  // s.15(3)/(4): inside the grace window the renewal runs from the expiry date,
  // otherwise it runs from the date the renewal is actually granted.
  const effectiveFrom = withinGrace ? expiryDate : applyOn;
  const effectiveBasis = withinGrace
    ? "Runs from the expiry date — s.15(3)."
    : "Runs from the date of renewal, so the lapsed period is lost — s.15(4).";

  // Proviso to s.15(4): after five years the authority may insist on a driving test.
  const testThreshold = addYears(expiryDate, TEST_AFTER_YEARS);
  const testMayBeRequired = expired && daysBetween(testThreshold, applyOn) > 0;

  // CMVR Rule 32 late fee: base plus one thousand per year of delay, or part of a year,
  // counted from the day the grace period ends.
  const lateYears = withinGrace ? 0 : yearsOrPartThereof(graceEnds, applyOn);
  const baseFee = withinGrace ? FEES.renewal : FEES.lateRenewalBase;
  const lateFee = lateYears * FEES.lateRenewalPerYear;
  const testFee = testMayBeRequired ? FEES.testOfCompetence : 0;
  const totalFee = baseFee + lateFee + testFee;

  let newExpiry = "";
  let validityBasis = "";
  if (licenceType === "transport") {
    newExpiry = addYears(effectiveFrom, TRANSPORT_VALIDITY_YEARS);
    validityBasis = `${TRANSPORT_VALIDITY_YEARS} years — s.14(2)(a)`;
  } else if (licenceType === "hazardous") {
    newExpiry = addYears(effectiveFrom, HAZARDOUS_VALIDITY_YEARS);
    validityBasis = `${HAZARDOUS_VALIDITY_YEARS} year — proviso to s.14(2)(a)`;
  } else {
    const outcome = nonTransportExpiry(dob, effectiveFrom);
    if (outcome.error) return { error: outcome.error };
    newExpiry = outcome.expiry;
    validityBasis = outcome.basis;
  }

  const isTransport = licenceType !== "non-transport";
  const medicalRequired = isTransport || ageAtApplication >= MEDICAL_CERTIFICATE_AGE;

  const checklist = [
    {
      id: "form9",
      label: "Form 9 — application for renewal of driving licence",
      required: true,
      note: "Filled online on the Sarathi portal or on paper at the RTO (CMVR Rule 18).",
    },
    {
      id: "old-dl",
      label: "The existing driving licence, original plus a photocopy",
      required: true,
      note: "Carry the smart card; a lost licence needs a duplicate in Form LLD first.",
    },
    {
      id: "form1",
      label: "Form 1 — self-declaration of physical fitness",
      required: !medicalRequired,
      note: "Used instead of a doctor's certificate when no medical is required.",
    },
    {
      id: "form1a",
      label: "Form 1A — medical certificate from a registered practitioner",
      required: medicalRequired,
      note: isTransport
        ? "Every transport licence renewal needs it, whatever your age."
        : `Required once you are ${MEDICAL_CERTIFICATE_AGE} or older. You are ${ageAtApplication}.`,
    },
    {
      id: "photos",
      label: "Recent passport-size photographs",
      required: true,
      note: "Most RTOs ask for two or three; the smart card photo is captured at the office.",
    },
    {
      id: "age-proof",
      label: "Proof of date of birth",
      required: true,
      note: "Aadhaar, PAN, passport, birth certificate or school leaving certificate.",
    },
    {
      id: "address-proof",
      label: "Proof of current address",
      required: true,
      note: changedAddress
        ? "Address has changed — file the change of address along with the renewal."
        : "Aadhaar, passport, utility bill or voter ID in the same name.",
    },
    {
      id: "fee",
      label: `Fee — ${totalFee} rupees by the RTO's payment method`,
      required: true,
      note: "Keep the online payment receipt; state smart-card charges are extra.",
    },
    {
      id: "badge",
      label: "Public service or hazardous goods endorsement papers",
      required: isTransport,
      note: "Includes the refresher training certificate where the state requires one.",
    },
    {
      id: "test",
      label: "Slot for the test of competence to drive",
      required: testMayBeRequired,
      note: `The licence lapsed more than ${TEST_AFTER_YEARS} years ago, so the authority may require a fresh test — proviso to s.15(4).`,
    },
  ];

  const steps = [
    "Open the Parivahan Sarathi portal for your state and choose Driving Licence, then Services on DL, and Renewal of DL.",
    "Fill Form 9 with the licence number and date of birth, and upload the documents marked required below.",
    medicalRequired
      ? "Get Form 1A signed and stamped by a registered medical practitioner, then upload it."
      : "Complete the Form 1 self-declaration of fitness online.",
    "Pay the fee online and print the acknowledgement.",
    testMayBeRequired
      ? "Book a slot for the driving test and attend with the vehicle class you are renewing."
      : "Attend the RTO on the scheduled date for biometrics and the card photograph if your state requires it.",
    "Collect the smart card or track dispatch by speed post on the portal.",
  ];

  return {
    typeLabel: type.label,
    typeNote: type.note,
    ageAtApplication,
    expiryDate,
    applyOn,
    daysToExpiry,
    expired,
    daysLate,
    graceEnds,
    withinGrace,
    effectiveFrom,
    effectiveBasis,
    testMayBeRequired,
    medicalRequired,
    lateYears,
    baseFee,
    lateFee,
    testFee,
    totalFee,
    newExpiry,
    validityBasis,
    checklist,
    requiredCount: checklist.filter((item) => item.required).length,
    steps,
  };
}
