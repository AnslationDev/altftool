const seo = {
  intro:
    "The Video Publishing Time Planner converts a single upload moment into the local clock of every audience timezone you serve, then scores it against the prime and secondary viewing windows you define. It scans all 96 quarter-hour slots in a 24-hour day, weights each one by your share of viewers per region, and ranks the slots that land the most of your audience inside a good local window. Built for creators and social teams whose viewers sit in more than one country.",
  useCases: [
    "A channel based in India with 45% Indian, 25% US East Coast and 15% UK viewers testing whether 19:00 IST or 16:00 IST reaches more people.",
    "Deciding the scheduled-publish time for a launch video when the marketing team works UTC+1 but most buyers are in US Pacific.",
    "Checking how much reach you lose by shifting a weekly upload two hours later to fit an editor's turnaround.",
    "Setting a consistent slot for a podcast clip series so the same audience block sees every episode.",
  ],
  benefits: [
    ["Whole-day slot scan", "Every 15-minute slot is scored, so you see the runner-up times, not just one recommendation."],
    ["Your windows, not guesses", "Prime and secondary hours are inputs you set from your own analytics rather than baked-in assumptions."],
    ["Lead time built in", "A configurable head start models the gap between publishing and the moment viewers actually watch."],
  ],
  faqs: [
    [
      "What is the best time to publish a video?",
      "There is no universal answer — the best slot is whichever one puts the largest weighted share of your audience inside their own local viewing window. Enter your regional viewer split and the planner ranks all 96 quarter-hour slots for you; a common starting point is publishing about two hours before the local 18:00-22:00 evening block.",
    ],
    [
      "Why publish before peak instead of during it?",
      "Uploading ahead of the window gives the platform time to finish processing, generate captions and start surfacing the video, so it is already available the moment your audience opens the app. The default lead time here is 120 minutes, and you can set it anywhere from 0 to 720 minutes.",
    ],
    [
      "How do I handle an audience spread across many timezones?",
      "Add a row per region with its UTC offset and its share of your viewers, and let the planner normalise the shares. When two regions are roughly 12 hours apart no single slot can serve both well, so the ranked list helps you choose which segment to prioritise or whether to split into two uploads.",
    ],
    [
      "Does the planner account for daylight saving time?",
      "No — the timezone presets use standard-time UTC offsets, so during a daylight saving period you should pick the offset matching the audience's current clock (for example UTC-4 rather than UTC-5 for US Eastern in summer). Offsets from -12:00 to +14:00 are supported.",
    ],
  ],
};

export default seo;
