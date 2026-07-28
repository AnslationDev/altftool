const seo = {
  intro:
    "The Weight-Based Dose Converter turns a prescription written per kilogram — for example 30 mg/kg/day in three divided doses — into the actual milligrams for one body weight, then into a millilitre volume when the medicine is a liquid. It works from the plain arithmetic dose = strength per kg × weight in kg, converts pounds using the exact 0.45359237 kg factor, and divides by the number of doses per day. It is a calculation aid for carers and students, not a drug reference: it holds no dose limits of its own.",
  useCases: [
    "Work out how many millilitres of a 250 mg in 5 mL syrup a 20 kg child needs when the instruction is 30 mg/kg/day in three doses.",
    "Convert a US prescription written for a weight in pounds into the kilogram-based figure on an Indian or UK label.",
    "Check a per-dose instruction against a maximum single dose printed on the packaging before giving it.",
    "See the interval between doses that a four-times-a-day schedule actually implies.",
  ],
  benefits: [
    ["Both dosing styles", "Handles per-day totals split into divided doses and straight per-dose instructions."],
    ["Volume as well as milligrams", "Enter the liquid strength as mg in mL and get the syringe volume, rounded to the 0.1 mL mark."],
    ["Your own ceilings", "Optional single-dose and daily maximums are flagged clearly instead of being silently ignored."],
  ],
  faqs: [
    [
      "How do I calculate a mg/kg dose?",
      "Multiply the prescribed milligrams per kilogram by the body weight in kilograms. A 30 mg/kg/day instruction for a 20 kg child is 600 mg a day, which is 200 mg per dose when it is split into three. If the figure is written per dose rather than per day, multiply by the number of doses to get the daily total.",
    ],
    [
      "How do I convert pounds to kilograms for dosing?",
      "Divide pounds by 2.2046, or multiply by 0.45359237, which is the exact definition of the international pound. So 44 lb is 19.96 kg — using a rounded 20 kg would change a 15 mg/kg dose by about 0.6 mg.",
    ],
    [
      "How do I turn a milligram dose into millilitres of syrup?",
      "Divide the dose in milligrams by the concentration in milligrams per millilitre. A 250 mg in 5 mL suspension is 50 mg/mL, so a 100 mg dose is 2 mL. Always read the strength from the bottle you actually have, because the same medicine is sold in several strengths.",
    ],
    [
      "Is it safe to work out a child's dose myself?",
      "Use a calculation like this only to check a dose that has already been prescribed or is printed on the label, never to decide one. Dosing depends on the drug, the indication, kidney and liver function and the maximum limits for that product. Confirm every paediatric dose with a pharmacist or prescriber.",
    ],
  ],
};

export default seo;
