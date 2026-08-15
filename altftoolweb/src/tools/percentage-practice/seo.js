const seo = {
  title: "Percentage Practice: 7 Question Types, Worked Steps",
  metaDescription:
    "Unlimited percentage questions across 7 types and 5 difficulty levels, each marked with full working. Practice, 60-second timed or 3-life survival.",
  steps: [
    "Under Game Mode pick Practice, Timed Challenge or Survival, then a Question Type and a Difficulty Level.",
    "Set Number of Questions or a Time Limit from 30s to 3min, hit Start Practice, and answer each question in turn.",
    "On the results screen read accuracy per question type and the Answer Review working, then hit Export CSV.",
  ],
  intro:
    "Percentage Practice generates unlimited percentage questions across seven types — find X% of Y, reverse percentage, what percent is X of Y, percentage increase, percentage decrease, discount price and original price before discount — and marks each answer with a worked step-by-step solution. Choose one of five difficulty levels, from beginner numbers between 10 and 100 to expert values up to 10,000 with awkward percentages like 13.75%, and run it as untimed practice, a timed challenge or a 3-life survival round. The results screen breaks accuracy down by question type so you can see which one is actually costing you marks.",
  useCases: [
    "Revising for a numeracy or aptitude test where mental percentage work is timed, using the 60-second challenge mode",
    "A parent setting a child 20 beginner-level questions on discounts and checking the step-by-step working together",
    "Getting faster at the reverse question — 'after a 25% discount the price is $150, what was the original?' — which most people find harder than a forward discount",
  ],
  benefits: [
    ["Steps for every question", "Each answer expands into the full working, such as 20% × 250 = 50, then 250 − 50 = 200, rather than just right or wrong."],
    ["Per-topic accuracy breakdown", "Results flag any question type scoring under 70% as a weak topic and 80% or above as strong, so revision has a target."],
    ["Difficulty that changes the maths", "Higher levels use larger ranges and non-round percentages like 12.5%, 17.5% and 33.33%, not just bigger numbers."],
  ],
  faqs: [
    [
      "How do you find the original price before a discount?",
      "Divide the sale price by (1 − discount ÷ 100). A $150 item after 25% off started at 150 ÷ 0.75 = $200. This is the 'Find Original Price' question type, and it is the one most people get wrong because subtracting 25% from the sale price gives the wrong answer.",
    ],
    [
      "How close does my answer have to be to count as correct?",
      "Within 0.5% of the true answer. The checker compares your input against the correct value relative to its size, so small rounding differences pass while a genuinely wrong figure does not; answers near zero must land within 0.01.",
    ],
    [
      "What are the game modes?",
      "Three: Practice with no timer, a Timed Challenge of 30, 60, 120 or 180 seconds, and Survival with 3 lives that ends on your third wrong answer. Practice and timed rounds can be set to 10, 15, 20, 30 or 50 questions.",
    ],
    [
      "How is the score calculated?",
      "A correct answer is worth 10 points multiplied by a streak bonus of 1 + 0.5 per consecutive correct answer already banked before that question, capped at a bonus streak of 10. That means the 10th answer in a fresh streak is still worth 55 points, and each answer is worth the full 60 points only once you are 11 or more answers into an unbroken run. Accuracy is tracked separately as correct answers ÷ total attempted.",
    ],
  ],
};

export default seo;
