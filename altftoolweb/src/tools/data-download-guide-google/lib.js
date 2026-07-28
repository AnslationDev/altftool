/**
 * Google Takeout export planner — pure logic.
 *
 * Sources for the fixed rules encoded here (no computation invents a Google policy):
 *  - Google Takeout (takeout.google.com) lets you export "once" or on a recurring
 *    schedule of every 2 months for 1 year, which is 6 exports in total.
 *  - Takeout offers .zip and .tgz archives and a maximum-part-size choice of
 *    1, 2, 4, 10 or 50 GB; anything larger is split across numbered part files.
 *  - Google states an export link emailed to you stays valid for 7 days and can be
 *    downloaded a limited number of times, so the archive must be saved promptly.
 *  - Under GDPR/DPDP-style access rights a controller must answer within one month;
 *    Takeout is self-service and normally far faster, but very large Photos or Drive
 *    exports are documented by Google as possibly taking "hours or days".
 *
 * The per-category byte figures are PLANNING ESTIMATES for a typical consumer
 * account, not measurements of any individual account. They exist so a user can tell
 * "this will fit on my phone" from "this needs an external drive" before they start.
 */

/** Google's own maximum-part-size choices in the Takeout wizard, in gigabytes. */
export const SPLIT_OPTIONS_GB = [1, 2, 4, 10, 50];

/** Number of exports produced by Takeout's "every 2 months for 1 year" schedule. */
export const SCHEDULED_EXPORT_COUNT = 6;

/** Days a Takeout download link stays valid, per Google's export email. */
export const DOWNLOAD_LINK_VALID_DAYS = 7;

/** Statutory ceiling for a formal access request (GDPR Art. 12(3): one month). */
export const STATUTORY_RESPONSE_DAYS = 30;

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/**
 * Rough account-size multiplier. A "light" account is someone who mostly uses
 * search and Gmail; "heavy" is a 15-year account with a full Photos library.
 */
export const ACCOUNT_WEIGHTS = [
  { id: "light", label: "Light (little media stored)", multiplier: 0.4 },
  { id: "typical", label: "Typical consumer account", multiplier: 1 },
  { id: "heavy", label: "Heavy (large Photos/Drive library)", multiplier: 2.5 },
];

/**
 * Exportable Google surfaces.
 *  baseMb      - one-off size that does not grow much with account age
 *  mbPerYear   - additional size for each year the account has existed
 *  media       - true when the category is dominated by photos/video/audio blobs
 *  sensitivity - 1 (mundane) to 5 (can expose location, health, private messages)
 *  waitDays    - realistic preparation time before the archive is ready
 */
export const EXPORT_CATEGORIES = [
  {
    id: "mail",
    label: "Gmail",
    what: "Every message and attachment as a single .mbox file, including Spam and Trash.",
    baseMb: 60,
    mbPerYear: 900,
    media: false,
    sensitivity: 5,
    waitDays: 2,
    note: "An .mbox opens in Thunderbird or Apple Mail; it is plain text, so anyone with the file can read the mail.",
  },
  {
    id: "photos",
    label: "Google Photos",
    what: "Original photos and videos plus a JSON sidecar per item holding timestamp and GPS coordinates.",
    baseMb: 0,
    mbPerYear: 12000,
    media: true,
    sensitivity: 5,
    waitDays: 3,
    note: "The JSON sidecars are the privacy risk, not the images — they carry precise capture location.",
  },
  {
    id: "drive",
    label: "Google Drive",
    what: "Files you own; Docs, Sheets and Slides are converted to Office or PDF format.",
    baseMb: 0,
    mbPerYear: 4200,
    media: true,
    sensitivity: 3,
    waitDays: 2,
    note: "Files shared with you but owned by someone else are not included.",
  },
  {
    id: "activity",
    label: "My Activity (Search, Assistant, Ads)",
    what: "Timestamped log of searches, app opens, Assistant requests and ad interactions.",
    baseMb: 40,
    mbPerYear: 70,
    media: false,
    sensitivity: 5,
    waitDays: 1,
    note: "The single most revealing export: it reconstructs your interests, health worries and daily routine minute by minute.",
  },
  {
    id: "timeline",
    label: "Maps Timeline / Location History",
    what: "Visited places, routes and dwell times, where Timeline was ever switched on.",
    baseMb: 5,
    mbPerYear: 12,
    media: false,
    sensitivity: 5,
    waitDays: 1,
    note: "Google moved Timeline to on-device storage from 2024, so recent history may be exported from the phone instead of Takeout.",
  },
  {
    id: "youtube",
    label: "YouTube and YouTube Music",
    what: "Your uploads, plus watch history, search history, comments, playlists and subscriptions.",
    baseMb: 30,
    mbPerYear: 1500,
    media: true,
    sensitivity: 4,
    waitDays: 3,
    note: "Uncheck 'videos' in the YouTube sub-options if you only want the history files — it removes most of the size.",
  },
  {
    id: "chrome",
    label: "Chrome",
    what: "Bookmarks, browsing history, autofill entries, extensions and synced settings as JSON.",
    baseMb: 25,
    mbPerYear: 8,
    media: false,
    sensitivity: 5,
    waitDays: 1,
    note: "Saved passwords are not in Takeout; export those separately from passwords.google.com.",
  },
  {
    id: "calendar",
    label: "Calendar",
    what: "All calendars as .ics files, including guest lists and event descriptions.",
    baseMb: 2,
    mbPerYear: 6,
    media: false,
    sensitivity: 3,
    waitDays: 1,
    note: "Event titles routinely leak medical appointments and other people's names.",
  },
  {
    id: "contacts",
    label: "Contacts",
    what: "Address book as vCard or CSV with phone numbers, emails and notes.",
    baseMb: 2,
    mbPerYear: 1,
    media: false,
    sensitivity: 4,
    waitDays: 1,
    note: "This is other people's personal data — store it as carefully as your own.",
  },
  {
    id: "fit",
    label: "Google Fit / Fitbit",
    what: "Step counts, heart rate, sleep sessions and workout GPS tracks.",
    baseMb: 10,
    mbPerYear: 20,
    media: false,
    sensitivity: 5,
    waitDays: 2,
    note: "Workout tracks usually start and end at your home, which pins your address.",
  },
  {
    id: "play",
    label: "Google Play and purchases",
    what: "Installed app list, purchase history, subscriptions and reviews.",
    baseMb: 8,
    mbPerYear: 3,
    media: false,
    sensitivity: 3,
    waitDays: 1,
    note: "The installed-app list alone hints at your bank, your employer and your health conditions.",
  },
  {
    id: "keep",
    label: "Keep, Tasks and Maps saved places",
    what: "Notes, reminders, saved and starred places, and reviews you posted.",
    baseMb: 12,
    mbPerYear: 4,
    media: false,
    sensitivity: 3,
    waitDays: 1,
    note: "Saved places typically include labelled Home and Work pins.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Sign in on a device you control",
    "Open takeout.google.com while signed in to the exact account you want — Takeout exports one account at a time and will not merge a work and a personal login.",
  ],
  [
    "Deselect all, then pick only what you need",
    "The wizard preselects every product. Use 'Deselect all' first; a targeted export finishes in minutes instead of days and leaves less data lying around.",
  ],
  [
    "Open the per-product sub-options",
    "Several products hide format and scope controls behind 'All data included' — that is where you exclude YouTube videos, choose Mail labels, or pick a Drive folder.",
  ],
  [
    "Choose delivery, frequency and part size",
    `Email link, or push straight to Drive, Dropbox, OneDrive or Box. Pick 'Export once' unless you genuinely want the recurring schedule (${SCHEDULED_EXPORT_COUNT} exports over a year). Set the part size so the biggest file still fits your disk.`,
  ],
  [
    "Download promptly and verify",
    `The emailed link expires after about ${DOWNLOAD_LINK_VALID_DAYS} days. Download every numbered part, then open the archive to confirm it extracts before you rely on it.`,
  ],
  [
    "Store it like a password vault",
    "The archive is unencrypted. Put it on an encrypted disk or inside an encrypted container, and never leave it in Downloads or on a shared machine.",
  ],
  [
    "Escalate only if Takeout cannot serve it",
    `Takeout is self-service. For data it does not cover, send a written access request; a controller generally has to respond within ${STATUTORY_RESPONSE_DAYS} days.`,
  ],
];

/** Human-readable size from a megabyte figure. */
export function formatSize(mb) {
  if (!Number.isFinite(mb) || mb < 0) return "—";
  if (mb < 1) return "<1 MB";
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
 * Estimate the archive for a chosen Takeout selection.
 *
 * Size model: each category contributes baseMb + mbPerYear * accountAgeYears,
 * scaled by the account-weight multiplier (media-heavy categories only, since a
 * light user's Gmail is not proportionally smaller than a heavy user's).
 *
 * Sensitivity score = 20 * (0.6 * highest + 0.4 * mean) of the 1-5 ratings, so a
 * single critical category still dominates the headline while breadth also counts.
 * The score is bounded to 20-100 by construction.
 *
 * @returns {{error: string} | object} plain object; never NaN or Infinity.
 */
export function estimateExport({ selectedIds, accountAgeYears, weightId, splitGb }) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one Google service to estimate an export." };
  }

  const known = EXPORT_CATEGORIES.filter((category) => selectedIds.includes(category.id));
  if (known.length === 0) {
    return { error: "None of the selected items match a Google Takeout product." };
  }

  const years = Number(accountAgeYears);
  if (!Number.isFinite(years)) {
    return { error: "Enter how many years old the account is as a number." };
  }
  if (years <= 0) {
    return { error: "Account age must be greater than zero years." };
  }
  if (years > 25) {
    return { error: "Gmail launched in 2004, so an account age above 25 years is not possible." };
  }

  const weight = ACCOUNT_WEIGHTS.find((option) => option.id === weightId);
  if (!weight) {
    return { error: "Choose how much data the account typically holds." };
  }

  const split = Number(splitGb);
  if (!SPLIT_OPTIONS_GB.includes(split)) {
    return { error: `Part size must be one of ${SPLIT_OPTIONS_GB.join(", ")} GB.` };
  }

  const rows = known.map((category) => {
    const raw = category.baseMb + category.mbPerYear * years;
    const sizeMb = category.media ? raw * weight.multiplier : raw;
    return { ...category, sizeMb };
  });

  const totalMb = rows.reduce((sum, row) => sum + row.sizeMb, 0);
  const totalGb = totalMb / MB_PER_GB;
  const parts = Math.max(1, Math.ceil(totalGb / split));

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const waitDays = Math.max(...rows.map((row) => row.waitDays));
  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);
  const largest = sorted[0];
  const criticalCategories = rows
    .filter((row) => row.sensitivity >= 5)
    .map((row) => row.label);

  return {
    rows: sorted,
    count: rows.length,
    totalMb,
    totalGb,
    totalLabel: formatSize(totalMb),
    parts,
    partSizeGb: split,
    largestLabel: largest.label,
    largestShare: totalMb > 0 ? (largest.sizeMb / totalMb) * 100 : 0,
    mediaShare:
      totalMb > 0
        ? (rows.filter((row) => row.media).reduce((sum, row) => sum + row.sizeMb, 0) / totalMb) * 100
        : 0,
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    criticalCategories,
    waitDays,
    scheduledTotalMb: totalMb * SCHEDULED_EXPORT_COUNT,
  };
}
