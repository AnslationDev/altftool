const seo = {
  title: "AI Training Plan Builder by Role and Level",
  metaDescription:
    "Build a week-by-week AI upskilling plan by role and skill level — 1-4 hour modules packed into a 1-10 h/week budget, each with a stated outcome.",
  steps: [
    "Choose a Role — General staff, 'Managers & team leads', 'Developers & engineers', 'Marketing & content', 'Operations & support' or 'Data & analysts' — and a 'Current skill level' of Beginner, Intermediate or Advanced.",
    "Set 'Time budget (hours per week, 1–10)'; the catalogue is filtered by role, foundations are dropped for advanced learners, and whole 1–4 hour modules are packed into numbered weeks as you type.",
    "Read the Plan length in weeks above the Week / Module / Hours / Outcome table, then press 'Copy plan' to take it as text or Reset to return to General staff, Beginner and 2 hours per week.",
  ],
  intro:
    "The AI Training Plan Builder generates a week-by-week internal AI upskilling plan from a curated module catalogue, filtered by role (general staff, managers, developers, marketing, operations, analysts) and starting skill level, then packed into a weekly time budget of 1–10 hours. Modules are sequenced the way vendor academies order AI curricula — foundations, then applied practice, then governance — in 1–4 hour blocks that survive alongside a day job. It is built for L&D owners and team leads who need a defensible plan, not a link dump.",
  useCases: [
    "An L&D manager building a 2-hours-per-week AI onboarding track for all staff, starting from prompting fundamentals and safe data use",
    "An engineering lead planning developer-specific training that covers AI pair programming and model API work with an evaluated capstone",
    "A department head who needs to tell leadership exactly how many weeks the upskilling will take at 3 hours per person per week",
  ],
  benefits: [
    ["Role and level aware", "Developers, managers, marketers and analysts get different modules; advanced learners skip the foundations."],
    ["Real schedule, not a list", "Module hours are packed into numbered weeks against your stated time budget, including modules that span weeks."],
    ["Outcome per module", "Every module states a verifiable outcome, so completion means demonstrated skill rather than watched videos."],
  ],
  faqs: [
    [
      "How many hours per week should employees spend on AI training?",
      "One to three hours per week is the realistic band for upskilling alongside a full workload; this tool accepts 1–10 hours and packs modules accordingly. Corporate learning practice favours short 1–4 hour blocks because longer commitments beside a day job have high abandonment rates.",
    ],
    [
      "What should an internal AI training plan cover first?",
      "Three foundations before anything role-specific: how LLMs actually behave (including hallucination and context limits), structured prompting, and safe data handling — what may never be pasted into a prompt. This tool front-loads exactly those three modules for every beginner regardless of role.",
    ],
    [
      "Should AI training be different for developers and non-technical staff?",
      "Yes. Beyond shared foundations, developers need assistant-in-the-editor and model API skills, managers need workflow redesign and output review practices, and marketing needs brand-safe generation workflows. The builder filters its catalogue by role so each group only sees relevant modules.",
    ],
    [
      "How long does it take to upskill a team on AI?",
      "At 2 hours per week, the full beginner track for general staff in this builder runs 9 weeks (18 module hours), and the developer beginner track runs 24 hours. The exact figure depends on your time budget — the tool recomputes the week count as you change hours per week or skill level.",
    ],
  ],
};

export default seo;
