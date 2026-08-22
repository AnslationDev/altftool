const seo = {
  title: "Senior Hydration Calculator: 30 mL/kg Target",
  metaDescription:
    "Daily fluid target for an older adult at 30 mL/kg with a 1,500 mL floor, plus fever, heat and activity add-ons and the EFSA drinks comparison.",
  steps: [
    "Enter Body weight (kg), Body temperature (°C), Sustained activity today (minutes) and Fluid taken so far today (mL), and tick Hot day or heatwave if it applies.",
    "Tick anything under Medicines and conditions that affect fluid balance, and enter a Doctor-set fluid restriction (mL, optional) if one has been prescribed — that figure replaces the calculation.",
    "Read the Daily fluid target with its Baseline (30 mL per kg) and EFSA adequate intake from drinks rows plus the In everyday servings table, then press Copy target.",
  ],
  intro:
    "The Senior Hydration Target Calculator sets a daily fluid figure for an older adult from the 30 mL per kilogram of body weight rule used in geriatric nutrition practice, with the 1,500 mL a day minimum that ESPEN treats as the floor for older adults. It then adds roughly 12% per degree of fever, 500 mL for a hot day and 500 mL per hour of sustained activity, and compares the result with the EFSA adequate intake from drinks of 2,000 mL for men and 1,600 mL for women. Medicines that alter fluid balance are flagged for discussion rather than silently added to the total.",
  useCases: [
    "Setting a written daily fluid figure for a 65 kg parent who says they are 'never thirsty' — about 1,950 mL, or ten 200 mL glasses.",
    "Working out how much extra to offer during a heatwave or a summer power cut.",
    "Adding the fever allowance during a chest infection, when older adults dehydrate fastest.",
    "Recording a doctor-prescribed 1,200 mL restriction for heart failure so the household plans around that number instead of a generic target.",
  ],
  benefits: [
    ["Weight-based, with a floor", "Uses 30 mL/kg but never falls below the 1,500 mL daily minimum, which matters for small or frail older adults."],
    ["Restrictions respected", "A clinician-set fluid restriction overrides the calculation instead of competing with it."],
    ["Medication prompts", "Diuretics, SGLT2 inhibitors, lithium, laxatives and anticholinergics are flagged with what each one changes."],
  ],
  faqs: [
    [
      "How much water should an elderly person drink a day?",
      "A common clinical estimate is 30 mL per kilogram of body weight, with a minimum of about 1,500 mL a day. That is roughly 1,950 mL for a 65 kg adult. EFSA's adequate intake from drinks is 2,000 mL for men and 1,600 mL for women. Anyone on a fluid restriction for heart or kidney disease must follow the figure their doctor sets instead.",
    ],
    [
      "Why do older adults get dehydrated more easily?",
      "Three changes stack up: the thirst signal blunts with age so dryness is felt later, total body water falls as muscle is lost, and the ageing kidney concentrates urine less efficiently so more water is lost. Reduced mobility and a fear of night-time toilet trips also cut intake, and several common medicines increase losses.",
    ],
    [
      "What are the first signs of dehydration in an older adult?",
      "Dark or strong-smelling urine, passing urine fewer than four times a day, a dry mouth and new confusion or drowsiness. In older adults, sudden confusion or unusual sleepiness is often the first thing anyone notices, and it warrants a same-day medical assessment rather than just a glass of water.",
    ],
    [
      "Do tea, coffee and milk count towards fluid intake?",
      "Yes. Tea, coffee, milk, soup, juice and even water-rich foods such as curd, watermelon and dal all contribute. The mild diuretic effect of caffeine at normal intakes does not cancel out the fluid in the cup. Roughly 20 to 30% of total water intake comes from food, which is why the from-drinks targets are lower than total water figures.",
    ],
  ],
};

export default seo;
