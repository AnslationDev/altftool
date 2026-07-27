const seo = {
  intro:
    "The Karvonen method sets training zones from heart rate reserve — target heart rate = ((maximum HR − resting HR) × intensity) + resting HR — rather than from a flat percentage of maximum heart rate. Because it anchors the bottom of the scale at your own resting pulse, two people the same age get different zones if one is fitter. Enter your resting heart rate plus either your age or a measured maximum, and you get all five zones in beats per minute along with any custom intensity you want to check.",
  useCases: [
    "Set the upper heart rate cap for easy marathon base runs so Zone 2 work does not creep into tempo pace.",
    "Rebuild your zones after a training block drops your morning resting pulse from 62 to 54 bpm.",
    "Convert a coach's instruction like '75% of heart rate reserve for 40 minutes' into a specific bpm number for your watch.",
    "Compare Karvonen zones against the percentage-of-max zones your fitness tracker uses by default.",
  ],
  benefits: [
    [
      "Personalised by fitness",
      "Heart rate reserve moves as your resting pulse falls, so zones track your conditioning rather than only your birthday.",
    ],
    [
      "Four published max HR formulas",
      "Switch between Tanaka, Fox, Gulati and Nes, or override them entirely with a lab-measured maximum.",
    ],
    [
      "Zone-by-zone purpose",
      "Each band shows both the bpm range and what the session is actually training, from recovery to VO2 max.",
    ],
  ],
  faqs: [
    [
      "What is the Karvonen formula?",
      "Target heart rate = ((maximum heart rate − resting heart rate) × intensity percentage) + resting heart rate. The bracketed term is heart rate reserve. For a max of 187 bpm and a resting rate of 60 bpm, the reserve is 127 bpm, so 70% intensity gives (127 × 0.70) + 60 ≈ 149 bpm.",
    ],
    [
      "Is Karvonen better than percentage of max heart rate?",
      "It usually tracks oxygen uptake more closely, because %HRR corresponds roughly one-to-one with %VO2 reserve while a plain %HRmax does not. The practical difference is largest at low intensities: 60% of max HR is a much easier effort than 60% of heart rate reserve, often 15-20 bpm apart.",
    ],
    [
      "How do I measure my resting heart rate accurately?",
      "Take it immediately on waking, lying still, before caffeine or standing up, and average three to five mornings. A single reading can be off by 5-10 bpm because of sleep quality, alcohol or a full bladder, and the average is what your zones should be built on.",
    ],
    [
      "Should I use 220 minus age for maximum heart rate?",
      "Only as a rough starting point — the Fox 220 − age equation has a standard deviation of about 10-12 bpm and systematically underestimates maximum heart rate in older adults. Tanaka's 208 − 0.7 × age fits population data better, but a supervised maximal test or a hard field test gives a far more reliable number. This tool is informational; check with a doctor before doing maximal-effort testing.",
    ],
  ],
};

export default seo;
