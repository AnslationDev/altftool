const seo = {
  title: "Standby Power Cost Calculator – Ranked Cost",
  metaDescription:
    "Add your devices, tariff and idle hours to see what standby power costs in ₹ per year, ranked worst-first — a set-top box alone can waste ₹880.",
  steps: [
    "Set the Electricity tariff (₹ per unit) and add devices from the 'Choose a device to add…' preset list, each with a typical measured standby wattage.",
    "Adjust each row's Standby watts, How many and Idle hours a day fields — every line computes watts × quantity × idle hours × 365 ÷ 1000.",
    "Read the 'Wasted every year' rupee figure and the 'Ranked by what it costs' table, then press Copy result to copy the summary.",
  ],
  intro:
    "Standby power is the electricity a device draws while it is switched off but still plugged in, and this calculator turns your own list of devices into a rupee figure per year. Each line uses the same arithmetic — watts × quantity × idle hours per day × 365 ÷ 1000 — and the result is ranked so the worst offender is obvious. The ranking usually surprises people: a phone charger left in the socket draws under 0.1 W, while a DTH set-top box in standby can draw 15 W around the clock.",
  useCases: [
    "Your electricity bill has a baseline you cannot explain even in months when the house is empty for a week.",
    "You want to decide which switchboards are worth turning off at night and which make no measurable difference.",
    "You are working out whether a smart plug or a master switch for the TV wall is worth installing.",
  ],
  benefits: [
    ["Ranked, not just totalled", "Devices are sorted by annual cost, so you can see that one set-top box outweighs a dozen chargers."],
    ["Real preset wattages", "Starting values come from published standby measurements rather than guesses, and every one stays editable."],
    ["Ten-year view", "A quiet 25 W baseline looks trivial per month and substantial across the life of the appliances."],
  ],
  faqs: [
    [
      "How much does standby power cost per year in an Indian home?",
      "A typical home with a set-top box, a router, a TV, a microwave and a couple of ACs wastes roughly 230 units a year, which is about ₹1,860 at ₹8 a unit. Homes with an inverter on float charge, a gaming console or several always-on devices can easily double that.",
    ],
    [
      "Which appliance uses the most standby power?",
      "In most Indian homes it is the DTH or cable set-top box, at roughly 15 W even when the TV is off — around 110 units and ₹880 a year on its own. Home inverters on float charge and Wi-Fi routers are the next largest, while modern televisions have been driven below 0.5 W by efficiency rules.",
    ],
    [
      "Does unplugging phone chargers actually save electricity?",
      "Barely. A modern charger with no phone attached draws under 0.1 W, which comes to under 1 unit a year — a few rupees. The habit is harmless, but it saves roughly a hundredth of what switching off a set-top box does.",
    ],
    [
      "What is the 1-watt standby rule?",
      "It is the International Energy Agency's target that appliances should draw no more than 1 watt in standby, which most modern electronics now meet. Anything measuring well above 1 W in standby is either old, or is not truly idle — it is listening, recording or charging, and is worth switching off at the socket.",
    ],
  ],
};

export default seo;
