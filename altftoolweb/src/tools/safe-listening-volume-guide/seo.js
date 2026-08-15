const seo = {
  title: "Safe Headphone Volume: dB to Weekly Listening",
  metaDescription:
    "Convert a dB(A) level into safe listening hours using the WHO-ITU H.870 allowance of 80 dB(A) for 40 hours a week, or 75 dB(A) for children.",
  steps: [
    "Enter Listening level, dB(A) or tap a reference-sound preset, then your hours of listening per day and days per week.",
    "Set Listener profile to the adult 80 dB(A) reference or the 75 dB(A) reference for a child or sensitive listener.",
    "Read the hours allowed per week at that level and the share of the weekly sound allowance your habit uses, then press Copy result.",
  ],
  intro:
    "A safe listening allowance is the amount of sound energy your ears can take in a week before the risk of noise-induced hearing loss starts to climb, and the WHO-ITU standard for safe listening devices (Recommendation ITU-T H.870) sets it at 80 dB(A) sustained for 40 hours a week for adults, or 75 dB(A) for 40 hours for children and sensitive listeners. Because sound energy doubles for every 3 dB rise, the permitted time halves every 3 dB — so this guide converts any listening level into the hours it buys you, shows how much of the weekly allowance your current habit uses, and names the highest level that habit could sit at. It is informational and is not a hearing test.",
  useCases: [
    "Checking how long a two-hour daily commute at 90 dB(A) uses up against the weekly allowance",
    "Setting a headphone volume limit for a child using the more protective 75 dB(A) reference",
    "Comparing a gym session at 95 dB(A) with the NIOSH occupational limit for the same level",
  ],
  benefits: [
    ["Standard-based, not guesswork", "Uses the WHO-ITU H.870 weekly sound allowance and its 3 dB exchange rate."],
    ["Two references built in", "Switches between the 80 dB(A) adult dose and the 75 dB(A) dose for children and sensitive listeners."],
    ["Answers both questions", "Shows time allowed at your level and the level allowed at your listening time."],
  ],
  faqs: [
    [
      "How many hours a day can I safely listen to headphones?",
      "It depends entirely on the level. The WHO-ITU allowance of 80 dB(A) for 40 hours a week works out to roughly 5.7 hours a day, but at 89 dB(A) that drops to about 5 hours a week and at 100 dB(A) to roughly 24 minutes a week, because every 3 dB halves the permitted time.",
    ],
    [
      "What is a safe volume level in decibels for headphones?",
      "Around 80 dB(A) or below is the adult reference in ITU-T H.870, and 75 dB(A) for children. Above 85 dB(A) the safe duration falls below about 12.5 hours a week, and levels near the maximum output of many phones (roughly 94 to 105 dB(A)) allow only minutes.",
    ],
    [
      "Does the 60/60 rule actually protect your hearing?",
      "It is a reasonable rule of thumb, not a standard. Listening at 60% of device volume for 60 minutes a day keeps most people well inside the weekly allowance on typical hardware, but 60% means different decibel levels on different phone and headphone combinations, so a measured dB(A) figure is more reliable.",
    ],
    [
      "Do noise-cancelling headphones make listening safer?",
      "Indirectly, yes. Active noise cancellation lowers the background noise you are competing with, so you tend to set a lower volume to hear detail — often several decibels lower on a train or a flight, which meaningfully extends the safe duration. The cancellation itself does not reduce the level of your own audio.",
    ],
  ],
};

export default seo;
