/**
 * Xiaomi Router Hardening Checklist — scoring and WPA passphrase maths.
 *
 * Pure module: no React, no DOM, no clock reads. Same input, same output.
 * Every exported function is total — unusable input returns { error } rather
 * than NaN, Infinity or a number that looks like an answer.
 */

/** Where the settings live on a current Mi / Redmi router. */
export const DEVICE = {
  vendor: "Xiaomi",
  adminUrl: "http://miwifi.com",
  gateways: ["192.168.31.1"],
  app: "Mi Home / Xiaomi Home (older units: Mi Wi-Fi)",
  cloudAccount: "Mi Account",
  note:
    "Mi and Redmi routers use 192.168.31.1 rather than the 192.168.1.1 most other brands use, and answer on miwifi.com from a browser on the same Wi-Fi. Setup does not ship a fixed admin password — it asks you to create one, and offers a tick box that reuses your Wi-Fi password as the admin password. Menu wording differs between the web UI, the Mi Wi-Fi app and the Xiaomi Home app.",
};

/** Exposure axes. A profile re-weights these, not individual controls. */
export const AXES = [
  "Admin access",
  "Wi-Fi encryption",
  "Cloud and app exposure",
  "Internet exposure",
  "Connected devices",
  "Firmware upkeep",
];

export const GROUPS = [
  "Admin password",
  "Wi-Fi",
  "Mi Account, app and plug-ins",
  "Facing the internet",
  "Devices on your LAN",
  "Firmware and lifecycle",
];

/**
 * A missing critical control leaves a hole nothing else compensates for, so the
 * score is held at this ceiling until every critical item is done.
 */
export const CRITICAL_CAP_PERCENT = 60;

/**
 * The checklist.
 *
 * weight = share of the total points, ranked by how much real exposure the
 * control removes on a consumer router, not by how hard it is to do.
 */
export const CHECKLIST = [
  {
    id: "admin-password-set",
    group: "Admin password",
    axis: "Admin access",
    title: "Set an admin password you chose, not the installer's",
    detail:
      "Mi routers ask for an admin password during setup, but a technician setting up a building often types the same one into every flat. Anyone already on the Wi-Fi can open the admin page and try it.",
    path: "miwifi.com > Settings > System status (or Common settings) > Modify admin password",
    risk: "A neighbour or a compromised laptop takes over the router, changes DNS and quietly redirects your banking traffic.",
    weight: 8,
    critical: true,
  },
  {
    id: "admin-not-wifi-password",
    group: "Admin password",
    axis: "Admin access",
    title: "Untick 'use the Wi-Fi password as the admin password'",
    detail:
      "Xiaomi's setup wizard offers to make the two the same. That is convenient and wrong: every guest you hand the Wi-Fi password to is also being handed the router's admin login.",
    path: "Settings > Wi-Fi settings — clear the option that links the two, then set a separate admin password",
    risk: "Anyone who has ever joined your Wi-Fi can log into the router and read or change every setting.",
    weight: 6,
    critical: true,
  },
  {
    id: "admin-password-unique",
    group: "Admin password",
    axis: "Admin access",
    title: "Use a password not reused anywhere else",
    detail:
      "Router passwords are typed rarely and reused often. Reusing your email or Mi Account password means one breach dump hands over the router too.",
    path: "Store it in a password manager, not on a sticky note under the router",
    risk: "A password leaked from an unrelated site is tried against your router and works first time.",
    weight: 3,
    critical: false,
  },
  {
    id: "wpa-mode",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Set encryption to WPA2-PSK (AES) or WPA2/WPA3 mixed",
    detail:
      "WEP and WPA-TKIP are broken and recoverable from captured traffic. WPA3-Personal is strongest but drops older phones and smart plugs, so mixed mode with AES is the practical household setting.",
    path: "Settings > Wi-Fi settings > Encryption",
    risk: "Someone within radio range decrypts your traffic or joins the network without ever learning the passphrase.",
    weight: 7,
    critical: true,
  },
  {
    id: "wifi-passphrase",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Use a long Wi-Fi passphrase, not a phone number",
    detail:
      "A WPA2 handshake can be captured in seconds and then attacked offline at full GPU speed, so length is the only defence that matters. The checker below shows how long a given passphrase survives.",
    path: "Settings > Wi-Fi settings > Wi-Fi password",
    risk: "A captured handshake is cracked overnight and your network is joined at will.",
    weight: 6,
    critical: true,
  },
  {
    id: "ssid-not-default",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Rename the SSID away from Xiaomi_XXXX or Redmi_XXXX",
    detail:
      "A default SSID announces the vendor and often narrows down the model, which tells an attacker which published bug to try first. Do not put your flat number or surname in the replacement.",
    path: "Settings > Wi-Fi settings > Network name",
    risk: "Your router brand and rough model are advertised to the whole street.",
    weight: 2,
    critical: false,
  },
  {
    id: "guest-wifi",
    group: "Wi-Fi",
    axis: "Connected devices",
    title: "Put visitors on Guest Wi-Fi with its own password",
    detail:
      "Guest Wi-Fi on Mi routers has a separate password and keeps visitors away from your local devices, so nobody needs the main passphrase for an afternoon of use.",
    path: "Settings > Wi-Fi settings > Guest Wi-Fi",
    risk: "A visitor's malware-carrying phone scans your file shares, printer and cameras from inside the LAN.",
    weight: 3,
    critical: false,
  },
  {
    id: "wifi-rotate",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Rotate the Wi-Fi password after handing it out widely",
    detail:
      "Every guest, technician and delivery agent who ever got the password still has it, and phones keep it saved for years. Rotating annually, or after a move, resets that list.",
    path: "Settings > Wi-Fi settings > Wi-Fi password, then reconnect your own devices",
    risk: "A former flatmate or contractor keeps silent access long after they have left.",
    weight: 2,
    critical: false,
  },
  {
    id: "wps-off",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Turn WPS off if your model exposes it",
    detail:
      "The eight-digit WPS PIN is checked in two halves, which collapses the search from 100 million to roughly 11,000 attempts, and Pixie Dust recovers it offline on vulnerable chipsets. Most current Mi models hide WPS, but mesh and older units still offer it.",
    path: "Settings > Wi-Fi settings > Advanced (or the WPS button behaviour in the app)",
    risk: "Your passphrase is recovered through WPS in hours no matter how long it is.",
    weight: 4,
    critical: false,
  },
  {
    id: "mi-account-2fa",
    group: "Mi Account, app and plug-ins",
    axis: "Cloud and app exposure",
    title: "Protect the bound Mi Account with two-step verification",
    detail:
      "The router binds to one Mi Account, and that account can reach it from anywhere through the app. Whoever controls the account controls the router, so it needs two-step verification on the account itself.",
    path: "account.xiaomi.com > Security settings > Two-step verification",
    risk: "A phished or credential-stuffed cloud login reconfigures your home router from another country.",
    weight: 6,
    critical: true,
  },
  {
    id: "mi-account-sharing",
    group: "Mi Account, app and plug-ins",
    axis: "Cloud and app exposure",
    title: "Review who the router and home are shared with",
    detail:
      "Xiaomi Home lets you share a home or a device with other accounts. Shares survive break-ups, house moves and departed flatmates until somebody removes them.",
    path: "Xiaomi Home app > your home > Settings > Share / Family members",
    risk: "Someone you no longer live with still holds full remote control of your network.",
    weight: 4,
    critical: false,
  },
  {
    id: "plugin-audit",
    group: "Mi Account, app and plug-ins",
    axis: "Cloud and app exposure",
    title: "Remove plug-ins and router features you never use",
    detail:
      "The Mi Wi-Fi plug-in list adds services that run on the router itself — download managers, storage sharing, third-party add-ons. Each one is extra code listening on your network, and unused ones are rarely patched with the same urgency.",
    path: "Mi Wi-Fi app > Plug-ins / Toolbox, and the web UI's feature toggles",
    risk: "A neglected add-on running on the router becomes the way in, without touching your admin password at all.",
    weight: 3,
    critical: false,
  },
  {
    id: "no-unofficial-firmware",
    group: "Mi Account, app and plug-ins",
    axis: "Cloud and app exposure",
    title: "Do not run unofficial dev ROMs or SSH unlocks unless you maintain them",
    detail:
      "Unlocking SSH or flashing a modified ROM to get more features also opens a shell on the router and takes it off the official update track. That is a fine trade for someone who patches it themselves and a bad one for everybody else.",
    path: "Keep the stable channel in Settings > System status > Update",
    risk: "A router with an open shell and no more vendor updates sits on your network for years.",
    weight: 2,
    critical: false,
  },
  {
    id: "remote-access-review",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Keep the web admin page off the internet",
    detail:
      "Manage the router from the app or from inside the house, never by publishing the admin page to the WAN. Internet-facing router logins are scanned constantly and are how router botnets recruit.",
    path: "Settings > Advanced settings — leave any remote or WAN management option off",
    risk: "Scanners find your login page within hours and try every published exploit for your model.",
    weight: 7,
    critical: true,
  },
  {
    id: "upnp-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Turn UPnP off unless a console needs it",
    detail:
      "UPnP lets any program inside your network open a port to the internet without asking you. Game consoles and some torrent clients want it; nothing else has a good reason to.",
    path: "Settings > Advanced settings > UPnP",
    risk: "Malware on a laptop quietly publishes its own remote-access port through your firewall.",
    weight: 4,
    critical: false,
  },
  {
    id: "port-forward-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Clear stale port forwards and turn DMZ off",
    detail:
      "Forwards added years ago for a camera or a game server usually still point at a device nobody has patched since. DMZ is worse — it exposes one device completely.",
    path: "Settings > Advanced settings > Port forwarding and DMZ",
    risk: "An old DVR or camera on a forwarded port is taken over and used as a foothold inside your LAN.",
    weight: 4,
    critical: false,
  },
  {
    id: "ddns-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Remove DDNS if nothing needs a permanent name",
    detail:
      "Dynamic DNS gives your changing home IP a fixed hostname. Useful for remote access, and equally useful to anyone who wants to keep finding you after your IP changes.",
    path: "Settings > Advanced settings > DDNS",
    risk: "Your home network keeps a stable, guessable address that survives every IP change.",
    weight: 2,
    critical: false,
  },
  {
    id: "usb-sharing-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Lock down USB storage sharing on models that have a port",
    detail:
      "The higher-end Mi routers publish a plugged-in drive over the network, sometimes with open access by default. Turn it off, or set a password and keep it off the WAN.",
    path: "Mi Wi-Fi app > Storage / USB settings",
    risk: "The backup drive plugged into the router is readable by anyone on the network — or off it.",
    weight: 2,
    critical: false,
  },
  {
    id: "dns-explicit",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Set the DHCP DNS servers deliberately",
    detail:
      "Router DNS is the first thing router malware changes, because it redirects every device silently. Setting a resolver you chose gives you a known-good value to compare against later.",
    path: "Settings > Advanced settings > DHCP / DNS",
    risk: "A tampered DNS entry sends your bank's domain to a look-alike site on every device at once.",
    weight: 2,
    critical: false,
  },
  {
    id: "client-review",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Name every device in the connected list",
    detail:
      "Naming each client once turns the device list into something you can scan in ten seconds. An unnamed device that reappears at 3am is exactly the signal you want to notice.",
    path: "Mi Wi-Fi app home screen > Devices, or the web UI device list",
    risk: "An unknown device sits on your network for months because the list never looked unusual.",
    weight: 3,
    critical: false,
  },
  {
    id: "firmware-current",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Install the latest stable firmware and leave auto-update on",
    detail:
      "Firmware is where the actual security fixes ship; no setting works around a remote-code-execution bug in the router's own web server. Mi routers can update themselves overnight — let them.",
    path: "Settings > System status > Update, and enable automatic upgrade",
    risk: "A publicly documented flaw for your exact model stays open on your router indefinitely.",
    weight: 7,
    critical: true,
  },
  {
    id: "eol-check",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Check the model still receives firmware",
    detail:
      "If the newest firmware for your model is several years old, the device is effectively end of life. No checklist fixes that — replacement does.",
    path: "miwifi.com/download (or the Xiaomi support page) for your exact model",
    risk: "You harden a router that will never be patched again for the next bug found in it.",
    weight: 3,
    critical: false,
  },
];

/** Risk profiles re-weight the axes; multipliers are never negative. */
export const PROFILES = [
  {
    id: "home",
    name: "Ordinary home broadband",
    description: "A family flat with phones, a TV and a couple of laptops. Balanced weighting.",
    multipliers: {
      "Admin access": 1,
      "Wi-Fi encryption": 1,
      "Cloud and app exposure": 1,
      "Internet exposure": 1,
      "Connected devices": 1,
      "Firmware upkeep": 1,
    },
  },
  {
    id: "smarthome",
    name: "Smart home full of Mi devices",
    description:
      "Cameras, plugs, bulbs and a vacuum all bound to the same Mi Account, so the cloud account and the device list carry more of the risk.",
    multipliers: {
      "Admin access": 1.2,
      "Wi-Fi encryption": 1,
      "Cloud and app exposure": 1.6,
      "Internet exposure": 1.1,
      "Connected devices": 1.5,
      "Firmware upkeep": 1.2,
    },
  },
  {
    id: "wfh",
    name: "Work from home",
    description:
      "A work laptop and company VPN share the router, so anything reachable from the internet and any weak admin path matters more.",
    multipliers: {
      "Admin access": 1.3,
      "Wi-Fi encryption": 1,
      "Cloud and app exposure": 1.2,
      "Internet exposure": 1.5,
      "Connected devices": 1.2,
      "Firmware upkeep": 1.3,
    },
  },
  {
    id: "shared",
    name: "Shared flat, PG or hostel",
    description:
      "The password has been given to people who have since moved out, and unknown devices join regularly.",
    multipliers: {
      "Admin access": 1.3,
      "Wi-Fi encryption": 1.5,
      "Cloud and app exposure": 1.1,
      "Internet exposure": 0.8,
      "Connected devices": 1.4,
      "Firmware upkeep": 1,
    },
  },
];

export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Very little left to take. Recheck firmware every quarter." },
  { id: "solid", min: 70, label: "Solid", hint: "The serious holes are closed; tidy up the rest when convenient." },
  { id: "partial", min: 40, label: "Partly hardened", hint: "The obvious settings are done, the quiet ones are not." },
  {
    id: "exposed",
    min: 0,
    label: "Exposed",
    hint: "A shared admin password or an unprotected Mi Account is the usual reason.",
  },
];

export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Most people have at least done these, so the first paint is not all zeros. */
export const DEFAULT_DONE = ["wpa-mode", "ssid-not-default"];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** First band whose minimum the percentage reaches. Input is clamped to 0-100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

/** Weight of one control under one profile. Never negative, never NaN. */
export function effectiveWeight(item, profile) {
  const multiplier = profile && profile.multipliers ? profile.multipliers[item.axis] : 1;
  const factor = Number.isFinite(multiplier) && multiplier >= 0 ? multiplier : 1;
  return item.weight * factor;
}

/**
 * Score a set of completed control ids under a risk profile.
 *
 * Unknown ids and duplicates are ignored so a stale saved list cannot inflate
 * the score. An unknown profile falls back to the first one, because that is a
 * UI bug rather than bad user input.
 *
 * @param {string[]} doneIds ids from CHECKLIST already applied.
 * @param {string} [profileId] id from PROFILES.
 * @returns {object} summary, or { error } for unusable input.
 */
export function scoreChecklist(doneIds, profileId) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed steps must be provided as a list." };
  }
  if (!(TOTAL_WEIGHT > 0)) {
    return { error: "This checklist has no weighted steps to score." };
  }

  const profile = profileById.get(profileId) || PROFILES[0];

  const done = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && byId.has(raw)) done.add(raw);
  }

  let earned = 0;
  let available = 0;
  const remaining = [];
  const missingCritical = [];

  for (const item of CHECKLIST) {
    const weight = effectiveWeight(item, profile);
    available += weight;
    if (done.has(item.id)) earned += weight;
    else {
      remaining.push(item);
      if (item.critical) missingCritical.push(item);
    }
  }

  if (!(available > 0)) {
    return { error: "This risk profile removes every step from the score." };
  }

  const rawPercent = Math.round((earned / available) * 100);
  const capped = missingCritical.length > 0 && rawPercent > CRITICAL_CAP_PERCENT;
  const percent = capped ? CRITICAL_CAP_PERCENT : rawPercent;
  const band = bandFor(percent);

  const axes = AXES.map((name) => {
    const items = CHECKLIST.filter((item) => item.axis === name);
    let axisTotal = 0;
    let axisOpen = 0;
    let openCount = 0;
    for (const item of items) {
      const weight = effectiveWeight(item, profile);
      axisTotal += weight;
      if (!done.has(item.id)) {
        axisOpen += weight;
        openCount += 1;
      }
    }
    const exposure = axisTotal > 0 ? Math.round((axisOpen / axisTotal) * 100) : 0;
    const emphasis =
      profile.multipliers && Number.isFinite(profile.multipliers[name]) ? profile.multipliers[name] : 1;
    return { name, exposure, closed: 100 - exposure, open: openCount, total: items.length, emphasis };
  });

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
    .sort(
      (a, b) =>
        Number(b.critical) - Number(a.critical) ||
        effectiveWeight(b, profile) - effectiveWeight(a, profile)
    )
    .slice(0, 3);

  const worstAxis = axes.reduce(
    (worst, axis) => (worst === null || axis.exposure > worst.exposure ? axis : worst),
    null
  );

  return {
    profile,
    earned: Math.round(earned * 100) / 100,
    available: Math.round(available * 100) / 100,
    rawPercent,
    percent,
    capped,
    completed: done.size,
    total: CHECKLIST.length,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    remaining,
    missingCritical,
    axes,
    groups,
    nextActions,
    worstAxis,
  };
}

/* ------------------------------------------------------------------ *
 * WPA2 passphrase strength
 *
 * WPA2-Personal derives the PMK with PBKDF2-HMAC-SHA1 over 4096 iterations
 * (IEEE 802.11i), which makes offline cracking slow but not slow enough.
 * Published hashcat benchmarks for mode 22000 put one current high-end
 * consumer GPU at roughly 2 million candidate passphrases per second. Those
 * two facts are the whole model below.
 * ------------------------------------------------------------------ */

/** PBKDF2 iteration count fixed by IEEE 802.11i for WPA/WPA2-Personal. */
export const WPA2_PBKDF2_ITERATIONS = 4096;

/** Candidate passphrases per second, one current high-end consumer GPU. */
export const GPU_GUESSES_PER_SECOND = 2e6;

/** 802.11i limits a WPA passphrase to 8-63 printable ASCII characters. */
export const MIN_PASSPHRASE_LENGTH = 8;
export const MAX_PASSPHRASE_LENGTH = 63;

/** Character-class pool sizes across printable ASCII (33-126) plus space. */
export const CHAR_POOLS = {
  lower: 26,
  upper: 26,
  digit: 10,
  symbol: 33,
};

/**
 * Passphrases at the top of every leaked-password list and in the default
 * wordlists shipped with cracking tools. Entropy maths does not apply to
 * these — they are guessed in the first few thousand attempts.
 */
export const GUESSABLE = [
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "admin123",
  "adminadmin",
  "xiaomi123",
  "miwifi123",
  "redmi123",
  "internet",
  "wifipassword",
  "letmein123",
  "iloveyou",
  "welcome123",
  "abcd1234",
  "asdfghjkl",
];

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365.25 * DAY; // Julian year, so leap years do not skew long spans.

/** Crack-time bands, in seconds of sustained offline attack. */
export const CRACK_BANDS = [
  { id: "instant", max: HOUR, label: "Cracked almost immediately" },
  { id: "hours", max: DAY, label: "Cracked within a day" },
  { id: "weak", max: 30 * DAY, label: "Cracked within a month" },
  { id: "fair", max: 10 * YEAR, label: "Holds for years" },
  { id: "strong", max: Infinity, label: "Not crackable by brute force" },
];

/** Human-readable duration. Pure formatting, no locale surprises. */
export function humanDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "unknown";
  if (seconds < MINUTE) return `${Math.max(1, Math.round(seconds))} seconds`;
  if (seconds < HOUR) return `${Math.round(seconds / MINUTE)} minutes`;
  if (seconds < DAY) return `${Math.round(seconds / HOUR)} hours`;
  if (seconds < 60 * DAY) return `${Math.round(seconds / DAY)} days`;
  if (seconds < YEAR) return `${Math.round(seconds / (30 * DAY))} months`;
  const years = seconds / YEAR;
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1e6) return `${Math.round(years / 1000)} thousand years`;
  if (years < 1e9) return `${Math.round(years / 1e6)} million years`;
  if (years < 1e12) return `${Math.round(years / 1e9)} billion years`;
  return "longer than the age of the universe";
}

/**
 * Offline crack-time estimate for a WPA2/WPA3 passphrase.
 *
 * bits    = length x log2(pool size of the character classes actually used)
 * guesses = 2^(bits-1), the average number of tries for an exhaustive search
 * seconds = guesses / (rate x number of GPUs)
 *
 * The estimate assumes the attacker knows nothing about the passphrase. One
 * built from dictionary words falls far sooner, which is why the known-
 * guessable list short-circuits the maths.
 *
 * @param {string} passphrase the Wi-Fi passphrase to rate.
 * @param {{gpus?: number}} [options] size of the attacking rig.
 */
export function wifiPassphraseStrength(passphrase, options) {
  if (typeof passphrase !== "string") {
    return { error: "Enter the Wi-Fi passphrase as text." };
  }
  const value = passphrase;
  if (value.length === 0) {
    return { error: "Enter a passphrase to rate it." };
  }
  if (value.length < MIN_PASSPHRASE_LENGTH) {
    return {
      error: `WPA2 and WPA3 require at least ${MIN_PASSPHRASE_LENGTH} characters — this one has ${value.length}.`,
    };
  }
  if (value.length > MAX_PASSPHRASE_LENGTH) {
    return {
      error: `A WPA passphrase cannot exceed ${MAX_PASSPHRASE_LENGTH} characters — this one has ${value.length}.`,
    };
  }

  const gpusRaw = options && options.gpus !== undefined ? Number(options.gpus) : 1;
  if (!Number.isFinite(gpusRaw) || gpusRaw <= 0) {
    return { error: "The number of attacking GPUs must be a positive number." };
  }
  const gpus = Math.min(1000, gpusRaw);
  const rate = GPU_GUESSES_PER_SECOND * gpus;

  const classes = [];
  let pool = 0;
  if (/[a-z]/.test(value)) {
    pool += CHAR_POOLS.lower;
    classes.push("lower case");
  }
  if (/[A-Z]/.test(value)) {
    pool += CHAR_POOLS.upper;
    classes.push("upper case");
  }
  if (/[0-9]/.test(value)) {
    pool += CHAR_POOLS.digit;
    classes.push("digits");
  }
  if (/[^a-zA-Z0-9]/.test(value)) {
    pool += CHAR_POOLS.symbol;
    classes.push("symbols");
  }
  if (pool <= 1) {
    return { error: "That passphrase uses no recognisable characters." };
  }

  const guessable = GUESSABLE.includes(value.toLowerCase());
  const bits = value.length * Math.log2(pool);
  const averageGuesses = Math.pow(2, bits - 1);
  const seconds = averageGuesses / rate;
  const band = guessable
    ? CRACK_BANDS[0]
    : CRACK_BANDS.find((entry) => seconds < entry.max) || CRACK_BANDS[CRACK_BANDS.length - 1];

  return {
    length: value.length,
    pool,
    classes,
    bits: Math.round(bits * 10) / 10,
    averageGuesses,
    seconds: guessable ? 0 : seconds,
    human: guessable ? "seconds — it is on public wordlists" : humanDuration(seconds),
    band: band.id,
    bandLabel: band.label,
    guessable,
    gpus,
    rate,
  };
}
