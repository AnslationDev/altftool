const seo = {
  title: "Powerlifting Total Tracker: Meet vs Gym Total",
  metaDescription:
    "Log dated squat, bench and deadlift sessions to see your best single-day total vs the all-time gym total, lift-balance flags and bodyweight multiples.",
  steps: [
    "Press 'Add a session' and fill the Date, 'Bodyweight (kg)', 'Squat (kg)', 'Bench press (kg)' and 'Deadlift (kg)' fields for that day.",
    "Edit any field in place or press 'Remove' on a session; the log autosaves to this browser's local storage.",
    "Read 'Best single-day total' against the all-time gym total and their gap, the Strong point/Balanced/Lagging flags per lift, and press 'Copy result'.",
  ],
  intro:
    "A powerlifting total is the sum of your best squat, bench press and deadlift performed on the same day, which is the only version a federation records. This tracker logs dated sessions, keeps that single-day total separate from the all-time gym total built from bests set on different days, and shows the gap between them. It also breaks the latest session into lift shares against the typical raw split of roughly 35% squat, 25% bench and 40% deadlift, and converts every lift into a bodyweight multiple.",
  useCases: [
    "See whether your best squat, bench and deadlift were ever hit in the same session, and how much total that would be worth if they were.",
    "Spot a lagging bench when it accounts for well under a quarter of the total across several months.",
    "Track total progress in kilograms per month across a training block before choosing meet attempts.",
    "Check where your squat sits against a 2× bodyweight landmark at your current weight.",
  ],
  benefits: [
    ["Meet total kept honest", "Same-day totals are reported separately from all-time bests, so nothing is overstated."],
    ["Lift balance flags", "Each lift is compared with the typical raw share and marked strong, balanced or lagging."],
    ["Bodyweight multiples", "Every lift is expressed relative to the bodyweight recorded in that session."],
  ],
  faqs: [
    [
      "What counts as a powerlifting total?",
      "The best successful squat, bench press and deadlift from one competition or one session, added together. Bests set weeks apart cannot be combined into an official total, which is why this tracker reports the single-day figure and the all-time gym figure separately.",
    ],
    [
      "What is a normal squat, bench and deadlift ratio?",
      "Across raw meet results the total tends to split near 35% squat, 25% bench press and 40% deadlift. Individual variation is large — long-armed lifters usually deadlift a bigger share, and equipped lifting shifts the split towards the squat and bench.",
    ],
    [
      "What is a good powerlifting total?",
      "As an informal coaching benchmark, a total around 4.5 times bodyweight is intermediate and 6 times bodyweight is advanced for raw lifters. These are gym conventions, not federation classifications, and formulas such as DOTS or IPF GL points give a fairer comparison across weight classes.",
    ],
    [
      "Is my logged data uploaded anywhere?",
      "No. Sessions are stored in this browser's local storage on your own device. They survive a refresh, but they will not appear in another browser, on another device, or in a private window.",
    ],
  ],
};

export default seo;
