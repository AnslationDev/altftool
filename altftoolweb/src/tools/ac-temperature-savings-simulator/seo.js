const seo = {
  title: "AC Temperature Savings Simulator: Cost per Degree",
  metaDescription:
    "Raising the setpoint shrinks the load as (outdoor − new) ÷ (outdoor − old). See the units, rupees and per-degree cut, with BEE's 6% rule alongside.",
  steps: [
    "Enter the AC capacity in tons and the ISEER from the BEE label, then the outdoor temperature, the setpoint you use today, and the setpoint you are considering — or tap the 24 °C (BEE default), 25, 26 or 27 °C shortcut.",
    "Set your electricity tariff per unit, hours run per day and days per month; the energy ratio (outdoor minus new setpoint) divided by (outdoor minus old setpoint) recomputes as you type, with no calculate button.",
    "Read the rupees saved per month, the saving per degree raised with BEE's 6%-per-degree rule of thumb beside it, the four-month summer total and CO2 saved, plus a table of every setpoint from 16 to 30 °C; \"Copy result\" saves the lot.",
  ],
  intro:
    "This simulator shows the electricity and money a higher AC setpoint saves, using the fact that heat leaks into a room in proportion to the temperature difference across its envelope: the energy ratio is (outdoor − new setpoint) ÷ (outdoor − old setpoint). On a 38 °C day, moving from 22 °C to 24 °C gives 14/16, a 12.5% cut — about 6.25% per degree, which is why BEE's 24 °C default-setting advisory quotes roughly 6% saved per degree. Both the model figure and the published rule of thumb are shown, with a full table from 16 to 30 °C.",
  useCases: [
    "Settle a household argument about whether 24 °C really saves anything over 22 °C.",
    "Estimate what moving the bedroom AC from 20 °C to 25 °C would cut off a summer electricity bill.",
    "Show the rupee value of the BEE default setting before changing the thermostat on every unit in an office.",
  ],
  benefits: [
    ["Physical model, not folklore", "Uses the temperature-difference load relationship and prints the per-degree figure it produces."],
    ["Cross-checked against BEE", "Shows the official 6%-per-degree rule of thumb next to the model result."],
    ["Whole-range table", "Every setpoint from 16 to 30 °C priced at your tariff and run hours in one scrollable table."],
  ],
  faqs: [
    [
      "How much electricity does raising the AC by 1 degree save?",
      "Roughly 6% per degree, which is the figure BEE cites for its 24 °C default-setting advisory. The exact number depends on how hot it is outside: at 38 °C outdoors, going 22 °C to 24 °C is a 12.5% cut, or 6.25% per degree, because the cooling load falls from a 16 °C gap to a 14 °C gap.",
    ],
    [
      "Why is 24 degrees the default AC setting in India?",
      "BEE mandated 24 °C as the factory default temperature setting for room air conditioners sold in India, on the reasoning that most people are comfortable there and each degree lower costs around 6% more energy. The setting is a default, not a lock — you can still change it, but the unit starts at 24 °C.",
    ],
    [
      "Does setting the AC to 16 degrees cool the room faster?",
      "No. A thermostat is a target, not a throttle: the compressor runs at the same capacity whether you set 16 °C or 24 °C, so the room cools at the same rate until it reaches the setpoint. Setting 16 °C only means the compressor keeps running past the point you were comfortable.",
    ],
    [
      "Will my savings match this calculation exactly?",
      "Treat it as an estimate of the sensible cooling load. Real savings tend to be slightly larger because a higher evaporating temperature also raises compressor efficiency, and slightly smaller on humid days when the machine spends energy condensing moisture. Sun on the walls, how many people are in the room and how well it is sealed all move the figure.",
    ],
  ],
};

export default seo;
