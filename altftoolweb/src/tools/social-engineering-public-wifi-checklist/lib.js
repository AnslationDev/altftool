/**
 * Public Wi-Fi Safety Checklist — residual-risk model.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * The model is deliberately built on what is still true in 2020s browsing, not
 * on 2010-era advice:
 *  - Nearly all traffic is HTTPS, and browsers mark plain HTTP as not secure, so
 *    passive sniffing of a login on the same network is no longer the main risk.
 *    That is why "use a VPN" is scored as a useful control, not the headline one.
 *  - What remains genuinely dangerous is anything that gets you to override a
 *    protection yourself: clicking through a certificate warning, entering real
 *    Google/Microsoft credentials into a captive portal, installing a
 *    "certificate" or app a portal demands, or joining an evil-twin hotspot that
 *    copies the venue's network name.
 *  - Device hygiene still matters: sharing left on, auto-join to open networks,
 *    and an OS that no longer gets patches.
 *
 * Weights are a relative impact ranking of those controls, and the output is a
 * residual-risk index (0-100), not a probability.
 */

export const MAX_INDEX = 100;

/**
 * Controls. `weight` is the risk you carry when the control is NOT in place.
 * `tier` groups them so the UI can show what matters most first.
 */
export const CONTROLS = [
  {
    id: "certWarning",
    label: "I never click through a certificate or 'connection is not private' warning",
    weight: 18,
    tier: "critical",
    why: "On a hostile network this warning is the interception. Accepting it hands over the session in clear text.",
    fix: "Close the tab. If a site only loads after you accept a warning, the network is the problem, not the site.",
  },
  {
    id: "noPortalInstall",
    label: "I never install an app, profile or certificate that a Wi-Fi portal asks for",
    weight: 15,
    tier: "critical",
    why: "Installing a root certificate lets the network decrypt your HTTPS traffic legitimately.",
    fix: "No genuine cafe or airport network needs software installed to give you internet access.",
  },
  {
    id: "hotspotForSensitive",
    label: "For banking, payments or admin work I use mobile data instead of the venue Wi-Fi",
    weight: 20,
    tier: "critical",
    why: "Mobile data removes the shared-network question entirely for the few minutes it matters.",
    fix: "Tether from your phone for the sensitive task, then switch back.",
  },
  {
    id: "portalCredentials",
    label: "I never sign in to a captive portal with my Google, Apple or work password",
    weight: 12,
    tier: "critical",
    why: "A cloned portal exists to harvest exactly those credentials; a real one asks at most for a room number or an OTP.",
    fix: "Use the room number, ticket number or SMS OTP path, or skip the network.",
  },
  {
    id: "verifyName",
    label: "I confirm the exact network name with staff before joining",
    weight: 12,
    tier: "high",
    why: "An evil twin copies the venue name with a small change and needs you to pick it from a list.",
    fix: "Ask at the counter. 'Airport_Free_WiFi' next to 'Airport Free WiFi' is the whole trick.",
  },
  {
    id: "twoFactor",
    label: "My important accounts have app-based or hardware two-factor turned on",
    weight: 12,
    tier: "high",
    why: "It is the control that makes a stolen password on any network far less useful.",
    fix: "Use an authenticator app or a security key rather than SMS where the option exists.",
  },
  {
    id: "sharingOff",
    label: "File and printer sharing is off and the network is marked Public",
    weight: 10,
    tier: "high",
    why: "Shared folders and AirDrop-style discovery are visible to everyone on the same segment.",
    fix: "Windows: mark the network Public. macOS: System Settings > General > Sharing, all off.",
  },
  {
    id: "updated",
    label: "The device is on a supported OS with updates applied",
    weight: 10,
    tier: "high",
    why: "Unpatched Wi-Fi and browser bugs are the part no user habit can compensate for.",
    fix: "Update before travelling, not on the airport network.",
  },
  {
    id: "vpnForWork",
    label: "I use a VPN when handling work data on a network I do not control",
    weight: 8,
    tier: "useful",
    why: "HTTPS already protects content; a VPN mainly hides which hosts you contact and covers any stray plain-HTTP traffic.",
    fix: "Use your employer's VPN. A random free VPN app just moves the trust to a stranger.",
  },
  {
    id: "autoJoinOff",
    label: "Auto-join for open networks is switched off",
    weight: 8,
    tier: "useful",
    why: "Auto-join lets a spoofed network attach your device without you choosing anything.",
    fix: "iOS: Settings > Wi-Fi > Ask to Join Networks. Android: turn off connect to open networks.",
  },
  {
    id: "forgetNetwork",
    label: "I forget the network when I leave",
    weight: 4,
    tier: "useful",
    why: "A remembered open SSID is one an attacker can impersonate anywhere else.",
    fix: "Forget it in the Wi-Fi settings once you are done.",
  },
];

const CONTROL_BY_ID = new Map(CONTROLS.map((control) => [control.id, control]));

/** Sum of every weight — the worst case before venue and activity scaling. */
export const MAX_RAW = CONTROLS.reduce((sum, control) => sum + control.weight, 0);

export const TIER_LABEL = {
  critical: "Non-negotiable",
  high: "High impact",
  useful: "Useful",
};

/** Where you are. Higher factor = less accountable network operator. */
export const VENUES = [
  { id: "cafe", label: "Cafe or restaurant", factor: 1, note: "Staffed, and the network name can be verified at the counter." },
  { id: "airport", label: "Airport or railway station", factor: 1.1, note: "High footfall, many lookalike SSIDs, nobody to ask." },
  { id: "hotel", label: "Hotel or guest house", factor: 1.15, note: "Long sessions, room-number portals, unmanaged guest equipment." },
  { id: "conference", label: "Conference or event venue", factor: 1.1, note: "Temporary kit, and everyone expects an unfamiliar portal." },
  { id: "transport", label: "Train, bus or flight Wi-Fi", factor: 1.05, note: "Operator-run, but portals are routinely spoofed on board." },
  { id: "openUnknown", label: "An open network with no obvious owner", factor: 1.3, note: "Nobody to verify the name with. Treat as hostile by default." },
];

/** What you plan to do. Higher factor = more to lose if something goes wrong. */
export const ACTIVITIES = [
  { id: "casual", label: "Casual browsing, maps, streaming", factor: 0.7 },
  { id: "personalMail", label: "Personal email and social accounts", factor: 1 },
  { id: "work", label: "Work email and documents", factor: 1.1 },
  { id: "banking", label: "Banking, payments or trading", factor: 1.3 },
  { id: "admin", label: "Admin access to systems or customer data", factor: 1.5 },
];

export const BANDS = [
  {
    id: "high",
    label: "High residual risk",
    tone: "danger",
    min: 45,
    advice: "Do the sensitive task on mobile data instead, and close the non-negotiable gaps before your next trip.",
  },
  {
    id: "moderate",
    label: "Moderate residual risk",
    tone: "warning",
    min: 25,
    advice: "The basics are partly in place. Fix the top-ranked gap below — most of the score sits in one or two items.",
  },
  {
    id: "low",
    label: "Low residual risk",
    tone: "warning",
    min: 10,
    advice: "Sensible setup. Tidy the remaining gaps when convenient.",
  },
  {
    id: "minimal",
    label: "Minimal residual risk",
    tone: "success",
    min: 0,
    advice: "Nothing meaningful left on this network. Keep verifying the network name and never override a certificate warning.",
  },
];

/** Facts the tool states rather than scoring, so the advice stays honest. */
export const CONTEXT_NOTES = [
  "HTTPS already encrypts the content of almost everything you do, so a stranger on the same Wi-Fi cannot simply read your email or passwords.",
  "What still works against you is anything that persuades you to override a protection: a certificate warning, a fake portal, or an app you were told to install.",
  "A VPN hides which sites you visit from the network operator. It does not protect you from a phishing page or a malicious download.",
];

const byId = (list, id) => list.find((item) => item.id === id);

/**
 * Score the habits in place for one network and one activity.
 *
 * @param {object} input
 * @param {string[]} input.inPlace  ids of controls the user already has in place
 * @param {string} input.venue      id from VENUES
 * @param {string} input.activity   id from ACTIVITIES
 * @returns {object} result, or { error }
 */
export function assessWifiRisk({ inPlace = [], venue, activity } = {}) {
  if (!Array.isArray(inPlace)) return { error: "Tick the habits you already follow." };

  const place = byId(VENUES, venue);
  const task = byId(ACTIVITIES, activity);
  if (!place) return { error: "Choose where you are connecting from." };
  if (!task) return { error: "Choose what you plan to do on this network." };

  if (inPlace.some((id) => !CONTROL_BY_ID.has(id))) {
    return { error: "One of the ticked habits is not on this checklist." };
  }

  const done = CONTROLS.filter((control) => inPlace.includes(control.id));
  const missing = CONTROLS.filter((control) => !inPlace.includes(control.id));

  const rawGap = missing.reduce((sum, control) => sum + control.weight, 0);
  const scaled = rawGap * place.factor * task.factor;
  const index = Math.min(MAX_INDEX, Math.round(scaled * 10) / 10);
  const band = BANDS.find((item) => index >= item.min) || BANDS[BANDS.length - 1];

  const coverage = MAX_RAW > 0 ? Math.round(((MAX_RAW - rawGap) / MAX_RAW) * 100) : 100;
  const ranked = [...missing].sort((a, b) => b.weight - a.weight);

  return {
    index,
    band,
    coverage,
    rawGap,
    maxRaw: MAX_RAW,
    venue: place,
    activity: task,
    multiplier: Math.round(place.factor * task.factor * 100) / 100,
    done,
    missing: ranked,
    topFixes: ranked.slice(0, 3),
    criticalGaps: ranked.filter((control) => control.tier === "critical"),
  };
}

/** Plain-text summary for the copy button. Pure. */
export function formatWifiResult(result) {
  if (!result || result.error) return "";
  const lines = [
    "Public Wi-Fi safety check",
    `Residual risk index: ${result.index}/${MAX_INDEX} — ${result.band.label}`,
    `Controls in place: ${result.done.length}/${CONTROLS.length} (${result.coverage}% by weight)`,
    `Setting: ${result.venue.label}, doing ${result.activity.label.toLowerCase()}`,
  ];
  if (result.missing.length > 0) {
    lines.push("", "Gaps, highest impact first:");
    result.missing.forEach((control) => lines.push(`- [${TIER_LABEL[control.tier]}] ${control.label}`));
  }
  lines.push("", result.band.advice);
  return lines.join("\n");
}
