const seo = {
  title: "SGPA Calculator with Credits: UGC 10-Point & US 4-Point",
  metaDescription:
    "Computes SGPA = (grade point x credits) / total credits on the UGC 10-point or US 4-point scale, and shows each subject's pull on the average.",
  steps: [
    "Pick a Grade scheme (UGC 10-point letters O to F, US 4-point letters, or direct grade point entry), then fill each subject's Grade and Credit hours; Add subject allows up to 20 rows.",
    "The SGPA updates as you type using the credit-weighted mean: sum of grade point x credits divided by total credit hours, with quality points and failed credits listed below.",
    "Check the per-subject table for 'Pull on average' and 'SGPA without it', then press Copy result to copy the score and subject list as text.",
  ],
  intro:
    "This calculator computes SGPA — the credit weighted mean of grade points, SGPA = Σ(grade point × credits) ÷ Σ credits — from each subject's grade and credit hours. It supports the UGC choice based credit system 10-point letter scale (O = 10 down to F = 0), the US 4-point scale, and direct grade point entry, and it shows exactly how much each subject pulled the average up or down.",
  useCases: [
    "An engineering student entering seven subjects with 1 to 4 credits each to get the SGPA before the official grade card arrives",
    "A student who failed one core subject checking how much the zero grade dragged the average and what the SGPA would be without it",
    "Someone on the US 4-point scale converting letter grades with plus and minus steps into a term GPA weighted by credit hours",
  ],
  benefits: [
    ["Credits weighted correctly", "A 4-credit subject moves the average twice as far as a 2-credit one, exactly as registrars compute it."],
    ["Per-subject impact", "Shows each subject's pull on the average and the SGPA you would have had without it."],
    ["Three grade schemes", "UGC 10-point letters, US 4-point letters, or type the grade point your institution awarded directly."],
  ],
  faqs: [
    [
      "How is SGPA calculated from grades and credits?",
      "SGPA = sum of (grade point × credit hours) divided by total credit hours. For example, an A (8 points) in a 4-credit subject, B+ (7) in a 3-credit subject and O (10) in a 3-credit subject give (32 + 21 + 30) ÷ 10 = 8.3. Credits act as weights, so heavier subjects move the average more.",
    ],
    [
      "What are the grade points in the UGC 10-point CBCS scale?",
      "O = 10, A+ = 9, A = 8, B+ = 7, B = 6, C = 5, P = 4 and F = 0. P (4 points) is the minimum passing grade under the UGC choice based credit system; an F or an absence carries 0 points but its credits still count in the denominator, which is why one failed subject hurts the SGPA disproportionately.",
    ],
    [
      "Why does a failed subject lower SGPA so much?",
      "Because a fail contributes 0 quality points while its credits stay in the denominator. A 4-credit F in an otherwise all-O semester of 8 credits drops the SGPA from 10 to 5 — the failed credits dilute every other grade rather than simply being ignored.",
    ],
    [
      "Is SGPA the same as CGPA?",
      "No. SGPA covers one semester; CGPA is the credit weighted average across all semesters completed so far. You can compute CGPA by treating each semester's SGPA and total credits as one row in the same weighted-mean formula.",
    ],
  ],
};

export default seo;
