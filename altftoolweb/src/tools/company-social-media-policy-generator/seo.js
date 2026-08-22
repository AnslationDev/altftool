const seo = {
  title: "Company Social Media Policy Generator",
  metaDescription:
    "Build an employee social media policy from clauses tied to the FTC Endorsement Guides, GDPR and the DPDP Act, plus an NLRA Section 7 savings clause.",
  steps: [
    "Enter Company name, \"Who owns escalations (team or role)\", the Effective date and \"Review every (months)\", which defaults to a review twelve months on.",
    "Tick the Company profile boxes for where you employ people, whether you are listed and whether you run an advocacy programme — each tick adds the clauses it makes necessary — then add or drop any individual clause in the Clauses list below.",
    "Required coverage reads out as a percentage with the word count and next review date, lists any \"Required clauses missing\" with the profile answer that made each necessary, and renders the assembled Policy; press Copy policy.",
  ],
  intro:
    "This generator assembles an employee social media policy from clauses tied to identifiable rules — FTC Endorsement Guides disclosure of the employment relationship, confidentiality, data protection under the GDPR and India's Digital Personal Data Protection Act 2023, and a savings clause preserving employees' rights under Section 7 of the National Labor Relations Act — and then scores the draft against what your company profile actually requires. Ticking where you employ people, whether you are listed, and whether you run an advocacy programme changes which clauses become mandatory. It is written for HR, communications and legal teams producing a first policy or auditing an existing one.",
  useCases: [
    "An HR team writing a first social media policy for a company with US and EU staff and needing both a Section 7 savings clause and a personal-data clause",
    "A communications lead launching an employee advocacy programme and adding the FTC employment-disclosure requirement before the first post goes out",
    "A company approaching an IPO adding a material non-public information and quiet-period clause to an existing policy",
  ],
  benefits: [
    ["Clauses tied to sources", "Each clause names the rule it rests on, so reviewers can check it rather than argue about tone."],
    ["Gaps flagged, with the reason", "Missing required clauses are listed alongside the profile answer that made them necessary."],
    ["Avoids the classic overreach", "Includes the savings clause that keeps a policy from chilling protected discussion of pay and working conditions."],
  ],
  faqs: [
    [
      "What must a company social media policy include?",
      "At minimum: who it applies to, the line between personal and official accounts, a requirement to disclose employment when posting about the employer, confidentiality, respect and anti-harassment, who is authorised to speak for the company, what to do when a post goes wrong, what the company does and does not monitor, and how the policy is enforced. Companies with US staff should add a rights savings clause, listed companies a material non-public information clause, and companies with EU or Indian staff a personal-data clause.",
    ],
    [
      "Can an employer stop employees posting about the company?",
      "Not in blanket terms, at least in the United States. Section 7 of the National Labor Relations Act protects employees acting together over pay, hours and working conditions, including publicly and including where no union is involved. Under the NLRB's 2023 Stericycle decision a facially neutral work rule is presumptively unlawful where it has a reasonable tendency to chill the exercise of those rights, read from the perspective of an economically dependent employee. Confidentiality, harassment and false-statement rules remain enforceable.",
    ],
    [
      "Do employees have to say they work for the company when they post about its products?",
      "Yes. The FTC's Endorsement Guides at 16 CFR Part 255 treat employment as a material connection that must be disclosed clearly and conspicuously wherever an employee endorses the employer's products or services. The disclosure belongs in the post itself, near the start, not only in a bio or a linked page, and it applies to reviews, ratings and comments as much as to original posts.",
    ],
    [
      "How often should a social media policy be reviewed?",
      "Annually is the common cadence, and this tool defaults to a review date twelve months after the effective date. Review sooner when something changes materially: entering a new country, listing, launching an employee advocacy programme, or a shift in platform labelling rules. A policy nobody has re-read in three years is usually both out of date and unenforceable in practice.",
    ],
  ],
};

export default seo;
