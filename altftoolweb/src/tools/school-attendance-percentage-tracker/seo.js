const seo = {
  title: "School Attendance Percentage Tracker (75% CBSE)",
  metaDescription:
    "Days present ÷ working days × 100 against the 75% board requirement, turned into a leave allowance in days and a projection for the whole session.",
  steps: [
    "Pick your School stage, then enter Working days held so far, Days marked present and Working days left this session.",
    "Add Leave you already plan to take (days), and change Attendance required by the board (%) if your board does not use 75%.",
    "Read Attendance so far against the requirement line, plus Leave still affordable, Days you must still attend and Best possible finish, then press Copy result.",
  ],
  intro:
    "This tracker converts a school attendance register into the number that decides board exam eligibility: days present ÷ working days × 100, measured across the whole academic session rather than a single month. It applies the 75% attendance condition in the CBSE Examination Bye-Laws, which most other boards mirror, and turns it into a leave allowance in days so a parent or student can see how much absence the year can still carry. It also projects where attendance finishes once the leave already planned is taken.",
  useCases: [
    "A Class X student at 80% in December working out how many days can be missed before the March board exam without falling under 75%.",
    "A parent planning a ten-day family trip in the second term and checking whether the session still ends above the eligibility line.",
    "A student returning after three weeks of illness, seeing whether attending every remaining working day can still reach 75% or whether a condonation application is the only route.",
  ],
  benefits: [
    ["Leave stated in days, not percent", "Converts the 75% rule into the actual number of absences the session can carry."],
    ["Projects the end of the session", "Shows where attendance lands after the leave you already intend to take."],
    ["Flags the point of no return", "Says plainly when even perfect attendance from today cannot reach the requirement."],
  ],
  faqs: [
    [
      "How much attendance is required for CBSE board exams?",
      "75% of the working days of the school in the academic session. The CBSE Examination Bye-Laws make this a condition for a candidate to be sent up for the Class X or Class XII examination, and the school certifies it from its own attendance register.",
    ],
    [
      "How many days can I miss in a school year?",
      "On a 200-working-day session with a 75% requirement, 50 days of absence is the ceiling, because 150 present days out of 200 is exactly 75%. On a 220-day session the allowance is 55 days. Count from the session total, not from the days held so far, or the budget looks larger than it really is.",
    ],
    [
      "Can attendance shortage be condoned for board exams?",
      "Yes, but only on application and only in listed circumstances — prolonged illness with medical records, the death of a parent, or participation in approved national-level sports and events. The application goes through the school to the board, the decision rests with the board, and it is not granted as a matter of routine. Speak to the principal as soon as the shortage arises rather than close to the exam.",
    ],
    [
      "How is school attendance percentage calculated?",
      "Divide the days marked present by the number of working days the school actually held, then multiply by 100 — holidays and days the school was closed are not counted in either figure. A student present on 96 of 120 working days is at 80%. For eligibility the board looks at the figure across the full session, so mid-year attendance is only a projection until the last working day.",
    ],
  ],
};

export default seo;
