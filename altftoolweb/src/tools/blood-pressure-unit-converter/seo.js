const seo = {
  intro:
    "The Blood Pressure Unit Converter changes a systolic and diastolic reading between millimetres of mercury and kilopascals using the exact definition 1 mmHg = 0.133322387415 kPa. Alongside the conversion it computes mean arterial pressure as diastolic plus one third of the pulse pressure, reports the pulse pressure itself, and places the reading in the 2017 ACC/AHA category table. It is aimed at students, researchers and anyone reading equipment or papers that report pressure in SI units.",
  useCases: [
    "Read a European physiology paper that quotes 16.0/10.7 kPa and see it as the familiar 120/80 mmHg.",
    "Convert a ventilator or haemodynamic monitor readout in kPa into mmHg for a clinical handover note.",
    "Check the mean arterial pressure behind a reading to see whether it clears the commonly used 65 mmHg perfusion floor.",
    "Show a home-monitor reading in both unit systems when sharing it with a clinician who uses the other one.",
  ],
  benefits: [
    ["Exact factor", "Uses the defined 133.322387415 Pa per mmHg rather than a rounded 7.5 shortcut."],
    ["Derived figures included", "Mean arterial pressure and pulse pressure are calculated from the same reading."],
    ["Guideline categories", "Places the result in the 2017 ACC/AHA bands from normal through hypertensive crisis."],
  ],
  faqs: [
    [
      "How do I convert mmHg to kPa?",
      "Multiply mmHg by 0.133322387415 to get kPa, or divide kPa by that factor to go back — which is the same as multiplying kPa by 7.50062. So 120 mmHg is 16.0 kPa and 80 mmHg is 10.7 kPa.",
    ],
    [
      "What is 120/80 in kPa?",
      "120/80 mmHg is 16.00/10.67 kPa. Note that under the 2017 ACC/AHA thresholds a diastolic of exactly 80 already falls in stage 1 hypertension, because that band starts at 130 systolic or 80 diastolic.",
    ],
    [
      "How is mean arterial pressure calculated?",
      "MAP is estimated as diastolic pressure plus one third of the pulse pressure: MAP = DBP + (SBP − DBP) / 3. For 120/80 that gives 93.3 mmHg. A MAP of about 65 mmHg is the figure often quoted as the minimum for adequate organ perfusion.",
    ],
    [
      "Is a torr the same as a mmHg?",
      "For clinical purposes yes. One torr is defined as 1/760 of a standard atmosphere, which is 133.3224 Pa, while the conventional mmHg is 133.322387415 Pa — a difference of about one part in seven million, far below the precision of any blood pressure cuff.",
    ],
  ],
};

export default seo;
