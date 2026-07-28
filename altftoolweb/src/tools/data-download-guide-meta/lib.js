/**
 * Meta "Download your information" planner — pure logic.
 *
 * Fixed rules encoded here come from Meta's own export flow, not from this module:
 *  - The request is made in Accounts Center → Your information and permissions →
 *    Download your information, and it can cover Facebook, Instagram and other
 *    profiles linked in the same Accounts Center.
 *  - Meta offers two file formats, HTML (human-readable) and JSON (machine-readable),
 *    and three media-quality settings, Low, Medium and High.
 *  - A date range can be set, or "All time".
 *  - Meta also offers "Transfer your information", which pushes a copy straight to a
 *    third-party service such as Google Photos or Dropbox instead of downloading it.
 *  - The finished file is available for a limited window and re-entering your password
 *    is required before the download starts.
 *  - Under GDPR/DPDP-style access rights a controller must generally respond within
 *    one month of a formal request.
 *
 * Byte figures below are PLANNING ESTIMATES for a typical consumer account, not a
 * measurement of any specific account.
 */

/** Statutory ceiling for a formal access request (GDPR Art. 12(3): one month). */
export const STATUTORY_RESPONSE_DAYS = 30;

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/** Bits in a megabyte, for converting size to download time at a Mbps line rate. */
const BITS_PER_MB = 8;

/** Meta's media-quality choices, with the size factor each implies. */
export const MEDIA_QUALITIES = [
  { id: "low", label: "Low — smallest download", multiplier: 0.2 },
  { id: "medium", label: "Medium — balanced", multiplier: 0.5 },
  { id: "high", label: "High — original quality", multiplier: 1 },
];

/**
 * Meta's two file formats. JSON drops the HTML wrapper and inline styling, so the
 * text portion of the archive is modelled as smaller; media size is unaffected.
 */
export const FILE_FORMATS = [
  { id: "html", label: "HTML — readable in a browser", textMultiplier: 1 },
  { id: "json", label: "JSON — machine-readable", textMultiplier: 0.75 },
];

/**
 * Exportable Meta categories.
 *  baseMb      - one-off size independent of account age
 *  mbPerYear   - extra size per year of account age
 *  media       - true when photos, video or voice notes dominate the category
 *  sensitivity - 1 (mundane) to 5 (private messages, location, off-platform tracking)
 *  waitDays    - realistic time before Meta finishes building that part
 */
export const EXPORT_CATEGORIES = [
  {
    id: "posts",
    label: "Posts, photos and videos",
    what: "Everything you posted to your profile or grid, with captions, timestamps and album structure.",
    baseMb: 20,
    mbPerYear: 900,
    media: true,
    sensitivity: 3,
    waitDays: 3,
    note: "Original uploads often still carry the capture time and, on older posts, the camera model.",
  },
  {
    id: "stories",
    label: "Stories and reels",
    what: "Archived stories and reels including ones that expired publicly years ago.",
    baseMb: 10,
    mbPerYear: 700,
    media: true,
    sensitivity: 3,
    waitDays: 3,
    note: "Stories you thought vanished after 24 hours are usually all still here.",
  },
  {
    id: "messages",
    label: "Messenger and Instagram DMs",
    what: "Full conversation history with attachments, voice notes and call logs.",
    baseMb: 60,
    mbPerYear: 1100,
    media: true,
    sensitivity: 5,
    waitDays: 4,
    note: "This includes the other person's messages, so the archive is their private data as well as yours.",
  },
  {
    id: "off-meta",
    label: "Your activity off Meta",
    what: "Apps and websites that sent Meta records of what you did on them.",
    baseMb: 25,
    mbPerYear: 12,
    media: false,
    sensitivity: 5,
    waitDays: 1,
    note: "Often the most surprising file: purchases and page views from sites you never linked to Meta.",
  },
  {
    id: "ads",
    label: "Ads information",
    what: "Ad topics inferred about you, ads you clicked, and advertisers who uploaded a contact list containing you.",
    baseMb: 18,
    mbPerYear: 9,
    media: false,
    sensitivity: 4,
    waitDays: 1,
    note: "The advertiser list reveals which businesses hold your phone number or email.",
  },
  {
    id: "location",
    label: "Location and check-ins",
    what: "Location history where it was enabled, tagged places, check-ins and estimated primary location.",
    baseMb: 8,
    mbPerYear: 14,
    media: false,
    sensitivity: 5,
    waitDays: 2,
    note: "Meta estimates a primary city even when device location was never granted.",
  },
  {
    id: "search",
    label: "Search history",
    what: "Every name, place and phrase you searched inside Facebook or Instagram.",
    baseMb: 6,
    mbPerYear: 5,
    media: false,
    sensitivity: 4,
    waitDays: 1,
    note: "Profile searches make a very clear record of who you have been looking up.",
  },
  {
    id: "security",
    label: "Security and login information",
    what: "Login records with IP address, device and time, session list and account changes.",
    baseMb: 12,
    mbPerYear: 8,
    media: false,
    sensitivity: 4,
    waitDays: 1,
    note: "Worth reading line by line — an unfamiliar IP or device is the first sign of a compromise.",
  },
  {
    id: "connections",
    label: "Connections",
    what: "Friends, followers, following, blocked accounts, removed friends and pending requests.",
    baseMb: 5,
    mbPerYear: 3,
    media: false,
    sensitivity: 3,
    waitDays: 1,
    note: "Includes people you removed or blocked, which Meta keeps long after you forget.",
  },
  {
    id: "interactions",
    label: "Comments, likes and reactions",
    what: "Every comment you left and every post, page or ad you reacted to.",
    baseMb: 15,
    mbPerYear: 30,
    media: false,
    sensitivity: 3,
    waitDays: 1,
    note: "Reaction history is a compact map of your politics, faith and interests.",
  },
  {
    id: "profile",
    label: "Profile information",
    what: "Name history, contact details, work and education, relationship history and profile photo versions.",
    baseMb: 6,
    mbPerYear: 2,
    media: false,
    sensitivity: 3,
    waitDays: 1,
    note: "Old names and previous phone numbers stay in the file even after you change them.",
  },
  {
    id: "groups",
    label: "Groups, events and pages",
    what: "Group memberships and posts, event responses, and pages you follow or administer.",
    baseMb: 10,
    mbPerYear: 12,
    media: false,
    sensitivity: 3,
    waitDays: 1,
    note: "Private group membership can reveal health, immigration or employment situations.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Start from Accounts Center, not the app settings",
    "Open Accounts Center → Your information and permissions → Download your information. Starting here lets you cover Facebook and Instagram in one request if both are linked.",
  ],
  [
    "Choose the profiles, then narrow the categories",
    "Meta defaults to everything. Select only the categories you actually want; a full all-time export at high quality is the slowest and the riskiest file to hold.",
  ],
  [
    "Pick the format for the job",
    "HTML if a human will read it, JSON if a script or another service will parse it. JSON is the right choice for migration and for searching messages in bulk.",
  ],
  [
    "Set media quality and date range deliberately",
    "Low quality plus a narrow date range can turn a multi-gigabyte export into a few hundred megabytes when you only need the text records.",
  ],
  [
    "Consider Transfer your information instead",
    "For photos and videos, transferring straight to a service such as Google Photos or Dropbox avoids ever putting an unencrypted archive on your own disk.",
  ],
  [
    "Download promptly and re-check the password prompt",
    "The finished file is only available for a limited window and Meta asks for your password again. Do that on your own device, never on a shared or public machine.",
  ],
  [
    "Read the off-Meta and ads files first",
    "Those two explain how you are being tracked and profiled, and they take minutes to read. Delete the archive once you are done, or move it to encrypted storage.",
  ],
  [
    "Escalate in writing if something is missing",
    `If a category you are entitled to is absent, send a written access request; a controller generally has to respond within ${STATUTORY_RESPONSE_DAYS} days.`,
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

/** Human-readable duration from a second count. */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} sec`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const restMinutes = Math.round(minutes - hours * 60);
  return restMinutes === 0 ? `${hours} h` : `${hours} h ${restMinutes} min`;
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
 * Estimate a Meta export.
 *
 * Size model: each category contributes baseMb + mbPerYear * accountAgeYears.
 * Media categories are then scaled by the chosen media-quality factor; text-only
 * categories are scaled by the format factor (JSON drops HTML markup).
 *
 * Sensitivity score = 20 * (0.6 * highest + 0.4 * mean) of the 1-5 ratings, bounded
 * to 20-100 by construction.
 *
 * Download time = totalMb * 8 bits / line rate in Mbps, in seconds.
 *
 * @returns {{error: string} | object} plain object; never NaN or Infinity.
 */
export function estimateExport({ selectedIds, accountAgeYears, qualityId, formatId, speedMbps }) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one category to estimate a Meta download." };
  }

  const known = EXPORT_CATEGORIES.filter((category) => selectedIds.includes(category.id));
  if (known.length === 0) {
    return { error: "None of the selected items match a Meta download category." };
  }

  const years = Number(accountAgeYears);
  if (!Number.isFinite(years)) {
    return { error: "Enter the account age in years as a number." };
  }
  if (years <= 0) {
    return { error: "Account age must be greater than zero years." };
  }
  if (years > 22) {
    return { error: "Facebook opened to the public in 2006, so an age above 22 years is not possible." };
  }

  const quality = MEDIA_QUALITIES.find((option) => option.id === qualityId);
  if (!quality) {
    return { error: "Choose a media quality: Low, Medium or High." };
  }

  const format = FILE_FORMATS.find((option) => option.id === formatId);
  if (!format) {
    return { error: "Choose a file format: HTML or JSON." };
  }

  const speed = Number(speedMbps);
  if (!Number.isFinite(speed) || speed <= 0) {
    return { error: "Enter your download speed in Mbps as a number above zero." };
  }
  if (speed > 10000) {
    return { error: "Download speed above 10,000 Mbps is outside the range this estimate handles." };
  }

  const rows = known.map((category) => {
    const raw = category.baseMb + category.mbPerYear * years;
    const sizeMb = category.media ? raw * quality.multiplier : raw * format.textMultiplier;
    return { ...category, sizeMb };
  });

  const totalMb = rows.reduce((sum, row) => sum + row.sizeMb, 0);
  const downloadSeconds = (totalMb * BITS_PER_MB) / speed;

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const waitDays = Math.max(...rows.map((row) => row.waitDays));
  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);
  const mediaMb = rows.filter((row) => row.media).reduce((sum, row) => sum + row.sizeMb, 0);

  return {
    rows: sorted,
    count: rows.length,
    totalMb,
    totalLabel: formatSize(totalMb),
    downloadSeconds,
    downloadLabel: formatDuration(downloadSeconds),
    largestLabel: sorted[0].label,
    mediaMb,
    mediaShare: totalMb > 0 ? (mediaMb / totalMb) * 100 : 0,
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    criticalCategories: rows.filter((row) => row.sensitivity >= 5).map((row) => row.label),
    waitDays,
    transferRecommended: mediaMb > 2 * MB_PER_GB,
  };
}
