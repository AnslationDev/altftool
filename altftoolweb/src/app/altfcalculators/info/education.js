const info = {
  "gpa-calculator": {
    intro: [
      "The GPA Calculator turns your course letter grades and credit hours into a single grade point average on the standard 4.0 scale. Each course is weighted by its credit hours, so a demanding 4-credit class counts more toward your average than a 1-credit elective.",
      "Add a row for every course in the term, pick the letter grade and enter the credits, and the calculator returns your GPA together with the total credit hours and quality points behind it. It is ideal for checking a semester result or predicting where an in-progress term will land.",
    ],
    formula: {
      expression: "GPA = Σ(credit hours × grade points) ÷ Σ(credit hours)",
      where: [
        ["credit hours", "the weight (units) assigned to each course"],
        ["grade points", "the 4.0-scale value of the letter grade (A = 4.0, B = 3.0, …)"],
        ["Σ", "the sum taken across every course entered"],
      ],
      note: "This tool uses A = 4.0, A− = 3.7, B+ = 3.3, B = 3.0, B− = 2.7, C+ = 2.3, C = 2.0, D = 1.0, F = 0.0. Some schools use pluses/minuses differently or cap A+ at 4.0, so match your institution's scale.",
    },
    howToUse: [
      "Enter the credit hours for your first course and choose its letter grade.",
      "Use \"Add course\" to create a row for each additional class in the term.",
      "Remove any rows you don't need with the Remove button.",
      "Read your GPA, total credit hours and total quality points below.",
    ],
    goodToKnow: [
      "Credit hours act as weights: an A in a 4-credit course lifts your GPA more than an A in a 1-credit course.",
      "Quality points are credit hours × grade points; your GPA is simply total quality points divided by total credits.",
      "A term GPA covers one semester; a cumulative GPA averages every course you have taken across all terms.",
      "Pass/fail or audited courses usually carry no grade points and are left out of the GPA — omit them here.",
    ],
    faqs: [
      {
        q: "How is GPA calculated?",
        a: "Multiply each course's credit hours by its grade points, add those products together, then divide by the total credit hours. For example, an A (4.0) in 3 credits and a B (3.0) in 4 credits gives (12 + 12) ÷ 7 ≈ 3.43.",
      },
      {
        q: "What grade points does each letter equal?",
        a: "On the 4.0 scale used here: A = 4.0, A− = 3.7, B+ = 3.3, B = 3.0, B− = 2.7, C+ = 2.3, C = 2.0, D = 1.0 and F = 0.0.",
      },
      {
        q: "Does a failing grade count toward my GPA?",
        a: "Yes. An F is worth 0 grade points but its credit hours still count in the denominator, which pulls the average down more than simply skipping the course.",
      },
      {
        q: "What is the difference between weighted and unweighted GPA?",
        a: "An unweighted GPA caps every course at 4.0. A weighted GPA gives extra points to honors or AP/IB classes (often on a 5.0 scale). This calculator produces a standard credit-weighted 4.0 GPA, not an honors-weighted one.",
      },
    ],
  },

  "grade-calculator": {
    intro: [
      "The Grade Calculator does two jobs. First, it works out your current course grade from weighted assessments — homework, quizzes, midterms and so on — where each piece counts for a set percentage of the final mark. Second, it tells you the score you need on the final exam to hit the overall grade you are aiming for.",
      "Enter each assessment with its score and weight to see your standing so far, then set a target and the weight of the final to learn exactly what you must earn on it. It is the fastest way to answer \"where do I stand?\" and \"what do I need?\" in one place.",
    ],
    formula: {
      expression:
        "Current = Σ(score × weight) ÷ Σ(weight)   •   Final needed = (Target − Current × (1 − w)) ÷ w",
      where: [
        ["score", "the percentage earned on an assessment"],
        ["weight", "the share of the grade that assessment is worth"],
        ["Target", "the overall course percentage you want"],
        ["Current", "your weighted grade on the work completed so far"],
        ["w", "the final exam's weight, as a fraction (e.g. 40% = 0.40)"],
      ],
      note: "The \"final needed\" step treats your current grade as the whole of the pre-final work (the remaining 1 − w of the course). If it returns a value above 100%, the target is not reachable even with a perfect final.",
    },
    howToUse: [
      "Add a row for each assessment with its score (%) and weight (%).",
      "Read your current weighted grade and the total weight counted so far.",
      "In the second section, enter your desired overall grade and the final exam's weight.",
      "Read the score you need on the final to reach that target.",
    ],
    goodToKnow: [
      "If your assessment weights don't add up to 100%, the current grade is the weighted average of only what you've entered — useful mid-term, but not your final standing.",
      "A required-final score above 100% means the target is out of reach; a score of 0% or less means you've already locked it in.",
      "Lowering a demanding target by even a few points can dramatically cut the score you need on the final.",
      "Weights can be any numbers — the calculator normalises by their sum, so 20/15/25 works the same as fractions that total 1.",
    ],
    faqs: [
      {
        q: "How do I calculate my current grade with weights?",
        a: "Multiply each score by its weight, add the results, then divide by the sum of the weights. For scores of 90, 80 and 85 with weights 20, 30 and 50, the grade is (1800 + 2400 + 4250) ÷ 100 = 84.5%.",
      },
      {
        q: "What score do I need on my final?",
        a: "Use Final needed = (Target − Current × (1 − w)) ÷ w. If your current grade is 85%, the final is worth 40% (w = 0.4) and you want 85% overall, you need (85 − 85 × 0.6) ÷ 0.4 = 85% on the final.",
      },
      {
        q: "Why does the tool say I need more than 100%?",
        a: "It means your target can't be reached even with a perfect final, given your current grade and how little the final is weighted. Either lower the target or accept the highest achievable overall grade.",
      },
      {
        q: "Do the weights have to total 100%?",
        a: "For your final standing, yes — otherwise you're only averaging part of the course. Mid-semester, partial weights are fine and give a valid average of the work graded so far.",
      },
    ],
  },

  "cgpa-calculator": {
    intro: [
      "The CGPA Calculator combines the SGPA (semester grade point average) of every semester into one cumulative grade point average, weighting each semester by its credit load. A heavier semester therefore influences your overall CGPA more than a light one.",
      "Enter each semester's SGPA and credits, and it returns your CGPA on the 10-point scale used by most Indian universities, plus an approximate percentage using the widely quoted CGPA × 9.5 conversion. It's built for tracking your standing across a degree or estimating a percentage for applications.",
    ],
    formula: {
      expression:
        "CGPA = Σ(SGPA × credits) ÷ Σ(credits)   •   Percentage ≈ CGPA × 9.5",
      where: [
        ["SGPA", "the grade point average for one semester"],
        ["credits", "the total credit hours earned that semester"],
        ["Σ", "the sum across all semesters entered"],
        ["9.5", "the common CBSE / university multiplier to approximate a percentage"],
      ],
      note: "The 9.5 multiplier is a convention popularised by CBSE and adopted by many universities; your institution may use a different formula, so treat the percentage as an estimate.",
    },
    howToUse: [
      "Enter the SGPA and credits for your first semester.",
      "Use \"Add semester\" for each additional term of your programme.",
      "Read your cumulative CGPA and the total credits it is based on.",
      "Check the approximate percentage if you need one for a form or application.",
    ],
    goodToKnow: [
      "Weighting by credits matters: a strong SGPA in a high-credit semester lifts the CGPA more than the same SGPA in a light semester.",
      "If every semester carries equal credits, the CGPA is simply the plain average of the SGPAs.",
      "The CGPA × 9.5 rule is an approximation — official transcripts may quote a different conversion or none at all.",
      "A dropped or failed course that later gets re-taken can change a semester's SGPA, so re-enter the corrected SGPA to keep the CGPA accurate.",
    ],
    faqs: [
      {
        q: "What is the difference between SGPA and CGPA?",
        a: "SGPA is the grade point average of a single semester. CGPA is the credit-weighted average of the SGPAs across all completed semesters, giving your overall academic standing.",
      },
      {
        q: "How do I convert CGPA to a percentage?",
        a: "The common rule multiplies CGPA by 9.5. A CGPA of 8.2 is roughly 8.2 × 9.5 = 77.9%. Confirm the exact formula with your university, as conventions vary.",
      },
      {
        q: "How is CGPA calculated from SGPA?",
        a: "Multiply each semester's SGPA by its credits, add these up and divide by the total credits. With SGPAs 8.0 (20 credits) and 9.0 (24 credits), CGPA = (160 + 216) ÷ 44 ≈ 8.55.",
      },
      {
        q: "Why use credits instead of a simple average of SGPAs?",
        a: "Semesters aren't equal in size. Credit-weighting ensures a 24-credit semester counts more than a 16-credit one, which is how universities compute the official CGPA.",
      },
    ],
  },

  "marks-percentage-calculator": {
    intro: [
      "The Marks Percentage Calculator converts marks into a percentage. In single mode, enter the marks you obtained and the total marks to get one figure. In subjects mode, add a row per subject and it sums the marks and maximums to give your overall percentage across all of them.",
      "It also shows a simple grade band for the result, making it handy for exam results, report cards and quickly checking where a score sits.",
    ],
    formula: {
      expression:
        "Percentage = (Marks obtained ÷ Total marks) × 100   •   Overall = (Σ obtained ÷ Σ maximum) × 100",
      where: [
        ["Marks obtained", "the marks you scored"],
        ["Total marks", "the maximum marks available"],
        ["Σ obtained", "sum of marks scored across all subjects"],
        ["Σ maximum", "sum of the maximum marks across all subjects"],
      ],
      note: "The overall percentage divides total marks scored by total marks possible. This equals a simple average of subject percentages only when every subject is out of the same maximum.",
    },
    howToUse: [
      "Choose Single for one score, or Subjects to combine several.",
      "In single mode, enter marks obtained and total marks.",
      "In subjects mode, add a row per subject with its obtained and maximum marks.",
      "Read the percentage and its grade band below.",
    ],
    goodToKnow: [
      "The overall percentage is total marks scored ÷ total marks possible — not the average of the individual percentages unless every subject is out of the same total.",
      "Grade bands here are a common guide (A+ ≥ 90, A ≥ 80, B+ ≥ 70, B ≥ 60, C ≥ 50, D ≥ 40, fail below 40); your board or school may set different cut-offs.",
      "Subjects with larger maximum marks carry more weight in the overall percentage, exactly as they do on a real mark sheet.",
      "For weighted results where subjects count differently regardless of their maximums, use a weighted grade tool instead.",
    ],
    faqs: [
      {
        q: "How do I calculate a percentage from marks?",
        a: "Divide the marks obtained by the total marks and multiply by 100. Scoring 437 out of 500 gives (437 ÷ 500) × 100 = 87.4%.",
      },
      {
        q: "How do I find the overall percentage across subjects?",
        a: "Add up the marks obtained in all subjects, add up all the maximum marks, then divide and multiply by 100. For 92 + 85 + 78 out of 100 + 100 + 100, that's 255 ÷ 300 × 100 = 85%.",
      },
      {
        q: "Is the overall percentage the same as averaging each subject's percentage?",
        a: "Only when every subject is out of the same maximum. If maximums differ, the mark-based overall percentage is the correct figure, because larger subjects should count for more.",
      },
      {
        q: "What grade does my percentage correspond to?",
        a: "This tool uses a common band: 90+ is A+, 80–89 A, 70–79 B+, 60–69 B, 50–59 C, 40–49 D and below 40 a fail. Always check your own institution's grading scheme, as thresholds vary.",
      },
    ],
  },
};

export default info;
