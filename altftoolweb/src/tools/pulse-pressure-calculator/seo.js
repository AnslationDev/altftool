const seo = {
  intro:
    "The Pulse Pressure Calculator subtracts your diastolic reading from your systolic reading to give pulse pressure in mmHg, and also derives mean arterial pressure using the standard MAP = diastolic + (pulse pressure / 3). It then places the result on a five-band reference scale - narrow below 25, low 25-29, normal 30-50, elevated 51-60, and wide above 60 mmHg - with a gauge and a bar showing how much of the systolic figure is diastolic versus pulse pressure. This is general health information for understanding a home reading, not a diagnosis; discuss anything unusual with a clinician.",
  useCases: [
    "Your home monitor shows 150/70 and you want to know why the gap looks large - the tool reports a 80 mmHg pulse pressure and flags it in the wide band.",
    "You are logging morning readings for a follow-up appointment and want pulse pressure and MAP written down alongside the raw numbers rather than working them out by hand each day.",
    "A caregiver comparing a relative's readings notices the numbers converging, say 96/76, and checks whether a 20 mmHg gap falls into the narrow band worth raising with the doctor.",
  ],
  benefits: [
    ["Two derived numbers, not one", "Every calculation returns both pulse pressure and mean arterial pressure from the same reading, plus MAP as a percentage of systolic."],
    ["Bands are shown, not just a verdict", "The full five-row reference table stays on screen with your band highlighted, so you can see how close you are to the next threshold."],
    ["Rejects impossible readings", "Entries where diastolic exceeds systolic, or either value is zero or negative, are refused rather than producing a nonsense negative pulse pressure."],
  ],
  faqs: [
    [
      "How do you calculate pulse pressure?",
      "Pulse pressure is systolic minus diastolic. For a reading of 120/80 the pulse pressure is 40 mmHg, which sits in the normal 30-50 band this tool uses.",
    ],
    [
      "What is a normal pulse pressure?",
      "This calculator treats 30-50 mmHg as normal, 51-60 as elevated, and above 60 mmHg as wide. Below 30 is low and below 25 is narrow. These are general reference bands - individual interpretation depends on age, medication and overall clinical picture, so confirm with a healthcare professional.",
    ],
    [
      "What does a wide pulse pressure mean?",
      "A pulse pressure above 60 mmHg is commonly described as wide and is associated with arterial stiffness and isolated systolic hypertension. It is a signal to discuss with a clinician rather than something to act on alone, especially if it appears consistently across several readings.",
    ],
    [
      "How is mean arterial pressure worked out here?",
      "Using the standard estimate MAP = diastolic + (pulse pressure / 3), which weights diastolic more heavily because the heart spends roughly two thirds of each cycle at rest. For 120/80 that gives about 93.3 mmHg.",
    ],
  ],
};

export default seo;
