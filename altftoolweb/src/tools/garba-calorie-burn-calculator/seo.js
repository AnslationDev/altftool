const seo = {
  title: "Garba Calorie Calculator by Tempo and Night Count",
  metaDescription:
    "Estimate garba and dandiya calories by tempo band at 3.0, 5.0 and 7.8 METs, with standing time at 1.3 METs and a total across all nine Navratri nights.",
  steps: [
    "Enter Body weight, set the Weight unit to Kilograms (kg) or Pounds (lb), and set 'Nights you dance' — the field notes that Navratri runs for 9 nights.",
    "Under 'Minutes in one night' split the evening across the four tempo bands: slow opening rounds and simple two-clap taali at 3.0 METs, steady mid-tempo garba at 5.0, full-tempo garba and dandiya raas at 7.8, and standing in the circle at 1.3.",
    "Read 'Calories in one night' with the dancing-share bar, then the rows for Average intensity in METs, Burn rate in kcal/min, moderate and vigorous minutes and 'Across all nights entered', plus the Tempo breakdown table; Copy result copies the whole breakdown.",
  ],
  intro:
    "This calculator estimates the calories burned on a garba or dandiya raas night by splitting the evening into tempo bands and pricing each with a published dance MET value through the formula kcal/min = MET x 3.5 x kg / 200. Full-tempo garba maps onto the general dancing entry that explicitly covers folk dancing at 7.8 METs — comfortably in the vigorous band — while slow opening rounds sit near 3.0 METs and standing in the circle is credited at just 1.3 METs. Because a garba night is mostly not dancing, standing time is entered separately, and the tool reports what share of the evening was genuinely active as well as the total across all nine nights of Navratri.",
  useCases: [
    "Work out what nine consecutive nights of garba add up to before deciding how to adjust food and sleep during Navratri.",
    "See how much of the evening you actually spend dancing versus standing, which is usually the difference between a 400 kcal night and an 800 kcal one.",
    "Check whether a single full-tempo night already covers a week's worth of moderate-intensity activity.",
  ],
  benefits: [
    [
      "Tempo bands, not one average",
      "Slow taali rounds, mid-tempo garba and full-speed dandiya are priced separately at 3.0, 5.0 and 7.8 METs.",
    ],
    [
      "Standing time counted honestly",
      "Aarti, water breaks and waiting in the circle are credited at 1.3 METs instead of being counted as dancing.",
    ],
    [
      "Whole-festival totals",
      "Multiplies a night by the number of nights you dance, so the nine-night load is visible in one number.",
    ],
  ],
  faqs: [
    [
      "How many calories does garba burn in an hour?",
      "About 490 kcal an hour of full-tempo dancing for a 60 kg person, since fast garba and dandiya map onto the 7.8 MET general dancing entry, which is roughly 8.2 kcal a minute at that weight. Mid-tempo rounds at 5.0 METs are closer to 315 kcal an hour.",
    ],
    [
      "Is garba a good workout?",
      "Yes — at 7.8 METs, full-tempo garba is vigorous-intensity activity, higher than jogging at 7.0 METs. A single three-hour night with two hours of real dancing can produce more moderate-equivalent minutes than the entire 150-minute weekly WHO target.",
    ],
    [
      "How many calories are burned across all nine nights of Navratri?",
      "Roughly 7,800 kcal for a 60 kg dancer doing three hours at the venue each night with about two hours of actual dancing. The figure scales directly with body weight and with how much of each night you spend moving rather than standing.",
    ],
    [
      "Why does standing time matter so much in the calculation?",
      "Because standing quietly is 1.3 METs against 7.8 METs for full-tempo garba — six times lower. Counting the whole evening as dancing can double the apparent burn, which is why the tool asks for standing minutes separately. Nine late nights of vigorous dancing is a genuine training load, so hydrate and stop if you feel unwell.",
    ],
  ],
};

export default seo;
