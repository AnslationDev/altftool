const seo = {
  intro:
    "The Post-Surgery Protein Calculator turns weight, height, age and the type of operation into an informational daily protein and energy estimate, using the ESPEN surgical guideline figure of about 1.5 g protein per kg per day and 25-30 kcal per kg per day. It is written for patients and carers who have been told to 'get enough protein' after an operation and want to see the actual grams behind that advice, split across the meals and supplements they manage in a day. Where BMI is 30 or above it switches to adjusted body weight, following ESPEN's advice not to dose protein on actual weight in obesity.",
  useCases: [
    "You are home after a hip replacement, the discharge sheet says to eat more protein, and you want a gram figure per meal rather than a vague instruction before you plan a shopping list.",
    "You are caring for a 78-year-old parent recovering from abdominal surgery and want to understand why the dietitian's number is higher than the usual healthy-adult guidance.",
    "You logged today's food, hit roughly 60 g of protein, and want to see how far short of the recovery estimate that leaves you before the next appointment.",
  ],
  benefits: [
    [
      "Bands tied to named guidelines",
      "Each surgery category carries its source — ESPEN hospital nutrition for minor procedures at 1.0-1.3 g/kg, ESPEN surgery at 1.5 g/kg for major operations, the ASPEN catabolic range up to 2.0 g/kg where there is an open wound or infection.",
    ],
    [
      "Handles the weight question properly",
      "It computes Devine ideal body weight and, above BMI 30, the adjusted body weight of IBW + 0.25 x (actual − IBW), rather than multiplying g/kg by scale weight and overshooting.",
    ],
    [
      "Answers the practical question",
      "The daily figure is divided across your chosen 3-8 meals or supplements, converted to kcal at 4 kcal per gram, and shown next to the total energy range so protein is not counted in isolation.",
    ],
  ],
  faqs: [
    [
      "How much protein do you need after surgery?",
      "The ESPEN clinical nutrition in surgery guideline puts surgical patients at about 1.5 g of protein per kg of body weight per day, with 25-30 kcal/kg/day of total energy. Minor day-case procedures sit lower, near 1.0-1.3 g/kg, while major surgery complicated by an open wound, pressure injury or infection can reach 1.5-2.0 g/kg. Your surgical team or dietitian sets the actual target for you.",
    ],
    [
      "Why does the calculator use a lower weight than mine?",
      "Because at a BMI of 30 or above it applies adjusted body weight: ideal body weight plus 25% of the difference between your actual and ideal weight. ESPEN advises against dosing protein on actual weight in obesity, and ideal weight comes from the Devine formula — 50 kg for men or 45.5 kg for women, plus 2.3 kg per inch of height over 5 feet.",
    ],
    [
      "Does age change the target?",
      "Yes — from age 65 the estimate is floored at 1.2 g/kg per day, following the ESPEN geriatric guideline for older adults with acute illness. So a 70-year-old after a minor procedure gets at least 1.2 g/kg even though the minor-surgery band starts at 1.0 g/kg.",
    ],
    [
      "Can I just eat protein and skip the calories?",
      "No — if total energy falls short, the body burns dietary protein for fuel instead of using it to rebuild tissue, which is why the tool shows a 25-30 kcal/kg/day energy range alongside the protein figure. These numbers are informational reproductions of published guideline bands, not a prescription; anyone recovering from surgery, especially with kidney disease or a restricted diet, should confirm targets with their surgical team or a registered dietitian.",
    ],
  ],
};

export default seo;
