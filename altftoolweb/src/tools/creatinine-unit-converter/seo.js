const seo = {
  title: "Creatinine mg/dL–µmol/L Converter + CKD-EPI eGFR",
  metaDescription:
    "Convert serum creatinine between mg/dL and µmol/L with the 88.4 factor, check adult reference intervals, and estimate GFR via the CKD-EPI 2021 equation.",
  steps: [
    "Enter the 'Serum creatinine' value and choose the unit on the report — mg/dL or µmol/L.",
    "Pick the reference range to use and enter an age from 18 to 110, or leave 'Age in years' blank to skip the eGFR estimate.",
    "Read the converted value, its position against the reference interval and the CKD-EPI 2021 eGFR, then click 'Copy result'.",
  ],
  intro:
    "The Creatinine Unit Converter changes a serum creatinine result between mg/dL and micromoles per litre using the factor 88.4, which comes from creatinine's molar mass of 113.12 g/mol. It also places the result against the usual adult reference intervals and, if you add an age, estimates GFR with the race-free CKD-EPI 2021 creatinine equation published in the New England Journal of Medicine. mg/dL is standard in the US and India; µmol/L is used across the UK, Europe, Canada and Australia.",
  useCases: [
    "Read a UK report of 106 µmol/L when your previous results were recorded as 1.2 mg/dL.",
    "Compare a creatinine result taken abroad with one from your local laboratory.",
    "Estimate GFR from creatinine, age and sex using the current CKD-EPI 2021 equation rather than the older 2009 version.",
    "Check whether a value sits inside the typical adult reference interval before your appointment.",
  ],
  benefits: [
    ["One exact factor", "Multiplies by 88.4 in one direction and divides in the other, so results round-trip without drift."],
    ["Current eGFR equation", "Uses CKD-EPI 2021, which removed the race coefficient used in the 2009 formula."],
    ["Context, not just numbers", "Shows the typical reference interval and the KDIGO GFR category the estimate falls into."],
  ],
  faqs: [
    [
      "How do you convert creatinine from mg/dL to µmol/L?",
      "Multiply by 88.4. So 1.0 mg/dL is 88.4 µmol/L and 1.2 mg/dL is 106 µmol/L. Divide by 88.4 to convert micromoles per litre back to mg/dL.",
    ],
    [
      "What is a normal serum creatinine level?",
      "Typical adult intervals are roughly 0.74 to 1.35 mg/dL (65 to 119 µmol/L) for men and 0.59 to 1.04 mg/dL (52 to 92 µmol/L) for women. Intervals vary by laboratory and assay, so always compare against the range printed on your own report.",
    ],
    [
      "What is the CKD-EPI 2021 equation and why did it change?",
      "It estimates GFR from creatinine, age and sex: eGFR = 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1.200 × 0.9938^age, multiplied by 1.012 for females. The 2021 revision removed the race coefficient present in the 2009 equation, because race is a social rather than biological variable and the old adjustment could delay care.",
    ],
    [
      "Why can creatinine be high without kidney disease?",
      "Creatinine comes from muscle, so more muscle mass, a large meat intake, intense exercise or creatine supplements all raise it without any change in kidney function. Dehydration and some medicines, including trimethoprim and cimetidine, also raise the measured value. This is why a single result is interpreted alongside eGFR, urine albumin and your clinical picture rather than on its own.",
    ],
  ],
};

export default seo;
