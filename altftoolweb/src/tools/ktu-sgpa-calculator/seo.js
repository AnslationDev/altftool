const seo = {
  intro:
    "KTU computes SGPA as the credit-weighted mean of your grade points for one semester — Σ(credits × grade point) ÷ Σ(credits) — on a scale that steps in halves: S is 10, A+ is 9, A is 8.5, B+ is 8, B is 7.5, C+ is 7, C is 6.5, D is 6 and P is 5.5. This calculator applies that scale, rolls each semester into a credit-weighted CGPA, and keeps credits registered separate from credits earned so a failed course is visible rather than buried in the average. It also shows how your credits are spread across the grades.",
  useCases: [
    "Working out an SGPA from a KTU grade card that lists letters but no numeric average",
    "Checking whether the running CGPA is still above the 5.0 minimum required for the degree",
    "Seeing how many credits sit at B and below before deciding which course to attempt for improvement",
  ],
  benefits: [
    ["Half-point scale handled correctly", "A and B+ differ by 0.5, not 1, which most generic GPA calculators get wrong."],
    ["Credits earned shown separately", "F, FE and I all score 0 and earn nothing, so the shortfall against the degree requirement is clear."],
    ["Grade spread", "A credits-by-grade breakdown shows where the average is actually coming from."],
  ],
  faqs: [
    [
      "How is SGPA calculated in KTU?",
      "SGPA = Σ(credits × grade point) ÷ Σ(credits) for that semester. Courses of 4, 4, 3, 3, 2 and 1 credits graded S, A, B+, B, C and P give 139 credit points over 17 credits, an SGPA of 8.18.",
    ],
    [
      "What are the KTU grade points?",
      "On the 2019 B.Tech scheme, S carries 10 points, A+ 9, A 8.5, B+ 8, B 7.5, C+ 7, C 6.5, D 6 and P 5.5, while F, FE and I all carry 0. P at 5.5 is the lowest grade that earns a course's credits.",
    ],
    [
      "How is CGPA different from SGPA in KTU?",
      "SGPA covers one semester; CGPA is the same weighted mean taken across every semester, using each semester's credit total as its weight. Averaging your SGPAs directly gives a different figure whenever the semesters carry different credit loads.",
    ],
    [
      "What happens to my SGPA if I get an F?",
      "The course scores 0 grade points and earns none of its credits, but its credits stay in the denominator, so the SGPA drops sharply. Clearing the course in a supplementary exam replaces the F, adds the credits to your earned total and lifts the recomputed average.",
    ],
  ],
};

export default seo;
