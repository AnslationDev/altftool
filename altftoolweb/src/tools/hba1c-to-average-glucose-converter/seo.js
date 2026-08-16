const seo = {
  title: "HbA1c to Average Glucose: %, mmol/mol, mg/dL",
  metaDescription:
    "Convert HbA1c between DCCT %, IFCC mmol/mol and eAG in mg/dL or mmol/L using the ADAG equation eAG = 28.7 × A1C − 46.7. 7% = 53 mmol/mol, 154 mg/dL.",
  steps: [
    "Choose the Input format — HbA1c DCCT/NGSP (%), HbA1c IFCC (mmol/mol), or Average glucose in mg/dL or mmol/L — and type your result in the Value field.",
    "The converter applies eAG = 28.7 × A1C − 46.7 and IFCC = (DCCT − 2.15) × 10.929 as you type; results outside the 4–12% ADAG span are marked 'Outside ADAG derivation'.",
    "Read the other three formats in the IFCC, eAG and eAG mmol/L cards along with the ADA band label; Reset restores the 7.0% example.",
  ],
  intro:
    "The HbA1c to Average Glucose Converter translates a glycated haemoglobin result between the four formats laboratories use: DCCT/NGSP percent, IFCC mmol/mol, and estimated average glucose in mg/dL or mmol/L. It applies the ADAG regression published by Nathan and colleagues in Diabetes Care (2008), eAG = 28.7 × A1C − 46.7 mg/dL, together with the NGSP master equation IFCC = (DCCT − 2.15) × 10.929. An HbA1c of 7.0% therefore equals 53 mmol/mol and an average glucose of about 154 mg/dL or 8.6 mmol/L.",
  useCases: [
    "Translate a UK or European report given as 53 mmol/mol into the 7.0% figure your clinician quotes.",
    "See what average glucose an HbA1c of 8.2% corresponds to, so meter readings and lab results can be compared.",
    "Work backwards from a meter's 90-day average glucose to the HbA1c it roughly implies.",
    "Check where a result sits against the 5.7% and 6.5% ADA diagnostic thresholds.",
  ],
  benefits: [
    ["Four-way conversion", "Enter any one of the four formats and the other three are derived from the same equations."],
    ["Published equations", "Uses the ADAG regression and the NGSP master equation rather than a rounded lookup table."],
    ["Range honesty", "Flags results outside the roughly 4% to 12% span the ADAG study covered, where eAG is an extrapolation."],
  ],
  faqs: [
    [
      "What average blood sugar does an HbA1c of 7% mean?",
      "About 154 mg/dL, or 8.6 mmol/L, using the ADAG equation eAG = 28.7 × A1C − 46.7. That is an average across roughly the previous three months, so individual meter readings will sit both above and below it through the day.",
    ],
    [
      "How do you convert HbA1c percent to mmol/mol?",
      "Subtract 2.15 from the percentage and multiply by 10.929. So 6.5% becomes (6.5 − 2.15) × 10.929 = 48 mmol/mol, and 7.0% becomes 53 mmol/mol. Divide by 10.929 and add 2.15 to convert back.",
    ],
    [
      "What HbA1c level indicates diabetes?",
      "6.5% (48 mmol/mol) or above on a properly validated assay meets the ADA diagnostic threshold, normally confirmed with a repeat test. 5.7% to 6.4% (39 to 47 mmol/mol) is the prediabetes range, and below 5.7% is normal. Diagnosis is your clinician's to make, not a calculator's.",
    ],
    [
      "Why does my meter average not match my HbA1c?",
      "Estimated average glucose is a population regression, and the ADAG study found a real spread around it — two people with the same HbA1c can have genuinely different average glucose. Meter averages are also biased by when you happen to test, and conditions affecting red cell lifespan such as anaemia, haemoglobin variants, recent transfusion, pregnancy or chronic kidney disease shift HbA1c independently of glucose.",
    ],
  ],
};

export default seo;
