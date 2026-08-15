const seo = {
  title: "Proportion Solver – Find the Missing Value in a/b = c/d",
  metaDescription:
    "Pick which of a, b, c or d is unknown, type the other three, and get the answer by cross multiplication with every algebra step shown, ready to copy.",
  steps: [
    "Under 'Which term is unknown?', press a, b, c or d — that input is disabled and shows 'solving…' while the others stay editable.",
    "Type the other three values (decimals and negatives allowed), or load a Quick example like 'Recipe scale-up', 'Map scale 1:250' or 'Unit price'.",
    "Read the solved value with the numbered 'Cross multiplication steps', both ratios as decimals and the a×d vs b×c check, then click 'Copy result'.",
  ],
  "intro": "Proportion Solver finds the missing term in a / b = c / d. Pick which of the four values is unknown, type the other three, and the tool cross multiplies to isolate it while printing every algebra step. It also reports both ratios as decimals, the simplified whole-number ratio and the scale factor between the two sides — handy for students checking homework and for anyone scaling a recipe, a map distance or a unit price.",
  "useCases": [
    "Scale a recipe: 2 cups of flour serves 5 people, so how much flour serves 8?",
    "Convert a map measurement at 1:250 scale into the real distance on the ground.",
    "Work out unit pricing — if 3 items cost Rs 149, what should 7 items cost at the same rate?"
  ],
  "benefits": [
    [
      "Solves any position",
      "Leave a, b, c or d unknown and the tool rearranges the equation for that term."
    ],
    [
      "Shows the working",
      "Every cross-multiplication step is listed, so you can copy it into homework or a worksheet."
    ],
    [
      "Catches bad inputs",
      "Divide-by-zero cases are explained in plain language instead of printing NaN or Infinity."
    ]
  ],
  "faqs": [
    [
      "What is cross multiplication?",
      "For a / b = c / d, multiplying both sides by b and by d gives a x d = b x c. You then divide by whichever known term sits beside the unknown to isolate it."
    ],
    [
      "Why does it say it cannot solve for my term?",
      "Isolating each term requires dividing by one specific known value. If that value is 0 the division is undefined, so the tool names the term that must be non-zero."
    ],
    [
      "Can I use decimals and negative numbers?",
      "Yes, any finite decimal or negative value works. The simplified whole-number ratio only appears when both left-hand terms are integers."
    ],
    [
      "Is a proportion the same as a ratio?",
      "A ratio compares two quantities (a to b). A proportion is the statement that two ratios are equal, which is exactly what this tool solves."
    ]
  ]
};

export default seo;
