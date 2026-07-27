const seo = {
  intro:
    "A musical interval is named by two things: the number of staff degrees the two notes occupy, and how the actual semitone distance compares with the major or perfect size of that number. This calculator applies both rules, so C to F# comes back as an augmented fourth while C to Gb comes back as a diminished fifth even though each spans six semitones. It also reports cents, the inversion, the equal-tempered frequency ratio and the five-limit just ratio the interval is tuned against.",
  useCases: [
    "Checking whether a leap you have written is a diminished fifth or an augmented fourth before labelling it in an analysis worksheet",
    "Working out how many semitones to transpose a sampler patch when a part must move from A3 to G4",
    "Showing a student why an equal-tempered major third sits about 14 cents sharp of the pure 5:4 ratio they hear in a barbershop chord",
  ],
  benefits: [
    ["Spelling-aware, not just semitones", "Enharmonic pairs like F# and Gb produce different interval names, as they should."],
    ["Cents and ratios together", "The same interval is shown as semitones, cents, a decimal ratio and a whole-number just ratio."],
    ["Inversions worked out for you", "Every simple interval is paired with its inversion, so a minor sixth immediately reads as a major third."],
  ],
  faqs: [
    [
      "How do you calculate the interval between two notes?",
      "Count the letter names inclusively to get the number, then compare the semitone distance with the major or perfect size of that number to get the quality. C up to E covers C-D-E, so it is a third; it spans 4 semitones, which is the major size, making it a major third.",
    ],
    [
      "How many semitones are in each interval?",
      "Within one octave: minor 2nd 1, major 2nd 2, minor 3rd 3, major 3rd 4, perfect 4th 5, tritone 6, perfect 5th 7, minor 6th 8, major 6th 9, minor 7th 10, major 7th 11 and perfect octave 12. Compound intervals add 12 semitones per extra octave, so a major tenth is 16.",
    ],
    [
      "What is the difference between an augmented fourth and a diminished fifth?",
      "They sound identical in equal temperament — both are 6 semitones — but they are spelled and resolved differently. An augmented fourth (C to F#) is a fourth widened by a semitone and tends to expand outward; a diminished fifth (C to Gb) is a fifth narrowed by a semitone and tends to contract inward.",
    ],
    [
      "Why is an equal-tempered third out of tune with a pure third?",
      "Equal temperament makes every semitone exactly 100 cents so all keys are usable, which forces most intervals off their whole-number ratios. The pure major third is 5:4, about 386.31 cents, while the tempered major third is 400 cents — roughly 13.7 cents sharp. The tempered fifth is much closer, only about 1.96 cents flat of 3:2.",
    ],
  ],
};

export default seo;
