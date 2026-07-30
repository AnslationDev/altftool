/**
 * Apple legacy contact setup planner.
 *
 * Pure logic: no React, no DOM, no clock reads.
 */

/** Legacy Contact was introduced in iOS/iPadOS 15.2. */
export const MIN_IOS_VERSION = "15.2";
/** The macOS equivalent shipped in macOS 12.1 Monterey. */
export const MIN_MACOS_VERSION = "12.1";

/** Both the account holder and the legacy contact must be at least 13. */
export const MIN_AGE = 13;

/** An Apple Account can name up to 5 legacy contacts. */
export const MAX_LEGACY_CONTACTS = 5;

/** Access lasts 3 years from the date the first legacy access request is approved. */
export const ACCESS_YEARS = 3;

export const PLATFORMS = [
  { id: "ios", label: "iPhone or iPad", minVersion: MIN_IOS_VERSION, os: "iOS/iPadOS" },
  { id: "macos", label: "Mac", minVersion: MIN_MACOS_VERSION, os: "macOS" },
];

/** Data a legacy contact can reach once Apple approves the request. */
export const INCLUDED_DATA = [
  "iCloud Photos",
  "Notes, Reminders and Calendars",
  "Mail and Contacts",
  "Messages and call history",
  "Files in iCloud Drive",
  "Health data",
  "Safari bookmarks and Reading List",
  "Device backups stored in iCloud",
];

/** Data a legacy contact never receives, however the request is approved. */
export const EXCLUDED_DATA = [
  "Licensed media — films, music, books and apps that were purchased",
  "In-app purchases and active subscriptions",
  "Payment information and Apple Pay cards",
  "Passwords stored in iCloud Keychain",
];

export const TIER_WEIGHTS = { essential: 3, recommended: 2, optional: 1 };

/**
 * appleContact: only shown when the chosen contact does not use Apple devices.
 */
export const STEPS = [
  {
    id: "two-factor",
    title: "Turn on two-factor authentication for the Apple Account",
    where: "Settings > [your name] > Sign-In & Security > Two-Factor Authentication",
    why: "Legacy Contact does not appear at all without it — the feature is built on the same trusted-device model.",
    tier: "essential",
  },
  {
    id: "update-os",
    title: "Update the device to a version that has the feature",
    where: "Settings > General > Software Update (or System Settings > General > Software Update on a Mac)",
    why: `Legacy Contact arrived in ${MIN_IOS_VERSION} on iPhone and iPad and ${MIN_MACOS_VERSION} on Mac; on older versions the menu item does not exist.`,
    tier: "essential",
  },
  {
    id: "choose-contact",
    title: "Choose who it should be, and tell them before you add them",
    where: "A conversation, not a setting",
    why: `The contact must be at least ${MIN_AGE}, and you can name up to ${MAX_LEGACY_CONTACTS} people. Naming someone silently means the access key sits unrecognised in their settings.`,
    tier: "essential",
  },
  {
    id: "add-contact",
    title: "Add the legacy contact",
    where: "Settings > [your name] > Sign-In & Security > Legacy Contact > Add Legacy Contact",
    why: "This is the only place the feature lives; there is no equivalent on iCloud.com.",
    tier: "essential",
  },
  {
    id: "share-key-digitally",
    title: "Send the access key through Messages so it is stored automatically",
    where: "The share sheet at the end of the Add Legacy Contact flow",
    why: "If the contact is on a recent Apple device, the key is saved into their own Apple Account settings, so it cannot be lost in a drawer.",
    tier: "essential",
  },
  {
    id: "print-key",
    title: "Print the access key and store it with your will",
    where: "The same share sheet > Print a Copy",
    why: "A contact who does not use Apple devices has nowhere to store the key digitally, so the printed copy is the only route in.",
    tier: "essential",
    nonAppleContact: true,
  },
  {
    id: "second-contact",
    title: "Consider naming a second legacy contact",
    where: "Legacy Contact > Add Legacy Contact, repeated",
    why: `Up to ${MAX_LEGACY_CONTACTS} can be named. A single contact who dies first, loses the key, or is abroad leaves nobody able to act.`,
    tier: "recommended",
  },
  {
    id: "explain-death-certificate",
    title: "Tell them what they will need: the access key and a death certificate",
    where: "digital-legacy.apple.com, where the request is made",
    why: "Apple reviews both before granting access, so the person needs to know the key alone is not enough.",
    tier: "essential",
  },
  {
    id: "explain-scope",
    title: "Explain what they will and will not receive",
    where: "A conversation, plus a note with your will",
    why: "Purchased films, music and books, subscriptions and iCloud Keychain passwords are never included, which surprises most families.",
    tier: "recommended",
  },
  {
    id: "three-year-window",
    title: "Make sure they know the access window closes",
    where: "A note with your will",
    why: `Access lasts ${ACCESS_YEARS} years from the date the first request is approved, and the account is deleted permanently at the end of it.`,
    tier: "essential",
  },
  {
    id: "recovery-contact",
    title: "Set a recovery contact as well — it is a different feature",
    where: "Settings > [your name] > Sign-In & Security > Account Recovery",
    why: "A recovery contact helps you get back into your own account while you are alive; a legacy contact only works after death.",
    tier: "recommended",
  },
  {
    id: "family-sharing",
    title: "Check the Family Sharing group is set up the way you expect",
    where: "Settings > [your name] > Family Sharing",
    why: "Purchases, subscriptions and shared albums pass through Family Sharing while it exists, which covers some of what a legacy contact cannot.",
    tier: "recommended",
  },
  {
    id: "passwords-plan",
    title: "Make a separate plan for passwords, since Keychain is excluded",
    where: "A password manager with emergency access, or a sealed note with your executor",
    why: "Bank, email and government logins stored in iCloud Keychain do not transfer, so they need their own arrangement.",
    tier: "recommended",
  },
  {
    id: "review-annually",
    title: "Review the contacts once a year",
    where: "Legacy Contact, in Sign-In & Security",
    why: "A legacy contact can be removed at any time, and relationships change more often than the setting gets revisited.",
    tier: "optional",
  },
  {
    id: "mention-in-will",
    title: "Mention the arrangement in your will or letter of wishes",
    where: "With your solicitor",
    why: "Executors need to know a legacy contact exists and where the printed key is kept; digital assets are treated differently in different jurisdictions.",
    tier: "recommended",
  },
];

export const BANDS = [
  { min: 90, label: "Fully arranged", tone: "success" },
  { min: 65, label: "Mostly arranged", tone: "success" },
  { min: 35, label: "Started", tone: "warning" },
  { min: 0, label: "Not arranged", tone: "danger" },
];

function bandFor(score) {
  return BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];
}

/**
 * Compare two dotted version strings.
 * Returns 1 if a is newer, -1 if older, 0 if equal.
 */
export function compareVersions(a, b) {
  const parse = (value) => {
    const parts = String(value).trim().split(".");
    if (parts.length === 0 || parts.some((part) => !/^\d+$/.test(part))) return null;
    return parts.map(Number);
  };
  const left = parse(a);
  const right = parse(b);
  if (!left || !right) return { error: "Enter versions as numbers separated by dots, for example 17.4." };
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const l = left[index] ?? 0;
    const r = right[index] ?? 0;
    if (l > r) return { result: 1 };
    if (l < r) return { result: -1 };
  }
  return { result: 0 };
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function parseIsoDate(value) {
  const match = ISO_DATE.exec(String(value).trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return null;
  if (day > daysInMonth(year, month - 1)) return null;
  return { year, monthIndex: month - 1, day };
}

/**
 * Work out when the legacy access window closes.
 * 29 February plus three years clamps to 28 February.
 */
export function accessWindow({ approvalDate } = {}) {
  const parts = parseIsoDate(approvalDate);
  if (!parts) return { error: "Enter the approval date as YYYY-MM-DD." };
  const year = parts.year + ACCESS_YEARS;
  const day = Math.min(parts.day, daysInMonth(year, parts.monthIndex));
  const endDate = `${year}-${String(parts.monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.round(
    (Date.UTC(year, parts.monthIndex, day) -
      Date.UTC(parts.year, parts.monthIndex, parts.day)) /
      msPerDay,
  );
  return { approvalDate, endDate, days, years: ACCESS_YEARS };
}

/**
 * Can this account use the feature at all?
 */
export function checkEligibility({ ownerAge, contactAge, twoFactor, platform, osVersion } = {}) {
  const blockers = [];
  const owner = Number(ownerAge);
  const contact = Number(contactAge);
  if (!Number.isFinite(owner) || !Number.isFinite(contact)) {
    return { error: "Enter both ages in years." };
  }
  if (owner < MIN_AGE) blockers.push(`The account holder must be at least ${MIN_AGE}.`);
  if (contact < MIN_AGE) blockers.push(`A legacy contact must be at least ${MIN_AGE}.`);
  if (!twoFactor) blockers.push("Two-factor authentication must be on before Legacy Contact appears.");

  const chosen = PLATFORMS.find((item) => item.id === platform);
  if (!chosen) return { error: "Choose whether you are setting this up on iPhone/iPad or on a Mac." };

  const comparison = compareVersions(osVersion, chosen.minVersion);
  if (comparison.error) return { error: comparison.error };
  if (comparison.result < 0) {
    blockers.push(
      `${chosen.os} ${chosen.minVersion} or later is required; this device reports ${osVersion}.`,
    );
  }

  return {
    eligible: blockers.length === 0,
    blockers,
    platform: chosen.label,
    minVersion: chosen.minVersion,
  };
}

/**
 * @param {object} input
 * @param {number} input.ownerAge
 * @param {number} input.contactAge
 * @param {boolean} input.twoFactor
 * @param {string} input.platform
 * @param {string} input.osVersion
 * @param {boolean} input.contactUsesApple
 * @param {number} input.contactCount
 * @param {string} input.approvalDate
 * @param {string[]} [input.completed]
 */
export function buildPlan({
  ownerAge,
  contactAge,
  twoFactor = true,
  platform,
  osVersion,
  contactUsesApple = true,
  contactCount,
  approvalDate,
  completed = [],
} = {}) {
  const count = Number(contactCount);
  if (!Number.isInteger(count) || count < 1) {
    return { error: "Plan for at least one legacy contact." };
  }
  if (count > MAX_LEGACY_CONTACTS) {
    return { error: `An Apple Account can name at most ${MAX_LEGACY_CONTACTS} legacy contacts.` };
  }

  const eligibility = checkEligibility({ ownerAge, contactAge, twoFactor, platform, osVersion });
  if (eligibility.error) return { error: eligibility.error };

  const window = accessWindow({ approvalDate });
  if (window.error) return { error: window.error };

  const doneSet = new Set(Array.isArray(completed) ? completed : []);
  const steps = STEPS.filter((step) => !step.nonAppleContact || !contactUsesApple).map((step) => ({
    ...step,
    weight: TIER_WEIGHTS[step.tier],
    done: doneSet.has(step.id),
  }));

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const doneWeight = steps.reduce((sum, step) => (step.done ? sum + step.weight : sum), 0);
  const score = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;

  const essentials = steps.filter((step) => step.tier === "essential");
  const essentialsMissing = essentials.filter((step) => !step.done).length;

  let band = bandFor(score);
  if (essentialsMissing > 0 && band.label === BANDS[0].label) band = BANDS[1];
  if (!eligibility.eligible && band.label !== BANDS[BANDS.length - 1].label) {
    // Nothing counts as arranged while the feature cannot be switched on.
    band = BANDS[2];
  }

  return {
    steps,
    totalSteps: steps.length,
    doneSteps: steps.filter((step) => step.done).length,
    remaining: steps.filter((step) => !step.done),
    totalWeight,
    doneWeight,
    score,
    band: band.label,
    tone: band.tone,
    essentialsTotal: essentials.length,
    essentialsMissing,
    eligibility,
    window,
    contactCount: count,
    included: INCLUDED_DATA,
    excluded: EXCLUDED_DATA,
  };
}
