const seo = {
  title: "Weight-Loss Protein Calculator",
  metaDescription:
    "Find the daily protein floor that protects lean mass in a deficit, using adjusted body weight above BMI 30 and comparing it to the 0.8 g/kg RDA.",
  steps: [
    "Enter Current weight (kg), Height (cm), Sex (for the ideal-weight formula) and Protein meals per day.",
    "Pick Activity and training — each option prints its own g/kg figure — and optionally enter 'Daily calorie target while dieting' to price the protein against your budget.",
    "Read the Daily protein floor in grams with BMI, Ideal body weight (Devine), Adjusted body weight, the RDA baseline and Calories left for carbs and fat, then press Copy result.",
  ],
  intro:
    "This calculator finds the daily protein floor that protects lean mass while you are eating in a calorie deficit — the amount below which weight loss starts costing you muscle as well as fat. It uses the 1.2-2.0 g per kg bands reported for energy-restricted diets, and from BMI 30 upward it scales to adjusted body weight (ideal weight plus a quarter of the excess) rather than scale weight, which is standard clinical practice because fat tissue does not create a protein requirement. It also compares the result against the 0.8 g/kg RDA so you can see how much of a step up it really is.",
  useCases: [
    "You are 95 kg, lifting three times a week and want a protein number that stops the scale drop coming out of muscle.",
    "You have a 1,600 kcal target and need to know how much of that budget protein will take before you plan carbs and fat.",
    "You are at BMI 38 and every calculator you have tried demands 200 g of protein a day, which you cannot eat.",
  ],
  benefits: [
    ["Realistic at high BMI", "Switches to adjusted body weight at BMI 30, so the target does not scale with fat mass."],
    ["Shows the gap", "Puts your floor side by side with the 0.8 g/kg RDA and the multiple between them."],
    ["Budget aware", "Enter your calorie target and see the protein share and what is left for carbs and fat."],
  ],
  faqs: [
    [
      "How much protein should I eat to lose weight without losing muscle?",
      "For most people in a deficit that is 1.2-1.6 g per kg of bodyweight per day, rising toward 1.8-2.0 g/kg if you also lift weights. That is roughly double the 0.8 g/kg RDA, which was set to prevent deficiency in weight-stable adults rather than to protect muscle during dieting.",
    ],
    [
      "Why does the calculator use adjusted body weight when BMI is over 30?",
      "Because fat mass has a very low protein turnover, so multiplying g/kg by full scale weight overstates the requirement. Clinical practice uses adjusted body weight — ideal weight plus 25% of the excess — which for a 100 kg, 160 cm woman gives about 64 kg instead of 100 kg, and a far more achievable target.",
    ],
    [
      "Does eating more protein actually help you lose fat?",
      "Indirectly, yes. Protein is the most satiating macronutrient and has the highest thermic effect, around 20-30% of its calories used in digestion, and it preserves fat-free mass so more of the loss comes from fat. It does not create a deficit on its own — total calories still decide whether you lose weight.",
    ],
    [
      "Can I lose weight faster by eating even more protein?",
      "No — beyond about 2 g/kg the extra protein mostly displaces other food rather than speeding fat loss, and losing more than roughly 1% of bodyweight a week tends to cost lean mass regardless of intake. If you have kidney disease or another chronic condition, get a protein target from your doctor or a registered dietitian rather than a calculator.",
    ],
  ],
};

export default seo;
