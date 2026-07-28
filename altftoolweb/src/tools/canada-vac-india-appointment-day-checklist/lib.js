/**
 * Canada visa application centre (VAC) appointment-day planner for applicants in India.
 *
 * Rules encoded below come from published IRCC and VFS Global guidance (informational only):
 *  - Biometrics (ten fingerprints and a digital photo) are collected at the VAC against a
 *    Biometric Instruction Letter (BIL), which IRCC issues after the application is submitted.
 *  - The BIL must be used within 30 days of the date IRCC issues it.
 *  - Biometric collection fee: CAD 85 per person; a family applying together at the same time
 *    pays a maximum of CAD 170; a group of three or more performing artists pays a maximum of
 *    CAD 255.
 *  - Biometrics given for a temporary residence application stay valid for 10 years.
 *  - Age exemption: applicants under 14 and applicants over 79 do not give biometrics
 *    (there is no upper age exemption for asylum claimants).
 *  - VACs ask applicants to arrive around 15 minutes before the slot, admit the applicant
 *    only, and refuse bags, electronics, food and sealed packages at the door.
 *  - Fresh mehndi or henna on the fingertips degrades fingerprint capture and often forces a
 *    re-scan.
 *
 * Pure module: no clock reads, no DOM, no React.
 */

/** VAC guidance for Canada application centres in India. */
export const ARRIVE_MINUTES_BEFORE = 15;

/** Contingency added on top of the stated travel time by default. */
export const DEFAULT_BUFFER_MINUTES = 30;

/** IRCC biometric collection fee, per person, in Canadian dollars. */
export const BIOMETRIC_FEE_PER_PERSON_CAD = 85;

/** Family maximum when applying together at the same time. */
export const BIOMETRIC_FEE_FAMILY_CAP_CAD = 170;

/** Maximum for a group of three or more performing artists. */
export const BIOMETRIC_FEE_ARTIST_GROUP_CAP_CAD = 255;

/** Minimum group size that qualifies for the performing-artist cap. */
export const ARTIST_GROUP_MIN_SIZE = 3;

/** Applicants below this age do not give biometrics. */
export const BIOMETRIC_MIN_AGE = 14;

/** Applicants above this age do not give biometrics (asylum claimants excepted). */
export const BIOMETRIC_MAX_AGE = 79;

/** A BIL must be used within this many days of issue. */
export const BIL_VALID_DAYS = 30;

/** Temporary-residence biometrics remain on file for this long. */
export const BIOMETRIC_VALIDITY_YEARS = 10;

const MINUTES_IN_DAY = 24 * 60;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const ROUTES = [
  { id: "visitor", label: "Visitor visa (TRV) or Super Visa" },
  { id: "study", label: "Study permit" },
  { id: "work", label: "Work permit (LMIA or LMIA-exempt)" },
  { id: "pr", label: "Permanent residence (Express Entry or sponsorship)" },
];

export const FEE_GROUPS = [
  { id: "individual", label: "Applying on my own" },
  { id: "family", label: "Family applying together (CAD 170 cap)" },
  { id: "artists", label: "Group of 3+ performing artists (CAD 255 cap)" },
];

/** "HH:MM" -> minutes past midnight, or null when unparseable. */
export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** minutes past midnight -> "HH:MM", wrapping across midnight. */
export function formatMinutes(total) {
  if (!Number.isFinite(total)) return "--:--";
  const wrapped = ((Math.round(total) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" -> UTC timestamp, or null when the date does not exist. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return stamp;
}

/** Add whole days to a UTC timestamp and return "YYYY-MM-DD". */
export function addDaysIso(stamp, days) {
  if (!Number.isFinite(stamp) || !Number.isFinite(days)) return "";
  return new Date(stamp + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * Biometric collection fee in CAD.
 * Individual: 85 each. Family together: capped at 170. Performing-artist group of 3+: capped at 255.
 */
export function computeBiometricFee(people, group = "individual") {
  const count = Number(people);
  if (!Number.isInteger(count) || count < 1) {
    return { error: "Enter how many people are giving biometrics (at least one)." };
  }
  if (count > 20) {
    return { error: "Split a party larger than 20 into separate appointments." };
  }
  const gross = count * BIOMETRIC_FEE_PER_PERSON_CAD;
  if (group === "family") {
    return { fee: Math.min(gross, BIOMETRIC_FEE_FAMILY_CAP_CAD), gross, capped: gross > BIOMETRIC_FEE_FAMILY_CAP_CAD };
  }
  if (group === "artists") {
    if (count < ARTIST_GROUP_MIN_SIZE) {
      return {
        error: `The performing-artist cap needs at least ${ARTIST_GROUP_MIN_SIZE} people in the group.`,
      };
    }
    return {
      fee: Math.min(gross, BIOMETRIC_FEE_ARTIST_GROUP_CAP_CAD),
      gross,
      capped: gross > BIOMETRIC_FEE_ARTIST_GROUP_CAP_CAD,
    };
  }
  return { fee: gross, gross, capped: false };
}

/** Age-based biometric exemption. Asylum claimants have no upper-age exemption. */
export function biometricsRequiredForAge(age, asylumClaimant = false) {
  const value = Number(age);
  if (!Number.isFinite(value) || value < 0 || value > 120) return null;
  if (value < BIOMETRIC_MIN_AGE) return false;
  if (value > BIOMETRIC_MAX_AGE) return Boolean(asylumClaimant);
  return true;
}

const ROUTE_DOCUMENTS = {
  visitor: [
    "Proof of funds: 6 months of bank statements, salary slips or ITR acknowledgements",
    "Employment or business proof — leave-approval letter, appointment letter, GST or Udyam registration",
    "Invitation letter from your host in Canada with their status document, if you are visiting family",
    "Travel history: old passports with previous visas, and your itinerary",
    "For a Super Visa: the host's income proof and the Canadian medical insurance policy",
  ],
  study: [
    "Letter of Acceptance from the designated learning institution",
    "Provincial Attestation Letter (PAL or TAL), unless your programme is exempt",
    "Proof of the Guaranteed Investment Certificate and first-year tuition payment",
    "Academic transcripts, degree certificates and the language test report (IELTS, PTE or TOEFL)",
    "Statement of purpose and, if applicable, the study gap explanation",
  ],
  work: [
    "Job offer letter and the LMIA number, or the offer of employment number for LMIA-exempt jobs",
    "Employment reference letters showing NOC-matching duties and dates",
    "Qualification and licence documents for regulated occupations",
    "Language test report, where the stream requires one",
  ],
  pr: [
    "Invitation to Apply and the complete document checklist generated in your PR portal",
    "Police clearance certificates for every country you lived in for 6 months or more since age 18",
    "Upfront medical examination receipt from an IRCC panel physician",
    "Educational Credential Assessment report and the language test report",
    "Proof of settlement funds, unless you are exempt",
  ],
};

const ALWAYS_CARRY = [
  "Printed Biometric Instruction Letter (BIL) — the centre cannot enrol you without it",
  "Current passport, plus every old passport you hold",
  "Photocopy of the passport bio-data page",
  "Application submission confirmation and the fee payment receipt",
  "A pen for the declarations at the counter",
];

/**
 * Build the Canada VAC appointment-day plan.
 * @returns {object} plan, or { error }.
 */
export function buildVacDayPlan({
  appointmentTime,
  travelMinutes,
  bufferMinutes = DEFAULT_BUFFER_MINUTES,
  route = "visitor",
  applicantAge = 30,
  people = 1,
  feeGroup = "individual",
  bilIssueDate = "",
  hasHenna = false,
  wearsGlasses = false,
} = {}) {
  const slot = parseTimeToMinutes(appointmentTime);
  if (slot === null) {
    return { error: "Enter the appointment time from your confirmation in 24-hour HH:MM form." };
  }

  const travel = Number(travelMinutes);
  if (!Number.isFinite(travel) || travel < 0) {
    return { error: "Travel time must be zero or more minutes." };
  }
  if (travel > 12 * 60) {
    return { error: "Travel time over 12 hours means an overnight trip — plan the stay separately." };
  }

  const buffer = Number(bufferMinutes);
  if (!Number.isFinite(buffer) || buffer < 0) {
    return { error: "Buffer time must be zero or more minutes." };
  }

  if (!ROUTE_DOCUMENTS[route]) {
    return { error: "Choose the application type you are applying under." };
  }

  const required = biometricsRequiredForAge(applicantAge);
  if (required === null) {
    return { error: "Enter the applicant's age in years, between 0 and 120." };
  }

  const feeResult = computeBiometricFee(people, feeGroup);
  if (feeResult.error) return { error: feeResult.error };

  let bilDeadline = "";
  if (typeof bilIssueDate === "string" && bilIssueDate.trim()) {
    const stamp = parseIsoDate(bilIssueDate);
    if (stamp === null) return { error: "Enter the BIL issue date as YYYY-MM-DD." };
    bilDeadline = addDaysIso(stamp, BIL_VALID_DAYS);
  }

  const arriveAt = slot - ARRIVE_MINUTES_BEFORE;
  const leaveAt = arriveAt - travel - buffer;

  const carry = [...ALWAYS_CARRY, ...ROUTE_DOCUMENTS[route]];
  if (bilDeadline) {
    carry.push(`Check the BIL expiry — biometrics must be given by ${bilDeadline}`);
  }
  if (!required) {
    carry.push(
      "This applicant is age-exempt from biometrics, but still carry the BIL if IRCC issued one for the family",
    );
  }

  const wear = [
    "Plain, solid-colour clothing photographs best against the white background",
    "No sunglasses or hats; a religious head covering is fine if the full face is visible",
    "Keep hair off the forehead and skip shimmer makeup — the photo is matched by software",
    "No gloves, no plasters on the fingertips, and short clean nails for the fingerprint scan",
  ];
  if (wearsGlasses) {
    wear.unshift("Expect to remove your glasses for the photograph");
  }
  if (hasHenna) {
    wear.unshift("Fresh mehndi on the fingertips degrades fingerprint capture — let it fade first");
  }

  const leaveBehind = [
    "Backpacks, suitcases and shopping bags — centres rarely have free storage",
    "Laptops, tablets, cameras, power banks and smart watches",
    "Sealed envelopes or parcels for anyone else",
    "Food, drinks and sharp items including scissors and nail clippers",
    "Companions — only the applicant is admitted, apart from a guardian for a minor or an attendant for someone needing assistance",
  ];

  const know = [
    `Be at the entrance by ${formatMinutes(arriveAt)}; the centre works to the booked slot`,
    `Biometric enrolment fee is CAD ${feeResult.fee} for this party (CAD ${BIOMETRIC_FEE_PER_PERSON_CAD} per person, family cap CAD ${BIOMETRIC_FEE_FAMILY_CAP_CAD})`,
    `Temporary-residence biometrics stay valid for ${BIOMETRIC_VALIDITY_YEARS} years — you may not need to repeat them for the next application`,
    "Enrolment itself takes a few minutes; the visit usually runs 30 to 60 minutes with queueing",
    "Passports are submitted later, only when IRCC sends the passport request — do not leave your passport at the biometric visit unless asked",
  ];

  return {
    appointmentTime: formatMinutes(slot),
    arriveBy: formatMinutes(arriveAt),
    leaveHomeBy: formatMinutes(leaveAt),
    leaveHomePreviousDay: leaveAt < 0,
    travelMinutes: travel,
    bufferMinutes: buffer,
    totalLeadMinutes: ARRIVE_MINUTES_BEFORE + travel + buffer,
    route,
    routeLabel: ROUTES.find((item) => item.id === route)?.label ?? route,
    biometricsRequired: required,
    applicantAge: Number(applicantAge),
    people: Number(people),
    feeGroup,
    biometricFeeCad: feeResult.fee,
    biometricFeeGrossCad: feeResult.gross,
    feeCapped: feeResult.capped,
    bilIssueDate: bilIssueDate || "",
    bilDeadline,
    bilValidDays: BIL_VALID_DAYS,
    biometricValidityYears: BIOMETRIC_VALIDITY_YEARS,
    sections: [
      { title: "Carry with you", items: carry },
      { title: "Wear and grooming", items: wear },
      { title: "Leave at home or in the car", items: leaveBehind },
      { title: "Know before you go", items: know },
    ],
    totalItems: carry.length + wear.length + leaveBehind.length,
  };
}

/** Flatten a plan into plain text for the clipboard. */
export function planToText(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    "Canada VAC appointment day checklist",
    `Appointment: ${plan.appointmentTime}`,
    `Reach the centre by: ${plan.arriveBy}`,
    `Leave home by: ${plan.leaveHomeBy}${plan.leaveHomePreviousDay ? " (previous day)" : ""}`,
    `Application type: ${plan.routeLabel}`,
    `Biometric fee: CAD ${plan.biometricFeeCad} for ${plan.people} person(s)`,
  ];
  if (plan.bilDeadline) lines.push(`BIL must be used by: ${plan.bilDeadline}`);
  lines.push("");
  for (const section of plan.sections) {
    lines.push(`${section.title}:`);
    for (const item of section.items) lines.push(`- ${item}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}
