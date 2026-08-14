const seo = {
  title: "Ratio Calculator: Simplify, Solve & Split Ratios",
  metaDescription:
    "Simplify a ratio by GCD (1920:1080 → 16:9), solve 3:4 = 12:? for the missing term, or split a total like 2:3:5 — with shares and percentages shown.",
  steps: [
    "Pick a mode — 'Simplify a ratio', 'Find a missing term' or 'Split a total' — and fill its fields: First/Second/optional Third term, the known ratio plus new first term, or a Total to divide and a ratio like 2:3:5.",
    "The result updates live: simplify divides every term by the GCD after scaling decimals to whole numbers (1.5:2 becomes 3:4), missing-term mode shows the scale factor and cross product check, split shows the value of one part.",
    "Read each share with its percentage bar under 'Breakdown by part', then press Copy result to copy the full working as text.",
  ],
  "intro": "Ratio Calculator handles the three things people actually need from ratios: reducing one to its simplest whole-number form, solving a proportion like 3 : 4 = 12 : ? for the missing term, and dividing a total in a given ratio such as 2 : 3 : 5. It reduces using the greatest common divisor and scales decimal terms to whole numbers first, so 1.5 : 2 correctly becomes 3 : 4. Every mode shows the working — scale factor, sum of parts, value of one part and each term's percentage share.",
  "useCases": [
    "Reduce a screen or image ratio like 1920 : 1080 down to 16 : 9 before setting a canvas size.",
    "Split profit, rent or a prize pool between people in an agreed ratio and see each share plus its percentage.",
    "Scale a recipe or a concrete mix by solving 3 : 4 = 12 : ? for the quantity of the second ingredient."
  ],
  "benefits": [
    [
      "Three modes in one place",
      "Simplify, solve a proportion, or split a total without switching tools."
    ],
    [
      "Handles decimals",
      "Decimal terms are scaled to integers before reducing, so 1.5 : 2 gives an exact 3 : 4."
    ],
    [
      "Shows the working",
      "Scale factor, cross-product check, value of one part and percentage shares are all displayed."
    ]
  ],
  "faqs": [
    [
      "How do you simplify a ratio?",
      "Divide every term by the greatest common divisor of all the terms. For 1920 : 1080 the GCD is 120, which reduces the ratio to 16 : 9."
    ],
    [
      "How do I find a missing term in a proportion?",
      "In a : b = c : d, cross-multiply so a x d = b x c. Solving for the missing fourth term gives d = (b x c) / a — for example 3 : 4 = 12 : d gives d = (4 x 12) / 3 = 16."
    ],
    [
      "How do I divide an amount in a ratio like 2:3:5?",
      "Add the parts (2 + 3 + 5 = 10), divide the total by that sum to get the value of one part, then multiply each part by it. A total of 5,000 splits into 1,000, 1,500 and 2,500."
    ],
    [
      "Can a ratio have three or more terms?",
      "Yes. Simplify mode accepts a third term, and split mode accepts as many parts as you type separated by colons, commas or spaces."
    ]
  ]
};

export default seo;
