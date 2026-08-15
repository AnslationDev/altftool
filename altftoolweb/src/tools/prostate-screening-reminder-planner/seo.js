const seo = {
  title: "PSA Screening Planner: ACS Start Age and Re-Test Date",
  metaDescription:
    "Enter age, family history and your last PSA for the ACS start age of 40, 45 or 50 and the next due date under the 2.5 ng/mL interval rule.",
  steps: [
    "Enter 'Age (years)', pick 'Family history', and give 'Most recent PSA (ng/mL, 0 if never tested)'.",
    "Add 'Date of that test or discussion' with 'Today's date', and tick 'Black or African ancestry' or 'Known BRCA1, BRCA2 or Lynch syndrome' if they apply.",
    "Read your start age and next due date under 'What the guidelines say for you', then press 'Copy result'.",
  ],
  intro:
    "Prostate Screening Reminder Planner works out the age at which published guidance suggests starting the PSA conversation for your risk profile, and when the next discussion falls due. It applies the American Cancer Society risk tiers — age 50 at average risk, 45 for Black men or one first-degree relative diagnosed before 65, 40 for multiple affected relatives or a known BRCA variant — together with the ACS re-test rule of every two years below 2.5 ng/mL and yearly at or above it. It is a scheduling aid, not a recommendation for or against screening.",
  useCases: [
    "See whether a family history of prostate cancer moves your starting conversation from 50 to 45 or 40.",
    "Work out when a PSA of 1.2 ng/mL taken last spring is due for a repeat under the two-year rule.",
    "Check whether you fall inside the USPSTF 55 to 69 shared decision-making window.",
    "Put a date in the calendar for the next GP conversation instead of relying on memory.",
  ],
  benefits: [
    ["Risk-tiered start age", "Applies the published 40 / 45 / 50 tiers rather than one blanket age."],
    ["Interval from your own PSA", "Uses the 2.5 ng/mL cut-off that separates the two-year and one-year re-test intervals."],
    ["Flags the age-70 rule", "Highlights that routine screening is not recommended from 70 and becomes an individual decision."],
  ],
  faqs: [
    [
      "At what age should prostate cancer screening be discussed?",
      "The American Cancer Society suggests age 50 for men at average risk with at least a 10-year life expectancy, 45 for those at high risk — Black men or with a father or brother diagnosed before 65 — and 40 for men with more than one such relative. The discussion is the recommendation, not the test itself.",
    ],
    [
      "How often should a PSA test be repeated?",
      "Under the ACS interval rule, a PSA below 2.5 ng/mL is usually repeated every two years, and 2.5 ng/mL or above every year. Your clinician may choose differently based on PSA velocity, prostate volume, symptoms or medication such as finasteride.",
    ],
    [
      "Should men over 70 have a PSA test?",
      "The US Preventive Services Task Force recommends against routine PSA screening from age 70 (grade D), because the balance of benefits and harms turns unfavourable. It can still be reasonable for a healthy man with a long life expectancy, which is exactly the conversation to have with a doctor.",
    ],
    [
      "What PSA level is considered high?",
      "4.0 ng/mL has traditionally been the level at which further assessment is discussed, though there is no single safe cut-off and many men with lower values have cancer while many with higher values do not. Raised PSA is common with benign enlargement, infection or recent cycling — interpret it with a clinician, never from a web page.",
    ],
  ],
};

export default seo;
