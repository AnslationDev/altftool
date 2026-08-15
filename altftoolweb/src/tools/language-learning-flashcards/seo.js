const seo = {
  title: "Language Learning Flashcards with SM-2 Spaced Repetition",
  metaDescription:
    "Vocabulary flashcards scheduled by the SM-2 algorithm: rate 0-5, ease starts at 2.5 with a 1.3 floor. Bulk-import lists, export sets as JSON.",
  steps: [
    "Press New Set to name a deck, then open Bulk Import and paste one card per line as \"term | definition\" — a tab, pipe, comma or double space all work as the separator — and hit Import Cards.",
    "Press Study, flip each card, and answer \"How well did you know this?\" on the six-point scale from Complete blackout to Perfect response; anything below Correct with serious difficulty resets that card to a 1-day interval.",
    "Check Mastery Overview, where a card counts as mastered at 5 successful repetitions and a 21-day interval, then press Export to download flashcards-export-<timestamp>.json.",
  ],
  intro:
    "Language Learning Flashcards is a vocabulary trainer that schedules your reviews with the SM-2 spaced-repetition algorithm — the same interval logic behind SuperMemo and Anki. You rate each card from 0 to 5 after flipping it, and the algorithm sets the next review date from that grade: 1 day, then 6 days, then the previous interval multiplied by the card's ease factor, which starts at 2.5 and never drops below 1.3. Cards are grouped into sets, imported in bulk from pasted lines, and stored in your browser, with a card counted as mastered once it has 5 successful repetitions and an interval of at least 21 days.",
  useCases: [
    "You are working through a Spanish or French course and want the words you keep forgetting to come back tomorrow while the ones you know reliably drop to once a month.",
    "You have a vocabulary list from a textbook or a spreadsheet and want it turned into cards in one paste — the bulk importer splits each line on a tab, pipe or comma.",
    "You are two weeks from an exam and want to see which cards are genuinely mastered versus which are still resetting to a one-day interval every time you review them.",
  ],
  benefits: [
    ["Real SM-2 scheduling", "Each card carries its own ease factor and interval, so difficult words are re-shown sooner and easy ones stretch out, instead of every card cycling at the same rate."],
    ["Six-point grading, not right/wrong", "Rating from complete blackout to perfect response lets a card you got right but hesitated on be treated differently from one you answered instantly."],
    ["Your sets stay portable", "Everything lives in browser storage with a one-click JSON export, so a deck you built over months can be backed up or moved without an account."],
  ],
  faqs: [
    [
      "How does the spaced repetition scheduling work?",
      "It uses SM-2: the first successful review sets a 1-day interval, the second sets 6 days, and every one after that multiplies the previous interval by the card's ease factor. Ease starts at 2.5 and is adjusted after each answer, with a floor of 1.3, so a card you keep struggling with stays at short intervals.",
    ],
    [
      "What happens when I get a card wrong?",
      "Any grade below 3 resets the card's repetition count to zero and its interval to 1 day, so it comes back the next session. Its ease factor also drops, which means even after you start getting it right the intervals grow more slowly than for an easy card.",
    ],
    [
      "When is a card counted as mastered?",
      "When it has 5 or more successful repetitions and its current interval has reached at least 21 days. Twenty-one days is the conventional line between short-term recall and something that has moved into long-term memory.",
    ],
    [
      "How do I import an existing word list?",
      "Paste it into the bulk importer with one card per line and the term first — the separator can be a tab, a pipe, a comma or a double space, and it is detected per line. You can also load a previously exported JSON file to restore whole sets with their review history intact.",
    ],
  ],
};

export default seo;
