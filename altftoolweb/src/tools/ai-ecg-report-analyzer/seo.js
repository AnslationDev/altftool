const seo = {
  title: "ECG Report Analyzer: PR, QRS and QTc Reference Bands",
  metaDescription:
    "Grades typed heart rate, PR, QRS and QTc against adult reference ranges into a weighted 0-25 score. An educational reference, not a diagnostic device.",
  steps: [
    "Type Heart Rate (bpm), PR Interval (ms), QRS Duration (ms) and the optional QTc (ms) off your printout, and set Gender so the right QTc band applies.",
    "Pick Rhythm, Axis, ST Segment and T Waves under Morphology, then press Analyze ECG.",
    "Read Overall Risk out of 25 with the Interval Analysis and Morphology Assessment bands, then use Copy Report or Download for the .txt.",
  ],
  intro:
    "The AI ECG Report Analyzer takes the numbers already printed on an ECG report — heart rate, PR interval, QRS duration and QTc — plus rhythm, axis, ST segment and T wave morphology, and classifies each one against standard adult reference ranges before combining them into a weighted 0–25 severity score. It is an educational reference for students, trainees and patients trying to read their own printout, not a diagnostic device: it does not read the tracing itself, only the measurements you type. Every classification and the plain-text report it generates stay in your browser.",
  useCases: [
    "You are revising for a cardiology viva and want to check whether a PR of 230 ms with a QRS of 130 ms lands in first-degree AV block plus bundle branch block territory",
    "You have your own ECG printout showing a QTc of 475 ms and want to understand which reference band that falls into before your follow-up appointment",
    "You are teaching ECG interpretation and want a repeatable way to show how ST elevation and a ventricular rhythm push a case from moderate into critical on a severity scale",
  ],
  benefits: [
    [
      "Sex-specific QTc bands",
      "Uses separate male and female thresholds — normal to 450 ms and 470 ms prolonged for males, 460 ms and 480 ms for females — instead of one blanket cut-off.",
    ],
    [
      "Weighted, not additive, scoring",
      "ST segment and rhythm findings carry a 3x weight, QTc 2.5x, and heart rate and QRS 2x, so a rhythm emergency outranks a mildly long PR.",
    ],
    [
      "Explains each band, not just the label",
      "Every classified interval comes with the differential it suggests — junctional rhythm or WPW for a short PR, Torsades risk for a long QTc.",
    ],
  ],
  faqs: [
    [
      "What is a normal PR interval and QRS duration?",
      "A normal PR interval is 120–200 ms and a normal QRS is 80–100 ms in adults. This tool flags PR under 120 ms as short, 200–300 ms as first-degree AV block and above 300 ms as advanced delay; QRS of 100–120 ms as an incomplete block and above 120 ms as a complete bundle branch block.",
    ],
    [
      "At what QTc is the interval considered prolonged?",
      "Above 470 ms in males and above 480 ms in females, with 450–470 ms and 460–480 ms treated as borderline. Prolonged QTc raises the risk of Torsades de Pointes, which is why the analyzer weights it heavily and prompts a review of QT-prolonging medications and potassium and magnesium levels.",
    ],
    [
      "How is the risk score calculated?",
      "Each parameter is placed in a severity tier from 0 to 3, multiplied by a weight, and the total is capped at 25. Scores of 0–2 read as low, 3–6 moderate, 7–12 high and above 12 critical — the weights are 3x for ST changes and rhythm, 2.5x for QTc, 2x for heart rate, QRS and T waves, and 1.5x for PR and axis.",
    ],
    [
      "Can this replace a cardiologist reading my ECG?",
      "No. It classifies numbers you type against textbook reference ranges and has no access to the waveform, lead placement, your symptoms, history or medications — all of which change the interpretation. Use it to understand terminology, and take any abnormal finding, especially ST changes or a wide-complex rhythm, to a qualified clinician.",
    ],
  ],
};

export default seo;
