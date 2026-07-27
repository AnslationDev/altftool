/**
 * Slope conversions.
 *
 * A slope is just a rise over a run. Every notation below is that same ratio written a
 * different way, so all of them come from one number:
 *   percent grade = (rise / run) x 100
 *   angle         = atan(rise / run)
 *   1-in-X ratio  = run / rise (the form building codes use: "1 in 12")
 *   inches per ft = (rise / run) x 12, which is also the "X in 12" roof pitch
 *   mm per metre  = (rise / run) x 1000, the form site levels are set out with
 *
 * Note the difference between a percent grade and an angle: they only agree near zero.
 * A 100% grade is 45 degrees, not 90.
 */

export const INCHES_PER_FOOT = 12;
export const MM_PER_METRE = 1000;
export const DEG_PER_RAD = 180 / Math.PI;

/** A vertical face has no finite grade, so the angle input is capped just short of it. */
export const MAX_DEGREES = 89.99;
export const MAX_PERCENT = 100000;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/**
 * Reference slopes, each as the rule that defines it. Percent values are derived, not typed,
 * so they cannot drift from the ratio they come from.
 *  - ADA Standards for Accessible Design 405.2: ramp running slope max 1:12.
 *  - ADA 405.3: ramp cross slope max 1:48.
 *  - ADA 403.3 / IBC: a walking surface up to 1:20 is not a ramp and needs no handrails.
 *  - International Plumbing Code Table 704.1: 2 1/2 in and smaller drains fall 1/4 in per ft.
 *  - IPC Table 704.1: 3 in to 6 in drains fall 1/8 in per ft.
 *  - AASHTO: 6% is a common maximum sustained grade on rural interstate highways.
 *  - Roofing practice: below 3 in 12 a roof is "low slope" and needs a sealed membrane.
 */
export const REFERENCE_SLOPES = [
  { label: "ADA ramp, maximum running slope", ratio: 12 },
  { label: "Ramp preferred for unassisted wheelchair use", ratio: 20 },
  { label: "ADA ramp, maximum cross slope", ratio: 48 },
  { label: "Drain 2 1/2 in and smaller (1/4 in per ft)", ratio: 48 },
  { label: "Drain 3 in to 6 in (1/8 in per ft)", ratio: 96 },
  { label: "Low-slope roof threshold (3 in 12)", ratio: 4 },
  { label: "Typical maximum highway grade (6%)", ratio: 100 / 6 },
];

/** Plain-language band for a slope, using the thresholds above. */
export function describeSlope(percent) {
  const magnitude = Math.abs(percent);
  if (magnitude === 0) return "Dead level - no fall at all, so water will stand.";
  if (magnitude < 1.04) return "Gentler than the 1/8 in per ft minimum fall for a large drain.";
  if (magnitude < 2.08) return "Enough fall for a large drain, but under the 1/4 in per ft a small one needs.";
  if (magnitude <= 8.34) return "Within the ADA 1:12 limit for an accessible ramp.";
  if (magnitude <= 25) return "Too steep for an accessible ramp; typical of a driveway or a low-slope roof.";
  if (magnitude <= 100) return "Steep - normal roof pitch territory, not a walking surface.";
  return "Steeper than 45 degrees.";
}

/**
 * Convert one slope expressed in any notation into all the others.
 * @param {object} input
 * @param {number} input.value    the number typed, ignored when mode is "riseRun"
 * @param {"percent"|"degrees"|"ratio"|"permille"|"inPerFt"|"mmPerM"|"riseRun"} input.mode
 * @param {number} [input.rise]   used only when mode is "riseRun"
 * @param {number} [input.run]    used only when mode is "riseRun"
 * @returns {{error:string}|object}
 */
export function convertSlope({ value, mode, rise, run }) {
  let percent;

  if (mode === "riseRun") {
    if (!isNum(rise) || !isNum(run)) return { error: "Enter a number for both rise and run." };
    if (run === 0) return { error: "Run cannot be zero - a vertical face has no percent grade." };
    if (run < 0) return { error: "Run must be greater than zero." };
    percent = (rise / run) * 100;
  } else {
    if (!isNum(value)) return { error: "Enter a number to convert." };
    if (mode === "percent") percent = value;
    else if (mode === "permille") percent = value / 10;
    else if (mode === "inPerFt") percent = (value / INCHES_PER_FOOT) * 100;
    else if (mode === "mmPerM") percent = (value / MM_PER_METRE) * 100;
    else if (mode === "degrees") {
      if (Math.abs(value) > MAX_DEGREES) {
        return { error: `Angle must be between -${MAX_DEGREES} and ${MAX_DEGREES} degrees; 90 degrees is vertical and has no percent grade.` };
      }
      percent = Math.tan(value / DEG_PER_RAD) * 100;
    } else if (mode === "ratio") {
      if (value === 0) return { error: "A 1-in-0 ratio is vertical - enter a run of 1 or more." };
      if (value < 0) return { error: "Enter the run part of the ratio as a positive number." };
      percent = (1 / value) * 100;
    } else {
      return { error: "Unknown slope notation." };
    }
  }

  if (!isNum(percent)) return { error: "That input does not describe a finite slope." };
  if (Math.abs(percent) > MAX_PERCENT) {
    return { error: "That slope is effectively vertical - keep the grade under 100000%." };
  }

  const degrees = Math.atan(percent / 100) * DEG_PER_RAD;
  const isFlat = percent === 0;

  return {
    percent,
    permille: percent * 10,
    degrees,
    radians: degrees / DEG_PER_RAD,
    // A flat surface is 1 in infinity; report null rather than Infinity so nothing renders "∞ mm".
    ratioRun: isFlat ? null : Math.abs(100 / percent),
    inchesPerFoot: (percent / 100) * INCHES_PER_FOOT,
    mmPerMetre: (percent / 100) * MM_PER_METRE,
    roofPitchRise: (percent / 100) * INCHES_PER_FOOT,
    isFlat,
    isDescending: percent < 0,
    description: describeSlope(percent),
    withinAdaRamp: Math.abs(percent) <= 100 / 12 + 0.005,
    references: REFERENCE_SLOPES.map((item) => ({
      label: item.label,
      ratio: item.ratio,
      percent: (1 / item.ratio) * 100,
      degrees: Math.atan(1 / item.ratio) * DEG_PER_RAD,
    })),
  };
}

/**
 * Rise over a given run at a slope - the number you actually mark on a wall or a pipe.
 * @returns {{error:string}|{rise:number}}
 */
export function riseOverRun({ percent, run }) {
  if (!isNum(percent) || !isNum(run)) return { error: "Enter a number for the slope and the run." };
  if (run < 0) return { error: "Run must be zero or more." };
  return { rise: (percent / 100) * run };
}
