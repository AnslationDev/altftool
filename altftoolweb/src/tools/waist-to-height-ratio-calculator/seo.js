const seo = {
  title: "Waist to Height Ratio Calculator: Your 0.50 Target",
  metaDescription:
    "Divide waist by height in cm for your WHtR, land in one of four bands from Low to High Risk, and see the exact waist that puts you at 0.50.",
  steps: [
    "Type your measurement into 'Waist Circumference (cm)' in the Inputs panel — it opens pre-filled with 80.",
    "Set 'Height (cm)', which starts at 175; there is no calculate button, so the Result card recomputes on every keystroke and reads 0.46 with the caption Healthy at those defaults.",
    "Read the ratio and its band, then the 'Risk Category', 'Health Advice', 'Recommended Max Waist', 'Difference from Target' and 'Healthy Target Ratio' tiles, and press Copy to put the whole summary on the clipboard.",
  ],
  intro:
    "The Waist-to-Height Ratio Calculator divides your waist circumference by your height in the same units and places the result in one of four bands — below 0.40 Low, 0.40 to under 0.50 Healthy, 0.50 to under 0.60 Increased Risk, and 0.60 or above High Risk. It also shows the waist measurement that would put you at exactly 0.50, half your height, and how many centimetres you are above or below it. WHtR is a screening indicator of central body fat, not a diagnosis — it is information to take to a clinician, not a verdict.",
  useCases: [
    "Your BMI reads as normal but your trousers keep getting tighter, and you want a measure that reflects where the weight actually sits rather than total mass alone.",
    "You are setting a concrete target before a health check and want a number to aim at — the calculator tells you the exact waist in centimetres that puts you at 0.50 for your height.",
    "You are tracking progress every few weeks and want a single figure that moves as your waist changes, since your height stays fixed and the ratio isolates the variable you can influence.",
  ],
  benefits: [
    ["Gives you a target in centimetres", "Instead of an abstract ratio it converts the 0.50 threshold into the actual waist measurement for your height, and shows how far away you are."],
    ["Height-adjusted, unlike waist alone", "An 85 cm waist means something different at 160 cm and 190 cm tall; dividing by height puts short and tall people on the same scale."],
    ["Four bands, including a low one", "It flags ratios below 0.40 as well as high ones, rather than treating smaller as automatically better."],
  ],
  faqs: [
    [
      "What is a healthy waist-to-height ratio?",
      "Below 0.50 — your waist should measure less than half your height. This calculator treats 0.40 to 0.50 as the healthy band, 0.50 to 0.60 as increased risk, and 0.60 and above as high risk. The 'keep your waist to less than half your height' rule is the widely used public-health message for adults.",
    ],
    [
      "Where exactly should I measure my waist?",
      "Around the narrowest point between the bottom of your ribs and the top of your hip bones, or at the level of the navel if there is no obvious narrowing. Measure directly against the skin or over light clothing, standing relaxed at the end of a normal exhale, with the tape snug but not compressing the skin.",
    ],
    [
      "Is waist-to-height ratio better than BMI?",
      "For central fat, generally yes — BMI cannot tell abdominal fat from muscle or from weight carried on the hips, whereas WHtR targets the fat around the organs that is most associated with cardiometabolic risk. Many clinicians use both together rather than either alone.",
    ],
    [
      "Does it apply to children and pregnant women?",
      "The under-0.50 guidance is aimed at adults. Children's cut-offs vary with age, and waist measurement is not a meaningful screen during pregnancy or shortly after. If you are in either group, or your result lands in a risk band, speak to a doctor rather than acting on this number alone.",
    ],
  ],
};

export default seo;
