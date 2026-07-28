/**
 * D-Link Router Hardening Checklist — scoring and WPS PIN attack maths.
 *
 * Pure module: no React, no DOM, no clock reads. Same input, same output.
 * Every exported function is total: unusable input returns { error } rather
 * than NaN, Infinity or a number that reads like a real answer.
 */

/** Where the settings live on a DIR-series web UI. */
export const DEVICE = {
  vendor: "D-Link",
  adminUrl: "http://dlinkrouter.local",
  gateways: ["192.168.0.1", "192.168.1.1"],
  app: "mydlink",
  cloudAccount: "mydlink account",
  note:
    "DIR routers answer on dlinkrouter.local and usually 192.168.0.1. Many models shipped with the username admin and a blank password; the label on the base carries the model number, hardware revision and, on newer units, a unique Wi-Fi key.",
};

export const AXES = [
  "Admin access",
  "Wi-Fi encryption",
  "Internet exposure",
  "Connected devices",
  "Firmware upkeep",
];

export const GROUPS = [
  "Admin account",
  "Wi-Fi",
  "Facing the internet",
  "Devices on your LAN",
  "Firmware and lifecycle",
];

export const CRITICAL_CAP_PERCENT = 60;

export const CHECKLIST = [
  {
    id: "admin-password",
    group: "Admin account",
    axis: "Admin access",
    title: "Set an admin password — many DIR models ship with none",
    detail:
      "D-Link's classic default is the username admin with the password left blank, so the login page opens for anyone who reaches it. This is the single most common finding on an unaudited DIR router.",
    path: "dlinkrouter.local > Management > Admin > Admin Password",
    risk: "Anyone on your Wi-Fi opens the admin page by pressing Enter and owns the router.",
    weight: 8,
    critical: true,
  },
  {
    id: "admin-password-unique",
    group: "Admin account",
    axis: "Admin access",
    title: "Do not reuse the Wi-Fi key as the admin password",
    detail:
      "If the admin password matches the Wi-Fi key, every guest who was ever given the Wi-Fi also has administrative control without realising it.",
    path: "Management > Admin, and store it in a password manager",
    risk: "Handing out the Wi-Fi password quietly hands out the router as well.",
    weight: 3,
    critical: false,
  },
  {
    id: "mydlink-account",
    group: "Admin account",
    axis: "Admin access",
    title: "Secure or unlink the mydlink cloud account",
    detail:
      "mydlink lets the app reach the router from anywhere. Give that account a unique password, and unlink the router if you never use remote management.",
    path: "mydlink app > Account, or web UI > Management > mydlink Settings",
    risk: "A reused cloud password from an unrelated breach reconfigures your router from outside.",
    weight: 4,
    critical: false,
  },
  {
    id: "admin-https",
    group: "Admin account",
    axis: "Admin access",
    title: "Prefer HTTPS for the admin page where the model supports it",
    detail:
      "On plain HTTP the admin password crosses your LAN in the clear, readable by anything already listening on the same network.",
    path: "Management > Admin > HTTPS access (newer firmware only)",
    risk: "A compromised device on the network reads your admin password as you type it.",
    weight: 2,
    critical: false,
  },
  {
    id: "wpa-mode",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Set WPA2-PSK (AES) or WPA2/WPA3, never WEP or TKIP",
    detail:
      "Older DIR firmware still offers WEP and mixed WPA/WPA2-TKIP for legacy devices. WEP is recovered from captured traffic in minutes; TKIP has its own practical attacks.",
    path: "Settings > Wireless > Security Mode (each band)",
    risk: "Traffic is decrypted from a passive capture, or the network is joined without the key.",
    weight: 7,
    critical: true,
  },
  {
    id: "wifi-passphrase",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Use a long Wi-Fi passphrase of your own",
    detail:
      "A WPA2 handshake is captured in seconds and attacked offline at full GPU speed. Twelve or more mixed characters puts brute force out of practical reach; a phone number does not.",
    path: "Settings > Wireless > Wi-Fi Password",
    risk: "A captured handshake is cracked overnight and the network is joined at will.",
    weight: 6,
    critical: true,
  },
  {
    id: "wps-off",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Turn WPS off — it is on by default on many DIR models",
    detail:
      "The eight-digit PIN is checked in two halves, so a search of 100 million combinations collapses to about 11,000. The attack timer below shows what that means in hours on your model's rate limit.",
    path: "Settings > Wireless > Advanced Settings > WPS, or Advanced > Wi-Fi Protected Setup",
    risk: "The Wi-Fi passphrase is recovered through WPS in hours regardless of how long it is.",
    weight: 6,
    critical: true,
  },
  {
    id: "ssid-not-default",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Rename the SSID away from dlink-XXXX",
    detail:
      "A default SSID names the vendor and often the model to anyone in range, which is exactly the information needed to pick a published exploit. Avoid your surname or flat number too.",
    path: "Settings > Wireless > Wi-Fi Name (SSID)",
    risk: "Your model is advertised to the street along with which unpatched bug applies to it.",
    weight: 2,
    critical: false,
  },
  {
    id: "guest-zone",
    group: "Wi-Fi",
    axis: "Connected devices",
    title: "Use the Guest Zone with internet access only",
    detail:
      "D-Link's Guest Zone has an 'Internet Access Only' setting. With it on, guests reach the internet but not your NAS, printer or cameras.",
    path: "Settings > Wireless > Guest Zone > Internet Access Only",
    risk: "A visitor's phone scans your file shares and cameras from inside the LAN.",
    weight: 3,
    critical: false,
  },
  {
    id: "wifi-rotate",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Rotate the Wi-Fi key after it has been shared widely",
    detail:
      "Every guest, technician and neighbour who ever got the key still has it saved. Rotating annually, or after a move, clears the list.",
    path: "Settings > Wireless > Wi-Fi Password, then reconnect your devices",
    risk: "Someone with no current business on your network keeps silent access to it.",
    weight: 2,
    critical: false,
  },
  {
    id: "remote-management-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Disable remote management of the admin page",
    detail:
      "Remote management publishes the DIR login page on the WAN, historically on port 8080. Given how many DIR models are out of support, this is the surface that turns a local bug into an internet-wide one.",
    path: "Management > Admin > Enable Remote Management (older UI: Tools > Admin)",
    risk: "Scanners find your login page within hours and try every published exploit for the model.",
    weight: 7,
    critical: true,
  },
  {
    id: "upnp-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Switch UPnP off unless a console needs it",
    detail:
      "UPnP lets any program on the LAN open an inbound port with no prompt. It is also implemented in the same web stack that carries most router bugs.",
    path: "Features > Advanced Settings > UPnP (older UI: Advanced > Advanced Network)",
    risk: "Malware on a laptop publishes its own inbound port through the firewall.",
    weight: 4,
    critical: false,
  },
  {
    id: "port-forward-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Clear stale port forwards and turn off DMZ",
    detail:
      "Forwards added years ago for a camera or a game usually still point at a device nobody patches. DMZ forwards everything to a single machine.",
    path: "Features > Port Forwarding and Features > Firewall Settings > DMZ",
    risk: "An old camera on a forwarded port becomes a permanent foothold inside the network.",
    weight: 4,
    critical: false,
  },
  {
    id: "shareport-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Lock down SharePort USB storage and FTP",
    detail:
      "A drive in the router's USB port can be shared over SMB, FTP and DLNA, sometimes with anonymous access, and on some models published beyond the LAN.",
    path: "Settings > SharePort / USB, and any FTP server setting",
    risk: "The drive plugged into the router is readable by every device on the network, or outside it.",
    weight: 2,
    critical: false,
  },
  {
    id: "ddns-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Remove DDNS if nothing needs a permanent name",
    detail:
      "Dynamic DNS keeps a stable hostname pointed at a changing home IP — convenient for you, and equally convenient for anyone keeping track of your connection.",
    path: "Features > Dynamic DNS",
    risk: "Your home network keeps a permanent, guessable address across every IP change.",
    weight: 2,
    critical: false,
  },
  {
    id: "dns-explicit",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Set the DNS servers deliberately and record them",
    detail:
      "Router DNS is the quietest thing an attacker can change: every device follows it and nothing appears broken. Knowing your own value makes tampering detectable.",
    path: "Settings > Internet > Advanced Settings > Primary/Secondary DNS Server",
    risk: "A tampered DNS entry sends your bank's domain to a look-alike site on every device at once.",
    weight: 2,
    critical: false,
  },
  {
    id: "client-review",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Read the connected-clients list and name every device",
    detail:
      "Naming each device once makes the list scannable at a glance. The unnamed entry that reappears at odd hours is the thing you are looking for.",
    path: "Home > Connected Clients, or the mydlink app device list",
    risk: "An unknown device sits on the network for months because the list was never legible.",
    weight: 3,
    critical: false,
  },
  {
    id: "iot-segmented",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Keep cameras, TVs and smart plugs on the guest zone",
    detail:
      "Cheap smart devices get firmware for a year or two and then nothing at all. Keeping them away from the network holding your laptop limits what a compromised device reaches.",
    path: "Settings > Wireless > Guest Zone (use it as an IoT network)",
    risk: "An abandoned camera firmware becomes the route into the machine holding your documents.",
    weight: 2,
    critical: false,
  },
  {
    id: "firmware-current",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Install the newest firmware for your exact hardware revision",
    detail:
      "D-Link firmware is published per hardware revision — the Ax or Bx code on the label. Installing a build for the wrong revision can brick the unit, so check the label before downloading.",
    path: "Management > Upgrade Firmware, and the D-Link support page for your model and revision",
    risk: "A documented remote-code-execution flaw for your model stays open indefinitely.",
    weight: 7,
    critical: true,
  },
  {
    id: "eol-check",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Check whether D-Link has declared the model end-of-support",
    detail:
      "D-Link publishes end-of-life notices for older DIR routers and states plainly that it will not patch reported flaws in them, recommending replacement instead. If your model is on that list, no setting here substitutes for new hardware.",
    path: "D-Link's legacy and security announcement pages for your model number",
    risk: "You harden a router whose known flaws will never be fixed, on the vendor's own record.",
    weight: 5,
    critical: true,
  },
  {
    id: "reset-if-suspect",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Factory reset first if the router was ever second-hand or suspect",
    detail:
      "A router bought used, or one that behaved oddly, can carry settings you did not make. Resetting and configuring by hand is the only way to be sure of the starting point.",
    path: "Management > System > Restore to Factory Defaults, or the recessed reset pin",
    risk: "Settings left by a previous owner or an intruder survive everything else you change.",
    weight: 2,
    critical: false,
  },
  {
    id: "config-backup",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Save the configuration once it is hardened",
    detail:
      "A saved config turns a reset after a power surge or a failed upgrade into a two-minute restore rather than an evening of work.",
    path: "Management > System > Save Settings To Local Hard Drive",
    risk: "A reset drops every setting on this list and the router returns to factory defaults.",
    weight: 1,
    critical: false,
  },
];

export const PROFILES = [
  {
    id: "home",
    name: "Ordinary home broadband",
    description: "A family flat with phones, a TV and a couple of laptops. Balanced weighting.",
    multipliers: {
      "Admin access": 1,
      "Wi-Fi encryption": 1,
      "Internet exposure": 1,
      "Connected devices": 1,
      "Firmware upkeep": 1,
    },
  },
  {
    id: "old-hardware",
    name: "Old or second-hand router",
    description:
      "The unit is several years old or came from someone else, so lifecycle and admin access dominate.",
    multipliers: {
      "Admin access": 1.4,
      "Wi-Fi encryption": 1.1,
      "Internet exposure": 1.2,
      "Connected devices": 1,
      "Firmware upkeep": 1.8,
    },
  },
  {
    id: "wfh",
    name: "Work from home",
    description:
      "A work laptop and company VPN share the line, so admin access and internet exposure matter more.",
    multipliers: {
      "Admin access": 1.3,
      "Wi-Fi encryption": 1,
      "Internet exposure": 1.5,
      "Connected devices": 1.2,
      "Firmware upkeep": 1.3,
    },
  },
  {
    id: "shared",
    name: "Shared flat, PG or hostel",
    description:
      "The Wi-Fi key has been given to people who have since moved out, and unknown devices join regularly.",
    multipliers: {
      "Admin access": 1.2,
      "Wi-Fi encryption": 1.5,
      "Internet exposure": 0.8,
      "Connected devices": 1.4,
      "Firmware upkeep": 1,
    },
  },
];

export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Very little left to take. Recheck firmware every quarter." },
  { id: "solid", min: 70, label: "Solid", hint: "The serious holes are closed; tidy the rest when convenient." },
  { id: "partial", min: 40, label: "Partly hardened", hint: "The obvious settings are done, the quiet ones are not." },
  { id: "exposed", min: 0, label: "Exposed", hint: "A blank admin password or enabled WPS is the likely reason." },
];

export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

export const DEFAULT_DONE = ["wpa-mode", "ssid-not-default"];

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));
const profileById = new Map(PROFILES.map((item) => [item.id, item]));

/** First band whose minimum the percentage reaches. Input clamped to 0-100. */
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
 * Unknown ids and duplicates are ignored; an unknown profile falls back to the
 * first one.
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
 * WPS PIN attack timer
 *
 * The external registrar PIN is eight digits, and the eighth is a checksum, so
 * there are 10^7 valid PINs. The flaw published by Stefan Viehböck in 2011 is
 * that the registrar tells the attacker whether the FIRST HALF is correct
 * before the second half is sent. That splits the search:
 *
 *   first half  : 10^4 = 10,000 candidates
 *   second half : 10^3 =  1,000 candidates (the eighth digit is derived)
 *   worst case  : 11,000 attempts instead of 10,000,000
 *
 * Everything below is that arithmetic plus whatever rate limiting the router
 * applies.
 * ------------------------------------------------------------------ */

/** Valid eight-digit PINs once the checksum digit is accounted for. */
export const WPS_TOTAL_PINS = 1e7;

/** Worst-case attempts under the split-half flaw: 10^4 + 10^3. */
export const WPS_SPLIT_ATTEMPTS = 11000;

/** Average attempts, assuming the PIN is uniformly distributed. */
export const WPS_AVERAGE_ATTEMPTS = WPS_SPLIT_ATTEMPTS / 2;

/**
 * Pixie Dust is a separate, offline attack against routers whose WPS
 * implementation generates predictable nonces. Where it works, the PIN falls in
 * seconds to minutes and the rate limiting below is irrelevant.
 */
export const PIXIE_DUST_NOTE =
  "On chipsets with predictable WPS nonces the Pixie Dust attack recovers the PIN offline in seconds, and no rate limit helps.";

const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 3600;
const DAY_SECONDS = 86400;

/** Human-readable duration for the attack timer. */
export function humanDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "unknown";
  if (seconds < MINUTE_SECONDS) return `${Math.max(1, Math.round(seconds))} seconds`;
  if (seconds < HOUR_SECONDS) return `${Math.round(seconds / MINUTE_SECONDS)} minutes`;
  if (seconds < DAY_SECONDS) return `${Math.round((seconds / HOUR_SECONDS) * 10) / 10} hours`;
  if (seconds < 365 * DAY_SECONDS) return `${Math.round((seconds / DAY_SECONDS) * 10) / 10} days`;
  return `${Math.round((seconds / (365 * DAY_SECONDS)) * 10) / 10} years`;
}

/**
 * How long a WPS PIN brute force takes against one router.
 *
 * base seconds  = attempts / (attemptsPerMinute / 60)
 * lockout adds  = floor(attempts / lockoutAfter) x lockoutSeconds
 *
 * @param {{attemptsPerMinute?: number, lockoutAfter?: number, lockoutSeconds?: number}} options
 */
export function wpsPinAttackTime(options) {
  const source = options || {};

  const perMinute = source.attemptsPerMinute === undefined ? 20 : Number(source.attemptsPerMinute);
  if (!Number.isFinite(perMinute)) {
    return { error: "Enter the attempts per minute as a number." };
  }
  if (perMinute <= 0) {
    return { error: "Attempts per minute must be greater than zero." };
  }

  const lockoutAfter = source.lockoutAfter === undefined ? 0 : Number(source.lockoutAfter);
  const lockoutSeconds = source.lockoutSeconds === undefined ? 0 : Number(source.lockoutSeconds);
  if (!Number.isFinite(lockoutAfter) || lockoutAfter < 0) {
    return { error: "The lockout threshold must be zero or a positive number of attempts." };
  }
  if (!Number.isFinite(lockoutSeconds) || lockoutSeconds < 0) {
    return { error: "The lockout duration must be zero or a positive number of seconds." };
  }

  const perSecond = perMinute / 60;

  const timeFor = (attempts) => {
    const active = attempts / perSecond;
    const lockouts = lockoutAfter >= 1 && lockoutSeconds > 0 ? Math.floor(attempts / lockoutAfter) : 0;
    return active + lockouts * lockoutSeconds;
  };

  const worstSeconds = timeFor(WPS_SPLIT_ATTEMPTS);
  const averageSeconds = timeFor(WPS_AVERAGE_ATTEMPTS);
  const naiveSeconds = timeFor(WPS_TOTAL_PINS);

  return {
    attemptsPerMinute: perMinute,
    lockoutAfter,
    lockoutSeconds,
    worstAttempts: WPS_SPLIT_ATTEMPTS,
    averageAttempts: WPS_AVERAGE_ATTEMPTS,
    worstSeconds,
    averageSeconds,
    naiveSeconds,
    worstHuman: humanDuration(worstSeconds),
    averageHuman: humanDuration(averageSeconds),
    naiveHuman: humanDuration(naiveSeconds),
    // How much the split-half flaw saves the attacker.
    reductionFactor: Math.round((WPS_TOTAL_PINS / WPS_SPLIT_ATTEMPTS) * 10) / 10,
    pixieDustNote: PIXIE_DUST_NOTE,
  };
}
