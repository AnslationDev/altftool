const seo = {
  title: "Neck Circumference Check: Apnoea & BMI Cut-offs",
  metaDescription:
    "Check a neck measurement against Ben-Noun's 37/34 cm adiposity cut-offs and the 40 cm STOP-BANG apnoea criterion, with an optional BMI cross-check.",
  steps: [
    "Enter your \"Neck measurement\" and pick the unit — \"Centimetres (cm)\" or \"Inches (in)\" — plus the male or female cut-off set.",
    "Optionally add height in cm and weight in kg to run the BMI cross-check alongside the neck cut-offs.",
    "Read the screening level with each published cut-off marked \"Met\" or \"Not met\", then click \"Copy result\" to save the summary.",
  ],
  intro:
    "The Neck Circumference Risk Checker compares a single tape measurement against the published screening cut-offs that use neck size as a proxy for upper-body fat: Ben-Noun's 37 cm (men) and 34 cm (women) thresholds for a BMI of 25 or more, and the neck criteria used inside sleep apnoea questionnaires. An optional height and weight entry runs a BMI cross-check so you can see when the two measures disagree. It is a screening prompt for a conversation with a clinician, never a diagnosis.",
  useCases: [
    "Check whether your collar size crosses the 40 cm neck criterion that scores a point on the STOP-BANG sleep apnoea questionnaire.",
    "Track neck circumference alongside waist during a weight-loss programme, since upper-body fat responds differently from abdominal fat.",
    "Understand why a muscular build can trip the neck screen while BMI stays in the healthy range.",
    "Gather a concrete measurement to bring to a GP appointment about snoring or daytime sleepiness.",
  ],
  benefits: [
    [
      "Named, citable cut-offs",
      "Every threshold comes from published screening research rather than a made-up scale.",
    ],
    [
      "Separates two questions",
      "Shows the adiposity cut-offs and the sleep apnoea cut-offs independently instead of merging them into one score.",
    ],
    [
      "BMI cross-check",
      "Flags the common cases where neck size and BMI point in opposite directions and explains why.",
    ],
  ],
  faqs: [
    [
      "What neck size is considered high risk for sleep apnoea?",
      "The STOP-BANG questionnaire scores a point for a neck circumference greater than 40 cm (about 16 inches) in either sex, and sleep clinics commonly treat 43 cm (17 in) in men and 41 cm (16 in) in women as a stronger signal. Neck size is only one of several risk factors, so a large neck on its own is not a diagnosis and a normal neck does not rule apnoea out.",
    ],
    [
      "How do I measure neck circumference properly?",
      "Stand upright and wrap the tape horizontally at the level of the cricothyroid membrane — the soft dip just below the Adam's apple — keeping it perpendicular to the neck rather than sloping. Pull it snug without compressing the skin and read it at the end of a normal breath out, to the nearest 0.5 cm.",
    ],
    [
      "What neck circumference indicates obesity?",
      "In Ben-Noun's 2001 screening study, a neck of 39.5 cm or more in men and 36.5 cm or more in women flagged a BMI of 30 or above, while 37 cm and 34 cm respectively flagged a BMI of 25 or above. Those were population screening thresholds, so an individual result can fall either side of the line without matching their actual BMI.",
    ],
    [
      "Can a muscular person have a large neck without health risk?",
      "Yes — neck circumference cannot distinguish muscle from fat, so rugby players, wrestlers and heavy lifters routinely exceed these cut-offs with low body fat. That is exactly why the tool offers a BMI cross-check and why any flag should be interpreted alongside waist measurement, blood pressure and symptoms rather than acted on alone.",
    ],
  ],
};

export default seo;
