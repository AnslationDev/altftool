const seo = {
  intro:
    "The Bilirubin Unit Converter changes total and direct bilirubin between mg/dL and micromoles per litre using the factor 17.1, which follows from bilirubin's molar mass of 584.66 g/mol. It also subtracts direct from total to give the indirect (unconjugated) value and works out the direct fraction, the ratio clinicians use to separate conjugated from unconjugated hyperbilirubinaemia. mg/dL is used in the US and India, µmol/L across the UK, Europe, Canada and Australia.",
  useCases: [
    "Read a UK liver function report in µmol/L when your earlier results were recorded in mg/dL.",
    "Work out indirect bilirubin when the report lists only total and direct values.",
    "Check whether a raised total bilirubin is predominantly direct or indirect before an appointment.",
    "Compare a result of 22 µmol/L with the familiar 1.2 mg/dL upper limit.",
  ],
  benefits: [
    ["One factor, both directions", "Multiplies by 17.1 or divides by it, so values convert back and forth without drift."],
    ["Indirect calculated for you", "Total minus direct is done automatically, in both units, instead of by hand."],
    ["Pattern flagged", "The direct fraction is shown as a percentage and described against the usual 20% and 50% teaching points."],
  ],
  faqs: [
    [
      "How do you convert bilirubin from mg/dL to µmol/L?",
      "Multiply by 17.1. So 1.2 mg/dL is about 20.5 µmol/L and 3.0 mg/dL is about 51 µmol/L. Divide by 17.1 to convert micromoles per litre back to mg/dL.",
    ],
    [
      "What is a normal bilirubin level?",
      "In adults, total bilirubin is usually about 0.1 to 1.2 mg/dL (1.7 to 20.5 µmol/L) and direct bilirubin up to about 0.3 mg/dL (5.1 µmol/L). Laboratories set their own intervals, so compare against the range printed on your own report.",
    ],
    [
      "What is the difference between direct and indirect bilirubin?",
      "Direct (conjugated) bilirubin has been processed by the liver and is water-soluble; indirect (unconjugated) bilirubin has not, and is carried on albumin. Indirect is calculated as total minus direct. A direct fraction above about 50% suggests bile duct obstruction or liver cell disease, while a fraction below about 20% points to haemolysis or Gilbert syndrome.",
    ],
    [
      "At what bilirubin level does jaundice become visible?",
      "Yellowing of the whites of the eyes generally appears once total bilirubin reaches roughly 2.5 to 3 mg/dL (about 43 to 51 µmol/L), with skin yellowing following at higher levels. Newborns are assessed differently, against hour-specific nomograms, and a jaundiced baby needs same-day clinical review rather than a conversion table.",
    ],
  ],
};

export default seo;
