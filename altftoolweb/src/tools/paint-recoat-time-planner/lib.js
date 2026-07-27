/**
 * Paint recoat time planner.
 *
 * Every paint datasheet quotes drying times at one reference condition. Indian
 * decorative-paint TDSs almost always state them at 30 C and 60% relative
 * humidity, so that is the baseline used here. Two well-established effects
 * move the real drying time away from that figure:
 *
 * 1. Temperature. Solvent and water evaporation and the chemical cure that
 *    follows both speed up with heat. The long-standing site rule of thumb is
 *    that drying time roughly doubles for every 10 C drop:
 *
 *      tempFactor = 2 ^ ((REF_TEMP_C - T) / 10)
 *
 * 2. Humidity. A water-based film dries by evaporating water into the air, and
 *    the driving force is the vapour-pressure deficit, which is proportional to
 *    (1 - RH). So the time scales with the inverse of that deficit:
 *
 *      humidityFactor = ((100 - REF_RH) / (100 - RH)) ^ k
 *
 *    k is 1 for waterborne paints, whose drying is entirely evaporation of
 *    water, and much lower for solvent-borne enamels and lacquers, where the
 *    solvent leaves regardless of how humid the air is.
 *
 * The adjusted time is the datasheet time multiplied by both factors. This is a
 * planning model, not a laboratory prediction - the datasheet for the tin in
 * front of you always wins.
 */

/** Conditions the quoted drying times are measured at. */
export const REF_TEMP_C = 30;
export const REF_RH_PCT = 60;

/** Input ranges the model is willing to work in. */
export const MIN_TEMP_C = 0;
export const MAX_TEMP_C = 50;
export const MIN_RH_PCT = 10;
export const MAX_RH_PCT = 95;
export const MAX_COATS = 6;

/**
 * Beyond this slowdown the extrapolation stops being trustworthy and the
 * honest answer is "wait for better weather".
 */
export const UNRELIABLE_FACTOR = 6;

/**
 * Datasheet drying times in hours at 30 C / 60% RH, with the minimum
 * application temperature manufacturers normally specify. `humidityExponent`
 * is the k above: 1 for waterborne systems, 0.35 for solvent-borne ones whose
 * solvent evaporates largely independently of the moisture in the air.
 *
 * These are mid-band figures drawn from the ranges typically printed on Indian
 * decorative-paint technical data sheets. Individual products differ - a
 * quick-dry enamel or an accelerated PU will beat these comfortably.
 */
export const PAINT_TYPES = [
  {
    id: "interior-emulsion",
    label: "Interior acrylic emulsion",
    touchDry: 0.5,
    recoat: 4,
    hardDry: 8,
    fullCureDays: 7,
    humidityExponent: 1,
    minApplyTempC: 10,
  },
  {
    id: "exterior-emulsion",
    label: "Exterior acrylic emulsion",
    touchDry: 0.5,
    recoat: 4,
    hardDry: 12,
    fullCureDays: 7,
    humidityExponent: 1,
    minApplyTempC: 10,
  },
  {
    id: "distemper",
    label: "Oil-bound distemper",
    touchDry: 0.5,
    recoat: 4,
    hardDry: 8,
    fullCureDays: 5,
    humidityExponent: 1,
    minApplyTempC: 10,
  },
  {
    id: "water-primer",
    label: "Water-based wall primer",
    touchDry: 0.5,
    recoat: 4,
    hardDry: 8,
    fullCureDays: 5,
    humidityExponent: 1,
    minApplyTempC: 10,
  },
  {
    id: "wall-putty",
    label: "Wall putty",
    touchDry: 2,
    recoat: 6,
    hardDry: 8,
    fullCureDays: 3,
    humidityExponent: 1,
    minApplyTempC: 10,
  },
  {
    id: "enamel",
    label: "Synthetic / oil-based enamel",
    touchDry: 4,
    recoat: 16,
    hardDry: 24,
    fullCureDays: 7,
    humidityExponent: 0.35,
    minApplyTempC: 5,
  },
  {
    id: "melamine",
    label: "Melamine wood finish",
    touchDry: 1,
    recoat: 5,
    hardDry: 12,
    fullCureDays: 3,
    humidityExponent: 0.35,
    minApplyTempC: 10,
  },
  {
    id: "pu",
    label: "2K PU wood finish",
    touchDry: 1.5,
    recoat: 7,
    hardDry: 16,
    fullCureDays: 7,
    humidityExponent: 0.35,
    minApplyTempC: 10,
  },
  {
    id: "nc-lacquer",
    label: "NC lacquer",
    touchDry: 0.25,
    recoat: 1,
    hardDry: 6,
    fullCureDays: 2,
    humidityExponent: 0.35,
    minApplyTempC: 10,
  },
];

const TYPE_BY_ID = new Map(PAINT_TYPES.map((t) => [t.id, t]));

/** Milliseconds in one hour. */
export const MS_PER_HOUR = 3600000;

const isNum = (v) => Number.isFinite(v);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Parse a date + 24-hour clock time into a UTC timestamp, or null. */
export function parseStart(dateIso, clock) {
  const d = String(dateIso ?? "").trim();
  const t = String(clock ?? "").trim();
  if (!ISO_DATE.test(d) || !CLOCK.test(t)) return null;
  const year = Number(d.slice(0, 4));
  const month = Number(d.slice(5, 7));
  const day = Number(d.slice(8, 10));
  const hour = Number(t.slice(0, 2));
  const minute = Number(t.slice(3, 5));
  const ts = Date.UTC(year, month - 1, day, hour, minute);
  const back = new Date(ts);
  if (
    back.getUTCFullYear() !== year ||
    back.getUTCMonth() !== month - 1 ||
    back.getUTCDate() !== day
  ) {
    return null;
  }
  return ts;
}

/** How much slower than the datasheet the air temperature makes things. */
export function temperatureFactor(tempC) {
  return Math.pow(2, (REF_TEMP_C - tempC) / 10);
}

/** How much slower than the datasheet the humidity makes things. */
export function humidityFactor(rhPct, exponent) {
  const deficit = 100 - rhPct;
  if (!(deficit > 0)) return Infinity;
  return Math.pow((100 - REF_RH_PCT) / deficit, exponent);
}

/**
 * Plan the coats.
 *
 * @param {object} input
 * @param {string} input.paintTypeId
 * @param {number} input.tempC
 * @param {number} input.humidityPct
 * @param {number} input.coats
 * @param {string} input.startDate       "YYYY-MM-DD"
 * @param {string} input.startTime       "HH:MM", 24-hour
 * @returns {object} schedule and adjusted times, or { error }.
 */
export function planRecoat({
  paintTypeId = "interior-emulsion",
  tempC,
  humidityPct,
  coats = 2,
  startDate,
  startTime,
}) {
  const paint = TYPE_BY_ID.get(paintTypeId);
  if (!paint) return { error: "Pick a paint type." };

  const t = Number(tempC);
  const rh = Number(humidityPct);
  const n = Math.round(Number(coats));

  if (![t, rh, n].every(isNum)) return { error: "Enter valid numbers in every field." };
  if (t < MIN_TEMP_C || t > MAX_TEMP_C) {
    return { error: `Temperature should be between ${MIN_TEMP_C} C and ${MAX_TEMP_C} C.` };
  }
  if (rh < MIN_RH_PCT || rh > MAX_RH_PCT) {
    return { error: `Relative humidity should be between ${MIN_RH_PCT}% and ${MAX_RH_PCT}%.` };
  }
  if (n < 1 || n > MAX_COATS) return { error: `Coats should be between 1 and ${MAX_COATS}.` };

  const startTs = parseStart(startDate, startTime);
  if (startTs === null) {
    return { error: "Enter a real start date and a start time in 24-hour HH:MM form." };
  }

  const tFactor = temperatureFactor(t);
  const hFactor = humidityFactor(rh, paint.humidityExponent);
  const factor = tFactor * hFactor;
  if (!Number.isFinite(factor) || factor <= 0) {
    return { error: "These conditions are outside the range this model can work in." };
  }

  const touchDry = paint.touchDry * factor;
  const recoat = paint.recoat * factor;
  const hardDry = paint.hardDry * factor;

  const schedule = [];
  for (let coat = 1; coat <= n; coat += 1) {
    const startHours = (coat - 1) * recoat;
    schedule.push({
      coat,
      startHours,
      startAt: new Date(startTs + startHours * MS_PER_HOUR).toISOString(),
      touchDryHours: startHours + touchDry,
      touchDryAt: new Date(startTs + (startHours + touchDry) * MS_PER_HOUR).toISOString(),
      readyForNextHours: startHours + recoat,
      readyForNextAt:
        coat < n ? new Date(startTs + (startHours + recoat) * MS_PER_HOUR).toISOString() : null,
    });
  }

  const lastCoatHours = (n - 1) * recoat;
  const hardDryHours = lastCoatHours + hardDry;
  const fullCureHours = lastCoatHours + paint.fullCureDays * 24;

  const warnings = [];
  if (t < paint.minApplyTempC) {
    warnings.push(
      `${paint.label} is normally specified for application above ${paint.minApplyTempC} C. Below that the film may never form properly, however long you wait.`,
    );
  }
  if (rh >= 85) {
    warnings.push(
      `At ${rh}% relative humidity a waterborne film dries very slowly and an exterior surface may pick up condensation overnight.`,
    );
  }
  if (factor >= UNRELIABLE_FACTOR) {
    warnings.push(
      `These conditions stretch drying to more than ${UNRELIABLE_FACTOR} times the datasheet figure, which is well outside the range those figures were measured in. Treat the times below as a warning to wait, not as a schedule.`,
    );
  }
  if (t > 40) {
    warnings.push(
      "Above 40 C the surface can skin over before the film flows out, which causes brush marks and poor adhesion between coats.",
    );
  }

  return {
    paint,
    tempC: t,
    humidityPct: rh,
    coats: n,
    tempFactor: tFactor,
    humidityFactor: hFactor,
    factor,
    fasterThanDatasheet: factor < 1,
    datasheet: {
      touchDry: paint.touchDry,
      recoat: paint.recoat,
      hardDry: paint.hardDry,
    },
    touchDryHours: touchDry,
    recoatHours: recoat,
    hardDryHours: hardDry,
    extraRecoatHours: recoat - paint.recoat,
    schedule,
    startAt: new Date(startTs).toISOString(),
    lastCoatAt: new Date(startTs + lastCoatHours * MS_PER_HOUR).toISOString(),
    hardDryAt: new Date(startTs + hardDryHours * MS_PER_HOUR).toISOString(),
    fullCureAt: new Date(startTs + fullCureHours * MS_PER_HOUR).toISOString(),
    totalJobHours: hardDryHours,
    totalJobDays: hardDryHours / 24,
    fullCureDays: paint.fullCureDays,
    warnings,
  };
}
