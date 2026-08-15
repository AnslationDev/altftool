const seo = {
  title: "Inverter AC Running Cost: ISEER, Setpoint",
  metaDescription:
    "Average draw is rated cooling ÷ ISEER, then about 6% per degree from 24 C. Adds standby and a 5% stabiliser loss to give monthly units and rupee cost.",
  steps: [
    "Enter Capacity (ton) and ISEER from the BEE label, then Hours of running per day and Days used per month.",
    "Set Thermostat setting (C) — 24 C is the BEE reference, each degree lower adds about 6% — plus Tariff (per kWh), and tick the servo stabiliser box if one is wired in.",
    "Read the monthly electricity cost with effective average draw in W, units per day, the season total and the saving against the comparison ISEER; press Copy result.",
  ],
  intro:
    "This calculator turns an inverter AC's BEE label into a rupee figure on your electricity bill. Average input power is the rated cooling divided by ISEER — 1.5 ton is 5,275 W of cooling, so an ISEER 4.7 unit draws about 1,122 W on average — and that is then adjusted for your thermostat setting using BEE's rule that consumption changes by roughly 6% per degree Celsius from the 24 C reference. Standby draw and servo stabiliser losses are included, so the monthly number is closer to what the meter records than a nameplate wattage.",
  useCases: [
    "Estimating how much a new 1.5 ton 5-star inverter split will add to a monthly bill at 8 rupees a unit",
    "Seeing the rupee cost of habitually setting the thermostat to 20 C instead of 24 C",
    "Comparing the season's running cost of an inverter unit against the fixed-speed AC it would replace",
  ],
  benefits: [
    ["Setpoint is priced in", "Running at 20 C instead of 24 C multiplies consumption by about 1.26 — the calculator shows that as money, not a slogan."],
    ["Standby and stabiliser included", "A 2 W standby draw and a servo stabiliser's ~5% loss are added, so the estimate is not artificially low."],
    ["Per hour, per day, per season", "The same inputs produce an hourly rate for a quick sanity check and a season total for budgeting."],
  ],
  faqs: [
    [
      "How much does it cost to run a 1.5 ton inverter AC for 8 hours?",
      "Roughly 9 kWh a night for an ISEER 4.7 unit at a 24 C setpoint — about 72 rupees at a tariff of 8 rupees per unit. The average draw works out to about 1.12 kW, so eight hours is close to 9 units.",
    ],
    [
      "Does lowering the AC temperature increase the bill a lot?",
      "Yes — BEE puts it at about 6% more electricity for every degree Celsius you drop the setpoint. Going from 24 C to 20 C compounds to roughly 26% more consumption, which on a 2,000 rupee monthly AC bill is about 500 rupees.",
    ],
    [
      "Do inverter ACs really save electricity?",
      "Yes, mainly because they run the compressor at part load instead of cycling on and off at full power. In label terms a good inverter split reaches ISEER around 4.7-5.2 against roughly 3.7 for a fixed-speed unit, which is a 20-25% reduction in seasonal consumption for identical cooling.",
    ],
    [
      "Does a stabiliser increase AC electricity consumption?",
      "A little — a servo stabiliser is typically around 95% efficient, so it adds about 5% to the AC's own consumption plus a small idle draw. Most modern inverter ACs have a wide input voltage range and are marketed as stabiliser-free, so check the manual before adding one.",
    ],
  ],
};

export default seo;
