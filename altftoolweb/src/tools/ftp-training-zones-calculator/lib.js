/**
 * Cycling power zones from Functional Threshold Power.
 *
 * Zone boundaries follow the seven-level model published by Andrew Coggan in
 * "Training and Racing with a Power Meter", expressed as percentages of FTP:
 *
 *   Z1 Active recovery      up to 55%
 *   Z2 Endurance            56-75%
 *   Z3 Tempo                76-90%
 *   Z4 Lactate threshold    91-105%
 *   Z5 VO2max               106-120%
 *   Z6 Anaerobic capacity   121-150%
 *   Z7 Neuromuscular power  above 150% (no upper bound)
 *
 * FTP itself is the highest power a rider can hold in a quasi-steady state for
 * about an hour. Because a full hour test is brutal, it is commonly estimated
 * from shorter efforts using an established discount factor.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** FTP is conventionally taken as 95% of average power for a 20-minute all-out test. */
export const FTP_20MIN_FACTOR = 0.95;

/** For a shorter 8-minute test the discount is larger — commonly 90%. */
export const FTP_8MIN_FACTOR = 0.9;

/** Plausibility bound so a typo cannot produce impossible zones. */
export const MAX_FTP_WATTS = 800;

/** Coggan seven-zone model. `highPct` of null means the zone is open-ended. */
export const COGGAN_ZONES = [
  {
    id: 1,
    name: "Active recovery",
    lowPct: 0,
    highPct: 0.55,
    purpose: "Spinning easy between hard days; too light to add fitness on its own.",
    duration: "30-90 minutes",
  },
  {
    id: 2,
    name: "Endurance",
    lowPct: 0.56,
    highPct: 0.75,
    purpose: "The aerobic base where long rides live. Conversational the whole way.",
    duration: "1-6 hours",
  },
  {
    id: 3,
    name: "Tempo",
    lowPct: 0.76,
    highPct: 0.9,
    purpose: "Steady, purposeful riding; harder to talk, useful for time-limited weeks.",
    duration: "20-90 minutes",
  },
  {
    id: 4,
    name: "Lactate threshold",
    lowPct: 0.91,
    highPct: 1.05,
    purpose: "Around FTP itself — the classic 2 x 20 minute interval zone.",
    duration: "10-30 minute blocks",
  },
  {
    id: 5,
    name: "VO2max",
    lowPct: 1.06,
    highPct: 1.2,
    purpose: "Hard intervals that raise your ceiling. Breathing is maximal.",
    duration: "3-8 minute blocks",
  },
  {
    id: 6,
    name: "Anaerobic capacity",
    lowPct: 1.21,
    highPct: 1.5,
    purpose: "Attacks and short climbs; fuelled largely without oxygen.",
    duration: "30 seconds to 3 minutes",
  },
  {
    id: 7,
    name: "Neuromuscular power",
    lowPct: 1.51,
    highPct: null,
    purpose: "Sprints. Limited by force and coordination, not by aerobic fitness.",
    duration: "5-15 seconds",
  },
];

/**
 * Polarised training distribution (Seiler): roughly 80% of sessions easy
 * (zones 1-2) and 20% genuinely hard (zone 4 and above), with little time
 * spent in the tempo middle.
 */
export const POLARISED_EASY_SHARE = 0.8;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Estimate FTP from a shorter maximal test. Returns { error } on bad input. */
export function estimateFtp(averageWatts, testId = "twenty") {
  if (!isNum(averageWatts)) return { error: "Enter your average test power in watts." };
  if (averageWatts <= 0) return { error: "Test power must be greater than zero." };
  if (averageWatts > MAX_FTP_WATTS * 1.5) {
    return { error: "That test power is outside the range this tool covers." };
  }
  const factor = testId === "eight" ? FTP_8MIN_FACTOR : FTP_20MIN_FACTOR;
  return {
    factor,
    testLabel: testId === "eight" ? "8-minute test" : "20-minute test",
    ftpWatts: averageWatts * factor,
  };
}

/**
 * Build the seven power zones in watts.
 *
 * @param {number} ftpWatts
 * @param {number} [massKg] Optional body mass, to add W/kg for each boundary.
 */
export function computeZones(ftpWatts, massKg = 0) {
  if (!isNum(ftpWatts)) return { error: "Enter your FTP in watts." };
  if (ftpWatts <= 0) return { error: "FTP must be greater than zero watts." };
  if (ftpWatts > MAX_FTP_WATTS) {
    return { error: `An FTP above ${MAX_FTP_WATTS} W is outside this tool's range.` };
  }
  if (!isNum(massKg) || massKg < 0) return { error: "Body mass cannot be negative." };

  const zones = COGGAN_ZONES.map((zone) => {
    const lowWatts = ftpWatts * zone.lowPct;
    const highWatts = zone.highPct === null ? null : ftpWatts * zone.highPct;
    return {
      ...zone,
      lowWatts,
      highWatts,
      lowWattsRounded: Math.round(lowWatts),
      highWattsRounded: highWatts === null ? null : Math.round(highWatts),
      lowWattsPerKg: massKg > 0 ? lowWatts / massKg : null,
      highWattsPerKg: massKg > 0 && highWatts !== null ? highWatts / massKg : null,
    };
  });

  return {
    ftpWatts,
    massKg,
    wattsPerKg: massKg > 0 ? ftpWatts / massKg : null,
    zones,
    thresholdBandLow: Math.round(ftpWatts * 0.91),
    thresholdBandHigh: Math.round(ftpWatts * 1.05),
  };
}

/**
 * Split a weekly training volume using the polarised 80/20 model.
 * Returns hours easy (zones 1-2) and hours hard (zone 4 and above).
 */
export function polarisedSplit(weeklyHours) {
  if (!isNum(weeklyHours) || weeklyHours <= 0) {
    return { error: "Enter your weekly riding hours to see the split." };
  }
  if (weeklyHours > 40) return { error: "Weekly hours above 40 are outside this tool's range." };
  const easyHours = weeklyHours * POLARISED_EASY_SHARE;
  return {
    weeklyHours,
    easyHours,
    hardHours: weeklyHours - easyHours,
    easyMinutes: easyHours * 60,
    hardMinutes: (weeklyHours - easyHours) * 60,
  };
}

/** Hours -> "3h 24m". Total function: never NaN. */
export function formatHours(hours) {
  const totalMinutes = isNum(hours) ? Math.max(0, Math.round(hours * 60)) : 0;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
