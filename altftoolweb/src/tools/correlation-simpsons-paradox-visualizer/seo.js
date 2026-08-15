const seo = {
  title: "Correlation & Simpson's Paradox: Group vs Pooled r",
  metaDescription:
    "Paste rows as Group | x | y and get each group's Pearson r to six decimals beside the aggregate, with a sign-reversal flag when they disagree.",
  steps: [
    "Paste your data into 'Grouped x/y observations' as Group | x | y, one row per line, or load the 'Reversal example' preset.",
    "Set 'Minimum observations per group' to 2 or higher so undersized groups are left out of the group table.",
    "Read 'Possible Simpson's-paradox reversal' or 'No full sign reversal detected' above the aggregate r, with each group's n and within-group Pearson r listed below.",
  ],
  intro:
    "This tool computes the Pearson correlation coefficient r separately inside each group of your data and again on the pooled data, then flags Simpson's paradox — the case where every group's r points one way but the aggregate r points the other. You paste rows as \"Group | x | y\", set a minimum group size (default 2), and get each within-group r to six decimals alongside the aggregate. It is for anyone checking whether a headline correlation survives once the data is split by the variable that actually separates the observations.",
  useCases: [
    "A dashboard says conversion rate falls as ad spend rises, and you want to check whether that reverses once you split the rows by campaign",
    "You are reviewing a study that reports a pooled correlation across hospitals, departments or cohorts, and you want to see whether the within-group correlations agree with it",
    "You are teaching Simpson's paradox and need a live example where two groups each trend upward but the combined scatter trends downward",
  ],
  benefits: [
    ["Within-group and pooled r side by side", "Each group's Pearson r and n are tabled against the aggregate, so a disagreement is visible instead of inferred."],
    ["Explicit reversal test", "It compares the sign of every qualifying group's r against the sign of the aggregate and says outright whether a full reversal is present."],
    ["Minimum group size filter", "Groups below your threshold are excluded from the group table, so a two-point group cannot manufacture a spurious sign."],
  ],
  faqs: [
    [
      "What is Simpson's paradox?",
      "It is when a correlation or trend present in every subgroup disappears or flips sign once the subgroups are combined. The classic cause is a lurking variable that determines both group membership and the outcome — the 1973 Berkeley admissions case is the standard example, where the pooled data suggested bias against women but department-by-department it did not.",
    ],
    [
      "How does the tool decide a reversal happened?",
      "It flags a reversal only when every group that meets your minimum size has a non-zero r of the same sign and the aggregate r has the opposite sign. A mix of positive and negative group correlations, or an aggregate r of exactly zero, reports as no full sign reversal.",
    ],
    [
      "What correlation does it calculate?",
      "Pearson's r, reported to six decimal places and bounded between -1 and +1. Pearson measures linear association only, so a strong curved relationship can still show an r near zero — plot the points before trusting any single coefficient.",
    ],
    [
      "Why do I need at least two observations per group?",
      "Pearson's r is undefined for a single point, and the tool returns 0 for any group with fewer than two rows. The minimum is set to 2 by default and cannot go lower; raising it to 5 or 10 is usually wiser, because r from two or three points is dominated by noise. This is exploratory analysis, not a significance test — consult a statistician before drawing conclusions from it.",
    ],
  ],
};

export default seo;
