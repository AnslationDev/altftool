const seo = {
  title: "QTc Calculator: Bazett, Fridericia, Framingham",
  metaDescription:
    "Enter QT in ms and heart rate to get Bazett, Fridericia, Framingham and Hodges QTc side by side, checked against male, female and child reference bands.",
  steps: [
    "Enter QT Interval (ms) between 100 and 800 and Heart Rate (bpm) between 20 and 300, then pick Male, Female or Child.",
    "Press Calculate QTc — the RR interval is derived as 60/HR and Bazett, Fridericia, Framingham and Hodges are computed from the same inputs.",
    "Check the Bazett gauge against the Reference Ranges panel, then press Download to save the QTc_Report_<value>ms.txt file.",
  ],
  intro:
    "ECG QTc Calculator corrects a measured QT interval for heart rate and shows the result from four published formulas side by side: Bazett (QT ÷ √RR), Fridericia (QT ÷ ∛RR), Framingham (QT + 0.154 × (1 − RR)) and Hodges (QT + 1.75 × (HR − 60)). Enter the QT interval in milliseconds and the heart rate in bpm; RR is derived as 60 ÷ HR, Bazett is reported as the headline figure, and the value is placed against sex- and age-specific reference bands. It is an educational reference for students, paramedics and clinicians comparing correction methods, not a diagnostic device — interpretation of any ECG belongs with the treating clinician.",
  useCases: [
    "You are reviewing an ECG at a heart rate of 110 bpm and want to see how much higher Bazett reads than Fridericia before deciding whether the QTc is genuinely prolonged.",
    "A patient is about to start a medication with known QT effects and you want a documented baseline QTc with all four corrections recorded in one report.",
    "A cardiology student is learning why the same QT interval yields four different QTc values and wants to vary the heart rate and watch each formula respond.",
  ],
  benefits: [
    [
      "Four corrections computed at once",
      "Bazett, Fridericia, Framingham and Hodges are calculated from the same inputs so divergence between methods is visible immediately rather than one at a time.",
    ],
    [
      "Reference bands split by sex and paediatric status",
      "The result is classified against separate male, female and child thresholds instead of a single generic cut-off.",
    ],
    [
      "Exportable working",
      "The generated report lists the QT, heart rate, derived RR interval in both ms and seconds, all four QTc values and the band the Bazett result falls into.",
    ],
  ],
  faqs: [
    [
      "What is a normal QTc interval?",
      "The reference bands used here are 350–450 ms for adult males, 360–460 ms for adult females and 340–440 ms for children. Values above 470 ms in males, 480 ms in females and 460 ms in children are flagged as prolonged, which is the range associated with increased arrhythmia risk and warrants clinical review.",
    ],
    [
      "Which QTc formula should I use?",
      "Bazett is the most widely reported and is the headline value here, but it overestimates QTc at fast heart rates and underestimates it at slow ones. Fridericia (QT ÷ ∛RR) holds up better outside roughly 60–100 bpm and is generally preferred for drug-safety studies, while Framingham's linear correction performs well within the 60–100 bpm range.",
    ],
    [
      "How do I get the RR interval from heart rate?",
      "RR in seconds equals 60 divided by the heart rate in bpm, so 75 bpm gives an RR of 0.8 s or 800 ms. You only need to enter QT and heart rate — the RR interval used by every formula is derived from that division and shown in the results.",
    ],
    [
      "Can this tell me if I have long QT syndrome?",
      "No. It performs the arithmetic of rate correction and compares the answer with published reference ranges; it cannot diagnose long QT syndrome, which requires a physician's assessment of the full ECG, symptoms, medications, electrolytes and family history. Take any prolonged result to a clinician rather than acting on it directly.",
    ],
  ],
};

export default seo;
