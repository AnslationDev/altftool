const seo = {
  title: "qSOFA Score Calculator - Sepsis-3 Bedside Criteria",
  metaDescription:
    "Scores the three Sepsis-3 criteria - RR 22+, systolic 100 mmHg or less, GCS under 15 - one point each, with a per-criterion breakdown. For revision use.",
  steps: [
    "Enter the Respiratory rate (breaths per minute), Systolic blood pressure (mmHg) and Glasgow Coma Scale total (3-15).",
    "Read the qSOFA total out of 3 with each criterion's 1 point or 0 points line, and whether the 2-point Positive threshold is met.",
    "Click Copy result to copy the scored breakdown with its educational-use note, or Reset to return to the RR 24 / SBP 96 / GCS 15 example.",
  ],
  intro:
    "The qSOFA Score Calculator scores the three bedside criteria defined in the Sepsis-3 consensus (Singer et al., JAMA 2016): a respiratory rate of 22 breaths per minute or more, a systolic blood pressure of 100 mmHg or less, and altered mentation with a Glasgow Coma Scale below 15. Each criterion scores one point, and a total of 2 or more is called positive. It is built for students and clinicians revising the score; qSOFA flags risk of a poor outcome in suspected infection and does not diagnose sepsis.",
  useCases: [
    "Check your working on a qSOFA question during finals or MRCP revision.",
    "Demonstrate why a patient with a respiratory rate of 24 and a systolic of 96 mmHg scores 2 even with a normal GCS.",
    "Compare how qSOFA and the full SOFA differ when teaching the Sepsis-3 definitions.",
    "Show a study group where the threshold sits — 22 breaths per minute counts, 21 does not.",
  ],
  benefits: [
    ["Exact Sepsis-3 thresholds", "Uses ≥22 breaths/min, ≤100 mmHg and GCS <15 as published, including the inclusive edges."],
    ["Per-criterion breakdown", "Shows which of the three criteria scored, not just the total."],
    ["Honest framing", "States the Surviving Sepsis Campaign position that qSOFA should not be the sole screening tool."],
  ],
  faqs: [
    [
      "What are the three qSOFA criteria?",
      "Respiratory rate of 22 breaths per minute or more, systolic blood pressure of 100 mmHg or less, and altered mentation (Glasgow Coma Scale below 15). Each scores one point, giving a total from 0 to 3.",
    ],
    [
      "What does a qSOFA score of 2 mean?",
      "Two or more points is a positive qSOFA. In the Sepsis-3 derivation cohorts, patients with suspected infection outside the ICU scoring 2 or more had a substantially higher risk of prolonged ICU stay or in-hospital death, so it should prompt a full assessment for organ dysfunction rather than reassurance.",
    ],
    [
      "Does qSOFA diagnose sepsis?",
      "No. Sepsis-3 defines sepsis as life-threatening organ dysfunction caused by a dysregulated host response to infection, identified by an increase of 2 or more points in the full SOFA score. qSOFA is only a rapid bedside prompt to look for that organ dysfunction.",
    ],
    [
      "Is qSOFA still recommended for sepsis screening?",
      "The 2021 Surviving Sepsis Campaign guideline recommends against using qSOFA alone, in preference to SIRS, NEWS or MEWS, because its sensitivity for identifying sepsis early is low. It remains useful as a prognostic prompt and is still widely taught. Clinical decisions should follow local protocol and senior review.",
    ],
  ],
};

export default seo;
