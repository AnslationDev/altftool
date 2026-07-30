/**
 * Juice Jacking Risk Explainer — exposure model.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * What this models, honestly:
 * "Juice jacking" needs a USB *data* path between your phone and something that
 * can act as a host. Everything in the model follows from that one fact:
 *
 *  - A mains adapter or a power bank you own has no host behind it and, in a
 *    charge-only or data-blocked cable, the USB data lines (D+/D-) are not
 *    connected at all. With no data path the attack is not mitigated, it is
 *    absent. Those cases score zero here.
 *  - A USB socket in a kiosk, seat-back or lamp *may* have a host behind it, and
 *    a cable already attached at the venue may itself contain an implant
 *    (the publicly demonstrated "malicious cable" class of device).
 *  - Modern phones do not hand over data on plug-in. Android has defaulted to
 *    charge-only-until-you-choose since Android 6, and iOS asks "Trust this
 *    computer?" and, since iOS 11.4.1, blocks USB data accessories about an
 *    hour after the phone was last unlocked (USB Restricted Mode). So a locked,
 *    updated phone is a poor target even on a hostile port.
 *  - The residual risk concentrates on unlocked phones whose owner taps
 *    "Trust"/"Allow file transfer", on devices with USB debugging left on, and
 *    on operating systems that no longer receive security updates.
 *
 * The output is a RELATIVE exposure index from 0 to 100, not a probability.
 * Public advisories from the FBI and FCC exist, but publicly documented
 * real-world victim cases remain scarce, and this tool says so rather than
 * inventing a statistic.
 */

/** Base exposure by what you plug into. Zero means "no host, no data path". */
export const POWER_SOURCES = [
  {
    id: "ownAdapter",
    label: "My own charger in a mains socket",
    base: 0,
    note: "A wall socket carries no data. Nothing can talk to the phone.",
  },
  {
    id: "ownPowerBank",
    label: "My own power bank",
    base: 0,
    note: "A battery pack has no host controller to enumerate your phone.",
  },
  {
    id: "borrowedPowerBank",
    label: "A power bank someone lent me",
    base: 10,
    note: "Almost certainly just a battery, but you cannot see what is inside the shell.",
  },
  {
    id: "publicUsbPort",
    label: "A public USB socket (airport, cafe, seat-back, hotel lamp)",
    base: 25,
    note: "The socket may be wired to a real host rather than a charger.",
  },
  {
    id: "unknownComputer",
    label: "A USB port on a computer, TV or console I do not control",
    base: 35,
    note: "This is definitely a host. Data transfer is one consent tap away.",
  },
  {
    id: "attachedCable",
    label: "A cable already hanging at the charging point",
    base: 45,
    note: "The credible modern vector: an implant hidden inside the cable itself.",
  },
];

/** Cable factor. A cable with no data lines removes the path entirely. */
export const CABLES = [
  {
    id: "ownCharge",
    label: "My own charge-only cable (no data lines)",
    factor: 0,
    note: "D+/D- are not wired. Charging works, data cannot.",
  },
  {
    id: "blocker",
    label: "My own data cable through a USB data blocker",
    factor: 0.1,
    note: "A blocker interrupts the data pins. Residual risk is only that the blocker is fake or faulty.",
  },
  {
    id: "ownData",
    label: "My own normal charge-and-sync cable",
    factor: 1,
    note: "Full data path available if the phone consents.",
  },
  {
    id: "venueCable",
    label: "A cable supplied at the venue",
    factor: 1.3,
    note: "You cannot inspect the wiring or what is moulded into the connector.",
  },
];

/** Lock state during charging. */
export const LOCK_STATES = [
  {
    id: "lockedAway",
    label: "Locked, and I will not touch it while it charges",
    factor: 0.25,
    note: "No unlock means no trust prompt can be accepted, and USB Restricted Mode kicks in.",
  },
  {
    id: "lockedNearby",
    label: "Locked, but I will unlock it now and then",
    factor: 0.7,
    note: "Each unlock reopens the window in which a prompt could be tapped by mistake.",
  },
  {
    id: "unlocked",
    label: "Unlocked and in use the whole time",
    factor: 1.4,
    note: "The one state where a consent dialog can be accepted without thinking.",
  },
];

/** Operating-system posture. */
export const OS_STATES = [
  {
    id: "current",
    label: "Current iOS or Android, security updates applied",
    factor: 0.5,
    note: "Charge-only defaults and USB Restricted Mode are doing the work for you.",
  },
  {
    id: "supportedBehind",
    label: "Still supported, but updates are a few months behind",
    factor: 1,
    note: "Defaults are fine; known bugs may be unpatched.",
  },
  {
    id: "unsupported",
    label: "An old phone that no longer receives security updates",
    factor: 1.6,
    note: "Unpatched USB and media-parsing bugs are the realistic attack surface.",
  },
];

/** Extra multipliers for settings that widen the data path. */
export const RISK_FLAGS = [
  {
    id: "usbDebugging",
    label: "USB debugging / developer mode is enabled",
    factor: 2,
    note: "ADB over USB can install and run code once you authorise a host — the single biggest amplifier.",
  },
  {
    id: "rooted",
    label: "The device is rooted or jailbroken",
    factor: 1.5,
    note: "Platform protections you are relying on may already be disabled.",
  },
  {
    id: "autoTrust",
    label: "I usually tap Trust or Allow without reading it",
    factor: 1.5,
    note: "Every protection here ends at a consent dialog. Reading it is the control.",
  },
];

export const MAX_INDEX = 100;

export const BANDS = [
  {
    id: "elevated",
    label: "Elevated exposure",
    tone: "danger",
    min: 35,
    advice:
      "Change the power source rather than the habit: your own adapter in a mains socket, or your own power bank, ends this entirely.",
  },
  {
    id: "moderate",
    label: "Moderate exposure",
    tone: "warning",
    min: 15,
    advice:
      "A charge-only cable or a data blocker removes the data path. Keep the phone locked while it charges.",
  },
  {
    id: "low",
    label: "Low exposure",
    tone: "warning",
    min: 5,
    advice: "Reasonable setup. Keep the phone locked and decline any trust prompt you did not expect.",
  },
  {
    id: "negligible",
    label: "Negligible exposure",
    tone: "success",
    min: 0.01,
    advice: "Close to nothing left to attack. Refuse unexpected consent dialogs and you are done.",
  },
  {
    id: "none",
    label: "No data path at all",
    tone: "success",
    min: 0,
    advice:
      "There is no USB data connection in this setup, so juice jacking is not possible — not merely unlikely.",
  },
];

/** Mitigations ranked by how much of the path they actually remove. */
export const MITIGATIONS = [
  ["Carry your own charger and use a mains socket", "Removes the data path completely."],
  ["Carry your own power bank", "Removes the data path completely."],
  ["Use a charge-only cable or a USB data blocker", "Removes the data path; verify the blocker is genuine."],
  ["Keep the phone locked while it charges", "Blocks the consent dialog and triggers USB Restricted Mode on iOS."],
  ["Turn USB debugging off when you are not developing", "Closes the only path that can install software over USB."],
  ["Power the phone off before charging at an unknown port", "No OS running means nothing to enumerate."],
];

/** Controls people reach for that do nothing against this specific attack. */
export const NON_MITIGATIONS = [
  ["A VPN", "Encrypts network traffic; USB is not network traffic."],
  ["Turning off Bluetooth or Wi-Fi", "Unrelated to the USB data path."],
  ["Airplane mode", "Does not disable USB data."],
  ["An antivirus app on the phone", "Cannot stop a consent you grant yourself."],
];

const byId = (list, id) => list.find((item) => item.id === id);

/**
 * Compute the relative exposure index for one charging situation.
 *
 * @param {object} input
 * @param {string} input.powerSource  id from POWER_SOURCES
 * @param {string} input.cable        id from CABLES
 * @param {string} input.lockState    id from LOCK_STATES
 * @param {string} input.osState      id from OS_STATES
 * @param {string[]} input.flags      ids from RISK_FLAGS
 * @returns {object} exposure result, or { error }
 */
export function assessJuiceJacking({ powerSource, cable, lockState, osState, flags = [] } = {}) {
  const source = byId(POWER_SOURCES, powerSource);
  const cableChoice = byId(CABLES, cable);
  const lock = byId(LOCK_STATES, lockState);
  const os = byId(OS_STATES, osState);

  if (!source) return { error: "Choose what you are plugging into." };
  if (!cableChoice) return { error: "Choose which cable you are using." };
  if (!lock) return { error: "Choose whether the phone stays locked while charging." };
  if (!os) return { error: "Choose how up to date the phone is." };
  if (!Array.isArray(flags)) return { error: "Extra risk settings must be a list." };

  const chosenFlags = flags.map((id) => byId(RISK_FLAGS, id));
  if (chosenFlags.some((flag) => !flag)) {
    return { error: "One of the extra risk settings is not recognised." };
  }

  const flagFactor = chosenFlags.reduce((product, flag) => product * flag.factor, 1);
  const multiplier = cableChoice.factor * lock.factor * os.factor * flagFactor;
  const rawIndex = source.base * multiplier;
  const index = Math.min(MAX_INDEX, Math.round(rawIndex * 10) / 10);

  const dataPathPresent = source.base > 0 && cableChoice.factor > 0;
  const band = dataPathPresent
    ? BANDS.find((item) => index >= item.min) || BANDS[BANDS.length - 1]
    : BANDS[BANDS.length - 1];

  // Why the number came out where it did, biggest contributor first.
  const drivers = [
    { label: source.label, effect: `base ${source.base}`, note: source.note, weight: source.base },
    { label: cableChoice.label, effect: `x${cableChoice.factor}`, note: cableChoice.note, weight: cableChoice.factor },
    { label: lock.label, effect: `x${lock.factor}`, note: lock.note, weight: lock.factor },
    { label: os.label, effect: `x${os.factor}`, note: os.note, weight: os.factor },
    ...chosenFlags.map((flag) => ({
      label: flag.label,
      effect: `x${flag.factor}`,
      note: flag.note,
      weight: flag.factor,
    })),
  ];

  // Only suggest fixes when there is still a data path left to close.
  const fixes = dataPathPresent ? MITIGATIONS : [];

  return {
    index,
    band,
    dataPathPresent,
    multiplier: Math.round(multiplier * 100) / 100,
    source,
    cable: cableChoice,
    lock,
    os,
    flags: chosenFlags,
    drivers,
    fixes,
  };
}

/** Plain-text summary for the copy button. Pure. */
export function formatExposure(result) {
  if (!result || result.error) return "";
  const lines = [
    "Juice jacking exposure check",
    `Exposure index: ${result.index}/${MAX_INDEX} (relative, not a probability)`,
    `Verdict: ${result.band.label}`,
    "",
    `Power source: ${result.source.label}`,
    `Cable: ${result.cable.label}`,
    `Lock state: ${result.lock.label}`,
    `OS: ${result.os.label}`,
  ];
  if (result.flags.length > 0) {
    lines.push("Amplifiers: " + result.flags.map((flag) => flag.label).join("; "));
  }
  lines.push("", result.band.advice);
  return lines.join("\n");
}
