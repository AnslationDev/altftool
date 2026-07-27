const seo = {
  intro:
    "This calculator prices the electricity your ceiling fans use — watts divided by 1000, times hours per day, times days of use, times your tariff — and then works out the simple payback period on replacing them with BLDC fans. Payback is net upgrade cost divided by the annual saving, with no discounting. It also applies the fan affinity law, where power falls with the cube of speed, so you can price a fan that mostly runs at a lower setting.",
  useCases: [
    "Costing four fans that run twelve hours a day for eight months of the year before the summer bill arrives",
    "Deciding whether replacing old 75 W induction fans with 30 W BLDC fans is worth the up-front spend",
    "Checking how much running at speed 3 instead of speed 5 saves on a fan with electronic speed control",
  ],
  benefits: [
    ["Simple payback shown", "Reports the months until the BLDC upgrade repays itself, plus the 5 and 10 year position."],
    ["Affinity law built in", "Speed buttons apply the cube law rather than a guessed percentage."],
    ["Seasonal use handled", "Set the months per year fans actually run instead of assuming twelve."],
  ],
  faqs: [
    [
      "How much electricity does a ceiling fan use per hour?",
      "A conventional 1200 mm induction ceiling fan draws about 70 to 80 W at full speed, so roughly 0.075 kWh per hour; a BEE 5-star model is nearer 50 W and a BLDC fan around 28 to 35 W. At 8 INR per kWh, a 75 W fan costs about 60 paise an hour.",
    ],
    [
      "Is a BLDC fan worth the extra cost?",
      "Usually, if the fan runs long hours. Replacing a 75 W fan with a 30 W BLDC saves 45 W, which at twelve hours a day for eight months is about 131 kWh and roughly 1050 INR a year per fan — enough to repay a 3000 INR price difference in under three years.",
    ],
    [
      "Does running a fan at a lower speed save electricity?",
      "It depends entirely on the regulator. With electronic speed control the affinity law applies and power falls with the cube of speed, so speed 3 of 5 draws only about 22 percent of full power. An old resistive regulator dissipates the difference as heat in the resistor, so the meter barely notices.",
    ],
    [
      "How much does it cost to run a fan all night?",
      "A 75 W fan running eight hours uses 0.6 kWh, about 4.80 INR at 8 INR per kWh, or roughly 145 INR a month. The same eight hours on a 30 W BLDC fan is 0.24 kWh, close to 1.92 INR a night.",
    ],
  ],
};

export default seo;
