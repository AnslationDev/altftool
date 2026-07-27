const seo = {
  intro:
    "This estimator converts an appliance's power rating and running hours into units of electricity and rupees: kilowatt-hours a month equal watts multiplied by hours a day and days used, divided by 1,000, and the cost is that figure times your tariff per unit. It totals every appliance in the home, adds electricity duty and fixed charges the way a bill does, and ranks the appliances so you can see which one is actually responsible for the increase. Typical wattages for fans, air conditioners, geysers and pumps are built in, and you can override any of them with the rating on your own nameplate.",
  useCases: [
    "Finding out how much of a summer bill is the air conditioner versus everything else in the house",
    "Comparing the running cost of a 3 star air conditioner against a 5 star inverter model before buying",
    "Checking whether a geyser used one hour a day justifies switching to a solar water heater",
  ],
  benefits: [
    ["Ranked by consumption", "Sorts appliances biggest first so the fix is obvious in one glance."],
    ["Bill-shaped output", "Adds electricity duty and fixed charges instead of stopping at the energy charge."],
    ["Real wattages built in", "Presets for common Indian appliances, each editable to the rating on your device."],
  ],
  faqs: [
    [
      "How do you calculate the electricity cost of an appliance?",
      "Multiply the wattage by the hours it runs a day, divide by 1,000 to get units per day, multiply by the days used in the month, and multiply by your tariff per unit. A 1,500 watt air conditioner run 6 hours a day for 30 days uses 270 units, which is Rs 2,160 at Rs 8 a unit.",
    ],
    [
      "How many units does a 1.5 ton AC consume in a month?",
      "A 3 star fixed-speed 1.5 ton split air conditioner draws about 1,500 watts, so six hours a day for thirty days is roughly 270 units. A 5 star inverter model of the same capacity draws around 1,100 watts and comes to about 198 units for the same use, which is where the higher purchase price is recovered.",
    ],
    [
      "Why is my bill higher than the appliance calculation?",
      "Domestic tariffs in most states are telescopic, so the rate per unit rises as monthly consumption crosses each slab, and the bill also carries fixed or demand charges based on your sanctioned load plus state electricity duty on the energy charge. Standby draw from set-top boxes, routers and chargers adds a few units more that are easy to miss.",
    ],
    [
      "Does a refrigerator run 24 hours a day?",
      "The plug is on all day but the compressor is not. A typical 250 litre refrigerator's compressor runs roughly six to nine hours in total across the day depending on ambient temperature and how often the door is opened, so enter compressor running hours rather than 24 or the estimate will be three times too high.",
    ],
  ],
};

export default seo;
