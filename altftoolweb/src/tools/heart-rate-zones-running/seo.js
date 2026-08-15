const seo = {
  title: "Running Heart Rate Zones in bpm With Matching",
  metaDescription:
    "Five running zones in bpm from Tanaka, Fox or Gulati max HR, by flat percentage or Karvonen reserve, each with the Friel pace band that matches it.",
  steps: [
    "Enter \"Age (years)\" and \"Resting heart rate (bpm)\", or paste a figure into \"Measured max heart rate (bpm) — optional\".",
    "Pick the \"Max heart rate formula\" (Tanaka, Fox or Gulati (women)) and a \"Zone method\" of % of maximum heart rate or Karvonen (heart rate reserve), then set \"Threshold pace — minutes\" and seconds.",
    "Read \"Estimated maximum heart rate\" and the \"Your five running zones\" table of Zone, Heart rate, Pace and Typical session, plus the Zone 2 and Zone 4 target rows.",
  ],
  intro:
    "This calculator converts your age, resting heart rate and threshold pace into five running heart rate zones expressed in beats per minute, alongside the pace band that belongs with each zone. Maximum heart rate comes from Tanaka (208 − 0.7 × age), Fox (220 − age) or Gulati (206 − 0.88 × age for women), and zones are laid out either as a flat percentage of maximum or with the Karvonen heart rate reserve method. Pace bands follow Joe Friel's run pace zones, which are set as percentages of functional threshold pace.",
  useCases: [
    "Find the exact bpm ceiling for an easy run so your Zone 2 mileage does not drift into tempo effort.",
    "Set a threshold interval target before a 2 × 15 minute cruise session on the track.",
    "Convert a recent 10 km race pace into training paces for the rest of a marathon block.",
    "Re-check your zones after a resting heart rate drop shows your aerobic fitness has moved.",
  ],
  benefits: [
    ["Heart rate and pace together", "Every zone shows both a bpm band and the pace band that matches it, so watch and legs agree."],
    ["Three max HR formulas", "Tanaka, Fox and the women-specific Gulati equation, or paste in a max heart rate you measured."],
    ["Karvonen option", "Uses heart rate reserve so a low resting heart rate shifts your zones the way it should."],
  ],
  faqs: [
    [
      "What heart rate should I run in Zone 2?",
      "Zone 2 sits at 60–70% of maximum heart rate on the percentage method. For a 35-year-old with a Tanaka maximum of 184 bpm, that is roughly 110–128 bpm; using Karvonen with a 50 bpm resting rate it becomes about 130–144 bpm, because heart rate reserve shifts every zone upward.",
    ],
    [
      "Which max heart rate formula is most accurate for runners?",
      "Tanaka's 208 − 0.7 × age tracks measured values better than 220 − age across the age range, and Gulati's 206 − 0.88 × age is the better fit for women. All of them carry a standard deviation of roughly 10 beats, so a proper maximal test or a hard race finish is more accurate than any equation.",
    ],
    [
      "How do I find my threshold pace for the pace zones?",
      "Threshold pace is close to the pace you could hold flat out for about an hour — for most runners that lands between 10 km and half-marathon race pace. A 30-minute time trial run alone, taking the average pace of the final 20 minutes, is the usual field test.",
    ],
    [
      "Why is my running heart rate higher than on the bike at the same effort?",
      "Running is weight-bearing and recruits more muscle mass, so maximum heart rate in running typically measures around 5–10 beats higher than in cycling for the same athlete. Keep separate zone sets per sport rather than copying one across. If your heart rate behaves oddly at a familiar effort, or you get chest pain, dizziness or unusual breathlessness, stop and speak to a doctor.",
    ],
  ],
};

export default seo;
