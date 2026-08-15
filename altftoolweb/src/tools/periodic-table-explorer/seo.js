const seo = {
  title: "Periodic Table Explorer: 25 Element Reference",
  metaDescription:
    "Browse 25 elements with atomic mass, noble-gas electron configuration, melting and boiling points in °C, density, discovery year and uses.",
  steps: [
    "Search by element name, symbol or atomic number, or narrow the grid with the category dropdown (Alkali Metal, Halogen, Noble Gas and six more).",
    "Click an element tile in the grid, such as Fe or Au, to load its detail card.",
    "Read Atomic Mass, Electron Config in noble-gas shorthand like [Ar] 3d⁶ 4s², Melting Point, Boiling Point, Density, Year Discovered and Common Uses & Applications.",
  ],
  intro:
    "Periodic Table Explorer is a browsable reference card set for all 118 IUPAC-recognized chemical elements, from hydrogen to oganesson, showing atomic number, atomic mass in unified mass units, electron configuration in noble-gas shorthand, melting and boiling points in °C, density, year of discovery and real industrial uses. Search by name, symbol or atomic number, or filter to one of ten families such as alkali metals, lanthanides, halogens or noble gases. Built for students meeting periodic trends for the first time and anyone who needs one element's numbers quickly.",
  useCases: [
    "Checking that sodium's configuration is [Ne] 3s¹ before writing out an ionic bonding answer in homework",
    "Comparing the alkali metals side by side to see why melting point falls as you go down group 1 — lithium 180.5 °C, sodium 97.8 °C, potassium 63.5 °C",
    "Looking up whether an element is a metalloid before deciding which side of the staircase it sits on in a class exercise",
  ],
  benefits: [
    ["Configuration in noble-gas shorthand", "Each card gives the condensed form, such as [Ar] 3d⁶ 4s² for iron, which is what exams expect you to write."],
    ["Physical constants on one card", "Melting point, boiling point, density and atomic mass sit together, so trend questions do not need four lookups."],
    ["Family filter with colour coding", "Ten categories from alkali metal to actinide are colour-tagged, making blocks and groups visible at a glance."],
  ],
  faqs: [
    [
      "Which elements are included in this explorer?",
      "All 118: every IUPAC-recognized element from hydrogen (1) through oganesson (118), including the full lanthanide and actinide series. Superheavy synthetic elements past uranium carry the same physical-property cards, with fields marked 'Unknown' where no value has ever been measured.",
    ],
    [
      "What does a notation like [Ne] 3s² 3p² mean?",
      "It is condensed electron configuration: the bracketed noble gas stands for all the electrons in that core, and the rest lists the valence shell. Silicon's [Ne] 3s² 3p² means neon's 10 electrons plus four more in the third shell, which is why silicon forms four bonds.",
    ],
    [
      "Why are elements ordered by atomic number rather than atomic mass?",
      "Because atomic number — the proton count — is what determines chemical behaviour, and ordering by it makes the recurring valence patterns line up into groups. Ordering by mass puts a few pairs, such as argon and potassium, in the wrong chemical family.",
    ],
    [
      "What is the difference between a group and a period?",
      "A group is a vertical column of elements sharing a valence electron count and therefore similar reactions; a period is a horizontal row sharing the same outermost shell. Chlorine is in group 17 with the other halogens and in period 3 alongside sodium and silicon.",
    ],
  ],
};

export default seo;
