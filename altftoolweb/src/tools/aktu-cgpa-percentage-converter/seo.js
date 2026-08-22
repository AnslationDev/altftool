const seo = {
  title: "AKTU CGPA to Percentage: (CGPA − 0.75) × 10 Rule",
  metaDescription:
    "Apply AKTU's own (CGPA − 0.75) × 10 rule both ways, combine semester SGPAs credit-weighted, and see your division band — 8.0 CGPA reads as 72.5%.",
  steps: [
    "Pick a mode under 'What do you want to convert?' — CGPA to %, % to CGPA or SGPA to CGPA — and enter 'Your CGPA (0 to 10)' or 'Your percentage (0 to 100)'.",
    "In SGPA to CGPA mode, enter each semester's credits and SGPA with 'Add semester' for more rows; tick 'All papers cleared in the first attempt' for the Honours check.",
    "Read the converted figure with the '(CGPA − 0.75) × 10' formula row and your division band, then press 'Copy result' to copy it with the formula named.",
  ],
  intro:
    "This converter applies Dr. A.P.J. Abdul Kalam Technical University's own equivalence — percentage = (CGPA − 0.75) × 10 — to turn an AKTU CGPA into the percentage that placement portals and eligibility forms ask for, so a CGPA of 8.0 reads as 72.5%. It also inverts the formula for forms that want a CGPA, combines semester SGPAs credit-weighted into a CGPA, and shows the division band (Honours, First or Second) the ordinances attach to your figure.",
  useCases: [
    "A B.Tech final-year student converting a 7.8 CGPA to 70.5% for a campus-placement form with a 70% cutoff",
    "A graduate applying abroad who needs the exact CGPA equivalent of the percentage printed on a transcript request",
    "A student mid-course combining SGPAs of completed semesters, credit-weighted, to see where the degree CGPA is heading",
  ],
  benefits: [
    ["University's own formula", "Uses AKTU's published (CGPA − 0.75) × 10 rule, not a generic × 9.5 approximation that shifts your figure."],
    ["Works both directions", "Converts CGPA to percentage and percentage back to CGPA under the same rule for any form's format."],
    ["Division shown", "Maps the result to First Division with Honours (7.5+), First Division (6.5+) or Second Division (5.0+) per the ordinances."],
  ],
  faqs: [
    [
      "How do I convert AKTU CGPA to percentage?",
      "Multiply (CGPA − 0.75) by 10 — that is the conversion AKTU itself notifies for reporting an equivalent percentage of marks. A CGPA of 8.0 becomes 72.5%, and 7.25 becomes exactly 65%. The same rule applies when converting a single semester's SGPA.",
    ],
    [
      "What percentage is a 7.5 CGPA in AKTU?",
      "67.5%, computed as (7.5 − 0.75) × 10. A CGPA of 7.5 is also the ordinance threshold for First Division with Honours, provided every paper was cleared in the first attempt.",
    ],
    [
      "What CGPA is first division in AKTU?",
      "A CGPA of 6.5 and above earns First Division under AKTU ordinances, and 7.5 and above with all papers cleared in the first attempt earns First Division with Honours. Second Division runs from 5.0 — which is also the minimum CGPA for the award of the degree — up to below 6.5.",
    ],
    [
      "Why does AKTU subtract 0.75 instead of multiplying CGPA by 9.5?",
      "Each university fixes its own equivalence, and AKTU's notified rule is the linear (CGPA − 0.75) × 10; UGC's CGPA × 9.5 is a general CBCS guideline some other institutions use. The two differ by several percentage points, so use AKTU's rule for AKTU marksheets and name the formula on any form — an admissions office can reject a figure computed with the wrong one.",
    ],
  ],
};

export default seo;
