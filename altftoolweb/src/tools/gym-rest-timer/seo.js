const seo = {
  title: "Gym Rest Timer: Auto-Advancing Per-Exercise Rests",
  metaDescription:
    "Give every exercise its own rest countdown — presets from 2-5 min strength to 30 s endurance — and the timer chains work and rest through the session.",
  steps: [
    "Build the session: set each exercise's name, Sets and 'Rest between sets (seconds)' or tap a preset from 'Power / max strength' (2–5 min) to 'Muscular endurance' (≤ 30 s), and press 'Add an exercise' for more.",
    "Press Start — the countdown runs each working set and rest in turn with a sound cue at every change, and Skip jumps to the next interval.",
    "Watch the 'Sets completed' and 'Time left in the session' rows, then press 'Copy result' for the session plan or Restart to run it again.",
  ],
  intro:
    "This rest timer holds a different countdown for each exercise in a session and advances through work and rest intervals automatically, so you are not resetting a stopwatch between every set. The preset rests follow standard resistance-training guidance — roughly 2–5 minutes for maximal strength and power work, 30–90 seconds for hypertrophy, and 30 seconds or less for muscular endurance. It also shows how long the whole session will take and how that time splits between working and resting.",
  useCases: [
    "Hold a true three-minute rest on heavy squats instead of the ninety seconds impatience usually produces.",
    "Run a session where the main lift rests three minutes and the accessories rest sixty, without switching apps.",
    "Estimate whether a five-exercise session fits into the forty-five minutes you have before the gym closes.",
    "Keep a circuit moving on thirty-second rests where counting in your head always drifts.",
  ],
  benefits: [
    ["Rest per exercise", "Each movement carries its own interval instead of one global timer for the session."],
    ["Auto-advance", "Work and rest intervals chain together so you only touch the screen to start or skip."],
    ["Session length up front", "Total time, working time and resting time are shown before you begin."],
  ],
  faqs: [
    [
      "How long should I rest between sets?",
      "For maximal strength and power work at or above about 85% of 1RM, 2–5 minutes lets force output recover. Hypertrophy work at 6–12 reps typically uses 30–90 seconds, and muscular-endurance or circuit work uses 30 seconds or less.",
    ],
    [
      "Does resting longer make you stronger?",
      "For heavy, low-rep work, yes — longer rest restores phosphocreatine and lets you repeat the load, which is what drives strength adaptation. For hypertrophy the evidence is more mixed, though rests under about a minute often cut the volume you can complete, which works against you.",
    ],
    [
      "Should rest be the same for every exercise?",
      "No. Large compound lifts loaded heavily need the longest rests; single-joint accessories and machine work recover much faster. That is why this timer stores a rest interval per exercise rather than one setting for the whole session.",
    ],
    [
      "Will the timer keep running if I lock my phone?",
      "It keeps counting while the tab is open, but background tabs and locked screens throttle timers in most mobile browsers, so the countdown and the audio cue may drift or pause. Keep the page in the foreground for reliable intervals.",
    ],
  ],
};

export default seo;
