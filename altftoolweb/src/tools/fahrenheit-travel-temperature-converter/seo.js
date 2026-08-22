const seo = {
  title: "Fahrenheit to Celsius: Heat Index & Wind Chill",
  metaDescription:
    "Convert forecast highs and lows both ways, add the NWS heat index and wind chill where they actually apply, and get a packing hint for the band.",
  steps: [
    "Enter Forecast daytime high and Forecast overnight low, set Forecast is in to Fahrenheit or Celsius, and give Relative humidity (%), Wind speed and Wind unit (mph or km/h).",
    "The conversion runs as you type using °C = (°F − 32) × 5/9, adding the NWS heat index from an index of 80°F and the wind chill index at or below 50°F with wind above 3 mph, and printing the reason when either does not apply.",
    "Read the converted Daytime high, then the rows for Day-to-night swing, High in kelvin, Afternoon heat index and Night wind chill, plus the Pack for the day hint; Copy result copies the lot.",
  ],
  intro:
    "This converter turns a forecast high and low between Fahrenheit and Celsius using °C = (°F − 32) × 5/9, then adds the two feels-like figures meteorologists actually publish: the US National Weather Service heat index (the Rothfusz regression, applied at or above an index of 80°F) and the 2001 NWS wind chill index (valid at or below 50°F with wind above 3 mph). Each result comes with a packing hint for the temperature band it falls in, so a 95°F forecast reads as 35°C, feels like about 48°C at 65% humidity, and calls for linen and a midday break.",
  useCases: [
    "Reading a US forecast in Fahrenheit before a trip when you think in Celsius.",
    "Deciding whether a 12°C day-to-night swing means packing a second layer.",
    "Checking whether a humid 33°C afternoon is a heat-index problem before booking an outdoor tour.",
  ],
  benefits: [
    ["Real meteorological formulas", "Uses the published NWS heat index and wind chill equations, not a rough rule of thumb."],
    ["Honest about validity", "Says when wind chill or heat index does not apply instead of printing a meaningless number."],
    ["Packing hint per band", "Turns the number into what to actually put in the bag, day and night."],
  ],
  faqs: [
    [
      "How do I convert Fahrenheit to Celsius quickly?",
      "Subtract 32 and multiply by 5/9 — so 95°F is (95 − 32) × 5/9 = 35°C. For a rough answer in your head, subtract 30 and halve: 95 becomes about 32, close enough to know it is hot.",
    ],
    [
      "What does the heat index actually measure?",
      "It estimates the shade temperature that would feel the same at a reference humidity, so 32°C at 70% humidity has a heat index of about 40°C. It assumes shade and a light breeze — the NWS notes that full sunshine can raise the effective value by up to about 8°C — because sweat evaporates more slowly in humid air and evaporation is how the body sheds heat.",
    ],
    [
      "At what temperature does wind chill matter?",
      "The NWS wind chill index is only defined at or below 50°F (10°C) with wind above 3 mph. Within that range wind matters a great deal: -4°C with a 40 km/h wind feels like about -13°C, because moving air strips away the thin warm layer next to your skin.",
    ],
    [
      "What should I pack for 15°C weather?",
      "A light jacket or sweater over a shirt, long trousers and a packable rain layer — 15°C is comfortable while walking and cool once you stop. Check the overnight low too: a 15°C day that drops to 5°C needs a proper jacket for the evening, which is why this tool asks for both figures.",
    ],
  ],
};

export default seo;
