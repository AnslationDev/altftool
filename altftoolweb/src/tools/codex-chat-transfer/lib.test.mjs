import assert from "node:assert/strict";
import test from "node:test";

import { parseChatInput, parseMarkdownTranscript } from "./lib.js";

test("Markdown headings do not create an empty first message or leak closing asterisks", () => {
  assert.deepEqual(
    parseMarkdownTranscript("**User:** Hello\n**Assistant:** Hi\n**Bot**: Welcome"),
    [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi" },
      { role: "assistant", content: "Welcome" },
    ],
  );
});

test("heading-only lines collect following content and normalize system headings", () => {
  assert.deepEqual(parseMarkdownTranscript("# System\nBe concise.\n**User**:\nHello"), [
    { role: "system", content: "Be concise." },
    { role: "user", content: "Hello" },
  ]);
});

test("unheaded plain text is one user turn while malformed JSON fails", () => {
  assert.deepEqual(parseChatInput("ordinary plain text"), [
    { role: "user", content: "ordinary plain text" },
  ]);
  assert.throws(() => parseChatInput('[{"role":"user"}'), /JSON/i);
});

test("message arrays and nested system fields retain supported roles", () => {
  assert.deepEqual(
    parseChatInput('{"system":"Rules","messages":[{"role":"bot","content":"Hi"}]}'),
    [
      { role: "system", content: "Rules" },
      { role: "assistant", content: "Hi" },
    ],
  );
});
