const seo = {
  title: "Vocabulary Complexity Analyzer: Flesch, Fog & LIX",
  metaDescription:
    "Paste text for Flesch Reading Ease, Flesch-Kincaid grade, Gunning Fog, LIX, type-token ratio and the heaviest 3+ syllable words.",
  steps: [
    "Paste at least 10 words into the Text to analyse box, or load the Plain guidance, Corporate policy or Narrative sample.",
    "Scores recompute as you type: Flesch Reading Ease with its audience label, then Flesch-Kincaid grade, Gunning Fog index and LIX.",
    "Read the heaviest three-syllable words and the type-token ratio, then press Copy report for the whole breakdown.",
  ],
  intro:
    "This analyser measures how demanding a piece of English writing is by counting words, sentences and syllables and feeding them into four published readability formulas: Flesch Reading Ease (1948), Flesch-Kincaid Grade Level (1975), the Gunning Fog Index (1952) and LIX (1968). It also reports lexical diversity through the type-token ratio and Guiraud's root TTR, and lists the heaviest words in the passage. It is for editors, teachers, technical writers and anyone rewriting a document for a specific reading level.",
  useCases: [
    "Check whether a customer email lands near Flesch 60-70 before it goes out to a general audience",
    "Compare two drafts of the same paragraph and see which one dropped the Fog index by the most",
    "Find the three-syllable words carrying a policy document above a college reading level",
  ],
  benefits: [
    ["Four formulas side by side", "Flesch, Flesch-Kincaid, Fog and LIX disagree in useful ways; seeing all four stops you over-fitting to one."],
    ["Diversity as well as difficulty", "Type-token ratio and root TTR show whether the vocabulary is genuinely varied or just long-winded."],
    ["The actual offending words", "The heaviest three-syllable-plus words are listed, so you know exactly what to rewrite."],
  ],
  faqs: [
    [
      "What is a good Flesch Reading Ease score?",
      "60 to 70 for general audiences — that is plain English at roughly an 8th to 9th grade level. Above 90 reads as very easy, 30 to 50 is difficult and usually means college-level readers, and below 30 is very hard going. Most newspapers sit around 60 to 65; insurance and legal documents commonly land in the 20s.",
    ],
    [
      "How is Flesch Reading Ease calculated?",
      "206.835 minus 1.015 times the average words per sentence, minus 84.6 times the average syllables per word. That is Rudolf Flesch's 1948 formula unchanged. Because only two things move the score — sentence length and word length — the fastest way to raise it is to split long sentences and swap multi-syllable words for shorter ones.",
    ],
    [
      "What counts as a complex word?",
      "For the Gunning Fog Index, a word of three or more syllables — excluding forms that only reach three because of an -es, -ed or -ing ending. LIX uses a different rule, counting any word longer than six letters. Both counts are shown separately here because they flag different words.",
    ],
    [
      "What does the type-token ratio tell me?",
      "It is unique words divided by total words, so 0.8 means four in five words appear only once in the passage. It drops naturally as text gets longer, which makes raw TTR unusable for comparing documents of different lengths — that is why the root TTR (unique words divided by the square root of total words) is shown alongside it.",
    ],
  ],
};

export default seo;
