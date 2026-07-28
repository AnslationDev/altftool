const seo = {
  intro:
    "The Negative Split Planner works out the two half-race times that add up to your goal finish while making the second half a chosen percentage faster than the first. It solves first-half time as goal time divided by (2 minus the split fraction), then expands the result into a segment-by-segment pace sheet in either a step-down or gradually tapering shape. Aimed at road runners who lose time by starting too fast and want a written plan for the first kilometre.",
  useCases: [
    "Set the halfway target for a 4-hour marathon with a 2% negative split before printing a pace band.",
    "Turn a 50-minute 10K goal into per-kilometre splits that get quicker every 2 km rather than dropping in one step.",
    "Check how much slower the opening half has to be if you want to close 5% faster, and decide whether that is realistic.",
    "Build progressive splits for a long training run so the last third is at marathon effort.",
  ],
  benefits: [
    ["Solved, not guessed", "Half times are derived from the goal time and split ratio, so the segments always add back to the finish time."],
    ["Two plan shapes", "Step down at halfway, or taper pace across every segment so no kilometre is a jump."],
    ["Reality checks", "Flags splits outside the usual 1-3% range and refuses closing paces faster than any road record."],
  ],
  faqs: [
    [
      "What is a negative split in running?",
      "A negative split means covering the second half of a race faster than the first. If a 4-hour marathon is run in 2:01:13 and 1:58:47, the second half is 2% quicker, which is a 2% negative split.",
    ],
    [
      "How big should my negative split be?",
      "One to three percent is the range most coaching plans target. Anything under 1% is inside normal GPS and course-measurement noise, and much more than 3% usually means the first half was slower than it needed to be, which is rarely paid back in full.",
    ],
    [
      "How do I calculate first-half time for a negative split?",
      "Divide the goal finish time by (1 + the ratio), where the ratio is 1 minus the split percentage as a decimal. For a 4-hour goal and a 2% split that is 14,400 divided by 1.98, which is 7,272 seconds, or 2:01:13.",
    ],
    [
      "Do elite runners actually negative split?",
      "Most world records over 5,000 m and above have been set with an even or slightly negative split, and marathon world records typically run halves within a minute of each other. The pattern is well documented, though pacing on a hilly or hot course sensibly follows effort rather than a fixed split.",
    ],
  ],
};

export default seo;
