/**
 * JioFiber Router Hardening Checklist — scoring plus the maths on Wi-Fi
 * passphrases built from a mobile number or a date of birth, which is how most
 * ONTs in India are actually configured on installation day.
 *
 * Pure module: no React, no DOM, no clock reads. Every exported function is
 * total: unusable input returns { error } rather than NaN or Infinity.
 */

/** Where the settings live on a Jio Home Gateway / ONT. */
export const DEVICE = {
  vendor: "JioFiber",
  adminUrl: "http://192.168.29.1",
  gateways: ["192.168.29.1", "192.168.1.1"],
  app: "MyJio / JioHome",
  cloudAccount: "Jio account (the registered mobile number)",
  note:
    "Most Jio Home Gateways answer on 192.168.29.1, and the sticker on the underside carries the admin user, the admin password and the factory Wi-Fi key. Jio manages the ONT remotely, so firmware and some WAN settings are not yours to change — the checklist marks those separately.",
};

export const AXES = [
  "Admin access",
  "Wi-Fi encryption",
  "Internet exposure",
  "Connected devices",
  "Vendor-managed",
];

export const GROUPS = [
  "Admin access to the ONT",
  "Wi-Fi",
  "Facing the internet",
  "Devices on your network",
  "What Jio controls, not you",
];

export const CRITICAL_CAP_PERCENT = 60;

export const CHECKLIST = [
  {
    id: "admin-password",
    group: "Admin access to the ONT",
    axis: "Admin access",
    title: "Change the admin password printed on the sticker",
    detail:
      "The factory admin password is printed on the ONT itself, so every visitor, technician and previous tenant who has seen the box has it. Change it to something only you know and keep it in a password manager.",
    path: "192.168.29.1 > log in with the sticker credentials > Administration / Management > Password",
    risk: "Anyone who photographed the box, or is on your Wi-Fi, can log in and change DNS, Wi-Fi and port settings.",
    weight: 8,
    critical: true,
  },
  {
    id: "admin-not-mobile",
    group: "Admin access to the ONT",
    axis: "Admin access",
    title: "Do not use your mobile number as the admin password",
    detail:
      "Your registered number is on the bill, the app, the delivery slip and half your WhatsApp groups. It is the first thing anyone would try, and it is guessed instantly.",
    path: "Administration > Password, and store the new one in a password manager",
    risk: "A number that is public knowledge protects the router that carries your whole household's traffic.",
    weight: 3,
    critical: false,
  },
  {
    id: "myjio-account",
    group: "Admin access to the ONT",
    axis: "Admin access",
    title: "Lock down the MyJio account and the phone it lives on",
    detail:
      "Much of the ONT's configuration is now driven from MyJio rather than the web page, so whoever controls that login controls the router. Keep a screen lock on the phone and treat the OTP as a password.",
    path: "MyJio app > profile and device settings, plus a screen lock on the handset",
    risk: "Someone with your unlocked phone changes the Wi-Fi password and sees every connected device.",
    weight: 3,
    critical: false,
  },
  {
    id: "wpa-mode",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Keep Wi-Fi security on WPA2-PSK (AES) or WPA2/WPA3",
    detail:
      "Some ONT interfaces still offer WEP or a mixed WPA/WPA2-TKIP mode for old devices. Both are broken; WPA2 with AES is the floor, and WPA2/WPA3 mixed is better if your devices support it.",
    path: "192.168.29.1 > Wireless / WLAN > Security > WPA2-PSK (AES)",
    risk: "Traffic is decrypted from a passive capture, or the network is joined without the key at all.",
    weight: 7,
    critical: true,
  },
  {
    id: "wifi-not-phone-number",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Replace a phone-number or birthday Wi-Fi password",
    detail:
      "Installers routinely set the Wi-Fi key to the customer's mobile number, and households often change it to a birthday. Both collapse the search space by orders of magnitude — the calculator below shows by how much.",
    path: "Wireless > WLAN > WPA Pre-Shared Key, or MyJio > Wi-Fi settings",
    risk: "A captured handshake is cracked in minutes because the key is a ten-digit number with a known first digit.",
    weight: 7,
    critical: true,
  },
  {
    id: "wifi-length",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Use twelve or more mixed characters",
    detail:
      "A WPA2 handshake is captured in seconds and attacked offline at full GPU speed, so length is the only defence that scales. Twelve mixed characters puts brute force beyond practical reach.",
    path: "Wireless > WLAN > WPA Pre-Shared Key",
    risk: "A short key falls to an overnight offline attack even when it is not a phone number.",
    weight: 5,
    critical: false,
  },
  {
    id: "ssid-not-default",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Rename the SSID away from JioFiber-XXXX",
    detail:
      "A default SSID tells anyone in range which ISP and which ONT model you have, and in a crowded building it also tells them which flat to try. Do not use your name or flat number instead.",
    path: "Wireless > WLAN > SSID Name, or MyJio > Wi-Fi settings",
    risk: "Your hardware and provider are advertised to the whole building, along with which defaults to try.",
    weight: 2,
    critical: false,
  },
  {
    id: "wps-off",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Turn WPS off if the ONT offers it",
    detail:
      "The eight-digit WPS PIN is validated in two halves, cutting a 100 million combination search to about 11,000 attempts. Where the option exists on a Jio ONT, switch it off.",
    path: "Wireless > WPS > Disable",
    risk: "The Wi-Fi key is recovered through WPS in hours regardless of how long it is.",
    weight: 5,
    critical: true,
  },
  {
    id: "guest-wifi",
    group: "Wi-Fi",
    axis: "Connected devices",
    title: "Give neighbours and visitors a guest SSID, not your main key",
    detail:
      "Sharing a JioFiber connection with a neighbour or a paying guest is common. A guest SSID with its own password keeps them off your laptops, and can be changed without re-pairing every device you own.",
    path: "Wireless > Guest Network / Guest SSID, where the model provides it",
    risk: "Everyone you have ever shared the connection with can reach your file shares and cameras.",
    weight: 3,
    critical: false,
  },
  {
    id: "wifi-rotate",
    group: "Wi-Fi",
    axis: "Wi-Fi encryption",
    title: "Rotate the Wi-Fi key when someone moves out",
    detail:
      "Phones keep a saved Wi-Fi key for years. A flatmate, tenant or ex-neighbour who moved out still connects automatically the moment they are in range.",
    path: "Wireless > WPA Pre-Shared Key, then reconnect your own devices",
    risk: "Someone with no current claim on your connection keeps silent access to the network.",
    weight: 3,
    critical: false,
  },
  {
    id: "remote-admin-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Confirm remote web administration is off",
    detail:
      "Some ONT firmware exposes the admin page on the WAN side under a remote-management or WAN-access setting. Jio's own management runs over its provisioning channel and does not need this to be on.",
    path: "Administration / Management > Remote Access or Access Control",
    risk: "The login page is reachable from outside the house and attracts automated attacks.",
    weight: 6,
    critical: true,
  },
  {
    id: "port-forward-audit",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Clear port forwards and any DMZ host you no longer use",
    detail:
      "Forwards set up for a CCTV app or a game usually still point at a device nobody patches. If your plan includes a static public IP, those forwards are reachable from the entire internet.",
    path: "Advanced > NAT > Port Forwarding / Virtual Server, and DMZ",
    risk: "An unpatched DVR or camera on a forwarded port becomes a foothold inside the network.",
    weight: 4,
    critical: false,
  },
  {
    id: "upnp-off",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Turn UPnP off unless a console needs it",
    detail:
      "UPnP lets any program on the LAN open an inbound port with no prompt and no record you would notice. Consoles want it; almost nothing else has a good reason to.",
    path: "Advanced > NAT > UPnP",
    risk: "Malware on a laptop publishes its own inbound port through the ONT's firewall.",
    weight: 3,
    critical: false,
  },
  {
    id: "cgnat-understanding",
    group: "Facing the internet",
    axis: "Internet exposure",
    title: "Know whether your plan has a public IP or sits behind CGNAT",
    detail:
      "Standard JioFiber connections are behind carrier-grade NAT, which blocks unsolicited inbound traffic and is a genuine security benefit. A static public IP is a paid add-on, and taking it makes every open port reachable from the internet.",
    path: "Compare the WAN IP shown in the ONT with the address any 'what is my IP' page reports",
    risk: "You assume you are unreachable from outside while a paid static IP is publishing every forward you set.",
    weight: 3,
    critical: false,
  },
  {
    id: "dns-explicit",
    group: "Devices on your network",
    axis: "Connected devices",
    title: "Note the DNS servers the ONT is handing out",
    detail:
      "Changing router DNS is the quietest attack there is: every device follows it and nothing looks broken. Knowing the value your ONT normally hands out is what makes a change visible.",
    path: "Status / LAN > DHCP settings > DNS servers",
    risk: "A tampered DNS entry sends a banking domain to a look-alike site on every device at once.",
    weight: 2,
    critical: false,
  },
  {
    id: "client-review",
    group: "Devices on your network",
    axis: "Connected devices",
    title: "Read the connected-device list and name everything",
    detail:
      "The MyJio app and the ONT status page both list connected clients. Naming each one turns the list into something you can scan in ten seconds.",
    path: "MyJio > connected devices, or 192.168.29.1 > Status > LAN clients",
    risk: "An unknown device sits on the network for months because the list was never legible.",
    weight: 3,
    critical: false,
  },
  {
    id: "iot-segmented",
    group: "Devices on your network",
    axis: "Connected devices",
    title: "Keep cameras, TVs and smart plugs on the guest SSID",
    detail:
      "Cheap smart devices stop receiving firmware after a year or two. Keeping them off the network holding your laptop limits what a compromised device can reach.",
    path: "Wireless > Guest Network, used as an IoT network",
    risk: "An abandoned camera firmware becomes the route into the machine with your documents on it.",
    weight: 2,
    critical: false,
  },
  {
    id: "stb-and-landline",
    group: "Devices on your network",
    axis: "Connected devices",
    title: "Account for the set-top box and landline handset",
    detail:
      "The Jio set-top box and the FXS landline port are part of the same gateway. They belong on your device inventory even though you never configure them, so an unexpected extra entry stands out.",
    path: "Status > LAN clients, and the physical ports on the ONT",
    risk: "An unrecognised device is dismissed as 'probably the set-top box' and never investigated.",
    weight: 1,
    critical: false,
  },
  {
    id: "firmware-vendor-managed",
    group: "What Jio controls, not you",
    axis: "Vendor-managed",
    title: "Accept that firmware is pushed by Jio, and chase it if the ONT is old",
    detail:
      "You cannot flash a Jio ONT yourself; updates arrive over the provider's management channel. What you can do is raise a service request for a swap if the unit is several years old or misbehaving.",
    path: "MyJio > Support > Service Request, or the JioFiber helpline",
    risk: "An ageing ONT runs whatever firmware it last received, with no way for you to update it.",
    weight: 5,
    critical: true,
  },
  {
    id: "tr069-understanding",
    group: "What Jio controls, not you",
    axis: "Vendor-managed",
    title: "Leave the provider's remote management channel alone",
    detail:
      "The ONT keeps a management link to Jio for provisioning and firmware. Disabling it, where the interface even allows it, breaks support and stops future updates — this is one control worth leaving in the provider's hands.",
    path: "Nothing to change — recognise it in the interface and do not disable it",
    risk: "You break provisioning and firmware delivery while gaining nothing an attacker could not already do.",
    weight: 2,
    critical: false,
  },
  {
    id: "technician-visit",
    group: "What Jio controls, not you",
    axis: "Vendor-managed",
    title: "Re-check the settings after any technician visit",
    detail:
      "Field visits often reset the ONT or restore defaults to fix a fault, which quietly undoes the admin password and Wi-Fi key you set. Ten minutes afterwards saves a year of exposure.",
    path: "Re-run this checklist after every service call or replacement",
    risk: "A repair puts the sticker password and default Wi-Fi key back without anyone mentioning it.",
    weight: 3,
    critical: false,
  },
  {
    id: "ont-physical",
    group: "What Jio controls, not you",
    axis: "Vendor-managed",
    title: "Keep the ONT where casual visitors cannot read the sticker",
    detail:
      "Every default on the box is printed on its underside, and the reset pinhole is on the same panel. A shelf inside the house beats a shoe rack by the front door.",
    path: "Physical placement, and photograph the sticker once for your own records",
    risk: "A visitor reads the admin password off the box, or holds the reset pin and undoes everything.",
    weight: 2,
    critical: false,
  },
];

export const PROFILES = [
  {
    id: "home",
    name: "Ordinary home connection",
    description: "A family flat with phones, a TV and a couple of laptops. Balanced weighting.",
    multipliers: {
      "Admin access": 1,
      "Wi-Fi encryption": 1,
      "Internet exposure": 1,
      "Connected devices": 1,
      "Vendor-managed": 1,
    },
  },
  {
    id: "shared",
    name: "Shared with neighbours or tenants",
    description:
      "The connection is split with a neighbour, a PG or tenants, so Wi-Fi control and device visibility dominate.",
    multipliers: {
      "Admin access": 1.2,
      "Wi-Fi encryption": 1.6,
      "Internet exposure": 0.8,
      "Connected devices": 1.5,
      "Vendor-managed": 1,
    },
  },
  {
    id: "wfh",
    name: "Work from home",
    description:
      "A work laptop and a company VPN share the line, so admin access and anything internet-facing matter more.",
    multipliers: {
      "Admin access": 1.3,
      "Wi-Fi encryption": 1.1,
      "Internet exposure": 1.5,
      "Connected devices": 1.2,
      "Vendor-managed": 1.2,
    },
  },
  {
    id: "static-ip",
    name: "Static public IP plan",
    description:
      "A paid static IP means no CGNAT shield, so every forwarded port is reachable from the whole internet.",
    multipliers: {
      "Admin access": 1.3,
      "Wi-Fi encryption": 1,
      "Internet exposure": 2,
      "Connected devices": 1.1,
      "Vendor-managed": 1.3,
    },
  },
];

export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Very little left. Re-check after any technician visit." },
  { id: "solid", min: 70, label: "Solid", hint: "The serious holes are closed; tidy the rest when convenient." },
  { id: "partial", min: 40, label: "Partly hardened", hint: "The obvious settings are done, the quiet ones are not." },
  { id: "exposed", min: 0, label: "Exposed", hint: "The sticker password or a phone-number Wi-Fi key is the likely reason." },
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
 * How long a patterned Wi-Fi passphrase survives
 *
 * WPA2-Personal derives its key with PBKDF2-HMAC-SHA1 over 4096 iterations
 * (IEEE 802.11i), and published hashcat benchmarks for mode 22000 put one
 * current high-end consumer GPU at roughly 2 million candidates per second.
 *
 * The point of this table is that an attacker does not brute-force character by
 * character when the passphrase follows a pattern. An Indian mobile number is
 * ten digits that must start with 6, 7, 8 or 9 under the national numbering
 * plan, so the space is 4 x 10^9 — not 10^10, and nothing like 95^10.
 * ------------------------------------------------------------------ */

/** PBKDF2 iterations fixed by IEEE 802.11i for WPA/WPA2-Personal. */
export const WPA2_PBKDF2_ITERATIONS = 4096;

/** Candidate passphrases per second on one current high-end consumer GPU. */
export const GPU_GUESSES_PER_SECOND = 2e6;

/** First digits allowed for an Indian mobile number under the numbering plan. */
export const INDIAN_MOBILE_FIRST_DIGITS = 4;

export const PATTERNS = [
  {
    id: "mobile-10",
    label: "Your 10-digit mobile number",
    candidates: INDIAN_MOBILE_FIRST_DIGITS * 1e9,
    why: "Ten digits, but the first must be 6, 7, 8 or 9, so the space is 4 x 10^9 rather than 10^10.",
  },
  {
    id: "mobile-known-prefix",
    label: "A mobile number whose first 4 digits are known",
    candidates: 1e6,
    why: "Operator series are public and a single leaked contact fixes the prefix, leaving six free digits.",
  },
  {
    id: "dob-8",
    label: "A date of birth as ddmmyyyy",
    candidates: 36525,
    why: "Eight digits look like 10^8 candidates, but only about 36,525 of them are real dates in a century.",
  },
  {
    id: "digits-8",
    label: "Any 8 random digits",
    candidates: 1e8,
    why: "No letters at all, so each character contributes only 3.3 bits.",
  },
  {
    id: "lower-8",
    label: "8 random lower-case letters",
    candidates: Math.pow(26, 8),
    why: "26^8. The classic WPA2 minimum, and the classic overnight crack.",
  },
  {
    id: "name-plus-4",
    label: "A common name followed by 4 digits",
    candidates: 5000 * 1e4,
    why: "Cracking wordlists carry tens of thousands of Indian names; four appended digits add only 10^4.",
  },
  {
    id: "mixed-12",
    label: "12 random characters, mixed case with digits and a symbol",
    candidates: Math.pow(95, 12),
    why: "95^12. This is the point at which brute force stops being the attacker's plan.",
  },
];

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const YEAR = 31557600; // 365.25 days

/** Human-readable duration; no locale surprises, no Infinity. */
export function humanDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "unknown";
  if (seconds < 1) return "under a second";
  if (seconds < MINUTE) return `${Math.round(seconds)} seconds`;
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
 * Offline crack time for a search space of a given size.
 *
 * seconds = (candidates / 2) / (rate x gpus)
 *
 * The halving is the average case for an exhaustive search.
 *
 * @param {number} candidates size of the search space.
 * @param {number} [gpus] number of attacking GPUs, default 1.
 */
export function crackTimeForSpace(candidates, gpus) {
  const space = Number(candidates);
  if (!Number.isFinite(space)) {
    return { error: "The search space must be a number." };
  }
  if (space < 1) {
    return { error: "The search space must be at least one candidate." };
  }
  const rigRaw = gpus === undefined ? 1 : Number(gpus);
  if (!Number.isFinite(rigRaw) || rigRaw <= 0) {
    return { error: "The number of attacking GPUs must be a positive number." };
  }
  const rig = Math.min(1000, rigRaw);
  const rate = GPU_GUESSES_PER_SECOND * rig;
  const seconds = space / 2 / rate;
  return {
    candidates: space,
    gpus: rig,
    rate,
    seconds,
    human: humanDuration(seconds),
    bits: Math.round(Math.log2(space) * 10) / 10,
  };
}

/**
 * Crack time for one of the named patterns above.
 *
 * @param {string} patternId id from PATTERNS.
 * @param {number} [gpus] number of attacking GPUs.
 */
export function patternCrackTime(patternId, gpus) {
  const pattern = PATTERNS.find((entry) => entry.id === patternId);
  if (!pattern) {
    return { error: "Choose one of the listed passphrase patterns." };
  }
  const result = crackTimeForSpace(pattern.candidates, gpus);
  if (result.error) return result;
  return { ...result, pattern };
}

/** Every pattern costed at once, for the comparison table. */
export function patternTable(gpus) {
  const probe = crackTimeForSpace(PATTERNS[0].candidates, gpus);
  if (probe.error) return probe;
  return PATTERNS.map((pattern) => {
    const result = crackTimeForSpace(pattern.candidates, gpus);
    return { ...pattern, ...result };
  });
}
