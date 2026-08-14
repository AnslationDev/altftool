const seo = {
  title: "Daily Word Challenge: Guess the Word from Its Definition",
  metaDescription:
    "Guess the word from its dictionary definition in 5 tries with Wordle-style letter feedback. Two free hints, one shared word per day, streaks tracked.",
  steps: [
    "Read the day's clue in the Definition box — the same word is served to everyone that day, picked from the 30-word library by date.",
    "Type your answer into the 'Type a N-letter word' field and press Guess; a guess must match the answer's length, and you get 5 attempts.",
    "Each guess is marked per letter — green in the right place, amber elsewhere. Use 'Get a Hint' (two free hints: synonyms, then first/last letter and length) and watch your Wins and Streak counters update.",
  ],
  intro:
    "Daily Word Challenge gives you a dictionary definition and five attempts to name the word it describes — a vocabulary puzzle rather than a letter puzzle, since you start from the meaning and work back to the word. Guesses are marked letter by letter in Wordle style: green where a letter is in the right place, amber where it belongs elsewhere in the word. Two optional hints are available, first the word's synonyms and then its shape, and the same word is served to everyone for the whole day.",
  useCases: [
    "You are preparing for an exam with a vocabulary section — GRE, IELTS, a competitive entrance test — and want one precise word a day rather than a list to cram",
    "English is your second language and you can recognise words in reading but not produce them, so working definition-to-word is the practice you actually need",
    "You want a two-minute morning ritual with a streak worth protecting, without an app or an account",
  ],
  benefits: [
    ["You solve from meaning, not letter patterns", "The clue is a real dictionary definition, so the puzzle trains recall of the word rather than anagram instinct."],
    ["Hints escalate instead of giving it away", "Hint one reveals three synonyms; hint two gives first letter, last letter and length — take one or neither."],
    ["Per-letter feedback with duplicates handled", "Repeated letters are matched greedily against the answer, so a doubled letter is only marked once if it appears once."],
  ],
  faqs: [
    [
      "How many guesses do I get?",
      "Five per day. Each guess must be exactly as long as the answer or it will not be accepted, and after the fifth wrong attempt the answer is revealed and that day's streak resets to zero.",
    ],
    [
      "Where do the hints come from and do they cost me a guess?",
      "They are free — using a hint never consumes an attempt. Hint one lists three synonyms of the answer, hint two states the first letter, last letter and letter count, and there are only two hints per day.",
    ],
    [
      "Is everyone getting the same word?",
      "Yes, for a given calendar day the word is picked from the 30-word library by a formula based on the date, so anyone playing that day is solving the same puzzle. Answers run from 5-letter words like lucid to 10-letter ones like meticulous and ubiquitous.",
    ],
    [
      "How does the streak work?",
      "Your streak increases by one for each day you solve the word and resets to zero on a loss or if more than one day passes between plays. Streaks, wins and games played are kept in this browser's local storage with no account, so clearing site data or switching device starts you over.",
    ],
  ],
};

export default seo;
