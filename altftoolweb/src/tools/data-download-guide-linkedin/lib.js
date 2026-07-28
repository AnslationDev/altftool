/**
 * LinkedIn data export planner — pure logic.
 *
 * Fixed rules encoded here come from LinkedIn's own export flow, not from this
 * module:
 *  - The request is made in Settings & Privacy → Data privacy → Get a copy of your
 *    data, and LinkedIn offers two paths.
 *  - Path 1, "select the data files you're most interested in", returns the chosen
 *    CSV files quickly — LinkedIn quotes about 10 minutes.
 *  - Path 2, the larger archive including connections, contacts and account activity,
 *    is quoted at within 24 hours.
 *  - Files arrive as CSVs inside a zip, delivered through a time-limited email link,
 *    so the archive must be downloaded promptly.
 *  - A LinkedIn account can hold at most 30,000 connections, which is why this module
 *    rejects a larger connection count.
 *  - Under GDPR/DPDP-style access rights a controller must generally respond within
 *    one month of a formal request.
 *
 * Row-size figures below are PLANNING ESTIMATES based on typical CSV row widths, not
 * a measurement of any specific account.
 */

/** LinkedIn's published ceiling on connections per account. */
export const MAX_CONNECTIONS = 30000;

/** Upper bound this estimator will accept for lifetime message count. */
export const MAX_MESSAGES = 200000;

/** LinkedIn's quoted wait for the "pick specific files" path, in minutes. */
export const FAST_PATH_MINUTES = 10;

/** LinkedIn's quoted wait for the full archive, in minutes (24 hours). */
export const FULL_ARCHIVE_MINUTES = 24 * 60;

/** Statutory ceiling for a formal access request (GDPR Art. 12(3): one month). */
export const STATUTORY_RESPONSE_DAYS = 30;

/** Bytes in a megabyte, used to convert row counts into size. */
const BYTES_PER_MB = 1024 * 1024;

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/**
 * Typical CSV row widths in bytes. A connection row carries first and last name,
 * email where shared, company, position and the connected-on date; a message row
 * carries sender, recipient, timestamp, subject and body.
 */
export const BYTES_PER_CONNECTION_ROW = 130;
export const BYTES_PER_CONTACT_ROW = 180;
export const BYTES_PER_INVITATION_ROW = 110;
export const BYTES_PER_MESSAGE_ROW = 420;

/** Which of LinkedIn's two paths a file belongs to. */
export const TIER_FAST = "fast";
export const TIER_FULL = "full";

/**
 * Files LinkedIn can return.
 *  baseMb                - one-off size independent of account size
 *  mbPerYear             - extra size per year on the platform
 *  bytesPerConnection    - scales with your connection count
 *  bytesPerMessage       - scales with your lifetime message count
 *  sensitivity           - 1 (mundane) to 5 (private messages, job hunting, searches)
 *  tier                  - TIER_FAST (about 10 minutes) or TIER_FULL (up to 24 hours)
 */
export const EXPORT_FILES = [
  {
    id: "connections",
    label: "Connections",
    tier: TIER_FAST,
    what: "Every first-degree connection with name, headline, company, position and the date you connected.",
    baseMb: 0.05,
    mbPerYear: 0,
    bytesPerConnection: BYTES_PER_CONNECTION_ROW,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 4,
    note: "This is a ready-made contact list of other people — the single most re-shared file in a LinkedIn export.",
  },
  {
    id: "contacts",
    label: "Contacts",
    tier: TIER_FAST,
    what: "Address books you ever synced to LinkedIn, with emails and phone numbers.",
    baseMb: 0.05,
    mbPerYear: 0.4,
    bytesPerConnection: BYTES_PER_CONTACT_ROW * 0.35,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 5,
    note: "Often contains phone numbers of people who never joined LinkedIn. Remove synced contacts if you no longer want them stored.",
  },
  {
    id: "messages",
    label: "Messages",
    tier: TIER_FULL,
    what: "Full conversation history including InMail, with sender, timestamp, subject and body.",
    baseMb: 0.2,
    mbPerYear: 0,
    bytesPerConnection: 0,
    bytesPerMessage: BYTES_PER_MESSAGE_ROW,
    media: false,
    sensitivity: 5,
    note: "Salary talk, referrals and complaints all live here in plain text, and the other person's words are in it too.",
  },
  {
    id: "jobs",
    label: "Job applications and preferences",
    tier: TIER_FAST,
    what: "Jobs applied to, saved jobs, saved searches and job-seeker preferences such as Open To Work.",
    baseMb: 0.6,
    mbPerYear: 0.5,
    bytesPerConnection: 0,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 5,
    note: "A dated record of every time you looked for a way out of a job — treat it as confidential.",
  },
  {
    id: "search",
    label: "Search history",
    tier: TIER_FAST,
    what: "Every search you ran on LinkedIn, with the query text and timestamp.",
    baseMb: 0.3,
    mbPerYear: 0.6,
    bytesPerConnection: 0,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 5,
    note: "Shows exactly which people and companies you have been researching.",
  },
  {
    id: "ad-targeting",
    label: "Ad targeting attributes",
    tier: TIER_FAST,
    what: "The inferred attributes LinkedIn lets advertisers target you by, such as seniority, employer, interests and degrees.",
    baseMb: 0.2,
    mbPerYear: 0.05,
    bytesPerConnection: 0,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 4,
    note: "The quickest way to see how the platform has classified you professionally.",
  },
  {
    id: "profile",
    label: "Profile, positions and skills",
    tier: TIER_FAST,
    what: "Profile fields, work history, education, skills, endorsements and recommendations.",
    baseMb: 0.3,
    mbPerYear: 0.1,
    bytesPerConnection: 0,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 3,
    note: "Includes previous headline and summary versions you have since edited away.",
  },
  {
    id: "invitations",
    label: "Invitations",
    tier: TIER_FAST,
    what: "Invitations sent and received, accepted or not, with any custom note.",
    baseMb: 0.05,
    mbPerYear: 0.1,
    bytesPerConnection: BYTES_PER_INVITATION_ROW * 1.6,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 3,
    note: "Pending and ignored invitations are kept for years.",
  },
  {
    id: "logins",
    label: "Logins and security history",
    tier: TIER_FAST,
    what: "Sign-in records with IP address, device and time, registration details and security challenges.",
    baseMb: 0.4,
    mbPerYear: 0.5,
    bytesPerConnection: 0,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 4,
    note: "Scan it for logins from countries or devices you do not recognise.",
  },
  {
    id: "activity",
    label: "Posts, comments and reactions",
    tier: TIER_FULL,
    what: "Shares, articles, comments, reactions and votes, with timestamps.",
    baseMb: 1,
    mbPerYear: 2.5,
    bytesPerConnection: 0,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 3,
    note: "Includes comments on posts that have since been deleted by their authors.",
  },
  {
    id: "rich-media",
    label: "Rich media you uploaded",
    tier: TIER_FULL,
    what: "Images, videos and documents attached to posts, profile media and featured items.",
    baseMb: 2,
    mbPerYear: 60,
    bytesPerConnection: 0,
    bytesPerMessage: 0,
    media: true,
    sensitivity: 3,
    note: "This is what makes an otherwise tiny LinkedIn archive suddenly weigh hundreds of megabytes.",
  },
  {
    id: "follows",
    label: "Follows and interests",
    tier: TIER_FAST,
    what: "Companies, hashtags, newsletters, groups and people you follow.",
    baseMb: 0.1,
    mbPerYear: 0.15,
    bytesPerConnection: 0,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 2,
    note: "Company follows quietly signal which employers you are interested in.",
  },
  {
    id: "learning",
    label: "LinkedIn Learning activity",
    tier: TIER_FAST,
    what: "Courses viewed and completed, certificates and learning history.",
    baseMb: 0.1,
    mbPerYear: 0.2,
    bytesPerConnection: 0,
    bytesPerMessage: 0,
    media: false,
    sensitivity: 2,
    note: "Low risk, though the course list can hint at a planned career change.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Open Settings & Privacy → Data privacy",
    "Choose 'Get a copy of your data'. Do it on desktop; the flow is easier to control than in the mobile app.",
  ],
  [
    "Decide which of the two paths you need",
    `Picking specific files returns them in roughly ${FAST_PATH_MINUTES} minutes. The larger archive, which adds messages, activity and rich media, is quoted at up to 24 hours.`,
  ],
  [
    "Request the fast files first",
    "Connections, ad targeting and search history usually answer the question you actually had, and they arrive while you are still at your desk.",
  ],
  [
    "Download from the emailed link promptly",
    "The link is time-limited. Save the zip, extract it, and confirm the CSVs open before you close the email.",
  ],
  [
    "Read Ad_Targeting and Search history first",
    "Those two show how LinkedIn has profiled you and what your own research trail looks like — both take minutes to skim.",
  ],
  [
    "Clean up what the export reveals",
    "Remove synced contacts you no longer want stored, turn off profile-viewing broadcasts, and revoke third-party apps you no longer use.",
  ],
  [
    "Protect other people's data",
    "Connections and Contacts are personal data belonging to other people. Do not upload those CSVs to a random web tool or a CRM you do not control.",
  ],
  [
    "Escalate in writing if something is missing",
    `If a file you are entitled to is absent, send a written access request; a controller generally has to respond within ${STATUTORY_RESPONSE_DAYS} days.`,
  ],
];

/** Human-readable size from a megabyte figure. */
export function formatSize(mb) {
  if (!Number.isFinite(mb) || mb < 0) return "—";
  if (mb === 0) return "0 MB";
  if (mb < 0.1) return "<0.1 MB";
  if (mb < 1) return `${mb.toFixed(1)} MB`;
  if (mb < MB_PER_GB) return `${Math.round(mb)} MB`;
  const gb = mb / MB_PER_GB;
  return `${gb >= 10 ? Math.round(gb) : gb.toFixed(1)} GB`;
}

/** Human-readable wait from a minute count. */
export function formatWait(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  const hours = minutes / 60;
  return hours === 1 ? "1 hour" : `${Math.round(hours)} hours`;
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
 * Estimate a LinkedIn export.
 *
 * Size model per file:
 *   baseMb
 * + mbPerYear * yearsOnLinkedIn
 * + bytesPerConnection * connections / 1 MB
 * + bytesPerMessage * messages / 1 MB
 *
 * Wait model: if every selected file is in the fast tier the estimate is LinkedIn's
 * quoted 10 minutes; as soon as one full-archive file is selected the whole request
 * becomes the larger archive and the estimate is 24 hours.
 *
 * Sensitivity score = 20 * (0.6 * highest + 0.4 * mean) of the 1-5 ratings, bounded
 * to 20-100 by construction.
 *
 * @returns {{error: string} | object} plain object; never NaN or Infinity.
 */
export function estimateExport({ selectedIds, yearsOnLinkedIn, connections, messages }) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one LinkedIn file to estimate an export." };
  }

  const known = EXPORT_FILES.filter((file) => selectedIds.includes(file.id));
  if (known.length === 0) {
    return { error: "None of the selected items match a LinkedIn export file." };
  }

  const years = Number(yearsOnLinkedIn);
  if (!Number.isFinite(years)) {
    return { error: "Enter how many years you have been on LinkedIn as a number." };
  }
  if (years <= 0) {
    return { error: "Years on LinkedIn must be greater than zero." };
  }
  if (years > 23) {
    return { error: "LinkedIn launched in 2003, so more than 23 years on the platform is not possible." };
  }

  const connectionCount = Number(connections);
  if (!Number.isFinite(connectionCount)) {
    return { error: "Enter your connection count as a number." };
  }
  if (connectionCount < 0) {
    return { error: "Connection count cannot be negative." };
  }
  if (connectionCount > MAX_CONNECTIONS) {
    return { error: `LinkedIn caps an account at ${MAX_CONNECTIONS.toLocaleString("en-IN")} connections.` };
  }

  const messageCount = Number(messages);
  if (!Number.isFinite(messageCount)) {
    return { error: "Enter your rough lifetime message count as a number." };
  }
  if (messageCount < 0) {
    return { error: "Message count cannot be negative." };
  }
  if (messageCount > MAX_MESSAGES) {
    return { error: `Message count above ${MAX_MESSAGES.toLocaleString("en-IN")} is outside this estimate.` };
  }

  const rows = known.map((file) => {
    const sizeMb =
      file.baseMb +
      file.mbPerYear * years +
      (file.bytesPerConnection * connectionCount) / BYTES_PER_MB +
      (file.bytesPerMessage * messageCount) / BYTES_PER_MB;
    return { ...file, sizeMb };
  });

  const totalMb = rows.reduce((sum, row) => sum + row.sizeMb, 0);
  const needsFullArchive = rows.some((row) => row.tier === TIER_FULL);
  const waitMinutes = needsFullArchive ? FULL_ARCHIVE_MINUTES : FAST_PATH_MINUTES;

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);
  const fullTierLabels = rows.filter((row) => row.tier === TIER_FULL).map((row) => row.label);

  return {
    rows: sorted,
    count: rows.length,
    totalMb,
    totalLabel: formatSize(totalMb),
    waitMinutes,
    waitLabel: formatWait(waitMinutes),
    needsFullArchive,
    fullTierLabels,
    fastCount: rows.filter((row) => row.tier === TIER_FAST).length,
    largestLabel: sorted[0].label,
    thirdPartyRows:
      (selectedIds.includes("connections") ? connectionCount : 0) +
      (selectedIds.includes("contacts") ? Math.round(connectionCount * 0.35) : 0),
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    criticalFiles: rows.filter((row) => row.sensitivity >= 5).map((row) => row.label),
  };
}
