const seo = {
  title: "MAP Calculator: Mean Arterial Pressure Formula",
  metaDescription:
    "Enter systolic and diastolic in mmHg for MAP = DBP + 1/3 × (SBP − DBP), shown with your numbers substituted and banded Low under 60 to Very High 120+.",
  steps: [
    "Type your reading into \"Systolic (mmHg)\" and \"Diastolic (mmHg)\" — the top and bottom numbers of a blood pressure reading.",
    "Press \"Calculate MAP\", which stays disabled until both fields have a value, to apply MAP = DBP + 1/3 × (SBP − DBP).",
    "Read the MAP to one decimal on the 40–140 mmHg gauge with its band — Low, Normal, Pre-Hypertension, High or Very High — and the formula with your own numbers filled in.",
  ],
  intro:
    "This calculator works out Mean Arterial Pressure — the average pressure in your arteries across one cardiac cycle — using the standard clinical estimate MAP = DBP + 1/3 x (SBP − DBP). Enter a systolic and diastolic reading in mmHg and it returns MAP to one decimal place, shows the substituted formula, and places the result on a gauge banded Low (under 60), Normal, Pre-Hypertension (100–109), High (110–119) and Very High (120 or above). It is an informational calculator, not a diagnosis — blood pressure decisions belong with a clinician.",
  useCases: [
    "You have a home blood pressure log of systolic/diastolic pairs and want to convert them to MAP so you can compare readings on a single number rather than two.",
    "A nursing or paramedic student is working through perfusion questions and wants to check their hand-calculated MAP against the formula, step by step, for a set of practice vitals.",
    "You are preparing questions for a follow-up appointment and want to see roughly where a reading like 118/76 falls relative to the commonly cited 70 mmHg perfusion floor before discussing it with your doctor.",
  ],
  benefits: [
    ["Shows the substitution, not just the answer", "The result panel prints MAP = DBP + 1/3 x (SBP − DBP) with your own numbers filled in, so the arithmetic is checkable."],
    ["Bands the result immediately", "The MAP value is mapped to one of five labelled ranges with a short explanation, instead of leaving you to interpret a bare number."],
    ["Plots on a 40–140 mmHg gauge", "The gauge gives visual context for how far a reading sits from the middle of the normal band."],
  ],
  faqs: [
    [
      "What is the formula for mean arterial pressure?",
      "MAP = diastolic pressure + one third of the pulse pressure, or MAP = DBP + 1/3 x (SBP − DBP). This weighting reflects that the heart spends roughly two thirds of each cardiac cycle in diastole, which is why diastolic pressure counts for more than systolic.",
    ],
    [
      "What is a normal MAP?",
      "Roughly 70 to 100 mmHg is treated as the normal range in this calculator, and readings from 100 to 109 are labelled pre-hypertension, 110 to 119 high, and 120 or above very high. These bands are informational reference ranges, not a clinical threshold set for any individual.",
    ],
    [
      "Why is a MAP below 60 mmHg a concern?",
      "A MAP under 60 mmHg is generally considered too low to reliably perfuse organs such as the brain and kidneys, which is why 65 to 70 mmHg is commonly used as a minimum target in critical care. If your readings are consistently that low, or you have symptoms such as dizziness or confusion, contact a healthcare professional.",
    ],
    [
      "Is MAP better than systolic pressure alone?",
      "For judging blood flow to organs, MAP is generally regarded as the more useful single number because it accounts for both systolic and diastolic pressure across the whole cardiac cycle. Systolic pressure is still what most hypertension guidelines are written around, so the two are used together rather than one replacing the other.",
    ],
  ],
};

export default seo;
