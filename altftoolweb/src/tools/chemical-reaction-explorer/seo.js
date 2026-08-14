const seo = {
  title: "5 Types of Chemical Reactions: Animated Explorer",
  metaDescription:
    "Animate combination, decomposition, single and double replacement and combustion, each with its balanced equation and enthalpy in kJ/mol.",
  intro:
    "This explorer animates one worked example of each of the five main reaction classes — combination, decomposition, single replacement, double replacement and combustion — showing reactant particles fade out as products form, with the balanced equation and its standard enthalpy change alongside. You can play the transformation, pause it, or drag a slider to sit at any point between reactants and products. It is built for chemistry students learning to recognise reaction types and read a balanced equation, not for balancing arbitrary equations you type in.",
  useCases: [
    "You are revising reaction classification for a school test and keep confusing single replacement (Zn + 2HCl) with double replacement (AgNO3 + NaCl)",
    "You are teaching conservation of mass and want to pause mid-reaction to point out that the atom counts on both sides never change",
    "You need to explain why a negative enthalpy change means heat is released, using an equation with a real number attached rather than an abstract diagram",
  ],
  benefits: [
    ["Scrubbable, not just a play button", "The slider lets you stop anywhere between 0% and 100% conversion, so you can hold the exact frame you want to talk about."],
    ["Each class gets a real, balanced example", "The five reactions are shown with their proper coefficients and states, including the AgCl precipitate that makes double replacement visible."],
    ["Enthalpy shown with the equation", "Every reaction carries its standard enthalpy change in kJ/mol next to its thermodynamic label, tying the classification to the energy released."],
  ],
  faqs: [
    [
      "What are the five types of chemical reaction shown here?",
      "Combination (2H2 + O2 gives 2H2O), decomposition (2H2O2 gives 2H2O + O2), single replacement (Zn + 2HCl gives ZnCl2 + H2), double replacement (AgNO3 + NaCl gives AgCl precipitate + NaNO3), and combustion (CH4 + 2O2 gives CO2 + 2H2O). Each has its own animation and enthalpy value.",
    ],
    [
      "How much energy does burning methane release?",
      "The standard enthalpy change for complete methane combustion is about -890.3 kJ per mole of CH4, the largest release among the five reactions here. The negative sign marks it as exothermic, which is why methane works as a domestic fuel.",
    ],
    [
      "What does a negative enthalpy change mean?",
      "It means the reaction releases heat to its surroundings, so the products hold less chemical energy than the reactants. All five reactions in this explorer are exothermic, ranging from about -65.5 kJ/mol for the silver chloride precipitation up to -890.3 kJ/mol for methane combustion.",
    ],
    [
      "Can I enter my own equation and have it balanced?",
      "No, this tool animates five fixed worked examples rather than accepting free-form input. Use it to see how each reaction class behaves and how a balanced equation is read; balancing an arbitrary equation is a separate task.",
    ],
  ],
};

export default seo;
