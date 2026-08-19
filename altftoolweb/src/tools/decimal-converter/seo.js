const seo = {
  title: "Decimal Converter: Fractions, Percents & More",
  metaDescription:
    "Converts across eight modes with the working shown: fractions reduce by GCD, and repeating decimals print as 0.(3) or 0.(142857), not 0.333.",
  intro:
    "The Decimal Converter moves a number between fractions, decimals, percentages, mixed numbers and improper fractions across eight conversion modes, and shows the working line by line rather than just the answer. Fractions are reduced to lowest terms with the Euclidean greatest-common-divisor algorithm, decimals are matched to the closest fraction with a denominator up to 10,000, and repeating decimals are detected by tracking long-division remainders so 1/3 is written as 0.(3) instead of a truncated 0.333.",
  useCases: [
    "Checking a child's fractions homework and needing the intermediate steps — multiply the whole number by the denominator, add the numerator — not just the final improper fraction.",
    "Converting a measurement like 0.6875 inches into the nearest workshop fraction, which the denominator search resolves to 11/16.",
    "Turning a test score or discount expressed as a fraction into a percentage, or the reverse, when a form only accepts one of the two.",
  ],
  benefits: [
    [
      "Repeating decimals written correctly",
      "Long division remainders are tracked until one repeats, so 1/7 comes back as 0.(142857) with the recurring block marked instead of a rounded stub.",
    ],
    [
      "Always in lowest terms",
      "Every fraction result is divided through by its greatest common divisor, so 25/100 returns as 1/4 rather than an unreduced fraction you have to simplify yourself.",
    ],
    [
      "Steps you can copy into your working",
      "Each conversion prints the actual operations — divide numerator by denominator, multiply by 100, place over the original denominator — which is what a marked answer has to show.",
    ],
  ],
  faqs: [
    [
      "How do you convert a fraction to a decimal?",
      "Divide the numerator by the denominator: 3/8 is 3 ÷ 8 = 0.375. If the division never terminates the converter marks the recurring block in brackets, so 2/3 is shown as 0.(6) rather than 0.667.",
    ],
    [
      "How do you turn a decimal into a fraction?",
      "Write the decimal over a power of ten matching its decimal places, then divide both parts by their greatest common divisor — 0.75 becomes 75/100, which reduces to 3/4. This converter instead tests denominators from 1 up to 10,000 and keeps the closest match, which is how it recovers 1/3 from 0.333 rather than returning 333/1000.",
    ],
    [
      "How do I change a mixed number into an improper fraction?",
      "Multiply the whole number by the denominator, add the numerator, and keep the same denominator: 2 3/4 becomes (2 × 4) + 3 = 11, so 11/4. Going the other way, divide 11 by 4 to get 2 remainder 3, which is 2 3/4.",
    ],
    [
      "What is the difference between a decimal and a percentage?",
      "A percentage is the decimal multiplied by 100, so 0.25 is 25% and 150% is 1.5. That means converting decimal to percent moves the point two places right, and percent to decimal moves it two places left.",
    ],
  ],
};

export default seo;
