/**
 * Dating-app data request planner — pure logic.
 *
 * Fixed rules encoded here come from the platforms and from published law, not from
 * this module:
 *  - Tinder and Hinge both offer a self-service "Download my data" request from
 *    account settings; Bumble, Grindr and smaller apps route requests through a
 *    privacy portal or a support address.
 *  - The archive is delivered as a time-limited link, and re-authentication is
 *    normally required before the download starts.
 *  - These exports characteristically include a per-day usage table (app opens,
 *    swipes, matches, messages sent and received) alongside the message archive.
 *  - Deleting the app does not delete the account. The account has to be deleted from
 *    inside settings, and the data request should be made before that.
 *  - GDPR Art. 9 treats data about sexual orientation as a special category needing a
 *    stronger legal basis; Art. 12(3) gives a controller one month to answer an access
 *    request. India's SPDI Rules 2011 similarly treat sexual orientation as sensitive
 *    personal data or information.
 *
 * Per-record figures are PLANNING ESTIMATES from typical export widths, not a
 * measurement of any specific account.
 */

/** GDPR Art. 12(3) deadline for an access request, in days. */
export const GDPR_RESPONSE_DAYS = 30;

/** Bytes in a megabyte. */
const BYTES_PER_MB = 1024 * 1024;

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/** Days in a year, for turning a daily swipe rate into a lifetime count. */
const DAYS_PER_YEAR = 365;

/** One swipe record: timestamp, direction and the profile identifier. */
export const BYTES_PER_SWIPE = 60;

/** One match record: timestamp, identifiers, and whether it was later unmatched. */
export const BYTES_PER_MATCH = 200;

/** One message record: timestamp, sender, recipient and body. */
export const BYTES_PER_MESSAGE = 300;

/** One row of the per-day usage table. */
export const BYTES_PER_USAGE_DAY = 120;

/**
 * Requestable dating-app data.
 *  baseMb           - one-off size independent of activity
 *  mbPerYear        - extra size per year on the app
 *  bytesPerSwipe    - scales with lifetime swipe count
 *  bytesPerMatch    - scales with lifetime match count
 *  bytesPerMessage  - scales with lifetime message count
 *  bytesPerDay      - scales with days on the app
 *  special          - true when GDPR Art. 9 special-category data is involved
 *  sensitivity      - 1 (mundane) to 5 (orientation, message content, location)
 */
export const EXPORT_CATEGORIES = [
  {
    id: "messages",
    label: "Messages",
    what: "Full conversation history with timestamps, including chats with people you later unmatched.",
    baseMb: 0.3,
    mbPerYear: 0,
    bytesPerSwipe: 0,
    bytesPerMatch: 0,
    bytesPerMessage: BYTES_PER_MESSAGE,
    bytesPerDay: 0,
    special: false,
    sensitivity: 5,
    note: "Unmatching hides a conversation from you; it does not usually delete it from the export.",
  },
  {
    id: "swipes",
    label: "Swipes and likes",
    what: "Individual like and pass records with a timestamp for each one.",
    baseMb: 0.2,
    mbPerYear: 0,
    bytesPerSwipe: BYTES_PER_SWIPE,
    bytesPerMatch: 0,
    bytesPerMessage: 0,
    bytesPerDay: 0,
    special: false,
    sensitivity: 4,
    note: "Timestamped swipes show exactly when you were on the app, night by night.",
  },
  {
    id: "matches",
    label: "Matches",
    what: "Every match with the date, and whether it was unmatched or blocked afterwards.",
    baseMb: 0.1,
    mbPerYear: 0,
    bytesPerSwipe: 0,
    bytesPerMatch: BYTES_PER_MATCH,
    bytesPerMessage: 0,
    bytesPerDay: 0,
    special: false,
    sensitivity: 4,
    note: "Includes matches you deliberately removed, which is often the surprise in the archive.",
  },
  {
    id: "usage",
    label: "Daily usage table",
    what: "A row per day: app opens, swipes right and left, matches, messages sent and received.",
    baseMb: 0.05,
    mbPerYear: 0,
    bytesPerSwipe: 0,
    bytesPerMatch: 0,
    bytesPerMessage: 0,
    bytesPerDay: BYTES_PER_USAGE_DAY,
    special: false,
    sensitivity: 3,
    note: "Small file, big picture: it charts your dating life as a time series.",
  },
  {
    id: "profile",
    label: "Profile and identity",
    what: "Name, date of birth, gender, sexual orientation, bio, job, education, phone and email.",
    baseMb: 0.1,
    mbPerYear: 0.02,
    bytesPerSwipe: 0,
    bytesPerMatch: 0,
    bytesPerMessage: 0,
    bytesPerDay: 0,
    special: true,
    sensitivity: 5,
    note: "Sexual orientation is special-category data under GDPR Art. 9 and sensitive personal information under India's SPDI Rules 2011.",
  },
  {
    id: "photos",
    label: "Photos and verification media",
    what: "Every photo you uploaded, including ones you removed, plus selfie or video verification captures.",
    baseMb: 8,
    mbPerYear: 6,
    bytesPerSwipe: 0,
    bytesPerMatch: 0,
    bytesPerMessage: 0,
    bytesPerDay: 0,
    special: true,
    sensitivity: 5,
    note: "Verification media is biometric-adjacent. Ask specifically how long it is retained after verification succeeds.",
  },
  {
    id: "location",
    label: "Location history",
    what: "Coarse or precise location records used for distance matching, plus any travel or passport usage.",
    baseMb: 0.3,
    mbPerYear: 1.2,
    bytesPerSwipe: 0,
    bytesPerMatch: 0,
    bytesPerMessage: 0,
    bytesPerDay: 0,
    special: false,
    sensitivity: 5,
    note: "Distance matching requires location, so the history exists even if you never enabled anything extra.",
  },
  {
    id: "moderation",
    label: "Reports and safety actions",
    what: "Reports you made, reports made about you, warnings, bans and blocked accounts.",
    baseMb: 0.2,
    mbPerYear: 0.1,
    bytesPerSwipe: 0,
    bytesPerMatch: 0,
    bytesPerMessage: 0,
    bytesPerDay: 0,
    special: false,
    sensitivity: 4,
    note: "The one category worth requesting even if you want nothing else, if you have ever been reported.",
  },
  {
    id: "purchases",
    label: "Purchases and subscriptions",
    what: "Subscription history, boosts, super likes, refunds and masked payment records.",
    baseMb: 0.2,
    mbPerYear: 0.15,
    bytesPerSwipe: 0,
    bytesPerMatch: 0,
    bytesPerMessage: 0,
    bytesPerDay: 0,
    special: false,
    sensitivity: 3,
    note: "Useful for spotting an auto-renewing plan bought years ago on a different phone.",
  },
  {
    id: "connections",
    label: "Linked accounts",
    what: "Instagram, Spotify, Facebook or phone-contact links, and contacts you chose to block.",
    baseMb: 0.1,
    mbPerYear: 0.05,
    bytesPerSwipe: 0,
    bytesPerMatch: 0,
    bytesPerMessage: 0,
    bytesPerDay: 0,
    special: false,
    sensitivity: 3,
    note: "A linked Instagram handle ties a pseudonymous dating profile to your real identity.",
  },
  {
    id: "device",
    label: "Device and app telemetry",
    what: "Device model, operating system, app version, IP addresses, sessions and advertising identifiers.",
    baseMb: 1,
    mbPerYear: 2,
    bytesPerSwipe: 0,
    bytesPerMatch: 0,
    bytesPerMessage: 0,
    bytesPerDay: 0,
    special: false,
    sensitivity: 4,
    note: "IP history places you geographically on days you never opened the app.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Use the in-app request where one exists",
    "Tinder and Hinge both have a download-my-data option in account settings. Bumble, Grindr and smaller apps go through a privacy portal or a support address instead.",
  ],
  [
    "Request before you delete",
    "Deleting the app only removes it from the phone. Deleting the account removes your ability to request the data, so the order is request, receive, verify, then delete.",
  ],
  [
    "Ask for messages and moderation explicitly",
    "Conversations you unmatched and any reports made about you are the two things people most often need and most often do not receive by default.",
  ],
  [
    "Expect the statutory window",
    `Self-service exports often arrive in days, but a controller generally has ${GDPR_RESPONSE_DAYS} days to answer a formal access request. Diarise the deadline before chasing.`,
  ],
  [
    "Download to a device only you use",
    "The link is time-limited and needs re-authentication. Do not open it on a shared laptop, a work machine or a phone anyone else unlocks.",
  ],
  [
    "Open the usage table first",
    "It is a few kilobytes and it summarises years of activity in one time series, which tells you quickly whether the rest of the archive is worth reading.",
  ],
  [
    "Ask what happens to verification media",
    "Selfie and video verification captures are biometric-adjacent. Ask how long they are retained after verification succeeds and whether they are shared with a vendor.",
  ],
  [
    "Store it encrypted, then remove it",
    "This archive names who you dated, when, where and what you said. Keep it inside an encrypted volume and delete it as soon as you have what you needed.",
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
 * Estimate a dating-app data request.
 *
 * Volume model:
 *   days          = 365 * years
 *   totalSwipes   = swipesPerDay * days
 *   totalMatches  = totalSwipes * matchRatePercent / 100
 *   totalMessages = totalMatches * messagesPerMatch
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
  swipesPerDay,
  matchRatePercent,
  messagesPerMatch,
}) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one category to estimate a dating-app data request." };
  }

  const known = EXPORT_CATEGORIES.filter((category) => selectedIds.includes(category.id));
  if (known.length === 0) {
    return { error: "None of the selected items match a dating-app data category." };
  }

  const useYears = Number(years);
  if (!Number.isFinite(useYears)) {
    return { error: "Enter how many years you have used the app as a number." };
  }
  if (useYears <= 0) {
    return { error: "Years of use must be greater than zero." };
  }
  if (useYears > 14) {
    return { error: "Swipe-based dating apps date from 2012, so more than 14 years of use is not possible." };
  }

  const dailySwipes = Number(swipesPerDay);
  if (!Number.isFinite(dailySwipes)) {
    return { error: "Enter your rough number of swipes per day as a number." };
  }
  if (dailySwipes < 0) {
    return { error: "Swipes per day cannot be negative." };
  }
  if (dailySwipes > 2000) {
    return { error: "More than 2,000 swipes a day is outside the range this estimate handles." };
  }

  const rate = Number(matchRatePercent);
  if (!Number.isFinite(rate)) {
    return { error: "Enter your match rate as a percentage number." };
  }
  if (rate < 0 || rate > 100) {
    return { error: "Match rate must be between 0% and 100%." };
  }

  const perMatchMessages = Number(messagesPerMatch);
  if (!Number.isFinite(perMatchMessages)) {
    return { error: "Enter the average number of messages per match as a number." };
  }
  if (perMatchMessages < 0) {
    return { error: "Messages per match cannot be negative." };
  }
  if (perMatchMessages > 2000) {
    return { error: "More than 2,000 messages per match is outside this estimate." };
  }

  const days = DAYS_PER_YEAR * useYears;
  const totalSwipes = dailySwipes * days;
  const totalMatches = (totalSwipes * rate) / 100;
  const totalMessages = totalMatches * perMatchMessages;

  const rows = known.map((category) => {
    const sizeMb =
      category.baseMb +
      category.mbPerYear * useYears +
      (category.bytesPerSwipe * totalSwipes) / BYTES_PER_MB +
      (category.bytesPerMatch * totalMatches) / BYTES_PER_MB +
      (category.bytesPerMessage * totalMessages) / BYTES_PER_MB +
      (category.bytesPerDay * days) / BYTES_PER_MB;
    return { ...category, sizeMb };
  });

  const totalMb = rows.reduce((sum, row) => sum + row.sizeMb, 0);

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);
  const specialRows = rows.filter((row) => row.special);

  return {
    rows: sorted,
    count: rows.length,
    totalMb,
    totalLabel: formatSize(totalMb),
    days: Math.round(days),
    totalSwipes: Math.round(totalSwipes),
    totalMatches: Math.round(totalMatches),
    totalMessages: Math.round(totalMessages),
    swipesPerMatch: totalMatches > 0 ? totalSwipes / totalMatches : 0,
    largestLabel: sorted[0].label,
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    specialCategoryLabels: specialRows.map((row) => row.label),
    hasSpecialCategory: specialRows.length > 0,
    criticalCategories: rows.filter((row) => row.sensitivity >= 5).map((row) => row.label),
    responseDays: GDPR_RESPONSE_DAYS,
  };
}
