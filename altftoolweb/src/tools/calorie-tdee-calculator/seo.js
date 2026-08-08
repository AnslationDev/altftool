const seo = {
  title: "TDEE Calculator: BMR, Maintenance, Cut and Bulk",
  metaDescription:
    "Mifflin-St Jeor BMR times activity 1.2-1.9 gives maintenance, a 500 kcal cut, a 300 kcal lean gain and 1.6-2.2 g/kg protein, live as you type.",
  intro:
    "This TDEE calculator estimates your maintenance calories from the Mifflin-St Jeor BMR equation (10 × kg + 6.25 × cm − 5 × age, +5 for men or −161 for women) multiplied by an activity factor between 1.2 and 1.9, then shows a fat-loss target 500 kcal below maintenance, a lean-gain target 300 kcal above it, and a daily protein range of 1.6-2.2 g per kg of body weight. Every figure updates as you type, so you can watch what a change in activity level or 5 kg of body weight actually does to the numbers. It is a planning estimate for healthy adults, not a clinical measurement.",
  useCases: [
    "You are about to start a cut and need a defensible starting calorie ceiling plus a protein floor, rather than copying a number from a friend with a different body",
    "Your training has gone from three sessions a week to six and you want to see how much the activity multiplier alone shifts your maintenance",
    "You are lean-bulking and want a surplus small enough to limit fat gain, with the protein target that goes with it",
  ],
  benefits: [
    ["Four targets from one input set", "BMR, maintenance, cut and lean-gain calories appear together, so you can switch goals without re-entering anything."],
    ["Protein in grams per kilogram", "The 1.6-2.2 g/kg range reflects what resistance-training research supports for preserving lean mass, and is shown as an actual gram range for your weight."],
    ["Recalculates as you type", "Changing activity level or weight updates every figure instantly, which makes it easy to see how sensitive the estimate is to each input."],
  ],
  faqs: [
    [
      "What is my TDEE if I'm a 30-year-old man, 175 cm, 75 kg, training moderately?",
      "About 2,633 kcal. The BMR works out to roughly 1,699 kcal from Mifflin-St Jeor, and the moderate activity factor of 1.55 lifts it to maintenance. The tool would then suggest about 2,133 kcal for fat loss and 2,933 kcal for lean gain.",
    ],
    [
      "Which activity level should I choose?",
      "Match it to your whole week, not just gym days: 1.2 sedentary (desk job, little exercise), 1.375 light (1-3 sessions), 1.55 moderate (3-5), 1.725 very active (6-7), 1.9 athlete (physical job or twice-daily training). Most people overestimate here — the gap between 1.375 and 1.725 is around 600 kcal a day at a 1,700 kcal BMR.",
    ],
    [
      "Why is the fat-loss target 500 below but lean gain only 300 above?",
      "Because the two goals are not symmetric. A 500 kcal deficit tracks roughly 0.45 kg of loss per week, which is a widely used sustainable rate, while a surplus much beyond 300 kcal tends to add fat faster than the body can build muscle. A smaller surplus is the standard lean-bulk recommendation.",
    ],
    [
      "How much protein do I actually need?",
      "This tool shows 1.6-2.2 g per kg of body weight, which is the range typically cited for people training with resistance and aiming to keep or build lean mass — about 120-165 g for a 75 kg person. Sedentary adults need considerably less, and anyone with kidney disease or other medical conditions should get a target from a doctor or dietitian instead.",
    ],
  ],
};

export default seo;
