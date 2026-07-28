/**
 * Apple privacy data request planner — pure logic.
 *
 * Fixed rules encoded here come from Apple's Data and Privacy portal, not from this
 * module:
 *  - Requests are made at privacy.apple.com → "Request a copy of your data", signed in
 *    with the Apple Account you want and confirmed with two-factor authentication.
 *  - Apple states it may take up to 7 days to complete the request, because it first
 *    verifies that the request really came from you.
 *  - Once ready, the data stays available to download for 14 days.
 *  - You choose a maximum file part size; Apple splits anything larger across numbered
 *    parts, with the largest option being 25 GB.
 *  - Some data is never in that archive because Apple cannot read it: Health data,
 *    iCloud Keychain passwords and message content are exported from the device
 *    instead. This module marks those categories as device-only.
 *  - Under GDPR/DPDP-style access rights a controller must generally respond within
 *    one month of a formal request.
 *
 * Byte figures are PLANNING ESTIMATES for a typical consumer account, not a
 * measurement of any specific account.
 */

/** Days Apple states it may take to verify and complete the request. */
export const VERIFICATION_DAYS = 7;

/** Days the finished archive stays available to download. */
export const DOWNLOAD_WINDOW_DAYS = 14;

/** Statutory ceiling for a formal access request (GDPR Art. 12(3): one month). */
export const STATUTORY_RESPONSE_DAYS = 30;

/** Maximum part sizes offered in the request wizard, in gigabytes. */
export const SPLIT_OPTIONS_GB = [1, 5, 10, 25];

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/** Rough account-size multiplier applied to media-heavy categories only. */
export const ACCOUNT_WEIGHTS = [
  { id: "light", label: "Light (mostly device-local, little in iCloud)", multiplier: 0.4 },
  { id: "typical", label: "Typical consumer account", multiplier: 1 },
  { id: "heavy", label: "Heavy (large iCloud Photos library)", multiplier: 2.5 },
];

/** Where a category actually comes from. */
export const SOURCE_PORTAL = "portal";
export const SOURCE_DEVICE = "device";

/**
 * Requestable Apple data.
 *  baseMb      - one-off size independent of account age
 *  mbPerYear   - extra size per year of account age
 *  media       - true when photos, video or audio dominate the category
 *  sensitivity - 1 (mundane) to 5 (health, passwords, message content, location)
 *  source      - SOURCE_PORTAL (privacy.apple.com) or SOURCE_DEVICE (export locally)
 */
export const EXPORT_CATEGORIES = [
  {
    id: "icloud-photos",
    label: "iCloud Photos",
    source: SOURCE_PORTAL,
    what: "Photos and videos in iCloud Photos, with capture dates and location where recorded.",
    baseMb: 0,
    mbPerYear: 11000,
    media: true,
    sensitivity: 5,
    note: "Apple also offers a direct transfer of iCloud Photos to another photo service, which avoids downloading at all.",
  },
  {
    id: "icloud-drive",
    label: "iCloud Drive",
    source: SOURCE_PORTAL,
    what: "Files and folders stored in iCloud Drive, including app containers such as Pages and Numbers.",
    baseMb: 0,
    mbPerYear: 3500,
    media: true,
    sensitivity: 3,
    note: "Documents keep their own embedded metadata — author name and edit history travel with them.",
  },
  {
    id: "icloud-mail",
    label: "iCloud Mail",
    source: SOURCE_PORTAL,
    what: "Messages and attachments in an iCloud.com, me.com or mac.com mailbox.",
    baseMb: 40,
    mbPerYear: 700,
    media: false,
    sensitivity: 5,
    note: "Only iCloud mailboxes are included; a Gmail account read through Apple Mail is not.",
  },
  {
    id: "media-services",
    label: "Apple Media Services",
    source: SOURCE_PORTAL,
    what: "App Store, iTunes, Books, Apple TV and Apple Music history: purchases, downloads, plays and subscriptions.",
    baseMb: 40,
    mbPerYear: 28,
    media: false,
    sensitivity: 3,
    note: "Listening and viewing history is a detailed taste profile going back to your first purchase.",
  },
  {
    id: "account-device",
    label: "Apple Account and device information",
    source: SOURCE_PORTAL,
    what: "Account details, registered devices, sign-in records and Apple ID changes.",
    baseMb: 15,
    mbPerYear: 6,
    media: false,
    sensitivity: 4,
    note: "Check the device list for hardware you no longer own and remove it.",
  },
  {
    id: "maps",
    label: "Maps",
    source: SOURCE_PORTAL,
    what: "Search history, favourites, reported issues and guides saved in Apple Maps.",
    baseMb: 6,
    mbPerYear: 4,
    media: false,
    sensitivity: 5,
    note: "Favourites usually include labelled Home and Work addresses.",
  },
  {
    id: "wallet",
    label: "Wallet and Apple Pay activity",
    source: SOURCE_PORTAL,
    what: "Wallet activity records, passes and Apple Pay transaction metadata held by Apple.",
    baseMb: 10,
    mbPerYear: 8,
    media: false,
    sensitivity: 4,
    note: "Apple holds the device account records; the full statement still comes from your bank.",
  },
  {
    id: "icloud-notes",
    label: "iCloud Notes and Reminders",
    source: SOURCE_PORTAL,
    what: "Notes, attachments, folders and reminder lists synced to iCloud.",
    baseMb: 15,
    mbPerYear: 25,
    media: false,
    sensitivity: 4,
    note: "Locked notes are encrypted and are not readable in the export.",
  },
  {
    id: "icloud-calendar",
    label: "iCloud Calendars",
    source: SOURCE_PORTAL,
    what: "Calendars and events with titles, notes and invitee lists.",
    baseMb: 3,
    mbPerYear: 6,
    media: false,
    sensitivity: 3,
    note: "Event titles regularly disclose medical appointments and other people's names.",
  },
  {
    id: "icloud-contacts",
    label: "iCloud Contacts",
    source: SOURCE_PORTAL,
    what: "Address book entries with phone numbers, emails, addresses and notes.",
    baseMb: 3,
    mbPerYear: 1,
    media: false,
    sensitivity: 4,
    note: "This file is mostly other people's personal data — protect it accordingly.",
  },
  {
    id: "bookmarks",
    label: "iCloud Bookmarks and Reading List",
    source: SOURCE_PORTAL,
    what: "Safari bookmarks, Reading List items and synced tabs.",
    baseMb: 5,
    mbPerYear: 2,
    media: false,
    sensitivity: 4,
    note: "Reading List is effectively a record of what you meant to read and when.",
  },
  {
    id: "applecare",
    label: "AppleCare support history",
    source: SOURCE_PORTAL,
    what: "Support cases, repair records and chat or call transcripts.",
    baseMb: 10,
    mbPerYear: 3,
    media: false,
    sensitivity: 3,
    note: "Transcripts often quote serial numbers and partial address details.",
  },
  {
    id: "game-center",
    label: "Game Center",
    source: SOURCE_PORTAL,
    what: "Game Center profile, played games, achievements, scores and friends.",
    baseMb: 4,
    mbPerYear: 2,
    media: false,
    sensitivity: 2,
    note: "Low risk on its own, but it links a nickname to your real Apple Account.",
  },
  {
    id: "marketing",
    label: "Marketing preferences",
    source: SOURCE_PORTAL,
    what: "Marketing subscriptions, communication preferences and campaign history.",
    baseMb: 1,
    mbPerYear: 1,
    media: false,
    sensitivity: 1,
    note: "The least sensitive file in the archive; useful mainly to unsubscribe.",
  },
  {
    id: "health",
    label: "Health and Fitness data",
    source: SOURCE_DEVICE,
    what: "Steps, heart rate, sleep, cycle tracking, workouts and any medical records you added.",
    baseMb: 20,
    mbPerYear: 60,
    media: false,
    sensitivity: 5,
    note: "Not in the privacy portal export. Health app → your picture → Export All Health Data creates a zipped XML file on the device.",
  },
  {
    id: "passwords",
    label: "Passwords and passkeys",
    source: SOURCE_DEVICE,
    what: "Saved logins, passkeys, Wi-Fi and verification codes held in the keychain.",
    baseMb: 2,
    mbPerYear: 1,
    media: false,
    sensitivity: 5,
    note: "End-to-end encrypted, so Apple cannot include it. Export from the Passwords app, and delete the plain-text file the moment you have imported it.",
  },
  {
    id: "messages",
    label: "Messages and attachments",
    source: SOURCE_DEVICE,
    what: "iMessage and SMS conversation content with photos, videos and voice notes.",
    baseMb: 30,
    mbPerYear: 450,
    media: true,
    sensitivity: 5,
    note: "Message content is not part of the privacy portal archive. Take an encrypted local backup with Finder or iTunes instead.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Sign in at privacy.apple.com",
    "Use the Apple Account you actually want data for and complete two-factor authentication. Family Sharing members each have to request their own copy.",
  ],
  [
    "Choose Request a copy of your data",
    "The portal also offers correcting data, deactivating and deleting the account. Only the first option produces a downloadable archive.",
  ],
  [
    "Select categories, not everything",
    "A targeted request is faster to prepare and far less dangerous to store. iCloud Photos alone usually dwarfs every other category combined.",
  ],
  [
    "Set the maximum file part size",
    `Apple splits large archives into numbered parts up to ${SPLIT_OPTIONS_GB[SPLIT_OPTIONS_GB.length - 1]} GB each. Choose a size your disk and your connection can handle in one sitting.`,
  ],
  [
    "Wait out the verification period",
    `Apple says the request may take up to ${VERIFICATION_DAYS} days, because it verifies the request came from you before releasing anything.`,
  ],
  [
    "Download every part within the window",
    `The archive is available for ${DOWNLOAD_WINDOW_DAYS} days. Miss it and you have to start the request again. Verify each part extracts before you delete anything.`,
  ],
  [
    "Export the device-only data separately",
    "Health, passwords and message content are end-to-end encrypted, so they are exported from the iPhone or Mac rather than from the portal.",
  ],
  [
    "Store the archive encrypted",
    `Use FileVault, an encrypted disk image or an encrypted external drive. If a category you are entitled to is missing, follow up in writing — a controller generally has to respond within ${STATUTORY_RESPONSE_DAYS} days.`,
  ],
];

/** Human-readable size from a megabyte figure. */
export function formatSize(mb) {
  if (!Number.isFinite(mb) || mb < 0) return "—";
  if (mb === 0) return "0 MB";
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
 * Estimate an Apple data request.
 *
 * Size model: baseMb + mbPerYear * accountAgeYears per category, with the
 * account-weight multiplier applied to media-heavy categories only.
 *
 * Part count is computed from the portal portion alone, because device-only exports
 * are produced locally and are not split by Apple.
 *
 * Sensitivity score = 20 * (0.6 * highest + 0.4 * mean) of the 1-5 ratings, bounded
 * to 20-100 by construction.
 *
 * @returns {{error: string} | object} plain object; never NaN or Infinity.
 */
export function estimateExport({ selectedIds, accountAgeYears, weightId, splitGb }) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one category to estimate an Apple data request." };
  }

  const known = EXPORT_CATEGORIES.filter((category) => selectedIds.includes(category.id));
  if (known.length === 0) {
    return { error: "None of the selected items match an Apple data category." };
  }

  const years = Number(accountAgeYears);
  if (!Number.isFinite(years)) {
    return { error: "Enter the Apple Account age in years as a number." };
  }
  if (years <= 0) {
    return { error: "Account age must be greater than zero years." };
  }
  if (years > 25) {
    return { error: "Apple IDs date from 2003 at the earliest, so an age above 25 years is not possible." };
  }

  const weight = ACCOUNT_WEIGHTS.find((option) => option.id === weightId);
  if (!weight) {
    return { error: "Choose how much media the account keeps in iCloud." };
  }

  const split = Number(splitGb);
  if (!SPLIT_OPTIONS_GB.includes(split)) {
    return { error: `Maximum part size must be one of ${SPLIT_OPTIONS_GB.join(", ")} GB.` };
  }

  const rows = known.map((category) => {
    const raw = category.baseMb + category.mbPerYear * years;
    const sizeMb = category.media ? raw * weight.multiplier : raw;
    return { ...category, sizeMb };
  });

  const portalRows = rows.filter((row) => row.source === SOURCE_PORTAL);
  const deviceRows = rows.filter((row) => row.source === SOURCE_DEVICE);

  const portalMb = portalRows.reduce((sum, row) => sum + row.sizeMb, 0);
  const deviceMb = deviceRows.reduce((sum, row) => sum + row.sizeMb, 0);
  const totalMb = portalMb + deviceMb;

  const parts = portalMb > 0 ? Math.max(1, Math.ceil(portalMb / MB_PER_GB / split)) : 0;

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);

  return {
    rows: sorted,
    count: rows.length,
    portalMb,
    portalLabel: formatSize(portalMb),
    deviceMb,
    deviceLabel: formatSize(deviceMb),
    totalMb,
    totalLabel: formatSize(totalMb),
    parts,
    partSizeGb: split,
    portalCount: portalRows.length,
    deviceCount: deviceRows.length,
    deviceOnlyLabels: deviceRows.map((row) => row.label),
    largestLabel: sorted[0].label,
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    criticalCategories: rows.filter((row) => row.sensitivity >= 5).map((row) => row.label),
    waitDays: portalRows.length > 0 ? VERIFICATION_DAYS : 0,
    downloadWindowDays: DOWNLOAD_WINDOW_DAYS,
  };
}
