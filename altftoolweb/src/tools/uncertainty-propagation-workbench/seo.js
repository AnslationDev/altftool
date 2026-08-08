const seo = {
  title: "Uncertainty Propagation: Combined & Expanded, k=2",
  metaDescription:
    "Combine input uncertainties for a product-and-power model in root-sum-square or conservative mode, with expanded uncertainty at your coverage factor k.",
  steps: [
    "Enter one line per component in \"Product/power components\" as Name | value | standard uncertainty | exponent — the default rows read \"Length | 10 | 0.1 | 2\" — or click the \"Area-style product\" example.",
    "Leave \"Assume independent inputs\" ticked to use root-sum-square relative uncertainty, or untick it for the conservative sum of relative terms, and set Coverage factor k (default 2, minimum 0.1).",
    "The Result shows the value ± its expanded uncertainty with Combined standard uncertainty, Relative standard uncertainty and a Relative contribution column per component; Download saves uncertainty-propagation-workbench.txt.",
  ],
  intro:
    "The Uncertainty Propagation Workbench combines the input uncertainties of a product-and-power measurement model, y = ∏ xᵢ^aᵢ, into a combined standard uncertainty and an expanded uncertainty using a coverage factor you choose. Each component contributes a relative term of |aᵢ · uᵢ / xᵢ|, and those terms are either combined in root-sum-square when the inputs are independent or added directly for a conservative worst case. Enter one line per component as name, value, standard uncertainty and exponent, and you get the result with its ± interval, the relative standard uncertainty as a percentage, and a table showing how much each input contributed.",
  useCases: [
    "You measured a rectangle's length and width with different instruments and need the uncertainty on the derived area, with a defensible statement of where it came from.",
    "A density or flow figure is calculated from several measured quantities and a reviewer wants to know which input dominates the error budget before you buy a better instrument.",
    "You are writing a calibration or lab report and need the expanded uncertainty at k = 2 alongside the combined standard uncertainty, in the form the report template expects.",
  ],
  benefits: [
    [
      "Per-component contribution table",
      "Every input's relative contribution is listed as a percentage, so the dominant term in the error budget is obvious rather than inferred.",
    ],
    [
      "Handles powers and divisions",
      "Exponents may be negative or fractional, so quotients and roots — a term entered as exponent -1 or 0.5 — propagate correctly without rearranging the model.",
    ],
    [
      "Independent and conservative modes",
      "Toggle between root-sum-square for uncorrelated inputs and a straight sum of relative terms when you cannot rule out correlation.",
    ],
  ],
  faqs: [
    [
      "How is combined uncertainty calculated for a product?",
      "For a product-and-power model, relative uncertainties combine rather than absolute ones: each component contributes |exponent × u / value|, and for independent inputs the combined relative uncertainty is the square root of the sum of those terms squared. Multiplying that by the absolute result gives the combined standard uncertainty.",
    ],
    [
      "What coverage factor should I use?",
      "k = 2 is the default and the usual choice in calibration reporting, because for an approximately normal distribution it corresponds to a coverage probability of about 95%. k = 3 gives roughly 99%, and k = 1 reports the standard uncertainty itself.",
    ],
    [
      "When should I turn off the independence assumption?",
      "Turn it off when the inputs share a common influence — the same reference standard, the same thermometer, or the same operator — because correlated errors do not partially cancel the way root-sum-square assumes. The conservative mode adds the relative terms directly, which bounds the result from above.",
    ],
    [
      "Does this replace a Monte Carlo uncertainty analysis?",
      "No. This is a first-order (linearised) propagation, so it can understate uncertainty when the model is strongly nonlinear over the input range, when an input's uncertainty is large relative to its value, or when inputs are far from normally distributed. In those cases validate against a Monte Carlo simulation of the full model.",
    ],
  ],
};

export default seo;
