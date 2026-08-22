const seo = {
  title: "Workout Prompt Builder: Sets, Split, Session Time",
  metaDescription:
    "Turns your days, level and goal into a training prompt with 10-20 hard sets per muscle a week, the matching split, rep bands and a session time check.",
  steps: [
    "Enter Training days a week and Minutes per session, then choose your Experience and Primary goal and the plan length in weeks.",
    "Toggle the Muscle groups to train and Equipment you actually have chips, and list injuries or limitations and exercises to avoid, one per line.",
    "Read Working sets a week with the split name and the Sets per session table, then press Copy prompt to take the generated prompt away.",
  ],
  intro:
    "The Workout Prompt Builder turns your available days, experience level and goal into a training prompt with the volume already worked out. It sets weekly hard sets per muscle group inside the 10-20 set range that the training-volume dose-response literature supports, picks the conventional split for your number of days, applies the standard rep and load band for your goal, and then estimates how long the session will actually take at those rest intervals. If the volume does not fit your time slot, it says so and tells the prompt to resolve it rather than quietly producing a two-hour workout.",
  useCases: [
    "Find out whether four 60-minute sessions can really hold the volume you were planning at 90-second rests.",
    "Get a push/pull/legs plan that only uses the dumbbells, bench and pull-up bar you actually own.",
    "Set a strength goal and see the rep range, load percentage and three-minute rests that implies.",
    "Build a beginner plan at the bottom of the effective volume range instead of copying an advanced programme.",
  ],
  benefits: [
    [
      "Volume you can defend",
      "Sets per muscle per week sit in the 10-20 range, scaled to your training age.",
    ],
    [
      "Time reality check",
      "Session length is estimated from sets × (time under tension + rest), and flagged when it overflows.",
    ],
    [
      "Equipment is a hard constraint",
      "The prompt forbids substituting in a machine you did not list.",
    ],
  ],
  faqs: [
    [
      "How many sets per muscle group per week should I do?",
      "Roughly 10 to 20 hard sets per muscle group per week. Meta-analyses of training volume find gains rising across that range and flattening beyond it for most people. This tool uses 10 sets for beginners, 14 for intermediates and 18 for advanced lifters, spread over your training days.",
    ],
    [
      "What workout split should I use for 3, 4 or 5 days a week?",
      "One to three days works best as full-body sessions: a single day trains each muscle once a week, while two or three days repeat that same full-body session two or three times, so each muscle group gets hit that many times instead. Four days is normally upper/lower twice. Five is upper/lower plus push/pull/legs, and six is push/pull/legs twice. From four days up, the common thread is training each muscle group about twice a week rather than once.",
    ],
    [
      "How many reps should I do for strength versus muscle size?",
      "For maximal strength, 3 to 6 reps at 80 to 90% of your one-rep max with about three minutes of rest. For muscle size, 6 to 12 reps at roughly 67 to 80% with about 90 seconds. For muscular endurance, 12 to 20 reps at 50 to 67% with short rests. Those bands come from the standard NSCA and ACSM loading recommendations.",
    ],
    [
      "How long should a weights session take?",
      "Multiply your working sets by the time each one occupies — roughly the reps times three seconds, plus the rest interval — and add a warm-up and cool-down. Twenty-one sets of hypertrophy work at 90-second rests is about 41 minutes of work, so around 54 minutes in total. This tool does that calculation and warns you when the planned volume will not fit.",
    ],
  ],
};

export default seo;
