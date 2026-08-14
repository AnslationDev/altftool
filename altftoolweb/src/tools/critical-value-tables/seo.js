const seo = {
  title: "Critical Value Tables: t, z, Chi-Square and F at Any df",
  intro:
    "A critical value table gives the cut-off a test statistic must pass for a result to sit in the rejection region at a chosen significance level α, and this page computes those cut-offs live for the Student t, standard normal z, chi-square and F distributions. It is built for anyone reading a printed table and finding their degrees of freedom missing from it — students, analysts and researchers whose df is 37, or 214, or the fractional 18.7 that a Welch–Satterthwaite correction produced. Every figure comes from the distribution functions themselves: tail probabilities from the regularised incomplete beta I_x(a, b) and the regularised incomplete gamma Q(a, x) evaluated by continued fraction, inverted by bracketed bisection, so t(0.05, two-tailed, df = 10) returns 2.228138852 rather than the rounded 2.228 a book prints.",
  useCases: [
    "Look up a t critical value at a degrees of freedom that printed tables skip — they typically jump from 30 straight to 40, 60, 120 and ∞",
    "Turn an observed test statistic into an exact p-value instead of reporting only 'p < 0.05' because the table ran out of columns",
    "Get the chi-square cut-off for a goodness-of-fit or independence test at any df, in either the upper or the lower tail",
    "Read an F critical value for an ANOVA with an unusual numerator and denominator df combination",
    "Check a fractional degrees of freedom from a Welch–Satterthwaite correction, which no printed table can list",
  ],
  benefits: [
    [
      "Degrees of freedom are not capped",
      "Type any positive df, whole or fractional, up to 200,000 or ∞ — the row is computed, not looked up.",
    ],
    [
      "Exact p-values, not table bounds",
      "Enter the observed statistic and the page returns the tail probability itself, so you can report p = 0.0231 instead of p < 0.05.",
    ],
    [
      "Four distributions, one page",
      "t, z, chi-square and F share the same tail machinery, so the numbers are consistent across all of them.",
    ],
    [
      "Verifiable against identities",
      "χ²(0.05, df = 1) = 3.841458821 equals z(0.05, two-tailed)² = 1.959963985², and F(α; 1, v) equals t(α, two-tailed; v)² — both hold here to better than 1e-12 relative.",
    ],
    [
      "Never goes stale",
      "These are properties of the distributions, not published data. There is no source to update and no revision date to watch.",
    ],
  ],
  faqs: [
    [
      "What is the critical value of t at 0.05 with 10 degrees of freedom?",
      "For a two-tailed test at α = 0.05 with 10 degrees of freedom the t critical value is 2.228138852, which printed tables round to 2.228. For a one-tailed test at the same α and df it is 1.812461123. The two-tailed figure is the point that leaves α/2 = 0.025 in each tail, which is why it is the larger of the two.",
    ],
    [
      "Why do printed t tables stop at 30 degrees of freedom?",
      "Because past about df = 30 the t distribution is close enough to the standard normal that a book saves space by jumping to 40, 60, 120 and ∞ and letting readers interpolate. The gap is real but small: at α = 0.05 two-tailed, t is 2.042 at df = 30, 2.021 at df = 40 and 1.960 at df = ∞. This page computes the missing rows exactly, so df = 37 gives 2.026 without any interpolation.",
    ],
    [
      "What is the difference between a critical value and a p-value?",
      "A critical value is fixed before you see the data — it is the statistic value that cuts off probability α in the tail, such as 1.959963985 for a two-tailed z test at α = 0.05. A p-value is computed after, and is the tail probability beyond the statistic you actually observed. The two always agree at the boundary: a statistic exactly equal to the critical value has p exactly equal to α.",
    ],
    [
      "How accurate are the values on this page?",
      "Tail probabilities are evaluated by continued fractions for the regularised incomplete beta and incomplete gamma functions, iterated to a relative tolerance of 1e-15, and critical values invert them by bisection to a relative bracket width of 1e-13. Against published five-decimal tables every printed digit matches — 3.841 for χ²(0.05, df = 1), 18.307 for χ²(0.05, df = 10), 3.708 for F(0.05, df₁ = 3, df₂ = 10) — and against exact cross-distribution identities the agreement is better than 1e-12 relative.",
    ],
  ],
  steps: [
    "Choose Table mode for a full sheet of critical values, or Solve mode to work from one observed statistic.",
    "Pick the distribution: Student t, standard normal z, chi-square, or F.",
    "Set the tail — one-tailed or two-tailed for t and z, upper or lower tail for chi-square. F tables are upper-tail.",
    "In Table mode, type the degrees of freedom you want as rows, using commas and ranges such as 1-30, 40, 60, 120, inf. For F, set α and give the numerator df across the top and the denominator df down the side.",
    "In Solve mode, enter the observed test statistic, the significance level α, and the degrees of freedom, then read the exact p-value and the matching critical value.",
    "Use the copy button to take the table or the result away as tab-separated text.",
  ],
};

export default seo;
