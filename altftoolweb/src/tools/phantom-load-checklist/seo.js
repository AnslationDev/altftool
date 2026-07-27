const seo = {
  intro:
    "Phantom load, also called standby or vampire power, is the electricity a device draws while switched off but still plugged in. This checklist totals it device by device using the exact relationship watts x hours per day x 365 / 1000 = kWh a year, then prices the result at your own tariff and separates what you could realistically unplug from what genuinely has to stay powered. Default wattages follow typical measured standby figures and every one is editable.",
  useCases: [
    "Finding out why an electricity bill stays high in a month the family was away",
    "Deciding which sockets are worth putting on a switched power strip or timer",
    "Checking whether an old set-top box is costing more on standby than it is worth keeping",
  ],
  benefits: [
    ["Ranks the offenders", "Sorts every ticked device by annual cost so you fix the expensive one first."],
    ["Separates savable from essential", "A router and a CCTV recorder cannot be unplugged; a printer and a console can."],
    ["Prices it at your tariff", "Enter your slab rate and monthly units to see standby as a share of the real bill."],
  ],
  faqs: [
    [
      "How much does standby power cost a year?",
      "In a typical home it is a few hundred to a couple of thousand rupees a year, and the spread depends almost entirely on one or two bad devices. A set-top box drawing 17 W around the clock uses about 124 kWh a year on its own, while a phone charger left plugged in with nothing attached uses under 2 kWh.",
    ],
    [
      "Does unplugging chargers actually save electricity?",
      "Yes, but very little. A modern phone charger with nothing attached draws roughly 0.1 to 0.3 W, which is under 3 kWh a year. The savings worth chasing are the set-top box, the games console in instant-on mode and the desktop left asleep, each of which can draw ten to fifty times more.",
    ],
    [
      "What is the legal limit on standby power?",
      "In the European Union, Ecodesign Regulation 1275/2008 has limited off-mode power for most consumer electronics to 0.5 W since 2013, with a slightly higher allowance where a display stays lit. Equipment sold before those rules, and categories outside their scope such as set-top boxes and network gear, can draw far more.",
    ],
    [
      "What should I never unplug to save standby power?",
      "Refrigerators and freezers, any medical device, alarm and security systems including CCTV recorders, and anything mid-update. Smart speakers and always-on network equipment also stop doing their job without power, so the sensible target is entertainment and office equipment that sits idle overnight.",
    ],
  ],
};

export default seo;
