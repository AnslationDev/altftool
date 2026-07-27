/**
 * Display Calibration Checklist — targets, steps and scheduling.
 *
 * Pure module. Dates are always passed in, never read from the clock.
 */

export const MS_PER_DAY = 86400000;

/**
 * Calibration targets per workflow. Each figure cites the standard it comes
 * from; where a standard gives a range rather than a point, the range is kept.
 */
export const WORKFLOWS = [
  {
    id: "web-srgb",
    label: "Web, UI and photo for screen (sRGB)",
    whitePoint: "D65 (6500 K)",
    gamma: "2.2 (or the sRGB curve)",
    luminanceNits: [80, 120],
    ambientLux: [32, 80],
    source:
      "IEC 61966-2-1 defines sRGB against 80 cd/m² white and a 64 lux ambient; most studios work a little brighter than that.",
  },
  {
    id: "print-proof",
    label: "Print and soft proofing",
    whitePoint: "D50 (5000 K)",
    gamma: "2.2, or L* if your software offers it",
    luminanceNits: [100, 160],
    ambientLux: [375, 625],
    source:
      "ISO 3664:2009 viewing condition P2 (practical appraisal) specifies D50 at 500 lux ± 125; monitor white is matched to the print viewer by eye.",
  },
  {
    id: "video-rec709",
    label: "SDR video grading (Rec. 709)",
    whitePoint: "D65 (6500 K)",
    gamma: "2.4 (BT.1886)",
    luminanceNits: [100, 100],
    ambientLux: [5, 15],
    source:
      "ITU-R BT.1886 defines the 2.4 gamma EOTF; BT.2035 describes a dim grading environment with a low-level D65 surround.",
  },
  {
    id: "hdr-pq",
    label: "HDR grading (PQ / BT.2100)",
    whitePoint: "D65 (6500 K)",
    gamma: "PQ (SMPTE ST 2084)",
    luminanceNits: [600, 1000],
    ambientLux: [1, 10],
    source:
      "ITU-R BT.2100 defines the PQ system; BT.2408 places HDR reference white at 203 cd/m² and BT.2035 keeps the surround around 5 cd/m².",
  },
];

/**
 * Recalibration cadence. Calibration software vendors converge on roughly
 * 200 hours of panel use, and no longer than a month between runs.
 */
export const RECALIBRATION = { intervalHours: 200, maxDays: 30 };

/** Warm-up time before a panel's output is stable enough to profile. */
export const WARMUP_MINUTES = 30;

export const LIMITS = {
  minAmbientLux: 0,
  maxAmbientLux: 100000,
  minHoursPerDay: 0.25,
  maxHoursPerDay: 24,
};

/** Checklist steps. `workflows: null` means the step applies to all of them. */
export const STEPS = [
  {
    id: "room-light",
    phase: "Room",
    title: "Control the room light before touching the monitor",
    detail:
      "Close blinds, switch off mixed colour temperatures and keep light off the screen face. Everything downstream is measured against this room, so changing it later invalidates the profile.",
    critical: true,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "room-surround",
    phase: "Room",
    title: "Make the wall behind the monitor neutral grey",
    detail:
      "A coloured or bright wall shifts your perception of the screen's white. Mid-grey, matte, and nothing saturated in your field of view.",
    critical: false,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "room-viewer",
    phase: "Room",
    title: "Set up a D50 print viewer beside the screen",
    detail:
      "Soft proofing only works if the print is judged under a controlled D50 light at roughly the same brightness as the monitor white.",
    critical: true,
    workflows: ["print-proof"],
    needsColorimeter: false,
  },
  {
    id: "room-surround-hdr",
    phase: "Room",
    title: "Drop the surround to a very low, neutral level",
    detail:
      "Grading suites keep the surround near 5 cd/m² so highlight headroom is judged consistently. A bright room makes an HDR grade look dull and pushes you to over-brighten it.",
    critical: true,
    workflows: ["video-rec709", "hdr-pq"],
    needsColorimeter: false,
  },
  {
    id: "hw-warmup",
    phase: "Hardware",
    title: `Warm the panel up for at least ${WARMUP_MINUTES} minutes`,
    detail:
      "Backlight output and white point drift while a panel warms. Profiling a cold screen bakes that drift into the correction.",
    critical: true,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "hw-clean",
    phase: "Hardware",
    title: "Clean the screen and remove any privacy or matte film",
    detail:
      "Dust and add-on films change both the measurement and what you see afterwards.",
    critical: false,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "hw-reset",
    phase: "Hardware",
    title: "Reset the monitor OSD to factory defaults",
    detail:
      "Start from a known state, then disable dynamic contrast, eco modes, blue-light filters, sharpening and any auto-brightness sensor.",
    critical: true,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "hw-preset",
    phase: "Hardware",
    title: "Pick the OSD colour preset closest to your target",
    detail:
      "Use the native or custom preset rather than a vendor 'movie' mode, and set the white point in the OSD before software correction rather than after.",
    critical: false,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "hw-brightness",
    phase: "Hardware",
    title: "Set brightness in the OSD, not in the graphics driver",
    detail:
      "Driver-side brightness throws away levels. Hit the luminance target with the backlight control, and leave contrast at its default unless the software asks you to change it.",
    critical: true,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "sw-clear",
    phase: "Software",
    title: "Remove old profiles and any LUT loader still running",
    detail:
      "Stale profiles and leftover calibration loaders stack corrections on top of each other and make the result unrepeatable.",
    critical: true,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "sw-targets",
    phase: "Software",
    title: "Enter the white point, gamma and luminance targets",
    detail:
      "Use the values in the panel above for your workflow. If the software offers a measured ambient mode, ignore it and set the numbers explicitly.",
    critical: true,
    workflows: null,
    needsColorimeter: true,
  },
  {
    id: "sw-measure",
    phase: "Software",
    title: "Run the colorimeter through the full patch set",
    detail:
      "Mount the device flat on the screen with the counterweight taking the strain, and do not lean on the desk while it measures.",
    critical: true,
    workflows: null,
    needsColorimeter: true,
  },
  {
    id: "sw-no-device",
    phase: "Software",
    title: "Without a colorimeter, get as close as you can by eye",
    detail:
      "Set the OSD preset to sRGB or D65, match brightness to a sheet of white paper under your room light, then check gamma and clipping with a test pattern. Treat the result as usable, not colour-accurate.",
    critical: false,
    workflows: null,
    needsColorimeter: false,
    noDeviceOnly: true,
  },
  {
    id: "verify-grey",
    phase: "Verify",
    title: "Check the grey ramp for banding and colour casts",
    detail:
      "A smooth neutral ramp with no tint is the quickest evidence the profile took. Visible steps usually mean the correction is being loaded into an 8-bit LUT.",
    critical: true,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "verify-clip",
    phase: "Verify",
    title: "Confirm shadow and highlight patches stay separated",
    detail:
      "Near-black and near-white patches should all be distinguishable. If they merge, brightness or black level is wrong, not the profile.",
    critical: true,
    workflows: null,
    needsColorimeter: false,
  },
  {
    id: "verify-proof",
    phase: "Verify",
    title: "Compare a known print against the soft proof",
    detail:
      "Use a print you trust, viewed in the D50 booth, with the soft proof set to the same output profile and rendering intent.",
    critical: true,
    workflows: ["print-proof"],
    needsColorimeter: false,
  },
  {
    id: "verify-schedule",
    phase: "Verify",
    title: "Diary the next calibration",
    detail: `Recalibrate after about ${RECALIBRATION.intervalHours} hours of panel use, and never leave it longer than ${RECALIBRATION.maxDays} days.`,
    critical: false,
    workflows: null,
    needsColorimeter: false,
  },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse "YYYY-MM-DD" to a UTC timestamp, or NaN if it is not a real date. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return NaN;
  const [year, month, day] = value.split("-").map(Number);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return NaN;
  }
  return stamp;
}

/** Add whole days to a UTC timestamp and format as "YYYY-MM-DD". */
export function addDaysIso(stamp, days) {
  const next = new Date(stamp + days * MS_PER_DAY);
  const year = String(next.getUTCFullYear()).padStart(4, "0");
  const month = String(next.getUTCMonth() + 1).padStart(2, "0");
  const day = String(next.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * When the display is next due, whichever comes first: the usage-hours
 * interval or the calendar cap.
 */
export function recalibrationDue({
  lastCalibrated,
  hoursPerDay,
  intervalHours = RECALIBRATION.intervalHours,
  maxDays = RECALIBRATION.maxDays,
} = {}) {
  const stamp = parseIsoDate(lastCalibrated);
  if (!Number.isFinite(stamp)) {
    return { error: "Enter the last calibration date as YYYY-MM-DD." };
  }
  const hours = Number(hoursPerDay);
  if (!Number.isFinite(hours) || hours < LIMITS.minHoursPerDay || hours > LIMITS.maxHoursPerDay) {
    return {
      error: `Daily screen hours must be between ${LIMITS.minHoursPerDay} and ${LIMITS.maxHoursPerDay}.`,
    };
  }
  const usageDays = Math.ceil(intervalHours / hours);
  const days = Math.min(usageDays, maxDays);
  return {
    usageDays,
    calendarCapDays: maxDays,
    daysUntilDue: days,
    dueDate: addDaysIso(stamp, days),
    limitedBy: usageDays <= maxDays ? "panel hours" : "calendar cap",
  };
}

/**
 * Build the checklist for one setup.
 *
 * @param {object} input
 * @param {string} input.workflowId       one of WORKFLOWS.
 * @param {boolean} input.hasColorimeter  whether a measuring device is available.
 * @param {number} input.ambientLux       measured or estimated room light.
 * @param {string} input.lastCalibrated   "YYYY-MM-DD".
 * @param {number} input.hoursPerDay      daily screen-on hours.
 */
export function buildChecklist({
  workflowId,
  hasColorimeter = true,
  ambientLux,
  lastCalibrated,
  hoursPerDay,
} = {}) {
  const workflow = WORKFLOWS.find((item) => item.id === workflowId);
  if (!workflow) return { error: "Choose a workflow to build the checklist." };

  const lux = Number(ambientLux);
  if (!Number.isFinite(lux) || lux < LIMITS.minAmbientLux || lux > LIMITS.maxAmbientLux) {
    return { error: `Ambient light must be between 0 and ${LIMITS.maxAmbientLux} lux.` };
  }

  const schedule = recalibrationDue({ lastCalibrated, hoursPerDay });
  if (schedule.error) return schedule;

  const steps = STEPS.filter((step) => {
    if (step.workflows && !step.workflows.includes(workflow.id)) return false;
    if (step.needsColorimeter && !hasColorimeter) return false;
    if (step.noDeviceOnly && hasColorimeter) return false;
    return true;
  }).map((step) => ({
    id: step.id,
    phase: step.phase,
    title: step.title,
    detail: step.detail,
    critical: step.critical,
  }));

  const [luxLow, luxHigh] = workflow.ambientLux;
  const warnings = [];
  if (lux < luxLow) {
    warnings.push(
      `${Math.round(lux)} lux is darker than the ${luxLow}-${luxHigh} lux this workflow expects — you will tend to set the screen too dim.`,
    );
  } else if (lux > luxHigh) {
    warnings.push(
      `${Math.round(lux)} lux is brighter than the ${luxLow}-${luxHigh} lux this workflow expects — you will tend to over-brighten the screen and crush shadows.`,
    );
  }
  if (!hasColorimeter) {
    warnings.push(
      "Without a colorimeter the result is a visual match, not a measurement. Do not sign off colour-critical work on it.",
    );
  }

  const phases = ["Room", "Hardware", "Software", "Verify"];
  const grouped = phases
    .map((phase) => ({ phase, steps: steps.filter((step) => step.phase === phase) }))
    .filter((group) => group.steps.length > 0);

  return {
    workflow,
    ambientLux: lux,
    ambientInRange: lux >= luxLow && lux <= luxHigh,
    steps,
    grouped,
    totalSteps: steps.length,
    criticalSteps: steps.filter((step) => step.critical).length,
    warnings,
    schedule,
  };
}

/** Progress across the checklist, given the ids ticked off. */
export function checklistProgress(steps, doneIds = []) {
  const done = new Set(doneIds);
  const total = steps.length;
  const completed = steps.filter((step) => done.has(step.id)).length;
  const criticalRemaining = steps.filter((step) => step.critical && !done.has(step.id)).length;
  return {
    completed,
    total,
    remaining: total - completed,
    percent: total > 0 ? (completed / total) * 100 : 0,
    criticalRemaining,
    ready: total > 0 && criticalRemaining === 0,
  };
}
