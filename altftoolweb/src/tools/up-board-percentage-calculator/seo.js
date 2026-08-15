const seo = {
  title: "UP Board Percentage Calculator: Class 10 & 12",
  metaDescription:
    "Total your UPMSP marks over 600 (Class 10) or 500 (Class 12) for the exact percentage, the 33% subject pass check and First/Second/Third Division.",
  steps: [
    "Choose the 'Examination level', then type each subject's mark (out of 100) into the six High School fields or five Intermediate fields.",
    "Read the Class 10 or Class 12 percentage headline with 'Total marks', 'Pass status' against the 33% per-subject minimum, and the Division.",
    "Check the 'UP Board divisions' cutoff table below, then press 'Copy result' for the summary or Reset to restore the sample marks.",
  ],
  intro:
    "This calculator works out a UP Board (UPMSP) percentage the way the board computes it: total marks divided by 600 for High School (six subjects of 100 marks) or by 500 for Intermediate (five subjects of 100 marks). It also applies the board's pass standard of 33% per subject and reports the division — First from 60%, Second from 45%, Third from 33%. It is built for Class 10 and Class 12 students of Uttar Pradesh checking their result before admissions, scholarship forms or job applications.",
  useCases: [
    "A Class 10 student totalling six subject scores to see the exact percentage and division on a 600-mark base",
    "A Class 12 student checking whether 298 out of 500 clears the 60% First Division line before filling a university form",
    "A student with 32 in one subject confirming that the 33% subject minimum means Fail even with a high aggregate",
  ],
  benefits: [
    ["Correct base per level", "Uses 600 marks for High School and 500 for Intermediate, matching the UPMSP marksheet."],
    ["Division decided for you", "First, Second or Third Division is derived from the same 60/45/33 percent cutoffs the board uses."],
    ["Subject-minimum check", "Flags any subject below the 33% pass mark so a failing result is never shown as a division."],
  ],
  faqs: [
    [
      "How is the UP Board percentage calculated for Class 10 and Class 12?",
      "Divide your total marks by the maximum and multiply by 100. High School (Class 10) counts six subjects of 100 marks each, so the base is 600; Intermediate (Class 12) counts five subjects, so the base is 500. For example, 425 out of 600 is 70.83%.",
    ],
    [
      "What percentage is First Division in UP Board?",
      "60% of the aggregate — that is 360 out of 600 marks in High School or 300 out of 500 in Intermediate. Second Division starts at 45% and Third Division at 33%; 75% and above is conventionally described as First Division with Distinction.",
    ],
    [
      "What are the passing marks in UP Board exams?",
      "33% in each subject, i.e. 33 marks out of 100. A student scoring below 33 in one or two subjects is placed in the compartment/improvement category rather than being awarded a division, so this tool shows Fail whenever any subject is under the minimum.",
    ],
    [
      "Does UP Board use a best-of-five rule like CBSE?",
      "No. UPMSP counts all six High School subjects and all five Intermediate subjects in the aggregate — there is no dropping of the lowest score. If a university computes its own best-of-four or best-of-five for admission, that is the university's rule, not the board's marksheet percentage.",
    ],
  ],
};

export default seo;
