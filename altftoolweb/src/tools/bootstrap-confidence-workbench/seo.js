const seo = {
  title: "Bootstrap Confidence Interval Calculator, Seeded",
  metaDescription:
    "Percentile bootstrap CI for a sample mean, 100-20,000 resamples at 90/95/99% — seeded, so the same data, iterations and seed reproduce the same interval.",
  steps: [
    "Paste your observations into Numeric sample, separated by commas, spaces or semicolons — or press the Eight values example to load 12, 15, 18, 19, 22, 25, 27, 31.",
    "Set Bootstrap iterations anywhere from 100 to 20,000, choose a Confidence level (%) of 90%, 95% or 99%, and set the Seed; the defaults are 2000 iterations and seed 104729.",
    "Read the interval reported to six decimals alongside the Sample size, Sample mean, Iterations, Seed and Bootstrap median rows, then use Copy or Download to save bootstrap-confidence-workbench.txt.",
  ],
  intro:
    "The Bootstrap Confidence Workbench builds a percentile bootstrap confidence interval for a sample mean by resampling your data with replacement n times per iteration, then reading the interval off the sorted bootstrap distribution at the α and 1−α quantiles, where α = (100 − confidence) / 200. Because resampling is driven by a seeded linear congruential generator, the same sample, iteration count and seed always return the same interval — which matters when a number goes into a report someone else has to reproduce. You choose 90%, 95% or 99% confidence and anywhere from 100 to 20,000 iterations, and get back the interval, the sample mean, the sample size and the bootstrap median.",
  useCases: [
    "You have 8 measurements from a pilot run and no reason to believe they are normally distributed, so a t-interval feels unsafe and you want a resampling interval instead.",
    "A reviewer asks how you got a specific confidence interval, and you need to hand over the sample, the iteration count and the seed so they can regenerate it digit for digit.",
    "You want to see how much the interval moves between 2,000 and 20,000 bootstrap iterations before deciding how many replicates to report in a methods section.",
  ],
  benefits: [
    ["Reproducible by seed", "A seeded generator replaces Math.random, so a given sample, iteration count and seed reproduce the identical interval on any machine."],
    ["No distributional assumption", "The interval comes from the empirical resampling distribution of the mean rather than a normal or t approximation, which suits small or skewed samples."],
    ["Shows the diagnostics beside the interval", "Sample size, sample mean, iteration count, seed and the bootstrap median are reported with the interval so you can see whether the resampling distribution is centred on the sample mean."],
  ],
  faqs: [
    [
      "How many bootstrap iterations should I use?",
      "2,000 is the default and is generally adequate for a percentile interval on a mean; the tool accepts 100 to 20,000. More iterations reduce Monte Carlo noise in the interval endpoints but do not fix a small or unrepresentative sample — that is a data problem, not a resampling one.",
    ],
    [
      "What does the confidence level actually control?",
      "Which quantiles of the sorted bootstrap means become the endpoints. At 95% the interval runs from the 2.5th to the 97.5th percentile of the bootstrap distribution, at 90% from the 5th to the 95th, and at 99% from the 0.5th to the 99.5th.",
    ],
    [
      "Why is there a seed field?",
      "So the result is deterministic. Resampling is inherently random, and without a fixed seed two runs on the same data would give slightly different endpoints; recording the seed alongside the data and iteration count makes the interval fully reproducible.",
    ],
    [
      "When is a percentile bootstrap the wrong choice?",
      "When the observations are not independent or the statistic sits near a boundary — time series, clustered or repeated-measures data, very small or biased samples, and extreme tail quantiles all break the assumptions behind a plain percentile interval. Those cases call for a block bootstrap, a BCa interval or another design; treat this as an informational estimate and check the method with a statistician for published work.",
    ],
  ],
};

export default seo;
