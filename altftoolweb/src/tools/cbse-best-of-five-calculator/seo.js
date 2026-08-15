const seo = {
  title: "CBSE Best of Five Calculator: Class 12 Percentage",
  metaDescription:
    "Work out your CBSE Class 12 best-of-five percentage — compulsory language plus your four best subjects out of 500 — and see which subject drops out.",
  steps: [
    "Enter each subject's name and Marks (each out of 100), mark exactly one row as the 'Compulsory language', and press 'Add a subject' for a sixth or seventh — up to 8 subjects.",
    "Optionally set 'Percentage you are aiming at' to see the marks a college cutoff needs.",
    "Read the 'Best of five percentage' out of 500, the 'Subject dropped' with the marks it needed to get in, and the comparison against counting every subject, then press 'Copy result'.",
  ],
  intro:
    "Best of five is the aggregate rule almost every Indian institution applies to a CBSE Class 12 marksheet: the compulsory language plus the four highest scoring of the remaining subjects, divided by 500. This calculator applies that rule to the subjects you enter, shows which paper drops out, and compares the result with counting every subject. CBSE does not print a percentage or a division on the marksheet at all, which is why the figure has to be worked out this way.",
  useCases: [
    "A science student with a sixth subject seeing whether Physical Education displaces a weaker Chemistry score in the aggregate.",
    "Checking how many marks a college cutoff of 90% needs across the five counted subjects before filling an admission form.",
    "Comparing the best-of-five percentage with the all-subject percentage to know which figure a form is actually asking for.",
  ],
  benefits: [
    ["Shows the subject that drops", "Names the paper excluded and the marks it needed to stay in."],
    ["Keeps the language locked in", "Applies the rule correctly — English is counted whatever it scores."],
    ["Checks the pass condition too", "Flags any subject under the 33% pass mark, which a percentage hides."],
  ],
  faqs: [
    [
      "How is CBSE best of five percentage calculated?",
      "Add the marks of the compulsory language and your four highest-scoring other subjects, divide by 500 and multiply by 100. A student with English 75, Mathematics 95, Computer Science 91, Physics 88 and Chemistry 82 totals 431, which is 86.2%. The sixth subject is left out unless it beats one of those four.",
    ],
    [
      "Is English compulsory in best of five?",
      "Yes. The language you offered as a core subject is always counted in the aggregate, even when it is your lowest score, and cannot be swapped for a higher-scoring elective. Only the four subjects alongside it are chosen for being the best.",
    ],
    [
      "Does CBSE give a percentage on the marksheet?",
      "No. The Class 12 marksheet carries subject-wise marks and grades, with no aggregate percentage and no division. Any percentage you quote — best of five, best of four, or all subjects — is computed by you or by the institution you are applying to, using its own rule.",
    ],
    [
      "Can my sixth subject be counted in best of five?",
      "Yes, and that is the point of offering one: if it scores higher than one of your main electives, it takes that subject's place in the four. Some universities restrict which subjects qualify, publishing lists of academic and vocational subjects and applying a deduction when a subject outside the list is used, so check the prospectus of the course before assuming the swap will be accepted.",
    ],
  ],
};

export default seo;
