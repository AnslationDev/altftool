const seo = {
  intro:
    "Coronary Artery Disease Risk Calculator estimates two well-known 10-year cardiovascular risk figures side by side: ASCVD risk from a simplified approximation of the 2013 ACC/AHA Pooled Cohort Equations, and coronary heart disease risk from the Framingham point score. It takes age (20–79), sex, race, smoking status, diabetes, blood pressure category and whether it is treated, plus HDL and total cholesterol bands, and returns each risk as a percentage with its standard category. It is an educational illustration of how these published models weight risk factors — not a diagnosis, not a substitute for the official ACC/AHA calculator, and not a substitute for a clinician's assessment.",
  useCases: [
    "Your doctor mentioned your 10-year risk came out around 9 percent and suggested a statin, and you want to understand which of your inputs — the smoking, the blood pressure or the HDL — is driving that number.",
    "You are a nursing or medical student learning why the Pooled Cohort Equations and the Framingham score can disagree on the same patient, and want to run one profile through both.",
    "You quit smoking last year and want to see how the models treat current versus never smoking while everything else on your last lipid panel stays the same.",
  ],
  benefits: [
    ["Two published models, one profile", "The Pooled Cohort Equations and the Framingham point score are computed from the same inputs, so you can see where they diverge instead of trusting a single figure."],
    ["Category thresholds are named, not implied", "Results are labelled against the standard ASCVD bands — low, borderline, intermediate, high — so the percentage arrives with the interpretation clinicians actually use."],
    ["Cholesterol and BP entered as bands", "You pick the range from your last reading rather than needing exact lab values, which makes the estimate usable when you only remember the category you were told."],
  ],
  faqs: [
    [
      "What counts as high 10-year ASCVD risk?",
      "Under the ACC/AHA categories, below 5 percent is low, 5 to 7.4 percent is borderline, 7.5 to 19.9 percent is intermediate, and 20 percent or more is high. The 7.5 percent mark is the threshold at which guidelines begin discussing statin therapy, alongside risk-enhancing factors — that decision belongs with your doctor.",
    ],
    [
      "What is the difference between the ASCVD and Framingham scores?",
      "The Pooled Cohort Equations estimate the 10-year risk of a first hard atherosclerotic event — heart attack or stroke — and include race and diabetes as inputs. The Framingham score here estimates 10-year coronary heart disease risk only, from age, sex, cholesterol, HDL, blood pressure and smoking, so it usually gives a different number for the same person.",
    ],
    [
      "Why does it only accept ages 20 to 79?",
      "Because that is the range the underlying models were derived and validated over; the Pooled Cohort Equations in particular are intended for adults roughly 40 to 79 without existing cardiovascular disease. Outside that range the equations have no supporting data, so no estimate is produced.",
    ],
    [
      "Can I use this instead of seeing a doctor?",
      "No. It is an informational calculator using simplified implementations of published equations, and it cannot account for family history, coronary calcium scoring, chronic kidney disease, inflammatory conditions, existing cardiovascular disease or your medications. Discuss any result — and any chest pain, breathlessness or new symptoms — with a qualified clinician.",
    ],
  ],
};

export default seo;
