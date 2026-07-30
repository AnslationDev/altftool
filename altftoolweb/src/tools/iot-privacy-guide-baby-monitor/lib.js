/**
 * Baby Monitor Security Checklist — checklist scoring plus an exposure model
 * that turns the monitor's connection type and a handful of settings into who
 * can actually reach the camera: the internet, the street, or nobody.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 */

/**
 * The checklist.
 *
 * weight   = share of the 100-point score, ranked by consequence. Anything that
 *            leaves the camera reachable by a stranger outranks convenience.
 * critical = on its own enough to expose a live feed of a child's room, so it
 *            caps the score (CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "default-password",
    group: "Credentials",
    title: "Change the default camera password before anything else",
    detail:
      "Default admin credentials are published per model and are the single most common way baby cameras are taken over. Change it during setup, not later.",
    weight: 13,
    critical: true,
  },
  {
    id: "unique-password",
    group: "Credentials",
    title: "Use a password that appears on no other account",
    detail:
      "Camera apps are a standard credential-stuffing target: leaked pairs from unrelated sites are replayed automatically. A unique password removes that path entirely.",
    weight: 10,
    critical: true,
  },
  {
    id: "two-factor",
    group: "Credentials",
    title: "Turn on two-factor authentication on the vendor account",
    detail:
      "If the account can open a live view from anywhere, a stolen password should not be enough. Prefer an authenticator app over SMS codes.",
    weight: 10,
    critical: true,
  },
  {
    id: "shared-access",
    group: "Credentials",
    title: "Review who else has app access",
    detail:
      "Grandparents, a former nanny, a babysitter from last year — shared accounts keep working until removed by name. Check the list rather than assuming.",
    weight: 6,
    critical: false,
  },
  {
    id: "no-port-forward",
    group: "Network exposure",
    title: "Do not port-forward the camera, and turn UPnP off on the router",
    detail:
      "A forwarded port puts the camera directly on the internet where device search engines index it within hours. UPnP lets the camera open that hole by itself, which is why it should be off at the router.",
    weight: 12,
    critical: true,
  },
  {
    id: "wpa2-wifi",
    group: "Network exposure",
    title: "Run the Wi-Fi on WPA2 or WPA3 with a strong passphrase",
    detail:
      "The camera is only as private as the network carrying it. WEP and open networks put the video stream within reach of anyone parked outside.",
    weight: 8,
    critical: false,
  },
  {
    id: "guest-vlan",
    group: "Network exposure",
    title: "Put the camera on a guest network or IoT VLAN",
    detail:
      "Isolation stops a compromised camera reaching your laptop, and stops a compromised laptop reaching the camera. Guest Wi-Fi with client isolation is the home-router version.",
    weight: 6,
    critical: false,
  },
  {
    id: "remote-off",
    group: "Network exposure",
    title: "Turn remote viewing off if you only watch from the next room",
    detail:
      "Remote access is the feature that converts a local camera into an internet-facing one. If you never use it away from home, switching it off removes the whole class of risk.",
    weight: 6,
    critical: false,
  },
  {
    id: "firmware",
    group: "Device settings",
    title: "Update firmware and enable automatic updates",
    detail:
      "Baby cameras have carried authentication-bypass and cloud-relay bugs that were fixed silently. An unpatched camera stays vulnerable for as long as it is plugged in.",
    weight: 8,
    critical: false,
  },
  {
    id: "unused-services",
    group: "Device settings",
    title: "Disable unused services: Telnet, FTP, ONVIF, cloud relay",
    detail:
      "Cheap cameras ship with extra services listening. Anything you do not use is an unmonitored way in — switch it off in the web interface.",
    weight: 5,
    critical: false,
  },
  {
    id: "audit-log",
    group: "Device settings",
    title: "Check the access or login log for sessions you did not start",
    detail:
      "An unexpected viewer session or a login from another country is the clearest evidence of a takeover, and often the only signal before someone speaks through the camera.",
    weight: 4,
    critical: false,
  },
  {
    id: "camera-placement",
    group: "Placement and habits",
    title: "Point the camera at the cot, not the whole room",
    detail:
      "Framing tightly limits what a leaked stream shows, and keeps changing, bathing and adult routines out of frame entirely.",
    weight: 4,
    critical: false,
  },
  {
    id: "cable-distance",
    group: "Placement and habits",
    title: "Keep the monitor and its cable well out of the cot",
    detail:
      "Cords are a strangulation hazard: safety guidance is to keep any cable at least one metre from the cot. This is the risk most likely to actually harm a baby.",
    weight: 4,
    critical: false,
  },
  {
    id: "no-public-posts",
    group: "Placement and habits",
    title: "Never post monitor screenshots or the model name publicly",
    detail:
      "A screenshot shows the interface and often the model, which tells someone exactly which default credentials and known bugs to try.",
    weight: 2,
    critical: false,
  },
  {
    id: "decommission",
    group: "Placement and habits",
    title: "Factory reset and unlink the camera when you stop using it",
    detail:
      "Resetting clears Wi-Fi credentials and the account binding. Cameras handed on to friends or sold on are a routine source of live feeds from other people's homes.",
    weight: 2,
    critical: false,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = ["Credentials", "Network exposure", "Device settings", "Placement and habits"];

/** Sum of all weights. Authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint because most setups already have them. */
export const DEFAULT_DONE = ["default-password", "wpa2-wifi"];

/** Score bands, read top-down: the first band the score reaches wins. */
export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Nobody outside the house can reach this camera." },
  { id: "strong", min: 70, label: "Well secured", hint: "Solid. Close the network and firmware gaps next." },
  { id: "partial", min: 40, label: "Partly secured", hint: "One leaked or default credential still opens the feed." },
  { id: "at-risk", min: 0, label: "At risk", hint: "There is an open route to a live view of a child's room." },
];

/** A missing critical control caps the band at "Partly secured". */
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
 * Score a set of completed control ids. Unknown ids and duplicates are ignored.
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
 * Monitor types, with the base exposure each one carries before settings.
 *
 * `base` is a 0-100 ranking of inherent reach, not a probability: a dedicated
 * radio monitor can only be intercepted from nearby, while an internet-reachable
 * camera can be found by anyone scanning the whole address space.
 * `reach` describes who is in a position to try at all.
 */
export const MONITOR_TYPES = [
  {
    id: "dect",
    label: "DECT or FHSS audio-only monitor (no Wi-Fi)",
    base: 10,
    reach: "Someone within radio range, roughly 50-300 m, with specialist equipment",
    note: "DECT monitors use digital, encrypted, frequency-hopping links and never touch your network or the internet.",
  },
  {
    id: "analogue",
    label: "Analogue 2.4 GHz video monitor (older, unencrypted)",
    base: 45,
    reach: "Anyone within about 100 m holding a compatible receiver",
    note: "Analogue video is broadcast in the clear, so a matching receiver in the street sees the picture with no attack at all.",
  },
  {
    id: "wifi-local",
    label: "Wi-Fi camera, local viewing only (no cloud, no remote access)",
    base: 25,
    reach: "Anyone already on your home Wi-Fi",
    note: "Keeping the stream on the LAN means an attacker has to get onto your network first.",
  },
  {
    id: "wifi-cloud",
    label: "Wi-Fi camera with vendor cloud or P2P remote viewing",
    base: 60,
    reach: "Anyone on the internet who obtains or guesses the account credentials",
    note: "P2P relay services keep the camera reachable without any router change, which is convenient for you and for everyone else.",
  },
  {
    id: "wifi-forwarded",
    label: "Wi-Fi camera reachable through a forwarded port or UPnP",
    base: 85,
    reach: "Anyone on the internet, including automated scanners that index cameras by the hour",
    note: "A forwarded port is a public address; device search engines list such cameras continuously.",
  },
];

/**
 * Settings that raise or lower the exposure score, applied on top of the base.
 * Positive deltas are open doors; negative deltas are controls that close one.
 */
export const RISK_FACTORS = [
  { id: "default-creds", label: "Camera still has its factory password", delta: 25 },
  { id: "no-updates", label: "Firmware has never been updated", delta: 12 },
  { id: "upnp-on", label: "UPnP is enabled on the router", delta: 10 },
  { id: "weak-wifi", label: "Wi-Fi uses WEP, or the network is open", delta: 10 },
  { id: "remote-on", label: "Remote viewing is switched on", delta: 8 },
  { id: "shared-account", label: "The login is shared with several people", delta: 6 },
  { id: "two-factor", label: "Two-factor authentication is on the account", delta: -12 },
  { id: "isolated", label: "Camera sits on a guest network or IoT VLAN", delta: -8 },
  { id: "audio-only", label: "Audio only — there is no camera", delta: -6 },
];

/** Exposure bands. Read top-down: the first band the score reaches wins. */
export const EXPOSURE_BANDS = [
  { id: "severe", min: 75, label: "Severe exposure", hint: "Treat this as a public camera until it is changed." },
  { id: "high", min: 50, label: "High exposure", hint: "A stranger could plausibly reach this feed today." },
  { id: "moderate", min: 25, label: "Moderate exposure", hint: "An attacker needs to be close by or already inside your network." },
  { id: "low", min: 0, label: "Low exposure", hint: "There is no practical route in from outside the house." },
];

const typeById = new Map(MONITOR_TYPES.map((entry) => [entry.id, entry]));
const factorById = new Map(RISK_FACTORS.map((entry) => [entry.id, entry]));

/** Scores are a 0-100 ranking, so the sum is clamped at both ends. */
const MIN_SCORE = 0;
const MAX_SCORE = 100;

/**
 * Exposure of the monitor as configured.
 *
 * score = clamp(base for the monitor type + sum of the selected factor deltas)
 *
 * @param {object} input
 * @param {string} input.typeId one of MONITOR_TYPES[].id
 * @param {string[]} input.factorIds ids from RISK_FACTORS that apply
 * @returns {object} exposure report, or { error }
 */
export function assessExposure({ typeId, factorIds = [] } = {}) {
  const type = typeById.get(typeId);
  if (!type) return { error: "Choose the kind of baby monitor you have." };
  if (!Array.isArray(factorIds)) {
    return { error: "Selected settings must be provided as a list." };
  }

  const applied = [];
  const seen = new Set();
  for (const raw of factorIds) {
    if (typeof raw === "string" && factorById.has(raw) && !seen.has(raw)) {
      seen.add(raw);
      applied.push(factorById.get(raw));
    }
  }

  const delta = applied.reduce((sum, entry) => sum + entry.delta, 0);
  const score = Math.min(MAX_SCORE, Math.max(MIN_SCORE, type.base + delta));
  const band = EXPOSURE_BANDS.find((entry) => score >= entry.min) || EXPOSURE_BANDS[EXPOSURE_BANDS.length - 1];

  const raising = applied.filter((entry) => entry.delta > 0).sort((a, b) => b.delta - a.delta);
  const lowering = applied.filter((entry) => entry.delta < 0).sort((a, b) => a.delta - b.delta);
  const available = RISK_FACTORS.filter((entry) => entry.delta < 0 && !seen.has(entry.id));

  return {
    typeLabel: type.label,
    base: type.base,
    reach: type.reach,
    note: type.note,
    delta,
    score,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    raising,
    lowering,
    // Fixing the biggest positive delta first is always the fastest drop.
    biggestFix: raising[0] || null,
    availableControls: available,
  };
}
