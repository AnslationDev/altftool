const seo = {
  title: "AI Policy One-Pager Generator for Staff AI Use",
  metaDescription:
    "Build a one-page staff AI guide: five core clauses on approved tools, data bans, review duty and incident reporting, plus optional ones you toggle.",
  steps: [
    "Enter your Company or team name and the Approved tools (comma separated) staff may use, plus an optional effective date and incident contact.",
    "Tick the Optional clauses you want, covering disclosure, prompt hygiene, decisions about people, impersonation, IP and security bypasses; the five core clauses are always included.",
    "Read the assembled one-pager and its rule count, then press Copy one-pager to paste it into your handbook or wiki.",
  ],
  intro:
    "The AI Policy One Pager Generator assembles a single-page do-and-don't guide for staff AI use from a curated clause library covering the sections corporate AI acceptable-use policies consistently include: approved tools, confidential and personal data rules, human review duty, disclosure, IP and incident reporting. Five core clauses are always present and six more can be toggled, so the output stays short enough that people actually read it. It is built for founders, IT and HR leads who need workable guidance today while the full policy is still in review.",
  useCases: [
    "A startup founder who wants a credible AI use guide on the wiki this week, listing ChatGPT Team and Copilot as the approved tools",
    "An IT manager responding to shadow AI use by publishing clear do/don't rules and a named incident contact",
    "An HR lead preparing onboarding material that tells new hires what may never be pasted into a chatbot",
  ],
  benefits: [
    ["Core rules always on", "Approved tools, review duty, incident reporting and both data bans are non-removable, so the essentials survive every edit."],
    ["Genuinely one page", "The default output runs roughly 250 words — short enough to be read, remembered and pinned to a wall."],
    ["Clause library, not free text", "Each toggle maps to a vetted clause covering decisions about people, impersonation, IP and security bypasses."],
  ],
  faqs: [
    [
      "What should a company AI use policy include?",
      "At minimum: a named list of approved tools, a ban on entering confidential business information and personal data into unapproved tools, a duty to review AI output before it is used or sent, and a route for reporting incidents. Frameworks such as the NIST AI RMF and ISO/IEC 42001 organise governance around exactly these controls; this generator makes those five clauses mandatory.",
    ],
    [
      "Why should staff not paste confidential data into AI chatbots?",
      "Because prompts may be retained by the provider and, on consumer tiers, can be used to train future models — meaning confidential text leaves the company's control the moment it is pasted. Business tiers with no-training commitments reduce the risk, which is why the policy points staff at an approved-tools list rather than banning AI outright.",
    ],
    [
      "Do employees have to review AI output before using it?",
      "Yes — human review is the single most common obligation in corporate AI policies, because models produce confident errors and fabricated citations. The generated one-pager words it as ownership: the person who ships the work is accountable for it, whether or not AI helped draft it.",
    ],
    [
      "Is a generated AI policy legally binding?",
      "The one-pager is an internal conduct guideline, not a legal document, and this tool does not provide legal advice. To make it enforceable, incorporate it into your staff handbook or acceptable-use policy and have counsel check it against the privacy laws and sector regulations that apply to you.",
    ],
  ],
};

export default seo;
