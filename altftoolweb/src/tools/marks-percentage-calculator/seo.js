const seo = {
  title: "Marks Percentage Calculator with CBSE Grade Bands",
  metaDescription:
    "Enter obtained and maximum marks per subject to get your aggregate percentage, CBSE-style A1-E grade band, and any subjects below your pass mark.",
  steps: [
    "Enter Marks obtained and Maximum marks for each subject — click Add subject for more rows and set the Pass mark per subject (%), default 33.",
    "The aggregate updates live as total obtained divided by total maximum times 100, with a per-subject percentage bar and pass flag.",
    "Read the A1-E grade band and the subjects-below-pass-mark count, then click Copy result for a text report of the full breakdown.",
  ],
  "intro": "Marks Percentage Calculator turns your subject-wise scores into an aggregate percentage in one step: it adds up every subject's obtained marks, adds up every subject's maximum marks, and divides one by the other. It also shows each subject's individual percentage, flags any subject below your pass mark, and maps the aggregate onto CBSE-style A1-to-E grade bands. Built for school and college students checking board results, semester marksheets, or internal assessments.",
  "useCases": [
    "Work out your CBSE or state board aggregate the moment the marksheet is out, before the school publishes the percentage.",
    "Check a five-subject or six-subject total where papers carry different maximum marks (say 100, 80 and 50).",
    "Spot which subjects fell below the 33% pass mark and need a re-exam or improvement paper."
  ],
  "benefits": [
    [
      "Handles unequal maximums",
      "Subjects out of 80, 50 or 100 are combined correctly because totals are summed before dividing."
    ],
    [
      "Subject-wise breakdown",
      "Every subject gets its own percentage and progress bar, so weak papers are obvious at a glance."
    ],
    [
      "Adjustable pass mark",
      "Set 33%, 35% or 40% to match your board or university rule and see failing subjects highlighted."
    ]
  ],
  "faqs": [
    [
      "How is marks percentage calculated?",
      "Percentage = (total marks obtained / total maximum marks) x 100. Add every subject's obtained marks first, then every subject's maximum, and divide — do not average the individual subject percentages unless all papers carry the same maximum."
    ],
    [
      "Why is averaging subject percentages sometimes wrong?",
      "If one paper is out of 50 and another out of 100, averaging their percentages gives them equal weight. Summing marks first weights each paper by its actual maximum, which is how boards compute the aggregate."
    ],
    [
      "What is the pass mark in Indian boards?",
      "CBSE requires 33% in each subject (theory plus practical combined, with a separate 33% in each component where applicable). Many state boards and universities use 35% or 40%, so set the pass mark field to match your own rulebook."
    ],
    [
      "Does the calculator include additional or optional subjects?",
      "Only if you add them as rows. Many boards compute the aggregate on the best five subjects and treat the sixth as optional, so add exactly the subjects your board counts."
    ]
  ]
};

export default seo;
