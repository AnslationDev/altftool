const seo = {
  title: "Online Stopwatch With Laps, Splits and Shortcuts",
  metaDescription:
    "Times to a hundredth of a second on the browser's monotonic clock. Space starts, L laps, R resets; every lap shows split, total and delta vs the last.",
  steps: [
    "Press Start (or the Space key) to begin — the display counts in hundredths of a second and the status line under it reads Running, Paused or Ready.",
    "Press Lap (or L) at each split: the Lap times table records Lap, Lap time, Total and Δ prev, and the tiles above show Laps recorded, Fastest lap and Average lap. Reset (or R) clears the clock and the lap list.",
    "Copy puts the lap report on the clipboard, and Download saves the same report as stopwatch-laps.txt.",
  ],
  intro:
    "This online stopwatch times to hundredths of a second using the browser's monotonic performance clock, so the elapsed figure is measured from a high-resolution timestamp rather than counted up by a ticking interval that can drift. Space starts and pauses, L records a lap and R resets, and every lap is listed with its own split, the running total and the gap against the previous lap, plus fastest, slowest and average once you have two. The elapsed time also appears in the browser tab title, so it stays readable while you work in another window.",
  useCases: [
    "You are running interval training on a track and want each lap's split recorded without touching the screen — one key press per lap, and the fastest and slowest called out at the end.",
    "You need to know how long a build, a render or a database migration actually takes, and you want the number written down rather than guessed from memory.",
    "You are timing rounds of a presentation rehearsal and want to compare each run-through against the last, so the delta column matters more than the total.",
  ],
  benefits: [
    ["Measured, not counted", "Elapsed time comes from performance.now(), a monotonic high-resolution clock, so it does not drift with animation frames and is unaffected by system clock adjustments mid-session."],
    ["Laps that compare themselves", "Each lap shows the delta against the previous one and the table flags the fastest and slowest, which is the comparison you actually want from a split list."],
    ["Keyboard-first and background-readable", "Space, L and R cover the whole workflow without hunting for a button, and the running time is mirrored into the tab title so you can see it from another window."],
  ],
  faqs: [
    [
      "How accurate is an online stopwatch?",
      "The timing itself is accurate to well under a hundredth of a second because it is derived from the browser's high-resolution monotonic clock, not from a repeating timer. The real limit is human reaction time on the start and stop press, typically 150 to 250 milliseconds, which is far larger than any error the stopwatch introduces.",
    ],
    [
      "What are the keyboard shortcuts?",
      "Space starts and pauses, L records a lap and R resets everything including the lap list. Shortcuts are ignored while you are focused on an input, a button or a link, so they will not fire by accident when you are typing elsewhere on the page.",
    ],
    [
      "What is the difference between lap time and total time?",
      "Lap time is the interval since your previous lap press; total time is the elapsed time since you started. Both are recorded for every lap, along with the difference between that lap and the one before it, so you can see whether you are speeding up or slowing down without doing the subtraction.",
    ],
    [
      "Does the stopwatch keep running if I switch tabs?",
      "Yes — the elapsed time is calculated from timestamps rather than accumulated frame by frame, so it stays correct even when the browser throttles a background tab and the display catches up when you return. The tab title shows the running time to the second, so you can read it without switching back.",
    ],
  ],
};

export default seo;
