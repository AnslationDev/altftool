const seo = {
  intro:
    "The pH Scale Visualizer turns any pH between 0 and 14 into the two numbers behind it — hydronium concentration from pH = -log₁₀[H⁺], and hydroxide concentration from the water constraint [H⁺][OH⁻] = 10⁻¹⁴ at 25 °C — and shows both in scientific notation as you drag the slider. Eleven household benchmarks from battery acid at pH 0 to drain cleaner at pH 14 snap the slider to a known value so the abstract number has something concrete attached. It is aimed at students meeting the logarithmic scale for the first time, and at anyone who needs to see why one pH unit is a tenfold change rather than a small step.",
  useCases: [
    "A chemistry student who has just been told pH is logarithmic and wants to watch [H⁺] fall from 1.0e-3 to 1.0e-4 mol/L as the slider moves a single unit from pH 3 to 4.",
    "Preparing a class demo on acids and bases by stepping through the presets — lemon juice at 2.0, black coffee at 5.0, blood at 7.4, bleach at 13.0 — so the ordering of everyday substances is visible on one bar.",
    "Checking what the hydroxide concentration is at a given alkaline pH when working a homework problem, without redoing the 14 - pH arithmetic by hand each time.",
  ],
  benefits: [
    [
      "Both ion concentrations at once",
      "Every position on the slider reports [H⁺] and [OH⁻] together in exponential form, so the inverse relationship between them is visible rather than described.",
    ],
    [
      "Real substances anchor the number",
      "Eleven presets place vinegar, milk, baking soda, soap and bleach at their approximate pH, which makes a bare value like 8.5 mean something.",
    ],
    [
      "Named bands, not just a number",
      "The reading is classified as strongly acidic below pH 3, weakly acidic below 6.5, neutral through the middle, weakly alkaline above 7.5 and strongly alkaline above 11.",
    ],
  ],
  faqs: [
    [
      "What is the formula for pH?",
      "pH = -log₁₀[H⁺], where [H⁺] is the hydrogen (hydronium) ion concentration in moles per litre. Inverting it gives [H⁺] = 10⁻ᵖᴴ, which is exactly what this tool computes for every slider position.",
    ],
    [
      "Why is pH 7 neutral?",
      "Because in pure water at 25 °C the self-ionisation constant is Kw = 10⁻¹⁴, so [H⁺] and [OH⁻] are each 10⁻⁷ mol/L — equal, which is what neutral means. Kw rises with temperature, so the neutral point drifts slightly below 7 in hot water even though the solution is still neutral.",
    ],
    [
      "How much stronger is pH 3 than pH 5?",
      "One hundred times. Each whole pH unit is a factor of ten in hydrogen ion concentration, so two units is 10 × 10: pH 3 holds 1.0e-3 mol/L of H⁺ against 1.0e-5 mol/L at pH 5.",
    ],
    [
      "Can pH go below 0 or above 14?",
      "Yes. The 0–14 range is a convention that covers dilute aqueous solutions, but very concentrated strong acids can measure below 0 and concentrated hydroxides above 14, because the definition -log₁₀[H⁺] itself has no hard limits. This visualizer covers the standard 0–14 span in 0.1 steps.",
    ],
  ],
};

export default seo;
