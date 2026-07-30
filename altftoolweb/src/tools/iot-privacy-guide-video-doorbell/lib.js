/**
 * Video Doorbell Privacy Setup Guide — scoring and storage logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Menu names follow the settings trees used by the mainstream doorbell apps
 * (Ring: Device Settings > Privacy Settings / Motion Settings; Nest: Camera
 * settings > Activity zones; Eufy/Aqara: Device > Security > Local storage).
 * Follow the description rather than hunting for an exact label.
 */

/**
 * The checklist.
 *
 * weight   = share of the 100-point setup score. Weights are a risk ranking:
 *            controls that stop a stranger watching your door in real time or
 *            walking off with the footage carry the most; comfort and
 *            neighbour-relations items carry the least.
 * critical = a single missing control here is enough to expose live video or
 *            hand an account over, so it caps the score (CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "unique-password",
    group: "Account and access",
    title: "Use a unique password for the doorbell account",
    detail:
      "Camera accounts are a favourite target for credential stuffing: attackers replay username/password pairs leaked from unrelated sites. A password used nowhere else makes that attack impossible, whatever the other site leaks.",
    weight: 12,
    critical: true,
  },
  {
    id: "two-factor",
    group: "Account and access",
    title: "Turn on two-step verification (authenticator app if offered)",
    detail:
      "Ring made two-step verification mandatory in 2020 and most rivals now offer it. Prefer an authenticator app or passkey over SMS, because a SIM swap defeats SMS codes.",
    weight: 12,
    critical: true,
  },
  {
    id: "shared-users",
    group: "Account and access",
    title: "Review shared users and remove ex-housemates or old installers",
    detail:
      "Shared or guest users keep live-view rights until you delete them by name in the app. Installers and letting agents are the two most commonly forgotten entries.",
    weight: 8,
    critical: true,
  },
  {
    id: "authorised-devices",
    group: "Account and access",
    title: "Check the authorised device and session list",
    detail:
      "The app lists every phone and browser signed in to the account. A device you do not recognise means the password has leaked and needs changing before anything else on this list matters.",
    weight: 7,
    critical: true,
  },
  {
    id: "privacy-zones",
    group: "Camera framing and zones",
    title: "Mask the neighbour's door, windows and the public pavement",
    detail:
      "Privacy zones black out part of the sensor before recording, so masked areas never reach the cloud at all. Cover doorways and windows opposite, plus any pavement you do not need to see.",
    weight: 9,
    critical: false,
  },
  {
    id: "motion-zones",
    group: "Camera framing and zones",
    title: "Shrink motion zones to your own path and doorstep",
    detail:
      "A motion zone that reaches the road records every passer-by and floods the event history. Tightening it to your approach reduces both the recordings you hold and the alerts you ignore.",
    weight: 6,
    critical: false,
  },
  {
    id: "audio-off",
    group: "Camera framing and zones",
    title: "Decide deliberately whether audio recording stays on",
    detail:
      "Audio is treated far more strictly than video in most legal systems, and a doorbell mic can pick up conversation several metres beyond your boundary. Most apps let you disable audio capture while keeping video and two-way talk.",
    weight: 7,
    critical: false,
  },
  {
    id: "angle-tilt",
    group: "Camera framing and zones",
    title: "Angle or wedge-mount the camera down towards your own doorstep",
    detail:
      "A physical downward tilt is the only control an attacker cannot switch off from the app. A wedge bracket does more for your neighbours' privacy than any software zone.",
    weight: 5,
    critical: false,
  },
  {
    id: "local-storage",
    group: "Recordings and sharing",
    title: "Prefer local or end-to-end encrypted storage where the model supports it",
    detail:
      "Local SD/base-station recording keeps footage off a vendor's servers. Where only cloud storage exists, turn on end-to-end encryption if the brand offers it — it also disables server-side features such as person detection, so choose knowingly.",
    weight: 8,
    critical: false,
  },
  {
    id: "retention",
    group: "Recordings and sharing",
    title: "Set the shortest retention period you can live with",
    detail:
      "Cloud plans default to long retention (commonly 30-60 days). Data you no longer hold cannot be breached, subpoenaed or handed over, so shorten it to what you would actually review.",
    weight: 6,
    critical: false,
  },
  {
    id: "no-public-share",
    group: "Recordings and sharing",
    title: "Do not post doorbell clips of identifiable people publicly",
    detail:
      "Neighbourhood feeds and social posts turn a private recording into publication, which is where most doorbell disputes and complaints begin. Share the clip with the police directly instead.",
    weight: 5,
    critical: false,
  },
  {
    id: "police-requests",
    group: "Recordings and sharing",
    title: "Check the setting for law-enforcement and third-party requests",
    detail:
      "Some ecosystems let agencies request footage in-app. Whether requests come to you first, and whether you can decline, is a per-account setting worth reading rather than accepting by default.",
    weight: 4,
    critical: false,
  },
  {
    id: "firmware",
    group: "Network and neighbours",
    title: "Keep firmware and the app on automatic updates",
    detail:
      "Doorbell firmware has carried real remote-access bugs, and vendors ship silent fixes. Automatic updates are the cheapest control on this list.",
    weight: 6,
    critical: false,
  },
  {
    id: "iot-vlan",
    group: "Network and neighbours",
    title: "Put the doorbell on a guest network or IoT VLAN",
    detail:
      "Isolation stops a compromised camera from reaching your laptop, NAS or work machine. A guest Wi-Fi network with client isolation is the version of this that works on a normal home router.",
    weight: 4,
    critical: false,
  },
  {
    id: "signage",
    group: "Network and neighbours",
    title: "Put up a visible camera notice and talk to the neighbours",
    detail:
      "A small sign at the door is expected practice for a home camera that sees beyond your boundary, and in the UK the ICO treats notice plus a chat with the neighbours as the first step to staying on the right side of data protection rules.",
    weight: 1,
    critical: false,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Account and access",
  "Camera framing and zones",
  "Recordings and sharing",
  "Network and neighbours",
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint because most installs already have them. */
export const DEFAULT_DONE = ["unique-password", "firmware"];

/** Score bands, read top-down: the first band the score reaches wins. */
export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Live view is locked down and the footage you keep is minimal." },
  { id: "strong", min: 70, label: "Well configured", hint: "Solid. Close the framing and retention gaps when you can." },
  { id: "partial", min: 40, label: "Partly configured", hint: "A leaked password would still expose live video of your door." },
  { id: "at-risk", min: 0, label: "Exposed", hint: "Anyone with the password can watch your doorstep in real time." },
];

/**
 * A missing critical control caps the band at "Partly configured": framing and
 * retention settings cannot compensate for an account someone else can open.
 */
export const CRITICAL_CAP_PERCENT = 69;

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));

/** First band whose minimum the percent reaches. Percent clamped to 0..100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

function normalise(doneIds) {
  const seen = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && byId.has(raw)) seen.add(raw);
  }
  return seen;
}

/**
 * Score a set of completed control ids. Unknown ids and duplicates are ignored
 * so a stale saved list can never inflate the score.
 *
 * @param {string[]} doneIds ids from CHECKLIST the user has completed.
 * @returns {object} score summary, or { error } for unusable input.
 */
export function scoreChecklist(doneIds) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed steps must be provided as a list." };
  }
  if (!(TOTAL_WEIGHT > 0)) {
    return { error: "This checklist has no weighted steps to score." };
  }

  const done = normalise(doneIds);
  let points = 0;
  const missingCritical = [];
  const remaining = [];

  for (const item of CHECKLIST) {
    if (done.has(item.id)) {
      points += item.weight;
    } else {
      remaining.push(item);
      if (item.critical) missingCritical.push(item);
    }
  }

  const rawPercent = Math.round((points / TOTAL_WEIGHT) * 100);
  const capped = missingCritical.length > 0 && rawPercent > CRITICAL_CAP_PERCENT;
  const percent = capped ? CRITICAL_CAP_PERCENT : rawPercent;
  const band = bandFor(percent);

  const groups = GROUPS.map((name) => {
    const items = CHECKLIST.filter((item) => item.group === name);
    const doneCount = items.filter((item) => done.has(item.id)).length;
    return {
      name,
      done: doneCount,
      total: items.length,
      percent: items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0,
    };
  });

  const nextActions = remaining
    .slice()
    .sort((a, b) => Number(b.critical) - Number(a.critical) || b.weight - a.weight)
    .slice(0, 3);

  return {
    points,
    maxPoints: TOTAL_WEIGHT,
    rawPercent,
    percent,
    capped,
    completed: done.size,
    total: CHECKLIST.length,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    missingCritical,
    remaining,
    groups,
    nextActions,
  };
}

/**
 * Typical H.264 video bitrates for consumer doorbells, in megabits per second.
 * These are the vendor-published streaming rates for each resolution class;
 * a doorbell facing a busy street encodes nearer the top of its range.
 */
export const RESOLUTIONS = [
  { id: "720p", label: "720p HD", mbps: 1.2 },
  { id: "1080p", label: "1080p Full HD", mbps: 2.0 },
  { id: "2k", label: "2K / 1536p", mbps: 4.0 },
  { id: "4k", label: "4K UHD", mbps: 8.0 },
];

/** 1 byte = 8 bits. Used to turn a bitrate into a file size. */
const BITS_PER_BYTE = 8;
/** Storage is sold in decimal gigabytes: 1 GB = 1000 MB. */
const MB_PER_GB = 1000;
/** Cap on the projection so an absurd card size cannot print a silly number. */
const MAX_PROJECTION_DAYS = 3650;

/**
 * How long recordings survive before the card or plan overwrites them.
 *
 * daily MB = events x seconds x mbps / 8
 * days     = usable MB / daily MB
 *
 * @param {object} input
 * @param {string} input.resolutionId one of RESOLUTIONS[].id
 * @param {number} input.eventsPerDay motion or ring events recorded per day
 * @param {number} input.secondsPerEvent clip length in seconds
 * @param {number} input.storageGb card or included cloud storage, in GB
 * @param {number} [input.retentionDays] plan retention cap in days, 0 = none
 * @returns {object} storage projection, or { error }
 */
export function estimateFootageStorage({
  resolutionId,
  eventsPerDay,
  secondsPerEvent,
  storageGb,
  retentionDays = 0,
} = {}) {
  const resolution = RESOLUTIONS.find((entry) => entry.id === resolutionId);
  if (!resolution) {
    return { error: "Choose one of the listed recording resolutions." };
  }

  const events = Number(eventsPerDay);
  const seconds = Number(secondsPerEvent);
  const gb = Number(storageGb);
  const cap = Number(retentionDays);

  if (![events, seconds, gb, cap].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for events, clip length and storage." };
  }
  if (events <= 0) return { error: "Enter at least one recorded event per day." };
  if (seconds <= 0) return { error: "Clip length must be more than zero seconds." };
  if (gb <= 0) return { error: "Enter the storage size in GB — it must be above zero." };
  if (cap < 0) return { error: "Retention days cannot be negative." };
  if (events > 5000) return { error: "More than 5000 events a day means the motion zone needs shrinking, not more storage." };
  if (seconds > 600) return { error: "Clip length above 600 seconds is longer than any doorbell records." };

  const mbPerEvent = (resolution.mbps * seconds) / BITS_PER_BYTE;
  const mbPerDay = mbPerEvent * events;
  const usableMb = gb * MB_PER_GB;
  const rawDays = usableMb / mbPerDay;
  const daysUntilOverwrite = Math.min(MAX_PROJECTION_DAYS, rawDays);

  const capApplies = cap > 0 && cap < daysUntilOverwrite;
  const effectiveDays = capApplies ? cap : daysUntilOverwrite;

  return {
    resolutionLabel: resolution.label,
    mbps: resolution.mbps,
    mbPerEvent,
    mbPerDay,
    gbPerMonth: (mbPerDay * 30) / MB_PER_GB,
    daysUntilOverwrite,
    effectiveDays,
    capApplies,
    clipsHeld: Math.floor(effectiveDays * events),
    limitedBy: capApplies ? "retention setting" : "storage size",
  };
}
