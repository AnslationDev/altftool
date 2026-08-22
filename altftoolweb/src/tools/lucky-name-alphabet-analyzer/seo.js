const seo = {
  title: "Lucky Name Analyzer: 0-100 Score, Just for Fun",
  metaDescription:
    "Scores a spelling 0-100 from vowel balance, letter variety, consonant runs, English letter frequency and Chaldean vs Pythagorean roots. A novelty index.",
  steps: [
    "Type a spelling into \"Name to analyse\" — spaces and punctuation are ignored, and only A–Z letters count.",
    "The score recomputes as you type from five components worth 20 points each: Vowel balance, Letter variety, Pronounceability, Everyday letters and Numerology agreement, with each one's raw measurement shown.",
    "Novelty score gives the total out of 100 and its band (Very smooth, Smooth, Mixed or Unusual), above rows for Letters, Distinct letters, Longest consonant run, Mean English letter frequency and both numerology totals; paste into \"One name per line\" to rank a shortlist.",
  ],
  intro:
    "The Lucky Name Alphabet Analyzer scores a spelling out of 100 by measuring five things about its letters: the share that are vowels, how many letters are distinct, the longest run of consonants, how common the letters are in ordinary English text, and whether the Chaldean and Pythagorean root numbers of the name agree. Each measure is worth 20 points and every weight and threshold is printed alongside the result, so the total can be reproduced by hand. It is a novelty index defined by this page for entertainment — not a traditional practice and not evidence of anything.",
  useCases: [
    "Narrowing a baby-name shortlist for fun by seeing which spellings have the smoothest vowel-to-consonant balance.",
    "Comparing two spellings of a name — Meera against Mira — to see which uses more everyday English letters.",
    "Spotting a name with a long consonant cluster that people are likely to stumble over when reading it aloud.",
    "Seeing at a glance where the Chaldean and Pythagorean numerology systems disagree on the same name.",
  ],
  benefits: [
    ["Nothing hidden", "The five components, their point weights and the raw measurement behind each are all shown."],
    ["Real letter data", "The everyday-letters component uses the published English letter frequency table, not made-up weights."],
    ["Shortlist ranking", "Paste a list of names and see them ordered, so comparisons take one step instead of many."],
  ],
  faqs: [
    [
      "Is there really such a thing as a lucky name score?",
      "No. There is no traditional, statistical or scientific score that makes one name luckier than another. The number here is an index invented for this page from measurable spelling properties, published openly so it can be checked — treat it as a game, not a verdict.",
    ],
    [
      "How is the score calculated?",
      "Five components each worth 20 points add to 100: vowel balance (full marks at a 40% vowel share), letter variety (distinct letters ÷ total letters), pronounceability (5 points off per consonant beyond a run of two), everyday letters (mean English letter frequency against 7.7%, twice the 3.85% average letter), and agreement between the Chaldean and Pythagorean root numbers.",
    ],
    [
      "Which letters count as vowels here?",
      "A, E, I, O and U. Y is treated as a consonant for the balance and cluster measures so the rule stays predictable, even though it carries a vowel sound in names like Lynn.",
    ],
    [
      "Should a low score stop me choosing a name?",
      "No. A low score usually just means the spelling is distinctive — rare letters, a heavy cluster or a lopsided vowel count — which is often exactly what a family wants. Choose a name for its meaning and how it sounds to you; this page is entertainment.",
    ],
  ],
};

export default seo;
