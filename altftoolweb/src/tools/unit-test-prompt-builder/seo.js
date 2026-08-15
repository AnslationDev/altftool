const seo = {
  title: "Unit Test Prompt Builder for Jest, pytest, JUnit",
  metaDescription:
    "Pick a framework, branch-coverage target and edge-case classes to get a test prompt that bans weak assertions and estimates the baseline test count.",
  steps: [
    "Choose a Language and Test framework — Vitest, pytest, JUnit 5, xUnit, RSpec, PHPUnit or Go's testing (stdlib) — then set Public functions under test (1-50) and a Branch coverage target (%).",
    "Tick the edge-case classes to cover: Empty / null input, Boundary values, Invalid types & formats, Error paths, Large input, Unicode & locale, Async / ordering and Idempotency / repeat calls.",
    "Read the Baseline test count — 1 happy path plus one test per class, per function — and the prompt's word and token count, then press Copy prompt to take the Generated prompt.",
  ],
  intro:
    "The Unit Test Prompt Builder generates a test-writing prompt tailored to your language, test framework, branch-coverage target and chosen edge-case classes — empty input, boundary values, error paths, unicode, async ordering and more, following classic boundary-value analysis. It estimates a baseline test count (one happy path plus one test per edge-case class per public function) and writes framework-specific conventions — pytest fixtures, Jest matchers, Go table-driven tests, JUnit 5 parameterised tests — directly into the prompt.",
  useCases: [
    "A TypeScript developer with three utility functions selects empty, boundary and error-path classes and gets a Vitest prompt demanding 12 concrete tests with real assertions.",
    "A Python team sets an 85% branch-coverage target and receives a pytest prompt that requires listing any branch unreachable from the public API instead of gaming the number.",
    "A Go engineer converts an untested parser into table-driven tests, with the prompt enforcing t.Run subtests and no dependence on execution order.",
  ],
  benefits: [
    [
      "Framework-native output",
      "The prompt embeds each framework's own conventions — test file naming, assertion style, parameterisation mechanism — so generated tests drop into your suite unchanged.",
    ],
    [
      "Edge cases by class, not vibes",
      "Eight selectable equivalence classes from boundary-value analysis turn 'add some edge cases' into a specific, checkable list.",
    ],
    [
      "Anti-bogus-test rules",
      "Generated tests must assert specific values and error types, never 'does not throw', and must flag suspected bugs rather than enshrine them.",
    ],
  ],
  faqs: [
    [
      "How many unit tests should each function have?",
      "A practical baseline is one happy-path test plus one test per relevant edge-case class — so a function checked for empty input, boundary values and error paths gets four tests. This tool multiplies that per-function figure by your function count; parameterised or table-driven tests can then merge similar cases without losing coverage.",
    ],
    [
      "What is a good code coverage target?",
      "Google's published code-coverage guidance describes 60% as low, 75% as acceptable and 90% as exemplary, measured meaningfully as branch coverage rather than line coverage. Chasing 100% usually produces assertion-free tests; this tool's prompt instead asks the model to list branches it could not cover from the public API and why.",
    ],
    [
      "How do I get AI to write good unit tests instead of trivial ones?",
      "Constrain the prompt: name the framework and its idioms, enumerate the edge-case classes to cover, require Arrange-Act-Assert structure with one behaviour per test, and ban weak assertions like 'is truthy'. This tool generates exactly those constraints, plus a rule that tests must not depend on time, network or execution order.",
    ],
    [
      "Should AI-generated tests mock everything?",
      "No. The generated prompt instructs the model to mock only what crosses a process or network boundary — databases, HTTP APIs, the filesystem — and to use real objects everywhere else, because over-mocked tests verify the mocks rather than the code.",
    ],
  ],
};

export default seo;
