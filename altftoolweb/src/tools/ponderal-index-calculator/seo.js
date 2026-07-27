const seo = {
  intro:
    "The ponderal index, also called Rohrer's index or the corpulence index, is weight in kilograms divided by height in metres cubed. Because human mass scales closer to the cube of height than the square, BMI drifts upward for tall people and downward for short people, and dividing by height cubed corrects that drift. This calculator returns the adult index in kg/m³ alongside BMI so the difference is visible, and includes the newborn form used in neonatology, 100 × birth weight in grams ÷ crown-heel length in cm³.",
  useCases: [
    "Checking whether a 200 cm adult whose BMI reads 25 is genuinely heavy or simply tall",
    "Comparing the weight range allowed by the ponderal index against the weight range allowed by BMI at your height",
    "Working out a newborn's ponderal index to see whether a low birth weight is thin-for-length or proportionally small",
  ],
  benefits: [
    ["Height-fair", "Cubing height removes the bias that inflates BMI for tall adults and deflates it for short ones."],
    ["BMI shown alongside", "Both indices and both weight ranges appear together, so the disagreement is explicit."],
    ["Newborn mode", "Uses the 2.2 and 3.0 neonatal cutoffs that separate asymmetric growth restriction from normal."],
  ],
  faqs: [
    [
      "How do you calculate the ponderal index?",
      "Divide weight in kilograms by height in metres cubed. An adult of 80 kg and 1.80 m has a ponderal index of 80 ÷ 5.832, which is 13.7 kg/m³. For newborns the convention is different: multiply birth weight in grams by 100 and divide by length in centimetres cubed.",
    ],
    [
      "What is a normal ponderal index for adults?",
      "Roughly 11 to 15 kg/m³, with most adults sitting between 12 and 14. There is no WHO classification for adult ponderal index, so treat this as a descriptive range for tracking yourself rather than a clinical threshold, and use BMI or a body-fat measurement when a formal category is needed.",
    ],
    [
      "Is the ponderal index better than BMI?",
      "It is more fair at the extremes of height, and worse for everything else. BMI has decades of population data behind its cutoffs and the ponderal index does not, so BMI stays the standard for screening while the ponderal index is most useful for very tall or very short adults and for newborns.",
    ],
    [
      "What ponderal index is normal for a newborn?",
      "2.2 to 3.0, calculated as 100 × grams ÷ cm³. A value below 2.2 suggests asymmetric growth restriction, where the baby is thin for its length, and above 3.0 suggests the baby is heavy for its length. A paediatrician should interpret this alongside gestational age and growth charts.",
    ],
  ],
};

export default seo;
