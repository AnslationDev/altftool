const seo = {
  title: "BMI Prime Calculator: BMI ÷ 25 or Asia-Pacific 23",
  metaDescription:
    "BMI Prime divides your BMI by 25 (WHO) or 23 (Asia-Pacific), so 1.00 is the healthy ceiling. Shows both, plus your weight at BMI Prime 1.00 in kg.",
  steps: [
    "Pick cm / kg or ft-in / lb under Units, then enter Height (cm) and Weight (kg) — the defaults are 175 and 82.",
    "Set Reference range to 'WHO international — divide by 25' or 'WHO Asia-Pacific — divide by 23'; the note under the menu gives the healthy BMI band for each.",
    "There is no calculate button — BMI Prime recomputes as you type, with the gauge marked '1.00 ceiling' and rows for BMI, Weight at BMI Prime 1.00, Distance from the healthy range and 'Prime against 25 / against 23'; Copy result copies the summary.",
  ],
  intro:
    "BMI Prime is body mass index divided by the upper limit of the healthy BMI range, so the answer reads as a plain ratio: 1.00 sits exactly on the ceiling, 1.15 is fifteen percent above it, and 0.90 is ten percent below. This calculator computes BMI as weight in kilograms over height in metres squared, then divides by 25 for the WHO international range or by 23 for the WHO Asia-Pacific range. Because the result is dimensionless it compares cleanly across people of different heights and across the two reference standards.",
  useCases: [
    "Turning a BMI of 26.8 into the more concrete statement that you are 7 percent over the healthy ceiling",
    "Comparing your position against the 25 and 23 references in one view if you are of Asian ancestry",
    "Tracking progress in a single figure where every 0.01 is a fixed number of kilograms for your height",
  ],
  benefits: [
    ["One number, no bands", "A ratio around 1.00 replaces six categories you would otherwise have to memorise."],
    ["Both references", "Shows BMI Prime against the 25 ceiling and the Asia-Pacific 23 ceiling side by side."],
    ["Kilograms attached", "Converts BMI Prime 1.00 into the actual weight for your height, so the gap is actionable."],
  ],
  faqs: [
    [
      "What is BMI Prime?",
      "BMI Prime is your BMI divided by 25, the top of the WHO healthy BMI range. A BMI of 27.5 gives a BMI Prime of 1.10, meaning you are 10 percent above the healthy ceiling. Values below 0.74 correspond to a BMI under 18.5 and are classified as underweight.",
    ],
    [
      "What is a good BMI Prime score?",
      "Between 0.74 and 1.00 on the WHO scale, which is the same as a BMI of 18.5 to 24.9. Above 1.00 is overweight, 1.20 and above is obesity class I, 1.40 obesity class II and 1.60 obesity class III.",
    ],
    [
      "How is BMI Prime different from BMI?",
      "It is the same measurement expressed as a ratio rather than an absolute number. BMI 32 tells you little unless you remember that obesity starts at 30, whereas BMI Prime 1.28 immediately says 28 percent over the limit. Nothing else changes, so it shares BMI's blind spot for muscle mass.",
    ],
    [
      "Should Asian populations use a different BMI Prime reference?",
      "Yes, dividing by 23 rather than 25 is the closer fit. The WHO Asia-Pacific guideline puts the healthy ceiling at 22.9 for South and East Asian populations because diabetes and cardiovascular risk rise at a lower BMI. This calculator offers both references and reports each result.",
    ],
  ],
};

export default seo;
