import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import codeComplexitySeo from "../../tools/code-complexity-analyzer/seo.js";
import codexChatSeo from "../../tools/codex-chat-transfer/seo.js";
import circledTextSeo from "../../tools/circled-text-generator/seo.js";
import { toolContentOverrides } from "./toolContentOverrides.js";

const allText = (value) => JSON.stringify(value);

test("Candy Match 3 content uses the canonical slug", () => {
  assert.equal(toolContentOverrides["candy-crush"], undefined);
  assert.ok(toolContentOverrides["candy-match-3"]);
  assert.match(allText(toolContentOverrides["candy-match-3"].steps), /replacement board stays/i);
});

test("Cell Explorer describes outline geometry and selection behavior truthfully", () => {
  const text = allText(toolContentOverrides["cell-explorer"]);
  assert.match(text, /rounded rectangular Cell Wall/);
  assert.match(text, /does not add a selection effect to the outline/);
  assert.doesNotMatch(text, /search bar feature|square Cell Wall|selected one picks up a white ring/i);
});

test("Circled Text copy identifies the style without a digit mapping", () => {
  const text = `${allText(toolContentOverrides["circled-text-generator"])} ${allText(circledTextSeo)}`;
  assert.match(text, /Filled Square.+Negative Squared/);
  assert.match(text, /Parenthesized.+1-9/);
  assert.match(text, /Filled Square leaves digits unchanged/);
  assert.doesNotMatch(text, /Double\s+Circled/);
  assert.doesNotMatch(text, /letters and numbers.+across four styles/i);
});

test("Citation actions distinguish print, PDF saving and the HTML-based Word file", async () => {
  const override = allText(toolContentOverrides["citation-generator"]);
  const preview = await readFile(
    new URL("../../tools/citation-generator/components/CitationPreview.jsx", import.meta.url),
    "utf8",
  );
  assert.match(override, /Print \/ Save PDF/);
  assert.match(override, /Word-openable \.doc|Word \.doc/);
  assert.doesNotMatch(override, /TXT, PDF and DOCX|TXT, PDF or DOCX/);
  assert.match(preview, /Print \/ Save PDF/);
  assert.match(preview, /Word \.doc/);
  assert.doesNotMatch(preview, /> PDF\s*</);
  assert.doesNotMatch(preview, /> DOCX\s*</);
});

test("complexity copy does not promise a paint between synchronous state updates", () => {
  const text = `${allText(toolContentOverrides["code-complexity-analyzer"])} ${allText(codeComplexitySeo)}`;
  assert.match(text, /synchronous/);
  assert.doesNotMatch(text, /Analyzing badge|flashing an Analyzing/i);
});

test("chat-transfer copy distinguishes malformed JSON from accepted plain text", () => {
  const text = `${allText(toolContentOverrides["codex-chat-transfer"])} ${allText(codexChatSeo)}`;
  assert.match(text, /unheaded plain text/i);
  assert.match(text, /malformed JSON/i);
});
