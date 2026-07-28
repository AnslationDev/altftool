/**
 * Netgear Router Hardening Checklist — scoring and firmware-age maths.
 *
 * Pure module: no React, no DOM, no clock reads (dates arrive as arguments).
 * Every exported function is total: unusable input returns { error } rather
 * than NaN, Infinity or a number that reads like an answer.
 */

/** Where the settings live on a current Nighthawk / R-series web UI. */
export const DEVICE = {
  vendor: "Netgear",
  adminUrl: "http://routerlogin.net",
  gateways: ["192.168.1.1"],
  app: "Nighthawk app",
  cloudAccount: "NETGEAR account",
  note:
    "Netgear routers answer on routerlogin.net, routerlogin.com and usually 192.168.1.1. Units shipped with admin as the username and password as the password; the label on the base carries the Wi-Fi key and, on newer models, a unique admin password.",
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

/** A missing critical control caps the score here, however much else is done. */
export const CRITICAL_CAP_PERCENT = 60;

export const CHECKLIST = [
  {
    id: "admin-password",
    group: "Admin account",
    axis: "Admin access",
    title: "Replace admin/password with a real admin password",
    detail:
      "Netgear's factory pair — username admin, password password — is in every default-credential list ever published and is the first thing a script tries from inside the network.",
    path: "routerlogin.net > ADVANCED > Administration > Set Password",
    risk: "Anyone already on your Wi-Fi owns the router in one guess, and can change DNS to intercept everything.",
    weight: 8,
    critical: true,
  },
  {
    id: "password-recovery",
    group: "Admin account",
    axis: "Admin access",
    title: "Enable password recovery so a strong password is safe to use",
    detail:
      "Netgear lets you set two security questions that recover the admin password. Without it, forgetting a strong password means a factory reset — which is why people settle for a weak one.",
    path: "ADVANCED > Administration > Set Password > Enable Password Recovery",
    risk: "You keep a weak, memorable admin password because a reset would wipe every other setting.",
    weight: 2,
    critical: false,
  },
  {
    id: "netgear-account-2fa",
    group: "Admin account",
    axis: "Admin access",
    title: "Protect the NETGEAR account used by the Nighthawk app",
    detail:
      "The Nighthawk app reaches your router through a NETGEAR cloud account. That account is a second front door: give it a unique password and two-factor if your account type supports it.",
    path: "Nighthawk app > Settings > Account, or my.netgear.com",
    risk: "A reused cloud password from an unrelated breach lets someone reconfigure your router remotely.",
    weight: 4,
    critical: false,
  },
  {
    id: "access-control",
    group: "Admin account",
    axis: "Admin access",
    title: "Set Access Control to approve new devices",
    detail:
      "Netgear's Access Control can block any device that has not been allowed. It is not a substitute for a strong Wi-Fi key, but it makes a silent join visible immediately.",
    path: "ADVANCED > Security > Access Control",
    risk: "A device that guessed or was given the Wi-Fi key joins and nothing ever flags it.",
    weight: 2,
    critical: false,
  },
  {
    id: "wpa-mode",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Use WPA2-PSK (AES) or WPA2/WPA3 mixed mode",
    detail:
      "Netgear firmware still offers WEP and WPA-TKIP on some models for legacy kit. Both are broken; WPA2 with AES is the floor and WPA2/WPA3 mixed is better if your devices cope.",
    path: "Wireless Setup > Security Options (per band)",
    risk: "Traffic is decrypted from a passive capture, or the network is joined without the key at all.",
    weight: 7,
    critical: true,
  },
  {
    id: "wifi-passphrase",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Replace the label passphrase with a long one of your own",
    detail:
      "The key printed on the label is fine until the router is photographed, sold or handled by a technician. It is also short enough on older models to be worth attacking offline.",
    path: "Wireless Setup > Password (Network Key)",
    risk: "Anyone who has seen the base of the router still has your Wi-Fi key.",
    weight: 6,
    critical: true,
  },
  {
    id: "ssid-not-default",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Rename the SSID away from NETGEARxx",
    detail:
      "A default SSID tells anyone in range the vendor and often the series, which narrows the list of published exploits to try. Do not swap in your surname or flat number.",
    path: "Wireless Setup > Name (SSID), for both 2.4 GHz and 5 GHz",
    risk: "Your model is advertised to the street along with which unpatched bug applies to it.",
    weight: 2,
    critical: false,
  },
  {
    id: "wps-off",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Disable WPS, both PIN and push button",
    detail:
      "The eight-digit WPS PIN is validated in two halves, collapsing the search space from 100 million to about 11,000 attempts. Netgear exposes it under Advanced Wireless Settings.",
    path: "ADVANCED > Advanced Setup > Wireless Settings > WPS Settings",
    risk: "Your Wi-Fi key is recovered through WPS in hours no matter how long the key is.",
    weight: 5,
    critical: true,
  },
  {
    id: "guest-network",
    group: "Wi-Fi",
    axis: "Connected devices",
    title: "Run a guest network with local access switched off",
    detail:
      "Netgear's guest network has a tick box titled 'Allow guests to see each other and access my local network'. Leaving it ticked defeats the point of a guest network entirely.",
    path: "Guest Network > untick 'Allow guests to see each other and access my local network'",
    risk: "A visitor's phone reaches your NAS, printer and cameras as if it were your own laptop.",
    weight: 3,
    critical: false,
  },
  {
    id: "wifi-rotate",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Rotate the Wi-Fi key after it has been handed around",
    detail:
      "Every guest, technician and neighbour who ever got the key still has it saved on a phone. A yearly rotation, or one after a move, clears that list.",
    path: "Wireless Setup > Password, then reconnect your own devices",
    risk: "Someone who no longer has any business on your network keeps silent access to it.",
    weight: 2,
    critical: false,
  },
  {
    id: "remote-management-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Turn Remote Management off",
    detail:
      "Remote Management publishes the router's admin interface on the WAN, by default on port 8443. Netgear has issued repeated advisories for pre-authentication flaws in its web stack; this is the surface they are reached through.",
    path: "ADVANCED > Advanced Setup > Remote Management",
    risk: "Internet-wide scanners find your admin page within hours and try every published exploit for the model.",
    weight: 7,
    critical: true,
  },
  {
    id: "upnp-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Switch UPnP off unless a console needs it",
    detail:
      "UPnP lets any program on the LAN open a port through the firewall with no prompt. Netgear's UPnP implementation has itself carried remotely exploitable bugs, including a pre-auth stack overflow patched in 2021.",
    path: "ADVANCED > Advanced Setup > UPnP",
    risk: "Malware on a laptop publishes its own inbound port, or the UPnP service itself is exploited from the WAN.",
    weight: 4,
    critical: false,
  },
  {
    id: "port-forward-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Delete stale port forwards and clear the DMZ host",
    detail:
      "Forwards set up years ago for a camera or a game usually still point at a device nobody patches. The DMZ setting is worse: it forwards everything to one machine.",
    path: "ADVANCED > Advanced Setup > Port Forwarding / Port Triggering, and WAN Setup > Default DMZ Server",
    risk: "An old DVR on a forwarded port is taken over and becomes a permanent foothold inside your network.",
    weight: 4,
    critical: false,
  },
  {
    id: "readyshare-lockdown",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Lock down ReadySHARE and ReadyCLOUD access to USB storage",
    detail:
      "A drive plugged into the router is shared over SMB and FTP by default, and ReadyCLOUD can publish it to the internet through your NETGEAR account. Turn off what you do not use and require a password for the rest.",
    path: "ADVANCED > USB Functions > ReadySHARE Storage > Edit, and ReadyCLOUD",
    risk: "The backup drive on the router is readable by every device on the network, or reachable from outside it.",
    weight: 3,
    critical: false,
  },
  {
    id: "ddns-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Remove Dynamic DNS if nothing needs a fixed name",
    detail:
      "DDNS keeps a stable hostname pointed at a changing home IP. Useful for you, equally useful to anyone who wants to keep finding your connection after the IP changes.",
    path: "ADVANCED > Advanced Setup > Dynamic DNS",
    risk: "Your home network keeps a permanent, searchable address even as the IP rotates.",
    weight: 2,
    critical: false,
  },
  {
    id: "dns-explicit",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Set the DNS servers deliberately and note what you set",
    detail:
      "Changing router DNS is the quietest possible attack: every device follows it and nothing looks broken. Knowing the value you chose is what makes tampering detectable.",
    path: "BASIC > Internet > Domain Name Server (DNS) Address > Use These DNS Servers",
    risk: "A tampered DNS entry sends your bank's domain to a look-alike site on every device at once.",
    weight: 2,
    critical: false,
  },
  {
    id: "client-review",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Read the Attached Devices list and name everything on it",
    detail:
      "Naming each device once turns the list into something you can scan in ten seconds. The unnamed entry that appears at 3am is the thing you are looking for.",
    path: "BASIC > Attached Devices, or the Nighthawk app device list",
    risk: "An unknown device sits on the network for months because the list was never legible.",
    weight: 3,
    critical: false,
  },
  {
    id: "iot-segmented",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Move cameras, TVs and smart plugs onto the guest network",
    detail:
      "Cheap smart devices get firmware for a year or two and then nothing. Keeping them off the network with your laptop and NAS limits what a compromised bulb can reach.",
    path: "Guest Network (use a separate SSID for IoT)",
    risk: "An abandoned camera firmware becomes the way into the machine holding your documents.",
    weight: 2,
    critical: false,
  },
  {
    id: "firmware-current",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Install the current firmware and check every quarter",
    detail:
      "Netgear publishes security advisories on its support site and ships the fixes only in firmware. Nothing in the settings works around a code-execution bug.",
    path: "ADVANCED > Administration > Firmware Update > Check",
    risk: "A documented remote-code-execution flaw for your exact model stays open indefinitely.",
    weight: 7,
    critical: true,
  },
  {
    id: "auto-update",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Turn on automatic firmware update if the model offers it",
    detail:
      "Newer Nighthawk firmware can install updates on its own. Quarterly reminders fail; the automatic option is the one that survives a busy year.",
    path: "ADVANCED > Administration > Firmware Update > Auto Update, or the Nighthawk app",
    risk: "Months pass between a patch shipping and it reaching your router.",
    weight: 3,
    critical: false,
  },
  {
    id: "eol-check",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Check the model still receives security firmware",
    detail:
      "Netgear moves older routers to end-of-support and stops issuing fixes. If the newest firmware on the support page is several years old, hardening buys you very little.",
    path: "netgear.com support page for your exact model number",
    risk: "You harden a router that will never be patched for the next bug found in it.",
    weight: 3,
    critical: false,
  },
  {
    id: "config-backup",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Back up the configuration once it is hardened",
    detail:
      "A saved config turns a factory reset after a surge or a failed upgrade into a two-minute restore instead of an evening of re-entering settings.",
    path: "ADVANCED > Administration > Backup Settings",
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
    id: "wfh",
    name: "Work from home",
    description:
      "A work laptop and a company VPN share the line, so anything reachable from the internet matters more.",
    multipliers: {
      "Admin access": 1.3,
      "Wi-Fi encryption": 1,
      "Internet exposure": 1.5,
      "Connected devices": 1.2,
      "Firmware upkeep": 1.3,
    },
  },
  {
    id: "media",
    name: "Media and USB storage heavy",
    description:
      "A drive is plugged into the router for ReadySHARE, and consoles want ports open, so sharing and exposure carry more weight.",
    multipliers: {
      "Admin access": 1.1,
      "Wi-Fi encryption": 1,
      "Internet exposure": 1.6,
      "Connected devices": 1.3,
      "Firmware upkeep": 1.2,
    },
  },
  {
    id: "shop",
    name: "Small shop or clinic",
    description:
      "Customer Wi-Fi, a billing machine and possibly a card terminal sit behind one consumer router.",
    multipliers: {
      "Admin access": 1.3,
      "Wi-Fi encryption": 1.2,
      "Internet exposure": 1.4,
      "Connected devices": 1.4,
      "Firmware upkeep": 1.4,
    },
  },
];

export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Very little left to take. Recheck firmware every quarter." },
  { id: "solid", min: 70, label: "Solid", hint: "The serious holes are closed; tidy the rest when convenient." },
  { id: "partial", min: 40, label: "Partly hardened", hint: "The obvious settings are done, the quiet ones are not." },
  { id: "exposed", min: 0, label: "Exposed", hint: "Factory credentials or a WAN-facing admin page are the likely reason." },
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
 *
 * Unknown ids and duplicates are ignored so a stale saved list cannot inflate
 * the result. An unknown profile falls back to the first one.
 *
 * @param {string[]} doneIds ids from CHECKLIST already applied.
 * @param {string} [profileId] id from PROFILES.
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
 * Firmware age
 *
 * There is no statutory interval for router firmware. The working rule used
 * here is quarterly: consumer vendors including Netgear publish security
 * advisories continuously and ship the fixes only as firmware, so a check every
 * 90 days is the shortest cycle most households will actually keep to. Past a
 * year without a new release, the model is usually out of active support.
 * ------------------------------------------------------------------ */

/** Recommended interval between firmware checks, in days. */
export const CHECK_INTERVAL_DAYS = 90;

const MS_PER_DAY = 86400000;

export const FIRMWARE_BANDS = [
  { id: "current", maxDays: CHECK_INTERVAL_DAYS, label: "Up to date", advice: "Nothing to do. Check again next quarter." },
  { id: "due", maxDays: 180, label: "A check is due", advice: "Open the firmware page and check for a new release." },
  { id: "overdue", maxDays: 365, label: "Overdue", advice: "Several advisory cycles have passed since you last looked." },
  { id: "stale", maxDays: Infinity, label: "Stale — treat as unpatched", advice: "Over a year. Check whether the model is still supported at all." },
];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse a YYYY-MM-DD string into a UTC timestamp, or null if it is not a real date. */
function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = ISO_DATE.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const date = new Date(stamp);
  // Rejects 2026-02-30 and friends, which Date.UTC would silently roll over.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

/**
 * Format a Date as YYYY-MM-DD in local time, for pre-filling a date input.
 * Takes the date as an argument so the module never reads a clock itself.
 *
 * @param {Date} date any Date instance.
 */
export function toIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * How exposed you are by firmware age.
 *
 * days    = whole days between the last check and today
 * missed  = floor(days / 90), the number of quarterly checks that came and went
 *
 * Both dates are arguments, so the function is pure and testable.
 *
 * @param {{lastCheckedISO: string, todayISO: string}} input YYYY-MM-DD dates.
 */
export function firmwareAgeRisk(input) {
  const source = input || {};
  const last = parseIsoDate(source.lastCheckedISO);
  const today = parseIsoDate(source.todayISO);

  if (last === null) {
    return { error: "Enter the date you last checked for firmware as YYYY-MM-DD." };
  }
  if (today === null) {
    return { error: "Enter today's date as YYYY-MM-DD." };
  }
  if (last > today) {
    return { error: "The last firmware check cannot be in the future." };
  }

  const days = Math.round((today - last) / MS_PER_DAY);
  const missedChecks = Math.floor(days / CHECK_INTERVAL_DAYS);
  const band = FIRMWARE_BANDS.find((entry) => days <= entry.maxDays) || FIRMWARE_BANDS[FIRMWARE_BANDS.length - 1];
  const daysUntilDue = Math.max(0, CHECK_INTERVAL_DAYS - days);

  return {
    days,
    months: Math.round((days / 30.4375) * 10) / 10,
    missedChecks,
    daysUntilDue,
    band: band.id,
    bandLabel: band.label,
    advice: band.advice,
    overdue: days > CHECK_INTERVAL_DAYS,
  };
}
