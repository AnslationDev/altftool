const seo = {
  intro:
    "This calculator estimates your maximum heart rate with the Tanaka formula — 208 minus 0.7 times your age — and turns it into five training zones in beats per minute. Enter age alone and the zones are plain percentages of max HR; add your resting heart rate and it switches to the Karvonen method, which works from heart rate reserve (max minus resting) so the numbers reflect your own conditioning. It is for runners, cyclists and gym users who want real bpm targets to program into a watch instead of a vague 'moderate effort'.",
  useCases: [
    "You bought a chest strap and need the actual bpm ceiling for an easy Zone 2 run so you stop drifting into tempo pace.",
    "Your plan says '4 x 4 minutes at 85-90% effort' and you want that translated into a number you can set as a watch alert.",
    "Your resting pulse dropped from 68 to 58 after a training block and you want to see how much that moves your zone boundaries.",
  ],
  benefits: [
    ["Tanaka instead of 220 minus age", "Uses 208 - 0.7 x age, which has a smaller error spread across adult ages than the old 220 rule."],
    ["Karvonen when you supply resting HR", "Adding one number switches the maths to heart rate reserve, raising the low zones to realistic intensities."],
    ["Five zones with their purpose", "Each band shows its bpm range alongside what it trains — recovery, endurance, aerobic, capacity or maximum."],
  ],
  faqs: [
    [
      "What is my maximum heart rate at my age?",
      "This tool uses the Tanaka formula: 208 - (0.7 x age). A 40-year-old gets 180 bpm, a 30-year-old 187 bpm and a 55-year-old about 170 bpm. It is a population estimate with an individual spread of roughly 10 bpm either way, so a lab or field max test remains more accurate for you personally.",
    ],
    [
      "What is the difference between the Karvonen method and percentage of max HR?",
      "Karvonen works from heart rate reserve: target = ((max HR - resting HR) x intensity) + resting HR, so your resting pulse anchors the bottom of the scale. Straight percentage of max ignores resting HR entirely and produces lower targets — at 70% intensity a 40-year-old with a resting HR of 60 gets 144 bpm by Karvonen but only 126 bpm by percentage of max.",
    ],
    [
      "What are the five heart rate training zones?",
      "Zone 1 is 50-60% (recovery), Zone 2 is 60-70% (basic endurance and fat burning), Zone 3 is 70-80% (aerobic fitness), Zone 4 is 80-90% (performance capacity) and Zone 5 is 90-100% (maximum speed and power). Most endurance plans keep the large majority of weekly volume in Zones 1-2.",
    ],
    [
      "How do I measure my resting heart rate correctly?",
      "Count your pulse for a full 60 seconds first thing in the morning, before getting out of bed or drinking coffee, and average three consecutive days. Typical adult values are 60-100 bpm, with trained endurance athletes often in the 40s. If your resting rate is persistently above 100 or below 40 without training to explain it, raise it with a doctor.",
    ],
  ],
};

export default seo;
