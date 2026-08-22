const seo = {
  title: "Decision Wheel — Weighted Spinner with Live Odds",
  metaDescription:
    "Weighted random picker: write 'Pizza x3' for a triple slice, spin up to 60 entries, remove winners for giveaways and compare true odds with results.",
  steps: [
    "Type up to 60 entries in the Entries box, one per line, adding a weight like 'Pizza x3' for a triple-width slice (weights 1-100).",
    "Tick 'Remove each winner from the next draw' for giveaways, then press 'Spin' — a seeded mulberry32 draw turns the wheel.",
    "The winner and its exact chance appear above the 'Odds and results' table of expected vs actual percentages; 'Copy results' exports the draw history.",
  ],
  intro:
    "A decision wheel is a weighted random picker: every entry gets a slice of the circle proportional to its weight, so the chance of it winning is exactly its weight divided by the total of all weights. This one draws from a seeded mulberry32 generator, which means the same seed always produces the same winner and a draw can be checked afterwards. Use it for picking lunch, choosing who presents first, or running a small giveaway.",
  useCases: [
    "Pick a restaurant when nobody will commit, giving the two places everyone actually likes a double slice",
    "Draw a giveaway winner from a list of entrants and remove each winner so no one can win twice",
    "Choose the running order for a stand-up or a demo day without anyone claiming it was rigged",
  ],
  benefits: [
    ["Weights that actually work", "Write x3 after a name and it occupies three slices' worth of the circle — verified against the maths, not just visually."],
    ["No-repeat draws", "Turn on winner removal for multi-prize giveaways and each name comes out at most once."],
    ["Odds shown alongside results", "Every entry's true chance sits next to how often it has actually come up, so streaks are visible for what they are."],
  ],
  faqs: [
    [
      "How do I give one option a better chance?",
      "Add x and a number after the name — \"Pizza x3\" takes three times the arc of a plain entry. With entries weighted 3, 1, 2 and 1 the total is 7, so Pizza wins 3/7 of the time, about 42.9%. Weights from 1 to 100 are accepted.",
    ],
    [
      "Is the wheel actually random?",
      "It uses mulberry32, a small 32-bit pseudo-random generator, seeded fresh for every spin. Over tens of thousands of spins the results match the slice widths to within a fraction of a percent. It is not cryptographically secure, so do not use it to draw anything of real monetary value where an adversary could predict the seed.",
    ],
    [
      "Can the same name win twice?",
      "Yes by default, because each spin is independent — that is what makes it a fair random pick, and it is why five spins can easily produce two repeats. Turn on winner removal for a giveaway where each prize goes to a different person.",
    ],
    [
      "Why did an unlikely entry win?",
      "Because a small slice is not a zero slice. A one-in-seven entry still comes up roughly every seventh spin, and short runs cluster: with five entries, seeing one name twice in five spins is common rather than suspicious. The odds column shows what should happen over the long run, not what any five spins will do.",
    ],
  ],
};

export default seo;
