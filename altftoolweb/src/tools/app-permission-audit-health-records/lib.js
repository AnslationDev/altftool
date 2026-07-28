/**
 * Health Records App Permission Audit — pure logic.
 *
 * Scores a personal health record, ABHA/ABDM or lab-report app. Settings are
 * weighed alongside permissions, because the biggest leak in this category is
 * usually a sharing toggle that defaults to on, not a runtime prompt.
 *
 * No React, no DOM, no clock reads.
 */

/* ------------------------------ sensitivity ------------------------------ */

/**
 * Weight per sensitivity tier.
 *
 * "restricted" mirrors the Google Play restricted-permissions and special app
 * access list (background location, All files access, SMS and Call Log,
 * accessibility, overlays) — Play requires a core-functionality declaration and
 * a manual policy review before an app may ship with one, so holding it without
 * a matching feature is the strongest signal of over-collection.
 * "high" and "moderate" are Android runtime ("dangerous") permissions, split by
 * how much personal data a single grant exposes.
 * "low" and "minimal" are install-time or normal permissions.
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
 * India's DPDP Act 2023, which allow processing only for the stated purpose.
 * core        = the advertised feature is impossible without it -> 0 exposure.
 * optional    = powers one feature many users never touch -> half weight.
 * unnecessary = no core feature of this app class needs it -> full weight.
 */
export const NECESSITY_FACTOR = { core: 0, optional: 0.5, unnecessary: 1 };

export const NECESSITY_LABEL = {
  core: "Required for core features",
  optional: "Only for an optional feature",
  unnecessary: "Not needed by a records app",
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
 * Permissions and privacy settings a health records app can hold.
 * `android` is the manifest constant or settings screen, `ios` the matching
 * iOS prompt.
 */
export const PERMISSIONS = [
  {
    "id": "health-read",
    "label": "Health Connect / HealthKit read",
    "android": "Health Connect read permissions",
    "ios": "HealthKit read",
    "tier": "high",
    "necessity": "core",
    "why": "Pulls prescriptions, lab values, vitals and history into one record.",
    "risk": "Hands over your entire health store, including whatever other apps wrote to it.",
    "recommend": "Allow record types one at a time rather than using 'Allow all'.",
    "aliases": [
      "health connect",
      "healthkit",
      "health data",
      "read health",
      "medical records"
    ]
  },
  {
    "id": "health-write",
    "label": "Health Connect / HealthKit write",
    "android": "Health Connect write permissions",
    "ios": "HealthKit write",
    "tier": "moderate",
    "necessity": "core",
    "why": "Writes uploaded reports back so other apps and your doctor's app can read them.",
    "risk": "Write access alone cannot read anything.",
    "recommend": "Allow if you want the records mirrored to the phone's health store.",
    "aliases": [
      "write health",
      "health connect write",
      "healthkit write"
    ]
  },
  {
    "id": "notifications",
    "label": "Notifications",
    "android": "android.permission.POST_NOTIFICATIONS",
    "ios": "Notifications",
    "tier": "minimal",
    "necessity": "core",
    "why": "Medication, appointment and report-ready reminders.",
    "risk": "A marketing channel more than a data risk.",
    "recommend": "Allow, then mute the promotional notification channel and keep only transactional alerts.",
    "aliases": [
      "notifications",
      "post notifications",
      "alerts"
    ]
  },
  {
    "id": "app-lock",
    "label": "Biometric app lock",
    "android": "android.permission.USE_BIOMETRIC",
    "ios": "Face ID / Touch ID",
    "tier": "minimal",
    "necessity": "core",
    "why": "Requires your fingerprint or face before the records open.",
    "risk": "None — this one reduces risk. Anyone holding your unlocked phone otherwise reads your diagnoses.",
    "recommend": "Turn it on. It is the single most useful setting in a records app.",
    "aliases": [
      "app lock",
      "biometric",
      "fingerprint",
      "face id",
      "passcode"
    ]
  },
  {
    "id": "health-background-read",
    "label": "Read health data in the background",
    "android": "Health Connect background read",
    "ios": "HealthKit background delivery",
    "tier": "restricted",
    "necessity": "optional",
    "why": "Lets the app sync new records while it is closed.",
    "risk": "Continuous access to a health store with no visible session and no prompt at the time.",
    "recommend": "Deny unless you rely on automatic syncing; open the app to refresh instead.",
    "aliases": [
      "background health",
      "background read",
      "background sync health"
    ]
  },
  {
    "id": "camera",
    "label": "Camera",
    "android": "android.permission.CAMERA",
    "ios": "Camera",
    "tier": "high",
    "necessity": "optional",
    "why": "Photographing a prescription or a printed lab report.",
    "risk": "A standing grant lets the app open the camera whenever it is in the foreground.",
    "recommend": "Set it to 'Ask every time' — a one-off scan does not need a permanent grant.",
    "aliases": [
      "camera",
      "take pictures",
      "take photos"
    ]
  },
  {
    "id": "photos-all",
    "label": "Photos and videos (whole library)",
    "android": "android.permission.READ_MEDIA_IMAGES / READ_MEDIA_VIDEO",
    "ios": "Photos — All Photos",
    "tier": "moderate",
    "necessity": "optional",
    "why": "Importing report scans already saved in your gallery.",
    "risk": "Full-library access exposes every screenshot, document photo and the GPS tags inside them.",
    "recommend": "Switch to 'Select photos' (Android 14) or 'Limited Access' (iOS) so only the files you pick are visible.",
    "aliases": [
      "photos and videos",
      "photos and media",
      "files and media",
      "media images",
      "photos",
      "gallery",
      "storage"
    ]
  },
  {
    "id": "cloud-backup",
    "label": "Cloud backup of records",
    "android": "Account backup setting",
    "ios": "iCloud / vendor backup",
    "tier": "high",
    "necessity": "optional",
    "why": "Copies your records to the vendor's servers so they survive a lost phone.",
    "risk": "Moves health data out of the phone's encrypted storage into an account that can be breached or subpoenaed.",
    "recommend": "Keep it only if the app states the backup is end-to-end encrypted; otherwise export a local PDF.",
    "aliases": [
      "backup",
      "cloud backup",
      "sync",
      "cloud sync"
    ]
  },
  {
    "id": "location-coarse",
    "label": "Approximate location",
    "android": "android.permission.ACCESS_COARSE_LOCATION",
    "ios": "Location — Precise off",
    "tier": "moderate",
    "necessity": "optional",
    "why": "Finds nearby labs and pharmacies.",
    "risk": "Location joined to health context is far more revealing than location alone.",
    "recommend": "Deny and search by pincode instead.",
    "aliases": [
      "approximate location",
      "coarse location",
      "location",
      "nearby labs"
    ]
  },
  {
    "id": "sharing-default",
    "label": "Share records with partner clinics by default",
    "android": "Consent / sharing setting",
    "ios": "Sharing setting",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "Some apps opt you in to sharing with partner hospitals, labs or insurers at sign-up.",
    "risk": "Health data reaching an insurer can affect cover and pricing, and it is hard to claw back.",
    "recommend": "Turn it off and review the consent ledger; under the ABDM policy consent must be specific and revocable.",
    "aliases": [
      "share records",
      "sharing",
      "consent",
      "partner clinics",
      "third party sharing"
    ]
  },
  {
    "id": "analytics-sdk",
    "label": "Third-party analytics inside the app",
    "android": "Analytics SDK",
    "ios": "Analytics SDK",
    "tier": "moderate",
    "necessity": "unnecessary",
    "why": "Screen names in a records app are diagnoses: 'HIV test result' is a screen title.",
    "risk": "Even without the record contents, the screens you visit leak the condition.",
    "recommend": "Turn off analytics or usage sharing in the app's privacy settings.",
    "aliases": [
      "analytics",
      "usage data",
      "diagnostics",
      "crash reports"
    ]
  },
  {
    "id": "contacts",
    "label": "Contacts",
    "android": "android.permission.READ_CONTACTS",
    "ios": "Contacts",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "Sharing a report with a family member needs one number, not the whole address book.",
    "risk": "Uploads names and numbers of people who never installed the app and never consented.",
    "recommend": "Revoke it and share an invite link instead of your address book.",
    "aliases": [
      "contacts",
      "address book",
      "find friends"
    ]
  },
  {
    "id": "microphone",
    "label": "Microphone",
    "android": "android.permission.RECORD_AUDIO",
    "ios": "Microphone",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "Nothing in a records app records audio.",
    "risk": "A standing grant means the app can capture audio any time it is running.",
    "recommend": "Revoke it.",
    "aliases": [
      "microphone",
      "record audio",
      "mic",
      "voice"
    ]
  },
  {
    "id": "all-files",
    "label": "All files access",
    "android": "android.permission.MANAGE_EXTERNAL_STORAGE",
    "ios": "(not available)",
    "tier": "restricted",
    "necessity": "unnecessary",
    "why": "Report imports go through the system picker, one file at a time.",
    "risk": "Reads documents, downloads, WhatsApp media and other apps' exported data in one grant.",
    "recommend": "Revoke under Settings > Apps > Special app access > All files access.",
    "aliases": [
      "all files access",
      "manage external storage",
      "all files"
    ]
  },
  {
    "id": "phone-state",
    "label": "Phone / device identity",
    "android": "android.permission.READ_PHONE_STATE",
    "ios": "(no equivalent)",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "Old analytics SDKs read a hardware ID with it; nothing in a modern app needs it.",
    "risk": "Gives a stable identifier that survives a reinstall or an advertising-ID reset.",
    "recommend": "Revoke it. If the app stops working, that is a sign it is fingerprinting you.",
    "aliases": [
      "phone state",
      "device identity",
      "device id",
      "imei",
      "phone"
    ]
  },
  {
    "id": "ad-id",
    "label": "Advertising ID",
    "android": "com.google.android.gms.permission.AD_ID",
    "ios": "App Tracking Transparency",
    "tier": "low",
    "necessity": "unnecessary",
    "why": "Advertising identifiers have no place next to diagnoses; several regulators treat this as sensitive-data processing.",
    "risk": "Joins what you do in this app to advertising profiles held by networks and data brokers.",
    "recommend": "Delete the Android advertising ID in Settings > Privacy > Ads, and answer 'Ask App Not to Track' on iOS.",
    "aliases": [
      "advertising id",
      "ad id",
      "personalised ads",
      "personalized ads",
      "tracking"
    ]
  }
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
 * @param {string[]} input.granted       ids from `permissions`
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
 * Match a pasted permission list (the Play Store "See more" dialog, or the
 * Android Settings > Apps > Permissions screen) against the catalogue.
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
export function resultToText(result, appName = "Health records app") {
  if (!result || result.error) return "";
  const name = String(appName || "Health records app").trim() || "Health records app";
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
