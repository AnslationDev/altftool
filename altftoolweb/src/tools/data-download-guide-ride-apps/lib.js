/**
 * Ride-app (Uber, Ola, Rapido) data request planner — pure logic.
 *
 * Fixed rules encoded here come from the platforms and from published law, not from
 * this module:
 *  - Uber runs a self-service Privacy Center with a "Download your data" request; the
 *    archive is emailed as a link and arrives within the statutory access window,
 *    often much sooner.
 *  - Indian operators including Ola and Rapido handle access requests through in-app
 *    support and a published Grievance Officer.
 *  - India's IT Rules 2021, Rule 3(2)(a), require an intermediary's Grievance Officer
 *    to acknowledge a complaint within 24 hours and dispose of it within 15 days.
 *  - The DPDP Act 2023 gives a Data Principal a right to a summary of personal data
 *    processed; the operative timelines sit in the rules made under the Act.
 *  - Under GDPR Art. 12(3) a controller has one month to answer an access request.
 *
 * Per-row and per-ping figures are PLANNING ESTIMATES from typical export widths, not
 * a measurement of any specific account.
 */

/** Grievance Officer acknowledgement deadline under IT Rules 2021, Rule 3(2)(a). */
export const GRIEVANCE_ACK_HOURS = 24;

/** Grievance Officer disposal deadline under IT Rules 2021, Rule 3(2)(a). */
export const GRIEVANCE_RESOLVE_DAYS = 15;

/** GDPR Art. 12(3) deadline for an access request, in days. */
export const GDPR_RESPONSE_DAYS = 30;

/** Bytes in a megabyte. */
const BYTES_PER_MB = 1024 * 1024;

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/** Months in a year, for turning a monthly ride rate into a lifetime trip count. */
const MONTHS_PER_YEAR = 12;

/** A completed trip stores a pickup point and a drop point. */
export const GEO_POINTS_PER_TRIP = 2;

/** Typical GPS breadcrumb rate along a live trip, in points per minute. */
export const ROUTE_PINGS_PER_MINUTE = 4;

/**
 * Trip-count constant for the home-inference heuristic. Repeated origins cluster fast:
 * with roughly this many trips the most common late-night pickup point is already an
 * obvious residence. Used as the decay constant in 1 - e^(-trips/k).
 */
export const HOME_INFERENCE_TRIP_CONSTANT = 40;

/**
 * Requestable ride-app data.
 *  baseMb        - one-off size independent of account age
 *  mbPerYear     - extra size per year of use
 *  bytesPerTrip  - scales with lifetime trip count
 *  bytesPerPing  - scales with the number of GPS route points
 *  sensitivity   - 1 (mundane) to 5 (precise location, safety reports, saved places)
 */
export const EXPORT_CATEGORIES = [
  {
    id: "trips",
    label: "Trip history",
    what: "Every ride with date, time, pickup and drop addresses and coordinates, distance, duration and fare.",
    baseMb: 0.3,
    mbPerYear: 0.1,
    bytesPerTrip: 600,
    bytesPerPing: 0,
    sensitivity: 5,
    note: "Two coordinates per trip is all it takes to map where you live, work and worship.",
  },
  {
    id: "routes",
    label: "GPS route traces",
    what: "Breadcrumb points recorded along the journey, and location collected while the app was open.",
    baseMb: 0.2,
    mbPerYear: 0.5,
    bytesPerTrip: 0,
    bytesPerPing: 40,
    sensitivity: 5,
    note: "Far denser than the trip list: a point every few seconds, including detours and stops.",
  },
  {
    id: "profile",
    label: "Profile and saved places",
    what: "Name, phone, email, saved Home and Work addresses, emergency contacts and linked accounts.",
    baseMb: 0.3,
    mbPerYear: 0.05,
    bytesPerTrip: 0,
    bytesPerPing: 0,
    sensitivity: 5,
    note: "Saved places state your home address outright — no inference needed.",
  },
  {
    id: "payments",
    label: "Payments and receipts",
    what: "Fares, surge multipliers, payment method used, refunds, wallet balance and promotions applied.",
    baseMb: 0.4,
    mbPerYear: 0.2,
    bytesPerTrip: 140,
    bytesPerPing: 0,
    sensitivity: 4,
    note: "Fare and time together reconstruct your commute pattern even without the addresses.",
  },
  {
    id: "safety",
    label: "Safety and incident records",
    what: "Safety reports, incident tickets, trip-share events and any recordings attached to a report.",
    baseMb: 0.5,
    mbPerYear: 0.2,
    bytesPerTrip: 0,
    bytesPerPing: 0,
    sensitivity: 5,
    note: "The most sensitive file in a ride-app export, and the one you are most likely to actually need.",
  },
  {
    id: "communications",
    label: "Driver chat and support tickets",
    what: "In-app messages with drivers, masked-call metadata and every support conversation.",
    baseMb: 0.6,
    mbPerYear: 0.4,
    bytesPerTrip: 90,
    bytesPerPing: 0,
    sensitivity: 4,
    note: "Support threads often repeat your address and partial payment details back at you.",
  },
  {
    id: "ratings",
    label: "Ratings and feedback",
    what: "Ratings you gave drivers, ratings and tags they gave you, tips and written feedback.",
    baseMb: 0.2,
    mbPerYear: 0.1,
    bytesPerTrip: 70,
    bytesPerPing: 0,
    sensitivity: 3,
    note: "Driver tags about you are visible here even though they are never shown in the app.",
  },
  {
    id: "device",
    label: "Device and app telemetry",
    what: "Device model, operating system, app version, IP addresses, sessions and crash reports.",
    baseMb: 1.5,
    mbPerYear: 2.5,
    bytesPerTrip: 0,
    bytesPerPing: 0,
    sensitivity: 4,
    note: "IP history places you geographically even on trips you never booked.",
  },
  {
    id: "deliveries",
    label: "Food and package deliveries",
    what: "Delivery orders placed through the same account, with items, delivery addresses and notes.",
    baseMb: 0.4,
    mbPerYear: 1.2,
    bytesPerTrip: 0,
    bytesPerPing: 0,
    sensitivity: 4,
    note: "Delivery notes are free text and routinely include flat numbers and gate codes.",
  },
  {
    id: "promotions",
    label: "Promotions and referrals",
    what: "Promo codes applied, referral links, campaign responses and advertising identifiers.",
    baseMb: 0.2,
    mbPerYear: 0.2,
    bytesPerTrip: 0,
    bytesPerPing: 0,
    sensitivity: 3,
    note: "Referral records link your account to friends' and family members' accounts.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Use the operator's privacy page first",
    "Uber has a self-service Privacy Center with a download request. Ola and Rapido route access requests through in-app support and a published Grievance Officer.",
  ],
  [
    "Name the categories you want in writing",
    "Ask specifically for trip history with coordinates, route traces, driver communications and safety records. A vague request tends to come back as a trip list only.",
  ],
  [
    "Quote the right rule for the platform",
    `For an Indian operator cite the Grievance Officer duty under the IT Rules 2021 — acknowledgement within ${GRIEVANCE_ACK_HOURS} hours and disposal within ${GRIEVANCE_RESOLVE_DAYS} days — and your access right under the DPDP Act 2023.`,
  ],
  [
    "Send it from the registered phone number and email",
    "Ride accounts are keyed to a phone number. A request from any other address will usually fail identity verification and be closed.",
  ],
  [
    "Download the archive promptly",
    "The link is time-limited. Save it, extract it, and check that the trip file actually contains coordinates rather than just addresses.",
  ],
  [
    "Read the saved places and safety files first",
    "Saved Home and Work entries, and any safety report, are the highest-value records in the export.",
  ],
  [
    "Cut the collection at the source",
    "Set app location permission to While Using, delete saved places you do not need, and remove emergency contacts you no longer want stored.",
  ],
  [
    "Escalate if nothing arrives",
    `If a Grievance Officer misses the ${GRIEVANCE_RESOLVE_DAYS}-day window, escalate to the operator's nodal officer, and for a GDPR-covered account note the ${GDPR_RESPONSE_DAYS}-day deadline.`,
  ],
];

/** Human-readable size from a megabyte figure. */
export function formatSize(mb) {
  if (!Number.isFinite(mb) || mb < 0) return "—";
  if (mb === 0) return "0 MB";
  if (mb < 0.01) return "<0.01 MB";
  if (mb < 1) return `${mb.toFixed(2)} MB`;
  if (mb < MB_PER_GB) return `${Math.round(mb)} MB`;
  const gb = mb / MB_PER_GB;
  return `${gb >= 10 ? Math.round(gb) : gb.toFixed(1)} GB`;
}

/** Band label for a 20-100 sensitivity score. */
export function sensitivityBand(score) {
  if (!Number.isFinite(score)) return "—";
  if (score >= 85) return "Critical";
  if (score >= 70) return "High";
  if (score >= 55) return "Moderate";
  return "Low";
}

/**
 * How easily a home address can be inferred from repeated trip origins.
 * Heuristic: 1 - e^(-trips / HOME_INFERENCE_TRIP_CONSTANT), expressed 0-99.
 * It is a readability aid, not a statistical claim about any real algorithm.
 */
export function homeInferenceIndex(totalTrips) {
  if (!Number.isFinite(totalTrips) || totalTrips <= 0) return 0;
  const value = 1 - Math.exp(-totalTrips / HOME_INFERENCE_TRIP_CONSTANT);
  return Math.min(99, Math.round(value * 100));
}

/**
 * Estimate a ride-app data request.
 *
 * Volume model:
 *   totalTrips  = tripsPerMonth * 12 * years
 *   geoPoints   = totalTrips * 2 (pickup and drop)
 *   routePings  = totalTrips * avgTripMinutes * 4
 *
 * Size model per category:
 *   baseMb + mbPerYear * years
 *          + bytesPerTrip * totalTrips / 1 MB
 *          + bytesPerPing * routePings / 1 MB
 *
 * Sensitivity score = 20 * (0.6 * highest + 0.4 * mean) of the 1-5 ratings, bounded
 * to 20-100 by construction.
 *
 * @returns {{error: string} | object} plain object; never NaN or Infinity.
 */
export function estimateExport({ selectedIds, years, tripsPerMonth, avgTripMinutes }) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one category to estimate a ride-app data request." };
  }

  const known = EXPORT_CATEGORIES.filter((category) => selectedIds.includes(category.id));
  if (known.length === 0) {
    return { error: "None of the selected items match a ride-app data category." };
  }

  const useYears = Number(years);
  if (!Number.isFinite(useYears)) {
    return { error: "Enter how many years you have used the app as a number." };
  }
  if (useYears <= 0) {
    return { error: "Years of use must be greater than zero." };
  }
  if (useYears > 17) {
    return { error: "Ride-hailing apps launched around 2009, so more than 17 years of use is not possible." };
  }

  const monthlyTrips = Number(tripsPerMonth);
  if (!Number.isFinite(monthlyTrips)) {
    return { error: "Enter your rough number of rides per month as a number." };
  }
  if (monthlyTrips < 0) {
    return { error: "Rides per month cannot be negative." };
  }
  if (monthlyTrips > 300) {
    return { error: "More than 300 rides a month is outside the range this estimate handles." };
  }

  const tripMinutes = Number(avgTripMinutes);
  if (!Number.isFinite(tripMinutes)) {
    return { error: "Enter your average ride length in minutes as a number." };
  }
  if (tripMinutes <= 0) {
    return { error: "Average ride length must be greater than zero minutes." };
  }
  if (tripMinutes > 180) {
    return { error: "An average ride longer than 180 minutes is outside this estimate." };
  }

  const totalTrips = monthlyTrips * MONTHS_PER_YEAR * useYears;
  const geoPoints = totalTrips * GEO_POINTS_PER_TRIP;
  const routePings = totalTrips * tripMinutes * ROUTE_PINGS_PER_MINUTE;

  const rows = known.map((category) => {
    const sizeMb =
      category.baseMb +
      category.mbPerYear * useYears +
      (category.bytesPerTrip * totalTrips) / BYTES_PER_MB +
      (category.bytesPerPing * routePings) / BYTES_PER_MB;
    return { ...category, sizeMb };
  });

  const totalMb = rows.reduce((sum, row) => sum + row.sizeMb, 0);

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);
  const includesRoutes = selectedIds.includes("routes");
  const includesTrips = selectedIds.includes("trips");

  return {
    rows: sorted,
    count: rows.length,
    totalMb,
    totalLabel: formatSize(totalMb),
    totalTrips: Math.round(totalTrips),
    geoPoints: includesTrips ? Math.round(geoPoints) : 0,
    routePings: includesRoutes ? Math.round(routePings) : 0,
    locationPoints:
      (includesTrips ? Math.round(geoPoints) : 0) + (includesRoutes ? Math.round(routePings) : 0),
    homeInference: includesTrips || includesRoutes ? homeInferenceIndex(totalTrips) : 0,
    largestLabel: sorted[0].label,
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    criticalCategories: rows.filter((row) => row.sensitivity >= 5).map((row) => row.label),
  };
}
