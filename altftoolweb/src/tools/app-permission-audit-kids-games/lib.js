/**
 * Kids Game App Permission Audit — scoring logic.
 *
 * Pure module: no React, no DOM, no clock reads. Every threshold below is a named
 * constant with the rule it comes from.
 *
 * Regulatory anchors used for the guidance text:
 *  - COPPA, 16 CFR Part 312 (US): applies to online services directed to children
 *    UNDER 13; verifiable parental consent is required before collecting personal
 *    information, which expressly includes precise geolocation and persistent
 *    identifiers such as advertising IDs.
 *  - Digital Personal Data Protection Act 2023, s.9 (India): a child is anyone
 *    UNDER 18; verifiable parental consent is required, and tracking, behavioural
 *    monitoring and targeted advertising directed at children are barred.
 *  - Google Play Families policy: apps whose target audience includes children must
 *    not transmit the Android Advertising ID (the AD_ID permission must not be used).
 *  - Apple App Review Guideline 1.3 (Kids Category): no third-party advertising or
 *    third-party analytics, and no sending identifying data to third parties.
 *
 * Platform facts referenced in the copy:
 *  - Android 13 (API 33) made POST_NOTIFICATIONS a runtime permission.
 *  - Android 12 (API 31) added the "approximate location" choice to the runtime dialog.
 *  - Android 11 (API 30) auto-resets permissions for apps left unused for a few months.
 *  - iOS 14 added the Precise Location toggle and App Tracking Transparency.
 */

/** Age below which COPPA (16 CFR Part 312) treats the user as a child. */
export const COPPA_CHILD_AGE_LIMIT = 13;

/** Age below which India's DPDP Act 2023 s.9 treats the user as a child. */
export const DPDP_CHILD_AGE_LIMIT = 18;

/** Youngest age this checklist accepts (a 1-year-old is the practical floor). */
export const MIN_AGE_YEARS = 1;

/** Oldest age this checklist accepts; 18+ is an adult under both regimes above. */
export const MAX_AGE_YEARS = 17;

/**
 * Risk multiplier applied to a permission's weight once it is granted.
 * "revoke"  = no legitimate use in this game -> counts at full weight.
 * "review"  = the game genuinely uses it, but it is still live attack surface,
 *             so it counts at half weight rather than zero.
 */
export const TIER_WEIGHT_MULTIPLIER = { revoke: 1, review: 0.5 };

/**
 * A granted "revoke"-tier permission this heavy or heavier is reported as a red flag.
 * Set at 8 so low-stakes nags (notifications, weight 4) do not escalate the band.
 */
export const RED_FLAG_MIN_WEIGHT = 8;

/** Exposure-score cut-offs (percent of the worst-case score for this game). */
export const BAND_THRESHOLDS = [
  { min: 70, key: "critical", label: "Critical exposure" },
  { min: 45, key: "high", label: "High exposure" },
  { min: 20, key: "moderate", label: "Moderate exposure" },
  { min: 1, key: "low", label: "Low exposure" },
  { min: 0, key: "clean", label: "Nothing granted" },
];

const BAND_ORDER = ["clean", "low", "moderate", "high", "critical"];

/** One red flag forces at least this band; RED_FLAG_CRITICAL_COUNT forces "critical". */
export const RED_FLAG_MIN_BAND = "high";
export const RED_FLAG_CRITICAL_COUNT = 3;

/**
 * Feature flags describing what the game honestly does. A permission whose
 * `requires` flag is true drops from "revoke" to "review"; otherwise it stays
 * "revoke" because nothing in the game can justify it.
 */
export const FEATURE_FLAGS = [
  {
    id: "isLocationGame",
    label: "It is a real-world / map-based game (like a monster-catching walk-around game)",
  },
  { id: "hasVoiceChat", label: "It has voice chat with other players" },
  { id: "hasCameraFeature", label: "It lets the player take or import a photo (avatar, AR mode)" },
  { id: "hasLocalMultiplayer", label: "It supports same-room multiplayer over Bluetooth or Wi-Fi Direct" },
];

/**
 * The permission catalogue. `weight` is the harm potential for a CHILD's account
 * on a 1-10 scale: identifiers and anything that reveals where the child physically
 * is, who they know, or what they say sit at 9-10.
 */
export const KIDS_GAME_PERMISSIONS = [
  {
    id: "precise-location",
    label: "Precise location",
    platform: "Android: ACCESS_FINE_LOCATION · iOS: Location → Precise Location",
    weight: 10,
    requires: "isLocationGame",
    why: "Pins the child to a few metres — home, school, the park they play in. Under COPPA precise geolocation is personal information and needs verifiable parental consent.",
    breaks: "Nothing in an ordinary game. Only a real-world map game loses features.",
    how: "Android: Settings → Apps → the game → Permissions → Location → Don't allow. iOS: Settings → the game → Location → Never (and switch Precise Location off).",
  },
  {
    id: "approximate-location",
    label: "Approximate location",
    platform: "Android: ACCESS_COARSE_LOCATION (the 'Approximate' choice since Android 12) · iOS: Precise Location off",
    weight: 6,
    requires: "isLocationGame",
    why: "Still narrows the child to a neighbourhood-sized area and is commonly fed to ad networks for geo-targeting.",
    breaks: "Nothing, unless the game genuinely serves regional content or a map.",
    how: "Android: Permissions → Location → Don't allow. iOS: Settings → the game → Location → Never.",
  },
  {
    id: "contacts",
    label: "Contacts",
    platform: "Android: READ_CONTACTS · iOS: Contacts",
    weight: 10,
    requires: null,
    why: "Uploads the whole family address book — every phone number and email in the device — to find 'friends'. That exposes adults who never installed the app.",
    breaks: "At most an in-game friend-finder. Friend codes and QR invites do the same job without the upload.",
    how: "Android: Permissions → Contacts → Don't allow. iOS: Settings → the game → Contacts → off.",
  },
  {
    id: "microphone",
    label: "Microphone",
    platform: "Android: RECORD_AUDIO · iOS: Microphone",
    weight: 9,
    requires: "hasVoiceChat",
    why: "Live audio from a child's room. Even with legitimate voice chat this is the single riskiest permission for stranger contact.",
    breaks: "Voice chat and voice-controlled mini-games stop working.",
    how: "Android: Permissions → Microphone → Don't allow. iOS: Settings → the game → Microphone → off.",
  },
  {
    id: "camera",
    label: "Camera",
    platform: "Android: CAMERA · iOS: Camera",
    weight: 8,
    requires: "hasCameraFeature",
    why: "Lets the app capture images of the child and their home, and AR modes often ship those frames to a server.",
    breaks: "Avatar selfies, QR-code scanning and AR modes stop working.",
    how: "Android: Permissions → Camera → Don't allow. iOS: Settings → the game → Camera → off.",
  },
  {
    id: "photos-library",
    label: "Full photo library access",
    platform: "Android: READ_MEDIA_IMAGES / READ_MEDIA_VIDEO · iOS: Photos → All Photos",
    weight: 8,
    requires: "hasCameraFeature",
    why: "Hands the app every family photo, plus the location and timestamp stored inside each one.",
    breaks: "Nothing, if you switch to the picker instead: Android's Photo Picker and iOS 'Selected Photos' hand over only the image the child chooses.",
    how: "Android: Permissions → Photos and videos → Ask every time. iOS: Settings → the game → Photos → Limited Access (or None).",
  },
  {
    id: "all-files-access",
    label: "All files access",
    platform: "Android: MANAGE_EXTERNAL_STORAGE (Special app access)",
    weight: 10,
    requires: null,
    why: "Read and write over the entire shared storage — documents, downloads, other apps' media. Google restricts this to file managers and backup tools; a game has no case for it.",
    breaks: "Nothing in a game.",
    how: "Android: Settings → Apps → Special app access → All files access → turn the game off.",
  },
  {
    id: "sms",
    label: "SMS",
    platform: "Android: READ_SMS / RECEIVE_SMS",
    weight: 10,
    requires: null,
    why: "Reads every text on the phone, including one-time passcodes for banking and email on a shared family device.",
    breaks: "Nothing. SMS sign-in is not something a children's game should be doing.",
    how: "Android: Permissions → SMS → Don't allow. If it is not listed, uninstall — iOS never grants SMS to apps at all.",
  },
  {
    id: "phone",
    label: "Phone / call log",
    platform: "Android: READ_PHONE_STATE, READ_CALL_LOG, CALL_PHONE",
    weight: 9,
    requires: null,
    why: "READ_PHONE_STATE historically exposed hardware identifiers, and the call log is a map of who the family talks to.",
    breaks: "Nothing. Pausing a game during a call does not need this on modern Android.",
    how: "Android: Permissions → Phone → Don't allow.",
  },
  {
    id: "calendar",
    label: "Calendar",
    platform: "Android: READ_CALENDAR / WRITE_CALENDAR · iOS: Calendars",
    weight: 8,
    requires: null,
    why: "Reveals the family's routine — school hours, appointments, travel dates — and write access lets the app inject 'event' spam.",
    breaks: "Nothing.",
    how: "Android: Permissions → Calendar → Don't allow. iOS: Settings → the game → Calendars → off.",
  },
  {
    id: "nearby-devices",
    label: "Nearby devices",
    platform: "Android: BLUETOOTH_SCAN, BLUETOOTH_CONNECT, NEARBY_WIFI_DEVICES · iOS: Local Network / Bluetooth",
    weight: 7,
    requires: "hasLocalMultiplayer",
    why: "Bluetooth and Wi-Fi scans double as an indoor positioning signal, which is why ad SDKs like them.",
    breaks: "Same-room multiplayer and Bluetooth controller pairing stop working.",
    how: "Android: Permissions → Nearby devices → Don't allow. iOS: Settings → the game → Local Network / Bluetooth → off.",
  },
  {
    id: "advertising-id",
    label: "Advertising ID / tracking",
    platform: "Android: com.google.android.gms.permission.AD_ID · iOS: App Tracking Transparency prompt",
    weight: 10,
    requires: null,
    why: "A persistent identifier that follows the child across apps. Google Play's Families policy bars transmitting the Advertising ID in apps whose audience includes children, and DPDP s.9 bars targeted advertising to under-18s outright.",
    breaks: "Nothing playable. The game may show untargeted ads instead of targeted ones.",
    how: "Android: Settings → Privacy → Ads → Delete advertising ID. iOS: Settings → Privacy & Security → Tracking → turn the game off (or 'Ask App Not to Track' at the prompt).",
  },
  {
    id: "notifications",
    label: "Notifications",
    platform: "Android: POST_NOTIFICATIONS (runtime since Android 13) · iOS: Notifications",
    weight: 4,
    requires: null,
    why: "Not a data leak, but in free-to-play kids' titles it is the main re-engagement and limited-time-offer channel aimed straight at a child.",
    breaks: "Reminders and event alerts stop. Gameplay is unaffected.",
    how: "Android: Settings → Apps → the game → Notifications → off. iOS: Settings → Notifications → the game → Allow Notifications off.",
  },
  {
    id: "physical-activity",
    label: "Physical activity",
    platform: "Android: ACTIVITY_RECOGNITION · iOS: Motion & Fitness",
    weight: 6,
    requires: null,
    why: "Step and motion data profiles when the child is walking, sitting or asleep — a behavioural signal with no place in a game.",
    breaks: "Step-counting rewards, if the game has them.",
    how: "Android: Permissions → Physical activity → Don't allow. iOS: Settings → the game → Motion & Fitness → off.",
  },
  {
    id: "display-over-apps",
    label: "Display over other apps",
    platform: "Android: SYSTEM_ALERT_WINDOW (Special app access)",
    weight: 9,
    requires: null,
    why: "Lets the app draw on top of anything else on screen. This is the classic tapjacking vector — an invisible overlay can harvest taps meant for another app.",
    breaks: "Floating widgets or a chat head, if the game has one.",
    how: "Android: Settings → Apps → Special app access → Display over other apps → turn the game off.",
  },
  {
    id: "accessibility-service",
    label: "Accessibility service",
    platform: "Android: BIND_ACCESSIBILITY_SERVICE",
    weight: 10,
    requires: null,
    why: "The most powerful permission on Android: it can read every screen and simulate taps in any app. A game asking for it is a stop-and-uninstall signal.",
    breaks: "Nothing legitimate in a game.",
    how: "Android: Settings → Accessibility → Downloaded apps → the game → off, then uninstall.",
  },
];

const PERMISSION_BY_ID = new Map(KIDS_GAME_PERMISSIONS.map((item) => [item.id, item]));

/** Resolve a permission's tier for a given set of honest feature flags. */
export function resolveTier(permission, features = {}) {
  if (!permission) return "revoke";
  if (permission.requires && features[permission.requires] === true) return "review";
  return "revoke";
}

function bandForExposure(exposure) {
  for (const band of BAND_THRESHOLDS) {
    if (exposure >= band.min) return band;
  }
  return BAND_THRESHOLDS[BAND_THRESHOLDS.length - 1];
}

function escalate(band, redFlagCount) {
  if (redFlagCount <= 0) return band;
  const target =
    redFlagCount >= RED_FLAG_CRITICAL_COUNT ? "critical" : RED_FLAG_MIN_BAND;
  const current = BAND_ORDER.indexOf(band.key);
  const forced = BAND_ORDER.indexOf(target);
  if (forced <= current) return band;
  return BAND_THRESHOLDS.find((item) => item.key === target) || band;
}

/**
 * Which legal regimes apply to a player of this age.
 * Informational only — this is not legal advice.
 */
export function applicableRegimes(age) {
  const regimes = [];
  if (age < COPPA_CHILD_AGE_LIMIT) {
    regimes.push({
      name: "COPPA (US, 16 CFR Part 312)",
      note: `Applies to services directed to children under ${COPPA_CHILD_AGE_LIMIT}. Verifiable parental consent is required before collecting personal information, and that expressly includes precise geolocation and persistent identifiers such as advertising IDs.`,
    });
    regimes.push({
      name: "Google Play Families policy / Apple Kids Category",
      note: "Store rules bar transmitting the Android Advertising ID in child-audience apps, and Apple's Kids Category forbids third-party advertising and third-party analytics.",
    });
  }
  if (age < DPDP_CHILD_AGE_LIMIT) {
    regimes.push({
      name: "DPDP Act 2023, s.9 (India)",
      note: `Anyone under ${DPDP_CHILD_AGE_LIMIT} is a child. Verifiable parental consent is required, and tracking, behavioural monitoring and targeted advertising directed at children are not permitted.`,
    });
  }
  return regimes;
}

/**
 * Audit the permissions a children's game currently holds.
 *
 * @param {object} input
 * @param {string[]} input.granted   permission ids from KIDS_GAME_PERMISSIONS
 * @param {number|string} input.childAge  player's age in years (1-17)
 * @param {object} input.features    honest feature flags, see FEATURE_FLAGS
 * @returns {object} audit result, or { error } for invalid input
 */
export function auditKidsGamePermissions({ granted = [], childAge, features = {} } = {}) {
  if (!Array.isArray(granted)) {
    return { error: "Selected permissions must be provided as a list." };
  }
  const safeFeatures = features && typeof features === "object" ? features : {};

  const age = Number(childAge);
  if (childAge === "" || childAge === null || childAge === undefined || !Number.isFinite(age)) {
    return { error: "Enter the player's age in whole years." };
  }
  if (!Number.isInteger(age)) {
    return { error: "Enter the player's age in whole years." };
  }
  if (age < MIN_AGE_YEARS) {
    return { error: `Age must be at least ${MIN_AGE_YEARS} year.` };
  }
  if (age > MAX_AGE_YEARS) {
    return {
      error: `This checklist covers players under ${DPDP_CHILD_AGE_LIMIT}. For an adult's phone, use a general app permission audit instead.`,
    };
  }

  const grantedSet = new Set(granted.filter((id) => PERMISSION_BY_ID.has(id)));

  let score = 0;
  let maxScore = 0;
  const revokeNow = [];
  const reviewCarefully = [];
  const notGranted = [];

  for (const permission of KIDS_GAME_PERMISSIONS) {
    const tier = resolveTier(permission, safeFeatures);
    const multiplier = TIER_WEIGHT_MULTIPLIER[tier];
    const contribution = permission.weight * multiplier;
    maxScore += contribution;

    if (!grantedSet.has(permission.id)) {
      notGranted.push({ ...permission, tier });
      continue;
    }
    score += contribution;
    const row = { ...permission, tier, points: contribution };
    if (tier === "review") reviewCarefully.push(row);
    else revokeNow.push(row);
  }

  // maxScore is a sum of positive constants over a non-empty catalogue, so it is
  // always > 0 — but guard anyway so the function can never return NaN.
  const exposure = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const redFlags = revokeNow.filter((item) => item.weight >= RED_FLAG_MIN_WEIGHT);
  const band = escalate(bandForExposure(exposure), redFlags.length);

  return {
    age,
    exposure,
    score: Math.round(score * 10) / 10,
    maxScore: Math.round(maxScore * 10) / 10,
    band: band.key,
    bandLabel: band.label,
    grantedCount: grantedSet.size,
    totalCount: KIDS_GAME_PERMISSIONS.length,
    redFlagCount: redFlags.length,
    revokeNow,
    reviewCarefully,
    notGranted,
    regimes: applicableRegimes(age),
  };
}

/** Plain-text summary of an audit result, for the copy button. */
export function formatAuditSummary(result) {
  if (!result || result.error) return "";
  const lines = [
    "Kids Game App Permission Audit",
    `Player age: ${result.age}`,
    `Permissions granted: ${result.grantedCount} of ${result.totalCount}`,
    `Exposure score: ${result.exposure}/100 — ${result.bandLabel}`,
    `Red flags: ${result.redFlagCount}`,
  ];
  if (result.revokeNow.length) {
    lines.push("", "Revoke now:");
    for (const item of result.revokeNow) lines.push(`- ${item.label} (${item.platform})`);
  }
  if (result.reviewCarefully.length) {
    lines.push("", "Keep only while the feature is used:");
    for (const item of result.reviewCarefully) lines.push(`- ${item.label}`);
  }
  if (result.regimes.length) {
    lines.push("", "Rules that apply at this age:");
    for (const regime of result.regimes) lines.push(`- ${regime.name}`);
  }
  return lines.join("\n");
}
