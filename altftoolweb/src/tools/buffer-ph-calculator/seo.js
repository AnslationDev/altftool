const seo = {
  intro:
    "The Buffer pH Calculator applies the Henderson–Hasselbalch equation, pH = pKa + log10([A⁻]/[HA]), to return the estimated pH of a buffer from the acid's pKa and the amounts of weak acid and conjugate base you enter. It reports the pH to six decimals along with the base-to-acid ratio and the mole fraction of each species, and accepts either concentrations or moles because the equation depends only on their ratio. It is an approximation: activity coefficients, ionic strength, dilution, competing equilibria and the temperature dependence of pKa are not modelled, so the temperature field is recorded as a note rather than used in the calculation.",
  useCases: [
    "You are preparing an acetate buffer for a lab session and want to check that 0.1 M acetic acid with 0.1 M sodium acetate really sits at pH 4.76 before you weigh anything out.",
    "A protocol specifies pH 5.0 and you need to know what base-to-acid ratio gets you there from a pKa of 4.76 — in this case about 1.74 to 1.",
    "You are working through a Henderson–Hasselbalch problem set and want to check your log-ratio arithmetic against a computed answer.",
  ],
  benefits: [
    ["Takes concentrations or moles interchangeably", "Only the base-to-acid ratio enters the equation, so molarity and mole quantities give the same pH without conversion."],
    ["Shows the ratio and species fractions, not just pH", "Seeing base/acid alongside the acid and base mole fractions makes it obvious how far from the 1:1 midpoint your buffer sits."],
    ["States what the approximation leaves out", "The note names the assumptions — no activity coefficients, no ionic-strength correction, no temperature-adjusted pKa — so results are read as an estimate to verify with a meter."],
  ],
  faqs: [
    [
      "What is the Henderson–Hasselbalch equation?",
      "pH = pKa + log10([conjugate base] / [weak acid]). When base and acid are equal the log term is zero and the pH equals the pKa exactly, which is why an equimolar acetate buffer sits at about 4.76.",
    ],
    [
      "What base-to-acid ratio do I need for a target pH?",
      "Rearrange to ratio = 10^(pH − pKa). For a target pH of 5.00 with a pKa of 4.76 the ratio is 10^0.24, about 1.74 parts conjugate base to 1 part acid.",
    ],
    [
      "Over what pH range does a buffer actually work?",
      "Roughly pKa ± 1, which corresponds to base-to-acid ratios between 1:10 and 10:1. Outside that window one component is nearly exhausted and the buffer capacity to resist added acid or base falls away quickly.",
    ],
    [
      "Why doesn't the temperature field change the calculated pH?",
      "Because Henderson–Hasselbalch takes temperature effects through the pKa, not as a separate term, and the calculator uses the pKa exactly as you enter it. If your buffer is used at 37 °C rather than 25 °C, look up the pKa at that temperature and enter it — for Tris the shift is substantial, while for acetate it is small.",
    ],
  ],
};

export default seo;
