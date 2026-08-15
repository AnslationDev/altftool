const seo = {
  title: "Confidence Interval Calculator from Estimate",
  metaDescription:
    "Enter an estimate and its standard error, pick 90, 95 or 99%, and read the bounds with the exact z (1.959964 at 95%) and margin of error.",
  steps: [
    "Type your figure into \"Sample estimate\" and its already-computed \"Standard error\" in the Inputs panel, or press the \"Mean 50 ± SE 2.5\" example chip to load a worked case.",
    "Choose 90%, 95% or 99% from Confidence level, and tick \"Append percentage units\" when the estimate is a proportion so both bounds carry a % suffix.",
    "Read the lower-to-upper interval with its \"95% normal confidence interval\" caption and the Estimate, Standard error, Critical value (1.959964 at 95%) and Margin of error tiles, then Copy the summary or Download it as confidence-interval-calculator.txt.",
  ],
  intro:
    "This confidence interval calculator takes a sample estimate and its already-computed standard error and returns the normal-approximation interval estimate ± z × SE, using the exact critical values 1.644854 for 90%, 1.959964 for 95% and 2.575829 for 99%. Students, analysts and anyone reading a survey result get the lower and upper bounds plus the margin of error broken out as its own line. It assumes you already have a valid standard error, so it is a critical-value step rather than a full analysis of raw data.",
  useCases: [
    "A paper reports a mean of 50 with a standard error of 2.5 but no interval, and you want the 95% bounds before citing the finding.",
    "You have a survey proportion of 0.42 with a standard error of 0.03 and need the margin of error in percentage points to write the methodology footnote.",
    "A reviewer asks what the result looks like at 99% rather than 95%, and you need both intervals side by side to show how much wider the stricter level gets.",
  ],
  benefits: [
    [
      "Margin of error shown separately",
      "The z value and the margin are listed as their own rows, so you can quote the ± figure directly instead of subtracting the bounds yourself.",
    ],
    [
      "Exact critical values, not rounded ones",
      "It uses 1.959964 rather than the textbook shorthand of 1.96, which keeps the bounds right when the standard error is large.",
    ],
    [
      "Percent units carried through",
      "A toggle appends % to the estimate, standard error and both bounds, so proportion results read correctly without manual relabelling.",
    ],
  ],
  faqs: [
    [
      "what is the z score for a 95% confidence interval",
      "1.959964, usually quoted as 1.96. The other levels offered here use 1.644854 for 90% and 2.575829 for 99% — all two-sided values leaving half the remaining probability in each tail.",
    ],
    [
      "how do you calculate a confidence interval from a standard error",
      "Multiply the standard error by the critical value for your confidence level to get the margin of error, then add and subtract it from the estimate. An estimate of 50 with a standard error of 2.5 at 95% gives a margin of about 4.9 and an interval of roughly 45.1 to 54.9.",
    ],
    [
      "should I use z or t for my interval",
      "Use t when the population variance is unknown and the sample is small, since the t distribution has heavier tails and produces a wider, more honest interval. This calculator applies the normal z value throughout, so for a small sample look up the t critical value for your degrees of freedom and multiply by the same standard error.",
    ],
    [
      "what does a 95% confidence interval actually mean",
      "That if the same sampling procedure were repeated many times, about 95% of the intervals produced would contain the true population value — not that there is a 95% chance the true value lies in this particular interval. The guarantee also assumes the standard error is correct, which fails under clustering, weighting, skew or finite-population effects that need survey-specific or bootstrap methods.",
    ],
  ],
};

export default seo;
