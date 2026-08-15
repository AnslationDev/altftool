const seo = {
  title: "Tablet Strength Split Calculator: Halves",
  metaDescription:
    "Divide a target dose by your tablet strength and round to whole, half or quarter tablets, with the nearest dose below and above and days of supply.",
  steps: [
    "Enter 'Target dose (mg)' and 'Tablet strength (mg)'.",
    "Choose 'How the tablet can be divided' — 'Not splittable — whole tablets only', 'Single score line — halves' or 'Cross score — quarters' — and optionally fill 'Doses per day (optional)' and 'Tablets in the pack (optional)'.",
    "Read 'Tablets per dose' with its 'Exact match' or 'No exact match with these pieces' badge, then 'Difference from target' in mg and percent, 'Nearest below target', 'Nearest above target' and 'Days a pack lasts', and press 'Copy result'.",
  ],
  intro:
    "The Tablet Strength Split Calculator divides a target dose by the strength of the tablets you actually have, then rounds that figure to the pieces the tablet can be broken into — whole tablets, halves from a single score line, or quarters from a cross score. It reports the closest achievable dose, the nearest option below and above it, how far each is from the target in milligrams and percent, and how long a pack will last. It is arithmetic for checking a prescribed dose, not permission to split any particular tablet.",
  useCases: [
    "Check that 375 mg needs three quarters of a 500 mg tablet rather than guessing at the score lines.",
    "See that a 30 mg target cannot be made exactly from unsplittable 20 mg tablets, and how far 1 or 2 tablets miss by.",
    "Work out how many days a 30-tablet pack lasts on a half-tablet twice-daily schedule.",
    "Confirm a strength change — moving from 10 mg to 25 mg tablets — still lands on the same daily dose.",
  ],
  benefits: [
    ["Real split limits", "Rounds only to whole, half or quarter tablets, so the answer is something you can actually take."],
    ["Both directions shown", "Gives the nearest option below and above the target instead of silently rounding one way."],
    ["Pack planning", "Turns the dose into tablets per day and days of supply from a pack size."],
  ],
  faqs: [
    [
      "How many 500 mg tablets make a 375 mg dose?",
      "Three quarters of one 500 mg tablet, which is only possible if the tablet carries a cross score. With a single score line the closest options are half a tablet at 250 mg or a whole tablet at 500 mg, both a long way from 375 mg.",
    ],
    [
      "Which tablets should never be split?",
      "Modified-release, extended-release, enteric-coated and film-coated tablets, plus capsules and cytotoxic products. Splitting a modified-release tablet can release the whole day's dose at once. If there is no score line, treat the tablet as not splittable until a pharmacist confirms otherwise.",
    ],
    [
      "How accurate is splitting a tablet by hand?",
      "Studies of hand and cutter splitting routinely find deviations of 10 to 20 percent per half, and more for small or unscored tablets. That matters most for narrow-therapeutic-index medicines such as warfarin, levothyroxine and digoxin, where a different strength is usually the safer answer.",
    ],
    [
      "How do I work out how long a pack will last?",
      "Divide the pack size by the tablets taken each day. Half a tablet twice a day is one tablet a day, so a 30-tablet pack lasts about 30 days; a whole tablet three times a day burns the same pack in 10 days.",
    ],
  ],
};

export default seo;
