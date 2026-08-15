const seo = {
  title: "Interview NDA Generator: Scoped, Not a Non-Compete",
  metaDescription:
    "Builds a short candidate NDA from the materials you tick, sets the term and deletion deadline from the interview date, and is not a non-compete.",
  steps: [
    "Enter Company name, Company address, Candidate name, Role being interviewed for and the Interview or start-of-process date.",
    "Tick the materials in scope — Source code or a private repository, System architecture or infrastructure diagrams, Product roadmap or unreleased features, Revenue, usage or growth metrics and more — then set Confidentiality lasts (years), Delete materials within (days), Take-home time limit (hours) and a Governing law of India, England and Wales, Delaware, USA, California, USA or Singapore.",
    "Check the reported word count, clause count and reading time above the draft, read the Before you send it notes, then press Copy result to take the NDA text.",
  ],
  intro:
    "A candidate NDA covers the narrow window in which someone outside the company is shown internal code, roadmaps, metrics or systems during a hiring process. It works best when it is short, scoped to what the candidate will genuinely see, and unmistakably not a non-compete. This generator builds that document from the materials you tick, sets the confidentiality period and deletion deadline from the interview date, keeps ownership of any take-home exercise with the candidate, and preserves the right to report unlawful conduct to a regulator.",
  useCases: [
    "Give an engineering candidate repository access for a pairing session without leaving the code unprotected.",
    "Cover a design candidate who will be shown unreleased brand work and prototypes.",
    "Set out clearly that a take-home submission stays the candidate's property and will not ship without a separate paid agreement.",
    "Stop interview questions and exercises from being posted to public forums.",
  ],
  benefits: [
    ["Scoped to what is really shown", "The confidentiality definition lists the specific materials you tick, rather than an open-ended catch-all a candidate is asked to sign blind."],
    ["Fair by construction", "States expressly that it is not an offer, creates no employment relationship, and does not restrict where the candidate may work."],
    ["Length is a stated metric", "Reports word count and reading time and warns past 900 words, the point at which candidate NDAs stop being read."],
  ],
  faqs: [
    [
      "Should job candidates sign an NDA?",
      "Only when they will genuinely see non-public material — source code, unreleased products, real metrics or internal systems. Asking every applicant to sign one before a first conversation is a common complaint and costs candidates. Scope it to the stage where confidential access actually begins.",
    ],
    [
      "Who owns a take-home coding exercise?",
      "The candidate does, as the author, unless they assign it in writing. A fair candidate NDA says the company may use the submission only to evaluate the candidate, and not in a product or client deliverable without a separate written agreement and payment.",
    ],
    [
      "Can an interview NDA stop me joining a competitor?",
      "It should not, and a well-drafted one says so expressly. A confidentiality agreement protects information; a non-compete restricts employment and is a different instrument. Section 27 of the Indian Contract Act, 1872 voids agreements in restraint of trade, and California Business and Professions Code section 16600 voids non-competes outright, with related sections restricting even offering one to an applicant.",
    ],
    [
      "How long should a candidate NDA last?",
      "One to three years is typical, since the commercial sensitivity of a roadmap or metric fades quickly. Trade secrets are usually carved out and protected for as long as they stay secret. Anything longer is hard to justify for someone who spent a few hours in a hiring process.",
    ],
  ],
};

export default seo;
