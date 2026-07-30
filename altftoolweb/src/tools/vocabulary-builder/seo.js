const seo = {
  intro:
    "The Vocabulary Builder is a flashcard and quiz trainer built on a fixed set of 90 English words — 30 Easy, 30 Medium and 30 Hard — each stored with its definition, part of speech, an example sentence and synonyms. It is aimed at students preparing for exams, ESL learners and anyone rebuilding reading vocabulary, and it gives you three ways to work: a Word of the Day, tap-to-flip flashcards, and a multiple-choice quiz that shows a definition and asks you to pick the matching word from four options.",
  useCases: [
    "You have a competitive exam in six weeks and want a fixed daily habit — open the Word of the Day, which rotates deterministically by day of the year, then run ten quiz questions on the Hard set before you close the tab.",
    "You are teaching an ESL class and need a warm-up: filter to the 30 Easy words, project the flashcards, and let students call out the definition before you tap to flip the card.",
    "You keep failing definition-matching questions in practice tests, so you switch the quiz to Medium and drill it until your running score line stops showing wrong answers.",
  ],
  benefits: [
    ["Three graded levels, not one pile", "The same 90 words are split 30/30/30 across Easy, Medium and Hard, so you can drill only the band that is actually hard for you."],
    ["Quiz built from real distractors", "Each question shows a definition and offers four word choices drawn from the wider word list, so guessing by elimination does not work as easily."],
    ["Every card carries context", "Flipping a card reveals the definition, part of speech, an example sentence and synonym chips together, which is how words actually stick."],
  ],
  faqs: [
    [
      "How many words are in the vocabulary builder?",
      "There are 90 words in total, split evenly into 30 Easy, 30 Medium and 30 Hard. The difficulty filter shows the live count for each level, and the flashcard deck and quiz both draw from whichever level you have selected.",
    ],
    [
      "How is the Word of the Day chosen?",
      "It is picked by day of the year modulo 90, so the word is the same for everyone on a given date and changes once per day. Because 90 does not divide 365 evenly, the cycle shifts across the year rather than repeating on the same dates.",
    ],
    [
      "How does the quiz work?",
      "The quiz shows you a definition and four candidate words, one of which is correct. Wrong options are pulled at random from the full 90-word list, the correct answer is revealed as soon as you choose, and a running correct-out-of-attempted score sits in the quiz header.",
    ],
    [
      "Is my progress saved between sessions?",
      "No — the quiz score and the flashcard position reset when you reload the page, and nothing is uploaded or stored on a server. Everything runs locally in the browser, so treat each session as a fresh drill rather than a long-term progress tracker.",
    ],
  ],
};

export default seo;
