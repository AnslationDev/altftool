const seo = {
  intro:
    "This map tracks NCERT reading for UPSC-style preparation as a subject-by-class grid covering classes 6 to 12, and computes coverage percentages per subject, per class and overall. It uses the standard UPSC NCERT reading list — History, Geography and Polity across classes 6-12, Economics from class 9, Science for classes 6-10 and Sociology in 11-12 — and weights each book as 0%, 50% or 100% depending on whether it is untouched, in progress or done. It is built for aspirants who read NCERTs across many classes at once and need to see gaps, not just lists.",
  useCases: [
    "A first-year UPSC aspirant plans an NCERT foundation round and tracks the 35-book grid as it fills",
    "An aspirant two months from prelims finds the weakest subject and class to prioritise remaining reading",
    "A mentor reviews a student's NCERT base by asking for the copied coverage summary",
  ],
  benefits: [
    ["Gap-finding grid", "Weakest subject and weakest class are computed for you, so the next book to pick is obvious."],
    ["True UPSC book set", "The grid only contains cells where a commonly-read NCERT actually exists — no phantom books."],
    ["Weighted, honest coverage", "In-progress books count half, so the percentage reflects reality, not intentions."],
  ],
  faqs: [
    [
      "Which NCERT books should I read for UPSC?",
      "The commonly recommended set spans classes 6-12: History, Geography and Polity/Civics for every class, Economics from class 9 onward, general Science for classes 6-10, and Sociology in classes 11-12 — about 35 books in all. Many aspirants start the old class 6-8 books quickly and spend most time on the class 9-12 volumes.",
    ],
    [
      "How is the coverage percentage calculated?",
      "Each available book counts as 1: Done contributes 100%, In progress 50% and Not started 0%, and the percentage is the weighted sum divided by the number of books in that subject, class or the whole grid. So finishing 7 of 7 History books shows History at 100%, while 3 done and 1 half-read of 4 Economics books shows 87.5%.",
    ],
    [
      "Should I read NCERTs class-wise or subject-wise for UPSC?",
      "Most mentors suggest subject-wise reading — all History from class 6 to 12 in sequence — because concepts build within a subject, not within a class. The map supports either approach: rows show subject-wise progress and columns show class-wise progress simultaneously.",
    ],
    [
      "Why are some cells in the grid blank?",
      "A blank cell means no commonly-read NCERT exists for that subject-class combination — for example there is no class 6 Economics book, and general Science stops at class 10 when streams split. Blank cells are excluded from every percentage so they never drag your coverage down.",
    ],
  ],
};

export default seo;
