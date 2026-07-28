/**
 * Powerlifting total tracking.
 *
 * A competition total is squat + bench press + deadlift from the SAME day, using
 * the best successful attempt in each lift. A "gym total" adds up your all-time
 * best in each lift regardless of when each was set, so it is always greater than
 * or equal to the best single-day total. Both are reported separately here because
 * only the single-day figure is what a meet would record.
 */

export const LIFTS = [
  { id: "squat", label: "Squat" },
  { id: "bench", label: "Bench press" },
  { id: "deadlift", label: "Deadlift" },
];

/** Exact pound (1959 international yard and pound agreement). */
export const KG_PER_LB = 0.45359237;
export const MS_PER_DAY = 86400000;

/**
 * Typical share of a raw total taken by each lift. Meet data clusters near a
 * 35 / 25 / 40 split for squat / bench / deadlift; this is a descriptive average,
 * not a rule, and equipped lifting shifts it markedly towards the squat and bench.
 */
export const REFERENCE_SPLIT = { squat: 35, bench: 25, deadlift: 40 };
/** How far a lift's share can drift from the reference before it is flagged. */
export const SPLIT_TOLERANCE_PCT = 4;

/**
 * Informal bodyweight-multiple landmarks used across strength coaching.
 * They are gym conventions rather than federation standards.
 */
export const BODYWEIGHT_LANDMARKS = [
  { id: "novice", label: "Novice", squat: 1.0, bench: 0.75, deadlift: 1.25, total: 3.0 },
  { id: "intermediate", label: "Intermediate", squat: 1.5, bench: 1.0, deadlift: 2.0, total: 4.5 },
  { id: "advanced", label: "Advanced", squat: 2.0, bench: 1.5, deadlift: 2.5, total: 6.0 },
  { id: "elite", label: "Elite", squat: 2.5, bench: 1.75, deadlift: 3.0, total: 7.25 },
];

export const MAX_LIFT_KG = 700;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export const lbToKg = (lb) => (isNum(lb) ? lb * KG_PER_LB : null);
export const kgToLb = (kg) => (isNum(kg) ? kg / KG_PER_LB : null);

/** Parse YYYY-MM-DD as a UTC timestamp; null if it is not a real date. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ts = Date.UTC(year, month - 1, day);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null;
  }
  return ts;
}

/** Whole days between two ISO dates. */
export function daysBetween(fromIso, toIso) {
  const a = parseIsoDate(fromIso);
  const b = parseIsoDate(toIso);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Compare a lift split with the reference split and label each lift. */
export function classifySplit(split) {
  const flags = {};
  LIFTS.forEach((lift) => {
    const share = split?.[lift.id];
    if (!isNum(share)) {
      flags[lift.id] = "unknown";
      return;
    }
    const diff = share - REFERENCE_SPLIT[lift.id];
    if (diff > SPLIT_TOLERANCE_PCT) flags[lift.id] = "strong";
    else if (diff < -SPLIT_TOLERANCE_PCT) flags[lift.id] = "lagging";
    else flags[lift.id] = "balanced";
  });
  return flags;
}

/** Highest landmark a set of bodyweight multiples clears for a given lift. */
export function landmarkFor(multiple, liftId) {
  if (!isNum(multiple) || multiple <= 0) return null;
  let reached = null;
  for (const landmark of BODYWEIGHT_LANDMARKS) {
    if (multiple >= landmark[liftId]) reached = landmark;
  }
  return reached;
}

function validateEntry(entry) {
  if (parseIsoDate(entry?.dateIso) === null) return "Every entry needs a valid date.";
  for (const lift of LIFTS) {
    const value = entry?.[lift.id];
    if (!isNum(value)) return `Enter a ${lift.label.toLowerCase()} figure for every entry.`;
    if (value < 0) return "Lifts cannot be negative.";
    if (value > MAX_LIFT_KG) return `Each lift must be under ${MAX_LIFT_KG} kg.`;
  }
  if (entry.bodyweight !== undefined && entry.bodyweight !== null) {
    if (!isNum(entry.bodyweight) || entry.bodyweight < 0) {
      return "Bodyweight must be zero or more.";
    }
  }
  return null;
}

/**
 * Roll a log of dated entries into totals, bests, progress and balance.
 * @param {Array<{dateIso:string, squat:number, bench:number, deadlift:number, bodyweight?:number}>} entries
 */
export function summariseTotals(entries) {
  const list = Array.isArray(entries) ? entries : [];
  for (const entry of list) {
    const problem = validateEntry(entry);
    if (problem) return { error: problem };
  }

  if (list.length === 0) {
    return {
      rows: [],
      entryCount: 0,
      bestByLift: { squat: 0, bench: 0, deadlift: 0 },
      bestByLiftDate: { squat: null, bench: null, deadlift: null },
      gymTotal: 0,
      bestMeetTotal: 0,
      bestMeetDate: null,
      latest: null,
      first: null,
      progress: null,
      split: null,
      splitFlags: null,
      bodyweightMultiples: null,
    };
  }

  const rows = [...list]
    .map((entry) => ({
      ...entry,
      total: entry.squat + entry.bench + entry.deadlift,
    }))
    .sort((a, b) => String(a.dateIso).localeCompare(String(b.dateIso)));

  const bestByLift = { squat: 0, bench: 0, deadlift: 0 };
  const bestByLiftDate = { squat: null, bench: null, deadlift: null };
  rows.forEach((row) => {
    LIFTS.forEach((lift) => {
      if (row[lift.id] > bestByLift[lift.id]) {
        bestByLift[lift.id] = row[lift.id];
        bestByLiftDate[lift.id] = row.dateIso;
      }
    });
  });

  const bestMeetRow = rows.reduce((best, row) => (row.total > best.total ? row : best), rows[0]);
  const first = rows[0];
  const latest = rows[rows.length - 1];

  const gymTotal = bestByLift.squat + bestByLift.bench + bestByLift.deadlift;

  const split =
    latest.total > 0
      ? {
          squat: (latest.squat / latest.total) * 100,
          bench: (latest.bench / latest.total) * 100,
          deadlift: (latest.deadlift / latest.total) * 100,
        }
      : null;

  const days = daysBetween(first.dateIso, latest.dateIso);
  const totalDelta = latest.total - first.total;
  const progress = {
    days,
    totalDelta,
    totalDeltaPct: first.total > 0 ? (totalDelta / first.total) * 100 : null,
    perLift: {
      squat: latest.squat - first.squat,
      bench: latest.bench - first.bench,
      deadlift: latest.deadlift - first.deadlift,
    },
    kgPerMonth: isNum(days) && days > 0 ? (totalDelta / days) * 30.436875 : null,
  };

  const bw = latest.bodyweight;
  const bodyweightMultiples =
    isNum(bw) && bw > 0
      ? {
          squat: latest.squat / bw,
          bench: latest.bench / bw,
          deadlift: latest.deadlift / bw,
          total: latest.total / bw,
        }
      : null;

  return {
    rows,
    entryCount: rows.length,
    bestByLift,
    bestByLiftDate,
    gymTotal,
    bestMeetTotal: bestMeetRow.total,
    bestMeetDate: bestMeetRow.dateIso,
    latest,
    first,
    progress,
    split,
    splitFlags: split ? classifySplit(split) : null,
    bodyweightMultiples,
    /** Gap between the all-time gym total and the best single-day total. */
    sameDayGap: gymTotal - bestMeetRow.total,
  };
}

/**
 * Bodyweight-multiple landmark table for the current bests.
 * Returns one row per landmark with the weights it would require.
 */
export function landmarkTable(bodyweightKg) {
  if (!isNum(bodyweightKg) || bodyweightKg <= 0) return [];
  return BODYWEIGHT_LANDMARKS.map((landmark) => ({
    id: landmark.id,
    label: landmark.label,
    squat: landmark.squat * bodyweightKg,
    bench: landmark.bench * bodyweightKg,
    deadlift: landmark.deadlift * bodyweightKg,
    total: landmark.total * bodyweightKg,
  }));
}
