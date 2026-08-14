const seo = {
  title: "LinkedIn Exposure Check: 12 Search-Engine Queries",
  metaDescription:
    "Builds site:, filetype: and quoted-phrase queries from your name and /in/ handle to show the indexed profile, republished copies and PDFs about you.",
  steps: [
    "Enter Your full name (as on the profile) and the Public profile URL or the part after /in/, plus the optional employer, City or region and Work email domain fields.",
    "Set Open queries in to Google, Bing or DuckDuckGo — the Queries ready to run count shows how many of the 12 templates your inputs have unlocked.",
    "Work through the groups Your profile as strangers see it, Activity and content, Where your profile is republished and Documents and contact details, using Run it on a single query or Copy all.",
  ],
  intro:
    "This builder assembles twelve search-engine queries from your own name, LinkedIn vanity URL, employer, city and work email domain, using documented operators — site:, filetype:, quoted phrases, OR and the minus exclusion — to show what a stranger can read about your professional life without logging in. It covers your indexed public profile, country-subdomain copies, public posts and articles, sites that republish your profile URL, scraped aggregator entries and PDFs carrying your contact details. It builds strings for you to run yourself; it never searches, scrapes or stores anything.",
  useCases: [
    "Checking what a recruiter, client or stranger sees when they search your name before a meeting.",
    "Finding conference bios, team pages and PDFs that carry your personal phone number or email.",
    "Locating your entry on business-data aggregators so you can use their opt-out forms.",
    "Assessing how much material a phishing campaign could assemble about your role and employer.",
  ],
  benefits: [
    ["Real operators, no guesswork", "Every query uses documented search syntax and your validated profile URL, so results are precise rather than noisy."],
    ["Covers the copies", "Country subdomains, republished links and scraped aggregator entries are searched separately from your own profile."],
    ["Private by construction", "The page assembles strings locally; nothing is fetched, logged or sent."],
  ],
  faqs: [
    [
      "How do I find my own LinkedIn profile on Google?",
      "Search site:linkedin.com/in followed by your name in quotes, then repeat with site:*.linkedin.com/in to catch country subdomains such as uk.linkedin.com. That returns the public version of your profile, which is what people see before signing in and what search engines have cached.",
    ],
    [
      "What is a LinkedIn public profile URL and what can it contain?",
      "It is the part after /in/ in your profile address, and LinkedIn's rule is 3 to 100 characters using only letters, numbers and hyphens. Searching for that exact string in quotes, with -site:linkedin.com, reveals every other site that has embedded a link to your profile.",
    ],
    [
      "Can I stop my LinkedIn profile appearing in search results?",
      "Partly. Settings and Privacy > Visibility > Edit your public profile lets you limit which sections search engines see, or hide the public profile entirely, and a separate setting controls whether people can find you by email address or phone number. Changes take time to appear because search engines re-crawl on their own schedule and may keep a cached copy meanwhile.",
    ],
    [
      "Is running these searches on someone else legal?",
      "These queries only surface pages that are already public and indexed, but this tool is written for auditing your own footprint. Compiling a profile of another person, particularly for contact, monitoring or targeting, raises data protection and harassment questions in many jurisdictions — take proper advice before doing it in a professional context.",
    ],
  ],
};

export default seo;
