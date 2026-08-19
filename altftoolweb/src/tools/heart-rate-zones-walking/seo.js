const seo = {
  title: "Walking Heart Rate Zones by Age & Resting HR",
  metaDescription:
    "ACSM zones from Tanaka, 220-age or Gulati max HR, by %max or Karvonen reserve, each with its steps-per-minute cadence target.",
  steps: [
    "Enter your Age (years) and Resting heart rate (bpm), then pick a Maximum heart rate formula: Tanaka (208 - 0.7 x age), Fox (220 - age) or Gulati.",
    "Choose % of maximum HR or % of heart rate reserve, and set Minutes per walk.",
    "Read the Brisk-walk target zone in bpm with each ACSM zone's steps-per-minute cadence, then press Copy result.",
  ],
  intro:
    "This calculator turns your age and resting pulse into the beats-per-minute bands that separate a stroll from a genuinely brisk walk, using the ACSM intensity classification and either percentage of maximum heart rate or the Karvonen heart rate reserve method. Maximum heart rate is estimated with the Tanaka formula (208 minus 0.7 times age), with the classic 220-minus-age and the women-specific Gulati equation offered for comparison. Each zone also carries a steps-per-minute cadence target, so you can hit the right effort without a chest strap.",
  useCases: [
    "Find the exact heart rate that makes a lunchtime walk count toward the 150 weekly minutes of moderate activity.",
    "Set a walking pace after a cardiac rehab discharge, where the instruction is a heart rate range rather than a speed.",
    "Check whether your usual dog walk is actually in the light zone rather than the moderate zone you assumed.",
    "Use cadence instead of heart rate on days you leave the watch at home — 100 steps a minute is the moderate-intensity threshold.",
  ],
  benefits: [
    [
      "Two zone methods",
      "Switch between percentage of maximum heart rate and Karvonen heart rate reserve, which accounts for your fitness.",
    ],
    [
      "Cadence as a backup",
      "Every zone lists steps per minute from the CADENCE-Adults research, usable with any step counter.",
    ],
    [
      "Three max-HR formulas",
      "Tanaka, the classic 220-minus-age, and Gulati's women-specific equation, with a note on when each fits.",
    ],
  ],
  faqs: [
    [
      "What heart rate should I walk at to lose weight?",
      "Aim for the moderate zone, 64 to 76 percent of your maximum heart rate — about 115 to 137 bpm for a 40-year-old with an estimated maximum of 180. Total calories burned matter more than the zone, so a longer walk at a comfortable pace beats a short one at a punishing pace you cannot repeat.",
    ],
    [
      "How fast is a brisk walk?",
      "About 100 steps per minute is the accepted threshold for moderate intensity in healthy adults, which for most people is roughly 5 km/h or a 12-minute kilometre. The simplest field check is the talk test: you can speak in full sentences but could not comfortably sing.",
    ],
    [
      "Is 220 minus age accurate for calculating maximum heart rate?",
      "It is convenient but imprecise — it tends to overestimate maximum heart rate in younger adults and underestimate it after about 40. The Tanaka equation, 208 minus 0.7 times age, fits adult populations better, though any age-based estimate carries a standard deviation of roughly 10 bpm for an individual.",
    ],
    [
      "Should I use heart rate reserve or percentage of maximum?",
      "Heart rate reserve (the Karvonen method) is the better choice if you know your true resting heart rate, because it scales the zones to your own fitness rather than to age alone. Percentage of maximum is simpler and is what most fitness watches display by default, so pick one method and stay consistent rather than mixing the two.",
    ],
  ],
};

export default seo;
