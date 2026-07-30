/**
 * Tailgating and Badge Policy Explainer — exposure model and control tiers.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * Tailgating (following an authorised person through a controlled door) is a
 * physical-access problem, so the model counts opportunities rather than
 * guessing at attacker behaviour:
 *
 *   door openings per day = staff x trips per staff per day
 *                         + visitors + deliveries and contractors
 *
 * Each opening is a moment when the door is held open by someone with a right
 * to be there. The share of those openings that nobody supervises depends on
 * what the entrance actually is: an unstaffed badge reader lets a second person
 * walk through unchallenged, a staffed reception mostly does not, and a speed
 * gate or airlock with anti-passback physically admits one person per
 * authorisation. Policies (visible badges, escorting, challenge training, forced
 * door alarms) reduce the remaining share further, multiplicatively, because
 * each one only catches some of what the previous one missed.
 *
 * ASSUMPTION, stated openly: staff are counted as making four trips through the
 * entrance on a normal day — arrive, out at lunch, back from lunch, leave. Sites
 * with on-site canteens or hybrid attendance should adjust the trips figure
 * rather than treat the output as measured data. Everything here is an estimate
 * of opportunity, not a count of incidents.
 */

/** Default trips through the entrance per person per working day. */
export const DEFAULT_TRIPS_PER_STAFF = 4;

/** Guard rails so the arithmetic cannot produce nonsense. */
export const LIMITS = {
  maxStaff: 100000,
  maxVisitors: 10000,
  maxDeliveries: 2000,
  maxTrips: 20,
};

/** What the entrance physically is. `unsupervisedShare` = fraction of openings
 *  where a second person could follow through without being stopped. */
export const ENTRY_TYPES = [
  {
    id: "openDoor",
    label: "No access control — door open during business hours",
    unsupervisedShare: 1,
    note: "Every opening is unsupervised by definition. Access control starts at the reception desk.",
  },
  {
    id: "sharedCode",
    label: "Keypad with a code everyone knows",
    unsupervisedShare: 0.9,
    note: "A shared code identifies nobody and is never revoked when someone leaves.",
  },
  {
    id: "badgeDoor",
    label: "Badge reader on an ordinary door, nobody watching",
    unsupervisedShare: 0.75,
    note: "The classic tailgating target: one badge, one door swing, any number of people.",
  },
  {
    id: "staffedReception",
    label: "Staffed reception that checks badges",
    unsupervisedShare: 0.35,
    note: "Effective while the desk is covered; the gap is early mornings, lunch and after hours.",
  },
  {
    id: "speedGate",
    label: "Speed gates or turnstiles with anti-passback",
    unsupervisedShare: 0.1,
    note: "One authorisation admits one person, and a badge cannot be re-used until it exits.",
  },
  {
    id: "mantrap",
    label: "Interlocked airlock or mantrap",
    unsupervisedShare: 0.05,
    note: "Two doors that cannot open at once. Reserved for data centres and cash areas.",
  },
];

/** Policies and controls. `reduction` is the fraction of the remaining
 *  unsupervised openings each one removes, applied multiplicatively. */
export const CONTROLS = [
  {
    id: "visibleBadge",
    label: "Badges must be worn and visible above the waist at all times",
    reduction: 0.1,
    tier: 1,
    why: "It turns 'who is that?' from an accusation into an observation anyone can make.",
  },
  {
    id: "visitorLog",
    label: "Every visitor is signed in and issued a dated, visually distinct pass",
    reduction: 0.1,
    tier: 1,
    why: "A different-coloured pass makes an unescorted visitor obvious from across the room.",
  },
  {
    id: "escort",
    label: "Visitors and contractors are escorted at all times, including to the toilets",
    reduction: 0.15,
    tier: 1,
    why: "Escorting is what stops a signed-in visitor becoming an unsupervised one.",
  },
  {
    id: "challengeTraining",
    label: "Staff are trained and explicitly authorised to challenge politely",
    reduction: 0.15,
    tier: 1,
    why: "Without written permission to challenge, most people will hold the door out of courtesy.",
  },
  {
    id: "noHoldPolicy",
    label: "A written 'do not hold the door' rule that management visibly follows",
    reduction: 0.1,
    tier: 1,
    why: "The policy fails the first time a senior person waves someone through.",
  },
  {
    id: "cctvDoor",
    label: "CCTV covers the entrance with retention long enough to review",
    reduction: 0.05,
    tier: 2,
    why: "It does not prevent entry, but it makes after-the-fact investigation possible.",
  },
  {
    id: "forcedDoorAlarm",
    label: "Doors alarm when propped or forced, and someone responds",
    reduction: 0.1,
    tier: 2,
    why: "A propped fire door defeats every reader on the front of the building.",
  },
  {
    id: "contractorBadges",
    label: "Contractors get time-limited badges tied to a named sponsor",
    reduction: 0.1,
    tier: 2,
    why: "Long-lived contractor credentials are the most common orphaned access.",
  },
  {
    id: "revocationSla",
    label: "Badges are revoked the same day someone leaves, with a monthly audit",
    reduction: 0.1,
    tier: 2,
    why: "Live badges for leavers are access nobody is monitoring.",
  },
  {
    id: "antiPassback",
    label: "Anti-passback is enabled: a badge cannot re-enter without exiting",
    reduction: 0.15,
    tier: 3,
    why: "It removes badge-sharing, which is tailgating with consent.",
  },
  {
    id: "tailgateDetection",
    label: "Tailgate detection or a supervised airlock on high-value areas",
    reduction: 0.15,
    tier: 3,
    why: "The only control that reliably catches two bodies on one authorisation.",
  },
];

const CONTROL_BY_ID = new Map(CONTROLS.map((control) => [control.id, control]));

/** What is behind the door. Drives which control tier is appropriate. */
export const SENSITIVITY = [
  { id: "general", label: "General office space", tier: 1 },
  { id: "customerData", label: "Customer or employee personal data on site", tier: 2 },
  { id: "regulated", label: "Regulated data, cash, prototypes or a server room", tier: 3 },
];

export const TIERS = {
  1: {
    id: 1,
    label: "Tier 1 — policy and behaviour",
    summary:
      "Visible badges, a visitor log, escorting, and staff who are told in writing that challenging is expected of them.",
  },
  2: {
    id: 2,
    label: "Tier 2 — supervision and audit",
    summary:
      "Everything in Tier 1 plus CCTV at the entrance, forced-door alarms, sponsored contractor badges and same-day revocation.",
  },
  3: {
    id: 3,
    label: "Tier 3 — physical enforcement",
    summary:
      "Everything above plus anti-passback and speed gates or an airlock, so one authorisation admits exactly one person.",
  },
};

/** Openings per day above which behaviour alone stops being enough. */
export const TIER2_OPENING_THRESHOLD = 60;
/** Openings per day above which physical enforcement is the realistic answer. */
export const TIER3_OPENING_THRESHOLD = 300;

/** Polite, non-confrontational challenge scripts. Static reference content. */
export const CHALLENGE_SCRIPTS = [
  ["At the door", "\"Sorry, I can't let anyone in on my badge — reception will sign you in, it takes a minute.\""],
  ["Someone already inside", "\"Hi, are you being looked after? Let me walk you to reception so you get a pass.\""],
  ["A confident stranger with a toolbox", "\"Who are you here to see? I'll call them — we sign contractors in at the desk.\""],
  ["Someone pressuring you", "\"I understand it's inconvenient, but I'd get in trouble for it. Reception is right there.\""],
];

const byId = (list, id) => list.find((item) => item.id === id);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

/**
 * Estimate unsupervised door openings and the control tier that fits.
 *
 * @param {object} input
 * @param {number|string} input.staff       people who badge in daily
 * @param {number|string} input.visitors    visitors per day
 * @param {number|string} input.deliveries  deliveries and contractor visits per day
 * @param {number|string} input.tripsPerStaff  trips through the entrance per person per day
 * @param {string} input.entryType          id from ENTRY_TYPES
 * @param {string} input.sensitivity        id from SENSITIVITY
 * @param {string[]} input.inPlace          ids of controls already in place
 * @returns {object} result, or { error }
 */
export function assessTailgating({
  staff,
  visitors = 0,
  deliveries = 0,
  tripsPerStaff = DEFAULT_TRIPS_PER_STAFF,
  entryType,
  sensitivity,
  inPlace = [],
} = {}) {
  const entry = byId(ENTRY_TYPES, entryType);
  const profile = byId(SENSITIVITY, sensitivity);
  if (!entry) return { error: "Choose what the entrance actually is." };
  if (!profile) return { error: "Choose what is behind the door." };
  if (!Array.isArray(inPlace)) return { error: "Controls in place must be a list." };
  if (inPlace.some((id) => !CONTROL_BY_ID.has(id))) {
    return { error: "One of the ticked controls is not on this list." };
  }

  const staffCount = toNumber(staff);
  const visitorCount = toNumber(visitors);
  const deliveryCount = toNumber(deliveries);
  const trips = toNumber(tripsPerStaff);

  if ([staffCount, visitorCount, deliveryCount, trips].some(Number.isNaN)) {
    return { error: "Headcount, visitors, deliveries and trips must all be numbers." };
  }
  if (staffCount < 1) return { error: "Enter at least one person using the entrance." };
  if (staffCount > LIMITS.maxStaff) return { error: `Headcount above ${LIMITS.maxStaff} is out of range.` };
  if (visitorCount < 0 || deliveryCount < 0) return { error: "Visitor and delivery counts cannot be negative." };
  if (visitorCount > LIMITS.maxVisitors) return { error: `Visitors above ${LIMITS.maxVisitors} per day is out of range.` };
  if (deliveryCount > LIMITS.maxDeliveries) return { error: `Deliveries above ${LIMITS.maxDeliveries} per day is out of range.` };
  if (trips < 1) return { error: "Each person passes the entrance at least once a day." };
  if (trips > LIMITS.maxTrips) return { error: `More than ${LIMITS.maxTrips} trips per person per day is out of range.` };

  const staffOpenings = staffCount * trips;
  const totalOpenings = staffOpenings + visitorCount + deliveryCount;

  const chosen = CONTROLS.filter((control) => inPlace.includes(control.id));
  const missing = CONTROLS.filter((control) => !inPlace.includes(control.id));
  // Multiplicative: each control only catches part of what the previous ones missed.
  const residualShare = chosen.reduce((share, control) => share * (1 - control.reduction), 1);

  const unsupervised = totalOpenings * entry.unsupervisedShare * residualShare;
  const unsupervisedPerDay = Math.round(unsupervised);
  const unsupervisedPerYear = Math.round(unsupervised * 250); // 250 working days
  const supervisedShare = totalOpenings > 0 ? 1 - unsupervised / totalOpenings : 1;

  // Which tier the site needs, and which tier it has actually implemented.
  let requiredTier = profile.tier;
  if (totalOpenings >= TIER3_OPENING_THRESHOLD) requiredTier = Math.max(requiredTier, 3);
  else if (totalOpenings >= TIER2_OPENING_THRESHOLD) requiredTier = Math.max(requiredTier, 2);

  const tierComplete = (tier) =>
    CONTROLS.filter((control) => control.tier === tier).every((control) => inPlace.includes(control.id));
  let achievedTier = 0;
  if (tierComplete(1)) achievedTier = 1;
  if (achievedTier === 1 && tierComplete(2)) achievedTier = 2;
  if (achievedTier === 2 && tierComplete(3)) achievedTier = 3;

  const gapControls = missing
    .filter((control) => control.tier <= requiredTier)
    .sort((a, b) => a.tier - b.tier || b.reduction - a.reduction);

  return {
    totalOpenings: Math.round(totalOpenings),
    staffOpenings: Math.round(staffOpenings),
    unsupervisedPerDay,
    unsupervisedPerYear,
    supervisedPercent: Math.round(supervisedShare * 1000) / 10,
    residualShare: Math.round(residualShare * 1000) / 1000,
    entry,
    profile,
    trips,
    inPlaceControls: chosen,
    missingControls: missing,
    gapControls,
    requiredTier,
    requiredTierInfo: TIERS[requiredTier],
    achievedTier,
    achievedTierInfo: achievedTier > 0 ? TIERS[achievedTier] : null,
    meetsTier: achievedTier >= requiredTier,
  };
}

/** Plain-text summary for the copy button. Pure. */
export function formatTailgatingResult(result) {
  if (!result || result.error) return "";
  const lines = [
    "Tailgating exposure estimate",
    `Unsupervised door openings: about ${result.unsupervisedPerDay} per day (~${result.unsupervisedPerYear} per working year)`,
    `Total openings per day: ${result.totalOpenings}`,
    `Entrance: ${result.entry.label}`,
    `Behind the door: ${result.profile.label}`,
    `Control tier required: ${result.requiredTierInfo.label}`,
    `Control tier achieved: ${result.achievedTierInfo ? result.achievedTierInfo.label : "None complete"}`,
  ];
  if (result.gapControls.length > 0) {
    lines.push("", "Missing controls for the required tier:");
    result.gapControls.forEach((control) => lines.push(`- ${control.label}`));
  }
  return lines.join("\n");
}
