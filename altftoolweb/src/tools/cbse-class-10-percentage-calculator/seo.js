const seo = {
  intro:
    "This calculator computes a CBSE Class 10 percentage from subject-wise marks using the best-of-five convention: the average of your five highest-scoring subjects out of 100 each. CBSE itself prints only marks and positional A1–E grades on the marksheet, so the best-of-five average is what schools, admission committees and CBSE's own screening use as 'the percentage'. The tool also shows the overall all-subjects average and flags any subject below the 33% pass mark from the Examination Bye-laws.",
  useCases: [
    "A student with six subjects (five main plus an IT skill subject) computing the best-of-five percentage for Class 11 stream admission",
    "Parents checking whether a 32 in one subject means a fail under the 33% rule and how the skill subject affects the result",
    "Comparing the best-of-five figure against the all-six average before filling school admission forms that ask for percentage",
  ],
  benefits: [
    ["Best-of-five, done right", "Picks the five highest-scoring subjects automatically and shows exactly which ones counted."],
    ["Pass check built in", "Every subject is tested against the 33% pass standard and failures are named, not hidden in an average."],
    ["Both figures reported", "Shows the best-of-five percentage and the overall average so you can quote whichever a form asks for."],
  ],
  faqs: [
    [
      "How is CBSE Class 10 percentage calculated?",
      "Add the marks of your best five subjects and divide by 5 (each subject is out of 100). For example, 95 + 92 + 90 + 88 + 85 = 450, giving 90%. CBSE does not print a percentage on the marksheet, so this best-of-five average is the accepted convention for admissions and forms.",
    ],
    [
      "Is the 6th subject counted in CBSE Class 10 percentage?",
      "Only if it is among your top five scores. Under CBSE's scheme of studies, if a student fails one of Science, Mathematics or Social Science but passes the skill (6th) subject, the skill subject replaces the failed one in the result computation — best-of-five handles this automatically by dropping the lowest score.",
    ],
    [
      "What are the passing marks in CBSE Class 10?",
      "33% in each subject, per CBSE's Examination Bye-laws. For a subject out of 100 that means 33 marks, counting board theory and internal assessment together as CBSE currently aggregates them.",
    ],
    [
      "What do A1, A2 and B1 grades mean in CBSE Class 10?",
      "They are positional grades: A1 goes to roughly the top eighth of passed candidates in that subject, A2 to the next eighth, and so on down to D — they are assigned by rank, not by fixed marks. Mark bands like 91–100 for A1 are only indicative, which is why this tool labels its band column that way.",
    ],
  ],
};

export default seo;
