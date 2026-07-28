/**
 * Airtel Xstream Fibre router hardening — checklist data and scoring.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * Facts the copy relies on:
 *  - WPS: the 8-digit external registrar PIN is validated in two halves, which cuts
 *    an offline/online brute force from 10^8 to 10^4 + 10^3 = 11,000 attempts
 *    (Stefan Viehbock, US-CERT VU 723755, 2011).
 *  - WPA2-PSK passphrases are 8-63 ASCII characters (IEEE 802.11i / WPA2 spec).
 *  - TR-069 / CWMP, the protocol ISPs use to provision and manage a CPE remotely,
 *    conventionally listens on TCP 7547. A Mirai variant abused exposed CWMP in
 *    November 2016 and knocked ~900,000 Deutsche Telekom routers offline.
 *  - UPnP IGD has no authentication by design, so any device or malware on the LAN
 *    can open an inbound port on the router.
 *  - Airtel-supplied ONTs (Nokia, ZTE, Syrotech and others) normally answer at
 *    http://192.168.1.1 and carry the default admin password and Wi-Fi key on the
 *    label underneath the unit.
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
  "Airtel Xstream Fibre ships Nokia, ZTE, Syrotech and Tenda ONTs. Menu names differ, but every one of these settings exists on all of them.";

export const ADMIN_URL = "http://192.168.1.1";

export const HARDENING_STEPS = [
  {
    id: "admin-password",
    title: "Change the router admin password",
    group: "Admin access",
    severity: "critical",
    minutes: 8,
    why: "Airtel ONTs ship with the admin password printed on the label under the unit, and many units also keep a second lower-privilege account on a well-known default. Anyone who photographs the sticker, or who reaches your LAN once, owns the router permanently.",
    how: `Open ${ADMIN_URL} in a browser on Wi-Fi, sign in with the label credentials, then Management (or Administration) → Account / User Management → change the password for every listed account.`,
    verify: "Sign out, then confirm the label password is rejected and the new one works.",
  },
  {
    id: "wifi-passphrase",
    title: "Replace the factory Wi-Fi key",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "The pre-shared key on the sticker is frequently derived from the serial number or MAC, and it has been shared with every technician, guest and neighbour who has ever seen the box. WPA2-PSK accepts 8-63 ASCII characters, so there is no reason to stay short.",
    how: "Network → WLAN → Security (2.4 GHz and 5 GHz separately) → set a fresh passphrase of 16 or more random characters.",
    verify: "Reconnect one device with the new key; the old key should fail.",
  },
  {
    id: "wpa2-aes",
    title: "Force WPA2-AES, or WPA2/WPA3 mixed",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 5,
    why: "WEP is broken outright and TKIP is deprecated; a mixed WPA/WPA2 mode leaves TKIP negotiable. If the ONT offers WPA3, use WPA2/WPA3 mixed so newer phones get SAE while older devices still join.",
    how: "Network → WLAN → Security → Authentication Mode: WPA2-PSK (or WPA2/WPA3-PSK). Encryption: AES / CCMP only — never TKIP or 'TKIP+AES'.",
    verify: "Your phone's Wi-Fi details should report WPA2 or WPA3, not WPA or WEP.",
  },
  {
    id: "disable-wps",
    title: "Turn WPS off on both bands",
    group: "Wi-Fi",
    severity: "critical",
    minutes: 3,
    why: "The WPS external-registrar PIN is checked in two halves, so brute force collapses from 100 million guesses to about 11,000 — minutes of work from the pavement outside. Turning WPS off removes the whole class of attack.",
    how: "Network → WLAN → WPS → disable for 2.4 GHz and 5 GHz. On some Nokia ONTs it lives under Advanced → WPS Settings.",
    verify: "Pressing the WPS button on the unit should no longer let a device join without the passphrase.",
  },
  {
    id: "remote-management",
    title: "Disable management from the internet side",
    group: "Remote access",
    severity: "critical",
    minutes: 5,
    why: "A WAN-side admin page turns every credential-stuffing bot on the internet into a threat to your home network. This is separate from Airtel's own provisioning channel and should be off.",
    how: "Security → Remote Access / ACL, or Management → Access Control → set HTTP, HTTPS, Telnet, SSH and FTP to LAN only and clear any WAN entry.",
    verify: "From mobile data, your public IP should not serve a login page on ports 80, 443, 8080 or 8443.",
  },
  {
    id: "tr069-review",
    title: "Check what TR-069 leaves exposed",
    group: "Remote access",
    severity: "high",
    minutes: 5,
    why: "Airtel provisions the ONT over TR-069 (CWMP), normally on TCP 7547, and on an ISP-managed unit you usually cannot switch it off. The risk is not TR-069 itself but a second, unmanaged service left listening beside it — a 2016 Mirai variant abused exposed CWMP to take roughly 900,000 Deutsche Telekom routers offline.",
    how: "Look for Management → TR-069 / ACS Configuration and record the ACS URL. Do not delete it — an ONT cut off from the ACS can lose its provisioning. Instead confirm no other WAN service is enabled alongside it.",
    verify: "Scan your public IP from an outside network; ideally only the CWMP port answers, and nothing else.",
  },
  {
    id: "disable-upnp",
    title: "Switch UPnP off",
    group: "Exposure",
    severity: "high",
    minutes: 3,
    why: "UPnP IGD has no authentication at all, so any program on the LAN — including malware on a laptop or a compromised smart plug — can quietly open an inbound port on your router without asking you.",
    how: "Application → UPnP (or Advanced → NAT → UPnP) → disable. If a console needs open NAT, add one explicit port-forward instead.",
    verify: "The port-forwarding table should stop gaining entries you did not create.",
  },
  {
    id: "port-forward-audit",
    title: "Clear stale port forwards and any DMZ host",
    group: "Exposure",
    severity: "high",
    minutes: 6,
    why: "A DMZ host puts one machine behind no firewall at all, and old forwards for a CCTV recorder or a torrent client outlive the device that needed them. Each open port is a permanent invitation.",
    how: "Application → Port Forwarding / Virtual Server → delete every rule you cannot name a current reason for. Application → DMZ → disable.",
    verify: "Every remaining rule maps to a device that is still on the network today.",
  },
  {
    id: "disable-telnet-ssh",
    title: "Turn off Telnet and any unused LAN service",
    group: "Remote access",
    severity: "high",
    minutes: 4,
    why: "Several Airtel-supplied ONTs ship with Telnet enabled on the LAN using a vendor account you were never told about. Telnet is plaintext, so anyone on the Wi-Fi can read the session.",
    how: "Management → Access Control (LAN) → disable Telnet, FTP and TFTP. Leave only HTTPS on the LAN if the unit supports it.",
    verify: "Connecting to port 23 of the router from a LAN device should be refused.",
  },
  {
    id: "guest-network",
    title: "Put visitors and smart devices on a guest SSID",
    group: "Wi-Fi",
    severity: "high",
    minutes: 8,
    why: "A guest SSID with client isolation keeps a cheap smart bulb or a visitor's infected laptop away from your NAS, printers and work machine. It also means you never hand out the main passphrase.",
    how: "Network → WLAN → add a second SSID, set its own WPA2 key, and enable AP/client isolation so guest devices cannot see the LAN.",
    verify: "A device on the guest SSID should not be able to open the router admin page or reach a LAN IP.",
  },
  {
    id: "firmware-check",
    title: "Record the firmware version and chase updates",
    group: "Maintenance",
    severity: "high",
    minutes: 5,
    why: "On an ISP-managed ONT, firmware arrives from Airtel rather than from you, so the only lever you have is knowing which build you are on and escalating if it is years old.",
    how: "Status → Device Information → note the software/firmware version and the model. Raise a ticket in the Airtel Thanks app if it is clearly outdated or if a known advisory names your model.",
    verify: "You can state your model and firmware version from memory or a note.",
  },
  {
    id: "isp-account",
    title: "Secure the Airtel Thanks account itself",
    group: "Admin access",
    severity: "high",
    minutes: 5,
    why: "The Thanks app can rename your Wi-Fi and reset its password remotely, so the account is effectively a second admin login for the router. It is tied to your mobile number, which makes SIM-swap and OTP-sharing the realistic attack path.",
    how: "Use a unique password for the Airtel account, never read an OTP aloud to a caller, and set a SIM lock (PIN) on the Airtel SIM so a stolen phone cannot receive your OTPs.",
    verify: "You know the account password is not reused anywhere else.",
  },
  {
    id: "rename-ssid",
    title: "Rename the SSID away from the factory default",
    group: "Wi-Fi",
    severity: "medium",
    minutes: 3,
    why: "A default name broadcasts the ISP and often the model, which tells a passer-by exactly which default credentials and which firmware bugs to try. Do not put your flat number or family name in it either.",
    how: "Network → WLAN → SSID Name → pick something neutral. Leave SSID broadcast on; hiding it does not add real security and breaks some devices.",
    verify: "The network list no longer shows a name that identifies the ISP, model or household.",
  },
  {
    id: "custom-dns",
    title: "Point DNS at a filtering resolver",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "A filtering resolver blocks known malware and phishing domains for every device on the network at once, including the ones that cannot run security software. Some Airtel ONTs lock the WAN DNS fields — set it per device if so.",
    how: "Network → WAN or LAN → DHCP → set the DNS servers handed to clients, for example a family-filtering or malware-blocking public resolver. Keep a second resolver from a different operator as the fallback.",
    verify: "A device that renews its lease reports the resolver you configured.",
  },
  {
    id: "device-list",
    title: "Review the connected-device list",
    group: "Maintenance",
    severity: "medium",
    minutes: 5,
    why: "The client list is the cheapest intrusion check you have. An unfamiliar hostname or vendor prefix means the key has leaked and needs rotating.",
    how: "Status → Device Info → LAN / DHCP clients, or the device list in the Airtel Thanks app. Name every entry you recognise.",
    verify: "Every listed device is one you can point at in the house.",
  },
  {
    id: "config-backup",
    title: "Back up the configuration once it is clean",
    group: "Maintenance",
    severity: "medium",
    minutes: 4,
    why: "A hardened configuration is worth saving, because a technician visit or a factory reset silently returns the unit to sticker defaults and every step above is undone.",
    how: "Management → Backup / Restore → save the configuration file somewhere off the router. Treat that file as a secret: it contains your Wi-Fi key.",
    verify: "You have a dated backup file stored outside the router.",
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
  const done = new Set(
    completed.filter((id) => STEP_BY_ID.has(id) && !skipped.has(id)),
  );

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
    "Airtel Xstream Router Hardening",
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
