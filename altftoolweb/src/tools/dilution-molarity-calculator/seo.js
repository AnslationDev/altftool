const seo = {
  title: "Dilution & Molarity Calculator: C1V1 = C2V2 Solver",
  metaDescription:
    "Solve V2 = C1V1/C2 and get the diluent to add plus the dilution factor, or switch to Molarity from mass for moles and mol/L from grams.",
  steps: [
    "On the C₁V₁ = C₂V₂ mode, enter Stock concentration C₁, Stock volume V₁ (mL) and Final concentration C₂ — the 'Dilute 2 M to 0.5 M' preset loads 2, 25 mL and 0.5.",
    "Switch to the Molarity from mass mode to work the other calculation instead: Solute mass (g), Molar mass (g/mol) and Solution volume (L), with the NaCl example preset filling 5.844 g at 58.44 g/mol in 1 L.",
    "Read the final volume in mL with Diluent to add, Dilution factor and the C₁V₁ product listed as rows (or mol/L with Moles for the mass mode), then Copy or Download it as dilution-molarity-calculator.txt.",
  ],
  intro:
    "This calculator solves the two arithmetic steps behind most bench solutions: the dilution equation C₁V₁ = C₂V₂, rearranged to give the final volume V₂ = C₁V₁ / C₂, and molarity from mass, M = (mass ÷ molar mass) ÷ volume in litres. Alongside the answer it reports the diluent you actually have to add (V₂ − V₁), the dilution factor C₁/C₂, and the mole count, so you can check the working rather than trusting one number. It is an arithmetic aid for students and lab users — it does not know your reagent's purity, hydration state or hazards.",
  useCases: [
    "You have a 2 M stock and need 0.5 M working solution from 25 mL of it, and want the final volume and the millilitres of solvent to add",
    "You weighed out 5.844 g of NaCl (molar mass 58.44 g/mol) into a 1 L flask and want to confirm it comes to 0.1 mol/L before labelling the bottle",
    "A protocol gives a dilution factor rather than concentrations and you want to check that your planned volumes really produce that factor",
  ],
  benefits: [
    ["Tells you what to add, not just the total", "The diluent line gives V₂ − V₁ directly, which is the number you pipette — the step most people do in their head and get wrong."],
    ["Both directions in one place", "Switch between C₁V₁ = C₂V₂ and molarity-from-mass without re-entering the problem in a different tool."],
    ["Full working shown", "Moles, molar mass, volume, dilution factor and the C₁V₁ product are listed as rows so a wrong input is obvious at a glance."],
  ],
  faqs: [
    [
      "How do I use C1V1 = C2V2?",
      "Rearrange it to V₂ = C₁V₁ / C₂ to find the volume your diluted solution must end up at, then subtract V₁ to get the solvent to add. Taking 25 mL of 2 M stock to 0.5 M gives V₂ = (2 × 25) / 0.5 = 100 mL, so you add 75 mL of diluent — a 4× dilution.",
    ],
    [
      "How do I calculate molarity from grams?",
      "Divide the mass by the molar mass to get moles, then divide by the solution volume in litres. 5.844 g of sodium chloride at 58.44 g/mol is 0.1 mol, which in 1 L is 0.1 mol/L.",
    ],
    [
      "Do the concentration units have to be molar?",
      "No — C₁ and C₂ only have to match each other. The equation is a ratio, so mg/mL, % w/v, X-strength buffer or mol/L all work as long as both concentrations use the same unit; the volume answer comes back in the same unit as V₁, which this page labels in millilitres.",
    ],
    [
      "Why does my measured concentration come out slightly off?",
      "Usually hydration, purity or volume additivity. Hydrated salts carry water in their formula mass (for example CuSO₄·5H₂O is 249.7 g/mol, not 159.6), reagents below 100% assay contribute less solute than they weigh, and dissolving solute changes the total volume — which is why you make up to the mark in a volumetric flask rather than adding solvent to a fixed volume. Follow your lab's safety and glassware procedures; this page only does the arithmetic.",
    ],
  ],
};

export default seo;
