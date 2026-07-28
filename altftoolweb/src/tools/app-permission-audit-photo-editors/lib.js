/**
 * Photo Editor App Permission Audit — pure logic.
 *
 * Scores an image-editing app. The baseline is the system photo picker, which
 * since Android 13 and iOS 14 hands over a single chosen file with no permission
 * at all — so full-library access, all-files access and EXIF location access are
 * scored as extras the app has to justify.
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
  unnecessary: "Not needed by a photo editor",
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
 * Permissions and privacy settings a photo editing app can hold.
 * `android` is the manifest constant or settings screen, `ios` the matching
 * iOS prompt.
 */
export const PERMISSIONS = [
  {
    "id": "photos-selected",
    "label": "Selected photos only (system picker)",
    "android": "Photo Picker (no permission)",
    "ios": "Limited Access",
    "tier": "minimal",
    "necessity": "core",
    "why": "Hands the app exactly the one image you chose, and nothing else.",
    "risk": "None. This is the safest way to give an editor a file.",
    "recommend": "Keep. If the app refuses to work this way, that is a reason to switch editors.",
    "aliases": [
      "selected photos",
      "photo picker",
      "limited access",
      "select photos"
    ]
  },
  {
    "id": "save-to-gallery",
    "label": "Save the edited image",
    "android": "MediaStore write (no permission on Android 10+)",
    "ios": "Add Photos Only",
    "tier": "minimal",
    "necessity": "core",
    "why": "Writes the finished picture back to your gallery.",
    "risk": "Write-only access cannot read anything already in the library.",
    "recommend": "Keep. On iOS choose 'Add Photos Only' rather than full access.",
    "aliases": [
      "save to gallery",
      "add photos only",
      "write photos",
      "save image"
    ]
  },
  {
    "id": "photos-all",
    "label": "Photos and videos (whole library)",
    "android": "android.permission.READ_MEDIA_IMAGES / READ_MEDIA_VIDEO",
    "ios": "Photos — All Photos",
    "tier": "moderate",
    "necessity": "optional",
    "why": "Batch editing and in-app browsing of your library.",
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
    "id": "media-location",
    "label": "Location tags inside photos",
    "android": "android.permission.ACCESS_MEDIA_LOCATION",
    "ios": "Photos location metadata",
    "tier": "high",
    "necessity": "optional",
    "why": "Reads the GPS coordinates embedded in each image by the camera.",
    "risk": "Gives the app a map of everywhere you have taken a photo, without ever asking for location.",
    "recommend": "Deny it, and strip EXIF before sharing images publicly.",
    "aliases": [
      "media location",
      "photo location",
      "exif",
      "location tags"
    ]
  },
  {
    "id": "camera",
    "label": "Camera",
    "android": "android.permission.CAMERA",
    "ios": "Camera",
    "tier": "high",
    "necessity": "optional",
    "why": "Shooting a new picture inside the editor instead of importing one.",
    "risk": "A standing grant lets the app open the camera whenever it is in the foreground.",
    "recommend": "Set it to 'Ask every time' — a one-off scan does not need a permanent grant.",
    "aliases": [
      "camera",
      "take pictures",
      "take photos"
    ]
  },
  {
    "id": "cloud-upload",
    "label": "Upload originals for cloud processing",
    "android": "Server-side filter / AI setting",
    "ios": "Cloud processing setting",
    "tier": "high",
    "necessity": "optional",
    "why": "AI backgrounds, upscaling and one-tap retouch usually run on the vendor's servers.",
    "risk": "Your original image, faces included, is copied off the device and kept for as long as the terms allow.",
    "recommend": "Prefer on-device processing, and check the terms for the licence you grant over uploaded images.",
    "aliases": [
      "cloud",
      "upload",
      "ai processing",
      "server processing",
      "sync"
    ]
  },
  {
    "id": "all-files",
    "label": "All files access",
    "android": "android.permission.MANAGE_EXTERNAL_STORAGE",
    "ios": "(not available)",
    "tier": "restricted",
    "necessity": "unnecessary",
    "why": "Editing one picture never needs documents, downloads and other apps' folders.",
    "risk": "Reads documents, downloads, WhatsApp media and other apps' exported data in one grant.",
    "recommend": "Revoke under Settings > Apps > Special app access > All files access.",
    "aliases": [
      "all files access",
      "manage external storage",
      "all files"
    ]
  },
  {
    "id": "microphone",
    "label": "Microphone",
    "android": "android.permission.RECORD_AUDIO",
    "ios": "Microphone",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "A still-image editor has nothing to record.",
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
    "id": "contacts",
    "label": "Contacts",
    "android": "android.permission.READ_CONTACTS",
    "ios": "Contacts",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "There is no editing feature behind this — it is contact-list harvesting.",
    "risk": "Uploads names and numbers of people who never installed the app and never consented.",
    "recommend": "Revoke it and share an invite link instead of your address book.",
    "aliases": [
      "contacts",
      "address book",
      "find friends"
    ]
  },
  {
    "id": "location-fine",
    "label": "Precise location",
    "android": "android.permission.ACCESS_FINE_LOCATION",
    "ios": "Location — While Using the App",
    "tier": "high",
    "necessity": "unnecessary",
    "why": "Geotagging an edit can use the tag already in the file; live GPS is not needed.",
    "risk": "Street-level position, and a home address the moment the app sees you overnight.",
    "recommend": "Revoke it.",
    "aliases": [
      "precise location",
      "fine location",
      "location while using",
      "gps",
      "location"
    ]
  },
  {
    "id": "query-all-packages",
    "label": "See all installed apps",
    "android": "android.permission.QUERY_ALL_PACKAGES",
    "ios": "(not available)",
    "tier": "restricted",
    "necessity": "unnecessary",
    "why": "Knowing every app you have installed does nothing for a filter.",
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
    "why": "Free editors are ad-funded; this is the identifier the ad SDK reports back.",
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
    "id": "notifications",
    "label": "Notifications",
    "android": "android.permission.POST_NOTIFICATIONS",
    "ios": "Notifications",
    "tier": "minimal",
    "necessity": "optional",
    "why": "Mostly prompts to try the paid tier.",
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
export function resultToText(result, appName = "Photo editor") {
  if (!result || result.error) return "";
  const name = String(appName || "Photo editor").trim() || "Photo editor";
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
