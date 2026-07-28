const seo = {
  intro:
    "An HbA1c goal progress tracker plots a series of HbA1c results against the target you agreed with your clinician, and converts each one between NGSP percent and IFCC mmol/mol using the master equation mmol/mol = (percent − 2.15) × 10.929. Each result is also translated into estimated average glucose with the ADAG regression from Nathan et al. 2008, where eAG in mg/dL equals 28.7 × A1c − 46.7, so 7.0% works out to 53 mmol/mol and roughly 154 mg/dL or 8.6 mmol/L. A least-squares trend line across your results shows the change per month and, when the trend is downward, roughly when it would reach your target.",
  useCases: [
    "Track four quarterly results after a medication change and see whether the trend is genuinely downward.",
    "Convert a lab report given in mmol/mol into the percent figure your clinic uses, or the other way round.",
    "See what an HbA1c of 8.4% means as an average glucose before a review appointment.",
    "Work out roughly when you would reach a 7% target if the current rate of change continues.",
  ],
  benefits: [
    ["Both units, always", "Every result is shown in % and mmol/mol using the published NGSP-IFCC equation."],
    ["Average glucose in context", "The ADAG regression converts each result into mg/dL and mmol/L."],
    ["Trend, not just the last number", "A least-squares line across all results shows the direction and rate of change."],
  ],
  faqs: [
    [
      "What is a good HbA1c level?",
      "Below 5.7% is the normal range, 5.7-6.4% is the prediabetes range, and 6.5% or above meets the diagnostic threshold for diabetes. For many non-pregnant adults living with diabetes a general glycaemic target of below 7% (53 mmol/mol) is used, but targets are individualised by age, duration of diabetes, hypoglycaemia risk and other conditions — use the one your clinician set.",
    ],
    [
      "How do I convert HbA1c from % to mmol/mol?",
      "Use the NGSP master equation: mmol/mol = (percent − 2.15) × 10.929. So 6.0% is 42 mmol/mol, 7.0% is 53 mmol/mol and 8.0% is 64 mmol/mol. To go the other way, divide the mmol/mol figure by 10.929 and add 2.15.",
    ],
    [
      "What average blood sugar does my HbA1c represent?",
      "The ADAG study equation gives estimated average glucose as 28.7 × A1c − 46.7 in mg/dL, or 1.5944 × A1c − 2.5944 in mmol/L. An HbA1c of 7% is about 154 mg/dL (8.6 mmol/L) and 9% is about 212 mg/dL (11.8 mmol/L). It is an average, so it hides both highs and lows.",
    ],
    [
      "How often should HbA1c be tested?",
      "Twice a year is usual when you are meeting your target and treatment is stable, and about every three months when you are not at target or your treatment has changed. Testing more often than every eight to twelve weeks tells you little, because HbA1c reflects roughly the previous 90 days of average glucose. Your care team decides the right interval for you.",
    ],
  ],
};

export default seo;
