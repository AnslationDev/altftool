const seo = {
  title: "Bengali Word of the Day: 30-Word Deck & Romanisation",
  metaDescription:
    "One Bengali word a day from a 30-word deck — script, spoken-style romanisation, meaning and example sentence, with a streak saved only in your browser.",
  steps: [
    "Pick any date in the Date field, or move with the Previous day and Next day buttons — the 30-word deck is fixed by calendar date.",
    "Study the card's Bengali script, romanisation, part of speech, meaning and example sentence, then press Mark studied to extend your streak.",
    "Click Copy card to copy the full word card; the streak counter is saved only in this browser's local storage.",
  ],
  "intro": "A Bengali word-of-the-day deck of 30 curated words, each with its Bengali script spelling, a romanised reading that reflects how the word is actually pronounced, the part of speech, an example sentence and a note on usage. The word is chosen by the calendar date rather than at random, so everyone studying on a given day sees the same card and you can move to any date. A streak counter is stored only in your browser.",
  "useCases": [
    "Learn the Bengali words that have no clean English equivalent, such as অভিমান and মায়া.",
    "Practise reading Bengali script with a romanisation that reflects pronunciation, not just spelling.",
    "Pick up the vocabulary of Bengali essays and newspapers alongside everyday conversational words.",
    "Search by meaning to find the Bengali word for a concept you can only name in English."
  ],
  "benefits": [
    [
      "Pronunciation-based roman",
      "Romanisation follows how Bengali is spoken — শান্তি as shanti, স্বপ্ন as shopno — not letter-by-letter spelling."
    ],
    [
      "Untranslatables explained",
      "Cards for words like অভিমান spell out the feeling English has no single word for."
    ],
    [
      "One card, one date",
      "The deck rotates by calendar date, so a class or a family can study the same word together."
    ]
  ],
  "faqs": [
    [
      "Why does Bengali romanisation not match the spelling?",
      "Bengali spelling preserves older Sanskrit forms while pronunciation has moved on. স্বপ্ন is written svapna but said shopno, and the inherent vowel is often an 'o' rather than an 'a'. The romanisation here follows the spoken form so that you can be understood."
    ],
    [
      "What does অভিমান mean in English?",
      "There is no single English word for it. অভিমান is the hurt pride you feel only towards someone whose affection you take for granted — a loving sulk that expects to be coaxed out of. 'Sulk' catches the behaviour but misses the tenderness underneath it."
    ],
    [
      "Does everyone get the same word on the same day?",
      "Yes. The card is derived from the number of days since 1 January 1970 divided by the size of the deck, so it is identical on every device and in every timezone for a given date."
    ],
    [
      "Where is my streak stored?",
      "Only in this browser, in local storage. Nothing is sent anywhere, so clearing site data or switching device will restart the count."
    ]
  ]
};

export default seo;
