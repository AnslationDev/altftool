const seo = {
  title: "Basketball Heart Rate Zones and Shuttle Drill",
  metaDescription:
    "Five conditioning zones in bpm from age or measured max, the 85-90% live-play band, a shuttle planner with a bpm restart cue, and 1-minute recovery.",
  steps: [
    "Enter Age (years) and Resting heart rate (bpm), choose a Max heart rate formula and Zone method, or type a Measured max heart rate (bpm) to override the estimate.",
    "In Shuttle drill planner set Repetitions, Work per rep (seconds), Rest between reps (seconds) and the Restart cue (% of max heart rate), then log Peak heart rate at the end of the drill and Heart rate one minute later.",
    "Read the Live-play heart rate band, the Court conditioning zones table, Total block time and 'Start the next rep below' in bpm, plus the one-minute drop scored against the 12 bpm threshold, then press Copy result.",
  ],
  intro:
    "This calculator turns your age or a measured maximum heart rate into five basketball conditioning zones in beats per minute, from shooting-day recovery work up to suicides and 17s, and shows the live-play band of roughly 85–90% of maximum that match analysis reports for time on court. It also plans a shuttle block — repetitions, work and rest seconds, work-to-rest ratio and total time — with a heart-rate restart cue so the next rep begins when you have actually recovered, and scores your one-minute heart rate recovery against the 12 bpm threshold used in the cardiology literature.",
  useCases: [
    "Set the bpm target for a suicide block so players work at true repeated-sprint intensity rather than jogging through it.",
    "Decide how long the rest between shuttles needs to be by watching heart rate fall to a set number instead of guessing.",
    "Keep a shooting-focused recovery day genuinely easy after a heavy game weekend.",
    "Track one-minute heart rate recovery across a pre-season block as a simple conditioning marker.",
  ],
  benefits: [
    ["Court-specific bands", "Each zone names the basketball work that lands in it, from shell drill to full-court live play."],
    ["Heart-rate-guided rests", "The restart cue converts a percentage of maximum heart rate into a real bpm number to wait for."],
    ["Recovery score built in", "One-minute heart rate recovery is calculated and compared against the published abnormal threshold."],
  ],
  faqs: [
    [
      "What heart rate do basketball players hit in a game?",
      "Live play typically averages about 85–90% of maximum heart rate, with players spending most of their court time above 85%. For a 25-year-old with a Tanaka maximum of 191 bpm, that band is roughly 162–171 bpm.",
    ],
    [
      "How long should rest be between suicides?",
      "Long enough for heart rate to fall back to around 70% of maximum before the next repetition, which for most players is 45 to 90 seconds after a 30-second shuttle. Using a heart rate cue instead of a fixed clock keeps every rep at the intended quality as fatigue builds.",
    ],
    [
      "What is a good one-minute heart rate recovery?",
      "A fall of more than 12 beats per minute in the first minute after stopping is the normal response; 12 bpm or less was classed as abnormal in the Cleveland Clinic cohort that established the marker. Well-conditioned athletes often drop 25 to 40 beats. A single low reading is not a diagnosis — repeat it rested and raise it with a doctor if it persists.",
    ],
    [
      "Why does my monitor miss the hardest efforts on court?",
      "Heart rate takes 30 to 60 seconds to catch up with an effort, so a five-second closeout or a single fast break ends before the number moves. Use heart rate to judge overall session load and recovery between reps, and judge short bursts by output — shot quality, sprint times and how fast heart rate falls afterwards.",
    ],
  ],
};

export default seo;
