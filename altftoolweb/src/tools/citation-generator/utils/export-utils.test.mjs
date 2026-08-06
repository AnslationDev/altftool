import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  escapeHtml,
  populateCitationPrintDocument,
  printCitation,
} from "./export-utils.js";

function fakePrintWindow() {
  const state = { child: null, focused: false, printed: false };
  const document = {
    title: "",
    createElement(tagName) {
      return { tagName, textContent: "" };
    },
    body: {
      replaceChildren(child) {
        state.child = child;
      },
    },
  };
  return {
    state,
    window: {
      document,
      opener: { unsafe: true },
      focus() {
        state.focused = true;
      },
      print() {
        state.printed = true;
      },
    },
  };
}

test("print document uses DOM text fields for user-controlled citation content", () => {
  const target = fakePrintWindow();
  const payload = '<img src=x onerror="globalThis.compromised=true">';

  assert.equal(populateCitationPrintDocument(target.window, payload, "<script>x</script>"), true);
  assert.equal(target.window.document.title, "<script>x</script>");
  assert.equal(target.state.child.tagName, "pre");
  assert.equal(target.state.child.textContent, payload);
});

test("printCitation fails safely when blocked and severs opener when available", () => {
  const originalWindow = globalThis.window;
  const target = fakePrintWindow();
  try {
    globalThis.window = { open: () => target.window };
    assert.equal(printCitation("safe text", "citation"), true);
    assert.equal(target.window.opener, null);
    assert.equal(target.state.focused, true);
    assert.equal(target.state.printed, true);

    globalThis.window = { open: () => null };
    assert.equal(printCitation("safe text", "citation"), false);
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

test("HTML-based Word export escapes markup and print source avoids stream writes", async () => {
  assert.equal(escapeHtml('<script data-x="1">&</script>'), "&lt;script data-x=&quot;1&quot;&gt;&amp;&lt;/script&gt;");
  const source = await readFile(new URL("./export-utils.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, new RegExp(`document${"\\."}write\\s*\\(`));
});
