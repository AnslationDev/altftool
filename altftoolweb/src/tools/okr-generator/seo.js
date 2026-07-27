const seo = {
  intro:
    "The OKR Generator builds one qualitative objective and three to five numeric key results for a chosen domain and quarter, deriving each target from a baseline and an ambition uplift (committed +10%, stretch +25%, moonshot +50%). It follows the discipline Andy Grove created at Intel and John Doerr set out in Measure What Matters: objectives are qualitative and time-bound, key results carry a start number and a target number, and progress is graded on a 0.0–1.0 scale. Useful for founders, team leads and anyone writing their first quarterly OKR set.",
  useCases: [
    "Draft a product activation OKR for Q3 in under a minute, then swap the placeholder baselines for your own analytics numbers.",
    "Show a team the difference between a committed target (+10%, expected to land at 1.0) and a stretch target (+25%, where 0.7 is success).",
    "Grade an in-flight objective mid-quarter by typing where each key result stands today.",
  ],
  benefits: [
    ["Numeric by construction", "Every key result gets a start value, a target value and a unit — never a task disguised as a result."],
    ["Ambition changes the maths", "The uplift is applied to the baseline, so switching from committed to moonshot moves every target at once."],
    ["Built-in quality checks", "Flags an objective that is really a metric, one with no period, and any set outside the three-to-five range."],
  ],
  faqs: [
    [
      "How many key results should an objective have?",
      "Three to five. Fewer than three usually means the objective is not really covered; more than five stops being focus. This generator enforces that range.",
    ],
    [
      "What score counts as success on an OKR?",
      "For aspirational or stretch OKRs, 0.7 on the 0.0–1.0 scale is the intended good outcome — the Google convention. Committed OKRs are different: they are expected to reach 1.0, and missing one is treated as a problem to review.",
    ],
    [
      "What is the difference between an objective, a key result and an initiative?",
      "The objective is the qualitative outcome you want by a date. Key results are the numbers that prove you got there. Initiatives are the work you will try in order to move those numbers — they can be swapped mid-quarter without changing the OKR.",
    ],
    [
      "How is progress on a key result calculated?",
      "Score = (current − start) ÷ (target − start), clamped between 0 and 1. It works unchanged for metrics that should go down, such as cutting mean time to restore from 90 to 68 minutes, because both differences flip sign together.",
    ],
  ],
};

export default seo;
