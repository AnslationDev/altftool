const seo = {
  title: "Running Shoe Mileage Tracker with 500-800 km",
  metaDescription:
    "Log kilometres per pair against its rated midsole life, get a warning at 80% used, and see a projected retirement date from your weekly volume.",
  steps: [
    "For each pair, set 'Shoe type' (Daily trainer 640 km, Carbon-plated racer 320 km and more), 'Kilometres logged', 'Rated life (km)' and 'First run in them'; press 'Add another pair' to build a rotation.",
    "After each run, tap +5 km, +10 km, +21 km or +42 km on that pair — the progress bar and status badge update, warning once 80% of rated life is used.",
    "Read 'Left before retirement' and the 'Projected retirement' date per pair, then press 'Copy result' for a text summary; the rotation is saved in this browser's local storage.",
  ],
  intro:
    "This tracker keeps a running total of kilometres on each pair of shoes and compares it with that shoe's rated midsole life, so you replace a pair on evidence rather than on a hunch. Defaults follow the long-standing 500–800 km (roughly 300–500 mile) guidance, with shorter figures for carbon-plated racers and longer ones for max-cushion trainers, and every figure is editable. It also projects a retirement date from your own weekly volume since the first run in that pair.",
  useCases: [
    "Run a two-shoe rotation and see at a glance which pair is closest to its 640 km limit before a long-run weekend.",
    "Protect a carbon-plated race shoe by tracking it separately at a 320 km rated life instead of lumping it in with daily mileage.",
    "Work out roughly when a pair will be retired so you can buy the replacement while the model is still in stock.",
    "Check whether unexplained shin or knee soreness lines up with a pair that has quietly gone past 80% of its life.",
  ],
  benefits: [
    ["Per-pair rated life", "Racers, trainers and trail shoes each get their own limit rather than one blanket number."],
    ["Early warning at 80%", "The alert fires with roughly 20% of the midsole left, enough time to break in the next pair."],
    ["Retirement date projection", "Weekly volume since the first run turns remaining kilometres into a calendar date."],
  ],
  faqs: [
    [
      "How many kilometres should running shoes last?",
      "The common guidance is 500–800 km, or roughly 300–500 miles, for a daily trainer. Lightweight and carbon-plated racing shoes are usually rated lower — often around 320 km (200 miles) — while max-cushion trainers can reach the top of the band.",
    ],
    [
      "How do I know when to replace my running shoes?",
      "Watch the mileage total first, then check three physical signs: midsole creasing that no longer springs back, outsole rubber worn through to the foam, and a change in how the shoe feels on a familiar route. New aches in the shins, knees or feet on unchanged training are another common cue.",
    ],
    [
      "Does rotating two pairs make shoes last longer?",
      "Yes in practice. Midsole foam recovers its thickness and rebound over the day or two after a run, so alternating pairs gives each one time to decompress, and it also varies the loading on your legs. Two pairs typically cover more total kilometres than the same two pairs used one at a time.",
    ],
    [
      "Is the mileage total saved if I close the tab?",
      "Yes. The rotation is stored in this browser's local storage on your own device and is never uploaded, so it survives a refresh but will not follow you to another browser, another device, or a private window.",
    ],
  ],
};

export default seo;
