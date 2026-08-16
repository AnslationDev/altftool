const seo = {
  title: "LinkedIn Data Export: 10-Min Files vs 24h Archive",
  metaDescription:
    "See whether your LinkedIn export lands in about 10 minutes or needs the 24-hour archive, how big the zip is, and which CSVs expose other people's data.",
  steps: [
    "Under '1. Choose the files', tick the exports you need — Connections, Ad targeting attributes, Messages and more — or press Fast files only to drop everything that forces the full archive.",
    "Under '2. Describe the account', enter Years on LinkedIn, First-degree connections (up to 30,000) and a Rough lifetime message count to size each CSV.",
    "Read the Expected wait and which of LinkedIn's two paths your selection takes, plus Estimated archive size, Rows describing other people and the sensitivity band, then press Copy plan.",
  ],
  intro:
    "This guide plans a LinkedIn data export and tells you which of LinkedIn's two paths your selection will take: picking specific files, which LinkedIn quotes at about 10 minutes, or the larger archive with messages and activity, quoted at up to 24 hours. It estimates the zip size from your connection count, message volume and years on the platform, and rates each CSV for how much it exposes. Connections and Contacts are highlighted separately because they are other people's personal data, not yours.",
  useCases: [
    "Pull only Ad_Targeting and search history to see how LinkedIn has classified you professionally and what your research trail looks like.",
    "Estimate the Connections.csv size before a CRM import, and decide whether uploading other people's details to a third-party tool is acceptable at all.",
    "Get the fast files in about 10 minutes when you only need profile, job and login data, instead of waiting a day for the full archive.",
    "Check the logins and security file for sign-ins from devices or countries you do not recognise after a suspicious notification.",
  ],
  benefits: [
    ["Predicts the wait", "Shows whether your file selection triggers the 10-minute path or the 24-hour archive before you submit."],
    ["Counts third-party rows", "Separates out how many rows describe other people, which is the real liability in a LinkedIn export."],
    ["Row-level size model", "Sizes CSVs from your actual connection and message counts rather than a fixed guess."],
  ],
  faqs: [
    [
      "How do I download my LinkedIn data?",
      "Go to Settings & Privacy, open Data privacy, and choose 'Get a copy of your data'. You can either select specific files, which LinkedIn returns in roughly 10 minutes, or request the larger archive with connections, contacts and account activity, which LinkedIn quotes at within 24 hours.",
    ],
    [
      "What is in the LinkedIn Ad_Targeting file?",
      "It lists the inferred attributes advertisers can use to target you, such as seniority, employer, job function, interests, degrees and member traits. It is the fastest way to see how the platform has profiled your career, and it arrives in the quick export path.",
    ],
    [
      "How many connections can a LinkedIn account have?",
      "LinkedIn caps first-degree connections at 30,000 per account. Followers are separate and are not capped, which is why very large accounts switch to Creator mode and rely on follows instead of connections.",
    ],
    [
      "Is it safe to upload my LinkedIn Connections.csv to another tool?",
      "Treat it as other people's personal data, not yours. The file carries names, headlines, employers and sometimes email addresses for every connection, so uploading it to an unknown web service exposes them rather than you. Keep the archive encrypted and delete it when finished; this page is informational and not legal advice.",
    ],
  ],
};

export default seo;
