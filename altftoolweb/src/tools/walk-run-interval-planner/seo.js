const seo = {
  title: "Run-Walk Interval Calculator: Finish Time & True Pace",
  metaDescription:
    "Enter run and walk intervals, both paces and a distance to get cycle count, finish time, true average pace and what the walk breaks cost you.",
  steps: [
    "Set the \"Target distance (km)\" and pick a level preset under \"Where you are right now\", or type custom \"Run interval (seconds)\" and \"Walk interval (seconds)\".",
    "Enter your \"Running pace (per km)\" and \"Walking pace (per km)\" in minutes and seconds.",
    "Read the \"Estimated finish time\", the cycle sheet and the \"Walk breaks cost\" versus running straight through, then click \"Copy plan\".",
  ],
  intro:
    "The Walk Run Interval Planner takes a run-walk ratio, your running and walking paces and a target distance, and returns the exact number of cycles, the finish time and the true average pace. It works by computing the distance covered in one run interval plus one walk interval, dividing the target distance by that cycle, and timing the leftover stretch. Useful for anyone following a run-walk-run programme, coming back from injury, or using timed walk breaks in a long run.",
  useCases: [
    "Work out how long a 10 km run takes with a 3-minute run and 1-minute walk pattern at 6:00/km running pace.",
    "Compare a 30-second run with a 60-second walk against a 60:60 ratio while progressing through a couch-to-5K plan.",
    "See how much time walk breaks add to a half marathon before deciding whether to keep them on race day.",
    "Set the beeper intervals on a running watch for a long run that uses recovery walks from the start.",
  ],
  benefits: [
    ["Exact cycle maths", "Cycle distance, cycle count and the leftover partial cycle are all computed, so the totals reconcile to the target distance."],
    ["True average pace", "Shows the blended pace including walk breaks, which is what actually appears on a finish clock."],
    ["Cost of the breaks", "Compares the plan against running the same distance straight through so the trade-off is visible."],
  ],
  faqs: [
    [
      "What is the run-walk-run method?",
      "It is a training approach that inserts a planned walk break into a run at a fixed interval from the start, rather than walking only when tired. Jeff Galloway popularised it in the 1970s; the idea is that regular short breaks reduce accumulated fatigue and injury risk while still building endurance.",
    ],
    [
      "What run-walk ratio should a beginner start with?",
      "Around 30 seconds running to 60 seconds walking is a common starting point, moving to 60:60 and then 90:60 as fitness improves. Progress when the current ratio feels comfortable for the whole session, not by a fixed calendar.",
    ],
    [
      "Do walk breaks make me much slower?",
      "Less than most people expect. At a 6:00/km running pace and a 9:00/km walking pace, a 3-minute run with a 1-minute walk finishes 10 km in about 1:05:20 against 1:00:00 running throughout, so the breaks cost roughly 5 minutes over 10 km.",
    ],
    [
      "Can I use run-walk intervals in a race?",
      "Yes, and many marathon finishers do. Start the walk breaks from the first kilometre rather than waiting until you are tired, step to the right so you do not block other runners, and practise the exact ratio in training first. If you have a heart or joint condition, check the plan with a clinician.",
    ],
  ],
};

export default seo;
