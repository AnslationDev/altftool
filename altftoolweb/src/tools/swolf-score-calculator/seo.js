const seo = {
  title: "SWOLF Score Calculator with Per-25 m",
  metaDescription:
    "Add length time to stroke count for a SWOLF score, normalised per 25 m so 50 m pools compare, with the stroke-vs-time trade-off table behind it.",
  steps: [
    "Choose 'One length' or 'Whole set', pick the 'Pool length (m)' — 25, 33.3 or 50 m — then enter 'Time for that length (seconds)' and 'Strokes in that length' (or total time, total strokes and lengths swum for a set).",
    "Read the SWOLF score headline, with 'SWOLF normalised per 25 m', speed in m/s, 'Pace per 100 m', 'Distance per stroke' and stroke rate listed beneath it.",
    "Check the 'Same score, different trade-off' table for the time each stroke count would need at your score, then press 'Copy result' or Reset.",
  ],
  intro:
    "SWOLF, short for swim golf, is the time in seconds a length takes added to the number of strokes taken in it — swim a 25 m length in 20 seconds using 18 strokes and your SWOLF is 38. As in golf, lower is better, because you either moved faster or used fewer strokes. This calculator scores a single length or a whole set, normalises the result per 25 m so a 50 m pool can be compared with a short course one, and shows the trade-off table of stroke counts and times that all give the same score.",
  useCases: [
    "Score a 25 m length swum in 20 seconds with 18 strokes and track that number across a training block.",
    "Convert a 50 m pool SWOLF into its per-25 m equivalent before comparing with a session in a short-course pool.",
    "Work out a whole set's average SWOLF from total time, total strokes and the number of lengths.",
    "See exactly how much faster you would need to swim to justify taking two fewer strokes per length.",
  ],
  benefits: [
    ["Comparable across pools", "The per-25 m normalisation makes long-course and short-course sessions comparable."],
    ["Shows the trade-off", "A table of stroke counts and the times each would need for the same score."],
    ["Pace shown alongside", "Speed, pace per 100 and distance per stroke sit next to the score so a slow low score is obvious."],
  ],
  faqs: [
    [
      "How is SWOLF calculated?",
      "Add the time in seconds for one length to the number of strokes taken in that length. A 25 m length in 20 seconds with 18 strokes gives a SWOLF of 38. Watches compute it per length and then average across the set.",
    ],
    [
      "What is a good SWOLF score?",
      "There is no universal target, because the score depends on pool length, stroke and speed. In a 25 m pool freestyle scores in the 30s are typical of a competent swimmer and the 20s of a fast one, but the only comparison that matters is your own score at the same pace over time.",
    ],
    [
      "Can I compare SWOLF between a 25 m and a 50 m pool?",
      "Not directly — a 50 m length roughly doubles both the time and the strokes, so the raw score roughly doubles too. Multiply the 50 m score by 25 divided by 50 to get a per-25 m figure, which this calculator does automatically.",
    ],
    [
      "Does a lower SWOLF always mean better swimming?",
      "No. You can lower SWOLF by gliding, which cuts strokes but adds time and makes you slower overall. A genuinely better swim is a lower SWOLF at the same or a faster pace, which is why the pace per 100 is shown next to the score.",
    ],
  ],
};

export default seo;
