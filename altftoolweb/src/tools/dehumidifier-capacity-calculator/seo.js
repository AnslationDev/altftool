const seo = {
  title: "Dehumidifier Size Calculator: Litres per Day Needed",
  metaDescription:
    "Size a unit from room volume, humidity and moisture sources, derated from the 30 °C / 80% RH nameplate, with runtime and monthly running cost.",
  steps: [
    "Enter Floor area in sq ft or sq m and Ceiling height in feet or metres, then answer \"How damp does it feel?\" — Slightly damp, Moderately damp, Very damp or Wet / seepage.",
    "Set Room temperature (°C), Current humidity (% RH), Target humidity (% RH) and your Electricity tariff (₹ per kWh), then add the moisture sources: People usually in the space, Wash loads dried indoors per day and Showers taken in this space per day.",
    "\"Buy a dehumidifier rated\" gives the L/day nameplate at 30 °C / 80% RH along with the derating, expected runtime, kWh per month and running cost; press Copy result.",
  ],
  intro:
    "A dehumidifier capacity calculator converts the litres of water a room gains each day into the nameplate extraction rate you need to buy. It builds a moisture balance from room volume, air changes per hour, and the humidity ratio difference between your current and target relative humidity — using the Magnus saturation-vapour equation rather than a generic square-footage chart — then adds the water people, laundry and showers release. Because catalogue litres are measured at 30 °C and 80% RH, the result is also derated to the conditions the machine will really see.",
  useCases: [
    "Sizing a unit for a coastal or monsoon-belt bedroom that sits at 80% RH for months",
    "Choosing between a 12 L/day and a 25 L/day model for a basement or ground-floor flat with damp patches",
    "Working out the monthly electricity bill before committing to running a dehumidifier through the rainy season",
    "Checking whether a dehumidifier you already own is simply too small for the room you moved it into",
  ],
  benefits: [
    ["Rated litres corrected to your room", "Applies the derating that turns 20 rated litres into roughly 11 real ones in cooler, drier air."],
    ["Shows the dominant moisture source", "Ranks infiltration, occupants, laundry and wall evaporation so you can fix the cause, not just the symptom."],
    ["Runtime and running cost", "Reports duty cycle, kWh per month and rupees per month at your own tariff before you buy."],
  ],
  faqs: [
    [
      "What size dehumidifier do I need for a 400 sq ft room?",
      "For a 400 sq ft room with a 10 ft ceiling sitting at 30 °C and 80% RH with two occupants, the moisture load works out to roughly 18–19 litres a day, which needs a unit rated about 30 L/day. The rated figure is much larger than the load because nameplate litres are measured at 30 °C / 80% RH and real extraction drops as the air dries out.",
    ],
    [
      "Why does my dehumidifier remove far less water than the box claims?",
      "Because the rating is measured at 30 °C and 80% RH, and extraction falls roughly in proportion to the humidity ratio of the air being fed to it. At 25 °C and 60% RH a unit typically delivers around half its rated litres; US AHAM ratings taken at 18.3 °C and 60% RH read lower again for the identical machine.",
    ],
    [
      "What humidity level should I set a dehumidifier to?",
      "Between 45% and 55% RH suits most homes: it is dry enough to stop dust mites and mould, which need sustained humidity above about 60%, without drying out timber, instruments or your sinuses. Every extra 5% you dial down raises both runtime and the electricity bill, so do not chase 35% unless you are drying out a flood.",
    ],
    [
      "Does a dehumidifier use a lot of electricity?",
      "A compressor dehumidifier removes roughly 2 litres per kWh at its rating point and less in drier air, so a room shedding 18 litres a day can consume 10–12 kWh a day while it runs. Sealing draughts, venting the bathroom and drying laundry outdoors cut the load directly and are usually cheaper than a bigger machine. For persistent structural damp, consult a surveyor before buying any appliance.",
    ],
  ],
};

export default seo;
