const seo = {
  intro:
    "Lipid Profile Analyzer takes the four numbers from a standard lipid panel — total cholesterol, LDL, HDL and triglycerides in mg/dL — and classifies each one against the NCEP ATP III cut-points, then adds your age, sex, smoking, diabetes and blood-pressure status to list the risk factors that sit alongside those results. It also derives non-HDL cholesterol (total minus HDL), the TC/HDL and LDL/HDL ratios, and a 0–10 composite lipid score with plain-language notes on what usually gets addressed first. It is an educational reading of a lab report, not a diagnosis — treatment decisions belong with the clinician who ordered the test.",
  useCases: [
    "Reading a lab report before a follow-up appointment so you arrive knowing whether your LDL sits in the 130–159 borderline band or above 160, and what to ask about",
    "Seeing how a risk factor you already have — smoking, diabetes or high blood pressure — changes how seriously the same cholesterol numbers are usually taken",
    "Comparing this year's panel against last year's by entering both and watching the non-HDL figure and the TC/HDL ratio move, not just the headline total",
  ],
  benefits: [
    ["Risk factors sit next to the numbers", "Age, sex, smoking, diabetes and hypertension are collected and listed with the lipid values, because the same LDL means different things in different people."],
    ["Non-HDL and both ratios, not just LDL", "Total minus HDL, TC/HDL and LDL/HDL are all derived and banded, which is often where a 'normal-looking' panel shows a problem."],
    ["A copyable written summary", "The full classification, ratios, score and risk-factor list export as plain text you can paste into a note or take to an appointment."],
  ],
  faqs: [
    [
      "What LDL level is considered high?",
      "Under NCEP ATP III, LDL below 100 mg/dL is optimal, 100–129 near optimal, 130–159 borderline high, 160–189 high, and 190 mg/dL or above very high. Where your personal target sits within those bands depends on your other risk factors, which is a decision for your doctor.",
    ],
    [
      "What is non-HDL cholesterol and why does it matter?",
      "Non-HDL cholesterol is total cholesterol minus HDL, and it is banded here at 100, 130, 160 and 190 mg/dL — conventionally 30 mg/dL above the matching LDL band. It captures every atherogenic particle rather than LDL alone, which is why it stays informative when triglycerides are high and a calculated LDL becomes unreliable.",
    ],
    [
      "Is a low HDL a problem on its own?",
      "HDL below 40 mg/dL counts as a cardiovascular risk factor in its own right, 40–59 is intermediate, and 60 mg/dL or above is treated as protective — high enough to cancel out one other risk factor in the ATP III framework. The tool flags an HDL under 40 in the risk-factor list even when every other value looks fine.",
    ],
    [
      "Does this replace a doctor's assessment?",
      "No. It classifies your numbers against published thresholds and shows the arithmetic; it does not know your family history, medications, kidney or thyroid function, or whether the sample was fasting. Use it to understand a report and prepare questions, and take any treatment decision to a qualified clinician.",
    ],
  ],
};

export default seo;
