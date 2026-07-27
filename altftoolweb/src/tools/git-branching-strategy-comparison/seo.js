const seo = {
  intro:
    "This tool compares the four mainstream git branching strategies — git flow, GitHub flow, trunk-based development and release branching (GitLab flow) — by scoring each against your team size, release cadence, CI maturity, multi-version needs and compliance gates. The scoring encodes the guidance from each strategy's own documentation, including Vincent Driessen's 2020 advice that git flow is a poor fit for continuously delivered web apps. It is for tech leads choosing or revisiting a branching model.",
  useCases: [
    "A startup deciding between GitHub flow and trunk-based development before its first production deploy",
    "An enterprise team maintaining v1.x and v2.x in parallel checking whether git flow or release branches fit better",
    "A platform lead preparing a written recommendation with per-strategy pros and cons for an engineering RFC",
  ],
  benefits: [
    ["Reasoning shown", "Every point a strategy scores comes with the sentence explaining why, so the output survives team scrutiny."],
    ["Grounded in the sources", "Rules come from nvie.com, GitHub's docs, trunkbaseddevelopment.com and GitLab's docs — not folklore."],
    ["Cautions included", "Each strategy also lists why it may fail in your situation, like trunk-based development without CI."],
  ],
  faqs: [
    [
      "What is the difference between git flow and GitHub flow?",
      "Git flow uses five branch types (main, develop, feature, release, hotfix) and suits scheduled, versioned releases; GitHub flow uses just main plus short-lived feature branches merged by pull request and deployed immediately. GitHub flow is dramatically simpler but assumes a single continuously deployed version of the software.",
    ],
    [
      "Is git flow outdated?",
      "For continuously delivered web applications, its own author thinks so: Vincent Driessen added a note to the original 2010 article in March 2020 saying such teams should adopt a simpler workflow like GitHub flow instead. Git flow remains a reasonable choice for explicitly versioned software that maintains multiple releases in parallel.",
    ],
    [
      "What do I need before adopting trunk-based development?",
      "Fast, trustworthy automated tests and a way to hide unfinished work — feature flags or branch-by-abstraction. Trunk-based development means everyone integrates small changes into one branch at least daily, so a broken trunk blocks the whole team; CI is its safety net, not an optional extra. The DORA/Accelerate research associated trunk-based development with elite delivery performance.",
    ],
    [
      "Which branching strategy is best for a small team?",
      "GitHub flow is usually the best starting point for teams under about ten people with a single deployed version: one main branch, short-lived feature branches and deploy-on-merge give the least process overhead. Move toward trunk-based development as deploy frequency and automation grow, or add release branches only when you must maintain several shipped versions.",
    ],
  ],
};

export default seo;
