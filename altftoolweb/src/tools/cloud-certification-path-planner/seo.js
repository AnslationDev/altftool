const seo = {
  title: "Cloud Certification Path Planner: AWS, Azure, GCP",
  metaDescription:
    "Plan an ordered AWS, Azure or GCP cert path for five roles — published exam fees, typical study hours and a week-by-week timeline at your own pace.",
  steps: [
    "Pick a \"Cloud provider\" (AWS, Microsoft Azure or Google Cloud) and a \"Target role\" — Solutions Architect, Developer, DevOps / SRE, Data Engineer or Security Engineer.",
    "Set \"Study hours per week (1–40)\" and tick or untick \"Start with the fundamentals exam (skip it if you already work in cloud)\".",
    "Read the exam table — certification, level, fee, study hours and the week to sit each exam — with total weeks, months and fees above it, then click \"Copy plan\" for a Markdown table.",
  ],
  intro:
    "This planner builds an ordered cloud certification sequence — foundational, associate, then professional — for a chosen role on AWS, Microsoft Azure or Google Cloud, using the providers' published exam fees (AWS $100/$150/$300 by tier, Azure $99/$165, GCP $99/$125/$200) and typical study-hour estimates. Enter your weekly study hours and it lays out which exam to sit in which week, plus the total cost and time to finish the path.",
  useCases: [
    "A backend developer targeting an AWS architect role sees the Cloud Practitioner → Solutions Architect Associate → Professional sequence with a week-by-week timeline at 8 hours of study a week",
    "An ops engineer choosing between Azure and GCP DevOps tracks compares total exam fees and study hours side by side before committing",
    "A working professional decides whether to skip the fundamentals exam by toggling it off and seeing how many weeks and dollars it saves",
  ],
  benefits: [
    ["Published fees, not guesses", "Exam prices come from each provider's certification page: AWS tiers at $100/$150/$300, Azure at $99/$165, GCP at $99/$125/$200 (standard USD)."],
    ["Prerequisite-aware ordering", "Sequences respect real requirements, like AZ-104 before the AZ-305 Solutions Architect Expert badge."],
    ["Paced to your calendar", "Study hours divide by your weekly availability into concrete exam-week targets you can book against."],
  ],
  faqs: [
    [
      "Which cloud certification should I get first?",
      "Start with the provider's foundational exam — AWS Cloud Practitioner ($100), Azure Fundamentals AZ-900 ($99) or GCP Cloud Digital Leader ($99) — if you are new to cloud, then move to the associate cert for your role. Engineers already working hands-on in a cloud often skip fundamentals and start at associate level, which this planner supports.",
    ],
    [
      "How much do AWS certifications cost?",
      "AWS exam registration is tiered by level: $100 for the foundational Cloud Practitioner, $150 for associate exams like Solutions Architect Associate (SAA-C03), and $300 for professional and specialty exams like Solutions Architect Professional (SAP-C02). Prices are USD and AWS emails a 50%-off voucher for your next exam after each pass.",
    ],
    [
      "How long does it take to prepare for a cloud certification?",
      "Typical estimates for someone with some IT background are 20–25 hours for a fundamentals exam, 60–75 hours for an associate exam and 85–100 hours for a professional exam. At 8 hours of study a week, a full foundational-to-professional path is roughly five to six months.",
    ],
    [
      "Do I need AZ-104 before AZ-305?",
      "Yes — Microsoft awards the Azure Solutions Architect Expert credential only when you have passed AZ-305 plus the Azure Administrator Associate (AZ-104) prerequisite. Similarly, the AZ-400 DevOps Engineer Expert badge requires either AZ-104 or AZ-204 first, which is why this planner sequences them that way.",
    ],
  ],
};

export default seo;
