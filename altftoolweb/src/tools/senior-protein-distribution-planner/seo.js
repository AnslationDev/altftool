const seo = {
  title: "Senior Protein Calculator: Daily Target by Meal",
  metaDescription:
    "Turn body weight into a PROT-AGE/ESPEN daily protein target, split across meals and checked against the 0.4 g/kg (25-30 g) per-meal dose.",
  steps: [
    "Enter Body weight (kg) and Age (years), then pick a Health situation — each option shows its g/kg/day band.",
    "Choose an Activity level and Main meals per day, and tick \"Carve out a pre-sleep milk, curd or casein feeding\" if you want a fourth occasion.",
    "Read the Meal-by-meal split table — Eating occasion, Protein, Share and \"Clears dose?\" — then press Copy plan.",
  ],
  intro:
    "The Senior Protein Distribution Planner converts an older adult's body weight into a daily protein target using the PROT-AGE and ESPEN bands — 1.0-1.2 g/kg/day when healthy, 1.2-1.5 g/kg/day with chronic illness or regular resistance training — and then splits that total across meals. Each meal is checked against the per-meal dose that research puts at roughly 0.4 g/kg or 25-30 g, the amount needed to overcome the blunted muscle-protein-synthesis response of older muscle. It is aimed at older adults, carers and family members who want to see whether the protein is landing in useful amounts rather than piled into one evening meal.",
  useCases: [
    "Check whether a 68-year-old parent eating a light breakfast and a large dinner is clearing the 25-30 g per-meal threshold at each sitting.",
    "Work out how much extra protein a 1.2 g/kg target adds on top of the plain 0.8 g/kg adult RDA before a hip or knee replacement rehab programme.",
    "Decide how to redistribute a fixed daily total across three meals plus a pre-sleep milk or curd feeding.",
    "Translate a per-meal gram target into everyday portions — eggs, curd, paneer, dal, chicken or a whey scoop — for a shopping list.",
  ],
  benefits: [
    [
      "Published bands, not guesses",
      "Targets come from the PROT-AGE (JAMDA 2013) and ESPEN (Clin Nutr 2014) expert positions on protein for people over 65.",
    ],
    [
      "Per-meal threshold check",
      "Flags every eating occasion that falls under roughly 0.4 g/kg, the dose associated with a full muscle-synthesis response in older adults.",
    ],
    [
      "Honest about kidney disease",
      "Selecting reduced kidney function shows the KDOQI 0.55-0.60 g/kg range and a clear instruction to follow the nephrologist's prescription instead.",
    ],
  ],
  faqs: [
    [
      "How much protein does a 70-year-old need per day?",
      "Most expert groups put healthy adults over 65 at 1.0-1.2 g of protein per kg of body weight per day, so about 70-84 g for a 70 kg person. That is well above the 0.8 g/kg RDA set for all adults, because ageing muscle responds less strongly to the same amount of protein.",
    ],
    [
      "Why does protein need to be spread across meals?",
      "Older muscle shows anabolic resistance: a small serving of 10-15 g produces little muscle protein synthesis, while roughly 0.4 g/kg — about 25-30 g for most people — produces a near-maximal response. Three meals each clearing that dose stimulate muscle three times a day, whereas one large dinner stimulates it once.",
    ],
    [
      "Is a high-protein diet safe for older adults?",
      "For older adults with normal kidney function, intakes of 1.0-1.5 g/kg/day are considered safe in the PROT-AGE and ESPEN reviews. Anyone with reduced kidney function needs an individually prescribed intake — KDOQI puts stable CKD stages 3-5 without dialysis at 0.55-0.60 g/kg/day — and should follow their nephrologist rather than a general calculator.",
    ],
    [
      "Does eating protein before bed help?",
      "Yes, in trials 30-40 g of slow-digesting protein such as casein, milk or curd taken shortly before sleep raised overnight muscle protein synthesis. The planner can carve that portion out of the daily total so it adds a fourth stimulus rather than extra calories.",
    ],
  ],
};

export default seo;
