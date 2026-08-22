const seo = {
  title: "HR Prompt Pack: 12 Fill-in-the-Blank Prompts",
  metaDescription:
    "12 fill-in-the-blank prompts for job posts, structured interview guides with rubrics, 30-60-90 plans, policies and evidence-based reviews.",
  steps: [
    "Search prompts or pick a Category — Hiring, Job Descriptions, Onboarding, Policies, Performance or Employee Comms — and tap one of the 12 prompt cards.",
    "Fill in the blanks for that prompt, press 'Use example values' to load the placeholders, or 'Clear fields' to empty them again.",
    "Check the estimated token count, the blanks-filled count and the context-window note, then press Copy prompt to paste the finished text into your assistant.",
  ],
  intro:
    "The HR Prompt Pack is a library of 12 fill-in-the-blank AI prompts covering the documents people teams write most often: job posts, de-biased adverts, structured interview guides with scorecards, 30-60-90 onboarding plans, plain-English policies, evidence-based performance reviews, SBI feedback scripts and exit interviews. Each prompt fixes the structure and the fairness constraints in advance — behavioural questions in STAR form, rubrics tied to observable evidence, no comment on protected characteristics — so the draft is usable rather than generic. Everything is assembled in your browser and copied out to whichever assistant you use.",
  useCases: [
    "Rewriting a job advert that has been open for six weeks, with a table showing which phrases narrow the applicant pool and what to replace them with.",
    "Building one structured interview guide with a four-level rubric so three interviewers score the same candidate against the same evidence.",
    "Drafting a hybrid working policy in plain English, with a separate list of the clauses that must be checked against local employment law before it is published.",
  ],
  benefits: [
    ["Fairness guardrails built in", "Prompts rule out protected-characteristic questions, personality-based review language and coded job-ad wording by default."],
    ["Evidence, not adjectives", "The review and feedback prompts require every claim to trace back to an example you supplied, and say so when none exists."],
    ["Private by default", "Prompts are assembled in the browser; employee names and details you type never leave the page."],
  ],
  faqs: [
    [
      "Can I use AI to write a workplace policy?",
      "You can use it to produce a first draft to react to, but not to publish unreviewed. Employment law varies by country and state, and a model cannot know your jurisdiction's notice periods, consultation duties or working-time rules, so every draft here ends with a list of points to check with a qualified employment lawyer.",
    ],
    [
      "What makes an interview structured, and does it actually work better?",
      "A structured interview means every candidate gets the same predetermined questions, in the same order, scored against the same written rubric. Decades of selection research consistently find structured interviews predict job performance substantially better than unstructured ones, mostly because they stop interviewers from following whatever thread they find interesting.",
    ],
    [
      "How do I avoid bias when AI writes a performance review?",
      "Give it only observed evidence and require it to say 'no evidence supplied' rather than filling the gap. The review prompt bans personality language such as 'attitude' or 'not a team player', bans comments on communication style that commonly carry cultural and gender bias, and asks for behaviour and impact instead — but a human still has to check the result against what actually happened.",
    ],
    [
      "Is it safe to paste employee details into an AI chatbot?",
      "Treat it as you would any third-party processor: most consumer AI tools are not covered by your employment data agreements, and pasting names, health information or disciplinary details may breach GDPR or your own privacy notice. Use role descriptions and initials instead of names, and check your organisation's approved-tools list before pasting anything identifiable.",
    ],
  ],
};

export default seo;
