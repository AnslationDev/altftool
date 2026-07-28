const seo = {
  intro:
    "Stroke count per length is the standard pool-side measure of swimming efficiency, and distance per stroke is simply the pool length divided by the strokes taken in it. This tracker logs the count for every length of a set, then reports the average, the highest and lowest, the standard deviation and the percentage drift between the first and second half — the figure that shows whether your stroke is shortening as you tire. It is designed to be compared against your own earlier sessions at the same pace, not against anyone else.",
  useCases: [
    "Log 8 lengths of a 25 m pool and see whether the count creeps up in the back half of the set.",
    "Track distance per stroke week to week during a technique block to confirm the work is landing.",
    "Compare a normal swim against a drill set to see the effect of the drill on stroke length.",
    "Spot a single bad length in a set that the average alone would hide.",
  ],
  benefits: [
    ["Drift, not just an average", "Compares the first half of the set with the second so fatigue shows up as a number."],
    ["Distance per stroke in metres", "Converts the raw count into the figure coaches actually reference."],
    ["Consistency measure", "Spread and standard deviation reveal whether every length was really the same."],
  ],
  faqs: [
    [
      "What is a good stroke count per 25 m?",
      "There is no universal figure — it depends on height, stroke and speed. Adult freestyle swimmers commonly take between 16 and 24 strokes per 25 m, but the useful comparison is your own count at the same pace, since taking fewer strokes by gliding usually means swimming slower.",
    ],
    [
      "How do you calculate distance per stroke?",
      "Divide the pool length by the strokes taken in that length. Swimming a 25 m length in 18 strokes gives 25 divided by 18, which is 1.39 metres per stroke.",
    ],
    [
      "Why does my stroke count go up during a set?",
      "Almost always fatigue: the catch slips, the hips drop and each pull moves you less far, so you need more strokes to cover the same length. A rise of a couple of percent across a set is normal; ten percent or more usually means the set is too long or too fast for your current technique.",
    ],
    [
      "Should I try to reduce my stroke count?",
      "Only if speed holds. Stroke count and stroke rate trade off against each other, and the meaningful target is efficiency at race pace rather than the lowest possible count. A coach watching from the deck will spot which of the two is limiting you faster than the numbers will.",
    ],
  ],
};

export default seo;
