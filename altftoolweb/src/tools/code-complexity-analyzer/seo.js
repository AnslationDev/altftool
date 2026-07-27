const seo = {
  intro:
    "Code Complexity Analyzer measures a pasted function or file on four established metrics — McCabe cyclomatic complexity, nesting-weighted cognitive complexity, Halstead volume and the maintainability index — then names the specific functions that are too long, too nested or take too many parameters. It is for developers deciding what to refactor first and for reviewers who want a number behind \"this is hard to follow\". Everything runs in your browser; no code is uploaded.",
  useCases: [
    "Find which function in a 500-line file is the one worth splitting, by ranking every function by cyclomatic complexity",
    "Justify a refactor in a pull request with the before-and-after maintainability index rather than an opinion",
    "Teach cyclomatic complexity by pasting a nested if-chain and watching the number climb one point per branch",
  ],
  benefits: [
    ["Four metrics, not one number", "Cyclomatic, cognitive, Halstead volume and maintainability index each catch a different problem, and all four are shown per function."],
    ["Points at the actual function", "Smells are reported against the function that has them — long body, deep nesting, too many parameters — with a suggested fix, not a file-level warning."],
    ["Runs locally", "Parsing and scoring happen in the page, so proprietary source never leaves the machine."],
  ],
  faqs: [
    [
      "What is a good cyclomatic complexity score?",
      "10 or below per function. That is the ceiling Thomas McCabe proposed in his 1976 paper introducing the metric, and it is the default threshold here. The number is one plus one for every decision point — if, else-if, for, while, case, catch, &&, || and each ternary — so a function with no branches scores exactly 1, and each branch you add costs one point.",
    ],
    [
      "What is the difference between cyclomatic and cognitive complexity?",
      "Cyclomatic counts independent paths and tells you how many test cases you need; every branch costs the same 1 point wherever it sits. Cognitive complexity weights each branch by nesting depth, so an `if` inside two loops costs more than an `if` at the top of the function. A function can be cyclomatically simple and still cognitively awful — that is exactly the case this pairing catches.",
    ],
    [
      "How is the maintainability index calculated?",
      "With the standard three-term formula MI = 171 − 5.2 × ln(Halstead volume) − 0.23 × total cyclomatic complexity − 16.2 × ln(lines of code), rescaled to 0-100. Higher is better. The three terms mean the index falls as a file grows, as its vocabulary of distinct operators and operands grows, and as its branching grows.",
    ],
    [
      "Is my code sent to a server?",
      "No. Tokenising, parsing, scoring and the suggestions all run as JavaScript in your own tab, and nothing is written to a network request. You can confirm it by opening the network panel and analysing a file — there are no outbound calls.",
    ],
  ],
};

export default seo;
