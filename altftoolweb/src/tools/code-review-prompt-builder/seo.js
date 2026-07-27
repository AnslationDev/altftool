const seo = {
  intro:
    "The Code Review Prompt Builder assembles an AI code-review prompt from proven checklists — correctness defect classes, OWASP Top 10 (2021) security categories, performance anti-patterns, style and maintainability — with a four-level severity scheme and a review-size check. It is built for developers who paste diffs into ChatGPT, Claude or Copilot Chat and want findings with file, line, failure scenario and a minimal fix instead of a vague rewrite, and it warns when a change exceeds the ~400-line effective review size found in SmartBear's study of peer review at Cisco.",
  useCases: [
    "A backend developer pastes a 250-line password-reset endpoint diff and gets a security-focused review checking injection, access control and secret logging against OWASP Top 10 categories.",
    "A team lead standardises AI pre-review across the team so every pull request gets the same blocker/major/minor/nit severity labels before a human looks.",
    "An engineer facing a 1,200-line change learns the prompt will demand three review passes, and splits the PR instead.",
  ],
  benefits: [
    [
      "Focus-specific checklists",
      "Correctness, security, performance, style and maintainability each carry their own concrete checklist, so the model hunts real defect classes instead of restating the code.",
    ],
    [
      "Findings, not rewrites",
      "The prompt demands severity, location, a concrete failure scenario and a minimal fix for every finding — and forbids speculative issues without a line to point to.",
    ],
    [
      "Review-size guardrail",
      "Changes above about 400 LOC get split into numbered passes, matching the size at which human defect discovery measurably drops.",
    ],
  ],
  faqs: [
    [
      "How many lines of code should one code review cover?",
      "About 200 to 400 lines per review session. SmartBear's study of peer code review at Cisco found defect-discovery effectiveness drops sharply beyond roughly 400 lines, and recommends reviewing no faster than about 500 lines per hour. This tool computes the number of passes a larger change needs and writes that instruction into the prompt.",
    ],
    [
      "What should an AI code review prompt include?",
      "Four things: a specific checklist for the chosen focus (for security, the OWASP Top 10 categories such as injection and broken access control), a severity scheme, a required format for each finding (location, defect, failure scenario, minimal fix), and a rule against reporting speculative issues without a concrete line. This tool generates all four from your selections.",
    ],
    [
      "Can AI code review replace human review?",
      "No — it is a pre-filter, not a replacement. AI review reliably catches mechanical issues like null handling, injection-prone string building and N+1 queries, but misses context a human has: product intent, architectural direction and team conventions. Use the generated review to arrive at human review with fewer defects.",
    ],
    [
      "What severity levels should code review findings use?",
      "A four-level scheme is standard: blocker (must fix before merge — bug, vulnerability or data loss), major (should fix — likely defect), minor (worth fixing), and nit (style preference the author may ignore). The generated prompt requires exactly one label per finding so results can be triaged at a glance.",
    ],
  ],
};

export default seo;
