const seo = {
  title: "BUN to Urea Converter — mg/dL, mmol/L & Creatinine Ratio",
  steps: [
    "Enter the Result value and pick the Reported unit — BUN (mg/dL), Urea (mg/dL) or Urea (mmol/L).",
    "Optionally fill 'Creatinine mg/dL' to switch on the BUN:creatinine ratio lines; the 'Converted result' panel recomputes as you edit.",
    "Read all three unit forms with the reference band and ratio band in 'Converted result', then click 'Copy output'.",
  ],
  intro:
    "The Urea and BUN Converter translates a kidney-function result between blood urea nitrogen in mg/dL, urea in mg/dL and urea in mmol/L. BUN counts only the nitrogen inside the urea molecule, so urea is 2.14 times the BUN figure — the ratio of urea's molar mass, 60.06 g/mol, to the 28.014 g/mol of its two nitrogen atoms. It also derives the BUN to creatinine ratio, which is read against the familiar 10:1 and 20:1 teaching bands.",
  useCases: [
    "Read a UK report of 5.0 mmol/L urea when your previous results were recorded as a BUN of 14 mg/dL.",
    "Convert an Indian report that lists 'blood urea' in mg/dL into the BUN figure a US clinician expects.",
    "Work out the BUN to creatinine ratio when only the two raw values are printed.",
    "Compare kidney results taken in two countries that use different reporting bases.",
  ],
  benefits: [
    ["Three formats at once", "BUN mg/dL, urea mg/dL and urea mmol/L are shown together, so nothing has to be chained by hand."],
    ["The right factor", "Uses 2.1439 for the urea-to-nitrogen step and 6.006 mg/dL per mmol/L, rather than a rounded shortcut."],
    ["Ratio included", "Adds the BUN to creatinine ratio in mg/dL, the basis on which the 10:1 and 20:1 bands are defined."],
  ],
  faqs: [
    [
      "What is the difference between urea and BUN?",
      "They measure the same substance on two different bases. BUN reports only the nitrogen content of urea, while a urea result reports the whole molecule, so urea equals BUN × 2.14. A BUN of 14 mg/dL is the same sample as a urea of 30 mg/dL, or 5.0 mmol/L.",
    ],
    [
      "How do you convert BUN in mg/dL to urea in mmol/L?",
      "Multiply the BUN by 0.357. So a BUN of 14 mg/dL is 5.0 mmol/L urea and a BUN of 20 mg/dL is 7.1 mmol/L. That single factor combines the 2.1439 urea-to-nitrogen mass ratio with the 6.006 mg/dL that make up 1 mmol/L of urea.",
    ],
    [
      "What is a normal BUN level?",
      "Most laboratories quote roughly 7 to 20 mg/dL for adults, which is about 2.5 to 7.1 mmol/L of urea. Intervals differ between laboratories and rise with age, so compare against the range printed on your own report.",
    ],
    [
      "What does a high BUN to creatinine ratio mean?",
      "A ratio above 20:1 is classically linked to prerenal causes — dehydration, heart failure, or a gastrointestinal bleed that delivers a protein load to the gut — while a ratio below 10:1 points more towards intrinsic kidney disease, a low-protein diet or liver disease. These are orientation bands rather than diagnostic rules, and they are read alongside eGFR, urine tests and the clinical picture.",
    ],
  ],
};

export default seo;
