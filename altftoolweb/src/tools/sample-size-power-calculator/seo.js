const seo = {
  title: "Sample Size and Power Calculator for Cohen's d",
  metaDescription:
    "d = 0.5 at 80% power and alpha 0.05 gives 63 per group, 126 total. Reports the z-values used and a recruitment number padded for 15% attrition.",
  steps: [
    "Enter the Standardized effect size (Cohen d), where 0.2 is small, 0.5 medium and 0.8 large, or tap the d=0.5, 80% power example.",
    "Pick a target power of 80, 90 or 95%, a two-sided alpha of 0.10, 0.05 or 0.01, and whether the design is a paired difference or two equal independent groups.",
    "The result gives the per-group n and the study total, with the z alpha and z power values used and a recruitment figure padded for 15% attrition.",
  ],
  intro:
    "The Sample Size & Power Calculator returns the number of observations needed to detect a standardised mean difference, using the normal approximation n = k × ((z_α/2 + z_β) ÷ d)², where k is 2 for two equal independent groups and 1 for a one-sample or paired design. You choose Cohen's d, a target power of 80%, 90% or 95%, and a two-sided alpha of 0.10, 0.05 or 0.01, and it reports the per-group figure, the total, the z-values it used, and a padded number that survives 15% attrition. It is for anyone sizing a study, an A/B test or a survey before collecting a single data point.",
  useCases: [
    "You are planning a two-arm trial, expect a medium effect around d = 0.5, and need the per-arm recruitment target for the protocol.",
    "A reviewer has asked you to justify your sample size, and you need the alpha, power and effect size stated explicitly alongside the resulting n.",
    "You expect around 15% of participants to drop out and want the inflated recruitment number rather than the clean analysis-stage n.",
  ],
  benefits: [
    [
      "Shows the z-values behind the number",
      "Reports z_α/2 and z_β alongside the result, so the calculation can be reproduced and defended in a methods section.",
    ],
    [
      "Per-group and total, plus attrition",
      "Gives the per-arm figure, the study total, and the number inflated for 15% dropout — the three numbers a protocol actually needs.",
    ],
    [
      "Paired and two-group in one place",
      "Switches the multiplier between 1 and 2 so a paired design is not accidentally sized as if it were two independent samples.",
    ],
  ],
  faqs: [
    [
      "How many participants do I need for 80% power?",
      "For a medium effect of d = 0.5 with two-sided alpha of 0.05 and 80% power, this normal approximation gives 63 per group, or 126 in total. The familiar textbook figure of 64 per group comes from a t-distribution refinement that adds a couple of observations; the difference is negligible at these sizes.",
    ],
    [
      "What is Cohen's d and what counts as a small effect?",
      "Cohen's d is the difference between two means divided by the pooled standard deviation, so it expresses an effect in standard-deviation units. Cohen's conventions put 0.2 as small, 0.5 as medium and 0.8 as large — and because sample size scales with 1/d², halving the effect you want to detect quadruples the sample you need.",
    ],
    [
      "What does statistical power actually mean?",
      "Power is the probability of detecting an effect that is genuinely there — 80% power means a 1-in-5 chance of missing it. Raising the target from 80% to 90% at d = 0.5 and alpha 0.05 moves the requirement from 63 to 85 per group, which is the cost of that extra certainty.",
    ],
    [
      "Should I add extra participants for dropout?",
      "Yes — power calculations give the number you need at analysis, not the number you recruit. Dividing by the expected completion rate is the standard adjustment; at 15% attrition the calculator shows 63 per group becoming 75. This is a large-sample approximation for a standardised mean effect, so clustered, unequal-arm, repeated-measures or multiple-outcome designs need a tailored power analysis from a statistician.",
    ],
  ],
};

export default seo;
