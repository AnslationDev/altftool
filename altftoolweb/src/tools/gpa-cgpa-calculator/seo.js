const seo = {
  title: "GPA & CGPA Calculator: 10-Point Scale",
  metaDescription:
    "Credit-weighted SGPA and CGPA on the O=10 to F=0 scale, percentage via (CGPA − 0.75) × 10, and the GPA you need next semester.",
  steps: [
    "On the Semester GPA tab use Add Subject, then set Credits and pick a Grade from O Grade (10 Points) down to F Grade (0 Points).",
    "Switch to Overall CGPA to weight each semester by its credits, or GPA Predictor to enter a Target CGPA and Upcoming Credits.",
    "Read the credit-weighted result and the Percentage Converter's (CGPA - 0.75) × 10 figure, then Copy Summary or Reset Calculator.",
  ],
  intro:
    "This GPA and CGPA calculator works out your grade point average on the 10-point scale by dividing total credit-weighted grade points by total credits — the same weighted formula Indian universities print on a marksheet. Enter each subject's grade (O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0) and credit value for a semester GPA, add semester GPAs with their credit loads for a cumulative CGPA, then convert to a percentage or ask the predictor what you need to score next semester. It is for students checking a result before the official one arrives, or planning how to lift a CGPA before placements.",
  useCases: [
    "Your semester results are out subject by subject and you want your SGPA now instead of waiting for the consolidated marksheet — enter each grade with its credit weight and read the weighted average.",
    "A company's placement filter says 'minimum 8.0 CGPA' and you are sitting at 7.6 with two semesters left; the predictor tells you the GPA you must average across those remaining credits to clear the cut-off.",
    "A scholarship or job form asks for a percentage but your college only issues CGPA, so you need the conversion and the arithmetic behind it before you write a number on the form.",
  ],
  benefits: [
    [
      "Credit-weighted, not a plain average",
      "A 4-credit core paper moves your GPA more than a 1-credit lab, exactly as your university calculates it — averaging grade points alone gives the wrong figure.",
    ],
    [
      "Tells you when a target is out of reach",
      "The predictor returns 'Impossible' when the required GPA exceeds 10, instead of quietly showing an unattainable number.",
    ],
    [
      "Three views of the same record",
      "Semester GPA, cumulative CGPA across semesters and percentage conversion sit in one place, so you are not re-keying numbers between calculators.",
    ],
  ],
  faqs: [
    [
      "How is CGPA calculated from semester GPAs?",
      "Multiply each semester's GPA by the credits earned in that semester, add those products, and divide by the total credits across all semesters. A 9.0 in a 24-credit semester therefore counts more than a 9.0 in a 16-credit one, which is why a straight average of your SGPAs usually differs from your real CGPA.",
    ],
    [
      "How do I convert CGPA to a percentage?",
      "This tool uses percentage = (CGPA − 0.75) × 10, so a CGPA of 8.5 becomes 77.5%. That is the conversion published by VTU and several other Indian universities. Conversion rules are not universal — CBSE uses CGPA × 9.5 and many autonomous colleges publish their own factor — so check your institution's rule before submitting the figure officially.",
    ],
    [
      "What grade point does each letter grade carry?",
      "On the 10-point scale used here: O = 10, A+ = 9, A = 8, B+ = 7, B = 6, C = 5, P = 4 and F = 0. An F contributes zero grade points but its credits still count in the denominator, which is why one backlog pulls a GPA down sharply.",
    ],
    [
      "What GPA do I need next semester to reach my target CGPA?",
      "Required GPA = (target CGPA × total credits after next semester − current CGPA × current credits) ÷ upcoming credits. For example, at 7.5 CGPA over 80 credits and aiming for 8.0 across 20 more credits, you would need a perfect 10.0. The predictor runs this for you and flags the target as impossible whenever the answer comes out above 10.",
    ],
  ],
};

export default seo;
