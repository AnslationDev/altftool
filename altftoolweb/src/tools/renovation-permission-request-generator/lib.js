/**
 * Flat renovation permission request builder (India).
 *
 * Sources for the rules and figures used below:
 *  - Model Bye-laws for Co-operative Housing Societies (Maharashtra, 2014), bye-law 168:
 *    a member must not make any addition, alteration or structural change in the flat without
 *    the previous written permission of the committee and of the local authority.
 *  - Noise Pollution (Regulation and Control) Rules 2000, Schedule: the ambient noise limit in a
 *    residential area is 55 dB(A) Leq during the day and 45 dB(A) Leq at night; night time runs
 *    from 10 p.m. to 6 a.m. In a silence zone the limits are 50 and 40 dB(A) Leq.
 *  - Construction and Demolition Waste Management Rules 2016, rule 4: every waste generator must
 *    segregate construction and demolition waste and hand it to an authorised collection point;
 *    a generator producing more than 20 tonnes in a day or 300 tonnes in a month for a project
 *    must file a waste management plan with the local authority before starting work.
 *  - National Building Code of India 2016: alterations affecting load-bearing members need the
 *    certificate of a licensed structural engineer.
 */

/** Noise Rules 2000 — residential daytime ambient limit. */
export const NOISE_DAY_LIMIT_DB = 55;

/** Noise Rules 2000 — residential night-time ambient limit. */
export const NOISE_NIGHT_LIMIT_DB = 45;

/** Noise Rules 2000 — night time begins at 22:00 and ends at 06:00. */
export const NIGHT_START_MINUTES = 22 * 60;
export const NIGHT_END_MINUTES = 6 * 60;

/** C&D Waste Rules 2016 rule 4 — waste management plan thresholds. */
export const DEBRIS_PLAN_TONNES_PER_DAY = 20;
export const DEBRIS_PLAN_TONNES_PER_MONTH = 300;

/** Typical hours a managing committee permits; not a statutory figure, so it is only a default. */
export const DEFAULT_WORK_START = "09:00";
export const DEFAULT_WORK_END = "18:00";

export const WORK_ITEMS = [
  { id: "painting", label: "Painting, polishing and putty work", structural: false, wet: false, elevation: false },
  { id: "flooring", label: "Breaking and relaying floor tiles", structural: false, wet: false, elevation: false },
  { id: "false-ceiling", label: "False ceiling, cove lighting and carpentry", structural: false, wet: false, elevation: false },
  { id: "kitchen", label: "Modular kitchen and cabinetry", structural: false, wet: false, elevation: false },
  { id: "electrical", label: "Rewiring and new electrical points", structural: false, wet: false, elevation: false },
  { id: "plumbing", label: "Re-routing concealed plumbing lines", structural: false, wet: true, elevation: false },
  { id: "bathroom", label: "Bathroom re-tiling and waterproofing", structural: false, wet: true, elevation: false },
  { id: "wall-removal", label: "Removing or shifting an internal wall", structural: true, wet: false, elevation: false },
  { id: "beam-column", label: "Any work touching a beam, column or slab", structural: true, wet: false, elevation: false },
  { id: "window", label: "Changing windows, grills or the external elevation", structural: true, wet: false, elevation: true },
  { id: "toilet-shift", label: "Shifting a toilet or its drainage stack", structural: true, wet: true, elevation: false },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_DAYS = 30;

const isIsoDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
const isTime = (value) => typeof value === "string" && /^\d{2}:\d{2}$/.test(value.trim());
const clean = (value) => (typeof value === "string" ? value.trim() : "");
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/** "HH:MM" -> minutes past midnight, or null. */
export function timeToMinutes(value) {
  if (!isTime(value)) return null;
  const [hours, minutes] = value.trim().split(":").map(Number);
  if (!(hours >= 0 && hours <= 23) || !(minutes >= 0 && minutes <= 59)) return null;
  return hours * 60 + minutes;
}

/** Inclusive count of calendar days between two ISO dates, or null. */
export function daysBetween(startIso, endIso) {
  if (!isIsoDate(startIso) || !isIsoDate(endIso)) return null;
  const [sy, sm, sd] = startIso.trim().split("-").map(Number);
  const [ey, em, ed] = endIso.trim().split("-").map(Number);
  const start = Date.UTC(sy, sm - 1, sd);
  const end = Date.UTC(ey, em - 1, ed);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.round((end - start) / DAY_MS) + 1;
}

export function formatLongDate(isoDate) {
  if (!isIsoDate(isoDate)) return "";
  const [year, month, day] = isoDate.trim().split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  if (!(month >= 1 && month <= 12)) return "";
  return `${String(day).padStart(2, "0")} ${months[month - 1]} ${year}`;
}

/** What the chosen scope of work triggers. */
export function classifyScope(selectedIds = []) {
  const chosen = WORK_ITEMS.filter((item) => selectedIds.includes(item.id));
  return {
    items: chosen,
    structural: chosen.some((item) => item.structural),
    elevation: chosen.some((item) => item.elevation),
    wet: chosen.some((item) => item.wet),
  };
}

/**
 * Debris load from the number of trips and the capacity of each trip.
 * Returns { error } or { totalTonnes, perDayTonnes, perMonthTonnes, planRequired, reasons }.
 */
export function computeDebrisLoad({ trips, tonnesPerTrip, durationDays }) {
  const tripCount = Number(trips);
  const capacity = Number(tonnesPerTrip);
  const period = Number(durationDays);

  if (!Number.isFinite(tripCount) || tripCount < 0 || tripCount > 10000) {
    return { error: "Number of debris trips must be between 0 and 10,000." };
  }
  if (!Number.isFinite(capacity) || capacity <= 0 || capacity > 40) {
    return { error: "Tonnes carried per trip must be more than 0 and at most 40." };
  }
  if (!Number.isFinite(period) || period <= 0) {
    return { error: "The work period must be at least one day." };
  }

  const totalTonnes = tripCount * capacity;
  const perDayTonnes = totalTonnes / period;
  const perMonthTonnes = period >= MONTH_DAYS ? (totalTonnes / period) * MONTH_DAYS : totalTonnes;

  const reasons = [];
  if (perDayTonnes > DEBRIS_PLAN_TONNES_PER_DAY) {
    reasons.push(
      `${round2(perDayTonnes)} tonnes a day is above the ${DEBRIS_PLAN_TONNES_PER_DAY}-tonne daily threshold in rule 4 of the C&D Waste Rules 2016.`,
    );
  }
  if (perMonthTonnes > DEBRIS_PLAN_TONNES_PER_MONTH) {
    reasons.push(
      `${round2(perMonthTonnes)} tonnes a month is above the ${DEBRIS_PLAN_TONNES_PER_MONTH}-tonne monthly threshold in rule 4 of the C&D Waste Rules 2016.`,
    );
  }

  return {
    totalTonnes: round2(totalTonnes),
    perDayTonnes: round2(perDayTonnes),
    perMonthTonnes: round2(perMonthTonnes),
    planRequired: reasons.length > 0,
    reasons,
  };
}

/**
 * Build the permission request letter.
 * Returns { error } or { letter, durationDays, scope, debris, requirements, warnings, checklist }.
 */
export function buildRenovationRequest({
  societyName = "",
  societyAddress = "",
  memberName = "",
  flatNumber = "",
  wing = "",
  letterDate = "",
  startDate = "",
  endDate = "",
  workStart = DEFAULT_WORK_START,
  workEnd = DEFAULT_WORK_END,
  workOnSundays = false,
  silenceZone = false,
  selectedWork = [],
  contractorName = "",
  contractorPhone = "",
  workerCount = 0,
  liftUse = true,
  debrisTrips = 0,
  tonnesPerTrip = 1,
  securityDeposit = 0,
  contactPhone = "",
  extraNote = "",
}) {
  const society = clean(societyName);
  const member = clean(memberName);
  const flat = clean(flatNumber);

  if (!society) return { error: "Enter the name of the housing society." };
  if (!member) return { error: "Enter the name of the member applying." };
  if (!flat) return { error: "Enter the flat number." };
  if (!isIsoDate(letterDate)) return { error: "Pick the date of the letter." };
  if (!isIsoDate(startDate)) return { error: "Pick the date the work is to start." };
  if (!isIsoDate(endDate)) return { error: "Pick the date the work is to finish." };

  const durationDays = daysBetween(startDate, endDate);
  if (durationDays === null) return { error: "The work dates must be real calendar dates." };
  if (durationDays <= 0) return { error: "The finish date must be on or after the start date." };
  if (durationDays > 365) return { error: "A single permission request should not run beyond 365 days." };
  if (startDate < letterDate) {
    return { error: "The work cannot start before the date of the letter." };
  }

  const startMinutes = timeToMinutes(workStart);
  const endMinutes = timeToMinutes(workEnd);
  if (startMinutes === null || endMinutes === null) {
    return { error: "Enter the working hours as HH:MM times." };
  }
  if (endMinutes <= startMinutes) {
    return { error: "The daily finish time must be after the start time." };
  }

  if (!Array.isArray(selectedWork) || selectedWork.length === 0) {
    return { error: "Tick at least one item of work you want permission for." };
  }
  const scope = classifyScope(selectedWork);
  if (scope.items.length === 0) {
    return { error: "The selected work items are not recognised." };
  }

  const workers = Number(workerCount);
  if (!Number.isFinite(workers) || workers < 0 || workers > 200) {
    return { error: "Number of workers must be between 0 and 200." };
  }
  const deposit = Number(securityDeposit);
  if (!Number.isFinite(deposit) || deposit < 0) {
    return { error: "The security deposit cannot be negative." };
  }

  const debris = computeDebrisLoad({ trips: debrisTrips, tonnesPerTrip, durationDays });
  if (debris.error) return { error: debris.error };

  const warnings = [];
  if (startMinutes < NIGHT_END_MINUTES || endMinutes > NIGHT_START_MINUTES) {
    warnings.push(
      `Work between 10 p.m. and 6 a.m. falls in the night period of the Noise Rules 2000, when the residential limit drops to ${NOISE_NIGHT_LIMIT_DB} dB(A) Leq. Keep noisy work inside daytime hours.`,
    );
  }
  if (workOnSundays) {
    warnings.push(
      "Most managing committees do not allow noisy work on Sundays and public holidays — confirm this in writing before you commit to the schedule.",
    );
  }
  if (debris.planRequired) {
    warnings.push(...debris.reasons);
  }

  const requirements = [];
  if (scope.structural) {
    requirements.push(
      "Certificate from a licensed structural engineer confirming that no load-bearing member is weakened (bye-law 168 and the National Building Code 2016).",
    );
    requirements.push(
      "Written permission of the local authority, since the work is an alteration and not mere internal redecoration.",
    );
  }
  if (scope.elevation) {
    requirements.push(
      "Committee approval for the change in elevation, because the external face of the building is common property.",
    );
  }
  if (scope.wet) {
    requirements.push(
      "Waterproofing warranty from the contractor and an undertaking to make good any seepage into the flat below.",
    );
  }
  if (debris.planRequired) {
    requirements.push(
      "Construction and demolition waste management plan filed with the local authority before work starts (rule 4, C&D Waste Rules 2016).",
    );
  }
  requirements.push(
    `Debris carried out in covered bags or a covered vehicle to an authorised collection point — an estimated ${debris.totalTonnes} tonnes over ${durationDays} day(s).`,
  );
  requirements.push(
    `Ambient noise held to ${silenceZone ? NOISE_DAY_LIMIT_DB - 5 : NOISE_DAY_LIMIT_DB} dB(A) Leq during the day, the limit for a ${silenceZone ? "silence zone" : "residential area"} under the Noise Rules 2000.`,
  );

  const flatLabel = clean(wing) ? `Flat No. ${flat}, ${clean(wing)}` : `Flat No. ${flat}`;
  const scopeBlock = scope.items.map((item, index) => `${index + 1}. ${item.label}`).join("\n");
  const requirementBlock = requirements.map((item, index) => `${index + 1}. ${item}`).join("\n");

  const contractorBlock = [
    clean(contractorName) ? `Contractor: ${clean(contractorName)}` : "Contractor: to be confirmed",
    clean(contractorPhone) ? `Contractor phone: ${clean(contractorPhone)}` : "",
    `Workers on site: about ${Math.round(workers)}, whose photo identity proofs will be lodged with the security desk before entry`,
    liftUse
      ? "Material and debris will move through the service lift with protective sheets on the walls and floor"
      : "Material and debris will move by the staircase only; the lift will not be used for construction material",
  ]
    .filter(Boolean)
    .join("\n");

  const letter = [
    formatLongDate(letterDate),
    "",
    "To,",
    "The Secretary / Hon. Chairman,",
    society,
    clean(societyAddress),
    "",
    `Subject: Permission to carry out interior renovation in ${flatLabel}`,
    "",
    "Respected Sir / Madam,",
    "",
    `I am the member holding ${flatLabel}. I propose to carry out interior renovation work in my flat and request the managing committee's written permission before I begin.`,
    "",
    "Scope of work:",
    scopeBlock,
    "",
    `Proposed period: ${formatLongDate(startDate)} to ${formatLongDate(endDate)} (${durationDays} day(s)).`,
    `Working hours: ${clean(workStart)} to ${clean(workEnd)}, ${workOnSundays ? "including Sundays if the committee permits" : "Monday to Saturday only, with no work on Sundays or public holidays"}.`,
    "",
    "Contractor and manpower:",
    contractorBlock,
    "",
    "Undertakings:",
    requirementBlock,
    deposit > 0
      ? `\nI am depositing Rs ${Math.round(deposit).toLocaleString("en-IN")} as a refundable security deposit against damage to common areas, to be returned after the committee inspects the passage, lift and staircase at the end of the work.`
      : "",
    clean(extraNote) ? `\n${clean(extraNote)}` : "",
    "",
    "I request the committee to grant permission in writing so that the work can begin on the date proposed. I will keep the society informed of any change in the schedule.",
    "",
    "Yours faithfully,",
    "(signature)",
    member,
    flatLabel,
    clean(contactPhone) ? `Phone: ${clean(contactPhone)}` : "",
  ]
    .filter((line) => line !== undefined && line !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    letter,
    durationDays,
    scope,
    debris,
    requirements,
    warnings,
    noiseLimitDay: silenceZone ? NOISE_DAY_LIMIT_DB - 5 : NOISE_DAY_LIMIT_DB,
    noiseLimitNight: silenceZone ? NOISE_NIGHT_LIMIT_DB - 5 : NOISE_NIGHT_LIMIT_DB,
    dailyHours: round2((endMinutes - startMinutes) / 60),
    wordCount: letter.split(/\s+/).filter(Boolean).length,
  };
}
