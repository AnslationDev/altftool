import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMetaDescription,
  TOOL_META_DESCRIPTION_BOUNDS,
} from "./toolMetaDescription.js";

test("expands a short catalogue summary into the rendered SEO budget", () => {
  const result = buildMetaDescription(
    "Bayesian Update Calculator",
    "Prior and evidence se posterior probability calculate kare.",
    "Calculators",
  );

  assert.match(result, /^Prior and evidence/);
  assert.match(result, /review the result in your browser\.$/);
  assert.ok(result.length >= TOOL_META_DESCRIPTION_BOUNDS.min);
  assert.ok(result.length <= TOOL_META_DESCRIPTION_BOUNDS.max);
});

test("keeps an informative catalogue summary without generic padding", () => {
  const description =
    "Compare two scenarios with clear inputs, calculated totals, and a result you can review before making a decision.";
  const result = buildMetaDescription(
    "Scenario Calculator With A Deliberately Long Name",
    description,
    "Calculators",
  );

  assert.equal(result, description);
});

test("adds the existing tool-specific suffix when the complete copy fits", () => {
  const result = buildMetaDescription(
    "JSON Viewer",
    "Inspect JSON values.",
    "Developer",
  );

  assert.match(result, /Use JSON Viewer online for Developer tasks/);
  assert.ok(result.length <= TOOL_META_DESCRIPTION_BOUNDS.max);
});

test("truncates long catalogue copy on a word boundary", () => {
  const result = buildMetaDescription(
    "Long Description Tool",
    "A deliberately detailed catalogue summary ".repeat(10),
    "Productivity",
  );

  assert.ok(result.length <= TOOL_META_DESCRIPTION_BOUNDS.max);
  assert.match(result, /…$/);
});
