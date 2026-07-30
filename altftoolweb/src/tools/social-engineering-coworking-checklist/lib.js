/**
 * Coworking Space Security Checklist — per-category scoring.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * A shared workspace changes which controls matter. The threat is rarely a
 * network attack: it is people with legitimate access to the same floor. So the
 * controls are grouped by the five ways information actually leaves a desk in a
 * coworking space, and each category is scored separately so you can see which
 * one is weak instead of averaging everything into one number.
 *
 *  screens  — visual exposure: shoulder surfing, unlocked screens, video calls.
 *  print    — the shared printer: uncollected jobs, scan-to-email defaults, bins.
 *  devices  — laptops, phones, drives and the ten minutes you are at the coffee machine.
 *  network  — a LAN shared with every other member company, plus printer and NAS discovery.
 *  people   — tailgating at the door, vendor and "IT support" impersonation, overheard calls.
 *
 * Weights rank each control by how much it prevents. The output is a relative
 * exposure index (0-100), not a probability.
 */

export const MAX_INDEX = 100;

export const CATEGORIES = [
  { id: "screens", label: "Screens and what is visible" },
  { id: "print", label: "Printing and paper" },
  { id: "devices", label: "Devices and lock-up" },
  { id: "network", label: "Shared network" },
  { id: "people", label: "People and access" },
];

export const CONTROLS = [
  {
    id: "autoLock",
    category: "screens",
    label: "Screen locks automatically within a minute, and I lock it every time I stand up",
    weight: 16,
    fix: "Set the lock timer to 60 seconds and learn the keyboard shortcut so it costs nothing.",
  },
  {
    id: "privacyFilter",
    category: "screens",
    label: "A privacy filter is fitted, or the screen does not face a walkway",
    weight: 10,
    fix: "Sit with your back to a wall. A filter is a fallback when the seating is fixed.",
  },
  {
    id: "callDiscipline",
    category: "screens",
    label: "Sensitive calls and screen shares happen in a booth, not at the desk",
    weight: 10,
    fix: "Book the booth. Shared screens leak more than conversations do.",
  },
  {
    id: "notifications",
    category: "screens",
    label: "Notification previews are hidden on the lock screen and during screen sharing",
    weight: 8,
    fix: "Enable Do Not Disturb or presenter mode before you share a window.",
  },
  {
    id: "printRelease",
    category: "print",
    label: "Printing uses secure release (PIN or badge at the device), not send-and-walk",
    weight: 12,
    fix: "If the space has no secure release, stand at the printer before you press print.",
  },
  {
    id: "printCollect",
    category: "print",
    label: "I collect every job immediately and check the tray for pages that are not mine",
    weight: 8,
    fix: "Two minutes of an uncollected contract on an open tray is enough.",
  },
  {
    id: "shred",
    category: "print",
    label: "Confidential paper goes in a locked shredding bin, never the open recycling",
    weight: 8,
    fix: "Ask the operator where the locked bin is. Recycling bins are read by anyone.",
  },
  {
    id: "scanDefaults",
    category: "print",
    label: "Scan-to-email is sent to my own address and the device address book is not used",
    weight: 6,
    fix: "Shared devices keep the last recipient. Type your address every time.",
  },
  {
    id: "diskEncryption",
    category: "devices",
    label: "Full-disk encryption is on (BitLocker or FileVault)",
    weight: 16,
    fix: "This is what turns a stolen laptop into an inconvenience instead of a breach.",
  },
  {
    id: "tether",
    category: "devices",
    label: "The laptop is never left unattended, or is tethered with a lock cable",
    weight: 12,
    fix: "Take it to the coffee machine, or use the locker the space provides.",
  },
  {
    id: "lockers",
    category: "devices",
    label: "Drives, tokens and documents live in a locked drawer or locker overnight",
    weight: 8,
    fix: "Hot desks are cleared nightly by cleaners with full floor access.",
  },
  {
    id: "usbPolicy",
    category: "devices",
    label: "I never plug in a found or gifted USB drive",
    weight: 8,
    fix: "Hand it to the front desk. Curiosity is exactly what the drop is built on.",
  },
  {
    id: "wifiName",
    category: "network",
    label: "I join the operator's WPA2/WPA3 network, verified at the front desk, not an open SSID",
    weight: 12,
    fix: "Ask which SSID is genuine. A lookalike hotspot on a shared floor is trivial to run.",
  },
  {
    id: "firewallPublic",
    category: "network",
    label: "The device firewall is on and the network is marked Public, with sharing off",
    weight: 12,
    fix: "Windows: mark the network Public. macOS: turn off every service in Sharing.",
  },
  {
    id: "vpnWork",
    category: "network",
    label: "Work systems are reached over the company VPN or a zero-trust client",
    weight: 8,
    fix: "The LAN is shared with every other member company in the building.",
  },
  {
    id: "noAirdrop",
    category: "network",
    label: "AirDrop, Nearby Share and Bluetooth discovery are off or contacts-only",
    weight: 6,
    fix: "Open discovery invites unsolicited files and reveals your device name.",
  },
  {
    id: "noTailgate",
    category: "people",
    label: "I badge in myself and do not hold the door for people I do not know",
    weight: 12,
    fix: "Point them to reception politely. That is the operator's job, not yours.",
  },
  {
    id: "verifyVendor",
    category: "people",
    label: "Anyone claiming to be IT, a landlord or a vendor is verified with the operator first",
    weight: 12,
    fix: "Call the community manager. A genuine engineer expects to be checked.",
  },
  {
    id: "clearDesk",
    category: "people",
    label: "The desk is clear of passwords, notes and client names when I step away",
    weight: 8,
    fix: "Whiteboards and sticky notes are photographed, not stolen.",
  },
  {
    id: "guestEscort",
    category: "people",
    label: "My own guests are signed in and escorted, not left to wander",
    weight: 6,
    fix: "Sign them in at reception and walk them out again.",
  },
];

const CONTROL_BY_ID = new Map(CONTROLS.map((control) => [control.id, control]));

export const MAX_RAW = CONTROLS.reduce((sum, control) => sum + control.weight, 0);

/** Where you sit. Open hot desks carry the most visual and device exposure. */
export const SEAT_TYPES = [
  { id: "hotDesk", label: "Open-floor hot desk", factor: 1.2, note: "Strangers pass behind the screen all day and nothing is yours overnight." },
  { id: "dedicatedDesk", label: "Dedicated desk in a shared room", factor: 1.05, note: "Same floor, same people, but the space around you is at least stable." },
  { id: "privateCabin", label: "Private lockable cabin", factor: 0.85, note: "Visual and device exposure drop; the shared network and printer do not." },
  { id: "meetingRooms", label: "Meeting rooms and lounge only", factor: 1.1, note: "Constant movement, unfamiliar rooms and screens facing glass." },
];

/** How busy the floor is while you work. */
export const BUSYNESS = [
  { id: "quiet", label: "Quiet — a few regulars", factor: 0.9 },
  { id: "normal", label: "Normal working day", factor: 1 },
  { id: "busy", label: "Busy, most desks taken", factor: 1.1 },
  { id: "eventDay", label: "Event or open day with visitors", factor: 1.25 },
];

export const BANDS = [
  {
    id: "high",
    label: "High exposure",
    tone: "danger",
    min: 45,
    advice: "Start with the weakest category below — the gaps are concentrated, not spread evenly.",
  },
  {
    id: "moderate",
    label: "Moderate exposure",
    tone: "warning",
    min: 25,
    advice: "Most of the basics are in place. Two or three controls carry most of what is left.",
  },
  {
    id: "low",
    label: "Low exposure",
    tone: "warning",
    min: 10,
    advice: "Solid habits. Close the remaining items and this becomes routine.",
  },
  {
    id: "minimal",
    label: "Minimal exposure",
    tone: "success",
    min: 0,
    advice: "Nothing material outstanding. Re-check on event days, when the floor fills with visitors.",
  },
];

const byId = (list, id) => list.find((item) => item.id === id);

/**
 * Score coworking habits, overall and per category.
 *
 * @param {object} input
 * @param {string[]} input.inPlace  ids of controls already in place
 * @param {string} input.seatType   id from SEAT_TYPES
 * @param {string} input.busyness   id from BUSYNESS
 * @returns {object} result, or { error }
 */
export function assessCoworking({ inPlace = [], seatType, busyness } = {}) {
  if (!Array.isArray(inPlace)) return { error: "Tick the habits you already follow." };

  const seat = byId(SEAT_TYPES, seatType);
  const floor = byId(BUSYNESS, busyness);
  if (!seat) return { error: "Choose the kind of desk you use." };
  if (!floor) return { error: "Choose how busy the space is." };

  if (inPlace.some((id) => !CONTROL_BY_ID.has(id))) {
    return { error: "One of the ticked habits is not on this checklist." };
  }

  const multiplier = Math.round(seat.factor * floor.factor * 100) / 100;
  const done = CONTROLS.filter((control) => inPlace.includes(control.id));
  const missing = CONTROLS.filter((control) => !inPlace.includes(control.id));

  const rawGap = missing.reduce((sum, control) => sum + control.weight, 0);
  const index = Math.min(MAX_INDEX, Math.round(rawGap * seat.factor * floor.factor * 10) / 10);
  const band = BANDS.find((item) => index >= item.min) || BANDS[BANDS.length - 1];

  const categories = CATEGORIES.map((category) => {
    const all = CONTROLS.filter((control) => control.category === category.id);
    const total = all.reduce((sum, control) => sum + control.weight, 0);
    const gap = all
      .filter((control) => !inPlace.includes(control.id))
      .reduce((sum, control) => sum + control.weight, 0);
    return {
      ...category,
      total,
      gap,
      coverage: total > 0 ? Math.round(((total - gap) / total) * 100) : 100,
      missing: all.filter((control) => !inPlace.includes(control.id)),
    };
  });

  const weakest = [...categories].sort((a, b) => a.coverage - b.coverage)[0];

  return {
    index,
    band,
    multiplier,
    seat,
    floor,
    rawGap,
    maxRaw: MAX_RAW,
    coverage: MAX_RAW > 0 ? Math.round(((MAX_RAW - rawGap) / MAX_RAW) * 100) : 100,
    done,
    missing: [...missing].sort((a, b) => b.weight - a.weight),
    categories,
    weakest: weakest && weakest.gap > 0 ? weakest : null,
  };
}

/** Plain-text summary for the copy button. Pure. */
export function formatCoworkingResult(result) {
  if (!result || result.error) return "";
  const lines = [
    "Coworking security check",
    `Exposure index: ${result.index}/${MAX_INDEX} — ${result.band.label}`,
    `Controls in place: ${result.done.length}/${CONTROLS.length} (${result.coverage}% by weight)`,
    `Setting: ${result.seat.label}, ${result.floor.label.toLowerCase()}`,
    "",
    "Category coverage:",
  ];
  result.categories.forEach((category) =>
    lines.push(`- ${category.label}: ${category.coverage}%`),
  );
  if (result.missing.length > 0) {
    lines.push("", "Gaps, highest impact first:");
    result.missing.forEach((control) => lines.push(`- ${control.label}`));
  }
  lines.push("", result.band.advice);
  return lines.join("\n");
}
