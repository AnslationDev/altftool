const seo = {
  title: "Delhi University Attendance Calculator — 66.67% Rule",
  metaDescription:
    "Check each DU paper against Ordinance VII's two-thirds rule with exact integer maths — see lectures you can still miss or the exact recovery run you need.",
  steps: [
    "Enter \"Lectures delivered\" and \"Attended\" for each paper, using \"Add paper\" for up to 20 papers — the two-thirds rule binds every paper separately.",
    "Check each row's \"Eligible\" or \"Short\" status against the 66.67% line, judged with exact integer arithmetic.",
    "Read \"Can still miss\" for safe skips or \"Attend in a row to recover\" for the exact consecutive-lecture run, then click \"Copy result\".",
  ],
  intro:
    "This calculator tracks Delhi University attendance paper by paper against the two-thirds rule of Ordinance VII — a student must attend at least 2/3 (66.67%) of the lectures delivered in each paper to be eligible for the semester examination. Because 2/3 is an exact fraction, the tool uses exact integer arithmetic: eligibility is 3 × attended ≥ 2 × held, safe misses are (3 × attended − 2 × held) ÷ 2, and the recovery run is 2 × held − 3 × attended lectures in a row.",
  useCases: [
    "A DU student checking each paper before the college finalises the exam eligibility certificate",
    "Working out exactly how many morning lectures can be skipped in one paper while staying above two-thirds",
    "A student at 63% in an AECC paper finding the precise consecutive-lecture run needed to become eligible again",
  ],
  benefits: [
    ["Exact fraction, exact answers", "Uses the 2/3 ratio with integer arithmetic, so boundary cases like 20 of 30 lectures are judged exactly — no rounding surprises."],
    ["Per paper, as DU applies it", "Ordinance VII binds each paper separately; the tool flags any one paper that would block eligibility."],
    ["Safe-miss and recovery counts", "For every paper: how many lectures you can still miss, or the exact run needed to climb back."],
  ],
  faqs: [
    [
      "What is the minimum attendance required in Delhi University?",
      "Two-thirds of the lectures delivered — 66.67% — in each paper, under DU's Ordinance VII, along with the prescribed share of tutorials and practicals. Colleges certify this per paper when sending students up for the semester examination.",
    ],
    [
      "How many lectures can I miss and still keep 66.67% attendance at DU?",
      "The exact head-room is (3 × attended − 2 × held) ÷ 2, rounded down. At 30 of 40 lectures (75%) you can miss 5 more, because 30 of 45 is exactly two-thirds; the sixth miss drops you below the line.",
    ],
    [
      "How do I recover a DU attendance shortage?",
      "Attend 2 × held − 3 × attended lectures consecutively. At 19 of 30 lectures that is 2 × 30 − 3 × 19 = 3 straight lectures, giving 22 of 33 — exactly two-thirds. The formula grows quickly, so a deep shortage late in the semester can become mathematically unrecoverable.",
    ],
    [
      "Does DU condone attendance shortage?",
      "Ordinance VII allows specific categories — such as illness supported by a medical certificate, and participation in NCC, NSS, sports or other authorised university activities — to be counted or condoned by the college and university authorities. It is case-by-case and documented, so treat two-thirds of lectures actually attended as the number to plan around.",
    ],
  ],
};

export default seo;
