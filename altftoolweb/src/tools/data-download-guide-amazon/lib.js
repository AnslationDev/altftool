/**
 * Amazon data request planner — pure logic.
 *
 * Fixed rules encoded here come from Amazon's own request flow, not from this module:
 *  - The request is made from Account → Data Privacy / "Request Your Data", where you
 *    choose either a single category or "Request All Your Data".
 *  - Amazon emails a confirmation link that has to be clicked before the request is
 *    even queued; ignoring that email silently cancels the request.
 *  - Amazon states a request may take up to a month to fulfil, which matches the
 *    one-month deadline a controller has under GDPR Art. 12(3) and comparable rules.
 *  - The finished archive is delivered as a time-limited download link, so it has to
 *    be collected promptly.
 *  - Alexa voice recordings can also be reviewed and deleted directly in Alexa privacy
 *    settings, independently of any export.
 *
 * Per-row and per-clip figures are PLANNING ESTIMATES from typical file widths, not a
 * measurement of any specific account.
 */

/** Amazon's stated outer limit for fulfilling a data request, in days. */
export const RESPONSE_DAYS = 30;

/** Days a delivered download link should be treated as usable before it lapses. */
export const COLLECT_WITHIN_DAYS = 7;

/** Bytes in a megabyte. */
const BYTES_PER_MB = 1024 * 1024;

/** 1 GB expressed in the MB unit used throughout this module. */
const MB_PER_GB = 1024;

/**
 * A single order contributes rows across several files — order summary, item lines,
 * returns, refunds and invoice references — which together run to roughly this many
 * bytes of CSV.
 */
export const BYTES_PER_ORDER = 900;

/** Typical size of one stored Alexa utterance: compressed audio plus its transcript. */
export const BYTES_PER_VOICE_CLIP = 40 * 1024;

/** Typical length of one stored Alexa utterance, in seconds. */
export const SECONDS_PER_VOICE_CLIP = 5;

/** Days in a year, used to turn a daily Alexa rate into a lifetime clip count. */
const DAYS_PER_YEAR = 365;

/**
 * Requestable Amazon categories.
 *  baseMb            - one-off size independent of account age
 *  mbPerYear         - extra size per year as a customer
 *  bytesPerOrder     - scales with lifetime order count
 *  bytesPerVoiceClip - scales with lifetime Alexa utterance count
 *  sensitivity       - 1 (mundane) to 5 (home address, voice, payment records)
 */
export const EXPORT_CATEGORIES = [
  {
    id: "retail-orders",
    label: "Orders, returns and refunds",
    what: "Every order with items, prices, dates, delivery status, returns and refunds.",
    baseMb: 0.5,
    mbPerYear: 0.2,
    bytesPerOrder: BYTES_PER_ORDER,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 4,
    note: "Purchase history is a health, faith and household profile in disguise — medicines, books and baby items all show up.",
  },
  {
    id: "profile",
    label: "Account and address book",
    what: "Name, phone numbers, every saved delivery address and account change history.",
    baseMb: 0.4,
    mbPerYear: 0.1,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 5,
    note: "Old addresses stay in the file long after you stop using them, including workplaces and relatives' homes.",
  },
  {
    id: "payments",
    label: "Payments and gift cards",
    what: "Masked payment instruments, transaction records, gift card activity and Amazon Pay history.",
    baseMb: 0.6,
    mbPerYear: 0.3,
    bytesPerOrder: 180,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 5,
    note: "Card numbers are masked, but the transaction trail still maps your spending week by week.",
  },
  {
    id: "alexa",
    label: "Alexa voice recordings and smart home",
    what: "Stored utterances as audio and text, plus smart-home device events and routines.",
    baseMb: 2,
    mbPerYear: 1,
    bytesPerOrder: 0,
    bytesPerVoiceClip: BYTES_PER_VOICE_CLIP,
    media: true,
    sensitivity: 5,
    note: "Recordings capture whoever was in the room, not just you. You can delete them separately in Alexa privacy settings.",
  },
  {
    id: "search",
    label: "Search and browse history",
    what: "Search terms typed on Amazon, products viewed and the order you viewed them in.",
    baseMb: 1.5,
    mbPerYear: 2.5,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 4,
    note: "Includes searches that never became purchases, which is often the more revealing half.",
  },
  {
    id: "advertising",
    label: "Advertising audiences",
    what: "Audience segments you were placed in, ads served and clicked, and third-party audience matches.",
    baseMb: 1,
    mbPerYear: 0.8,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 4,
    note: "The audience list is the clearest statement of what Amazon believes about your life stage and income.",
  },
  {
    id: "devices",
    label: "Amazon devices",
    what: "Echo, Fire TV, Fire tablet and eero usage records, settings and diagnostic events.",
    baseMb: 3,
    mbPerYear: 4,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 4,
    note: "Device wake and sleep events double as an occupancy log for your home.",
  },
  {
    id: "kindle",
    label: "Kindle reading activity",
    what: "Books opened, reading progress and speed, highlights, notes and bookmarks.",
    baseMb: 1,
    mbPerYear: 1.5,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 4,
    note: "Highlights are among the most personal text Amazon holds — they are the sentences you stopped on.",
  },
  {
    id: "prime-video",
    label: "Prime Video",
    what: "Watch history, watchlist, playback positions and viewing device.",
    baseMb: 1,
    mbPerYear: 2,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 4,
    note: "Household members share a profile more often than not, so the history is rarely only yours.",
  },
  {
    id: "music",
    label: "Amazon Music",
    what: "Listening history, playlists, likes and station seeds.",
    baseMb: 0.8,
    mbPerYear: 1.5,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 3,
    note: "Timestamps show your working hours and commute as clearly as the music shows your taste.",
  },
  {
    id: "audible",
    label: "Audible",
    what: "Library, listening progress, statistics, bookmarks and membership credits.",
    baseMb: 0.6,
    mbPerYear: 0.8,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 3,
    note: "Progress data reveals when and how long you listen, not just what.",
  },
  {
    id: "customer-service",
    label: "Customer service contacts",
    what: "Chat transcripts, call records and email threads with Amazon support.",
    baseMb: 1.2,
    mbPerYear: 0.6,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 4,
    note: "Transcripts frequently quote full addresses and partial payment details you read out at the time.",
  },
  {
    id: "lists",
    label: "Wishlists and registries",
    what: "Public and private lists, registries, saved items and Subscribe & Save schedules.",
    baseMb: 0.3,
    mbPerYear: 0.3,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 3,
    note: "Check which lists are public — registries in particular often expose a delivery address.",
  },
  {
    id: "subscriptions",
    label: "Subscriptions and Prime",
    what: "Prime membership history, benefits used, subscriptions and renewal records.",
    baseMb: 0.3,
    mbPerYear: 0.2,
    bytesPerOrder: 0,
    bytesPerVoiceClip: 0,
    media: false,
    sensitivity: 2,
    note: "Mostly billing history, useful for spotting a subscription you forgot to cancel.",
  },
];

/** Ordered checklist shown alongside the estimate. */
export const REQUEST_STEPS = [
  [
    "Open Account → Data Privacy on the right marketplace",
    "Amazon treats each marketplace as a separate account. Data bought on amazon.in is requested on amazon.in, not on the .com site.",
  ],
  [
    "Pick specific categories over Request All Your Data",
    "A category request is prepared faster and produces a file you can actually read. 'All your data' is worth it only when you genuinely need everything.",
  ],
  [
    "Confirm the email — this step is easy to miss",
    "Amazon emails a confirmation link and does nothing until you click it. If the archive never arrives, this is almost always the reason.",
  ],
  [
    "Expect it to take days, not minutes",
    `Amazon states a request can take up to ${RESPONSE_DAYS} days. Small categories often come back in a day or two; Alexa and device data take the longest.`,
  ],
  [
    "Download every part promptly",
    `Treat the download link as good for about ${COLLECT_WITHIN_DAYS} days. Save it, extract it, and confirm the CSVs and audio files open.`,
  ],
  [
    "Read the advertising audiences file first",
    "It is small, it opens in any spreadsheet, and it shows the inferences Amazon has drawn about your household.",
  ],
  [
    "Prune at the source, not just in the archive",
    "Delete Alexa recordings in Alexa privacy settings, clear browsing history in Your Account, and remove saved addresses and cards you no longer use.",
  ],
  [
    "Store it encrypted and delete it after",
    "The archive contains home addresses and voice recordings of your family. Keep it on encrypted storage and remove it once you have what you needed.",
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

/** Band label for a 20-100 sensitivity score. */
export function sensitivityBand(score) {
  if (!Number.isFinite(score)) return "—";
  if (score >= 85) return "Critical";
  if (score >= 70) return "High";
  if (score >= 55) return "Moderate";
  return "Low";
}

/**
 * Estimate an Amazon data request.
 *
 * Size model per category:
 *   baseMb
 * + mbPerYear * customerYears
 * + bytesPerOrder * (ordersPerYear * customerYears) / 1 MB
 * + bytesPerVoiceClip * (alexaPerDay * 365 * customerYears) / 1 MB
 *
 * Sensitivity score = 20 * (0.6 * highest + 0.4 * mean) of the 1-5 ratings, bounded
 * to 20-100 by construction.
 *
 * @returns {{error: string} | object} plain object; never NaN or Infinity.
 */
export function estimateExport({ selectedIds, customerYears, ordersPerYear, alexaPerDay }) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return { error: "Select at least one category to estimate an Amazon data request." };
  }

  const known = EXPORT_CATEGORIES.filter((category) => selectedIds.includes(category.id));
  if (known.length === 0) {
    return { error: "None of the selected items match an Amazon data category." };
  }

  const years = Number(customerYears);
  if (!Number.isFinite(years)) {
    return { error: "Enter how many years you have shopped on Amazon as a number." };
  }
  if (years <= 0) {
    return { error: "Years as a customer must be greater than zero." };
  }
  if (years > 30) {
    return { error: "Amazon opened in 1995, so more than 30 years as a customer is not possible." };
  }

  const orders = Number(ordersPerYear);
  if (!Number.isFinite(orders)) {
    return { error: "Enter your rough number of orders per year as a number." };
  }
  if (orders < 0) {
    return { error: "Orders per year cannot be negative." };
  }
  if (orders > 5000) {
    return { error: "More than 5,000 orders a year is outside the range this estimate handles." };
  }

  const voicePerDay = Number(alexaPerDay);
  if (!Number.isFinite(voicePerDay)) {
    return { error: "Enter your rough number of Alexa requests per day as a number." };
  }
  if (voicePerDay < 0) {
    return { error: "Alexa requests per day cannot be negative." };
  }
  if (voicePerDay > 500) {
    return { error: "More than 500 Alexa requests a day is outside the range this estimate handles." };
  }

  const totalOrders = orders * years;
  const totalVoiceClips = voicePerDay * DAYS_PER_YEAR * years;

  const rows = known.map((category) => {
    const sizeMb =
      category.baseMb +
      category.mbPerYear * years +
      (category.bytesPerOrder * totalOrders) / BYTES_PER_MB +
      (category.bytesPerVoiceClip * totalVoiceClips) / BYTES_PER_MB;
    return { ...category, sizeMb };
  });

  const totalMb = rows.reduce((sum, row) => sum + row.sizeMb, 0);

  const sensitivities = rows.map((row) => row.sensitivity);
  const highest = Math.max(...sensitivities);
  const mean = sensitivities.reduce((sum, value) => sum + value, 0) / sensitivities.length;
  const sensitivityScore = Math.round(20 * (0.6 * highest + 0.4 * mean));

  const sorted = [...rows].sort((a, b) => b.sizeMb - a.sizeMb);
  const includesVoice = selectedIds.includes("alexa");
  const voiceHours = includesVoice ? (totalVoiceClips * SECONDS_PER_VOICE_CLIP) / 3600 : 0;

  return {
    rows: sorted,
    count: rows.length,
    totalMb,
    totalLabel: formatSize(totalMb),
    totalOrders: Math.round(totalOrders),
    totalVoiceClips: Math.round(totalVoiceClips),
    voiceHours,
    includesVoice,
    largestLabel: sorted[0].label,
    sensitivityScore,
    band: sensitivityBand(sensitivityScore),
    criticalCategories: rows.filter((row) => row.sensitivity >= 5).map((row) => row.label),
    responseDays: RESPONSE_DAYS,
    confirmationRequired: true,
  };
}
