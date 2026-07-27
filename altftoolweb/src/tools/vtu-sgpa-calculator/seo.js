const seo = {
  intro:
    "This calculator computes a VTU SGPA directly from internal (CIE) and external (SEE) marks: it scales the 100-mark SEE to 50, adds the 50-mark CIE, grades the total on VTU's 10-point absolute scale (O = 10 at 90+, down to P = 4 at 40) and applies SGPA = Σ(Ci × Gi) ÷ ΣCi. It follows the 2021/2022 B.E. scheme, including the pass rules of 40% in CIE, 35% in SEE independently and 40% overall, so a failed course is graded F at 0 points automatically.",
  useCases: [
    "A VTU student entering CIE and expected SEE marks after exams to predict the semester SGPA before results",
    "Checking whether 34 out of 100 in one SEE paper makes the course an F even though the combined total crosses 40",
    "Seeing how much one backlog at 0 grade points drags the SGPA while its credits stay in the denominator",
  ],
  benefits: [
    ["Marks in, SGPA out", "No grade lookup needed — the tool scales SEE to 50, totals each course and assigns the letter grade itself."],
    ["Real VTU pass rules", "Applies the 40% CIE, 35% SEE and 40% aggregate minima of the 2021/2022 scheme and names the exact rule a course failed."],
    ["Backlogs counted correctly", "An F carries 0 grade points with credits still in the denominator, matching how VTU computes the printed SGPA."],
  ],
  faqs: [
    [
      "How is SGPA calculated in VTU?",
      "SGPA = Σ(Ci × Gi) ÷ ΣCi — each course's credits times its grade point, summed and divided by total credits. The grade point comes from the combined total out of 100 (CIE out of 50 plus SEE scaled from 100 to 50): O = 10 for 90+, A+ = 9 for 80–89, A = 8 for 70–79, B+ = 7 for 60–69, B = 6 for 55–59, C = 5 for 50–54, P = 4 for 40–49 and F = 0 below that.",
    ],
    [
      "What are the minimum passing marks in VTU?",
      "Under the 2021/2022 scheme a student needs at least 40% in CIE (20 of 50) to sit the SEE, at least 35% in the SEE considered independently (35 of 100), and at least 40% of the CIE and SEE together (40 of 100). Missing any one of the three makes the course an F even if the combined total looks healthy.",
    ],
    [
      "How are SEE marks out of 100 converted to 50 in VTU?",
      "The SEE paper is set for 100 marks and reduced to half before being added to the CIE, so 73 out of 100 contributes 36.5, rounded to 37, toward the 100-mark course total. This tool applies the same halving and rounding before grading.",
    ],
    [
      "Is VTU grading absolute or relative?",
      "The 2021/2022 scheme uses absolute grading — fixed mark bands decide the letter grade, so 90 and above is always O regardless of how the class performed. Older schemes and university-level moderation can differ, so treat the official VTU grade card as final.",
    ],
  ],
};

export default seo;
