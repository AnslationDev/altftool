/**
 * Linksys router hardening — checklist data and scoring.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * Facts the copy relies on:
 *  - WPS: the 8-digit external registrar PIN is validated in two halves, cutting a
 *    brute force from 10^8 to 10^4 + 10^3 = 11,000 attempts (Viehbock, 2011,
 *    US-CERT VU 723755).
 *  - WPA2-PSK passphrases are 8-63 ASCII characters (IEEE 802.11i).
 *  - UPnP IGD is unauthenticated by design.
 *  - "TheMoon" worm (February 2014) spread between Linksys E-series routers by
 *    abusing an authentication bypass in a CGI script, with no user interaction.
 *  - A May 2019 disclosure by Bad Packets found tens of thousands of internet-facing
 *    Linksys Smart Wi-Fi routers returning connected-device inventories — MAC
 *    addresses, device names, operating systems — to unauthenticated requests.
 *  - Linksys Smart Wi-Fi routers pair with a cloud account that can administer the
 *    router from outside the LAN, and they support automatic firmware updates.
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

export const ROUTER_MODEL_NOTE =
  "Covers Linksys Smart Wi-Fi routers (EA and MR series), Velop mesh nodes and the older E-series. Menu wording differs between the web UI and the Linksys app, but every setting below exists in both.";

export const ADMIN_URL = "http://192.168.1.1";

export const HARDENING_STEPS = [
  {
    id: "router-password",
    title: "Change the router password printed on the label",
    group: "Admin access",
    severity: "critical",
    minutes: 6,
    why: "Smart Wi-Fi routers ship with a router password on the underside label, and the older E-series shipped on admin/admin with a blank username. Anyone who has photographed the label — a guest, a tenant, a delivery — keeps admin access until you change it.",
    how: `Open ${ADMIN_URL} (or the Linksys app), then Connectivity → Basic → Router Password → Edit. Set a long unique password and change the password hint if the firmware asks for one.`,
    verify: "Sign out and confirm the label password and admin/admin are both rejected.",
  },
  {
    id: "cloud-account",
    title: "Lock down or unlink the Linksys Smart Wi-Fi account",
    group: "Admin access",
    severity: "critical",
    minutes: 8,
    why: "The Smart Wi-Fi cloud account is a full administrator that works from anywhere on the internet, independent of your LAN and of the router password. If that account password is reused or breached, the local router password protects nothing.",
    how: "Give the Linksys account a long unique password that is not reused anywhere. If you only ever manage the router from home, unlink it and use local access at the router IP instead.",
    verify: "The cloud account password appears in no other login you own, or the router is no longer linked to an account.",
  },
  {
    id: "wifi-passphrase",
    title: "Rotate the Wi-Fi passphrase",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "The factory key on the label has been visible to everyone who has handled the router, and on many units it is short enough to fall to an offline dictionary attack on a captured handshake. WPA2-PSK allows 8 to 63 ASCII characters — use at least 16 random ones.",
    how: "Wi-Fi Settings → Edit: set the same new passphrase on the 2.4 GHz and 5 GHz networks so devices roam without re-pairing.",
    verify: "A phone joins with the new key and the label key fails.",
  },
  {
    id: "wpa2-wpa3",
    title: "Set WPA2-Personal AES, or WPA2/WPA3 mixed",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "Linksys firmware still offers WPA/WPA2 mixed mode and, on older units, WEP. Mixed mode leaves TKIP negotiable, so one legacy device pulls the security of the whole network down to its own level.",
    how: "Wi-Fi Settings → Security Mode → WPA2 Personal (AES), or WPA2/WPA3 Mixed Personal on firmware that supports SAE. Never WEP, never 'WPA Personal'.",
    verify: "Your phone's network details report WPA2 or WPA3.",
  },
  {
    id: "disable-wps",
    title: "Turn Wi-Fi Protected Setup off",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 3,
    why: "The eight-digit WPS PIN is validated in two halves, which reduces a brute force from 100 million combinations to about 11,000. That defeats even a 60-character passphrase, and it works from outside the building.",
    how: "Wi-Fi Settings → Wi-Fi Protected Setup → off. If the page lists a router PIN separately, disable that too.",
    verify: "The WPS panel reports the feature and the PIN both disabled.",
  },
  {
    id: "remote-management",
    title: "Disable Remote Management",
    group: "Remote access",
    severity: "critical",
    minutes: 5,
    why: "Remote Management exposes the admin interface on the WAN, where internet-wide scanners find it within hours. Linksys routers have a history here: TheMoon worm spread between E-series units in 2014 with no user interaction at all.",
    how: "Connectivity → Administration → Remote Management → uncheck 'Allow remote access to browser-based configuration utility'. Leave the HTTPS-only option ticked if you have to keep it on for a specific reason.",
    verify: "From mobile data, your public IP returns nothing on 80, 443, 8080 or 8443.",
  },
  {
    id: "local-https",
    title: "Force HTTPS for local management",
    group: "Admin access",
    severity: "high",
    minutes: 4,
    why: "Plain HTTP on the LAN means the admin password crosses your Wi-Fi in the clear, which matters the moment a guest device or an IoT gadget on the same network is compromised.",
    how: "Connectivity → Administration → Local Management Access → enable HTTPS and, where the firmware allows, clear HTTP.",
    verify: "The admin page loads over https:// and the browser no longer offers the plain-HTTP page.",
  },
  {
    id: "auto-firmware",
    title: "Turn automatic firmware updates on",
    group: "Maintenance",
    severity: "high",
    minutes: 5,
    why: "Linksys supports automatic firmware updates, and leaving them off is why routers sit on builds with published remote code execution bugs for years. This is the one maintenance step that keeps paying off with no further effort.",
    how: "Connectivity → Basic → Firmware Update → set Automatic Update on, then run a manual check now to pick up anything outstanding.",
    verify: "The firmware page shows automatic updates enabled and reports the router is current.",
  },
  {
    id: "device-list-exposure",
    title: "Confirm the router is not leaking its device list",
    group: "Exposure",
    severity: "high",
    minutes: 5,
    why: "A May 2019 disclosure found tens of thousands of internet-facing Linksys Smart Wi-Fi routers returning their connected-device inventories — MAC addresses, device names and operating systems — to unauthenticated requests. Current firmware plus remote management off is the fix.",
    how: "Do the firmware step and the Remote Management step first, then check from a mobile-data connection that nothing on your public IP responds to a plain web request.",
    verify: "A browser pointed at your public IP from outside your network times out or is refused.",
  },
  {
    id: "disable-upnp",
    title: "Switch UPnP off",
    group: "Exposure",
    severity: "high",
    minutes: 3,
    why: "UPnP carries no authentication, so any application on the LAN — including malware on a laptop or a compromised smart device — can open an inbound port on the router without asking you.",
    how: "Connectivity → Administration → UPnP → uncheck 'Enabled', and clear 'Allow users to configure' and 'Allow users to disable internet access'.",
    verify: "The port-forwarding list stops acquiring entries you did not create.",
  },
  {
    id: "port-forward-dmz",
    title: "Clear stale port forwards and the DMZ",
    group: "Exposure",
    severity: "high",
    minutes: 6,
    why: "Single-port and port-range forwards created for a camera, a game server or a NAS outlive the device that needed them, and a DMZ host is exempt from the firewall entirely.",
    how: "Security → Apps and Gaming → Single Port Forwarding and Port Range Forwarding: delete anything you cannot justify today. Security → DMZ → disable.",
    verify: "Every remaining rule points at a device that is powered on right now.",
  },
  {
    id: "guest-access",
    title: "Move visitors and IoT onto Guest Access",
    group: "Wi-Fi",
    severity: "high",
    minutes: 6,
    why: "Linksys Guest Access gives internet-only connectivity, so a visitor's laptop or a cheap smart plug cannot reach your PC, printer or network storage. It also means the main passphrase never leaves the household.",
    how: "Guest Access → on → set its own guest password and cap the number of guests. Move every smart-home device onto it.",
    verify: "A device on the guest network cannot open the router admin page or reach a LAN address.",
  },
  {
    id: "mesh-nodes",
    title: "Check every Velop or extender node, not just the parent",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "In a mesh, child nodes run their own firmware and can lag behind the parent. A node that missed an update is a way into the same network as the router you carefully hardened.",
    how: "In the Linksys app open each node in turn and confirm its firmware version and that it is not offering its own separate admin login.",
    verify: "Every node reports the same firmware train as the parent.",
  },
  {
    id: "rename-ssid",
    title: "Rename the network away from the default",
    group: "Wi-Fi",
    severity: "medium",
    minutes: 3,
    why: "A default Linksys SSID announces the vendor and often the model, which tells anyone in range which default password and which published advisories to try. Keep your surname and flat number out of it too.",
    how: "Wi-Fi Settings → Edit → Wi-Fi name. Leave the broadcast on; hiding an SSID is not a security control and breaks some devices.",
    verify: "The network name identifies neither the vendor, the model nor the household.",
  },
  {
    id: "dns-resolver",
    title: "Hand clients a filtering DNS resolver",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "Setting the resolver once on the router covers every device on the network, including the ones that can never run security software, and stops each gadget silently using whatever resolver its vendor prefers.",
    how: "Connectivity → Local Network → DHCP Server → set Static DNS 1 and 2 to a malware-blocking or family-filtering resolver plus a fallback from a different operator.",
    verify: "A device that renews its lease reports the resolver you set.",
  },
  {
    id: "telemetry",
    title: "Review the diagnostic and analytics sharing settings",
    group: "Maintenance",
    severity: "medium",
    minutes: 3,
    why: "Linksys firmware offers to send diagnostic and usage data to the vendor. It is not an attack path, but it is a stream of information about your network that you should switch on deliberately rather than by default.",
    how: "Troubleshooting → Diagnostics, and the privacy section of the Linksys app: turn off anything you did not consciously opt into.",
    verify: "You can state what the router sends to Linksys and why.",
  },
  {
    id: "connected-devices",
    title: "Name every connected device",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "The device list is the cheapest intrusion check you have. An unrecognised MAC or hostname means the passphrase has leaked and needs rotating the same day.",
    how: "Device List → rename every device you recognise so an unfamiliar entry stands out immediately next time you look.",
    verify: "You can point at the physical device behind every row.",
  },
  {
    id: "config-backup",
    title: "Back up the hardened configuration",
    group: "Maintenance",
    severity: "medium",
    minutes: 4,
    why: "A factory reset after a failed firmware flash or a support call undoes every step above in one press of a pin. A saved configuration turns the rebuild into a two-minute restore.",
    how: "Troubleshooting → Diagnostics → Backup and Restore → Backup configuration file. Store it off the router and date it; it contains your Wi-Fi key.",
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
    "Linksys Router Hardening Checklist",
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
