const seo = {
  intro:
    "This tool compares marks across years or semesters by converting each period to a percentage and reporting the change between consecutive periods in percentage points. It then fits an ordinary least-squares trend line (percentage against period number) to classify your trajectory as improving, stable or declining. It is built for students and parents who want to see whether performance is genuinely trending up, not just bouncing around a single good or bad result.",
  useCases: [
    "A Class 12 student lining up Class 9-12 results to see whether the board-exam year continued an upward trend",
    "A college student comparing semester GPAs converted to percentages after switching study methods mid-course",
    "A parent checking whether a dip in one term was a one-off or the start of a decline before a parent-teacher meeting",
  ],
  benefits: [
    ["Different maximums handled", "Each period is normalised to a percentage, so a 500-mark year and a 400-mark year compare fairly."],
    ["Real trend, not guesswork", "A least-squares line across all periods separates genuine improvement from one lucky result."],
    ["Period-by-period deltas", "Every year shows its exact percentage-point change from the previous one."],
  ],
  faqs: [
    [
      "How do I compare marks from years with different total marks?",
      "Convert each year to a percentage first: marks obtained divided by maximum marks, times 100. This tool does that automatically, so 372/500 (74.4%) and 406/500 (81.2%) compare directly as a +6.8 percentage-point improvement even if the maximums had differed.",
    ],
    [
      "What is the difference between a percentage change and a percentage-point change?",
      "Moving from 60% to 70% is a rise of 10 percentage points, but a 16.7% relative increase. Mark comparisons should use percentage points, because that is how boards and universities express score gaps, and it is the unit this tool reports.",
    ],
    [
      "How does the tool decide if my marks are improving or declining?",
      "It fits a least-squares straight line through your percentages and reads the slope. A slope above +0.5 percentage points per period counts as improving, below -0.5 as declining, and anything in between as stable, since half a point is within normal marking variation.",
    ],
    [
      "Can the projected next-period percentage be trusted?",
      "It is a straight-line extrapolation of your past trend, clamped between 0% and 100%, and should be read as a momentum indicator rather than a prediction. Syllabus difficulty, exam pattern changes and effort all shift real outcomes.",
    ],
  ],
};

export default seo;
