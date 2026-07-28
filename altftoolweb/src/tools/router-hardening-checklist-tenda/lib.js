/**
 * Tenda router hardening — checklist data and scoring.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * Facts the copy relies on:
 *  - WPS: the 8-digit external registrar PIN is validated in two halves, cutting a
 *    brute force from 10^8 to 10^4 + 10^3 = 11,000 attempts (Viehbock, 2011,
 *    US-CERT VU 723755).
 *  - WPA2-PSK passphrases are 8-63 ASCII characters (IEEE 802.11i).
 *  - UPnP IGD is unauthenticated by design.
 *  - Tenda's AC-series web interface has accumulated a long run of published stack
 *    buffer-overflow and command-injection CVEs, a number of which need no
 *    authentication, and Mirai-family botnets have targeted Tenda devices.
 *  - Tenda's first-run wizard offers to reuse the Wi-Fi password as the router
 *    login password, so on a default install the Wi-Fi key is also the admin key.
 *  - Tenda routers conventionally answer at http://192.168.0.1 or tendawifi.com.
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
  "Covers the Tenda AC, F and N series and Nova mesh kits. The web interface is broadly the same across them, though menu names shift between firmware builds.";

export const ADMIN_URL = "http://192.168.0.1 (or tendawifi.com)";

export const HARDENING_STEPS = [
  {
    id: "separate-login-password",
    title: "Give the admin login its own password, separate from the Wi-Fi key",
    group: "Admin access",
    severity: "critical",
    minutes: 6,
    why: "Tenda's setup wizard offers to reuse the Wi-Fi password as the router login password, and most people accept it. That single choice means every guest, tenant and neighbour who has the Wi-Fi key is also a router administrator — and rotating the Wi-Fi key no longer locks them out of the admin page.",
    how: `Open ${ADMIN_URL}, go to System Settings → Login Password (or Administration → Password) and set a password that is different from the Wi-Fi passphrase. Untick any 'use the same password' option.`,
    verify: "Typing the Wi-Fi passphrase at the router login is rejected.",
  },
  {
    id: "firmware-and-eol",
    title: "Update the firmware, and find out whether the model is still supported",
    group: "Maintenance",
    severity: "critical",
    minutes: 12,
    why: "Tenda's web interface has a long published record of stack buffer overflows and command injections, several exploitable without logging in, and Mirai-family botnets actively scan for them. Budget models also drop off the support list quickly, so an old unit may have no fix available at all.",
    how: "System Settings → Firmware Upgrade → Online Upgrade, or download the file for your exact model and hardware version from Tenda's own support page. Then check whether your model still has firmware dated within the last couple of years; if not, treat replacement as the fix.",
    verify: "The router reports the newest firmware Tenda publishes for your exact model and hardware revision.",
  },
  {
    id: "wifi-passphrase",
    title: "Rotate the Wi-Fi passphrase",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "The key on the label, or the one set at installation, has circulated further than you think, and short keys fall quickly to an offline attack on a captured handshake. WPA2-PSK allows 8 to 63 ASCII characters — use 16 or more random ones.",
    how: "Wireless Settings → Wi-Fi Name and Password: set the same new passphrase on 2.4 GHz and 5 GHz so devices roam without re-pairing.",
    verify: "A phone joins with the new key and the old one fails.",
  },
  {
    id: "wpa2-aes",
    title: "Set WPA2-PSK with AES, or WPA2/WPA3 mixed",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "Tenda firmware still offers WPA/WPA2 mixed with TKIP available, and older N-series units still offer WEP. In mixed mode a single legacy device drags the whole network down to the weakest cipher on offer.",
    how: "Wireless Settings → Security Mode → WPA2-PSK with AES, or WPA2/WPA3-PSK where the firmware supports SAE. Never TKIP, never WEP, never an open network.",
    verify: "The phone's Wi-Fi details report WPA2 or WPA3.",
  },
  {
    id: "disable-wps",
    title: "Turn WPS off",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 3,
    why: "The eight-digit WPS PIN is validated in two halves, so a brute force needs about 11,000 attempts rather than 100 million. It works from outside the building and it makes the length of your passphrase irrelevant.",
    how: "Wireless Settings → WPS → disable. On some builds it sits under Advanced Settings → WPS.",
    verify: "The WPS page shows the feature and any router PIN both disabled.",
  },
  {
    id: "remote-web-management",
    title: "Disable remote web management",
    group: "Remote access",
    severity: "critical",
    minutes: 5,
    why: "An admin page reachable from the WAN combines with Tenda's unauthenticated firmware bugs into the worst case: compromise with no credentials and no user action. Scanners find a newly exposed router within hours.",
    how: "Advanced Settings → Remote Web Management (or Administration → Remote Management) → disable, and clear any allowed remote IP.",
    verify: "From mobile data, your public IP returns nothing on 80, 443, 8080 or 8443.",
  },
  {
    id: "cloud-app-account",
    title: "Secure or unlink the Tenda WiFi app account",
    group: "Remote access",
    severity: "high",
    minutes: 6,
    why: "The Tenda app binds the router to a cloud account that can administer it from anywhere, which is a second administrator living outside your network and outside your router password.",
    how: "In the app, give the account a long unique password. If you only ever manage the router at home, unbind the router from the cloud account and turn the cloud service off in the web UI.",
    verify: "Either the router is unbound, or the account password is used nowhere else.",
  },
  {
    id: "extra-services",
    title: "Turn off Telnet, SNMP and any debug service",
    group: "Remote access",
    severity: "high",
    minutes: 4,
    why: "Budget firmware regularly ships with leftover management or debug services enabled, sometimes with hardcoded credentials. Telnet in particular sends the password in clear text and is the classic route for router botnets.",
    how: "Advanced Settings → look for Telnet, SNMP, TR-069 or a Debug page and disable anything you are not deliberately using.",
    verify: "A LAN device gets connection refused on port 23.",
  },
  {
    id: "disable-upnp",
    title: "Switch UPnP off",
    group: "Exposure",
    severity: "high",
    minutes: 3,
    why: "UPnP has no authentication at all, so any program on the LAN can open an inbound port on the router silently — which is exactly what a compromised device wants to do.",
    how: "Advanced Settings → UPnP → disable. If a console genuinely needs open NAT, add a single explicit port-forward instead.",
    verify: "The forwarding list stops gaining entries you did not create.",
  },
  {
    id: "port-forward-dmz",
    title: "Delete old port forwards and the DMZ host",
    group: "Exposure",
    severity: "high",
    minutes: 6,
    why: "A DMZ host is exempt from the firewall completely, and forwards set up for a camera or a download client stay open long after the device is unplugged — the port then belongs to whatever gets that LAN IP next.",
    how: "Advanced Settings → Virtual Server / Port Forwarding: remove every rule you cannot justify today. Advanced Settings → DMZ Host: disable.",
    verify: "Each surviving rule points at a device that is switched on right now.",
  },
  {
    id: "guest-network",
    title: "Move visitors and smart devices to the guest network",
    group: "Wi-Fi",
    severity: "high",
    minutes: 6,
    why: "Tenda's guest network gives internet-only access, so a visitor's laptop or a cheap smart plug cannot reach your PC, printer or storage. It also means you never hand out the main passphrase again.",
    how: "Guest Network → enable, set its own password and a validity period, and use the bandwidth limit if you want to keep it modest.",
    verify: "A device on the guest SSID cannot open the router admin page or reach a LAN address.",
  },
  {
    id: "wan-exposure-check",
    title: "Check your public IP from outside the network",
    group: "Exposure",
    severity: "high",
    minutes: 5,
    why: "Every step above is a setting you believe you changed. This is the one step that tests the result from the attacker's side, and it catches the case where a firmware bug quietly re-enables a service.",
    how: "On mobile data with Wi-Fi off, look up your home public IP and try to open it in a browser on http and https. Repeat after any firmware update.",
    verify: "Nothing answers, or the connection times out.",
  },
  {
    id: "rename-ssid",
    title: "Rename the network away from the default",
    group: "Wi-Fi",
    severity: "medium",
    minutes: 3,
    why: "A default Tenda SSID advertises the vendor and often the model, which tells anyone in range which firmware advisories and default behaviours to try. Keep your surname and flat number out of it as well.",
    how: "Wireless Settings → Wi-Fi Name. Leave the broadcast enabled; hiding an SSID is not a security control and breaks some devices.",
    verify: "The network name identifies neither vendor, model nor household.",
  },
  {
    id: "dns-resolver",
    title: "Hand clients a filtering DNS resolver",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "Setting the resolver once on the router covers every device on the network, including the ones that can never run security software, and stops each gadget quietly using whatever resolver its vendor prefers.",
    how: "Advanced Settings → DHCP Server → set the primary and secondary DNS handed to clients: a malware-blocking or family-filtering resolver plus a fallback from a different operator.",
    verify: "A device that renews its lease reports the resolver you set.",
  },
  {
    id: "client-list",
    title: "Name every connected device, and use the block list",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "The client list is the cheapest intrusion check available. An unfamiliar hostname or vendor prefix means the passphrase has leaked and needs rotating the same day — blocking the device is a stopgap, not the fix.",
    how: "Device / Client List → rename everything you recognise. Use Parental Control or the block list to cut off an unknown device while you rotate the key.",
    verify: "You can point at the physical device behind every row.",
  },
  {
    id: "mesh-nodes",
    title: "Check every Nova node, not just the primary",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "In a Nova mesh each node runs its own firmware and can lag behind the primary. A node that missed an update is an entry point into the same network you just hardened.",
    how: "In the Tenda app open each node and confirm its firmware version, then update any node that is behind.",
    verify: "Every node reports the same firmware train as the primary.",
  },
  {
    id: "physical-access",
    title: "Think about where the router physically sits",
    group: "Admin access",
    severity: "medium",
    minutes: 3,
    why: "Ten seconds with a pin in the reset hole returns the router to factory defaults — no admin password, wizard defaults, and your careful configuration gone. In a shared corridor, a rented room or a small office that is a real threat, not a theoretical one.",
    how: "Put the router somewhere only household members reach, and note that the label carries the default credentials so it should not face a common area.",
    verify: "Nobody outside the household can reach the reset button or read the label.",
  },
  {
    id: "config-backup",
    title: "Back up the hardened configuration",
    group: "Maintenance",
    severity: "medium",
    minutes: 4,
    why: "A reset — accidental, or on a support instruction — undoes everything above at once. A saved configuration turns the rebuild into a two-minute restore instead of an evening.",
    how: "System Settings → Backup/Restore → back up the configuration to a file, store it off the router and date it. It contains your Wi-Fi key, so treat it as a secret.",
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
    "Tenda Router Hardening Checklist",
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
