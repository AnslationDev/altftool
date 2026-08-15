const seo = {
  title: "Decibel Change Calculator — dB to Ratio",
  metaDescription:
    "Converts a dB change into power (10^(dB/10)), amplitude (10^(dB/20)) and perceived loudness ratios, plus distance and equivalent-source counts.",
  steps: [
    "Choose What you know: A change in decibels, or A ratio, and I want the decibels (with What the ratio describes).",
    "Type the Level change (dB) — positive louder, negative quieter — or tap a Common changes chip such as +3 dB.",
    "Read the power, amplitude and perceived-loudness ratios plus the equivalent distance and identical-source count; Copy result exports all of them.",
  ],
  intro:
    "A decibel change calculator converts a level difference in dB into the ratios it actually represents: power ratio 10^(dB/10), amplitude or sound-pressure ratio 10^(dB/20), and perceived loudness 2^(dB/10). It also gives the two practical equivalents — the distance ratio 10^(−dB/20) from the inverse-square law, and the number of identical uncorrelated sources that would produce the same rise. It is for audio engineers, acoustics students and anyone deciding whether a +3 dB change is worth chasing.",
  useCases: [
    "Checking that doubling an amplifier's power buys only 3 dB, which is barely more than the smallest difference most listeners can hear.",
    "Working out how much further from a loudspeaker you must stand for a 10 dB drop — 3.16 times the distance in free field.",
    "Converting a measured pressure ratio of 2 into 6.02 dB when writing up a noise measurement.",
  ],
  benefits: [
    [
      "Both decibel definitions, side by side",
      "Power uses 10·log₁₀ and amplitude uses 20·log₁₀ — the tool shows both ratios for the same dB figure, so the factor of two is never guessed.",
    ],
    [
      "Perceived loudness, not just physics",
      "The sone-based +10 dB ≈ twice as loud rule is applied separately, because the ear does not follow either the power or amplitude ratio.",
    ],
    [
      "Distance and source equivalents",
      "Every level change is also expressed as a distance ratio and a count of identical uncorrelated sources — the two things that change level on a real site.",
    ],
  ],
  faqs: [
    [
      "How much louder is 3 dB?",
      "3 dB is exactly double the power (3.01 dB, since 10·log₁₀2 = 3.0103) but only 1.41 times the amplitude, and the ear hears it as about 1.23 times as loud. It is a clearly audible step in an A/B comparison, and nowhere near twice as loud.",
    ],
    [
      "Why is 6 dB double the amplitude but 3 dB double the power?",
      "Because power is proportional to the square of a field quantity such as sound pressure or voltage. Decibels for power are 10·log₁₀(ratio) and for amplitude 20·log₁₀(ratio), so doubling the amplitude quadruples the power — 20·log₁₀2 = 6.02 dB against 10·log₁₀2 = 3.01 dB.",
    ],
    [
      "How many decibels is twice as loud?",
      "About 10 dB. On Stevens' sone scale, used in ISO 532 loudness standards, a 10 dB rise is heard as roughly a doubling of loudness for steady broadband sound well above threshold — even though 10 dB is ten times the power and only 3.16 times the sound pressure.",
    ],
    [
      "How much does sound drop with distance?",
      "About 6.02 dB for every doubling of distance from a point source in free field, which is the inverse-square law written as 20·log₁₀2. So 2 metres to 8 metres is two doublings, or about 12 dB. Indoors the drop is smaller because reflected sound fills in the difference, and a line source such as a busy road falls at roughly 3 dB per doubling instead.",
    ],
  ],
};

export default seo;
