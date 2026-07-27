const seo = {
  intro:
    "This scientific notation calculator rewrites any number as a × 10^n, where the coefficient a satisfies 1 ≤ |a| < 10 and n is a whole number, and also gives the engineering form in which n is forced to a multiple of 3 so it lines up with an SI prefix such as kilo (10^3) or micro (10^-6). It applies the standard significant-figure rules to arithmetic: multiplication and division keep the fewest significant figures of the operands, addition and subtraction round to the coarsest decimal place. It is built for physics, chemistry and engineering students and for anyone reading data sheets full of very large or very small numbers.",
  useCases: [
    "Writing Avogadro's number 602214076000000000000000 as 6.02214076 × 10^23 for a chemistry answer sheet",
    "Converting 0.0000472 farads into engineering notation to read it as 47.2 microfarads",
    "Multiplying 2.5 × 10^3 by 4.00 and seeing why the answer is reported as 1.0 × 10^4, not 10000",
  ],
  benefits: [
    ["Both notations at once", "Every value is shown in scientific form and in engineering form with its SI prefix."],
    ["Significant figures done properly", "The tool states which rule it applied and why the result has that many digits."],
    ["Reads any input style", "Accepts 0.000123, 1.23e-4 and 1.23 × 10^-4 interchangeably."],
  ],
  faqs: [
    [
      "How do you write a number in scientific notation?",
      "Move the decimal point until exactly one non-zero digit sits to its left, then multiply by 10 raised to the number of places you moved. Moving left gives a positive exponent and moving right a negative one, so 299792458 becomes 2.998 × 10^8 and 0.000123 becomes 1.23 × 10^-4.",
    ],
    [
      "What is the difference between scientific and engineering notation?",
      "Scientific notation keeps the coefficient between 1 and 10 with any integer exponent; engineering notation restricts the exponent to multiples of 3, so the coefficient runs from 1 up to 1000. Engineering form exists because every multiple-of-3 exponent has an SI prefix — 47.2 × 10^-6 F reads directly as 47.2 µF.",
    ],
    [
      "How many significant figures should the answer have?",
      "For multiplication and division, the answer takes the smallest significant-figure count of the inputs: 2.5 × 10^3 (2 sig figs) times 4.00 (3 sig figs) gives 1.0 × 10^4. For addition and subtraction, round to the coarsest last decimal place instead: 12.34 + 1.2 = 13.5, because 1.2 is only known to the tenths place.",
    ],
    [
      "What is the largest number this calculator can handle?",
      "About 1.798 × 10^308, and the smallest is roughly 5 × 10^-324, because calculations run in IEEE-754 double precision with around 17 significant decimal digits. Beyond those limits the tool returns an overflow message instead of a misleading rounded answer.",
    ],
  ],
};

export default seo;
