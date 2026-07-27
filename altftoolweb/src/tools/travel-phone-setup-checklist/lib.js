/**
 * Travel phone setup checklist.
 *
 * The catalogue below is filtered by trip type, connectivity plan and whether
 * you are flying or driving, then scored. Scoring is a weighted completion
 * ratio, not a plain item count, so skipping a critical item costs more than
 * skipping an optional one:
 *
 *   readiness % = sum(weight of ticked items) / sum(weight of all items) x 100
 *
 * Each item also carries a lead time in days. An item is "due now" when the
 * days remaining until departure have fallen to or below that lead time.
 */

/** Weights used by the readiness score. */
export const PRIORITY_WEIGHT = {
  critical: 3,
  recommended: 2,
  optional: 1,
};

export const PRIORITY_LABEL = {
  critical: "Critical",
  recommended: "Recommended",
  optional: "Optional",
};

export const CONNECTIVITY_PLANS = {
  roaming: { label: "Home carrier roaming pack" },
  esim: { label: "Travel eSIM" },
  localSim: { label: "Local SIM bought on arrival" },
  wifiOnly: { label: "Wi-Fi only, no mobile data" },
};

export const SECTIONS = [
  { id: "backup", label: "Backups and storage" },
  { id: "connectivity", label: "Connectivity" },
  { id: "offline", label: "Offline essentials" },
  { id: "power", label: "Power and hardware" },
  { id: "security", label: "Security and safety" },
  { id: "documents", label: "Payments and documents" },
];

/** A trip can be planned at most a year out; beyond that the list is noise. */
export const MAX_LEAD_DAYS = 365;

/**
 * The full catalogue. `applies` is a pure predicate over the trip options.
 * `leadDays` is how many days before departure the task should be done.
 */
const CATALOGUE = [
  // --- Backups and storage ---
  {
    id: "os-update",
    section: "backup",
    label: "Install pending OS and app updates",
    detail:
      "Do it on home Wi-Fi. A forced update on a metered roaming connection can cost several gigabytes.",
    priority: "recommended",
    leadDays: 3,
    applies: () => true,
  },
  {
    id: "storage-free",
    section: "backup",
    label: "Free up storage space",
    detail:
      "Offload old photos and unused apps so there is room for the photos and videos you are about to take.",
    priority: "recommended",
    leadDays: 3,
    applies: () => true,
  },
  {
    id: "full-backup",
    section: "backup",
    label: "Run a full phone backup",
    detail:
      "iCloud Backup or Google One. This is the single thing that turns a stolen phone from a disaster into an expense.",
    priority: "critical",
    leadDays: 2,
    applies: () => true,
  },
  {
    id: "backup-verify",
    section: "backup",
    label: "Verify the backup date reads today",
    detail:
      "Open the backup screen and check the timestamp. A backup that silently stopped months ago is worse than none.",
    priority: "critical",
    leadDays: 1,
    applies: () => true,
  },

  // --- Connectivity ---
  {
    id: "handset-unlocked",
    section: "connectivity",
    label: "Confirm the handset is carrier-unlocked",
    detail:
      "A locked phone will not accept a travel eSIM or a local SIM. Unlock requests can take a few working days.",
    priority: "critical",
    leadDays: 7,
    applies: (o) => o.plan === "esim" || o.plan === "localSim",
  },
  {
    id: "esim-install",
    section: "connectivity",
    label: "Install the eSIM profile before you leave",
    detail:
      "Install on home Wi-Fi. Most eSIM QR codes can only be redeemed once, and you need a connection to activate.",
    priority: "critical",
    leadDays: 2,
    applies: (o) => o.plan === "esim",
  },
  {
    id: "esim-keep-home-line",
    section: "connectivity",
    label: "Keep the home line active for SMS one-time passcodes",
    detail:
      "Leave the home SIM enabled for calls and texts but set the travel eSIM as the data line, so bank OTPs still arrive.",
    priority: "critical",
    leadDays: 1,
    applies: (o) => o.plan === "esim",
  },
  {
    id: "roaming-pack",
    section: "connectivity",
    label: "Activate the roaming pack and note its daily cap",
    detail:
      "Confirm the start date, the included allowance and what happens after the cap — out-of-bundle roaming is where the shock bills come from.",
    priority: "critical",
    leadDays: 2,
    applies: (o) => o.plan === "roaming",
  },
  {
    id: "localsim-registration",
    section: "connectivity",
    label: "Check what ID a local SIM needs on arrival",
    detail:
      "Many countries require passport registration for a prepaid SIM, and some only sell them at official carrier stores.",
    priority: "recommended",
    leadDays: 3,
    applies: (o) => o.plan === "localSim",
  },
  {
    id: "data-roaming-off",
    section: "connectivity",
    label: "Turn data roaming off",
    detail:
      "With no data plan, leaving roaming on is how a single background sync becomes a three-figure bill.",
    priority: "critical",
    leadDays: 0,
    applies: (o) => o.plan === "wifiOnly",
  },
  {
    id: "data-warning",
    section: "connectivity",
    label: "Set a mobile-data warning and hard limit",
    detail:
      "Both Android and iOS can warn at a chosen threshold. Set it below your pack size so you find out before the carrier tells you.",
    priority: "recommended",
    leadDays: 1,
    applies: (o) => o.plan !== "wifiOnly",
  },
  {
    id: "wifi-calling",
    section: "connectivity",
    label: "Enable Wi-Fi calling",
    detail:
      "Your home number then works over hotel Wi-Fi at domestic rates instead of roaming voice rates.",
    priority: "recommended",
    leadDays: 1,
    applies: () => true,
  },
  {
    id: "background-refresh",
    section: "connectivity",
    label: "Turn off background app refresh on mobile data",
    detail:
      "Photo sync, cloud drives and app updates are the biggest silent consumers of a roaming allowance.",
    priority: "recommended",
    leadDays: 1,
    applies: (o) => o.plan !== "wifiOnly",
  },
  {
    id: "backup-wifi-only",
    section: "connectivity",
    label: "Set photo and video backup to Wi-Fi only",
    detail:
      "Recorded video is roughly 60 MB per minute at 1080p and 190 MB per minute at 4K — it will drain any travel pack.",
    priority: "recommended",
    leadDays: 1,
    applies: () => true,
  },

  // --- Offline essentials ---
  {
    id: "offline-maps",
    section: "offline",
    label: "Download offline maps for every city on the route",
    detail:
      "Google Maps and Apple Maps both allow a downloaded region that works with GPS and no signal at all.",
    priority: "critical",
    leadDays: 1,
    applies: () => true,
  },
  {
    id: "offline-driving-region",
    section: "offline",
    label: "Download the offline map for the whole driving route",
    detail:
      "City-only downloads leave gaps between towns, which is exactly where coverage disappears.",
    priority: "critical",
    leadDays: 1,
    applies: (o) => o.driving,
  },
  {
    id: "offline-translate",
    section: "offline",
    label: "Download the offline language pack",
    detail:
      "Google Translate and Apple Translate both work fully offline once the language is downloaded, including camera text.",
    priority: "recommended",
    leadDays: 1,
    applies: (o) => o.international,
  },
  {
    id: "boarding-passes",
    section: "offline",
    label: "Add boarding passes to the wallet app",
    detail:
      "A wallet pass renders without a network. Airline apps often will not load a pass at a gate with congested Wi-Fi.",
    priority: "critical",
    leadDays: 1,
    applies: (o) => o.flying,
  },
  {
    id: "bookings-offline",
    section: "offline",
    label: "Save hotel, transfer and tour confirmations offline",
    detail:
      "Screenshot or download as PDF, including the address in the local language and script for taxi drivers.",
    priority: "critical",
    leadDays: 1,
    applies: () => true,
  },
  {
    id: "offline-media",
    section: "offline",
    label: "Download podcasts, playlists and shows",
    detail:
      "Downloading before departure also avoids paying roaming rates for streaming you could have had for free.",
    priority: "optional",
    leadDays: 1,
    applies: (o) => o.flying,
  },

  // --- Power and hardware ---
  {
    id: "plug-adapter",
    section: "power",
    label: "Pack the right plug adapter for the destination",
    detail:
      "Check the socket type and voltage. Modern phone chargers handle 100-240 V, but the plug shape still has to fit.",
    priority: "critical",
    leadDays: 1,
    applies: (o) => o.international,
  },
  {
    id: "power-bank-carryon",
    section: "power",
    label: "Charge the power bank and pack it in carry-on",
    detail:
      "IATA rules require lithium batteries in the cabin, not the hold. Banks up to 100 Wh are fine; 100-160 Wh need airline approval.",
    priority: "critical",
    leadDays: 0,
    applies: (o) => o.flying,
  },
  {
    id: "spare-cable",
    section: "power",
    label: "Pack a spare charging cable and a multi-port charger",
    detail:
      "One cable failure abroad costs more in time than the spare costs at home.",
    priority: "recommended",
    leadDays: 1,
    applies: () => true,
  },
  {
    id: "car-mount",
    section: "power",
    label: "Pack a car mount and a 12 V charger",
    detail:
      "Navigation drains a phone faster than a car USB port refills it on many rental cars.",
    priority: "recommended",
    leadDays: 1,
    applies: (o) => o.driving,
  },
  {
    id: "battery-health",
    section: "power",
    label: "Check battery health and set up a low-power shortcut",
    detail:
      "A battery below about 80% health will not survive a long travel day on navigation.",
    priority: "optional",
    leadDays: 3,
    applies: () => true,
  },

  // --- Security and safety ---
  {
    id: "strong-passcode",
    section: "security",
    label: "Set a six-digit or alphanumeric passcode",
    detail:
      "A four-digit PIN has 10,000 combinations; six digits has a million. Shoulder-surfing then a snatch is a common travel theft pattern.",
    priority: "critical",
    leadDays: 3,
    applies: () => true,
  },
  {
    id: "find-my",
    section: "security",
    label: "Turn on Find My / Find My Device and test it",
    detail:
      "Test from another device so you know it actually reports a location before you need it.",
    priority: "critical",
    leadDays: 2,
    applies: () => true,
  },
  {
    id: "2fa-backup-codes",
    section: "security",
    label: "Store two-factor backup codes off the phone",
    detail:
      "If the phone is the only second factor, losing it locks you out of email and banking at the worst moment. Print them or keep them in a separate password manager.",
    priority: "critical",
    leadDays: 3,
    applies: () => true,
  },
  {
    id: "sim-pin",
    section: "security",
    label: "Set a SIM PIN",
    detail:
      "A SIM PIN stops a thief moving your number to another handset and intercepting SMS one-time passcodes.",
    priority: "recommended",
    leadDays: 2,
    applies: (o) => o.plan !== "wifiOnly",
  },
  {
    id: "medical-id",
    section: "security",
    label: "Fill in Medical ID and lock-screen emergency contacts",
    detail:
      "Both iOS and Android show this without unlocking, including allergies, blood group and who to call.",
    priority: "critical",
    leadDays: 2,
    applies: () => true,
  },
  {
    id: "vpn-tested",
    section: "security",
    label: "Install and test a VPN before you need it",
    detail:
      "Test it at home; some networks and app stores are restricted at the destination, making it impossible to install on arrival.",
    priority: "recommended",
    leadDays: 2,
    applies: (o) => o.international,
  },
  {
    id: "location-sharing",
    section: "security",
    label: "Share your live location with someone at home",
    detail:
      "Set an expiry that covers the trip. It costs nothing and is the fastest thing to have already done if something goes wrong.",
    priority: "recommended",
    leadDays: 1,
    applies: () => true,
  },
  {
    id: "imei-noted",
    section: "security",
    label: "Note the IMEI and your carrier's lost-phone number",
    detail:
      "Keep both somewhere that is not the phone. The IMEI is what a police report and a carrier block both need.",
    priority: "optional",
    leadDays: 3,
    applies: () => true,
  },

  // --- Payments and documents ---
  {
    id: "bank-travel-notice",
    section: "documents",
    label: "Set the travel flag in your banking apps",
    detail:
      "Most banks now do this in-app rather than by phone. Without it, the first foreign transaction can trigger a block.",
    priority: "recommended",
    leadDays: 3,
    applies: (o) => o.international,
  },
  {
    id: "wallet-cards",
    section: "documents",
    label: "Add cards to the phone wallet and test a contactless payment",
    detail:
      "Test at home. Adding a card usually needs an SMS verification you may not receive abroad.",
    priority: "recommended",
    leadDays: 2,
    applies: () => true,
  },
  {
    id: "passport-scan",
    section: "documents",
    label: "Store a protected scan of your passport and visa",
    detail:
      "Keep it in a password-protected note or an encrypted folder, not the camera roll, and make sure it is readable offline.",
    priority: "critical",
    leadDays: 3,
    applies: (o) => o.international,
  },
  {
    id: "insurance-offline",
    section: "documents",
    label: "Save the insurance policy number and 24/7 helpline offline",
    detail:
      "Save the helpline as a full international number with the country code, not a domestic short code that will not dial from abroad.",
    priority: "critical",
    leadDays: 3,
    applies: () => true,
  },
  {
    id: "carrier-support-number",
    section: "documents",
    label: "Save your carrier's international support number",
    detail:
      "Short codes such as 611 or 121 usually do not connect while roaming; store the full +country-code version.",
    priority: "optional",
    leadDays: 2,
    applies: () => true,
  },
];

const toNumber = (raw) => {
  if (raw === "" || raw === null || raw === undefined) return NaN;
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Build the checklist for a trip.
 *
 * @param {object} options
 * @param {boolean} options.international
 * @param {string}  options.plan                key of CONNECTIVITY_PLANS
 * @param {boolean} options.flying
 * @param {boolean} options.driving
 * @param {number|string} options.daysUntilDeparture
 * @returns {object} { sections, items, totalItems } or { error }
 */
export function buildChecklist(options = {}) {
  const {
    international = true,
    plan = "esim",
    flying = true,
    driving = false,
  } = options;

  if (!CONNECTIVITY_PLANS[plan]) {
    return { error: "Choose a connectivity plan for the trip." };
  }

  const daysUntilDeparture = toNumber(options.daysUntilDeparture);
  if (Number.isNaN(daysUntilDeparture)) {
    return { error: "Days until departure must be a number." };
  }
  if (daysUntilDeparture < 0) {
    return { error: "Days until departure cannot be negative." };
  }
  if (daysUntilDeparture > MAX_LEAD_DAYS) {
    return { error: `Plan within ${MAX_LEAD_DAYS} days of departure.` };
  }

  const context = { international, plan, flying, driving };
  const items = CATALOGUE.filter((item) => item.applies(context)).map((item) => ({
    id: item.id,
    section: item.section,
    label: item.label,
    detail: item.detail,
    priority: item.priority,
    weight: PRIORITY_WEIGHT[item.priority],
    leadDays: item.leadDays,
    dueNow: daysUntilDeparture <= item.leadDays,
  }));

  const sections = SECTIONS.map((section) => ({
    ...section,
    items: items.filter((item) => item.section === section.id),
  })).filter((section) => section.items.length > 0);

  return {
    daysUntilDeparture,
    planLabel: CONNECTIVITY_PLANS[plan].label,
    sections,
    items,
    totalItems: items.length,
  };
}

/**
 * Score a checklist against the set of ticked item ids.
 *
 * @param {Array} items    items from buildChecklist
 * @param {Array<string>|Set<string>} checkedIds
 * @returns {object} score summary, or { error } for unusable input.
 */
export function scoreChecklist(items, checkedIds = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "There are no checklist items to score." };
  }
  const checked = checkedIds instanceof Set ? checkedIds : new Set(checkedIds);

  let weightTotal = 0;
  let weightDone = 0;
  let criticalTotal = 0;
  let criticalDone = 0;
  let dueNowTotal = 0;
  let dueNowDone = 0;
  let doneCount = 0;

  for (const item of items) {
    const isDone = checked.has(item.id);
    weightTotal += item.weight;
    if (isDone) {
      weightDone += item.weight;
      doneCount += 1;
    }
    if (item.priority === "critical") {
      criticalTotal += 1;
      if (isDone) criticalDone += 1;
    }
    if (item.dueNow) {
      dueNowTotal += 1;
      if (isDone) dueNowDone += 1;
    }
  }

  // weightTotal is > 0 because every priority weight is >= 1 and items is non-empty.
  const percent = Math.round((weightDone / weightTotal) * 100);
  const criticalRemaining = criticalTotal - criticalDone;
  const dueNowRemaining = dueNowTotal - dueNowDone;

  let status;
  if (percent === 0) status = "Not started";
  else if (criticalRemaining === 0 && percent >= 90) status = "Ready to fly";
  else if (criticalRemaining === 0) status = "Critical items done";
  else if (percent >= 60) status = "Nearly there";
  else status = "In progress";

  return {
    percent,
    weightDone,
    weightTotal,
    doneCount,
    totalCount: items.length,
    criticalTotal,
    criticalDone,
    criticalRemaining,
    dueNowTotal,
    dueNowRemaining,
    status,
  };
}
