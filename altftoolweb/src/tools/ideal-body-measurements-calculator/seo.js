const seo = {
  title: "Ideal Body Measurements Calculator (McCallum)",
  metaDescription:
    "Chest, waist, arms, thighs and calves scaled from your wrist (chest = wrist x 6.5), plus a Steve Reeves joint-ratio mode and waist-to-height check.",
  steps: [
    "Choose the Proportion system — \"McCallum — everything from the wrist\" or \"Reeves — each muscle from its joint\" — and set Units to Inches or Centimetres.",
    "Enter Wrist girth and, optionally, Height; picking Reeves adds Ankle girth, Knee girth, Head girth and Pelvis girth fields, measured with the tape snug over bone.",
    "Target chest appears with the chest-to-waist ratio and shoulder target, above the table of Chest, Waist, Upper arm, Thigh and the remaining targets; press Copy result or Reset.",
  ],
  intro:
    "This calculator turns a single wrist measurement into classic physique proportion targets for chest, waist, hips, thighs, neck, arms, calves and forearms, using John McCallum's ratio system: chest equals 6.5 times wrist girth, and every other target is a fixed percentage of that chest figure. A second mode uses Steve Reeves' joint ratios, sizing each muscle against the nearest joint — arms at 252% of the wrist, calves at 192% of the ankle, thighs at 175% of the knee. It is aimed at lifters who want a structure-based goal instead of an arbitrary number on a tape measure.",
  useCases: [
    "Set an arm goal that fits your skeleton instead of copying a 18-inch number from someone with much thicker wrists.",
    "Check whether your chest-to-waist gap is where the classic V-taper standard puts it before a physique contest prep.",
    "Give a coaching client measurable, structure-scaled targets for a six-month body-recomposition block.",
    "Work out a realistic shoulder circumference target from the golden-ratio shoulder-to-waist standard.",
  ],
  benefits: [
    ["Scaled to your skeleton", "Wrist, ankle, knee and pelvis girth barely change with training, so targets reflect your own build."],
    ["Two documented systems", "Switch between McCallum's wrist ratios and Steve Reeves' joint ratios and compare the numbers."],
    ["Health sanity check", "Adds your waist-to-height ratio against the guideline of keeping the waist under half your height."],
  ],
  faqs: [
    [
      "How do I calculate ideal body measurements from my wrist?",
      "Multiply wrist circumference by 6.5 to get the chest target, then take percentages of that chest figure: hips 85%, waist 70%, thigh 53%, neck 37%, upper arm 36%, calf 34% and forearm 29%. A 7-inch wrist gives a 45.5-inch chest, a 31.9-inch waist and 16.4-inch arms.",
    ],
    [
      "What is a good chest-to-waist ratio?",
      "The McCallum system puts the waist at 70% of the chest, which is a chest-to-waist ratio of about 1.43. The related golden-ratio or Adonis standard sets shoulder circumference at 1.618 times the waist. Both are aesthetic conventions rather than health measures.",
    ],
    [
      "Are these ideal measurements realistic without drugs?",
      "For most trained lifters the McCallum targets sit at the top end of natural potential and typically take many years of consistent training and eating to approach, if they are reached at all. Limb length, muscle insertions and genetics mean some people will never hit every ratio, and missing one says nothing about your health or strength.",
    ],
    [
      "Should I chase a smaller waist to hit the ratio?",
      "Not by cutting below a healthy body fat level. A useful safety rail is the widely used guideline that adults keep their waist to less than half their height; the calculator flags it when the ratio target would push you past that. These figures are informational, not medical guidance — speak to a clinician or registered dietitian before making large changes to your weight.",
    ],
  ],
};

export default seo;
