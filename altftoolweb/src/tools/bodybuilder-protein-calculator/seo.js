const seo = {
  title: "Bodybuilder Protein Calculator: Daily and Per Meal",
  metaDescription:
    "Daily protein from 1.6-2.2 g/kg for a bulk or 2.3-3.1 g/kg fat-free mass on a cut, split into meals that each clear the 0.4 g/kg dose.",
  steps: [
    "Enter 'Bodyweight (kg)' and, for a cutting block, 'Body fat % (optional)' so the target can be based on fat-free mass.",
    "Pick a 'Training phase', set 'Protein meals per day' and choose the 'Main protein source (for the leucine estimate)' — mixed animal, whey or a soy/pea plant blend.",
    "Read the 'Daily protein target' in grams, the per-meal dose against the 0.4 g/kg threshold, and the Meal-by-meal plan's Protein and Leucine columns.",
  ],
  intro:
    "This calculator turns your bodyweight, body-fat percentage and training phase into a daily protein target and a per-meal dose sized for muscle growth. It targets 1.6-2.2 g per kg bodyweight while bulking and 1.6-2.0 g per kg while maintaining muscle, switches to the 2.3-3.1 g per kg fat-free mass range used when dieting down, and then divides the total using the 0.4 g/kg per-meal dose that maximises muscle protein synthesis. It is aimed at lifters running a structured bulk, cut or maintenance block who want the distribution right, not just the daily number.",
  useCases: [
    "You are 12 weeks out from a contest at 90 kg and 12% body fat and need a protein floor based on lean mass rather than scale weight.",
    "You eat six times a day out of habit and want to know whether each of those feedings is actually large enough to trigger muscle protein synthesis.",
    "You are switching from a whey-heavy diet to plant protein and need to see how the per-meal leucine dose changes.",
  ],
  benefits: [
    ["Phase-aware", "Bulking and maintenance use bodyweight; cutting switches to fat-free mass, as the research does."],
    ["Distribution, not just totals", "Checks every meal against the 0.4 g/kg dose and the ~2.5 g leucine trigger."],
    ["Flags the real problem", "Tells you when too many small meals are diluting the per-meal dose, and how many you should eat instead."],
  ],
  faqs: [
    [
      "How much protein does a bodybuilder need per day?",
      "This calculator targets 1.6-2.2 g per kg of bodyweight per day while bulking and 1.6-2.0 g per kg while maintaining, so an 85 kg lifter lands around 136-187 g on a bulk (target 153 g) or 136-170 g at maintenance. Intakes at the top of that band, or above it, mainly help when you are also in a calorie deficit.",
    ],
    [
      "How much protein can the body use in one meal?",
      "There is no hard cap on absorption, but about 0.4 g per kg bodyweight per meal — roughly 34 g for an 85 kg lifter — is the dose that maximally stimulates muscle protein synthesis. Eating far more in one sitting is not wasted, it is just used for energy or other tissues rather than adding to that MPS response.",
    ],
    [
      "Why does cutting use fat-free mass instead of bodyweight?",
      "Because fat tissue does not need feeding and scale weight overstates the requirement in anyone carrying extra fat. Research on lean, resistance-trained dieters points to 2.3-3.1 g per kg of fat-free mass to protect muscle in a deficit, which is why the calculator asks for body-fat percentage before using that band.",
    ],
    [
      "Is very high protein intake safe?",
      "In healthy adults with normal kidney function, controlled studies of intakes above 2 g/kg for months have not shown harm to kidney or bone health. That evidence does not extend to people with kidney or liver disease, so anyone with an existing condition, or who is pregnant, should get individual advice from a doctor or registered dietitian.",
    ],
  ],
};

export default seo;
