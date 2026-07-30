const seo = {
  intro:
    "Lipid Risk Calculator converts four lab values — total cholesterol, LDL, HDL and triglycerides in mg/dL — into the derived figures a lipid panel is usually judged on: the TC/HDL ratio (desirable under 5.0), the LDL/HDL ratio (desirable under 3.0), non-HDL cholesterol, and a 0–10 composite score that adds points for each value outside its NCEP ATP III band. It is for anyone holding a printout of numbers with no interpretation attached and wanting to see where each one falls. The output is educational; what to do about it is a conversation with your doctor.",
  useCases: [
    "Working out your cholesterol ratio from a printout that lists only the raw values, without hand-dividing total by HDL",
    "Checking whether a total cholesterol of 210 is actually a concern once you see that it is paired with an HDL of 70 and a TC/HDL ratio under 3.0",
    "Recording a before-and-after comparison after six months of diet or medication changes, using the same four inputs and the same 0–10 score both times",
  ],
  benefits: [
    ["Ratios computed and banded", "TC/HDL and LDL/HDL appear on a gauge with the desirable thresholds of 5.0 and 3.0 marked, so the number arrives with its own context."],
    ["One score from four values", "The composite adds points for total cholesterol, HDL, LDL, triglycerides and the LDL/HDL ratio, capped at 10, so a single mildly-off value does not read the same as four."],
    ["Every threshold is stated", "The full ATP III cut-points are printed in the exported report, so you can see exactly which boundary put a value in its band."],
  ],
  faqs: [
    [
      "What is a good cholesterol ratio?",
      "A TC/HDL ratio below 5.0 is generally described as desirable and an LDL/HDL ratio below 3.0 likewise; lower is better in both cases. The gauges here turn amber above 4 and red above 5, which is where the score starts adding points.",
    ],
    [
      "What triglyceride level is too high?",
      "Under 150 mg/dL is normal, 150–199 borderline high, 200–499 high, and 500 mg/dL or above very high — the level at which pancreatitis risk, not just cardiovascular risk, becomes a concern. Triglycerides are strongly affected by recent food and alcohol, so a non-fasting sample can read misleadingly high.",
    ],
    [
      "How is the 0–10 lipid risk score calculated?",
      "Points are added for each abnormal value: up to 2 for total cholesterol above 200 or 240, up to 2 for HDL under 50 or 40, up to 3 for LDL above 130, 160 or 190, up to 3 for triglycerides above 150, 200 or 500, and up to 2 for an LDL/HDL ratio above 4 or 5, capped at 10. It is a simple additive summary of your panel, not a validated 10-year event risk equation like the Pooled Cohort or Framingham scores.",
    ],
    [
      "Can I use this to decide about statins?",
      "No. This tool only classifies numbers against published thresholds; prescribing decisions depend on your overall cardiovascular risk, age, family history, other conditions and current medication. Bring the numbers to a clinician and let them decide.",
    ],
  ],
};

export default seo;
