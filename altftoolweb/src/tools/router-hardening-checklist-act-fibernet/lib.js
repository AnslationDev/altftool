/**
 * ACT Fibernet router hardening — checklist data and scoring.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * Facts the copy relies on:
 *  - WPS: the 8-digit external registrar PIN is validated in two halves, cutting a
 *    brute force from 10^8 to 10^4 + 10^3 = 11,000 attempts (Viehbock, 2011;
 *    US-CERT VU 723755).
 *  - WPA2-PSK passphrases are 8-63 ASCII characters (IEEE 802.11i).
 *  - UPnP IGD is unauthenticated by design, so any LAN device can open an inbound
 *    port without prompting the owner.
 *  - RFC 6598 reserves 100.64.0.0/10 for carrier-grade NAT. A WAN address in that
 *    range, or in RFC 1918 space, means the connection is behind CGNAT and is not
 *    directly reachable from the internet; anything else is a routable public IP.
 *  - ACT Fibernet installs retail routers and ONTs from TP-Link, D-Link, Digisol,
 *    Tenda, Nokia and Syrotech. On a retail router, firmware is the subscriber's
 *    responsibility, not the ISP's.
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

/** RFC 6598 shared address space — the giveaway that you are behind CGNAT. */
export const CGNAT_RANGE = "100.64.0.0/10";

export const ROUTER_MODEL_NOTE =
  "ACT installs retail routers and ONTs from TP-Link, D-Link, Digisol, Tenda, Nokia and Syrotech, so the menu wording varies. Every setting below exists on all of them.";

export const ADMIN_URL = "http://192.168.0.1 or http://192.168.1.1";

export const HARDENING_STEPS = [
  {
    id: "admin-password",
    title: "Replace the installer's admin password",
    group: "Admin access",
    severity: "critical",
    minutes: 8,
    why: "Retail routers ACT hands out still ship on vendor defaults — TP-Link on admin/admin, D-Link on admin with a blank password — and installers frequently reuse one password across a whole locality. Either way, the person who set it up can still get in.",
    how: `Open ${ADMIN_URL} (or the vendor hostname printed on the label) and go to System Tools / Management → Administration → change the password. Where the router supports a separate username, change that too.`,
    verify: "Sign out, confirm admin/admin and any password the installer gave you are both rejected.",
  },
  {
    id: "wifi-passphrase",
    title: "Rotate the Wi-Fi passphrase",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "The key on the label, or the one the technician chose, has been shared with installers, neighbours and every guest since day one. WPA2-PSK takes 8 to 63 ASCII characters, so use at least 16 random ones.",
    how: "Wireless → Wireless Security, for the 2.4 GHz and 5 GHz networks separately. Set the same fresh passphrase on both so devices roam cleanly.",
    verify: "Reconnect a phone with the new key and confirm the old one fails.",
  },
  {
    id: "wpa2-aes",
    title: "Set WPA2-AES, or WPA2/WPA3 mixed",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "WEP is broken and TKIP is deprecated. A 'WPA/WPA2 mixed' setting still lets a client negotiate TKIP, which drags the whole network down to the weakest option on offer.",
    how: "Wireless → Security → WPA2-PSK with AES/CCMP, or WPA2/WPA3-Personal if the router supports SAE. Never TKIP, never 'Auto (TKIP+AES)'.",
    verify: "Your phone's network details should show WPA2 or WPA3.",
  },
  {
    id: "disable-wps",
    title: "Disable WPS and the WPS PIN",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 3,
    why: "The eight-digit WPS PIN is checked in two halves, so the search space collapses from 100 million to roughly 11,000 guesses. Some TP-Link and D-Link firmwares keep the PIN active even after you turn the push-button off, so disable both.",
    how: "Wireless → WPS → Disable, and clear or disable the router PIN if the page lists one separately.",
    verify: "The WPS page reports both the function and the PIN as disabled.",
  },
  {
    id: "remote-management",
    title: "Turn off web management from the WAN",
    group: "Remote access",
    severity: "critical",
    minutes: 6,
    why: "This matters more on ACT than on a CGNAT connection, because many ACT plans hand out a routable public IPv4. A WAN-facing admin page on a public IP is found by internet-wide scanners within hours.",
    how: "Security → Remote Management (TP-Link), Tools → Administration → Remote (D-Link): set it to Disabled, or restrict it to a single trusted source IP. Disable Telnet and any 'remote assistance' toggle at the same time.",
    verify: "From mobile data, your public IP should not serve a login page on 80, 443, 8080 or 8443.",
  },
  {
    id: "public-ip-check",
    title: "Find out whether your WAN IP is public or behind CGNAT",
    group: "Exposure",
    severity: "high",
    minutes: 5,
    why: `This single fact decides how urgent everything else in the Exposure group is. If the router's WAN address is inside ${CGNAT_RANGE} (RFC 6598 shared address space) or in a private range, you are behind carrier-grade NAT and unreachable from outside. If it matches what an "what is my IP" page shows, every open port on your router is reachable from anywhere.`,
    how: "Compare the WAN IP on the router's status page with the address a public IP-lookup site reports. Same value means a real public IP.",
    verify: "You can state whether your connection is publicly addressable or CGNAT.",
  },
  {
    id: "cloud-account",
    title: "Unbind or secure the vendor cloud account",
    group: "Remote access",
    severity: "high",
    minutes: 6,
    why: "TP-Link ID, mydlink and their equivalents let anyone with the account password reconfigure your router from the vendor's cloud, bypassing the LAN entirely. It is a second admin login that does not live on your network.",
    how: "If you never use the phone app, unbind the router from the cloud account. If you do, give the account a unique password and turn on two-factor authentication in the vendor app.",
    verify: "Signing into the vendor app either fails, or requires your second factor.",
  },
  {
    id: "firmware-update",
    title: "Apply the firmware update yourself",
    group: "Maintenance",
    severity: "high",
    minutes: 10,
    why: "On an ACT connection the router is usually a retail unit, which means nobody pushes firmware to it — not ACT, not the vendor. Routers commonly run four-year-old builds with published remote code execution bugs because the owner assumed updates were automatic.",
    how: "Note the exact model and hardware revision from the label, download the matching firmware from the vendor's own support page, and flash it over Ethernet rather than Wi-Fi. Do not use third-party download sites.",
    verify: "The status page shows a firmware version dated within the last year, or the vendor lists none newer.",
  },
  {
    id: "disable-upnp",
    title: "Switch UPnP off",
    group: "Exposure",
    severity: "high",
    minutes: 3,
    why: "UPnP has no authentication, so any application on your LAN — including malware — can open an inbound port on the router silently. On a connection with a public IP that is a direct hole through your firewall.",
    how: "Forwarding → UPnP, or Advanced → Advanced Network → UPnP: disable. Add a single explicit port-forward instead if a game console genuinely needs one.",
    verify: "The UPnP forwarding table stays empty after a day of normal use.",
  },
  {
    id: "port-forward-dmz",
    title: "Delete stale port forwards and disable the DMZ",
    group: "Exposure",
    severity: "high",
    minutes: 6,
    why: "A DMZ host sits with no firewall in front of it at all. Old forwards for a DVR, an FTP server or a torrent client survive long after the device is gone, and the port stays open to whatever answers on that IP next.",
    how: "Forwarding → Virtual Servers / Port Triggering: delete every rule you cannot justify today. Forwarding → DMZ: disable.",
    verify: "Each remaining rule maps to a device that is powered on right now.",
  },
  {
    id: "act-selfcare",
    title: "Secure the ACT self-care account",
    group: "Admin access",
    severity: "high",
    minutes: 5,
    why: "The ACT portal and app can change your Wi-Fi name and password and raise service requests, so it is effectively a remote admin channel for the connection. Access is tied to your registered mobile number, which makes OTP handling the weak point.",
    how: "Give the account a unique password, never read an OTP to someone who calls claiming to be support, and put a SIM PIN on the registered number.",
    verify: "The self-care password is not reused on any other site.",
  },
  {
    id: "guest-wifi",
    title: "Run a separate guest and IoT SSID",
    group: "Wi-Fi",
    severity: "high",
    minutes: 8,
    why: "Smart plugs, TV sticks and a visitor's laptop have no business reaching your NAS, printer or work machine. A guest SSID with client isolation contains them, and lets you rotate the main key without re-pairing every gadget.",
    how: "Wireless → Guest Network: enable it, give it its own WPA2 key, and turn off 'Allow guests to access my local network' / enable AP isolation.",
    verify: "A device on the guest SSID cannot open the router admin page or ping a LAN address.",
  },
  {
    id: "double-nat",
    title: "Decide between bridge mode and two hardened boxes",
    group: "Admin access",
    severity: "medium",
    minutes: 8,
    why: "Many ACT installs leave an ONT doing NAT with your own router behind it. That is two admin panels, two sets of default credentials and two firmware trains — and people usually only ever harden the one they can see.",
    how: "Either ask ACT to put the ONT in bridge mode so only your router routes, or work through this whole checklist a second time on the ONT's own admin page.",
    verify: "You can name every device between your laptop and the internet, and you have logged into each one.",
  },
  {
    id: "rename-ssid",
    title: "Rename the network away from the default",
    group: "Wi-Fi",
    severity: "medium",
    minutes: 3,
    why: "A default SSID advertises the vendor and often the model, which tells anyone in range which default credentials and which firmware advisories to try. Avoid your flat number or surname too.",
    how: "Wireless → Wireless Settings → Network Name (SSID). Leave the broadcast enabled; hiding an SSID is not a security control and breaks some devices.",
    verify: "The network name no longer identifies the vendor, model or household.",
  },
  {
    id: "dns-filtering",
    title: "Hand out a filtering DNS resolver",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "Setting the resolver once on the router protects every device on the network, including the ones that cannot run security software. It also stops a device from silently using whatever resolver its manufacturer prefers.",
    how: "Network → DHCP Server → set the primary and secondary DNS handed to clients, picking a malware-blocking or family-filtering resolver and a fallback from a different operator.",
    verify: "A device that renews its lease reports the resolver you set.",
  },
  {
    id: "device-audit",
    title: "Read the connected-device list",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "The DHCP client list is the cheapest intrusion check available. An unrecognised hostname or vendor prefix means the passphrase has leaked and needs rotating.",
    how: "DHCP → DHCP Clients List, or the device list in the vendor app. Label every entry you recognise so anomalies stand out next time.",
    verify: "You can point at the physical device behind every row.",
  },
  {
    id: "config-backup",
    title: "Back up the hardened configuration",
    group: "Maintenance",
    severity: "medium",
    minutes: 4,
    why: "A factory reset — after a lightning strike, a support call or a failed firmware flash — undoes every step above in one press. A saved configuration turns a two-hour rebuild into a two-minute restore.",
    how: "System Tools → Backup & Restore → save the file somewhere off the router, and date it. The file contains your Wi-Fi key, so store it as a secret.",
    verify: "You have a dated backup file outside the router.",
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
    "ACT Fibernet Router Hardening",
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
