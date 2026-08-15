const seo = {
  title: "Refactor Prompt Builder: Fowler Names +",
  metaDescription:
    "Names the Fowler refactorings to apply and writes hard constraints — identical outputs, frozen API, untouched tests — plus a complexity target.",
  steps: [
    "Set Language, summarise the code in What this code is, and optionally paste it into Paste the code.",
    "Tick Refactoring goals such as Break up a long function and Reduce nesting — these become the Fowler directives Extract Function and Replace Nested Conditional with Guard Clauses — plus Hard constraints like Public API frozen, then set Current cyclomatic complexity and Target complexity.",
    "Generated prompt appears with its goal count, constraint count and word and token estimate; press Copy prompt and paste it into your model.",
  ],
  intro:
    "The Refactor Prompt Builder writes an AI refactoring prompt that names the exact refactorings to apply — Extract Function, Replace Nested Conditional with Guard Clauses, Replace Magic Literal and others from Fowler's catalogue — alongside hard constraints that keep observable behaviour, public APIs and existing tests unchanged. It also accepts a cyclomatic-complexity goal checked against McCabe's recommended per-function limit of 10, so 'clean this up' becomes a bounded, verifiable task instead of an invitation to rewrite.",
  useCases: [
    "A developer facing a 300-line pricing function selects Extract Function and Reduce Nesting, freezes the public API, and gets a prompt that forbids touching the test suite.",
    "A team modernising legacy JavaScript to current syntax constrains the prompt to zero new dependencies and identical error messages, then reviews the model's step-by-step justification.",
    "An engineer with a complexity-25 function sets a target of 8 and receives a prompt that demands each step name the Fowler refactoring it applies.",
  ],
  benefits: [
    [
      "Named refactorings, not vibes",
      "Each goal maps to a catalogued refactoring with its standard name, so the model applies a known-safe transformation instead of improvising.",
    ],
    [
      "Behaviour-preservation contract",
      "Selectable hard constraints — identical outputs and error types, frozen API, untouched tests, no new dependencies — are written into the prompt as failure conditions.",
    ],
    [
      "Bug-freezing rule",
      "The prompt orders the model to flag suspected bugs and leave them in place, because silently 'fixing' behaviour during a refactor is how regressions ship.",
    ],
  ],
  faqs: [
    [
      "What is the difference between refactoring and rewriting code?",
      "Refactoring changes a program's internal structure without changing its observable behaviour — same outputs, side effects and error behaviour for every input — while a rewrite may change behaviour. The generated prompt states this definition up front and instructs the model to skip any change it cannot prove behaviour-safe.",
    ],
    [
      "What is a good cyclomatic complexity target?",
      "10 per function is the classic upper limit proposed in McCabe's 1976 paper that introduced the metric, and it remains the default threshold in linters like ESLint, pylint and SonarQube. This tool lets you set any lower target and notes in the prompt when your target still sits above 10.",
    ],
    [
      "How do I stop an AI from changing behaviour when refactoring?",
      "Constrain it explicitly: require identical outputs and error types for all inputs including invalid ones, freeze the public API, forbid edits to tests, and require the model to justify why each step cannot change behaviour. This tool writes all of those as hard failure conditions — and your test suite remains the final check.",
    ],
    [
      "Should a refactor fix bugs it finds?",
      "No — a refactor should preserve behaviour, bugs included, because mixing fixes into structural changes makes both impossible to review and revert independently. The generated prompt tells the model to flag suspected bugs in a comment and leave the behaviour intact for a separate change.",
    ],
  ],
};

export default seo;
