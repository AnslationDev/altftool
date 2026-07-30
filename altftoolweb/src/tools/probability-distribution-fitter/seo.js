const seo = {
  intro:
    "This fitter takes a numeric sample, estimates the parameters of the normal, exponential and lognormal distributions from it, and ranks those candidates by AIC = 2k − 2·lnL so you can see which shape describes your data best. Parameters come from the sample moments: the normal gets the sample mean and the population standard deviation, the exponential gets λ = 1/mean, and the lognormal gets the mean and standard deviation of the logged values. It is a quick exploratory comparison for students and analysts deciding which model is worth pursuing, not a goodness-of-fit test.",
  useCases: [
    "You have 200 measured service times and need to decide whether to model them as exponential or lognormal before building a queueing simulation.",
    "A stats assignment asks which of three distributions best fits a sample and you want to check your hand-computed AIC values.",
    "Sanity-checking a set of measurement errors to confirm the normal assumption behind a test you are about to run is not obviously wrong.",
  ],
  benefits: [
    ["Ranks models, not just fits one", "All three candidates are scored on the same sample so you compare AIC values side by side instead of eyeballing a single curve."],
    ["Penalises extra parameters", "AIC charges 2 per parameter, so the one-parameter exponential is not beaten by the two-parameter lognormal on log-likelihood alone."],
    ["Skips models that cannot apply", "Exponential and lognormal are only offered when every value in the sample is strictly positive, since both are undefined at or below zero."],
  ],
  faqs: [
    [
      "How is the AIC calculated here?",
      "AIC = 2k − 2·lnL, where k is the number of estimated parameters: 2 for the normal (mean and standard deviation), 1 for the exponential (λ), and 2 for the lognormal (μ and σ of the logs). Lower is better, and the lowest-scoring model is reported first.",
    ],
    [
      "Why are exponential and lognormal missing from my results?",
      "Because at least one value in the sample is zero or negative, or the positive-only toggle is off. Both distributions have support only on the positive reals, so their log-likelihoods are undefined for non-positive data and the comparison is limited to the normal.",
    ],
    [
      "Does a lowest AIC mean the distribution actually fits?",
      "No. AIC ranks the candidates against each other, so the winner is only the best of the two or three models tried — it can still fit badly. Confirm with an actual goodness-of-fit test such as Kolmogorov-Smirnov or Anderson-Darling, plus a Q-Q plot, before relying on the choice.",
    ],
    [
      "How many data points do I need?",
      "At least 2 for the tool to return anything, but that is a floor for the arithmetic, not a sensible sample. AIC comparisons between two-parameter models are unstable on small samples; a few dozen observations is a more realistic minimum, and tail behaviour needs considerably more.",
    ],
  ],
};

export default seo;
