const seo = {
  title: "CGPA to Percentage Converter: CBSE, VTU, GTU",
  metaDescription:
    "Convert CGPA to percentage using CBSE's x9.5, a flat x10, VTU's (CGPA-0.75)x10, GTU's or Mumbai University's rule — and back again.",
  steps: [
    "Pick a direction with the CGPA to percentage / Percentage to CGPA buttons, then type your grade into the CGPA (out of 10) field, which opens at 8.6.",
    "Choose your institution's formula from the Conversion rule dropdown: CBSE (x 9.5), Generic 10-point (x 10), VTU (CGPA - 0.75) x 10, GTU (CGPA - 0.5) x 10, Mumbai University (piecewise), 4.0 GPA scale (GPA / 4 x 100) or Custom multiplier.",
    "The Equivalent percentage headline recalculates as you type, with a Typical class row and a Same CGPA under other common rules comparison list; Copy result copies the rule, formula, CGPA, percentage and class.",
  ],
  "intro": "CGPA to Percentage Converter turns a cumulative grade point average into a percentage using the exact rule your institution follows — CBSE's x 9.5, the generic x 10, VTU's (CGPA - 0.75) x 10, GTU's (CGPA - 0.5) x 10, Mumbai University's piecewise formula, or a custom multiplier. It also runs in reverse, converting a percentage back to CGPA, and shows what the same CGPA would look like under the other common rules. Useful when a job portal, scholarship form or foreign university application demands a percentage and your marksheet only prints grade points.",
  "useCases": [
    "Fill in the percentage field on a campus placement or government job form that will not accept a CGPA.",
    "Check what your engineering CGPA works out to under your own university rule instead of the generic x 10 shortcut.",
    "Convert a required percentage cut-off back into the CGPA you need to hit this semester."
  ],
  "benefits": [
    [
      "Real university formulas",
      "CBSE, VTU, GTU and Mumbai University rules are built in, not just a single multiplier."
    ],
    [
      "Two-way conversion",
      "Go CGPA to percentage or percentage to CGPA with the same rule and no manual algebra."
    ],
    [
      "Side-by-side comparison",
      "See how much your number changes across rules, so you know when to insist on an official conversion certificate."
    ]
  ],
  "faqs": [
    [
      "How do I convert CGPA to percentage?",
      "Multiply your CGPA by your institution's factor. CBSE uses 9.5, many universities use a flat 10, VTU subtracts 0.75 before multiplying by 10, and GTU subtracts 0.5. Always use the rule your own institution publishes."
    ],
    [
      "Why does CBSE multiply by 9.5?",
      "CBSE derived 9.5 from the average of the marks ranges behind grades A1 to D1 across several years of results, so multiplying the grade point by 9.5 approximates the underlying marks percentage."
    ],
    [
      "Which formula should I use if my university has not published one?",
      "Ask your examination section for a conversion certificate. Many employers and foreign universities require that official document, and using the wrong multiplier can overstate or understate your score by several percent."
    ],
    [
      "Can I convert a 4.0 scale GPA to a percentage?",
      "The tool includes GPA / 4 x 100 as a simple linear option, but US institutions do not officially map GPA to percentages. For credential evaluation, submit your transcript to the evaluating body rather than a converted number."
    ]
  ]
};

export default seo;
