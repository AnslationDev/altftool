const seo = {
  intro:
    "This checklist works out how long a parked car can actually be left before its 12 V battery stops it starting, and builds the preparation list around that answer. On a modern car the deciding factor is parasitic drain — the alarm, body control module and telematics keep drawing 20 to 50 mA once the car is asleep — which is added to self-discharge that roughly doubles for every 10 °C rise, giving the days to the 80 percent sulfation point and to the 50 percent point where a cold engine will not crank. The rest of the list adapts to the powertrain, the transmission, the temperature and the storage location, and includes a separate list for bringing the car back.",
  useCases: [
    "Working out whether a car left at an airport for six weeks will still start, or whether it needs a maintainer fitted",
    "Preparing a diesel for a winter lay-up including the biocide, tank level and particulate filter considerations",
    "Deciding what state of charge to leave an electric car at before a long trip away",
  ],
  benefits: [
    ["Battery days, not vague advice", "Parasitic drain and self-discharge are added together, so the answer is a number of days rather than 'fit a trickle charger just in case'."],
    ["Parking brake handled properly", "The list tells you to chock the wheels instead, because a parking brake left applied for months can bond the pads to the disc."],
    ["Adapted to the powertrain", "Diesel biocide, petrol stabiliser and the traction-battery charge band appear only for the cars they apply to."],
  ],
  faqs: [
    [
      "How long can a car sit before the battery dies?",
      "Usually four to six weeks on a modern car. A 60 Ah battery with 30 mA of parasitic drain loses about 0.72 Ah a day to the electronics alone, reaching the 50 percent point where it will not reliably crank in roughly 40 days — and it passes the 80 percent sulfation threshold in about 16 days, which is when permanent capacity loss begins.",
    ],
    [
      "Should I leave the handbrake on when storing a car?",
      "No. Chock the wheels and leave a manual in gear or an automatic in Park instead. A parking brake left applied for months can bond the friction material to the drum or disc, and freeing it usually means dismantling that corner of the car.",
    ],
    [
      "What tyre pressure should I use for long-term car storage?",
      "About 25 percent above the normal cold pressure, never above the maximum moulded on the sidewall — so a tyre normally at 33 psi goes to roughly 41 psi. Move the car a metre every few weeks as well, because changing the contact patch is what actually stops a flat spot becoming permanent.",
    ],
    [
      "What charge should I leave an electric car at when storing it?",
      "Between about 40 and 60 percent. Lithium-ion cells age faster the longer they sit at a high state of charge and the warmer they are, so a middling charge is the least damaging place to leave them, and letting the pack drift to empty over a long stand risks a deep-discharge state that needs dealer recovery. Follow the manufacturer's own instructions, which sometimes differ.",
    ],
  ],
};

export default seo;
