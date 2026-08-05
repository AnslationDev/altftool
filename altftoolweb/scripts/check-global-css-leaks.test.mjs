import assert from "node:assert/strict";
import test from "node:test";

import {
  collectOwnedTokens,
  findCssLeaks,
} from "./check-global-css-leaks.mjs";

const ownedTokens = collectOwnedTokens();

function leaks(source) {
  return findCssLeaks("src/app/example/route.css", source, ownedTokens);
}

test("finds app aliases and package primitives on document roots", () => {
  const cases = [
    ":root { --primary: red; }",
    ":root { --anslation-ds-primary: red; }",
    'html[data-theme="dark"] { --primary: red; }',
    "html.dark { --primary: red; }",
    '[data-theme="dark"] { --primary: red; }',
    ".dark { --primary: red; }",
    "body.preview { --primary: red; }",
  ];

  for (const source of cases) {
    assert.equal(leaks(source).length, 1, source);
  }
});

test("allows wrapper-scoped, conditional document, and private route tokens", () => {
  const cases = [
    ".route-root { --primary: red; }",
    "html:has(.route-root) { --primary: red; }",
    "body:has(.route-root) { --primary: red; }",
    ".unused :root { --primary: red; }",
    ":root { --route-private: red; }",
  ];

  for (const source of cases) {
    assert.deepEqual(leaks(source), [], source);
  }
});

test("finds root declarations inside layers and after comments", () => {
  const source = `
    /* route tokens */
    @layer base {
      html[data-theme="light"] { --anslation-ds-primary: red; }
    }
  `;

  assert.equal(leaks(source).length, 1);
});

test("keeps print-only overrides outside the navigation leak check", () => {
  const source = `
    @media print {
      :root { --primary: black; }
    }
  `;

  assert.deepEqual(leaks(source), []);
});

test("finds body colour but ignores non-colour document layout", () => {
  assert.equal(leaks("body.app { background: red; }").length, 1);
  assert.equal(leaks("html[data-theme='dark'] body { color: white; }").length, 1);
  assert.equal(leaks("body::before { background: red; }").length, 1);
  assert.deepEqual(leaks("body { margin: 0; font-family: sans-serif; }"), []);
  assert.deepEqual(leaks("body:has(.route-root) { background: red; }"), []);
  assert.deepEqual(leaks("body:has(.route-root)::before { background: red; }"), []);
});
