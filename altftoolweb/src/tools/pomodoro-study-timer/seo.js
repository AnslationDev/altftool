const seo = {
  intro:
    "The Pomodoro Study Timer runs the classic focus cycle — a 25-minute work block, a 5-minute short break and a 15-minute long break after four blocks — with a countdown ring, a completed-session counter and durations you can override from 1 to 120 minutes. Each finished focus block adds to the session tally, so a study afternoon leaves a visible count rather than a vague sense of how much you did. It is aimed at students and anyone doing deep work who wants structure on a single task at a time.",
  useCases: [
    "You are revising a dense chapter and keep drifting to your phone, so you commit to one 25-minute block on that chapter and nothing else.",
    "You are writing something you have been avoiding and need a small, bounded start — one block, then a 5-minute break, decide again after that.",
    "Your attention fades before the standard block ends, so you shorten focus to 15 minutes and lengthen the short break to 7 to find a rhythm you can actually keep.",
  ],
  benefits: [
    [
      "All three intervals are editable",
      "Focus, short break and long break each take any value from 1 to 120 minutes, so the technique bends to your attention span instead of the other way round.",
    ],
    [
      "Counts only completed focus blocks",
      "The session tally increases when a focus timer reaches zero, not when you start one, so the number reflects work finished rather than work intended.",
    ],
    [
      "Progress you can read at a glance",
      "The ring drains as the block runs and a percentage sits beside the count, which is enough to check from across a desk without breaking concentration.",
    ],
  ],
  faqs: [
    [
      "How long is a standard Pomodoro?",
      "25 minutes of focus followed by a 5-minute break, with a longer 15-minute break after four completed blocks. Those are the defaults here, and the four-block cycle is why the long break exists — it is the recovery point, not a bonus.",
    ],
    [
      "Does it move to the break automatically?",
      "No, you choose the next interval yourself. When a block hits zero the timer stops and the counter updates; tap Short Break or Long Break, or use the skip control to jump straight between focus and short break.",
    ],
    [
      "What durations can I set?",
      "Any whole number of minutes from 1 to 120 for each of the three modes. A common variation is a 50-minute focus block with a 10-minute break for work that needs longer to get into.",
    ],
    [
      "Do my settings and session count survive a page reload?",
      "No. The custom durations and the session tally live in the page while it is open, so reloading or closing the tab resets both to the 25/5/15 defaults and zero sessions.",
    ],
  ],
};

export default seo;
