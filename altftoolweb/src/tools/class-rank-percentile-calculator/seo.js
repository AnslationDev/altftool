const seo = {
  title: "Class Rank to Percentile Calculator for College Apps",
  metaDescription:
    "Turn your class rank and class size into the top-X% figure and percentile applications ask for — rank 25 of 500 is top 5% and the 95th percentile.",
  steps: [
    "Enter Your class rank (1 = top) and the Class size (students ranked) from your transcript.",
    "Read your standing as a Top X% figure — rank ÷ class size × 100 — with the percentile counting classmates ranked below you.",
    "Check the Top 10% (decile) and Top 25% (quartile) rows for threshold rules, then click Copy result to paste the figures into your application.",
  ],
  intro:
    "This calculator converts a class rank and class size into the two figures applications ask for: the 'top X%' value (rank ÷ class size × 100) and the percentile, which is the share of classmates ranked strictly below you. A rank of 25 in a class of 500 is the top 5% and the 95th percentile. It is built for high-school students completing the Common App class rank section or checking eligibility for percentage-based automatic admission rules.",
  useCases: [
    "A student ranked 25th in a class of 500 confirming they can report 'top 5%' on the Common App",
    "A Texas senior checking whether their rank clears the state's top-10% automatic-admission threshold (top 6% for UT Austin)",
    "A scholarship applicant whose form asks for a percentile rather than a raw rank",
  ],
  benefits: [
    ["Both figures at once", "Top-percent and percentile from one input, since forms ask for either."],
    ["Threshold checks", "Instantly shows whether you fall in the top 10%, top quarter or top half."],
    ["Registrar-consistent", "Uses rank 1 as highest and the rank ÷ size convention schools report with."],
  ],
  faqs: [
    [
      "How do I calculate my class rank percentile?",
      "Divide your rank by the class size and multiply by 100 for the 'top X%' figure — rank 30 of 300 is top 10%. For the percentile, compute (class size − rank) ÷ class size × 100, which gives the share of students ranked below you: the same rank 30 of 300 is the 90th percentile.",
    ],
    [
      "What class rank is top 10 percent?",
      "Any rank at or above class size ÷ 10 — in a class of 400 that means rank 40 or better. Top-10% standing matters concretely in states like Texas, where Education Code §51.803 guarantees admission to public universities for top-10% graduates (UT Austin's automatic threshold is currently stricter, around the top 6%).",
    ],
    [
      "Is a higher or lower percentile better for class rank?",
      "Higher percentile is better: the percentile counts the students ranked below you, so the 95th percentile means you outrank 95% of the class. Confusingly, the 'top X%' figure runs the other way — a smaller number is better there.",
    ],
    [
      "What if my school does not rank students?",
      "Leave the rank fields blank on applications and let your counselor mark the school as non-ranking — over half of US high schools no longer publish ranks and colleges are used to it. Never estimate a rank yourself on an official form; admissions offices reconstruct standing from your GPA and the school profile instead.",
    ],
  ],
};

export default seo;
