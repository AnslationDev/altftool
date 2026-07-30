const seo = {
  intro:
    "The AI Medical Report Analyzer takes 23 common blood-test values across five panels — CBC, basic metabolic panel, liver function, thyroid and coagulation — compares each against a standard adult reference range, and labels it low, normal or high with the differential that abnormality usually points to. It then adds up a severity weight per abnormal result to place the set in a low, moderate, high or critical band and produces a plain-text report you can take to an appointment. It is an educational reference for reading your own lab printout, not a diagnosis, and every value stays in your browser.",
  useCases: [
    "Your results portal shows a potassium of 5.4 mEq/L with no comment, and you want to know which side of the 3.5–5.0 reference range that sits on before your callback",
    "You are a nursing or medical student practising panel interpretation and want to see which combinations of abnormal values push a case into the critical band",
    "You are collecting a year of lab printouts before a specialist visit and want one typed summary that lists every out-of-range value with its unit and label",
  ],
  benefits: [
    [
      "Live classification as you type",
      "Each field shows its reference range and labels the value the moment you enter it — Hypokalemia, Microcytic, Thrombocytopenia — rather than waiting for a submit button.",
    ],
    [
      "Severity weighting, not a flat count",
      "Hyperkalemia carries a weight of 3 while a mildly low BUN carries 0, so three trivial deviations do not outrank one dangerous result.",
    ],
    [
      "Panel-aware follow-up notes",
      "Abnormal potassium, creatinine, glucose, INR, haemoglobin, platelets, TSH and transaminases each trigger the specific next investigations clinicians normally order.",
    ],
  ],
  faqs: [
    [
      "Which lab values does it cover?",
      "23 in total: WBC, RBC, haemoglobin, haematocrit, platelets and MCV in the CBC; glucose, BUN, creatinine, sodium, potassium, chloride and calcium in the metabolic panel; ALT, AST, ALP, bilirubin and albumin for the liver; TSH and free T4 for thyroid; and PT, INR and PTT for coagulation. You can fill in as few or as many as you have.",
    ],
    [
      "What reference ranges does it use?",
      "One standard adult set — for example potassium 3.5–5.0 mEq/L, sodium 136–145 mEq/L, TSH 0.4–4.0 mIU/L, creatinine 0.7–1.3 mg/dL, fasting glucose 70–100 mg/dL and INR 0.8–1.1. Your own laboratory prints its own ranges, which vary by assay, sex, age and pregnancy, so always compare against the numbers on your report.",
    ],
    [
      "How is the overall risk band decided?",
      "By summing a 0–3 severity weight for every out-of-range value: a total of 0–2 reads as low risk, 3–6 moderate, 7–12 high and above 12 critical. Hyperkalemia is the only single finding weighted at 3, because of its arrhythmia risk.",
    ],
    [
      "Can this tell me what is wrong with me?",
      "No. It matches numbers to reference intervals and lists the conditions those intervals are associated with; it has no access to your symptoms, medications, history or the trend of previous results, all of which change what a value means. Take any flagged result to a qualified clinician, and treat a critical band as a reason to contact one promptly rather than to self-treat.",
    ],
  ],
};

export default seo;
