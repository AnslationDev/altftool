/**
 * Utility App Permission Audit — pure logic.
 *
 * Scores flashlight, junk-cleaner and battery-saver style apps, where the gap
 * between the advertised job and the permission list is usually widest. Special
 * app access grants (all files, usage access, overlays, accessibility) carry the
 * heaviest weight because Play requires a core-functionality declaration for them.
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
  unnecessary: "Not needed by a utility app",
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
 * Permissions and privacy settings a flashlight, cleaner or battery-saver app can hold.
 * `android` is the manifest constant or settings screen, `ios` the matching
 * iOS prompt.
 */
export const PERMISSIONS = [
  {
    "id": "torch-control",
    "label": "Torch / flashlight control",
    "android": "CameraManager.setTorchMode (no permission)",
    "ios": "Control Centre torch",
    "tier": "minimal",
    "necessity": "core",
    "why": "Turning the LED on and off. Note this needs no permission at all on Android 6+.",
    "risk": "None. If a flashlight app asks for the Camera permission, it is not for the torch.",
    "recommend": "Keep. If the app cannot light the LED without the Camera permission, replace it with the built-in torch tile.",
    "aliases": [
      "torch",
      "flashlight",
      "led"
    ]
  },
  {
    "id": "foreground-service",
    "label": "Foreground service",
    "android": "android.permission.FOREGROUND_SERVICE",
    "ios": "(background modes)",
    "tier": "low",
    "necessity": "core",
    "why": "Keeps a running job alive with a visible notification while it works.",
    "risk": "Low on its own — the notification makes the activity visible.",
    "recommend": "Keep, but check what the persistent notification actually says it is doing.",
    "aliases": [
      "foreground service",
      "background service",
      "run in background"
    ]
  },
  {
    "id": "all-files",
    "label": "All files access",
    "android": "android.permission.MANAGE_EXTERNAL_STORAGE",
    "ios": "(not available)",
    "tier": "restricted",
    "necessity": "unnecessary",
    "why": "Play policy allows All files access for file managers, backup and anti-virus apps — a torch, cleaner or battery saver is not on that list.",
    "risk": "Reads documents, downloads, WhatsApp media and other apps' exported data in one grant.",
    "recommend": "Revoke under Settings > Apps > Special app access > All files access.",
    "aliases": [
      "all files access",
      "manage external storage",
      "all files"
    ]
  },
  {
    "id": "query-all-packages",
    "label": "See all installed apps",
    "android": "android.permission.QUERY_ALL_PACKAGES",
    "ios": "(not available)",
    "tier": "restricted",
    "necessity": "optional",
    "why": "A cleaner listing app caches has a case for it; a torch app does not.",
    "risk": "The full app list is a strong fingerprint and leaks health, dating, religion and finance interests.",
    "recommend": "Revoke or uninstall. Play policy allows it only when app discovery is the core purpose.",
    "aliases": [
      "all installed apps",
      "query all packages",
      "installed apps",
      "app list"
    ]
  },
  {
    "id": "usage-access",
    "label": "Usage access",
    "android": "android.permission.PACKAGE_USAGE_STATS",
    "ios": "Screen Time",
    "tier": "restricted",
    "necessity": "optional",
    "why": "Reads how long you spend in every app — the basis of a real battery report.",
    "risk": "A minute-by-minute log of which apps you open and when, effectively a diary of your day.",
    "recommend": "Grant only to an app whose main screen is a usage report, and revoke it under Special app access when you are done.",
    "aliases": [
      "usage access",
      "usage data",
      "app usage",
      "screen time",
      "package usage stats"
    ]
  },
  {
    "id": "accessibility-service",
    "label": "Accessibility service",
    "android": "android.permission.BIND_ACCESSIBILITY_SERVICE",
    "ios": "(not available)",
    "tier": "restricted",
    "necessity": "unnecessary",
    "why": "Designed for screen readers; it lets an app read and click everything on screen.",
    "risk": "The most abused permission on Android — it can read banking screens and tap buttons for you.",
    "recommend": "Turn it off in Settings > Accessibility > Downloaded apps unless you rely on it as an assistive tool.",
    "aliases": [
      "accessibility",
      "accessibility service",
      "bind accessibility"
    ]
  },
  {
    "id": "draw-over-apps",
    "label": "Display over other apps",
    "android": "android.permission.SYSTEM_ALERT_WINDOW",
    "ios": "(not available)",
    "tier": "restricted",
    "necessity": "unnecessary",
    "why": "Draws windows on top of every other app.",
    "risk": "Used for full-screen ads outside the app and for tapjacking overlays that hide what you are really pressing.",
    "recommend": "Turn it off in Settings > Apps > Special app access > Display over other apps.",
    "aliases": [
      "display over other apps",
      "draw over other apps",
      "system alert window",
      "overlay"
    ]
  },
  {
    "id": "camera",
    "label": "Camera",
    "android": "android.permission.CAMERA",
    "ios": "Camera",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "The torch does not need it — the Android torch API works without the Camera permission.",
    "risk": "A standing grant lets the app open the camera whenever it is in the foreground.",
    "recommend": "Revoke it.",
    "aliases": [
      "camera",
      "take pictures",
      "take photos"
    ]
  },
  {
    "id": "location-fine",
    "label": "Precise location",
    "android": "android.permission.ACCESS_FINE_LOCATION",
    "ios": "Location — While Using the App",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "Neither cleaning storage nor saving battery involves knowing where you are.",
    "risk": "Street-level position, and a home address the moment the app sees you overnight.",
    "recommend": "Revoke it. This is almost always there to sell location data to an ad network.",
    "aliases": [
      "precise location",
      "fine location",
      "location while using",
      "gps",
      "location"
    ]
  },
  {
    "id": "contacts",
    "label": "Contacts",
    "android": "android.permission.READ_CONTACTS",
    "ios": "Contacts",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "No cleaning, torch or battery feature touches your address book.",
    "risk": "Uploads names and numbers of people who never installed the app and never consented.",
    "recommend": "Revoke it and share an invite link instead of your address book.",
    "aliases": [
      "contacts",
      "address book",
      "find friends"
    ]
  },
  {
    "id": "sms-read",
    "label": "Read SMS",
    "android": "android.permission.READ_SMS / RECEIVE_SMS",
    "ios": "(not available)",
    "tier": "restricted",
    "necessity": "unnecessary",
    "why": "OTP autofill does not need it — the SMS Retriever and SMS User Consent APIs hand over one matching message with no permission at all.",
    "risk": "Full SMS access exposes bank alerts, OTPs and every private message on the device.",
    "recommend": "Revoke it. Type the OTP yourself if autofill breaks.",
    "aliases": [
      "sms",
      "read sms",
      "receive sms",
      "text messages",
      "messages"
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
    "id": "microphone",
    "label": "Microphone",
    "android": "android.permission.RECORD_AUDIO",
    "ios": "Microphone",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "Nothing in a utility app records audio.",
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
    "id": "ad-id",
    "label": "Advertising ID",
    "android": "com.google.android.gms.permission.AD_ID",
    "ios": "App Tracking Transparency",
    "tier": "low",
    "necessity": "unnecessary",
    "why": "Free utilities are usually ad-funded; this is how the ad network follows you.",
    "risk": "Joins what you do in this app to advertising profiles held by networks and data brokers.",
    "recommend": "Delete the Android advertising ID in Settings > Privacy > Ads, and answer 'Ask App Not to Track' on iOS.",
    "aliases": [
      "advertising id",
      "ad id",
      "personalised ads",
      "personalized ads",
      "tracking"
    ]
  },
  {
    "id": "boot-completed",
    "label": "Start automatically at boot",
    "android": "android.permission.RECEIVE_BOOT_COMPLETED",
    "ios": "(not available)",
    "tier": "minimal",
    "necessity": "unnecessary",
    "why": "Relaunches the app every time the phone restarts.",
    "risk": "Guarantees the app and its ad SDK are always running, which is itself a battery cost.",
    "recommend": "Restrict background activity for the app, or uninstall it.",
    "aliases": [
      "start at boot",
      "run at startup",
      "receive boot completed",
      "autostart"
    ]
  },
  {
    "id": "battery-exemption",
    "label": "Ignore battery optimisation",
    "android": "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
    "ios": "(not available)",
    "tier": "low",
    "necessity": "unnecessary",
    "why": "Asks the system to stop putting the app to sleep.",
    "risk": "A battery-saver app asking to be exempt from battery saving is a contradiction, and it keeps ad SDKs alive.",
    "recommend": "Set the app back to 'Optimised' in Settings > Apps > Battery.",
    "aliases": [
      "battery optimisation",
      "battery optimization",
      "unrestricted battery",
      "ignore battery"
    ]
  },
  {
    "id": "notifications",
    "label": "Notifications",
    "android": "android.permission.POST_NOTIFICATIONS",
    "ios": "Notifications",
    "tier": "minimal",
    "necessity": "optional",
    "why": "Progress and 'your phone is slow' prompts.",
    "risk": "A marketing channel more than a data risk.",
    "recommend": "Allow, then mute the promotional notification channel and keep only transactional alerts.",
    "aliases": [
      "notifications",
      "post notifications",
      "alerts"
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
export function resultToText(result, appName = "Utility app") {
  if (!result || result.error) return "";
  const name = String(appName || "Utility app").trim() || "Utility app";
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
