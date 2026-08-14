const seo = {
  title: "Flexitarian Macro Calculator with Weekly Meat Cap",
  metaDescription:
    "Daily calories and macros for plant-first eating, with the Beginner 26 oz, Advanced 18 oz and Expert 9 oz weekly meat caps and a 10% plant-protein uplift.",
  steps: [
    "Enter Sex (for the BMR equation), Age (years), Weight (kg) and Height (cm), then pick your Activity level and Goal.",
    "Choose a Flexitarian level — Beginner (2 days a week, 26 oz), Advanced (3-4 days, 18 oz) or Expert (5 or more days, 9 oz) — which fills 'Meat, poultry and fish (oz per week)' with that cap, then set 'One serving (oz)' and 'Usable protein target (g per kg)'.",
    "Read the Daily protein target with its split into '…from the meat allowance' and '…from plants (10% uplift applied)', the 'Fibre target (14 g per 1,000 kcal)' row and the Weekly meat plan naming the level your intake actually matches; Copy result copies the summary.",
  ],
  intro:
    "Flexitarian eating is plant-first with a capped weekly meat allowance rather than full vegetarianism, and its three published levels are defined by exactly that cap: Beginner allows up to 26 oz of meat a week over two meatless days, Advanced 18 oz over three to four, Expert 9 oz over five or more. This calculator turns your body size and activity into daily calories and macros, then splits the protein between that weekly allowance (1 oz of cooked meat ≈ 7 g protein) and plant sources, adding about 10% to the plant share to allow for lower protein digestibility. It also sets a fibre target of 14 g per 1,000 kcal, which is the Institute of Medicine adequate intake.",
  useCases: [
    "Moving from Beginner to Advanced and checking how much extra protein has to come from dal, tofu and nuts",
    "Planning a week where meat appears in four meals of 4 oz each and everything else is plant-based",
    "Seeing whether 18 oz of chicken a week plus lentils actually reaches 1.2 g of protein per kg",
  ],
  benefits: [
    ["Level caps built in", "Beginner, Advanced and Expert allowances applied as real numbers, not vague advice."],
    ["Plant-protein uplift", "Adds about 10% to the plant share so the usable protein still hits the target."],
    ["Tells you where you actually sit", "Compares your entered weekly ounces to all three caps and names the level it matches."],
  ],
  faqs: [
    [
      "What are the three flexitarian levels?",
      "Beginner is two meatless days a week with up to 26 oz of meat; Advanced is three to four meatless days with up to 18 oz; Expert is five or more meatless days with up to 9 oz. Nine ounces a week is roughly two modest servings, so the Expert level is close to vegetarian with occasional meat.",
    ],
    [
      "How much protein do flexitarians need?",
      "Around 1.0–1.4 g per kilogram of body weight for most adults, toward the upper end if you train. Because plant proteins score lower on digestibility-corrected scales, aim for roughly 10% more grams than an omnivore would to deliver the same usable protein — for a 65 kg person that is about 84 g rather than 78 g.",
    ],
    [
      "Which nutrients need watching as meat goes down?",
      "Vitamin B12, iron, zinc and long-chain omega-3s (EPA and DHA). B12 has an adult RDA of 2.4 µg a day and is essentially absent from plants, so it has to come from dairy, eggs, fortified foods or a supplement. Non-haem plant iron absorbs better alongside vitamin C.",
    ],
    [
      "Is flexitarian the same as semi-vegetarian?",
      "Effectively yes — both describe mostly-plant eating with occasional meat. The flexitarian version is more specific because it attaches a number to it: meatless days per week and a ceiling in ounces, which is what makes it possible to plan against rather than just aspire to.",
    ],
  ],
};

export default seo;
