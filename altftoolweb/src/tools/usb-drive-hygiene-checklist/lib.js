/**
 * USB drive hygiene checklist.
 *
 * Different USB situations carry completely different threats, and the
 * controls people reach for often do not touch the threat that actually
 * matters. This module models each scenario as a set of weighted threats and
 * each control as a proportional reduction against specific threats only, so
 * it can tell you both your residual risk and which of your controls are
 * providing false comfort.
 *
 * The facts behind the threat model:
 *  - BadUSB, demonstrated by Karsten Nohl and Jakob Lell at Black Hat 2014,
 *    reprograms the controller firmware of a USB device so it presents itself
 *    as something else — most usefully a keyboard, which can then type
 *    commands as you. Antivirus inspects files, not device firmware, so a
 *    clean scan says nothing about this class of attack.
 *  - People really do plug in drives they find. In a 2016 study by Tischer and
 *    colleagues, 297 drives were dropped around a university campus; 98% were
 *    picked up, and files were opened on at least 45% of them.
 *  - Stuxnet spread between air-gapped systems on removable media, using a
 *    Windows shortcut-parsing flaw that executed on nothing more than the
 *    folder being displayed.
 *  - Microsoft disabled AutoRun for non-optical removable media in a 2011
 *    update, so the classic autorun.inf attack is largely dead. What replaced
 *    it is human-operated: convincing filenames, shortcut files and documents
 *    with macros.
 *  - A USB Killer device delivers a high-voltage surge into the port. No
 *    software setting defends against it, and the damage is to the hardware.
 *  - NIST Special Publication 800-88 Revision 1 notes that overwriting flash
 *    media is unreliable because wear levelling and over-provisioning leave
 *    cells the write never reaches, and recommends cryptographic erase
 *    instead. That is why encrypting a drive on day one is also the only
 *    dependable way to erase it later.
 *  - Public advisories about compromised charging points exist; the mitigation
 *    is inexpensive either way — a charge-only cable or a data blocker, and
 *    refusing the "trust this computer" prompt.
 *
 * Informational only. Follow your own organisation's removable media policy
 * where one exists.
 */

export const THREATS = {
  firmware: {
    id: "firmware",
    label: "Reprogrammed device firmware (BadUSB, HID injection)",
    detail:
      "The device claims to be a keyboard, network adapter or storage as it chooses. A keyboard emulator types commands the instant it is plugged in, before you open anything. File scanning cannot see this.",
  },
  malware: {
    id: "malware",
    label: "Hostile files on the volume",
    detail:
      "Documents with macros, shortcut files, executables named like folders. Modern versions are human-operated rather than automatic, which is why an interesting filename is the payload delivery mechanism.",
  },
  dataloss: {
    id: "dataloss",
    label: "The drive is lost or stolen with readable data on it",
    detail:
      "The single most common actual incident involving removable media. A drive in a coat pocket is a data breach waiting for a laundry cycle.",
  },
  remanence: {
    id: "remanence",
    label: "Deleted files still recoverable",
    detail:
      "Deleting and quick-formatting do not remove data, and overwriting flash is unreliable because wear levelling leaves cells the write never reaches.",
  },
  exfiltration: {
    id: "exfiltration",
    label: "Data walking out on someone else's drive",
    detail:
      "The reverse direction. An unrestricted USB port is an unlogged, uncapped copy channel out of the machine.",
  },
  power: {
    id: "power",
    label: "Electrical damage",
    detail:
      "A device built to dump a high-voltage surge into the port destroys the port and often the board. There is no software defence — only not connecting it.",
  },
};

/**
 * Controls, and the proportion of each threat they remove. A control absent
 * from a threat's list does nothing against it, which is what drives the
 * false-comfort warnings.
 */
export const CONTROLS = [
  {
    id: "avScanning",
    label: "I scan drives with antivirus before opening them",
    reduces: { malware: 0.5 },
    blindTo: ["firmware", "power", "dataloss", "remanence"],
  },
  {
    id: "inspectInVm",
    label: "I inspect unknown media in a throwaway virtual machine or live system",
    reduces: { malware: 0.85, firmware: 0.25 },
    blindTo: ["power"],
    note: "A virtual machine contains the files, but the host still enumerates the device before the VM sees it, so a keyboard emulator can act on the host first.",
  },
  {
    id: "writeBlocker",
    label: "I use a hardware write blocker for unknown media",
    reduces: { malware: 0.3, firmware: 0.4, exfiltration: 0.5 },
  },
  {
    id: "fullDiskEncryption",
    label: "The drive is encrypted with software full-disk encryption",
    reduces: { dataloss: 0.9, remanence: 0.9 },
    blindTo: ["firmware", "malware"],
  },
  {
    id: "hardwareEncrypted",
    label: "It is a hardware-encrypted drive with its own keypad or reader",
    reduces: { dataloss: 0.95, remanence: 0.9 },
    blindTo: ["firmware", "malware"],
  },
  {
    id: "usbBlockedByPolicy",
    label: "Removable storage is blocked or read-only by device policy",
    reduces: { malware: 0.9, firmware: 0.6, exfiltration: 0.9 },
    note: "Policy blocks mass storage. A device that enumerates as a keyboard is usually not covered by a storage restriction.",
  },
  {
    id: "dataBlocker",
    label: "I only charge through a data blocker or a charge-only cable",
    reduces: { firmware: 0.9 },
    blindTo: ["power"],
  },
  {
    id: "physicalCustody",
    label: "The drive never leaves my custody",
    reduces: { dataloss: 0.4, exfiltration: 0.3 },
  },
];

export const CONTROL_IDS = CONTROLS.map((item) => item.id);

/** Scenarios, each with the threats that actually apply and their weights. */
export const SCENARIOS = [
  {
    id: "found",
    label: "A drive I found — car park, lobby, on a desk",
    weights: { firmware: 30, malware: 25, power: 10 },
    rule: "Do not connect it to anything. Hand it to security or destroy it.",
    ruleTone: "danger",
    detail:
      "This is the one scenario with a categorical answer. A dropped drive is a deliberate delivery method, and the study evidence is that it works — 98% of 297 drives dropped on a campus were picked up and files were opened on at least 45% of them. Curiosity about the owner is exactly the hook.",
  },
  {
    id: "promo",
    label: "A promotional or conference giveaway drive",
    weights: { firmware: 20, malware: 20, power: 5 },
    rule: "Treat it as unknown media. If you want the hardware, reformat it on a machine you can afford to lose.",
    ruleTone: "warning",
    detail:
      "Nobody in the supply chain of a branded giveaway is accountable for what is on it, and the branding is precisely what makes people trust it.",
  },
  {
    id: "vendor",
    label: "A drive handed over by a client, supplier or contractor",
    weights: { firmware: 10, malware: 25, exfiltration: 5 },
    rule: "Accept the data, not the device. Copy the files off in an isolated environment and return or destroy the drive.",
    ruleTone: "warning",
    detail:
      "The sender is probably not hostile, but their machine may be. Ask for a file transfer link instead — it is faster and it is auditable.",
  },
  {
    id: "shared",
    label: "A shared drive that circulates around an office",
    weights: { malware: 20, remanence: 15, dataloss: 15, exfiltration: 15 },
    rule: "Stop using it. A shared drive accumulates every deleted file and every infection anybody on the rotation has had.",
    ruleTone: "warning",
    detail:
      "Nobody owns a shared drive, so nobody encrypts it, wipes it or notices when it goes missing. A shared network folder solves the same problem with logging.",
  },
  {
    id: "personal",
    label: "My own drive, carrying work or personal data",
    weights: { dataloss: 30, remanence: 20, malware: 10 },
    rule: "Encrypt it before the first file goes on, and treat losing it as a certainty rather than a risk.",
    ruleTone: "primary",
    detail:
      "Encryption on day one is also the only reliable way to erase it later: destroy the key and the remaining ciphertext is worthless, which is exactly the cryptographic-erase approach NIST recommends for flash.",
  },
  {
    id: "airgap",
    label: "Moving files to or from an isolated or air-gapped system",
    weights: { firmware: 25, malware: 25, remanence: 10 },
    rule: "Use dedicated one-way media that never returns, and inspect every file on a disposable system in between.",
    ruleTone: "danger",
    detail:
      "Removable media is the classic route across an air gap. Stuxnet crossed one this way, using a shortcut-parsing flaw that ran as soon as the folder was displayed.",
  },
  {
    id: "kiosk",
    label: "A print shop, photo kiosk or hotel business centre",
    weights: { malware: 20, remanence: 20, dataloss: 10 },
    rule: "Use a drive that carries nothing else, and wipe it afterwards by reformatting on your own machine.",
    ruleTone: "warning",
    detail:
      "Kiosks are shared with everyone who used them today, in both directions — what you take there is copied, and what is already on the kiosk can be copied to you.",
  },
  {
    id: "charging",
    label: "Charging a phone from a port I do not control",
    weights: { firmware: 20, power: 10 },
    rule: "Carry your own plug, or use a charge-only cable or data blocker. Never accept a trust prompt from a charging point.",
    ruleTone: "warning",
    detail:
      "Modern phones ask before enabling data over a cable, and refusing is enough. A data blocker removes the question entirely and costs less than a coffee.",
  },
];

export const SCENARIO_IDS = SCENARIOS.map((item) => item.id);

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * Score residual risk for one scenario given the controls in place.
 *
 * @param {object} input
 * @param {string} input.scenario  One of SCENARIO_IDS.
 * @param {string[]} input.controls  Control ids in place.
 * @returns {object} assessment, or { error }.
 */
export function assessUsbScenario({ scenario, controls = [] } = {}) {
  const info = SCENARIOS.find((item) => item.id === scenario);
  if (!info) return { error: "Choose the USB situation you are dealing with." };

  const active = Array.isArray(controls)
    ? CONTROLS.filter((control) => controls.includes(control.id))
    : [];

  const rows = Object.entries(info.weights).map(([threatId, weight]) => {
    // Controls compound multiplicatively: each removes a share of what is left.
    let remaining = 1;
    const applied = [];
    for (const control of active) {
      const reduction = control.reduces[threatId];
      if (!reduction) continue;
      remaining *= 1 - reduction;
      applied.push({ id: control.id, label: control.label, reduction });
    }
    const residual = weight * remaining;
    return {
      ...THREATS[threatId],
      weight,
      residual: Math.round(residual * 10) / 10,
      reductionPercent: Math.round((1 - remaining) * 100),
      applied,
      uncovered: applied.length === 0,
    };
  });

  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  const residualWeight = rows.reduce((sum, row) => sum + row.residual, 0);
  // totalWeight is never zero: every scenario declares at least two threats.
  const riskScore = clamp(Math.round((residualWeight / totalWeight) * 100), 0, 100);
  const coverage = 100 - riskScore;

  rows.sort((a, b) => b.residual - a.residual);

  const band =
    riskScore >= 70
      ? { id: "severe", label: "Do not proceed", tone: "danger" }
      : riskScore >= 40
        ? { id: "high", label: "Proceed only with a better setup", tone: "danger" }
        : riskScore >= 20
          ? { id: "moderate", label: "Workable, with the gaps below closed", tone: "warning" }
          : { id: "low", label: "Well covered for this situation", tone: "success" };

  // A control counts as false comfort when it is in place but blind to the
  // scenario's largest remaining threat.
  const topThreat = rows[0];
  const falseComfort = active
    .filter((control) => (control.blindTo ?? []).includes(topThreat.id))
    .map((control) => ({
      id: control.id,
      label: control.label,
      detail: `Does nothing against ${topThreat.label.toLowerCase()}, which is the largest remaining risk here.`,
    }));

  const notes = active.filter((control) => control.note).map((control) => ({
    id: control.id,
    label: control.label,
    note: control.note,
  }));

  const gaps = rows
    .filter((row) => row.uncovered)
    .map((row) => ({ id: row.id, label: row.label, detail: row.detail }));

  const suggestions = CONTROLS.filter((control) => !controls.includes(control.id))
    .map((control) => {
      const gain = Object.entries(info.weights).reduce((sum, [threatId, weight]) => {
        const reduction = control.reduces[threatId];
        if (!reduction) return sum;
        const row = rows.find((item) => item.id === threatId);
        return sum + row.residual * reduction;
      }, 0);
      return { id: control.id, label: control.label, gain: Math.round((gain / totalWeight) * 100) };
    })
    .filter((item) => item.gain > 0)
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 3);

  return {
    scenario: info,
    rows,
    riskScore,
    coverage,
    band,
    falseComfort,
    notes,
    gaps,
    suggestions,
    controlsInPlace: active.length,
  };
}

/** Plain-text export for the copy button. */
export function formatUsbAssessment(result) {
  if (!result || result.error) return "";
  const lines = [
    `USB drive hygiene — ${result.scenario.label}`,
    `Rule: ${result.scenario.rule}`,
    `Residual risk ${result.riskScore}/100 — ${result.band.label} (${result.controlsInPlace} control(s) in place)`,
    "",
    "THREATS, LARGEST FIRST:",
    ...result.rows.map(
      (row) =>
        `  ${row.label} — ${row.reductionPercent}% covered, residual ${row.residual} of ${row.weight}`,
    ),
  ];
  if (result.falseComfort.length > 0) {
    lines.push(
      "",
      "FALSE COMFORT:",
      ...result.falseComfort.map((item) => `  ! ${item.label} — ${item.detail}`),
    );
  }
  if (result.suggestions.length > 0) {
    lines.push(
      "",
      "BIGGEST WINS AVAILABLE:",
      ...result.suggestions.map((item) => `  + ${item.label} (about ${item.gain} points)`),
    );
  }
  return lines.join("\n");
}
