const seo = {
  title: "Molecule Builder: Covalent Bonds and Molar Mass",
  metaDescription:
    "Drop H, C, O, N or Cl atoms on a canvas, click two to bond them, and read molar mass in g/mol. Water, methane, CO2 and ammonia presets carry VSEPR shapes.",
  steps: [
    "Add atoms from the Add Atom Elements palette — hydrogen, carbon, oxygen, nitrogen or chlorine — or load a preset such as Methane (CH₄) or Carbon Dioxide (CO₂).",
    "Click two atoms on the canvas to make or break a covalent bond between them, and drag any atom to reposition it.",
    "Read Structure Properties for the molecular weight in g/mol and the VSEPR shape; Reset Workspace returns you to the water preset.",
  ],
  intro:
    "The Molecule Builder is a 2D chemical structure sketchpad: drop hydrogen, carbon, oxygen, nitrogen or chlorine atoms onto a canvas, click any two of them to form or break a covalent bond, drag them into position, and read the molecular weight update as the sum of the standard atomic masses. It is aimed at students meeting covalent bonding and VSEPR geometry for the first time, and at teachers who want a structure they can redraw live on a screen. Four worked presets — water, methane, carbon dioxide and ammonia — load with their formula, molar mass and the VSEPR shape and bond angle that go with them.",
  useCases: [
    "You are revising VSEPR before an exam and want to see why water is bent at about 104.5 degrees while carbon dioxide with the same three atoms is linear at 180.",
    "A student keeps drawing carbon with three bonds; you build the methane preset on screen and add a fifth hydrogen so they can see the four-bond valency for themselves.",
    "You need a quick check that the atoms in a structure you have sketched add up to the molar mass in the question — the panel totals the atomic masses as you add or remove atoms.",
  ],
  benefits: [
    ["Bonds you make by clicking, not typing", "Select one atom, click a second, and the bond appears; click the same pair again and it is removed, so trying a different connectivity takes two clicks."],
    ["Molar mass recomputed live", "Every added atom updates the running total in g/mol from standard atomic masses, so you never have to look them up mid-problem."],
    ["Geometry paired with the structure", "Each preset carries its VSEPR shape and bond angle alongside the drawing, linking the flat sketch to the real three-dimensional arrangement."],
  ],
  faqs: [
    [
      "Which elements can I use?",
      "Five: hydrogen (valency 1, 1.008 g/mol), carbon (valency 4, 12.011), oxygen (valency 2, 15.999), nitrogen (valency 3, 14.007) and chlorine (valency 1, 35.45). That covers the organic and simple inorganic molecules taught at school level.",
    ],
    [
      "How is the molecular weight calculated?",
      "It adds the standard atomic mass of every atom on the canvas and shows the total to two decimal places in g/mol. Water's three atoms come to 18.015, methane's five to 16.04, carbon dioxide 44.01 and ammonia 17.03 — the same figures you would get from a periodic table.",
    ],
    [
      "Does it work out the VSEPR shape of a molecule I build myself?",
      "No. The shape and bond angle are shown for the four built-in presets — bent (~104.5°) for water, tetrahedral (109.5°) for methane, linear (180°) for carbon dioxide and trigonal pyramidal (107°) for ammonia. A structure you build from scratch is labelled 'Custom', and you work the geometry out from the electron pairs around the central atom yourself.",
    ],
    [
      "How do I draw a double bond?",
      "Double bonds appear in the presets — carbon dioxide loads with two of them, drawn as a thicker line — but bonds you create by clicking are single. To study a double-bonded structure, start from the carbon dioxide preset and modify it rather than building it up atom by atom.",
    ],
  ],
};

export default seo;
