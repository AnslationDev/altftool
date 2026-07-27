/**
 * Test case naming generator.
 *
 * A test name has one job: when it fails in CI, the name alone should say what
 * broke without anyone opening the file. Three naming conventions are in wide
 * use and each encodes the same three facts in a different order:
 *
 *   given-when-then   BDD / Gherkin phrasing, e.g. "given an expired token,
 *                     when the API is called, then it responds 401"
 *   should            xUnit-style sentence, e.g. "should respond 401 when the
 *                     token is expired"
 *   unit_state_result Roy Osherove's UnitOfWork_StateUnderTest_Expected
 *                     convention, e.g. verifyToken_expired_returns401
 *
 * On top of the phrasing sit hard rules from the test runners themselves,
 * which this module enforces rather than assumes:
 *
 *   pytest  collects functions whose name matches python_functions, which
 *           defaults to "test*", from files matching "test_*.py" or "*_test.py".
 *   Go      runs functions of the form func TestXxx(t *testing.T); the rune
 *           after "Test" must not be a lowercase letter, and the file must end
 *           in _test.go.
 *   JUnit / xUnit method names are Java or C# identifiers, so no spaces and no
 *           leading digit; the human sentence goes in @DisplayName instead.
 *
 * Everything here is a pure string transform: same inputs, same output.
 */

/** Runner-imposed rules, not style preferences. */
export const PYTEST_FUNCTION_PREFIX = "test_";
export const GO_TEST_PREFIX = "Test";
/** Beyond this, a name stops being scannable in a CI failure list. */
export const READABLE_NAME_LIMIT = 100;

export const CASINGS = [
  { id: "sentence", label: "sentence case" },
  { id: "camel", label: "camelCase" },
  { id: "pascal", label: "PascalCase" },
  { id: "snake", label: "snake_case" },
  { id: "kebab", label: "kebab-case" },
];

export const CONVENTIONS = [
  {
    id: "given-when-then",
    label: "Given / When / Then",
    example: "given an expired token, when the API is called, then it responds 401",
  },
  {
    id: "should",
    label: "should … when …",
    example: "should respond 401 when the token is expired",
  },
  {
    id: "expect-when",
    label: "Plain assertion",
    example: "responds 401 when the token is expired",
  },
  {
    id: "unit-state-result",
    label: "unit_state_expected (Osherove)",
    example: "verifyToken_expiredToken_responds401",
  },
];

export const FRAMEWORKS = [
  { id: "jest", label: "Jest", language: "JavaScript", identifierNames: false },
  { id: "vitest", label: "Vitest", language: "TypeScript", identifierNames: false },
  { id: "mocha", label: "Mocha + Chai", language: "JavaScript", identifierNames: false },
  { id: "pytest", label: "pytest", language: "Python", identifierNames: true },
  { id: "junit5", label: "JUnit 5", language: "Java", identifierNames: true },
  { id: "go", label: "Go testing", language: "Go", identifierNames: true },
  { id: "rspec", label: "RSpec", language: "Ruby", identifierNames: false },
  { id: "xunit", label: "xUnit.net", language: "C#", identifierNames: true },
];

/** Split any phrase into lower-case words, honouring camelCase boundaries. */
export function toWords(text) {
  return String(text ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

const upperFirst = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/** Render a word list in one of the supported casings. */
export function toCasing(words, casing) {
  const list = Array.isArray(words) ? words.filter(Boolean) : [];
  if (list.length === 0) return "";
  switch (casing) {
    case "camel":
      return list.map((word, index) => (index === 0 ? word : upperFirst(word))).join("");
    case "pascal":
      return list.map(upperFirst).join("");
    case "snake":
      return list.join("_");
    case "kebab":
      return list.join("-");
    case "sentence":
    default:
      return upperFirst(list.join(" "));
  }
}

const clean = (text) => String(text ?? "").trim().replace(/\s+/g, " ").replace(/[.;]+$/, "");

/**
 * Compose the human-readable sentence for one scenario.
 * `given` is optional; the other two are the minimum a name needs.
 */
export function buildSentence({ unit, given, when, then, convention }) {
  const g = clean(given);
  const w = clean(when);
  const t = clean(then);
  const u = clean(unit);

  switch (convention) {
    case "given-when-then":
      return g ? `given ${g}, when ${w}, then ${t}` : `when ${w}, then ${t}`;
    case "should":
      return g ? `should ${t} when ${w}, given ${g}` : `should ${t} when ${w}`;
    case "expect-when":
      return g ? `${t} when ${w} and ${g}` : `${t} when ${w}`;
    case "unit-state-result": {
      const parts = [u || w, g || w, t].map((part) => toCasing(toWords(part), "camel"));
      return parts.filter(Boolean).join("_");
    }
    default:
      return `${t} when ${w}`;
  }
}

/**
 * Turn a sentence into a legal identifier for a framework that needs one, and
 * report anything the runner would reject.
 */
export function toIdentifier(sentence, { framework, casing }) {
  const words = toWords(sentence);
  const warnings = [];
  if (words.length === 0) return { identifier: "", warnings: ["Nothing left after removing punctuation."] };

  let identifier;
  switch (framework) {
    case "pytest": {
      identifier = PYTEST_FUNCTION_PREFIX + toCasing(words, "snake");
      break;
    }
    case "go": {
      identifier = GO_TEST_PREFIX + toCasing(words, "pascal");
      break;
    }
    case "junit5":
      identifier = toCasing(words, "camel");
      break;
    case "xunit":
      identifier = toCasing(words, "pascal");
      break;
    default:
      identifier = toCasing(words, casing === "sentence" ? "camel" : casing);
  }

  if (/^[0-9]/.test(identifier)) {
    identifier = `_${identifier}`;
    warnings.push("Started with a digit, so an underscore was added — identifiers cannot begin with a number.");
  }
  if (framework === "go" && !/^Test[^a-z]/.test(identifier)) {
    warnings.push("Go only runs functions matching TestXxx where the character after Test is not lower case.");
  }
  if (identifier.length > READABLE_NAME_LIMIT) {
    warnings.push(`${identifier.length} characters is hard to read in a CI failure list — trim the scenario.`);
  }
  return { identifier, warnings };
}

const indent = (text, spaces) =>
  text
    .split("\n")
    .map((line) => (line ? " ".repeat(spaces) + line : line))
    .join("\n");

function suiteFileName(unit, framework) {
  const words = toWords(unit);
  const kebab = toCasing(words, "kebab") || "subject";
  const snake = toCasing(words, "snake") || "subject";
  const pascal = toCasing(words, "pascal") || "Subject";
  switch (framework) {
    case "pytest":
      return `test_${snake}.py`;
    case "go":
      return `${snake}_test.go`;
    case "junit5":
      return `${pascal}Test.java`;
    case "xunit":
      return `${pascal}Tests.cs`;
    case "rspec":
      return `${snake}_spec.rb`;
    case "vitest":
      return `${kebab}.test.ts`;
    default:
      return `${kebab}.test.js`;
  }
}

function renderSnippet({ unit, framework, cases }) {
  const pascal = toCasing(toWords(unit), "pascal") || "Subject";
  const label = clean(unit) || "Subject";

  switch (framework) {
    case "pytest":
      return [
        `class Test${pascal}:`,
        ...cases.map((item) =>
          indent(
            [`def ${item.identifier}(self):`, indent('"""' + item.humanSentence + '"""', 4), indent("assert False, \"not implemented\"", 4)].join("\n"),
            4,
          ),
        ),
      ].join("\n\n");

    case "go":
      return cases
        .map((item) =>
          [
            `// ${item.humanSentence}`,
            `func ${item.identifier}(t *testing.T) {`,
            `\tt.Fatal("not implemented")`,
            `}`,
          ].join("\n"),
        )
        .join("\n\n");

    case "junit5":
      return [
        `class ${pascal}Test {`,
        ...cases.map((item) =>
          indent(
            ["@Test", `@DisplayName("${item.sentence.replace(/"/g, '\\"')}")`, `void ${item.identifier}() {`, "    fail(\"not implemented\");", "}"].join("\n"),
            4,
          ),
        ),
        "}",
      ].join("\n\n");

    case "xunit":
      return [
        `public class ${pascal}Tests`,
        "{",
        ...cases.map((item) =>
          indent(["[Fact]", `// ${item.humanSentence}`, `public void ${item.identifier}()`, "{", "    Assert.Fail(\"not implemented\");", "}"].join("\n"), 4),
        ),
        "}",
      ].join("\n\n");

    case "rspec":
      return [
        `RSpec.describe ${pascal} do`,
        ...cases.map((item) =>
          indent([`it "${item.sentence.replace(/"/g, '\\"')}" do`, "  raise NotImplementedError", "end"].join("\n"), 2),
        ),
        "end",
      ].join("\n\n");

    case "mocha":
      return [
        `describe("${label}", function () {`,
        ...cases.map((item) =>
          indent([`it("${item.sentence.replace(/"/g, '\\"')}", function () {`, "  throw new Error(\"not implemented\");", "});"].join("\n"), 2),
        ),
        "});",
      ].join("\n\n");

    case "vitest":
      return [
        'import { describe, expect, it } from "vitest";',
        "",
        `describe("${label}", () => {`,
        ...cases.map((item) =>
          indent(
            [`it("${item.sentence.replace(/"/g, '\\"')}", () => {`, "  expect.fail(\"not implemented\");", "});"].join("\n"),
            2,
          ),
        ),
        "});",
      ].join("\n");

    default:
      return [
        `describe("${label}", () => {`,
        ...cases.map((item) =>
          indent(
            [`it("${item.sentence.replace(/"/g, '\\"')}", () => {`, "  throw new Error(\"not implemented\");", "});"].join("\n"),
            2,
          ),
        ),
        "});",
      ].join("\n\n");
  }
}

/**
 * Main entry point.
 *
 * @param {object} input
 * @param {string} input.unit        what is under test, e.g. "verifyToken"
 * @param {Array<{given?:string, when:string, then:string}>} input.scenarios
 * @param {string} input.convention  a CONVENTIONS id
 * @param {string} input.casing      a CASINGS id (ignored where the language dictates one)
 * @param {string} input.framework   a FRAMEWORKS id
 */
export function generateTestNames({
  unit = "",
  scenarios = [],
  convention = "should",
  casing = "sentence",
  framework = "jest",
} = {}) {
  if (!CONVENTIONS.some((item) => item.id === convention)) {
    return { error: "Pick one of the listed naming conventions." };
  }
  if (!CASINGS.some((item) => item.id === casing)) {
    return { error: "Pick one of the listed casings." };
  }
  const frameworkMeta = FRAMEWORKS.find((item) => item.id === framework);
  if (!frameworkMeta) return { error: "Pick a test framework from the list." };

  const unitClean = clean(unit);
  if (!unitClean) {
    return { error: "Name what is under test — a function, class or feature — so the suite has a subject." };
  }

  const usable = (Array.isArray(scenarios) ? scenarios : []).filter(
    (row) => clean(row && row.when) && clean(row && row.then),
  );
  if (usable.length === 0) {
    return { error: "Every test needs at least a trigger and an expected outcome. Fill in one when and one then." };
  }

  const cases = usable.map((row) => {
    const sentence = buildSentence({ unit: unitClean, ...row, convention });
    const { identifier, warnings } = toIdentifier(sentence, { framework, casing });
    const displayName = convention === "unit-state-result" ? identifier : sentence;
    // Always keep a plain-English phrasing for docstrings and comments, even
    // when the chosen convention renders the visible name as an identifier.
    const humanSentence = buildSentence({ unit: unitClean, ...row, convention: "given-when-then" });
    return {
      sentence: displayName,
      humanSentence,
      identifier,
      warnings,
      given: clean(row.given),
      when: clean(row.when),
      then: clean(row.then),
    };
  });

  const seen = new Map();
  for (const item of cases) {
    const count = (seen.get(item.identifier) || 0) + 1;
    seen.set(item.identifier, count);
    if (count > 1) {
      item.warnings = [
        ...item.warnings,
        "Duplicate name — two scenarios produce the same identifier, so one failure will be ambiguous.",
      ];
    }
  }

  return {
    unit: unitClean,
    framework: frameworkMeta,
    fileName: suiteFileName(unitClean, framework),
    cases,
    snippet: renderSnippet({ unit: unitClean, framework, cases }),
    warnings: cases.flatMap((item) => item.warnings),
  };
}
