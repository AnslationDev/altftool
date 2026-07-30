const seo = {
  intro:
    "This workbench fits a straight calibration line to your concentration/response pairs by unweighted ordinary least squares, then derives detection limits from the scatter around that line: LOD = 3.3 × σ ÷ |slope| and LOQ = 10 × σ ÷ |slope|, the sigma-factor convention used in ICH Q2. σ here is the residual standard deviation, √(Σresiduals² ÷ (n − 2)). You paste one \"concentration | response\" pair per line and get the slope, intercept, R², residual SD and a per-point residual table alongside the two limits.",
  useCases: [
    "You have just run a six-point HPLC or UV-Vis standard curve and need LOD and LOQ figures to write into the method section",
    "A reviewer questioned your detection limit and you need to show the residual behind it — which point is pulling the fit, and by how much",
    "You are comparing two sigma conventions, say 3σ versus 3.3σ for LOD, and want to see how much the reported limit actually moves",
  ],
  benefits: [
    [
      "Shows the residuals, not just the fit",
      "Every point gets its fitted y and residual in a table, so curvature or a bad standard at the low end is visible instead of hidden inside a good-looking R².",
    ],
    [
      "Sigma factors are yours to set",
      "The 3.3 and 10 defaults follow the common convention, but both are editable, so you can reproduce a 3σ/10σ house method or a protocol that specifies something else.",
    ],
    [
      "States its own assumptions",
      "The tool is explicit that this is an unweighted OLS and residual-SD illustration, so you know what it did not do before quoting the number.",
    ],
  ],
  faqs: [
    [
      "How are LOD and LOQ calculated here?",
      "LOD = 3.3 × σ ÷ |slope| and LOQ = 10 × σ ÷ |slope|, where σ is the residual standard deviation of the calibration line and slope is its sensitivity. Both sigma factors are editable inputs, so setting LOD to 3.0 reproduces the 3σ convention some methods use instead.",
    ],
    [
      "What is σ in this formula?",
      "The residual standard deviation of the regression: the square root of the sum of squared residuals divided by n − 2. It uses n − 2 degrees of freedom because two parameters, slope and intercept, were estimated from the data. Some validated methods instead require the standard deviation of the blank or of replicate low-level standards — that is a different σ and will give a different limit.",
    ],
    [
      "How many calibration points do I need?",
      "At least three valid pairs, and the x values must actually vary or the slope is undefined. Three is the arithmetic minimum, not a good practice — analytical guidelines typically expect five or six concentration levels across the working range, and n − 2 degrees of freedom at n = 3 makes σ very unstable.",
    ],
    [
      "Can I use this figure in a validated method report?",
      "Treat it as an illustration rather than a validated result. It performs an unweighted ordinary least-squares fit only, and does not handle blank SD, replicate low-level standards, weighting such as 1/x or 1/x², heteroscedasticity checks or matrix effects. Follow your jurisdiction's guidance and your laboratory's validation protocol for anything you submit.",
    ],
  ],
};

export default seo;
