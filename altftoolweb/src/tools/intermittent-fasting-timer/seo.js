const seo = {
  title: "Intermittent Fasting Timer: 16:8, 18:6, OMAD Phases",
  metaDescription:
    "Track a 16:8, 18:6, 20:4 or OMAD fast live, see which metabolic phase your elapsed hours reach, and log every fast with a target-hit streak.",
  steps: [
    "Pick a protocol tile — 14:10, 16:8, 18:6, 20:4, OMAD 23:1, 5:2 or Custom with its 1-36 hour slider — then set 'Eating window starts at'.",
    "Press 'Start fast now' (or the 'Started at <window close>' button), and correct the moment in the 'Fast actually started at' field if you began earlier.",
    "Watch Hours fasted, Hours remaining and the named metabolic phase update live, then press 'End fast & log it' to add the fast to Fast history and extend the Streak.",
  ],
  intro:
    "Intermittent Fasting Timer counts your fasting window live against a chosen protocol — 14:10, 16:8, 18:6, 20:4, OMAD 23:1, 5:2 or a custom target from 1 to 36 hours — and shows which metabolic phase the elapsed hours put you in, from the fed state through glycogen depletion at 4 to 12 hours, the fat-burning switch at 12, rising ketosis and autophagy from 16, and deep autophagy past 24. Every completed fast is logged with its achieved hours and target completion, and a streak counts consecutive days where a logged fast reached its target. Phase timings are population averages, not a reading of your own metabolism.",
  useCases: [
    "You started 16:8 last week and keep losing track of whether the clock began at your last bite or when you went to bed — start the timer at the real last meal and it holds the window across page reloads.",
    "The 11 a.m. hunger wave hits and you want to know whether it means anything: the glycogen phase explains that waves in these hours follow your old meal schedule and usually pass in about 20 minutes.",
    "You are stepping up from 16:8 to 18:6 and want proof it is sticking — the log's average hours, best fast and target hit rate across your last 30 fasts show whether the change actually happened.",
  ],
  benefits: [
    ["Tells you where you are, not just how long", "The elapsed hours map to a named metabolic phase with what is happening in it, so 14 hours and 19 hours stop looking like the same result."],
    ["Settles the coffee question", "Separate lists cover what keeps a fast — water, black coffee under 5 kcal, plain tea, unsweetened electrolytes — and what ends it, including BCAAs and a splash of milk."],
    ["Streak counts targets met, not days opened", "A day only extends the streak if the logged fast actually reached its target, so the number cannot be padded by short fasts."],
  ],
  faqs: [
    [
      "What is 16:8 intermittent fasting?",
      "Sixteen hours without food followed by an eight-hour eating window, most commonly eating from noon to 8 p.m. and skipping breakfast. It is the best-studied of the daily windows and long enough to reach the fat-burning switch on most days.",
    ],
    [
      "How many hours of fasting before autophagy starts?",
      "Autophagy signalling picks up around the 18-hour mark and is strongest past 24 hours, which is why 18:6 is the usual step up from 16:8. Most of the direct evidence comes from animal and cell studies, so treat the timing as an approximation rather than a switch that flips at a fixed hour.",
    ],
    [
      "Does coffee break a fast?",
      "Black coffee does not — it runs under about 5 kcal a cup. Milk, cream, oat milk, sugar or honey do break it, and so do BCAA and protein drinks, because leucine triggers insulin and mTOR, which is exactly what shuts autophagy down.",
    ],
    [
      "Who should not try intermittent fasting?",
      "Anyone pregnant or breastfeeding, anyone with type 1 diabetes or taking insulin or sulfonylureas, anyone with a history of disordered eating, anyone under 18 or underweight, and anyone on medication that must be taken with food. This tool is informational only — talk to your doctor before starting, and especially before any fast beyond 24 hours.",
    ],
  ],
};

export default seo;
