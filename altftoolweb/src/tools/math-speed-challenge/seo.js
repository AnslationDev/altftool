const seo = {
  intro:
    "Math Speed Challenge is a timed mental arithmetic drill that raises the size of the numbers automatically as your correct-answer streak grows, moving you from Beginner (numbers up to 20) through Intermediate, Advanced, Expert and Master to Legend (numbers up to 1000). You pick which of addition, subtraction, multiplication and division to practise and a 30, 60, 90 or 120 second round, then answer as many problems as you can. Each correct answer scores 10 points plus a speed bonus for answering inside 3 seconds and a streak bonus, so the tool rewards fluency rather than raw volume.",
  useCases: [
    "A student getting ready for a timed arithmetic section wants to know whether they can hold accuracy at two-digit sums under clock pressure, so they run repeated 60-second addition and subtraction rounds and watch where the streak breaks.",
    "A parent wants a child to move past times-table memorisation without jumping straight to hard numbers, so they select multiplication only and let the streak tiers introduce bigger factors once 5 correct answers in a row are reached.",
    "Someone preparing for an aptitude or banking exam wants a daily warm-up they can measure, so they run one 120-second all-four-operations round each morning and compare today's score against the saved top-10 list.",
    ],
  benefits: [
    ["Difficulty follows your streak", "Number ranges step up at 5, 15, 30, 50 and 80 consecutive correct answers instead of being fixed for the whole round."],
    ["Speed is scored, not just accuracy", "The bonus scales with how far under 3 seconds you answer, so a fast correct answer is worth more than a slow one."],
    ["Division always comes out whole", "Problems are built by multiplying the divisor and quotient first, so you never get a ragged decimal answer."],
  ],
  faqs: [
    [
      "How does the difficulty increase?",
      "It increases with your current streak of correct answers, in six tiers: Beginner from the start with numbers up to 20, Intermediate at 5 in a row (up to 50), Advanced at 15 (up to 100), Expert at 30 (up to 200), Master at 50 (up to 500) and Legend at 80 (up to 1000). A wrong answer drops your streak, so the numbers get easier again until you rebuild it.",
    ],
    [
      "How is the score calculated?",
      "Each correct answer is worth 10 points, plus a speed bonus of (3 − your answer time in seconds) × 10 rounded, plus a streak bonus of 2 points per consecutive correct answer capped at 50. Wrong answers score zero, so an instant answer on a long streak can be worth well over 100 points while a slow one is worth only the base 10.",
    ],
    [
      "Can I practise just one operation?",
      "Yes — select any combination of addition, subtraction, multiplication and division before starting, and only those appear. At least one must be selected for the round to begin.",
    ],
    [
      "Are my scores saved anywhere?",
      "Your best 10 rounds are stored in your own browser's local storage, with score, streak, time limit and operations used. Nothing is uploaded, and clearing your browser data or using a different device or private window will show an empty leaderboard.",
    ],
  ],
};

export default seo;
