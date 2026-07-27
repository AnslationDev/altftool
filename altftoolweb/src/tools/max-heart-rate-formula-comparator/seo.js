const seo = {
  intro:
    "This comparator runs seven published age-prediction equations for maximum heart rate — Fox (220 − age), Astrand, Inbar, Tanaka (208 − 0.7 × age), Gellish, Gulati (206 − 0.88 × age, women) and Nes (211 − 0.64 × age) — on the same age and shows how far apart they land. Each result carries its prediction band of roughly ±10 bpm, the study it came from, and its difference from a measured maximum if you have one. The spread is the real lesson: at any given age these equations disagree by several beats, and the individual variation around each is larger still.",
  useCases: [
    "See how much your training zones shift if you switch your watch from 220 − age to the Tanaka equation.",
    "Pick a more appropriate default for a female athlete using the women-specific Gulati equation.",
    "Compare a lab-tested maximum against every equation to find which one fits you best.",
    "Show a client or athlete why an age-predicted maximum should not be treated as a precise personal number.",
  ],
  benefits: [
    [
      "Seven equations, one age",
      "Fox, Astrand, Inbar, Tanaka, Gellish, Gulati and Nes calculated together, each with its published source.",
    ],
    [
      "Honest uncertainty",
      "Every estimate is shown with its ±10 bpm prediction band rather than as a single confident figure.",
    ],
    [
      "Zone anchors included",
      "Converts the suggested estimate into 50%, 60%, 70%, 80%, 90% and 100% of maximum heart rate.",
    ],
  ],
  faqs: [
    [
      "Which max heart rate formula is most accurate?",
      "For adults generally, Tanaka's 208 − 0.7 × age is the usual default because it came from a meta-analysis of 351 studies covering 18,712 people plus a prospective validation cohort. For women, Gulati's 206 − 0.88 × age was derived specifically from 5,437 women and predicts lower maxima. None is accurate for an individual — the standard deviation is about 10 bpm for all of them.",
    ],
    [
      "Why is 220 minus age considered inaccurate?",
      "The Fox equation was never derived from a dedicated study; it was a convenient line drawn through data from several older sources. It tends to overestimate maximum heart rate in people under about 40 and underestimate it in older adults, and it carries a standard deviation of roughly 12 bpm.",
    ],
    [
      "How much do these formulas differ from each other?",
      "At age 40 the estimates run from about 178 bpm (Inbar) to about 185 bpm (Nes) for a unisex calculation — a spread of around 7 bpm. The gap widens at the extremes of age, which is where the equations' differing slopes matter most.",
    ],
    [
      "How do I find my actual maximum heart rate?",
      "Only a maximal exercise test measures it: a supervised graded treadmill or cycle protocol to volitional exhaustion, or a hard field test such as repeated uphill efforts with the peak recorded on a chest strap. Because maximal testing carries genuine cardiac risk, arrange it through a doctor or exercise physiologist, especially if you are over 40, sedentary, or have any cardiovascular symptoms or risk factors.",
    ],
  ],
};

export default seo;
