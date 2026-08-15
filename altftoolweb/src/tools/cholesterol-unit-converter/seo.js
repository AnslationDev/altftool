const seo = {
  title: "Cholesterol mg/dL to mmol/L Converter - Full Panel",
  metaDescription:
    "Convert a lipid panel both ways - 38.67 for cholesterol, 88.57 for triglycerides - with non-HDL, the ratio and a Friedewald LDL estimate.",
  steps: [
    "Pick the Entered unit (mg/dL or mmol/L) and type Total cholesterol, HDL cholesterol and Triglycerides from your report. [pages/index.jsx:33-42; lib.js:30-33]",
    "Leave 'LDL cholesterol (optional)' blank to estimate it - its placeholder reads 'Leave blank to estimate' - and set the HDL reference to Male or Female. [pages/index.jsx:43-49; lib.js:73-76]",
    "Read the 'Converted lipid panel' with every value in both units plus Non-HDL cholesterol and the Total / HDL ratio, then press Copy output. [pages/index.jsx:51-64; _shared/QuickToolPage.jsx:91-116]",
  ],
  intro:
    "The Cholesterol Unit Converter changes a full lipid panel between mg/dL and mmol/L, using 38.67 mg/dL per mmol/L for total, LDL, HDL and non-HDL cholesterol and 88.57 mg/dL per mmol/L for triglycerides. Those two factors differ because cholesterol and triglycerides are different molecules, which is the single most common error when converting a report by hand. It also derives non-HDL cholesterol, the total-to-HDL ratio and, if LDL was not measured, the Friedewald estimate.",
  useCases: [
    "Read an Indian or US lab report in mg/dL when your clinician works in mmol/L, or the reverse.",
    "Work out non-HDL cholesterol, which many reports omit, from total cholesterol and HDL.",
    "Estimate LDL from total, HDL and triglycerides when the report only lists the other three.",
    "Compare this year's panel with an older one that was reported in the other unit system.",
  ],
  benefits: [
    ["Two correct factors", "Cholesterol uses 38.67 and triglycerides use 88.57 — the tool never applies one factor to the whole panel."],
    ["Derived values included", "Non-HDL cholesterol and the total-to-HDL ratio are calculated for you, not just converted."],
    ["Friedewald limits respected", "The LDL estimate is withheld once triglycerides reach 400 mg/dL, where the equation stops being valid."],
  ],
  faqs: [
    [
      "How do you convert cholesterol from mg/dL to mmol/L?",
      "Divide the mg/dL value by 38.67. So 200 mg/dL total cholesterol is 5.2 mmol/L, and 100 mg/dL LDL is 2.6 mmol/L. Multiply by 38.67 to go the other way.",
    ],
    [
      "Why do triglycerides use a different conversion factor?",
      "Because a triglyceride molecule is far heavier than a cholesterol molecule — about 885 g/mol against 387 g/mol — so 1 mmol/L of triglycerides weighs 88.57 mg/dL rather than 38.67. Using the cholesterol factor on triglycerides overstates the mmol/L value by more than double.",
    ],
    [
      "What is the Friedewald equation and when does it stop working?",
      "LDL = total cholesterol − HDL − triglycerides/5, all in mg/dL (divide triglycerides by 2.2 if working in mmol/L). It was published in 1972 and is still used by most labs, but it becomes unreliable once triglycerides reach 400 mg/dL (about 4.5 mmol/L), and it also underestimates LDL at very low LDL levels — in those cases LDL should be measured directly.",
    ],
    [
      "What is non-HDL cholesterol and why does it matter?",
      "Non-HDL cholesterol is total cholesterol minus HDL, so it captures every cholesterol-carrying particle linked to atherosclerosis, not just LDL. It does not need a fasting sample and is often used alongside or instead of LDL, with under 130 mg/dL (3.4 mmol/L) described as desirable in the ATP III bands. Your own target depends on your overall risk, so discuss it with your clinician.",
    ],
  ],
};

export default seo;
