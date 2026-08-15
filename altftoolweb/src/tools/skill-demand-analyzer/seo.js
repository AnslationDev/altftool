const seo = {
  title: "Skill Demand Analyzer: 0-100 Score from Job-Board Data",
  metaDescription:
    "Turn live openings, year-on-year growth, applicants per posting, salary premium and remote share into a 0-100 score weighted 30/30/20/15/5.",
  intro:
    "The Skill Demand Analyzer converts five job-board readings — live openings, openings 12 months ago, applicants per posting, median salary for postings naming the skill, the role-family median and the remote share — into a single 0-100 skill demand score. Volume is scored on a log10 curve that saturates at 10,000 live postings, growth is measured as the plain year-on-year change in openings, and the five sub-scores are combined with fixed weights of 30/30/20/15/5. It is for people choosing what to learn next, and for hiring teams deciding how hard a role will be to fill.",
  useCases: [
    "Compare two certifications you could spend a quarter on by scoring each one from the same job-board search",
    "Justify a training budget by showing that openings for a skill grew 50% year on year while applicants per posting stayed flat",
    "Set a realistic time-to-hire expectation before opening a requisition, using the applicants-per-posting reading",
  ],
  benefits: [
    ["Your data, not scraped guesses", "Every input comes from a search you ran yourself, so the score is auditable."],
    ["Published weighting", "Volume 30, growth 30, competition 20, pay 15, remote 5 — no hidden model."],
    ["Names the weak factor", "The breakdown flags the lowest sub-score, which is usually the reason a skill looks worse than it feels."],
  ],
  faqs: [
    [
      "How is the skill demand score calculated?",
      "It is a weighted average of five sub-scores: live openings (30%), year-on-year growth (30%), competition (20%), salary premium (15%) and remote share (5%). Openings use a log10 curve that reaches 100 at 10,000 live postings, growth maps -50% to 0 and +50% to 100, competition maps 100 applicants per posting to 0 and 5 to 100, and salary premium maps -20% to 0 and +60% to 100.",
    ],
    [
      "What counts as a good score?",
      "80 and above is critical demand, 60-79 is strong, 40-59 is emerging, 20-39 is soft and under 20 is oversupplied. A skill scoring 60 or more is generally worth a full learning cycle; below 40 it is better treated as a supporting skill next to something stronger.",
    ],
    [
      "Where do I find applicants per posting?",
      "LinkedIn, Indeed and Naukri all display an applicant count on individual listings. Open eight to ten postings from your search, take the average, and use that. Anything under 5 applicants per posting is a genuinely candidate-short market; over 100 means each opening is heavily contested.",
    ],
    [
      "Why does the tool need last year's openings?",
      "Growth carries 30% of the score, and it cannot be computed from a single snapshot. A skill with 2,400 openings that had 1,600 a year ago is growing at 50%; the same 2,400 against 4,800 last year is halving. Most job boards let you filter by date posted, or you can use an archived search from your own notes.",
    ],
  ],
  steps: [
    "Fill the seven fields: Skill, Live openings today, Openings 12 months ago, Applicants per posting, Remote share (%), Median salary, postings with the skill, and Median salary, whole role family. All six numeric fields take 0 or more, the two salary fields are annual rupee figures, and each field carries a hint such as \"Same search, same market, one year earlier.\"",
    "There is no calculate button — the Skill demand score updates as you type, showing a figure out of 100, its band (Critical demand, Strong demand, Emerging demand, Soft demand or Oversupplied) and that band's one-line advice. Below it the rows report Year-on-year openings growth, Salary premium over role family, Projected openings in 12 months and Weakest factor, and the How the score is built table lists each factor's weight — Live openings 30%, Year-on-year growth 30%, Competition 20%, Salary premium 15%, Remote share 5% — next to the sub-score it earned.",
    "Click Copy result to put the skill, score and band, growth, salary premium, applicants per posting, projected openings and weakest factor on the clipboard; the button reads Copied! for 1.5 seconds. Reset returns all seven fields to the Kubernetes example they start with.",
  ],
};

export default seo;
