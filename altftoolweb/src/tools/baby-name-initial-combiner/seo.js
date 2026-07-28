const seo = {
  intro:
    "The Baby Name Initial Combiner splices two names into new ones by splitting each into consonant-plus-vowel syllables and recombining the pieces ten different ways in both directions — first syllable of one with the last of the other, opening consonants on the other's vowel body, overlapping shared letters, and so on. Every result is scored out of 100: sixty percent for pronounceability (no three-consonant runs, no vowel pile-ups, four to eight letters) and forty percent for how evenly the two parents contributed. The same two names always produce the same list.",
  useCases: [
    "Build a baby name from both parents' names, such as Rohan and Priya giving Roya, Prihan and Hanya.",
    "Honour two grandparents in a single name without simply hyphenating them.",
    "Test whether a blend you already invented is actually sayable — the score itemises consonant runs and length problems.",
    "Add a familiar ending like -a, -an or -ika to give a short blend more weight.",
  ],
  benefits: [
    ["Deterministic, not random", "Refreshing gives the same list, so you can come back to a name you liked."],
    ["Say-ability is measured", "Consonant runs, vowel pile-ups, hard onsets and unusual lengths each cost explicit points."],
    ["Both parents visible", "The balance score shows when a blend is really just one name with a letter borrowed."],
  ],
  faqs: [
    [
      "How do you combine two parents' names into a baby name?",
      "The reliable method is syllable splicing: take the opening syllable of one name and the closing syllable of the other, then check the result is pronounceable. Rohan and Priya give Roya and Prihan this way; Aarav and Meera give Meerav and Aamee.",
    ],
    [
      "What makes an invented name hard to say?",
      "Three or more consonants in a row, three or more vowels in a row, a two-consonant opening, and length outside about four to eight letters. This tool deducts 30, 20, 10 and 8 points per letter respectively for exactly those.",
    ],
    [
      "Can I register an invented name for my child?",
      "In most countries yes, but rules differ. India places no general restriction on invented given names, while some countries maintain approved-name lists or reject names deemed harmful to the child. Check the birth registration rules where the birth is registered before you commit.",
    ],
    [
      "Should a blended name have a meaning?",
      "It will not have one by default, since it is a new word. If a meaning matters to your family, look for a blend that happens to coincide with an existing word — Riya and Vinita both turn up as blends — and confirm what that word means in the languages you speak.",
    ],
  ],
};

export default seo;
