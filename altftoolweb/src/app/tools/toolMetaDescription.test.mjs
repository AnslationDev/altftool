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

test("adds a category-aware suffix when the complete copy fits", () => {
  const result = buildMetaDescription(
    "JSON Viewer",
    "Inspect JSON values.",
    "Developer",
  );

  assert.match(result, /Try JSON Viewer, a free online developer tool/);
  assert.ok(result.length >= TOOL_META_DESCRIPTION_BOUNDS.min);
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

test("each category gets a distinct suffix tail with 'free online' phrasing", () => {
  const categories = [
    "Calculators",
    "Finance Calculators",
    "Health Calculators",
    "Converters",
    "Generators",
    "Developer",
    "Productivity",
    "Education & Science",
    "Security & Privacy",
    "Health & Fitness",
    "Business",
    "Lifestyle",
    "Design & Color",
    "Text & Writing",
    "Marketing & Social",
    "Fun",
    "Image & Photo",
    "Games",
    "AI Tools",
    "Video & Audio",
    "PDF & Documents",
  ];
  const tails = new Set();
  for (const category of categories) {
    const result = buildMetaDescription("Widget", "Do a task.", category);
    assert.match(result, /free online/, `${category}: missing "free online"`);
    assert.match(result, /Try Widget,/, `${category}: missing tool name`);
    assert.ok(
      result.length >= TOOL_META_DESCRIPTION_BOUNDS.min &&
        result.length <= TOOL_META_DESCRIPTION_BOUNDS.max,
      `${category}: out of bounds (${result.length})`,
    );
    // Tail = everything after the em dash; must be unique per category so
    // thousands of URLs stop sharing one identical closing sentence.
    tails.add(result.slice(result.lastIndexOf("—")));
  }
  assert.equal(tails.size, categories.length);
});

test("empty-description fallback makes no local-only processing claim", () => {
  const result = buildMetaDescription("Mystery Widget", "", "Calculators");

  assert.ok(result.length >= TOOL_META_DESCRIPTION_BOUNDS.min);
  assert.ok(result.length <= TOOL_META_DESCRIPTION_BOUNDS.max);
  assert.doesNotMatch(result, /runs entirely in your browser/i);
  assert.doesNotMatch(result, /never uploaded/i);
  assert.doesNotMatch(result, /100% private/i);
  assert.match(result, /free online tool/);
});

test("a name ending in the category noun never doubles the noun", () => {
  const result = buildMetaDescription(
    "GST Calculator",
    "Compute GST amounts.",
    "Calculators",
  );

  assert.doesNotMatch(result, /calculator calculator/i);
  assert.match(result, /Try GST Calculator, a free online calculator/);
});

test("unknown categories fall back to a neutral tool suffix", () => {
  const result = buildMetaDescription(
    "Odd One Out",
    "Spot the difference.",
    "Something Uncharted",
  );

  assert.match(result, /Try Odd One Out, a free online tool/);
  assert.ok(result.length <= TOOL_META_DESCRIPTION_BOUNDS.max);
});
