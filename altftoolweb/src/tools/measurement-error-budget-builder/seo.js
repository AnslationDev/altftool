const seo = {
  title: "Measurement Uncertainty Budget Calculator (GUM)",
  metaDescription:
    "Enter one source per line as name | uncertainty | distribution | sensitivity. Rectangular ÷√3, triangular ÷√6, normal-k2 ÷2, then RSS to expanded U.",
  steps: [
    "Fill the Uncertainty sources box with one line per source in the form `Repeatability | 0.12 | normal | 1` — name, stated uncertainty, distribution, sensitivity coefficient — or press the Three sources example chip to load a worked set.",
    "Set Output coverage factor k (default 2, minimum 0.1), and leave \"Treat sources as independent\" ticked to combine components by root-sum-square, or untick it for a straight absolute sum.",
    "The Result panel prints the expanded uncertainty with the combined standard uncertainty and k beneath it, over a table of Stated u, Distribution, Sensitivity, Standard u and Contribution per source; Download saves it as measurement-error-budget-builder.txt.",
  ],
  intro:
    "The Measurement Error-Budget Builder turns a list of uncertainty sources into a GUM-style budget: each stated uncertainty is converted to a standard uncertainty by its distribution divisor (rectangular divided by root 3, triangular by root 6, an already-expanded normal-k2 value by 2), multiplied by its sensitivity coefficient, and combined into one figure that is then multiplied by your coverage factor k. You enter one source per line as `name | stated uncertainty | distribution | sensitivity`, and get back a full contribution table plus the combined standard and expanded uncertainty. It is a first-order organiser for metrology work, not a substitute for an accredited uncertainty evaluation.",
  useCases: [
    "You are drafting a calibration certificate and need to show, line by line, how repeatability, instrument resolution and the reference standard's own uncertainty roll up into the expanded figure you quote.",
    "A resolution specification is given as a full interval, and you need to see what it actually contributes once it is treated as a rectangular distribution and divided by root 3 rather than used at face value.",
    "You suspect one source dominates your budget and want the contribution column to prove it before spending money on a better reference or more repeat readings.",
  ],
  benefits: [
    ["Distribution conversion is built in", "Rectangular, triangular, already-expanded normal-k2 and plain standard inputs are each divided by the right factor instead of being summed as stated."],
    ["Sensitivity coefficients are applied per source", "Each line carries its own coefficient, so sources measured in different units still combine correctly into the output quantity."],
    ["Independent and worst-case combination", "Toggle between root-sum-square for independent sources and a straight absolute sum when you want a conservative bound."],
  ],
  faqs: [
    [
      "What divisor does each distribution use?",
      "Rectangular (uniform) is divided by the square root of 3, triangular by the square root of 6, and a value already expanded at k = 2 is divided by 2. A source entered as `normal` is treated as already being a standard uncertainty and is used with a divisor of 1.",
    ],
    [
      "What coverage factor should I use?",
      "k = 2 is the default and the usual choice, because for a roughly normal distribution with adequate degrees of freedom it corresponds to about a 95 percent level of confidence. k = 3 is sometimes used for a higher level; the tool accepts any k of 0.1 or more and always states the value used alongside the result.",
    ],
    [
      "How are the sources combined?",
      "By default they are combined as a root-sum-square of the individual contributions, which assumes the sources are independent. Turning that toggle off adds the absolute values of the contributions instead, giving a deliberately pessimistic bound for cases where you suspect correlation.",
    ],
    [
      "Is this enough for an accredited calibration report?",
      "No. It is a simplified first-order budget: it does not handle correlations between sources, effective degrees of freedom and the Welch-Satterthwaite equation, bias, drift, model uncertainty or traceability. Use it to organise and sanity-check a budget, and have the final evaluation reviewed by a qualified metrologist.",
    ],
  ],
};

export default seo;
