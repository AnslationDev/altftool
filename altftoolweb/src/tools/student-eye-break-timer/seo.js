const seo = {
  intro:
    "This planner merges two schedules that do not naturally line up: the Pomodoro Technique's 25 minute study block with a break after each one, and the 20-20-20 eye rule, which asks for a look into the distance after at most 20 minutes of near work. Because a 25 minute block overshoots the eye rule by five minutes, it schedules a 20 second glance at the 20 minute mark inside the block — you look up, you do not stop studying. It then lays the whole revision session out on the clock so you know the finish time before you start.",
  useCases: [
    "Plan an eight-pomodoro revision afternoon and see that it ends at 13:05, not 'sometime this afternoon'.",
    "Find out that a 50 minute deep-work block needs two mid-block glances, not one.",
    "Switch to a 20 minute block so the break itself satisfies the eye rule and no mid-block glance is needed at all.",
    "Set up a late evening session and check whether it runs past midnight before you commit to it.",
  ],
  benefits: [
    ["Both rules at once", "Keeps the pomodoro rhythm intact while still respecting the 20 minute near-work limit."],
    ["Real clock times", "Every block gets a start and end time, and the session gets a finish time."],
    ["Glances, not interruptions", "The mid-block eye rest lasts 20 seconds and does not pause the study timer."],
  ],
  faqs: [
    [
      "How long should a study session be before a break?",
      "The Pomodoro Technique uses 25 minutes of focus followed by a short break of about five minutes, with a longer 15 to 30 minute break after every four blocks. For your eyes the ceiling is tighter: no more than 20 minutes of continuous near work before looking into the distance.",
    ],
    [
      "Does the pomodoro technique break the 20-20-20 rule?",
      "Slightly, yes. A 25 minute block is five minutes longer than the eye rule allows, which is why a 20 second glance at the 20 minute mark is worth adding. If you would rather not interrupt the block, a 20 minute pomodoro with a five minute break satisfies both rules exactly.",
    ],
    [
      "How many hours can you study in a day?",
      "There is no single number, and the honest answer is that total hours matter less than how the hours are broken up. What this tool can tell you is the arithmetic: eight 25 minute blocks with their breaks fill just over four hours, of which about 82% is actual study time.",
    ],
    [
      "Why do my eyes hurt after studying?",
      "Usually a combination of sustained focus at reading distance and a blink rate that falls by roughly half during concentrated work, leaving the eye surface dry. Breaks, distance and room lighting help. If headaches or blurred vision keep recurring, get an eye test — an uncorrected or outdated prescription is a common and fixable cause, and this tool is not a substitute for that examination.",
    ],
  ],
};

export default seo;
