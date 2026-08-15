const seo = {
  title: "Periodic Table Query Tool: Search & Sort 118",
  metaDescription:
    "Search all 118 elements by name, symbol or atomic number, filter by category, orbital block, period or state, sort by any property, export CSV.",
  steps: [
    "Type into \"Search by name, symbol or atomic number\" - the placeholder shows iron, Fe, 26.",
    "Narrow the list with Category, \"Orbital block\", \"Standard state at 298 K\" and Period, then set \"Sort by\" to a property such as \"Electronegativity (Pauling)\" or \"First ionisation energy\" and choose Ascending or Descending.",
    "\"Matching elements\" counts the hits out of 118 and the Results table lists them; \"Copy CSV\" puts the filtered set on the clipboard and \"Download\" saves elements.csv.",
  ],
  intro:
    "This periodic table query tool lets you search all 118 confirmed elements by name, symbol, atomic number, or category, then explore each one in depth. Filter with category pills — alkali metal, noble gas, lanthanoid, and more — and review atomic mass, electron configuration, electronegativity, density, melting and boiling point, and other measured properties. Compare any two elements side by side, save favorites, and revisit recent searches from history. The Chemistry Section looks up predefined classroom reactions or builds a valence-balanced compound formula for pairs without one, an animated Atom Model Canvas and Atomic Structure Diagram visualize protons, neutrons, and electron shells, and a temperature slider simulates standard state across 0-6500K. Export the selected element's full profile as JSON or plain text, or copy a formatted report with one click.",
  useCases: [
    "Search for 'iron' or 'Fe' to instantly pull up atomic mass, electron configuration, and physical properties.",
    "Compare two elements side by side — for example, iron and copper on atomic mass, category, standard state, electron configuration, and density.",
    "Open the Chemistry Section to look up a predefined reaction, like sodium and chlorine forming NaCl, or generate a valence-balanced compound formula for a pair without one, like magnesium and oxygen forming MgO.",
  ],
  benefits: [
    ["Real element data, offline", "All 118 confirmed elements load from a local dataset, so search, filtering, and comparisons run instantly with no network calls."],
    ["Compare, favorite, and revisit", "Compare two elements at once, star favorites for quick access, and jump back into recent searches from history."],
    ["Export a single element's data", "Download the selected element's full profile as JSON or TXT, or copy a formatted report to your clipboard in one click."],
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
