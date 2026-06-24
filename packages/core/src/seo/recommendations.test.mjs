// Node test runner: `node --test packages/core/src/seo/recommendations.test.mjs`
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildRecommendationPrompt,
  parseRecommendation,
  normalizeSuggestion,
  heuristicRecommendation,
} from "./recommendations.js";

test("parseRecommendation handles plain JSON", () => {
  const s = parseRecommendation('{"title":"T","description":"D","keywords":["a","b"]}');
  assert.deepEqual(s, { title: "T", description: "D", keywords: ["a", "b"] });
});

test("parseRecommendation strips code fences and surrounding prose", () => {
  const s = parseRecommendation('Here you go:\n```json\n{"title":"Hello","description":"World","keywords":["x"]}\n```\nThanks!');
  assert.equal(s.title, "Hello");
  assert.equal(s.description, "World");
  assert.deepEqual(s.keywords, ["x"]);
});

test("parseRecommendation returns null on junk", () => {
  assert.equal(parseRecommendation("no json here"), null);
  assert.equal(parseRecommendation(""), null);
  assert.equal(parseRecommendation("{broken"), null);
});

test("normalizeSuggestion clamps length and dedupes/cleans keywords", () => {
  const long = "x".repeat(120);
  const s = normalizeSuggestion({ title: long, description: long, keywords: ["A", "a", " b ", "", "c", "c", "d", "e", "f", "g", "h"] });
  assert.ok(s.title.length <= 60);
  assert.ok(s.description.length <= 155);
  assert.deepEqual(s.keywords, ["a", "b", "c", "d", "e", "f", "g", "h"]); // deduped + capped at 8
  assert.ok(s.keywords.length <= 8);
});

test("heuristicRecommendation derives sensible output without AI", () => {
  const s = heuristicRecommendation({
    path: "/tools/all/json-formatter",
    content: "JSON Formatter beautifies and validates JSON. It formats messy JSON instantly in your browser.",
  });
  assert.ok(s.title.length > 0 && s.title.length <= 60);
  assert.ok(s.description.length > 0 && s.description.length <= 155);
  assert.ok(s.keywords.includes("json"));
  assert.ok(s.keywords.length >= 1);
});

test("heuristicRecommendation falls back to path when no content/title", () => {
  const s = heuristicRecommendation({ path: "/policypages/privacy-policy" });
  assert.match(s.title, /Privacy Policy/i);
});

test("buildRecommendationPrompt includes constraints and content", () => {
  const p = buildRecommendationPrompt({ path: "/x", title: "Old", content: "<p>Hello <b>world</b></p>" });
  assert.match(p, /valid minified JSON/i);
  assert.match(p, /Hello world/); // html stripped
  assert.match(p, /<= 60 chars/);
});
