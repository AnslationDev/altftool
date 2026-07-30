const seo = {
  intro:
    "Fraction Visualizer draws any fraction you type four different ways — as a pie chart, a segmented bar, a point on a number line and a filled grid area model — and updates all of them as you change the numerator or denominator. It covers twelve learning modules, from equivalent fractions and simplifying by the GCD through addition, subtraction, multiplication and division to decimal and percentage conversion, and includes a practice mode that generates random questions and keeps a running score. It is made for learners and teachers who need to see why 3/4 and 6/8 are the same amount rather than be told so.",
  useCases: [
    "Convincing a student that 2/3 is bigger than 3/5 by putting both on the same number line instead of cross-multiplying",
    "Teaching equivalent fractions by watching the pie stay filled to the same level while the denominator doubles from 4 to 8 to 12",
    "Drilling fraction addition with the practice generator, which produces random pairs with denominators from 2 to 12 and marks the simplified answer",
  ],
  benefits: [
    ["Four models of the same fraction", "Pie, bar, number line and area grid are all driven by the same input, so a learner sees one quantity in four representations at once."],
    ["Twelve targeted modules", "Representation, equivalence, simplifying, comparing, mixed and improper numbers, all four operations, and decimal and percentage conversion each get their own view."],
    ["Practice with instant marking", "Random questions are checked against the simplified result and a correct-out-of-total score is kept as you go."],
  ],
  faqs: [
    [
      "What is the best way to show a fraction visually?",
      "Use more than one model — a pie shows part-of-a-whole, a bar shows length, a number line shows position and magnitude, and an area grid shows part-of-a-set. This tool renders all four from the same numerator and denominator so learners can move between them.",
    ],
    [
      "How do I know if two fractions are equivalent?",
      "Two fractions are equivalent when both reduce to the same simplest form, found by dividing numerator and denominator by their greatest common divisor. 6/8 has a GCD of 2 and reduces to 3/4, which is why the two fill the same amount of the pie.",
    ],
    [
      "How do you turn a fraction into a percentage?",
      "Divide the numerator by the denominator and multiply by 100 — so 3/8 is 0.375, or 37.5%. The conversion module shows the decimal to four places and the percentage to two.",
    ],
    [
      "How does the practice mode pick its questions?",
      "It generates two random proper fractions with denominators between 2 and 12 and applies the operation for the module you are on. Your answer is compared against the fully simplified result, so 2/4 is not accepted where 1/2 is expected.",
    ],
  ],
};

export default seo;
