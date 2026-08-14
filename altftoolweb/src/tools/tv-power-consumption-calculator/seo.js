const seo = {
  title: "TV Power Consumption Calculator - kWh and Cost",
  metaDescription:
    "Estimate a TV's kWh and running cost from screen size, panel type and picture mode - or your label wattage - with standby hours billed separately.",
  steps: [
    "Set \"Screen size (inches, diagonal)\" with the 32-75 inch presets, plus \"Panel technology\" and \"Picture mode\", or type the \"Known on-mode wattage from the energy label\".",
    "Enter \"Viewing hours per day\", \"Electricity tariff (INR per kWh)\" and \"Standby draw (watts)\".",
    "Read the estimated monthly running cost with kWh per day, cost per year and standby cost per year, then click \"Copy result\".",
  ],
  intro:
    "This calculator estimates how many kilowatt-hours a television uses and what that costs, from the kWh definition: power in watts multiplied by hours of use, divided by 1000, then multiplied by your tariff. When you do not know your set's wattage it models on-mode power from 16:9 screen area and panel technology, so a 55-inch edge-lit LED comes out near 90 W while an OLED of the same size lands higher. Standby hours are counted separately, because a TV that is 'off' still draws power.",
  useCases: [
    "Deciding between a 55-inch and a 65-inch TV by seeing the yearly electricity difference before you buy",
    "Checking whether switching a smart TV off at the wall is worth it, using the standby-cost-per-year line",
    "Working out what dropping the picture from Vivid to Eco mode saves over a year of the same viewing hours",
  ],
  benefits: [
    ["Area-based model", "Power is derived from real 16:9 panel area, not a one-size guess per TV."],
    ["Standby counted", "Idle hours are billed at your standby wattage instead of being ignored."],
    ["Label override", "Enter the on-mode watts printed on your energy label for an exact figure."],
  ],
  faqs: [
    [
      "How much electricity does a 55 inch TV use?",
      "A 55-inch edge-lit LED TV typically draws about 90 W in standard SDR picture mode, so five hours a day is roughly 0.45 kWh daily, about 14 kWh a month and around 165 kWh a year. An OLED or a Mini-LED of the same size in a bright HDR mode can use 40 to 90 percent more.",
    ],
    [
      "How do I calculate the running cost of my TV?",
      "Multiply the TV's wattage by the hours you watch, divide by 1000 to get kilowatt-hours, then multiply by your electricity tariff. At 8 INR per kWh, a 90 W TV watched 5 hours a day costs about 3.60 INR a day and roughly 110 INR a month, before standby.",
    ],
    [
      "Does a TV use power when it is turned off?",
      "Yes. In standby a modern TV usually draws under 0.5 W, the ceiling set by EU Ecodesign Regulation 1275/2008 for off and standby mode, though networked standby on a smart TV is permitted up to 2 W. At 0.5 W for 19 hours a day that is only about 3.5 kWh a year, so unplugging one TV saves very little.",
    ],
    [
      "Does OLED use more electricity than LED?",
      "Usually yes for the same screen size, because OLED pixels emit their own light and peak-brightness scenes push the panel hard, whereas an edge-lit LCD backlight is comparatively efficient. OLED draw is highly content-dependent though — mostly dark scenes can pull less power than an LCD, which lights the whole backlight regardless.",
    ],
  ],
};

export default seo;
