const seo = {
  intro:
    "The Scientific Notation Converter rewrites any decimal number as a mantissa between 1 and 10 times a power of ten, using exponent = floor(log10(|n|)) and mantissa = n ÷ 10^exponent. Enter a value such as 0.00042 and you get the scientific form, the E-notation form, the engineering form whose exponent is always a multiple of 3, plus the mantissa, exponent, order of magnitude and sign listed separately. It is built for students, lab workers and engineers who need the exponent itself, not just a shorter-looking number.",
  useCases: [
    "A chemistry student writing up a titration has a concentration of 0.00042 mol/L and needs it as 4.2 × 10^-4 with the exponent stated for the report's significant-figure check.",
    "An electronics engineer converting a 0.0000047 F capacitance into engineering notation to confirm it lands on 4.7 × 10^-6 — the microfarad step — rather than an off-scale exponent.",
    "Someone reading a spreadsheet export full of values like 1.2345e+11 and wanting to see what order of magnitude that actually is before quoting it in a summary.",
  ],
  benefits: [
    [
      "Scientific and engineering side by side",
      "Shows both the standard 1-to-10 mantissa form and the engineering form snapped to exponents that are multiples of 3, so SI prefixes map directly.",
    ],
    [
      "The exponent is a first-class output",
      "Mantissa, exponent, order of magnitude and sign are listed as separate rows instead of being buried inside one formatted string.",
    ],
    [
      "Handles the awkward inputs",
      "Accepts values already in E notation, keeps ten significant digits in the mantissa, trims trailing zeros, and reports zero as 0 × 10^0 rather than failing on log10(0).",
    ],
  ],
  faqs: [
    [
      "How do you convert a number to scientific notation?",
      "Move the decimal point until exactly one non-zero digit sits to its left, then multiply by ten raised to the number of places you moved. Formally the exponent is floor(log10(|n|)) and the mantissa is n divided by 10 to that exponent, which always lands the mantissa in the range 1 ≤ |m| < 10. For 0.00042 the decimal moves four places right, giving 4.2 × 10^-4.",
    ],
    [
      "What is the difference between scientific and engineering notation?",
      "Engineering notation restricts the exponent to multiples of 3, so the mantissa can range from 1 up to 1000 instead of 1 to 10. That is why 0.00042 is 4.2 × 10^-4 in scientific notation but 420 × 10^-6 in engineering notation — the -6 exponent matches the micro SI prefix, which is why engineers prefer it.",
    ],
    [
      "What does the 'e' in 1.2e+11 mean?",
      "The e stands for 'times ten to the power of', so 1.2e+11 is 1.2 × 10^11, or 120,000,000,000. It is the plain-text form calculators, spreadsheets and programming languages use because superscripts are not available, and this converter accepts it as input and reports it as its own output row.",
    ],
    [
      "What is the order of magnitude of a number?",
      "It is the power of ten in the number's scientific notation — the exponent on its own. A value of 4.2 × 10^-4 has an order of magnitude of 10^-4, and a number one order of magnitude larger is roughly ten times bigger, which is how quantities of very different scale get compared quickly.",
    ],
  ],
};

export default seo;
