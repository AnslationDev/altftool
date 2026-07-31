/**
 * Renter Security Checklist — weighted move-in safety audit.
 *
 * Each item is tied to a published standard or a widely used code rule, quoted
 * in `basis` so a renter can point at it when asking a landlord for a fix:
 *
 *  - Deadbolts: ANSI/BHMA A156.5 grades a deadbolt Grade 1 to 3; the standard
 *    requires a bolt throw of at least 1 inch (25 mm).
 *  - Strike plates: fixing with 3-inch (76 mm) screws reaches the wall stud
 *    rather than only the door jamb trim.
 *  - Smoke alarms: NFPA 72 requires an alarm inside every sleeping room,
 *    outside each sleeping area, and on every storey; units are replaced 10
 *    years from the date of manufacture and tested monthly.
 *  - CO alarms: required outside sleeping areas on any storey with a
 *    fuel-burning appliance or an attached garage.
 *  - GFCI/RCD protection: US NEC 210.8 requires it at bathroom, kitchen,
 *    laundry and outdoor receptacles; the equivalent in India is a 30 mA RCCB.
 *  - Wi-Fi: WPA2 or WPA3 with the router's factory admin password changed.
 *
 * Scoring is a weighted percentage:
 *     score = 100 * (sum of weights of completed items) / (sum of all weights)
 * Severity weights are 5 (critical, life-safety or entry), 3 (high), 2
 * (medium) and 1 (good practice).
 *
 * Pure module: no React, no DOM, no clock reads. Dates come in as arguments.
 */

/** Severity weights used in the weighted score. */
export const SEVERITY_WEIGHT = { critical: 5, high: 3, medium: 2, low: 1 };

/** Section order for the report. */
export const SECTIONS = [
  { id: "entry", label: "Doors and entry" },
  { id: "fire", label: "Fire and gas safety" },
  { id: "windows", label: "Windows and outdoor" },
  { id: "utilities", label: "Utilities and electrics" },
  { id: "digital", label: "Digital and privacy" },
  { id: "paperwork", label: "Paperwork and proof" },
];

/** The checklist. `basis` is the rule the item comes from. */
export const CHECKLIST = [
  {
    id: "locks-rekeyed",
    section: "entry",
    severity: "critical",
    label: "Every exterior lock was rekeyed or replaced at move-in",
    basis: "You cannot know how many keys the previous tenant, cleaners or agents still hold.",
  },
  {
    id: "deadbolt-grade",
    section: "entry",
    severity: "critical",
    label: "Main door has a deadbolt with a bolt throw of at least 25 mm (1 inch)",
    basis: "ANSI/BHMA A156.5 sets 1 inch as the minimum throw for a graded deadbolt.",
  },
  {
    id: "strike-screws",
    section: "entry",
    severity: "high",
    label: "Strike plate is fixed with 76 mm (3 inch) screws into the stud",
    basis: "Short screws hold only the jamb trim, which is the usual failure point in a kick-in.",
  },
  {
    id: "peephole",
    section: "entry",
    severity: "high",
    label: "Wide-angle peephole or video doorbell covers the main door",
    basis: "Lets you identify a caller without opening the door or relying on the chain.",
  },
  {
    id: "secondary-lock",
    section: "entry",
    severity: "medium",
    label: "Secondary latch, chain or door reinforcement fitted",
    basis: "A second point of resistance buys time even after the primary lock fails.",
  },
  {
    id: "smoke-bedrooms",
    section: "fire",
    severity: "critical",
    label: "A working smoke alarm inside every bedroom and outside each sleeping area",
    basis: "NFPA 72 placement rule for dwelling units.",
  },
  {
    id: "smoke-age",
    section: "fire",
    severity: "high",
    label: "No smoke alarm is more than 10 years past its date of manufacture",
    basis: "NFPA 72 requires replacement 10 years from the manufacture date printed on the unit.",
  },
  {
    id: "co-alarm",
    section: "fire",
    severity: "critical",
    label: "CO alarm outside sleeping areas if there is gas, a boiler or an attached garage",
    basis: "Carbon monoxide is odourless; detection is the only warning.",
  },
  {
    id: "extinguisher",
    section: "fire",
    severity: "medium",
    label: "An ABC dry-powder extinguisher within reach of the kitchen",
    basis: "ABC rating covers ordinary combustibles, flammable liquids and live electrical fires.",
  },
  {
    id: "two-exits",
    section: "fire",
    severity: "high",
    label: "Two usable ways out, and any security grille opens from inside without a key",
    basis: "A grille that needs a key from the inside turns a fire escape into a trap.",
  },
  {
    id: "window-locks",
    section: "windows",
    severity: "high",
    label: "Every ground-floor and accessible window locks and the lock actually engages",
    basis: "Ground-floor and balcony-adjacent windows are the second most common entry point after doors.",
  },
  {
    id: "sliding-block",
    section: "windows",
    severity: "medium",
    label: "Sliding doors have a bar or dowel in the track plus an anti-lift measure",
    basis: "A standard sliding-door latch can be defeated by lifting the panel out of the track.",
  },
  {
    id: "lighting",
    section: "windows",
    severity: "medium",
    label: "Entrances, the parking area and the path to the door are lit at night",
    basis: "Lighting is the cheapest deterrent and the one a landlord agrees to most easily.",
  },
  {
    id: "shrubs",
    section: "windows",
    severity: "low",
    label: "No screening shrubs or stored items give cover next to windows and the door",
    basis: "Cover matters more to an intruder than any single lock.",
  },
  {
    id: "shutoffs",
    section: "utilities",
    severity: "high",
    label: "You have found and photographed the water shut-off, gas valve and the electrical panel",
    basis: "Finding these during an actual leak or fault costs the minutes that matter.",
  },
  {
    id: "gfci",
    section: "utilities",
    severity: "critical",
    label: "Bathroom, kitchen and outdoor sockets are on a GFCI/RCD and it trips when tested",
    basis: "NEC 210.8 in the US; a 30 mA RCCB is the equivalent protection in Indian wiring practice.",
  },
  {
    id: "no-overload",
    section: "utilities",
    severity: "medium",
    label: "No daisy-chained extension boards feeding a heater, geyser or AC",
    basis: "High-draw appliances on a shared board are a common cause of rental fires.",
  },
  {
    id: "router",
    section: "digital",
    severity: "high",
    label: "The router's factory admin password was changed and Wi-Fi is WPA2 or WPA3",
    basis: "A landlord-supplied router often still has the label password and prior tenants' access.",
  },
  {
    id: "smart-devices",
    section: "digital",
    severity: "critical",
    label: "Every smart lock, camera and hub left in the flat was factory reset into your account",
    basis: "A previous owner's account can otherwise still unlock doors and view cameras.",
  },
  {
    id: "camera-sweep",
    section: "digital",
    severity: "high",
    label: "You have checked bedrooms and bathrooms for cameras, including in smoke-alarm housings",
    basis: "Check devices with a lens line of sight to a bed; scan the network for unknown devices.",
  },
  {
    id: "condition-photos",
    section: "paperwork",
    severity: "critical",
    label: "Dated move-in photos or video of every room, including existing damage",
    basis: "This is the single strongest evidence in a deposit dispute.",
  },
  {
    id: "deposit-receipt",
    section: "paperwork",
    severity: "high",
    label: "You hold a written receipt for the deposit and a signed copy of the agreement",
    basis: "An unreceipted cash deposit is very hard to recover.",
  },
  {
    id: "ownership",
    section: "paperwork",
    severity: "critical",
    label: "You verified the landlord actually owns or is authorised to let the property",
    basis: "Sub-letting fraud is stopped by checking ownership papers or the society's records.",
  },
  {
    id: "insurance",
    section: "paperwork",
    severity: "medium",
    label: "Renter's contents insurance is in force",
    basis: "A landlord's building policy does not cover a tenant's belongings.",
  },
  {
    id: "emergency-contacts",
    section: "paperwork",
    severity: "low",
    label: "Emergency numbers, the landlord's number and a neighbour's number are saved offline",
    basis: "Written down, they still work when the phone is dead or the network is out.",
  },
];

/** Score bands, inclusive upper bounds on the weighted percentage. */
export const SCORE_BANDS = [
  { max: 39, label: "Unsafe", advice: "Do not sleep on the open critical items — fix or escalate them before anything else." },
  { max: 64, label: "Patchy", advice: "The basics are half done. Clear every critical item this week." },
  { max: 84, label: "Reasonable", advice: "Solid. Close the remaining high-severity items and you are in good shape." },
  { max: 100, label: "Secure", advice: "Well covered. Re-run this at each renewal and test alarms monthly." },
];

/** Smoke alarms are replaced 10 years from the manufacture date (NFPA 72). */
export const SMOKE_ALARM_LIFE_YEARS = 10;

/** Days in a Gregorian year on average (146097 days / 400 years). */
const DAYS_PER_YEAR = 365.2425;

/** Total weight available across the whole checklist. */
export const TOTAL_WEIGHT = CHECKLIST.reduce(
  (sum, item) => sum + SEVERITY_WEIGHT[item.severity],
  0,
);

/**
 * Score a set of completed item ids.
 *
 * @param {string[]} completedIds - ids of ticked items
 * @returns {{
 *   score: number, earnedWeight: number, totalWeight: number,
 *   band: {label: string, advice: string},
 *   completedCount: number, totalCount: number,
 *   criticalOpen: Array<object>, nextActions: Array<object>,
 *   bySection: Array<{id: string, label: string, done: number, total: number, percent: number}>
 * } | {error: string}}
 */
export function scoreChecklist(completedIds) {
  if (!Array.isArray(completedIds)) {
    return { error: "Pass the completed item ids as an array." };
  }
  const valid = new Set(CHECKLIST.map((item) => item.id));
  const done = new Set(completedIds.filter((id) => valid.has(id)));

  const earnedWeight = CHECKLIST.reduce(
    (sum, item) => (done.has(item.id) ? sum + SEVERITY_WEIGHT[item.severity] : sum),
    0,
  );

  // TOTAL_WEIGHT is a non-zero constant built from the checklist, but guard
  // anyway so an emptied checklist can never divide by zero.
  if (TOTAL_WEIGHT <= 0) return { error: "The checklist is empty, so it cannot be scored." };

  const score = (earnedWeight / TOTAL_WEIGHT) * 100;
  const open = CHECKLIST.filter((item) => !done.has(item.id));

  const bySection = SECTIONS.map((section) => {
    const items = CHECKLIST.filter((item) => item.section === section.id);
    const doneCount = items.filter((item) => done.has(item.id)).length;
    return {
      id: section.id,
      label: section.label,
      done: doneCount,
      total: items.length,
      percent: items.length === 0 ? 0 : (doneCount / items.length) * 100,
    };
  });

  return {
    score,
    earnedWeight,
    totalWeight: TOTAL_WEIGHT,
    band: bandFor(score),
    completedCount: done.size,
    totalCount: CHECKLIST.length,
    criticalOpen: open.filter((item) => item.severity === "critical"),
    nextActions: open
      .slice()
      .sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])
      .slice(0, 5),
    bySection,
  };
}

/**
 * Band a weighted percentage.
 * @param {number} score - 0..100
 * @returns {{label: string, advice: string}}
 */
export function bandFor(score) {
  if (!Number.isFinite(score)) return SCORE_BANDS[0];
  const found = SCORE_BANDS.find((band) => score <= band.max);
  return found ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Remaining life of a smoke alarm under the NFPA 72 10-year replacement rule.
 * Both dates are supplied by the caller, so the function stays pure.
 *
 * @param {string} manufactureDate - ISO date printed on the back of the unit
 * @param {string} todayDate - ISO date to measure from
 * @returns {{ageYears: number, yearsLeft: number, expired: boolean, replaceBy: string} | {error: string}}
 */
export function smokeAlarmLife(manufactureDate, todayDate) {
  const made = new Date(`${manufactureDate}T00:00:00Z`);
  const today = new Date(`${todayDate}T00:00:00Z`);
  if (Number.isNaN(made.getTime())) return { error: "Enter the manufacture date printed on the alarm." };
  if (Number.isNaN(today.getTime())) return { error: "Enter today's date." };
  if (made.getTime() > today.getTime()) {
    return { error: "The manufacture date is in the future — check the label." };
  }

  const days = (today.getTime() - made.getTime()) / 86400000;
  const ageYears = days / DAYS_PER_YEAR;
  const madeMonth = made.getUTCMonth();
  const replaceBy = new Date(made.getTime());
  replaceBy.setUTCFullYear(replaceBy.getUTCFullYear() + SMOKE_ALARM_LIFE_YEARS);
  if (replaceBy.getUTCMonth() !== madeMonth) {
    // A Feb 29 manufacture date has no exact anniversary in a non-leap target
    // year: setUTCFullYear silently rolls it forward into March. Land on the
    // last day of the intended month (Feb 28) instead.
    replaceBy.setUTCDate(0);
  }

  // The rule is calendar-based: replace on the tenth anniversary of the
  // manufacture date, so expiry is decided by the date, not by the fractional
  // year count (which drifts by a day or two because of leap years).
  return {
    ageYears,
    yearsLeft: (replaceBy.getTime() - today.getTime()) / 86400000 / DAYS_PER_YEAR,
    expired: today.getTime() >= replaceBy.getTime(),
    replaceBy: replaceBy.toISOString().slice(0, 10),
  };
}

/**
 * Plain-text report for copying into an email to a landlord or agent.
 * @param {object} result - the object returned by scoreChecklist
 * @returns {string}
 */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    `Renter security check: ${result.score.toFixed(0)}% (${result.band.label})`,
    `${result.completedCount} of ${result.totalCount} items complete.`,
    "",
  ];
  if (result.criticalOpen.length > 0) {
    lines.push("Open critical items:");
    result.criticalOpen.forEach((item) => lines.push(`- ${item.label} (${item.basis})`));
    lines.push("");
  }
  lines.push("Section progress:");
  result.bySection.forEach((section) =>
    lines.push(`- ${section.label}: ${section.done}/${section.total}`),
  );
  return lines.join("\n");
}
