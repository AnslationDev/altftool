const seo = {
  title: "Daily Word Game: Five Letters, Six Guesses",
  metaDescription:
    "One five-letter answer a day, six guesses, green and amber letter scoring. Practice rounds never touch your streak, and hard mode enforces clues.",
  steps: [
    "Pick Daily or Practice at the top of the board — Daily shows \"Puzzle #N\" and one shared answer, Practice deals unlimited rounds — and tick \"Hard mode\" before your first guess, since it can only be switched between rounds.",
    "Type a five-letter word on the on-screen keyboard or your own keyboard and press Enter; tiles turn green for a right letter in the right spot and amber for a right letter elsewhere, across six rows.",
    "When the round ends the card names the answer — press \"Share result\" to copy the emoji grid, or \"Play again\" in practice — while the Daily stats panel updates Played, Win %, Streak, Max streak and Guess distribution.",
  ],
  intro:
    "Daily Word Game is a five-letter word puzzle with six attempts: each guess is scored letter by letter, green for the right letter in the right spot and amber for a letter that is in the word but somewhere else. One answer is set per calendar day from a 608-word list, and a practice mode lets you keep playing without touching your streak. There is an optional hard mode that forces every revealed clue into your next guess, plus a copyable emoji grid so you can share the result without spoiling the answer.",
  useCases: [
    "You have finished the day's puzzle by 9am and want to keep playing — practice mode gives unlimited rounds that leave your streak alone",
    "You want to post your score in a group chat without leaking the word, using the emoji grid that shows the pattern only",
    "The daily has got too easy and you want a real constraint, so you switch on hard mode before your first guess of the day",
  ],
  benefits: [
    ["Practice rounds that cannot cost you a streak", "Only the daily puzzle updates stats, so extra games are genuinely free to play."],
    ["Hard mode that actually enforces itself", "Any green letter must stay in place and every amber letter must reappear, with the rule named in the rejection message."],
    ["Duplicate letters scored correctly", "Repeats are counted against a pool of remaining letters, so a second E is only marked amber if the answer really has two."],
  ],
  faqs: [
    [
      "How many guesses and how long are the words?",
      "Six guesses at a five-letter word. Every guess must be a real word from the accepted list of about 1,450 entries, which is deliberately wider than the 608 words that can appear as answers.",
    ],
    [
      "Does practice mode affect my streak?",
      "No. Games played, wins, current and max streak and the 1-to-6 guess distribution are updated by the daily puzzle only. Your streak continues when you solve the puzzle on consecutive days and resets to zero after a loss or a skipped day.",
    ],
    [
      "What exactly does hard mode change?",
      "It rejects any guess that ignores a clue you have already revealed: a letter marked green must stay in that exact position, and a letter marked amber must appear somewhere in the guess. You can only toggle it before your first guess of a round, since switching mid-game would change the difficulty retroactively.",
    ],
    [
      "When does a new puzzle appear, and is my progress saved?",
      "A new answer unlocks at local midnight — the puzzle number is the count of days since 1 January 2024. The board in progress, your stats and your hard-mode preference are stored in this browser only, so there is no account and no sync between devices.",
    ],
  ],
};

export default seo;
