const seo = {
  title: "Body Surface Area Calculator: Mosteller & Du Bois",
  metaDescription:
    "Height in cm and weight in kg give BSA in m²: the Mosteller square root beside the Du Bois figure. An arithmetic aid, not a dosing authority.",
  intro:
    "The Body Surface Area Calculator converts a height in centimetres and a weight in kilograms into BSA in square metres, using the Mosteller formula — the square root of height times weight divided by 3600 — and showing the Du Bois result, 0.007184 x height^0.725 x weight^0.425, alongside it. BSA is the figure many drug doses, cardiac indices and burn assessments are scaled to, so students, nurses and anyone checking a calculation need it in a hurry. It reports both formulas because they do not always agree, and it is an arithmetic aid, not a dosing authority.",
  useCases: [
    "You are working through a chemotherapy dosing question where the dose is written in mg per square metre and need the BSA before you can go any further.",
    "A cardiac report quotes cardiac index rather than cardiac output and you need the patient's BSA to reconcile the two numbers.",
    "You are revising for a pharmacology exam and want to see how much Mosteller and Du Bois diverge at the extremes of height and weight.",
  ],
  benefits: [
    [
      "Both standard formulas at once",
      "Shows the Mosteller and Du Bois results side by side so you can see whether the choice of formula changes anything material for this patient.",
    ],
    [
      "The formula clinicians actually use",
      "Leads with Mosteller, the square-root form adopted in most clinical settings precisely because it is simple enough to check by hand.",
    ],
    [
      "Two inputs, no setup",
      "Height in centimetres and weight in kilograms are all it needs — no age, sex or body-composition assumptions enter the calculation.",
    ],
  ],
  faqs: [
    [
      "What is the Mosteller formula for body surface area?",
      "BSA in square metres equals the square root of (height in cm x weight in kg) / 3600. For a person 175 cm and 70 kg that is the square root of 3.403, or about 1.84 m². Its appeal is that it can be worked out on a basic calculator, which is why it became the clinical default.",
    ],
    [
      "How does Du Bois differ from Mosteller?",
      "Du Bois uses a power relationship — 0.007184 x height^0.725 x weight^0.425 — derived from a 1916 study of only nine subjects, while Mosteller is a later square-root simplification. For average adults the two land within a few percent of each other, but they diverge more at very high or very low body weights, which is why both are shown here.",
    ],
    [
      "Why is body surface area used for drug dosing?",
      "Because BSA correlates better than body weight alone with metabolic rate, blood volume and renal clearance, so several drug classes — cytotoxic chemotherapy in particular — are prescribed in mg per square metre. Which formula and which dose apply to a given patient is a prescriber's decision; this tool only performs the arithmetic.",
    ],
    [
      "Can I enter height in feet or weight in pounds?",
      "No — the inputs are centimetres and kilograms, so convert first: multiply inches by 2.54 for centimetres and pounds by 0.4536 for kilograms. Entering imperial figures directly will produce a BSA that is badly wrong rather than an error message, so check the units before reading the result.",
    ],
  ],
};

export default seo;
