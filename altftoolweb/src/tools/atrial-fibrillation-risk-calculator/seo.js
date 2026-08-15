const seo = {
  title: "Atrial Fibrillation Risk Score: 14 Points, 4 Bands",
  metaDescription:
    "Tick age, BMI, hypertension, diabetes, heart failure, LVH and more for a score out of 14 in four bands — Low to Very High — with a text report to export.",
  steps: [
    "Tick the Clinical Risk Factors that apply — Age 65–74 (+2) or Age ≥ 75 (+4), Male Sex (+1) or Female Sex (−1), BMI ≥ 30 kg/m², Hypertension, Diabetes Mellitus, Heart Failure, LVH on ECG, Vascular Disease, Current Smoking — age, sex and race allow only one choice each.",
    "Tick any of the six Modifiable Risk Factors you intend to manage, such as Blood Pressure Control or Sleep Apnea Treatment, then press Assess AF Risk.",
    "The gauge shows the score out of 14 with its band — Low 0–2, Moderate 3–4, High 5–7, Very High 8–14 — beside the factors present with their points, a Prevention Action Plan and Screening Recommendations; Download saves AF_Risk_Report_<score>.txt and Copy Report copies the same text.",
  ],
  intro:
    "The Atrial Fibrillation Risk Calculator turns the risk factors used in CHARGE-AF style community models — age, sex, race, BMI, height, hypertension, diabetes, heart failure, ECG left ventricular hypertrophy, vascular disease and current smoking — into a simplified score out of 14 and places it in one of four bands. Age carries the most weight (+2 for 65-74 and +4 for 75 and over), most other factors add 1 point, and female sex subtracts 1. It also lets you tick the modifiable factors you intend to work on and exports the whole assessment as a text report to bring to an appointment.",
  useCases: [
    "You are 68 with treated hypertension and a BMI over 30, and want a structured sense of how those stack up before a routine cardiology appointment.",
    "A relative was diagnosed with AF and you want to see which of your own risk factors are the modifiable ones — blood pressure, weight, alcohol, smoking, sleep apnoea — rather than the fixed ones.",
    "You are preparing questions for a GP visit and want a one-page printout listing the factors you ticked and what each contributed to the total.",
  ],
  benefits: [
    ["Separates fixed from modifiable factors", "Age, sex and race are scored but flagged as unchangeable, while blood pressure, weight, exercise, alcohol, smoking and sleep apnoea are listed separately as the ones an intervention can move."],
    ["Shows the arithmetic, not just a verdict", "Every selected factor is listed with its own point value alongside the total, so you can see exactly which entries produced the band you landed in."],
    ["Produces a report you can take to a clinician", "The selected factors, score, band and suggested discussion points export as a plain text file rather than staying trapped in the page."],
  ],
  faqs: [
    [
      "What score means high risk of atrial fibrillation?",
      "In this simplified 14-point scheme, 0-2 is Low, 3-4 Moderate, 5-7 High and 8-14 Very High, with indicative annual AF incidence of under 1%, 1-3%, 3-5% and over 5% respectively. These are broad bands from population data, not a prediction for any individual.",
    ],
    [
      "Why does age count for so much more than the other factors?",
      "Because age is the strongest single predictor of atrial fibrillation in every major cohort study. Here age 65-74 adds 2 points and age 75 or over adds 4, out of a 14-point maximum — a person over 75 starts more than a quarter of the way up the scale before any other factor is counted.",
    ],
    [
      "Which risk factors can I actually change?",
      "The tool separates six: blood pressure control (target below 130/80 mmHg), weight (BMI 18.5-24.9), at least 150 minutes a week of moderate exercise, alcohol at no more than one drink a day, complete smoking cessation, and treating diagnosed sleep apnoea, typically with CPAP. Population studies attribute a large share of AF cases to factors in this group.",
    ],
    [
      "Can this tell me whether I have AF?",
      "No. It estimates the likelihood of developing atrial fibrillation from risk factors; it cannot detect an arrhythmia, which requires an ECG or extended rhythm monitoring. This is an informational screening aid only — if you have palpitations, breathlessness, chest pain or fainting, seek medical attention, and discuss any score with your doctor rather than acting on it alone.",
    ],
  ],
};

export default seo;
