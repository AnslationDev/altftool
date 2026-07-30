/**
 * Airport and transit security checklist — weighted readiness scoring with hard rules.
 *
 * The items below come from documented device and travel security behaviour, not habit:
 *
 *  - Before First Unlock (BFU) vs After First Unlock (AFU): on both iOS and modern Android,
 *    a device that has been powered off and not yet unlocked keeps its file-encryption keys
 *    out of memory. Once unlocked even once, many keys stay resident, which is why forensic
 *    extraction tools are far more capable against an AFU device. Powering off before a
 *    border queue is the single highest-value action in this list.
 *  - Biometrics vs passcode: face and fingerprint unlock can be applied to a device you are
 *    holding in seconds. iOS offers a passcode-only lockout (hold side + volume, or press the
 *    side button five times) and Android has Lockdown in the power menu; both force the
 *    passcode and disable biometrics until it is entered.
 *  - Sleep is not shutdown: a laptop in sleep keeps disk-encryption keys in RAM, so a full
 *    shutdown before the device leaves your hands is what full-disk encryption depends on.
 *  - Juice jacking: the FBI's Denver field office and the FCC have both warned against public
 *    USB charging points. A charge-only cable, a USB data blocker or your own wall adapter
 *    removes the data path entirely.
 *  - Boarding passes: the barcode encodes the booking reference, which is enough on many
 *    airline sites to open the booking, read passenger data and change or cancel the flight.
 *  - Lithium batteries and power banks must travel in cabin baggage under IATA dangerous
 *    goods rules; they are not permitted in checked hold baggage.
 *
 * Weights are 1-5 editorial severity ratings applied consistently. The hard rules below do
 * not depend on the weights at all. Pure module: no React, no DOM, no clocks.
 */

/** Phases, in the order you meet them. */
export const PHASES = [
  { id: "home", label: "Before you leave home" },
  { id: "security", label: "At the security queue" },
  { id: "airside", label: "Lounge, gate and cabin" },
  { id: "border", label: "At immigration", context: "border" },
  { id: "work", label: "If you carry a work device", context: "work" },
  { id: "recovery", label: "If something goes wrong" },
];

/**
 * Checklist items.
 *  weight   1-5 severity.
 *  critical true items floor the verdict when left undone.
 *  context  restricts the item to a trip type: "border" or "work".
 */
export const ITEMS = [
  {
    id: "fde",
    phase: "home",
    label: "Full-disk encryption confirmed on every device you are carrying",
    weight: 5,
    critical: true,
    why: "Without it, a lost laptop is a copy of your data handed to whoever finds it.",
  },
  {
    id: "passcode",
    phase: "home",
    label: "Screen lock is a six-digit PIN or a passphrase — not four digits and not a pattern",
    weight: 5,
    critical: true,
    why: "A four-digit PIN has ten thousand combinations and a pattern can be read off the grease on the screen.",
  },
  {
    id: "autolock",
    phase: "home",
    label: "Auto-lock set to 30 seconds or less",
    weight: 3,
    critical: false,
    why: "Most in-transit device loss happens in the seconds a phone spends unattended on a counter or seat.",
  },
  {
    id: "findmy",
    phase: "home",
    label: "Find My / Find My Device switched on, and you have practised the remote-wipe steps",
    weight: 4,
    critical: false,
    why: "Learning the procedure after the phone is gone, on someone else's handset, is too late.",
  },
  {
    id: "updates",
    phase: "home",
    label: "Operating system and browser updated, with pending restarts completed",
    weight: 3,
    critical: false,
    why: "An update that installs mid-trip on hotel Wi-Fi is an update you delayed too long.",
  },
  {
    id: "backup",
    phase: "home",
    label: "A current backup exists somewhere other than the bag you are carrying",
    weight: 4,
    critical: false,
    why: "Theft and loss take the device and its only copy at the same time.",
  },
  {
    id: "declutter",
    phase: "home",
    label: "Removed files, apps and signed-in accounts you do not need on this trip",
    weight: 3,
    critical: false,
    why: "You cannot lose data you did not carry.",
  },
  {
    id: "docscans",
    phase: "home",
    label: "Encrypted copies of passport, visa and insurance saved where you can open them offline",
    weight: 4,
    critical: false,
    why: "An embassy asks for the passport data page first when you report a loss.",
  },
  {
    id: "offlinecontacts",
    phase: "home",
    label: "Airline, insurer, bank hotline and embassy numbers saved offline with country codes",
    weight: 3,
    critical: false,
    why: "A number saved without its country code will not dial from abroad.",
  },
  {
    id: "tag",
    phase: "home",
    label: "Luggage tags show a phone number or work address, never your home address",
    weight: 2,
    critical: false,
    why: "A tag that pairs your home address with your travel dates advertises an empty house.",
  },
  {
    id: "powerbank",
    phase: "home",
    label: "Power bank and spare lithium batteries packed in cabin baggage only",
    weight: 2,
    critical: false,
    why: "IATA dangerous goods rules forbid them in the hold, and a pulled bag delays everyone.",
  },
  {
    id: "nocheck",
    phase: "home",
    label: "No laptop, phone, passport, medication or cash in checked baggage",
    weight: 4,
    critical: false,
    why: "Airline liability for checked baggage is capped and usually excludes electronics and valuables outright.",
  },
  {
    id: "blocker",
    phase: "home",
    label: "Packed your own charger, plus a charge-only cable or a USB data blocker",
    weight: 3,
    critical: false,
    why: "A charge-only cable has no data pins, so a compromised port has nothing to talk to.",
  },
  {
    id: "autojoin",
    phase: "home",
    label: "Auto-join to open Wi-Fi turned off, and saved airport networks forgotten",
    weight: 3,
    critical: false,
    why: "A remembered network name is all an evil twin access point needs to pull your phone in silently.",
  },
  {
    id: "airdrop",
    phase: "home",
    label: "AirDrop / Quick Share set to contacts-only or off",
    weight: 2,
    critical: false,
    why: "An open receive setting in a crowded terminal invites unsolicited files and cyber-flashing.",
  },
  {
    id: "shutdown",
    phase: "security",
    label: "Laptop fully shut down — not asleep — before it goes into the tray",
    weight: 4,
    critical: false,
    why: "Sleep keeps the disk-encryption key in RAM, so an encrypted-but-sleeping laptop is an unlocked one.",
  },
  {
    id: "eyes",
    phase: "security",
    label: "Devices go into the tray last and you keep them in sight until you clear the scanner",
    weight: 3,
    critical: false,
    why: "The classic airport theft is a tray sent through while you are still stuck at the metal detector.",
  },
  {
    id: "nopin",
    phase: "security",
    label: "No PIN, passcode or password typed while anyone is queued behind you",
    weight: 2,
    critical: false,
    why: "A phone unlock filmed over your shoulder is worth more to a thief than the phone.",
  },
  {
    id: "privacyfilter",
    phase: "airside",
    label: "Privacy filter fitted, or the screen angled away from the aisle and the next seat",
    weight: 3,
    critical: false,
    why: "Aircraft and lounge seating puts a stranger permanently within reading distance of your screen.",
  },
  {
    id: "nopublicusb",
    phase: "airside",
    label: "Charged only from your own adapter or power bank, never a public USB socket",
    weight: 3,
    critical: false,
    why: "The FBI and the FCC have both warned that public USB ports can carry data as well as power.",
  },
  {
    id: "noboardingpass",
    phase: "airside",
    label: "Boarding pass not photographed or posted, and destroyed rather than binned after the flight",
    weight: 3,
    critical: false,
    why: "The barcode carries your booking reference, which opens the whole reservation on most airline sites.",
  },
  {
    id: "noopenwifi",
    phase: "airside",
    label: "Anything sensitive done on mobile data or a trusted VPN, not open airport Wi-Fi",
    weight: 3,
    critical: false,
    why: "A captive portal you cannot verify is a network you should not sign into a bank from.",
  },
  {
    id: "seatpocket",
    phase: "airside",
    label: "Nothing stored in the seat pocket; phone and passport return to the same pocket every time",
    weight: 2,
    critical: false,
    why: "Seat pockets are where passports are left behind, and a fixed habit is what stops it.",
  },
  {
    id: "poweroff",
    phase: "border",
    context: "border",
    label: "Devices powered fully off before you join the immigration queue",
    weight: 5,
    critical: true,
    why: "A device that has not been unlocked since boot keeps its encryption keys out of memory, which is a far harder target than a device that is merely locked.",
  },
  {
    id: "biometricsoff",
    phase: "border",
    context: "border",
    label: "Biometric unlock disabled at the border, so only the passcode can open the device",
    weight: 5,
    critical: true,
    why: "A face or fingerprint can be applied to a device you are holding in seconds; iOS and Android both have a one-gesture passcode-only lockdown.",
  },
  {
    id: "cleanprofile",
    phase: "border",
    context: "border",
    label: "Carrying only what you would be comfortable having inspected",
    weight: 4,
    critical: false,
    why: "Border device inspection powers are wide in many countries, and the reliable defence is not having the data with you.",
  },
  {
    id: "knowrights",
    phase: "border",
    context: "border",
    label: "You know this border's device-inspection rules and your employer's policy on them",
    weight: 3,
    critical: false,
    why: "Refusing at one border costs you an hour; at another it costs you entry or the device.",
  },
  {
    id: "mdm",
    phase: "work",
    context: "work",
    label: "Work device is enrolled in device management and you can reach IT to report a loss within minutes",
    weight: 4,
    critical: false,
    why: "Remote wipe on a managed device is instant if someone is awake to trigger it — check the time zone before you fly.",
  },
  {
    id: "nopersonal",
    phase: "work",
    context: "work",
    label: "No personal accounts on the work device, and no work data on the personal one",
    weight: 3,
    critical: false,
    why: "A mixed device turns one incident into two investigations, and a remote wipe into a personal data loss.",
  },
  {
    id: "wipeplan",
    phase: "recovery",
    label: "You can trigger a remote wipe from a second device or a borrowed phone",
    weight: 4,
    critical: false,
    why: "If the only way into your account is the phone you just lost, you have no recovery path.",
  },
  {
    id: "blockcards",
    phase: "recovery",
    label: "Card-blocking numbers saved offline, and one card carried separately as a fallback",
    weight: 3,
    critical: false,
    why: "Blocking every card at once with no backup strands you in a country where you cannot pay.",
  },
];

/** Readiness bands, lower bound inclusive. */
export const BANDS = [
  { id: "notready", min: 0, label: "Not ready to travel", tone: "danger" },
  { id: "patchy", min: 50, label: "Patchy — obvious gaps left", tone: "warning" },
  { id: "good", min: 75, label: "Good — minor gaps only", tone: "success" },
  { id: "ready", min: 90, label: "Ready", tone: "success" },
];

/** A device that fails a critical item cannot score above this, whatever else is ticked. */
export const CRITICAL_FAIL_CAP = 49;

function bandFor(percent) {
  let match = BANDS[0];
  for (const band of BANDS) if (percent >= band.min) match = band;
  return match;
}

const cleanIds = (value) =>
  Array.isArray(value) ? Array.from(new Set(value.map((entry) => String(entry)))) : null;

/** Items that apply to a trip with the given context flags. */
export function applicableItems({ crossingBorder, workDevice }) {
  return ITEMS.filter((item) => {
    if (item.context === "border") return Boolean(crossingBorder);
    if (item.context === "work") return Boolean(workDevice);
    return true;
  });
}

/**
 * Score transit readiness.
 *
 * @param {object} input
 * @param {string[]} input.doneIds        Item ids already handled.
 * @param {boolean}  input.crossingBorder True if the trip crosses an international border.
 * @param {boolean}  input.workDevice     True if a work-owned device is coming along.
 * @returns {object} assessment, or { error } when the input cannot be used.
 */
export function scoreTransitReadiness({ doneIds, crossingBorder, workDevice }) {
  const done = cleanIds(doneIds);
  if (!done) return { error: "Completed items must be supplied as a list." };

  const known = new Set(ITEMS.map((item) => item.id));
  if (done.some((id) => !known.has(id))) {
    return { error: "One of the ticked items is not on the checklist." };
  }

  const applicable = applicableItems({ crossingBorder, workDevice });
  const doneSet = new Set(done);

  const totalWeight = applicable.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return { error: "No checklist items apply to this trip." };

  const doneItems = applicable.filter((item) => doneSet.has(item.id));
  const earned = doneItems.reduce((sum, item) => sum + item.weight, 0);

  let readinessPercent = Math.round((earned / totalWeight) * 100);

  const criticalItems = applicable.filter((item) => item.critical);
  const criticalOpen = criticalItems.filter((item) => !doneSet.has(item.id));

  let band = bandFor(readinessPercent);
  if (criticalOpen.length > 0) {
    readinessPercent = Math.min(readinessPercent, CRITICAL_FAIL_CAP);
    band = BANDS[0];
  }

  const phases = PHASES.filter((phase) => {
    if (phase.context === "border") return Boolean(crossingBorder);
    if (phase.context === "work") return Boolean(workDevice);
    return true;
  }).map((phase) => {
    const items = applicable.filter((item) => item.phase === phase.id);
    const complete = items.filter((item) => doneSet.has(item.id));
    return {
      id: phase.id,
      label: phase.label,
      total: items.length,
      done: complete.length,
      percent: items.length ? Math.round((complete.length / items.length) * 100) : 100,
    };
  });

  const outstanding = applicable
    .filter((item) => !doneSet.has(item.id))
    .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label))
    .map((item) => ({
      id: item.id,
      label: item.label,
      weight: item.weight,
      critical: item.critical,
      why: item.why,
      phase: item.phase,
    }));

  let verdict;
  if (criticalOpen.length > 0) {
    verdict = `Fix the ${criticalOpen.length} critical item(s) first — encryption, the passcode and, at a border, powering the device off before the queue. Nothing else in the list compensates for these.`;
  } else if (band.id === "ready") {
    verdict =
      "You are set. Run the border steps again at every crossing, not only the first one, and re-check the tray habit on the return leg when you are tired.";
  } else if (band.id === "good") {
    verdict =
      "The important things are done. Close the remaining items below — most take under a minute and can be done at the gate.";
  } else {
    verdict =
      "Work down the outstanding list in weight order. The top three take a few minutes each and remove most of the realistic risk.";
  }

  return {
    readinessPercent,
    band,
    earned,
    totalWeight,
    doneCount: doneItems.length,
    totalCount: applicable.length,
    criticalOpen: criticalOpen.map((item) => ({ id: item.id, label: item.label })),
    criticalTotal: criticalItems.length,
    phases,
    outstanding,
    topThree: outstanding.slice(0, 3),
    verdict,
  };
}
