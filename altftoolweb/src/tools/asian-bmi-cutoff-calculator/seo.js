const seo = {
  title: "Asian BMI Calculator: WHO Asia-Pacific 23 and 25 Cutoffs",
  metaDescription:
    "Read your BMI against the WHO Asia-Pacific cutoffs, overweight 23 and obese 25, beside the international bands, with 90/80 cm waist thresholds.",
  steps: [
    "Choose cm / kg or ft-in / lb, then enter your height, weight, Age (years) and Sex (for the waist threshold).",
    "Add a Waist circumference (cm, optional) to test it against the South Asian cutoffs of 90 cm for men and 80 cm for women.",
    "Read the BMI with its WHO Asia-Pacific band beside the WHO international one, the Asia-Pacific healthy weight range in kg for your height, and the waist-to-height ratio.",
  ],
  intro:
    "This calculator works out BMI as weight in kilograms divided by height in metres squared, then reads it against the WHO Asia-Pacific thresholds — overweight from 23 and obesity from 25 — instead of the international 25 and 30. It is for people of South and East Asian ancestry, whose risk of type 2 diabetes and cardiovascular disease rises at a lower BMI and a lower waist circumference than the standard bands imply. Both classifications are shown side by side, along with the South Asian waist cutoffs of 90 cm for men and 80 cm for women.",
  useCases: [
    "Checking whether a BMI of 23.5, which the international scale calls healthy, already sits in the at-risk band for an Indian adult",
    "Setting a realistic target weight from the Asia-Pacific healthy range of 18.5 to 22.9 rather than the wider 18.5 to 24.9",
    "Pairing BMI with a waist measurement before a diabetes screening conversation with a GP",
  ],
  benefits: [
    ["Both scales at once", "Shows the Asia-Pacific result and the WHO international result together, so the gap is obvious."],
    ["Waist included", "Adds the 90 cm and 80 cm South Asian abdominal-obesity thresholds and the waist-to-height ratio."],
    ["Target weight in kilograms", "Converts the healthy BMI band into the actual weight range for your height."],
  ],
  faqs: [
    [
      "What is a healthy BMI for Asians?",
      "18.5 to 22.9 kg/m2 under the WHO Asia-Pacific guideline, against 18.5 to 24.9 on the international scale. Above 23 counts as overweight or at increased risk, and 25 and above is classified as obese rather than merely overweight.",
    ],
    [
      "Why is the BMI cutoff lower for Asian people?",
      "At the same BMI, South and East Asian populations carry more visceral fat and a higher percentage of body fat, so diabetes and cardiovascular risk appear at a lower weight. The WHO Expert Consultation published in The Lancet in 2004 reviewed this evidence and added public-health action points at BMI 23 and 27.5 for Asian populations.",
    ],
    [
      "What is the waist limit for Indians?",
      "90 cm for men and 80 cm for women, the South Asian thresholds used by the International Diabetes Federation and the 2009 Indian consensus statement on abdominal obesity. The equivalent European cutoffs are 94 cm and 80 cm. A waist-to-height ratio above 0.5 is a useful second check at any height.",
    ],
    [
      "Does the Asian BMI cutoff apply to children?",
      "No. BMI in anyone under 18 has to be read against age-and-sex growth charts as a percentile, not a fixed number, because healthy BMI changes year by year through childhood. This calculator only covers adults; a paediatrician or the IAP growth charts are the right reference for a child.",
    ],
  ],
};

export default seo;
