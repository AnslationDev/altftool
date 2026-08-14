const seo = {
  title: "LED vs CFL Bulb Savings Calculator: Lumen-Matched",
  metaDescription:
    "Matches LED wattage on lumens rather than watts, then totals electricity and replacement-bulb savings with payback in months over your horizon.",
  steps: [
    "Pick 'What is fitted now' (each option lists lm/W and rated hours), the bulb count, burn hours per day and your tariff in INR per kWh.",
    "Press Match brightness to fill Watts per replacement LED with the lumen-equivalent wattage, or type your own figure.",
    "Read the yearly electricity saving, the payback in months and the Now vs With LEDs table, then use Copy result to export the summary.",
  ],
  intro:
    "This calculator works out what switching a home's bulbs to LED saves, across both electricity and replacement bulbs. Replacement wattage is matched on light output rather than watts — new watts equal old watts times old luminous efficacy divided by LED efficacy — so a 60 W incandescent at about 14 lumens per watt is replaced by roughly an 8 W LED at 100 lumens per watt, not by a 60 W LED. It also prorates how many bulbs each technology burns through over your chosen horizon.",
  useCases: [
    "Costing a whole-house swap of twelve incandescent bulbs before deciding how many LEDs to buy at once",
    "Checking whether replacing CFLs that still work is worth it, or whether to wait until they fail",
    "Comparing five-year total cost of ownership when replacement bulbs, not just electricity, are counted",
  ],
  benefits: [
    ["Matched on lumens", "Suggests the LED wattage that gives the same brightness, using luminous efficacy."],
    ["Replacement bulbs counted", "Rated life turns into bulbs consumed over the horizon, then into money."],
    ["Payback in months", "Divides the up-front LED spend by the annual electricity saving, undiscounted."],
  ],
  faqs: [
    [
      "How much can I save by switching to LED bulbs?",
      "Replacing twelve 60 W incandescent bulbs burning five hours a day with 9 W LEDs cuts lighting from about 1314 kWh a year to 197 kWh — roughly 8900 INR a year at 8 INR per kWh, with the LEDs paying for themselves in about two months.",
    ],
    [
      "Is it worth replacing CFL bulbs with LED?",
      "The energy gain is much smaller than the incandescent case, because CFLs already reach about 60 lumens per watt against an LED's 100 — a 14 W CFL is matched by roughly an 8 W LED, saving about 40 percent rather than 85 percent. The stronger argument is life: 25,000 rated hours against about 8000, plus instant full brightness and no mercury.",
    ],
    [
      "What LED wattage replaces a 60 W bulb?",
      "About 8 to 10 W. A 60 W incandescent puts out roughly 800 lumens, and a typical LED delivers close to 100 lumens per watt, so 8 W matches it. Buy on the lumen figure printed on the box rather than the watt-equivalent claim.",
    ],
    [
      "How long do LED bulbs actually last?",
      "Household LEDs are commonly rated at 25,000 hours, against about 8000 for a CFL and 1000 for an incandescent — roughly 13 years at five hours a day. Real life falls short of the rating in enclosed or hot fittings, because heat is what degrades the driver and the phosphor.",
    ],
  ],
};

export default seo;
