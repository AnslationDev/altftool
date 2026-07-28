/**
 * UK visa application centre (VAC) appointment-day planner for applicants in India.
 *
 * Sources for the rules encoded below (all published guidance, not legal advice):
 *  - VFS Global, which operates the UK VACs in India, asks applicants to arrive about
 *    15 minutes before the appointment slot; arriving much earlier usually means waiting
 *    outside the centre because only the booked slot is admitted.
 *  - UKVI requires biometric enrolment (ten fingerprints and a digital photograph) at the
 *    centre unless the route allows identity verification through the UK Immigration: ID
 *    Check app.
 *  - UK digital photo standards: face uncovered, no sunglasses, plain expression, and
 *    tinted or heavy-framed glasses are normally removed for the capture.
 *  - Applicants from India applying to stay in the UK for more than 6 months must present a
 *    tuberculosis test certificate from a UKVI-approved clinic; the certificate is valid for
 *    6 months from the date of the x-ray.
 *  - The Immigration Health Surcharge is payable online, before the appointment, for
 *    applications for a stay of more than 6 months.
 *  - VACs restrict what may be brought inside: no bags, no electronic devices beyond a
 *    phone where the centre allows one, no food and no sealed packages. Storage, where it
 *    exists, is a paid optional service.
 *
 * Pure module: no clock reads, no DOM, no React. Times come in as arguments.
 */

/** VFS Global guidance for UK VACs in India. */
export const ARRIVE_MINUTES_BEFORE = 15;

/** Contingency the planner adds on top of the stated travel time by default. */
export const DEFAULT_BUFFER_MINUTES = 30;

/** UKVI: a TB certificate is needed for stays longer than this. */
export const TB_TEST_THRESHOLD_MONTHS = 6;

/** A UKVI-approved TB certificate is valid for 6 months from the x-ray date. */
export const TB_CERTIFICATE_VALIDITY_MONTHS = 6;

const MINUTES_IN_DAY = 24 * 60;

export const ROUTES = [
  { id: "visitor", label: "Standard Visitor (tourist, family visit, business)" },
  { id: "student", label: "Student / Child Student" },
  { id: "work", label: "Skilled Worker or other sponsored work route" },
  { id: "family", label: "Family / Spouse / Settlement" },
];

export const AGE_GROUPS = [
  { id: "child", label: "Under 18" },
  { id: "adult", label: "18 to 64" },
  { id: "senior", label: "65 or over" },
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
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Route-specific paperwork. Every UK application is decided on the documents, so the list
 * separates what UKVI always wants from what only that route needs.
 */
const ROUTE_DOCUMENTS = {
  visitor: [
    "Printed online application form and the appointment confirmation with your GWF or UAN reference",
    "Proof of funds: 6 months of bank statements and salary slips or ITR",
    "Employment or business evidence — leave letter, appointment letter, GST or company registration",
    "Invitation letter and the host's status and accommodation evidence, if you are visiting someone",
    "Return travel and accommodation plan (bookings need not be paid for a visitor application)",
  ],
  student: [
    "Printed online application form and the appointment confirmation with your GWF or UAN reference",
    "CAS reference number and the CAS statement from your university",
    "Original academic transcripts and degree or board certificates listed on the CAS",
    "English language test certificate (IELTS UKVI / equivalent) if the CAS requires one",
    "Financial evidence held for 28 consecutive days — bank statement, education loan sanction letter or scholarship award",
    "ATAS certificate, if your course requires one",
    "Parental consent and birth certificate, if you are under 18",
  ],
  work: [
    "Printed online application form and the appointment confirmation with your GWF or UAN reference",
    "Certificate of Sponsorship (CoS) reference number and a copy of the CoS details",
    "Job offer or contract showing the salary and SOC occupation code",
    "Qualification certificates or evidence of relevant experience named on the CoS",
    "Criminal record certificate, if your occupation requires one",
    "Maintenance funds evidence, unless the sponsor certifies maintenance on the CoS",
  ],
  family: [
    "Printed online application form and the appointment confirmation with your GWF or UAN reference",
    "Sponsor's passport or BRP, plus proof of their status in the UK",
    "Marriage certificate or relationship evidence — photos, chat logs, travel history, joint documents",
    "Sponsor's financial evidence for the income requirement — 6 months of payslips and bank statements",
    "Accommodation evidence: tenancy agreement, property deed or a letter from the property owner",
    "English language certificate at the level your route requires (A1 for most partner applications)",
  ],
};

const ALWAYS_CARRY = [
  "Current passport, valid and with at least one blank page",
  "All old and cancelled passports you hold",
  "Photocopy of the passport bio-data page and any previous UK or Schengen visas",
  "Visa fee payment receipt or transaction reference",
  "A pen — forms and declarations are still filled by hand at the counter",
];

/**
 * Build the appointment-day plan.
 *
 * @param {object} input
 * @param {string} input.appointmentTime  "HH:MM" 24-hour slot printed on the confirmation.
 * @param {number} input.travelMinutes    Door-to-centre travel time.
 * @param {number} [input.bufferMinutes]  Extra contingency on top of travel.
 * @param {string} input.route            One of ROUTES ids.
 * @param {string} input.ageGroup         One of AGE_GROUPS ids.
 * @param {boolean} [input.stayOver6Months] Applying to stay in the UK longer than 6 months.
 * @param {boolean} [input.hasOldPassports]
 * @param {boolean} [input.hasHenna]      Fresh mehndi or henna on the fingertips.
 * @param {boolean} [input.wearsGlasses]
 * @param {boolean} [input.bringingCompanion]
 * @returns {object} plan, or { error }.
 */
export function buildVacDayPlan({
  appointmentTime,
  travelMinutes,
  bufferMinutes = DEFAULT_BUFFER_MINUTES,
  route = "visitor",
  ageGroup = "adult",
  stayOver6Months = false,
  hasOldPassports = true,
  hasHenna = false,
  wearsGlasses = false,
  bringingCompanion = false,
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
    return { error: "Travel time over 12 hours means an overnight trip — book a room and plan the day separately." };
  }

  const buffer = Number(bufferMinutes);
  if (!Number.isFinite(buffer) || buffer < 0) {
    return { error: "Buffer time must be zero or more minutes." };
  }

  if (!ROUTE_DOCUMENTS[route]) {
    return { error: "Choose the visa route you are applying under." };
  }

  const arriveAt = slot - ARRIVE_MINUTES_BEFORE;
  const leaveAt = arriveAt - travel - buffer;
  const previousDay = leaveAt < 0;

  const carry = [...ALWAYS_CARRY, ...ROUTE_DOCUMENTS[route]];
  if (!hasOldPassports) {
    carry.push("A written note or affidavit explaining that you hold no previous passports");
  }
  if (stayOver6Months) {
    carry.push(
      `TB test certificate from a UKVI-approved clinic — required for stays over ${TB_TEST_THRESHOLD_MONTHS} months and valid ${TB_CERTIFICATE_VALIDITY_MONTHS} months from the x-ray`,
    );
    carry.push("Immigration Health Surcharge (IHS) payment reference — pay it online before you travel");
  }
  if (ageGroup === "child") {
    carry.push("Birth certificate and both parents' passport copies");
    carry.push("Signed parental consent letter naming the adult travelling with you");
  }
  if (ageGroup === "senior") {
    carry.push("Travel medical insurance and a doctor's fitness note, if your sponsor asked for one");
  }

  const wear = [
    "Plain clothes with a collar or a solid colour — they photograph better against the white background",
    "No sunglasses; keep the face fully visible from the hairline to the chin",
    "A religious head covering is allowed as long as the full face is visible",
    "Skip heavy foundation, shimmer and hair over the forehead — the photo is matched by software",
  ];
  if (wearsGlasses) {
    wear.unshift("Be ready to take your glasses off — UK digital photos are captured without them");
  }
  if (hasHenna) {
    wear.unshift(
      "Fresh henna or mehndi on the fingertips can defeat the fingerprint scanner — let it fade or expect a re-scan",
    );
  }
  wear.push("No gloves, no bandages on the fingers, and trim long nails before biometric capture");

  const leaveBehind = [
    "Backpacks, laptop bags and any luggage — most centres have no free cloakroom",
    "Laptops, tablets, cameras, power banks and smart watches",
    "Sealed envelopes, parcels and anything you were asked to carry for someone else",
    "Food, drinks, sharp objects, scissors and nail clippers",
    "Extra family members — only the applicant is admitted",
  ];
  if (bringingCompanion) {
    leaveBehind.push(
      "Your companion waits outside unless the applicant is under 18 or needs assistance — carry proof of the relationship",
    );
  }

  const know = [
    `Reach the entrance by ${formatMinutes(arriveAt)} — the centre works to the booked slot, not to walk-ins`,
    "Biometrics are ten fingerprints and a digital photograph; the whole visit is usually 30 to 60 minutes",
    "The passport is retained at the centre and returned by courier or counter pickup, so do not plan other travel on that passport",
    "Optional paid services — priority processing, courier return, premium lounge, form filling — are bought at the counter or online, never in cash to an agent outside",
    "Check the appointment email for the exact centre address; several cities have more than one VFS building",
  ];

  const totalItems = carry.length + wear.length + leaveBehind.length;

  return {
    appointmentTime: formatMinutes(slot),
    arriveBy: formatMinutes(arriveAt),
    leaveHomeBy: formatMinutes(leaveAt),
    leaveHomePreviousDay: previousDay,
    travelMinutes: travel,
    bufferMinutes: buffer,
    totalLeadMinutes: ARRIVE_MINUTES_BEFORE + travel + buffer,
    route,
    routeLabel: ROUTES.find((item) => item.id === route)?.label ?? route,
    ageGroup,
    sections: [
      { title: "Carry with you", items: carry },
      { title: "Wear and grooming", items: wear },
      { title: "Leave at home or in the car", items: leaveBehind },
      { title: "Know before you go", items: know },
    ],
    totalItems,
  };
}

/** Flatten a plan into plain text for the clipboard. */
export function planToText(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    "UK VAC appointment day checklist",
    `Appointment: ${plan.appointmentTime}`,
    `Reach the centre by: ${plan.arriveBy}`,
    `Leave home by: ${plan.leaveHomeBy}${plan.leaveHomePreviousDay ? " (previous day)" : ""}`,
    `Route: ${plan.routeLabel}`,
    "",
  ];
  for (const section of plan.sections) {
    lines.push(`${section.title}:`);
    for (const item of section.items) lines.push(`- ${item}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}
