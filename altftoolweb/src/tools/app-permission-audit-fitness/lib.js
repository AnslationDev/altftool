/**
 * Fitness App Permission Audit — pure logic.
 *
 * Scores the permission set a fitness tracker or workout app holds against the
 * data-minimisation principle: a permission only earns a pass when the feature
 * it powers cannot work without it.
 *
 * No React, no DOM, no clock reads.
 */

/* ------------------------------ sensitivity ------------------------------ */

/**
 * Weight per sensitivity tier.
 *
 * "restricted" mirrors the Google Play "Restricted permissions" and special
 * app access list (background location, All files access, SMS/Call Log,
 * accessibility) — Play requires a core-functionality declaration and a manual
 * policy review before an app may ship with them, so holding one without a
 * matching feature is the strongest signal of over-collection.
 * "high" / "moderate" are Android runtime ("dangerous") permissions, split by
 * how much personal data a single grant exposes.
 * "low" / "minimal" are install-time or normal permissions.
 */
export const SENSITIVITY_TIERS = {
  restricted: { level: 5, weight: 5, label: "Restricted / special access" },
  high: { level: 4, weight: 4, label: "High-sensitivity runtime permission" },
  moderate: { level: 3, weight: 3, label: "Moderate runtime permission" },
  low: { level: 2, weight: 2, label: "Low-risk permission" },
  minimal: { level: 1, weight: 1, label: "Normal permission" },
};

/**
 * How much of a permission's weight counts as exposure.
 *
 * Derived from purpose limitation / data minimisation — GDPR Art. 5(1)(c) and
 * India's DPDP Act 2023, which allow processing only for the specified purpose.
 * core        = the advertised feature is impossible without it -> 0 exposure.
 * optional    = powers one feature many users never touch -> half weight.
 * unnecessary = no core fitness feature needs it -> full weight.
 */
export const NECESSITY_FACTOR = { core: 0, optional: 0.5, unnecessary: 1 };

export const NECESSITY_LABEL = {
  core: "Required for core features",
  optional: "Only for an optional feature",
  unnecessary: "Not needed by a fitness app",
};

/** Score bands used to describe the result. Score is 100 - risk percent. */
export const RISK_BANDS = [
  { min: 85, id: "minimal", label: "Minimal exposure" },
  { min: 70, id: "low", label: "Low exposure" },
  { min: 50, id: "moderate", label: "Moderate exposure" },
  { min: 30, id: "high", label: "High exposure" },
  { min: 0, id: "severe", label: "Severe over-collection" },
];

/**
 * Verdict caps. A high score can still hide one bad grant, so the headline
 * verdict is held back when the app holds something it has no business holding:
 * any unnecessary permission caps the verdict at "Low exposure", and a
 * restricted / special-access grant that is not core caps it at "Moderate".
 */
export const BAND_CAP_UNNECESSARY = "low";
export const BAND_CAP_RESTRICTED = "moderate";

/* ------------------------------- catalogue ------------------------------- */

/**
 * Permissions a fitness / activity tracking app can hold.
 * `android` is the manifest constant, `ios` the matching iOS prompt.
 */
export const PERMISSIONS = [
  {
    id: "activity-recognition",
    label: "Physical activity",
    android: "android.permission.ACTIVITY_RECOGNITION",
    ios: "Motion & Fitness",
    tier: "moderate",
    necessity: "core",
    why: "Reads the step counter and motion classifier so walks and runs are logged at all.",
    risk: "Reveals a continuous movement pattern — when you leave home, sleep and exercise.",
    recommend: "Allow. Without it step counts stop.",
    aliases: ["physical activity", "activity recognition", "motion & fitness", "motion and fitness", "step"],
  },
  {
    id: "body-sensors",
    label: "Body sensors (heart rate)",
    android: "android.permission.BODY_SENSORS",
    ios: "HealthKit heart rate",
    tier: "high",
    necessity: "core",
    why: "Reads live heart rate, SpO2 and skin temperature from the phone or band sensor.",
    risk: "Heart rate is health data; a resting-rate series can imply illness, stress or pregnancy.",
    recommend: "Allow only while using the app unless you track workouts in the background.",
    aliases: ["body sensor", "heart rate", "sensors"],
  },
  {
    id: "body-sensors-background",
    label: "Body sensors in the background",
    android: "android.permission.BODY_SENSORS_BACKGROUND",
    ios: "HealthKit background delivery",
    tier: "restricted",
    necessity: "optional",
    why: "Keeps reading heart rate when the app is closed — needed only for 24x7 or sleep tracking.",
    risk: "A round-the-clock physiological record, collected with no visible session.",
    recommend: "Deny unless you actually use continuous or sleep heart-rate tracking.",
    aliases: ["body sensors background", "background sensors", "24x7 heart rate", "background health"],
  },
  {
    id: "health-read",
    label: "Health Connect / HealthKit read",
    android: "Health Connect read permissions",
    ios: "HealthKit read",
    tier: "high",
    necessity: "core",
    why: "Pulls steps, sleep, weight and workouts recorded by other apps into one dashboard.",
    risk: "Grants the app your whole health history, not just what it recorded itself.",
    recommend: "Allow, but grant record types one by one instead of using 'Allow all'.",
    aliases: ["health connect", "healthkit", "health data", "read health"],
  },
  {
    id: "health-write",
    label: "Health Connect / HealthKit write",
    android: "Health Connect write permissions",
    ios: "HealthKit write",
    tier: "moderate",
    necessity: "core",
    why: "Writes the workouts it records back so other apps and the ring/watch stay in sync.",
    risk: "Low on its own — writing does not let the app read anything.",
    recommend: "Allow if you want the data mirrored to your phone's health store.",
    aliases: ["write health", "health connect write", "healthkit write"],
  },
  {
    id: "location-fine",
    label: "Precise location",
    android: "android.permission.ACCESS_FINE_LOCATION",
    ios: "Location — While Using the App",
    tier: "high",
    necessity: "core",
    why: "GPS traces outdoor runs and rides and calculates pace and distance.",
    risk: "A GPS route that starts and ends at your home identifies you even without a name.",
    recommend: "Set to 'While using the app'. Never 'Allow all the time' for route tracking.",
    aliases: ["precise location", "fine location", "location while using", "gps", "location"],
  },
  {
    id: "location-background",
    label: "Location all the time (background)",
    android: "android.permission.ACCESS_BACKGROUND_LOCATION",
    ios: "Location — Always",
    tier: "restricted",
    necessity: "optional",
    why: "Only needed if the app auto-detects a workout you did not start manually.",
    risk: "Continuous location history is the single most re-identifying data an app can hold.",
    recommend: "Deny. Start workouts manually and use 'While using the app' instead.",
    aliases: ["background location", "all the time", "location always", "always location"],
  },
  {
    id: "nearby-devices",
    label: "Nearby devices (Bluetooth)",
    android: "android.permission.BLUETOOTH_SCAN / BLUETOOTH_CONNECT",
    ios: "Bluetooth",
    tier: "moderate",
    necessity: "optional",
    why: "Pairs a band, watch, chest strap or cadence sensor.",
    risk: "Bluetooth scanning also sees other devices around you, which can infer place and company.",
    recommend: "Allow only if you actually pair a wearable; revoke when you stop using it.",
    aliases: ["nearby devices", "bluetooth", "pair device"],
  },
  {
    id: "camera",
    label: "Camera",
    android: "android.permission.CAMERA",
    ios: "Camera",
    tier: "high",
    necessity: "optional",
    why: "Progress photos, food scanning and QR pairing of a new band.",
    risk: "Body photos are among the most sensitive images people store.",
    recommend: "Set to 'Ask every time' — a one-off QR scan does not need a standing grant.",
    aliases: ["camera", "take pictures", "progress photo"],
  },
  {
    id: "photos",
    label: "Photos and media",
    android: "android.permission.READ_MEDIA_IMAGES",
    ios: "Photos — All Photos",
    tier: "moderate",
    necessity: "optional",
    why: "Attaching a profile picture or an existing progress photo.",
    risk: "Full-library access exposes every image and its embedded GPS tags.",
    recommend: "Use 'Select photos only' (Android 14 / iOS) instead of full library access.",
    aliases: ["photos and videos", "photos and media", "files and media", "media images", "photos", "gallery", "storage"],
  },
  {
    id: "contacts",
    label: "Contacts",
    android: "android.permission.READ_CONTACTS",
    ios: "Contacts",
    tier: "high",
    necessity: "unnecessary",
    why: "Sold as 'find friends' — but a username or invite link does the same job.",
    risk: "Uploads names and numbers of people who never installed the app or consented.",
    recommend: "Revoke. Share an invite link instead of your address book.",
    aliases: ["contacts", "address book", "find friends"],
  },
  {
    id: "microphone",
    label: "Microphone",
    android: "android.permission.RECORD_AUDIO",
    ios: "Microphone",
    tier: "high",
    necessity: "unnecessary",
    why: "Audio coaching is playback, not recording — a tracker rarely needs to listen.",
    risk: "Ambient audio capture, and a permission that stays live between sessions.",
    recommend: "Revoke unless you dictate workout notes.",
    aliases: ["microphone", "record audio", "mic"],
  },
  {
    id: "phone-state",
    label: "Phone / device identity",
    android: "android.permission.READ_PHONE_STATE",
    ios: "(no equivalent)",
    tier: "high",
    necessity: "unnecessary",
    why: "Legacy analytics SDKs used it to read a hardware ID; modern apps do not need it.",
    risk: "Gives a stable identifier that survives reinstalling the app or resetting the ad ID.",
    recommend: "Revoke. No fitness feature depends on it.",
    aliases: ["phone state", "device id", "phone", "device identity", "imei"],
  },
  {
    id: "ad-id",
    label: "Advertising ID",
    android: "com.google.android.gms.permission.AD_ID",
    ios: "App Tracking Transparency",
    tier: "low",
    necessity: "unnecessary",
    why: "Used to join your fitness activity to advertising profiles across other apps.",
    risk: "Links health-adjacent behaviour to ad networks and data brokers.",
    recommend: "Turn off 'Ask App Not to Track' / delete the Android advertising ID in Settings.",
    aliases: ["advertising id", "ad id", "tracking", "personalised ads", "personalized ads"],
  },
  {
    id: "all-files",
    label: "All files access",
    android: "android.permission.MANAGE_EXTERNAL_STORAGE",
    ios: "(not available)",
    tier: "restricted",
    necessity: "unnecessary",
    why: "Nothing in step or heart-rate tracking requires the whole filesystem.",
    risk: "Reads documents, downloads and other apps' exported data.",
    recommend: "Revoke in Settings > Apps > Special app access > All files access.",
    aliases: ["all files access", "manage external storage", "all files"],
  },
  {
    id: "notifications",
    label: "Notifications",
    android: "android.permission.POST_NOTIFICATIONS",
    ios: "Notifications",
    tier: "minimal",
    necessity: "core",
    why: "Delivers the live workout stat bar and goal reminders.",
    risk: "Marketing pushes rather than a data risk.",
    recommend: "Allow, then mute the promotional notification channel.",
    aliases: ["notifications", "post notifications", "alerts"],
  },
];

/* -------------------------------- helpers -------------------------------- */

/** Weight of a permission entry, from its tier. */
export function permissionWeight(permission) {
  const tier = SENSITIVITY_TIERS[permission?.tier];
  return tier ? tier.weight : 0;
}

/** Exposure points a permission contributes when granted. */
export function exposureOf(permission) {
  const factor = NECESSITY_FACTOR[permission?.necessity];
  if (factor === undefined) return 0;
  return permissionWeight(permission) * factor;
}

/** Band for a score in 0..100. */
export function bandForScore(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return RISK_BANDS[RISK_BANDS.length - 1];
  return RISK_BANDS.find((band) => value >= band.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

/* --------------------------------- audit --------------------------------- */

/**
 * Audit a granted-permission set.
 *
 * @param {object} input
 * @param {string[]} input.granted      ids from `permissions`
 * @param {object[]} [input.permissions] catalogue, defaults to PERMISSIONS
 * @returns {object} result, or { error }
 */
export function auditPermissions(input = {}) {
  const { granted, permissions = PERMISSIONS } = input;

  if (!Array.isArray(permissions) || permissions.length === 0) {
    return { error: "No permission catalogue was supplied." };
  }
  if (granted !== undefined && !Array.isArray(granted)) {
    return { error: "Select the permissions the app currently holds." };
  }

  const grantedSet = new Set((granted ?? []).map((id) => String(id)));
  const known = new Set(permissions.map((p) => p.id));
  const unknown = [...grantedSet].filter((id) => !known.has(id));
  if (unknown.length > 0) {
    return { error: `Unrecognised permission: ${unknown[0]}.` };
  }

  let exposure = 0;
  let maxExposure = 0;
  const rows = permissions.map((permission) => {
    const isGranted = grantedSet.has(permission.id);
    const points = exposureOf(permission);
    maxExposure += points;
    if (isGranted) exposure += points;
    return {
      ...permission,
      granted: isGranted,
      weight: permissionWeight(permission),
      points: isGranted ? points : 0,
      tierLabel: SENSITIVITY_TIERS[permission.tier]?.label ?? "Unclassified",
      necessityLabel: NECESSITY_LABEL[permission.necessity] ?? permission.necessity,
    };
  });

  // A catalogue of nothing but core permissions cannot generate exposure.
  const riskPercent = maxExposure > 0 ? Math.round((exposure / maxExposure) * 100) : 0;
  const score = 100 - riskPercent;

  const grantedRows = rows.filter((row) => row.granted);
  const revoke = grantedRows
    .filter((row) => row.necessity === "unnecessary")
    .sort((a, b) => b.weight - a.weight);
  const review = grantedRows
    .filter((row) => row.necessity === "optional")
    .sort((a, b) => b.weight - a.weight);
  const keep = grantedRows.filter((row) => row.necessity === "core");
  const missingCore = rows.filter((row) => !row.granted && row.necessity === "core");
  const restrictedGranted = grantedRows.filter((row) => row.tier === "restricted");
  const restrictedOverreach = restrictedGranted.filter((row) => row.necessity !== "core");

  const indexOfBand = (id) => Math.max(0, RISK_BANDS.findIndex((entry) => entry.id === id));
  let bandIndex = indexOfBand(bandForScore(score).id);
  if (revoke.length > 0) bandIndex = Math.max(bandIndex, indexOfBand(BAND_CAP_UNNECESSARY));
  if (restrictedOverreach.length > 0) bandIndex = Math.max(bandIndex, indexOfBand(BAND_CAP_RESTRICTED));
  const band = RISK_BANDS[bandIndex];

  return {
    rows,
    score,
    riskPercent,
    band: band.id,
    bandLabel: band.label,
    exposure: Math.round(exposure * 10) / 10,
    maxExposure: Math.round(maxExposure * 10) / 10,
    grantedCount: grantedRows.length,
    totalCount: rows.length,
    revoke,
    review,
    keep,
    missingCore,
    restrictedGranted,
    restrictedOverreach,
    revokeCount: revoke.length,
    reviewCount: review.length,
    keepCount: keep.length,
    restrictedCount: restrictedGranted.length,
  };
}

/* ------------------------------ text parsing ------------------------------ */

/**
 * Match a pasted permission list (Play Store "See more", or the Android
 * Settings > Permissions screen) against the catalogue.
 *
 * @returns {{granted: string[], unrecognised: string[]}} or { error }
 */
export function parsePermissionText(text, permissions = PERMISSIONS) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste the permission list from the app's store listing or settings screen." };
  }
  const list = Array.isArray(permissions) && permissions.length > 0 ? permissions : PERMISSIONS;

  const pairs = [];
  list.forEach((permission) => {
    (permission.aliases ?? []).forEach((alias) => {
      pairs.push({ id: permission.id, alias: String(alias).toLowerCase() });
    });
  });
  // Longest alias wins so "background location" beats "location".
  pairs.sort((a, b) => b.alias.length - a.alias.length);

  const lines = text
    .split(/[\n,;|•·]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const matched = [];
  const unrecognised = [];
  lines.forEach((line) => {
    const haystack = line.toLowerCase();
    const hit = pairs.find((pair) => haystack.includes(pair.alias));
    if (hit) {
      if (!matched.includes(hit.id)) matched.push(hit.id);
    } else {
      unrecognised.push(line);
    }
  });

  if (matched.length === 0) {
    return { error: "No permission in that text matched this checklist. Tick the boxes instead." };
  }
  return { granted: matched, unrecognised };
}

/* -------------------------------- reporting ------------------------------- */

/** Render an audit result as copyable plain text. */
export function resultToText(result, appName = "Fitness app") {
  if (!result || result.error) return "";
  const name = String(appName || "Fitness app").trim() || "Fitness app";
  const lines = [
    `${name} — permission audit`,
    `Privacy score: ${result.score}/100 (${result.bandLabel})`,
    `Permissions granted: ${result.grantedCount} of ${result.totalCount}`,
    `Restricted / special access granted: ${result.restrictedCount}`,
  ];
  if (result.revoke.length > 0) {
    lines.push("", "Revoke now:");
    result.revoke.forEach((row) => lines.push(`- ${row.label}: ${row.recommend}`));
  }
  if (result.review.length > 0) {
    lines.push("", "Review:");
    result.review.forEach((row) => lines.push(`- ${row.label}: ${row.recommend}`));
  }
  if (result.keep.length > 0) {
    lines.push("", `Keep: ${result.keep.map((row) => row.label).join(", ")}`);
  }
  return lines.join("\n");
}
