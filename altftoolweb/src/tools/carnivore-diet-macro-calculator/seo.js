const seo = {
  title: "Carnivore Macro Calculator: Fat-to-Protein Ratio",
  metaDescription:
    "Protein in g/kg, fat taking the rest of your Mifflin-St Jeor calories, plus the fat-to-protein ratio, a 35% protein ceiling check and matching cuts.",
  steps: [
    "Enter Sex (for the BMR equation), Age (years), Weight (kg), Height (cm), Activity level and Goal.",
    "Set Protein (g per kg of body weight), then Carbohydrate allowance (g), which starts at 0 g and accepts up to 20 g for the trace carbohydrate in liver, dairy or eggs.",
    "Read the Fat to protein ratio by weight headline with the Protein, Fat and Carbohydrate cards, the Protein share of energy row against the 35% ceiling, and the Cuts against your targets table, then press Copy result.",
  ],
  intro:
    "The Carnivore Diet Macro Calculator works out the two numbers that matter when carbohydrate is zero: a daily protein target in grams per kilogram of body weight, and the fat that must sit alongside it to reach your calorie goal. Calories come from the Mifflin-St Jeor equation multiplied by an activity factor and adjusted for your goal; protein is set first and fat takes every remaining calorie at 9 kcal per gram. It reports the resulting fat-to-protein ratio by weight, warns when protein passes 35% of energy, and shows which cuts naturally land closest to your ratio.",
  useCases: [
    "Finding the fat-to-protein ratio your calorie target implies before choosing between ribeye and lean mince.",
    "Working out how much butter or tallow to add when a lean cut leaves you short on fat.",
    "Checking whether a high protein target on a steep deficit pushes protein past a safe share of energy.",
    "Comparing how many grams of eggs, salmon or ground beef it takes to reach the same protein number.",
  ],
  benefits: [
    ["Ratio-first thinking", "Reports fat per gram of protein — the number carnivore eaters actually shop by."],
    ["Cut matching", "Ten common animal foods ranked by how closely their natural ratio matches your target."],
    ["Protein ceiling check", "Flags protein above 35% of energy, the threshold associated with protein poisoning on very lean meat."],
  ],
  faqs: [
    [
      "What is the right fat to protein ratio on a carnivore diet?",
      "Most people land between 1:1 and 2:1 grams of fat per gram of protein, and the exact figure falls out of your calorie target rather than being chosen. For a 90 kg person eating 162 g of protein at about 2,900 kcal, the arithmetic gives roughly 253 g of fat, or about 1.56 g of fat per gram of protein.",
    ],
    [
      "Can you eat too much protein on a carnivore diet?",
      "Yes. Sustained protein above roughly 35% of total energy is the level associated with protein poisoning, historically called rabbit starvation, which is what happens when only very lean meat is available. On an all-meat diet fat is what keeps protein below that share, so lean cuts generally need added fat.",
    ],
    [
      "How much meat do you need to eat on carnivore?",
      "More than most people expect. Hitting 162 g of protein takes about 675 g of ribeye or roughly 625 g of 80/20 ground beef, and the ribeye still leaves you around 110 g of fat short of a 253 g target — about 138 g of butter's worth. Planning by weight rather than by plate avoids under-eating fat.",
    ],
    [
      "Do you need any carbohydrate on a carnivore diet?",
      "The body can make the glucose it needs through gluconeogenesis, so a strict zero-carbohydrate intake is possible, and this calculator defaults to 0 g with an allowance up to 20 g for the trace carbohydrate in liver, eggs and dairy. That said, an all-animal diet removes fibre and most dietary vitamin C and folate — this tool is informational only, and a doctor or registered dietitian should be involved before you start.",
    ],
  ],
};

export default seo;
