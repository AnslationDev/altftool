/**
 * Shared Family Password Plan Builder — sharing rules and alignment scoring.
 *
 * Pure module: no React, no DOM, no clock reads, and it never handles a password.
 *
 * Three rules drive every recommendation below.
 *
 * 1. Personally-held credentials are never shared. Retail banking terms and conditions
 *    almost universally require the customer not to disclose passwords, PINs or security
 *    codes to anyone, including family, and disclosure can be treated as the customer's
 *    own authorisation of a transaction. Medical portals and tax accounts are personal
 *    for the same reason. Where a partner genuinely needs authority, the correct route
 *    is the provider's own mechanism — a joint account, a third-party mandate, or a
 *    lasting power of attorney — not a shared login.
 *
 * 2. Household services get a household account. Energy, broadband, insurance and school
 *    portals let you name a second adult, which gives each person their own credential
 *    and their own audit trail.
 *
 * 3. Everything else is shared through a password manager's shared collection, which
 *    grants access per item and lets you revoke it in one action. Sending a password by
 *    message, email or a note on the fridge is never a correct answer: it leaves a
 *    plaintext copy in places you cannot revoke.
 *
 * Sensitivity is an ordinal 1-5 rank used to weight the alignment score. It is a
 * prioritisation device, not a probability.
 */

/** Household size bounds, used only to sanity-check input. */
export const MIN_ADULTS = 1;
export const MAX_ADULTS = 12;
export const MAX_TEENS = 12;

export const MODES = {
  "household-account": {
    id: "household-account",
    label: "Joint household account",
    short: "Household account",
    detail: "Both adults are named on the account and each has their own login.",
  },
  "vault-share": {
    id: "vault-share",
    label: "Shared password-manager collection",
    short: "Shared vault",
    detail: "Access granted per item and revocable in one click, without revealing a plaintext copy.",
  },
  "emergency-only": {
    id: "emergency-only",
    label: "Individual, with emergency access",
    short: "Emergency access",
    detail: "Held by one person; a nominated contact can request access after a waiting period.",
  },
  individual: {
    id: "individual",
    label: "Individual only, never shared",
    short: "Individual",
    detail: "Use the provider's own authority route if someone else genuinely needs to act.",
  },
  plaintext: {
    id: "plaintext",
    label: "Sent by message, email or written down",
    short: "Plaintext copy",
    detail: "Leaves copies you cannot revoke, in places that are backed up and searchable.",
  },
  na: {
    id: "na",
    label: "We do not have this",
    short: "Not applicable",
    detail: "Excluded from the score.",
  },
};

export const CREDENTIAL_GROUPS = [
  { id: "money", label: "Money & identity" },
  { id: "home", label: "Home & bills" },
  { id: "entertainment", label: "Subscriptions" },
  { id: "family", label: "Family & care" },
  { id: "devices", label: "Devices & network" },
];

export const CREDENTIALS = [
  {
    id: "personal-bank",
    group: "money",
    label: "Personal bank or card login",
    sensitivity: 5,
    recommended: "individual",
    needsInEmergency: true,
    why: "Bank terms require you not to disclose your password to anyone; disclosure can be read as your own authorisation of a payment.",
    action: "Open a joint account or add a third-party mandate instead of sharing the login.",
  },
  {
    id: "tax-portal",
    group: "money",
    label: "Tax or government services account",
    sensitivity: 5,
    recommended: "individual",
    needsInEmergency: true,
    why: "Identity-verified accounts are personal by design and often carry a legal declaration.",
    action: "Appoint an authorised agent through the service itself if someone must file on your behalf.",
  },
  {
    id: "password-manager-master",
    group: "money",
    label: "Password manager master password",
    sensitivity: 5,
    recommended: "emergency-only",
    needsInEmergency: true,
    why: "Sharing the master password hands over every other credential at once, permanently.",
    action: "Nominate your partner through the manager's emergency access or legacy contact feature.",
  },
  {
    id: "personal-email",
    group: "money",
    label: "Personal email account",
    sensitivity: 5,
    recommended: "emergency-only",
    needsInEmergency: true,
    why: "Every other account resets through this inbox, and it holds correspondence that is not joint.",
    action: "Use the provider's inactive-account or legacy-contact setting rather than sharing the password.",
  },
  {
    id: "shopping-account",
    group: "money",
    label: "Shopping account with a saved card",
    sensitivity: 3,
    recommended: "vault-share",
    needsInEmergency: false,
    why: "Genuinely shared in most households, but a saved card means it should still be revocable.",
    action: "Share through the vault and remove the saved card if you would rather re-enter it.",
  },
  {
    id: "energy-account",
    group: "home",
    label: "Energy or water supplier account",
    sensitivity: 2,
    recommended: "household-account",
    needsInEmergency: true,
    why: "Suppliers let you name a second account holder, so nobody needs to borrow a login.",
    action: "Add the second adult as a named account holder and let them set their own password.",
  },
  {
    id: "broadband-account",
    group: "home",
    label: "Broadband or mobile provider account",
    sensitivity: 2,
    recommended: "household-account",
    needsInEmergency: true,
    why: "Support will not talk to an unnamed person, which is exactly the problem at 8pm on a Sunday.",
    action: "Add the second adult as an authorised contact on the account.",
  },
  {
    id: "home-insurance",
    group: "home",
    label: "Home or contents insurance",
    sensitivity: 3,
    recommended: "household-account",
    needsInEmergency: true,
    why: "A claim can be made by either named policyholder, but not by a stranger with the password.",
    action: "Name both adults on the policy, not just on the login.",
  },
  {
    id: "council-utility-portal",
    group: "home",
    label: "Council, municipal or society portal",
    sensitivity: 3,
    recommended: "household-account",
    needsInEmergency: false,
    why: "Tied to the property rather than the person, so it belongs to the household.",
    action: "Register the household, adding both adults where the portal allows it.",
  },
  {
    id: "streaming-video",
    group: "entertainment",
    label: "Video streaming subscription",
    sensitivity: 1,
    recommended: "vault-share",
    needsInEmergency: false,
    why: "One login, several profiles — the classic case for revocable sharing.",
    action: "Put it in the shared vault and give each person their own viewing profile.",
  },
  {
    id: "music-subscription",
    group: "entertainment",
    label: "Music or audiobook subscription",
    sensitivity: 1,
    recommended: "vault-share",
    needsInEmergency: false,
    why: "Low value, high annoyance when only one person can reset it.",
    action: "Move to the provider's family plan if it has one, then share the billing login by vault.",
  },
  {
    id: "food-delivery",
    group: "entertainment",
    label: "Food delivery or takeaway account",
    sensitivity: 2,
    recommended: "vault-share",
    needsInEmergency: false,
    why: "Usually holds an address and a saved card, so it needs to be revocable.",
    action: "Share by vault and keep the delivery address list tidy.",
  },
  {
    id: "school-portal",
    group: "family",
    label: "School or nursery portal",
    sensitivity: 3,
    recommended: "household-account",
    needsInEmergency: true,
    why: "Schools issue a login per parent or guardian, which keeps consent records straight.",
    action: "Ask the school to issue a second parent login rather than sharing one.",
  },
  {
    id: "health-portal",
    group: "family",
    label: "Medical records or pharmacy portal",
    sensitivity: 5,
    recommended: "individual",
    needsInEmergency: true,
    why: "Health records are personal data about one person, and access is usually logged in their name.",
    action: "Use the service's proxy or carer access, which is designed for exactly this.",
  },
  {
    id: "child-device-account",
    group: "family",
    label: "A child's device or app store account",
    sensitivity: 2,
    recommended: "household-account",
    needsInEmergency: false,
    why: "Should be parent-managed through family settings, with a plan to hand it over as they grow.",
    action: "Use the platform's family group, and agree the age at which the child takes it over.",
  },
  {
    id: "wifi-password",
    group: "devices",
    label: "Home wi-fi password",
    sensitivity: 2,
    recommended: "vault-share",
    needsInEmergency: false,
    why: "Everyone needs it, guests included — which is why it should be easy to change.",
    action: "Keep it in the shared vault and use a separate guest network for visitors.",
  },
  {
    id: "router-admin",
    group: "devices",
    label: "Router or mesh admin password",
    sensitivity: 4,
    recommended: "vault-share",
    needsInEmergency: true,
    why: "Whoever holds this can redirect every device in the house, so it must not be the sticker default.",
    action: "Change it from the printed default and share it with the other adult by vault.",
  },
  {
    id: "camera-app",
    group: "devices",
    label: "Security camera or video doorbell app",
    sensitivity: 4,
    recommended: "vault-share",
    needsInEmergency: false,
    why: "Access means watching inside the home, so every household adult should know who holds it.",
    action: "Use the app's own multi-user invite where it exists; share the owner login by vault otherwise.",
  },
  {
    id: "car-app",
    group: "devices",
    label: "Connected car app",
    sensitivity: 3,
    recommended: "vault-share",
    needsInEmergency: true,
    why: "Unlocks and locates the car, so both drivers need it and a departing driver must lose it.",
    action: "Add a second driver in the app if supported; otherwise share by vault and revoke on change.",
  },
];

/** How wrong a mismatch is, and how much credit the credential still earns. */
export const MISMATCH_LEVELS = {
  ok: { id: "ok", label: "Matches the recommendation", credit: 1 },
  minor: { id: "minor", label: "Under-shared — causes lockouts, not leaks", credit: 0.7 },
  moderate: { id: "moderate", label: "Wrong mechanism for this credential", credit: 0.4 },
  critical: { id: "critical", label: "Over-shared or left in plaintext", credit: 0 },
};

const PROTECTED_MODES = new Set(["individual", "emergency-only"]);
const SHARED_MODES = new Set(["household-account", "vault-share"]);

export const VERDICTS = [
  { id: "rework", label: "Needs rework", max: 49, advice: "Several credentials are in the wrong place, including ones that should never be shared." },
  { id: "patchy", label: "Patchy", max: 74, advice: "The shape is right but the sensitive items are not handled properly yet." },
  { id: "good", label: "Good", max: 89, advice: "Sensible split. Tidy the remaining mismatches and set emergency access." },
  { id: "excellent", label: "Excellent", max: 100, advice: "Each credential is where it belongs, and nothing sensitive is shared as a plaintext copy." },
];

/** Score cap applied when shared modes are in use without a password manager. */
export const NO_MANAGER_CAP = 60;
/** Score cap applied when nothing is nominated for emergency access but something needs it. */
export const NO_EMERGENCY_CAP = 85;

function classify(recommended, current) {
  if (current === recommended) return MISMATCH_LEVELS.ok;
  if (current === "plaintext") return MISMATCH_LEVELS.critical;
  if (PROTECTED_MODES.has(recommended) && SHARED_MODES.has(current)) return MISMATCH_LEVELS.critical;
  if (SHARED_MODES.has(recommended) && PROTECTED_MODES.has(current)) return MISMATCH_LEVELS.minor;
  return MISMATCH_LEVELS.moderate;
}

function verdictFor(percent) {
  return VERDICTS.find((band) => percent <= band.max) || VERDICTS[VERDICTS.length - 1];
}

/**
 * Build and grade a household sharing plan.
 *
 * @param {object} input
 * @param {Record<string,string>} input.choices  credentialId -> mode id (or "na")
 * @param {number}  input.adults                 adults in the household
 * @param {number}  input.teens                  teenagers with their own logins
 * @param {boolean} input.hasPasswordManager
 * @param {boolean} input.emergencyAccessSet
 * @returns {object} graded plan, or { error }
 */
export function buildSharingPlan({
  choices,
  adults,
  teens = 0,
  hasPasswordManager = false,
  emergencyAccessSet = false,
} = {}) {
  if (!choices || typeof choices !== "object") {
    return { error: "Choose how each credential is handled today." };
  }
  const adultCount = Number(adults);
  const teenCount = Number(teens);
  if (!Number.isFinite(adultCount) || !Number.isFinite(teenCount)) {
    return { error: "Household sizes must be numbers." };
  }
  if (adultCount < MIN_ADULTS || adultCount > MAX_ADULTS) {
    return { error: `Enter between ${MIN_ADULTS} and ${MAX_ADULTS} adults.` };
  }
  if (teenCount < 0 || teenCount > MAX_TEENS) {
    return { error: `Enter between 0 and ${MAX_TEENS} teenagers.` };
  }

  const rows = [];
  for (const credential of CREDENTIALS) {
    const current = choices[credential.id] ?? "na";
    if (!MODES[current]) {
      return { error: `"${credential.label}" has an unknown handling option.` };
    }
    if (current === "na") continue;
    const level = classify(credential.recommended, current);
    rows.push({
      ...credential,
      current,
      currentLabel: MODES[current].label,
      recommendedLabel: MODES[credential.recommended].label,
      levelId: level.id,
      levelLabel: level.label,
      credit: level.credit,
    });
  }

  if (rows.length === 0) {
    return { error: "Mark at least one credential as something other than 'we do not have this'." };
  }

  const weight = rows.reduce((sum, row) => sum + row.sensitivity, 0);
  const earned = rows.reduce((sum, row) => sum + row.sensitivity * row.credit, 0);
  let score = Math.round((earned / weight) * 100);

  const sharedRows = rows.filter((row) => SHARED_MODES.has(row.current));
  const plaintextRows = rows.filter((row) => row.current === "plaintext");
  const overSharedRows = rows.filter((row) => row.levelId === "critical" && row.current !== "plaintext");
  const emergencyNeeded = rows.filter((row) => row.needsInEmergency);

  const caps = [];
  if (!hasPasswordManager && sharedRows.length > 0) {
    caps.push({
      id: "no-manager",
      cap: NO_MANAGER_CAP,
      text: "You are sharing credentials without a password manager, so every share is a copy you cannot revoke.",
    });
  }
  if (!emergencyAccessSet && emergencyNeeded.length > 0) {
    caps.push({
      id: "no-emergency",
      cap: NO_EMERGENCY_CAP,
      text: `${emergencyNeeded.length} of these would be needed if one of you were unavailable, and nobody is nominated to reach them.`,
    });
  }
  caps.forEach((entry) => {
    score = Math.min(score, entry.cap);
  });

  const verdict = verdictFor(score);

  const byMode = Object.values(MODES)
    .filter((mode) => mode.id !== "na")
    .map((mode) => ({
      ...mode,
      items: rows.filter((row) => row.recommended === mode.id),
    }))
    .filter((mode) => mode.items.length > 0);

  const fixes = rows
    .filter((row) => row.levelId !== "ok")
    .sort((a, b) => {
      const order = { critical: 0, moderate: 1, minor: 2 };
      return order[a.levelId] - order[b.levelId] || b.sensitivity - a.sensitivity;
    });

  const people = Math.round(adultCount) + Math.round(teenCount);

  return {
    score,
    verdictId: verdict.id,
    verdictLabel: verdict.label,
    verdictAdvice: verdict.advice,
    consideredCount: rows.length,
    sharedCount: sharedRows.length,
    plaintextCount: plaintextRows.length,
    overSharedCount: overSharedRows.length,
    emergencyNeededCount: emergencyNeeded.length,
    people,
    revocationLoad: sharedRows.length * people,
    caps,
    byMode,
    fixes,
    rows,
  };
}
