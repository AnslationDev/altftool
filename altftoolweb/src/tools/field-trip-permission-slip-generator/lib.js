/**
 * School field trip permission slip builder.
 *
 * Pure module. Three real calculations sit behind the document:
 *   1. Supervision   - adults required = ceil(students / pupils-per-adult),
 *                      taken from the age band or from the higher-risk override.
 *   2. Money         - per-student cost from a shared coach charge plus
 *                      per-head charges, with a contingency percentage,
 *                      rounded up to a whole collectable amount.
 *   3. Dates & times - the reply-by date, and the trip duration in hours.
 *
 * IMPORTANT on the ratios below: in England there is no single statutory
 * adult-to-pupil ratio for school visits. The legal duty is to carry out a
 * risk assessment and staff the visit accordingly; the numbers here are the
 * planning figures used across published local-authority and Outdoor Education
 * Advisers' Panel guidance, and are widely mirrored in school policies
 * elsewhere. Early-years settings are the exception - those ratios are set by
 * the statutory EYFS framework - so treat these as a starting point that your
 * own risk assessment can tighten, never loosen.
 */

export const SUPERVISION_BANDS = [
  { id: "early", label: "Nursery and Reception (ages 3-5)", pupilsPerAdult: 4 },
  { id: "ks1", label: "Ages 5-8 (Years 1-3)", pupilsPerAdult: 6 },
  { id: "ks2", label: "Ages 8-11 (Years 4-6)", pupilsPerAdult: 10 },
  { id: "ks3", label: "Ages 11-14 (Years 7-9)", pupilsPerAdult: 15 },
  { id: "ks4", label: "Ages 14-18 (Years 10-13)", pupilsPerAdult: 20 },
];

// Water, height, adventure and remote-location activities are staffed tighter
// than the age band would suggest, because a single adult cannot supervise a
// large group where an incident develops in seconds.
export const HIGHER_RISK_PUPILS_PER_ADULT = 8;

// Trips with an overnight stay need a second adult awake and available, and at
// least one adult of each gender where pupils of both are travelling.
export const MIN_ADULTS_OVERNIGHT = 2;

// Slips collected later than this before departure leave no time to chase
// non-returns, book a replacement seat or brief staff on a medical need.
export const MIN_CONSENT_LEAD_DAYS = 3;
export const DEFAULT_CONSENT_LEAD_DAYS = 10;
export const MAX_CONSENT_LEAD_DAYS = 120;

export const MAX_STUDENTS = 2000;
export const MAX_NIGHTS = 30;
export const MAX_CONTINGENCY_PERCENT = 50;

// Money collected from parents is rounded up to a whole unit of this size so
// the amount on the slip is a number a child can actually hand over.
export const COLLECTION_ROUNDING = 10;

export const TRANSPORT_MODES = [
  { id: "coach", label: "Hired coach or bus" },
  { id: "schoolBus", label: "School bus" },
  { id: "train", label: "Train" },
  { id: "walking", label: "On foot" },
  { id: "publicTransport", label: "Public transport" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
}

export function formatLongDate(iso) {
  if (!isValidIsoDate(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

/** Shift an ISO date by whole days. */
export function addDaysIso(iso, days) {
  if (!isValidIsoDate(iso) || !Number.isFinite(days)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const stamp = Date.UTC(y, m - 1, d) + Math.trunc(days) * 86400000;
  const next = new Date(stamp);
  const pad = (n) => String(n).padStart(2, "0");
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

/** "08:45" -> 525 minutes past midnight, or null. */
export function minutesFromHhmm(value) {
  if (typeof value !== "string") return null;
  const match = HHMM.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Pupils per adult for a band, tightened when the activity is higher risk. */
export function pupilsPerAdultFor(bandId, higherRisk) {
  const band = SUPERVISION_BANDS.find((item) => item.id === bandId) || SUPERVISION_BANDS[2];
  return higherRisk ? Math.min(band.pupilsPerAdult, HIGHER_RISK_PUPILS_PER_ADULT) : band.pupilsPerAdult;
}

const clean = (value) => String(value ?? "").trim();

/**
 * Build the permission slip.
 * @returns {{error: string}} on bad input, otherwise the slip and its figures.
 */
export function buildPermissionSlip(input = {}) {
  const schoolName = clean(input.schoolName);
  const tripName = clean(input.tripName);
  const destination = clean(input.destination);
  const teacherName = clean(input.teacherName);
  const teacherContact = clean(input.teacherContact);
  const className = clean(input.className);
  const activities = clean(input.activities);
  const kitList = clean(input.kitList);
  const currencySymbol = clean(input.currencySymbol) || "INR";
  const tripDate = clean(input.tripDate);
  const departTime = clean(input.departTime);
  const returnTime = clean(input.returnTime);
  const bandId = clean(input.bandId) || "ks2";
  const transportId = clean(input.transportId) || "coach";
  const higherRisk = Boolean(input.higherRisk);
  const swimmingInvolved = Boolean(input.swimmingInvolved);
  const photosOnTrip = Boolean(input.photosOnTrip);

  const students = Number(input.students);
  const adultsAvailable = Number(input.adultsAvailable);
  const nights = Number(input.nights ?? 0);
  const transportTotalCost = Number(input.transportTotalCost ?? 0);
  const entryCostPerStudent = Number(input.entryCostPerStudent ?? 0);
  const mealCostPerStudent = Number(input.mealCostPerStudent ?? 0);
  const contingencyPercent = Number(input.contingencyPercent ?? 0);
  const consentLeadDays = Number(
    input.consentLeadDays === undefined || input.consentLeadDays === ""
      ? DEFAULT_CONSENT_LEAD_DAYS
      : input.consentLeadDays,
  );

  if (!schoolName) return { error: "Enter the school name." };
  if (!tripName) return { error: "Enter what the trip is called." };
  if (!destination) return { error: "Enter the destination." };
  if (!teacherName || !teacherContact) {
    return { error: "Enter the trip leader's name and a contact number parents can call on the day." };
  }
  if (!isValidIsoDate(tripDate)) return { error: "Enter a valid trip date in YYYY-MM-DD form." };

  const departMinutes = minutesFromHhmm(departTime);
  const returnMinutes = minutesFromHhmm(returnTime);
  if (departMinutes === null || returnMinutes === null) {
    return { error: "Enter departure and return times as 24-hour HH:MM." };
  }
  if (!Number.isFinite(nights) || nights < 0 || nights > MAX_NIGHTS) {
    return { error: `Nights away must be between 0 and ${MAX_NIGHTS}.` };
  }
  const wholeNights = Math.trunc(nights);
  const durationMinutes = wholeNights * 1440 + returnMinutes - departMinutes;
  if (durationMinutes <= 0) {
    return { error: "The return time is not after the departure time. Add a night if the trip runs overnight." };
  }

  if (!Number.isFinite(students) || students < 1 || students > MAX_STUDENTS) {
    return { error: `Enter the number of students going, between 1 and ${MAX_STUDENTS}.` };
  }
  if (!Number.isFinite(adultsAvailable) || adultsAvailable < 1 || adultsAvailable > MAX_STUDENTS) {
    return { error: "Enter how many accompanying adults are confirmed (at least one)." };
  }
  const costs = [transportTotalCost, entryCostPerStudent, mealCostPerStudent];
  if (costs.some((value) => !Number.isFinite(value) || value < 0)) {
    return { error: "Costs cannot be negative or blank - use 0 where nothing is charged." };
  }
  if (!Number.isFinite(contingencyPercent) || contingencyPercent < 0 || contingencyPercent > MAX_CONTINGENCY_PERCENT) {
    return { error: `Contingency must be between 0% and ${MAX_CONTINGENCY_PERCENT}%.` };
  }
  if (
    !Number.isFinite(consentLeadDays) ||
    consentLeadDays < MIN_CONSENT_LEAD_DAYS ||
    consentLeadDays > MAX_CONSENT_LEAD_DAYS
  ) {
    return {
      error: `Reply-by lead time must be between ${MIN_CONSENT_LEAD_DAYS} and ${MAX_CONSENT_LEAD_DAYS} days before the trip.`,
    };
  }

  const wholeStudents = Math.round(students);
  const wholeAdults = Math.round(adultsAvailable);
  const pupilsPerAdult = pupilsPerAdultFor(bandId, higherRisk);
  const ratioAdults = Math.ceil(wholeStudents / pupilsPerAdult);
  const adultsRequired = wholeNights > 0 ? Math.max(ratioAdults, MIN_ADULTS_OVERNIGHT) : ratioAdults;
  const adultsShortfall = Math.max(0, adultsRequired - wholeAdults);
  const actualPupilsPerAdult = wholeStudents / wholeAdults;

  const transportPerStudent = transportTotalCost / wholeStudents;
  const baseCostPerStudent = transportPerStudent + entryCostPerStudent + mealCostPerStudent;
  const contingencyPerStudent = baseCostPerStudent * (contingencyPercent / 100);
  const rawCostPerStudent = baseCostPerStudent + contingencyPerStudent;
  const collectPerStudent = Math.ceil(rawCostPerStudent / COLLECTION_ROUNDING) * COLLECTION_ROUNDING;
  const totalCollected = collectPerStudent * wholeStudents;
  const totalTripCost = transportTotalCost + (entryCostPerStudent + mealCostPerStudent) * wholeStudents;
  const surplus = totalCollected - totalTripCost;

  const wholeLead = Math.round(consentLeadDays);
  const replyByDate = addDaysIso(tripDate, -wholeLead);
  const durationHours = durationMinutes / 60;

  const band = SUPERVISION_BANDS.find((item) => item.id === bandId) || SUPERVISION_BANDS[2];
  const transport = TRANSPORT_MODES.find((item) => item.id === transportId) || TRANSPORT_MODES[0];

  const money = (value) => `${currencySymbol} ${Math.round(value).toLocaleString("en-IN")}`;
  const hoursLabel =
    wholeNights > 0
      ? `${wholeNights} night${wholeNights === 1 ? "" : "s"} away (${Math.round(durationHours)} hours)`
      : `${(Math.round(durationHours * 10) / 10).toFixed(1)} hours`;

  const warnings = [];
  if (adultsShortfall > 0) {
    warnings.push(`You are ${adultsShortfall} adult${adultsShortfall === 1 ? "" : "s"} short. At 1 adult to ${pupilsPerAdult} pupils, ${wholeStudents} students need ${adultsRequired} supervising adults.`);
  }
  if (higherRisk) {
    warnings.push(`Higher-risk activity tightens supervision to 1 adult per ${HIGHER_RISK_PUPILS_PER_ADULT} pupils and normally needs a qualified instructor and a written risk assessment signed off before departure.`);
  }
  if (swimmingInvolved) {
    warnings.push("Any water activity needs a separate swimming-ability declaration from parents, a lifeguard present, and a headcount routine at every entry and exit from the water.");
  }
  if (wholeNights > 0) {
    warnings.push("Overnight trips need night-time supervision arrangements, room allocation rules and at least one adult contactable through the night written into the plan.");
  }
  if (surplus < 0) {
    warnings.push(`The amount collected is ${money(Math.abs(surplus))} short of the trip's total cost. Raise the per-student charge or add contingency.`);
  }
  if (contingencyPercent === 0) {
    warnings.push("With no contingency a single price rise or a last-minute drop-out has to come out of school funds.");
  }
  if (wholeLead < 7) {
    warnings.push(`Only ${wholeLead} days to collect slips leaves little room to chase non-returns before the coach is booked.`);
  }

  const slipLines = [
    `${schoolName.toUpperCase()}`,
    "FIELD TRIP PERMISSION SLIP",
    "",
    `Trip: ${tripName}`,
    `Destination: ${destination}`,
    `Date: ${formatLongDate(tripDate)}`,
    `Departs school: ${departTime}    Returns: ${returnTime}${wholeNights > 0 ? ` (after ${wholeNights} night${wholeNights === 1 ? "" : "s"} away)` : ""}`,
    `Travelling by: ${transport.label}`,
    className ? `Class / group: ${className}` : null,
    `Trip leader: ${teacherName} - ${teacherContact}`,
    `Supervision: ${adultsRequired} adults for ${wholeStudents} students (1 adult per ${pupilsPerAdult} pupils, ${band.label}${higherRisk ? ", higher-risk activity" : ""})`,
    "",
    activities ? `PLANNED ACTIVITIES\n${activities}` : null,
    "",
    `COST\nAmount payable per student: ${money(collectPerStudent)}`,
    `This covers travel, entry and meals as listed. Please pay by ${formatLongDate(replyByDate)}.`,
    kitList ? `\nWHAT TO BRING\n${kitList}` : null,
    "",
    "PARENT / GUARDIAN SECTION",
    "Student's full name: ______________________________",
    "Class: ____________    Date of birth: ______________",
    "",
    "1. Emergency contact on the day",
    "   Name: __________________________ Relationship: ______________",
    "   Phone (must be reachable for the whole trip): ______________________",
    "   Second contact: __________________________ Phone: __________________",
    "",
    "2. Medical information",
    "   Conditions staff must know about (asthma, epilepsy, diabetes, heart condition, other):",
    "   ______________________________________________________________",
    "   Allergies, including food and insect stings: __________________________",
    "   Medication carried or to be administered, with dose and timing:",
    "   ______________________________________________________________",
    "   Does the student carry an inhaler / adrenaline auto-injector?  Yes / No",
    "   Date of last tetanus vaccination (if known): ______________",
    "   Dietary requirements: ______________________________________",
    "   Doctor's name and clinic phone: _____________________________",
    "",
    swimmingInvolved
      ? "3. Swimming declaration\n   My child can swim 25 metres unaided in light clothing:  Yes / No\n   My child may take part in supervised water activities:  Yes / No\n"
      : null,
    photosOnTrip
      ? "4. Photographs\n   Staff may photograph my child during the trip for school records and newsletters:  Yes / No\n"
      : null,
    "CONSENT",
    `I give permission for my child to take part in the trip to ${destination} on ${formatLongDate(tripDate)}, travelling by ${transport.label.toLowerCase()}.`,
    "I have told the school about every medical condition, allergy and medication above.",
    `I agree that if my child needs urgent medical treatment and I cannot be reached, ${teacherName} or another member of staff may consent to treatment advised by a qualified medical professional.`,
    "I understand staff will supervise reasonably but cannot guarantee against every risk, and that my child is expected to follow instructions and the school's code of conduct throughout.",
    "",
    "Parent / guardian name: ______________________________",
    "Signature: ______________________    Date: ______________",
    "",
    `Please return this slip to ${teacherName} by ${formatLongDate(replyByDate)}.`,
  ].filter((line) => line !== null);

  const slipText = slipLines.join("\n");

  return {
    slipText,
    pupilsPerAdult,
    bandLabel: band.label,
    transportLabel: transport.label,
    adultsRequired,
    adultsAvailable: wholeAdults,
    adultsShortfall,
    actualPupilsPerAdult,
    students: wholeStudents,
    nights: wholeNights,
    durationMinutes,
    durationHours,
    hoursLabel,
    transportPerStudent,
    baseCostPerStudent,
    contingencyPerStudent,
    rawCostPerStudent,
    collectPerStudent,
    totalCollected,
    totalTripCost,
    surplus,
    replyByDate,
    replyByLabel: formatLongDate(replyByDate),
    consentLeadDays: wholeLead,
    currencySymbol,
    warnings,
  };
}
