/**
 * Hotel arrival security routine — scoring that adapts to the type of property.
 *
 * The mechanics behind the items:
 *
 *  - An in-room safe is a deterrent, not a vault. Most models ship with a manufacturer
 *    override code and accept a staff master card, and they are typically bolted into
 *    furniture rather than the building. Front-desk deposit boxes are a different product
 *    with different liability, which is why irreplaceable items belong there.
 *  - Hotel Wi-Fi is a shared local network. Setting the connection profile to Public and
 *    turning off file sharing, printer sharing and network discovery is what stops other
 *    guests enumerating your machine.
 *  - "Evil twin" access points imitate the hotel SSID exactly, which is why the network name
 *    has to be confirmed with reception rather than picked from the list. A captive portal
 *    that asks you to install an app, a configuration profile or a root certificate is not a
 *    captive portal — installing a certificate lets it read your encrypted traffic.
 *  - Shared machines: the US Secret Service and the Department of Homeland Security have
 *    warned hotels about keyloggers installed on business-centre computers. Treat any
 *    machine you do not control as instrumented.
 *  - Room televisions keep account sessions after checkout. Signing out from the account's
 *    own device list is what actually revokes them, not switching the TV off.
 *  - Undisclosed cameras are overwhelmingly a short-term-rental problem rather than a chain
 *    hotel one, which is why the sweep items become mandatory for homestays and rentals in
 *    the scoring below. Every major rental platform bans indoor cameras outright.
 *  - Fire guidance in most countries recommends rooms low enough for external rescue
 *    equipment to reach, which in practice means the lower guest floors — and counting the
 *    doors to the nearest exit is what makes it usable in smoke.
 *
 * Weights are 1-5 editorial severity ratings. Which items are CRITICAL depends on the
 * property type, and the hard rule below does not depend on the weights.
 *
 * Pure module: no React, no DOM, no clocks.
 */

export const PROPERTY_TYPES = [
  {
    id: "chain",
    label: "Chain hotel",
    note: "Managed network, staff master keys, no cameras in rooms. Network hygiene matters most.",
  },
  {
    id: "boutique",
    label: "Independent or boutique hotel",
    note: "Smaller operation, often outsourced Wi-Fi and older door hardware.",
  },
  {
    id: "budget",
    label: "Budget hotel, guesthouse or hostel private room",
    note: "Door hardware and fire routes deserve more attention than the network does.",
  },
  {
    id: "homestay",
    label: "Homestay, serviced apartment or short-term rental",
    note: "The host owns the network and the smart devices, so camera and device checks become mandatory.",
  },
];

export const PHASES = [
  { id: "before", label: "Before you arrive" },
  { id: "first", label: "First five minutes in the room" },
  { id: "devices", label: "Cameras and smart devices" },
  { id: "network", label: "Getting online" },
  { id: "valuables", label: "Documents and valuables" },
  { id: "checkout", label: "Before you check out" },
];

/**
 * Checklist items.
 *  weight       1-5 severity.
 *  critical     true when the item is critical at every property type.
 *  escalateFor  property types at which the item becomes critical.
 */
export const ITEMS = [
  {
    id: "book-direct",
    phase: "before",
    label: "Reservation confirmed on the property's own site or phone number, not only in the booking email",
    weight: 3,
    critical: false,
    escalateFor: [],
    why: "Fake booking confirmations are a common way to harvest card details and passport scans before you arrive.",
  },
  {
    id: "room-floor",
    phase: "before",
    label: "Asked for a room on a lower guest floor, away from the ground floor and the stairwell",
    weight: 2,
    critical: false,
    escalateFor: [],
    why: "High enough to deter street-level access, low enough for external rescue equipment to reach.",
  },
  {
    id: "one-card",
    phase: "before",
    label: "One card set aside for hotel charges, with transaction alerts switched on",
    weight: 3,
    critical: false,
    escalateFor: [],
    why: "It keeps a compromised card away from your main account and makes an unexpected charge visible immediately.",
  },
  {
    id: "no-room-number",
    phase: "before",
    label: "Room number kept off social media and not repeated aloud in the lobby or bar",
    weight: 2,
    critical: false,
    escalateFor: [],
    why: "Pairing a name with a room number is the setup for the fake reception call asking you to re-read your card details.",
  },
  {
    id: "deadbolt",
    phase: "first",
    label: "Deadbolt and security latch tested from inside, and used whenever you are in the room",
    weight: 5,
    critical: true,
    escalateFor: [],
    why: "Every staff master key and every previous guest's card is stopped by the secondary lock and nothing else.",
  },
  {
    id: "portable-lock",
    phase: "first",
    label: "Portable door lock or door-stop alarm fitted overnight",
    weight: 3,
    critical: false,
    escalateFor: ["budget", "homestay"],
    why: "Where the door hardware is old or the key policy is unknown, a lock you brought is the only one you control.",
  },
  {
    id: "connecting-door",
    phase: "first",
    label: "Connecting door checked — locked, and the handle tested from your side",
    weight: 3,
    critical: false,
    escalateFor: [],
    why: "A connecting door is a second entrance controlled by a stranger, and it is regularly left unlatched between guests.",
  },
  {
    id: "fire-exit",
    phase: "first",
    label: "Walked to the nearest fire exit and counted the doors back to your room",
    weight: 4,
    critical: false,
    escalateFor: ["budget", "homestay"],
    why: "In smoke you navigate by touch; a counted number of doors works when the corridor is invisible.",
  },
  {
    id: "window-balcony",
    phase: "first",
    label: "Windows, balcony door and any ground-level access checked and locked",
    weight: 3,
    critical: false,
    escalateFor: [],
    why: "Balcony hopping between adjacent rooms is a common resort-hotel theft route.",
  },
  {
    id: "peephole",
    phase: "first",
    label: "Peephole clear and undamaged, and used before opening the door",
    weight: 2,
    critical: false,
    escalateFor: [],
    why: "A reversed or drilled peephole is rare but trivial to check, and takes two seconds.",
  },
  {
    id: "unexpected-visit",
    phase: "first",
    label: "Nobody admitted without calling reception first to confirm they were sent",
    weight: 4,
    critical: false,
    escalateFor: [],
    why: "Unannounced maintenance or delivery is the standard pretext for getting a door opened.",
  },
  {
    id: "camera-sweep",
    phase: "devices",
    label: "Swept the sightlines to the bed and bathroom — smoke detector, alarm clock, air purifier, USB charger, decor",
    weight: 4,
    critical: false,
    escalateFor: ["homestay"],
    why: "Concealed cameras need a view and a power source, so start with anything plugged in and pointed at the bed.",
  },
  {
    id: "lens-check",
    phase: "devices",
    label: "Lights off, a torch swept for lens reflections, and the phone camera checked for infrared LEDs",
    weight: 3,
    critical: false,
    escalateFor: ["homestay"],
    why: "A lens returns a bright pinpoint reflection, and many night-vision cameras show as faint purple dots on a phone camera.",
  },
  {
    id: "smart-speaker",
    phase: "devices",
    label: "Voice assistants and smart displays unplugged or muted at the device, not just turned down",
    weight: 3,
    critical: false,
    escalateFor: ["homestay"],
    why: "A host-owned assistant is signed into the host's account, and its history is theirs to read.",
  },
  {
    id: "tv-cam",
    phase: "devices",
    label: "Any camera on the television, doorbell or intercom covered or unplugged",
    weight: 2,
    critical: false,
    escalateFor: ["homestay"],
    why: "Video doorbells that face inward, or a smart TV with a camera bar, record without any obvious indicator.",
  },
  {
    id: "ssid",
    phase: "network",
    label: "Network name confirmed with reception, character for character, before joining",
    weight: 4,
    critical: false,
    escalateFor: [],
    why: "An imitation access point uses the same name; only the exact spelling and the staff's confirmation separate them.",
  },
  {
    id: "network-public",
    phase: "network",
    label: "Connection profile set to Public, with file sharing, printer sharing and network discovery off",
    weight: 5,
    critical: true,
    escalateFor: [],
    why: "Guest Wi-Fi is a shared local network; a Private profile advertises your machine to everyone else on it.",
  },
  {
    id: "no-cert",
    phase: "network",
    label: "Refused any portal that asked to install an app, a configuration profile or a certificate",
    weight: 4,
    critical: false,
    escalateFor: [],
    why: "Installing a root certificate hands the network operator the ability to read your encrypted traffic.",
  },
  {
    id: "vpn",
    phase: "network",
    label: "A trusted VPN or your own mobile hotspot used for banking, work and email",
    weight: 4,
    critical: false,
    escalateFor: [],
    why: "It moves the trust from an unknown hotel network to a provider you chose, which is the best available trade.",
  },
  {
    id: "no-shared-pc",
    phase: "network",
    label: "No sign-ins on the room television, the business-centre PC or any machine you do not control",
    weight: 5,
    critical: true,
    escalateFor: [],
    why: "Keyloggers on hotel business-centre computers have been the subject of federal advisories; assume any shared machine is instrumented.",
  },
  {
    id: "printer",
    phase: "network",
    label: "Nothing sensitive printed at the business centre, or collected immediately and the job deleted",
    weight: 2,
    critical: false,
    escalateFor: [],
    why: "Shared print queues and output trays are the least-guarded document leak in any hotel.",
  },
  {
    id: "bt-airdrop",
    phase: "network",
    label: "Bluetooth off when unused, AirDrop or Quick Share set to contacts-only",
    weight: 2,
    critical: false,
    escalateFor: [],
    why: "An open receive setting in a busy property invites unsolicited files from strangers in range.",
  },
  {
    id: "frontdesk",
    phase: "valuables",
    label: "Anything irreplaceable placed in the front-desk deposit rather than the in-room safe",
    weight: 4,
    critical: false,
    escalateFor: [],
    why: "The in-room safe has an override code and a staff master card; the deposit box is a different product with a receipt.",
  },
  {
    id: "safe-code",
    phase: "valuables",
    label: "In-room safe set to your own code and tested with the door open before you trust it",
    weight: 3,
    critical: false,
    escalateFor: [],
    why: "Safes are routinely left on a default code, and testing with the door open avoids locking your passport inside a broken unit.",
  },
  {
    id: "bag-lock",
    phase: "valuables",
    label: "Cases locked, and cabled to a fixed fitting where possible, whenever you go out",
    weight: 3,
    critical: false,
    escalateFor: ["budget"],
    why: "Opportunistic theft during housekeeping is defeated by any lock that takes more than a second to defeat.",
  },
  {
    id: "passport-plan",
    phase: "valuables",
    label: "A deliberate decision on where the passport lives, matching the local rules on carrying ID",
    weight: 3,
    critical: false,
    escalateFor: [],
    why: "Some countries require you to carry identification at all times; others make the hotel hold it. Decide once rather than drifting.",
  },
  {
    id: "no-usb-desk",
    phase: "valuables",
    label: "Charged from your own adapter, never the desk, lamp or bedside USB sockets",
    weight: 3,
    critical: false,
    escalateFor: [],
    why: "In-furniture USB sockets are unlabelled, unaudited and trivially replaced with a data-capable module.",
  },
  {
    id: "tv-signout",
    phase: "checkout",
    label: "Signed out of every account used on the room television, from the account's own device list",
    weight: 3,
    critical: false,
    escalateFor: [],
    why: "Turning the television off does not end the session; the next guest inherits it.",
  },
  {
    id: "forget-wifi",
    phase: "checkout",
    label: "Hotel Wi-Fi forgotten on every device so it cannot auto-join a lookalike later",
    weight: 2,
    critical: false,
    escalateFor: [],
    why: "A remembered network name is what lets an imitation access point capture your device silently in another city.",
  },
  {
    id: "sweep",
    phase: "checkout",
    label: "Drawers, safe, bathroom, sockets and under the bed swept before leaving",
    weight: 3,
    critical: false,
    escalateFor: [],
    why: "Chargers, passports and medication are the three things most often left behind, in that order.",
  },
  {
    id: "keycard",
    phase: "checkout",
    label: "Key card sleeve with the room number destroyed rather than dropped in a bin",
    weight: 2,
    critical: false,
    escalateFor: [],
    why: "The sleeve links your name, dates and room number in one place, which is all a pretext call needs.",
  },
];

/** Readiness bands, lower bound inclusive. */
export const BANDS = [
  { id: "exposed", min: 0, label: "Exposed — basics missing", tone: "danger" },
  { id: "partial", min: 50, label: "Partly covered", tone: "warning" },
  { id: "good", min: 75, label: "Good — minor gaps", tone: "success" },
  { id: "settled", min: 90, label: "Settled in safely", tone: "success" },
];

/** A property whose critical items are unfinished cannot score above this. */
export const CRITICAL_FAIL_CAP = 49;

function bandFor(percent) {
  let match = BANDS[0];
  for (const band of BANDS) if (percent >= band.min) match = band;
  return match;
}

const cleanIds = (value) =>
  Array.isArray(value) ? Array.from(new Set(value.map((entry) => String(entry)))) : null;

/** True when this item is critical at the given property type. */
export function isCriticalAt(item, propertyType) {
  return Boolean(item.critical) || item.escalateFor.includes(propertyType);
}

/**
 * Score a hotel arrival routine.
 *
 * @param {object} input
 * @param {string[]} input.doneIds       Item ids already handled.
 * @param {string}   input.propertyType  One of PROPERTY_TYPES ids.
 * @returns {object} assessment, or { error } when the input cannot be used.
 */
export function scoreHotelRoutine({ doneIds, propertyType }) {
  const done = cleanIds(doneIds);
  if (!done) return { error: "Completed items must be supplied as a list." };

  const property = PROPERTY_TYPES.find((entry) => entry.id === propertyType);
  if (!property) return { error: "Choose the type of property you are staying in." };

  const known = new Set(ITEMS.map((item) => item.id));
  if (done.some((id) => !known.has(id))) {
    return { error: "One of the ticked items is not on the checklist." };
  }

  const doneSet = new Set(done);
  const totalWeight = ITEMS.reduce((sum, item) => sum + item.weight, 0);
  const earned = ITEMS.filter((item) => doneSet.has(item.id)).reduce(
    (sum, item) => sum + item.weight,
    0,
  );

  let readinessPercent = Math.round((earned / totalWeight) * 100);

  const criticalItems = ITEMS.filter((item) => isCriticalAt(item, property.id));
  const criticalOpen = criticalItems.filter((item) => !doneSet.has(item.id));

  let band = bandFor(readinessPercent);
  if (criticalOpen.length > 0) {
    readinessPercent = Math.min(readinessPercent, CRITICAL_FAIL_CAP);
    band = BANDS[0];
  }

  const escalated = ITEMS.filter((item) => !item.critical && item.escalateFor.includes(property.id));

  const phases = PHASES.map((phase) => {
    const items = ITEMS.filter((item) => item.phase === phase.id);
    const complete = items.filter((item) => doneSet.has(item.id));
    return {
      id: phase.id,
      label: phase.label,
      total: items.length,
      done: complete.length,
      percent: items.length ? Math.round((complete.length / items.length) * 100) : 100,
    };
  });

  const outstanding = ITEMS.filter((item) => !doneSet.has(item.id))
    .map((item) => ({
      id: item.id,
      label: item.label,
      weight: item.weight,
      why: item.why,
      phase: item.phase,
      critical: isCriticalAt(item, property.id),
    }))
    .sort(
      (a, b) =>
        Number(b.critical) - Number(a.critical) ||
        b.weight - a.weight ||
        a.label.localeCompare(b.label),
    );

  // A safe used as a vault, with nothing at the front desk, is the most common false comfort.
  const safeOverconfidence = doneSet.has("safe-code") && !doneSet.has("frontdesk");

  let verdict;
  if (criticalOpen.length > 0) {
    verdict = `${criticalOpen.length} critical item(s) are still open for a ${property.label.toLowerCase()}. Close those before anything else — the remaining items cannot compensate for them.`;
  } else if (band.id === "settled") {
    verdict =
      "Routine complete. Repeat the door and network steps after any room change, and again if housekeeping has been in while you were out.";
  } else if (band.id === "good") {
    verdict =
      "The important checks are done. The outstanding items below are quick, and most can be finished before you unpack.";
  } else {
    verdict =
      "Work down the outstanding list in order. The first three take about five minutes between them and cover the doorway and the network.";
  }

  return {
    readinessPercent,
    band,
    property,
    earned,
    totalWeight,
    doneCount: ITEMS.filter((item) => doneSet.has(item.id)).length,
    totalCount: ITEMS.length,
    criticalTotal: criticalItems.length,
    criticalOpen: criticalOpen.map((item) => ({ id: item.id, label: item.label })),
    escalated: escalated.map((item) => ({ id: item.id, label: item.label })),
    phases,
    outstanding,
    topThree: outstanding.slice(0, 3),
    safeOverconfidence,
    verdict,
  };
}
