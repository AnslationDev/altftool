const seo = {
  title: "Teen BMI Calculator With IOTF Age and Sex",
  metaDescription:
    "BMI for ages 10 to 20 read against the IOTF curves that reach 25 and 30 at age 18, with the kilogram weight at each cut-off for that height.",
  steps: [
    "Choose centimetres and kilograms or feet, inches and pounds, then enter the height and weight.",
    "Enter the age in years, decimals allowed, and the sex, so the IOTF cut-off is interpolated for that exact age.",
    "Read the overweight and obesity lines for that age and sex, the kilogram weight at each, and what the adult 25/30 chart would say.",
  ],
  intro:
    "The Teen BMI Calculator computes body mass index as weight in kilograms divided by height in metres squared, then reads it against age- and sex-specific cut-offs rather than the adult lines at 25 and 30. It uses the International Obesity Task Force curves published by Cole and colleagues in the BMJ in 2000, which are constructed to pass through exactly 25 and 30 at age 18 — so a 12-year-old boy crosses into overweight at about 21.2, not 25. It is aimed at parents and teenagers who want the reading interpreted for the right age instead of an adult chart.",
  useCases: [
    "Checking a 13-year-old's BMI when an adult calculator returned a reassuring number that felt wrong.",
    "Seeing how many kilograms sit between a current weight and the age-specific overweight line at that height.",
    "Understanding why a reading of 22 is normal at 17 but above the overweight cut-off at 11.",
    "Preparing a figure to discuss at a school health check or GP appointment.",
  ],
  benefits: [
    ["Age-specific lines", "Reads BMI against the cut-off for that exact age and sex, interpolated between half-year points."],
    ["Shows the adult contrast", "Displays what the adult 25/30 chart would have said, so misclassification is visible rather than hidden."],
    ["Weights, not just indexes", "Converts each cut-off into the actual kilogram figure at that height."],
  ],
  faqs: [
    [
      "What is a healthy BMI for a 13-year-old?",
      "There is no single number — the overweight line sits at about 21.9 for a 13-year-old boy and 22.6 for a girl, rising to 25 for both by age 18. A BMI below that line rules out overweight, but growth patterns vary so much through puberty that a clinician's growth chart remains the better tool for any borderline result.",
    ],
    [
      "Why can't teenagers use the adult BMI chart?",
      "Because body fatness changes sharply through childhood and puberty, so the adult lines at 25 and 30 misclassify adolescents. A BMI of 24 is already in the obesity range for a 10-year-old but entirely normal at 18, which is why age- and sex-specific curves are used up to the eighteenth birthday.",
    ],
    [
      "What are IOTF BMI cut-offs?",
      "They are international child and adolescent overweight and obesity thresholds published in the BMJ in 2000 by Cole, Bellizzi, Flegal and Dietz. Each curve was drawn through data from six countries so that it reaches exactly 25 (overweight) and 30 (obesity) at age 18, making childhood readings comparable with the adult definitions.",
    ],
    [
      "Does this tool tell me if a teenager is underweight?",
      "No, and that is deliberate. A low adolescent BMI can reflect a normal late growth spurt, a constitutional build or a genuine problem, and telling them apart needs height, weight and growth velocity plotted over time by a clinician. If a teenager's weight is falling or they are eating very little, see a doctor rather than relying on any single index.",
    ],
  ],
};

export default seo;
