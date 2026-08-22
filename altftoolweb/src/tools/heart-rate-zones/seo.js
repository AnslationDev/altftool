const seo = {
  title: "Heart Rate Zones Calculator: Tanaka, Fox, Gulati",
  metaDescription:
    "Five training zones in real bpm from the Tanaka, Fox or Gulati max-HR formula, by % of max or Karvonen reserve, plus the zone your goal needs.",
  steps: [
    "Enter your Age and Resting heart rate (bpm), or tick I have a tested max HR and fill Measured max HR (bpm).",
    "Pick a Max HR formula — Tanaka 208 − 0.7 × age, Fox 220 − age or Gulati (women) 206 − 0.88 × age — then a Zone method, % of max HR or Karvonen (HR reserve).",
    "Choose Fat loss, Endurance base, Race speed or General health under Which zone should I train in?, then press Copy zone card.",
  ],
  intro:
    "This tool gives you your estimated maximum heart rate and all five training zones in real beats per minute, using your choice of three max-HR formulas — Tanaka (208 - 0.7 x age), Fox (220 - age) or Gulati for women (206 - 0.88 x age) — and either percentage of max or the Karvonen heart rate reserve method. Pick a goal such as fat loss, endurance base, race speed or general health and it names the single zone to train in and the bpm window that goes with it. You can also override the estimate with a measured max from a lab or field test, and copy the whole zone card as text for your training log.",
  useCases: [
    "You are starting a polarised plan and need the exact upper bpm limit for Zone 2 so your easy runs stay easy.",
    "You are a woman whose watch zones feel far too hard, and you want to see how much they drop under the Gulati formula instead of 220 minus age.",
    "You did a field max-HR test, measured 192, and want your five zones rebuilt from that real number rather than an age estimate.",
  ],
  benefits: [
    ["Three formulas, not one", "Tanaka, Fox and Gulati side by side, each with a note on where it came from and who it fits."],
    ["A goal picks the zone for you", "Choosing fat loss, base, speed or health highlights the target zone and explains why that band and not another."],
    ["Resting-rate context", "Your resting pulse is placed in a band from athletic to higher-than-ideal, and rates above 100 bpm are flagged."],
  ],
  faqs: [
    [
      "Which max heart rate formula is the most accurate?",
      "Tanaka — 208 - 0.7 x age — is the default here because it comes from a meta-analysis of 351 studies covering more than 18,000 people and tracks measured maximums better across the age range. Fox (220 - age) was never derived by proper regression and overestimates in younger people while underestimating in older ones. For women, Gulati (206 - 0.88 x age), built from a study of over 5,000 women, is usually the better fit.",
    ],
    [
      "What is Zone 2 and why does everyone train there?",
      "Zone 2 is 60-70% intensity — an easy, conversational pace you can hold for 45 minutes to 3 hours. It drives mitochondrial density, capillary growth and stroke volume, which is why it forms the bulk of endurance training. A common structure is roughly 80% of weekly time easy in Zones 1-2 and 20% hard in Zones 4-5.",
    ],
    [
      "Should I use Karvonen or percentage of max heart rate?",
      "Use Karvonen if you know your resting heart rate — it applies each percentage to your heart rate reserve (max minus resting) and adds resting back, so it adapts to your conditioning and produces higher, more realistic easy zones. Percentage of max is simpler but ignores resting rate entirely, which tends to set Zone 1 and Zone 2 too low for trained people.",
    ],
    [
      "What is a normal resting heart rate?",
      "The normal adult range is 60-100 bpm; under 60 is common in well-trained endurance athletes, 60-70 is good, 70-80 is average and above 80 sits at the top of normal. A resting rate persistently above 100 bpm is tachycardia and worth raising with a doctor, as is a resting rate that climbs steadily over several weeks without a change in training.",
    ],
  ],
};

export default seo;
