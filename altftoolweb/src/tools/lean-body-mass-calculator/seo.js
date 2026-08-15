const seo = {
  title: "Lean Body Mass Calculator: Boer, James & Hume + FFMI",
  metaDescription:
    "Split weight into lean and fat mass from a known body fat % or the Boer, James and Hume formulas, with FFMI and a 1.6-2.2 g/kg protein range.",
  steps: [
    "Choose \"Known body fat %\" or \"Height and weight formula\" under Calculate from, then pick your sex and kg / cm or lb / in units.",
    "Enter Weight and Height, plus either your Body fat (%) or a formula — Boer (1984), James (1976) or Hume (1966).",
    "Read your lean mass, fat mass, FFMI, height-adjusted FFMI and the 1.6-2.2 g per kg protein guide, then press Copy result.",
  ],
  "intro": "Lean Body Mass Calculator splits your body weight into lean mass and fat mass. Give it a body fat percentage you already know and it does the arithmetic directly; leave that out and it estimates lean mass from height, weight and sex using the Boer, James and Hume equations, showing all three side by side. It also reports fat-free mass index (FFMI), a height-adjusted FFMI and a protein range based on 1.6-2.2 g per kg of lean mass. Handy for lifters, coaches and anyone tracking a cut or a bulk.",
  "useCases": [
    "Convert a DEXA, caliper or smart-scale body fat reading into actual kilograms of muscle and fat.",
    "Set a protein target from lean mass instead of total weight, which is the more useful basis when carrying extra fat.",
    "Check whether a diet is costing you lean tissue by comparing lean mass across two weigh-ins."
  ],
  "benefits": [
    [
      "Two ways to calculate",
      "Use a measured body fat percentage for accuracy, or fall back on the classic Boer, James and Hume formulas."
    ],
    [
      "FFMI included",
      "Fat-free mass index and its height-adjusted version show how much muscle you carry for your frame."
    ],
    [
      "Metric and imperial",
      "Enter kilograms and centimetres or pounds and inches — the conversions happen behind the scenes."
    ]
  ],
  "faqs": [
    [
      "What is the Boer formula for lean body mass?",
      "For men, LBM = 0.407 × weight in kg + 0.267 × height in cm − 19.2; for women, LBM = 0.252 × weight + 0.473 × height − 48.3. It is a population estimate, widely used for weight-based drug dosing."
    ],
    [
      "Which is more accurate, the formula or my body fat percentage?",
      "A reliable body fat measurement always wins, because the formulas only see height, weight and sex and cannot tell a muscular person from a heavier one at the same weight."
    ],
    [
      "What is a good FFMI?",
      "Roughly 18-20 is typical for untrained men and 15-17 for untrained women; well-trained lifters often reach 22-24, and about 25 is the figure usually cited as the drug-free ceiling. Treat these as rough reference points, not targets."
    ],
    [
      "How much protein should I eat?",
      "Sports-nutrition reviews commonly suggest 1.6-2.2 g per kg of lean mass per day when training and dieting, which is the range this tool shows. It is general information — check with a dietitian or doctor about your own needs."
    ]
  ]
};

export default seo;
