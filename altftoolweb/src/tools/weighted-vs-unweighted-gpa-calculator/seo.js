const seo = {
  title: "Weighted vs Unweighted GPA Calculator",
  metaDescription:
    "Enter each course's grade, credits and rigor to get both GPAs at once - unweighted on 4.0, weighted with +0.5 Honors and +1.0 AP/IB up to 5.0.",
  steps: [
    "For each course pick a Grade, enter Credits (in 0.25 steps) and choose the 'Course type' with its rigor bonus shown in the option label.",
    "Press 'Add course' to append rows or the Remove button to drop one — both GPAs recalculate instantly, credit-weighted.",
    "Read the Weighted GPA headline with the unweighted figure and rigor boost beneath it; 'Copy result' copies all four numbers.",
  ],
  intro:
    "This calculator computes a high-school GPA both ways at once: unweighted on the standard 4.0 letter scale, and weighted using the most common US convention of +0.5 for Honors and +1.0 for AP, IB and dual-enrollment courses on a 5.0 ceiling. Both figures are credit-weighted (Σ grade points × credits ÷ Σ credits), and failing grades earn no rigor bonus. It is built for students tracking class rank eligibility and for applicants who must report whichever GPA a college's form asks for.",
  useCases: [
    "A junior taking three AP classes checking how much rigor lifts their weighted GPA above the unweighted figure colleges also see",
    "A student deciding between an Honors and a regular section by testing the GPA effect of an expected B versus an A",
    "An applicant filling the Common App self-reported grades section that asks for GPA scale and whether it is weighted",
  ],
  benefits: [
    ["Both GPAs at once", "Unweighted 4.0-scale and weighted 5.0-scale figures from the same course list."],
    ["Credit-weighted maths", "Half-credit and multi-credit courses count proportionally, as registrars compute it."],
    ["Honest weighting", "Failing grades get no Honors/AP bonus, matching real school policies."],
  ],
  faqs: [
    [
      "What is the difference between weighted and unweighted GPA?",
      "An unweighted GPA grades every course on the same 4.0 scale, while a weighted GPA adds bonus points for harder courses — typically +0.5 for Honors and +1.0 for AP or IB — so it can reach 5.0. A straight-A student in all AP classes would have a 4.0 unweighted and 5.0 weighted GPA.",
    ],
    [
      "Do colleges look at weighted or unweighted GPA?",
      "Most colleges look at both but recalculate GPA their own way from your transcript, often unweighted in academic courses only. The unweighted GPA shows raw performance while course rigor is judged separately from the classes you chose, so taking the harder class for a slightly lower grade usually reads better than the reverse.",
    ],
    [
      "How much does an AP class add to GPA?",
      "Under the common +1.0 convention, an A in an AP class counts as 5.0 instead of 4.0 grade points. Spread over a schedule, one AP course among six classes lifts a weighted GPA by roughly 0.17 points, which is why heavy AP loads produce weighted GPAs in the 4.5+ range.",
    ],
    [
      "Does an F in an AP class still get the weight bonus?",
      "No. Standard practice is that the rigor bonus applies only to passing grades, so an F earns 0.0 grade points in any course type. Some districts extend this and exclude D grades from weighting too — check your school's handbook.",
    ],
  ],
};

export default seo;
