/**
 * Asus (ASUSWRT) Router Hardening Checklist — scoring and WAN exposure index.
 *
 * Pure module: no React, no DOM, no clock reads. Same input, same output.
 * Every exported function is total: unusable input returns { error } instead of
 * NaN, Infinity or a number that reads like a real answer.
 */

/** Where the settings live on a current ASUSWRT web UI. */
export const DEVICE = {
  vendor: "Asus",
  adminUrl: "http://router.asus.com",
  gateways: ["192.168.1.1", "192.168.50.1"],
  app: "ASUS Router app",
  cloudAccount: "ASUS account / ASUS DDNS",
  note:
    "ASUSWRT answers on router.asus.com and usually 192.168.1.1 (192.168.50.1 on newer models). Older units shipped with admin as both username and password; the setup wizard on current firmware forces a change, and the label on the base is authoritative.",
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
    title: "Change the admin username as well as the password",
    detail:
      "ASUSWRT lets you rename the admin account, not just repassword it. Moving away from the literal username admin defeats every credential-stuffing script that only ever tries that one name.",
    path: "router.asus.com > Administration > System > Router Login Name / New Password",
    risk: "A device already on your Wi-Fi guesses admin/admin and takes over the router in one attempt.",
    weight: 8,
    critical: true,
  },
  {
    id: "two-step-verification",
    group: "Admin account",
    axis: "Admin access",
    title: "Turn on Two-Step Verification for the router login",
    detail:
      "Recent ASUSWRT firmware adds 2SV using an authenticator app or email for the web UI and the ASUS Router app. It is the single strongest control on this list after the password itself.",
    path: "Administration > System > Two-Step Verification (2SV)",
    risk: "A leaked or guessed admin password is enough on its own to reconfigure the router.",
    weight: 4,
    critical: false,
  },
  {
    id: "login-protection",
    group: "Admin account",
    axis: "Admin access",
    title: "Enable login captcha and the brute-force lockout",
    detail:
      "ASUSWRT can require a captcha at login and lock the interface after a set number of failures. Both make an automated password-guessing run against the LAN interface impractical.",
    path: "Administration > System > Enable login captcha / Login Lockout",
    risk: "A compromised laptop grinds through a password list against the admin page unattended.",
    weight: 2,
    critical: false,
  },
  {
    id: "https-only-admin",
    group: "Admin account",
    axis: "Admin access",
    title: "Set the authentication method to HTTPS",
    detail:
      "By default the admin page is served over plain HTTP, so the password crosses the LAN in the clear. Switching the authentication method to HTTPS encrypts that, at the cost of a certificate warning.",
    path: "Administration > System > Authentication Method > HTTPS",
    risk: "Anyone sniffing the local network reads your admin password as you type it.",
    weight: 2,
    critical: false,
  },
  {
    id: "wpa-mode",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Set WPA2-Personal (AES) or WPA2/WPA3-Personal",
    detail:
      "ASUSWRT still offers WEP and TKIP for legacy devices. Both are broken. WPA2-Personal with AES is the floor; WPA2/WPA3 mixed adds WPA3 for devices that support it without stranding older kit.",
    path: "Wireless > General > Authentication Method (per band)",
    risk: "Traffic is decrypted from a passive capture, or the network is joined without the key at all.",
    weight: 7,
    critical: true,
  },
  {
    id: "wifi-passphrase",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Use a long WPA passphrase, not the one on the label",
    detail:
      "A WPA2 handshake is captured in seconds and attacked offline at full GPU speed, so length is the only real defence. Twelve or more mixed characters puts brute force out of reach.",
    path: "Wireless > General > WPA Pre-Shared Key",
    risk: "A captured handshake is cracked overnight and the network is joined at will.",
    weight: 6,
    critical: true,
  },
  {
    id: "wps-off",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Disable WPS entirely",
    detail:
      "The eight-digit WPS PIN is validated in two halves, cutting the search from 100 million combinations to roughly 11,000. Vulnerable chipsets fall to the offline Pixie Dust attack in seconds.",
    path: "Wireless > WPS > Enable WPS > OFF",
    risk: "The Wi-Fi passphrase is recovered through WPS in hours regardless of its length.",
    weight: 5,
    critical: true,
  },
  {
    id: "ssid-not-default",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Rename the SSID away from ASUS or ASUS_5G",
    detail:
      "A default SSID names the vendor for anyone in range, which narrows the list of exploits worth trying. Do not replace it with your surname or flat number either.",
    path: "Wireless > General > SSID (each band)",
    risk: "Your router brand is advertised to the street along with which published bug applies.",
    weight: 2,
    critical: false,
  },
  {
    id: "guest-network",
    group: "Wi-Fi",
    axis: "Connected devices",
    title: "Use Guest Network with intranet access off",
    detail:
      "ASUSWRT's guest network has an 'Access Intranet' setting that defaults to off — confirm it. Guest Network Pro on newer firmware goes further and puts guests or IoT devices on their own VLAN.",
    path: "Guest Network (or Guest Network Pro) > Access Intranet > Disable",
    risk: "A visitor's phone reaches your NAS, printer and cameras as though it were your own laptop.",
    weight: 3,
    critical: false,
  },
  {
    id: "wan-admin-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Turn off Web Access from WAN",
    detail:
      "This publishes the ASUSWRT login page on the public internet. Every mass-exploitation campaign against Asus routers has needed some internet-reachable service; this is the most direct one.",
    path: "Administration > System > Enable Web Access from WAN > No",
    risk: "Scanners find your admin page within hours and try every published exploit for ASUSWRT.",
    weight: 7,
    critical: true,
  },
  {
    id: "aicloud-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Switch AiCloud off unless you genuinely use it",
    detail:
      "AiCloud publishes USB storage to the internet through your ASUS DDNS name. It has carried repeated authentication-bypass advisories — ASUS issued one for multiple firmware branches in 2025 — and most owners enabled it once and never used it.",
    path: "AiCloud 2.0 > Cloud Disk / Smart Access / Smart Sync > OFF",
    risk: "Your router's file service is reachable from the internet and falls to a published bypass.",
    weight: 6,
    critical: true,
  },
  {
    id: "ssh-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Disable SSH from WAN and check the authorised keys list",
    detail:
      "A 2025 campaign backdoored thousands of ASUS routers by adding an attacker's SSH public key through the normal settings, which survived firmware updates because it was a legitimate stored setting. Read that box; it should be empty or hold only your key.",
    path: "Administration > System > Enable SSH > No, and clear unknown entries under SSH Authorized Keys",
    risk: "A key planted during an earlier compromise keeps giving shell access after every update and reboot.",
    weight: 6,
    critical: true,
  },
  {
    id: "upnp-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Turn UPnP off unless a console needs it",
    detail:
      "UPnP lets any program on the LAN open an inbound port with no prompt and no record you would notice. Consoles want it; almost nothing else has a good reason to.",
    path: "WAN > Internet Connection > Enable UPnP > No",
    risk: "Malware on a laptop quietly publishes its own remote-access port through the firewall.",
    weight: 4,
    critical: false,
  },
  {
    id: "port-forward-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Clear stale port forwards and switch off DMZ",
    detail:
      "Forwards added for an old camera or game server usually still point at something nobody patches. DMZ is worse — it forwards every unsolicited packet to one machine.",
    path: "WAN > Virtual Server / Port Forwarding, and WAN > DMZ",
    risk: "An unpatched camera on a forwarded port becomes a permanent foothold inside your network.",
    weight: 4,
    critical: false,
  },
  {
    id: "ddns-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Drop the ASUS DDNS name if nothing needs it",
    detail:
      "ASUS DDNS gives your connection a permanent yourname.asuscomm.com address. That is convenient for you and equally convenient for anyone who wants to keep finding you after the IP changes.",
    path: "WAN > DDNS > Enable the DDNS Client > No",
    risk: "Your home network keeps a stable, guessable name that survives every IP change.",
    weight: 2,
    critical: false,
  },
  {
    id: "vpn-instead",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Use the built-in VPN server instead of opening ports",
    detail:
      "ASUSWRT includes OpenVPN, IPSec and on newer models WireGuard. One authenticated tunnel replaces every port forward you were tempted to add for remote access.",
    path: "VPN > VPN Server",
    risk: "You keep punching holes in the firewall for each service you want to reach from outside.",
    weight: 3,
    critical: false,
  },
  {
    id: "usb-share-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Turn off anonymous access to USB shares",
    detail:
      "Samba and FTP sharing on the USB port can be left open to guest logins, which means every device on the network can read the drive without a password.",
    path: "USB Application > Servers Center > Samba / FTP > Allow guest login > No",
    risk: "The backup drive on the router is readable by any device on the LAN, and possibly from outside.",
    weight: 2,
    critical: false,
  },
  {
    id: "aiprotection",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Enable AiProtection and run the router security scan",
    detail:
      "AiProtection is free on most Asus models and its Router Security Assessment flags exactly the settings on this list — open WAN access, weak passwords, enabled WPS — from the router's own point of view.",
    path: "AiProtection > Router Security Assessment, then enable Malicious Sites Blocking",
    risk: "You miss a setting that the router itself could have flagged in one scan.",
    weight: 3,
    critical: false,
  },
  {
    id: "dns-explicit",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Set the WAN DNS servers deliberately",
    detail:
      "Changing router DNS is the quietest attack there is: every device follows it and nothing looks broken. Knowing the value you chose is what makes tampering visible later.",
    path: "WAN > Internet Connection > Connect to DNS Server automatically > No",
    risk: "A tampered DNS entry sends your bank's domain to a look-alike site on every device at once.",
    weight: 2,
    critical: false,
  },
  {
    id: "client-review",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Read the Network Map client list and name every device",
    detail:
      "Naming each client once makes the list scannable in ten seconds. The unnamed device that reappears at odd hours is the signal you are looking for.",
    path: "Network Map > Clients (View List)",
    risk: "An unknown device sits on the network for months because the list was never legible.",
    weight: 3,
    critical: false,
  },
  {
    id: "iot-segmented",
    group: "Devices on your LAN",
    axis: "Connected devices",
    title: "Put cameras, TVs and smart plugs on their own network",
    detail:
      "Cheap smart devices stop getting firmware after a year or two. Guest Network Pro can give them a separate SSID and VLAN so a compromised bulb cannot reach your laptop.",
    path: "Guest Network Pro > IoT Network (or a dedicated guest SSID)",
    risk: "An abandoned camera firmware becomes the route into the machine holding your documents.",
    weight: 2,
    critical: false,
  },
  {
    id: "firmware-current",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Install the current firmware and enable auto-upgrade",
    detail:
      "Asus ships security fixes only as firmware and publishes them on the product support page. Newer ASUSWRT can install them automatically, which is the only schedule most households keep.",
    path: "Administration > Firmware Upgrade > Check / Auto Firmware Upgrade",
    risk: "A documented remote-code-execution flaw for your exact model stays open indefinitely.",
    weight: 7,
    critical: true,
  },
  {
    id: "eol-check",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Check the model is still receiving firmware",
    detail:
      "If the newest release on the ASUS support page for your model is years old, the device is effectively end-of-life. No setting compensates for a bug that will never be patched.",
    path: "asus.com support page for your exact model",
    risk: "You harden a router that will never receive a fix for the next flaw found in it.",
    weight: 3,
    critical: false,
  },
  {
    id: "post-compromise-reset",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Factory reset if you suspect the router was ever compromised",
    detail:
      "Because attacks like the 2025 SSH-key campaign hide inside legitimate settings, updating firmware does not remove them. A factory reset followed by manual reconfiguration does.",
    path: "Administration > Restore/Save/Upload Setting > Factory default, then set up by hand",
    risk: "A backdoor stored as an ordinary setting survives every update you install afterwards.",
    weight: 3,
    critical: false,
  },
  {
    id: "config-backup",
    group: "Firmware and lifecycle",
    axis: "Firmware upkeep",
    title: "Back up the configuration once it is clean and hardened",
    detail:
      "A saved config makes a factory reset a two-minute restore instead of an evening. Take it only after the reset-and-reconfigure above, never from a state you are unsure about.",
    path: "Administration > Restore/Save/Upload Setting > Save setting",
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
    id: "remote-access",
    name: "Remote access enthusiast",
    description:
      "AiCloud, DDNS, port forwards or a home server are in use, so everything facing the internet carries far more weight.",
    multipliers: {
      "Admin access": 1.3,
      "Wi-Fi encryption": 0.9,
      "Internet exposure": 1.8,
      "Connected devices": 1.1,
      "Firmware upkeep": 1.4,
    },
  },
  {
    id: "wfh",
    name: "Work from home",
    description:
      "A work laptop and a company VPN share the line, so admin access and internet exposure matter more.",
    multipliers: {
      "Admin access": 1.3,
      "Wi-Fi encryption": 1,
      "Internet exposure": 1.5,
      "Connected devices": 1.2,
      "Firmware upkeep": 1.3,
    },
  },
  {
    id: "smart-home",
    name: "Smart home with many IoT devices",
    description:
      "Dozens of cameras, plugs and speakers, most of them out of support, so segmentation dominates.",
    multipliers: {
      "Admin access": 1.1,
      "Wi-Fi encryption": 1.2,
      "Internet exposure": 1.2,
      "Connected devices": 1.6,
      "Firmware upkeep": 1.3,
    },
  },
];

export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Very little left to take. Recheck firmware every quarter." },
  { id: "solid", min: 70, label: "Solid", hint: "The serious holes are closed; tidy the rest when convenient." },
  { id: "partial", min: 40, label: "Partly hardened", hint: "The obvious settings are done, the quiet ones are not." },
  { id: "exposed", min: 0, label: "Exposed", hint: "WAN access, AiCloud or default credentials are the likely reason." },
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
 * WAN exposure index
 *
 * This is an index, not a standard: it adds up the services you have chosen to
 * publish, each weighted by how directly it hands over control of the router or
 * of a device behind it, and expresses the total as a share of the maximum.
 *
 * The weights follow one rule — a service that grants an interactive session on
 * the router (admin UI, SSH, Telnet) outranks one that exposes files (AiCloud,
 * FTP), which outranks one that merely makes you findable (DDNS).
 * ------------------------------------------------------------------ */

/** Points per published port forward, and the number of forwards that maxes it out. */
export const PORT_FORWARD_WEIGHT = 2;
export const PORT_FORWARD_CAP = 5;

/**
 * Carrier-grade NAT puts thousands of subscribers behind one public IPv4, so
 * unsolicited inbound connections do not reach you at all. It reduces, but does
 * not erase, inbound risk: IPv6 is routed end to end where the ISP enables it.
 */
export const CGNAT_FACTOR = 0.3;

export const WAN_SERVICES = [
  {
    id: "wanAdmin",
    label: "Web access from WAN (admin page on the internet)",
    weight: 10,
    inbound: true,
    fix: "Administration > System > Enable Web Access from WAN > No",
  },
  {
    id: "telnet",
    label: "Telnet enabled",
    weight: 10,
    inbound: true,
    fix: "Administration > System > Enable Telnet > No",
  },
  {
    id: "ssh",
    label: "SSH reachable from the WAN",
    weight: 9,
    inbound: true,
    fix: "Administration > System > Enable SSH > No (or LAN only)",
  },
  {
    id: "dmz",
    label: "A DMZ host is set",
    weight: 9,
    inbound: true,
    fix: "WAN > DMZ > remove the IP address",
  },
  {
    id: "aicloud",
    label: "AiCloud (Cloud Disk / Smart Access) on",
    weight: 8,
    inbound: true,
    fix: "AiCloud 2.0 > switch all three services off",
  },
  {
    id: "ftp",
    label: "FTP server on the USB share published",
    weight: 7,
    inbound: true,
    fix: "USB Application > Servers Center > FTP > off, or LAN only",
  },
  {
    id: "upnp",
    label: "UPnP enabled",
    weight: 5,
    inbound: true,
    fix: "WAN > Internet Connection > Enable UPnP > No",
  },
  {
    id: "ddns",
    label: "ASUS DDNS name active",
    weight: 2,
    inbound: false,
    fix: "WAN > DDNS > Enable the DDNS Client > No",
  },
];

/** Maximum score: every service on, plus a full complement of port forwards. */
export const MAX_EXPOSURE_POINTS =
  WAN_SERVICES.reduce((sum, service) => sum + service.weight, 0) +
  PORT_FORWARD_WEIGHT * PORT_FORWARD_CAP;

export const EXPOSURE_BANDS = [
  { id: "closed", max: 0, label: "Nothing published", advice: "Your router presents no chosen service to the internet." },
  { id: "small", max: 20, label: "Small footprint", advice: "One or two services. Confirm each is still needed." },
  { id: "significant", max: 50, label: "Significant footprint", advice: "Enough is published that firmware age now matters a great deal." },
  { id: "wide", max: Infinity, label: "Wide open", advice: "Interactive access to the router itself is reachable from the internet." },
];

/**
 * Index the services you are publishing to the internet.
 *
 * points = sum of the weights of enabled services, plus PORT_FORWARD_WEIGHT per
 *          forward up to PORT_FORWARD_CAP forwards
 * index  = round(100 x points / MAX_EXPOSURE_POINTS)
 *
 * Behind CGNAT, every inbound-facing weight is multiplied by CGNAT_FACTOR.
 *
 * @param {object} state one boolean per WAN_SERVICES id, plus
 *   { portForwards?: number, cgnat?: boolean }.
 */
export function wanExposureIndex(state) {
  if (state === null || typeof state !== "object" || Array.isArray(state)) {
    return { error: "Provide the enabled services as an object." };
  }

  const forwardsRaw = state.portForwards === undefined ? 0 : Number(state.portForwards);
  if (!Number.isFinite(forwardsRaw)) {
    return { error: "The number of port forwards must be a number." };
  }
  if (forwardsRaw < 0) {
    return { error: "The number of port forwards cannot be negative." };
  }

  const cgnat = state.cgnat === true;
  const factor = cgnat ? CGNAT_FACTOR : 1;

  let points = 0;
  const published = [];
  for (const service of WAN_SERVICES) {
    if (state[service.id] !== true) continue;
    published.push(service);
    points += service.inbound ? service.weight * factor : service.weight;
  }

  const countedForwards = Math.min(Math.floor(forwardsRaw), PORT_FORWARD_CAP);
  const forwardPoints = countedForwards * PORT_FORWARD_WEIGHT * factor;
  points += forwardPoints;

  if (!(MAX_EXPOSURE_POINTS > 0)) {
    return { error: "No services are defined for this index." };
  }

  const index = Math.round((points / MAX_EXPOSURE_POINTS) * 100);
  const band = EXPOSURE_BANDS.find((entry) => index <= entry.max) || EXPOSURE_BANDS[EXPOSURE_BANDS.length - 1];
  const worst = published.slice().sort((a, b) => b.weight - a.weight)[0] || null;

  return {
    points: Math.round(points * 100) / 100,
    maxPoints: MAX_EXPOSURE_POINTS,
    index,
    band: band.id,
    bandLabel: band.label,
    advice: band.advice,
    published,
    portForwards: Math.floor(forwardsRaw),
    countedForwards,
    cgnat,
    worst,
  };
}
