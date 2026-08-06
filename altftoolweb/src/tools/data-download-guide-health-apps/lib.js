/**
 * Health and fitness data export planner — pure logic.
 *
 * Fixed rules encoded here come from the platforms and from published law, not from
 * this module:
 *  - Apple Health exports from the device: Health app → your profile picture → Export
 *    All Health Data, which produces a zipped XML file. Apple's privacy portal does
 *    not include Health data because it is end-to-end encrypted.
 *  - Google Fit and Fitbit data for Google-linked accounts is exported through Google
 *    Takeout; older Fitbit accounts export from Fitbit account settings.
 *  - Strava exports from Settings → My Account → Download or Delete Your Account,
 *    which produces a bulk archive including the raw activity files.
 *  - Samsung Health and Garmin Connect each have their own account-level export.
 *  - GDPR Art. 9 treats health data as a special category, needing a stronger legal
 *    basis than ordinary personal data. In India, the SPDI Rules 2011 classify health
 *    information as sensitive personal data or information.
 *  - Under GDPR Art. 12(3) a controller has one month to answer an access request.
 *
 * Sampling rates and record sizes are PLANNING ESTIMATES typical of consumer wearables,
 * not a specification of any particular device.
 */

/** GDPR Art. 12(3) deadline for an access request, in days. */
export const GDPR_RESPONSE_DAYS = 30;

/** Bytes in a megabyte. */
const BYTES_PER_MB = 1024 * 1024;

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/** Days in a year, for turning a daily rate into a lifetime record count. */
const DAYS_PER_YEAR = 365;

/** Weeks in a year, for turning a weekly workout rate into a lifetime count. */
const WEEKS_PER_YEAR = 52;

/** Typical continuous heart-rate sampling interval on a consumer wearable, seconds. */
export const HR_SAMPLE_SECONDS = 5;

/** Step, distance and calorie totals are typically written once a minute. */
export const ACTIVITY_RECORDS_PER_HOUR = 60;

/** Sleep staging is scored in 30-second epochs. */
export const SLEEP_EPOCH_SECONDS = 30;

/**
 * Hours of sleep assumed per tracked night. Sits inside the 7-9 hours that adult
 * sleep guidance recommends, and only matters when sleep data is being exported.
 */
export const SLEEP_HOURS_TRACKED = 7;

/** GPS fix rate written into a recorded workout file, in points per second. */
export const GPS_POINTS_PER_SECOND = 1;

/**
 * Exportable health and fitness data.
 *  baseMb        - one-off size independent of volume
 *  mbPerYear     - extra size per year of use
 *  bytesPerHr    - scales with continuous heart-rate samples
 *  bytesPerMin   - scales with per-minute activity records
 *  bytesPerEpoch - scales with 30-second sleep epochs
 *  bytesPerGps   - scales with GPS points inside recorded workouts
 *  sensitivity   - 1 (mundane) to 5 (clinical records, cycle data, home-anchored GPS)
 */
export const EXPORT_CATEGORIES = [
  {
    id: "heart-rate",
    label: "Heart rate and variability",
    what: "Continuous heart-rate samples, resting rate, HRV and any irregular-rhythm notifications.",
    baseMb: 0.5,
    mbPerYear: 0,
    bytesPerHr: 24,
    bytesPerMin: 0,
    bytesPerEpoch: 0,
    bytesPerGps: 0,
    sensitivity: 5,
    note: "The largest file on most wearables, and clinically suggestive — sustained changes can indicate illness, pregnancy or medication.",
  },
  {
    id: "steps-activity",
    label: "Steps and activity",
    what: "Per-minute step, distance, floor and energy records, plus stand and move goals.",
    baseMb: 0.3,
    mbPerYear: 0,
    bytesPerHr: 0,
    bytesPerMin: 30,
    bytesPerEpoch: 0,
    bytesPerGps: 0,
    sensitivity: 4,
    note: "A minute-level activity trace also shows exactly when you were asleep, working or travelling.",
  },
  {
    id: "sleep",
    label: "Sleep",
    what: "Sleep stages scored in 30-second epochs, bedtimes, wake events and sleep scores.",
    baseMb: 0.2,
    mbPerYear: 0,
    bytesPerHr: 0,
    bytesPerMin: 0,
    bytesPerEpoch: 20,
    bytesPerGps: 0,
    sensitivity: 5,
    note: "Bedtime and wake time across years is one of the most reliable behavioural fingerprints there is.",
  },
  {
    id: "workouts-gps",
    label: "Workouts with GPS",
    what: "Recorded activities as GPX, TCX or FIT files with a position fix roughly every second.",
    baseMb: 0.3,
    mbPerYear: 0,
    bytesPerHr: 0,
    bytesPerMin: 0,
    bytesPerEpoch: 0,
    bytesPerGps: 40,
    sensitivity: 5,
    note: "Routes usually start and end at your front door; use the app's privacy zones before sharing anything publicly.",
  },
  {
    id: "cycle",
    label: "Cycle and reproductive tracking",
    what: "Period dates, flow, symptoms, basal temperature, fertility windows and pregnancy status.",
    baseMb: 0.1,
    mbPerYear: 0.15,
    bytesPerHr: 0,
    bytesPerMin: 0,
    bytesPerEpoch: 0,
    bytesPerGps: 0,
    sensitivity: 5,
    note: "The single most sensitive category here. Check where it syncs and whether it leaves the device at all.",
  },
  {
    id: "medical",
    label: "Medical records and medications",
    what: "Clinical records connected to the app, allergies, medications, immunisations and lab results.",
    baseMb: 1.5,
    mbPerYear: 1.2,
    bytesPerHr: 0,
    bytesPerMin: 0,
    bytesPerEpoch: 0,
    bytesPerGps: 0,
    sensitivity: 5,
    note: "Treat this exactly like a paper medical file — it is special-category data under GDPR Art. 9.",
  },
  {
    id: "measurements",
    label: "Body and vital measurements",
    what: "Weight, BMI, body composition, blood pressure, blood oxygen, temperature and glucose entries.",
    baseMb: 0.3,
    mbPerYear: 0.5,
    bytesPerHr: 0,
    bytesPerMin: 0,
    bytesPerEpoch: 0,
    bytesPerGps: 0,
    sensitivity: 5,
    note: "Glucose and blood-pressure series effectively disclose a diagnosis.",
  },
  {
    id: "nutrition",
    label: "Nutrition and hydration",
    what: "Food logs, macronutrients, water and caffeine intake, and any diet plan.",
    baseMb: 0.2,
    mbPerYear: 1.5,
    bytesPerHr: 0,
    bytesPerMin: 0,
    bytesPerEpoch: 0,
    bytesPerGps: 0,
    sensitivity: 4,
    note: "Detailed food logs can indicate an eating disorder, a religious practice or a medical diet.",
  },
  {
    id: "mindfulness",
    label: "Mindfulness and mood",
    what: "Mindful minutes, mood or state-of-mind entries, and any journalling stored in the app.",
    baseMb: 0.2,
    mbPerYear: 0.4,
    bytesPerHr: 0,
    bytesPerMin: 0,
    bytesPerEpoch: 0,
    bytesPerGps: 0,
    sensitivity: 5,
    note: "Mood logs are mental-health data and deserve the same care as a clinical record.",
  },
  {
    id: "social",
    label: "Social and public profile",
    what: "Followers, kudos, comments, segments, challenges and anything published to a feed.",
    baseMb: 0.4,
    mbPerYear: 0.6,
    bytesPerHr: 0,
    bytesPerMin: 0,
    bytesPerEpoch: 0,
    bytesPerGps: 0,
    sensitivity: 3,
    note: "Public activity feeds broadcast your routine in real time — this is where most fitness-app exposure actually happens.",
  },
  {
    id: "device-account",
    label: "Devices, sync and account",
    what: "Paired devices, firmware, sync logs, connected third-party apps and account details.",
    baseMb: 1,
    mbPerYear: 1.5,
    bytesPerHr: 0,
    bytesPerMin: 0,
    bytesPerEpoch: 0,
    bytesPerGps: 0,
    sensitivity: 3,
    note: "The connected-apps list is worth reading: it shows every service that has been receiving your health data.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Export Apple Health from the device",
    "Health app → your profile picture → Export All Health Data. Apple cannot include it in a privacy-portal request because the data is end-to-end encrypted.",
  ],
  [
    "Use Google Takeout for Fit and Google-linked Fitbit",
    "Deselect everything else in Takeout first. Older Fitbit accounts that were never migrated export from Fitbit's own account settings instead.",
  ],
  [
    "Request the Strava bulk archive separately",
    "Settings → My Account → Download or Delete Your Account produces the archive with your raw activity files, which the app's per-activity export does not.",
  ],
  [
    "List every app that received the data",
    "Health platforms act as hubs. Check the connected-apps or permissions screen and revoke anything you no longer use before exporting.",
  ],
  [
    "Turn on privacy zones before you share anything",
    "Strava, Garmin and Samsung all support hiding a radius around home and work. Do it before publishing a route or handing a GPX file to anyone.",
  ],
  [
    "Handle the archive as medical data",
    "Health data is a special category under GDPR Art. 9 and sensitive personal information under India's SPDI Rules 2011. Keep it encrypted and never upload it to a random converter.",
  ],
  [
    "Check cycle and mood data separately",
    "These are often stored differently from sensor data. Confirm whether they sync to the cloud at all, and delete what you do not need on the device.",
  ],
  [
    "Escalate in writing if the export is incomplete",
    `If a category you are entitled to is missing, send a written access request; a controller generally has one calendar month (about ${GDPR_RESPONSE_DAYS} days) to respond.`,
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
 * Estimate a health and fitness data export.
 *
 * Volume model:
 *   hrSamples     = wearHours * 3600 / 5                per day  * 365 * years
 *   activityRows  = wearHours * 60                      per day  * 365 * years
 *   sleepEpochs   = min(wearHours, 7) * 3600 / 30        per night * 365 * years
 *   gpsPoints     = workoutsPerWeek * 52 * years * workoutMinutes * 60 * 1
 *
 * Sleep tracking cannot exceed the hours the device is actually worn, so the
 * nightly sleep window is capped at wearHours (a device worn 2 hours a day
 * cannot have logged a full 7-hour night of sleep staging).
 *
 * Size model per category: baseMb + mbPerYear * years, plus each per-record term
 * multiplied by its record count and converted from bytes to megabytes.
 *
 * Sensitivity score = 20 * (0.6 * highest + 0.4 * mean) of the 1-5 ratings, bounded
 * to 20-100 by construction.
 *
 * @returns {{error: string} | object} plain object; never NaN or Infinity.
 */
export function estimateExport({
  selectedIds,
  years,
  wearHoursPerDay,
  workoutsPerWeek,
  workoutMinutes,
}) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one category to estimate a health data export." };
  }

  const known = EXPORT_CATEGORIES.filter((category) => selectedIds.includes(category.id));
  if (known.length === 0) {
    return { error: "None of the selected items match a health data category." };
  }

  const useYears = Number(years);
  if (!Number.isFinite(useYears)) {
    return { error: "Enter how many years of history you have as a number." };
  }
  if (useYears <= 0) {
    return { error: "Years of history must be greater than zero." };
  }
  if (useYears > 15) {
    return { error: "Consumer wearables date from around 2011, so more than 15 years of history is unlikely." };
  }

  const wearHours = Number(wearHoursPerDay);
  if (!Number.isFinite(wearHours)) {
    return { error: "Enter how many hours a day you wear the device as a number." };
  }
  if (wearHours < 0) {
    return { error: "Wear time cannot be negative." };
  }
  if (wearHours > 24) {
    return { error: "A day only has 24 hours, so wear time cannot exceed that." };
  }

  const weeklyWorkouts = Number(workoutsPerWeek);
  if (!Number.isFinite(weeklyWorkouts)) {
    return { error: "Enter how many recorded workouts you do per week as a number." };
  }
  if (weeklyWorkouts < 0) {
    return { error: "Workouts per week cannot be negative." };
  }
  if (weeklyWorkouts > 21) {
    return { error: "More than 21 recorded workouts a week is outside this estimate." };
  }

  // Average workout length only feeds the GPS-points estimate, which is already
  // zero when there are no weekly workouts — so it need not be validated then.
  const workoutMinutesRequired = weeklyWorkouts > 0;
  const perWorkoutMinutesRaw = Number(workoutMinutes);
  if (workoutMinutesRequired) {
    if (!Number.isFinite(perWorkoutMinutesRaw)) {
      return { error: "Enter your average workout length in minutes as a number." };
    }
    if (perWorkoutMinutesRaw <= 0) {
      return { error: "Average workout length must be greater than zero minutes." };
    }
    if (perWorkoutMinutesRaw > 600) {
      return { error: "An average workout longer than 600 minutes is outside this estimate." };
    }
  }
  const perWorkoutMinutes = workoutMinutesRequired ? perWorkoutMinutesRaw : 0;

  const days = DAYS_PER_YEAR * useYears;
  const hrSamples = ((wearHours * 3600) / HR_SAMPLE_SECONDS) * days;
  const activityRows = wearHours * ACTIVITY_RECORDS_PER_HOUR * days;
  const sleepHours = Math.min(wearHours, SLEEP_HOURS_TRACKED);
  const sleepEpochs = ((sleepHours * 3600) / SLEEP_EPOCH_SECONDS) * days;
  const gpsPoints =
    weeklyWorkouts * WEEKS_PER_YEAR * useYears * perWorkoutMinutes * 60 * GPS_POINTS_PER_SECOND;

  const rows = known.map((category) => {
    const sizeMb =
      category.baseMb +
      category.mbPerYear * useYears +
      (category.bytesPerHr * hrSamples) / BYTES_PER_MB +
      (category.bytesPerMin * activityRows) / BYTES_PER_MB +
      (category.bytesPerEpoch * sleepEpochs) / BYTES_PER_MB +
      (category.bytesPerGps * gpsPoints) / BYTES_PER_MB;
    return { ...category, sizeMb };
  });

  const totalMb = rows.reduce((sum, row) => sum + row.sizeMb, 0);

  const selectedSet = new Set(selectedIds);
  const countedRecords =
    (selectedSet.has("heart-rate") ? hrSamples : 0) +
    (selectedSet.has("steps-activity") ? activityRows : 0) +
    (selectedSet.has("sleep") ? sleepEpochs : 0) +
    (selectedSet.has("workouts-gps") ? gpsPoints : 0);

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);
  const specialCategory = rows.filter((row) => row.sensitivity >= 5).map((row) => row.label);

  return {
    rows: sorted,
    count: rows.length,
    totalMb,
    totalLabel: formatSize(totalMb),
    dataPoints: Math.round(countedRecords),
    hrSamples: Math.round(hrSamples),
    activityRows: Math.round(activityRows),
    sleepEpochs: Math.round(sleepEpochs),
    gpsPoints: Math.round(gpsPoints),
    homeAnchoredRoutes: selectedSet.has("workouts-gps")
      ? Math.round(weeklyWorkouts * WEEKS_PER_YEAR * useYears)
      : 0,
    largestLabel: sorted[0].label,
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    specialCategory,
    specialCategoryCount: specialCategory.length,
  };
}
