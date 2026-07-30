const seo = {
  intro:
    "AI Memory Capsule is a private journal that scores each entry you write with a lexicon-based sentiment analysis — counting matches against a built-in list of positive and negative words, adjusting for intensifiers and diminishers, and returning a −100 to +100 score — then tracks how those scores, moods and topics move over time. You tag each entry with one of 10 moods and a 1–5 intensity, and can seal a capsule behind a future unlock date so its content stays hidden until then. Everything is stored in your browser's localStorage, with JSON and CSV export so the archive is always yours.",
  useCases: [
    "You want to write a letter to yourself that stays sealed until a specific date next year, without trusting a mailing service to still exist by then",
    "You have journalled for a few months and want to see which topics — work, family, health, travel — dominate the entries where your sentiment score went negative",
    "You are moving off a subscription journalling app and want a local archive you can export to CSV with mood, intensity, tags and word count per entry",
  ],
  benefits: [
    [
      "Sentiment you can audit",
      "The score is a transparent positive-minus-negative word ratio with a 1.3x bump for intensifiers and a 0.7x damping for diminishers — no opaque model deciding how you felt.",
    ],
    [
      "Automatic topic and word insight",
      "Entries are matched against 10 topic dictionaries and a stop-word-filtered word frequency count, so recurring themes surface without you tagging them.",
    ],
    [
      "Genuinely sealed entries",
      "A capsule with a future unlock date hides its content in both the list and detail views until that timestamp passes.",
    ],
  ],
  faqs: [
    [
      "Where are my journal entries stored?",
      "In your browser's localStorage, under the key altftool_ai_memory_capsule_data — never on a server. That means entries are tied to this browser and profile, and clearing site data deletes them, so export to JSON regularly if the archive matters.",
    ],
    [
      "How does the mood score work?",
      "It scores from −100 to +100 using the formula (positive words − negative words) ÷ total sentiment words × 100, after stripping stop words. Above +30 reads as Positive and above +60 Very Positive; below −30 is Negative and below −60 Very Negative, with anything in between labelled Neutral.",
    ],
    [
      "Can a sealed capsule be opened early?",
      "Not through the interface — the content stays hidden until the unlock date you set. It is a self-discipline feature rather than encryption, though: the entry is stored in plain form in localStorage, so treat it as a promise to yourself, not a security control.",
    ],
    [
      "How do I move my entries somewhere else?",
      "Export as JSON for a complete copy including full text, or as CSV for a spreadsheet view with id, title, category, mood, intensity, tags, creation date, word count and favourite/pinned flags. The JSON export is the one to keep as a backup.",
    ],
  ],
};

export default seo;
