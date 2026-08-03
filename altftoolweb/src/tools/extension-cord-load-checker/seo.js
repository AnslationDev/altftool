const seo = {
  intro:
    "This checker adds up everything plugged into one extension board and converts it to amps with I = watts / (volts x power factor), then compares that current against the lower of two limits: the amp rating printed on the board and the ampacity of its flexible cord. It also applies the 80% continuous-load ceiling from NEC 210.19(A)(1) for anything running three hours or more, and estimates voltage drop from the two-way copper run so a long thin cord does not quietly cook itself. Use it before plugging a heater, kettle or air conditioner into a strip that was only ever meant for chargers and a lamp.",
  useCases: [
    "Deciding whether a 2000 W room heater can share a 6 A extension board with a TV and two phone chargers",
    "Checking that a 15 m 16 AWG cord feeding a 1000 W vacuum stays inside the 3% voltage-drop guideline",
    "Auditing a desk setup where a monitor, laptop, desk lamp and printer all run off one strip all day",
  ],
  benefits: [
    ["Two limits, not one", "Compares the load against the board rating AND the cord ampacity, whichever is lower."],
    ["Continuous-load rule", "Applies the 80% de-rating that governs anything running three hours or more."],
    ["Surge flagged", "Warns when a fridge or AC compressor start-up spike would exceed the board's rating."],
  ],
  faqs: [
    [
      "How many watts can a 6A extension board handle?",
      "About 1380 W at 230 V (6 A x 230 V), and only 1104 W if the load runs three hours or more, because the 80% continuous-load ceiling applies. That rules out a 2000 W heater or geyser on a 6 A strip entirely.",
    ],
    [
      "Can I plug a heater into an extension cord?",
      "Only into a 16 A board on 1.5 mm² or thicker cord at 230 V, and never into a light-duty strip. A 2000 W heater draws 8.7 A at 230 V continuously, which is above the 4.8 A continuous ceiling of a 6 A board. At 120 V the same heater draws 16.7 A, which overloads anything short of a 20 A board on 12 AWG cord — and even that combination sits above the 16 A continuous-load ceiling, so it only avoids a caution if the heater will not run for hours at a stretch. For 120 V circuits, a dedicated wall socket is the safer choice for a 2000 W heater.",
    ],
    [
      "What size cord do I need for a long extension?",
      "Thicker than you would use short, because voltage drop rises with length: keep the two-way drop under 3% of supply voltage. A 1000 W load on 120 V through 15 m of 16 AWG already drops about 2.7%, so beyond that go to 14 AWG or 12 AWG.",
    ],
    [
      "Why is my extension board hot?",
      "Heat means the current is at or above what the contacts and cord can carry — usually a high-wattage appliance, a coiled cord that cannot shed heat, or a daisy-chained second board. Unplug the largest appliance immediately and have an electrician inspect the strip and the wall socket before using it again.",
    ],
  ],
};

export default seo;
