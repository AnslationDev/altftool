const seo = {
  intro:
    "This calculator runs a two-sided pooled two-proportion z-test on an A/B test: enter visitors and conversions for each variant and it returns the z score, the exact p-value, each variant's conversion rate and the relative uplift. It pools the two samples to estimate the standard error, so the verdict is the standard frequentist one used by most experimentation platforms. You choose 90%, 95% or 99% confidence, and the result is called significant when p is below the matching alpha of 0.10, 0.05 or 0.01.",
  useCases: [
    "Your checkout variant converted 125 of 1,000 against the control's 100 of 1,000 and you need to know whether that 25% uplift is real before rolling it out",
    "A stakeholder wants to stop a test early on a promising-looking lead, and you want the p-value in front of you to show the gap is still inside the noise",
    "You are writing up a finished experiment and need the z score and p-value to quote alongside the conversion rates in the summary",
  ],
  benefits: [
    ["The actual test statistic, not just a verdict", "You get the z score and the p-value to six decimal places, so you can see how close a borderline result really is."],
    ["Absolute and relative effect side by side", "Both conversion rates and the relative uplift are reported, which stops a 0.2-point move on a tiny base from looking like a win."],
    ["Confidence target is explicit", "Switching between 90%, 95% and 99% changes the alpha the p-value is compared against, so the threshold behind the call is never hidden."],
  ],
  faqs: [
    [
      "What p-value counts as significant?",
      "Below your chosen alpha: 0.05 at 95% confidence, 0.10 at 90%, and 0.01 at 99%. A p-value of 0.03 clears the bar at 95% but not at 99%. The p-value is the probability of seeing a difference at least this large if the two variants actually converted at the same rate — it is not the probability that B is better.",
    ],
    [
      "Can I check the result while the test is still running?",
      "You can look, but do not decide. This is a single planned analysis: repeatedly checking and stopping the moment p dips under 0.05 inflates the false-positive rate well beyond the nominal 5%. Fix the sample size in advance, or use a sequential testing method designed for peeking.",
    ],
    [
      "Why is my big-looking uplift still not significant?",
      "Almost always sample size. The standard error scales with the square root of traffic, so at a 10% baseline a few hundred visitors per arm can only detect very large swings. A 10% to 12.5% move needs roughly a thousand visitors per variant to reach 95% confidence; smaller true effects need several times that.",
    ],
    [
      "Does this work for revenue or time-on-page tests?",
      "No. The pooled z-test assumes each visitor is a yes/no conversion, so it applies to binary outcomes like signups, purchases or clicks. Continuous metrics such as revenue per visitor or session duration are skewed and need a t-test, a bootstrap, or a test on a transformed metric instead.",
    ],
  ],
};

export default seo;
