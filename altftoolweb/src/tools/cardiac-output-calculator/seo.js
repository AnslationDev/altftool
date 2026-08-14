const seo = {
  title: "Cardiac Output and Cardiac Index Calculator (BSA)",
  metaDescription:
    "CO = HR x SV / 1000 in L/min, plus cardiac index from Mosteller BSA, banded against 4.0-8.0 L/min and 2.5-4.0 L/min/m² reference ranges.",
  steps: [
    "Enter Heart Rate (bpm) and Stroke Volume (mL); switch Calculation Method to 'CO + CI (with BSA)' to add Height (cm) and Weight (kg).",
    "Press 'Calculate CO' — the gauge shows CO = HR × SV / 1000 in L/min, with minute volume in mL/min and, in CI mode, cardiac index from Mosteller BSA.",
    "Compare the figure against Cardiac Output Ranges (4.0 – 8.0 L/min normal) and Cardiac Index Ranges (2.5 – 4.0 L/min/m² normal), then use 'Copy Report' or Download to save a CO_Report_<value>Lmin.txt file.",
  ],
  intro:
    "The Cardiac Output Calculator computes cardiac output as CO = heart rate x stroke volume / 1000, giving litres per minute from a bpm value and a stroke volume in millilitres. Add height and weight and it also returns body surface area by the Mosteller formula, BSA = the square root of (height in cm x weight in kg / 3600), and divides CO by BSA to give cardiac index in L/min/m2. Results are placed against reference bands and can be copied or downloaded as a plain-text report. It is an educational aid for students and clinicians, not a substitute for clinical judgement.",
  useCases: [
    "A nursing or medical student working through a haemodynamics problem set wants to check that 72 bpm at 70 mL really gives about 5.0 L/min before moving on to the interpretation.",
    "You have an echo-derived stroke volume and need the cardiac index for a patient of a given height and weight, rather than reading the raw output in isolation.",
    "Teaching why cardiac index matters: run the same 5 L/min output against a small and a large BSA and show how the same number falls in different bands.",
  ],
  benefits: [
    [
      "Indexes to body size, not just raw output",
      "Mosteller BSA is calculated from height and weight and applied automatically, so a 5 L/min output is judged against the patient's size.",
    ],
    [
      "Bands the result instead of leaving a bare number",
      "Both CO and CI are classified low, normal or high with a short note on what each band commonly reflects.",
    ],
    [
      "Produces a shareable working",
      "The report lists the inputs, CO, minute blood volume in mL/min, CI and the formulas used, so the arithmetic can be checked by someone else.",
    ],
  ],
  faqs: [
    [
      "What is the formula for cardiac output?",
      "Cardiac output equals heart rate multiplied by stroke volume: CO = HR x SV. With HR in beats per minute and SV in millilitres, the product is divided by 1,000 to express the answer in litres per minute — 70 bpm x 70 mL gives 4.9 L/min.",
    ],
    [
      "What is a normal cardiac output?",
      "This tool uses 4.0 to 8.0 L/min as the adult normal band, flagging below 4.0 as low and above 8.0 as high. High readings are not automatically abnormal — exercise, fever, anaemia and sepsis all raise output — so the figure needs clinical context.",
    ],
    [
      "How is cardiac index different from cardiac output?",
      "Cardiac index is cardiac output divided by body surface area, reported in L/min/m2, so it corrects for how big the patient is. The tool treats 2.5 to 4.0 L/min/m2 as normal and values under 2.2 as low, a range associated with cardiogenic shock and severe heart failure.",
    ],
    [
      "Which BSA formula does it use?",
      "Mosteller: BSA in m2 is the square root of (height in cm x weight in kg divided by 3600). It is the most widely used bedside formula; other formulas such as Du Bois can give slightly different values, so state which one you used when recording a result. This calculator is informational and clinical decisions should rest with a qualified clinician.",
    ],
  ],
};

export default seo;
