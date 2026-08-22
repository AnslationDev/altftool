const seo = {
  title: "Zumba Calories Burned Calculator by Class Format",
  metaDescription:
    "MET-based calories for six Zumba formats - Gold (5.0) to STRONG HIIT (9.0) - with net-of-resting figures and a Keytel heart-rate cross-check.",
  steps: [
    "Enter your Body weight (kg or lb) and the Class length (minutes), or tap one of the 30 / 45 / 55 / 60 min presets.",
    "Choose the Class format — six options from Zumba Gold (5.0 MET) to STRONG Nation / HIIT (9.0 MET) — and optionally tick 'Also estimate from my average heart rate' with your bpm, age and sex.",
    "Read 'Calories burned in class' with the net-of-resting-metabolism figure and the Keytel 2005 heart-rate estimate beside it, then press Copy result.",
  ],
  intro:
    "The Zumba Calorie Burn Calculator converts a class length and format into calories using the ACSM MET equation, kcal/min = MET x 3.5 x kg / 200. Formats are separated because a Zumba Gold class (about 5 MET) and a STRONG Nation HIIT class (about 9 MET) are nearly twice apart in energy cost, and an optional heart-rate mode applies the Keytel et al. (2005) equation so you can cross-check the MET figure against what your watch recorded.",
  useCases: [
    "Log a standard 55-minute Zumba Fitness class in a calorie tracker with a defensible number instead of the app's generic 'dance' entry.",
    "Compare Aqua Zumba against a Step class before choosing which to add to a weekly routine.",
    "Cross-check a fitness watch's calorie readout against the MET method to see whether the watch is running high.",
    "Plan a weekly deficit by seeing what three 45-minute classes actually contribute in calories.",
  ],
  benefits: [
    ["Format-specific METs", "Gold, Aqua, Toning, Fitness, Step and HIIT formats each carry their own published intensity value."],
    ["Two independent methods", "A MET estimate plus the Keytel heart-rate equation, so you can see how far apart they land."],
    ["Net figure included", "Resting metabolism is separated out, so the number is safe to add to a daily calorie target."],
  ],
  faqs: [
    [
      "How many calories does a one-hour Zumba class burn?",
      "For a 65 kg adult in a standard Zumba Fitness class at roughly 7.9 MET, about 539 kcal per hour, or around 494 kcal for a typical 55-minute class. A Zumba Gold class at 5 MET burns closer to 341 kcal per hour at the same body weight.",
    ],
    [
      "Why is my smartwatch calorie count different?",
      "Watches estimate from heart rate rather than oxygen uptake, and heart-rate equations such as Keytel et al. (2005) tend to read higher than MET tables during dance because arm movement above the head raises heart rate more than it raises energy cost. A gap of 10-25% between the two methods is normal.",
    ],
    [
      "Does Zumba count as vigorous exercise?",
      "A standard Zumba Fitness class does — anything at or above 6 MET is classed as vigorous intensity, so it counts toward the 75 minutes of vigorous activity per week in the WHO guidelines. Zumba Gold and Aqua Zumba sit around 5-5.3 MET, which is moderate intensity and counts toward the 150-minute moderate target instead.",
    ],
    [
      "Should I use the gross or the net calorie number?",
      "Use the net number when adding exercise to a daily calorie target, because your maintenance calories already include the resting metabolism burned during the class — roughly 68 kcal per hour for a 65 kg adult. The gross number is the right one when comparing activities against published MET tables.",
    ],
  ],
};

export default seo;
