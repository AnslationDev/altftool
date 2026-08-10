const seo = {
  title: "Keto Macro Calculator: Carbs First, Fat Last",
  metaDescription:
    "Sets net carbs first, protein per kg (or lean mass), and lets fat take the rest. Mifflin-St Jeor BMR, your goal, plus a per-meal gram split.",
  steps: [
    "Fill in Weight (kg), Age, Height, Activity level and Goal, then set the Net carb budget (g per day) — anything under 50 g counts as a standard ketogenic diet.",
    "Set Protein (g per kg of body weight), 1.6 g/kg by default, and add a Body fat % to switch the protein reference from scale weight to lean mass.",
    "Read the Daily calorie target with Fat, Protein and Net carbs in grams, kcal and % of energy plus a Per meal figure; Copy result copies the whole breakdown.",
  ],
  intro:
    "The Keto Macro Calculator sets a daily fat, protein and net carb target by fixing carbohydrate first, then protein, then letting fat take every remaining calorie — the order that keeps a ketogenic diet ketogenic. Calories come from the Mifflin-St Jeor equation for resting metabolic rate, multiplied by a standard activity factor and adjusted for your goal, with 4 kcal per gram of protein and carbohydrate and 9 kcal per gram of fat. Enter a body fat percentage and protein is set from lean mass instead of total weight.",
  useCases: [
    "Setting a first week of targets before starting a standard ketogenic diet at 20-25 g of net carbs.",
    "Working out how much fat to add to meals once protein is fixed at 1.6 g per kilogram.",
    "Checking whether a 500 kcal deficit still leaves enough fat calories to stay in ketosis.",
    "Splitting daily fat, protein and carb targets across two or three meals for a time-restricted eating window.",
  ],
  benefits: [
    ["Carbs fixed first", "Net carbs are a hard budget, not a leftover, which is the whole point of a ketogenic split."],
    ["Lean-mass protein option", "Enter body fat percentage and protein is calculated from lean body mass rather than scale weight."],
    ["Safety floor built in", "Targets are held at 1,200 kcal for women and 1,500 for men rather than returning an unsafe number."],
  ],
  faqs: [
    [
      "How many carbs can you eat on keto?",
      "A standard ketogenic diet is generally defined as under 50 g of net carbohydrate a day, and most people use 20-30 g to reach and hold ketosis reliably. Net carbs means total carbohydrate minus fibre (and, on most labels, sugar alcohols), because fibre is not absorbed as glucose.",
    ],
    [
      "How much protein should I eat on keto?",
      "Roughly 1.2-2.0 g per kilogram of body weight covers most people, with the higher end for those lifting weights or in a deficit; this calculator defaults to 1.6 g/kg. Very high protein — above about 35% of total energy — can make ketosis harder to hold and is flagged when your inputs reach it.",
    ],
    [
      "Why is fat the leftover macro on keto?",
      "Because carbohydrate has to stay under a fixed ceiling and protein is set by body size and training, fat is the only macro left to balance the calorie total. On a deficit your fat target will look low relative to the classic 70-75% figure — that is expected, because stored body fat supplies the difference.",
    ],
    [
      "Is a ketogenic diet safe for everyone?",
      "No. It interacts with diabetes medication (particularly insulin and SGLT2 inhibitors), and it is not appropriate in pregnancy or with certain kidney, liver, pancreatic or gallbladder conditions. This tool is informational only — talk to a doctor or registered dietitian before starting, and never adjust medication on your own.",
    ],
  ],
};

export default seo;
