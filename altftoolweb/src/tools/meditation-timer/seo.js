const seo = {
  title: "Meditation Timer With Interval Bells and Streaks",
  metaDescription:
    "Sit 5 to 60 minutes with a settle-in delay, bells every N minutes or at marks you list, and Web Audio bell tones. Session log stays in your browser.",
  steps: [
    "Pick a Duration of 5 to 60 minutes or Custom up to 180, and set the Settle-in delay slider between 10 and 30 seconds.",
    "Under Interval bells choose None, Every or Custom — Every rings from 1 to 15 minutes, Custom takes minute marks typed as 5, 10, 18.",
    "Press Begin sitting, use Hide clock if you would rather not watch a countdown, and the finished sit adds to Sessions, Total minutes and Current streak.",
  ],
  intro:
    "This meditation timer runs a silent sitting of 5 to 60 minutes (or any custom length) with a preparation countdown, an optional opening bell, interval bells placed either every N minutes or at exact minute marks you list, and a closing bell. The bells are synthesised in the browser from stacked inharmonic partials — a singing bowl, a temple bell and a soft chime — rather than loaded as audio files, so nothing buffers mid-sit. Finished sessions go into a private log that tracks total minutes, average length, current streak and longest streak.",
  useCases: [
    "You are doing a body scan and want the pace set for you, so you place bells every 5 minutes and let each chime move your attention to the next region.",
    "You keep opening your eyes to check how long is left, so you hide the clock entirely and sit until the closing bell rather than watching a countdown.",
    "You are trying to build a daily habit and want to see, honestly, whether you sat yesterday — the streak counter and session log answer that without an account or a subscription.",
  ],
  benefits: [
    ["Bells go exactly where you want them", "Choose no interval bells, a bell every N minutes, or a custom list of marks such as 5, 10 for irregular pacing."],
    ["Bells that decay like real metal", "Each timbre is built from partials at non-integer ratios with their own decay times, so the tone rings out instead of cutting off like a beep."],
    ["Keeps the screen from sleeping", "It requests a screen wake lock while you sit, so the phone does not lock and mute the closing bell part-way through."],
  ],
  faqs: [
    [
      "How long should I meditate for?",
      "There is no single right length; this timer offers 5, 10, 15, 20, 30, 45 and 60 minute presets plus any custom duration, and most people starting out settle around 10 minutes. Consistency matters more than length — a 10-minute sit you actually do every day beats an hour you skip.",
    ],
    [
      "Can I get a bell partway through the session?",
      "Yes, in two ways: a bell at a fixed interval such as every 5 minutes, or bells at specific minute marks you type in as a list. There is also a separate opening bell and a preparation countdown, which defaults to 15 seconds, so you can settle before timing starts.",
    ],
    [
      "Do the bell sounds need to download?",
      "No. All three timbres are generated live with the Web Audio API from a stack of partials — the singing bowl is built around a 210 Hz fundamental, the temple bell around 300 Hz and the soft chime around 523 Hz — so there are no audio files to load and no gap before the first bell rings.",
    ],
    [
      "Is my session history private?",
      "Yes. Your most recent 200 sessions, along with duration, technique and any mood you tag, are kept in your browser's local storage and never uploaded. That also means the log and streaks are per-device, and clearing site data will reset them.",
    ],
  ],
};

export default seo;
