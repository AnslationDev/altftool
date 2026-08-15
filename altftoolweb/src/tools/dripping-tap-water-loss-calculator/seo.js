const seo = {
  title: "Dripping Tap Calculator – Water Loss in Litres & Rupees",
  metaDescription:
    "Count drips for a minute or time a 1-litre fill — see litres lost per day, month and year, cost at your water rate, and geyser units for hot leaks.",
  steps: [
    "Choose how you measured the leak — 'Counted drips per minute' or 'Timed a 1 litre fill' — and enter the count or seconds plus your Water cost (₹ per kilolitre).",
    "Tick 'This is a hot water tap' to add the geyser's temperature rise, heater efficiency and electricity tariff to the estimate.",
    "Read the litres lost per day, month and year with the total yearly cost in rupees, then click Copy result.",
  ],
  intro:
    "A dripping tap water loss calculator converts a drip count into litres using the USGS figure of 15,140 drips per US gallon — 0.25 mL per drip — so every drip per minute works out to 0.36 litres a day. Enter the drips you counted in one minute, or the seconds a faster leak takes to fill a one-litre bottle, and it reports the loss per day, month and year in litres, in rupees at your water rate, and in geyser units if the leak is on the hot line.",
  useCases: [
    "Deciding whether a bathroom tap that has dripped for months is worth a plumber's visit",
    "Showing a landlord or society office the annual cost of a leak they keep postponing",
    "Working out why the water bill or tanker count rose with no change in household habits",
  ],
  benefits: [
    ["Two ways to measure", "Count drips for a minute, or time a one-litre fill when the leak is faster."],
    ["Hot leaks priced too", "Adds the geyser energy already spent on water going down the drain."],
    ["Familiar comparison", "Converts the annual loss into 15-litre buckets so the number means something."],
  ],
  faqs: [
    [
      "How much water does a dripping tap waste per day?",
      "About 0.36 litres a day for every drip per minute, using the USGS figure of 0.25 mL per drip. A steady 30-drips-a-minute leak therefore loses roughly 10.8 litres a day, 324 litres a month and about 3,942 litres a year — more than three-quarters of a standard 5,000 litre tanker.",
    ],
    [
      "How do I measure the drip rate of my tap?",
      "Put a cup under the tap, start a one-minute timer and count each drip. If the drips run together into a thin stream, switch to the timed method instead: measure how many seconds it takes to fill a one-litre bottle, since flow in litres per minute is simply 60 divided by that number of seconds.",
    ],
    [
      "Does a hot water leak cost more than a cold one?",
      "Yes, usually several times more, because the water has already been paid for twice — once as water and once as electricity. Heating 3,942 litres by 20 °C takes about 92 kWh of useful heat, roughly 102 kWh at the meter for a geyser at 90% efficiency, which typically dwarfs the value of the water itself.",
    ],
    [
      "What causes a tap to drip and can I fix it myself?",
      "A drip from the spout is nearly always a worn rubber washer in a pillar tap or a failed ceramic cartridge in a quarter-turn tap, both inexpensive parts. Shut the supply, open the tap to drain it and replace the part; a leak from the base or handle instead points to an O-ring or a loose gland nut and is worth a plumber's look.",
    ],
  ],
};

export default seo;
