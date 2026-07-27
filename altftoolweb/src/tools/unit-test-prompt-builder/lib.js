/**
 * Unit Test Prompt Builder.
 *
 * Builds a test-generation prompt around a language + framework pair, a
 * coverage target, and selected edge-case classes, and estimates the
 * baseline number of test cases: one happy path per public function plus
 * one test per selected edge-case class per function.
 */

/**
 * Frameworks by language. Idiom notes state each framework's own
 * documented conventions (file naming, assertion style).
 */
export const LANGUAGES = [
  {
    id: "javascript",
    label: "JavaScript / TypeScript",
    frameworks: [
      { id: "jest", label: "Jest", idiom: "*.test.ts files, describe/it blocks, expect() matchers, jest.fn() for mocks" },
      { id: "vitest", label: "Vitest", idiom: "*.test.ts files, describe/it blocks, expect() matchers, vi.fn() for mocks" },
      { id: "mocha", label: "Mocha + Chai", idiom: "describe/it blocks with chai expect or assert style" },
    ],
  },
  {
    id: "python",
    label: "Python",
    frameworks: [
      { id: "pytest", label: "pytest", idiom: "test_*.py files, plain assert statements, fixtures over setUp, pytest.raises for errors, @pytest.mark.parametrize for tables" },
      { id: "unittest", label: "unittest", idiom: "TestCase subclasses, self.assertEqual family, setUp/tearDown" },
    ],
  },
  {
    id: "java",
    label: "Java",
    frameworks: [
      { id: "junit5", label: "JUnit 5", idiom: "@Test methods, Assertions.assertEquals, assertThrows for errors, @ParameterizedTest for tables" },
    ],
  },
  {
    id: "csharp",
    label: "C#",
    frameworks: [
      { id: "xunit", label: "xUnit", idiom: "[Fact] and [Theory]/[InlineData], Assert.Equal, Assert.Throws" },
      { id: "nunit", label: "NUnit", idiom: "[Test] and [TestCase], Assert.That constraint model" },
    ],
  },
  {
    id: "go",
    label: "Go",
    frameworks: [
      { id: "gotesting", label: "testing (stdlib)", idiom: "_test.go files, TestXxx(t *testing.T), table-driven tests with t.Run subtests" },
    ],
  },
  {
    id: "ruby",
    label: "Ruby",
    frameworks: [
      { id: "rspec", label: "RSpec", idiom: "describe/context/it blocks, expect(...).to matchers, let over instance variables" },
    ],
  },
  {
    id: "php",
    label: "PHP",
    frameworks: [
      { id: "phpunit", label: "PHPUnit", idiom: "*Test.php classes, $this->assertSame, dataProvider methods for tables" },
    ],
  },
  {
    id: "rust",
    label: "Rust",
    frameworks: [
      { id: "rusttest", label: "built-in #[test]", idiom: "#[cfg(test)] mod tests, assert_eq!, #[should_panic(expected=...)] for panics" },
    ],
  },
];

/**
 * Edge-case classes — the classic equivalence classes from boundary-value
 * analysis and defect taxonomies (Myers, "The Art of Software Testing").
 */
export const EDGE_CASE_CLASSES = [
  { id: "empty", label: "Empty / null input", directive: "null, undefined/None, empty string, empty collection" },
  { id: "boundary", label: "Boundary values", directive: "minimum, maximum, zero, one-off-each-side of every documented limit" },
  { id: "invalid", label: "Invalid types & formats", directive: "wrong type, malformed string, out-of-range enum" },
  { id: "error", label: "Error paths", directive: "every dependency failure the unit is supposed to handle, asserted by error type and message" },
  { id: "large", label: "Large input", directive: "an input big enough to expose quadratic behaviour or overflow" },
  { id: "unicode", label: "Unicode & locale", directive: "non-ASCII text, emoji, RTL strings, locale-dependent parsing" },
  { id: "concurrency", label: "Async / ordering", directive: "out-of-order resolution, double invocation, cancelled promise/context" },
  { id: "idempotency", label: "Idempotency / repeat calls", directive: "calling twice must not double-apply the effect" },
];

/**
 * Coverage guidance: 100% line coverage proves execution, not correctness;
 * targets in the 70–90% range are the common industry norm (Google's
 * "Code Coverage Best Practices" post describes 60/75/90 as
 * low/acceptable/exemplary).
 */
export const COVERAGE_LEVELS = { low: 60, acceptable: 75, exemplary: 90 };

export const LIMITS = {
  functionCount: { min: 1, max: 50 },
  coverage: { min: 0, max: 100 },
};

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

export function getLanguage(languageId) {
  return LANGUAGES.find((language) => language.id === languageId) || null;
}

export function getFramework(languageId, frameworkId) {
  const language = getLanguage(languageId);
  if (!language) return null;
  return language.frameworks.find((framework) => framework.id === frameworkId) || null;
}

/**
 * Baseline test-count estimate: per public function, one happy-path test
 * plus one test per selected edge-case class.
 * @returns {{error:string}|{functions:number, perFunction:number, totalTests:number, coverage:number, coverageBand:string}}
 */
export function estimateTestPlan({ functionCount, edgeCaseIds, coverageTarget } = {}) {
  const functions = toInt(functionCount);
  const coverage = toInt(coverageTarget);
  if (Number.isNaN(functions)) return { error: "Enter how many public functions are under test." };
  if (functions < LIMITS.functionCount.min || functions > LIMITS.functionCount.max) {
    return { error: `Function count must be between ${LIMITS.functionCount.min} and ${LIMITS.functionCount.max} — split larger modules into multiple prompts.` };
  }
  if (Number.isNaN(coverage) || coverage < LIMITS.coverage.min || coverage > LIMITS.coverage.max) {
    return { error: "Coverage target must be between 0 and 100 percent." };
  }
  const ids = Array.isArray(edgeCaseIds) ? edgeCaseIds : [];
  const classes = EDGE_CASE_CLASSES.filter((edgeClass) => ids.includes(edgeClass.id));
  const perFunction = 1 + classes.length; // 1 happy path + one per edge-case class
  let coverageBand = "low";
  if (coverage >= COVERAGE_LEVELS.exemplary) coverageBand = "exemplary";
  else if (coverage >= COVERAGE_LEVELS.acceptable) coverageBand = "acceptable";
  else if (coverage >= COVERAGE_LEVELS.low) coverageBand = "moderate";
  return {
    functions,
    perFunction,
    totalTests: functions * perFunction,
    coverage,
    coverageBand,
    classes,
  };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the test-generation prompt.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildTestPrompt({ languageId, frameworkId, code, notes, plan } = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid test plan first." };
  const language = getLanguage(languageId);
  if (!language) return { error: "Choose a language." };
  const framework = getFramework(languageId, frameworkId);
  if (!framework) return { error: `Choose a test framework for ${language.label}.` };
  const codeText = typeof code === "string" ? code.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    `Write unit tests in ${language.label} using ${framework.label}. Tests only — do not modify the code under test.`,
    "",
    `FRAMEWORK CONVENTIONS: ${framework.idiom}.`,
    "",
    `SCOPE: about ${plan.functions} public function${plan.functions > 1 ? "s" : ""}. For each, write:`,
    "- 1 happy-path test asserting the documented behaviour on typical input.",
  ];
  for (const edgeClass of plan.classes) {
    lines.push(`- 1 ${edgeClass.label.toLowerCase()} test: ${edgeClass.directive}.`);
  }
  lines.push(
    `That is roughly ${plan.totalTests} tests (${plan.perFunction} per function); merge into parameterised/table-driven tests where the framework supports it.`,
    "",
    `COVERAGE TARGET: ${plan.coverage}% branch coverage.`,
    "After the tests, list any branch you could NOT cover from the public API and why — do not chase the number by asserting nothing.",
    "",
    "RULES:",
    "- Arrange–Act–Assert structure; one behaviour per test; the test name states the scenario and the expected outcome.",
    "- Assert on specific values and error types, never just 'does not throw' or 'is truthy'.",
    "- No test may depend on another test's state, wall-clock time, network, or execution order.",
    "- Mock only what crosses a process or network boundary; use real objects for everything else.",
    "- If the code's actual behaviour looks like a bug, write the test for the documented/intended behaviour and flag the discrepancy in a comment — do not enshrine the bug.",
  );
  if (extra) lines.push(`- ${extra}`);
  if (codeText) {
    lines.push("", "CODE UNDER TEST:", "```", codeText, "```");
  } else {
    lines.push("", "CODE UNDER TEST: (paste the module below this prompt)");
  }

  const text = lines.join("\n");
  return { text, plan, language, framework, ...measureText(text) };
}
