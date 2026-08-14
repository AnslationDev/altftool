const seo = {
  title: "Weighted Grade Calculator: What You Need on the Final",
  metaDescription:
    "Weighted average from SUM(score x weight) / SUM(weight), with letter and 4.0 GPA. Leave a score blank and it works out the mark the final needs.",
  steps: [
    "Fill the Assessment, Weight and Score % columns, leaving Score % blank on anything not yet graded.",
    "Press Add assessment for more rows, then pick a Grade scale and a Target final grade (%).",
    "You get the grade so far as a letter and 4.0 GPA, plus the average score every ungraded item must earn.",
  ],
  intro:
    "The Weighted Grade Calculator computes a course grade as SUM(score x weight) / SUM(weight), converts it to a letter and 4.0-scale GPA, and reverses the formula to tell you the score you still need on ungraded work. Leave an assessment blank and it is treated as not yet graded, so you get both your grade so far and the mark the final has to earn: needed = (target x total weight / 100 - points already earned) / remaining weight x 100. Weights do not have to add to 100, so a syllabus written in raw points works as-is.",
  useCases: [
    "A student with 95% on homework worth 20% and 82% on a midterm worth 30% checking what the 50% final needs for an A-.",
    "Confirming that an A is still mathematically reachable before deciding how hard to study.",
    "Converting a syllabus written in raw points (200 + 300 + 500) into percentage weights without doing the normalising by hand.",
  ],
  benefits: [
    ["Two grades, not one", "Shows your grade on graded work so far and your projected grade if nothing else is submitted."],
    ["Tells you the number you need", "Reverses the weighted average to give the exact average score required on everything ungraded."],
    ["Flags the impossible", "If the required score is above 100% it says so, and shows the highest grade still reachable."],
  ],
  faqs: [
    [
      "How do you calculate a weighted grade?",
      "Multiply each score by its weight, add those up, and divide by the total weight. Scores of 95% on 20% homework and 82% on a 30% midterm give (95 x 20 + 82 x 30) / 50 = 87.2% on the work graded so far.",
    ],
    [
      "What do I need on the final exam to get an A?",
      "Needed = (target x total weight / 100 - points already earned) / remaining weight x 100. With 43.6 grade points banked out of 100 and a 50%-weighted final, hitting 90% overall needs (90 - 43.6) / 50 x 100 = 92.8% on the final.",
    ],
    [
      "What percentage is an A?",
      "On the common plus/minus scale an A starts at 93%, an A- at 90%, a B+ at 87% and a B at 83%; anything under 60% is an F. On a straight ten-point scale an A starts at 90% and a B at 80%. Both scales are available here because schools differ.",
    ],
    [
      "Do the weights have to add up to 100?",
      "No. The formula divides by the sum of the weights, so 200 + 300 + 500 raw points give exactly the same grade as 20% + 30% + 50%. The calculator tells you when your weights do not total 100 so you can spot a missing assessment.",
    ],
  ],
};

export default seo;
