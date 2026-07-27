const seo = {
  intro:
    "This checker applies the NEET (UG) minimum-age rule — 17 years of age completed on or before 31 December of the year of admission, as laid down in the Graduate Medical Education Regulations — to your exact date of birth. It returns your age in years, months and days on the cutoff, the precise day margin by which you pass or miss the rule, and the latest date of birth that still qualifies for your admission year.",
  useCases: [
    "A Class 12 student born late in the year checking whether they turn 17 in time for this year's admission or must wait for the next cycle",
    "A parent verifying the exact cutoff before paying the NEET application fee for an early-admitted child who skipped a grade",
    "A dropper confirming that age is not the issue for a re-attempt, since NEET has no upper age limit",
  ],
  benefits: [
    ["Exact day margin", "Shows precisely how many days before or after the 31 December cutoff you complete 17 years — no guessing at boundaries."],
    ["Latest eligible DOB", "Instantly shows the last birth date that qualifies for your admission year, useful for December-born candidates."],
    ["Rule-accurate", "Encodes the GME Regulations' 17-year rule and the current no-upper-age-limit position rather than a rough age estimate."],
  ],
  faqs: [
    [
      "What is the minimum age for NEET?",
      "17 years, completed on or before 31 December of the year of admission to the first-year MBBS/BDS course, as per the Graduate Medical Education Regulations. A candidate born on 31 December turns 17 exactly on the cutoff and still qualifies for admission that year.",
    ],
    [
      "Is there an upper age limit for NEET?",
      "No. The National Medical Commission removed the upper age bar in 2022, and NTA bulletins since then state there is no upper age limit for appearing in NEET (UG). Only the 17-year minimum applies.",
    ],
    [
      "Which date of birth does NTA use for NEET eligibility?",
      "The date of birth recorded in your Class 10 (secondary school) certificate. If any other document differs, the Class 10 record is what the application and counselling verification go by, so enter that date when checking eligibility.",
    ],
    [
      "Can I appear in NEET before turning 17?",
      "You can sit the exam if you complete 17 years by 31 December of the admission year — the rule is about age at admission, not on exam day. A candidate who is 16 on exam day but turns 17 by that 31 December remains eligible; one who turns 17 even a day later must wait for the next admission year.",
    ],
  ],
};

export default seo;
