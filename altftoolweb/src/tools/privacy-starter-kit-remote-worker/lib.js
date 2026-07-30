/**
 * Remote Worker Privacy Starter Kit — an applicability-filtered home-office baseline.
 *
 * Two independent measurements:
 *
 * 1. Baseline score. Each control carries 1-5 points. Only the controls that apply to
 *    your situation are counted, so a company-managed laptop is not marked down for
 *    missing a personal backup, and someone living alone is not marked down for not
 *    using headphones on calls. score = points earned / points available for your
 *    situation x 100.
 *
 * 2. Network segmentation. segmentation = (devices on the network) - (devices left on
 *    the same network as the work machine), expressed as a percentage of the total.
 *    Nothing is estimated: it is simply the share of your smart TVs, speakers, cameras
 *    and housemates' phones that no longer share a broadcast domain with work.
 *    Consumer IoT devices are the least-patched things on a home LAN, which is why
 *    moving them to a guest SSID is treated as a first-class metric rather than a tip.
 */

/** Sanity ceiling on the device counts. */
export const MAX_DEVICES = 200;

export const SETUPS = [
  { id: "company-managed", label: "Company-managed laptop" },
  { id: "byod", label: "My own device (BYOD)" },
];

export const HOUSEHOLDS = [
  { id: "solo", label: "I live alone" },
  { id: "family", label: "I live with family" },
  { id: "shared", label: "Shared flat or houseshare" },
];

export const RISK_BANDS = [
  { min: 85, label: "Strong baseline", note: "Your home office matches what most security teams ask for. Re-check after any router or house move." },
  { min: 65, label: "Reasonable baseline", note: "The core is right. Close the remaining items, starting with anything marked critical." },
  { min: 40, label: "Partial baseline", note: "Enough gaps that a single phishing email or a flatmate's infected laptop would matter." },
  { min: 0, label: "Weak baseline", note: "Start with the router admin password, disk encryption and multi-factor authentication." },
];

/**
 * appliesTo: undefined means always. Otherwise the control only counts when the named
 * field matches one of the listed values.
 */
export const CHECKLIST = [
  {
    id: "net-router-pw",
    area: "Home network",
    title: "Change the router's admin password and switch off remote administration",
    action: "Use a unique password from your manager, then disable WAN-side admin access and cloud remote management you do not use.",
    why: "Default router credentials are published per model, and remote admin exposes that login to the whole internet.",
    weight: 5,
    critical: true,
  },
  {
    id: "net-wpa3",
    area: "Home network",
    title: "Run the Wi-Fi on WPA2-AES or WPA3 with a long passphrase",
    action: "Remove WEP, TKIP and any open or hidden legacy SSID still broadcasting from the same router.",
    why: "WEP and TKIP are broken; the encryption mode is what stops a neighbour reading traffic off the air.",
    weight: 4,
    critical: false,
  },
  {
    id: "net-guest",
    area: "Home network",
    title: "Put smart devices and housemates on a separate guest SSID",
    action: "Most routers offer a guest network with client isolation — move TVs, speakers, cameras and visitors onto it.",
    why: "IoT gadgets are the least-patched things in the house and sit on the same LAN as your work laptop by default.",
    weight: 4,
    critical: false,
  },
  {
    id: "net-firmware",
    area: "Home network",
    title: "Turn on automatic router firmware updates",
    action: "If the router cannot auto-update, check for firmware quarterly and replace it once the vendor stops issuing updates.",
    why: "Router flaws are exploited from the internet without any click from you, and unsupported models never get fixed.",
    weight: 3,
    critical: false,
  },
  {
    id: "net-upnp",
    area: "Home network",
    title: "Disable UPnP and remove port forwards you did not add deliberately",
    action: "Check the port-forwarding and DMZ pages; anything you cannot explain should be deleted.",
    why: "UPnP lets any device on the LAN open a hole through your firewall without telling you.",
    weight: 3,
    critical: false,
  },
  {
    id: "net-dns",
    area: "Home network",
    title: "Use an encrypted DNS resolver",
    action: "Enable DNS over HTTPS or DNS over TLS in the browser, the OS or the router.",
    why: "Plain DNS reveals every site name you visit to anyone between you and the resolver.",
    weight: 2,
    critical: false,
  },
  {
    id: "dev-encrypt",
    area: "Devices",
    title: "Switch on full-disk encryption for the work machine",
    action: "BitLocker on Windows, FileVault on macOS, and confirm the recovery key is stored somewhere you can reach.",
    why: "Encryption is the difference between a stolen laptop being a hardware loss and being a data breach.",
    weight: 5,
    critical: true,
  },
  {
    id: "dev-updates",
    area: "Devices",
    title: "Leave automatic OS, browser and app updates on",
    action: "Schedule restarts outside working hours so you never postpone an update for weeks.",
    why: "Most successful intrusions use a flaw that already had a patch available.",
    weight: 4,
    critical: false,
  },
  {
    id: "dev-lock",
    area: "Devices",
    title: "Auto-lock in five minutes or less, and lock the screen when you step away",
    action: "Make it a habit at the door, not something you rely on the timer for.",
    why: "An unlocked work laptop in a shared home is an unattended session with your full access rights.",
    weight: 4,
    critical: true,
    appliesTo: { field: "household", values: ["family", "shared"] },
  },
  {
    id: "dev-profile",
    area: "Devices",
    title: "Keep a separate operating-system profile for work",
    action: "Work in its own user account with its own browser profile, extensions and downloads folder.",
    why: "On a personal device, one profile means a family member's download runs with access to your work files.",
    weight: 4,
    critical: false,
    appliesTo: { field: "setup", values: ["byod"] },
  },
  {
    id: "dev-backup",
    area: "Devices",
    title: "Keep an encrypted backup of the work data you are responsible for",
    action: "Three copies, two media types, one off-site — and test a restore once.",
    why: "On a personal device there is no IT department quietly backing your machine up for you.",
    weight: 3,
    critical: false,
    appliesTo: { field: "setup", values: ["byod"] },
  },
  {
    id: "dev-mdm",
    area: "Devices",
    title: "Leave the company's management profile alone and report a lost device the same day",
    action: "Do not remove or bypass the management agent, and know the IT contact number before you need it.",
    why: "Remote wipe only helps if the profile is intact and the loss is reported while the device is still online.",
    weight: 4,
    critical: true,
    appliesTo: { field: "setup", values: ["company-managed"] },
  },
  {
    id: "dev-usb",
    area: "Devices",
    title: "Do not plug unknown USB drives or borrowed cables into the work machine",
    action: "Carry your own charger and cable, and use a data-blocker for public USB ports.",
    why: "A USB port carries data as well as power, and the device decides what it presents itself as.",
    weight: 2,
    critical: false,
  },
  {
    id: "acc-mfa",
    area: "Accounts",
    title: "Multi-factor authentication or passkeys on the work identity",
    action: "Prefer a passkey or an authenticator app over SMS codes, and register a second factor as backup.",
    why: "Remote access with a password alone is the single most exploited weakness in distributed teams.",
    weight: 5,
    critical: true,
  },
  {
    id: "acc-vpn",
    area: "Accounts",
    title: "Use the company VPN or zero-trust client on networks you do not control",
    action: "Cafes, hotels, airports and a client's guest Wi-Fi all count as networks you do not control.",
    why: "It removes the local network's ability to see or redirect your traffic on the way to work systems.",
    weight: 4,
    critical: false,
  },
  {
    id: "acc-phish",
    area: "Accounts",
    title: "Verify unexpected payment or credential requests on a second channel",
    action: "Call the person on a number you already have. Never use the contact details in the message itself.",
    why: "Remote teams cannot glance across a desk, which is precisely what impersonation fraud relies on.",
    weight: 4,
    critical: true,
  },
  {
    id: "call-background",
    area: "Calls",
    title: "Blur or replace your video background and check what it shows",
    action: "Look for whiteboards, delivery labels, medication, documents and children's belongings before you join.",
    why: "A video call broadcasts your home interior to everyone in the meeting, including external guests.",
    weight: 3,
    critical: false,
  },
  {
    id: "call-mute",
    area: "Calls",
    title: "Join every meeting muted with the camera off by default",
    action: "Set it in the client's preferences so it does not depend on remembering.",
    why: "The costly leaks on calls are the first ten seconds, before you realise you were already live.",
    weight: 2,
    critical: false,
  },
  {
    id: "call-headphones",
    area: "Calls",
    title: "Use headphones for work calls",
    action: "Speakerphone puts the other side's audio into a room you share with people who never agreed to hear it.",
    why: "Confidential discussion overheard at home is still a disclosure, and it is the easiest one to prevent.",
    weight: 3,
    critical: false,
    appliesTo: { field: "household", values: ["family", "shared"] },
  },
  {
    id: "call-links",
    area: "Calls",
    title: "Keep meeting links off public pages and switch the lobby on",
    action: "Require a waiting room for external meetings and never reuse a personal meeting room for sensitive calls.",
    why: "Published links get scanned and joined, and a permanent personal room is a permanent open door.",
    weight: 3,
    critical: false,
  },
  {
    id: "call-recording",
    area: "Calls",
    title: "Announce recordings and say where the recording will be stored",
    action: "Get agreement before you start, and check the retention setting on the meeting platform.",
    why: "Recordings and auto-transcripts persist in places participants never see and rarely expect.",
    weight: 3,
    critical: false,
  },
];

export const AREAS = CHECKLIST.reduce(
  (list, item) => (list.includes(item.area) ? list : [...list, item.area]),
  [],
);

function bandFor(percent) {
  return RISK_BANDS.find((band) => percent >= band.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

/** Does a control apply to the chosen setup and household? */
export function appliesToProfile(item, profile) {
  if (!item.appliesTo) return true;
  const value = profile[item.appliesTo.field];
  return item.appliesTo.values.includes(value);
}

function validCount(value, label) {
  const n = Number(value);
  const Label = label.charAt(0).toUpperCase() + label.slice(1);
  if (!Number.isFinite(n)) return { error: `Enter ${label} as a plain number.` };
  if (!Number.isInteger(n)) return { error: `${Label} must be a whole number.` };
  if (n < 0) return { error: `${Label} cannot be negative.` };
  if (n > MAX_DEVICES) return { error: `Enter ${MAX_DEVICES} or fewer for ${label}.` };
  return { value: n };
}

/**
 * @param {{doneIds:string[], setup:string, household:string,
 *          homeDevices:number, trustedDevices:number}} input
 */
export function assessRemoteKit({ doneIds, setup, household, homeDevices, trustedDevices } = {}) {
  if (!Array.isArray(doneIds)) return { error: "Completed items must be provided as a list." };
  if (!SETUPS.some((option) => option.id === setup)) {
    return { error: "Choose whether the machine is company-managed or your own." };
  }
  if (!HOUSEHOLDS.some((option) => option.id === household)) {
    return { error: "Choose who else shares the home." };
  }

  const total = validCount(homeDevices, "devices on your home network");
  if (total.error) return { error: total.error };
  const trusted = validCount(trustedDevices, "devices sharing the work network");
  if (trusted.error) return { error: trusted.error };
  if (total.value === 0) {
    return { error: "Count at least one device on your home network." };
  }
  if (trusted.value > total.value) {
    return { error: "Devices sharing the work network cannot exceed the total on your home network." };
  }

  const profile = { setup, household };
  const done = new Set(doneIds.filter((id) => typeof id === "string"));

  const applicable = CHECKLIST.filter((item) => appliesToProfile(item, profile));
  const notApplicable = CHECKLIST.filter((item) => !appliesToProfile(item, profile));

  let points = 0;
  const remaining = [];
  for (const item of applicable) {
    if (done.has(item.id)) points += item.weight;
    else remaining.push(item);
  }

  const maxPoints = applicable.reduce((sum, item) => sum + item.weight, 0);
  const percent = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

  const segregated = total.value - trusted.value;
  const segmentationPercent = total.value > 0 ? (segregated / total.value) * 100 : 0;

  const areaBreakdown = AREAS.map((area) => {
    const items = applicable.filter((item) => item.area === area);
    const earned = items.reduce((sum, item) => sum + (done.has(item.id) ? item.weight : 0), 0);
    const available = items.reduce((sum, item) => sum + item.weight, 0);
    return {
      area,
      done: items.filter((item) => done.has(item.id)).length,
      total: items.length,
      percent: available > 0 ? (earned / available) * 100 : 0,
    };
  }).filter((entry) => entry.total > 0);

  const openCritical = remaining.filter((item) => item.critical);

  return {
    profile,
    applicable,
    notApplicable,
    points,
    maxPoints,
    percent,
    band: bandFor(percent),
    completed: applicable.length - remaining.length,
    total: applicable.length,
    remaining,
    openCritical,
    nextStep: openCritical[0] ?? remaining[0] ?? null,
    homeDevices: total.value,
    trustedDevices: trusted.value,
    segregatedDevices: segregated,
    segmentationPercent,
    areaBreakdown,
  };
}
