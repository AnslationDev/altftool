const seo = {
  intro:
    "This timer runs two clocks at once for anyone doing colour-critical work: the 20-20-20 eye rule, which caps near work at 20 minutes before a 20 second look into the distance, and a chromatic adaptation reset before every colour judgement. The second one matters because the visual system adapts to whatever it has been looking at — a saturated hero image, a warm brand palette, a coloured wall behind the monitor — and most of that shift happens inside the first minute, which is exactly why a spell on a neutral grey field resets it. The same principle underpins ISO 3664, the standard for viewing conditions in graphic technology, which fixes a white point and demands a plain neutral grey surround.",
  useCases: [
    "Schedule a three-hour retouching session so each colour sign-off is preceded by a proper 60 second neutral reset.",
    "Check how much of a working day disappears into resets and eye breaks before deciding how often to batch colour decisions.",
    "Set the reset to a distant grey wall so one pause satisfies both the eye rule and the adaptation reset.",
    "Give a studio a shared rhythm for when colour gets judged, instead of everyone calling it whenever they happen to look.",
  ],
  benefits: [
    ["Two problems, one schedule", "Eye strain and colour adaptation are handled together rather than trading one off against the other."],
    ["Reset before the call", "The neutral pause is placed before each decision, which is the only place it changes the answer."],
    ["Honest overhead figure", "Shows exactly what percentage of the session goes to resets and breaks."],
  ],
  faqs: [
    [
      "Why does colour look different after staring at a design for a while?",
      "Chromatic adaptation. The visual system continuously renormalises towards the average colour in your field of view, so after a long spell on a warm or heavily saturated layout a neutral grey starts to look tinted the other way. Most of that shift happens within about a minute, which is also roughly how long it takes to undo on a neutral field.",
    ],
    [
      "How long should a neutral grey reset be before judging colour?",
      "About 60 seconds is the usual working default, because that is roughly the time chromatic adaptation takes to settle. Fill the screen with mid grey, or look at a plain grey card or wall, and make the judgement immediately afterwards rather than ten minutes later.",
    ],
    [
      "What are the right viewing conditions for colour work?",
      "One fixed white point — ISO 3664 specifies D50 (5000 K) for print appraisal, while screen-only work is commonly standardised on D65 — with a plain, matte, neutral grey surround and steady, modest ambient light. Nothing strongly coloured should sit in your field of view, including wallpaper, walls and what you are wearing.",
    ],
    [
      "Do I still need eye breaks if I take colour resets?",
      "Only if the reset is far enough away. A grey card on the desk or a mid-grey screen fill resets your white point but is still near work, so it does not relax accommodation. A plain grey wall across the room does both at once. This is informational guidance — persistent eye strain, headaches or blurred vision should be assessed by an optometrist.",
    ],
  ],
};

export default seo;
