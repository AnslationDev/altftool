/**
 * Banking App Permission Audit — logic module.
 *
 * Pure data + arithmetic. No React, no DOM, no clock reads.
 *
 * Every entry states the platform permission, whether a banking or payments app
 * has a genuine need for it, what breaks if you deny it, and the narrower
 * alternative where one exists.
 *
 * Reference points used when classifying:
 *  - Google Play restricts SMS and Call Log access to apps whose core function
 *    requires it; one-time-code entry is expected to use the SMS Retriever API,
 *    which needs no permission at all.
 *  - The Reserve Bank of India's digital lending guidelines (September 2022)
 *    state that lending apps should access data only on a need basis with
 *    explicit consent, and should not seek access to files, media, contact
 *    lists, call logs or telephony functions; camera, microphone and location
 *    may be accessed once, with consent, for onboarding and KYC.
 *  - Android's accessibility service and display-over-other-apps permissions are
 *    the two grants banking trojans rely on to read screens and overlay fake
 *    login forms; no legitimate bank needs either.
 */

/** How much data the grant exposes. */
export const SENSITIVITY_WEIGHT = Object.freeze({ low: 1, medium: 3, high: 6 });

/**
 * How defensible the request is for this category of app. The same grant is
 * worse when the app has no legitimate use for it, so the sensitivity weight is
 * multiplied by this factor.
 */
export const VERDICT_MULTIPLIER = Object.freeze({ core: 0.5, optional: 1, unjustified: 2 });

export const VERDICT_LABEL = Object.freeze({
  core: "Needed",
  optional: "Only for one feature",
  unjustified: "Red flag",
});

export const PERMISSIONS = Object.freeze([
  {
    id: "notifications",
    label: "Notifications",
    platform: "Android POST_NOTIFICATIONS / iOS Notifications",
    verdict: "core",
    sensitivity: "low",
    why: "Debit and login alerts are how you find out about a fraudulent transaction within seconds instead of at the end of the month.",
    breaks: "You stop getting transaction and login alerts in real time.",
    alternative: "Keep it on, but turn off marketing notification categories separately.",
  },
  {
    id: "biometric-unlock",
    label: "Face or fingerprint unlock",
    platform: "Android BIOMETRIC / iOS Face ID and Touch ID",
    verdict: "core",
    sensitivity: "low",
    why: "The app asks the operating system to verify you; the biometric template never leaves the secure element and the app never sees it.",
    breaks: "You fall back to typing a passcode every time you open the app.",
    alternative: "Safe to allow — this is the grant with the best security-to-exposure ratio.",
  },
  {
    id: "camera",
    label: "Camera",
    platform: "Android CAMERA / iOS Camera",
    verdict: "optional",
    sensitivity: "high",
    why: "Used for QR payments, cheque capture and video KYC. Genuine, but only during those flows.",
    breaks: "Scanning a QR code or a cheque stops working; you enter details by hand.",
    alternative: "Grant 'while using the app' and revoke after a one-off KYC session.",
  },
  {
    id: "microphone",
    label: "Microphone",
    platform: "Android RECORD_AUDIO / iOS Microphone",
    verdict: "optional",
    sensitivity: "high",
    why: "Only defensible for a video-KYC call or in-app support call.",
    breaks: "Video KYC and in-app voice support stop working.",
    alternative: "Grant it for the KYC session, then revoke it the same day.",
  },
  {
    id: "location-foreground",
    label: "Location while using the app",
    platform: "Android ACCESS_COARSE_LOCATION / iOS Location When In Use",
    verdict: "optional",
    sensitivity: "medium",
    why: "Branch and ATM finders need it, and some banks use it as a weak signal in fraud checks.",
    breaks: "The ATM finder cannot centre on you; you search by area name instead.",
    alternative: "Choose approximate rather than precise location — it is enough to list nearby branches.",
  },
  {
    id: "contacts",
    label: "Contacts",
    platform: "Android READ_CONTACTS / iOS Contacts",
    verdict: "optional",
    sensitivity: "high",
    why: "Only used to let you pick a payee by name. It hands over every name, number and email in your address book, including people who never agreed to share theirs.",
    breaks: "You type or paste the payee's number or payment address instead.",
    alternative: "Deny it. Typing a payee once is a small cost for keeping your whole address book private.",
  },
  {
    id: "photo-library-full",
    label: "Full photo library access",
    platform: "Android READ_MEDIA_IMAGES / iOS Photos (All Photos)",
    verdict: "unjustified",
    sensitivity: "high",
    why: "Uploading a statement or a document needs one picture, not the library. Full access exposes every photo you own along with its dates and locations.",
    breaks: "Nothing — the system picker still lets you hand over the specific image.",
    alternative: "Choose 'Selected photos' on iOS, or rely on Android's photo picker, which needs no permission.",
  },
  {
    id: "sms",
    label: "Read SMS messages",
    platform: "Android READ_SMS / RECEIVE_SMS",
    verdict: "unjustified",
    sensitivity: "high",
    why: "Pitched as one-time-code autofill, but the SMS Retriever API delivers the code to the app with no permission and no access to anything else. Full SMS access reads every message you have ever received.",
    breaks: "You copy the code from the notification, which takes a second.",
    alternative: "Revoke it. iOS has no equivalent permission and codes autofill perfectly well there.",
  },
  {
    id: "call-log-phone",
    label: "Phone and call log",
    platform: "Android READ_CALL_LOG / READ_PHONE_STATE",
    verdict: "unjustified",
    sensitivity: "high",
    why: "Call history is used for behavioural scoring and device fingerprinting, and it exposes who you speak to and for how long.",
    breaks: "Nothing you will notice in a banking app.",
    alternative: "Revoke it. If the app refuses to run without it, that is the answer to whether you should keep the app.",
  },
  {
    id: "background-location",
    label: "Location all the time",
    platform: "Android ACCESS_BACKGROUND_LOCATION / iOS Location Always",
    verdict: "unjustified",
    sensitivity: "high",
    why: "Continuous background location builds a movement history — home, workplace, place of worship, clinic — far beyond anything a fraud check needs.",
    breaks: "Nothing. Location-based fraud signals work from foreground use.",
    alternative: "Downgrade to 'while using the app', or deny entirely.",
  },
  {
    id: "accessibility-service",
    label: "Accessibility service",
    platform: "Android BIND_ACCESSIBILITY_SERVICE",
    verdict: "unjustified",
    sensitivity: "high",
    why: "It lets an app read everything on screen and tap on your behalf. It is the single grant that banking trojans need, and no legitimate bank asks for it.",
    breaks: "Nothing legitimate.",
    alternative: "Revoke immediately and treat the request itself as a reason to uninstall.",
  },
  {
    id: "display-over-apps",
    label: "Display over other apps",
    platform: "Android SYSTEM_ALERT_WINDOW",
    verdict: "unjustified",
    sensitivity: "high",
    why: "Overlay permission is what makes a fake login screen possible on top of the real one.",
    breaks: "Nothing a bank needs; at most a floating chat bubble.",
    alternative: "Revoke it.",
  },
  {
    id: "notification-access",
    label: "Notification access (read all notifications)",
    platform: "Android BIND_NOTIFICATION_LISTENER_SERVICE",
    verdict: "unjustified",
    sensitivity: "high",
    why: "This reads every notification on the device, including one-time codes and message previews from every other app.",
    breaks: "Nothing.",
    alternative: "Revoke it in the special app access settings.",
  },
  {
    id: "installed-apps-query",
    label: "See all installed apps",
    platform: "Android QUERY_ALL_PACKAGES",
    verdict: "unjustified",
    sensitivity: "high",
    why: "The list of apps on your phone is used for credit and risk scoring and reveals health, dating, political and religious interests.",
    breaks: "Nothing visible to you.",
    alternative: "Not user-revocable on most devices — weigh it when choosing between apps.",
  },
  {
    id: "install-unknown-apps",
    label: "Install unknown apps",
    platform: "Android REQUEST_INSTALL_PACKAGES",
    verdict: "unjustified",
    sensitivity: "high",
    why: "It lets the app install other software outside the store. A bank distributes updates through the store like everyone else.",
    breaks: "Nothing.",
    alternative: "Revoke it and be suspicious of any app that asks.",
  },
  {
    id: "nearby-bluetooth",
    label: "Nearby devices and Bluetooth",
    platform: "Android BLUETOOTH_SCAN / iOS Bluetooth",
    verdict: "unjustified",
    sensitivity: "medium",
    why: "Unless you are pairing a card reader, Bluetooth scanning is mostly used for presence and proximity analytics.",
    breaks: "Card readers and wearables stop pairing.",
    alternative: "Deny unless you actually pair hardware with the app.",
  },
  {
    id: "calendar",
    label: "Calendar",
    platform: "Android READ_CALENDAR / iOS Calendars",
    verdict: "unjustified",
    sensitivity: "medium",
    why: "Adding a payment reminder does not require reading your existing appointments, which describe your health, work and personal life.",
    breaks: "You add due-date reminders manually.",
    alternative: "Revoke it and use your own reminder app.",
  },
  {
    id: "ad-tracking",
    label: "Cross-app tracking / advertising ID",
    platform: "iOS App Tracking Transparency / Android advertising ID",
    verdict: "unjustified",
    sensitivity: "medium",
    why: "A bank that links your financial behaviour to an advertising profile is monetising the most sensitive data you have.",
    breaks: "Nothing.",
    alternative: "Decline the tracking prompt and delete the advertising ID in Android privacy settings.",
  },
]);

export const RISK_BANDS = Object.freeze([
  { id: "none", label: "Nothing granted", advice: "No permissions ticked yet." },
  { id: "low", label: "Tight", advice: "The app has only what it needs to work. Review again after any big update." },
  { id: "moderate", label: "Loose", advice: "Some grants exist only for features you may not use. Revoke what you do not need." },
  { id: "high", label: "Over-permissioned", advice: "The app holds data a bank has no reason to see. Revoke the red flags today." },
  { id: "severe", label: "Dangerous", advice: "This permission set is what device-takeover fraud needs. Revoke, then consider removing the app." },
]);

/** Score thresholds, applied to the weighted percentage. */
const BAND_THRESHOLDS = Object.freeze([
  { max: 0, index: 0 },
  { max: 19, index: 1 },
  { max: 39, index: 2 },
  { max: 64, index: 3 },
  { max: 100, index: 4 },
]);

/** Weighted points a single grant contributes. */
export function permissionPoints(permission) {
  if (!permission) return 0;
  return SENSITIVITY_WEIGHT[permission.sensitivity] * VERDICT_MULTIPLIER[permission.verdict];
}

/** Points if every permission in the catalogue were granted — the 100% mark. */
export const MAX_POINTS = PERMISSIONS.reduce(
  (total, permission) => total + permissionPoints(permission),
  0,
);

function bandIndexForScore(score) {
  const match = BAND_THRESHOLDS.find((threshold) => score <= threshold.max);
  return match ? match.index : BAND_THRESHOLDS[BAND_THRESHOLDS.length - 1].index;
}

/**
 * Audit the permissions a banking app currently holds.
 *
 * score = 100 x (sensitivity x verdict multiplier, summed over granted)
 *             / (the same sum over the whole catalogue)
 *
 * Band floor: any granted red flag raises the band to at least "Loose", and a
 * high-sensitivity red flag raises it to at least "Over-permissioned", because a
 * single screen-reading grant matters more than the arithmetic suggests.
 *
 * @param {{ grantedIds?: string[] }} input
 * @returns {object|{ error:string }}
 */
export function auditBankingPermissions({ grantedIds = [] } = {}) {
  if (!Array.isArray(grantedIds)) {
    return { error: "Granted permissions must be a list of permission ids." };
  }

  const unique = Array.from(new Set(grantedIds.filter((id) => typeof id === "string")));
  const granted = unique
    .map((id) => PERMISSIONS.find((permission) => permission.id === id))
    .filter(Boolean);
  const unknownCount = unique.length - granted.length;

  const points = granted.reduce((total, permission) => total + permissionPoints(permission), 0);
  const score = MAX_POINTS > 0 ? Math.round((points / MAX_POINTS) * 100) : 0;

  const redFlags = granted.filter((permission) => permission.verdict === "unjustified");
  const optional = granted.filter((permission) => permission.verdict === "optional");
  const core = granted.filter((permission) => permission.verdict === "core");
  const missingCore = PERMISSIONS.filter(
    (permission) =>
      permission.verdict === "core" && !granted.some((entry) => entry.id === permission.id),
  );

  let bandIndex = bandIndexForScore(score);
  if (redFlags.length > 0) bandIndex = Math.max(bandIndex, 2);
  if (redFlags.some((permission) => permission.sensitivity === "high")) {
    bandIndex = Math.max(bandIndex, 3);
  }

  const revokeNow = redFlags
    .slice()
    .sort((a, b) => permissionPoints(b) - permissionPoints(a))
    .map((permission) => ({
      id: permission.id,
      label: permission.label,
      platform: permission.platform,
      why: permission.why,
      breaks: permission.breaks,
      alternative: permission.alternative,
    }));

  const reviewNext = optional
    .slice()
    .sort((a, b) => permissionPoints(b) - permissionPoints(a))
    .map((permission) => ({
      id: permission.id,
      label: permission.label,
      breaks: permission.breaks,
      alternative: permission.alternative,
    }));

  return {
    score,
    band: RISK_BANDS[bandIndex],
    points,
    maxPoints: MAX_POINTS,
    grantedCount: granted.length,
    unknownCount,
    redFlagCount: redFlags.length,
    optionalCount: optional.length,
    coreCount: core.length,
    missingCore,
    revokeNow,
    reviewNext,
    granted,
  };
}

/** Catalogue grouped by verdict, most defensible first. */
export function groupedPermissions() {
  return [
    { name: "Needed for the app to do its job", verdict: "core" },
    { name: "Only needed for one feature", verdict: "optional" },
    { name: "A bank has no business asking", verdict: "unjustified" },
  ].map((group) => ({
    ...group,
    items: PERMISSIONS.filter((permission) => permission.verdict === group.verdict),
  }));
}
