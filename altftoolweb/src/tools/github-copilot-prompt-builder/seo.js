const seo = {
  title: "GitHub Copilot Prompt Builder for 13 Languages",
  metaDescription:
    "Turns a coding task into a goal-inputs-output-constraints-example Copilot prompt as a comment block with a function stub, in 13 languages.",
  steps: [
    "Describe 'The task (one task only)', pick one of 13 languages from JavaScript through SQL and Shell/Bash, and name the function.",
    "Add Inputs, the Output / return value, Constraints one per line and an 'Example input → output', then pick the Prompt style — inline comment or Copilot Chat.",
    "The comment-block prompt with a signature stub renders live, with warnings for compound or underspecified tasks; click 'Copy result'.",
  ],
  intro:
    "This builder turns a plain-English coding task into a structured GitHub Copilot prompt — goal, inputs, expected output, one constraint per line, then a concrete example — rendered as a comment block in your language's syntax with a function stub to complete from. The structure follows GitHub's published prompt-engineering guidance for Copilot: set context first, keep to a single task, and steer with an input → output example.",
  useCases: [
    "A developer getting generic or wrong inline completions who wants a properly scoped comment prompt above the cursor",
    "A team lead writing a Copilot usage guide who needs a repeatable prompt template in JavaScript, Python, Go and SQL comment syntax",
    "Someone switching between inline completions and Copilot Chat and needing the same task phrased correctly for each",
  ],
  benefits: [
    ["GitHub's own structure", "Orders the prompt goal → inputs → output → constraints → example, per the official guidance."],
    ["Thirteen languages", "Emits the right comment syntax and signature stub for JavaScript through SQL and Bash."],
    ["Prompt linting", "Warns on compound tasks, missing examples, missing return description and unnamed functions."],
  ],
  faqs: [
    [
      "How do I write a good prompt for GitHub Copilot?",
      "State the goal in one sentence, then the inputs, the expected output, any constraints, and finish with a concrete input → output example — all as comments directly above your cursor. GitHub's guidance summarises it as: provide context, keep it to a single task, and show an example rather than describing one.",
    ],
    [
      "Does GitHub Copilot read comments as prompts?",
      "Yes. Inline Copilot builds its completion from the code and comments around your cursor, plus your open editor tabs. A comment block immediately above an empty function signature is the most direct way to specify what the completion should do.",
    ],
    [
      "Why does Copilot give me wrong or generic code?",
      "Usually because the prompt is underspecified — the task covers several responsibilities, the return type is unstated, or there is no example. Splitting compound tasks into one prompt each, naming the function descriptively and adding an input → output pair are the three fixes GitHub's documentation recommends first.",
    ],
    [
      "Should I prompt Copilot inline or in Copilot Chat?",
      "Inline comment prompts work best for a single function or block where surrounding code gives context; Copilot Chat suits multi-file changes, explanations and refactors where you need to iterate in conversation. The same goal-inputs-output-example structure improves results in both.",
    ],
  ],
};

export default seo;
