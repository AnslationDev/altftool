const seo = {
  title: "UK Plug and Voltage Guide: Type G, 230V, Fuse Size",
  metaDescription:
    "The UK runs 230 V, 50 Hz on BS 1363 type G sockets. Enter your plug and label voltage to see if an adapter is enough, plus the BS 1362 fuse to fit.",
  steps: [
    "Choose 'Plug on your device' from the plug-type list, or tap a preset such as Laptop charger or US hair dryer.",
    "Enter 'Label minimum voltage (V)', 'Label maximum voltage (V)', the Label frequency and Rated power (W) printed on the plate.",
    "Read the verdict for the UK with the current drawn at 230 V, the BS 1362 plug fuse to fit and the shaver-socket check, then press Copy result.",
  ],
  intro:
    "This guide decides whether your device needs a plug adapter, a voltage converter, or nothing at all in the United Kingdom, and which fuse belongs in the plug. The UK supplies 230 V at 50 Hz on the shuttered BS 1363 socket — the three rectangular-pin type G pattern — and is one of the few countries where the plug itself carries a BS 1362 cartridge fuse sized to the appliance rather than the circuit. Enter your plug type and the voltage range printed on the label to get the verdict, the current drawn and the correct fuse rating.",
  useCases: [
    "Checking before a London trip whether a US 120 V hair dryer needs a transformer or is simply not worth packing.",
    "Choosing between a 3 A and a 13 A fuse after rewiring a British plug onto a lamp or a heater.",
    "Working out why a hotel bathroom shaver socket cuts out when a hair dryer is plugged into it.",
  ],
  benefits: [
    ["Fuse sizing, not guesswork", "Picks the smallest BS 1362 rating above the appliance current instead of defaulting to 13 A."],
    ["Adapter versus converter", "Compares the label voltage range against 230 V rather than leaving it to chance."],
    ["Flags the shaver socket trap", "Warns when a load exceeds the roughly 20 VA a bathroom shaver supply can deliver."],
  ],
  faqs: [
    [
      "What plug adapter do I need for the UK?",
      "A type G adapter, the three rectangular-pin BS 1363 shape. UK sockets are shuttered and the shutters only open when the longer earth pin goes in first, so no US, European or Australian plug will enter one — a shape adapter is genuinely required, not optional.",
    ],
    [
      "What voltage does the UK use?",
      "230 V at 50 Hz, legally allowed to vary from about 216 V to 253 V (230 V +10% / -6%). Anything labelled 100-240V 50/60Hz — nearly every laptop, phone and camera charger — runs on it with just a plug adapter. A single-voltage 110 V or 120 V appliance needs a step-down transformer.",
    ],
    [
      "Which fuse should go in a UK plug?",
      "The smallest standard rating above the appliance's current draw, chosen from the 3 A, 5 A and 13 A BS 1362 fuses sold in shops. At 230 V a 3 A fuse covers about 690 W, a 5 A fuse about 1,150 W and a 13 A fuse about 2,990 W, which is why the old rule of thumb says 3 A up to roughly 700 W and 13 A above it. The fuse protects the flexible cord, so fitting a larger one than needed removes that protection.",
    ],
    [
      "Can I use a hair dryer in a UK bathroom shaver socket?",
      "No. A shaver supply unit to BS EN 61558-2-5 is an isolating transformer rated at only about 20 VA, which is enough for a shaver or an electric toothbrush charger and nothing more. A 1,500-2,000 W hair dryer will trip it or damage it; use a socket in the bedroom instead.",
    ],
  ],
};

export default seo;
