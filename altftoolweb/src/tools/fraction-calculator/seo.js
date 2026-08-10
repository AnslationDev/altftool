const seo = {
  title: "Fraction Calculator with Step-by-Step LCM Working",
  metaDescription:
    "Add, subtract, multiply or divide fractions and see the LCM, equivalent fractions and GCD reduction. Simplifies, takes mixed numbers, converts decimals.",
  steps: [
    "On the Calculate tab, type the Numerator and Denominator of the first fraction and the second fraction, ticking Mixed numbers (add a whole-number part) if you need a Whole box too.",
    "Choose the operation from the +, −, × and ÷ buttons, or load a quick example such as 5/6 − 3/8 or 7/8 ÷ 3/4.",
    "Read the answer as a simplified fraction, a mixed number and a decimal, with the numbered Step-by-step working underneath, then press Copy result.",
  ],
  intro:
    "The Fraction Calculator adds, subtracts, multiplies and divides two fractions and shows every step of the working — the LCM of the denominators, the equivalent fractions, the numerator arithmetic and the final division by the GCD. It also simplifies any fraction on its own and converts a decimal to a fraction by writing it over a power of ten and reducing. Mixed numbers are accepted and converted to improper fractions first, and all arithmetic runs on BigInt so large numerators and denominators stay exact.",
  useCases: [
    "Checking a child's homework on 5/6 − 3/8 and being able to point at the step where the least common denominator 24 comes from",
    "Halving a recipe that calls for 2 1/2 cups by dividing the mixed number and getting the answer back as a mixed number, not a decimal",
    "Turning a measurement like 3.25 into 13/4 for a cut list, with the reduction from 325/100 shown so you can sanity-check it",
  ],
  benefits: [
    ["Working, not just an answer", "Each operation is broken into numbered steps — common denominator, conversion, arithmetic, then simplification by the GCD."],
    ["Exact at any size", "Numerators and denominators are handled as BigInt integers, so results never lose precision to floating-point rounding."],
    ["Three views of one result", "Every answer is given as a simplified fraction, as a mixed number where one exists, and as a decimal."],
  ],
  faqs: [
    [
      "How do you add two fractions with different denominators?",
      "Convert both to the least common denominator, add the numerators, then reduce by the GCD. For 3/4 + 1/6 the LCM of 4 and 6 is 12, giving 9/12 + 2/12 = 11/12, which is already in lowest terms — and the calculator prints exactly those steps.",
    ],
    [
      "How do you divide fractions?",
      "Flip the second fraction and multiply. 7/8 ÷ 3/4 becomes 7/8 × 4/3 = 28/24, which reduces by a GCD of 4 to 7/6, or 1 1/6 as a mixed number.",
    ],
    [
      "Can I enter mixed numbers like 2 1/2?",
      "Yes — switch on mixed-number input and there is a separate whole-number box. The mixed number is converted to an improper fraction first (2 1/2 becomes 5/2) and that conversion is shown as the first step of the working.",
    ],
    [
      "How does the decimal-to-fraction conversion work?",
      "The decimal is written over 10 raised to the number of decimal places and then reduced by the GCD, so 0.375 becomes 375/1000 and then 3/8. Up to 6 decimal places are accepted; longer decimals need to be trimmed first.",
    ],
  ],
};

export default seo;
