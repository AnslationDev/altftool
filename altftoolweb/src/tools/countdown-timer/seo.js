const seo = {
  title: "Countdown Timer: Multiple Named Timers & Presets",
  metaDescription:
    "Run several named countdowns at once, up to 99:59:59, with 1-60 minute presets, a triple beep at zero, and timers saved across a page reload.",
  intro:
    "This is a multi-timer countdown that runs any number of named timers at once, each with its own progress ring, and keeps accurate time in background tabs because it counts down to an absolute end timestamp rather than by ticking. Durations run from one second up to 99 hours 59 minutes 59 seconds, with one-tap presets at 1, 3, 5, 10, 15, 30 and 60 minutes, and every timer is saved to local storage so a reload or accidental tab close does not lose it. When a timer ends it plays a triple 880 Hz beep and flashes \"Time's up!\" in the browser tab title.",
  useCases: [
    "Cooking a meal where the rice, the roast and the sauce all need separate timers running side by side, each labelled so you know which alarm just went off",
    "Running a timeboxed meeting or standup in another tab and needing the timer to still be right when you switch back",
    "Working in 25-minute focus blocks with a 5-minute break, keeping both as named timers you reset rather than retyping the duration each round",
  ],
  benefits: [
    ["Correct in background tabs", "Each running timer stores its end time, so browser throttling of inactive tabs cannot make it drift or stall."],
    ["Many named timers at once", "Every timer has its own label, ring and controls, so overlapping countdowns never get confused for one another."],
    ["Survives a reload", "Timers persist in local storage, and one that expired while the page was closed comes back already marked done."],
  ],
  faqs: [
    [
      "Will the timer keep running if I switch to another tab?",
      "Yes. It counts down to a fixed end timestamp instead of decrementing a counter, so even when the browser throttles the inactive tab's timers the remaining time is recalculated correctly the moment you return, and an expired timer is marked done.",
    ],
    [
      "What is the longest countdown I can set?",
      "99 hours, 59 minutes and 59 seconds — just over four days. Hours accept 0-99 and minutes and seconds accept 0-59, and presets are available at 1, 3, 5, 10, 15, 30 and 60 minutes.",
    ],
    [
      "What happens when a timer reaches zero?",
      "It plays three short 880 Hz beeps through the Web Audio API and the browser tab title flashes \"Time's up!\" once a second until you acknowledge the timer. Your device must not be muted, and the sound only works after you have interacted with the page, since browsers block audio until then.",
    ],
    [
      "Are my timers saved if I close the tab?",
      "Yes, in your browser's local storage under a single key — nothing is sent to a server. Reopening the page restores every timer with its name and duration; anything that was running and has since passed its end time reappears in the done state. Clearing site data or using a private window will lose them.",
    ],
  ],
};

export default seo;
