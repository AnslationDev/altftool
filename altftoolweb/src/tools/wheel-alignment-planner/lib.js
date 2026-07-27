/**
 * Wheel alignment and wheel balancing planning.
 *
 * These are two different jobs that get confused constantly:
 *   - Alignment sets the geometry (camber, caster, toe) so the wheels point
 *     where the steering says. Bad alignment shows up as pulling, an off-centre
 *     steering wheel and wear concentrated on one edge of the tread.
 *   - Balancing distributes mass around each wheel so it does not shake at
 *     speed. Bad balance shows up as vibration in a narrow speed band,
 *     typically 80-110 km/h, and nothing at all at low speed.
 *
 * Base intervals below are the usual workshop recommendation: alignment about
 * every 10,000 km or 6 months, balancing about every 5,000 km, and both
 * immediately after certain events regardless of distance.
 */

export const BASE_ALIGNMENT = { km: 10000, months: 6 };
export const BASE_BALANCING = { km: 5000, months: 6 };

export const ROAD_QUALITY = [
  {
    id: "poor",
    label: "Poor — potholes, broken edges, unpaved stretches daily",
    factor: 0.5,
    why: "Every hard pothole hit can shift toe settings and throw a wheel weight off.",
  },
  {
    id: "average",
    label: "Average — mixed city roads with occasional bad patches",
    factor: 1,
    why: "The condition the standard interval assumes.",
  },
  {
    id: "good",
    label: "Good — smooth highways and well-maintained city roads",
    factor: 1.3,
    why: "Little impact loading, so settings hold for longer.",
  },
];

/** Events that require the job now, whatever the odometer says. */
export const TRIGGER_EVENTS = [
  {
    id: "kerbStrike",
    label: "Hit a kerb or a deep pothole hard",
    forces: "alignment",
    why: "A single hard impact is enough to knock toe out of specification.",
  },
  {
    id: "newTyres",
    label: "New tyres fitted",
    forces: "both",
    why: "Balance is mandatory on fitting, and alignment protects the new tread from the first kilometre.",
  },
  {
    id: "punctureRepair",
    label: "Puncture repaired or a wheel removed",
    forces: "balancing",
    why: "The patch, plug or refitted tyre changes the mass distribution of that wheel.",
  },
  {
    id: "suspensionWork",
    label: "Suspension or steering part replaced",
    forces: "alignment",
    why: "Replacing any joint or arm changes geometry; alignment is part of the job, not an extra.",
  },
  {
    id: "rideHeightChange",
    label: "Ride height changed (lowered, lifted or new springs)",
    forces: "alignment",
    why: "Camber and toe move with ride height on almost every suspension design.",
  },
  {
    id: "wheelWeightLost",
    label: "A wheel weight came off",
    forces: "balancing",
    why: "Even 10 g missing at the rim is enough to feel through the steering at highway speed.",
  },
];

/** Symptoms, scored towards one job or the other. */
export const SYMPTOMS = [
  {
    id: "offCentre",
    label: "Steering wheel is off-centre when driving straight",
    points: { alignment: 5, balancing: 0 },
  },
  {
    id: "pulls",
    label: "Car pulls to one side on a flat, level road",
    points: { alignment: 4, balancing: 0 },
    note: "Rule out uneven tyre pressures first — that mimics a pull exactly.",
  },
  {
    id: "edgeWear",
    label: "Tyre worn on one edge only",
    points: { alignment: 4, balancing: 0 },
  },
  {
    id: "featherEdge",
    label: "Tread blocks feel feathered or saw-toothed when you run a hand across",
    points: { alignment: 3, balancing: 0 },
  },
  {
    id: "squealTurning",
    label: "Tyres squeal on gentle turns at low speed",
    points: { alignment: 2, balancing: 0 },
  },
  {
    id: "steeringShake",
    label: "Steering wheel shakes in a narrow band around 80-110 km/h",
    points: { alignment: 0, balancing: 5 },
  },
  {
    id: "seatShake",
    label: "Vibration felt through the seat rather than the steering wheel",
    points: { alignment: 0, balancing: 4 },
    note: "A seat-felt vibration usually points at the rear wheels rather than the front.",
  },
  {
    id: "cuppedWear",
    label: "Cupped or patchy wear around the tread circumference",
    points: { alignment: 1, balancing: 3 },
    note: "Persistent imbalance and worn dampers both cup a tyre; check both.",
  },
  {
    id: "brakingShake",
    label: "Shaking only while braking",
    points: { alignment: 0, balancing: 0 },
    note: "This is brake disc run-out, not balance or alignment. Have the discs measured.",
  },
];

/** A symptom score at or above this means book the job now. */
export const ACTION_SCORE = 4;
/** Warn once this share of an interval is used. */
export const DUE_SOON_PERCENT = 90;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

export function getRoadQuality(id) {
  return ROAD_QUALITY.find((item) => item.id === id) || null;
}

function computeService(base, factor, kmSince, monthsSince, monthlyKm) {
  const intervalKm = Math.max(500, Math.round((base.km * factor) / 500) * 500);
  const intervalMonths = Math.max(1, Math.round(base.months * factor * 10) / 10);

  const kmRemaining = intervalKm - kmSince;
  const monthsByDistance = kmRemaining / monthlyKm;
  const monthsByTime = intervalMonths - monthsSince;
  const monthsRemaining = Math.min(monthsByDistance, monthsByTime);
  const percentUsed = Math.max((kmSince / intervalKm) * 100, (monthsSince / intervalMonths) * 100);

  let status = "ok";
  if (percentUsed >= 100 || monthsRemaining <= 0) status = "overdue";
  else if (percentUsed >= DUE_SOON_PERCENT) status = "due-soon";

  return {
    intervalKm,
    intervalMonths,
    kmRemaining: Math.round(kmRemaining),
    monthsRemaining: round1(monthsRemaining),
    monthsByDistance: round1(monthsByDistance),
    monthsByTime: round1(monthsByTime),
    limitedBy: monthsByDistance <= monthsByTime ? "distance" : "time",
    percentUsed: round1(percentUsed),
    status,
  };
}

export const RECOMMENDATIONS = {
  both: "Book alignment and balancing together",
  alignment: "Book a wheel alignment",
  balancing: "Book wheel balancing",
  "on-schedule": "Nothing due yet — recheck at the next service",
};

/**
 * @param {object} input
 * @param {string} input.roadQuality        ROAD_QUALITY[].id
 * @param {number} input.alignmentKmSince   km since the last alignment
 * @param {number} input.alignmentMonthsSince months since the last alignment
 * @param {number} input.balanceKmSince     km since the last balancing
 * @param {number} input.balanceMonthsSince months since the last balancing
 * @param {number} input.monthlyKm          average km per month
 * @param {string[]} [input.events]         TRIGGER_EVENTS[].id values
 * @param {string[]} [input.symptoms]       SYMPTOMS[].id values
 */
export function planWheelServices({
  roadQuality,
  alignmentKmSince,
  alignmentMonthsSince,
  balanceKmSince,
  balanceMonthsSince,
  monthlyKm,
  events = [],
  symptoms = [],
}) {
  const road = getRoadQuality(roadQuality);
  if (!road) return { error: "Choose the road quality you mostly drive on." };

  const values = [
    alignmentKmSince,
    alignmentMonthsSince,
    balanceKmSince,
    balanceMonthsSince,
    monthlyKm,
  ];
  if (!values.every(isNum)) {
    return { error: "Enter valid numbers for every distance and month field." };
  }
  if (values.some((value) => value < 0)) {
    return { error: "Distances and months cannot be negative." };
  }
  if (monthlyKm <= 0) return { error: "Average monthly running must be greater than zero." };
  if (alignmentKmSince > 500000 || balanceKmSince > 500000) {
    return { error: "That is beyond any plausible service history — check the distances." };
  }
  if (alignmentMonthsSince > 240 || balanceMonthsSince > 240) {
    return { error: "Months since the last service is beyond a plausible history." };
  }

  const alignment = computeService(
    BASE_ALIGNMENT,
    road.factor,
    alignmentKmSince,
    alignmentMonthsSince,
    monthlyKm,
  );
  const balancing = computeService(
    BASE_BALANCING,
    road.factor,
    balanceKmSince,
    balanceMonthsSince,
    monthlyKm,
  );

  const eventList = Array.isArray(events) ? events : [];
  const appliedEvents = TRIGGER_EVENTS.filter((event) => eventList.includes(event.id));
  const forcesAlignment = appliedEvents.some(
    (event) => event.forces === "alignment" || event.forces === "both",
  );
  const forcesBalancing = appliedEvents.some(
    (event) => event.forces === "balancing" || event.forces === "both",
  );

  const symptomList = Array.isArray(symptoms) ? symptoms : [];
  const appliedSymptoms = SYMPTOMS.filter((symptom) => symptomList.includes(symptom.id));
  const alignmentScore = appliedSymptoms.reduce((acc, s) => acc + s.points.alignment, 0);
  const balancingScore = appliedSymptoms.reduce((acc, s) => acc + s.points.balancing, 0);

  const alignmentNeeded =
    forcesAlignment || alignmentScore >= ACTION_SCORE || alignment.status === "overdue";
  const balancingNeeded =
    forcesBalancing || balancingScore >= ACTION_SCORE || balancing.status === "overdue";

  let recommendation = "on-schedule";
  if (alignmentNeeded && balancingNeeded) recommendation = "both";
  else if (alignmentNeeded) recommendation = "alignment";
  else if (balancingNeeded) recommendation = "balancing";

  const notes = appliedSymptoms.filter((symptom) => symptom.note).map((symptom) => symptom.note);
  if (alignmentNeeded) {
    notes.push("Set tyre pressures to the door-jamb figures before the alignment, not after.");
  }
  if (balancingNeeded) {
    notes.push("Ask for all four wheels balanced — a rear imbalance is felt in the seat, not the wheel.");
  }
  if (recommendation === "on-schedule") {
    notes.push("Check tyre pressures monthly; under-inflation mimics both misalignment and imbalance.");
  }

  return {
    roadLabel: road.label,
    roadFactor: road.factor,
    alignment,
    balancing,
    alignmentScore,
    balancingScore,
    alignmentNeeded,
    balancingNeeded,
    forcedByEvents: appliedEvents.map((event) => ({ label: event.label, forces: event.forces, why: event.why })),
    recommendation,
    recommendationLabel: RECOMMENDATIONS[recommendation],
    notes,
  };
}
