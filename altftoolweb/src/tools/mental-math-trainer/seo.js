const seo = {
  title: "Mental Math Trainer: Timed Drills, 13 Question",
  metaDescription:
    "Drill addition to ratios across five difficulty bands, in Practice, Timed, Daily, Survival, Speed or Endless mode, then export a per-question CSV.",
  steps: [
    "Pick a Game Mode — Practice, Timed Challenge, Daily Challenge, Survival Mode, Speed Mode or Endless Mode.",
    "Choose a Question Type from Addition through Ratios and Average, set the Difficulty Level from Beginner to Expert, then press Start Training.",
    "Answer the set, then read per-topic accuracy and average time per question and use Export CSV or Export Report.",
  ],
  intro:
    "The Mental Math Trainer generates arithmetic drills on demand across 13 question types — addition, subtraction, multiplication, division, mixed operations, squares, square roots, cubes, percentages, fractions, decimals, ratios and averages — at five difficulty bands from single digits up to five-digit numbers. Six modes cover practice, a fixed-time challenge, a date-seeded daily set, survival on three lives, a 15-second-per-question speed run and endless play. Students and anyone doing arithmetic under pressure get per-topic accuracy, average time per question and a CSV report of every answer.",
  useCases: [
    "You are two weeks from an aptitude or competitive exam and need timed percentage and ratio drills to get your per-question time down, not another worksheet you can grind slowly.",
    "You freeze when splitting a restaurant bill or checking a discount at the till, so you drill percentages at easy difficulty until 15% of 240 comes without a phone.",
    "Your child is learning times tables and you want multiplication questions capped at 2-12 in practice mode with no clock, then the same set again once they are confident.",
  ],
  benefits: [
    ["Difficulty is a number range, not a label", "Each band sets explicit operand ranges — beginner uses 1-9, expert goes up to five digits — so \"hard\" means the same thing every session."],
    ["It tells you what you are bad at", "Per-topic accuracy flags any question type under 70% as a weak area and anything at 80% or above as strong, from the same run."],
    ["Modes that change how you think", "Speed mode's 15-second cap forces estimation, survival's three lives punishes carelessness, and practice mode removes the clock entirely."],
  ],
  faqs: [
    [
      "How is the score calculated?",
      "Score is correct answers times 10, multiplied by a difficulty factor, plus a streak bonus. The multipliers are 1x beginner, 1.5x easy, 2x medium, 3x hard and 5x expert, and the streak bonus counts up to 10 consecutive correct answers, so a clean run at expert is worth far more than the same count at beginner.",
    ],
    [
      "What is the daily challenge?",
      "A fixed 20-question set seeded from today's date, so everyone who takes it gets the exact same questions on the same day — useful for comparing your score against a friend or classmate taking it today. Nothing is saved between visits (this trainer keeps no data at all — see the note at the bottom of the page), so there is no built-in history to compare across your own past days. It ramps in difficulty: the first 5 questions are easy, the next 7 medium and the last 8 hard, drawn from addition, subtraction, multiplication, division, squares and percentages.",
    ],
    [
      "How long do I get per question in speed mode?",
      "15 seconds. When the timer hits zero the question is marked wrong and the trainer moves on, which is what makes speed mode a different skill from timed mode, where a single clock of 30 seconds to 5 minutes covers the whole set.",
    ],
    [
      "Are decimal and fraction answers marked exactly?",
      "No, they are checked against a small tolerance so rounding does not cost you a correct answer. Percentage and decimal results are rounded to two decimal places when generated, and fraction questions display the simplified result alongside your input.",
    ],
  ],
};

export default seo;
