/**
 * Streaming-music data export planner — pure logic.
 *
 * Fixed rules encoded here come from Spotify's privacy portal and from how the other
 * major services handle exports, not from this module:
 *  - Spotify's request page (privacy.spotify.com) offers three separate tiers, each
 *    requested and delivered on its own timetable.
 *      1. Account data — playlists, library, the past year of streaming history,
 *         search queries, payment and profile details. Spotify quotes about 5 days.
 *      2. Extended streaming history — the complete play-by-play going back to the
 *         first listen, one JSON record per play. Spotify quotes up to 30 days.
 *      3. Technical log information — detailed device and connection logs. Spotify
 *         also quotes up to 30 days.
 *  - Each tier arrives as a separate emailed link with a zip of JSON files.
 *  - Apple Music history is requested through privacy.apple.com, YouTube Music through
 *    Google Takeout, and Amazon Music through Amazon's Data Privacy page — none of
 *    them are covered by a Spotify request.
 *  - Under GDPR Art. 12(3) a controller has one month to answer an access request.
 *
 * Per-record figures are PLANNING ESTIMATES from typical JSON record widths, not a
 * measurement of any specific account.
 */

/** Spotify's quoted wait for the account-data tier, in days. */
export const ACCOUNT_TIER_DAYS = 5;

/** Spotify's quoted wait for extended history and technical logs, in days. */
export const EXTENDED_TIER_DAYS = 30;

/** GDPR Art. 12(3) deadline for an access request, in days. */
export const GDPR_RESPONSE_DAYS = 30;

/** Bytes in a megabyte. */
const BYTES_PER_MB = 1024 * 1024;

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/** Days in a year, for turning a daily listening rate into a lifetime play count. */
const DAYS_PER_YEAR = 365;

/**
 * One extended-history record carries timestamp, track, artist, album, milliseconds
 * played, platform, country, IP address, shuffle and skip flags and the reason the
 * track started and ended — roughly this many bytes of JSON.
 */
export const BYTES_PER_PLAY_RECORD = 450;

/** A past-year history record in the account tier is a slimmer version of the above. */
export const BYTES_PER_RECENT_RECORD = 180;

/** Request tiers. */
export const TIER_ACCOUNT = "account";
export const TIER_EXTENDED = "extended";
export const TIER_TECHNICAL = "technical";

export const TIER_LABELS = {
  [TIER_ACCOUNT]: "Account data",
  [TIER_EXTENDED]: "Extended streaming history",
  [TIER_TECHNICAL]: "Technical log information",
};

export const TIER_DAYS = {
  [TIER_ACCOUNT]: ACCOUNT_TIER_DAYS,
  [TIER_EXTENDED]: EXTENDED_TIER_DAYS,
  [TIER_TECHNICAL]: EXTENDED_TIER_DAYS,
};

/**
 * Requestable streaming data.
 *  baseMb              - one-off size independent of listening volume
 *  mbPerYear           - extra size per year on the service
 *  bytesPerPlay        - scales with lifetime play count
 *  bytesPerRecentPlay  - scales with plays in the last year only
 *  sensitivity         - 1 (mundane) to 5 (address, IP history, full listening log)
 */
export const EXPORT_CATEGORIES = [
  {
    id: "extended-history",
    label: "Extended streaming history",
    tier: TIER_EXTENDED,
    what: "One record per play, back to your first listen: timestamp, track, milliseconds played, platform, country, IP address, shuffle and skip flags.",
    baseMb: 0.5,
    mbPerYear: 0,
    bytesPerPlay: BYTES_PER_PLAY_RECORD,
    bytesPerRecentPlay: 0,
    sensitivity: 5,
    note: "The richest file by far — it reconstructs your sleep pattern, commute and moods, not only your taste.",
  },
  {
    id: "recent-history",
    label: "Recent streaming history",
    tier: TIER_ACCOUNT,
    what: "The past year of plays in a slimmer format, included with the account-data tier.",
    baseMb: 0.2,
    mbPerYear: 0,
    bytesPerPlay: 0,
    bytesPerRecentPlay: BYTES_PER_RECENT_RECORD,
    sensitivity: 4,
    note: "Enough for most curiosity, and it arrives in days rather than weeks.",
  },
  {
    id: "account-profile",
    label: "Profile and account details",
    tier: TIER_ACCOUNT,
    what: "Name, email, postal address, date of birth, gender, country, phone and account creation date.",
    baseMb: 0.05,
    mbPerYear: 0,
    bytesPerPlay: 0,
    bytesPerRecentPlay: 0,
    sensitivity: 5,
    note: "Small file, highest identifying value — this is the record that ties every play to a real person.",
  },
  {
    id: "playlists",
    label: "Playlists",
    tier: TIER_ACCOUNT,
    what: "Playlists you created with every track, the order, add dates and collaborators.",
    baseMb: 0.3,
    mbPerYear: 0.4,
    bytesPerPlay: 0,
    bytesPerRecentPlay: 0,
    sensitivity: 2,
    note: "The most useful file for migrating to another service.",
  },
  {
    id: "library",
    label: "Library and follows",
    tier: TIER_ACCOUNT,
    what: "Saved tracks, albums and shows, plus artists and users you follow.",
    baseMb: 0.2,
    mbPerYear: 0.3,
    bytesPerPlay: 0,
    bytesPerRecentPlay: 0,
    sensitivity: 2,
    note: "Pairs with the playlist file to rebuild your account elsewhere.",
  },
  {
    id: "search",
    label: "Search queries",
    tier: TIER_ACCOUNT,
    what: "Everything you typed into search, with timestamps and the platform you searched from.",
    baseMb: 0.1,
    mbPerYear: 0.5,
    bytesPerPlay: 0,
    bytesPerRecentPlay: 0,
    sensitivity: 4,
    note: "Searches are more revealing than plays — they include the things you looked for and never played.",
  },
  {
    id: "podcasts",
    label: "Podcast activity",
    tier: TIER_ACCOUNT,
    what: "Shows followed, episodes played and how far into each one you got.",
    baseMb: 0.1,
    mbPerYear: 0.4,
    bytesPerPlay: 0,
    bytesPerRecentPlay: 0,
    sensitivity: 4,
    note: "Podcast choices carry political, religious and health signals that music largely does not.",
  },
  {
    id: "payments",
    label: "Payments and subscription",
    tier: TIER_ACCOUNT,
    what: "Plan history, invoices, masked payment method and family or duo plan members.",
    baseMb: 0.1,
    mbPerYear: 0.1,
    bytesPerPlay: 0,
    bytesPerRecentPlay: 0,
    sensitivity: 4,
    note: "Family plan records list your household members and, for some plans, a shared address.",
  },
  {
    id: "inferences",
    label: "Inferences and ad segments",
    tier: TIER_ACCOUNT,
    what: "Marketing segments and inferred attributes used to target advertising at you.",
    baseMb: 0.1,
    mbPerYear: 0.05,
    bytesPerPlay: 0,
    bytesPerRecentPlay: 0,
    sensitivity: 4,
    note: "Short, blunt and worth reading — it states what the service believes about you.",
  },
  {
    id: "social",
    label: "Social and sharing",
    tier: TIER_ACCOUNT,
    what: "Followers, following, collaborative playlists and items you shared.",
    baseMb: 0.05,
    mbPerYear: 0.05,
    bytesPerPlay: 0,
    bytesPerRecentPlay: 0,
    sensitivity: 2,
    note: "Low risk, but it links your listening identity to friends' accounts.",
  },
  {
    id: "technical-logs",
    label: "Technical log information",
    tier: TIER_TECHNICAL,
    what: "Device models, app versions, connection records, IP addresses and diagnostic events.",
    baseMb: 2,
    mbPerYear: 6,
    bytesPerPlay: 0,
    bytesPerRecentPlay: 0,
    sensitivity: 4,
    note: "Requested separately, takes the longest, and is mostly useful for proving where you were.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Open the privacy page, not the app settings",
    "Spotify's request form lives on its privacy page, signed in with the same account. The mobile app only links to it.",
  ],
  [
    "Request the tiers you need, separately",
    `Account data is quoted at about ${ACCOUNT_TIER_DAYS} days; extended streaming history and technical logs are quoted at up to ${EXTENDED_TIER_DAYS} days. Request all three at once if you want them all, since the clocks run in parallel.`,
  ],
  [
    "Confirm the email for each tier",
    "Each request sends its own confirmation link. Missing one means that tier is never prepared, which is the usual reason only part of the data arrives.",
  ],
  [
    "Download every zip promptly",
    "Links are time-limited and each tier arrives on its own schedule, so check back over the following weeks rather than assuming the first email was everything.",
  ],
  [
    "Read the inferences file first",
    "It is a few kilobytes and it states the marketing segments you have been placed in — the fastest privacy insight in the whole archive.",
  ],
  [
    "Use the playlist and library files to migrate",
    "Those two, plus your saved albums, are all a transfer tool needs. You do not have to hand over your streaming history to move services.",
  ],
  [
    "Request other services separately",
    "Apple Music comes through Apple's privacy portal, YouTube Music through Google Takeout, and Amazon Music through Amazon's Data Privacy page.",
  ],
  [
    "Store the extended history carefully",
    `It contains IP addresses and a minute-by-minute record of your day. Keep it encrypted. For a formal access request, a controller generally has ${GDPR_RESPONSE_DAYS} days to respond.`,
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
 * Estimate a streaming-music data export.
 *
 * Volume model:
 *   playsPerDay   = listeningMinutesPerDay / avgTrackMinutes
 *   lifetimePlays = playsPerDay * 365 * years
 *   recentPlays   = playsPerDay * 365 (the last year only)
 *
 * Size model per category:
 *   baseMb + mbPerYear * years
 *          + bytesPerPlay * lifetimePlays / 1 MB
 *          + bytesPerRecentPlay * recentPlays / 1 MB
 *
 * Wait model: the longest tier in the selection decides how long the whole set takes.
 *
 * Sensitivity score = 20 * (0.6 * highest + 0.4 * mean) of the 1-5 ratings, bounded
 * to 20-100 by construction.
 *
 * @returns {{error: string} | object} plain object; never NaN or Infinity.
 */
export function estimateExport({ selectedIds, years, listeningMinutesPerDay, avgTrackMinutes }) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one category to estimate a music data export." };
  }

  const known = EXPORT_CATEGORIES.filter((category) => selectedIds.includes(category.id));
  if (known.length === 0) {
    return { error: "None of the selected items match a streaming data category." };
  }

  const useYears = Number(years);
  if (!Number.isFinite(useYears)) {
    return { error: "Enter how many years you have used the service as a number." };
  }
  if (useYears <= 0) {
    return { error: "Years on the service must be greater than zero." };
  }
  if (useYears > 19) {
    return { error: "Spotify launched in 2008, so more than 19 years on the service is not possible." };
  }

  const minutesPerDay = Number(listeningMinutesPerDay);
  if (!Number.isFinite(minutesPerDay)) {
    return { error: "Enter your daily listening time in minutes as a number." };
  }
  if (minutesPerDay < 0) {
    return { error: "Daily listening time cannot be negative." };
  }
  if (minutesPerDay > 1440) {
    return { error: "A day only has 1,440 minutes, so daily listening cannot exceed that." };
  }

  const trackMinutes = Number(avgTrackMinutes);
  if (!Number.isFinite(trackMinutes)) {
    return { error: "Enter your average track length in minutes as a number." };
  }
  if (trackMinutes <= 0) {
    return { error: "Average track length must be greater than zero minutes." };
  }
  if (trackMinutes > 60) {
    return { error: "An average track longer than 60 minutes is outside this estimate." };
  }

  const playsPerDay = minutesPerDay / trackMinutes;
  const lifetimePlays = playsPerDay * DAYS_PER_YEAR * useYears;
  const recentPlays = playsPerDay * DAYS_PER_YEAR;
  const listeningHours = (minutesPerDay * DAYS_PER_YEAR * useYears) / 60;

  const rows = known.map((category) => {
    const sizeMb =
      category.baseMb +
      category.mbPerYear * useYears +
      (category.bytesPerPlay * lifetimePlays) / BYTES_PER_MB +
      (category.bytesPerRecentPlay * recentPlays) / BYTES_PER_MB;
    return { ...category, sizeMb };
  });

  const totalMb = rows.reduce((sum, row) => sum + row.sizeMb, 0);

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const tiers = [...new Set(rows.map((row) => row.tier))];
  const waitDays = Math.max(...tiers.map((tier) => TIER_DAYS[tier]));
  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);

  return {
    rows: sorted,
    count: rows.length,
    totalMb,
    totalLabel: formatSize(totalMb),
    lifetimePlays: Math.round(lifetimePlays),
    recentPlays: Math.round(recentPlays),
    playsPerDay,
    listeningHours,
    tiers,
    tierLabels: tiers.map((tier) => TIER_LABELS[tier]),
    requestCount: tiers.length,
    waitDays,
    largestLabel: sorted[0].label,
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    criticalCategories: rows.filter((row) => row.sensitivity >= 5).map((row) => row.label),
  };
}
