import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFocusOrderReport,
  replayFocusOrder,
} from "./replayFocusOrder.mjs";

test("estimates native sequential controls in DOM order", () => {
  const result = replayFocusOrder(`
    <a href="/">Home</a>
    <button>Save</button>
    <input aria-label="Email">
    <a>Not focusable without href</a>
  `);
  assert.deepEqual(result.order.map((item) => [item.tag, item.name]), [
    ["a", "Home"],
    ["button", "Save"],
    ["input", "Email"],
  ]);
});

test("places positive tabindex values first in ascending order", () => {
  const result = replayFocusOrder(`
    <button id="zero">Zero</button>
    <button id="three" tabindex="3">Three</button>
    <button id="one" tabindex="1">One</button>
  `);
  assert.deepEqual(result.order.map((item) => item.id), ["one", "three", "zero"]);
  assert.equal(result.counts.positiveTabIndex, 2);
});

test("excludes negative tabindex, disabled, hidden, and inert controls", () => {
  const result = replayFocusOrder(`
    <button tabindex="-1">Programmatic only</button>
    <button disabled>Disabled</button>
    <div hidden><button>Hidden</button></div>
    <div inert><a href="/">Inert</a></div>
    <button>Visible</button>
  `);
  assert.deepEqual(result.order.map((item) => item.name), ["Visible"]);
});

test("reports focusable elements inside aria-hidden content", () => {
  const result = replayFocusOrder(
    '<div aria-hidden="true"><button>Hidden from accessibility tree</button></div>',
  );
  assert.equal(result.order.length, 1);
  assert.equal(
    result.order[0].cueIds.includes("focusable-in-aria-hidden"),
    true,
  );
});

test("supports explicit tabindex and contenteditable while roles alone do not add focus", () => {
  const result = replayFocusOrder(`
    <div role="button">Role only</div>
    <div role="button" tabindex="0">Explicit</div>
    <div contenteditable>Editor</div>
  `);
  assert.deepEqual(result.order.map((item) => item.name), ["Explicit", "Editor"]);
});

test("resolves explicit and wrapping native labels for form controls", () => {
  const result = replayFocusOrder(`
    <label for="email">Work email</label><input id="email">
    <label>Phone <input type="tel"></label>
  `);
  assert.deepEqual(result.order.map((item) => [item.name, item.nameSource]), [
    ["Work email", "label"],
    ["Phone", "label"],
  ]);
});

test("does not treat disabled on an unsupported ancestor as disabling descendants", () => {
  const result = replayFocusOrder(`
    <div disabled><button>Still focusable</button></div>
    <fieldset disabled><button>Disabled by fieldset</button></fieldset>
  `);
  assert.deepEqual(result.order.map((item) => item.name), ["Still focusable"]);
});

test("reports nested sequential tab stops and invalid tabindex", () => {
  const result = replayFocusOrder(`
    <a href="/">Outer <button>Inner</button></a>
    <div tabindex="banana">Invalid</div>
  `);
  assert.equal(result.cueCounts["nested-tab-stop"], 1);
  assert.equal(result.cueCounts["invalid-tabindex"], 1);
});

test("builds the reverse sequence without mutating forward order", () => {
  const result = replayFocusOrder("<button>One</button><button>Two</button>");
  assert.deepEqual(result.order.map((item) => item.name), ["One", "Two"]);
  assert.deepEqual(result.reverseOrder.map((item) => item.name), ["Two", "One"]);
});

test("counts-only report excludes names, IDs, and source text", () => {
  const result = replayFocusOrder(
    '<button id="PRIVATE-ID">PRIVATE BUTTON NAME</button>',
  );
  const report = buildFocusOrderReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes("PRIVATE-ID"), false);
  assert.equal(serialized.includes("PRIVATE BUTTON NAME"), false);
  assert.equal(report.scope.renderedFocusTested, false);
  assert.equal(report.scope.conformanceEstablished, false);
});
