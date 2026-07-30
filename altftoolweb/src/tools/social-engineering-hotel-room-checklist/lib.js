/**
 * Hotel Room Tech Safety Checklist — routine and scoring.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * Every item below is an action with a documented reason, not a scare story:
 *  - Smart TVs in hotels keep the previous guest's logged-in accounts, and any
 *    account you sign into stays there for the next guest. Signing out and
 *    using casting or your own device is the fix hotel chains themselves
 *    recommend.
 *  - In-room safes ship with a manufacturer override (commonly 000000 or
 *    123456) and staff hold a master key or code by design. A safe deters
 *    opportunistic theft; it is not a vault, and the model treats it that way.
 *  - Room doors: the deadbolt and secondary latch are the parts a duplicated or
 *    cloned key card cannot bypass, which is why they are weighted highest.
 *  - Hidden cameras are rare but cheap to rule out: the practical checks are a
 *    line-of-sight sweep of anything pointed at the bed, and looking for lenses
 *    in devices that have no reason to have one.
 *
 * Weights rank the actions by how much they change the outcome. The result is a
 * relative exposure index (0-100), not a probability.
 */

export const MAX_INDEX = 100;

/** Longest stay the nights multiplier keeps growing for. */
export const NIGHTS_CAP = 11;
/** Extra exposure per night after the first, because housekeeping enters daily. */
export const PER_NIGHT_STEP = 0.05;
/** Ceiling on the nights multiplier (reached at NIGHTS_CAP nights). */
export const MAX_NIGHTS_FACTOR = 1.5;

export const ITEM_GROUPS = [
  {
    id: "door",
    title: "Door and physical access",
    items: [
      {
        id: "deadbolt",
        label: "Engage the deadbolt and secondary latch whenever you are inside",
        how: "A cloned or borrowed key card opens the lock but cannot move the deadbolt.",
        weight: 18,
        tier: "critical",
      },
      {
        id: "doorClosed",
        label: "Check the door latches fully behind you and does not spring back",
        how: "A door that rests on the strike plate is the most common way rooms are entered.",
        weight: 12,
        tier: "critical",
      },
      {
        id: "connectingDoor",
        label: "Check any connecting door is locked from your side",
        how: "Connecting doors have two locks; only one of them is yours.",
        weight: 10,
        tier: "high",
      },
      {
        id: "cardNoRoomNumber",
        label: "Keep the key card and the sleeve with your room number apart",
        how: "The sleeve, not the card, is what tells a finder which room to try.",
        weight: 6,
        tier: "useful",
      },
    ],
  },
  {
    id: "tv",
    title: "Smart TV and casting",
    items: [
      {
        id: "tvSignOut",
        label: "Sign out of any streaming accounts the previous guest left on the TV",
        how: "Settings > Accounts, or a factory-style 'sign out all' in the app.",
        weight: 8,
        tier: "high",
      },
      {
        id: "tvNoLogin",
        label: "Do not sign in to your own accounts on the room TV",
        how: "Cast from your phone or use your own laptop and HDMI instead.",
        weight: 14,
        tier: "critical",
      },
      {
        id: "tvCamera",
        label: "Check whether the TV or set-top box has a camera or microphone, and cover it",
        how: "Some hotel TVs ship with video-call hardware that guests never asked for.",
        weight: 8,
        tier: "high",
      },
      {
        id: "castCleanup",
        label: "Disconnect casting and clear the paired device before checkout",
        how: "Paired sessions persist and let the next guest see your device name and history.",
        weight: 6,
        tier: "useful",
      },
    ],
  },
  {
    id: "network",
    title: "Network kit in the room",
    items: [
      {
        id: "wifiName",
        label: "Confirm the exact guest network name at reception before joining",
        how: "A hotel is the easiest place to run an evil-twin hotspot named after the property.",
        weight: 12,
        tier: "critical",
      },
      {
        id: "portalNoCreds",
        label: "Never enter a Google, Apple or work password into the room's Wi-Fi portal",
        how: "A real portal asks for a room number and surname, never a third-party password.",
        weight: 14,
        tier: "critical",
      },
      {
        id: "noRoomEthernet",
        label: "Treat the in-room ethernet socket and any spare router as untrusted",
        how: "You cannot see who else shares that segment or what sits upstream.",
        weight: 8,
        tier: "high",
      },
      {
        id: "hotspot",
        label: "Use your phone's hotspot for banking, payroll or client systems",
        how: "It takes the hotel network out of the path for the few minutes that matter.",
        weight: 12,
        tier: "critical",
      },
    ],
  },
  {
    id: "room",
    title: "Devices, safe and valuables",
    items: [
      {
        id: "safeCode",
        label: "Set your own safe code and test it opens twice before loading it",
        how: "Never leave the factory code. Test first — a jammed safe with your passport inside is its own emergency.",
        weight: 10,
        tier: "high",
      },
      {
        id: "safeLimits",
        label: "Assume staff can open the safe, and keep truly critical items with you",
        how: "Every in-room safe has an override for the property. Use it against opportunists, not insiders.",
        weight: 8,
        tier: "high",
      },
      {
        id: "cameraSweep",
        label: "Look at anything pointed at the bed: alarm clocks, smoke detectors, plug adapters, decor",
        how: "Look for a lens, an unexplained pinhole, or a device that has no reason to face the bed.",
        weight: 10,
        tier: "high",
      },
      {
        id: "chargers",
        label: "Use your own charger, and ignore USB sockets built into lamps and headboards",
        how: "You cannot inspect what is behind a built-in socket, and your own adapter costs nothing to carry.",
        weight: 6,
        tier: "useful",
      },
      {
        id: "laptopLocked",
        label: "Lock or power off the laptop and enable full-disk encryption before leaving the room",
        how: "BitLocker or FileVault turns a stolen laptop into a lost laptop.",
        weight: 12,
        tier: "critical",
      },
      {
        id: "checkoutSweep",
        label: "Do a final sweep at checkout: safe, sockets, drawers, TV sign-outs",
        how: "The safe and the bedside socket are where things get left behind.",
        weight: 6,
        tier: "useful",
      },
    ],
  },
];

export const ALL_ITEMS = ITEM_GROUPS.flatMap((group) => group.items);

const ITEM_BY_ID = new Map(ALL_ITEMS.map((item) => [item.id, item]));

export const MAX_RAW = ALL_ITEMS.reduce((sum, item) => sum + item.weight, 0);

export const TIER_LABEL = {
  critical: "First ten minutes",
  high: "Worth doing",
  useful: "Nice to have",
};

/** What you are travelling with. */
export const SENSITIVITY = [
  { id: "leisure", label: "Holiday — phone and a personal laptop", factor: 0.9 },
  { id: "business", label: "Business trip — work laptop and email", factor: 1.15 },
  { id: "regulated", label: "Client, patient or regulated data on the device", factor: 1.3 },
];

export const BANDS = [
  {
    id: "high",
    label: "High exposure",
    tone: "danger",
    min: 45,
    advice: "Do the first-ten-minutes items before you unpack. They are the ones that change the outcome.",
  },
  {
    id: "moderate",
    label: "Moderate exposure",
    tone: "warning",
    min: 25,
    advice: "A couple of high-weight actions are outstanding. Clear those and the rest can wait.",
  },
  {
    id: "low",
    label: "Low exposure",
    tone: "warning",
    min: 10,
    advice: "The room is in reasonable shape. Finish the remaining items when convenient.",
  },
  {
    id: "minimal",
    label: "Minimal exposure",
    tone: "success",
    min: 0,
    advice: "Everything meaningful is done. Repeat the deadbolt and checkout sweep every day of the stay.",
  },
];

/** Multiplier for the length of the stay. Pure, capped, never NaN. */
export function nightsFactor(nights) {
  const value = Number(nights);
  if (!Number.isFinite(value) || value < 1) return null;
  const capped = Math.min(value, NIGHTS_CAP);
  const factor = 1 + (capped - 1) * PER_NIGHT_STEP;
  return Math.min(MAX_NIGHTS_FACTOR, Math.round(factor * 100) / 100);
}

const byId = (list, id) => list.find((item) => item.id === id);

/**
 * Score which room actions are still outstanding.
 *
 * @param {object} input
 * @param {string[]} input.doneIds    ids of actions already completed
 * @param {number|string} input.nights how many nights you are staying
 * @param {string} input.sensitivity  id from SENSITIVITY
 * @returns {object} result, or { error }
 */
export function assessHotelRoom({ doneIds = [], nights = 1, sensitivity } = {}) {
  if (!Array.isArray(doneIds)) return { error: "Tick the actions you have already done." };

  const profile = byId(SENSITIVITY, sensitivity);
  if (!profile) return { error: "Choose what you are travelling with." };

  const nightsValue = Number(nights);
  if (!Number.isFinite(nightsValue)) return { error: "Number of nights must be a number." };
  if (nightsValue < 1) return { error: "A stay is at least one night." };
  if (nightsValue > 365) return { error: "Enter a stay of 365 nights or fewer." };

  if (doneIds.some((id) => !ITEM_BY_ID.has(id))) {
    return { error: "One of the ticked actions is not on this checklist." };
  }

  const done = ALL_ITEMS.filter((item) => doneIds.includes(item.id));
  const outstanding = ALL_ITEMS.filter((item) => !doneIds.includes(item.id));

  const rawGap = outstanding.reduce((sum, item) => sum + item.weight, 0);
  const stayFactor = nightsFactor(nightsValue);
  const multiplier = Math.round(stayFactor * profile.factor * 100) / 100;
  const index = Math.min(MAX_INDEX, Math.round(rawGap * stayFactor * profile.factor * 10) / 10);
  const band = BANDS.find((item) => index >= item.min) || BANDS[BANDS.length - 1];

  const coverage = MAX_RAW > 0 ? Math.round(((MAX_RAW - rawGap) / MAX_RAW) * 100) : 100;
  const ranked = [...outstanding].sort((a, b) => b.weight - a.weight);

  return {
    index,
    band,
    coverage,
    rawGap,
    maxRaw: MAX_RAW,
    nights: nightsValue,
    stayFactor,
    profile,
    multiplier,
    done,
    outstanding: ranked,
    firstTenMinutes: ranked.filter((item) => item.tier === "critical"),
  };
}

/** Plain-text summary for the copy button. Pure. */
export function formatHotelResult(result) {
  if (!result || result.error) return "";
  const lines = [
    "Hotel room tech safety check",
    `Exposure index: ${result.index}/${MAX_INDEX} — ${result.band.label}`,
    `Actions done: ${result.done.length}/${ALL_ITEMS.length} (${result.coverage}% by weight)`,
    `Stay: ${result.nights} night(s), ${result.profile.label.toLowerCase()}`,
  ];
  if (result.firstTenMinutes.length > 0) {
    lines.push("", "Do these first:");
    result.firstTenMinutes.forEach((item) => lines.push(`- ${item.label}`));
  }
  const rest = result.outstanding.filter((item) => item.tier !== "critical");
  if (rest.length > 0) {
    lines.push("", "Then:");
    rest.forEach((item) => lines.push(`- ${item.label}`));
  }
  lines.push("", result.band.advice);
  return lines.join("\n");
}
