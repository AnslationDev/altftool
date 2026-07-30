const seo = {
  intro:
    "This calculator finds the greatest common divisor (GCD, also called HCF) and the least common multiple (LCM) of two whole numbers. It uses the Euclidean algorithm — repeatedly replacing the pair with the smaller number and the remainder until the remainder is zero — and then derives the LCM from the identity LCM(a, b) = a x b / GCD(a, b), computed as (a / g) x b so the intermediate product stays small. Enter 12 and 18 and it returns GCD 6 and LCM 36.",
  useCases: [
    "You are reducing a fraction such as 84/126 to its lowest terms and need the common factor to divide out — the GCD is 42, giving 2/3.",
    "Two events repeat on different cycles, one every 12 days and one every 18, and you want the next day both fall together, which is the LCM: 36 days.",
    "You are adding fractions with denominators of 8 and 12 and need the lowest common denominator before you can add them — that is the LCM, 24.",
  ],
  benefits: [
    ["Both answers from one input", "GCD and LCM are returned together, which is what you usually need, since one is derived from the other."],
    ["Euclidean algorithm, not trial division", "The remainder method converges in a handful of steps even for large inputs, instead of testing every candidate factor."],
    ["Inputs normalised for you", "Values are taken as whole numbers and signs ignored, so a negative or decimal entry still returns the divisor and multiple of the magnitudes."],
  ],
  faqs: [
    [
      "What is the difference between GCD and LCM?",
      "The GCD is the largest number that divides both values exactly; the LCM is the smallest number both values divide into exactly. For 12 and 18 the GCD is 6 and the LCM is 36 — the GCD is never larger than the smaller input, and the LCM is never smaller than the larger one.",
    ],
    [
      "Is HCF the same as GCD?",
      "Yes. Highest common factor (HCF), greatest common divisor (GCD) and greatest common factor (GCF) all name the same quantity; HCF is the usual term in Indian and British syllabuses and GCD the usual term elsewhere.",
    ],
    [
      "How do you find the LCM from the GCD?",
      "Multiply the two numbers and divide by their GCD: LCM(a, b) = a x b / GCD(a, b). For 12 and 18 that is 216 / 6 = 36. This identity holds for any pair of positive integers, which is why one calculation gives both results.",
    ],
    [
      "What is the GCD when the two numbers share no factors?",
      "It is 1, and the numbers are called coprime or relatively prime — 8 and 15, for example. In that case the LCM is simply the product of the two numbers, 120.",
    ],
  ],
};

export default seo;
