const seo = {
  intro:
    "The CBC Report Interpreter takes the numbers off a Complete Blood Count and flags each one high, low or normal against standard adult reference ranges, then reads the pattern across them — classifying anaemia from the red-cell indices, converting the differential percentages into absolute counts, and pairing the platelet count with MPV. Haemoglobin, RBC and haematocrit ranges switch by sex (haemoglobin 13.5-17.5 g/dL male, 12.0-16.0 g/dL female), while WBC 4.5-11.0 K/uL, platelets 150-400 K/uL and MCV 80-100 fL are shared. It is an educational reading aid for students and for patients trying to follow a report before their appointment, not a diagnosis.",
  useCases: [
    "Your lab report came back with three values printed in bold and no explanation, and you want to understand what a low MCV alongside a low MCHC usually points to before you see the doctor.",
    "A medical student practising CBC interpretation wants to check whether their read of a case — high WBC with neutrophils above 70% — matches the pattern the indices actually support.",
    "You have a differential given only in percentages and need the absolute neutrophil count, which is what the neutropenia threshold is defined against.",
  ],
  benefits: [
    [
      "Reads patterns, not isolated values",
      "MCV, MCH, MCHC and RDW are combined into a morphology call — microcytic hypochromic, macrocytic, normocytic normochromic or mixed — with the usual differentials for each.",
    ],
    [
      "Converts the differential to absolute counts",
      "Percentages are multiplied by the WBC to give absolute neutrophil, lymphocyte, monocyte and eosinophil counts, which is where the clinically meaningful cut-offs sit.",
    ],
    [
      "Sex-specific reference ranges",
      "Haemoglobin, RBC and haematocrit are graded against male or female ranges rather than one averaged band, so borderline results are not misread.",
    ],
  ],
  faqs: [
    [
      "What is a normal haemoglobin level?",
      "This tool uses 13.5-17.5 g/dL for men and 12.0-16.0 g/dL for women, with haematocrit at 41-53% and 36-46% respectively. Laboratories publish their own ranges and the ones on your report take precedence.",
    ],
    [
      "What does a low MCV mean on a blood test?",
      "MCV below 80 fL means the red cells are smaller than normal — microcytic. Combined with a low MCHC it points to a microcytic hypochromic picture, whose common causes are iron deficiency, thalassaemia, anaemia of chronic disease and sideroblastic anaemia; iron studies are the usual next step.",
    ],
    [
      "What counts as a low neutrophil count?",
      "An absolute neutrophil count below 1.5 K/uL is neutropenia and raises infection risk; below 0.5 is severe. The tool calculates ANC as the neutrophil percentage divided by 100 and multiplied by the WBC, because the percentage alone can look normal while the absolute count is not.",
    ],
    [
      "Can this replace a doctor reading my blood test?",
      "No. It applies fixed reference ranges and pattern rules to numbers you type in, with no knowledge of your symptoms, medications, pregnancy, age or previous results — all of which change what a value means. Take any flagged result to a qualified clinician.",
    ],
  ],
};

export default seo;
