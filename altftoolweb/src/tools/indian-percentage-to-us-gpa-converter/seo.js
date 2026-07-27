const seo = {
  intro:
    "This converter turns an Indian percentage or 10-point CGPA into a US 4.0 GPA using the division-based method credential evaluators like WES apply — First Division (60%+) maps to an A/4.0, Second Division (50-59%) to a B/3.0 and Third Division (40-49%) to a C/2.0 — alongside a simple linear estimate. CGPA input is first converted to a percentage with the CBSE 9.5 multiplication factor. It is built for Indian students preparing US university applications who need a defensible GPA figure before an official evaluation.",
  useCases: [
    "A B.Tech graduate with 72% checking what GPA a WES-style division evaluation would produce before applying to US master's programmes",
    "A CBSE student with an 8.6 CGPA converting to percentage and then to the 4.0 scale for a Common App or university form",
    "An applicant comparing the division-based figure against the linear percentage÷25 estimate a university's own form asks for",
  ],
  benefits: [
    ["Evaluator-style method", "Uses the division-to-letter mapping (60%+ = A = 4.0) that WES-style evaluations follow."],
    ["CGPA supported", "10-point CGPA is converted with the CBSE × 9.5 factor before mapping."],
    ["Both answers shown", "Division-based and linear GPAs side by side, so you can match whichever method a university requests."],
  ],
  faqs: [
    [
      "What GPA is 70 percent in India on the US 4.0 scale?",
      "By the division-based method used by credential evaluators, 70% is a First Division result, which maps to an A and a 4.0 GPA. A naive linear conversion gives only 2.8, which is why Indian applicants should never convert marks linearly — Indian universities grade far more harshly than US ones.",
    ],
    [
      "How do I convert a 10-point CGPA to US GPA?",
      "First convert CGPA to a percentage using the CBSE factor of 9.5 (for example, 8.0 CGPA × 9.5 = 76%), then map that percentage to the 4.0 scale — 76% is First Division, so it evaluates as a 4.0 by the division method. Some universities instead accept CGPA÷10×4, which would give 3.2, so check which method the programme specifies.",
    ],
    [
      "Is 60 percent in India a good GPA for US admissions?",
      "Yes — 60% is the First Division threshold in the Indian system, and credential evaluators such as WES treat First Division as equivalent to an A grade, i.e. a 4.0 GPA. Admissions committees familiar with Indian grading know that 60%+ from a rigorous programme represents strong performance.",
    ],
    [
      "Do US universities accept WES GPA conversion?",
      "Most US universities accept or require a course-by-course evaluation from a NACES-member agency such as WES, ECE or SpanTran, and the evaluator's converted GPA is what they use. This tool mirrors the division-based logic for planning purposes, but only the official evaluation is authoritative for an application.",
    ],
  ],
};

export default seo;
