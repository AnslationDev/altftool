const seo = {
  title: "Multitasking Test: Math & Alert Dual Task",
  metaDescription:
    "Solve four-option sums while hitting the spacebar within 1.5s of every red flash. 60 seconds, minus 0.5 per error, then a score and grade.",
  steps: [
    "Read 'How to Play': 'Task 1: Math Engine' is solving the equations, 'Task 2: Danger Alert' is pressing SPACEBAR when the screen flashes RED.",
    "Press 'Start Test (60s)' and keep answering four-option sums while hitting the spacebar or the Alert button within 1.5 seconds of each flash.",
    "Read 'Total Score' with its grade plus correct answers, mistakes, missed alerts and 'False Alarms'; 'Try Again' restarts the minute.",
  ],
  intro:
    "The Multitasking Ability Test runs a 60-second dual-task challenge: you answer four-option addition and subtraction problems continuously while the screen flashes red at random intervals and you have 1.5 seconds to hit the spacebar each time. It scores the two streams separately, deducting half a point for a wrong sum, a missed alert or a spacebar press when no alert was showing, then adds them into one score with a grade band. It is a quick, informal way to see how much your arithmetic slows down once something else is competing for your attention.",
  useCases: [
    "You suspect you are slower than you think when switching between a spreadsheet and a chat window, and want a measurable version of that feeling in one minute.",
    "You want to see the cost of divided attention for yourself before deciding whether to silence notifications during focused work.",
    "A group of colleagues wants a fair, identical 60-second challenge to compare scores on during a break.",
  ],
  benefits: [
    [
      "Two genuinely concurrent tasks",
      "The alert fires on its own schedule regardless of where you are in a sum, so the test measures interruption handling rather than turn-taking.",
    ],
    [
      "Errors cost you, guessing does not pay",
      "Wrong answers, missed alerts and false alarms each subtract 0.5, so rapid random tapping scores worse than careful answering.",
    ],
    [
      "Both failure modes are counted separately",
      "Missed alerts and false alarms are reported apart from each other, which distinguishes someone who tunes the alert out from someone who is jumpy.",
    ],
  ],
  faqs: [
    [
      "How long is the test and what do I have to do?",
      "60 seconds. You keep answering arithmetic problems from four options while watching for the screen to flash red; when it does, press the spacebar or the alert button before the flash ends 1.5 seconds later.",
    ],
    [
      "How is the score calculated?",
      "Math score is correct answers minus 0.5 per wrong answer; alert score is correct reactions minus 0.5 per missed alert and 0.5 per false alarm. Neither can go below zero, and the two are added and rounded to give the final score.",
    ],
    [
      "What is a good score?",
      "Above 35 is graded Elite Multitasker, above 25 Excellent, above 15 Good, and anything at or below 15 shows as Needs Practice. Alerts appear at random gaps of 3 to 8 seconds, so the number of alert opportunities varies slightly between runs.",
    ],
    [
      "Does this diagnose ADHD or an attention problem?",
      "No. This is an informal browser game, not a validated cognitive assessment, and a single 60-second run is affected by tiredness, screen size, keyboard latency and practice. If attention difficulties are affecting your daily life, speak to a qualified clinician.",
    ],
  ],
};

export default seo;
