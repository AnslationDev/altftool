const seo = {
  title: "Stopword Impact Tester: 179 NLTK Stopwords",
  metaDescription:
    "Strip the 179-word NLTK English stopword list and filler, see words, characters, tokens and reading time saved — with negations protected.",
  steps: [
    "Paste into 'Your text', which starts on a worked onboarding-copy example, and add domain terms to 'Also remove these words' or 'Never remove these words', comma or space separated.",
    "Tick 'Remove standard English stopwords' for the 179-word NLTK list, 'Remove filler and hedge words (really, basically, actually)', and 'Protect negations and contrastives (not, no, but, than)' — untick the last to see what a naive filter destroys.",
    "The panel reports Words removed as a percentage, then Words, Characters, Estimated tokens and 'Reading time at 238 wpm' before and after, lists 'What was removed' by frequency, and Copy result takes the stripped text.",
  ],
  intro:
    "Stopword Impact Tester removes the 179-word English stopword list distributed with NLTK, plus common prose filler like really, basically and actually, and reports exactly what that saved in words, characters and estimated tokens. Its more useful half is the cost side: negations and contrastives such as not, no, but and than are protected by default, because stripping them turns 'does not scale' into 'scale' and silently reverses what the text says. Reading time is estimated at 238 words per minute, the mean silent reading rate for English non-fiction from Brysbaert's 2019 meta-analysis.",
  useCases: [
    "See how much of a long system prompt is stopwords before deciding whether trimming it is worth the readability cost.",
    "Demonstrate to a team why a naive stopword-removal step broke a sentiment classifier that used to handle negation.",
    "Cut hedge words out of a draft — really, basically, obviously — and read what is left to check the argument still stands.",
    "Compare word and character reduction for a search index where stopwords genuinely add nothing.",
  ],
  benefits: [
    [
      "Negations protected by default",
      "The words that flip meaning are held back and listed separately, so you can see what a naive filter would have destroyed.",
    ],
    [
      "Cost and saving side by side",
      "Word count, character count, estimated tokens and reading time all move together, which makes the trade-off concrete.",
    ],
    [
      "Editable word lists",
      "Add domain terms to strip, or force specific words to survive, without leaving the page.",
    ],
  ],
  faqs: [
    [
      "How many stopwords are there in English?",
      "There is no single official list. The list used here is the 179-word English list distributed with NLTK, which is the one most tutorials and search pipelines start from. Other lists differ substantially: scikit-learn's older English list has 318 entries and includes words many people would not consider stopwords.",
    ],
    [
      "Does removing stopwords change the meaning of a sentence?",
      "It can, badly. Roughly 68 words in the standard list carry meaning — every negation and contraction of one, plus but, if, or, than, against, only, and the directional prepositions. 'The service does not scale' becomes 'service scale', which asserts the opposite. That is why this tool protects them unless you switch the protection off.",
    ],
    [
      "How many tokens will I save by removing stopwords?",
      "Roughly in proportion to the characters removed. English text averages about four characters per token, so stripping 30% of the characters saves close to 30% of the tokens. These figures are rules of thumb rather than a real tokeniser, so treat them as an estimate and confirm against your model's own count before relying on the saving.",
    ],
    [
      "Should I remove stopwords before sending text to a language model?",
      "Usually not. Modern models use the function words to parse structure, and the token saving is small next to the risk of changing what you asked for. Stopword removal still earns its place in classic keyword search indexes, tag extraction and bag-of-words features, where word order is discarded anyway.",
    ],
  ],
};

export default seo;
