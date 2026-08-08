const seo = {
  title: "USB Drive Hygiene Checklist: Residual Risk Score",
  metaDescription:
    "Pick your USB scenario, tick the controls you use, and get a residual risk score out of 100 across six threats, plus the ones giving false comfort.",
  steps: [
    "Choose Your USB situation from the eight scenarios — a drive you found, a conference giveaway, a client handover, an air-gapped transfer, a print-shop kiosk, a charging port you do not control.",
    "Under Controls you already have, tick only what you actually use: antivirus scanning, a throwaway virtual machine, a hardware write blocker, full-disk or hardware encryption, a data blocker or charge-only cable.",
    "Read the Residual risk score out of 100 with Threats, largest residual first, then work the False comfort, Uncovered threats and Biggest wins available lists; Copy result saves the assessment.",
  ],
  intro:
    "The USB Drive Hygiene Checklist scores the residual risk of a USB situation against the controls you say you have in place. Pick a scenario — a drive you found, a conference giveaway, a client handover, your own personal drive, moving files across an air gap, a print-shop kiosk, or charging a phone from a strange port — and tick the controls you actually use. Each control only reduces the specific threats it targets, so the tool can separate real coverage from controls that merely feel protective, and it names the false comfort out loud when a habit you rely on does not touch the biggest risk in that scenario.",
  useCases: [
    "You picked up a USB drive in a car park or conference bag and want to know whether 'I'll just scan it first' is actually enough.",
    "A client or contractor handed you a drive and you want a plan for pulling the files off without trusting their machine.",
    "You are deciding whether antivirus scanning, a hardware write blocker, or full-disk encryption is the control that matters for your situation.",
    "You are writing or checking a removable-media policy and want a concrete list of which threats each common control does and does not cover.",
  ],
  benefits: [
    [
      "Threats, not a single score",
      "Firmware attacks, hostile files, data loss, deleted-file recovery, exfiltration and electrical damage are scored separately, because a drive that is safe from one is not automatically safe from the rest.",
    ],
    [
      "Calls out false comfort",
      "If a control you rely on does not touch the largest threat in your scenario — antivirus against a keyboard-emulating device, for instance — the tool says so instead of letting the overall score hide it.",
    ],
    [
      "Ranked next steps",
      "The three controls that would remove the most residual risk for your exact scenario are ranked first, so effort goes where it changes the score the most.",
    ],
  ],
  faqs: [
    [
      "Is scanning a USB drive with antivirus enough before I open it?",
      "It covers hostile files, but nothing else. Antivirus inspects the files on a volume; it has no visibility into the device's own firmware. A drive reprogrammed to act as a keyboard — the BadUSB class of attack shown by Karsten Nohl and Jakob Lell at Black Hat 2014 — can type commands the moment it is plugged in, before any scan runs.",
    ],
    [
      "Should I ever plug in a USB drive I found lying around?",
      "No. A university study by Tischer and colleagues dropped 297 drives around a campus; 98% were picked up and files were opened on at least 45% of them. A dropped drive is a deliberate delivery method with a track record of working, so the only safe move is not connecting it.",
    ],
    [
      "Does deleting files or quick-formatting a USB drive actually erase them?",
      "Not reliably. NIST Special Publication 800-88 notes that overwriting flash media is unreliable because wear levelling and over-provisioning leave storage cells the write never reaches, and recommends cryptographic erase instead — which is why encrypting a drive from the first file you put on it is also the most dependable way to make its contents unrecoverable later.",
    ],
    [
      "Is it safe to charge my phone from a public USB port?",
      "Only if the connection cannot carry data. Modern phones ask before allowing a cable to exchange data, and declining that prompt is enough, but a charge-only cable or a small USB data blocker removes the question entirely and is cheap insurance for airports, hotels and shared charging stations.",
    ],
  ],
};

export default seo;
