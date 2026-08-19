const seo = {
  title: "Kids Water Intake Calculator: Holliday-Segar/EFSA",
  metaDescription:
    "Takes the higher of the 100/50/20 ml Holliday-Segar rule and the EFSA age intake, subtracts water from food, and adds an AAP sport top-up.",
  steps: [
    "Enter Age (years) and Extra months, Weight (kg), Sex (used from age 9 onwards) and Vigorous activity today (minutes).",
    "Tick \"Hot or humid conditions\" for the top of the AAP per-20-minute range; at 6 to 12 months the tool switches to the 120–240 ml plain-water band instead.",
    "Read the ml-per-day headline and cup count beside the EFSA guideline, Holliday-Segar figure, water from food and sport top-up rows, then press Copy result.",
  ],
  intro:
    "The Kids Water Intake Calculator gives a daily drinking target for a child by taking the higher of two published references: the Holliday-Segar maintenance rule of 100 ml/kg for the first 10 kg, 50 ml/kg for the next 10 kg and 20 ml/kg beyond that, and the EFSA adequate intake for total water at the child's age and sex. Because both figures describe total water including what food supplies, the tool subtracts the food share before reporting what a child should actually drink, then adds a sport top-up from American Academy of Pediatrics activity guidance. It is aimed at parents, carers and coaches who want a number grounded in a real rule rather than the vague 'eight glasses' advice.",
  useCases: [
    "Set a school-day water bottle target for a 25 kg eight-year-old who has a 60-minute games period.",
    "Check whether a tall, heavy 12-year-old needs more than the standard age guideline — the weight rule takes over when it exceeds the age figure.",
    "Work out what a teenager should carry to a hot afternoon football session using the published per-20-minute sport figures.",
  ],
  benefits: [
    [
      "Two references, not one guess",
      "Uses the higher of the Holliday-Segar weight rule and the EFSA age guideline, so neither small nor large children are short-changed.",
    ],
    [
      "Separates food water from drinks",
      "Roughly 20% of a child's water comes from food, so the drinking target is the beverage share rather than the whole figure.",
    ],
    [
      "Safe defaults for infants",
      "Blocks results under six months and shows the 120-240 ml plain-water range for 6-12 month olds instead of a misleading bottle target.",
    ],
  ],
  faqs: [
    [
      "How much water should a child drink a day?",
      "The EFSA adequate intakes for total water are 1,300 ml a day at 2-3 years, 1,600 ml at 4-8 years, 2,100 ml for boys and 1,900 ml for girls at 9-13 years, and 2,500 ml for boys and 2,000 ml for girls from 14. Those totals include water from food, so the amount to actually drink is roughly 80% of them — around 1,280 ml for a typical eight-year-old.",
    ],
    [
      "What is the Holliday-Segar formula for fluid?",
      "It is the standard paediatric maintenance rule: 100 ml per kg for the first 10 kg of body weight, 50 ml per kg for the next 10 kg, and 20 ml per kg for every kilogram above 20. A 25 kg child therefore needs 1,000 + 500 + 100 = 1,600 ml of total fluid a day. Published in 1957, it is still the basis of maintenance fluid orders in hospitals.",
    ],
    [
      "Can a 6-month-old baby drink water?",
      "Small amounts, yes — the American Academy of Pediatrics considers roughly 120-240 ml of water a day acceptable from six months, offered in sips with meals. Before six months babies should have only breast milk or formula, because plain water displaces the nutrition they need and can dilute their blood sodium. Confirm any amount with your paediatrician.",
    ],
    [
      "How much should kids drink during sport?",
      "The American Academy of Pediatrics suggests 100-250 ml every 20 minutes for children and 1.0-1.5 litres per hour for adolescents, with the higher end of each range in hot or humid conditions. Drinking on a schedule matters more than drinking to thirst, because children often stop feeling thirsty before they are fully rehydrated.",
    ],
  ],
};

export default seo;
