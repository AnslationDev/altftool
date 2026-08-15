const seo = {
  title: "Microwave Running Cost: an 800 W Oven Draws 1230",
  metaDescription:
    "Cost per reheat, month and year for solo, grill and convection — the door rating is output, so an 800 W oven pulls about 1230 W. Standby counted.",
  steps: [
    "Pick 'Cooking mode' — Solo microwave, Grill (quartz element) or Convection (baking). The power field relabels to match: 'Rated microwave output power (W)' starts at 800, the grill element at 1100 and convection at 1400.",
    "Set 'Power level used (%)', 'Minutes per run' and 'Runs per day', which start at 100%, 5 and 3, plus 'Standby draw (W)' for the clock, typically 1-5 W, 'Days used per month' and 'Electricity tariff (₹ per unit)'. Convection adds a 'Preheat minutes' field that runs the element at full power.",
    "'Cost per run' appears with the power actually drawn from the socket, the energy per run in kWh, standby's share of the daily total, and cost per month and per year. The 'What common jobs cost' table prices standard jobs at your own wattages, and 'Copy result' takes the summary.",
  ],
  intro:
    "This calculator turns a microwave's rated wattage into the rupees it adds to your bill per meal, per month and per year. The key correction it makes is that the figure on the door — 700 W, 800 W, 900 W — is cooking output, not socket draw: a magnetron and its transformer run at roughly 65% efficiency, so an 800 W oven actually pulls about 1230 W. Grill and convection modes use resistive elements where the rated wattage is the draw, and convection cycles on a thermostat once the cavity is hot, so all three are handled separately.",
  useCases: [
    "You reheat three plates a day and want to know whether the microwave is a meaningful line on the electricity bill or a rounding error.",
    "You are comparing baking a cake in the microwave's convection mode against firing up a separate 2000 W oven.",
    "You want to see whether the always-on clock display is worth unplugging, in rupees per year rather than watts.",
  ],
  benefits: [
    ["Output versus input corrected", "Costing an 800 W oven at 800 W understates the bill by about 54% — the socket draw is used instead."],
    ["Standby counted", "A 3 W display running every hour of the year adds about 26 kWh, which is often more than a light user's cooking energy."],
    ["Mode-aware", "Solo, grill and convection are modelled with their own draw and duty cycle, including the full-power preheat before a bake."],
  ],
  faqs: [
    [
      "How much electricity does a microwave use per use?",
      "About 0.10 kWh for a five-minute run on an 800 W oven, which is roughly 80 paise at ₹8 a unit. The oven draws around 1230 W from the socket while running, so the arithmetic is 1.23 kW × 5/60 hours.",
    ],
    [
      "Is the wattage on the microwave the power it consumes?",
      "No. The advertised 700 W or 800 W is the microwave energy delivered to the food; the power drawn from the wall is higher because the magnetron and transformer are about 65% efficient. Divide the rated output by 0.65 to get the approximate input, or read the input wattage on the rating plate at the back.",
    ],
    [
      "Does a lower power level save electricity?",
      "Only in proportion to the time the magnetron actually runs. Power level 50% does not halve the draw — it switches the magnetron on for roughly half of each cycle, so a run at 50% for the same number of minutes uses about half the energy, but food usually needs longer at the lower setting, which cancels much of the saving.",
    ],
    [
      "Is a microwave cheaper than a gas stove or an electric oven?",
      "For reheating and small portions, almost always — a microwave heats only the food, while a full-size 2000 W oven spends most of its energy heating a large empty cavity. For boiling large volumes or slow cooking, a gas hob or pressure cooker is usually cheaper per meal.",
    ],
  ],
};

export default seo;
