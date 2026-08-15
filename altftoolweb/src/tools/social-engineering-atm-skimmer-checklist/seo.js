const seo = {
  title: "ATM Skimmer Checklist: 16 Checks Before You",
  metaDescription:
    "Sixteen physical ATM checks — card slot, keypad, fascia, dispenser — with a stop-or-proceed verdict. Three findings alone prove tampering.",
  steps: [
    "Work through the four groups — Before you touch anything, The card slot, The keypad and the area above it, While you transact — marking each of the 16 checks Fine, Problem or Skip.",
    "Watch the three checks badged \"stop finding\": a card slot that moves when tugged, a keypad that flexes, and a pinhole or extra panel above the keys. Any one of them ends the inspection.",
    "Read the Verdict with checks completed, problems found, stop findings and the risk score, then press Copy result; \"Still to check\" lists what a half-finished inspection is missing.",
  ],
  intro:
    "The ATM Skimmer Inspection Checklist walks you through 16 physical checks — card slot, keypad, fascia, surroundings and dispenser — and turns what you find into a stop-or-proceed verdict. Three checks are treated as stop findings because each one alone proves tampering: a card slot that moves when tugged, a keypad that flexes or sits proud of the panel, and a pinhole, mirror or extra panel above or beside the keypad. Everything else, including an outward-angled leaflet holder, is weighted by how strongly it indicates a fitted skimmer rather than an ATM that is simply badly maintained.",
  useCases: [
    "Checking a standalone kiosk ATM at a petrol pump or market before a large cash withdrawal.",
    "Teaching an elderly parent or a first-time card holder a fixed routine they can repeat every time.",
    "Documenting what you saw on a suspicious machine so you can quote the ATM ID to the bank helpline.",
    "Briefing branch or retail staff on what a fitted overlay and a cash-trapping claw actually look like.",
  ],
  benefits: [
    ["Stop findings override the score", "One tampering sign ends the inspection — the tool does not average it away against clean checks."],
    ["Each check says how to do it", "Tug the slot, press a keypad corner, compare fascia colour: the physical action, not just the warning."],
    ["Shows what you have not checked yet", "Coverage and remaining time keep a half-finished inspection from reading as a pass."],
  ],
  faqs: [
    [
      "How can you tell if an ATM has a skimmer?",
      "Grip the card slot and pull: factory hardware is bolted through the fascia and will not move, while an overlay skimmer is glued on and wobbles, lifts or comes away. Then press a corner of the keypad — an overlay flexes — and look for a pinhole, mirror or extra panel above or beside the keypad, plus a leaflet holder angled down at the keys, which is a lower-severity but still worth checking sign.",
    ],
    [
      "Does covering the keypad actually help?",
      "Yes, and it is the single most effective habit here. A skimmer captures the card data but is useless at an ATM without the PIN, which is why crews pair every skimmer with a camera; shielding the keypad with your free hand defeats the camera even when you failed to spot it.",
    ],
    [
      "Can a chip card still be skimmed?",
      "The magnetic stripe on the back can be copied by a slot overlay even on a chip card, and that clone may work where stripe fallback is still accepted. The EMV chip itself cannot be cloned by a skimmer, so chip-and-PIN or tap payments are materially safer than a stripe swipe.",
    ],
    [
      "What should I do if my card is captured or the ATM shows a problem?",
      "Do not leave the machine — call the bank helpline printed on the fascia straight away and quote the ATM ID, then block the card from your banking app. Never accept help from a bystander offering to re-enter your PIN, and report suspected tampering so the machine can be taken out of service.",
    ],
  ],
};

export default seo;
