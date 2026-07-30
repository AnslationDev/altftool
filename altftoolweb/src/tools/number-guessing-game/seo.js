const seo = {
  intro:
    "The Number Guessing Game picks a random secret number in your chosen range and tells you after each guess whether the target is higher or lower, until you find it or run out of attempts. Three difficulties set the range and the budget: Easy is 1–50 in 10 guesses, Medium is 1–100 in 7, and Hard is 1–200 in only 6. It is a hands-on way to practise binary search — halving the remaining range each turn is the strategy the guess budgets are built around.",
  useCases: [
    "You are teaching binary search to a class and want students to feel why halving the range beats guessing sequentially — Medium's 7-guess budget is exactly the ceiling of log₂(100).",
    "You have five minutes between meetings and want a short logic game that finishes in under a minute per round rather than something that pulls you in for half an hour.",
    "You are drilling mental halving with a child: start on Easy at 1–50, where 10 guesses leave plenty of room for trial and error before the strategy clicks.",
  ],
  benefits: [
    [
      "Guess budgets tuned to binary search",
      "Medium's 7 attempts match ceil(log₂ 100) exactly, so optimal play wins and sloppy play does not.",
    ],
    [
      "Full guess history stays on screen",
      "Every attempt is listed with an up or down arrow, so you can see the bracket narrowing instead of holding it in your head.",
    ],
    [
      "Hard mode is deliberately unfair",
      "1–200 in 6 guesses is below the 8 that binary search guarantees, turning it into a calculated-risk round rather than a solved one.",
    ],
  ],
  faqs: [
    [
      "What is the best strategy for a number guessing game?",
      "Guess the midpoint of the range that is still possible, then halve again after each hint. On Medium that means starting at 50, then 25 or 75, and so on — this finds any number from 1 to 100 in at most 7 guesses, which is exactly the attempt budget.",
    ],
    [
      "How many guesses do you get?",
      "It depends on difficulty: 10 guesses on Easy (1–50), 7 on Medium (1–100) and 6 on Hard (1–200). The counter at the top shows attempts used and attempts remaining as you play.",
    ],
    [
      "Can Hard mode always be won?",
      "No. Covering 1–200 with certainty needs 8 guesses under binary search, and Hard gives you 6, so it can only cover 64 possibilities with guaranteed play. Winning requires the secret number to fall inside the bracket you happen to be probing — good play raises the odds but cannot guarantee it.",
    ],
    [
      "Is my best score saved?",
      "Your best score is tracked for the current session and shown in the third stat card, updating whenever you win in fewer attempts than before. It resets when you reload the page — nothing is stored on a server or in your browser.",
    ],
  ],
};

export default seo;
