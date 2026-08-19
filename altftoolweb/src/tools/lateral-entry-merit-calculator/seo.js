const seo = {
  title: "Lateral Entry Merit Calculator: LEET, ECET, JELET",
  metaDescription:
    "Weigh diploma percentage against your LEET/ECET/JELET score for a merit index out of 100, with the AICTE 45% (40% reserved) diploma floor checked.",
  steps: [
    "Enter your diploma aggregate marks obtained and maximum, plus your entrance score (LEET / ECET / JELET) and its maximum marks.",
    "Set 'Weight given to diploma marks (%)' or use a preset — 'Entrance exam only (LEET, ECET, JELET)', 'Diploma marks only' or '50 : 50 mixed formula' — and tick reserved category for the 40% floor.",
    "Read the merit index out of 100 with each component's weighted contribution and the AICTE eligibility floor check, then press 'Copy result'.",
  ],
  intro:
    "This calculator computes a lateral-entry (diploma-to-second-year B.Tech) merit index as a weighted average of diploma percentage and entrance-exam percentage on a 100-point scale — the model behind LEET, ECET and JELET rank lists as well as diploma-merit admissions. It also checks the AICTE eligibility floor of 45% marks in the diploma (40% for reserved categories where the state allows). It is for diploma holders planning direct second-year engineering admission.",
  useCases: [
    "A diploma holder converting an ECET score out of 200 into a percentage to weigh against last year's closing ranks",
    "A student with a 2500-mark diploma aggregate checking their exact percentage and whether it clears the AICTE 45% floor",
    "An applicant to a university using a 50:50 diploma-plus-entrance formula computing the combined index before counselling",
  ],
  benefits: [
    ["All three merit models", "Presets for entrance-only (LEET/ECET/JELET), diploma-only and 50:50 mixed formulas."],
    ["AICTE floor check", "Flags a diploma percentage below 45% (or 40% reserved) before you pay an application fee."],
    ["Any marks base", "Normalises diploma aggregates of any size and entrance papers of any maximum to one comparable scale."],
  ],
  faqs: [
    [
      "How is lateral entry merit calculated for B.Tech admission?",
      "Entrance-based states rank purely on the lateral-entry test — LEET in Haryana and Punjab, ECET in Andhra Pradesh and Telangana, JELET in West Bengal — while the diploma percentage serves as the eligibility floor. Where no test is held, colleges rank on diploma marks; both fit the formula merit = diploma % x weight + entrance % x (100 - weight).",
    ],
    [
      "What is the minimum diploma percentage for lateral entry?",
      "45% marks in the relevant engineering diploma for general-category candidates, per the AICTE Approval Process Handbook, with 40% for reserved categories where the state provides relaxation. Individual universities may set higher cutoffs, so treat 45% as the national floor, not a guarantee of a seat.",
    ],
    [
      "Which year does a lateral entry student join in B.Tech?",
      "The second year (third semester). Lateral entry admits diploma holders directly against the sanctioned lateral-entry seats — typically up to 10% of intake as supernumerary or against vacancies — so the degree takes three further years instead of four.",
    ],
    [
      "How do I convert my diploma marks into a percentage for lateral entry forms?",
      "Divide your aggregate obtained marks by the aggregate maximum on the final diploma marksheet and multiply by 100 — 1,800 out of 2,500 is 72%. If your board prints a CGPA instead, use the board's official conversion certificate, because counselling authorities do not accept ad-hoc multipliers.",
    ],
  ],
};

export default seo;
