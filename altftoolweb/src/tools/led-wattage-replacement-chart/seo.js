const seo = {
  title: "LED Equivalent Wattage Chart — Incandescent, Halogen, CFL",
  metaDescription:
    "Converts incandescent, halogen, CFL or tube wattage to lumens, then to the LED watts that match — 60 W = 800 lm — with yearly bill savings.",
  steps: [
    "Choose the old bulb under \"What are you replacing?\", enter the \"Old bulb wattage (W)\" and set \"LED efficacy (lumens per watt)\" — or tap an efficacy preset button.",
    "Add \"How many bulbs\", \"Hours lit per day\" and your \"Electricity tariff (INR per kWh)\" so the yearly saving can be costed.",
    "Read \"Buy an LED of about\" with the lumen figure to look for on the box, the kWh and bill saved a year, and the full Filament to LED table, then press \"Copy result\".",
  ],
  intro:
    "This converter turns an old incandescent, halogen, CFL or fluorescent-tube wattage into the LED wattage that produces the same amount of light. It works in two steps — old watts to lumens, then lumens divided by the LED's efficacy in lumens per watt — because bulbs are equivalent when their light output matches, not their power draw. Incandescent lumen values come from the FTC Lighting Facts and ENERGY STAR replacement guidance, the source of the familiar 60 W equals 800 lumens pairing.",
  useCases: [
    "Replacing the last filament bulbs in a house and needing the right LED wattage for each fitting.",
    "Working out what swapping ten 60 W bulbs for LEDs saves on a year's electricity bill.",
    "Checking whether a 9 W LED marketed as a 100 W replacement really matches that output.",
  ],
  benefits: [
    ["Interpolated, not scaled", "Filament efficacy rises with wattage, so the table interpolates between published anchors."],
    ["Four old sources", "Handles incandescent, halogen, CFL and T8 fluorescent tubes, each with its own efficacy."],
    ["Efficacy is yours to set", "Budget LEDs at 80 lm/W and top-tier lamps at 160 lm/W give very different answers."],
  ],
  faqs: [
    [
      "What LED wattage replaces a 60 W bulb?",
      "About 8 W for a standard retail LED. A 60 W incandescent produces roughly 800 lumens, and a typical LED delivers around 100 lumens per watt, so 800 ÷ 100 = 8 W. On a budget 80 lm/W lamp you would need 10 W; on a high-efficiency 130 lm/W lamp about 6 W.",
    ],
    [
      "How many lumens is a 100 W bulb?",
      "Around 1,600 lumens. The standard equivalence set runs 25 W = 250 lm, 40 W = 450 lm, 60 W = 800 lm, 75 W = 1,100 lm and 100 W = 1,600 lm. Note that the ratio is not constant — a 100 W filament yields about 16 lm/W while a 40 W one manages only about 11 lm/W.",
    ],
    [
      "Is a 9 W LED the same as a 60 W bulb?",
      "Usually a little brighter. At 100 lumens per watt a 9 W LED makes about 900 lumens against the 800 lumens of a 60 W filament bulb. Check the lumen figure on the box rather than the 'equivalent to' claim, since the efficacy of cheap and premium LEDs differs by a factor of two.",
    ],
    [
      "Do LEDs save enough to be worth replacing working bulbs?",
      "Generally yes where the light is used for hours a day. Ten 60 W bulbs run five hours a day consume about 1,096 kWh a year; the same light from 8 W LEDs takes about 146 kWh, saving roughly 950 units — several thousand rupees a year at typical Indian domestic tariffs, which pays for the lamps within months.",
    ],
  ],
};

export default seo;
