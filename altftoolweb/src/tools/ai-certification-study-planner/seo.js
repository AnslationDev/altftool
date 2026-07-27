const seo = {
  intro:
    "AI Certification Study Planner divides a preparation-hours budget across an exam's published domain weights, so the topic worth 36% of the score gets 36% of your study time instead of an equal share. It covers the AWS AI Practitioner (AIF-C01), AWS Machine Learning Engineer Associate (MLA-C01) and Machine Learning Specialty (MLS-C01), Microsoft AI-900 and AI-102, and the Google Cloud Professional Machine Learning Engineer exam, reserving a fifth of the total for practice exams and revision. Enter your booked exam date and it reports whether your weekly hours actually reach the plan in time.",
  useCases: [
    "Work backwards from a booked AI-900 date to see whether five hours a week is enough.",
    "Weight MLS-C01 revision toward Modeling, which carries 36% of the exam's score.",
    "Show a manager the hours a team member needs before sitting an associate-level AI exam.",
    "Rebalance a plan after a practice test by giving the weakest high-weight domain the extra hours.",
  ],
  benefits: [
    ["Weighted, not equal, time", "Hours follow the vendor's own domain percentages, including a rescale when the guide publishes ranges."],
    ["Revision is budgeted", "20% of the total is set aside for practice exams and a final pass instead of being an afterthought."],
    ["Date reality check", "The planner compares hours available before your exam date with the hours the plan requires."],
  ],
  faqs: [
    [
      "How many hours does it take to prepare for an AI certification?",
      "It depends on the level. A fundamentals exam such as AI-900 typically needs 20-30 hours, an associate exam such as AI-102 or MLA-C01 needs roughly 60-100, and the MLS-C01 specialty exam commonly takes 90-140 hours for someone without daily hands-on experience. This planner scales its budget by your stated background: 1.5x for newcomers and 0.7x for people who work with the platform weekly.",
    ],
    [
      "What score do I need to pass AWS and Microsoft AI exams?",
      "AWS scales results from 100 to 1000: the AI Practitioner (AIF-C01) passes at 700, the Machine Learning Engineer Associate (MLA-C01) at 720 and the Machine Learning Specialty (MLS-C01) at 750. Microsoft exams including AI-900 and AI-102 pass at 700 on a 1-1000 scale. Google does not publish a passing score for its Professional Machine Learning Engineer exam.",
    ],
    [
      "Which AI certification should I take first?",
      "Start at the fundamentals tier if the cloud platform is new to you — AI-900 takes 45 minutes and covers concepts rather than implementation, and the AWS AI Practitioner plays the same role. Move to AI-102 or MLA-C01 once you can build with the platform's SDKs, and treat MLS-C01 as a specialty exam that assumes real modelling experience.",
    ],
    [
      "Are the domain weights in this planner current?",
      "They follow each vendor's published exam guide, with Microsoft's ranges reduced to their midpoint and rescaled to 100%. Vendors do revise these outlines — sometimes with a new exam code — so open the official skills-measured or exam-content-outline page before you book and adjust if the split has changed.",
    ],
  ],
};

export default seo;
