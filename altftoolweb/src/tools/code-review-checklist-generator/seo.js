const seo = {
  title: "Code Review Checklist Generator (Markdown)",
  metaDescription:
    "Generate a review checklist tuned by language, change type and risk — sections follow Google's code review guide, output as Markdown task boxes for PRs.",
  steps: [
    "Pick the \"Language\" (TypeScript / JavaScript through SQL / database), \"Change type\" (New feature, Bug fix, Hotfix, Dependency upgrade, Config) and \"Risk level\" dropdowns, and optionally name the checklist.",
    "Tick the \"What does the change touch?\" focus areas — such as \"Touches auth, secrets or user input\" or \"Touches database schema or queries\" — to add targeted sections.",
    "Review the generated sections and item count, then click \"Copy Markdown\" to paste the \"- [ ]\" task-box list into a pull request template.",
  ],
  intro:
    "This generator builds a code review checklist matched to your language, change type and risk level, output as Markdown task boxes ready for a pull request template. Its core sections — design, functionality, complexity, tests and documentation — follow Google's Code Review Developer Guide, and its security items follow the OWASP Code Review Guide. Reviewers and tech leads get a focused list instead of a generic wall of questions.",
  useCases: [
    "A tech lead creating a PULL_REQUEST_TEMPLATE.md for a TypeScript service adds language-specific checks like floating promises and untyped `any`",
    "A reviewer handling a high-risk payment change generates the extended list with rollback, audit-logging and second-reviewer items",
    "A team introducing database migrations adds the schema-safety section so lock-heavy migrations get caught before deploy",
  ],
  benefits: [
    ["Tuned, not generic", "Items change with the language, the change type (feature, bugfix, hotfix, dependency, config) and what the diff touches."],
    ["Based on published guides", "Sections mirror Google's Code Review Developer Guide; security items follow the OWASP Code Review Guide."],
    ["Paste-ready Markdown", "Output uses `- [ ]` task syntax that renders as tickable checkboxes on GitHub, GitLab and Bitbucket."],
  ],
  faqs: [
    [
      "What should a code review checklist include?",
      "Design fit, correctness and edge cases, readability, test coverage and documentation — the categories in Google's Code Review Developer Guide — plus targeted items for whatever the change touches: security, database migrations, API contracts, UI accessibility, performance or concurrency. This generator assembles exactly those sections based on your selections.",
    ],
    [
      "How many lines of code should one code review cover?",
      "Around 400 changed lines or fewer per session. The widely cited SmartBear study of 2,500 code reviews at Cisco found defect discovery drops sharply beyond 400 lines, and review effectiveness is best under 60–90 minutes at a time. The generated checklist includes this guidance in its header.",
    ],
    [
      "Should security be part of every code review?",
      "Security checks belong in any review where the change handles user input, authentication, authorization or secrets — the focus areas of the OWASP Code Review Guide. For diffs that touch none of those, a shorter checklist keeps reviews fast; this tool lets you toggle the security section per change.",
    ],
    [
      "How do I add a checklist to every pull request automatically?",
      "Put the generated Markdown in a PULL_REQUEST_TEMPLATE.md file at the root, in .github/, or in docs/ of your repository — GitHub, GitLab and Bitbucket all pre-fill new pull requests from it. The `- [ ]` items render as interactive checkboxes that reviewers can tick off.",
    ],
  ],
};

export default seo;
