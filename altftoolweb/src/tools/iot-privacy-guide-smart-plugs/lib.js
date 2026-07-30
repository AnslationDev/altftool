/**
 * Smart Plug and Bulb Security Guide — checklist scoring, a segmentation
 * planner for cheap IoT devices, and IPv4 subnet sizing for the IoT network.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 */

/**
 * The checklist.
 *
 * weight   = share of the 100-point score. Cheap plugs and bulbs rarely hold
 *            interesting data themselves; the risk is that they are a weak
 *            device sitting on the same network as everything else, and that
 *            they stop working when a vendor switches off a server. Weights
 *            follow that: isolation and account protection first.
 * critical = on its own enough to expose the rest of your network or your
 *            accounts, so it caps the score (CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "separate-network",
    group: "Network segmentation",
    title: "Put every plug and bulb on a separate IoT or guest network",
    detail:
      "Budget devices get few firmware updates and are the usual foothold. A separate SSID keeps them away from laptops, phones and network storage even after one is compromised.",
    weight: 13,
    critical: true,
  },
  {
    id: "client-isolation",
    group: "Network segmentation",
    title: "Turn on client isolation (AP isolation) for that network",
    detail:
      "Without it, devices on the guest network can still reach each other, so one compromised bulb can attack the plug next to it. The setting is usually a single checkbox on the guest SSID.",
    weight: 8,
    critical: false,
  },
  {
    id: "no-upnp",
    group: "Network segmentation",
    title: "Disable UPnP on the router",
    detail:
      "UPnP lets any device on the LAN open a port to the internet without asking you. Cheap IoT firmware uses it liberally, which is how devices end up publicly reachable.",
    weight: 10,
    critical: true,
  },
  {
    id: "block-outbound",
    group: "Network segmentation",
    title: "Block or restrict outbound internet for devices that do not need it",
    detail:
      "A lamp does not need to talk to the whole internet. On a router that supports firewall rules, denying outbound access to locally controlled devices removes their telemetry and their remote-attack surface at once.",
    weight: 7,
    critical: false,
  },
  {
    id: "unique-password",
    group: "Accounts and apps",
    title: "Use a unique password on each vendor account",
    detail:
      "Budget brands ship with the same login across dozens of rebadged products. A password used nowhere else means one vendor breach cannot reach anything you care about.",
    weight: 10,
    critical: true,
  },
  {
    id: "two-factor",
    group: "Accounts and apps",
    title: "Enable two-factor authentication where the app supports it",
    detail:
      "Where the account can switch devices on and off remotely, treat it like any other remote-control account. If the vendor has no second factor at all, weigh that against the price.",
    weight: 8,
    critical: false,
  },
  {
    id: "app-permissions",
    group: "Accounts and apps",
    title: "Cut the phone app's permissions to what it needs",
    detail:
      "Smart-home apps frequently request location, contacts and background activity that setup does not need. Precise location is only required while pairing on some platforms; revoke it afterwards.",
    weight: 6,
    critical: false,
  },
  {
    id: "remove-unused",
    group: "Accounts and apps",
    title: "Delete accounts and unlink integrations you stopped using",
    detail:
      "Every linked assistant and automation service keeps a token that can operate your devices. Cutting the list down shrinks the number of companies that can switch your lights on.",
    weight: 5,
    critical: false,
  },
  {
    id: "prefer-local",
    group: "Local control",
    title: "Prefer Matter, Zigbee, Z-Wave or local firmware over cloud-only Wi-Fi",
    detail:
      "Locally controlled devices keep working when the internet or the vendor is down, and they do not report every switch-on to a server. Matter in particular is designed for local control by default.",
    weight: 9,
    critical: false,
  },
  {
    id: "local-hub",
    group: "Local control",
    title: "Run automations on a local hub, not in someone else's cloud",
    detail:
      "A local controller keeps schedules and away-mode routines working during an outage, and keeps your occupancy pattern inside the house.",
    weight: 6,
    critical: false,
  },
  {
    id: "no-cloud-schedule",
    group: "Local control",
    title: "Keep away-mode and holiday schedules off cloud services",
    detail:
      "A plug schedule is a statement about when the house is empty. Where the routine has to live in the cloud, avoid naming it after the holiday.",
    weight: 4,
    critical: false,
  },
  {
    id: "firmware",
    group: "Devices and lifecycle",
    title: "Update firmware and check the model is still supported",
    detail:
      "Budget devices lose support quickly. If the app has not offered an update in a year, treat the device as unpatched and plan its replacement.",
    weight: 7,
    critical: false,
  },
  {
    id: "check-eol",
    group: "Devices and lifecycle",
    title: "Know what happens if the vendor's servers go away",
    detail:
      "Cloud-only devices have been bricked by companies shutting services down. Before buying more of the same brand, check whether they keep working on the local network alone.",
    weight: 4,
    critical: false,
  },
  {
    id: "reset-on-disposal",
    group: "Devices and lifecycle",
    title: "Factory reset before you resell, lend or bin a device",
    detail:
      "Plugs and bulbs store the Wi-Fi passphrase in flash. A reset clears it; throwing the device away without one hands over your network password.",
    weight: 3,
    critical: false,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Network segmentation",
  "Accounts and apps",
  "Local control",
  "Devices and lifecycle",
];

/** Sum of all weights. Authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint because most homes already have them. */
export const DEFAULT_DONE = ["unique-password", "firmware"];

/** Score bands, read top-down: the first band the score reaches wins. */
export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Cheap devices are fenced off and keep working without the cloud." },
  { id: "strong", min: 70, label: "Well configured", hint: "Solid. Tighten outbound rules and local control next." },
  { id: "partial", min: 40, label: "Partly configured", hint: "One weak device still shares a network with your laptop." },
  { id: "at-risk", min: 0, label: "Exposed", hint: "An unpatched bulb is one hop from everything you own." },
];

/** A missing critical control caps the band at "Partly configured". */
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
 * What your router can actually do, and the isolation each tier is worth out of
 * the 100-point segmentation score.
 */
export const ROUTER_TIERS = [
  {
    id: "vlan",
    label: "Router or access point supports VLANs and multiple SSIDs",
    isolation: 40,
    plan: "Create a dedicated IoT VLAN with its own SSID, then allow only the traffic your controller needs from the main network into it.",
  },
  {
    id: "guest-isolated",
    label: "Guest network with client isolation",
    isolation: 28,
    plan: "Put every plug and bulb on the guest SSID with client isolation on. Control them through the vendor cloud or a hub that has a foot in both networks.",
  },
  {
    id: "guest-basic",
    label: "Guest network, but no client isolation",
    isolation: 15,
    plan: "Use the guest SSID anyway — it still separates IoT devices from your laptops — and ask the vendor whether an isolation option exists in a newer firmware.",
  },
  {
    id: "single",
    label: "One network for everything",
    isolation: 0,
    plan: "A second-hand router used as an access point behind the main one gives you a separate network for about the price of a smart plug.",
  },
];

/**
 * Control protocol, whether the device still works with the internet down, and
 * what that is worth in the segmentation score.
 */
export const PROTOCOLS = [
  {
    id: "cloud-wifi",
    label: "Wi-Fi devices that need the vendor app and cloud",
    localControl: false,
    bonus: 0,
    note: "Every switch-on goes through a server, and the device stops responding if that server does.",
  },
  {
    id: "matter",
    label: "Matter over Wi-Fi or Thread with a local controller",
    localControl: true,
    bonus: 15,
    note: "Matter is designed for local control: commands stay on the LAN and keep working during an outage.",
  },
  {
    id: "zigbee",
    label: "Zigbee or Z-Wave through a hub you own",
    localControl: true,
    bonus: 20,
    note: "The devices are not on Wi-Fi at all, so only the hub needs a network address.",
  },
  {
    id: "local-firmware",
    label: "Local firmware such as Tasmota or ESPHome, no vendor account",
    localControl: true,
    bonus: 25,
    note: "No cloud account exists to breach, and the device can be firewalled off the internet entirely.",
  },
];

/** Extra router-level controls, and what each adds to the segmentation score. */
export const SEGMENTATION_EXTRAS = [
  { id: "block-outbound", label: "Outbound internet blocked for locally controlled devices", value: 15 },
  { id: "upnp-off", label: "UPnP disabled on the router", value: 10 },
  { id: "distinct-passphrase", label: "IoT network uses its own passphrase", value: 5 },
];

/** Segmentation bands. Read top-down: the first band the score reaches wins. */
export const SEGMENTATION_BANDS = [
  { id: "segmented", min: 80, label: "Properly segmented", hint: "A compromised bulb reaches nothing that matters." },
  { id: "good", min: 55, label: "Reasonably separated", hint: "The main network is protected; tighten outbound rules next." },
  { id: "thin", min: 30, label: "Thinly separated", hint: "Some separation exists, but devices can still see each other." },
  { id: "flat", min: 0, label: "Flat network", hint: "Every device shares one network with your laptop and phone." },
];

const tierById = new Map(ROUTER_TIERS.map((entry) => [entry.id, entry]));
const protocolById = new Map(PROTOCOLS.map((entry) => [entry.id, entry]));
const extraById = new Map(SEGMENTATION_EXTRAS.map((entry) => [entry.id, entry]));

const MAX_SEGMENTATION_SCORE = 100;

/**
 * Segmentation score and a plan for the router you actually own.
 *
 * score = router tier isolation + protocol bonus + selected extras, capped at 100
 *
 * @param {object} input
 * @param {string} input.tierId one of ROUTER_TIERS[].id
 * @param {string} input.protocolId one of PROTOCOLS[].id
 * @param {string[]} [input.extraIds] ids from SEGMENTATION_EXTRAS in place
 * @returns {object} segmentation report, or { error }
 */
export function planSegmentation({ tierId, protocolId, extraIds = [] } = {}) {
  const tier = tierById.get(tierId);
  if (!tier) return { error: "Choose what your router can do." };
  const protocol = protocolById.get(protocolId);
  if (!protocol) return { error: "Choose how your devices are controlled." };
  if (!Array.isArray(extraIds)) {
    return { error: "Extra controls must be provided as a list." };
  }

  const applied = [];
  const seen = new Set();
  for (const raw of extraIds) {
    if (typeof raw === "string" && extraById.has(raw) && !seen.has(raw)) {
      seen.add(raw);
      applied.push(extraById.get(raw));
    }
  }

  const extraPoints = applied.reduce((sum, entry) => sum + entry.value, 0);
  const score = Math.min(MAX_SEGMENTATION_SCORE, tier.isolation + protocol.bonus + extraPoints);
  const band =
    SEGMENTATION_BANDS.find((entry) => score >= entry.min) ||
    SEGMENTATION_BANDS[SEGMENTATION_BANDS.length - 1];

  const missing = SEGMENTATION_EXTRAS.filter((entry) => !seen.has(entry.id));

  return {
    tierLabel: tier.label,
    protocolLabel: protocol.label,
    plan: tier.plan,
    protocolNote: protocol.note,
    worksOffline: protocol.localControl,
    isolationPoints: tier.isolation,
    protocolPoints: protocol.bonus,
    extraPoints,
    appliedExtras: applied,
    missingExtras: missing,
    score,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
  };
}

/** Two IPv4 addresses per subnet are unusable: the network and the broadcast. */
const RESERVED_ADDRESSES = 2;
/** A /30 is the smallest useful subnet; a /16 is the largest a home should need. */
const SMALLEST_PREFIX = 30;
const LARGEST_PREFIX = 16;

/** Usable host addresses in an IPv4 subnet of the given prefix length. */
export function usableHosts(prefix) {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return 0;
  if (prefix >= 31) return 0; // /31 and /32 have no usable host range in normal use
  return Math.pow(2, 32 - prefix) - RESERVED_ADDRESSES;
}

/**
 * Smallest IoT subnet that fits the devices you have plus room to grow.
 *
 * needed = ceil(devices x (1 + headroom/100))
 * prefix = the largest prefix (smallest subnet) whose usable hosts >= needed
 *
 * @param {object} input
 * @param {number} input.deviceCount smart plugs, bulbs and hubs on the network
 * @param {number} [input.headroomPercent] spare capacity to allow for, 0-500
 * @returns {object} subnet plan, or { error }
 */
export function planIotSubnet({ deviceCount, headroomPercent = 50 } = {}) {
  const devices = Number(deviceCount);
  const headroom = Number(headroomPercent);

  if (!Number.isFinite(devices) || !Number.isFinite(headroom)) {
    return { error: "Enter the device count and headroom as numbers." };
  }
  if (!Number.isInteger(devices)) {
    return { error: "Device count must be a whole number." };
  }
  if (devices < 1) return { error: "Enter at least one device." };
  if (devices > 2000) {
    return { error: "Above 2000 devices this is no longer a home network — plan it properly." };
  }
  if (headroom < 0 || headroom > 500) {
    return { error: "Headroom should be between 0% and 500%." };
  }

  const needed = Math.ceil(devices * (1 + headroom / 100));

  let prefix = null;
  for (let candidate = SMALLEST_PREFIX; candidate >= LARGEST_PREFIX; candidate -= 1) {
    if (usableHosts(candidate) >= needed) {
      prefix = candidate;
      break;
    }
  }
  if (prefix === null) {
    return { error: "That many devices needs a network larger than a /16 — split it up instead." };
  }

  const hosts = usableHosts(prefix);
  const blockSize = Math.pow(2, 32 - prefix);

  // A worked example inside RFC 1918 space, aligned to a real subnet boundary:
  // subnets shorter than /24 must start on a multiple of their third-octet block.
  const thirdOctetBlock = prefix >= 24 ? 1 : Math.pow(2, 24 - prefix);
  const thirdOctet = Math.floor(30 / thirdOctetBlock) * thirdOctetBlock;

  return {
    devices,
    needed,
    prefix,
    usableHosts: hosts,
    spare: hosts - needed,
    blockSize,
    example: `192.168.${thirdOctet}.0/${prefix}`,
    dhcpAdvice:
      prefix >= 24
        ? "Reserve the first few addresses for the hub and access point, then let DHCP hand out the rest."
        : "Split the range: static addresses for hubs and controllers, a DHCP pool for everything else.",
  };
}
