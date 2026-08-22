const seo = {
  title: "Anna University GPA Calculator: O-U Grade Scale",
  metaDescription:
    "Semester GPA by Anna University's Σ(Ci×GPi)/ΣCi formula: grades O (10) to C (5), U and AB at 0 with credits still counted, for up to 15 courses.",
  steps: [
    "For each course row, pick the Grade awarded — O (Outstanding, 10 pts) down to U or AB at 0 — and enter the Course credits; Add course allows up to 15 rows.",
    "Read the Semester GPA out of 10, computed as Σ(Ci×GPi) ÷ ΣCi, with total credits, credit points and arrear (U/AB) credits listed below it.",
    "Check the built-in Anna University grade scale table (marks bands 91–100 down to 50–55), then click Copy result for the per-course breakdown.",
  ],
  intro:
    "This calculator computes an Anna University semester GPA using the formula in the university's UG regulations: GPA = Σ(Ci × GPi) ÷ ΣCi, the credit weighted mean of grade points. It is built for B.E., B.Tech and allied-programme students of Anna University and its affiliated colleges who want the GPA from their letter grades (O = 10 down to C = 5, with U and AB at 0) before or alongside the official grade sheet.",
  useCases: [
    "A second-year student entering grades for six theory courses and two labs to estimate the semester GPA on results day",
    "A student with one U grade seeing how much the 0-point arrear pulls the GPA down while its credits stay in the denominator",
    "Comparing what the GPA becomes if a B+ in a 4-credit course had been an A, before applying for revaluation",
  ],
  benefits: [
    ["The regulation formula", "Uses Σ(Ci × GPi) ÷ ΣCi over registered courses, exactly as Anna University's UG regulations define GPA."],
    ["Full grade scale built in", "O, A+, A, B+, B, C, U and AB with their 10-point grade values and mark bands — no lookup needed."],
    ["Arrears handled honestly", "U and AB count at 0 grade points with their credits still in the denominator, matching how a fail actually hits the average."],
  ],
  faqs: [
    [
      "How is GPA calculated in Anna University?",
      "GPA = Σ(Ci × GPi) ÷ ΣCi — multiply each course's credits by its grade point, add them up, and divide by the total credits registered that semester. For example, A+ (9) in a 4-credit course, A (8) in a 3-credit course and O (10) in a 3-credit course give (36 + 24 + 30) ÷ 10 = 9.0.",
    ],
    [
      "What are the grade points for Anna University grades?",
      "O = 10, A+ = 9, A = 8, B+ = 7, B = 6, C = 5, and U (fail) or AB (absent) = 0, on a 10-point scale. Under the 2017 and 2021 UG regulations these letters correspond to mark bands of 91–100, 81–90, 71–80, 61–70, 56–60 and 50–55 respectively, with 50 as the pass mark.",
    ],
    [
      "Does a U grade affect my Anna University GPA?",
      "Yes — a U contributes 0 grade points while its credits remain in the denominator, so it drags the semester GPA down sharply. Once you clear the course in a later attempt, the grade earned then is used in the cumulative CGPA in place of the U.",
    ],
    [
      "What is the difference between GPA and CGPA at Anna University?",
      "GPA covers the courses of one semester; CGPA applies the same Σ(Ci × GPi) ÷ ΣCi formula across all courses completed in all semesters so far. Degree classifications such as first class with distinction are decided on the final CGPA and arrear history under the regulation you were admitted in, so check your specific regulation for the exact cut-offs.",
    ],
  ],
};

export default seo;
