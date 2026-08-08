const seo = {
  title: "Ideal Weight Calculator: Devine, Robinson, Miller, Hamwi",
  metaDescription:
    "Run all four ideal body weight formulas from one height, adjust for a small, medium or large frame, and switch between WHO and ICMR BMI cut-offs.",
  steps: [
    "Choose Gender, then enter Height in cm or switch the toggle to ft + in and fill Feet and Inches; add your Age, pick kg or lb as the Weight unit and enter Your current weight.",
    "Set Frame size to Small, Medium or Large — or type a Wrist circumference and press Apply to let the height ÷ wrist ratio pick it — then choose WHO standard or Asian / Indian (ICMR) under BMI standard.",
    "Your healthy target range and Current BMI appear above a weight scale for your height, and \"Every classic formula, side by side\" lists Hamwi, Devine, Robinson and Miller with each formula's year, ideal weight and frame-adjusted figure; Copy report copies the lot and Reset to defaults clears it.",
  ],
  intro:
    "This calculator runs the four classic ideal body weight formulas side by side — Hamwi (1964), Devine (1974), Robinson (1983) and Miller (1983) — each of which starts from a base weight at 5 feet and adds a fixed amount per inch above it, then adjusts the result for a small, medium or large frame. Alongside them it gives a healthy weight range from your height and a BMI band, using either the WHO cut-offs (18.5–24.9) or the lower ICMR Asian ones (18.5–22.9), and shows where your current weight sits. It is a general-information estimate, not a clinical target — a doctor or dietitian should set an actual goal weight.",
  useCases: [
    "You have seen three different ideal weight numbers online and want to see all four formulas computed from the same height so you can understand the spread",
    "You are broad-shouldered and heavy-boned and want the healthy range shifted toward the upper end rather than judged against a mid-range number",
    "You are of South Asian origin and want the range recalculated against ICMR cut-offs, where overweight begins at BMI 23 rather than 25",
  ],
  benefits: [
    ["Four formulas, one height", "Hamwi, Devine, Robinson and Miller are shown together with the year and purpose of each, so you can see that the disagreement is between the formulas, not in your measurements."],
    ["Frame size actually changes the number", "A small or large frame scales the formula results by 0.9 or 1.1 and shifts the recommended BMI window within the healthy band, rather than being a label with no effect."],
    ["Two BMI standards", "Switch between WHO thresholds and ICMR Asian thresholds, which matter because cardiometabolic risk rises at a lower BMI in South Asian populations."],
  ],
  faqs: [
    [
      "What is the difference between the Devine, Robinson, Miller and Hamwi formulas?",
      "They share a structure — a base weight for a 5-foot adult plus a per-inch increment — and differ in the constants. Devine uses 50 kg plus 2.3 kg per inch for men and 45.5 kg plus 2.3 for women; Hamwi uses 48 kg plus 2.7 (men) and 45.5 plus 2.2 (women); Robinson uses 52 plus 1.9 and 49 plus 1.7; Miller uses 56.2 plus 1.41 and 53.1 plus 1.36. Miller's flat slope means it drifts high for short people and low for tall ones, while Robinson is usually the most conservative.",
    ],
    [
      "Which ideal weight formula is the most accurate?",
      "None of them is a health target — Devine was designed for drug dosing, not for judging body composition, and the others were fitted to mid-20th-century insurance tables. For assessing weight status, a BMI-derived healthy range for your height is more defensible, and body composition matters more than either. Treat the four numbers as a range, and discuss a personal goal with a clinician.",
    ],
    [
      "How do I work out my frame size?",
      "Divide your height by your wrist circumference in the same unit. For men, a ratio above 10.4 indicates a small frame and below 9.6 a large one; for women the boundaries are 11 and 10.1, with anything between counted as medium. Enter your wrist measurement and the tool derives the frame for you.",
    ],
    [
      "Why does the healthy BMI range change when I pick the Asian standard?",
      "Because the ICMR cut-offs are lower: healthy runs 18.5 to 22.9, overweight starts at 23 and obesity at 25, against the WHO figures of 18.5 to 24.9, 25 and 30. The lower thresholds reflect evidence that people of South Asian origin develop diabetes and cardiovascular risk at a lower BMI than the WHO cut-offs assume.",
    ],
  ],
};

export default seo;
