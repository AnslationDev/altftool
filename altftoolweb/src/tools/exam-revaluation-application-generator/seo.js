const seo = {
  title: "Exam Revaluation Application Generator",
  metaDescription:
    "Draft a verification, photocopy or re-evaluation application, total the per-unit fee, count the days left to apply and see the corrected percentage.",
  steps: [
    "Pick the stage — Step 1: Verification of marks, Step 2: Photocopy of the evaluated answer book, or Step 3: Re-evaluation of specific questions, which also asks for the question numbers.",
    "Add each subject with its Maximum marks and Marks obtained, tick \"Disputing this subject\" to enter Marks you expected, then set Result declared on, Applying on, Application window (days from result) and the fee per subject, answer book or question in INR.",
    "Read \"Percentage if corrected\" against your current aggregate, with Units applied for, Total fee and Last date to apply, then press Copy application to take the drafted letter from the preview.",
  ],
  intro:
    "Post-result challenges run in a fixed order — verification of marks, then a photocopy of the evaluated answer book, then re-evaluation of named questions — and this generator builds the application for whichever stage you are at. It totals the prescribed fee by the number of subjects, answer books or questions, counts the days left in the board's application window from the result declaration date, and calculates what your aggregate percentage would become if the disputed marks were corrected. That last figure is usually the deciding factor: if the projected gain does not change your admission position, the fee and the wait may not be worth it.",
  useCases: [
    "Apply for verification of marks in one subject where the total on the marksheet looks wrong.",
    "Work out whether a 12-mark correction in Physics moves your aggregate enough to matter for a cut-off.",
    "Check how many days are left in the board's window before the application closes for good.",
    "Total the re-evaluation fee across the specific question numbers you want re-assessed.",
  ],
  benefits: [
    ["Correct sequence enforced", "Shows the prerequisite for each stage so you do not apply for re-evaluation before getting the photocopy."],
    ["Projected result", "Compares your current aggregate with the aggregate after the expected correction, in marks and percentage points."],
    ["Deadline countdown", "Adds the window length to the result date and flags an application that is already too late."],
  ],
  faqs: [
    [
      "What is the difference between verification, rechecking and re-evaluation?",
      "Verification of marks only re-adds the totals and checks that no answer was left unmarked — the assessment itself is not touched. Re-evaluation means an examiner re-assesses the named answers on merit and the revised marks are final. The photocopy stage sits in between and exists so you can see the marking before deciding whether re-evaluation is worth it.",
    ],
    [
      "How many days do I get to apply for revaluation?",
      "The window is short and is not extended — boards typically allow three to seven days from the declaration of the result for the first stage, with each later stage opening only after the previous one closes. Set the exact figure from your board's circular for that year; the tool then shows the last date and how many days remain.",
    ],
    [
      "Can marks go down after re-evaluation?",
      "Yes, in several boards and universities the revised marks are final whether they go up, stay the same or come down. Verification of marks carries far less risk because it only corrects totalling and unevaluated answers. Read the rule in your board's notification before applying for re-evaluation.",
    ],
    [
      "How much does revaluation cost?",
      "It is charged per unit — per subject for verification, per answer book for a photocopy, and per question for re-evaluation — and boards revise the rates every year, with different rates for Class 10 and Class 12. Enter the rate from the current circular and the tool multiplies it by the number of units you are applying for.",
    ],
  ],
};

export default seo;
