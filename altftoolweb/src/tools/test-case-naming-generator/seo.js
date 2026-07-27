const seo = {
  intro:
    "A test name should describe the behaviour under test well enough that a red build in CI needs no further investigation to understand. This generator takes the unit under test plus a given, a when and a then, and renders the name in whichever convention your team uses — given-when-then, should-style, plain assertion, or Roy Osherove's UnitOfWork_StateUnderTest_ExpectedBehavior — then emits a skeleton for Jest, Vitest, Mocha, pytest, JUnit 5, Go, RSpec or xUnit. Runner rules such as pytest's test_ prefix and Go's TestXxx signature are applied for you.",
  useCases: [
    "Agreeing one naming convention across a codebase where half the suite says shouldReturn and the other half testReturn",
    "Converting a QA team's given-when-then acceptance criteria straight into pytest function names",
    "Scaffolding a table of edge cases as named, deliberately failing stubs before starting the implementation",
  ],
  benefits: [
    ["Runner rules enforced", "pytest gets its test_ prefix and Go its TestXxx form automatically, so the suite actually collects."],
    ["Duplicate detection", "Two scenarios that collapse to the same identifier are flagged before they confuse a failing build."],
    ["Skeletons that fail first", "Every generated body throws, so a copied stub can never pass without an assertion."],
  ],
  faqs: [
    [
      "What is the best naming convention for unit tests?",
      "There is no single best one, but the convention has to be consistent across the repository, and the name must state the condition and the expected result rather than just the method name. Given-when-then reads best for behaviour and acceptance tests, should-style suits per-method unit tests, and UnitOfWork_StateUnderTest_ExpectedBehavior is the usual choice in Java and C# codebases where the name has to be a single identifier.",
    ],
    [
      "Why does pytest not run my test function?",
      "pytest only collects functions whose name matches its python_functions setting, which defaults to test*, inside files matching test_*.py or *_test.py. A function called check_expiry or verify_token is simply never collected, which looks like a passing suite. Renaming it to test_verify_token_rejects_expired is enough to fix it.",
    ],
    [
      "What are the rules for Go test function names?",
      "The function must be in a file ending in _test.go, be named TestXxx where the character after Test is not a lowercase letter, and take a single *testing.T parameter. A name like Testverify is ignored by go test because the lowercase v makes it fail the pattern, and no error is printed.",
    ],
    [
      "How long should a test name be?",
      "Long enough to name the condition and the result, and short enough to scan in a list of failures — roughly under a hundred characters. If a name needs more than that, the test is usually asserting several behaviours at once and should be split, which also makes the failure message point at one cause.",
    ],
  ],
};

export default seo;
