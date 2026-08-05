const seo = {
  intro:
    "The Online Timer is two instruments in one page: a countdown you can set to any duration up to 23 hours, 59 minutes and 59 seconds that plays an alert sound when it reaches zero, and a stopwatch that counts up in hundredths of a second with lap splits. Both work from wall-clock timestamps rather than counting interval ticks, so the elapsed time stays honest even if the tab throttles in the background. It is for anyone who needs a reliable countdown or a split-timing stopwatch without installing anything.",
  useCases: [
    "You have a 12-minute bake and a 4-minute steep running in your head at once, and you want the countdown to make the noise so you can stop watching the clock.",
    "You are timing laps at the track or intervals in a workout and want each split next to the running total, with the quickest and slowest rep marked.",
    "You are running a meeting where each person gets five minutes, and you need a countdown big enough to read from across the table and resettable in one click.",
  ],
  benefits: [
    ["Timestamp-based, not tick-counting", "Remaining and elapsed time are recomputed from Date.now() on every update, so a throttled or backgrounded tab does not quietly lose seconds."],
    ["Laps with split and cumulative time", "Each lap shows both its own split and the total elapsed, with the fastest split in green and the slowest in red once you have more than one."],
    ["Hundredth-second stopwatch resolution", "The stopwatch updates every 10 ms and displays hundredths, which is enough precision for sports splits and cooking-style timing alike."],
  ],
  faqs: [
    [
      "What is the longest countdown I can set?",
      "23 hours, 59 minutes and 59 seconds — the hours field caps at 23 and both minutes and seconds cap at 59. For anything longer you would need to chain two countdowns.",
    ],
    [
      "Does the timer keep running if I switch tabs?",
      "Yes, because both the countdown and the stopwatch compute time from a stored start timestamp rather than adding up interval ticks. Browsers throttle background timers, so the display may catch up in a jump when you return, but the reported time is still correct.",
    ],
    [
      "Will it make a sound when the countdown finishes?",
      "Yes, an alert tone plays the moment the remaining time hits zero. Some browsers block audio until you have interacted with the page, so pressing Start yourself normally satisfies that requirement — keep the tab's sound unmuted.",
    ],
    [
      "What is the difference between a lap split and the total?",
      "The split is the time since the previous lap; the total is the time since you started the stopwatch. Recording a lap shows both side by side, so you can compare rep to rep without doing subtraction yourself.",
    ],
  ],
  steps: [
    "Choose the Countdown Timer or Stopwatch tab. For a countdown, fill the Hours, Minutes and Seconds number fields — they clamp to 23, 59 and 59 — and press Set Time; an all-zero entry is ignored.",
    "Press Start to run the countdown. The same button becomes Pause while it is running, Reset returns it to zero, and an alert tone plays the moment the remaining time reaches zero.",
    "On the Stopwatch tab, Start and Stop drive a display that refreshes every 10 ms down to hundredths of a second. Lap is enabled only while it runs and adds a row to the #, Split, Total list, marking the fastest split green and the slowest red once there is more than one; Clear Laps empties the list and Reset clears the clock with it.",
  ],
};

export default seo;
