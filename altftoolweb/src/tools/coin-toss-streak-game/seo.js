const seo = {
  intro:
    "The Coin Toss Streak Game flips 20 fair coins in one go and reports the longest run of the same face, along with the full H/T sequence in two blocks of ten and the heads-versus-tails count. It exists to make one point visible: streaks are ordinary. Press regenerate as many times as you like and watch how often a run of four, five or six shows up in a sequence that is genuinely 50/50.",
  useCases: [
    "You are teaching probability and want a live example that a run of five heads is not evidence the coin is loaded.",
    "You are arguing with someone about a hot streak in sport or gambling and want to show what pure chance produces over 20 trials.",
    "You want to sanity-check your intuition about randomness by guessing the longest run before you press flip, then seeing how often you are wrong.",
  ],
  benefits: [
    ["Reports the streak, not just the flips", "It scans the whole 20-flip sequence and hands back the longest same-side run, so you do not have to count it yourself."],
    ["Shows the raw sequence", "The full H/T string is printed in two rows of ten, so you can see exactly where the run happened."],
    ["Instantly repeatable", "Regenerate re-runs all 20 flips at once, which is what makes the distribution of streak lengths obvious after a dozen tries."],
  ],
  faqs: [
    [
      "What is the longest streak you usually get in 20 coin flips?",
      "Four or five, most of the time. Across fair 20-flip runs the longest streak averages about 4.7, with 4 being the single most common answer and roughly 46 percent of runs reaching 5 or more.",
    ],
    [
      "Does a long streak mean the coin is not fair?",
      "No. Every flip here is an independent 50/50 draw, and a run of six or longer still turns up in about one in four sets of 20 flips. Streaks are what random data looks like; their absence would be the suspicious result.",
    ],
    [
      "How many coins does it flip?",
      "Twenty per round, displayed as two groups of ten. It also counts heads and tails separately, which will often land at something like 12-8 rather than a tidy 10-10.",
    ],
    [
      "Are heads and tails equally likely?",
      "Yes, each flip is an even 50/50 split with no weighting and no memory of earlier flips. An uneven heads-to-tails count in a single 20-flip round is normal variance, not bias.",
    ],
  ],
};

export default seo;
