const seo = {
  title: "Nonprofit Privacy Policy Generator: Donors & Grants",
  metaDescription:
    "Separate donor, volunteer and beneficiary sections, an Article 9(2) condition for sensitive records, plus the $250 and $75 IRS receipting thresholds.",
  steps: [
    "Name the organisation and its registration number, then tick What the organisation does — takes donations, recruits volunteers, holds records about people it helps.",
    "Set retention in months for donation records, volunteer files and case records, and enter an example gift, the value given back and yearly contributions.",
    "Notice completeness shows the percentage and word count, the deductible amount, acknowledgment duty and Schedule B threshold; Copy notice takes the text.",
  ],
  intro:
    "A nonprofit privacy policy has to cover three populations that a generic website template treats as one: donors, whose records are shaped by tax law as much as by data protection law; volunteers, whose files often include criminal record checks; and the people the organisation helps, whose records commonly contain health, belief or political data. This generator writes those sections separately, names an Article 9(2) condition for the sensitive ones, and computes the US receipting thresholds — the 250 dollar written acknowledgment under 26 U.S.C. section 170(f)(8) and the 75 dollar quid pro quo disclosure under section 6115 — alongside the Schedule B contributor threshold and grant record retention under 2 CFR 200.334.",
  useCases: [
    "Publish a supporter notice that states plainly whether the charity does wealth screening, after the UK enforcement action that made silence on it a liability.",
    "Separate what a grant funder actually receives from what sits in a case file, before signing a reporting schedule.",
    "Work out whether a specific gift crosses the Schedule B threshold and what the donor may deduct after a fundraising dinner.",
    "Set retention periods that satisfy federal award rules and FCRA record keeping without holding case files forever.",
  ],
  benefits: [
    [
      "Three populations, three rules",
      "Donors, volunteers and beneficiaries get separate sections instead of one paragraph that fits none of them.",
    ],
    [
      "Sensitive data handled properly",
      "Health, belief and political data are tied to a named Article 9(2) condition, including the not-for-profit exception.",
    ],
    [
      "Receipting arithmetic included",
      "Deductible amount, acknowledgment duty and Schedule B threshold are computed from the figures you enter.",
    ],
  ],
  faqs: [
    [
      "At what donation amount must a charity give a written receipt?",
      "A donor cannot deduct a contribution of 250 US dollars or more without a contemporaneous written acknowledgment from the charity under 26 U.S.C. section 170(f)(8), which must state the amount and whether anything was given in return. Separately, 26 U.S.C. section 6115 requires a written disclosure whenever a donor pays more than 75 US dollars and receives goods or services back, stating that only the excess over their value is deductible.",
    ],
    [
      "Are donor names on a charity's tax return public?",
      "Not for most public charities. Schedule B to Form 990 lists contributors who gave the greater of 5,000 US dollars or 2% of total contributions, and that copy goes to the IRS. A section 501(c)(3) organisation that is not a private foundation redacts contributor names and addresses from the copy it makes available for public inspection, so the amounts are public but the names generally are not.",
    ],
    [
      "Can a charity process health or religious data about the people it helps?",
      "Only with a condition from Article 9(2) of the GDPR, because Article 9(1) prohibits it by default. The realistic routes are the person's explicit consent, a substantial public interest condition in domestic law, or the not-for-profit exception in Article 9(2)(d), which lets a body with a political, philosophical, religious or trade union aim process the data of members, former members and people in regular contact with it — provided it is never disclosed outside without consent.",
    ],
    [
      "How long must grant and donation records be kept?",
      "For a US federal award, 2 CFR 200.334 requires financial records, supporting documents and statistical records to be kept for three years from the date the final financial report is submitted, and longer if litigation or an audit begins before that. Indian organisations receiving foreign contribution must preserve those accounts for six years under the Foreign Contribution (Regulation) Act 2010 and file Form FC-4 by 31 December each year. Set the period per record type and confirm it with your auditor.",
    ],
  ],
};

export default seo;
