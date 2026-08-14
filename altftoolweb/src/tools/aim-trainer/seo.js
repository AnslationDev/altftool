const seo = {
  title: "Aim Trainer — 30-Second Timed and Precision Modes",
  metaDescription:
    "Click-accuracy drill with a 30-second Timed mode and a sudden-death Precision mode; tracks hits, accuracy % and average reaction time in ms.",
  steps: [
    "Pick Timed · 30 seconds or Precision on the Choose a mode panel (keys 1 and 2 also switch).",
    "Press Start — or Space — and click or tap the discs; shots on empty space count as misses, and in Precision one stray shot or three escaped targets ends the run.",
    "When the run ends, read your hits, accuracy as a % of shots fired and mean reaction ms on the results card; your best score per mode is saved on this device.",
  ],
  intro:
    "Aim Trainer is a click-accuracy drill with two modes: Timed gives you 30 seconds to pop as many targets as possible, and Precision spawns one target at a time that grows then shrinks away, ending the run on a single stray shot or three escaped targets. Every run reports hits, accuracy as a percentage of shots fired, and average reaction time in milliseconds, and your best score per mode is saved on the device. Targets are never smaller than 44 pixels, so it plays the same with a mouse or a thumb.",
  useCases: [
    "You want a 30-second warm-up before a match rather than spending your first two rounds finding your aim",
    "You changed mouse DPI or sensitivity and want a repeatable measurement to tell whether the new setting is actually better",
    "You want to know your real click reaction time in milliseconds instead of guessing from how fast a game feels",
  ],
  benefits: [
    [
      "Two modes that train different things",
      "Timed rewards raw speed over 30 seconds; Precision punishes a single misclick, so it trains restraint rather than spray.",
    ],
    [
      "Difficulty that ramps with your streak",
      "In Precision each target lives 45 ms less than the last, from 2,100 ms down to a 1,050 ms floor, so a long run gets genuinely harder.",
    ],
    [
      "Accuracy counted honestly",
      "Clicks on empty space count as shots, so the accuracy figure reflects everything you fired, not just the targets you happened to hit.",
    ],
  ],
  faqs: [
    [
      "How long is a round?",
      "Timed mode is a fixed 30 seconds. Precision mode has no clock — it runs until one stray shot lands on empty space or three targets escape before you hit them, so a good run can last far longer than 30 seconds.",
    ],
    [
      "What is a good average reaction time?",
      "The tool reports the mean milliseconds between a target appearing and your hit, which includes the time to move the pointer, so it runs well above pure reaction tests. Compare it against your own earlier runs on the same input device rather than against someone else's number — mouse, trackpad and touch give very different figures.",
    ],
    [
      "Does it work on a phone?",
      "Yes. Targets are clamped to a 44-pixel minimum diameter, the standard minimum touch target, and scale with the arena — 14% of arena width in Timed mode up to 80 pixels, and up to 20% or 112 pixels at full size in Precision.",
    ],
    [
      "Can I play with the keyboard?",
      "Partly. Space or Enter starts, pauses and restarts a run, 1 and 2 switch between Timed and Precision, and P pauses; hitting the targets themselves needs a pointer. Best scores are stored per mode on this device, so clearing site data resets them.",
    ],
  ],
};

export default seo;
