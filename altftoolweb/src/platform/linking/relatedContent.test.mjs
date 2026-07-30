import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const relatedContentSource = readFileSync(
  new URL("./relatedContent.js", import.meta.url),
  "utf8",
);
const converterPageSource = readFileSync(
  new URL("../../app/transform/[slug]/page.jsx", import.meta.url),
  "utf8",
);
const examPhotoPageSource = readFileSync(
  new URL("../../app/exam-photo/[exam]/page.jsx", import.meta.url),
  "utf8",
);

test("converter pages retain their sibling-converter discovery preset", () => {
  assert.match(converterPageSource, /"converter"/);
  assert.match(relatedContentSource, /\bconverter:\s*\[/);
  assert.match(relatedContentSource, /sections:\s*\["transform"\]/);
});

test("exam photo pages retain their sibling-spec discovery preset", () => {
  assert.match(examPhotoPageSource, /"examSpec"/);
  assert.match(relatedContentSource, /\bexamSpec:\s*\[/);
  assert.match(relatedContentSource, /sections:\s*\["examPhoto"\]/);
});
