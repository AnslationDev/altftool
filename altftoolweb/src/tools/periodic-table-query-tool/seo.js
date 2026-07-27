const seo = {
  intro:
    "This periodic table query tool searches all 118 confirmed elements by name, symbol or atomic number and filters them by category, orbital block, period and standard state, then sorts on any measured property — atomic mass, Pauling electronegativity, first ionisation energy, radius, density, melting and boiling point. Period, group and block are derived from the atomic number using the standard IUPAC 18-column layout rather than stored as data. It is built for chemistry students, teachers and anyone who needs a specific number faster than a wall chart allows.",
  useCases: [
    "Sort every element by electronegativity to confirm fluorine tops the Pauling scale at 3.98.",
    "Filter to the f-block to list all 30 lanthanides and actinides for a homework question.",
    "Compare iron and copper side by side on melting point, density and ionisation energy, then export the filtered set as CSV.",
  ],
  benefits: [
    ["Derived layout, not guesswork", "Period, group and block come from the IUPAC 18-column rule, so the f-block series are handled correctly."],
    ["Sortable on any property", "Unmeasured values sort to the bottom instead of masquerading as zero."],
    ["CSV out in one click", "Copy or download the filtered set with 15 columns for a spreadsheet or a lab report."],
  ],
  faqs: [
    [
      "Which element has the highest electronegativity?",
      "Fluorine, at 3.98 on the Pauling scale, followed by oxygen at 3.44 and chlorine at 3.16. Electronegativity generally rises across a period and falls down a group.",
    ],
    [
      "How many elements are in the periodic table?",
      "118 confirmed and named elements, ending with oganesson (Z 118), named by IUPAC in 2016. This tool holds all of them, including the superheavy synthetic elements whose properties are largely unmeasured.",
    ],
    [
      "How many elements are in each period?",
      "2 in period 1, 8 in periods 2 and 3, 18 in periods 4 and 5, and 32 in periods 6 and 7 — which adds to 118. The extra 14 in periods 6 and 7 are the lanthanide and actinide f-block series.",
    ],
    [
      "Why are some property values blank?",
      "Because they have never been measured. Elements above roughly Z 104 have been produced only a few atoms at a time with half-lives of milliseconds, so density, melting point and electronegativity simply do not exist as measured values.",
    ],
  ],
};

export default seo;
