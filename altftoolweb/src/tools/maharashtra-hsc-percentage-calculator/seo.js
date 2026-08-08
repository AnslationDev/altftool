const seo = {
  title: "Maharashtra HSC Percentage Calculator (Base 600)",
  metaDescription:
    "Six subject marks out of 100 give your MSBSHSE HSC percentage on the 600 base, with the best-five additional subject rule and result class.",
  steps: [
    "Enter your English (compulsory) mark out of 100, then Subject 2 to Subject 6 — the fields carry the stream examples Physics / Economics, Chemistry / Book-Keeping, Maths / Secretarial Practice, Biology / OC and Second language / IT.",
    "Tick \"I offered an additional (seventh) subject\" and fill the Additional subject marks field, and the board rule keeps English plus your best five other scores, reporting the Lowest score dropped.",
    "Read the HSC percentage with Marks counted out of 600, Pass status (Passed — 35+ in every subject) and Result class against the MSBSHSE result classes table, then press Copy result.",
  ],
  intro:
    "This calculator computes a Maharashtra HSC (Std XII) percentage exactly as the MSBSHSE marksheet does: six subjects of 100 marks each on a base of 600, with English compulsory. If you offered an additional seventh subject, it applies the board's rule of counting English plus your best five other scores, and it reports the result class — Distinction (75%+), First Class (60%+), Second Class (45%+) or Pass Class (35%+). It is built for Maharashtra board students checking their percentage for FYJC-to-degree admissions, CET forms and scholarship applications.",
  useCases: [
    "A science student who offered seven subjects checking which six the board will count and what percentage lands on the marksheet",
    "A commerce student verifying whether 59.8% rounds into First Class territory before filling a degree admission form",
    "A student who scored 34 in one subject confirming that the 35-mark subject minimum means the result is Fail regardless of the aggregate",
  ],
  benefits: [
    ["Board-accurate base of 600", "Percentage is computed on six subjects of 100 marks, the same base MSBSHSE prints."],
    ["Additional-subject rule built in", "With a seventh subject, English plus the best five other scores are counted automatically."],
    ["Result class included", "Shows Distinction, First, Second or Pass Class from the same aggregate thresholds the board uses."],
  ],
  faqs: [
    [
      "How is the Maharashtra HSC percentage calculated?",
      "Total marks in six subjects divided by 600, times 100. Each subject carries 100 marks and English is compulsory, so a total of 482 out of 600 gives 80.33%. Grade-only subjects like Environment Education are excluded from this calculation.",
    ],
    [
      "What happens to my percentage if I took an additional seventh subject in HSC?",
      "The board still computes the percentage on 600 marks: English plus your best-scoring five of the remaining six subjects are counted, and the lowest of those six is dropped. The additional subject can therefore only help your percentage, never hurt it — though you must still score the pass mark in every subject you offered.",
    ],
    [
      "What percentage is Distinction and First Class in Maharashtra HSC?",
      "Distinction requires 75% or more of the aggregate, First Class 60%, Second Class 45% and Pass Class 35%. On the 600-mark base that means 450, 360, 270 and 210 total marks respectively.",
    ],
    [
      "What are the passing marks for Maharashtra HSC?",
      "35 out of 100 in each subject, which is 35%. A candidate below 35 in even one subject is marked Fail (eligible for the supplementary exam) no matter how high the overall aggregate is; this tool flags exactly that situation.",
    ],
  ],
};

export default seo;
