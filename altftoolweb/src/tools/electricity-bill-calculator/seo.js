const seo = {
  title: "Electricity Bill Calculator: Appliance-Wise",
  metaDescription:
    "Enter each appliance's wattage, hours and count plus your tariff to get monthly units, energy, fixed and duty charges, and the biggest power users ranked.",
  steps: [
    "List devices with 'Power (watts)', 'Hours / day' and Quantity — 'Add appliance' adds rows, and each row shows its own units and rupees.",
    "Under 'Tariff & charges' set 'Rate per unit (₹/kWh)', 'Billing days', 'Fixed charges (₹)' and 'Tax / duty (%)', or tap a preset like '1 BHK basic'.",
    "Read the 'Estimated monthly bill' with per-day, per-year and the 'Biggest power users' share bars; 'Copy result' copies the full report.",
  ],
  "intro": "Electricity Bill Calculator turns your appliance list into a realistic monthly bill: enter each device's wattage, how many hours a day it runs and how many you own, then add your per-unit tariff, fixed charges and electricity duty. It reports total units (kWh), the rupee cost, the per-day average and a ranked view of which appliances are actually driving the bill. Useful for households, PGs, shops and small offices trying to find where the money goes before the next meter reading.",
  "useCases": [
    "Work out how much an air conditioner running 6 hours a night actually adds to the monthly bill.",
    "Compare the running cost of an old 250 W refrigerator against a 5-star model before buying.",
    "Split a shared flat or PG bill fairly by calculating each room's appliance load.",
    "Sanity-check an unusually high bill by estimating what your appliances should have consumed."
  ],
  "benefits": [
    [
      "Per-appliance breakdown",
      "See units and rupees for every device, plus a ranked share bar showing the biggest power users."
    ],
    [
      "Real bill structure",
      "Energy charges, fixed charges and tax or electricity duty are calculated separately, the way discoms bill them."
    ],
    [
      "Daily and yearly view",
      "The same inputs give you cost per day and projected annual spend, so savings decisions are easier to judge."
    ]
  ],
  "faqs": [
    [
      "How is an electricity unit calculated?",
      "One unit is one kilowatt-hour: watts x hours of use / 1000. A 1500 W air conditioner running 6 hours uses 9 units a day, or about 270 units in a 30-day month."
    ],
    [
      "My state uses slab tariffs. Can I still use this?",
      "Yes, but enter your effective average rate rather than the first-slab rate. Divide the energy-charge amount on your last bill by the units consumed to get it, since slab rates step up as consumption rises."
    ],
    [
      "Does a device use power when it is switched off?",
      "Many do. Set-top boxes, chargers, TVs and inverters draw standby power of roughly 1-10 W. You can model this by adding a low-wattage entry running close to 24 hours a day."
    ],
    [
      "Why is my real bill different from this estimate?",
      "Actual bills include slab changes, fuel surcharge adjustments, meter-reading cycles that are not exactly 30 days, and appliances cycling on and off rather than running continuously. Treat the result as a close informational estimate, not a billed amount."
    ]
  ]
};

export default seo;
