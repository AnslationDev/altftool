/**
 * BSNL broadband router / ONT hardening — checklist data and scoring.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * Facts the copy relies on:
 *  - WPS: the 8-digit external registrar PIN is validated in two halves, cutting a
 *    brute force from 10^8 to 10^4 + 10^3 = 11,000 attempts (Viehbock, 2011,
 *    US-CERT VU 723755).
 *  - WPA2-PSK passphrases are 8-63 ASCII characters (IEEE 802.11i).
 *  - TR-069 / CWMP, the ISP provisioning protocol, conventionally listens on TCP
 *    7547; a Mirai variant abused exposed CWMP in November 2016 and took roughly
 *    900,000 Deutsche Telekom routers offline.
 *  - Telnet (TCP 23) carries credentials in plaintext and has no transport
 *    encryption at all; it is the protocol most commonly used by IoT botnets to
 *    spread between routers.
 *  - UPnP IGD is unauthenticated by design.
 *  - BSNL supplies ONTs and modems from Nokia, ZTE, Syrotech, DBC, Netlink and
 *    Genexis among others; they conventionally answer at http://192.168.1.1.
 */

/** Points awarded per severity. Weighting, not a real-world unit. */
export const SEVERITY_POINTS = { critical: 10, high: 6, medium: 3 };

/** Score bands, checked highest-first. */
export const SCORE_BANDS = [
  { min: 90, key: "hardened", label: "Hardened" },
  { min: 70, key: "good", label: "Good, finish the rest" },
  { min: 40, key: "weak", label: "Weak" },
  { min: 0, key: "exposed", label: "Exposed" },
];

const BAND_ORDER = ["exposed", "weak", "good", "hardened"];

/** With any critical step still open the result can never read better than this. */
export const OPEN_CRITICAL_BAND_CAP = "weak";

/** Ports named in the checklist copy. */
export const TELNET_PORT = 23;
export const CWMP_PORT = 7547;

export const ROUTER_MODEL_NOTE =
  "BSNL Bharat Fiber installs Nokia, ZTE, Syrotech, DBC, Netlink and Genexis ONTs, and older ADSL lines still run Teracom, Huawei and Syrotech modems. Menu wording differs; every setting below exists on all of them.";

export const ADMIN_URL = "http://192.168.1.1";

export const HARDENING_STEPS = [
  {
    id: "admin-accounts",
    title: "Change every admin account, not just the one you logged in with",
    group: "Admin access",
    severity: "critical",
    minutes: 10,
    why: "BSNL modems and ONTs commonly ship with a user account on admin/admin and a second, higher-privilege technician account that the customer is never told about. Changing only the account you can see leaves the more powerful one on its factory password.",
    how: `Sign in at ${ADMIN_URL}, then Management → User Management (or Maintenance → Account) and change the password on every account listed. Where an account cannot be edited, note its name and raise it with the BSNL exchange.`,
    verify: "admin/admin is rejected, and you have a written note of any account you could not change.",
  },
  {
    id: "wifi-passphrase",
    title: "Replace the factory Wi-Fi key",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "The key on the sticker is known to the installer and to anyone who has looked at the underside of the box, and on several ONT families it is derived from the serial number. WPA2-PSK accepts 8 to 63 ASCII characters, so use 16 or more random ones.",
    how: "Network → WLAN → Security, separately for 2.4 GHz and 5 GHz. Set the same new passphrase on both bands so devices roam without re-pairing.",
    verify: "A phone joins with the new key and the sticker key fails.",
  },
  {
    id: "wpa2-aes",
    title: "Force WPA2-AES, or WPA2/WPA3 mixed",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "Older BSNL modems still default to WPA/WPA2 mixed with TKIP available, and some ADSL units still offer WEP. Any client that negotiates the weaker option drags the whole network down with it.",
    how: "Network → WLAN → Security → WPA2-PSK with AES/CCMP only, or WPA2/WPA3-PSK where the ONT supports SAE. Never TKIP, never WEP, never 'shared key'.",
    verify: "The phone's Wi-Fi details report WPA2 or WPA3.",
  },
  {
    id: "disable-wps",
    title: "Turn WPS off on both radios",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 3,
    why: "The eight-digit WPS PIN is checked in two halves, which collapses a brute force from 100 million guesses to about 11,000 — an afternoon's work from outside the building, regardless of how long your passphrase is.",
    how: "Network → WLAN → WPS → disable for 2.4 GHz and 5 GHz, and clear the router PIN if it is listed separately.",
    verify: "The WPS page shows both the push-button function and the PIN disabled.",
  },
  {
    id: "disable-telnet",
    title: "Disable Telnet",
    group: "Remote access",
    severity: "critical",
    minutes: 5,
    why: `Telnet on TCP ${TELNET_PORT} sends the password in clear text and is the single most common way IoT botnets move between home routers. A large number of BSNL-supplied ONTs ship with it enabled, sometimes on a vendor account the subscriber has never seen.`,
    how: "Management → Access Control / Service Control → uncheck Telnet for both LAN and WAN. Do the same for FTP and TFTP. Keep only HTTP or HTTPS on the LAN.",
    verify: `A connection to port ${TELNET_PORT} of the router from a LAN device is refused.`,
  },
  {
    id: "wan-web-ui",
    title: "Close the admin page to the internet side",
    group: "Remote access",
    severity: "critical",
    minutes: 6,
    why: "BSNL modems have repeatedly been found answering their web login on the WAN interface, which puts the router into the results of internet-wide scanners within hours of coming online. This is separate from BSNL's own provisioning channel.",
    how: "Management → Access Control (WAN), or Advanced Setup → Security → set HTTP, HTTPS, SSH, Telnet, FTP and SNMP to LAN only, and delete any WAN access-control entry.",
    verify: "From a mobile-data connection, your public IP returns nothing on 80, 443, 8080 or 8443.",
  },
  {
    id: "tr069-review",
    title: "Record what TR-069 is doing",
    group: "Remote access",
    severity: "high",
    minutes: 5,
    why: `BSNL provisions the ONT over TR-069 (CWMP), conventionally on TCP ${CWMP_PORT}, and on a BSNL-managed unit you generally cannot switch it off. The danger is a second unmanaged service listening beside it — the November 2016 Mirai variant that abused exposed CWMP knocked roughly 900,000 Deutsche Telekom routers offline.`,
    how: "Management → TR-069 Client: note the ACS URL and leave it alone, then confirm nothing else on the WAN interface is enabled.",
    verify: "You have written down the ACS URL and confirmed no other WAN service is on.",
  },
  {
    id: "disable-upnp",
    title: "Switch UPnP off",
    group: "Exposure",
    severity: "high",
    minutes: 3,
    why: "UPnP has no authentication whatsoever, so any program on the LAN — a compromised laptop, a cheap smart plug — can punch an inbound hole through the router without telling you.",
    how: "Advanced Setup → UPnP, or Application → UPnP → disable. If a console needs open NAT, create one explicit port-forward instead.",
    verify: "The forwarding table gains no entries you did not create.",
  },
  {
    id: "port-forward-dmz",
    title: "Clear old port forwards and the DMZ host",
    group: "Exposure",
    severity: "high",
    minutes: 6,
    why: "Forwards created years ago for a CCTV recorder or a download client keep the port open long after the device is gone, and a DMZ host sits with no firewall in front of it at all.",
    how: "Advanced Setup → NAT → Virtual Servers: delete every rule you cannot justify today. Advanced Setup → NAT → DMZ Host: clear the address.",
    verify: "Every remaining rule maps to a device that is switched on right now.",
  },
  {
    id: "pppoe-and-mode",
    title: "Work out how many boxes you are actually running",
    group: "Admin access",
    severity: "high",
    minutes: 8,
    why: "A very common BSNL setup is an ONT doing PPPoE and NAT with a second retail router behind it. That is two admin panels, two sets of defaults and two firmware trains, and people almost always harden only the one they can see.",
    how: "Trace the cabling from the fibre entry to your laptop and log into each device in the chain. Either put the ONT into bridge mode so only your router routes, or repeat this checklist on both.",
    verify: "You can name every device between the fibre and your laptop, and have logged into each.",
  },
  {
    id: "firmware-version",
    title: "Record the firmware build and chase it",
    group: "Maintenance",
    severity: "high",
    minutes: 5,
    why: "BSNL ONTs are supplied by several vendors and updates are inconsistent, so units regularly run builds that are years old. You cannot flash a managed ONT yourself, but you can escalate a specific model and version.",
    how: "Status → Device Information: note the model, hardware revision and software version. If an advisory names your model, quote the version when you raise a ticket at your BSNL exchange.",
    verify: "You can state the model and firmware version without opening the router.",
  },
  {
    id: "guest-ssid",
    title: "Put visitors and smart devices on a separate SSID",
    group: "Wi-Fi",
    severity: "high",
    minutes: 8,
    why: "A guest network with client isolation keeps a visitor's laptop or a cheap camera away from your PC, printer and any storage on the LAN, and means you never hand out the main passphrase.",
    how: "Network → WLAN → add a second SSID with its own WPA2 key, then enable AP isolation or clear 'allow guests to access the LAN'.",
    verify: "A device on the guest SSID cannot open the router admin page or reach a LAN IP.",
  },
  {
    id: "rename-ssid",
    title: "Rename the SSID away from the factory default",
    group: "Wi-Fi",
    severity: "medium",
    minutes: 3,
    why: "A default network name advertises the ISP and often the ONT vendor, which tells anyone in range which default credentials and which published bugs to try first. Avoid your surname or flat number too.",
    how: "Network → WLAN → SSID Name. Leave the broadcast on — hiding an SSID is not a security control and breaks some devices.",
    verify: "The network name identifies neither the ISP, the model nor the household.",
  },
  {
    id: "dns-resolver",
    title: "Hand clients a filtering DNS resolver",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "One change on the router protects every device on the network, including the ones that can never run security software. It also stops each gadget quietly using whatever resolver its manufacturer prefers.",
    how: "Network → LAN → DHCP Server → set the DNS servers handed to clients: a malware-blocking or family-filtering resolver, plus a fallback run by a different operator.",
    verify: "A device that renews its DHCP lease reports the resolver you configured.",
  },
  {
    id: "device-list",
    title: "Read the connected-device list",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "The DHCP client list is the cheapest intrusion check there is. An unfamiliar hostname or vendor prefix means the passphrase has leaked and needs rotating today.",
    how: "Status → LAN → DHCP clients. Give every device you recognise a name so anything new stands out next time.",
    verify: "You can point at the physical device behind every row.",
  },
  {
    id: "selfcare-account",
    title: "Secure the BSNL self-care login",
    group: "Admin access",
    severity: "medium",
    minutes: 5,
    why: "The BSNL portal and app hold your billing identity and can raise service requests against the connection, and access hinges on OTPs sent to your registered number. Sharing an OTP with a caller claiming to be support is the realistic attack.",
    how: "Use a unique password for the self-care account, never read an OTP aloud, and set a SIM PIN on the registered mobile number.",
    verify: "The self-care password is not reused on any other site.",
  },
  {
    id: "config-backup",
    title: "Save the hardened configuration",
    group: "Maintenance",
    severity: "medium",
    minutes: 4,
    why: "A technician visit, a power surge or a support instruction to 'just reset it' wipes every change above in one press of a pin. A saved configuration turns the rebuild into a two-minute restore.",
    how: "Management → Backup / Restore Configuration → save the file off the router and date it. It contains your Wi-Fi key, so treat it as a secret.",
    verify: "You hold a dated backup file stored somewhere other than the router.",
  },
];

const STEP_BY_ID = new Map(HARDENING_STEPS.map((step) => [step.id, step]));

/** Total points on offer if every step applies. */
export const TOTAL_POINTS = HARDENING_STEPS.reduce(
  (sum, step) => sum + SEVERITY_POINTS[step.severity],
  0,
);

function bandForScore(score) {
  for (const band of SCORE_BANDS) {
    if (score >= band.min) return band;
  }
  return SCORE_BANDS[SCORE_BANDS.length - 1];
}

function capBand(band, openCriticalCount) {
  if (openCriticalCount <= 0) return band;
  const cap = SCORE_BANDS.find((item) => item.key === OPEN_CRITICAL_BAND_CAP);
  if (!cap) return band;
  return BAND_ORDER.indexOf(band.key) > BAND_ORDER.indexOf(cap.key) ? cap : band;
}

/**
 * Score a hardening pass.
 *
 * @param {object} input
 * @param {string[]} input.completed      ids of steps already done
 * @param {string[]} input.notApplicable  ids the router genuinely cannot do
 * @returns {object} result, or { error } for invalid input
 */
export function scoreHardening({ completed = [], notApplicable = [] } = {}) {
  if (!Array.isArray(completed) || !Array.isArray(notApplicable)) {
    return { error: "Checklist selections must be provided as lists." };
  }
  const skipped = new Set(notApplicable.filter((id) => STEP_BY_ID.has(id)));
  const done = new Set(completed.filter((id) => STEP_BY_ID.has(id) && !skipped.has(id)));

  let earned = 0;
  let applicablePoints = 0;
  const openSteps = [];
  const doneSteps = [];
  const skippedSteps = [];
  let openMinutes = 0;
  let openCritical = 0;

  for (const step of HARDENING_STEPS) {
    const points = SEVERITY_POINTS[step.severity];
    if (skipped.has(step.id)) {
      skippedSteps.push({ ...step, points });
      continue;
    }
    applicablePoints += points;
    if (done.has(step.id)) {
      earned += points;
      doneSteps.push({ ...step, points });
    } else {
      openSteps.push({ ...step, points });
      openMinutes += step.minutes;
      if (step.severity === "critical") openCritical += 1;
    }
  }

  if (applicablePoints <= 0) {
    return {
      error: "Every step is marked not applicable — leave at least one for the router to be scored.",
    };
  }

  const score = Math.round((earned / applicablePoints) * 100);
  const band = capBand(bandForScore(score), openCritical);

  return {
    score,
    earned,
    applicablePoints,
    totalPoints: TOTAL_POINTS,
    band: band.key,
    bandLabel: band.label,
    doneCount: doneSteps.length,
    openCount: openSteps.length,
    skippedCount: skippedSteps.length,
    stepCount: HARDENING_STEPS.length,
    openCritical,
    openMinutes,
    openSteps,
    doneSteps,
    skippedSteps,
  };
}

/** Plain-text summary of a scored pass, for the copy button. */
export function formatHardeningSummary(result) {
  if (!result || result.error) return "";
  const lines = [
    "BSNL Broadband Router Hardening",
    `Score: ${result.score}/100 — ${result.bandLabel}`,
    `Done: ${result.doneCount} of ${result.stepCount} (${result.skippedCount} marked not applicable)`,
    `Critical steps still open: ${result.openCritical}`,
    `Estimated time to finish: ${result.openMinutes} minutes`,
  ];
  if (result.openSteps.length) {
    lines.push("", "Still to do:");
    for (const step of result.openSteps) {
      lines.push(`- [${step.severity}] ${step.title} — ${step.how}`);
    }
  }
  return lines.join("\n");
}
