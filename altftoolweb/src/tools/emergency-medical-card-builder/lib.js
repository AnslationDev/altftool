/**
 * Emergency medical card logic.
 *
 * Pure module: no React, no DOM, no clock reads. Every date is passed in as an
 * ISO "YYYY-MM-DD" string so the same input always produces the same output.
 */

/* ISO/IEC 7810 ID-1 is the standard wallet / bank-card size: 85.60 x 53.98 mm.
   A card printed to this size slips into any card slot in a wallet. */
export const CARD_WIDTH_MM = 85.6;
export const CARD_HEIGHT_MM = 53.98;

/* Practical text budget for one ID-1 side printed at 7pt condensed and still
   readable by a paramedic at arm's length. Derived from the printable area
   (~78 x 46 mm at a 4 mm margin) at roughly 32 characters per line, 17 lines. */
export const MAX_CHARS_PER_SIDE = 544;

/* ITU-T Recommendation E.164 caps an international number at 15 digits. */
export const MAX_PHONE_DIGITS = 15;
/* Shortest usable subscriber numbers (excluding 3-digit short codes) are 7 digits. */
export const MIN_PHONE_DIGITS = 7;

/* Emergency services will not carry a card seriously if it is unsigned/undated,
   so the card records a "reviewed on" date. Health services generally suggest
   re-checking a personal medication list at least every 6 months. */
export const REVIEW_INTERVAL_MONTHS = 6;

export const BLOOD_GROUPS = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

/**
 * Packed red blood cell transfusion compatibility: for each recipient group,
 * the donor groups whose red cells are compatible (ABO antigen + RhD rule).
 * O- is the universal red-cell donor; AB+ is the universal recipient.
 */
export const RED_CELL_DONORS = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

/**
 * Fields a first responder looks for first. Weights add up to 80, so a card
 * missing any critical field can never score as "complete".
 */
export const CRITICAL_FIELDS = [
  { key: "fullName", label: "Full name", weight: 15 },
  { key: "contacts", label: "At least one reachable emergency contact", weight: 20 },
  { key: "allergies", label: "Allergies (write “None known” if none)", weight: 15 },
  { key: "conditions", label: "Medical conditions", weight: 10 },
  { key: "medications", label: "Current medicines and doses", weight: 10 },
  { key: "bloodGroup", label: "Blood group", weight: 10 },
];

/** Useful but not life-critical. Weights add up to 20, so the total is 100. */
export const RECOMMENDED_FIELDS = [
  { key: "dob", label: "Date of birth", weight: 5 },
  { key: "doctorName", label: "Regular doctor or clinic", weight: 5 },
  { key: "insurer", label: "Insurer / policy number", weight: 4 },
  { key: "address", label: "Home address", weight: 3 },
  { key: "implants", label: "Implants and devices (pacemaker, stent, lens)", weight: 3 },
];

export const COMPLETENESS_BANDS = [
  { min: 90, label: "Ready to print", note: "Every critical field is filled in." },
  { min: 70, label: "Usable", note: "Good enough to carry, but fill the gaps below." },
  { min: 40, label: "Incomplete", note: "A responder would still have to guess key facts." },
  { min: 0, label: "Barely started", note: "Add your contacts, allergies and medicines." },
];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Split a free-text box into individual entries on newline, comma or semicolon. */
export function splitEntries(text) {
  return clean(text)
    .split(/[\n;,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function phoneDigits(value) {
  return clean(value).replace(/\D/g, "");
}

export function isUsablePhone(value) {
  const digits = phoneDigits(value);
  return digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS;
}

/** Parse a strict "YYYY-MM-DD" string. Returns null for anything else. */
export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/** Whole completed years between two ISO dates. Null if either date is unusable. */
export function calculateAgeYears(dobIso, asOfIso) {
  const dob = parseIsoDate(dobIso);
  const asOf = parseIsoDate(asOfIso);
  if (!dob || !asOf) return null;
  let years = asOf.year - dob.year;
  const beforeBirthday =
    asOf.month < dob.month || (asOf.month === dob.month && asOf.day < dob.day);
  if (beforeBirthday) years -= 1;
  if (years < 0) return null;
  return years;
}

/** Add whole months to an ISO date, clamping the day to the shorter month. */
export function addMonthsIso(isoDate, months) {
  const date = parseIsoDate(isoDate);
  if (!date || !Number.isInteger(months)) return null;
  const zeroBased = date.month - 1 + months;
  const year = date.year + Math.floor(zeroBased / 12);
  const month = ((zeroBased % 12) + 12) % 12;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(date.day, daysInMonth);
  const pad = (n) => String(n).padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function bandFor(score) {
  return COMPLETENESS_BANDS.find((band) => score >= band.min) || COMPLETENESS_BANDS[COMPLETENESS_BANDS.length - 1];
}

/**
 * Build the card. Returns { error } for input that cannot produce a card at all;
 * everything else is reported as a missing field or a warning so the user still
 * sees a usable draft.
 */
export function buildEmergencyCard(input = {}) {
  const fullName = clean(input.fullName);
  const reviewedOn = clean(input.reviewedOn);
  const bloodGroup = clean(input.bloodGroup);
  const dob = clean(input.dob);

  if (!fullName) {
    return { error: "Enter the card holder's full name — a responder needs a name to work with." };
  }
  if (fullName.length > 80) {
    return { error: "Full name is too long for a wallet card. Keep it under 80 characters." };
  }
  if (!parseIsoDate(reviewedOn)) {
    return { error: "Pick a valid review date in YYYY-MM-DD form." };
  }
  if (dob && !parseIsoDate(dob)) {
    return { error: "Date of birth must be a real date in YYYY-MM-DD form." };
  }
  if (bloodGroup && !BLOOD_GROUPS.includes(bloodGroup)) {
    return { error: `Blood group must be one of ${BLOOD_GROUPS.join(", ")}, or left blank if unknown.` };
  }

  const ageYears = dob ? calculateAgeYears(dob, reviewedOn) : null;
  if (dob && ageYears === null) {
    return { error: "Date of birth is after the review date. Check both dates." };
  }

  const rawContacts = Array.isArray(input.contacts) ? input.contacts : [];
  const contacts = rawContacts
    .map((contact) => ({
      name: clean(contact && contact.name),
      relation: clean(contact && contact.relation),
      phone: clean(contact && contact.phone),
    }))
    .filter((contact) => contact.name || contact.phone);

  const reachableContacts = contacts.filter((contact) => contact.name && isUsablePhone(contact.phone));
  const badPhoneContacts = contacts.filter((contact) => contact.phone && !isUsablePhone(contact.phone));

  const allergies = splitEntries(input.allergies);
  const conditions = splitEntries(input.conditions);
  const medications = splitEntries(input.medications);
  const implants = splitEntries(input.implants);

  const filled = {
    fullName: Boolean(fullName),
    contacts: reachableContacts.length > 0,
    allergies: allergies.length > 0,
    conditions: conditions.length > 0,
    medications: medications.length > 0,
    bloodGroup: Boolean(bloodGroup),
    dob: Boolean(dob),
    doctorName: Boolean(clean(input.doctorName)),
    insurer: Boolean(clean(input.insurer) || clean(input.policyNumber)),
    address: Boolean(clean(input.address)),
    implants: implants.length > 0,
  };

  let score = 0;
  const missingCritical = [];
  const missingRecommended = [];
  CRITICAL_FIELDS.forEach((field) => {
    if (filled[field.key]) score += field.weight;
    else missingCritical.push(field.label);
  });
  RECOMMENDED_FIELDS.forEach((field) => {
    if (filled[field.key]) score += field.weight;
    else missingRecommended.push(field.label);
  });
  const completeness = Math.max(0, Math.min(100, Math.round(score)));

  const compatibleDonors = bloodGroup ? RED_CELL_DONORS[bloodGroup] : [];

  const sections = [];
  const push = (label, value) => {
    const text = Array.isArray(value) ? value.join(", ") : clean(value);
    if (text) sections.push({ label, value: text });
  };

  push("NAME", fullName);
  if (dob) push("DOB / AGE", `${dob} (${ageYears} yrs)`);
  push("BLOOD GROUP", bloodGroup);
  push("ALLERGIES", allergies);
  push("CONDITIONS", conditions);
  push("MEDICINES", medications);
  push("IMPLANTS / DEVICES", implants);
  if (clean(input.organDonor)) push("ORGAN DONOR", clean(input.organDonor));
  push("PREFERRED HOSPITAL", input.preferredHospital);
  push("LANGUAGE", input.language);
  push("ADDRESS", input.address);
  if (clean(input.doctorName) || clean(input.doctorPhone)) {
    push("DOCTOR", [clean(input.doctorName), clean(input.doctorPhone)].filter(Boolean).join(" · "));
  }
  if (clean(input.insurer) || clean(input.policyNumber)) {
    push("INSURANCE", [clean(input.insurer), clean(input.policyNumber)].filter(Boolean).join(" · "));
  }
  contacts.forEach((contact, index) => {
    const parts = [contact.name, contact.relation, contact.phone].filter(Boolean);
    if (parts.length) push(`ICE ${index + 1}`, parts.join(" · "));
  });
  push("NOTES", input.notes);

  const cardText = [
    "EMERGENCY MEDICAL CARD",
    ...sections.map((section) => `${section.label}: ${section.value}`),
    `REVIEWED: ${reviewedOn}`,
  ].join("\n");

  const characters = cardText.length;
  const sidesNeeded = Math.max(1, Math.ceil(characters / MAX_CHARS_PER_SIDE));
  const nextReviewDate = addMonthsIso(reviewedOn, REVIEW_INTERVAL_MONTHS);

  const warnings = [];
  if (sidesNeeded > 2) {
    warnings.push(
      `The card runs to ${characters} characters — about ${sidesNeeded} wallet-card sides. Trim the notes so it fits front and back.`,
    );
  }
  if (badPhoneContacts.length > 0) {
    warnings.push(
      `${badPhoneContacts.length} contact number${badPhoneContacts.length > 1 ? "s do" : " does"} not look dialable (expected ${MIN_PHONE_DIGITS}–${MAX_PHONE_DIGITS} digits).`,
    );
  }
  if (!filled.allergies) {
    warnings.push("Leaving allergies blank is ambiguous. Write “None known” so a responder knows you checked.");
  }
  if (reachableContacts.length === 1) {
    warnings.push("Add a second emergency contact in case the first one cannot be reached.");
  }

  const band = bandFor(completeness);

  return {
    completeness,
    band: band.label,
    bandNote: band.note,
    ageYears,
    bloodGroup: bloodGroup || "",
    compatibleDonors,
    contactCount: contacts.length,
    reachableContacts: reachableContacts.length,
    allergies,
    conditions,
    medications,
    implants,
    sections,
    cardText,
    characters,
    sidesNeeded,
    reviewedOn,
    nextReviewDate,
    missingCritical,
    missingRecommended,
    warnings,
  };
}
